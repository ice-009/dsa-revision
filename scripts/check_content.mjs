// Validates lessons.js and plus/*.js against the sheet: every problem covered, links valid.
import fs from 'node:fs';
import vm from 'node:vm';
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['problems.js', 'notes.js', 'topics.js', 'lessons.js', 'plus/plus1.js', 'plus/plus2.js', 'plus/plus3.js', 'plus/plus4.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const { ITEMS, LESSONS, PLUS, TOPICS } = ctx.window;
const FAMS = 'hash prefix twoptr window stack monostack bsearch bsanswer llist fastslow design treedfs bfs trie heap backtrack graphdfs multibfs topo unionfind dijkstra mst dp1 dp2 knapsack greedy intervals sweep matrix bits'.split(' ');
const prac = ITEMS.filter(i => i.kind === 'Practice');
const byN = Object.fromEntries(prac.map(p => [p.n, p]));
const errs = [];
for (const p of prac) {
  const x = PLUS[p.n];
  if (!x) { errs.push(`#${p.n} missing PLUS`); continue; }
  for (const k of ['q', 'fam', 'hints', 'path', 'fu', 'rel']) if (!x[k]) errs.push(`#${p.n} missing ${k}`);
  if (!FAMS.includes(x.fam)) errs.push(`#${p.n} bad fam ${x.fam}`);
  if (x.hints.length !== 3) errs.push(`#${p.n} needs 3 hints`);
  for (const r of x.rel) if (!byN[r] || r === p.n) errs.push(`#${p.n} bad rel ${r}`);
}
for (const n of Object.keys(PLUS)) if (!byN[n]) errs.push(`PLUS has unknown #${n}`);
for (const t of TOPICS) {
  const L = LESSONS[t.name];
  if (!L) { errs.push(`no lesson for ${t.name}`); continue; }
  const want = prac.filter(p => p.topic === t.name).map(p => p.n).sort((a, b) => a - b);
  const got = [...L.ladder].sort((a, b) => a - b);
  if (JSON.stringify(want) !== JSON.stringify(got)) errs.push(`${t.name} ladder ${JSON.stringify(L.ladder)} vs topic ${JSON.stringify(want)}`);
  for (const k of ['intuition', 'why', 'steps', 'vs', 'variants', 'followups', 'mistakes', 'say']) if (!L[k]) errs.push(`${t.name} lesson missing ${k}`);
}
console.log(errs.length ? errs.join('\n') : `ok: ${prac.length} problems, ${TOPICS.length} lessons`);
const fams = {};
for (const p of prac) fams[PLUS[p.n].fam] = (fams[PLUS[p.n].fam] || 0) + 1;
console.log(fams);
process.exit(errs.length ? 1 : 0);
