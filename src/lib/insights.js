// "Where you slip" lines for Today (ported from legacy quizLine/slipLine/weakLine).
export const FAMILY = {
  hash: 'Hash map / set', prefix: 'Prefix / suffix sums', twoptr: 'Two pointers', window: 'Sliding window',
  stack: 'Stack', monostack: 'Monotonic stack / deque', bsearch: 'Binary search', bsanswer: 'Binary search on the answer',
  llist: 'Linked-list pointer surgery', fastslow: 'Fast & slow pointers', design: 'Data-structure design',
  treedfs: 'Tree DFS (recursion)', bfs: 'BFS level by level', trie: 'Trie', heap: 'Heap / priority queue',
  backtrack: 'Backtracking', graphdfs: 'Graph DFS / flood fill', multibfs: 'Multi-source BFS', topo: 'Topological sort',
  unionfind: 'Union-Find', dijkstra: 'Shortest path (Dijkstra / Bellman-Ford)', mst: 'Minimum spanning tree',
  dp1: '1-D dynamic programming', dp2: '2-D dynamic programming', knapsack: 'Knapsack DP', greedy: 'Greedy',
  intervals: 'Sort intervals + scan', sweep: 'Sweep line / events', matrix: 'Matrix simulation', bits: 'Bit manipulation',
};
export const SLIPS = [['pattern', 'Didn’t spot the pattern'], ['trick', 'Forgot the key trick'], ['edge', 'Edge case'], ['index', 'Off-by-one / indices'],
  ['cx', 'Complexity'], ['api', 'Syntax / library']];
export const SLIP_ADVICE = { pattern: 'Do a round of Spot the pattern daily.', trick: 'Reread the key insight and say it aloud before revealing.',
  edge: 'Run the Playbook edge-case checklist before coding.', index: 'Step through the dry run and predict each line before you reveal it.',
  cx: 'Try the Complexity drill.', api: 'Rebuild the code in your interview language.' };

/** { label, count, advice } for the most common slip (3+ times), else null */
export function topSlip(S) {
  const count = {};
  for (const list of Object.values(S.slips || {})) for (const x of list) count[x.why] = (count[x.why] || 0) + 1;
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 3) return null;
  const found = SLIPS.find(([k]) => k === top[0]);
  return found ? { label: found[1], count: top[1], advice: SLIP_ADVICE[top[0]] } : null;
}
/** weakest recognition families: [{ label, pct }] */
export function weakFamilies(S) {
  return Object.keys(S.quiz || {}).filter(f => S.quiz[f][1] >= 3 && S.quiz[f][0] / S.quiz[f][1] < 0.7)
    .sort((a, b) => S.quiz[a][0] / S.quiz[a][1] - S.quiz[b][0] / S.quiz[b][1]).slice(0, 3)
    .map(f => ({ label: FAMILY[f] || f, pct: Math.round(S.quiz[f][0] / S.quiz[f][1] * 100) }));
}
export const quizLine = S => {
  const tot = Object.values(S.quiz || {}).reduce((a, [r, t]) => [a[0] + r, a[1] + t], [0, 0]);
  return tot[1] ? ` · ${Math.round(tot[0] / tot[1] * 100)}% so far` : '';
};
