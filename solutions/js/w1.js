// Week 1 — Arrays & Hashing, Two Pointers. Each "// @@ n" block is one LeetCode-ready solution.

// @@ 3
function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

// @@ 4
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every(c => c === 0);
}

// @@ 5
function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

// @@ 6
function groupAnagrams(strs) {
  const groups = new Map();
  for (const w of strs) {
    const count = new Array(26).fill(0);
    for (const c of w) count[c.charCodeAt(0) - 97]++;
    const key = count.join('#'); // letter counts as the key
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}

// @@ 7
function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []); // buckets[f] = numbers seen f times
  for (const [num, f] of count) buckets[f].push(num);
  const res = [];
  for (let f = nums.length; f > 0; f--) {
    for (const num of buckets[f]) {
      res.push(num);
      if (res.length === k) return res;
    }
  }
  return res;
}

// @@ 8
function productExceptSelf(nums) {
  const n = nums.length;
  const res = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    res[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= suffix;
    suffix *= nums[i];
  }
  return res;
}

// @@ 9
function isValidSudoku(board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v === '.') continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) return false;
      rows[r].add(v);
      cols[c].add(v);
      boxes[b].add(v);
    }
  }
  return true;
}

// @@ 10
function decodeString(s) {
  const stack = []; // [string before '[', repeat count]
  let cur = '';
  let k = 0;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      k = k * 10 + Number(ch);
    } else if (ch === '[') {
      stack.push([cur, k]);
      cur = '';
      k = 0;
    } else if (ch === ']') {
      const [prev, times] = stack.pop();
      cur = prev + cur.repeat(times);
    } else {
      cur += ch;
    }
  }
  return cur;
}

// @@ 11
function longestConsecutive(nums) {
  const s = new Set(nums);
  let best = 0;
  for (const x of s) {
    if (s.has(x - 1)) continue; // only start at the beginning of a run
    let y = x;
    while (s.has(y + 1)) y++;
    best = Math.max(best, y - x + 1);
  }
  return best;
}

// @@ 13
function isPalindrome(s) {
  const isAlnum = ch => /[a-z0-9]/i.test(ch);
  let l = 0, r = s.length - 1;
  while (l < r) {
    while (l < r && !isAlnum(s[l])) l++;
    while (l < r && !isAlnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++;
    r--;
  }
  return true;
}

// @@ 14
function twoSum(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const s = numbers[l] + numbers[r];
    if (s === target) return [l + 1, r + 1];
    if (s < target) l++;
    else r--;
  }
  return [];
}

// @@ 15
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = n - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s < 0) l++;
      else if (s > 0) r--;
      else {
        res.push([nums[i], nums[l], nums[r]]);
        l++;
        r--;
        while (l < r && nums[l] === nums[l - 1]) l++;
      }
    }
  }
  return res;
}

// @@ 16
function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}

// @@ 17
function trap(height) {
  let l = 0, r = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l];
      l++;
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r];
      r--;
    }
  }
  return water;
}
