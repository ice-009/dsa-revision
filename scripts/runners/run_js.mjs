// Replays solutions/cases.json against the JS solutions. Usage: node run_js.mjs cases.json snippets.json
// snippets.json maps problem number -> JS source. Prints one JSON line per case.
import fs from 'node:fs';
import vm from 'node:vm';

const cases = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const snippets = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

const NODES = `
function ListNode(val, next) { this.val = (val === undefined ? 0 : val); this.next = (next === undefined ? null : next); }
function TreeNode(val, left, right) {
  this.val = (val === undefined ? 0 : val); this.left = (left === undefined ? null : left); this.right = (right === undefined ? null : right);
}`;
const RAND_NODE = `function _Node(val, next, random) { this.val = val; this.next = next; this.random = random; }`;
const GRAPH_NODE = `function _Node(val, neighbors) { this.val = val === undefined ? 0 : val; this.neighbors = neighbors === undefined ? [] : neighbors; }`;

for (const [n, spec] of Object.entries(cases)) {
  const code = snippets[n];
  if (!code) continue;
  const extra = spec.ret === 'rand' ? RAND_NODE : spec.ret === 'graph' ? GRAPH_NODE : '';
  const ctx = vm.createContext({});
  try {
    vm.runInContext(`${NODES}\n${extra}\n${code}\n;globalThis.__target = ${spec.name};`, ctx, { timeout: 5000 });
  } catch (e) {
    spec.cases.forEach((_, i) => console.log(JSON.stringify({ n: +n, i, error: `load: ${e.message}` })));
    continue;
  }
  const target = ctx.__target;
  spec.cases.forEach((cs, i) => {
    const trees = [];
    const inputs = new Set();
    const decode = j => {
      if (j === null || typeof j !== 'object') return j;
      if (Array.isArray(j)) return j.map(decode);
      if ('$list' in j || '$cycle' in j) {
        const [vals, at] = '$cycle' in j ? j.$cycle : [j.$list, -1];
        const dummy = new ctx.ListNode(); let tail = dummy; const nodes = [];
        for (const v of vals) { tail.next = new ctx.ListNode(v); tail = tail.next; nodes.push(tail); inputs.add(tail); }
        if (at >= 0) tail.next = nodes[at];
        return dummy.next;
      }
      if ('$ref' in j) {
        const find = r => !r ? null : r.val === j.$ref ? r : find(r.left) || find(r.right);
        for (const t of trees) { const f = find(t); if (f) return f; }
        return null;
      }
      if ('$tree' in j) {
        const v = j.$tree;
        if (!v.length || v[0] === null) return null;
        const root = new ctx.TreeNode(v[0]); const q = [root]; let k = 1;
        while (q.length && k < v.length) {
          const node = q.shift();
          if (k < v.length && v[k] !== null) { node.left = new ctx.TreeNode(v[k]); q.push(node.left); }
          k++;
          if (k < v.length && v[k] !== null) { node.right = new ctx.TreeNode(v[k]); q.push(node.right); }
          k++;
        }
        trees.push(root);
        return root;
      }
      if ('$rand' in j) {
        const nodes = j.$rand.map(([v]) => new ctx._Node(v, null, null));
        nodes.forEach((node, k) => { node.next = nodes[k + 1] || null; const r = j.$rand[k][1]; node.random = r === null ? null : nodes[r]; inputs.add(node); });
        return nodes[0] || null;
      }
      if ('$graph' in j) {
        const nodes = j.$graph.map((_, k) => new ctx._Node(k + 1, []));
        j.$graph.forEach((nbs, k) => { nodes[k].neighbors = nbs.map(v => nodes[v - 1]); inputs.add(nodes[k]); });
        return nodes[0] || null;
      }
      throw new Error('unknown input ' + JSON.stringify(j));
    };
    const listVals = h => { const out = []; for (let g = 0; h && g < 100000; h = h.next, g++) out.push(h.val); return out; };
    const treeVals = r => {
      const out = [], q = [r];
      while (q.length) { const x = q.shift(); if (x) { out.push(x.val); q.push(x.left, x.right); } else out.push(null); }
      while (out.length && out[out.length - 1] === null) out.pop();
      return out;
    };
    const encode = (r, ret) => {
      if (ret === 'list') return listVals(r);
      if (ret === 'tree') return treeVals(r);
      if (ret === 'val') return r ? r.val : null;
      if (ret === 'rand') {
        if (!r) return null;
        const nodes = [];
        for (let x = r; x; x = x.next) { if (inputs.has(x)) return 'shares nodes with the original'; nodes.push(x); }
        return { $rand: nodes.map(x => [x.val, x.random ? nodes.indexOf(x.random) : null]) };
      }
      if (ret === 'graph') {
        if (!r) return null;
        const seen = new Map(), st = [r];
        while (st.length) {
          const x = st.pop();
          if (inputs.has(x)) return 'shares nodes with the original';
          if (seen.has(x.val)) continue;
          seen.set(x.val, x); st.push(...x.neighbors);
        }
        return { $graph: [...seen.keys()].sort((a, b) => a - b).map(v => seen.get(v).neighbors.map(nb => nb.val)) };
      }
      if (r instanceof ctx.ListNode) return listVals(r);
      if (r instanceof ctx.TreeNode) return treeVals(r);
      return r === undefined ? null : r;
    };
    try {
      let got;
      if (spec.design) {
        const obj = new target(...decode(cs.init));
        got = [];
        for (const [m, ...a] of cs.calls) {
          const r = obj[m](...decode(a));
          if (r !== undefined) got.push(encode(r));
        }
      } else {
        const a = decode(cs.args);
        const r = target(...a);
        got = spec.inplace !== null ? encode(a[spec.inplace]) : encode(r, spec.ret);
      }
      console.log(JSON.stringify({ n: +n, i, got }));
    } catch (e) {
      console.log(JSON.stringify({ n: +n, i, error: String(e && e.message || e) }));
    }
  });
}
