// Week 8 — 2-D DP, Greedy.

// @@ 123
function uniquePaths(m, n) {
  const row = new Array(n).fill(1); // first row: one path to each cell
  for (let r = 1; r < m; r++)
    for (let c = 1; c < n; c++)
      row[c] += row[c - 1]; // from above (old row[c]) + from the left
  return row[n - 1];
}

// @@ 124
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0)); // row/col 0 = empty prefix
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = text1[i - 1] === text2[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

// @@ 125
function maxProfit(prices) {
  let hold = -Infinity, sold = 0, rest = 0; // own a stock / sold today / free to buy
  for (const p of prices) {
    [hold, sold, rest] = [Math.max(hold, rest - p), hold + p, Math.max(rest, sold)]; // all from yesterday
  }
  return Math.max(sold, rest);
}

// @@ 126
function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0); // dp[a] = combinations making a
  dp[0] = 1;
  for (const c of coins) // coins outer: each combination counted once
    for (let a = c; a <= amount; a++) // upwards: coin can be reused
      dp[a] += dp[a - c];
  return dp[amount];
}

// @@ 127
function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2) return 0;
  const goal = (total + target) / 2; // sum of the numbers that get '+'
  const dp = new Array(goal + 1).fill(0);
  dp[0] = 1;
  for (const x of nums)
    for (let t = goal; t >= x; t--) // 0/1 knapsack counting
      dp[t] += dp[t - x];
  return dp[goal];
}

// @@ 128
function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let i = 0; i <= m; i++)
    for (let j = 0; j <= n; j++) {
      if (i > 0 && dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) dp[i][j] = true;
      if (j > 0 && dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]) dp[i][j] = true;
    }
  return dp[m][n];
}

// @@ 129
function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]); // insert, delete, replace
    }
  return dp[m][n];
}

// @@ 130
function longestIncreasingPath(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0)); // 0 = not computed yet
  const dfs = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let best = 1;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && matrix[nr][nc] > matrix[r][c])
        best = Math.max(best, 1 + dfs(nr, nc));
    }
    return (memo[r][c] = best);
  };
  let best = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      best = Math.max(best, dfs(r, c));
  return best;
}

// @@ 131
function numDistinct(s, t) {
  const m = s.length, n = t.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0)); // ways s[i:] contains t[j:]
  for (let i = 0; i <= m; i++) dp[i][n] = 1; // empty t: one way
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = dp[i + 1][j]; // skip s[i]
      if (s[i] === t[j]) dp[i][j] += dp[i + 1][j + 1]; // use s[i]
    }
  return dp[0][0];
}

// @@ 133
function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]); // restart when the running sum hurts
    best = Math.max(best, cur);
  }
  return best;
}

// @@ 134
function canJump(nums) {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false; // can't even get here
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}

// @@ 135
function jump(nums) {
  let jumps = 0, end = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === end) { // current window used up: one more jump
      jumps++;
      end = farthest;
    }
  }
  return jumps;
}

// @@ 136
function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    total += gas[i] - cost[i];
    tank += gas[i] - cost[i];
    if (tank < 0) { // no start in [start, i] works
      start = i + 1;
      tank = 0;
    }
  }
  return total < 0 ? -1 : start;
}

// @@ 137
function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize) return false;
  const count = new Map();
  for (const h of hand) count.set(h, (count.get(h) || 0) + 1);
  for (const start of [...count.keys()].sort((a, b) => a - b)) {
    const need = count.get(start); // the smallest card must start `need` groups
    if (need === 0) continue;
    for (let card = start; card < start + groupSize; card++) {
      const have = count.get(card) || 0;
      if (have < need) return false;
      count.set(card, have - need);
    }
  }
  return true;
}

// @@ 138
function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) last[s[i]] = i;
  const sizes = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) { // everything inside has finished appearing
      sizes.push(end - start + 1);
      start = i + 1;
    }
  }
  return sizes;
}
