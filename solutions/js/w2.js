// Week 2 — Sliding Window, Stack.

// @@ 19
function maxProfit(prices) {
  let lowest = Infinity, best = 0;
  for (const p of prices) {
    lowest = Math.min(lowest, p);
    best = Math.max(best, p - lowest);
  }
  return best;
}

// @@ 20
function lengthOfLongestSubstring(s) {
  const last = new Map(); // last index of each character
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r])) l = Math.max(l, last.get(s[r]) + 1);
    last.set(s[r], r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}

// @@ 21
function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  let l = 0, maxF = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    maxF = Math.max(maxF, ++count[s.charCodeAt(r) - 65]);
    while (r - l + 1 - maxF > k) {
      count[s.charCodeAt(l) - 65]--;
      l++;
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}

// @@ 22
function checkInclusion(s1, s2) {
  const n = s1.length;
  if (n > s2.length) return false;
  const need = new Array(26).fill(0), window = new Array(26).fill(0);
  for (let i = 0; i < n; i++) {
    need[s1.charCodeAt(i) - 97]++;
    window[s2.charCodeAt(i) - 97]++;
  }
  const same = () => need.every((v, i) => v === window[i]);
  if (same()) return true;
  for (let r = n; r < s2.length; r++) {
    window[s2.charCodeAt(r) - 97]++;
    window[s2.charCodeAt(r - n) - 97]--;
    if (same()) return true;
  }
  return false;
}

// @@ 23
function maxSlidingWindow(nums, k) {
  const q = []; // indices, values decreasing
  let head = 0; // q[head] is the front (avoids O(n) shift)
  const res = [];
  for (let r = 0; r < nums.length; r++) {
    while (q.length > head && nums[q[q.length - 1]] < nums[r]) q.pop();
    q.push(r);
    if (q[head] <= r - k) head++;
    if (r >= k - 1) res.push(nums[q[head]]);
  }
  return res;
}

// @@ 24
function minWindow(s, t) {
  if (!s || !t) return '';
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  const window = new Map();
  const required = need.size;
  let have = 0, bestLen = Infinity, bestL = 0, l = 0;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    window.set(c, (window.get(c) || 0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) have++;
    while (have === required) {
      if (r - l + 1 < bestLen) {
        bestLen = r - l + 1;
        bestL = l;
      }
      const d = s[l++];
      window.set(d, window.get(d) - 1);
      if (need.has(d) && window.get(d) < need.get(d)) have--;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);
}

// @@ 26
function isValid(s) {
  const match = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in match) {
      if (stack.length === 0 || stack[stack.length - 1] !== match[ch]) return false;
      stack.pop();
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}

// @@ 27
class MinStack {
  constructor() {
    this.st = []; // [value, min so far]
  }

  push(val) {
    const low = this.st.length ? Math.min(val, this.st[this.st.length - 1][1]) : val;
    this.st.push([val, low]);
  }

  pop() {
    this.st.pop();
  }

  top() {
    return this.st[this.st.length - 1][0];
  }

  getMin() {
    return this.st[this.st.length - 1][1];
  }
}

// @@ 28
function evalRPN(tokens) {
  const st = [];
  for (const tok of tokens) {
    if (tok === '+' || tok === '-' || tok === '*' || tok === '/') {
      const b = st.pop(), a = st.pop();
      if (tok === '+') st.push(a + b);
      else if (tok === '-') st.push(a - b);
      else if (tok === '*') st.push(a * b);
      else st.push(Math.trunc(a / b)); // truncate toward zero
    } else {
      st.push(Number(tok));
    }
  }
  return st[0];
}

// @@ 29
function generateParenthesis(n) {
  const res = [];
  const bt = (cur, open, closed) => {
    if (cur.length === 2 * n) {
      res.push(cur);
      return;
    }
    if (open < n) bt(cur + '(', open + 1, closed);
    if (closed < open) bt(cur + ')', open, closed + 1);
  };
  bt('', 0, 0);
  return res;
}

// @@ 30
function dailyTemperatures(temperatures) {
  const ans = new Array(temperatures.length).fill(0);
  const st = []; // indices still waiting, temps decreasing
  for (let i = 0; i < temperatures.length; i++) {
    while (st.length && temperatures[st[st.length - 1]] < temperatures[i]) {
      const j = st.pop();
      ans[j] = i - j;
    }
    st.push(i);
  }
  return ans;
}

// @@ 31
function carFleet(target, position, speed) {
  const cars = position.map((p, i) => [p, speed[i]]).sort((a, b) => b[0] - a[0]); // closest first
  const st = []; // arrival time of each fleet
  for (const [p, s] of cars) {
    const t = (target - p) / s;
    if (!st.length || t > st[st.length - 1]) st.push(t);
  }
  return st.length;
}

// @@ 32
function largestRectangleArea(heights) {
  const st = []; // [start index, height], heights increasing
  let best = 0;
  const n = heights.length;
  for (let i = 0; i < n; i++) {
    let start = i;
    while (st.length && st[st.length - 1][1] > heights[i]) {
      const [idx, h] = st.pop();
      best = Math.max(best, h * (i - idx));
      start = idx;
    }
    st.push([start, heights[i]]);
  }
  for (const [idx, h] of st) best = Math.max(best, h * (n - idx));
  return best;
}
