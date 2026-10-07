// Week 7 — Advanced Graphs, 1-D DP.

// @@ 103
function networkDelayTime(times, n, k) {

  // graph[u] = list of [v, w]
  const graph = [];
  for (let i = 0; i <= n; i++) {
    graph.push([]);
  }
  for (const t of times) {
    graph[t[0]].push([t[1], t[2]]);
  }

  const dist = new Array(n + 1).fill(Infinity);

  // [time, node], smallest time first
  const heap = new Heap((a, b) => a[0] < b[0]);
  heap.push([0, k]);

  while (heap.size > 0) {

    const top = heap.pop();
    const time = top[0];
    const node = top[1];

    if (dist[node] !== Infinity) {
      continue; // already final
    }

    dist[node] = time;

    for (const edge of graph[node]) {
      const next = edge[0];
      const w = edge[1];

      if (dist[next] === Infinity) {
        heap.push([time + w, next]);
      }
    }
  }

  let ans = 0;

  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) {
      return -1;
    }
    ans = Math.max(ans, dist[i]);
  }

  return ans;
}

// @@ 104
function findCheapestPrice(n, flights, src, dst, k) {

  let price = new Array(n).fill(Infinity);
  price[src] = 0;

  // at most k + 1 flights
  for (let round = 0; round <= k; round++) {

    // relax only from last round's prices
    const next = price.slice();

    for (const f of flights) {
      const from = f[0];
      const to = f[1];
      const cost = f[2];

      if (price[from] + cost < next[to]) {
        next[to] = price[from] + cost;
      }
    }

    price = next;
  }

  if (price[dst] === Infinity) {
    return -1;
  }

  return price[dst];
}

// @@ 105
function minCostConnectPoints(points) {

  const n = points.length;

  const dist = new Array(n).fill(Infinity); // cheapest edge from the tree to each point
  const inTree = new Array(n).fill(false);
  dist[0] = 0;

  let total = 0;

  for (let step = 0; step < n; step++) {

    // pick the closest point not yet in the tree
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (u === -1 || dist[i] < dist[u])) {
        u = i;
      }
    }

    inTree[u] = true;
    total += dist[u];

    // update distances through u
    for (let v = 0; v < n; v++) {
      if (inTree[v]) {
        continue;
      }

      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
      dist[v] = Math.min(dist[v], d);
    }
  }

  return total;
}

// @@ 106
function findItinerary(tickets) {

  // reverse-sorted, so pop() gives the smallest destination
  const sorted = tickets.slice();
  sorted.sort();
  sorted.reverse();

  const graph = new Map();

  for (const t of sorted) {
    const from = t[0];
    const to = t[1];

    if (!graph.has(from)) {
      graph.set(from, []);
    }
    graph.get(from).push(to);
  }

  const route = [];

  function dfs(airport) {

    const dests = graph.get(airport) || [];

    while (dests.length > 0) {
      const next = dests.pop(); // use this ticket
      dfs(next);
    }

    route.push(airport); // post-order
  }

  dfs('JFK');

  route.reverse();

  return route;
}

// @@ 107
function swimInWater(grid) {

  const n = grid.length;

  // [max height so far, row, col], smallest first
  const heap = new Heap((a, b) => a[0] < b[0]);

  const seen = [];
  for (let i = 0; i < n; i++) {
    seen.push(new Array(n).fill(false));
  }

  heap.push([grid[0][0], 0, 0]);
  seen[0][0] = true;

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (heap.size > 0) {

    const top = heap.pop();
    const time = top[0];
    const r = top[1];
    const c = top[2];

    if (r === n - 1 && c === n - 1) {
      return time;
    }

    for (const d of dirs) {

      const nr = r + d[0];
      const nc = c + d[1];

      if (nr < 0 || nc < 0 || nr >= n || nc >= n) {
        continue;
      }

      if (seen[nr][nc]) {
        continue;
      }

      seen[nr][nc] = true;
      heap.push([Math.max(time, grid[nr][nc]), nr, nc]);
    }
  }

  return -1;
}

// @@ 108
function sortItems(n, m, group, beforeItems) {

  // Kahn's algorithm over nodes 0..count-1; null if there is a cycle
  function topoSort(count, edges) {

    const graph = [];
    for (let i = 0; i < count; i++) {
      graph.push([]);
    }

    const indeg = new Array(count).fill(0);

    for (const e of edges) {
      graph[e[0]].push(e[1]);
      indeg[e[1]]++;
    }

    const queue = [];
    for (let i = 0; i < count; i++) {
      if (indeg[i] === 0) {
        queue.push(i);
      }
    }

    const order = [];
    let head = 0;

    while (head < queue.length) {

      const u = queue[head];
      head++;

      order.push(u);

      for (const v of graph[u]) {
        indeg[v]--;
        if (indeg[v] === 0) {
          queue.push(v);
        }
      }
    }

    if (order.length < count) {
      return null;
    }

    return order;
  }

  // copy, then give each lone item its own group
  group = group.slice();
  for (let i = 0; i < n; i++) {
    if (group[i] === -1) {
      group[i] = m;
      m++;
    }
  }

  const itemEdges = [];
  const groupEdges = [];

  for (let b = 0; b < n; b++) {
    for (const a of beforeItems[b]) { // a must come before b
      itemEdges.push([a, b]);

      if (group[a] !== group[b]) {
        groupEdges.push([group[a], group[b]]);
      }
    }
  }

  const itemOrder = topoSort(n, itemEdges);
  const groupOrder = topoSort(m, groupEdges);

  if (itemOrder === null || groupOrder === null) {
    return [];
  }

  // items of each group, already in item order
  const members = [];
  for (let g = 0; g < m; g++) {
    members.push([]);
  }
  for (const item of itemOrder) {
    members[group[item]].push(item);
  }

  const ans = [];

  for (const g of groupOrder) {
    for (const item of members[g]) {
      ans.push(item);
    }
  }

  return ans;
}

// @@ 110
function climbStairs(n) {

  let prev2 = 1; // ways to reach step i-2
  let prev1 = 1; // ways to reach step i-1

  for (let i = 2; i <= n; i++) {
    const cur = prev1 + prev2;
    prev2 = prev1;
    prev1 = cur;
  }

  return prev1;
}

// @@ 111
function minCostClimbingStairs(cost) {

  const n = cost.length;

  let prev2 = 0; // min cost to stand on step i-2
  let prev1 = 0; // min cost to stand on step i-1

  for (let i = 2; i <= n; i++) {
    const cur = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
    prev2 = prev1;
    prev1 = cur;
  }

  return prev1;
}

// @@ 112
function rob(nums) {

  let prev2 = 0; // best up to two houses back
  let prev1 = 0; // best so far

  for (const money of nums) {
    const cur = Math.max(prev1, prev2 + money); // skip it, or rob it
    prev2 = prev1;
    prev1 = cur;
  }

  return prev1;
}

// @@ 113
function rob(nums) {

  function robLine(start, end) {

    let prev2 = 0;
    let prev1 = 0;

    for (let i = start; i <= end; i++) {
      const cur = Math.max(prev1, prev2 + nums[i]);
      prev2 = prev1;
      prev1 = cur;
    }

    return prev1;
  }

  const n = nums.length;

  if (n === 1) {
    return nums[0];
  }

  const skipLast = robLine(0, n - 2);
  const skipFirst = robLine(1, n - 1);

  return Math.max(skipLast, skipFirst);
}

// @@ 114
function longestPalindrome(s) {

  const n = s.length;

  // expand around l..r; returns [start, length] of the palindrome found
  function expand(l, r) {

    while (l >= 0 && r < n && s[l] === s[r]) {
      l--;
      r++;
    }

    return [l + 1, r - l - 1];
  }

  let bestStart = 0;
  let bestLen = 0;
  if (n > 0) {
    bestLen = 1;
  }

  for (let center = 0; center < n; center++) {

    const odd = expand(center, center);
    if (odd[1] > bestLen) {
      bestStart = odd[0];
      bestLen = odd[1];
    }

    const even = expand(center, center + 1);
    if (even[1] > bestLen) {
      bestStart = even[0];
      bestLen = even[1];
    }
  }

  return s.slice(bestStart, bestStart + bestLen);
}

// @@ 115
function countSubstrings(s) {

  const n = s.length;

  // number of palindromes found by expanding around l..r
  function expand(l, r) {

    let count = 0;

    while (l >= 0 && r < n && s[l] === s[r]) {
      count++;
      l--;
      r++;
    }

    return count;
  }

  let ans = 0;

  for (let center = 0; center < n; center++) {
    ans += expand(center, center);     // odd length
    ans += expand(center, center + 1); // even length
  }

  return ans;
}

// @@ 116
function numDecodings(s) {

  const n = s.length;

  let prev2 = 0; // ways to decode s[:i-2]
  let prev1 = 1; // ways to decode s[:i-1]; empty prefix = 1

  for (let i = 1; i <= n; i++) {

    let cur = 0;

    // single digit
    if (s[i - 1] !== '0') {
      cur += prev1;
    }

    // two digits
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) {
        cur += prev2;
      }
    }

    prev2 = prev1;
    prev1 = cur;
  }

  return prev1;
}

// @@ 117
function coinChange(coins, amount) {

  const dp = new Array(amount + 1).fill(Infinity); // dp[a] = fewest coins for a
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1);
      }
    }
  }

  if (dp[amount] === Infinity) {
    return -1;
  }

  return dp[amount];
}

// @@ 118
function maxProduct(nums) {

  let best = nums[0];
  let curMax = nums[0];
  let curMin = nums[0];

  for (let i = 1; i < nums.length; i++) {

    const x = nums[i];

    // use the OLD curMax / curMin
    const withMax = x * curMax;
    const withMin = x * curMin;

    curMax = Math.max(x, withMax, withMin);
    curMin = Math.min(x, withMax, withMin);

    best = Math.max(best, curMax);
  }

  return best;
}

// @@ 119
function wordBreak(s, wordDict) {

  const words = new Set(wordDict);

  let longest = 0;
  for (const w of wordDict) {
    longest = Math.max(longest, w.length);
  }

  const n = s.length;

  const dp = new Array(n + 1).fill(false); // dp[i]: s[0..i) can be segmented
  dp[0] = true;

  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - longest); j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }

  return dp[n];
}

// @@ 120
function lengthOfLIS(nums) {

  const tails = []; // tails[k] = smallest tail of an increasing run of length k + 1

  for (const x of nums) {

    // binary search for the first tail >= x
    let lo = 0;
    let hi = tails.length;

    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < x) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    if (lo === tails.length) {
      tails.push(x);
    } else {
      tails[lo] = x;
    }
  }

  return tails.length;
}

// @@ 121
function canPartition(nums) {

  let total = 0;
  for (const x of nums) {
    total += x;
  }

  if (total % 2 === 1) {
    return false;
  }

  const target = total / 2;

  const dp = new Array(target + 1).fill(false); // dp[t]: some subset sums to t
  dp[0] = true;

  for (const x of nums) {
    // go downwards so each number is used once
    for (let t = target; t >= x; t--) {
      if (dp[t - x]) {
        dp[t] = true;
      }
    }
  }

  return dp[target];
}
