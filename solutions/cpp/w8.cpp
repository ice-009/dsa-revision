// Week 8 — 2-D DP, Greedy.

// @@ 123
class Solution {
public:
    int uniquePaths(int m, int n) {

        // first row: one path to each cell
        vector<int> row(n, 1);

        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                // row[j] still holds the value from above; add the one from the left
                row[j] += row[j - 1];
            }
        }

        return row[n - 1];
    }
};

// @@ 124
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {

        int m = text1.size();
        int n = text2.size();

        // row 0 and column 0 stand for an empty prefix
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {

                if (text1[i - 1] == text2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }

                else {
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[m][n];
    }
};

// @@ 125
class Solution {
public:
    int maxProfit(vector<int>& prices) {

        int hold = INT_MIN;  // own a stock
        int sold = 0;        // sold today, must cool down tomorrow
        int rest = 0;        // no stock, free to buy

        for (int price : prices) {

            int prevHold = hold;
            int prevSold = sold;
            int prevRest = rest;

            hold = max(prevHold, prevRest - price);
            sold = prevHold + price;
            rest = max(prevRest, prevSold);
        }

        return max(sold, rest);
    }
};

// @@ 126
class Solution {
public:
    int change(int amount, vector<int>& coins) {

        // dp[a] = number of combinations making a
        vector<unsigned long long> dp(amount + 1, 0);
        dp[0] = 1;

        // coins in the outer loop: each combination is counted once
        for (int coin : coins) {
            for (int a = coin; a <= amount; a++) {
                dp[a] += dp[a - coin];
            }
        }

        return (int)dp[amount];
    }
};

// @@ 127
class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {

        int total = 0;
        for (int num : nums) {
            total += num;
        }

        if (abs(target) > total) {
            return 0;
        }

        if ((total + target) % 2 != 0) {
            return 0;
        }

        // sum of the numbers that get '+'
        int goal = (total + target) / 2;

        vector<int> dp(goal + 1, 0);
        dp[0] = 1;

        for (int num : nums) {
            for (int sum = goal; sum >= num; sum--) {
                dp[sum] += dp[sum - num];
            }
        }

        return dp[goal];
    }
};

// @@ 128
class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {

        int m = s1.size();
        int n = s2.size();

        if (m + n != (int)s3.size()) {
            return false;
        }

        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
        dp[0][0] = true;

        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {

                if (i > 0 && dp[i - 1][j] && s1[i - 1] == s3[i + j - 1]) {
                    dp[i][j] = true;
                }

                if (j > 0 && dp[i][j - 1] && s2[j - 1] == s3[i + j - 1]) {
                    dp[i][j] = true;
                }
            }
        }

        return dp[m][n];
    }
};

// @@ 129
class Solution {
public:
    int minDistance(string word1, string word2) {

        int m = word1.size();
        int n = word2.size();

        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

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

                if (word1[i - 1] == word2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                }

                else {
                    int insertCost = dp[i][j - 1];
                    int deleteCost = dp[i - 1][j];
                    int replaceCost = dp[i - 1][j - 1];

                    dp[i][j] = 1 + min(insertCost, min(deleteCost, replaceCost));
                }
            }
        }

        return dp[m][n];
    }
};

// @@ 130
class Solution {
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {

        int rows = matrix.size();
        int cols = matrix[0].size();

        // 0 = not computed yet
        vector<vector<int>> memo(rows, vector<int>(cols, 0));

        int best = 0;

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                best = max(best, dfs(matrix, memo, row, col));
            }
        }

        return best;
    }

private:
    int dfs(vector<vector<int>>& matrix, vector<vector<int>>& memo, int row, int col) {

        if (memo[row][col] != 0) {
            return memo[row][col];
        }

        int rows = matrix.size();
        int cols = matrix[0].size();

        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        int best = 1;

        for (int d = 0; d < 4; d++) {

            int nextRow = row + dirs[d][0];
            int nextCol = col + dirs[d][1];

            if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
                continue;
            }

            if (matrix[nextRow][nextCol] > matrix[row][col]) {
                best = max(best, 1 + dfs(matrix, memo, nextRow, nextCol));
            }
        }

        memo[row][col] = best;
        return best;
    }
};

// @@ 131
class Solution {
public:
    int numDistinct(string s, string t) {

        int m = s.size();
        int n = t.size();

        // dp[i][j] = ways s[i:] contains t[j:]; unsigned so huge counts can't overflow (UB)
        vector<vector<unsigned long long>> dp(m + 1, vector<unsigned long long>(n + 1, 0));

        // empty t: one way
        for (int i = 0; i <= m; i++) {
            dp[i][n] = 1;
        }

        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {

                // skip s[i]
                dp[i][j] = dp[i + 1][j];

                // use s[i]
                if (s[i] == t[j]) {
                    dp[i][j] += dp[i + 1][j + 1];
                }
            }
        }

        return (int)dp[0][0];
    }
};

// @@ 133
class Solution {
public:
    int maxSubArray(vector<int>& nums) {

        int curr = nums[0];
        int best = nums[0];

        for (int i = 1; i < (int)nums.size(); i++) {

            // restart at nums[i] when the running sum only drags it down
            curr = max(nums[i], curr + nums[i]);

            best = max(best, curr);
        }

        return best;
    }
};

// @@ 134
class Solution {
public:
    bool canJump(vector<int>& nums) {

        int reach = 0;

        for (int i = 0; i < (int)nums.size(); i++) {

            if (i > reach) {
                return false;
            }

            reach = max(reach, i + nums[i]);
        }

        return true;
    }
};

// @@ 135
class Solution {
public:
    int jump(vector<int>& nums) {

        int jumps = 0;
        int end = 0;
        int farthest = 0;

        for (int i = 0; i < (int)nums.size() - 1; i++) {

            farthest = max(farthest, i + nums[i]);

            // current window used up: one more jump
            if (i == end) {
                jumps++;
                end = farthest;
            }
        }

        return jumps;
    }
};

// @@ 136
class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {

        int total = 0;
        int tank = 0;
        int start = 0;

        for (int i = 0; i < (int)gas.size(); i++) {

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
};

// @@ 137
class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {

        if (hand.size() % groupSize != 0) {
            return false;
        }

        // map keeps card values sorted
        map<int, int> count;
        for (int card : hand) {
            count[card]++;
        }

        for (auto& entry : count) {

            int start = entry.first;
            int need = entry.second;

            if (need == 0) {
                continue;
            }

            // the smallest card must start `need` groups
            for (int card = start; card < start + groupSize; card++) {

                if (count.find(card) == count.end()) {
                    return false;
                }

                if (count[card] < need) {
                    return false;
                }

                count[card] -= need;
            }
        }

        return true;
    }
};

// @@ 138
class Solution {
public:
    vector<int> partitionLabels(string s) {

        int last[26];
        for (int i = 0; i < (int)s.size(); i++) {
            last[s[i] - 'a'] = i;
        }

        vector<int> sizes;
        int start = 0;
        int end = 0;

        for (int i = 0; i < (int)s.size(); i++) {

            end = max(end, last[s[i] - 'a']);

            // every letter inside has finished appearing
            if (i == end) {
                sizes.push_back(end - start + 1);
                start = i + 1;
            }
        }

        return sizes;
    }
};
