// Week 9 — Intervals, Math & Geometry, Bit Manipulation.

// @@ 140
class MyCalendar {
  constructor() {
    this.booked = [];
  }

  book(start, end) {

    for (const interval of this.booked) {

      const bookedStart = interval[0];
      const bookedEnd = interval[1];

      // half-open intervals overlap
      if (start < bookedEnd && bookedStart < end) {
        return false;
      }
    }

    this.booked.push([start, end]);
    return true;
  }
}

// @@ 141
function insert(intervals, newInterval) {

  const ans = [];

  let start = newInterval[0];
  let end = newInterval[1];

  const n = intervals.length;
  let i = 0;

  // intervals that end before the new one starts
  while (i < n && intervals[i][1] < start) {
    ans.push(intervals[i]);
    i++;
  }

  // intervals that overlap the new one: merge them
  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }

  ans.push([start, end]);

  // intervals after the new one
  while (i < n) {
    ans.push(intervals[i]);
    i++;
  }

  return ans;
}

// @@ 142
function merge(intervals) {

  intervals.sort((a, b) => a[0] - b[0]);

  const merged = [];

  for (const interval of intervals) {

    const start = interval[0];
    const end = interval[1];

    if (merged.length > 0 && start <= merged[merged.length - 1][1]) {
      const last = merged[merged.length - 1];
      last[1] = Math.max(last[1], end);
    }

    else {
      merged.push([start, end]);
    }
  }

  return merged;
}

// @@ 143
function eraseOverlapIntervals(intervals) {

  intervals.sort((a, b) => a[1] - b[1]);

  let kept = 0;
  let prevEnd = -Infinity;

  for (const interval of intervals) {

    const start = interval[0];
    const end = interval[1];

    if (start >= prevEnd) {
      kept++;
      prevEnd = end;
    }
  }

  return intervals.length - kept;
}

// @@ 144
function carPooling(trips, capacity) {

  const diff = new Array(1001).fill(0);

  for (const trip of trips) {

    const passengers = trip[0];
    const from = trip[1];
    const to = trip[2];

    diff[from] += passengers;
    diff[to] -= passengers;
  }

  let load = 0;

  for (let pos = 0; pos < diff.length; pos++) {

    load += diff[pos];

    if (load > capacity) {
      return false;
    }
  }

  return true;
}

// @@ 145
function minInterval(intervals, queries) {

  intervals.sort((a, b) => a[0] - b[0]);

  // [query value, original index], sorted by value
  const sortedQueries = [];
  for (let i = 0; i < queries.length; i++) {
    sortedQueries.push([queries[i], i]);
  }
  sortedQueries.sort((a, b) => a[0] - b[0]);

  // min-heap of [size, right end]
  const heap = new Heap((a, b) => a[0] < b[0]);

  const ans = new Array(queries.length);
  let i = 0;

  for (const query of sortedQueries) {

    const q = query[0];
    const index = query[1];

    while (i < intervals.length && intervals[i][0] <= q) {
      const left = intervals[i][0];
      const right = intervals[i][1];
      heap.push([right - left + 1, right]);
      i++;
    }

    while (heap.size > 0 && heap.peek()[1] < q) {
      heap.pop();
    }

    if (heap.size === 0) {
      ans[index] = -1;
    }

    else {
      ans[index] = heap.peek()[0];
    }
  }

  return ans;
}

// @@ 147
function isHappy(n) {

  function next(x) {

    let sum = 0;

    while (x > 0) {
      const digit = x % 10;
      sum += digit * digit;
      x = Math.floor(x / 10);
    }

    return sum;
  }

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

  // transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }

  // reverse each row
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
}

// @@ 149
function spiralOrder(matrix) {

  const res = [];

  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {

    for (let col = left; col <= right; col++) {
      res.push(matrix[top][col]);
    }
    top++;

    for (let row = top; row <= bottom; row++) {
      res.push(matrix[row][right]);
    }
    right--;

    if (top <= bottom) {
      for (let col = right; col >= left; col--) {
        res.push(matrix[bottom][col]);
      }
      bottom--;
    }

    if (left <= right) {
      for (let row = bottom; row >= top; row--) {
        res.push(matrix[row][left]);
      }
      left++;
    }
  }

  return res;
}

// @@ 150
function setZeroes(matrix) {

  const rows = matrix.length;
  const cols = matrix[0].length;

  let firstRowZero = false;
  let firstColZero = false;

  for (let c = 0; c < cols; c++) {
    if (matrix[0][c] === 0) {
      firstRowZero = true;
    }
  }

  for (let r = 0; r < rows; r++) {
    if (matrix[r][0] === 0) {
      firstColZero = true;
    }
  }

  // use row 0 and column 0 as markers
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      if (matrix[r][c] === 0) {
        matrix[r][0] = 0;
        matrix[0][c] = 0;
      }
    }
  }

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) {
        matrix[r][c] = 0;
      }
    }
  }

  if (firstRowZero) {
    for (let c = 0; c < cols; c++) {
      matrix[0][c] = 0;
    }
  }

  if (firstColZero) {
    for (let r = 0; r < rows; r++) {
      matrix[r][0] = 0;
    }
  }
}

// @@ 152
function singleNumber(nums) {

  let res = 0;

  // pairs cancel out
  for (const num of nums) {
    res ^= num;
  }

  return res;
}

// @@ 153
function hammingWeight(n) {

  let count = 0;

  while (n !== 0) {
    n = n & (n - 1); // clear the lowest set bit
    count++;
  }

  return count;
}

// @@ 154
function countBits(n) {

  const bits = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    bits[i] = bits[i >> 1] + (i & 1);
  }

  return bits;
}

// @@ 155
function reverseBits(n) {

  let res = 0;

  for (let i = 0; i < 32; i++) {

    const lowestBit = n & 1;

    res = res << 1;
    res = res | lowestBit;

    n = n >>> 1;
  }

  return res >>> 0; // read the 32 bits as unsigned
}

// @@ 156
function missingNumber(nums) {

  const n = nums.length;
  let res = n;

  // every present number cancels with its index
  for (let i = 0; i < n; i++) {
    res ^= i;
    res ^= nums[i];
  }

  return res;
}
