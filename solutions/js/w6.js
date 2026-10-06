// Week 6 — Graphs.

// @@ 89
function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue;
      count++;
      grid[r][c] = '0'; // sink the whole island with an explicit stack
      const st = [[r, c]];
      while (st.length) {
        const [y, x] = st.pop();
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && nx >= 0 && ny < rows && nx < cols && grid[ny][nx] === '1') {
            grid[ny][nx] = '0';
            st.push([ny, nx]);
          }
        }
      }
    }
  }
  return count;
}

// @@ 90
function cloneGraph(node) {
  const clones = new Map(); // original -> copy
  const clone = n => {
    if (clones.has(n)) return clones.get(n);
    const copy = new _Node(n.val, []);
    clones.set(n, copy); // store before recursing: handles cycles
    for (const nb of n.neighbors) copy.neighbors.push(clone(nb));
    return copy;
  };
  return node ? clone(node) : null;
}

// @@ 91
function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  const area = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== 1) return 0;
    grid[r][c] = 0; // sink
    return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);
  };
  let best = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      best = Math.max(best, area(r, c));
  return best;
}

// @@ 92
function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const reach = starts => {
    const seen = new Set(starts.map(([r, c]) => r * cols + c));
    const st = [...starts];
    while (st.length) {
      const [r, c] = st.pop();
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen.has(nr * cols + nc)) continue;
        if (heights[nr][nc] < heights[r][c]) continue; // can only climb up from the ocean
        seen.add(nr * cols + nc);
        st.push([nr, nc]);
      }
    }
    return seen;
  };
  const pac = [], atl = [];
  for (let c = 0; c < cols; c++) { pac.push([0, c]); atl.push([rows - 1, c]); }
  for (let r = 0; r < rows; r++) { pac.push([r, 0]); atl.push([r, cols - 1]); }
  const p = reach(pac), a = reach(atl);
  return [...p].filter(k => a.has(k)).map(k => [Math.floor(k / cols), k % cols]);
}

// @@ 93
function solve(board) {
  const rows = board.length, cols = board[0].length;
  const mark = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== 'O') return;
    board[r][c] = 'T'; // safe: connected to the border
    mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1);
  };
  for (let r = 0; r < rows; r++) { mark(r, 0); mark(r, cols - 1); }
  for (let c = 0; c < cols; c++) { mark(0, c); mark(rows - 1, c); }
  for (const row of board)
    for (let c = 0; c < cols; c++)
      row[c] = row[c] === 'O' ? 'X' : row[c] === 'T' ? 'O' : row[c];
}

// @@ 94
function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let q = [], fresh = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) q.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  let minutes = 0;
  while (q.length && fresh) {
    const next = []; // one BFS level = one minute
    for (const [r, c] of q) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    q = next;
    minutes++;
  }
  return fresh ? -1 : minutes;
}

// @@ 95
function updateMatrix(mat) {
  const rows = mat.length, cols = mat[0].length;
  const dist = mat.map(row => row.map(v => (v === 0 ? 0 : -1)));
  const q = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (mat[r][c] === 0) q.push([r, c]); // every zero is a source
  for (let head = 0; head < q.length; head++) {
    const [r, c] = q[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1;
        q.push([nr, nc]);
      }
    }
  }
  return dist;
}

// @@ 96
function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) { // pre -> course
    adj[pre].push(course);
    indeg[course]++;
  }
  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  let taken = 0;
  for (let head = 0; head < q.length; head++) {
    taken++;
    for (const v of adj[q[head]]) if (--indeg[v] === 0) q.push(v);
  }
  return taken === numCourses;
}

// @@ 97
function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indeg[course]++;
  }
  const order = []; // doubles as the BFS queue
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) order.push(i);
  for (let head = 0; head < order.length; head++)
    for (const v of adj[order[head]]) if (--indeg[v] === 0) order.push(v);
  return order.length === numCourses ? order : []; // cycle -> empty
}

// @@ 98
function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = x => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path halving
      x = parent[x];
    }
    return x;
  };
  for (const [a, b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return [a, b]; // already connected: this edge closes a cycle
    parent[ra] = rb;
  }
  return [];
}

// @@ 99
function findCircleNum(isConnected) {
  const n = isConnected.length;
  const seen = new Array(n).fill(false);
  const dfs = i => {
    for (let j = 0; j < n; j++)
      if (isConnected[i][j] && !seen[j]) {
        seen[j] = true;
        dfs(j);
      }
  };
  let provinces = 0;
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    seen[i] = true;
    dfs(i);
    provinces++;
  }
  return provinces;
}

// @@ 100
function makeConnected(n, connections) {
  if (connections.length < n - 1) return -1; // not enough cables
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  let components = n;
  for (const [a, b] of connections) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      components--;
    }
  }
  return components - 1;
}

// @@ 101
function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  words.add(beginWord);
  const buckets = new Map(); // "h*t" -> words matching it
  const patterns = w => [...w].map((_, i) => w.slice(0, i) + '*' + w.slice(i + 1));
  for (const w of words)
    for (const key of patterns(w)) {
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(w);
    }
  let level = [beginWord];
  const seen = new Set(level);
  for (let steps = 1; level.length; steps++) {
    const next = [];
    for (const w of level) {
      if (w === endWord) return steps;
      for (const key of patterns(w))
        for (const nb of buckets.get(key))
          if (!seen.has(nb)) {
            seen.add(nb);
            next.push(nb);
          }
    }
    level = next;
  }
  return 0;
}
