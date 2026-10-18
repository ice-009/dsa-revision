// Spaced repetition: FSRS-6 (open-spaced-repetition). Each card keeps stability s (days until recall
// drops to 90%) and difficulty d (1–10), using the published default parameters.
import { PROBLEMS } from '../data';
import { S, save, dayLog } from './store';
import { today, addDays, dayNum, currentWeek } from './dates';

const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
  1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
const DECAY = -W[20];
const FACTOR = 0.9 ** (1 / DECAY) - 1;
const clampD = d => Math.min(10, Math.max(1, d));
const clampS = v => Math.max(0.001, v);
export const recall = (t, st) => (1 + FACTOR * t / st) ** DECAY; // probability you still remember after t days
const initD = g => W[4] - Math.exp(W[5] * (g - 1)) + 1;
export const intervalFor = st => Math.min(3650, Math.max(1, Math.round((st / FACTOR) * (S.retention ** (1 / DECAY) - 1))));

// g: 1 Again, 2 Hard, 3 Good, 4 Easy. Returns the new { s, d }.
export function fsrsNext(card, g, elapsed) {
  if (!card || card.s == null) return { s: clampS(W[g - 1]), d: clampD(initD(g)) };
  const { s: st, d } = card;
  let ns;
  if (elapsed < 1) {
    ns = st * Math.exp(W[17] * (g - 3 + W[18])) * st ** -W[19];
  } else {
    const r = recall(elapsed, st);
    ns = g === 1
      ? Math.min(W[11] * d ** -W[12] * ((st + 1) ** W[13] - 1) * Math.exp((1 - r) * W[14]), st / Math.exp(W[17] * W[18]))
      : st * (1 + Math.exp(W[8]) * (11 - d) * st ** -W[9] * (Math.exp((1 - r) * W[10]) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
  }
  const d2 = d + ((10 - d) * -W[6] * (g - 3)) / 9;
  return { s: clampS(ns), d: clampD(W[7] * initD(4) + (1 - W[7]) * d2) };
}

export const GRADES = ['Again', 'Hard', 'Good', 'Easy'];
export const elapsedFor = card => (card && card.last ? dayNum(today()) - dayNum(card.last) : 0);
export const preview = (card, i) => intervalFor(fsrsNext(card, i + 1, elapsedFor(card)).s);
export const fmtDays = d => d < 30 ? `${d}d` : d < 365 ? `${Math.round(d / 30)}mo` : `${(d / 365).toFixed(1)}y`;
export const recallNow = card => (card && card.s ? recall(elapsedFor(card), card.s) : null);

/** Grade a card: gi 0 Again … 3 Easy. */
export const rate = (n, gi) => {
  const t = today();
  const prev = S.srs[n];
  const { s: st, d } = fsrsNext(prev, gi + 1, elapsedFor(prev));
  S.srs[n] = { s: st, d, due: addDays(t, intervalFor(st)), last: t, reps: (prev?.reps || 0) + 1, lapses: (prev?.lapses || 0) + (gi === 0 ? 1 : 0) };
  const log = dayLog(t);
  log.reviewed++;
  if (!prev) log.fresh++;
  save();
};

// Mix topics so consecutive cards differ (interleaving builds pattern discrimination).
export function interleave(list) {
  const pool = [...list], out = [];
  while (pool.length) {
    const last = out[out.length - 1];
    let k = pool.findIndex(p => !last || p.topic !== last.topic);
    if (k < 0) k = 0;
    out.push(pool.splice(k, 1)[0]);
  }
  return out;
}

export const dueToday = () => {
  const t = today();
  const due = PROBLEMS.filter(p => S.srs[p.n] && S.srs[p.n].due <= t)
    .sort((a, b) => (recallNow(S.srs[a.n]) ?? 1) - (recallNow(S.srs[b.n]) ?? 1) || a.n - b.n);
  const revisit = PROBLEMS.filter(p => S.status[p.n] === 'revisit' && !due.includes(p) && S.srs[p.n]?.last !== t);
  const room = Math.max(0, S.newPerDay - (S.days[t]?.fresh || 0));
  const unseen = PROBLEMS.filter(p => !S.srs[p.n]);
  const fresh = [
    ...unseen.filter(p => S.status[p.n]),
    ...unseen.filter(p => !S.status[p.n] && p.week <= currentWeek()),
  ].filter(p => !revisit.includes(p)).slice(0, room);
  return { due, revisit, fresh, all: interleave([...due, ...revisit, ...fresh]) };
};

export const streak = () => {
  let d = today(), n = 0;
  if (!S.days[d]?.reviewed) d = addDays(d, -1);
  while (S.days[d]?.reviewed) { n++; d = addDays(d, -1); }
  return n;
};

export const solvedCount = () => PROBLEMS.filter(p => S.status[p.n] === 'solved').length;
