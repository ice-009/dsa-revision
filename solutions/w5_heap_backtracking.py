from _harness import *

# ── Heap / Priority Queue ─────────────────────────────────────────

@sol(73, ex='KthLargest(3, [4, 5, 8, 2]); add(3), add(5), add(10), add(9), add(4)',
     run=lambda C: play(C, [('add', 3), ('add', 5), ('add', 10), ('add', 9), ('add', 4)], init=(3, [4, 5, 8, 2])),
     expect=[4, 5, 5, 8, 8],
     algo=['Keep a MIN-heap holding only the k largest values seen.',
           'Init: heapify nums, pop until size k.',
           'add(val): push, pop if size > k; heap[0] is the kth largest.'],
     dry=['init: [2,4,5,8] → pop 2 → {4,5,8}',
          'add 3 → pop 3 → top 4',
          'add 5 → pop 4 → {5,5,8} → 5',
          'add 10 → pop 5 → {5,8,10} → 5',
          'add 9 → pop 5 → {8,9,10} → 8',
          'add 4 → pop 4 → 8'])
class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = nums[:]
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]


@sol(74, ex='stones = [2, 7, 4, 1, 8, 1]', run=lambda f: f([2, 7, 4, 1, 8, 1]), expect=1,
     tests=[(lambda f: f([1]), 1), (lambda f: f([2, 2]), 0)],
     algo=['Max-heap of stones (C++ priority_queue is max-first; Java needs Collections.reverseOrder()).',
           'While ≥ 2 stones: pop the two heaviest a ≥ b; if a ≠ b push a − b.',
           'Return the last stone or 0.'],
     dry=['smash 8, 7 → push 1 → {4,2,1,1,1}',
          'smash 4, 2 → push 2 → {2,1,1,1}',
          'smash 2, 1 → push 1 → {1,1,1}',
          'smash 1, 1 → nothing → {1} ⇒ 1'])
def lastStoneWeight(stones):
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)
        b = -heapq.heappop(heap)
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0


@sol(75, ex='points = [[3, 3], [5, -1], [-2, 4]], k = 2', run=lambda f: f([[3, 3], [5, -1], [-2, 4]], 2),
     expect=[[3, 3], [-2, 4]], norm='sorted',
     tests=[(lambda f: f([[1, 3], [-2, 2]], 1), [[-2, 2]])],
     algo=['Squared distance x² + y² is enough (no sqrt).',
           'Keep a MAX-heap of size k ordered by distance: push each point, pop the farthest when size > k.',
           'The heap ends holding the k closest.'],
     dry=['(3,3) d=18 → {18}',
          '(5,-1) d=26 → {26, 18}',
          '(-2,4) d=20 → {26, 20, 18} → size 3 > 2 → pop 26',
          '⇒ [[3,3], [-2,4]]'])
def kClosest(points, k):
    heap = []
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in heap]


@sol(76, ex='nums = [3, 2, 1, 5, 6, 4], k = 2', run=lambda f: f([3, 2, 1, 5, 6, 4], 2), expect=5,
     tests=[(lambda f: f([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4), (lambda f: f([1], 1), 1)],
     algo=['MIN-heap of size k: push every number, pop when the size exceeds k.',
           'After all numbers, heap[0] is the kth largest.',
           '(Quickselect gives O(n) average if asked.)'],
     dry=['3 → {3};  2 → {2,3}',
          '1 → {1,2,3} → pop 1',
          '5 → pop 2 → {3,5}',
          '6 → pop 3 → {5,6}',
          '4 → pop 4 → {5,6} ⇒ heap[0] = 5'])
def findKthLargest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]


@sol(77, ex='tasks = ["A","A","A","B","B","B"], n = 2', run=lambda f: f(list('AAABBB'), 2), expect=8,
     tests=[(lambda f: f(list('AAABBB'), 0), 6), (lambda f: f(list('AAAAAABCDEFG'), 2), 16)],
     algo=['max_f = highest task frequency; n_max = how many tasks have that frequency.',
           'The most frequent task forces (max_f − 1) frames of length n + 1, plus a last row of n_max tasks.',
           'If there are more tasks than that, no idle time is needed → answer = max(len(tasks), frames).'],
     dry=['counts: A=3, B=3 → max_f=3, n_max=2',
          'frames = (3−1)·(2+1) + 2 = 8 → A B _ A B _ A B',
          'max(6, 8) ⇒ 8'])
def leastInterval(tasks, n):
    counts = Counter(tasks).values()
    max_f = max(counts)
    n_max = sum(1 for c in counts if c == max_f)
    return max(len(tasks), (max_f - 1) * (n + 1) + n_max)


@sol(78, ex='postTweet(1,5), getNewsFeed(1), follow(1,2), postTweet(2,6), getNewsFeed(1), unfollow(1,2), getNewsFeed(1)',
     run=lambda C: play(C, [('postTweet', 1, 5), ('getNewsFeed', 1), ('follow', 1, 2), ('postTweet', 2, 6),
                            ('getNewsFeed', 1), ('unfollow', 1, 2), ('getNewsFeed', 1)]),
     expect=[[5], [6, 5], [5]],
     algo=['tweets[user] = list of (time, id) in posting order; follows[user] = set; a global clock.',
           'getNewsFeed: for the user and everyone they follow, push their NEWEST tweet into a max-heap by time.',
           'Pop the newest, add it to the feed, push the next-older tweet from the same user. Stop at 10.',
           'follow ignores self-follow; unfollow uses discard.'],
     dry=['post(1,5) at t=1',
          'feed(1): heap {(t1, 5)} → [5]',
          'follow(1,2); post(2,6) at t=2',
          'feed(1): heap {(t2,6), (t1,5)} → pop 6, pop 5 → [6, 5]',
          'unfollow(1,2) → feed(1) → [5]'])
class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)
        self.follows = defaultdict(set)

    def postTweet(self, userId, tweetId):
        self.time += 1
        self.tweets[userId].append((self.time, tweetId))

    def getNewsFeed(self, userId):
        heap = []
        for u in self.follows[userId] | {userId}:
            if self.tweets[u]:
                i = len(self.tweets[u]) - 1
                t, tid = self.tweets[u][i]
                heap.append((-t, tid, u, i))
        heapq.heapify(heap)
        feed = []
        while heap and len(feed) < 10:
            _, tid, u, i = heapq.heappop(heap)
            feed.append(tid)
            if i > 0:
                t, nid = self.tweets[u][i - 1]
                heapq.heappush(heap, (-t, nid, u, i - 1))
        return feed

    def follow(self, followerId, followeeId):
        if followerId != followeeId:
            self.follows[followerId].add(followeeId)

    def unfollow(self, followerId, followeeId):
        self.follows[followerId].discard(followeeId)


@sol(79, ex='addNum(1), addNum(2), findMedian(), addNum(3), findMedian()',
     run=lambda C: play(C, [('addNum', 1), ('addNum', 2), ('findMedian',), ('addNum', 3), ('findMedian',)]),
     expect=[1.5, 2.0],
     algo=['low = max-heap for the smaller half, high = min-heap for the larger half.',
           'addNum: push into low, move low’s max into high (keeps every low ≤ every high).',
           'If high is now bigger, move its min back to low (low may hold one extra).',
           'Median = top of low (odd count) or the average of both tops.'],
     dry=['add 1: low{1} → move 1 to high → rebalance back → low{1}, high{}',
          'add 2: low{2,1} → move 2 → low{1}, high{2}',
          'median → (1 + 2) / 2 = 1.5',
          'add 3: low{3,1} → move 3 → high{2,3} bigger → move 2 → low{2,1}, high{3}',
          'median → 2.0'])
class MedianFinder:
    def __init__(self):
        self.low = []
        self.high = []

    def addNum(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def findMedian(self):
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2


# ── Backtracking ──────────────────────────────────────────────────

@sol(81, ex='nums = [1, 2, 3]', run=lambda f: f([1, 2, 3]),
     expect=[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]], norm='deep',
     tests=[(lambda f: f([0]), [[], [0]])],
     algo=['bt(start): every node of the recursion tree is a subset → record a copy of path.',
           'For i from start: choose nums[i], recurse with i + 1, un-choose.',
           'Using start means each subset is built in index order once.'],
     dry=['[] → [1] → [1,2] → [1,2,3]',
          'back → [1,3]',
          'back → [2] → [2,3]',
          'back → [3]  ⇒ 8 subsets'])
def subsets(nums):
    res, path = [], []

    def bt(start):
        res.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)
            path.pop()

    bt(0)
    return res


@sol(82, ex='candidates = [2, 3, 6, 7], target = 7', run=lambda f: f([2, 3, 6, 7], 7), expect=[[2, 2, 3], [7]], norm='deep',
     tests=[(lambda f: f([2, 3, 5], 8), [[2, 2, 2, 2], [2, 3, 3], [3, 5]]), (lambda f: f([2], 1), [])],
     algo=['Sort candidates so we can stop early.',
           'bt(start, remaining): remaining == 0 → record path.',
           'For i from start: if candidates[i] > remaining break; choose it and recurse with i (reuse allowed).'],
     dry=['[2] rem 5 → [2,2] rem 3 → [2,2,2] rem 1 → 2 > 1 break',
          '[2,2,3] rem 0 ✓',
          '[2,3] rem 2 → 3 > 2 break',
          '[3] rem 4 → [3,3] rem 1 → break',
          '[6] rem 1 → break;  [7] rem 0 ✓'])
def combinationSum(candidates, target):
    candidates.sort()
    res, path = [], []

    def bt(start, remaining):
        if remaining == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:
                break
            path.append(c)
            bt(i, remaining - c)
            path.pop()

    bt(0, target)
    return res


@sol(83, ex='nums = [1, 2, 3]', run=lambda f: f([1, 2, 3]),
     expect=[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], norm='sorted',
     tests=[(lambda f: f([0, 1]), [[0, 1], [1, 0]])],
     algo=['used[i] marks numbers already in path.',
           'When path has all n numbers → record a copy.',
           'Otherwise try every unused number: mark, append, recurse, then undo both.'],
     dry=['[1] → [1,2] → [1,2,3] ✓',
          'back → [1,3] → [1,3,2] ✓',
          '[2] → [2,1,3] ✓, [2,3,1] ✓',
          '[3] → [3,1,2] ✓, [3,2,1] ✓'])
def permute(nums):
    res, path = [], []
    used = [False] * len(nums)

    def bt():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            path.append(x)
            bt()
            path.pop()
            used[i] = False

    bt()
    return res


@sol(84, ex='nums = [1, 2, 2]', run=lambda f: f([1, 2, 2]),
     expect=[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]], norm='deep',
     tests=[(lambda f: f([0]), [[], [0]]), (lambda f: f([4, 4, 4, 1, 4]), [[], [1], [1, 4], [1, 4, 4], [1, 4, 4, 4], [1, 4, 4, 4, 4], [4], [4, 4], [4, 4, 4], [4, 4, 4, 4]])],
     algo=['Sort so equal numbers sit together.',
           'Same loop as Subsets, but at one recursion level skip nums[i] if i > start and nums[i] == nums[i−1].',
           'That stops two branches from starting with the same value at the same depth.'],
     dry=['sorted [1,2,2]',
          '[] → [1] → [1,2] → [1,2,2]',
          'under [1]: i=2 is a duplicate 2 at the same depth → skip',
          '[] → [2] → [2,2]',
          'top level i=2 → duplicate → skip ⇒ 6 subsets'])
def subsetsWithDup(nums):
    nums.sort()
    res, path = [], []

    def bt(start):
        res.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            bt(i + 1)
            path.pop()

    bt(0)
    return res


_WS = [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']]


@sol(85, ex='board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
     run=lambda f: f([r[:] for r in _WS], 'ABCCED'), expect=True,
     tests=[(lambda f: f([r[:] for r in _WS], 'SEE'), True), (lambda f: f([r[:] for r in _WS], 'ABCB'), False)],
     algo=['dfs(r, c, i): matched word[:i] so far; i == len(word) → True.',
           'Out of bounds or board[r][c] ≠ word[i] → False.',
           "Mark the cell '#', try down/up/right/left with i + 1, then restore the letter.",
           'Start a DFS from every cell.'],
     dry=["(0,0) 'A' ✓ → down 'S' ✗ … right (0,1) 'B' ✓",
          "(0,1) → down 'F' ✗, right (0,2) 'C' ✓",
          "(0,2) → down (1,2) 'C' ✓",
          "(1,2) → down (2,2) 'E' ✓",
          "(2,2) → right 'E' ✗, left (2,1) 'D' ✓ → i = 6 → True"])
def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[i]:
            return False
        board[r][c] = '#'
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                 dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = word[i]
        return found

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))


@sol(86, ex='s = "aab"', run=lambda f: f('aab'), expect=[['a', 'a', 'b'], ['aa', 'b']], norm='sorted',
     tests=[(lambda f: f('a'), [['a']])],
     algo=['bt(start): start == len(s) → record path.',
           'Try every end from start: if s[start:end+1] is a palindrome, choose it and recurse from end + 1.'],
     dry=["start 0: 'a' ✓ → start 1: 'a' ✓ → start 2: 'b' ✓ → record [a,a,b]",
          "start 1: 'ab' ✗",
          "start 0: 'aa' ✓ → start 2: 'b' ✓ → record [aa,b]",
          "start 0: 'aab' ✗"])
def partition(s):
    res, path = [], []

    def bt(start):
        if start == len(s):
            res.append(path[:])
            return
        for end in range(start, len(s)):
            piece = s[start:end + 1]
            if piece == piece[::-1]:
                path.append(piece)
                bt(end + 1)
                path.pop()

    bt(0)
    return res


@sol(87, ex='n = 4', run=lambda f: f(4),
     expect=[['.Q..', '...Q', 'Q...', '..Q.'], ['..Q.', 'Q...', '...Q', '.Q..']], norm='sorted',
     tests=[(lambda f: f(1), [['Q']]), (lambda f: [len(f(8))], [92])],
     algo=['Place exactly one queen per row, row by row.',
           'A column c in row r is attacked if c, r − c (diagonal) or r + c (anti-diagonal) is already used.',
           'Place, recurse to the next row, then remove (backtrack). Row n reached → record the board.'],
     dry=['r0 c0 → r1 c2 → r2 all attacked ✗; r1 c3 → r2 c1 → r3 all attacked ✗',
          'r0 c1 → r1 c3 → r2 c0 → r3 c2 ✓ (.Q.. / ...Q / Q... / ..Q.)',
          'r0 c2 → r1 c0 → r2 c3 → r3 c1 ✓',
          'r0 c3 → dead ends ⇒ 2 solutions'])
def solveNQueens(n):
    res = []
    cols, diag, anti = set(), set(), set()
    board = [['.'] * n for _ in range(n)]

    def bt(r):
        if r == n:
            res.append([''.join(row) for row in board])
            return
        for c in range(n):
            if c in cols or r - c in diag or r + c in anti:
                continue
            cols.add(c); diag.add(r - c); anti.add(r + c)
            board[r][c] = 'Q'
            bt(r + 1)
            board[r][c] = '.'
            cols.remove(c); diag.remove(r - c); anti.remove(r + c)

    bt(0)
    return res
