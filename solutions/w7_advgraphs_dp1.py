from _harness import *

# ── Advanced Graphs ───────────────────────────────────────────────

@sol(103, ex='times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', run=lambda f: f([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2), expect=2,
     tests=[(lambda f: f([[1, 2, 1]], 2, 1), 1), (lambda f: f([[1, 2, 1]], 2, 2), -1),
            (lambda f: f([[1, 2, 5], [1, 3, 1], [3, 2, 1]], 3, 1), 2)],
     algo=['Adjacency list u → (v, w).',
           'Dijkstra from k with a min-heap of (time, node); a node is final the first time it is popped.',
           'Push unfinished neighbours with time + w.',
           'All n nodes reached → the largest final time; otherwise −1.'],
     dry=['pop (0, 2) → dist[2]=0 → push (1, 1), (1, 3)',
          'pop (1, 1) → dist[1]=1',
          'pop (1, 3) → dist[3]=1 → push (2, 4)',
          'pop (2, 4) → dist[4]=2',
          'all 4 reached → max = 2'])
def networkDelayTime(times, n, k):
    adj = defaultdict(list)
    for u, v, w in times:
        adj[u].append((v, w))
    dist = {}
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in dist:
            continue
        dist[u] = d
        for v, w in adj[u]:
            if v not in dist:
                heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1


@sol(104, ex='n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1',
     run=lambda f: f(4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1), expect=700,
     tests=[(lambda f: f(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1), 200),
            (lambda f: f(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0), 500)],
     algo=['price[v] = cheapest cost to reach v using the flights allowed so far.',
           'At most k stops = at most k + 1 flights → run k + 1 rounds of Bellman-Ford.',
           'Each round relaxes every flight from a COPY of last round’s prices, so a round adds only one flight.',
           'Unreached dst → −1.'],
     dry=['start price = [0, inf, inf, inf]',
          'round 1 (1 flight): 0→1 → price[1] = 100',
          'round 2 (2 flights): 1→2 → 200, 1→3 → 700 (2→3 uses old inf)',
          'price[3] = 700 (0→1→2→3 = 400 would need 3 flights)'])
def findCheapestPrice(n, flights, src, dst, k):
    price = [float('inf')] * n
    price[src] = 0
    for _ in range(k + 1):
        nxt = price[:]
        for u, v, w in flights:
            if price[u] + w < nxt[v]:
                nxt[v] = price[u] + w
        price = nxt
    return price[dst] if price[dst] != float('inf') else -1


@sol(105, ex='points = [[0,0],[2,2],[3,10],[5,2],[7,0]]', run=lambda f: f([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]), expect=20,
     tests=[(lambda f: f([[3, 12], [-2, 5], [-4, 1]]), 18), (lambda f: f([[0, 0]]), 0)],
     algo=["Prim's algorithm on the complete graph (edge cost = Manhattan distance).",
           'dist[i] = cheapest edge from the growing tree to point i; dist[0] = 0.',
           'n times: add the closest point not in the tree, pay dist[u], then lower dist[v] for every other point.'],
     dry=['add P0 (+0) → dist P1=4, P2=13, P3=7, P4=7',
          'add P1 (+4) → P2=9, P3=3, P4=7',
          'add P3 (+3) → P2=9, P4=4',
          'add P4 (+4) → P2 stays 9',
          'add P2 (+9) ⇒ total 0+4+3+4+9 = 20'])
def minCostConnectPoints(points):
    n = len(points)
    dist = [float('inf')] * n
    in_tree = [False] * n
    dist[0] = 0
    total = 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_tree[i]), key=lambda i: dist[i])
        in_tree[u] = True
        total += dist[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                dist[v] = min(dist[v], d)
    return total


@sol(106, ex='tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]',
     run=lambda f: f([['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']]),
     expect=['JFK', 'ATL', 'JFK', 'SFO', 'ATL', 'SFO'],
     tests=[(lambda f: f([['MUC', 'LHR'], ['JFK', 'MUC'], ['SFO', 'SJC'], ['LHR', 'SFO']]), ['JFK', 'MUC', 'LHR', 'SFO', 'SJC']),
            (lambda f: f([['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']]), ['JFK', 'NRT', 'JFK', 'KUL'])],
     algo=['adj[from] = destinations kept so the lexically smallest comes out first (reverse-sorted list + pop, or a min-heap).',
           "Hierholzer: dfs(a) keeps taking (and removing) a's next ticket and recursing.",
           'When an airport has no tickets left, append it to route (post-order).',
           'route reversed is the itinerary — dead ends naturally land at the end.'],
     dry=['adj: JFK [SFO, ATL], ATL [SFO, JFK], SFO [ATL]  (pop takes the last)',
          'JFK → ATL → JFK → SFO → ATL → SFO (no tickets left)',
          'unwind appends: SFO, ATL, SFO, JFK, ATL, JFK',
          'reverse ⇒ JFK, ATL, JFK, SFO, ATL, SFO'])
def findItinerary(tickets):
    adj = defaultdict(list)
    for a, b in sorted(tickets, reverse=True):
        adj[a].append(b)
    route = []

    def dfs(airport):
        while adj[airport]:
            dfs(adj[airport].pop())
        route.append(airport)

    dfs('JFK')
    return route[::-1]


@sol(107, ex='grid = [[0, 2], [1, 3]]', run=lambda f: f([[0, 2], [1, 3]]), expect=3,
     tests=[(lambda f: f([[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]), 16),
            (lambda f: f([[0]]), 0)],
     algo=['Cost of a path = the highest cell on it; we want the path with the smallest such max.',
           'Dijkstra with a min-heap of (max so far, r, c), starting at (grid[0][0], 0, 0).',
           'Pop the lowest; reaching the bottom-right → return its time.',
           'Push unseen neighbours with max(time, their height).'],
     dry=['pop (0, 0,0) → push (2, 0,1), (1, 1,0)',
          'pop (1, 1,0) → push (3, 1,1)',
          'pop (2, 0,1) → (1,1) already seen',
          'pop (3, 1,1) → target ⇒ 3'])
def swimInWater(grid):
    n = len(grid)
    heap = [(grid[0][0], 0, 0)]
    seen = {(0, 0)}
    while heap:
        t, r, c = heapq.heappop(heap)
        if (r, c) == (n - 1, n - 1):
            return t
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))


def _valid_items(order, n, group, before):
    if sorted(order) != list(range(n)):
        return False
    pos = {x: i for i, x in enumerate(order)}
    if any(pos[a] > pos[b] for b in range(n) for a in before[b]):
        return False
    for g in set(x for x in group if x != -1):
        idx = sorted(pos[i] for i in range(n) if group[i] == g)
        if idx[-1] - idx[0] + 1 != len(idx):
            return False
    return True


_G = [-1, -1, 1, 0, 0, 1, 0, -1]
_B1 = [[], [6], [5], [6], [3, 6], [], [], []]
_B2 = [[], [6], [5], [6], [3], [], [4], []]


@sol(108, ex='n = 8, m = 2, group = [-1,-1,1,0,0,1,0,-1], beforeItems = [[],[6],[5],[6],[3,6],[],[],[]]',
     run=lambda f: f(8, 2, _G, _B1), expect=[6, 3, 4, 5, 2, 0, 7, 1],
     tests=[(lambda f: _valid_items(f(8, 2, _G, _B1), 8, _G, _B1), True), (lambda f: f(8, 2, _G, _B2), [])],
     algo=['Give every ungrouped item (−1) its own new group id.',
           'Edges: a → b for each "a before b"; if a and b are in different groups also add group[a] → group[b].',
           "Topologically sort ALL items and ALL groups with Kahn's algorithm (either has a cycle → []).",
           'Bucket the item order by group (keeps the within-group order), then emit buckets in group order.'],
     dry=['lone items 0, 1, 7 → new groups 2, 3, 4',
          'item edges 6→1, 5→2, 6→3, 3→4, 6→4; group edge 0→3 (6 is in g0, 1 is in g3)',
          'item order: [0, 5, 6, 7, 2, 1, 3, 4]',
          'group order: [0, 1, 2, 4, 3]',
          'emit g0 [6,3,4], g1 [5,2], g2 [0], g4 [7], g3 [1]'])
def sortItems(n, m, group, beforeItems):
    group = group[:]
    for i in range(n):
        if group[i] == -1:
            group[i] = m
            m += 1

    def topo(nodes, edges):
        indeg = {u: 0 for u in nodes}
        adj = defaultdict(list)
        for a, b in edges:
            adj[a].append(b)
            indeg[b] += 1
        q = deque(u for u in nodes if indeg[u] == 0)
        order = []
        while q:
            u = q.popleft()
            order.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
        return order if len(order) == len(nodes) else None

    item_edges, group_edges = [], []
    for b in range(n):
        for a in beforeItems[b]:
            item_edges.append((a, b))
            if group[a] != group[b]:
                group_edges.append((group[a], group[b]))
    item_order = topo(list(range(n)), item_edges)
    group_order = topo(list(range(m)), group_edges)
    if item_order is None or group_order is None:
        return []
    members = defaultdict(list)
    for item in item_order:
        members[group[item]].append(item)
    return [item for g in group_order for item in members[g]]


# ── 1-D DP ────────────────────────────────────────────────────────

@sol(110, ex='n = 5', run=lambda f: f(5), expect=8,
     tests=[(lambda f: f(1), 1), (lambda f: f(2), 2), (lambda f: f(3), 3)],
     algo=['ways(i) = ways(i−1) + ways(i−2): the last move was 1 step or 2 steps.',
           'Keep only the last two values: a = ways(i−2), b = ways(i−1), starting at 1, 1.',
           'Repeat n − 1 times; answer b.'],
     dry=['start (a, b) = (1, 1)  → ways(0), ways(1)',
          'ways(2) = 2 → (1, 2)',
          'ways(3) = 3 → (2, 3)',
          'ways(4) = 5 → (3, 5)',
          'ways(5) = 8 ⇒ 8'])
def climbStairs(n):
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b


@sol(111, ex='cost = [10, 15, 20]', run=lambda f: f([10, 15, 20]), expect=15,
     tests=[(lambda f: f([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]), 6), (lambda f: f([0, 0]), 0)],
     algo=['dp[i] = min cost to STAND on step i; the top is step n. dp[0] = dp[1] = 0 (free start).',
           'dp[i] = min(dp[i−1] + cost[i−1], dp[i−2] + cost[i−2]) — pay for the step you leave from.',
           'Roll two variables; answer dp[n].'],
     dry=['dp0 = 0, dp1 = 0',
          'dp2 = min(0 + 15, 0 + 10) = 10',
          'dp3 = min(10 + 20, 0 + 15) = 15 ⇒ 15'])
def minCostClimbingStairs(cost):
    a, b = 0, 0
    for i in range(2, len(cost) + 1):
        a, b = b, min(b + cost[i - 1], a + cost[i - 2])
    return b


@sol(112, ex='nums = [2, 7, 9, 3, 1]', run=lambda f: f([2, 7, 9, 3, 1]), expect=12,
     tests=[(lambda f: f([1, 2, 3, 1]), 4), (lambda f: f([5]), 5)],
     algo=['best(i) = max(best(i−1), best(i−2) + nums[i]) — skip this house, or rob it and skip the previous.',
           'prev2 = best two houses back, prev1 = best so far; both start at 0.'],
     dry=['2 → max(0, 0+2) = 2',
          '7 → max(2, 0+7) = 7',
          '9 → max(7, 2+9) = 11',
          '3 → max(11, 7+3) = 11',
          '1 → max(11, 11+1) = 12 ⇒ 12'])
def rob(nums):
    prev2 = prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1


@sol(113, ex='nums = [2, 3, 2]', run=lambda f: f([2, 3, 2]), expect=3,
     tests=[(lambda f: f([1, 2, 3, 1]), 4), (lambda f: f([1]), 1), (lambda f: f([1, 2, 3]), 3)],
     algo=['Houses form a circle, so the first and last can’t both be robbed.',
           'Run House Robber twice: once without the last house, once without the first.',
           'Answer = the larger (one house → just that house).'],
     dry=['without last: [2, 3] → 3',
          'without first: [3, 2] → 3',
          'max(3, 3) ⇒ 3'])
def robII(nums):
    def rob_line(houses):
        prev2 = prev1 = 0
        for x in houses:
            prev2, prev1 = prev1, max(prev1, prev2 + x)
        return prev1

    if len(nums) == 1:
        return nums[0]
    return max(rob_line(nums[:-1]), rob_line(nums[1:]))


@sol(114, ex='s = "babad"', run=lambda f: f('babad'), expect='bab',
     tests=[(lambda f: f('cbbd'), 'bb'), (lambda f: f('a'), 'a'), (lambda f: f('forgeeksskeegfor'), 'geeksskeeg')],
     algo=['Every palindrome has a centre: a character (odd length) or a gap between two (even length).',
           'For each of the 2n − 1 centres, expand l−−, r++ while s[l] == s[r].',
           'After expanding, the palindrome is s[l+1 .. r−1]; keep the longest.'],
     dry=["centre 0: 'b'",
          "centre 1: 'a' → 'bab' (0..2) ★",
          "centre 2: 'b' → 'aba' (1..3), same length → keep 'bab'",
          "even centres: no two equal neighbours ⇒ 'bab'"])
def longestPalindrome(s):
    best_l, best_r = 0, 0
    for center in range(len(s)):
        for l, r in ((center, center), (center, center + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l, r = l - 1, r + 1
            if (r - 1) - (l + 1) > best_r - best_l:
                best_l, best_r = l + 1, r - 1
    return s[best_l:best_r + 1]


@sol(115, ex='s = "aaa"', run=lambda f: f('aaa'), expect=6,
     tests=[(lambda f: f('abc'), 3)],
     algo=['Same centre expansion as Longest Palindromic Substring.',
           'Every successful expansion step is one more palindromic substring → count += 1.'],
     dry=["centre 0: 'a' (+1); gap 0-1: 'aa' (+1) → 2",
          "centre 1: 'a', 'aaa' (+2); gap 1-2: 'aa' (+1) → 5",
          "centre 2: 'a' (+1) ⇒ 6"])
def countSubstrings(s):
    count = 0
    for center in range(len(s)):
        for l, r in ((center, center), (center, center + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                count += 1
                l, r = l - 1, r + 1
    return count


@sol(116, ex='s = "226"', run=lambda f: f('226'), expect=3,
     tests=[(lambda f: f('12'), 2), (lambda f: f('06'), 0), (lambda f: f('10'), 1), (lambda f: f('2101'), 1)],
     algo=['dp[i] = number of ways to decode s[:i]; dp[0] = 1 (empty string).',
           'If s[i−1] is not "0" it can stand alone → add dp[i−1].',
           'If the two digits s[i−2:i] form 10..26 → add dp[i−2].',
           'Roll two variables: prev2 = dp[i−2], prev1 = dp[i−1].'],
     dry=["i=1 '2' → 1 way",
          "i=2 '2' alone (+1) and '22' (+1) → 2",
          "i=3 '6' alone (+2) and '26' (+1) → 3 ⇒ 3  (2|2|6, 22|6, 2|26)"])
def numDecodings(s):
    prev2, prev1 = 0, 1
    for i in range(1, len(s) + 1):
        cur = 0
        if s[i - 1] != '0':
            cur += prev1
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1


@sol(117, ex='coins = [1, 2, 5], amount = 11', run=lambda f: f([1, 2, 5], 11), expect=3,
     tests=[(lambda f: f([2], 3), -1), (lambda f: f([1], 0), 0), (lambda f: f([1, 3, 4], 6), 2)],
     algo=['dp[a] = fewest coins that make amount a; dp[0] = 0, everything else inf.',
           'For each amount a and each coin c ≤ a: dp[a] = min(dp[a], dp[a − c] + 1).',
           'dp[amount] still inf → −1.'],
     dry=['dp[0..5] = 0, 1, 1, 2, 2, 1',
          'dp[6] = dp[5] + 1 = 2;  dp[10] = dp[5] + 1 = 2',
          'dp[11] = min(dp[10], dp[9], dp[6]) + 1 = 3 ⇒ 3 (5+5+1)'])
def coinChange(coins, amount):
    dp = [0] + [float('inf')] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1


@sol(118, ex='nums = [2, 3, -2, 4]', run=lambda f: f([2, 3, -2, 4]), expect=6,
     tests=[(lambda f: f([-2, 0, -1]), 0), (lambda f: f([-2, 3, -4]), 24), (lambda f: f([-2]), -2)],
     algo=['Track the max AND min product of a subarray ending here (a negative can flip min into max).',
           'For each x: candidates are x, x·curMax, x·curMin (computed from the OLD values).',
           'curMax, curMin = max / min of the candidates; best = max(best, curMax).'],
     dry=['start: max = min = best = 2',
          'x=3: (3, 6, 6) → max 6, min 3, best 6',
          'x=-2: (-2, -12, -6) → max -2, min -12',
          'x=4: (4, -8, -48) → max 4, min -48 ⇒ best 6'])
def maxProduct(nums):
    best = cur_max = cur_min = nums[0]
    for x in nums[1:]:
        candidates = (x, x * cur_max, x * cur_min)
        cur_max, cur_min = max(candidates), min(candidates)
        best = max(best, cur_max)
    return best


@sol(119, ex='s = "leetcode", wordDict = ["leet", "code"]', run=lambda f: f('leetcode', ['leet', 'code']), expect=True,
     tests=[(lambda f: f('applepenapple', ['apple', 'pen']), True),
            (lambda f: f('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']), False)],
     algo=['dp[i] = s[:i] can be split into dictionary words; dp[0] = True.',
           'dp[i] = True if some j < i has dp[j] and s[j:i] in the word set.',
           'Only check j within the longest word length of i. Answer dp[n].'],
     dry=['dp[0] = True',
          "dp[4]: s[0:4] = 'leet' ∈ dict → True",
          'dp[1..3], dp[5..7] stay False',
          "dp[8]: dp[4] and s[4:8] = 'code' ∈ dict → True ⇒ True"])
def wordBreak(s, wordDict):
    words = set(wordDict)
    longest = max(map(len, words), default=0)
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - longest), i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[len(s)]


@sol(120, ex='nums = [10, 9, 2, 5, 3, 7, 101, 18]', run=lambda f: f([10, 9, 2, 5, 3, 7, 101, 18]), expect=4,
     tests=[(lambda f: f([0, 1, 0, 3, 2, 3]), 4), (lambda f: f([7, 7, 7, 7]), 1)],
     algo=['tails[k] = smallest possible tail of an increasing subsequence of length k + 1.',
           'For each x: binary search the first tail ≥ x (lower_bound).',
           'Past the end → append (longer subsequence); otherwise replace it (a better tail).',
           'Answer = len(tails).'],
     dry=['10 → [10];  9 → [9];  2 → [2]',
          '5 → [2, 5];  3 → [2, 3]',
          '7 → [2, 3, 7];  101 → [2, 3, 7, 101]',
          '18 → [2, 3, 7, 18] ⇒ 4'])
def lengthOfLIS(nums):
    tails = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)


@sol(121, ex='nums = [1, 5, 11, 5]', run=lambda f: f([1, 5, 11, 5]), expect=True,
     tests=[(lambda f: f([1, 2, 3, 5]), False), (lambda f: f([1, 1]), True), (lambda f: f([2, 2, 3, 5]), False)],
     algo=['Odd total → False. Otherwise look for a subset summing to target = total / 2.',
           'dp[t] = some subset of the numbers seen so far sums to t; dp[0] = True.',
           'For each x, loop t DOWN from target to x: dp[t] |= dp[t − x] (downwards = each number used once).'],
     dry=['total 22 → target 11',
          'x=1 → reachable {0, 1}',
          'x=5 → {0, 1, 5, 6}',
          'x=11 → adds 11, 12…; dp[11] = dp[0] = True',
          'x=5 → … ⇒ True (11 = 11, 1+5+5 = 11)'])
def canPartition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [True] + [False] * target
    for x in nums:
        for t in range(target, x - 1, -1):
            dp[t] = dp[t] or dp[t - x]
    return dp[target]
