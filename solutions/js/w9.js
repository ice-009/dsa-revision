// Week 9 — Intervals, Math & Geometry, Bit Manipulation.

// @@ 140
class MyCalendar {
  constructor() {
    this.booked = []; // half-open [start, end)
  }

  book(start, end) {
    for (const [s, e] of this.booked) if (start < e && s < end) return false; // overlap
    this.booked.push([start, end]);
    return true;
  }
}

// @@ 141
function insert(intervals, newInterval) {
  const res = [];
  let [s, e] = newInterval;
  let i = 0;
  const n = intervals.length;
  while (i < n && intervals[i][1] < s) res.push(intervals[i++]); // entirely before
  while (i < n && intervals[i][0] <= e) { // overlapping: merge
    s = Math.min(s, intervals[i][0]);
    e = Math.max(e, intervals[i][1]);
    i++;
  }
  res.push([s, e]);
  while (i < n) res.push(intervals[i++]); // entirely after
  return res;
}

// @@ 142
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]); // by start
  const merged = [];
  for (const [s, e] of intervals) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return merged;
}

// @@ 143
function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]); // by end
  let kept = 0, prevEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= prevEnd) { // fits after the last kept one
      kept++;
      prevEnd = e;
    }
  }
  return intervals.length - kept;
}

// @@ 144
function carPooling(trips, capacity) {
  const diff = new Array(1001).fill(0);
  for (const [p, from, to] of trips) {
    diff[from] += p; // passengers get in at `from`
    diff[to] -= p; // and leave at `to`
  }
  let load = 0;
  for (const change of diff) {
    load += change;
    if (load > capacity) return false;
  }
  return true;
}

// @@ 145
function minInterval(intervals, queries) {
  intervals.sort((a, b) => a[0] - b[0]); // by start
  const order = queries.map((_, i) => i).sort((a, b) => queries[a] - queries[b]);
  const heap = new Heap((a, b) => a[0] < b[0]); // [size, right end], smallest first
  const ans = new Array(queries.length);
  let i = 0;
  for (const qi of order) {
    const q = queries[qi];
    while (i < intervals.length && intervals[i][0] <= q) {
      const [l, r] = intervals[i++];
      heap.push([r - l + 1, r]);
    }
    while (heap.size && heap.peek()[1] < q) heap.pop(); // ends before q
    ans[qi] = heap.size ? heap.peek()[0] : -1;
  }
  return ans;
}

// @@ 147
function isHappy(n) {
  const next = x => {
    let s = 0;
    for (; x > 0; x = Math.floor(x / 10)) s += (x % 10) ** 2;
    return s;
  };
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = next(n);
  }
  return n === 1;
}

// @@ 148
function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]]; // transpose
  for (const row of matrix) row.reverse(); // mirror each row
}

// @@ 149
function spiralOrder(matrix) {
  const res = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) res.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) res.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) res.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) res.push(matrix[r][left]);
      left++;
    }
  }
  return res;
}

// @@ 150
function setZeroes(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const firstRow = matrix[0].some(v => v === 0);
  const firstCol = matrix.some(row => row[0] === 0);
  for (let r = 1; r < rows; r++)
    for (let c = 1; c < cols; c++)
      if (matrix[r][c] === 0) matrix[r][0] = matrix[0][c] = 0; // markers
  for (let r = 1; r < rows; r++)
    for (let c = 1; c < cols; c++)
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
  if (firstRow) matrix[0].fill(0);
  if (firstCol) for (const row of matrix) row[0] = 0;
}

// @@ 152
function singleNumber(nums) {
  let res = 0;
  for (const x of nums) res ^= x; // pairs cancel out
  return res;
}

// @@ 153
function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1; // clear the lowest set bit
    count++;
  }
  return count;
}

// @@ 154
function countBits(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}

// @@ 155
function reverseBits(n) {
  let res = 0;
  for (let i = 0; i < 32; i++) {
    res = (res << 1) | (n & 1); // move n's lowest bit onto res
    n >>>= 1;
  }
  return res >>> 0; // read the 32 bits as unsigned
}

// @@ 156
function missingNumber(nums) {
  let res = nums.length;
  for (let i = 0; i < nums.length; i++) res ^= i ^ nums[i]; // indices cancel values
  return res;
}
