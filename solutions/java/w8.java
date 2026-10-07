// Week 8 — 2-D DP, Greedy.

// @@ 123
class Solution {
    public int uniquePaths(int m, int n) {

        // first row: one path to each cell
        int[] row = new int[n];
        for (int j = 0; j < n; j++) {
            row[j] = 1;
        }

        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                // row[j] still holds the value from above; add the one from the left
                row[j] += row[j - 1];
            }
        }

        return row[n - 1];
    }
}

// @@ 124
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {

        int m = text1.length();
        int n = text2.length();

        // row 0 and column 0 stand for an empty prefix
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {

                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }

                else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[m][n];
    }
}

// @@ 125
class Solution {
    public int maxProfit(int[] prices) {

        int hold = Integer.MIN_VALUE;  // own a stock
        int sold = 0;                  // sold today, must cool down tomorrow
        int rest = 0;                  // no stock, free to buy

        for (int price : prices) {

            int prevHold = hold;
            int prevSold = sold;
            int prevRest = rest;

            hold = Math.max(prevHold, prevRest - price);
            sold = prevHold + price;
            rest = Math.max(prevRest, prevSold);
        }

        return Math.max(sold, rest);
    }
}

// @@ 126
class Solution {
    public int change(int amount, int[] coins) {

        // dp[a] = number of combinations making a
        int[] dp = new int[amount + 1];
        dp[0] = 1;

        // coins in the outer loop: each combination is counted once
        for (int coin : coins) {
            for (int a = coin; a <= amount; a++) {
                dp[a] += dp[a - coin];
            }
        }

        return dp[amount];
    }
}

// @@ 127
class Solution {
    public int findTargetSumWays(int[] nums, int target) {

        int total = 0;
        for (int num : nums) {
            total += num;
        }

        if (Math.abs(target) > total) {
            return 0;
        }

        if ((total + target) % 2 != 0) {
            return 0;
        }

        // sum of the numbers that get '+'
        int goal = (total + target) / 2;

        int[] dp = new int[goal + 1];
        dp[0] = 1;

        for (int num : nums) {
            for (int sum = goal; sum >= num; sum--) {
                dp[sum] += dp[sum - num];
            }
        }

        return dp[goal];
    }
}

// @@ 128
class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {

        int m = s1.length();
        int n = s2.length();

        if (m + n != s3.length()) {
            return false;
        }

        boolean[][] dp = new boolean[m + 1][n + 1];
        dp[0][0] = true;

        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {

                if (i > 0 && dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(i + j - 1)) {
                    dp[i][j] = true;
                }

                if (j > 0 && dp[i][j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1)) {
                    dp[i][j] = true;
                }
            }
        }

        return dp[m][n];
    }
}

// @@ 129
class Solution {
    public int minDistance(String word1, String word2) {

        int m = word1.length();
        int n = word2.length();

        int[][] dp = new int[m + 1][n + 1];

        // delete everything
        for (int i = 0; i <= m; i++) {
            dp[i][0] = i;
        }

        // insert everything
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {

                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                }

                else {
                    int insertCost = dp[i][j - 1];
                    int deleteCost = dp[i - 1][j];
                    int replaceCost = dp[i - 1][j - 1];

                    dp[i][j] = 1 + Math.min(insertCost, Math.min(deleteCost, replaceCost));
                }
            }
        }

        return dp[m][n];
    }
}

// @@ 130
class Solution {
    public int longestIncreasingPath(int[][] matrix) {

        int rows = matrix.length;
        int cols = matrix[0].length;

        // 0 = not computed yet
        int[][] memo = new int[rows][cols];

        int best = 0;

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                best = Math.max(best, dfs(matrix, memo, row, col));
            }
        }

        return best;
    }

    private int dfs(int[][] matrix, int[][] memo, int row, int col) {

        if (memo[row][col] != 0) {
            return memo[row][col];
        }

        int rows = matrix.length;
        int cols = matrix[0].length;

        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        int best = 1;

        for (int d = 0; d < 4; d++) {

            int nextRow = row + dirs[d][0];
            int nextCol = col + dirs[d][1];

            if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
                continue;
            }

            if (matrix[nextRow][nextCol] > matrix[row][col]) {
                best = Math.max(best, 1 + dfs(matrix, memo, nextRow, nextCol));
            }
        }

        memo[row][col] = best;
        return best;
    }
}

// @@ 131
class Solution {
    public int numDistinct(String s, String t) {

        int m = s.length();
        int n = t.length();

        // dp[i][j] = ways s[i:] contains t[j:]
        long[][] dp = new long[m + 1][n + 1];

        // empty t: one way
        for (int i = 0; i <= m; i++) {
            dp[i][n] = 1;
        }

        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {

                // skip s[i]
                dp[i][j] = dp[i + 1][j];

                // use s[i]
                if (s.charAt(i) == t.charAt(j)) {
                    dp[i][j] += dp[i + 1][j + 1];
                }
            }
        }

        return (int) dp[0][0];
    }
}

// @@ 133
class Solution {
    public int maxSubArray(int[] nums) {

        int curr = nums[0];
        int best = nums[0];

        for (int i = 1; i < nums.length; i++) {

            // restart at nums[i] when the running sum only drags it down
            curr = Math.max(nums[i], curr + nums[i]);

            best = Math.max(best, curr);
        }

        return best;
    }
}

// @@ 134
class Solution {
    public boolean canJump(int[] nums) {

        int reach = 0;

        for (int i = 0; i < nums.length; i++) {

            if (i > reach) {
                return false;
            }

            reach = Math.max(reach, i + nums[i]);
        }

        return true;
    }
}

// @@ 135
class Solution {
    public int jump(int[] nums) {

        int jumps = 0;
        int end = 0;
        int farthest = 0;

        for (int i = 0; i < nums.length - 1; i++) {

            farthest = Math.max(farthest, i + nums[i]);

            // current window used up: one more jump
            if (i == end) {
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

        int total = 0;
        int tank = 0;
        int start = 0;

        for (int i = 0; i < gas.length; i++) {

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
}

// @@ 137
class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {

        if (hand.length % groupSize != 0) {
            return false;
        }

        // TreeMap keeps card values sorted
        TreeMap<Integer, Integer> count = new TreeMap<>();
        for (int card : hand) {
            count.put(card, count.getOrDefault(card, 0) + 1);
        }

        for (int start : count.keySet()) {

            int need = count.get(start);

            if (need == 0) {
                continue;
            }

            // the smallest card must start `need` groups
            for (int card = start; card < start + groupSize; card++) {

                int have = count.getOrDefault(card, 0);

                if (have < need) {
                    return false;
                }

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
        for (int i = 0; i < s.length(); i++) {
            last[s.charAt(i) - 'a'] = i;
        }

        List<Integer> sizes = new ArrayList<>();
        int start = 0;
        int end = 0;

        for (int i = 0; i < s.length(); i++) {

            end = Math.max(end, last[s.charAt(i) - 'a']);

            // every letter inside has finished appearing
            if (i == end) {
                sizes.add(end - start + 1);
                start = i + 1;
            }
        }

        return sizes;
    }
}
