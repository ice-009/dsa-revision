// Week 7 — Advanced Graphs, 1-D DP.

// @@ 103
class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> adj(n + 1);  // u -> (v, w)
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        vector<int> dist(n + 1, INT_MAX);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;  // (time, node), min first
        pq.push({0, k});
        while (!pq.empty()) {
            auto [d, u] = pq.top();
            pq.pop();
            if (dist[u] != INT_MAX) continue;  // already final
            dist[u] = d;
            for (auto [v, w] : adj[u])
                if (dist[v] == INT_MAX) pq.push({d + w, v});
        }
        int best = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == INT_MAX) return -1;
            best = max(best, dist[i]);
        }
        return best;
    }
};

// @@ 104
class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = INT_MAX;
        vector<int> price(n, INF);
        price[src] = 0;
        for (int round = 0; round <= k; round++) {  // at most k + 1 flights
            vector<int> next = price;                 // relax from last round only
            for (auto& f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (price[u] != INF && price[u] + w < next[v]) next[v] = price[u] + w;
            }
            price = next;
        }
        return price[dst] == INF ? -1 : price[dst];
    }
};

// @@ 105
class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size(), total = 0;
        vector<int> dist(n, INT_MAX);  // cheapest edge from the tree to each point
        vector<bool> inTree(n, false);
        dist[0] = 0;
        for (int step = 0; step < n; step++) {
            int u = -1;
            for (int i = 0; i < n; i++)
                if (!inTree[i] && (u == -1 || dist[i] < dist[u])) u = i;
            inTree[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (inTree[v]) continue;
                int d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                dist[v] = min(dist[v], d);
            }
        }
        return total;
    }
};

// @@ 106
class Solution {
    unordered_map<string, vector<string>> adj;  // destinations, reverse-sorted (smallest at back)
    vector<string> route;
    void dfs(const string& airport) {
        auto& out = adj[airport];
        while (!out.empty()) {
            string next = out.back();
            out.pop_back();  // use this ticket
            dfs(next);
        }
        route.push_back(airport);  // post-order
    }
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        sort(tickets.rbegin(), tickets.rend());
        for (auto& t : tickets) adj[t[0]].push_back(t[1]);
        dfs("JFK");
        reverse(route.begin(), route.end());
        return route;
    }
};

// @@ 107
class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<>> pq;  // (max so far, r, c)
        vector<vector<bool>> seen(n, vector<bool>(n, false));
        pq.push({grid[0][0], 0, 0});
        seen[0][0] = true;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!pq.empty()) {
            auto [t, r, c] = pq.top();
            pq.pop();
            if (r == n - 1 && c == n - 1) return t;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) continue;
                seen[nr][nc] = true;
                pq.push({max(t, grid[nr][nc]), nr, nc});
            }
        }
        return -1;
    }
};

// @@ 108
class Solution {
    // Kahn's algorithm over nodes 0..count-1; returns {} if there is a cycle
    vector<int> topo(int count, vector<pair<int, int>>& edges) {
        vector<vector<int>> adj(count);
        vector<int> indeg(count, 0), order;
        for (auto [a, b] : edges) {
            adj[a].push_back(b);
            indeg[b]++;
        }
        queue<int> q;
        for (int i = 0; i < count; i++)
            if (indeg[i] == 0) q.push(i);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            order.push_back(u);
            for (int v : adj[u])
                if (--indeg[v] == 0) q.push(v);
        }
        if ((int)order.size() < count) order.clear();
        return order;
    }
public:
    vector<int> sortItems(int n, int m, vector<int>& group, vector<vector<int>>& beforeItems) {
        for (int i = 0; i < n; i++)
            if (group[i] == -1) group[i] = m++;  // lone item -> its own group
        vector<pair<int, int>> itemEdges, groupEdges;
        for (int b = 0; b < n; b++)
            for (int a : beforeItems[b]) {  // a must come before b
                itemEdges.push_back({a, b});
                if (group[a] != group[b]) groupEdges.push_back({group[a], group[b]});
            }
        vector<int> itemOrder = topo(n, itemEdges), groupOrder = topo(m, groupEdges);
        if (itemOrder.empty() || groupOrder.empty()) return {};
        vector<vector<int>> members(m);
        for (int item : itemOrder) members[group[item]].push_back(item);
        vector<int> res;
        for (int g : groupOrder)
            for (int item : members[g]) res.push_back(item);
        return res;
    }
};

// @@ 110
class Solution {
public:
    int climbStairs(int n) {
        int a = 1, b = 1;  // ways to reach step i-2, i-1
        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};

// @@ 111
class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        int a = 0, b = 0;  // min cost to stand on step i-2, i-1
        for (int i = 2; i <= (int)cost.size(); i++) {
            int c = min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = c;
        }
        return b;
    }
};

// @@ 112
class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;  // best up to two houses back, best so far
        for (int x : nums) {
            int cur = max(prev1, prev2 + x);  // skip it, or rob it
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};

// @@ 113
class Solution {
    int robLine(vector<int>& nums, int lo, int hi) {
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
            int cur = max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        if (n == 1) return nums[0];
        return max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1));  // drop last, or drop first
    }
};

// @@ 114
class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size(), bestL = 0, bestLen = n ? 1 : 0;
        for (int center = 0; center < n; center++) {
            for (int odd = 0; odd < 2; odd++) {
                int l = center, r = center + (odd ? 0 : 1);
                while (l >= 0 && r < n && s[l] == s[r]) {
                    l--;
                    r++;
                }
                if (r - l - 1 > bestLen) {  // palindrome is s[l+1 .. r-1]
                    bestLen = r - l - 1;
                    bestL = l + 1;
                }
            }
        }
        return s.substr(bestL, bestLen);
    }
};

// @@ 115
class Solution {
public:
    int countSubstrings(string s) {
        int n = s.size(), count = 0;
        for (int center = 0; center < n; center++) {
            for (int r0 = center; r0 <= center + 1; r0++) {  // odd, then even centre
                int l = center, r = r0;
                while (l >= 0 && r < n && s[l] == s[r]) {
                    count++;
                    l--;
                    r++;
                }
            }
        }
        return count;
    }
};

// @@ 116
class Solution {
public:
    int numDecodings(string s) {
        int prev2 = 0, prev1 = 1;  // ways for s[:i-2], s[:i-1]; empty prefix = 1
        for (int i = 1; i <= (int)s.size(); i++) {
            int cur = 0;
            if (s[i - 1] != '0') cur += prev1;  // single digit
            if (i >= 2) {
                int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
                if (two >= 10 && two <= 26) cur += prev2;  // two digits
            }
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};

// @@ 117
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        const int INF = amount + 1;
        vector<int> dp(amount + 1, INF);  // dp[a] = fewest coins for a
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);
        return dp[amount] == INF ? -1 : dp[amount];
    }
};

// @@ 118
class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int best = nums[0], curMax = nums[0], curMin = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            int x = nums[i];
            int a = x * curMax, b = x * curMin;  // from the OLD values
            curMax = max({x, a, b});
            curMin = min({x, a, b});
            best = max(best, curMax);
        }
        return best;
    }
};

// @@ 119
class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> words(wordDict.begin(), wordDict.end());
        int longest = 0;
        for (auto& w : wordDict) longest = max(longest, (int)w.size());
        int n = s.size();
        vector<bool> dp(n + 1, false);  // dp[i]: s[0..i) can be segmented
        dp[0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = max(0, i - longest); j < i; j++)
                if (dp[j] && words.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
        return dp[n];
    }
};

// @@ 120
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;  // tails[k] = smallest tail of an increasing run of length k + 1
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return tails.size();
    }
};

// @@ 121
class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % 2) return false;
        int target = total / 2;
        vector<bool> dp(target + 1, false);  // dp[t]: some subset sums to t
        dp[0] = true;
        for (int x : nums)
            for (int t = target; t >= x; t--)  // downwards: each number used once
                dp[t] = dp[t] || dp[t - x];
        return dp[target];
    }
};
