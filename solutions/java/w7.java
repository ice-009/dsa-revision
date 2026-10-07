// Week 7 — Advanced Graphs, 1-D DP.

// @@ 103
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {

        // graph[u] = list of {v, w}
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int[] t : times) {
            graph.get(t[0]).add(new int[]{t[1], t[2]});
        }

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);

        // {time, node}, smallest time first
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        heap.add(new int[]{0, k});

        while (!heap.isEmpty()) {

            int[] top = heap.poll();
            int time = top[0];
            int node = top[1];

            if (dist[node] != Integer.MAX_VALUE) {
                continue;  // already final
            }

            dist[node] = time;

            for (int[] edge : graph.get(node)) {
                int next = edge[0];
                int w = edge[1];

                if (dist[next] == Integer.MAX_VALUE) {
                    heap.add(new int[]{time + w, next});
                }
            }
        }

        int ans = 0;

        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) {
                return -1;
            }
            ans = Math.max(ans, dist[i]);
        }

        return ans;
    }
}

// @@ 104
class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {

        int[] price = new int[n];
        Arrays.fill(price, Integer.MAX_VALUE);
        price[src] = 0;

        // at most k + 1 flights
        for (int round = 0; round <= k; round++) {

            // relax only from last round's prices
            int[] next = price.clone();

            for (int[] f : flights) {
                int from = f[0];
                int to = f[1];
                int cost = f[2];

                if (price[from] == Integer.MAX_VALUE) {
                    continue;
                }

                if (price[from] + cost < next[to]) {
                    next[to] = price[from] + cost;
                }
            }

            price = next;
        }

        if (price[dst] == Integer.MAX_VALUE) {
            return -1;
        }

        return price[dst];
    }
}

// @@ 105
class Solution {
    public int minCostConnectPoints(int[][] points) {

        int n = points.length;

        int[] dist = new int[n];  // cheapest edge from the tree to each point
        Arrays.fill(dist, Integer.MAX_VALUE);
        boolean[] inTree = new boolean[n];
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

                int d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
                dist[v] = Math.min(dist[v], d);
            }
        }

        return total;
    }
}

// @@ 106
class Solution {
    private Map<String, PriorityQueue<String>> graph = new HashMap<>();  // smallest destination first
    private LinkedList<String> route = new LinkedList<>();

    public List<String> findItinerary(List<List<String>> tickets) {

        for (List<String> t : tickets) {
            String from = t.get(0);
            String to = t.get(1);

            if (!graph.containsKey(from)) {
                graph.put(from, new PriorityQueue<>());
            }
            graph.get(from).add(to);
        }

        dfs("JFK");

        return route;
    }

    private void dfs(String airport) {

        PriorityQueue<String> dests = graph.get(airport);

        while (dests != null && !dests.isEmpty()) {
            String next = dests.poll();  // use this ticket
            dfs(next);
        }

        route.addFirst(airport);  // post-order, built back to front
    }
}

// @@ 107
class Solution {
    public int swimInWater(int[][] grid) {

        int n = grid.length;

        // {max height so far, row, col}, smallest first
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        boolean[][] seen = new boolean[n][n];

        heap.add(new int[]{grid[0][0], 0, 0});
        seen[0][0] = true;

        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!heap.isEmpty()) {

            int[] top = heap.poll();
            int time = top[0];
            int r = top[1];
            int c = top[2];

            if (r == n - 1 && c == n - 1) {
                return time;
            }

            for (int[] d : dirs) {

                int nr = r + d[0];
                int nc = c + d[1];

                if (nr < 0 || nc < 0 || nr >= n || nc >= n) {
                    continue;
                }

                if (seen[nr][nc]) {
                    continue;
                }

                seen[nr][nc] = true;
                heap.add(new int[]{Math.max(time, grid[nr][nc]), nr, nc});
            }
        }

        return -1;
    }
}

// @@ 108
class Solution {
    public int[] sortItems(int n, int m, int[] group, List<List<Integer>> beforeItems) {

        // give each lone item its own group
        for (int i = 0; i < n; i++) {
            if (group[i] == -1) {
                group[i] = m;
                m++;
            }
        }

        List<int[]> itemEdges = new ArrayList<>();
        List<int[]> groupEdges = new ArrayList<>();

        for (int b = 0; b < n; b++) {
            for (int a : beforeItems.get(b)) {  // a must come before b
                itemEdges.add(new int[]{a, b});

                if (group[a] != group[b]) {
                    groupEdges.add(new int[]{group[a], group[b]});
                }
            }
        }

        List<Integer> itemOrder = topoSort(n, itemEdges);
        List<Integer> groupOrder = topoSort(m, groupEdges);

        if (itemOrder == null || groupOrder == null) {
            return new int[0];
        }

        // items of each group, already in item order
        List<List<Integer>> members = new ArrayList<>();
        for (int g = 0; g < m; g++) {
            members.add(new ArrayList<>());
        }
        for (int item : itemOrder) {
            members.get(group[item]).add(item);
        }

        int[] ans = new int[n];
        int idx = 0;

        for (int g : groupOrder) {
            for (int item : members.get(g)) {
                ans[idx] = item;
                idx++;
            }
        }

        return ans;
    }

    // Kahn's algorithm over nodes 0..count-1; null if there is a cycle
    private List<Integer> topoSort(int count, List<int[]> edges) {

        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            graph.add(new ArrayList<>());
        }

        int[] indeg = new int[count];

        for (int[] e : edges) {
            graph.get(e[0]).add(e[1]);
            indeg[e[1]]++;
        }

        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < count; i++) {
            if (indeg[i] == 0) {
                q.add(i);
            }
        }

        List<Integer> order = new ArrayList<>();

        while (!q.isEmpty()) {

            int u = q.poll();
            order.add(u);

            for (int v : graph.get(u)) {
                indeg[v]--;
                if (indeg[v] == 0) {
                    q.add(v);
                }
            }
        }

        if (order.size() < count) {
            return null;
        }

        return order;
    }
}

// @@ 110
class Solution {
    public int climbStairs(int n) {

        int prev2 = 1;  // ways to reach step i-2
        int prev1 = 1;  // ways to reach step i-1

        for (int i = 2; i <= n; i++) {
            int cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
}

// @@ 111
class Solution {
    public int minCostClimbingStairs(int[] cost) {

        int n = cost.length;

        int prev2 = 0;  // min cost to stand on step i-2
        int prev1 = 0;  // min cost to stand on step i-1

        for (int i = 2; i <= n; i++) {
            int cur = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
}

// @@ 112
class Solution {
    public int rob(int[] nums) {

        int prev2 = 0;  // best up to two houses back
        int prev1 = 0;  // best so far

        for (int money : nums) {
            int cur = Math.max(prev1, prev2 + money);  // skip it, or rob it
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
}

// @@ 113
class Solution {
    public int rob(int[] nums) {

        int n = nums.length;

        if (n == 1) {
            return nums[0];
        }

        int skipLast = robLine(nums, 0, n - 2);
        int skipFirst = robLine(nums, 1, n - 1);

        return Math.max(skipLast, skipFirst);
    }

    private int robLine(int[] nums, int start, int end) {

        int prev2 = 0;
        int prev1 = 0;

        for (int i = start; i <= end; i++) {
            int cur = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
}

// @@ 114
class Solution {
    public String longestPalindrome(String s) {

        int n = s.length();

        int bestStart = 0;
        int bestLen = 0;
        if (n > 0) {
            bestLen = 1;
        }

        for (int center = 0; center < n; center++) {

            int[] odd = expand(s, center, center);
            if (odd[1] > bestLen) {
                bestStart = odd[0];
                bestLen = odd[1];
            }

            int[] even = expand(s, center, center + 1);
            if (even[1] > bestLen) {
                bestStart = even[0];
                bestLen = even[1];
            }
        }

        return s.substring(bestStart, bestStart + bestLen);
    }

    // expand around l..r; returns {start, length} of the palindrome found
    private int[] expand(String s, int l, int r) {

        int n = s.length();

        while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) {
            l--;
            r++;
        }

        return new int[]{l + 1, r - l - 1};
    }
}

// @@ 115
class Solution {
    public int countSubstrings(String s) {

        int n = s.length();
        int ans = 0;

        for (int center = 0; center < n; center++) {
            ans += expand(s, center, center);      // odd length
            ans += expand(s, center, center + 1);  // even length
        }

        return ans;
    }

    // number of palindromes found by expanding around l..r
    private int expand(String s, int l, int r) {

        int n = s.length();
        int count = 0;

        while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) {
            count++;
            l--;
            r++;
        }

        return count;
    }
}

// @@ 116
class Solution {
    public int numDecodings(String s) {

        int n = s.length();

        int prev2 = 0;  // ways to decode s[:i-2]
        int prev1 = 1;  // ways to decode s[:i-1]; empty prefix = 1

        for (int i = 1; i <= n; i++) {

            int cur = 0;

            // single digit
            if (s.charAt(i - 1) != '0') {
                cur += prev1;
            }

            // two digits
            if (i >= 2) {
                int two = (s.charAt(i - 2) - '0') * 10 + (s.charAt(i - 1) - '0');
                if (two >= 10 && two <= 26) {
                    cur += prev2;
                }
            }

            prev2 = prev1;
            prev1 = cur;
        }

        return prev1;
    }
}

// @@ 117
class Solution {
    public int coinChange(int[] coins, int amount) {

        int INF = amount + 1;

        int[] dp = new int[amount + 1];  // dp[a] = fewest coins for a
        Arrays.fill(dp, INF);
        dp[0] = 0;

        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a) {
                    dp[a] = Math.min(dp[a], dp[a - coin] + 1);
                }
            }
        }

        if (dp[amount] == INF) {
            return -1;
        }

        return dp[amount];
    }
}

// @@ 118
class Solution {
    public int maxProduct(int[] nums) {

        int best = nums[0];
        int curMax = nums[0];
        int curMin = nums[0];

        for (int i = 1; i < nums.length; i++) {

            int x = nums[i];

            // use the OLD curMax / curMin
            int withMax = x * curMax;
            int withMin = x * curMin;

            curMax = Math.max(x, Math.max(withMax, withMin));
            curMin = Math.min(x, Math.min(withMax, withMin));

            best = Math.max(best, curMax);
        }

        return best;
    }
}

// @@ 119
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {

        Set<String> words = new HashSet<>(wordDict);

        int longest = 0;
        for (String w : wordDict) {
            longest = Math.max(longest, w.length());
        }

        int n = s.length();

        boolean[] dp = new boolean[n + 1];  // dp[i]: s[0..i) can be segmented
        dp[0] = true;

        for (int i = 1; i <= n; i++) {
            for (int j = Math.max(0, i - longest); j < i; j++) {
                if (dp[j] && words.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }

        return dp[n];
    }
}

// @@ 120
class Solution {
    public int lengthOfLIS(int[] nums) {

        int[] tails = new int[nums.length];  // tails[k] = smallest tail of an increasing run of length k + 1
        int size = 0;

        for (int x : nums) {

            // binary search for the first tail >= x
            int lo = 0;
            int hi = size;

            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (tails[mid] < x) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }

            tails[lo] = x;

            if (lo == size) {
                size++;
            }
        }

        return size;
    }
}

// @@ 121
class Solution {
    public boolean canPartition(int[] nums) {

        int total = 0;
        for (int x : nums) {
            total += x;
        }

        if (total % 2 == 1) {
            return false;
        }

        int target = total / 2;

        boolean[] dp = new boolean[target + 1];  // dp[t]: some subset sums to t
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
}
