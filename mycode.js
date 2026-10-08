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

   When it syncs: 3 s after a change, on launch, every 45 s while the app is on screen, when you come
   back to it, when the connection returns — and straight away (one keepalive request) when you leave.

   Exposes window.MyCode = { get, set, all, importAll, review, config, setConfig, configured, sync, state,
   progress, touch, setupLink, parseSetup } and fires a "mycode-change" event on document whenever entries,
   reviews or sync state change. */
(function () {
  'use strict';

  const CODE_KEY = 'dsa-revise:mycode';
  const REVIEW_KEY = 'dsa-revise:reviews';
  const SYNC_KEY = 'dsa-revise:sync';
  const BASE_KEY = 'dsa-revise:sync-base'; // progress as of the last successful sync
  const HEAD_KEY = 'dsa-revise:sync-head'; // { sha, extra } of progress.json as of the last successful sync
  const PEND_KEY = 'dsa-revise:sync-pending'; // writes sent but not yet confirmed: [{ id, data }]
  const DEFAULT_REPO = 'ice-009/dsa-revise-data';
  const API = 'https://api.github.com';
  const PUSH_DELAY = 3000; // push this long after the last change
  const POLL = 45000; // pull this often while the app is on screen (~240 requests/hour; GitHub allows 5000)
  const TIMEOUT = 20000; // give up on a request after this long, so a stalled one can't block every later sync

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
    const was = cfg.repo || DEFAULT_REPO;
    cfg = { ...cfg, repo: (repo || DEFAULT_REPO).trim() };
    // a different repo is a different history: merge against it from scratch
    if (cfg.repo !== was) [BASE_KEY, HEAD_KEY, PEND_KEY].forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
    if (token !== undefined) cfg.token = token.trim();
    if (!cfg.token) delete cfg.token;
    write(SYNC_KEY, cfg);
    state.error = '';
    changed();
  }

  /* ---------- setup link: connect another device of yours in one tap ---------- */

  const b64url = s => b64enc(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  function setupLink() {
    if (!configured()) return '';
    return `${location.origin}${location.pathname}#/connect/${b64url(JSON.stringify({ repo: cfg.repo, token: cfg.token }))}`;
  }
  // a whole setup link, or just the part after #/connect/ → { repo, token }, or null
  function parseSetup(text) {
    const s = String(text || '').trim();
    const m = s.match(/#\/connect\/([A-Za-z0-9_-]+)/) || s.match(/^([A-Za-z0-9_-]+)$/);
    if (!m) return null;
    try {
      const v = JSON.parse(b64dec(m[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (v && typeof v.token === 'string' && v.token && typeof v.repo === 'string' && /^[\w.-]+\/[\w.-]+$/.test(v.repo)) return { repo: v.repo, token: v.token };
    } catch (e) { /* not a setup link */ }
    return null;
  }

  /* ---------- GitHub contents API ---------- */

  const b64enc = s => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const b64dec = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), c => c.charCodeAt(0)));

  // keepalive lets a write finish after you leave the app; browsers allow it for bodies under 64 KB
  async function gh(path, opts = {}, accept = 'application/vnd.github+json') {
    const url = `${API}/repos/${cfg.repo}/contents/${path}`;
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctl && !opts.keepalive ? setTimeout(() => ctl.abort(), TIMEOUT) : 0;
    let res;
    try {
      res = await fetch(url, {
        ...opts,
        keepalive: !!(opts.keepalive && opts.body && opts.body.length < 60000),
        cache: 'no-store', // never a stale copy from the HTTP cache
        signal: ctl?.signal,
        headers: { Accept: accept, Authorization: `Bearer ${cfg.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
      });
    } catch (err) {
      throw new Error(err?.name === 'AbortError' ? 'GitHub took too long to answer — will retry.' : 'Can’t reach GitHub — will retry.');
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 401) throw new Error('GitHub rejected the token — paste a fresh one in More.');
    if ((res.status === 403 || res.status === 429) && (res.status === 429 || res.headers?.get?.('x-ratelimit-remaining') === '0')) throw new Error('GitHub rate limit reached — will retry later.');
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
      // pick up code written on another device — including a newer edit of something changed here
      for (const [n, r] of Object.entries(data)) {
        const e = entries[n];
        if (!e || ((r.at || 0) > (e.at || 0) && (!e.dirty || dirty.includes(n)))) entries[n] = { lang: r.lang, code: r.code, rev: r.rev, at: r.at };
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
  const MAPS = ['status', 'parsons', 'solvedOn'];  // per problem: the side that changed it wins
  const COUNTS = ['days', 'quiz', 'cxq']; // counters: both sides' increments add up
  const LISTS = ['slips', 'mocks'];      // append-only: keep both sides' new entries
  const SCALARS = ['newPerDay', 'retention', 'lang', 'planEnd'];
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

  /* Every write to progress.json carries a random id, and the file keeps the last 20 (`_w`). A write is
     remembered here until we hear back; if the reply never arrives (app closed mid-request), the next
     sync finds its id in the file and knows it landed — so counters aren't added twice. */
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const extrasOf = raw => Object.fromEntries(Object.entries(raw || {}).filter(([k]) => !FIELDS.includes(k)));
  const docFor = (extra, merged, id) => ({ ...extra, ...merged, _w: [...(Array.isArray(extra._w) ? extra._w : []), id].slice(-20) });
  const remember = (id, data) => write(PEND_KEY, [...read(PEND_KEY, []), { id, data }].slice(-5));
  const forget = id => write(PEND_KEY, read(PEND_KEY, []).filter(p => p.id !== id));
  const putProgress = (doc, sha, keepalive) => gh('progress.json', {
    method: 'PUT', keepalive,
    body: JSON.stringify({ message: 'Update progress', content: b64enc(JSON.stringify(doc) + '\n'), ...(sha ? { sha } : {}) }),
  });
  const settled = (merged, sha, doc) => {
    write(BASE_KEY, merged);
    write(HEAD_KEY, { sha, extra: extrasOf(doc) });
    write(PEND_KEY, []);
  };

  async function syncProgress(keepalive) {
    if (!hooks) return;
    for (let attempt = 0; attempt < 3; attempt++) {
      const f = await gh('progress.json');
      const raw = f ? JSON.parse(b64dec(f.content) || '{}') : {};
      let base = read(BASE_KEY, null);
      // a write of ours whose reply we never got, but which is in the file: that is our true starting point
      const landed = read(PEND_KEY, []).filter(p => (raw._w || []).includes(p.id));
      if (landed.length) base = landed.sort((a, b) => raw._w.indexOf(b.id) - raw._w.indexOf(a.id))[0].data;
      // a device that never synced starts from a fresh install's state, so untouched defaults don't count as
      // edits — and everything you did before connecting does, so it gets pushed
      if (!base) base = pick(hooks.fresh());
      // nothing in the repo yet (or a field missing) means nothing changed there — not that it was deleted
      const remote = { ...base, ...pick(raw) };
      const local = pick(hooks.get());
      const merged = mergeProgress(base, local, remote);
      let sha = f?.sha, doc = raw;
      // write when something changed — or when the file lacks a field (an older version of the app wrote it)
      if (!f || !same(merged, remote) || Object.keys(merged).some(k => raw[k] === undefined)) {
        const id = rid();
        doc = docFor(extrasOf(raw), merged, id);
        remember(id, merged);
        try {
          sha = (await putProgress(doc, f?.sha, keepalive))?.content?.sha;
        } catch (err) {
          if (err.conflict) { forget(id); continue; } // someone else wrote first: re-read and merge again
          throw err; // it may still have landed — the id stays remembered for the next sync to check
        }
      }
      settled(merged, sha, doc);
      // keep anything changed here while the request was in flight
      const now = pick(hooks.get());
      const result = mergeProgress(local, now, merged);
      if (!same(result, now)) hooks.apply(result);
      return;
    }
    throw new Error('Could not save progress to GitHub — try again.');
  }

  // Leaving the app: push local changes in ONE request (no read first), on top of the version we last
  // synced. If another device wrote since, GitHub refuses it (sha mismatch) and the next sync merges.
  // Returns null if it can't be used here, false if there's nothing to push, else a promise.
  let quick = null;
  function quickPush() {
    if (quick) return quick;
    if (!hooks || pending) return null;
    const base = read(BASE_KEY, null), head = read(HEAD_KEY, null);
    if (!base || !head?.sha) return null;
    const merged = mergeProgress(base, pick(hooks.get()), base);
    if (same(merged, base)) return false;
    const id = rid(), doc = docFor(head.extra || {}, merged, id);
    remember(id, merged);
    quick = putProgress(doc, head.sha, true).then(r => {
      if (r?.content?.sha) settled(merged, r.content.sha, doc);
    }).catch(err => { if (err.conflict) forget(id); }).finally(() => { quick = null; });
    return quick;
  }

  let pending = null, again = false, toasted = '';
  async function sync({ quiet = false, keepalive = false } = {}) {
    if (!configured()) return false;
    // already syncing: go round once more afterwards, so a change made meanwhile isn't left behind
    if (pending) { again = true; return pending; }
    if (!navigator.onLine) { state.error = 'Offline — will sync when you’re back online.'; changed(); return false; }
    state.busy = true;
    changed();
    pending = (async () => {
      try {
        if (quick) await quick;
        await syncProgress(keepalive);
        await pushCode();
        await pullReviews();
        state.error = '';
        toasted = '';
        state.last = cfg.last = Date.now();
        write(SYNC_KEY, cfg);
        return true;
      } catch (err) {
        state.error = err.message || 'Sync failed';
        // background syncs say so once per new problem, not on every retry
        const say = !quiet || (state.error !== toasted && document.visibilityState !== 'hidden');
        toasted = state.error;
        if (say && window.appToast) window.appToast(quiet ? `Sync problem: ${state.error}` : state.error);
        return false;
      } finally {
        state.busy = false;
        pending = null;
        changed();
      }
    })();
    const p = pending;
    p.then(() => { if (again) { again = false; sync({ quiet: true }); } });
    return p;
  }

  let pushTimer = 0;
  function schedulePush() {
    clearTimeout(pushTimer);
    if (configured()) pushTimer = setTimeout(() => { pushTimer = 0; sync({ quiet: true }); }, PUSH_DELAY);
  }

  // sync on launch, every 45 s while on screen, when coming back to the app, when the connection returns —
  // and straight away when you leave the app with changes still waiting
  let lastAuto = 0;
  const autoSync = () => {
    if (!configured() || document.visibilityState === 'hidden' || Date.now() - lastAuto < 15000) return;
    lastAuto = Date.now();
    sync({ quiet: true });
  };
  const flush = () => {
    if (!configured()) return;
    const waiting = !!pushTimer;
    clearTimeout(pushTimer);
    pushTimer = 0;
    const codeDirty = Object.values(entries).some(e => e.dirty);
    const q = quickPush();
    if (q === null ? waiting || codeDirty : codeDirty) {
      if (q) q.finally(() => sync({ quiet: true, keepalive: true }));
      else sync({ quiet: true, keepalive: true });
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') autoSync();
    else flush();
  });
  window.addEventListener('pagehide', flush);
  window.addEventListener('pageshow', autoSync);
  window.addEventListener('focus', autoSync);
  window.addEventListener('online', autoSync);
  setInterval(autoSync, POLL);
  setTimeout(autoSync, 1500);

  window.MyCode = { get, set, all, importAll, review, config, setConfig, configured, sync, state, progress, touch: schedulePush, setupLink, parseSetup, _merge: mergeProgress };
})();
