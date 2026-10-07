/* Sync — your progress and your own code, on every device — plus Claude's reviews of your code.

   Local first: everything is kept on this device (localStorage), so nothing is lost offline.
   When sync is set up (More → Sync), a private GitHub repo acts as the database:
     progress.json written here     statuses, review cards, streak days, quiz scores, mocks, settings
     code.json     written here     { "<n>": { lang, code, rev, at } }
     reviews.json  written by the /review-my-code Claude Code skill
                   { "<n>": { rev, lang, code: { cpp, java, js }, tests, approach, same, compare, notes, at } }
   Progress is merged three ways against the last synced copy, so two devices never overwrite each
   other: per-problem entries take whichever side changed, counters add up both sides' changes,
   and lists keep both sides' new entries.
   The token never leaves this device and is never included in backups.

   Exposes window.MyCode = { get, set, all, importAll, review, config, setConfig, configured, sync, state,
   progress, touch } and fires a "mycode-change" event on document whenever entries, reviews or sync state change. */
(function () {
  'use strict';

  const CODE_KEY = 'dsa-revise:mycode';
  const REVIEW_KEY = 'dsa-revise:reviews';
  const SYNC_KEY = 'dsa-revise:sync';
  const BASE_KEY = 'dsa-revise:sync-base'; // progress as of the last successful sync
  const DEFAULT_REPO = 'ice-009/dsa-revise-data';
  const API = 'https://api.github.com';
  const PUSH_DELAY = 3000; // push this long after the last change

  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  let entries = read(CODE_KEY, {}); // n -> { lang, code, rev, at, dirty }
  let reviews = read(REVIEW_KEY, {}); // n -> review (cached copy of reviews.json)
  let cfg = read(SYNC_KEY, {}); // { token, repo, last }
  const state = { busy: false, error: '', last: cfg.last || 0 };

  const changed = () => document.dispatchEvent(new CustomEvent('mycode-change'));

  // FNV-1a: a short fingerprint of the code, so a review can say which version it was for
  const revOf = code => {
    let h = 0x811c9dc5;
    for (let i = 0; i < code.length; i++) {
      h ^= code.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  };

  function get(n) {
    const e = entries[n];
    return e && e.code ? e : null;
  }

  function set(n, lang, code) {
    code = code.replace(/\r\n?/g, '\n');
    const prev = entries[n];
    if (prev && prev.code === code && prev.lang === lang) return;
    entries[n] = { lang, code, rev: revOf(code), at: Date.now(), dirty: true };
    if (!write(CODE_KEY, entries) && window.appToast) window.appToast('Could not save — storage is full or blocked');
    schedulePush();
    changed();
  }

  // a review only counts for the exact code it looked at
  function review(n) {
    const r = reviews[n];
    if (!r) return null;
    const e = get(n);
    return { ...r, stale: !e || e.rev !== r.rev };
  }

  const all = () => Object.fromEntries(Object.entries(entries).map(([n, e]) => [n, { lang: e.lang, code: e.code, rev: e.rev, at: e.at }]));

  // from a backup file: newer entries win
  function importAll(data) {
    if (!data || typeof data !== 'object') return 0;
    let k = 0;
    for (const [n, e] of Object.entries(data)) {
      if (!e || typeof e.code !== 'string') continue;
      if (!entries[n] || (e.at || 0) > (entries[n].at || 0)) {
        entries[n] = { lang: e.lang || 'cpp', code: e.code, rev: revOf(e.code), at: e.at || Date.now(), dirty: true };
        k++;
      }
    }
    write(CODE_KEY, entries);
    if (k) schedulePush();
    changed();
    return k;
  }

  /* ---------- sync config ---------- */

  const configured = () => !!(cfg.token && cfg.repo);
  const config = () => ({ repo: cfg.repo || DEFAULT_REPO, hasToken: !!cfg.token, last: state.last });
  function setConfig({ token, repo }) {
    cfg = { ...cfg, repo: (repo || DEFAULT_REPO).trim() };
    if (token !== undefined) cfg.token = token.trim();
    if (!cfg.token) delete cfg.token;
    write(SYNC_KEY, cfg);
    state.error = '';
    changed();
  }

  /* ---------- GitHub contents API ---------- */

  const b64enc = s => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const b64dec = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), c => c.charCodeAt(0)));

  async function gh(path, opts = {}, accept = 'application/vnd.github+json') {
    const url = `${API}/repos/${cfg.repo}/contents/${path}${opts.method ? '' : `?t=${Date.now()}`}`;
    const res = await fetch(url, {
      ...opts,
      cache: 'no-store',
      headers: { Accept: accept, Authorization: `Bearer ${cfg.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    if (res.status === 401) throw new Error('GitHub rejected the token — paste a fresh one in More.');
    if (res.status === 403) throw new Error('The token can’t write to this repo — give it Contents: read & write.');
    if (res.status === 404 && !opts.method) return null;
    if (res.status === 404) throw new Error(`Repo ${cfg.repo} not found, or the token can’t see it.`);
    if (res.status === 409 || res.status === 422) { const err = new Error('conflict'); err.conflict = true; throw err; }
    if (!res.ok) throw new Error(`GitHub error ${res.status}`);
    return accept.includes('raw') ? res.text() : res.json();
  }

  async function readCode() {
    const f = await gh('code.json');
    if (!f) return { sha: undefined, data: {} };
    return { sha: f.sha, data: JSON.parse(b64dec(f.content) || '{}') };
  }

  async function pushCode() {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { sha, data } = await readCode();
      const dirty = Object.keys(entries).filter(n => entries[n].dirty);
      // newest edit wins, per problem
      let wrote = false;
      for (const n of dirty) {
        const e = entries[n];
        if (!data[n] || (data[n].at || 0) <= e.at) {
          data[n] = { lang: e.lang, code: e.code, rev: e.rev, at: e.at };
          wrote = true;
        }
      }
      try {
        if (wrote) {
          const nums = dirty.map(n => `#${n}`).join(', ');
          const body = JSON.stringify({ message: `Update code ${nums}`, content: b64enc(JSON.stringify(data, null, 1) + '\n'), sha });
          await gh('code.json', { method: 'PUT', body });
        }
      } catch (err) {
        if (err.conflict) continue; // someone else wrote first: re-read and merge again
        throw err;
      }
      for (const n of dirty) {
        // edits made while the request was in flight stay dirty
        if (data[n] && entries[n].rev === data[n].rev) delete entries[n].dirty;
      }
      // pick up code written on another device
      for (const [n, r] of Object.entries(data)) {
        const e = entries[n];
        if (!e || (!e.dirty && (r.at || 0) > (e.at || 0))) entries[n] = { lang: r.lang, code: r.code, rev: r.rev, at: r.at };
      }
      write(CODE_KEY, entries);
      return;
    }
    throw new Error('Could not save to GitHub — try again.');
  }

  async function pullReviews() {
    const txt = await gh('reviews.json', {}, 'application/vnd.github.raw+json');
    reviews = txt ? JSON.parse(txt) : {};
    write(REVIEW_KEY, reviews);
  }

  /* ---------- progress: three-way merge ---------- */

  // what syncs; theme, the install banner and an in-progress mock stay per device
  const MAPS = ['status', 'parsons'];  // per problem: the side that changed it wins
  const COUNTS = ['days', 'quiz', 'cxq']; // counters: both sides' increments add up
  const LISTS = ['slips', 'mocks'];      // append-only: keep both sides' new entries
  const SCALARS = ['newPerDay', 'retention', 'lang'];
  const FIELDS = ['srs', ...MAPS, ...COUNTS, ...LISTS, ...SCALARS];

  const stable = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)
    ? Object.fromEntries(Object.keys(x).sort().map(key => [key, x[key]])) : x));
  const same = (a, b) => stable(a) === stable(b);
  const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const pick = st => Object.fromEntries(FIELDS.filter(f => st[f] !== undefined).map(f => [f, clone(st[f])]));

  function mergeMap(base = {}, local = {}, remote = {}, prefer) {
    const out = {};
    for (const k of new Set([...Object.keys(local), ...Object.keys(remote), ...Object.keys(base)])) {
      const mine = !same(local[k], base[k]), theirs = !same(remote[k], base[k]);
      let v;
      if (mine && theirs && prefer) v = prefer(local[k], remote[k]);
      else v = mine ? local[k] : remote[k];
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  // remote + (local − base), recursively over numbers, arrays and objects
  function mergeCount(base, local, remote) {
    if (typeof local === 'number' || typeof remote === 'number' || typeof base === 'number') {
      return Math.max(0, (remote || 0) + (local || 0) - (base || 0));
    }
    if (Array.isArray(local) || Array.isArray(remote)) {
      const len = Math.max(local?.length || 0, remote?.length || 0);
      return Array.from({ length: len }, (_, i) => mergeCount(base?.[i], local?.[i], remote?.[i]));
    }
    const out = {};
    for (const k of new Set([...Object.keys(local || {}), ...Object.keys(remote || {})])) {
      out[k] = mergeCount(base?.[k], local?.[k], remote?.[k]);
    }
    return out;
  }
  function mergeList(base = [], local = [], remote = []) {
    const seen = new Set(base.map(stable));
    const have = new Set(remote.map(stable));
    const dropped = new Set(base.map(stable).filter(x => !local.some(y => stable(y) === x))); // cleared here
    return [...remote.filter(x => !dropped.has(stable(x))), ...local.filter(x => !seen.has(stable(x)) && !have.has(stable(x)))];
  }
  // a review card changed on both devices: keep the one reviewed most recently, then the one with more reviews
  const newerCard = (a, b) => (!a ? b : !b ? a : (a.last || '') !== (b.last || '') ? ((a.last || '') > (b.last || '') ? a : b) : (a.reps || 0) >= (b.reps || 0) ? a : b);

  function mergeProgress(base, local, remote) {
    const out = {};
    out.srs = mergeMap(base.srs, local.srs, remote.srs, newerCard);
    for (const f of MAPS) out[f] = mergeMap(base[f], local[f], remote[f]);
    for (const f of COUNTS) out[f] = mergeCount(base[f], local[f], remote[f] ?? (f === 'cxq' ? [0, 0] : {}));
    out.slips = {}; // slips[n] is a list per problem
    for (const n of new Set([...Object.keys(local.slips || {}), ...Object.keys(remote.slips || {})])) {
      const list = mergeList(base.slips?.[n], local.slips?.[n], remote.slips?.[n]);
      if (list.length) out.slips[n] = list;
    }
    out.mocks = mergeList(base.mocks, local.mocks, remote.mocks);
    for (const f of SCALARS) {
      const v = !same(local[f], base[f]) ? local[f] : remote[f] !== undefined ? remote[f] : local[f];
      if (v !== undefined) out[f] = v;
    }
    return out;
  }

  let hooks = null; // { get, fresh, apply } from the app
  function progress(h) { hooks = h; }

  async function syncProgress() {
    if (!hooks) return;
    for (let attempt = 0; attempt < 3; attempt++) {
      const f = await gh('progress.json');
      // a device that never synced starts from a fresh install's state, so untouched defaults don't count as edits
      const base = read(BASE_KEY, null) || pick(hooks.fresh());
      // nothing in the repo yet (or a field missing) means nothing changed there — not that it was deleted
      const remote = { ...base, ...(f ? JSON.parse(b64dec(f.content) || '{}') : {}) };
      const local = pick(hooks.get());
      const merged = mergeProgress(base, local, remote);
      if (!f || !same(merged, remote)) {
        const body = JSON.stringify({ message: 'Update progress', content: b64enc(JSON.stringify(merged) + '\n'), sha: f?.sha });
        try {
          await gh('progress.json', { method: 'PUT', body });
        } catch (err) {
          if (err.conflict) continue;
          throw err;
        }
      }
      write(BASE_KEY, merged);
      // keep anything changed here while the request was in flight
      const now = pick(hooks.get());
      const result = mergeProgress(local, now, merged);
      if (!same(result, now)) hooks.apply(result);
      return;
    }
    throw new Error('Could not save progress to GitHub — try again.');
  }

  let pending = null;
  async function sync({ quiet = false } = {}) {
    if (!configured()) return false;
    if (pending) return pending;
    if (!navigator.onLine) { state.error = 'Offline — will sync when you’re back online.'; changed(); return false; }
    state.busy = true;
    changed();
    pending = (async () => {
      try {
        await syncProgress();
        await pushCode();
        await pullReviews();
        state.error = '';
        state.last = cfg.last = Date.now();
        write(SYNC_KEY, cfg);
        return true;
      } catch (err) {
        state.error = err.message || 'Sync failed';
        if (!quiet && window.appToast) window.appToast(state.error);
        return false;
      } finally {
        state.busy = false;
        pending = null;
        changed();
      }
    })();
    return pending;
  }

  let pushTimer = 0;
  function schedulePush() {
    clearTimeout(pushTimer);
    if (configured()) pushTimer = setTimeout(() => { pushTimer = 0; sync({ quiet: true }); }, PUSH_DELAY);
  }

  // sync on launch, when coming back to the app, when the connection returns —
  // and straight away when you leave the app with changes still waiting
  let lastAuto = 0;
  const autoSync = () => {
    if (!configured() || Date.now() - lastAuto < 15000) return;
    lastAuto = Date.now();
    sync({ quiet: true });
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') autoSync();
    else if (pushTimer && configured()) { clearTimeout(pushTimer); pushTimer = 0; sync({ quiet: true }); }
  });
  window.addEventListener('online', autoSync);
  setTimeout(autoSync, 1500);

  window.MyCode = { get, set, all, importAll, review, config, setConfig, configured, sync, state, progress, touch: schedulePush, _merge: mergeProgress };
})();
