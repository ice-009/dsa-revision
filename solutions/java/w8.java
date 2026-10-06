// Week 8 — 2-D DP, Greedy.

// @@ 123
class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);  // first row: one path to each cell
        for (int r = 1; r < m; r++)
            for (int c = 1; c < n; c++)
                row[c] += row[c - 1];  // from above (old row[c]) + from the left
        return row[n - 1];
    }
}

// @@ 124
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];  // row/col 0 = empty prefix
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = text1.charAt(i - 1) == text2.charAt(j - 1) ? dp[i - 1][j - 1] + 1
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[m][n];
    }
}

// @@ 125
class Solution {
    public int maxProfit(int[] prices) {
        int hold = Integer.MIN_VALUE, sold = 0, rest = 0;  // own a stock / sold today / free to buy
        for (int p : prices) {
            int prevHold = hold, prevSold = sold, prevRest = rest;
            hold = Math.max(prevHold, prevRest - p);
            sold = prevHold + p;
            rest = Math.max(prevRest, prevSold);
        }
        return Math.max(sold, rest);
    }
}

// @@ 126
class Solution {
    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];  // dp[a] = combinations making a
        dp[0] = 1;
        for (int c : coins)                  // coins outer: each combination counted once
            for (int a = c; a <= amount; a++)  // upwards: coin can be reused
                dp[a] += dp[a - c];
        return dp[amount];
    }
}

// @@ 127
class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int total = Arrays.stream(nums).sum();
        if (Math.abs(target) > total || (total + target) % 2 != 0) return 0;
        int goal = (total + target) / 2;  // sum of the numbers that get '+'
        int[] dp = new int[goal + 1];
        dp[0] = 1;
        for (int x : nums)
            for (int t = goal; t >= x; t--)  // 0/1 knapsack counting
                dp[t] += dp[t - x];
        return dp[goal];
    }
}

// @@ 128
class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        int m = s1.length(), n = s2.length();
        if (m + n != s3.length()) return false;
        boolean[][] dp = new boolean[m + 1][n + 1];
        dp[0][0] = true;
        for (int i = 0; i <= m; i++)
            for (int j = 0; j <= n; j++) {
                if (i > 0 && dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(i + j - 1)) dp[i][j] = true;
                if (j > 0 && dp[i][j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1)) dp[i][j] = true;
            }
        return dp[m][n];
    }
}

// @@ 129
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;  // delete everything
        for (int j = 0; j <= n; j++) dp[0][j] = j;  // insert everything
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + Math.min(dp[i][j - 1],                    // insert
                        Math.min(dp[i - 1][j], dp[i - 1][j - 1]));             // delete, replace
            }
        return dp[m][n];
    }
}

// @@ 130
class Solution {
    private int[][] memo;  // 0 = not computed yet

    public int longestIncreasingPath(int[][] matrix) {
        memo = new int[matrix.length][matrix[0].length];
        int best = 0;
        for (int r = 0; r < matrix.length; r++)
            for (int c = 0; c < matrix[0].length; c++)
                best = Math.max(best, dfs(matrix, r, c));
        return best;
    }

    private int dfs(int[][] m, int r, int c) {
        if (memo[r][c] != 0) return memo[r][c];
        int best = 1;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nc >= 0 && nr < m.length && nc < m[0].length && m[nr][nc] > m[r][c])
                best = Math.max(best, 1 + dfs(m, nr, nc));
        }
        return memo[r][c] = best;
    }
}

// @@ 131
class Solution {
    public int numDistinct(String s, String t) {
        int m = s.length(), n = t.length();
        long[][] dp = new long[m + 1][n + 1];  // dp[i][j] = ways s[i:] contains t[j:]
        for (int i = 0; i <= m; i++) dp[i][n] = 1;  // empty t: one way
        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                dp[i][j] = dp[i + 1][j];                                    // skip s[i]
                if (s.charAt(i) == t.charAt(j)) dp[i][j] += dp[i + 1][j + 1];  // use s[i]
            }
        return (int) dp[0][0];
    }
}

// @@ 133
class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);  // restart when the running sum hurts
            best = Math.max(best, cur);
        }
        return best;
    }
}

// @@ 134
class Solution {
    public boolean canJump(int[] nums) {
        int reach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > reach) return false;  // can't even get here
            reach = Math.max(reach, i + nums[i]);
        }
        return true;
    }
}

// @@ 135
class Solution {
    public int jump(int[] nums) {
        int jumps = 0, end = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            if (i == end) {  // current window used up: one more jump
                jumps++;
                end = farthest;
            }
        }
        return jumps;
    }
}

// @@ 136
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            total += gas[i] - cost[i];
            tank += gas[i] - cost[i];
            if (tank < 0) {  // no start in [start, i] works
                start = i + 1;
                tank = 0;
            }
        }
        return total < 0 ? -1 : start;
    }
}

// @@ 137
class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) return false;
        TreeMap<Integer, Integer> count = new TreeMap<>();  // sorted by card value
        for (int h : hand) count.merge(h, 1, Integer::sum);
        for (int start : count.keySet()) {
            int need = count.get(start);  // the smallest card must start `need` groups
            if (need == 0) continue;
            for (int card = start; card < start + groupSize; card++) {
                int have = count.getOrDefault(card, 0);
                if (have < need) return false;
                count.put(card, have - need);
            }
        }
        return true;
    }
}

// @@ 138
class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        List<Integer> sizes = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);
            if (i == end) {  // everything inside has finished appearing
                sizes.add(end - start + 1);
                start = i + 1;
            }
        }
        return sizes;
    }
}
