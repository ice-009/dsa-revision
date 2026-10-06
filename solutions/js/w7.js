// Week 7 — Advanced Graphs, 1-D DP.

// @@ 103
function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []); // u -> [v, w]
  for (const [u, v, w] of times) adj[u].push([v, w]);
  const dist = new Map();
  const heap = new Heap((a, b) => a[0] < b[0]); // [time, node], min first
  heap.push([0, k]);
  while (heap.size) {
    const [d, u] = heap.pop();
    if (dist.has(u)) continue; // already final
    dist.set(u, d);
    for (const [v, w] of adj[u]) if (!dist.has(v)) heap.push([d + w, v]);
  }
  return dist.size === n ? Math.max(...dist.values()) : -1;
}

// @@ 104
function findCheapestPrice(n, flights, src, dst, k) {
  let price = new Array(n).fill(Infinity);
  price[src] = 0;
  for (let round = 0; round <= k; round++) { // at most k + 1 flights
    const next = [...price]; // relax from last round only
    for (const [u, v, w] of flights) {
      if (price[u] + w < next[v]) next[v] = price[u] + w;
    }
    price = next;
  }
  return price[dst] === Infinity ? -1 : price[dst];
}

// @@ 105
function minCostConnectPoints(points) {
  const n = points.length;
  const dist = new Array(n).fill(Infinity); // cheapest edge from the tree to each point
  const inTree = new Array(n).fill(false);
  dist[0] = 0;
  let total = 0;
  for (let step = 0; step < n; step++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!inTree[i] && (u === -1 || dist[i] < dist[u])) u = i;
    inTree[u] = true;
    total += dist[u];
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue;
      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
      dist[v] = Math.min(dist[v], d);
    }
  }
  return total;
}

// @@ 106
function findItinerary(tickets) {
  const adj = new Map(); // destinations, reverse-sorted so pop() gives the smallest
  for (const [a, b] of [...tickets].sort().reverse()) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);
  }
  const route = [];
  const dfs = airport => {
    const out = adj.get(airport) || [];
    while (out.length) dfs(out.pop()); // use this ticket
    route.push(airport); // post-order
  };
  dfs('JFK');
  return route.reverse();
}

// @@ 107
function swimInWater(grid) {
  const n = grid.length;
  const heap = new Heap((a, b) => a[0] < b[0]); // [max so far, r, c]
  const seen = Array.from({ length: n }, () => new Array(n).fill(false));
  heap.push([grid[0][0], 0, 0]);
  seen[0][0] = true;
  while (heap.size) {
    const [t, r, c] = heap.pop();
    if (r === n - 1 && c === n - 1) return t;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      heap.push([Math.max(t, grid[nr][nc]), nr, nc]);
    }
  }
  return -1;
}

// @@ 108
function sortItems(n, m, group, beforeItems) {
  group = [...group];
  for (let i = 0; i < n; i++) if (group[i] === -1) group[i] = m++; // lone item -> its own group
  const topo = (count, edges) => { // Kahn's algorithm; null if there is a cycle
    const adj = Array.from({ length: count }, () => []);
    const indeg = new Array(count).fill(0);
    for (const [a, b] of edges) {
      adj[a].push(b);
      indeg[b]++;
    }
    const order = [];
    for (let i = 0; i < count; i++) if (indeg[i] === 0) order.push(i);
    for (let head = 0; head < order.length; head++)
      for (const v of adj[order[head]]) if (--indeg[v] === 0) order.push(v);
    return order.length === count ? order : null;
  };
  const itemEdges = [], groupEdges = [];
  for (let b = 0; b < n; b++)
    for (const a of beforeItems[b]) { // a must come before b
      itemEdges.push([a, b]);
      if (group[a] !== group[b]) groupEdges.push([group[a], group[b]]);
    }
  const itemOrder = topo(n, itemEdges), groupOrder = topo(m, groupEdges);
  if (!itemOrder || !groupOrder) return [];
  const members = Array.from({ length: m }, () => []);
  for (const item of itemOrder) members[group[item]].push(item);
  return groupOrder.flatMap(g => members[g]);
}

// @@ 110
function climbStairs(n) {
  let a = 1, b = 1; // ways to reach step i-2, i-1
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

// @@ 111
function minCostClimbingStairs(cost) {
  let a = 0, b = 0; // min cost to stand on step i-2, i-1
  for (let i = 2; i <= cost.length; i++) {
    [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  }
  return b;
}

// @@ 112
function rob(nums) {
  let prev2 = 0, prev1 = 0; // best up to two houses back, best so far
  for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)]; // skip, or rob
  return prev1;
}

// @@ 113
function rob(nums) {
  const robLine = houses => {
    let prev2 = 0, prev1 = 0;
    for (const x of houses) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];
    return prev1;
  };
  if (nums.length === 1) return nums[0];
  return Math.max(robLine(nums.slice(0, -1)), robLine(nums.slice(1))); // drop last, or drop first
}

// @@ 114
function longestPalindrome(s) {
  let bestL = 0, bestLen = s.length ? 1 : 0;
  for (let center = 0; center < s.length; center++) {
    for (const r0 of [center, center + 1]) { // odd, then even centre
      let l = center, r = r0;
      while (l >= 0 && r < s.length && s[l] === s[r]) {
        l--;
        r++;
      }
      if (r - l - 1 > bestLen) { // palindrome is s[l+1 .. r-1]
        bestLen = r - l - 1;
        bestL = l + 1;
      }
    }
  }
  return s.slice(bestL, bestL + bestLen);
}

// @@ 115
function countSubstrings(s) {
  let count = 0;
  for (let center = 0; center < s.length; center++) {
    for (const r0 of [center, center + 1]) { // odd, then even centre
      let l = center, r = r0;
      while (l >= 0 && r < s.length && s[l] === s[r]) {
        count++;
        l--;
        r++;
      }
    }
  }
  return count;
}

// @@ 116
function numDecodings(s) {
  let prev2 = 0, prev1 = 1; // ways for s[:i-2], s[:i-1]; empty prefix = 1
  for (let i = 1; i <= s.length; i++) {
    let cur = 0;
    if (s[i - 1] !== '0') cur += prev1; // single digit
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) cur += prev2; // two digits
    }
    [prev2, prev1] = [prev1, cur];
  }
  return prev1;
}

// @@ 117
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity); // dp[a] = fewest coins for a
  dp[0] = 0;
  for (let a = 1; a <= amount; a++)
    for (const c of coins)
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// @@ 118
function maxProduct(nums) {
  let best = nums[0], curMax = nums[0], curMin = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const a = x * curMax, b = x * curMin; // from the OLD values
    curMax = Math.max(x, a, b);
    curMin = Math.min(x, a, b);
    best = Math.max(best, curMax);
  }
  return best;
}

// @@ 119
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const longest = Math.max(0, ...wordDict.map(w => w.length));
  const dp = new Array(s.length + 1).fill(false); // dp[i]: s[0..i) can be segmented
  dp[0] = true;
  for (let i = 1; i <= s.length; i++)
    for (let j = Math.max(0, i - longest); j < i; j++)
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
  return dp[s.length];
}

// @@ 120
function lengthOfLIS(nums) {
  const tails = []; // tails[k] = smallest tail of an increasing run of length k + 1
  for (const x of nums) {
    let lo = 0, hi = tails.length; // first tail >= x
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x; // replaces, or appends when lo === length
  }
  return tails.length;
}

// @@ 121
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false); // dp[t]: some subset sums to t
  dp[0] = true;
  for (const x of nums)
    for (let t = target; t >= x; t--) // downwards: each number used once
      dp[t] = dp[t] || dp[t - x];
  return dp[target];
}
