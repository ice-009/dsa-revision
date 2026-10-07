/* Your code — your own solution to each problem, plus Claude's review of it.

   Local first: every keystroke is kept on this device (localStorage), so nothing is lost
   offline. When sync is set up (More → Your code sync), entries are pushed to a private
   GitHub repo that acts as the database:
     code.json     written here     { "<n>": { lang, code, rev, at } }
     reviews.json  written by the /review-my-code Claude Code skill
                   { "<n>": { rev, lang, code: { cpp, java, js }, tests, approach, same, compare, notes, at } }
   The token never leaves this device and is never included in backups.

   Exposes window.MyCode = { get, set, all, importAll, review, config, setConfig, configured, sync, state }
   and fires a "mycode-change" event on document whenever entries, reviews or sync state change. */
(function () {
  'use strict';

  const CODE_KEY = 'dsa-revise:mycode';
  const REVIEW_KEY = 'dsa-revise:reviews';
  const SYNC_KEY = 'dsa-revise:sync';
  const DEFAULT_REPO = 'ice-009/dsa-revise-data';
  const API = 'https://api.github.com';
  const PUSH_DELAY = 4000; // push this long after the last keystroke

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

  let pending = null;
  async function sync({ quiet = false } = {}) {
    if (!configured()) return false;
    if (pending) return pending;
    if (!navigator.onLine) { state.error = 'Offline — will sync when you’re back online.'; changed(); return false; }
    state.busy = true;
    changed();
    pending = (async () => {
      try {
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
    if (configured()) pushTimer = setTimeout(() => sync({ quiet: true }), PUSH_DELAY);
  }

  // sync on launch, when coming back to the app, and when the connection returns
  let lastAuto = 0;
  const autoSync = () => {
    if (!configured() || Date.now() - lastAuto < 60000) return;
    lastAuto = Date.now();
    sync({ quiet: true });
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') autoSync(); });
  window.addEventListener('online', autoSync);
  setTimeout(autoSync, 1500);

  window.MyCode = { get, set, all, importAll, review, config, setConfig, configured, sync, state };
})();
