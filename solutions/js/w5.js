// Week 5 — Heap / Priority Queue, Backtracking. (Heap class: see _heap.js, added automatically.)

// @@ 73
class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.minHeap = new Heap((a, b) => a < b); // holds the k largest values

    for (const num of nums) {
      this.add(num);
    }
  }

  add(val) {
    this.minHeap.push(val);

    if (this.minHeap.size > this.k) {
      this.minHeap.pop();
    }

    return this.minHeap.peek();
  }
}

// @@ 74
function lastStoneWeight(stones) {

  const maxHeap = new Heap((a, b) => a > b);

  for (const stone of stones) {
    maxHeap.push(stone);
  }

  while (maxHeap.size > 1) {

    const first = maxHeap.pop();
    const second = maxHeap.pop();

    if (first !== second) {
      maxHeap.push(first - second);
    }
  }

  if (maxHeap.size === 0) {
    return 0;
  }

  return maxHeap.peek();
}

// @@ 75
function kClosest(points, k) {

  function dist(point) {
    return point[0] * point[0] + point[1] * point[1];
  }

  // max-heap by distance²: the farthest point is on top
  const maxHeap = new Heap((a, b) => dist(a) > dist(b));

  for (const point of points) {
    maxHeap.push(point);

    if (maxHeap.size > k) {
      maxHeap.pop();
    }
  }

  const ans = [];

  while (maxHeap.size > 0) {
    ans.push(maxHeap.pop());
  }

  return ans;
}

// @@ 76
function findKthLargest(nums, k) {

  const minHeap = new Heap((a, b) => a < b); // holds the k largest values

  for (const num of nums) {
    minHeap.push(num);

    if (minHeap.size > k) {
      minHeap.pop();
    }
  }

  return minHeap.peek();
}

// @@ 77
function leastInterval(tasks, n) {

  const count = new Array(26).fill(0);

  for (const task of tasks) {
    count[task.charCodeAt(0) - 65]++;
  }

  let maxFreq = 0;

  for (let i = 0; i < 26; i++) {
    maxFreq = Math.max(maxFreq, count[i]);
  }

  let maxCount = 0;

  for (let i = 0; i < 26; i++) {
    if (count[i] === maxFreq) {
      maxCount++;
    }
  }

  const frames = (maxFreq - 1) * (n + 1) + maxCount;

  return Math.max(tasks.length, frames);
}

// @@ 78
class Twitter {
  constructor() {
    this.time = 0;
    this.tweets = new Map(); // user -> [[time, tweetId]], oldest first
    this.follows = new Map(); // user -> Set of followees
  }

  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) {
      this.tweets.set(userId, []);
    }

    this.tweets.get(userId).push([this.time, tweetId]);
    this.time++;
  }

  getNewsFeed(userId) {

    // each entry: [time, tweetId, user, index], newest on top
    const maxHeap = new Heap((a, b) => a[0] > b[0]);

    const users = [userId];

    if (this.follows.has(userId)) {
      for (const followee of this.follows.get(userId)) {
        users.push(followee);
      }
    }

    for (const user of users) {
      const list = this.tweets.get(user);

      if (list && list.length > 0) {
        const index = list.length - 1;
        maxHeap.push([list[index][0], list[index][1], user, index]);
      }
    }

    const feed = [];

    while (maxHeap.size > 0 && feed.length < 10) {

      const top = maxHeap.pop();

      const tweetId = top[1];
      const user = top[2];
      const index = top[3];

      feed.push(tweetId);

      if (index > 0) {
        const older = this.tweets.get(user)[index - 1];
        maxHeap.push([older[0], older[1], user, index - 1]);
      }
    }

    return feed;
  }

  follow(followerId, followeeId) {
    if (followerId === followeeId) {
      return;
    }

    if (!this.follows.has(followerId)) {
      this.follows.set(followerId, new Set());
    }

    this.follows.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    if (this.follows.has(followerId)) {
      this.follows.get(followerId).delete(followeeId);
    }
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

    // move the biggest of low into high, so every low <= every high
    this.high.push(this.low.pop());

    // low may hold one extra, never high
    if (this.high.size > this.low.size) {
      this.low.push(this.high.pop());
    }
  }

  findMedian() {
    if (this.low.size > this.high.size) {
      return this.low.peek();
    }

    return (this.low.peek() + this.high.peek()) / 2;
  }
}

// @@ 81
function subsets(nums) {

  const res = [];
  const path = [];

  function backtrack(start) {

    res.push([...path]); // every node is a subset

    for (let i = start; i < nums.length; i++) {

      path.push(nums[i]);

      backtrack(i + 1);

      path.pop();
    }
  }

  backtrack(0);
  return res;
}

// @@ 82
function combinationSum(candidates, target) {

  candidates.sort((a, b) => a - b);

  const res = [];
  const path = [];

  function backtrack(start, remaining) {

    if (remaining === 0) {
      res.push([...path]);
      return;
    }

    for (let i = start; i < candidates.length; i++) {

      // sorted, so nothing after this fits either
      if (candidates[i] > remaining) {
        break;
      }

      path.push(candidates[i]);

      backtrack(i, remaining - candidates[i]); // i, not i + 1: reuse allowed

      path.pop();
    }
  }

  backtrack(0, target);
  return res;
}

// @@ 83
function permute(nums) {

  const res = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {

    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {

      if (used[i]) {
        continue;
      }

      used[i] = true;
      path.push(nums[i]);

      backtrack();

      path.pop();
      used[i] = false;
    }
  }

  backtrack();
  return res;
}

// @@ 84
function subsetsWithDup(nums) {

  nums.sort((a, b) => a - b);

  const res = [];
  const path = [];

  function backtrack(start) {

    res.push([...path]);

    for (let i = start; i < nums.length; i++) {

      // skip the same value at the same depth
      if (i > start && nums[i] === nums[i - 1]) {
        continue;
      }

      path.push(nums[i]);

      backtrack(i + 1);

      path.pop();
    }
  }

  backtrack(0);
  return res;
}

// @@ 85
function exist(board, word) {

  const rows = board.length;
  const cols = board[0].length;

  function dfs(r, c, i) {

    if (i === word.length) {
      return true;
    }

    if (r < 0 || c < 0 || r >= rows || c >= cols) {
      return false;
    }

    if (board[r][c] !== word[i]) {
      return false;
    }

    board[r][c] = '#'; // mark visited

    const found = dfs(r + 1, c, i + 1)
               || dfs(r - 1, c, i + 1)
               || dfs(r, c + 1, i + 1)
               || dfs(r, c - 1, i + 1);

    board[r][c] = word[i]; // restore

    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) {
        return true;
      }
    }
  }

  return false;
}

// @@ 86
function partition(s) {

  const res = [];
  const path = [];

  function isPalindrome(left, right) {
    while (left < right) {
      if (s[left] !== s[right]) {
        return false;
      }

      left++;
      right--;
    }

    return true;
  }

  function backtrack(start) {

    if (start === s.length) {
      res.push([...path]);
      return;
    }

    for (let end = start; end < s.length; end++) {

      if (!isPalindrome(start, end)) {
        continue;
      }

      path.push(s.slice(start, end + 1));

      backtrack(end + 1);

      path.pop();
    }
  }

  backtrack(0);
  return res;
}

// @@ 87
function solveNQueens(n) {

  const res = [];
  const cols = new Set();
  const diag = new Set(); // r - c
  const anti = new Set(); // r + c

  const board = [];

  for (let i = 0; i < n; i++) {
    board.push(new Array(n).fill('.'));
  }

  function backtrack(r) {

    if (r === n) {
      const rows = [];

      for (const row of board) {
        rows.push(row.join(''));
      }

      res.push(rows);
      return;
    }

    for (let c = 0; c < n; c++) {

      if (cols.has(c) || diag.has(r - c) || anti.has(r + c)) {
        continue;
      }

      cols.add(c);
      diag.add(r - c);
      anti.add(r + c);
      board[r][c] = 'Q';

      backtrack(r + 1);

      board[r][c] = '.';
      cols.delete(c);
      diag.delete(r - c);
      anti.delete(r + c);
    }
  }

  backtrack(0);
  return res;
}
