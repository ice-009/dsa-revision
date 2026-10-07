// Week 8 — 2-D DP, Greedy.

// @@ 123
function uniquePaths(m, n) {

  // first row: one path to each cell
  const row = new Array(n).fill(1);

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      // row[j] still holds the value from above; add the one from the left
      row[j] += row[j - 1];
    }
  }

  return row[n - 1];
}

// @@ 124
function longestCommonSubsequence(text1, text2) {

  const m = text1.length;
  const n = text2.length;

  // row 0 and column 0 stand for an empty prefix
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp.push(new Array(n + 1).fill(0));
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {

      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      }

      else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// @@ 125
function maxProfit(prices) {

  let hold = -Infinity; // own a stock
  let sold = 0;         // sold today, must cool down tomorrow
  let rest = 0;         // no stock, free to buy

  for (const price of prices) {

    const prevHold = hold;
    const prevSold = sold;
    const prevRest = rest;

    hold = Math.max(prevHold, prevRest - price);
    sold = prevHold + price;
    rest = Math.max(prevRest, prevSold);
  }

  return Math.max(sold, rest);
}

// @@ 126
function change(amount, coins) {

  // dp[a] = number of combinations making a
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  // coins in the outer loop: each combination is counted once
  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] += dp[a - coin];
    }
  }

  return dp[amount];
}

// @@ 127
function findTargetSumWays(nums, target) {

  let total = 0;
  for (const num of nums) {
    total += num;
  }

  if (Math.abs(target) > total) {
    return 0;
  }

  if ((total + target) % 2 !== 0) {
    return 0;
  }

  // sum of the numbers that get '+'
  const goal = (total + target) / 2;

  const dp = new Array(goal + 1).fill(0);
  dp[0] = 1;

  for (const num of nums) {
    for (let sum = goal; sum >= num; sum--) {
      dp[sum] += dp[sum - num];
    }
  }

  return dp[goal];
}

// @@ 128
function isInterleave(s1, s2, s3) {

  const m = s1.length;
  const n = s2.length;

  if (m + n !== s3.length) {
    return false;
  }

  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp.push(new Array(n + 1).fill(false));
  }
  dp[0][0] = true;

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {

      if (i > 0 && dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) {
        dp[i][j] = true;
      }

      if (j > 0 && dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]) {
        dp[i][j] = true;
      }
    }
  }

  return dp[m][n];
}

// @@ 129
function minDistance(word1, word2) {

  const m = word1.length;
  const n = word2.length;

  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp.push(new Array(n + 1).fill(0));
  }

  // delete everything
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  // insert everything
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {

      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      }

      else {
        const insertCost = dp[i][j - 1];
        const deleteCost = dp[i - 1][j];
        const replaceCost = dp[i - 1][j - 1];

        dp[i][j] = 1 + Math.min(insertCost, deleteCost, replaceCost);
      }
    }
  }

  return dp[m][n];
}

// @@ 130
function longestIncreasingPath(matrix) {

  const rows = matrix.length;
  const cols = matrix[0].length;

  // 0 = not computed yet
  const memo = [];
  for (let row = 0; row < rows; row++) {
    memo.push(new Array(cols).fill(0));
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function dfs(row, col) {

    if (memo[row][col] !== 0) {
      return memo[row][col];
    }

    let best = 1;

    for (let d = 0; d < 4; d++) {

      const nextRow = row + dirs[d][0];
      const nextCol = col + dirs[d][1];

      if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
        continue;
      }

      if (matrix[nextRow][nextCol] > matrix[row][col]) {
        best = Math.max(best, 1 + dfs(nextRow, nextCol));
      }
    }

    memo[row][col] = best;
    return best;
  }

  let best = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      best = Math.max(best, dfs(row, col));
    }
  }

  return best;
}

// @@ 131
function numDistinct(s, t) {

  const m = s.length;
  const n = t.length;

  // dp[i][j] = ways s[i:] contains t[j:]
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp.push(new Array(n + 1).fill(0));
  }

  // empty t: one way
  for (let i = 0; i <= m; i++) {
    dp[i][n] = 1;
  }

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {

      // skip s[i]
      dp[i][j] = dp[i + 1][j];

      // use s[i]
      if (s[i] === t[j]) {
        dp[i][j] += dp[i + 1][j + 1];
      }
    }
  }

  return dp[0][0];
}

// @@ 133
function maxSubArray(nums) {

  let curr = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i++) {

    // restart at nums[i] when the running sum only drags it down
    curr = Math.max(nums[i], curr + nums[i]);

    best = Math.max(best, curr);
  }

  return best;
}

// @@ 134
function canJump(nums) {

  let reach = 0;

  for (let i = 0; i < nums.length; i++) {

    if (i > reach) {
      return false;
    }

    reach = Math.max(reach, i + nums[i]);
  }

  return true;
}

// @@ 135
function jump(nums) {

  let jumps = 0;
  let end = 0;
  let farthest = 0;

  for (let i = 0; i < nums.length - 1; i++) {

    farthest = Math.max(farthest, i + nums[i]);

    // current window used up: one more jump
    if (i === end) {
      jumps++;
      end = farthest;
    }
  }

  return jumps;
}

// @@ 136
function canCompleteCircuit(gas, cost) {

  let total = 0;
  let tank = 0;
  let start = 0;

  for (let i = 0; i < gas.length; i++) {

    total += gas[i] - cost[i];
    tank += gas[i] - cost[i];

    // no station from start to i can be the answer
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }

  if (total < 0) {
    return -1;
  }

  return start;
}

// @@ 137
function isNStraightHand(hand, groupSize) {

  if (hand.length % groupSize !== 0) {
    return false;
  }

  const count = new Map();
  for (const card of hand) {
    if (count.has(card)) {
      count.set(card, count.get(card) + 1);
    }
    else {
      count.set(card, 1);
    }
  }

  function ascending(a, b) {
    return a - b;
  }

  const cards = Array.from(count.keys());
  cards.sort(ascending);

  for (const start of cards) {

    const need = count.get(start);

    if (need === 0) {
      continue;
    }

    // the smallest card must start `need` groups
    for (let card = start; card < start + groupSize; card++) {

      let have = 0;
      if (count.has(card)) {
        have = count.get(card);
      }

      if (have < need) {
        return false;
      }

      count.set(card, have - need);
    }
  }

  return true;
}

// @@ 138
function partitionLabels(s) {

  const last = {};
  for (let i = 0; i < s.length; i++) {
    last[s[i]] = i;
  }

  const sizes = [];
  let start = 0;
  let end = 0;

  for (let i = 0; i < s.length; i++) {

    end = Math.max(end, last[s[i]]);

    // every letter inside has finished appearing
    if (i === end) {
      sizes.push(end - start + 1);
      start = i + 1;
    }
  }

  return sizes;
}
