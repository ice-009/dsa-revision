// Week 7 — Advanced Graphs, 1-D DP.

// @@ 103
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});  // u -> {v, w}
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);  // {time, node}, min first
        pq.add(new int[]{0, k});
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];
            if (dist[u] != Integer.MAX_VALUE) continue;  // already final
            dist[u] = d;
            for (int[] e : adj.get(u))
                if (dist[e[0]] == Integer.MAX_VALUE) pq.add(new int[]{d + e[1], e[0]});
        }
        int best = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            best = Math.max(best, dist[i]);
        }
        return best;
    }
}

// @@ 104
class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        final int INF = Integer.MAX_VALUE;
        int[] price = new int[n];
        Arrays.fill(price, INF);
        price[src] = 0;
        for (int round = 0; round <= k; round++) {  // at most k + 1 flights
            int[] next = price.clone();              // relax from last round only
            for (int[] f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (price[u] != INF && price[u] + w < next[v]) next[v] = price[u] + w;
            }
            price = next;
        }
        return price[dst] == INF ? -1 : price[dst];
    }
}

// @@ 105
class Solution {
    public int minCostConnectPoints(int[][] points) {
        int n = points.length, total = 0;
        int[] dist = new int[n];  // cheapest edge from the tree to each point
        Arrays.fill(dist, Integer.MAX_VALUE);
        boolean[] inTree = new boolean[n];
        dist[0] = 0;
        for (int step = 0; step < n; step++) {
            int u = -1;
            for (int i = 0; i < n; i++)
                if (!inTree[i] && (u == -1 || dist[i] < dist[u])) u = i;
            inTree[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (inTree[v]) continue;
                int d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
                dist[v] = Math.min(dist[v], d);
            }
        }
        return total;
    }
}

// @@ 106
class Solution {
    private final Map<String, PriorityQueue<String>> adj = new HashMap<>();  // smallest destination first
    private final LinkedList<String> route = new LinkedList<>();

    public List<String> findItinerary(List<List<String>> tickets) {
        for (List<String> t : tickets) adj.computeIfAbsent(t.get(0), k -> new PriorityQueue<>()).add(t.get(1));
        dfs("JFK");
        return route;
    }

    private void dfs(String airport) {
        PriorityQueue<String> out = adj.get(airport);
        while (out != null && !out.isEmpty()) dfs(out.poll());  // use this ticket
        route.addFirst(airport);  // post-order, built back to front
    }
}

// @@ 107
class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);  // {max so far, r, c}
        boolean[][] seen = new boolean[n][n];
        pq.add(new int[]{grid[0][0], 0, 0});
        seen[0][0] = true;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int t = top[0], r = top[1], c = top[2];
            if (r == n - 1 && c == n - 1) return t;
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) continue;
                seen[nr][nc] = true;
                pq.add(new int[]{Math.max(t, grid[nr][nc]), nr, nc});
            }
        }
        return -1;
    }
}

// @@ 108
class Solution {
    public int[] sortItems(int n, int m, int[] group, List<List<Integer>> beforeItems) {
        for (int i = 0; i < n; i++)
            if (group[i] == -1) group[i] = m++;  // lone item -> its own group
        List<int[]> itemEdges = new ArrayList<>(), groupEdges = new ArrayList<>();
        for (int b = 0; b < n; b++)
            for (int a : beforeItems.get(b)) {  // a must come before b
                itemEdges.add(new int[]{a, b});
                if (group[a] != group[b]) groupEdges.add(new int[]{group[a], group[b]});
            }
        List<Integer> itemOrder = topo(n, itemEdges), groupOrder = topo(m, groupEdges);
        if (itemOrder == null || groupOrder == null) return new int[0];
        List<List<Integer>> members = new ArrayList<>();
        for (int g = 0; g < m; g++) members.add(new ArrayList<>());
        for (int item : itemOrder) members.get(group[item]).add(item);
        int[] res = new int[n];
        int idx = 0;
        for (int g : groupOrder)
            for (int item : members.get(g)) res[idx++] = item;
        return res;
    }

    // Kahn's algorithm over nodes 0..count-1; null if there is a cycle
    private List<Integer> topo(int count, List<int[]> edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < count; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[count];
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            indeg[e[1]]++;
        }
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < count; i++)
            if (indeg[i] == 0) q.add(i);
        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : adj.get(u))
                if (--indeg[v] == 0) q.add(v);
        }
        return order.size() == count ? order : null;
    }
}

// @@ 110
class Solution {
    public int climbStairs(int n) {
        int a = 1, b = 1;  // ways to reach step i-2, i-1
        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}

// @@ 111
class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int a = 0, b = 0;  // min cost to stand on step i-2, i-1
        for (int i = 2; i <= cost.length; i++) {
            int c = Math.min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = c;
        }
        return b;
    }
}

// @@ 112
class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;  // best up to two houses back, best so far
        for (int x : nums) {
            int cur = Math.max(prev1, prev2 + x);  // skip it, or rob it
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
        if (n == 1) return nums[0];
        return Math.max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1));  // drop last, or drop first
    }

    private int robLine(int[] nums, int lo, int hi) {
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
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
        int n = s.length(), bestL = 0, bestLen = n > 0 ? 1 : 0;
        for (int center = 0; center < n; center++) {
            for (int r0 = center; r0 <= center + 1; r0++) {  // odd, then even centre
                int l = center, r = r0;
                while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) {
                    l--;
                    r++;
                }
                if (r - l - 1 > bestLen) {  // palindrome is s[l+1 .. r-1]
                    bestLen = r - l - 1;
                    bestL = l + 1;
                }
            }
        }
        return s.substring(bestL, bestL + bestLen);
    }
}

// @@ 115
class Solution {
    public int countSubstrings(String s) {
        int n = s.length(), count = 0;
        for (int center = 0; center < n; center++) {
            for (int r0 = center; r0 <= center + 1; r0++) {  // odd, then even centre
                int l = center, r = r0;
                while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) {
                    count++;
                    l--;
                    r++;
                }
            }
        }
        return count;
    }
}

// @@ 116
class Solution {
    public int numDecodings(String s) {
        int prev2 = 0, prev1 = 1;  // ways for s[:i-2], s[:i-1]; empty prefix = 1
        for (int i = 1; i <= s.length(); i++) {
            int cur = 0;
            if (s.charAt(i - 1) != '0') cur += prev1;  // single digit
            if (i >= 2) {
                int two = Integer.parseInt(s.substring(i - 2, i));
                if (two >= 10 && two <= 26) cur += prev2;  // two digits
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
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] == INF ? -1 : dp[amount];
    }
}

// @@ 118
class Solution {
    public int maxProduct(int[] nums) {
        int best = nums[0], curMax = nums[0], curMin = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i];
            int a = x * curMax, b = x * curMin;  // from the OLD values
            curMax = Math.max(x, Math.max(a, b));
            curMin = Math.min(x, Math.min(a, b));
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
        for (String w : wordDict) longest = Math.max(longest, w.length());
        int n = s.length();
        boolean[] dp = new boolean[n + 1];  // dp[i]: s[0..i) can be segmented
        dp[0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = Math.max(0, i - longest); j < i; j++)
                if (dp[j] && words.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
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
            int lo = 0, hi = size;  // first tail >= x
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (tails[mid] < x) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }
}

// @@ 121
class Solution {
    public boolean canPartition(int[] nums) {
        int total = Arrays.stream(nums).sum();
        if (total % 2 == 1) return false;
        int target = total / 2;
        boolean[] dp = new boolean[target + 1];  // dp[t]: some subset sums to t
        dp[0] = true;
        for (int x : nums)
            for (int t = target; t >= x; t--)  // downwards: each number used once
                dp[t] = dp[t] || dp[t - x];
        return dp[target];
    }
}
