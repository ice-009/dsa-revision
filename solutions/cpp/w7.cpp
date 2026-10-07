// Week 7 — Advanced Graphs, 1-D DP.

// @@ 103
class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {

        // graph[u] = list of (v, w)
        vector<vector<pair<int, int>>> graph(n + 1);
        for (auto& t : times) {
            graph[t[0]].push_back({t[1], t[2]});
        }

        vector<int> dist(n + 1, INT_MAX);

        // (time, node), smallest time on top
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> heap;
        heap.push({0, k});

        while (!heap.empty()) {

            int time = heap.top().first;
            int node = heap.top().second;
            heap.pop();

            if (dist[node] != INT_MAX) {
                continue;  // already final
            }

            dist[node] = time;

            for (auto& edge : graph[node]) {
                int next = edge.first;
                int w = edge.second;

                if (dist[next] == INT_MAX) {
                    heap.push({time + w, next});
                }
            }
        }

        int ans = 0;

        for (int i = 1; i <= n; i++) {
            if (dist[i] == INT_MAX) {
                return -1;
            }
            ans = max(ans, dist[i]);
        }

        return ans;
    }
};

// @@ 104
class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {

        vector<int> price(n, INT_MAX);
        price[src] = 0;

        // at most k + 1 flights
        for (int round = 0; round <= k; round++) {

            // relax only from last round's prices
            vector<int> next = price;

            for (auto& f : flights) {
                int from = f[0];
                int to = f[1];
                int cost = f[2];

                if (price[from] == INT_MAX) {
                    continue;
                }

                if (price[from] + cost < next[to]) {
                    next[to] = price[from] + cost;
                }
            }

            price = next;
        }

        if (price[dst] == INT_MAX) {
            return -1;
        }

        return price[dst];
    }
};

// @@ 105
class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {

        int n = points.size();

        vector<int> dist(n, INT_MAX);  // cheapest edge from the tree to each point
        vector<bool> inTree(n, false);
        dist[0] = 0;

        int total = 0;

        for (int step = 0; step < n; step++) {

            // pick the closest point not yet in the tree
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!inTree[i] && (u == -1 || dist[i] < dist[u])) {
                    u = i;
                }
            }

            inTree[u] = true;
            total += dist[u];

            // update distances through u
            for (int v = 0; v < n; v++) {
                if (inTree[v]) {
                    continue;
                }

                int d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                dist[v] = min(dist[v], d);
            }
        }

        return total;
    }
};

// @@ 106
class Solution {
    unordered_map<string, vector<string>> graph;  // destinations, reverse-sorted (smallest at back)
    vector<string> route;

    void dfs(string airport) {

        vector<string>& dests = graph[airport];

        while (!dests.empty()) {
            string next = dests.back();
            dests.pop_back();  // use this ticket
            dfs(next);
        }

        route.push_back(airport);  // post-order
    }

public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {

        sort(tickets.begin(), tickets.end());
        reverse(tickets.begin(), tickets.end());

        for (auto& t : tickets) {
            graph[t[0]].push_back(t[1]);
        }

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

        // {max height so far, row, col}, smallest on top
        priority_queue<vector<int>, vector<vector<int>>, greater<vector<int>>> heap;
        vector<vector<bool>> seen(n, vector<bool>(n, false));

        heap.push({grid[0][0], 0, 0});
        seen[0][0] = true;

        int dr[] = {1, -1, 0, 0};
        int dc[] = {0, 0, 1, -1};

        while (!heap.empty()) {

            vector<int> top = heap.top();
            heap.pop();

            int time = top[0];
            int r = top[1];
            int c = top[2];

            if (r == n - 1 && c == n - 1) {
                return time;
            }

            for (int d = 0; d < 4; d++) {

                int nr = r + dr[d];
                int nc = c + dc[d];

                if (nr < 0 || nc < 0 || nr >= n || nc >= n) {
                    continue;
                }

                if (seen[nr][nc]) {
                    continue;
                }

                seen[nr][nc] = true;
                heap.push({max(time, grid[nr][nc]), nr, nc});
            }
        }

        return -1;
    }
};

// @@ 108
class Solution {
    // Kahn's algorithm over nodes 0..count-1; returns {} if there is a cycle
    vector<int> topoSort(int count, vector<pair<int, int>>& edges) {

        vector<vector<int>> graph(count);
        vector<int> indeg(count, 0);

        for (auto& e : edges) {
            graph[e.first].push_back(e.second);
            indeg[e.second]++;
        }

        queue<int> q;
        for (int i = 0; i < count; i++) {
            if (indeg[i] == 0) {
                q.push(i);
            }
        }

        vector<int> order;

        while (!q.empty()) {

            int u = q.front();
            q.pop();

            order.push_back(u);

            for (int v : graph[u]) {
                indeg[v]--;
                if (indeg[v] == 0) {
                    q.push(v);
                }
            }
        }

        if ((int)order.size() < count) {
            return {};
        }

        return order;
    }

public:
    vector<int> sortItems(int n, int m, vector<int>& group, vector<vector<int>>& beforeItems) {

        // give each lone item its own group
        for (int i = 0; i < n; i++) {
            if (group[i] == -1) {
                group[i] = m;
                m++;
            }
        }

        vector<pair<int, int>> itemEdges;
        vector<pair<int, int>> groupEdges;

        for (int b = 0; b < n; b++) {
            for (int a : beforeItems[b]) {  // a must come before b
                itemEdges.push_back({a, b});

                if (group[a] != group[b]) {
                    groupEdges.push_back({group[a], group[b]});
                }
            }
        }

        vector<int> itemOrder = topoSort(n, itemEdges);
        vector<int> groupOrder = topoSort(m, groupEdges);

        if (itemOrder.empty() || groupOrder.empty()) {
            return {};
        }

        // items of each group, already in item order
        vector<vector<int>> members(m);
        for (int item : itemOrder) {
            members[group[item]].push_back(item);
        }

        vector<int> ans;

        for (int g : groupOrder) {
            for (int item : members[g]) {
                ans.push_back(item);
            }
        }

        return ans;
    }
};

// @@ 110
class Solution {
public:
    int climbStairs(int n) {

        int prev2 = 1;  // ways to reach step i-2
        int prev1 = 1;  // ways to reach step i-1

        for (int i = 2; i <= n; i++) {
            int cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
};

// @@ 111
class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {

        int n = cost.size();

        int prev2 = 0;  // min cost to stand on step i-2
        int prev1 = 0;  // min cost to stand on step i-1

        for (int i = 2; i <= n; i++) {
            int cur = min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
};

// @@ 112
class Solution {
public:
    int rob(vector<int>& nums) {

        int prev2 = 0;  // best up to two houses back
        int prev1 = 0;  // best so far

        for (int money : nums) {
            int cur = max(prev1, prev2 + money);  // skip it, or rob it
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
};

// @@ 113
class Solution {
    int robLine(vector<int>& nums, int start, int end) {

        int prev2 = 0;
        int prev1 = 0;

        for (int i = start; i <= end; i++) {
            int cur = max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }

public:
    int rob(vector<int>& nums) {

        int n = nums.size();

        if (n == 1) {
            return nums[0];
        }

        int skipLast = robLine(nums, 0, n - 2);
        int skipFirst = robLine(nums, 1, n - 1);

        return max(skipLast, skipFirst);
    }
};

// @@ 114
class Solution {
    // expand around l..r; returns {start, length} of the palindrome found
    pair<int, int> expand(string& s, int l, int r) {

        int n = s.size();

        while (l >= 0 && r < n && s[l] == s[r]) {
            l--;
            r++;
        }

        return {l + 1, r - l - 1};
    }

public:
    string longestPalindrome(string s) {

        int n = s.size();

        int bestStart = 0;
        int bestLen = 0;
        if (n > 0) {
            bestLen = 1;
        }

        for (int center = 0; center < n; center++) {

            pair<int, int> odd = expand(s, center, center);
            if (odd.second > bestLen) {
                bestStart = odd.first;
                bestLen = odd.second;
            }

            pair<int, int> even = expand(s, center, center + 1);
            if (even.second > bestLen) {
                bestStart = even.first;
                bestLen = even.second;
            }
        }

        return s.substr(bestStart, bestLen);
    }
};

// @@ 115
class Solution {
    // number of palindromes found by expanding around l..r
    int expand(string& s, int l, int r) {

        int n = s.size();
        int count = 0;

        while (l >= 0 && r < n && s[l] == s[r]) {
            count++;
            l--;
            r++;
        }

        return count;
    }

public:
    int countSubstrings(string s) {

        int n = s.size();
        int ans = 0;

        for (int center = 0; center < n; center++) {
            ans += expand(s, center, center);      // odd length
            ans += expand(s, center, center + 1);  // even length
        }

        return ans;
    }
};

// @@ 116
class Solution {
public:
    int numDecodings(string s) {

        int n = s.size();

        int prev2 = 0;  // ways to decode s[:i-2]
        int prev1 = 1;  // ways to decode s[:i-1]; empty prefix = 1

        for (int i = 1; i <= n; i++) {

            int cur = 0;

            // single digit
            if (s[i - 1] != '0') {
                cur += prev1;
            }

            // two digits
            if (i >= 2) {
                int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
                if (two >= 10 && two <= 26) {
                    cur += prev2;
                }
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

        int INF = amount + 1;

        vector<int> dp(amount + 1, INF);  // dp[a] = fewest coins for a
        dp[0] = 0;

        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a) {
                    dp[a] = min(dp[a], dp[a - coin] + 1);
                }
            }
        }

        if (dp[amount] == INF) {
            return -1;
        }

        return dp[amount];
    }
};

// @@ 118
class Solution {
public:
    int maxProduct(vector<int>& nums) {

        int best = nums[0];
        int curMax = nums[0];
        int curMin = nums[0];

        for (int i = 1; i < (int)nums.size(); i++) {

            int x = nums[i];

            // use the OLD curMax / curMin
            int withMax = x * curMax;
            int withMin = x * curMin;

            curMax = max(x, max(withMax, withMin));
            curMin = min(x, min(withMax, withMin));

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
        for (string& w : wordDict) {
            longest = max(longest, (int)w.size());
        }

        int n = s.size();

        vector<bool> dp(n + 1, false);  // dp[i]: s[0..i) can be segmented
        dp[0] = true;

        for (int i = 1; i <= n; i++) {
            for (int j = max(0, i - longest); j < i; j++) {
                if (dp[j] && words.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
            }
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

            // binary search for the first tail >= x
            int lo = 0;
            int hi = tails.size();

            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (tails[mid] < x) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }

            if (lo == (int)tails.size()) {
                tails.push_back(x);
            } else {
                tails[lo] = x;
            }
        }

        return tails.size();
    }
};

// @@ 121
class Solution {
public:
    bool canPartition(vector<int>& nums) {

        int total = 0;
        for (int x : nums) {
            total += x;
        }

        if (total % 2 == 1) {
            return false;
        }

        int target = total / 2;

        vector<bool> dp(target + 1, false);  // dp[t]: some subset sums to t
        dp[0] = true;

        for (int x : nums) {
            // go downwards so each number is used once
            for (int t = target; t >= x; t--) {
                if (dp[t - x]) {
                    dp[t] = true;
                }
            }
        }

        return dp[target];
    }
};
