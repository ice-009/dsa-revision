// Week 6 — Graphs.

// @@ 89
function numIslands(grid) {

  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      if (grid[r][c] !== '1') {
        continue;
      }

      count++;

      // sink the whole island with an explicit stack
      const stack = [[r, c]];
      grid[r][c] = '0';

      while (stack.length > 0) {

        const cell = stack.pop();

        for (const dir of dirs) {

          const nr = cell[0] + dir[0];
          const nc = cell[1] + dir[1];

          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
            continue;
          }

          if (grid[nr][nc] === '1') {
            grid[nr][nc] = '0';
            stack.push([nr, nc]);
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

  function clone(original) {

    if (clones.has(original)) {
      return clones.get(original);
    }

    const copy = new _Node(original.val, []);
    clones.set(original, copy); // store before recursing: handles cycles

    for (const neighbor of original.neighbors) {
      copy.neighbors.push(clone(neighbor));
    }

    return copy;
  }

  if (!node) {
    return null;
  }

  return clone(node);
}

// @@ 91
function maxAreaOfIsland(grid) {

  const rows = grid.length;
  const cols = grid[0].length;

  function area(r, c) {

    if (r < 0 || c < 0 || r >= rows || c >= cols) {
      return 0;
    }

    if (grid[r][c] !== 1) {
      return 0;
    }

    grid[r][c] = 0; // sink

    let total = 1;
    total += area(r + 1, c);
    total += area(r - 1, c);
    total += area(r, c + 1);
    total += area(r, c - 1);

    return total;
  }

  let best = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      best = Math.max(best, area(r, c));
    }
  }

  return best;
}

// @@ 92
function pacificAtlantic(heights) {

  const rows = heights.length;
  const cols = heights[0].length;

  const pacific = [];
  const atlantic = [];

  for (let r = 0; r < rows; r++) {
    pacific.push(new Array(cols).fill(false));
    atlantic.push(new Array(cols).fill(false));
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function dfs(ocean, r, c) {

    if (ocean[r][c]) {
      return;
    }

    ocean[r][c] = true;

    for (const dir of dirs) {

      const nr = r + dir[0];
      const nc = c + dir[1];

      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
        continue;
      }

      // from the ocean we can only climb up (or stay level)
      if (heights[nr][nc] >= heights[r][c]) {
        dfs(ocean, nr, nc);
      }
    }
  }

  // top row + bottom row
  for (let c = 0; c < cols; c++) {
    dfs(pacific, 0, c);
    dfs(atlantic, rows - 1, c);
  }

  // left column + right column
  for (let r = 0; r < rows; r++) {
    dfs(pacific, r, 0);
    dfs(atlantic, r, cols - 1);
  }

  const result = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pacific[r][c] && atlantic[r][c]) {
        result.push([r, c]);
      }
    }
  }

  return result;
}

// @@ 93
function solve(board) {

  const rows = board.length;
  const cols = board[0].length;

  function mark(r, c) {

    if (r < 0 || c < 0 || r >= rows || c >= cols) {
      return;
    }

    if (board[r][c] !== 'O') {
      return;
    }

    board[r][c] = 'T'; // safe: connected to the border

    mark(r + 1, c);
    mark(r - 1, c);
    mark(r, c + 1);
    mark(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    mark(r, 0);
    mark(r, cols - 1);
  }

  for (let c = 0; c < cols; c++) {
    mark(0, c);
    mark(rows - 1, c);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      if (board[r][c] === 'O') {
        board[r][c] = 'X';
      }

      else if (board[r][c] === 'T') {
        board[r][c] = 'O';
      }
    }
  }
}

// @@ 94
function orangesRotting(grid) {

  const rows = grid.length;
  const cols = grid[0].length;
  let fresh = 0;

  let queue = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      if (grid[r][c] === 2) {
        queue.push([r, c]);
      }

      else if (grid[r][c] === 1) {
        fresh++;
      }
    }
  }

  let minutes = 0;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0 && fresh > 0) {

    // one BFS level = one minute
    const nextLevel = [];

    for (const cell of queue) {
      for (const dir of dirs) {

        const nr = cell[0] + dir[0];
        const nc = cell[1] + dir[1];

        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
          continue;
        }

        if (grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          nextLevel.push([nr, nc]);
        }
      }
    }

    queue = nextLevel;
    minutes++;
  }

  if (fresh > 0) {
    return -1;
  }

  return minutes;
}

// @@ 95
function updateMatrix(mat) {

  const rows = mat.length;
  const cols = mat[0].length;

  const dist = [];
  const queue = [];

  // every zero is a source; everything else starts unvisited (-1)
  for (let r = 0; r < rows; r++) {

    dist.push(new Array(cols).fill(-1));

    for (let c = 0; c < cols; c++) {
      if (mat[r][c] === 0) {
        dist[r][c] = 0;
        queue.push([r, c]);
      }
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let head = 0; // index of the next cell to process

  while (head < queue.length) {

    const r = queue[head][0];
    const c = queue[head][1];
    head++;

    for (const dir of dirs) {

      const nr = r + dir[0];
      const nc = c + dir[1];

      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
        continue;
      }

      if (dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }

  return dist;
}

// @@ 96
function canFinish(numCourses, prerequisites) {

  const graph = [];
  const indegree = new Array(numCourses).fill(0);

  for (let i = 0; i < numCourses; i++) {
    graph.push([]);
  }

  // [course, pre] means pre -> course
  for (const prereq of prerequisites) {
    const course = prereq[0];
    const pre = prereq[1];
    graph[pre].push(course);
    indegree[course]++;
  }

  const queue = [];

  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) {
      queue.push(i);
    }
  }

  let head = 0; // index of the next course to take
  let taken = 0;

  while (head < queue.length) {

    const course = queue[head];
    head++;
    taken++;

    for (const next of graph[course]) {
      indegree[next]--;
      if (indegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  return taken === numCourses;
}

// @@ 97
function findOrder(numCourses, prerequisites) {

  const graph = [];
  const indegree = new Array(numCourses).fill(0);

  for (let i = 0; i < numCourses; i++) {
    graph.push([]);
  }

  // [course, pre] means pre -> course
  for (const prereq of prerequisites) {
    const course = prereq[0];
    const pre = prereq[1];
    graph[pre].push(course);
    indegree[course]++;
  }

  const queue = [];

  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) {
      queue.push(i);
    }
  }

  let head = 0; // index of the next course to take
  const order = [];

  while (head < queue.length) {

    const course = queue[head];
    head++;
    order.push(course);

    for (const next of graph[course]) {
      indegree[next]--;
      if (indegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  // a cycle leaves some courses untaken
  if (order.length < numCourses) {
    return [];
  }

  return order;
}

// @@ 98
function findRedundantConnection(edges) {

  const n = edges.length;
  const parent = [];

  for (let i = 0; i <= n; i++) {
    parent.push(i);
  }

  function find(x) {

    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path halving
      x = parent[x];
    }

    return x;
  }

  for (const edge of edges) {

    const rootA = find(edge[0]);
    const rootB = find(edge[1]);

    // already connected: this edge closes a cycle
    if (rootA === rootB) {
      return edge;
    }

    parent[rootA] = rootB;
  }

  return [];
}

// @@ 99
function findCircleNum(isConnected) {

  const n = isConnected.length;
  const visited = new Array(n).fill(false);

  function dfs(city) {

    for (let j = 0; j < n; j++) {

      if (isConnected[city][j] === 1 && !visited[j]) {
        visited[j] = true;
        dfs(j);
      }
    }
  }

  let provinces = 0;

  for (let i = 0; i < n; i++) {

    if (visited[i]) {
      continue;
    }

    visited[i] = true;
    dfs(i);
    provinces++;
  }

  return provinces;
}

// @@ 100
function makeConnected(n, connections) {

  // not enough cables
  if (connections.length < n - 1) {
    return -1;
  }

  const parent = [];

  for (let i = 0; i < n; i++) {
    parent.push(i);
  }

  function find(x) {

    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }

    return x;
  }

  let components = n;

  for (const cable of connections) {

    const rootA = find(cable[0]);
    const rootB = find(cable[1]);

    if (rootA !== rootB) {
      parent[rootA] = rootB;
      components--;
    }
  }

  return components - 1;
}

// @@ 101
function ladderLength(beginWord, endWord, wordList) {

  const words = new Set(wordList);

  if (!words.has(endWord)) {
    return 0;
  }

  words.add(beginWord);

  // "h*t" -> every word matching that pattern
  const buckets = new Map();

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {

      const pattern = word.slice(0, i) + '*' + word.slice(i + 1);

      if (!buckets.has(pattern)) {
        buckets.set(pattern, []);
      }

      buckets.get(pattern).push(word);
    }
  }

  let queue = [beginWord];

  const visited = new Set();
  visited.add(beginWord);

  let steps = 1;

  while (queue.length > 0) {

    const nextLevel = [];

    for (const word of queue) {

      if (word === endWord) {
        return steps;
      }

      for (let i = 0; i < word.length; i++) {

        const pattern = word.slice(0, i) + '*' + word.slice(i + 1);

        for (const next of buckets.get(pattern)) {
          if (!visited.has(next)) {
            visited.add(next);
            nextLevel.push(next);
          }
        }
      }
    }

    queue = nextLevel;
    steps++;
  }

  return 0;
}
