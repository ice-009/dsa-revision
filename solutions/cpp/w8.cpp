// Week 8 — 2-D DP, Greedy.

// @@ 123
class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> row(n, 1);  // first row: one path to each cell
        for (int r = 1; r < m; r++)
            for (int c = 1; c < n; c++)
                row[c] += row[c - 1];  // from above (old row[c]) + from the left
        return row[n - 1];
    }
};

// @@ 124
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));  // row/col 0 = empty prefix
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = text1[i - 1] == text2[j - 1] ? dp[i - 1][j - 1] + 1
                                                        : max(dp[i - 1][j], dp[i][j - 1]);
        return dp[m][n];
    }
};

// @@ 125
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int hold = INT_MIN, sold = 0, rest = 0;  // own a stock / sold today / free to buy
        for (int p : prices) {
            int prevHold = hold, prevSold = sold, prevRest = rest;
            hold = max(prevHold, prevRest - p);
            sold = prevHold + p;
            rest = max(prevRest, prevSold);
        }
        return max(sold, rest);
    }
};

// @@ 126
class Solution {
public:
    int change(int amount, vector<int>& coins) {
        vector<unsigned long long> dp(amount + 1, 0);  // dp[a] = combinations making a
        dp[0] = 1;
        for (int c : coins)                  // coins outer: each combination counted once
            for (int a = c; a <= amount; a++)  // upwards: coin can be reused
                dp[a] += dp[a - c];
        return (int)dp[amount];
    }
};

// @@ 127
class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (abs(target) > total || (total + target) % 2) return 0;
        int goal = (total + target) / 2;  // sum of the numbers that get '+'
        vector<int> dp(goal + 1, 0);
        dp[0] = 1;
        for (int x : nums)
            for (int t = goal; t >= x; t--)  // 0/1 knapsack counting
                dp[t] += dp[t - x];
        return dp[goal];
    }
};

// @@ 128
class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size();
        if (m + n != (int)s3.size()) return false;
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
        dp[0][0] = true;
        for (int i = 0; i <= m; i++)
            for (int j = 0; j <= n; j++) {
                if (i > 0 && dp[i - 1][j] && s1[i - 1] == s3[i + j - 1]) dp[i][j] = true;
                if (j > 0 && dp[i][j - 1] && s2[j - 1] == s3[i + j - 1]) dp[i][j] = true;
            }
        return dp[m][n];
    }
};

// @@ 129
class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1));
        for (int i = 0; i <= m; i++) dp[i][0] = i;  // delete everything
        for (int j = 0; j <= n; j++) dp[0][j] = j;  // insert everything
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + min({dp[i][j - 1],       // insert
                                         dp[i - 1][j],       // delete
                                         dp[i - 1][j - 1]}); // replace
            }
        return dp[m][n];
    }
};

// @@ 130
class Solution {
    vector<vector<int>> memo;  // 0 = not computed yet
    int dfs(vector<vector<int>>& m, int r, int c) {
        if (memo[r][c]) return memo[r][c];
        int best = 1, dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nc >= 0 && nr < (int)m.size() && nc < (int)m[0].size() && m[nr][nc] > m[r][c])
                best = max(best, 1 + dfs(m, nr, nc));
        }
        return memo[r][c] = best;
    }
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        memo.assign(matrix.size(), vector<int>(matrix[0].size(), 0));
        int best = 0;
        for (int r = 0; r < (int)matrix.size(); r++)
            for (int c = 0; c < (int)matrix[0].size(); c++)
                best = max(best, dfs(matrix, r, c));
        return best;
    }
};

// @@ 131
class Solution {
public:
    int numDistinct(string s, string t) {
        int m = s.size(), n = t.size();
        // dp[i][j] = ways s[i:] contains t[j:]; unsigned so huge intermediate counts can't overflow UB
        vector<vector<unsigned long long>> dp(m + 1, vector<unsigned long long>(n + 1, 0));
        for (int i = 0; i <= m; i++) dp[i][n] = 1;  // empty t: one way
        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                dp[i][j] = dp[i + 1][j];                          // skip s[i]
                if (s[i] == t[j]) dp[i][j] += dp[i + 1][j + 1];  // use s[i]
            }
        return (int)dp[0][0];
    }
};

// @@ 133
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);  // restart when the running sum hurts
            best = max(best, cur);
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
            if (i > reach) return false;  // can't even get here
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};

// @@ 135
class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0, end = 0, farthest = 0;
        for (int i = 0; i < (int)nums.size() - 1; i++) {
            farthest = max(farthest, i + nums[i]);
            if (i == end) {  // current window used up: one more jump
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
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < (int)gas.size(); i++) {
            total += gas[i] - cost[i];
            tank += gas[i] - cost[i];
            if (tank < 0) {  // no start in [start, i] works
                start = i + 1;
                tank = 0;
            }
        }
        return total < 0 ? -1 : start;
    }
};

// @@ 137
class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize) return false;
        map<int, int> count;  // sorted by card value
        for (int h : hand) count[h]++;
        for (auto& [start, n] : count) {
            if (n == 0) continue;
            int need = n;  // the smallest card must start `need` groups
            for (int card = start; card < start + groupSize; card++) {
                auto it = count.find(card);
                if (it == count.end() || it->second < need) return false;
                it->second -= need;
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
        for (int i = 0; i < (int)s.size(); i++) last[s[i] - 'a'] = i;
        vector<int> sizes;
        int start = 0, end = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) {  // everything inside has finished appearing
                sizes.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return sizes;
    }
};
