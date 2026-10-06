// Week 5 — Heap / Priority Queue, Backtracking. (Heap class: see _heap.js, added automatically.)

// @@ 73
class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new Heap((a, b) => a < b); // min-heap of the k largest
    for (const x of nums) this.add(x);
  }

  add(val) {
    this.heap.push(val);
    if (this.heap.size > this.k) this.heap.pop();
    return this.heap.peek();
  }
}

// @@ 74
function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => a > b); // max-heap
  for (const s of stones) heap.push(s);
  while (heap.size > 1) {
    const a = heap.pop(), b = heap.pop();
    if (a !== b) heap.push(a - b);
  }
  return heap.size ? heap.peek() : 0;
}

// @@ 75
function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(a) > dist(b)); // max-heap by distance², size k
  for (const p of points) {
    heap.push(p);
    if (heap.size > k) heap.pop(); // drop the farthest
  }
  return heap.a;
}

// @@ 76
function findKthLargest(nums, k) {
  const heap = new Heap((a, b) => a < b); // min-heap of the k largest
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop();
  }
  return heap.peek();
}

// @@ 77
function leastInterval(tasks, n) {
  const count = new Array(26).fill(0);
  for (const t of tasks) count[t.charCodeAt(0) - 65]++;
  const maxF = Math.max(...count);
  const nMax = count.filter(c => c === maxF).length;
  return Math.max(tasks.length, (maxF - 1) * (n + 1) + nMax);
}

// @@ 78
class Twitter {
  constructor() {
    this.time = 0;
    this.tweets = new Map(); // user -> [[time, tweetId]], oldest first
    this.follows = new Map(); // user -> Set of followees
  }

  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push([this.time++, tweetId]);
  }

  getNewsFeed(userId) {
    const heap = new Heap((a, b) => a[0] > b[0]); // newest first: [time, tweetId, user, index]
    const users = new Set(this.follows.get(userId) || []);
    users.add(userId);
    for (const u of users) {
      const t = this.tweets.get(u);
      if (t && t.length) heap.push([...t[t.length - 1], u, t.length - 1]);
    }
    const feed = [];
    while (heap.size && feed.length < 10) {
      const [, id, u, i] = heap.pop();
      feed.push(id);
      if (i > 0) heap.push([...this.tweets.get(u)[i - 1], u, i - 1]);
    }
    return feed;
  }

  follow(followerId, followeeId) {
    if (followerId === followeeId) return;
    if (!this.follows.has(followerId)) this.follows.set(followerId, new Set());
    this.follows.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    const s = this.follows.get(followerId);
    if (s) s.delete(followeeId);
  }
}

// @@ 79
class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => a > b); // max-heap: smaller half
    this.high = new Heap((a, b) => a < b); // min-heap: larger half
  }

  addNum(num) {
    this.low.push(num);
    this.high.push(this.low.pop()); // keep every low <= every high
    if (this.high.size > this.low.size) this.low.push(this.high.pop()); // low may hold one extra
  }

  findMedian() {
    if (this.low.size > this.high.size) return this.low.peek();
    return (this.low.peek() + this.high.peek()) / 2;
  }
}

// @@ 81
function subsets(nums) {
  const res = [], path = [];
  const bt = start => {
    res.push([...path]); // every node is a subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      bt(i + 1);
      path.pop();
    }
  };
  bt(0);
  return res;
}

// @@ 82
function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const res = [], path = [];
  const bt = (start, remaining) => {
    if (remaining === 0) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // sorted, so nothing later fits either
      path.push(candidates[i]);
      bt(i, remaining - candidates[i]); // i, not i + 1: reuse allowed
      path.pop();
    }
  };
  bt(0, target);
  return res;
}

// @@ 83
function permute(nums) {
  const res = [], path = [];
  const used = new Array(nums.length).fill(false);
  const bt = () => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      bt();
      path.pop();
      used[i] = false;
    }
  };
  bt();
  return res;
}

// @@ 84
function subsetsWithDup(nums) {
  nums.sort((a, b) => a - b);
  const res = [], path = [];
  const bt = start => {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue; // same value at the same depth
      path.push(nums[i]);
      bt(i + 1);
      path.pop();
    }
  };
  bt(0);
  return res;
}

// @@ 85
function exist(board, word) {
  const rows = board.length, cols = board[0].length;
  const dfs = (r, c, i) => {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false;
    board[r][c] = '#'; // mark visited
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = word[i]; // restore
    return found;
  };
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}

// @@ 86
function partition(s) {
  const res = [], path = [];
  const isPal = (l, r) => {
    while (l < r) if (s[l++] !== s[r--]) return false;
    return true;
  };
  const bt = start => {
    if (start === s.length) {
      res.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;
      path.push(s.slice(start, end + 1));
      bt(end + 1);
      path.pop();
    }
  };
  bt(0);
  return res;
}

// @@ 87
function solveNQueens(n) {
  const res = [];
  const board = Array.from({ length: n }, () => new Array(n).fill('.'));
  const cols = new Set(), diag = new Set(), anti = new Set(); // diag = r - c, anti = r + c
  const bt = r => {
    if (r === n) {
      res.push(board.map(row => row.join('')));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(r - c) || anti.has(r + c)) continue;
      cols.add(c); diag.add(r - c); anti.add(r + c);
      board[r][c] = 'Q';
      bt(r + 1);
      board[r][c] = '.';
      cols.delete(c); diag.delete(r - c); anti.delete(r + c);
    }
  };
  bt(0);
  return res;
}
