// Week 1 — Arrays & Hashing, Two Pointers. Each "// @@ n" block is one LeetCode-ready solution.

// @@ 3
function containsDuplicate(nums) {

  const seen = new Set();

  for (const num of nums) {

    if (seen.has(num)) {
      return true;
    }

    seen.add(num);
  }

  return false;
}

// @@ 4
function isAnagram(s, t) {

  if (s.length !== t.length) {
    return false;
  }

  const count = new Array(26).fill(0);

  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }

  for (let i = 0; i < 26; i++) {
    if (count[i] !== 0) {
      return false;
    }
  }

  return true;
}

// @@ 5
function twoSum(nums, target) {

  const seen = new Map(); // value -> index

  for (let i = 0; i < nums.length; i++) {

    const need = target - nums[i];

    if (seen.has(need)) {
      return [seen.get(need), i];
    }

    seen.set(nums[i], i);
  }

  return [];
}

// @@ 6
function groupAnagrams(strs) {

  const groups = new Map();

  for (const word of strs) {

    const count = new Array(26).fill(0);

    for (const ch of word) {
      count[ch.charCodeAt(0) - 97]++;
    }

    // key = the 26 letter counts of the word
    const key = count.join('#');

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(word);
  }

  const ans = [];

  for (const group of groups.values()) {
    ans.push(group);
  }

  return ans;
}

// @@ 7
function topKFrequent(nums, k) {

  const count = new Map();

  for (const num of nums) {
    count.set(num, (count.get(num) || 0) + 1);
  }

  // buckets[freq] = numbers that appear freq times
  const buckets = [];

  for (let i = 0; i <= nums.length; i++) {
    buckets.push([]);
  }

  for (const num of count.keys()) {
    const freq = count.get(num);
    buckets[freq].push(num);
  }

  const ans = [];

  for (let freq = nums.length; freq > 0; freq--) {

    for (const num of buckets[freq]) {

      ans.push(num);

      if (ans.length === k) {
        return ans;
      }
    }
  }

  return ans;
}

// @@ 8
function productExceptSelf(nums) {

  const n = nums.length;
  const ans = new Array(n).fill(1);

  let prefix = 1;

  for (let i = 0; i < n; i++) {
    ans[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;

  for (let i = n - 1; i >= 0; i--) {
    ans[i] *= suffix;
    suffix *= nums[i];
  }

  return ans;
}

// @@ 9
function isValidSudoku(board) {

  const rows = [];
  const cols = [];
  const boxes = [];

  for (let i = 0; i < 9; i++) {
    rows.push(new Set());
    cols.push(new Set());
    boxes.push(new Set());
  }

  for (let i = 0; i < 9; i++) {

    for (let j = 0; j < 9; j++) {

      const digit = board[i][j];

      if (digit === '.') {
        continue;
      }

      const box = Math.floor(i / 3) * 3 + Math.floor(j / 3);

      if (rows[i].has(digit) || cols[j].has(digit) || boxes[box].has(digit)) {
        return false;
      }

      rows[i].add(digit);
      cols[j].add(digit);
      boxes[box].add(digit);
    }
  }

  return true;
}

// @@ 10
function decodeString(s) {

  const nums = [];
  const strs = [];

  let ans = '';
  let num = 0;

  for (const ch of s) {

    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    }

    else if (ch === '[') {
      nums.push(num);
      strs.push(ans);

      num = 0;
      ans = '';
    }

    else if (ch === ']') {

      let times = nums.pop();
      let temp = strs.pop();

      while (times > 0) {
        temp += ans;
        times--;
      }

      ans = temp;
    }

    else {
      ans += ch;
    }
  }

  return ans;
}

// @@ 11
function longestConsecutive(nums) {

  const numSet = new Set(nums);
  let best = 0;

  for (const num of numSet) {

    // only start counting at the beginning of a run
    if (numSet.has(num - 1)) {
      continue;
    }

    let curr = num;

    while (numSet.has(curr + 1)) {
      curr++;
    }

    best = Math.max(best, curr - num + 1);
  }

  return best;
}

// @@ 13
function isPalindrome(s) {

  function isAlnum(ch) {
    return /[a-z0-9]/i.test(ch);
  }

  let left = 0;
  let right = s.length - 1;

  while (left < right) {

    while (left < right && !isAlnum(s[left])) {
      left++;
    }

    while (left < right && !isAlnum(s[right])) {
      right--;
    }

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    left++;
    right--;
  }

  return true;
}

// @@ 14
function twoSum(numbers, target) {

  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {

    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      return [left + 1, right + 1];
    }

    if (sum < target) {
      left++;
    }
    else {
      right--;
    }
  }

  return [];
}

// @@ 15
function threeSum(nums) {

  nums.sort((a, b) => a - b);

  const ans = [];
  const n = nums.length;

  for (let i = 0; i < n - 2; i++) {

    if (nums[i] > 0) {
      break;
    }

    if (i > 0 && nums[i] === nums[i - 1]) {
      continue;
    }

    let left = i + 1;
    let right = n - 1;

    while (left < right) {

      const sum = nums[i] + nums[left] + nums[right];

      if (sum < 0) {
        left++;
      }

      else if (sum > 0) {
        right--;
      }

      else {
        ans.push([nums[i], nums[left], nums[right]]);

        left++;
        right--;

        while (left < right && nums[left] === nums[left - 1]) {
          left++;
        }
      }
    }
  }

  return ans;
}

// @@ 16
function maxArea(height) {

  let left = 0;
  let right = height.length - 1;
  let best = 0;

  while (left < right) {

    const width = right - left;
    const area = Math.min(height[left], height[right]) * width;

    best = Math.max(best, area);

    if (height[left] < height[right]) {
      left++;
    }
    else {
      right--;
    }
  }

  return best;
}

// @@ 17
function trap(height) {

  let left = 0;
  let right = height.length - 1;

  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {

    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      left++;
    }

    else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right--;
    }
  }

  return water;
}
