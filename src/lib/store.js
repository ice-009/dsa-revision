// App state: one mutable object S (persisted to localStorage, synced by mycode.js), plus a React hook.
//   const S = useApp();            // re-renders the component whenever S changes
//   setStatus(n, 'solved');        // actions mutate S, call save(), and notify subscribers
import { useSyncExternalStore, useEffect, useState } from 'react';
import { ITEMS, BY_N, MyCode } from '../data';
import { today, addDays, PLAN_END } from './dates';
import { toast } from './toast';

export const KEY = 'dsa-revise:v1';
export const defaults = () => ({
  status: {}, srs: {}, days: {}, newPerDay: 8, theme: 'auto', hideInstall: false, lang: 'cpp', retention: 0.9,
  quiz: {}, parsons: {}, cxq: [0, 0], slips: {}, mocks: [], mock: null, solvedOn: {}, planEnd: PLAN_END,
  cf: {}, cfOn: {}, // Codeforces sheet: { "<problem id>": 'solved' | 'revisit' } and the day it was solved
  cfProb: {}, cfCode: {}, cfCases: {}, // fetched/added Codeforces problems, your code per language, your extra test cases
});
// a fresh install: problems already done on the sheet start as solved
export const seeded = () => {
  const s = defaults();
  for (const i of ITEMS) if (i.done) s.status[i.n] = 'solved';
  return s;
};
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object') return { ...defaults(), ...saved };
  } catch (e) { /* storage unavailable */ }
  return seeded();
};

export let S = load();
// Cards from the earlier Leitner scheduler keep their progress.
for (const [n, c] of Object.entries(S.srs)) {
  if (c.s == null) S.srs[n] = { ...c, s: [0.4, 1, 3, 7, 14, 30, 60][c.box || 0], d: 5 };
}

let version = 0;
const subs = new Set();
const notify = () => { version++; subs.forEach(f => f()); };
const subscribe = f => { subs.add(f); return () => subs.delete(f); };
/** Subscribe a component to the app state. Returns S (the same mutable object). */
export const useApp = () => { useSyncExternalStore(subscribe, () => version); return S; };

export const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save — storage is full or blocked'); }
};
/** Persist, queue for sync to other devices, and re-render subscribers. Call after every mutation of S. */
export const save = () => { persist(); MyCode.touch(); notify(); };
export const dayLog = (d = today()) => (S.days[d] ||= { reviewed: 0, fresh: 0 });

// progress arriving from another device
MyCode.progress({
  get: () => S,
  fresh: seeded,
  apply(merged) { S = { ...S, ...merged }; persist(); notify(); },
});

/** Re-render on sync/code changes (MyCode.get/review/state/configured). */
export function useMyCode() {
  const [, set] = useState(0);
  useEffect(() => {
    const f = () => set(x => x + 1);
    document.addEventListener('mycode-change', f);
    return () => document.removeEventListener('mycode-change', f);
  }, []);
  return MyCode;
}

export function setStatus(n, v) {
  S.status[n] = S.status[n] === v ? undefined : v;
  if (!S.status[n]) delete S.status[n];
  // the plan counts what you solved today toward today's list
  if (S.status[n] === 'solved') S.solvedOn[n] ||= today();
  else delete S.solvedOn[n];
  save();
  if (S.status[n] === 'solved') toast(`Solved: ${BY_N[n].title}`, { label: 'Undo', run: () => setStatus(n, 'solved') });
}

/** Codeforces: id is e.g. '1900A'. */
export function setCfStatus(id, v) {
  S.cf[id] = S.cf[id] === v ? undefined : v;
  if (!S.cf[id]) delete S.cf[id];
  if (S.cf[id] === 'solved') S.cfOn[id] ||= today();
  else delete S.cfOn[id];
  save();
}

/** Save a fetched or hand-entered Codeforces problem (shape documented in api/cf.js). */
export function addCfProblem(p) { S.cfProb[p.id] = p; save(); }
export function removeCfProblem(id) { delete S.cfProb[id]; delete S.cfCode[id]; delete S.cfCases[id]; save(); }
/** Draft code for a problem, per language. */
export function setCfCode(id, lang, code) { (S.cfCode[id] ||= {})[lang] = code; save(); }
/** Your own extra test cases: [{ in, out }]. */
export function setCfCases(id, cases) { S.cfCases[id] = cases; save(); }

export function set(patch) { Object.assign(S, patch); save(); }

export function applyTheme() {
  if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', S.theme);
}

export async function exportBackup() {
  const blob = new Blob([JSON.stringify({ ...S, mycode: MyCode.all() }, null, 1)], { type: 'application/json' });
  if (window.DSAReviseAndroid) {
    const reader = new FileReader();
    reader.onload = () => window.DSAReviseAndroid.save(reader.result, 'application/json');
    reader.readAsDataURL(blob);
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dsa-revise-backup-${today()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
export { addDays };

/** Restore from a backup file's text. Throws if it isn't one. Returns the number of solutions imported. */
export function importBackup(txt) {
  const data = JSON.parse(txt);
  if (!data || typeof data.status !== 'object' || typeof data.srs !== 'object') throw new Error('bad file');
  const { ink, mycode, ...state } = data;
  S = { ...defaults(), ...state };
  save(); applyTheme();
  return MyCode.importAll(mycode);
}
