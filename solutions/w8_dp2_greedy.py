from _harness import *

# ── 2-D DP ────────────────────────────────────────────────────────

@sol(123, ex='m = 3, n = 3', run=lambda f: f(3, 3), expect=6,
     tests=[(lambda f: f(3, 7), 28), (lambda f: f(1, 1), 1), (lambda f: f(3, 2), 3)],
     algo=['paths(r, c) = paths(r−1, c) + paths(r, c−1): you arrive from above or from the left.',
           'First row and first column have exactly 1 path.',
           'Keep one row: row[j] += row[j−1] (row[j] already holds the value from above).'],
     dry=['row 0: [1, 1, 1]',
          'row 1: [1, 1+1=2, 2+1=3]',
          'row 2: [1, 1+2=3, 3+3=6] ⇒ 6'])
def uniquePaths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]
    return row[-1]


@sol(124, ex='text1 = "abcde", text2 = "ace"', run=lambda f: f('abcde', 'ace'), expect=3,
     tests=[(lambda f: f('abc', 'abc'), 3), (lambda f: f('abc', 'def'), 0)],
     algo=['dp[i][j] = LCS of text1[:i] and text2[:j]; row/column 0 are empty prefixes (0).',
           'Last chars equal → dp[i−1][j−1] + 1.',
           'Otherwise → max(dp[i−1][j], dp[i][j−1]) (drop one char from either string).'],
     dry=['        a  c  e',
          'a    [ 1, 1, 1 ]',
          'b    [ 1, 1, 1 ]',
          'c    [ 1, 2, 2 ]',
          'd    [ 1, 2, 2 ]',
          'e    [ 1, 2, 3 ] ⇒ 3 ("ace")'])
def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]


@sol(125, ex='prices = [1, 2, 3, 0, 2]', run=lambda f: f([1, 2, 3, 0, 2]), expect=3,
     tests=[(lambda f: f([1]), 0), (lambda f: f([2, 1]), 0)],
     algo=['Three states at the end of each day:',
           'hold = own a stock; sold = sold today (must cool down tomorrow); rest = no stock, free to buy.',
           'hold = max(hold, rest − price); sold = hold + price; rest = max(rest, sold) — all from YESTERDAY’s values (save prevHold, prevSold, prevRest first).',
           'Answer = max(sold, rest).'],
     dry=['price 1: hold=-1, sold=-inf, rest=0',
          'price 2: hold=-1, sold=1, rest=0',
          'price 3: hold=-1, sold=2, rest=1',
          'price 0: hold=max(-1, 1-0)=1, sold=-1, rest=2',
          'price 2: hold=1, sold=1+2=3, rest=2 ⇒ 3 (buy 1, sell 2, cool, buy 0, sell 2)'])
def maxProfitCooldown(prices):
    hold, sold, rest = float('-inf'), 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)


@sol(126, ex='amount = 5, coins = [1, 2, 5]', run=lambda f: f(5, [1, 2, 5]), expect=4,
     tests=[(lambda f: f(3, [2]), 0), (lambda f: f(10, [10]), 1), (lambda f: f(0, [7]), 1)],
     algo=['dp[a] = number of combinations making amount a; dp[0] = 1.',
           'Coins in the OUTER loop: each combination is counted once, in coin order.',
           'For each coin, for a from coin up to amount: dp[a] += dp[a − coin] (upwards = coin reusable).'],
     dry=['start dp = [1, 0, 0, 0, 0, 0]',
          'coin 1 → [1, 1, 1, 1, 1, 1]',
          'coin 2 → [1, 1, 2, 2, 3, 3]',
          'coin 5 → dp[5] = 3 + dp[0] = 4 ⇒ 4'])
def change(amount, coins):
    dp = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]


@sol(127, ex='nums = [1, 1, 1, 1, 1], target = 3', run=lambda f: f([1, 1, 1, 1, 1], 3), expect=5,
     tests=[(lambda f: f([1], 1), 1), (lambda f: f([0, 0, 1], 1), 4), (lambda f: f([1], 2), 0)],
     algo=["Split into + numbers (sum P) and − numbers (sum N): P − N = target, P + N = total → P = (total + target) / 2.",
           'If |target| > total or total + target is odd → 0.',
           'Count subsets summing to P = goal (0/1 knapsack counting, loop sum downwards).'],
     dry=['total 5 → P = (5 + 3) / 2 = 4',
          'dp over five 1s: [1,1,0,0,0] → [1,2,1,0,0] → [1,3,3,1,0] → [1,4,6,4,1]',
          'fifth 1: dp[4] = 1 + 4 = 5 ⇒ 5'])
def findTargetSumWays(nums, target):
    total = sum(nums)
    if abs(target) > total or (total + target) % 2:
        return 0
    goal = (total + target) // 2
    dp = [1] + [0] * goal
    for x in nums:
        for t in range(goal, x - 1, -1):
            dp[t] += dp[t - x]
    return dp[goal]


@sol(128, ex='s1 = "ab", s2 = "c", s3 = "acb"', run=lambda f: f('ab', 'c', 'acb'), expect=True,
     tests=[(lambda f: f('aabcc', 'dbbca', 'aadbbcbcac'), True), (lambda f: f('aabcc', 'dbbca', 'aadbbbaccc'), False),
            (lambda f: f('', '', ''), True)],
     algo=['Lengths must add up, else False.',
           'dp[i][j] = s1[:i] and s2[:j] can interleave into s3[:i+j]; dp[0][0] = True.',
           'dp[i][j] is True if (dp[i−1][j] and s1[i−1] == s3[i+j−1]) or (dp[i][j−1] and s2[j−1] == s3[i+j−1]).'],
     dry=['dp[0][0] = T',
          "dp[1][0]: s1 'a' == s3[0] 'a' → T;  dp[0][1]: s2 'c' ≠ 'a' → F",
          "dp[1][1]: from the left, s2 'c' == s3[1] 'c' → T",
          "dp[2][0]: 'b' ≠ s3[1] 'c' → F",
          "dp[2][1]: from above, s1 'b' == s3[2] 'b' → T ⇒ True"])
def isInterleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for i in range(m + 1):
        for j in range(n + 1):
            if i > 0 and dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]:
                dp[i][j] = True
            if j > 0 and dp[i][j - 1] and s2[j - 1] == s3[i + j - 1]:
                dp[i][j] = True
    return dp[m][n]


@sol(129, ex='word1 = "horse", word2 = "ros"', run=lambda f: f('horse', 'ros'), expect=3,
     tests=[(lambda f: f('intention', 'execution'), 5), (lambda f: f('', 'abc'), 3)],
     algo=['dp[i][j] = edits to turn word1[:i] into word2[:j].',
           'Base: dp[i][0] = i (delete everything), dp[0][j] = j (insert everything).',
           'Chars equal → dp[i−1][j−1].',
           'Else 1 + min(insert dp[i][j−1], delete dp[i−1][j], replace dp[i−1][j−1]).'],
     dry=['        ""  r  o  s',
          '""    [ 0, 1, 2, 3 ]',
          'h     [ 1, 1, 2, 3 ]',
          'o     [ 2, 2, 1, 2 ]',
          'r     [ 3, 2, 2, 2 ]',
          's     [ 4, 3, 3, 2 ]',
          'e     [ 5, 4, 4, 3 ] ⇒ 3: horse → rorse → rose → ros'])
def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1])
    return dp[m][n]


@sol(130, ex='matrix = [[9,9,4],[6,6,8],[2,1,1]]', run=lambda f: f([[9, 9, 4], [6, 6, 8], [2, 1, 1]]), expect=4,
     tests=[(lambda f: f([[3, 4, 5], [3, 2, 6], [2, 2, 1]]), 4), (lambda f: f([[1]]), 1)],
     algo=['dfs(row, col) = longest strictly increasing path starting at (row, col).',
           '= 1 + max dfs(neighbour) over neighbours with a larger value (or 1 if none).',
           'Memoise each cell’s answer in a table — strictly increasing paths can never loop, so no visited set is needed.',
           'Answer = max over all cells.'],
     dry=['dfs(9 at 0,0) = 1',
          'dfs(6 at 1,0) = 1 + dfs(9) = 2',
          'dfs(2 at 2,0) = 1 + dfs(6) = 3',
          'dfs(1 at 2,1) = 1 + max(dfs(2)=3, dfs(6 at 1,1)=2) = 4',
          '⇒ 4 (path 1 → 2 → 6 → 9)'])
def longestIncreasingPath(matrix):
    rows, cols = len(matrix), len(matrix[0])

    @cache
    def dfs(r, c):
        best = 1
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        return best

    return max(dfs(r, c) for r in range(rows) for c in range(cols))


@sol(131, ex='s = "rabbbit", t = "rabbit"', run=lambda f: f('rabbbit', 'rabbit'), expect=3,
     tests=[(lambda f: f('babgbag', 'bag'), 5), (lambda f: f('abc', 'abcd'), 0)],
     algo=['dp[i][j] = number of ways s[i:] contains t[j:] as a subsequence.',
           'dp[i][len(t)] = 1 (empty t is always formed once).',
           'Fill from the back: dp[i][j] = dp[i+1][j] (skip s[i]) + (dp[i+1][j+1] if s[i] == t[j]) (use it).',
           'Answer dp[0][0].'],
     dry=["dp[·][6] = 1 for every suffix of s",
          "'bit' → 'bit': 1 way",
          "'bbit' → 'bit': 2 ways (either b);  'bbit' → 'bbit': 1 way",
          "'bbbit' → 'bbit': use b (2) + skip b (1) = 3",
          "'r', 'a' match once each ⇒ 3"])
def numDistinct(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][n] = 1
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            dp[i][j] = dp[i + 1][j]
            if s[i] == t[j]:
                dp[i][j] += dp[i + 1][j + 1]
    return dp[0][0]


# ── Greedy ────────────────────────────────────────────────────────

@sol(133, ex='nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', run=lambda f: f([-2, 1, -3, 4, -1, 2, 1, -5, 4]), expect=6,
     tests=[(lambda f: f([1]), 1), (lambda f: f([-3, -1, -2]), -1), (lambda f: f([5, 4, -1, 7, 8]), 23)],
     algo=["Kadane: curr = best sum of a subarray ending here.",
           'curr = max(x, curr + x) — restart at x when the running sum would only drag it down.',
           'best = max(best, curr). Start both at nums[0] (handles all-negative arrays).'],
     dry=['-2 → curr -2, best -2',
          '1 → restart: curr 1, best 1',
          '-3 → curr -2',
          '4 → restart: curr 4, best 4',
          '-1 → 3;  2 → 5;  1 → 6 ★',
          '-5 → 1;  4 → 5 ⇒ 6 ([4, -1, 2, 1])'])
def maxSubArray(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best


@sol(134, ex='nums = [2, 3, 1, 1, 4]', run=lambda f: f([2, 3, 1, 1, 4]), expect=True,
     tests=[(lambda f: f([3, 2, 1, 0, 4]), False), (lambda f: f([0]), True)],
     algo=['reach = farthest index reachable so far.',
           'Walk i left to right: if i > reach, i is unreachable → False.',
           'Otherwise reach = max(reach, i + nums[i]). Finish the walk → True.'],
     dry=['i=0: reach = 2',
          'i=1: reach = max(2, 4) = 4',
          'i=2, 3: reach stays 4',
          'i=4 ≤ 4 → reachable ⇒ True'])
def canJump(nums):
    reach = 0
    for i, jump in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + jump)
    return True


@sol(135, ex='nums = [2, 3, 1, 1, 4]', run=lambda f: f([2, 3, 1, 1, 4]), expect=2,
     tests=[(lambda f: f([2, 3, 0, 1, 4]), 2), (lambda f: f([0]), 0), (lambda f: f([1, 1, 1, 1]), 3)],
     algo=['Think BFS levels: indices reachable with j jumps form a window ending at end.',
           'Scan i up to n − 2, tracking farthest = max(i + nums[i]).',
           'When i reaches end, the current window is used up → jumps += 1, end = farthest.'],
     dry=['i=0: farthest 2; i == end 0 → jumps 1, end 2',
          'i=1: farthest 4',
          'i=2: farthest 4; i == end 2 → jumps 2, end 4',
          'i=3: farthest 4 (loop stops before the last index) ⇒ 2'])
def jump(nums):
    jumps = end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == end:
            jumps += 1
            end = farthest
    return jumps


@sol(136, ex='gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]', run=lambda f: f([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), expect=3,
     tests=[(lambda f: f([2, 3, 4], [3, 4, 3]), -1), (lambda f: f([5], [4]), 0)],
     algo=['If total gas < total cost, no start works → −1. Otherwise exactly one start works.',
           'Drive from start keeping tank += gas[i] − cost[i].',
           'If tank drops below 0 at i, no station from start..i can be the answer → start = i + 1, tank = 0.'],
     dry=['net per station: [-2, -2, -2, 3, 3], total 0 ≥ 0',
          'i=0: tank -2 → start 1',
          'i=1: tank -2 → start 2',
          'i=2: tank -2 → start 3',
          'i=3: tank 3;  i=4: tank 6 ⇒ start 3'])
def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start, tank = i + 1, 0
    return start


@sol(137, ex='hand = [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize = 3', run=lambda f: f([1, 2, 3, 6, 2, 3, 4, 7, 8], 3), expect=True,
     tests=[(lambda f: f([1, 2, 3, 4, 5], 4), False), (lambda f: f([1, 1, 2, 2, 3, 3], 3), True)],
     algo=['Card count must be a multiple of groupSize.',
           'count = how many of each card value (sorted map). Visit values in increasing order.',
           'The smallest remaining value must START its groups: with need copies left, values start..start+size−1 each need that many.',
           'Any shortfall → False; otherwise subtract need from each.'],
     dry=['counts 1:1, 2:2, 3:2, 4:1, 6:1, 7:1, 8:1',
          'start 1 (need 1): take 1, 2, 3 → 2:1, 3:1',
          'start 2 (need 1): take 2, 3, 4',
          '3, 4 now 0 → skip',
          'start 6 (need 1): take 6, 7, 8 ⇒ True'])
def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False
    count = Counter(hand)
    for start in sorted(count):
        n = count[start]
        if n == 0:
            continue
        for card in range(start, start + groupSize):
            if count[card] < n:
                return False
            count[card] -= n
    return True


@sol(138, ex='s = "ababcbacadefegdehijhklij"', run=lambda f: f('ababcbacadefegdehijhklij'), expect=[9, 7, 8],
     tests=[(lambda f: f('eccbbbbdec'), [10]), (lambda f: f('abc'), [1, 1, 1])],
     algo=['last[c] = last index where c appears.',
           'Walk the string; the current part must reach end = max(end, last[c]).',
           'When i == end, every letter inside has finished → cut here and start a new part.'],
     dry=["'a' (last 8) → end 8; b (5), c (7) keep end 8",
          'i = 8 == end → part size 9',
          "'d' (14), 'e' (15) → end 15 → part size 7",
          "'h' (19), 'i' (22), 'j' (23) → end 23 → part size 8 ⇒ [9, 7, 8]"])
def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}
    sizes = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            sizes.append(end - start + 1)
            start = i + 1
    return sizes
