// Week 2 — Sliding Window, Stack.

// @@ 19
function maxProfit(prices) {

  let lowest = Infinity;
  let best = 0;

  for (const price of prices) {
    lowest = Math.min(lowest, price);
    best = Math.max(best, price - lowest);
  }

  return best;
}

// @@ 20
function lengthOfLongestSubstring(s) {

  const last = new Map(); // last index of each character

  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {

    const ch = s[right];

    if (last.has(ch) && last.get(ch) >= left) {
      left = last.get(ch) + 1;
    }

    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}

// @@ 21
function characterReplacement(s, k) {

  const count = new Array(26).fill(0);

  let left = 0;
  let maxFreq = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {

    const idx = s.charCodeAt(right) - 65;
    count[idx]++;
    maxFreq = Math.max(maxFreq, count[idx]);

    while (right - left + 1 - maxFreq > k) {
      count[s.charCodeAt(left) - 65]--;
      left++;
    }

    best = Math.max(best, right - left + 1);
  }

  return best;
}

// @@ 22
function checkInclusion(s1, s2) {

  const n = s1.length;
  const m = s2.length;

  if (n > m) {
    return false;
  }

  const need = new Array(26).fill(0);
  const window = new Array(26).fill(0);

  for (let i = 0; i < n; i++) {
    need[s1.charCodeAt(i) - 97]++;
    window[s2.charCodeAt(i) - 97]++;
  }

  function sameCounts() {
    for (let i = 0; i < 26; i++) {
      if (need[i] !== window[i]) {
        return false;
      }
    }
    return true;
  }

  if (sameCounts()) {
    return true;
  }

  for (let right = n; right < m; right++) {

    window[s2.charCodeAt(right) - 97]++;
    window[s2.charCodeAt(right - n) - 97]--;

    if (sameCounts()) {
      return true;
    }
  }

  return false;
}

// @@ 23
function maxSlidingWindow(nums, k) {

  const dq = []; // indices, values decreasing from front to back
  let front = 0; // dq[front] is the real front (avoids O(n) shift)
  const ans = [];

  for (let right = 0; right < nums.length; right++) {

    while (dq.length > front && nums[dq[dq.length - 1]] < nums[right]) {
      dq.pop();
    }

    dq.push(right);

    if (dq[front] <= right - k) {
      front++;
    }

    if (right >= k - 1) {
      ans.push(nums[dq[front]]);
    }
  }

  return ans;
}

// @@ 24
function minWindow(s, t) {

  if (s.length === 0 || t.length === 0) {
    return '';
  }

  const need = new Map();
  for (const ch of t) {
    need.set(ch, (need.get(ch) || 0) + 1);
  }

  const window = new Map();
  const required = need.size;

  let have = 0;
  let left = 0;
  let bestLen = Infinity;
  let bestStart = 0;

  for (let right = 0; right < s.length; right++) {

    const ch = s[right];
    window.set(ch, (window.get(ch) || 0) + 1);

    if (need.has(ch) && window.get(ch) === need.get(ch)) {
      have++;
    }

    while (have === required) {

      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }

      const out = s[left];
      if (need.has(out) && window.get(out) === need.get(out)) {
        have--;
      }
      window.set(out, window.get(out) - 1);

      left++;
    }
  }

  if (bestLen === Infinity) {
    return '';
  }

  return s.slice(bestStart, bestStart + bestLen);
}

// @@ 26
function isValid(s) {

  const match = { ')': '(', ']': '[', '}': '{' };
  const stack = [];

  for (const ch of s) {

    if (ch in match) {

      if (stack.length === 0 || stack[stack.length - 1] !== match[ch]) {
        return false;
      }

      stack.pop();
    }

    else {
      stack.push(ch);
    }
  }

  return stack.length === 0;
}

// @@ 27
class MinStack {
  constructor() {
    this.stack = []; // [value, min so far]
  }

  push(val) {

    let low = val;

    if (this.stack.length > 0) {
      low = Math.min(val, this.stack[this.stack.length - 1][1]);
    }

    this.stack.push([val, low]);
  }

  pop() {
    this.stack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1][0];
  }

  getMin() {
    return this.stack[this.stack.length - 1][1];
  }
}

// @@ 28
function evalRPN(tokens) {

  const stack = [];

  for (const token of tokens) {

    if (token === '+' || token === '-' || token === '*' || token === '/') {

      const b = stack.pop();
      const a = stack.pop();

      if (token === '+') {
        stack.push(a + b);
      }
      else if (token === '-') {
        stack.push(a - b);
      }
      else if (token === '*') {
        stack.push(a * b);
      }
      else {
        stack.push(Math.trunc(a / b)); // truncate toward zero
      }
    }

    else {
      stack.push(Number(token));
    }
  }

  return stack[0];
}

// @@ 29
function generateParenthesis(n) {

  const ans = [];

  function backtrack(curr, opened, closed) {

    if (curr.length === 2 * n) {
      ans.push(curr);
      return;
    }

    if (opened < n) {
      backtrack(curr + '(', opened + 1, closed);
    }

    if (closed < opened) {
      backtrack(curr + ')', opened, closed + 1);
    }
  }

  backtrack('', 0, 0);

  return ans;
}

// @@ 30
function dailyTemperatures(temperatures) {

  const n = temperatures.length;
  const ans = new Array(n).fill(0);
  const stack = []; // indices still waiting, temps decreasing

  for (let i = 0; i < n; i++) {

    while (stack.length > 0 && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const j = stack.pop();
      ans[j] = i - j;
    }

    stack.push(i);
  }

  return ans;
}

// @@ 31
function carFleet(target, position, speed) {

  const n = position.length;

  const cars = [];
  for (let i = 0; i < n; i++) {
    cars.push([position[i], speed[i]]);
  }

  // closest to target first
  cars.sort(function (a, b) {
    return b[0] - a[0];
  });

  const stack = []; // arrival time of each fleet

  for (const car of cars) {

    const time = (target - car[0]) / car[1];

    if (stack.length === 0 || time > stack[stack.length - 1]) {
      stack.push(time);
    }
  }

  return stack.length;
}

// @@ 32
function largestRectangleArea(heights) {

  const n = heights.length;
  const stack = []; // [start index, height], heights increasing
  let best = 0;

  for (let i = 0; i < n; i++) {

    let start = i;

    while (stack.length > 0 && stack[stack.length - 1][1] > heights[i]) {

      const top = stack.pop();
      const idx = top[0];
      const height = top[1];

      best = Math.max(best, height * (i - idx));
      start = idx;
    }

    stack.push([start, heights[i]]);
  }

  while (stack.length > 0) {

    const top = stack.pop();
    const idx = top[0];
    const height = top[1];

    best = Math.max(best, height * (n - idx));
  }

  return best;
}
