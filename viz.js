/* "See it run" — step-by-step visual walkthroughs, one per pattern.
   Every walkthrough runs the real algorithm on a small input and records frames as it goes,
   so what you see is exactly what the code does. A frame = { note, panes: [...] }.
   Pane types: array, map, stack, queue, vars, list, tree (heap layout), gtree (general tree),
   grid, table, bars, graph, bits.
   Exposes window.Viz = { html(topicName) }; a MutationObserver mounts the players. */
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = v => JSON.parse(JSON.stringify(v));
  // Frames are deep-copied as they're recorded, so later mutations by the algorithm can't leak into earlier steps.
  const frames = () => { const a = []; a.push = f => Array.prototype.push.call(a, clone(f)); return a; };

  /* ---------- pane renderers ---------- */

  function ptrRow(n, ptr) {
    const at = Array.from({ length: n }, () => []);
    for (const [name, i] of Object.entries(ptr || {})) if (i != null && i >= 0 && i < n) at[i].push(name);
    return at;
  }

  const R = {
    array(p) {
      const n = p.vals.length;
      const at = ptrRow(n, p.ptr);
      const max = p.bars ? Math.max(...p.vals.map(v => Math.abs(v)), 1) : 0;
      return `<div class="vz-arr">${p.vals.map((v, i) => {
        const inRange = p.range && i >= p.range[0] && i <= p.range[1];
        const cls = [(p.cls || {})[i] || '', inRange ? 'win' : ''].join(' ');
        return `<div class="vz-col">
          <div class="vz-ptr">${at[i].map(x => `<span>${esc(x)}</span>`).join('')}</div>
          ${p.bars ? `<div class="vz-barwrap"><div class="vz-bar ${cls}" style="height:${Math.round((Math.abs(v) / max) * 100)}%"></div></div>` : ''}
          <div class="vz-cell ${cls}">${esc(v)}</div>
          ${p.idx === false ? '' : `<div class="vz-idx">${i}</div>`}
        </div>`;
      }).join('')}</div>`;
    },
    map(p) {
      return `<div class="vz-chips">${p.entries.length ? p.entries.map(([k, v]) =>
        `<span class="vz-chip ${p.hl != null && String(p.hl) === String(k) ? 'hl' : ''}">${esc(k)}${v !== undefined ? ` <i>→</i> ${esc(v)}` : ''}</span>`).join('')
        : '<span class="vz-empty">empty</span>'}</div>`;
    },
    stack(p) {
      return `<div class="vz-stack">${p.vals.length ? p.vals.map((v, i) =>
        `<span class="vz-box ${i === p.vals.length - 1 ? 'top' : ''} ${p.hl === i ? 'hl' : ''}">${esc(v)}</span>`).join('') + '<span class="vz-cap">← top</span>'
        : '<span class="vz-empty">empty</span>'}</div>`;
    },
    queue(p) {
      return `<div class="vz-stack">${p.vals.length ? '<span class="vz-cap">front →</span>' + p.vals.map((v, i) =>
        `<span class="vz-box ${i === 0 ? 'top' : ''}">${esc(v)}</span>`).join('') : '<span class="vz-empty">empty</span>'}</div>`;
    },
    vars(p) {
      return `<div class="vz-chips">${Object.entries(p.vals).map(([k, v]) =>
        `<span class="vz-var ${(p.hl || []).includes(k) ? 'hl' : ''}"><b>${esc(k)}</b> ${esc(v)}</span>`).join('')}</div>`;
    },
    list(p) {
      const n = p.vals.length;
      const at = ptrRow(n, p.ptr);
      let h = '<div class="vz-list">';
      for (let i = 0; i < n; i++) {
        h += `<div class="vz-col"><div class="vz-ptr">${at[i].map(x => `<span>${esc(x)}</span>`).join('')}</div>
          <div class="vz-node ${(p.cls || {})[i] || ''}">${esc(p.vals[i])}</div>
          <div class="vz-idx">${p.next[i] == null ? '→ null' : ''}</div></div>`;
        if (i < n - 1) {
          const arrow = p.next[i] === i + 1 ? '→' : p.next[i + 1] === i ? '←' : '';
          h += `<div class="vz-link ${arrow === '←' ? 'flip' : ''}">${arrow}</div>`;
        }
      }
      return h + '</div>' + (p.nullPtr && p.nullPtr.length ? `<div class="vz-note-sm">${p.nullPtr.map(esc).join(', ')} = null</div>` : '');
    },
    tree(p) {
      // heap layout: node at index i has children 2i+1, 2i+2
      const nodes = p.arr;
      const depth = Math.max(1, Math.ceil(Math.log2(nodes.length + 1)));
      const W = 100, H = depth * 26 + 6;
      const pos = i => { const lvl = Math.floor(Math.log2(i + 1)); const k = i - (2 ** lvl - 1); return [((k + 0.5) / 2 ** lvl) * W, lvl * 26 + 14]; };
      let lines = '', circles = '';
      nodes.forEach((v, i) => {
        if (v == null) return;
        const [x, y] = pos(i);
        for (const c of [2 * i + 1, 2 * i + 2]) if (c < nodes.length && nodes[c] != null) {
          const [cx, cy] = pos(c);
          lines += `<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}"/>`;
        }
        circles += `<g class="vz-tn ${(p.cls || {})[i] || ''}"><circle cx="${x}" cy="${y}" r="6.4"/><text x="${x}" y="${y + 2.4}">${esc(v)}</text></g>`;
      });
      return `<svg class="vz-tree" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin meet">${lines}${circles}</svg>`;
    },
    gtree(p) {
      // general tree: simple tidy layout (leaves get consecutive slots, parents centred)
      let slot = 0;
      const placed = [];
      let maxDepth = 0;
      (function walk(node, d) {
        maxDepth = Math.max(maxDepth, d);
        const kids = node.kids || [];
        if (!kids.length) node._x = slot++;
        else { kids.forEach(k => walk(k, d + 1)); node._x = (kids[0]._x + kids[kids.length - 1]._x) / 2; }
        node._d = d;
        placed.push(node);
      })(p.root, 0);
      const cols = Math.max(slot, 1);
      const W = Math.max(100, cols * 16), H = (maxDepth + 1) * 24 + 8;
      const X = n => ((n._x + 0.5) / cols) * W, Y = n => n._d * 24 + 13;
      let lines = '', dots = '';
      for (const n of placed) {
        for (const k of n.kids || []) lines += `<line x1="${X(n)}" y1="${Y(n)}" x2="${X(k)}" y2="${Y(k)}" class="${k.c || ''}"/>`;
        dots += `<g class="vz-tn ${n.c || ''}"><circle cx="${X(n)}" cy="${Y(n)}" r="${p.small ? 5.6 : 6.4}"/><text x="${X(n)}" y="${Y(n) + 2.3}" style="font-size:${String(n.label).length > 3 ? 3.4 : 5}px">${esc(n.label)}</text></g>`;
      }
      return `<svg class="vz-tree" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin meet" style="max-width:${Math.min(100, cols * 9 + 30)}%">${lines}${dots}</svg>`;
    },
    grid(p) {
      return `<div class="vz-grid" style="grid-template-columns:repeat(${p.cells[0].length}, minmax(28px, 46px))">${p.cells.flat().map(c =>
        `<div class="vz-gc ${c.c || ''}">${esc(c.v)}</div>`).join('')}</div>`;
    },
    table(p) {
      const cls = p.cls || {};
      return `<table class="vz-table"><tr><th></th>${p.colHead.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${p.cells.map((row, r) =>
        `<tr><th>${esc(p.rowHead[r])}</th>${row.map((v, c) => `<td class="${cls[`${r},${c}`] || ''}">${v == null ? '' : esc(v)}</td>`).join('')}</tr>`).join('')}</table>`;
    },
    bars(p) {
      const span = p.max - p.min;
      const L = v => ((v - p.min) / span) * 100;
      return `<div class="vz-bars">${p.rows.map(r => `<div class="vz-brow"><span class="vz-blabel">${esc(r.label || '')}</span><div class="vz-track">${(r.items || [r]).map(it =>
        `<div class="vz-iv ${it.c || ''}" style="left:${L(it.l)}%;width:${Math.max(1.5, L(it.r) - L(it.l))}%">${esc(it.t || `${it.l}–${it.r}`)}</div>`).join('')}</div></div>`).join('')}
        <div class="vz-brow"><span class="vz-blabel"></span><div class="vz-axis">${Array.from({ length: 5 }, (_, k) => `<span>${Math.round(p.min + (span * k) / 4)}</span>`).join('')}</div></div></div>`;
    },
    graph(p) {
      const pos = Object.fromEntries(p.nodes.map(n => [n.id, n]));
      const lines = p.edges.map(e => {
        const a = pos[e.u], b = pos[e.v];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        let x2 = b.x, y2 = b.y;
        if (p.directed) { const d = Math.hypot(b.x - a.x, b.y - a.y) || 1; x2 = b.x - ((b.x - a.x) / d) * 7.5; y2 = b.y - ((b.y - a.y) / d) * 7.5; }
        return `<g class="vz-edge ${e.c || ''}"><line x1="${a.x}" y1="${a.y}" x2="${x2}" y2="${y2}" ${p.directed ? 'marker-end="url(#vzarrow)"' : ''}/>${e.w == null ? '' :
          `<rect x="${mx - 3.4}" y="${my - 3.2}" width="6.8" height="6" rx="1.5"/><text x="${mx}" y="${my + 1.6}">${e.w}</text>`}</g>`;
      }).join('');
      const nodes = p.nodes.map(n => `<g class="vz-tn ${n.c || ''}"><circle cx="${n.x}" cy="${n.y}" r="6"/><text x="${n.x}" y="${n.y + 2.2}">${esc(n.id)}</text>
        <text class="vz-sub" x="${n.x}" y="${n.y + 12}">${esc(n.sub ?? '')}</text></g>`).join('');
      return `<svg class="vz-graph" viewBox="0 0 100 68" preserveAspectRatio="xMidYMid meet"><defs><marker id="vzarrow" viewBox="0 0 6 6" refX="5" refY="3" markerUnits="userSpaceOnUse" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L6 3L0 6z" class="vz-arrowhead"/></marker></defs>${lines}${nodes}</svg>`;
    },
    bits(p) {
      return `<div class="vz-bits">${p.rows.map(r => `<div class="vz-bitrow ${r.c || ''}"><span class="vz-blabel">${esc(r.label)}</span>${r.val.toString(2).padStart(p.width, '0').split('').map(b =>
        `<span class="vz-bit b${b}">${b}</span>`).join('')}<span class="vz-dec">= ${r.val}</span></div>`).join('')}</div>`;
    },
  };

  /* ---------- walkthroughs ---------- */

  const W = {};

  W['Arrays & Hashing'] = {
    title: 'Two Sum with a hash map', input: 'nums = [3, 8, 4, 6, 5], target = 10',
    run() {
      const nums = [3, 8, 4, 6, 5], target = 10, F = frames(), seen = new Map();
      const snap = (note, cls, hl) => F.push({ note, panes: [
        { t: 'array', label: 'nums', vals: nums, cls, ptr: cls.ptr },
        { t: 'map', label: 'seen (value → index)', entries: [...seen], hl },
      ] });
      snap('Walk the array once. For each x, ask: have I already seen target − x?', {});
      for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        const cls = { [i]: 'cur', ptr: { i } };
        if (seen.has(need)) {
          snap(`x = ${nums[i]}, need ${need} — it’s in the map at index ${seen.get(need)}. Answer [${seen.get(need)}, ${i}].`, { ...cls, [i]: 'ok', [seen.get(need)]: 'ok' }, need);
          break;
        }
        snap(`x = ${nums[i]}, need ${need} — not seen yet.`, cls);
        seen.set(nums[i], i);
        snap(`Store ${nums[i]} → ${i} (after the lookup, so an element never pairs with itself).`, cls, nums[i]);
      }
      return F;
    },
  };

  W['Two Pointers'] = {
    title: 'Pair sum on a sorted array', input: 'nums = [1, 3, 4, 6, 8, 11], target = 10',
    run() {
      const a = [1, 3, 4, 6, 8, 11], t = 10, F = frames();
      let l = 0, r = a.length - 1;
      const dim = () => Object.fromEntries(a.map((_, i) => [i, i < l || i > r ? 'dim' : '']));
      F.push({ note: 'Start at both ends. Every move will rule out one value for good.', panes: [{ t: 'array', vals: a, ptr: { l, r }, cls: dim() }] });
      while (l < r) {
        const s = a[l] + a[r];
        if (s === t) { F.push({ note: `${a[l]} + ${a[r]} = ${s} = target. Found it.`, panes: [{ t: 'array', vals: a, ptr: { l, r }, cls: { ...dim(), [l]: 'ok', [r]: 'ok' } }] }); break; }
        const moveL = s < t;
        F.push({ note: `${a[l]} + ${a[r]} = ${s} ${moveL ? '<' : '>'} ${t} → ${moveL ? `too small: ${a[l]} can’t pair with anything left, so l++` : `too big: ${a[r]} can’t pair with anything left, so r−−`}.`,
          panes: [{ t: 'array', vals: a, ptr: { l, r }, cls: { ...dim(), [moveL ? l : r]: 'bad' } }] });
        if (moveL) l++; else r--;
      }
      return F;
    },
  };

  W['Sliding Window'] = {
    title: 'Longest substring without repeats', input: 's = "pwwkew"',
    run() {
      const s = 'pwwkew'.split(''), F = frames(), last = {};
      let l = 0, best = 0, bestR = [0, -1];
      const pane = (r, cls = {}, hl) => [
        { t: 'array', vals: s, range: [l, r], ptr: { l, r }, cls },
        { t: 'map', label: 'last index seen', entries: Object.entries(last), hl },
        { t: 'vars', vals: { window: `"${s.slice(l, r + 1).join('')}"`, best }, hl: ['best'] },
      ];
      F.push({ note: 'Grow the window on the right; when a character repeats inside it, move l past the earlier copy.', panes: pane(-1) });
      for (let r = 0; r < s.length; r++) {
        const c = s[r];
        if (c in last && last[c] >= l) {
          F.push({ note: `'${c}' is already in the window (at ${last[c]}). Shrink: l jumps to ${last[c] + 1}.`, panes: pane(r, { [r]: 'bad', [last[c]]: 'bad' }, c) });
          l = last[c] + 1;
        }
        last[c] = r;
        if (r - l + 1 > best) { best = r - l + 1; bestR = [l, r]; }
        F.push({ note: `Window "${s.slice(l, r + 1).join('')}" is valid, length ${r - l + 1}. best = ${best}.`, panes: pane(r, { [r]: 'cur' }, c) });
      }
      F.push({ note: `Done: the longest window was "${s.slice(bestR[0], bestR[1] + 1).join('')}" (length ${best}). Each index entered and left once → O(n).`, panes: pane(s.length - 1) });
      return F;
    },
  };

  W.Stack = {
    title: 'Daily Temperatures with a monotonic stack', input: 'temps = [73, 74, 75, 71, 69, 72, 76, 73]',
    run() {
      const t = [73, 74, 75, 71, 69, 72, 76, 73], ans = t.map(() => 0), st = [], F = frames();
      const pane = (i, cls) => [
        { t: 'array', label: 'temps', vals: t, ptr: { i }, cls },
        { t: 'stack', label: 'stack (days still waiting, temps decreasing)', vals: st.map(j => `${j}:${t[j]}`) },
        { t: 'array', label: 'answer', vals: ans, idx: false },
      ];
      F.push({ note: 'Each day waits on the stack until a warmer day arrives.', panes: pane(null, {}) });
      for (let i = 0; i < t.length; i++) {
        while (st.length && t[st[st.length - 1]] < t[i]) {
          const j = st.pop();
          ans[j] = i - j;
          F.push({ note: `${t[i]} is warmer than day ${j} (${t[j]}) → pop it: answer[${j}] = ${i} − ${j} = ${ans[j]}.`, panes: pane(i, { [i]: 'cur', [j]: 'ok' }) });
        }
        st.push(i);
        F.push({ note: `Push day ${i} (${t[i]}); it waits for something warmer.`, panes: pane(i, { [i]: 'cur' }) });
      }
      F.push({ note: 'Days left on the stack never got warmer → 0. Each day pushed and popped once → O(n).', panes: pane(null, {}) });
      return F;
    },
  };

  W['Binary Search'] = {
    title: 'Binary search', input: 'nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23',
    run() {
      const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], t = 23, F = frames();
      let lo = 0, hi = a.length - 1, checks = 0;
      const cls = (mid, extra = {}) => ({ ...Object.fromEntries(a.map((_, i) => [i, i < lo || i > hi ? 'dim' : ''])), ...(mid != null ? { [mid]: 'cur' } : {}), ...extra });
      F.push({ note: 'The answer is somewhere in [lo, hi]. Check the middle; throw away the half that can’t contain it.', panes: [{ t: 'array', vals: a, ptr: { lo, hi }, cls: cls(null) }] });
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        checks++;
        if (a[mid] === t) { F.push({ note: `a[${mid}] = ${a[mid]} = target → found at index ${mid} after ${checks} checks (a linear scan would need ${mid + 1}; log₂ 10 ≈ 3.3).`, panes: [{ t: 'array', vals: a, ptr: { lo, mid, hi }, cls: cls(mid, { [mid]: 'ok' }) }] }); break; }
        const right = a[mid] < t;
        F.push({ note: `a[${mid}] = ${a[mid]} ${right ? '<' : '>'} ${t} → the target must be ${right ? 'right' : 'left'} of mid. ${right ? 'lo = mid + 1' : 'hi = mid − 1'}.`, panes: [{ t: 'array', vals: a, ptr: { lo, mid, hi }, cls: cls(mid) }] });
        if (right) lo = mid + 1; else hi = mid - 1;
      }
      return F;
    },
  };

  W['Linked List'] = {
    title: 'Reverse a linked list', input: 'head = 1 → 2 → 3 → 4',
    run() {
      const vals = [1, 2, 3, 4], next = [1, 2, 3, null], F = frames();
      let prev = null, cur = 0;
      const pane = (nxt, note) => F.push({ note, panes: [
        { t: 'list', vals, next: [...next], ptr: Object.fromEntries([['prev', prev], ['cur', cur], ['nxt', nxt]].filter(([, v]) => v != null)),
          nullPtr: [['prev', prev], ['cur', cur], ['nxt', nxt]].filter(([, v]) => v === null).map(([k]) => k), cls: cur != null ? { [cur]: 'cur' } : {} },
      ] });
      pane(undefined, 'prev = null, cur = head. We’ll flip one arrow per step.');
      while (cur != null) {
        const nxt = next[cur];
        pane(nxt, `Save nxt = ${nxt == null ? 'null' : vals[nxt]} before we lose it.`);
        next[cur] = prev;
        pane(nxt, `Point ${vals[cur]}.next back to ${prev == null ? 'null' : vals[prev]}.`);
        prev = cur; cur = nxt;
        pane(undefined, `Advance: prev = ${vals[prev]}, cur = ${cur == null ? 'null' : vals[cur]}.`);
      }
      pane(undefined, `cur is null → prev (${vals[prev]}) is the new head: 4 → 3 → 2 → 1.`);
      return F;
    },
  };

  W.Trees = {
    title: 'Level-order traversal (BFS)', input: 'root = [3, 9, 20, null, null, 15, 7]',
    run() {
      const arr = [3, 9, 20, null, null, 15, 7], F = frames(), cls = {}, levels = [];
      let q = [0];
      cls[0] = 'queued';
      F.push({ note: 'Put the root in the queue. Each round processes exactly one level.', panes: [{ t: 'tree', arr, cls: { ...cls } }, { t: 'queue', vals: q.map(i => arr[i]) }, { t: 'vars', vals: { levels: '[]' } }] });
      while (q.length) {
        const size = q.length, level = [], nextQ = [];
        for (let k = 0; k < size; k++) {
          const i = q.shift();
          level.push(arr[i]);
          cls[i] = 'cur';
          for (const c of [2 * i + 1, 2 * i + 2]) if (c < arr.length && arr[c] != null) { nextQ.push(c); cls[c] = 'queued'; }
          F.push({ note: `Pop ${arr[i]} (level ${levels.length}); enqueue its children.`, panes: [{ t: 'tree', arr, cls: { ...cls } }, { t: 'queue', vals: [...q, ...nextQ].map(j => arr[j]) }, { t: 'vars', vals: { level: `[${level}]`, levels: JSON.stringify(levels) } }] });
          cls[i] = 'done';
        }
        levels.push(level);
        q = nextQ;
        F.push({ note: `Level finished: [${level}].`, panes: [{ t: 'tree', arr, cls: { ...cls } }, { t: 'queue', vals: q.map(j => arr[j]) }, { t: 'vars', vals: { levels: JSON.stringify(levels) }, hl: ['levels'] }] });
      }
      return F;
    },
  };

  W.Tries = {
    title: 'Building a trie and searching it', input: 'insert "cat", "car", "dog"; search "ca", "cow"',
    run() {
      const root = { label: '•', kids: [] }, F = frames();
      const reset = n => { n.c = n.end ? 'end' : ''; n.kids.forEach(reset); };
      const shot = note => F.push({ note, panes: [{ t: 'gtree', root: clone(root) }] });
      shot('An empty trie: just the root.');
      for (const w of ['cat', 'car', 'dog']) {
        let node = root;
        reset(root);
        for (const ch of w) {
          let k = node.kids.find(x => x.label === ch);
          const made = !k;
          if (!k) { k = { label: ch, kids: [] }; node.kids.push(k); }
          node = k; node.c = made ? 'new' : 'cur';
          shot(`insert "${w}": ${made ? `create '${ch}'` : `'${ch}' already exists — shared prefix`}.`);
        }
        node.end = true; node.c = 'end';
        shot(`Mark the end of "${w}".`);
      }
      for (const [w, prefix] of [['ca', true], ['cow', false]]) {
        reset(root);
        let node = root, ok = true;
        for (const ch of w) {
          const k = node.kids.find(x => x.label === ch);
          if (!k) { ok = false; shot(`search "${w}": no '${ch}' under '${node.label}' → not found.`); break; }
          node = k; node.c = 'cur';
          shot(`search "${w}": follow '${ch}'.`);
        }
        if (ok) shot(`"${w}" walks fine → startsWith("${w}") is true, but search("${w}") is false: no end mark here.`);
        void prefix;
      }
      return F;
    },
  };

  W['Heap / Priority Queue'] = {
    title: 'Kth largest in a stream (k = 3) with a min-heap', input: 'stream = 5, 1, 8, 3, 9, 2',
    run() {
      const h = [], k = 3, F = frames();
      const up = i => { while (i > 0) { const p = (i - 1) >> 1; if (h[p] <= h[i]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } };
      const down = i => { for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l] < h[m]) m = l; if (r < h.length && h[r] < h[m]) m = r; if (m === i) return; [h[m], h[i]] = [h[i], h[m]]; i = m; } };
      const shot = (note, cls = {}) => F.push({ note, panes: [{ t: 'tree', arr: [...h], cls }, { t: 'array', label: 'heap array', vals: [...h], cls }, { t: 'vars', vals: { [`${k}rd largest`]: h.length >= k ? h[0] : '—' }, hl: [`${k}rd largest`] }] });
      shot('Keep only the 3 largest values in a MIN-heap. Its top is the 3rd largest.');
      for (const x of [5, 1, 8, 3, 9, 2]) {
        h.push(x); up(h.length - 1);
        shot(`push ${x} (sifts up to keep parent ≤ children).`, { [h.indexOf(x)]: 'cur' });
        if (h.length > k) {
          const gone = h[0];
          h[0] = h.pop(); down(0);
          shot(`size > 3 → pop the smallest (${gone}); it can’t be in the top 3.`, { 0: 'ok' });
        }
      }
      shot(`Answer after the stream: ${h[0]} (top of the heap). Each add is O(log k).`, { 0: 'ok' });
      return F;
    },
  };

  W.Backtracking = {
    title: 'Subsets: choose → explore → un-choose', input: 'nums = [1, 2, 3]',
    run() {
      const nums = [1, 2, 3], F = frames(), res = [], path = [];
      const root = { label: '[]', kids: [] };
      let curNode = root;
      const all = [];
      const mark = () => { for (const n of all) n.c = n === curNode ? 'cur' : n.seen ? 'done' : ''; };
      all.push(root);
      const shot = note => { mark(); F.push({ note, panes: [{ t: 'gtree', root: clone(root), small: true }, { t: 'vars', vals: { path: `[${path}]` }, hl: ['path'] }, { t: 'map', label: `results (${res.length})`, entries: res.map(r => [`[${r}]`]) }] }); };
      (function bt(start, node) {
        curNode = node; node.seen = true;
        res.push([...path]);
        shot(`Record a copy of path [${path}].`);
        for (let i = start; i < nums.length; i++) {
          path.push(nums[i]);
          const kid = { label: `[${path}]`, kids: [] };
          node.kids.push(kid); all.push(kid);
          curNode = kid;
          shot(`Choose ${nums[i]} → path [${path}], then explore deeper.`);
          bt(i + 1, kid);
          path.pop();
          curNode = node;
          shot(`Un-choose ${nums[i]} → back to [${path}].`);
        }
      })(0, root);
      shot('All 2³ = 8 subsets recorded. Every node of the tree is one subset.');
      return F;
    },
  };

  W.Graphs = {
    title: 'Rotting oranges: multi-source BFS', input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]',
    run() {
      const g = [[2, 1, 1], [1, 1, 0], [0, 1, 1]], F = frames();
      let fresh = 0, q = [], minute = 0;
      g.forEach((row, r) => row.forEach((v, c) => { if (v === 2) q.push([r, c]); if (v === 1) fresh++; }));
      const shot = (note, newly = []) => F.push({ note, panes: [{ t: 'grid', cells: g.map((row, r) => row.map((v, c) => ({
        v: v === 2 ? '🤢' : v === 1 ? '🍊' : '', c: `${v === 0 ? 'empty' : v === 2 ? 'rot' : 'fresh'} ${newly.some(([a, b]) => a === r && b === c) ? 'new' : ''}` }))) },
        { t: 'vars', vals: { minute, fresh, queue: q.length }, hl: ['minute'] }] });
      shot('Start the BFS from EVERY rotten orange at once (multi-source). One BFS level = one minute.');
      while (q.length && fresh) {
        const next = [];
        for (const [r, c] of q) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nc >= 0 && nr < 3 && nc < 3 && g[nr][nc] === 1) { g[nr][nc] = 2; fresh--; next.push([nr, nc]); }
        }
        minute++;
        q = next;
        shot(`Minute ${minute}: ${next.length} orange${next.length === 1 ? '' : 's'} rot.`, next);
      }
      shot(fresh ? `${fresh} fresh orange(s) can never be reached → −1.` : `No fresh oranges left → answer ${minute} minutes.`);
      return F;
    },
  };

  W['Advanced Graphs'] = {
    title: 'Dijkstra’s shortest paths', input: 'edges: A–B 4, A–C 1, C–B 2, B–D 1, C–D 5, D–E 3 (from A)',
    run() {
      const N = { A: [10, 31], B: [42, 10], C: [42, 52], D: [72, 31], E: [92, 31] };
      const E = [['A', 'B', 4], ['A', 'C', 1], ['C', 'B', 2], ['B', 'D', 1], ['C', 'D', 5], ['D', 'E', 3]];
      const adj = {};
      for (const [u, v, w] of E) { (adj[u] ||= []).push([v, w]); (adj[v] ||= []).push([u, w]); }
      const dist = { A: 0 }, done = new Set(), F = frames();
      let heap = [[0, 'A']];
      const shot = (note, cur, edge) => F.push({ note, panes: [
        { t: 'graph', nodes: Object.entries(N).map(([id, [x, y]]) => ({ id, x, y, sub: id in dist ? dist[id] : '∞', c: id === cur ? 'cur' : done.has(id) ? 'done' : id in dist ? 'queued' : '' })),
          edges: E.map(([u, v, w]) => ({ u, v, w, c: edge && ((edge[0] === u && edge[1] === v) || (edge[0] === v && edge[1] === u)) ? 'hl' : '' })) },
        { t: 'map', label: 'heap (distance, node) — smallest first', entries: [...heap].sort((a, b) => a[0] - b[0]).map(([d, n]) => [`${n}`, d]) },
      ] });
      shot('dist(A) = 0, everything else ∞. Always expand the closest unfinished node.');
      while (heap.length) {
        heap.sort((a, b) => a[0] - b[0]);
        const [d, u] = heap.shift();
        if (done.has(u)) { shot(`Pop (${u}, ${d}) — stale, ${u} is already final. Skip.`); continue; }
        done.add(u);
        shot(`Pop ${u} at distance ${d}: nothing can beat it now, so it’s final.`, u);
        for (const [v, w] of adj[u]) {
          if (done.has(v)) continue;
          const nd = d + w;
          if (!(v in dist) || nd < dist[v]) {
            const old = v in dist ? dist[v] : '∞';
            dist[v] = nd; heap.push([nd, v]);
            shot(`Relax ${u}→${v}: ${d} + ${w} = ${nd} < ${old} → dist(${v}) = ${nd}.`, u, [u, v]);
          } else shot(`${u}→${v}: ${d} + ${w} = ${nd} isn’t better than ${dist[v]}.`, u, [u, v]);
        }
      }
      shot(`Done: A 0, C 1, B 3, D 4, E 7. Note B: the direct edge costs 4, but A→C→B costs 3.`);
      return F;
    },
  };

  W['1-D DP'] = {
    title: 'House Robber, filled left to right', input: 'nums = [2, 7, 9, 3, 1]',
    run() {
      const a = [2, 7, 9, 3, 1], dp = a.map(() => null), F = frames();
      const shot = (note, cls = {}) => F.push({ note, panes: [{ t: 'array', label: 'nums', vals: a, cls }, { t: 'array', label: 'dp[i] = best money from houses 0..i', vals: dp.map(v => v ?? ''), cls }] });
      shot('State: dp[i] = the most you can rob from the first i + 1 houses. Last choice: rob house i or skip it.');
      for (let i = 0; i < a.length; i++) {
        const skip = i >= 1 ? dp[i - 1] : 0, take = (i >= 2 ? dp[i - 2] : 0) + a[i];
        dp[i] = Math.max(skip, take);
        shot(`dp[${i}] = max(skip ${skip}, rob ${i >= 2 ? dp[i - 2] : 0} + ${a[i]} = ${take}) = ${dp[i]}.`, { [i]: 'cur', ...(i >= 1 ? { [i - 1]: 'dep' } : {}), ...(i >= 2 ? { [i - 2]: 'dep' } : {}) });
      }
      shot(`Answer dp[${a.length - 1}] = ${dp[a.length - 1]} (rob 2 + 9 + 1). Only the last two values are ever needed → O(1) space.`, { [a.length - 1]: 'ok' });
      return F;
    },
  };

  W['2-D DP'] = {
    title: 'Longest Common Subsequence table', input: 'text1 = "abcde", text2 = "ace"',
    run() {
      const a = 'abcde', b = 'ace', F = frames();
      const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(null));
      for (let i = 0; i <= a.length; i++) dp[i][0] = 0;
      for (let j = 0; j <= b.length; j++) dp[0][j] = 0;
      const shot = (note, cls = {}) => F.push({ note, panes: [{ t: 'table', rowHead: ['∅', ...a], colHead: ['∅', ...b], cells: dp.map(r => [...r]), cls }] });
      shot('dp[i][j] = LCS of the first i letters of text1 and first j letters of text2. Row/column 0 are empty prefixes → 0.');
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          shot(`'${a[i - 1]}' = '${b[j - 1]}' → diagonal + 1 = ${dp[i][j]}.`, { [`${i},${j}`]: 'cur', [`${i - 1},${j - 1}`]: 'dep' });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          shot(`'${a[i - 1]}' ≠ '${b[j - 1]}' → max(up ${dp[i - 1][j]}, left ${dp[i][j - 1]}) = ${dp[i][j]}.`, { [`${i},${j}`]: 'cur', [`${i - 1},${j}`]: 'dep', [`${i},${j - 1}`]: 'dep' });
        }
      }
      shot(`Answer in the corner: ${dp[a.length][b.length]} ("ace").`, { [`${a.length},${b.length}`]: 'ok' });
      return F;
    },
  };

  W.Greedy = {
    title: 'Kadane’s maximum subarray', input: 'nums = [−2, 1, −3, 4, −1, 2, 1, −5, 4]',
    run() {
      const a = [-2, 1, -3, 4, -1, 2, 1, -5, 4], F = frames();
      let cur = a[0], best = a[0], s = 0, bs = 0, be = 0;
      const shot = (note, i, extra = {}) => F.push({ note, panes: [{ t: 'array', vals: a, range: [s, i], ptr: { i }, cls: { ...Object.fromEntries(a.map((_, k) => [k, k >= bs && k <= be ? 'best' : ''])), [i]: 'cur', ...extra } }, { t: 'vars', vals: { cur, best }, hl: ['best'] }] });
      shot('cur = best sum ending here. Start with the first element.', 0);
      for (let i = 1; i < a.length; i++) {
        if (cur + a[i] < a[i]) { cur = a[i]; s = i; shot(`cur + ${a[i]} < ${a[i]} → the old run only hurts. Restart at ${a[i]}.`, i, { [i]: 'bad' }); }
        else { cur += a[i]; shot(`Extend the run: cur = ${cur}.`, i); }
        if (cur > best) { best = cur; bs = s; be = i; shot(`New best ${best}: [${a.slice(bs, be + 1).join(', ')}].`, i); }
      }
      shot(`Answer ${best}. One pass, O(1) space.`, a.length - 1);
      return F;
    },
  };

  W.Intervals = {
    title: 'Merge overlapping intervals', input: '[[8,10], [1,3], [15,18], [2,6]]',
    run() {
      const input = [[8, 10], [1, 3], [15, 18], [2, 6]], F = frames();
      const sorted = [...input].sort((x, y) => x[0] - y[0]);
      const merged = [];
      const shot = (note, cur) => F.push({ note, panes: [{ t: 'bars', min: 0, max: 20, rows: [
        ...(cur === -1 ? input : sorted).map(([l, r], k) => ({ label: k === 0 ? (cur === -1 ? 'input' : 'sorted') : '', items: [{ l, r, c: k === cur ? 'cur' : cur != null && cur !== -1 && k < cur ? 'done' : '' }] })),
        { label: 'merged', items: merged.map(([l, r]) => ({ l, r, c: 'ok' })) },
      ] }] });
      shot('Unsorted, any interval might overlap any other.', -1);
      shot('Sort by start: now an interval can only overlap the LAST merged one.', null);
      sorted.forEach(([l, r], k) => {
        const last = merged[merged.length - 1];
        if (last && l <= last[1]) { last[1] = Math.max(last[1], r); shot(`[${l}, ${r}] starts at or before the last merged end → overlap: extend it to [${last[0]}, ${last[1]}].`, k); }
        else { merged.push([l, r]); shot(`[${l}, ${r}] starts after the last merged end → new interval.`, k); }
      });
      shot(`Result: ${JSON.stringify(merged)}. Sorting dominates: O(n log n).`, null);
      return F;
    },
  };

  W['Math & Geometry'] = {
    title: 'Spiral order with four boundaries', input: '3 × 4 matrix of 1..12',
    run() {
      const R = 3, C = 4, m = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => r * C + c + 1)), F = frames(), order = [];
      let top = 0, bottom = R - 1, left = 0, right = C - 1;
      const seen = new Set();
      const shot = (note, cur) => F.push({ note, panes: [{ t: 'grid', cells: m.map((row, r) => row.map((v, c) => ({ v, c: cur && cur[0] === r && cur[1] === c ? 'cur' : seen.has(r * C + c) ? 'visited' : (r < top || r > bottom || c < left || c > right) ? 'empty' : '' }))) },
        { t: 'vars', vals: { top, bottom, left, right } }, { t: 'map', label: 'output', entries: [[order.join(', ') || '—']] }] });
      const visit = (r, c, dir) => { order.push(m[r][c]); seen.add(r * C + c); shot(`${dir}: take ${m[r][c]}.`, [r, c]); };
      shot('Walk right, down, left, up — shrinking a boundary after each side.');
      while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c++) visit(top, c, 'top row →');
        top++;
        for (let r = top; r <= bottom; r++) visit(r, right, 'right column ↓');
        right--;
        if (top <= bottom) { for (let c = right; c >= left; c--) visit(bottom, c, 'bottom row ←'); bottom--; }
        if (left <= right) { for (let r = bottom; r >= top; r--) visit(r, left, 'left column ↑'); left++; }
      }
      shot('Boundaries crossed → done. The “if” checks stop double-counting a single remaining row or column.');
      return F;
    },
  };

  W['Bit Manipulation'] = {
    title: 'Single Number: XOR cancels pairs', input: 'nums = [4, 1, 2, 1, 2]',
    run() {
      const a = [4, 1, 2, 1, 2], F = frames(), rows = [];
      let res = 0;
      F.push({ note: 'x ^ x = 0 and x ^ 0 = x, in any order. XOR everything; pairs vanish.', panes: [{ t: 'bits', width: 3, rows: [{ label: 'res', val: 0, c: 'res' }] }] });
      for (const x of a) {
        const before = res;
        res ^= x;
        rows.push({ label: `^ ${x}`, val: x });
        F.push({ note: `${before} ^ ${x} = ${res} — bits that are 1 in exactly one of them stay 1.`, panes: [{ t: 'bits', width: 3, rows: [...rows.slice(-1).map(r => ({ ...r })), { label: 'res', val: res, c: 'res' }] }, { t: 'array', vals: a, cls: Object.fromEntries(a.map((_, k) => [k, k < rows.length ? 'done' : ''])) }] });
      }
      F.push({ note: `Every pair cancelled; ${res} is left — the single number.`, panes: [{ t: 'bits', width: 3, rows: [{ label: 'res', val: res, c: 'res ok' }] }] });
      return F;
    },
  };

  /* ---------- walkthroughs for individual problems (keyed by the sheet's #) ---------- */

  const P = {};

  P[17] = {
    title: 'Trapping Rain Water — two pointers', input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
    run() {
      const h = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], water = h.map(() => 0), F = frames();
      let l = 0, r = h.length - 1, lm = 0, rm = 0, total = 0;
      const shot = (note, cur) => F.push({ note, panes: [
        { t: 'array', label: 'height (bars)', vals: h, bars: true, ptr: { l, r }, cls: cur != null ? { [cur]: 'cur' } : {} },
        { t: 'array', label: 'water on top of each bar', vals: water, cls: Object.fromEntries(water.map((w, i) => [i, w ? 'win' : ''])), idx: false },
        { t: 'vars', vals: { leftMax: lm, rightMax: rm, total }, hl: ['total'] },
      ] });
      shot('Water above a bar = min(tallest on its left, tallest on its right) − its height. Two pointers find that without extra arrays.');
      while (l < r) {
        if (h[l] < h[r]) {
          lm = Math.max(lm, h[l]); water[l] = lm - h[l]; total += water[l];
          shot(`h[l] = ${h[l]} < h[r] = ${h[r]}: the right side is guaranteed at least as tall, so the LEFT max decides. water[${l}] = ${lm} − ${h[l]} = ${water[l]}.`, l);
          l++;
        } else {
          rm = Math.max(rm, h[r]); water[r] = rm - h[r]; total += water[r];
          shot(`h[r] = ${h[r]} ≤ h[l] = ${h[l]}: the RIGHT max decides. water[${r}] = ${rm} − ${h[r]} = ${water[r]}.`, r);
          r--;
        }
      }
      shot(`Pointers met. Total trapped = ${total}. O(n) time, O(1) extra space.`);
      return F;
    },
  };

  P[32] = {
    title: 'Largest Rectangle — increasing stack', input: 'heights = [2, 1, 5, 6, 2, 3]',
    run() {
      const h = [2, 1, 5, 6, 2, 3], st = [], F = frames();
      let best = 0;
      const shot = (note, i, extra = {}) => F.push({ note, panes: [
        { t: 'array', vals: h, bars: true, ptr: i != null && i < h.length ? { i } : {}, cls: { ...(i != null ? { [i]: 'cur' } : {}), ...extra } },
        { t: 'stack', label: 'stack of (start, height) — heights increasing', vals: st.map(([a, b]) => `${a}:${b}`) },
        { t: 'vars', vals: { best }, hl: ['best'] },
      ] });
      shot('Each bar waits on the stack until a shorter bar ends its rectangle.');
      for (let i = 0; i < h.length; i++) {
        let start = i;
        while (st.length && st[st.length - 1][1] > h[i]) {
          const [idx, ht] = st.pop();
          const area = ht * (i - idx);
          best = Math.max(best, area);
          const span = Object.fromEntries(Array.from({ length: i - idx }, (_, k) => [idx + k, 'win']));
          shot(`${h[i]} is shorter than ${ht} → pop. Height ${ht} spanned from ${idx} to ${i - 1}: area ${ht} × ${i - idx} = ${area}.`, i, span);
          start = idx;
        }
        st.push([start, h[i]]);
        shot(`Push (${start}, ${h[i]}) — it extends back to index ${start}.`, i);
      }
      for (const [idx, ht] of st) {
        const area = ht * (h.length - idx);
        best = Math.max(best, area);
        shot(`Flush: (${idx}, ${ht}) reaches the end → area ${ht} × ${h.length - idx} = ${area}.`, null, Object.fromEntries(Array.from({ length: h.length - idx }, (_, k) => [idx + k, 'win'])));
      }
      shot(`Largest rectangle = ${best}.`);
      return F;
    },
  };

  P[24] = {
    title: 'Minimum Window Substring', input: 's = "ADOBECODEBANC", t = "ABC"',
    run() {
      const s = 'ADOBECODEBANC'.split(''), need = { A: 1, B: 1, C: 1 }, win = {}, F = frames();
      let have = 0, l = 0, best = '';
      const shot = (note, r, cls = {}) => F.push({ note, panes: [
        { t: 'array', vals: s, range: r >= l ? [l, r] : null, ptr: { l, r }, cls },
        { t: 'vars', vals: { have: `${have}/3`, best: best ? `"${best}"` : '—' }, hl: ['best'] },
      ] });
      shot('Grow r until the window holds A, B and C; then shrink l while it still does, recording the shortest.', -1);
      for (let r = 0; r < s.length; r++) {
        const c = s[r];
        win[c] = (win[c] || 0) + 1;
        if (need[c] && win[c] === need[c]) { have++; shot(`'${c}' now satisfied → have ${have}/3.`, r, { [r]: 'cur' }); }
        while (have === 3) {
          const cand = s.slice(l, r + 1).join('');
          if (!best || cand.length < best.length) { best = cand; shot(`Window "${cand}" contains everything → new best (${cand.length}).`, r, { [r]: 'ok' }); }
          const d = s[l];
          win[d]--;
          if (need[d] && win[d] < need[d]) { have--; l++; shot(`Drop '${d}' → missing it now (have ${have}/3). Keep growing r.`, r, { [l - 1]: 'bad' }); }
          else l++;
        }
      }
      shot(`Answer: "${best}".`, s.length - 1);
      return F;
    },
  };

  P[23] = {
    title: 'Sliding Window Maximum — monotonic deque', input: 'nums = [1, 3, −1, −3, 5, 3, 6, 7], k = 3',
    run() {
      const a = [1, 3, -1, -3, 5, 3, 6, 7], k = 3, q = [], out = [], F = frames();
      const shot = (note, r) => F.push({ note, panes: [
        { t: 'array', vals: a, range: [Math.max(0, r - k + 1), r], ptr: { r }, cls: Object.fromEntries(q.map((i, j) => [i, j === 0 ? 'ok' : 'dep'])) },
        { t: 'queue', label: 'deque of indices (values decreasing) — front is the max', vals: q.map(i => `${i}:${a[i]}`) },
        { t: 'array', label: 'output', vals: out.length ? out : ['—'], idx: false },
      ] });
      for (let r = 0; r < a.length; r++) {
        const popped = [];
        while (q.length && a[q[q.length - 1]] < a[r]) popped.push(a[q.pop()]);
        q.push(r);
        let note = popped.length ? `${a[r]} arrives: ${popped.join(', ')} can never be a max again → pop from the back.` : `Push ${a[r]}.`;
        if (q[0] <= r - k) { note += ` Index ${q[0]} left the window → drop from the front.`; q.shift(); }
        if (r >= k - 1) { out.push(a[q[0]]); note += ` Window max = ${a[q[0]]}.`; }
        shot(note, r);
      }
      return F;
    },
  };

  P[96] = {
    title: 'Course Schedule — Kahn’s topological sort', input: 'numCourses = 5, prerequisites = [[1,0],[2,0],[3,1],[3,2],[4,3]]',
    run() {
      const pos = { 0: [12, 32], 1: [36, 12], 2: [36, 52], 3: [62, 32], 4: [88, 32] };
      const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
      const indeg = [0, 1, 1, 2, 1], F = frames(), order = [], taken = new Set();
      let q = [0];
      const shot = (note, cur, hl) => F.push({ note, panes: [
        { t: 'graph', directed: true, nodes: Object.entries(pos).map(([id, [x, y]]) => ({ id, x, y, sub: `in ${indeg[id]}`, c: Number(id) === cur ? 'cur' : taken.has(Number(id)) ? 'done' : q.includes(Number(id)) ? 'queued' : '' })),
          edges: edges.map(([u, v]) => ({ u: String(u), v: String(v), c: hl && hl[0] === u && hl[1] === v ? 'hl' : taken.has(u) ? 'gone' : '' })) },
        { t: 'queue', label: 'ready (indegree 0)', vals: [...q] },
        { t: 'array', label: 'order taken', vals: order.length ? order : ['—'], idx: false },
      ] });
      shot('An edge u → v means “take u before v”. indegree = prerequisites still missing. Start with every course that has none.');
      while (q.length) {
        const u = q.shift();
        order.push(u); taken.add(u);
        shot(`Take course ${u}.`, u);
        for (const [a, v] of edges) if (a === u) {
          indeg[v]--;
          if (indeg[v] === 0) q.push(v);
          shot(`Course ${v} loses a prerequisite → indegree ${indeg[v]}${indeg[v] === 0 ? ' → ready' : ''}.`, u, [u, v]);
        }
      }
      shot(order.length === 5 ? `All 5 courses taken (${order.join(' → ')}) → no cycle → true.` : 'Some courses never became ready → cycle → false.');
      return F;
    },
  };

  P[98] = {
    title: 'Redundant Connection — Union-Find', input: 'edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]',
    run() {
      const edges = [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]], parent = [0, 1, 2, 3, 4, 5], F = frames();
      const pos = { 1: [14, 34], 2: [40, 12], 3: [70, 14], 4: [56, 52], 5: [88, 46] };
      const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
      const used = [];
      const shot = (note, cur, bad) => F.push({ note, panes: [
        { t: 'graph', nodes: Object.entries(pos).map(([id, [x, y]]) => ({ id, x, y, sub: `root ${find(Number(id))}`, c: cur && cur.includes(Number(id)) ? (bad ? 'bad' : 'cur') : '' })),
          edges: used.map(([u, v]) => ({ u: String(u), v: String(v), c: cur && cur[0] === u && cur[1] === v ? (bad ? 'bad' : 'hl') : '' })) },
        { t: 'array', label: 'parent of node 1, 2, 3, 4, 5', vals: parent.slice(1), cls: {}, idx: false },
      ] });
      shot('Every node starts as its own component (parent[x] = x).');
      for (const [a, b] of edges) {
        used.push([a, b]);
        const ra = find(a), rb = find(b);
        if (ra === rb) { shot(`Edge ${a}–${b}: both already have root ${ra} → they’re connected, so this edge closes a cycle. Answer [${a}, ${b}].`, [a, b], true); break; }
        parent[ra] = rb;
        shot(`Edge ${a}–${b}: roots ${ra} and ${rb} differ → union them (parent[${ra}] = ${rb}).`, [a, b]);
      }
      return F;
    },
  };

  P[79] = {
    title: 'Find Median — two heaps', input: 'addNum 5, 15, 1, 3, 8',
    run() {
      const low = [], high = [], F = frames();
      const med = () => (low.length > high.length ? low[0] : (low[0] + high[0]) / 2);
      const shot = note => F.push({ note, panes: [
        { t: 'array', label: 'low half — max-heap (top first)', vals: low.length ? low : ['—'], cls: { 0: low.length ? 'cur' : '' }, idx: false },
        { t: 'array', label: 'high half — min-heap (top first)', vals: high.length ? high : ['—'], cls: { 0: high.length ? 'ok' : '' }, idx: false },
        { t: 'vars', vals: { median: low.length ? med() : '—' }, hl: ['median'] },
      ] });
      shot('Keep the smaller half in a max-heap and the larger half in a min-heap; the median sits at their tops.');
      for (const x of [5, 15, 1, 3, 8]) {
        low.push(x); low.sort((a, b) => b - a);
        const moved = low.shift(); high.push(moved); high.sort((a, b) => a - b);
        let note = `add ${x}: push to low, move low’s max (${moved}) to high`;
        if (high.length > low.length) { const back = high.shift(); low.push(back); low.sort((a, b) => b - a); note += `; high is bigger → move ${back} back`; }
        shot(`${note}. Median = ${med()}.`);
      }
      return F;
    },
  };

  P[117] = {
    title: 'Coin Change — fewest coins for every amount', input: 'coins = [1, 2, 5], amount = 11',
    run() {
      const coins = [1, 2, 5], A = 11, dp = [0, ...Array(A).fill(Infinity)], F = frames();
      const show = () => dp.map(v => (v === Infinity ? '∞' : v));
      F.push({ note: 'dp[a] = fewest coins that make a. dp[0] = 0; everything else starts at ∞.', panes: [{ t: 'array', label: 'dp', vals: show(), cls: { 0: 'ok' } }] });
      for (let a = 1; a <= A; a++) {
        const tries = [];
        for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
        for (const c of coins) if (c <= a) tries.push(`dp[${a - c}]+1=${dp[a - c] + 1}`);
        F.push({ note: `dp[${a}] = min(${tries.join(', ')}) = ${dp[a]}.`, panes: [{ t: 'array', label: 'dp', vals: show(), cls: { [a]: 'cur', ...Object.fromEntries(coins.filter(c => c <= a).map(c => [a - c, 'dep'])) } }] });
      }
      F.push({ note: `Answer dp[11] = ${dp[A]} (5 + 5 + 1). Greedy happens to work here — but not for coins like [1, 3, 4] and amount 6.`, panes: [{ t: 'array', label: 'dp', vals: show(), cls: { [A]: 'ok' } }] });
      return F;
    },
  };

  P[120] = {
    title: 'Longest Increasing Subsequence — patience sorting', input: 'nums = [10, 9, 2, 5, 3, 7, 101, 18]',
    run() {
      const a = [10, 9, 2, 5, 3, 7, 101, 18], tails = [], F = frames();
      const shot = (note, i, j) => F.push({ note, panes: [
        { t: 'array', label: 'nums', vals: a, ptr: i != null ? { i } : {}, cls: i != null ? { [i]: 'cur' } : {} },
        { t: 'array', label: 'tails[k] = smallest tail of an increasing run of length k+1', vals: tails.length ? tails : ['—'], cls: j != null ? { [j]: 'ok' } : {} },
      ] });
      shot('tails stays sorted, so each new number finds its place with a binary search.');
      a.forEach((x, i) => {
        let lo = 0, hi = tails.length;
        while (lo < hi) { const m = (lo + hi) >> 1; if (tails[m] < x) lo = m + 1; else hi = m; }
        const append = lo === tails.length;
        const old = tails[lo];
        tails[lo] = x;
        shot(append ? `${x} is bigger than every tail → append: a run of length ${tails.length} now exists.` : `${x} replaces ${old} at position ${lo}: same length, smaller tail → easier to extend later.`, i, lo);
      });
      shot(`Answer = len(tails) = ${tails.length}. (tails itself isn’t necessarily a real subsequence.)`);
      return F;
    },
  };

  P[129] = {
    title: 'Edit Distance table', input: 'word1 = "horse", word2 = "ros"',
    run() {
      const a = 'horse', b = 'ros', F = frames();
      const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : null)));
      const shot = (note, cls = {}) => F.push({ note, panes: [{ t: 'table', rowHead: ['∅', ...a], colHead: ['∅', ...b], cells: dp.map(r => [...r]), cls }] });
      shot('dp[i][j] = edits to turn the first i letters of word1 into the first j of word2. Borders: delete everything / insert everything.');
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) { dp[i][j] = dp[i - 1][j - 1]; shot(`'${a[i - 1]}' = '${b[j - 1]}' → free: copy the diagonal (${dp[i][j]}).`, { [`${i},${j}`]: 'cur', [`${i - 1},${j - 1}`]: 'dep' }); }
        else {
          dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
          shot(`'${a[i - 1]}' ≠ '${b[j - 1]}' → 1 + min(insert ${dp[i][j - 1]}, delete ${dp[i - 1][j]}, replace ${dp[i - 1][j - 1]}) = ${dp[i][j]}.`, { [`${i},${j}`]: 'cur', [`${i},${j - 1}`]: 'dep', [`${i - 1},${j}`]: 'dep', [`${i - 1},${j - 1}`]: 'dep' });
        }
      }
      shot(`Answer ${dp[a.length][b.length]}: horse → rorse → rose → ros.`, { [`${a.length},${b.length}`]: 'ok' });
      return F;
    },
  };

  P[135] = {
    title: 'Jump Game II — BFS-like windows', input: 'nums = [2, 3, 1, 1, 4]',
    run() {
      const a = [2, 3, 1, 1, 4], F = frames();
      let jumps = 0, end = 0, far = 0, start = 0;
      const shot = (note, i) => F.push({ note, panes: [{ t: 'array', vals: a, range: [start, end], ptr: { i, end, far: far < a.length ? far : a.length - 1 }, cls: { [i]: 'cur' } }, { t: 'vars', vals: { jumps, end, farthest: far }, hl: ['jumps'] }] });
      shot('Indices reachable with the same number of jumps form a window [start, end]. Scan it while tracking the farthest reach.', 0);
      for (let i = 0; i < a.length - 1; i++) {
        far = Math.max(far, i + a[i]);
        shot(`From ${i} you can reach ${i + a[i]} → farthest = ${far}.`, i);
        if (i === end) { jumps++; start = end + 1; end = far; shot(`Window used up → jump #${jumps}; the next window is [${start}, ${end}].`, i); }
      }
      shot(`Reached the last index with ${jumps} jumps.`, a.length - 1);
      return F;
    },
  };

  P[15] = {
    title: '3Sum — sort, fix one, two pointers', input: 'nums = [−1, 0, 1, 2, −1, −4]',
    run() {
      const a = [-1, 0, 1, 2, -1, -4].sort((x, y) => x - y), res = [], F = frames();
      const shot = (note, i, l, r, cls = {}) => F.push({ note, panes: [{ t: 'array', label: 'sorted', vals: a, ptr: { i, l, r }, cls: { [i]: 'cur', ...cls } }, { t: 'map', label: 'triplets', entries: res.map(t => [`[${t}]`]) }] });
      shot('Sort first: [−4, −1, −1, 0, 1, 2]. Fix nums[i], then find a pair summing to −nums[i] with two pointers.', null);
      for (let i = 0; i < a.length - 2; i++) {
        if (a[i] > 0) { shot(`nums[i] = ${a[i]} > 0 → no triplet can sum to 0 any more. Stop.`, i); break; }
        if (i > 0 && a[i] === a[i - 1]) { shot(`nums[${i}] = ${a[i]} repeats the previous value → skip (avoids duplicate triplets).`, i, null, null, { [i]: 'dim' }); continue; }
        let l = i + 1, r = a.length - 1;
        while (l < r) {
          const sum = a[i] + a[l] + a[r];
          if (sum === 0) {
            res.push([a[i], a[l], a[r]]);
            shot(`${a[i]} + ${a[l]} + ${a[r]} = 0 → record [${a[i]}, ${a[l]}, ${a[r]}], move both pointers.`, i, l, r, { [l]: 'ok', [r]: 'ok' });
            l++; r--;
            while (l < r && a[l] === a[l - 1]) l++;
          } else if (sum < 0) { shot(`sum ${sum} < 0 → need bigger → l++.`, i, l, r, { [l]: 'bad' }); l++; }
          else { shot(`sum ${sum} > 0 → need smaller → r−−.`, i, l, r, { [r]: 'bad' }); r--; }
        }
      }
      shot(`Done: ${res.map(t => `[${t}]`).join(', ')}. O(n²) total.`, null);
      return F;
    },
  };

  P[16] = {
    title: 'Container With Most Water', input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
    run() {
      const h = [1, 8, 6, 2, 5, 4, 8, 3, 7], F = frames();
      let l = 0, r = h.length - 1, best = 0;
      while (l < r) {
        const area = Math.min(h[l], h[r]) * (r - l);
        const better = area > best;
        best = Math.max(best, area);
        const moveL = h[l] < h[r];
        F.push({ note: `min(${h[l]}, ${h[r]}) × ${r - l} = ${area}${better ? ' ★ new best' : ''}. Move the shorter side (${moveL ? 'left' : 'right'}) — the taller one can’t do better with less width.`,
          panes: [{ t: 'array', vals: h, bars: true, range: [l, r], ptr: { l, r }, cls: { [moveL ? l : r]: 'cur' } }, { t: 'vars', vals: { area, best }, hl: ['best'] }] });
        if (moveL) l++; else r--;
      }
      F.push({ note: `Pointers met. Best area = ${best}.`, panes: [{ t: 'array', vals: h, bars: true, cls: { 1: 'ok', 8: 'ok' } }, { t: 'vars', vals: { best }, hl: ['best'] }] });
      return F;
    },
  };

  P[36] = {
    title: 'Koko — binary search on the answer', input: 'piles = [3, 6, 7, 11], h = 8',
    run() {
      const piles = [3, 6, 7, 11], H = 8, ks = Array.from({ length: 11 }, (_, i) => i + 1), F = frames();
      let lo = 1, hi = 11;
      const hours = k => piles.reduce((s, p) => s + Math.ceil(p / k), 0);
      const shot = (note, mid, cls = {}) => F.push({ note, panes: [{ t: 'array', label: 'candidate speeds k', vals: ks, idx: false,
        ptr: { lo: lo - 1, hi: hi - 1, ...(mid ? { mid: mid - 1 } : {}) }, cls: { ...Object.fromEntries(ks.map(k => [k - 1, k < lo || k > hi ? 'dim' : ''])), ...cls } }] });
      shot('If speed k finishes in time, any faster speed does too — feasibility is monotonic, so binary search the speed itself.');
      while (lo < hi) {
        const mid = (lo + hi) >> 1, hrs = hours(mid);
        const ok = hrs <= H;
        shot(`k = ${mid}: hours = ${piles.map(p => `⌈${p}/${mid}⌉`).join(' + ')} = ${hrs} ${ok ? '≤' : '>'} ${H} → ${ok ? 'feasible, try slower (hi = mid)' : 'too slow (lo = mid + 1)'}.`, mid, { [mid - 1]: ok ? 'ok' : 'bad' });
        if (ok) hi = mid; else lo = mid + 1;
      }
      shot(`lo = hi = ${lo}: the minimum speed. O(n log max).`, null, { [lo - 1]: 'ok' });
      return F;
    },
  };

  P[38] = {
    title: 'Search in Rotated Sorted Array', input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0',
    run() {
      const a = [4, 5, 6, 7, 0, 1, 2], t = 0, F = frames();
      let l = 0, r = a.length - 1;
      const dim = () => Object.fromEntries(a.map((_, i) => [i, i < l || i > r ? 'dim' : '']));
      while (l <= r) {
        const m = (l + r) >> 1;
        if (a[m] === t) { F.push({ note: `nums[${m}] = ${t} → found at index ${m}.`, panes: [{ t: 'array', vals: a, ptr: { l, m, r }, cls: { ...dim(), [m]: 'ok' } }] }); break; }
        const leftSorted = a[l] <= a[m];
        const span = leftSorted ? [l, m] : [m, r];
        const inside = leftSorted ? a[l] <= t && t < a[m] : a[m] < t && t <= a[r];
        const win = Object.fromEntries(Array.from({ length: span[1] - span[0] + 1 }, (_, k) => [span[0] + k, 'win']));
        F.push({ note: `${leftSorted ? 'Left' : 'Right'} half [${a.slice(span[0], span[1] + 1).join(', ')}] is sorted. Is ${t} inside it? ${inside ? 'Yes → search there' : 'No → search the other half'}.`,
          panes: [{ t: 'array', vals: a, ptr: { l, m, r }, cls: { ...dim(), ...win, [m]: 'cur' } }] });
        if (leftSorted) { if (inside) r = m - 1; else l = m + 1; } else { if (inside) l = m + 1; else r = m - 1; }
      }
      return F;
    },
  };

  P[50] = {
    title: 'LRU Cache — recency list + hash map', input: 'capacity 2: put(1,1) put(2,2) get(1) put(3,3) get(2) put(4,4) get(1) get(3) get(4)',
    run() {
      const cap = 2, order = [], map = new Map(), out = [], F = frames();
      const shot = (note, hl) => F.push({ note, panes: [
        { t: 'array', label: 'recency (most recent first)', vals: order.length ? order : ['—'], cls: hl != null ? { [order.indexOf(hl)]: 'cur' } : {}, idx: false },
        { t: 'map', label: 'map key → value', entries: [...map], hl },
        { t: 'array', label: 'outputs', vals: out.length ? out : ['—'], idx: false },
      ] });
      const touch = k => { order.splice(order.indexOf(k), 1); order.unshift(k); };
      const ops = [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]];
      shot('The map finds a key in O(1); the doubly linked list keeps keys in recency order so moving/evicting is O(1).');
      for (const [op, k, v] of ops) {
        if (op === 'get') {
          if (!map.has(k)) { out.push(-1); shot(`get(${k}) → not cached → −1.`); }
          else { touch(k); out.push(map.get(k)); shot(`get(${k}) → ${map.get(k)}; move ${k} to the front (most recent).`, k); }
        } else {
          if (map.has(k)) order.splice(order.indexOf(k), 1);
          order.unshift(k); map.set(k, v);
          let note = `put(${k}, ${v}) → insert at the front.`;
          if (map.size > cap) { const lru = order.pop(); map.delete(lru); note += ` Over capacity → evict the back (${lru}), the least recently used.`; }
          shot(note, k);
        }
      }
      return F;
    },
  };

  P[64] = {
    title: 'Validate BST — passing bounds down', input: 'root = [5, 4, 6, null, null, 3, 7]',
    run() {
      const arr = [5, 4, 6, null, null, 3, 7], cls = {}, F = frames();
      let valid = true;
      const fmt = b => (b === -Infinity ? '−∞' : b === Infinity ? '∞' : b);
      (function check(i, lo, hi) {
        if (!valid || i >= arr.length || arr[i] == null) return;
        const v = arr[i], ok = lo < v && v < hi;
        cls[i] = ok ? 'done' : 'bad';
        F.push({ note: `${v} must be in (${fmt(lo)}, ${fmt(hi)}) → ${ok ? '✓' : `✗ — ${v} sits in the RIGHT subtree of 5, so it must be > 5`}.`, panes: [{ t: 'tree', arr, cls: { ...cls, [i]: ok ? 'cur' : 'bad' } }] });
        if (!ok) { valid = false; return; }
        check(2 * i + 1, lo, v);
        check(2 * i + 2, v, hi);
      })(0, -Infinity, Infinity);
      F.push({ note: valid ? 'Every node fits its bounds → valid BST.' : 'Not a BST. Checking 3 only against its parent 6 would have missed this — bounds come from ALL ancestors.', panes: [{ t: 'tree', arr, cls }] });
      return F;
    },
  };

  P[67] = {
    title: 'Binary Tree Maximum Path Sum — post-order gains', input: 'root = [−10, 9, 20, null, null, 15, 7]',
    run() {
      const arr = [-10, 9, 20, null, null, 15, 7], cls = {}, F = frames();
      let best = -Infinity;
      (function gain(i) {
        if (i >= arr.length || arr[i] == null) return 0;
        const l = Math.max(gain(2 * i + 1), 0), r = Math.max(gain(2 * i + 2), 0);
        const through = arr[i] + l + r;
        const improved = through > best;
        best = Math.max(best, through);
        cls[i] = 'done';
        F.push({ note: `Node ${arr[i]}: left gain ${l}, right gain ${r}. Path bending here = ${through}${improved ? ' ★ best' : ''}. Return ${arr[i]} + max(${l}, ${r}) = ${arr[i] + Math.max(l, r)} to the parent.`,
          panes: [{ t: 'tree', arr, cls: { ...cls, [i]: 'cur' } }, { t: 'vars', vals: { best }, hl: ['best'] }] });
        return arr[i] + Math.max(l, r);
      })(0);
      F.push({ note: `Answer ${best}: the path 15 → 20 → 7. The root’s −10 makes it worse, so the best path doesn’t pass through it.`, panes: [{ t: 'tree', arr, cls: { 2: 'ok', 5: 'ok', 6: 'ok' } }, { t: 'vars', vals: { best }, hl: ['best'] }] });
      return F;
    },
  };

  P[85] = {
    title: 'Word Search — grid backtracking', input: 'board = ABCE / SFCS / ADEE, word = "ABCCED"',
    run() {
      const b = ['ABCE', 'SFCS', 'ADEE'].map(r => r.split('')), word = 'ABCCED', path = [], F = frames();
      const shot = (note, cur) => F.push({ note, panes: [{ t: 'grid', cells: b.map((row, r) => row.map((ch, c) => {
        const k = path.findIndex(([y, x]) => y === r && x === c);
        return { v: ch, c: cur && cur[0] === r && cur[1] === c ? 'cur' : k >= 0 ? 'visited' : '' };
      })) }, { t: 'vars', vals: { matched: `"${word.slice(0, path.length)}"` }, hl: ['matched'] }] });
      let found = false;
      const dfs = (r, c, i) => {
        if (found) return;
        if (i === word.length) { found = true; return; }
        if (r < 0 || c < 0 || r >= 3 || c >= 4 || path.some(([y, x]) => y === r && x === c) || b[r][c] !== word[i]) return;
        path.push([r, c]);
        shot(`(${r},${c}) = '${b[r][c]}' matches word[${i}] → mark visited, go deeper.`, [r, c]);
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { dfs(r + dr, c + dc, i + 1); if (found) return; }
        path.pop();
        shot(`Dead end after '${b[r][c]}' → un-mark (${r},${c}) and back up.`, null);
      };
      shot('Try every start cell; from a matching cell, explore the 4 neighbours for the next letter.');
      for (let r = 0; r < 3 && !found; r++) for (let c = 0; c < 4 && !found; c++) dfs(r, c, 0);
      shot(found ? `Found "${word}". Visited cells are restored afterwards so other searches still work.` : 'Not found.');
      return F;
    },
  };

  P[87] = {
    title: 'N-Queens (n = 4) — row by row', input: 'n = 4 (first solution)',
    run() {
      const n = 4, q = [], F = frames();
      let done = false;
      const attacked = (r, c) => q.some((qc, qr) => qc === c || qr - qc === r - c || qr + qc === r + c);
      const shot = (note, try_) => F.push({ note, panes: [{ t: 'grid', cells: Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
        if (q[r] === c) return { v: '♛', c: 'ok' };
        if (try_ && try_[0] === r && try_[1] === c) return { v: '✗', c: 'bad' };
        return { v: '', c: r >= q.length && attacked(r, c) ? 'empty' : '' };
      })) }] });
      const bt = r => {
        if (done) return;
        if (r === n) { done = true; shot('All 4 queens placed — a solution. (Faded cells were attacked.)'); return; }
        for (let c = 0; c < n && !done; c++) {
          if (attacked(r, c)) continue;
          q.push(c);
          shot(`Row ${r}: column ${c} is free (no shared column or diagonal) → place.`);
          bt(r + 1);
          if (done) return;
          q.pop();
          shot(`Row ${r + 1} has no free column → remove the queen at (${r}, ${c}) and try the next column.`, [r, c]);
        }
      };
      shot('One queen per row. A cell is attacked if its column, r − c or r + c is taken. Faded cells are attacked.');
      bt(0);
      return F;
    },
  };

  P[89] = {
    title: 'Number of Islands — flood fill', input: 'grid = 11000 / 11000 / 00100 / 00011',
    run() {
      const g = ['11000', '11000', '00100', '00011'].map(r => r.split('').map(Number)), id = g.map(r => r.map(() => 0)), F = frames();
      let count = 0;
      const shot = note => F.push({ note, panes: [{ t: 'grid', cells: g.map((row, r) => row.map((v, c) => ({ v: id[r][c] ? `#${id[r][c]}` : v ? '■' : '', c: id[r][c] ? 'visited' : v ? 'fresh' : 'empty' }))) }, { t: 'vars', vals: { islands: count }, hl: ['islands'] }] });
      shot('Scan the grid. Each unvisited land cell starts a new island; flood-fill marks all of it.');
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
        if (!g[r][c] || id[r][c]) continue;
        count++;
        const st = [[r, c]];
        id[r][c] = count;
        while (st.length) {
          const [y, x] = st.pop();
          for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && nx >= 0 && ny < 4 && nx < 5 && g[ny][nx] && !id[ny][nx]) { id[ny][nx] = count; st.push([ny, nx]); }
          }
        }
        shot(`Land at (${r},${c}) is new → island #${count}; flood fill marks all its connected land.`);
      }
      shot(`Scan finished: ${count} islands. Every cell is visited once → O(R·C).`);
      return F;
    },
  };

  P[101] = {
    title: 'Word Ladder — BFS by levels', input: 'hit → cog, wordList = [hot, dot, dog, lot, log, cog]',
    run() {
      const words = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'], F = frames(), seen = new Set(['hit']);
      let level = ['hit'], steps = 1;
      const nb = w => words.filter(x => !seen.has(x) && [...x].filter((ch, i) => ch !== w[i]).length === 1);
      const shot = note => F.push({ note, panes: [{ t: 'queue', label: `level ${steps}`, vals: level }, { t: 'map', label: 'visited', entries: [...seen].map(x => [x]) }, { t: 'vars', vals: { steps }, hl: ['steps'] }] });
      shot('Each word is a node; words one letter apart are neighbours. BFS finds the fewest steps.');
      while (level.length) {
        if (level.includes('cog')) { shot(`'cog' is in level ${steps} → the shortest sequence has ${steps} words.`); break; }
        const next = [];
        for (const w of level) for (const x of nb(w)) { seen.add(x); next.push(x); }
        const from = level.join(', ');
        level = next; steps++;
        shot(`Expand {${from}} → next level {${level.join(', ')}} (each one letter away, not seen before).`);
      }
      return F;
    },
  };

  P[104] = {
    title: 'Cheapest Flights Within K Stops — Bellman-Ford rounds', input: 'flights 0→1 100, 1→2 100, 2→0 100, 1→3 600, 2→3 200; src 0, dst 3, k = 1',
    run() {
      const fl = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], pos = { 0: [12, 34], 1: [36, 12], 2: [52, 56], 3: [86, 34] }, F = frames();
      let price = [0, Infinity, Infinity, Infinity];
      const show = (pr, hl) => ({ t: 'graph', directed: true, nodes: Object.entries(pos).map(([id, [x, y]]) => ({ id, x, y, sub: pr[id] === Infinity ? '∞' : pr[id], c: id === '0' ? 'done' : id === '3' ? 'queued' : '' })),
        edges: fl.map(([u, v, w]) => ({ u: String(u), v: String(v), w, c: hl && hl[0] === u && hl[1] === v ? 'hl' : '' })) });
      F.push({ note: 'k = 1 stop = at most 2 flights → run 2 rounds. Each round relaxes from a COPY of the previous prices.', panes: [show(price)] });
      for (let round = 1; round <= 2; round++) {
        const next = [...price];
        for (const [u, v, w] of fl) {
          if (price[u] + w < next[v]) {
            next[v] = price[u] + w;
            F.push({ note: `Round ${round}: ${u}→${v} costs ${price[u]} + ${w} = ${next[v]} → better.`, panes: [show(next, [u, v])] });
          }
        }
        price = next;
        F.push({ note: `End of round ${round} (paths with ≤ ${round} flight${round > 1 ? 's' : ''}).`, panes: [show(price)] });
      }
      F.push({ note: `price[3] = ${price[3]}. The cheaper 0→1→2→3 (400) needs 3 flights — not allowed.`, panes: [show(price)] });
      return F;
    },
  };

  P[116] = {
    title: 'Decode Ways', input: 's = "11106"',
    run() {
      const s = '11106', dp = [1, ...Array(s.length).fill(null)], F = frames();
      const shot = (note, i, cls = {}) => F.push({ note, panes: [{ t: 'array', label: 's', vals: s.split(''), cls: i ? { [i - 1]: 'cur' } : {} }, { t: 'array', label: 'dp[i] = ways to decode the first i digits', vals: dp.map(v => v ?? ''), cls }] });
      shot('dp[0] = 1 (the empty prefix). The last piece is one digit (not 0) or two digits (10–26).', 0, { 0: 'ok' });
      for (let i = 1; i <= s.length; i++) {
        let v = 0; const parts = [];
        if (s[i - 1] !== '0') { v += dp[i - 1]; parts.push(`'${s[i - 1]}' alone → +dp[${i - 1}] = ${dp[i - 1]}`); } else parts.push(`'0' can’t stand alone`);
        if (i >= 2) { const two = Number(s.slice(i - 2, i)); if (two >= 10 && two <= 26) { v += dp[i - 2]; parts.push(`'${s.slice(i - 2, i)}' → +dp[${i - 2}] = ${dp[i - 2]}`); } else parts.push(`'${s.slice(i - 2, i)}' isn’t 10–26`); }
        dp[i] = v;
        shot(`dp[${i}]: ${parts.join('; ')} → ${v}.`, i, { [i]: 'cur', [i - 1]: 'dep', ...(i >= 2 ? { [i - 2]: 'dep' } : {}) });
      }
      shot(`Answer dp[5] = ${dp[5]}: "1 1 10 6" and "11 10 6".`, null, { 5: 'ok' });
      return F;
    },
  };

  P[121] = {
    title: 'Partition Equal Subset Sum — boolean knapsack', input: 'nums = [1, 5, 11, 5] (target = 11)',
    run() {
      const nums = [1, 5, 11, 5], target = 11, dp = [true, ...Array(target).fill(false)], F = frames();
      const shot = (note, x, changed = []) => F.push({ note, panes: [{ t: 'array', label: 'nums', vals: nums, idx: false, cls: x != null ? { [x]: 'cur' } : {} },
        { t: 'array', label: 'reachable sums 0…11', vals: dp.map(v => (v ? '✓' : '·')), cls: Object.fromEntries(dp.map((v, i) => [i, changed.includes(i) ? 'cur' : v ? 'ok' : ''])) }] });
      shot('Total 22 → we need a subset summing to 11. Track which sums are reachable; dp[0] = true.');
      nums.forEach((x, k) => {
        const changed = [];
        for (let t = target; t >= x; t--) if (!dp[t] && dp[t - x]) { dp[t] = true; changed.push(t); }
        shot(`Add ${x}: every reachable s makes s + ${x} reachable (loop t downwards so ${x} is used once). New: ${changed.join(', ') || 'none'}.`, k, changed);
      });
      shot(`dp[11] = ${dp[11]} → ${dp[11] ? 'yes: {11} and {1, 5, 5}' : 'no'}.`);
      return F;
    },
  };

  P[126] = {
    title: 'Coin Change II — counting combinations', input: 'amount = 5, coins = [1, 2, 5]',
    run() {
      const coins = [1, 2, 5], A = 5, dp = [1, 0, 0, 0, 0, 0], F = frames();
      F.push({ note: 'dp[a] = number of combinations making a. dp[0] = 1. Coins go in the OUTER loop so each combination is counted once.', panes: [{ t: 'array', label: 'dp', vals: dp }] });
      for (const c of coins) {
        for (let a = c; a <= A; a++) {
          dp[a] += dp[a - c];
          F.push({ note: `coin ${c}: dp[${a}] += dp[${a - c}] → ${dp[a]}.`, panes: [{ t: 'array', label: `dp after considering coins up to ${c}`, vals: dp, cls: { [a]: 'cur', [a - c]: 'dep' } }] });
        }
      }
      F.push({ note: `Answer dp[5] = ${dp[5]}: 5 · 2+2+1 · 2+1+1+1 · 1+1+1+1+1.`, panes: [{ t: 'array', label: 'dp', vals: dp, cls: { 5: 'ok' } }] });
      return F;
    },
  };

  P[136] = {
    title: 'Gas Station — reset the start', input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]',
    run() {
      const gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2], net = gas.map((g, i) => g - cost[i]), F = frames();
      let tank = 0, start = 0;
      F.push({ note: `Net gain per station: [${net.join(', ')}]. Total ${net.reduce((a, b) => a + b, 0)} ≥ 0, so some start works.`, panes: [{ t: 'array', label: 'gas − cost', vals: net }, { t: 'vars', vals: { start, tank } }] });
      for (let i = 0; i < net.length; i++) {
        tank += net[i];
        if (tank < 0) {
          F.push({ note: `At ${i} the tank is ${tank} < 0 → no start from ${start}..${i} can work. Restart at ${i + 1} with an empty tank.`, panes: [{ t: 'array', label: 'gas − cost', vals: net, range: [start, i], cls: { [i]: 'bad' } }, { t: 'vars', vals: { start: i + 1, tank: 0 } }] });
          start = i + 1; tank = 0;
        } else F.push({ note: `At ${i}: tank = ${tank}.`, panes: [{ t: 'array', label: 'gas − cost', vals: net, range: [start, i], cls: { [i]: 'cur' } }, { t: 'vars', vals: { start, tank } }] });
      }
      F.push({ note: `Answer: start at station ${start}.`, panes: [{ t: 'array', label: 'gas − cost', vals: net, cls: { [start]: 'ok' } }, { t: 'vars', vals: { start }, hl: ['start'] }] });
      return F;
    },
  };

  P[138] = {
    title: 'Partition Labels', input: 's = "ababcbacadefegdehijhklij"',
    run() {
      const s = 'ababcbacadefegdehijhklij'.split(''), last = {}, sizes = [], F = frames();
      s.forEach((c, i) => (last[c] = i));
      let start = 0, end = 0;
      for (let i = 0; i < s.length; i++) {
        end = Math.max(end, last[s[i]]);
        const cut = i === end;
        if (cut) sizes.push(end - start + 1);
        if (cut || i === 0 || s[i] !== s[i - 1]) F.push({ note: cut ? `i = ${i} reaches end → every letter inside has finished. Cut: size ${end - start + 1}.` : `'${s[i]}' last appears at ${last[s[i]]} → this part must reach at least ${end}.`,
          panes: [{ t: 'array', vals: s, range: [start, end], ptr: { i, end }, cls: { [i]: cut ? 'ok' : 'cur' } }, { t: 'array', label: 'part sizes', vals: sizes.length ? [...sizes] : ['—'], idx: false }] });
        if (cut) start = i + 1;
      }
      F.push({ note: `Parts: [${sizes.join(', ')}].`, panes: [{ t: 'array', label: 'part sizes', vals: sizes, idx: false }] });
      return F;
    },
  };

  P[148] = {
    title: 'Rotate Image — transpose, then reverse rows', input: '3 × 3 matrix [[1,2,3],[4,5,6],[7,8,9]]',
    run() {
      const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]], F = frames();
      const shot = (note, hl = []) => F.push({ note, panes: [{ t: 'grid', cells: m.map((row, r) => row.map((v, c) => ({ v, c: hl.some(([y, x]) => y === r && x === c) ? 'cur' : '' }))) }] });
      shot('Goal: (i, j) moves to (j, n − 1 − i). That is a transpose followed by mirroring each row.');
      for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
        [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
        shot(`Transpose: swap (${i},${j}) ↔ (${j},${i}). Only j > i, or each pair would swap back.`, [[i, j], [j, i]]);
      }
      for (let i = 0; i < 3; i++) { m[i].reverse(); shot(`Reverse row ${i}.`, [[i, 0], [i, 2]]); }
      shot('Rotated 90° clockwise, in place: [[7,4,1],[8,5,2],[9,6,3]].');
      return F;
    },
  };

  /* ---------- player ---------- */

  const cache = {};
  const defOf = key => (key.startsWith('p:') ? P[key.slice(2)] : W[key]);
  const framesFor = key => (cache[key] ||= defOf(key).run());

  function html(name) {
    if (!W[name]) return '';
    return `<div class="viz" data-viz="${esc(name)}"></div>`;
  }
  const htmlProblem = n => (P[n] ? `<div class="viz" data-viz="p:${n}"></div>` : '');

  function paint(el) {
    const name = el.dataset.viz;
    const w = defOf(name);
    if (!w) return;
    const frames = framesFor(name);
    let i = Number(el.dataset.i || 0);
    i = Math.max(0, Math.min(frames.length - 1, i));
    el.dataset.i = i;
    const f = frames[i];
    el.innerHTML = `
      <div class="vz-head"><b>${esc(w.title)}</b><span class="vz-input">${esc(w.input)}</span></div>
      <div class="vz-stage">${f.panes.map(p => `<div class="vz-pane">${p.label ? `<div class="vz-label">${esc(p.label)}</div>` : ''}${R[p.t](p)}</div>`).join('')}</div>
      <div class="vz-note"><span class="vz-step">${i + 1}/${frames.length}</span>${esc(f.note)}</div>
      <div class="vz-ctrl">
        <button type="button" data-vz="first" aria-label="Restart" ${i ? '' : 'disabled'}>⏮</button>
        <button type="button" data-vz="prev" aria-label="Previous step" ${i ? '' : 'disabled'}>◀</button>
        <button type="button" data-vz="play" class="play" aria-label="${el.dataset.playing ? 'Pause' : 'Play'}">${el.dataset.playing ? '❚❚' : '▶'}</button>
        <button type="button" data-vz="next" aria-label="Next step" ${i < frames.length - 1 ? '' : 'disabled'}>▶︎▏</button>
        <input type="range" min="0" max="${frames.length - 1}" value="${i}" data-vz="seek" aria-label="Step">
      </div>`;
  }

  const timers = new WeakMap();
  function stop(el) { clearInterval(timers.get(el)); delete el.dataset.playing; }
  function go(el, i) { el.dataset.i = i; paint(el); }

  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-vz]');
    if (!b || b.dataset.vz === 'seek') return;
    const el = b.closest('.viz');
    const n = framesFor(el.dataset.viz).length;
    const i = Number(el.dataset.i || 0);
    const act = b.dataset.vz;
    if (act === 'play') {
      if (el.dataset.playing) { stop(el); paint(el); return; }
      if (i >= n - 1) el.dataset.i = 0;
      el.dataset.playing = '1';
      paint(el);
      timers.set(el, setInterval(() => {
        if (!el.isConnected) return stop(el);
        const k = Number(el.dataset.i) + 1;
        if (k >= n) { stop(el); paint(el); return; }
        go(el, k);
      }, 1400));
      return;
    }
    stop(el);
    go(el, act === 'first' ? 0 : act === 'prev' ? i - 1 : i + 1);
  });
  document.addEventListener('input', e => {
    if (e.target.dataset && e.target.dataset.vz === 'seek') {
      const el = e.target.closest('.viz');
      stop(el);
      el.dataset.i = e.target.value;
      paint(el);
      el.querySelector('[data-vz="seek"]').focus();
    }
  });

  new MutationObserver(muts => {
    for (const m of muts) for (const node of m.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches('.viz:not([data-i])')) paint(node);
      else node.querySelectorAll && node.querySelectorAll('.viz:not([data-i])').forEach(paint);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.Viz = { html, htmlProblem, has: n => !!P[n], names: Object.keys(W), problems: Object.keys(P).map(Number), framesFor };
})();
