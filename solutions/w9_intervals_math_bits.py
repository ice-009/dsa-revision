from _harness import *

# ── Intervals ─────────────────────────────────────────────────────

@sol(140, ex='book(10, 20), book(15, 25), book(20, 30)',
     run=lambda C: play(C, [('book', 10, 20), ('book', 15, 25), ('book', 20, 30)]), expect=[True, False, True],
     tests=[(lambda C: play(C, [('book', 47, 50), ('book', 33, 41), ('book', 39, 45), ('book', 33, 42), ('book', 25, 32),
                                ('book', 26, 35), ('book', 19, 25), ('book', 3, 8), ('book', 8, 13), ('book', 18, 27)]),
             [True, True, False, False, True, False, True, True, True, False])],
     algo=['Keep the accepted bookings.',
           'Half-open intervals [s1, e1) and [s2, e2) overlap ⇔ s1 < e2 and s2 < e1.',
           'If the new booking overlaps any existing one → False; otherwise store it → True.',
           'Meeting Rooms (premium) is the same check after sorting: any start < previous end → overlap.'],
     dry=['book(10,20): nothing booked → True',
          'book(15,25): 15 < 20 and 10 < 25 → overlaps [10,20) → False',
          'book(20,30): 20 < 20? no → no overlap → True'])
class MyCalendar:
    def __init__(self):
        self.booked = []

    def book(self, start, end):
        for s, e in self.booked:
            if start < e and s < end:
                return False
        self.booked.append((start, end))
        return True


@sol(141, ex='intervals = [[1,3],[6,9]], newInterval = [2,5]', run=lambda f: f([[1, 3], [6, 9]], [2, 5]), expect=[[1, 5], [6, 9]],
     tests=[(lambda f: f([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]), [[1, 2], [3, 10], [12, 16]]),
            (lambda f: f([], [5, 7]), [[5, 7]]), (lambda f: f([[1, 5]], [6, 8]), [[1, 5], [6, 8]])],
     algo=['Phase 1: copy intervals that end before the new one starts.',
           'Phase 2: while an interval starts before the new one ends, merge: start = min(start, its start), end = max(end, its end).',
           'Append the merged [start, end], then copy the rest.'],
     dry=['[1,3]: ends at 3 ≥ 2 → not before',
          '[1,3] starts 1 ≤ 5 → merge → [1,5]',
          '[6,9] starts 6 > 5 → stop merging',
          'result [[1,5], [6,9]]'])
def insert(intervals, newInterval):
    res = []
    s, e = newInterval
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < s:
        res.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= e:
        s = min(s, intervals[i][0])
        e = max(e, intervals[i][1])
        i += 1
    res.append([s, e])
    res.extend(intervals[i:])
    return res


@sol(142, ex='intervals = [[1,3],[2,6],[8,10],[15,18]]', run=lambda f: f([[1, 3], [2, 6], [8, 10], [15, 18]]),
     expect=[[1, 6], [8, 10], [15, 18]],
     tests=[(lambda f: f([[1, 4], [4, 5]]), [[1, 5]]), (lambda f: f([[1, 4], [2, 3]]), [[1, 4]]), (lambda f: f([[4, 7], [1, 4]]), [[1, 7]])],
     algo=['Sort by start.',
           'If an interval starts at or before the last merged end → extend: last end = max(last end, its end).',
           'Otherwise it starts a new merged interval.'],
     dry=['sorted: [1,3] [2,6] [8,10] [15,18]',
          '[1,3] → merged [[1,3]]',
          '[2,6]: 2 ≤ 3 → [[1,6]]',
          '[8,10]: 8 > 6 → append',
          '[15,18]: append ⇒ [[1,6],[8,10],[15,18]]'])
def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    merged = []
    for s, e in intervals:
        if merged and s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged


@sol(143, ex='intervals = [[1,2],[2,3],[3,4],[1,3]]', run=lambda f: f([[1, 2], [2, 3], [3, 4], [1, 3]]), expect=1,
     tests=[(lambda f: f([[1, 2], [1, 2], [1, 2]]), 2), (lambda f: f([[1, 2], [2, 3]]), 0)],
     algo=['Sort by END time.',
           'Greedily keep an interval when it starts at or after the end of the last kept one.',
           'Ending earliest leaves the most room. Removals = total − kept.'],
     dry=['sorted by end: [1,2] [2,3] [1,3] [3,4]',
          'keep [1,2] (end 2)',
          '[2,3]: 2 ≥ 2 → keep (end 3)',
          '[1,3]: 1 < 3 → remove',
          '[3,4]: keep → kept 3 of 4 ⇒ remove 1'])
def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda iv: iv[1])
    kept, prev_end = 0, float('-inf')
    for s, e in intervals:
        if s >= prev_end:
            kept += 1
            prev_end = e
    return len(intervals) - kept


@sol(144, ex='trips = [[2,1,5],[3,3,7]], capacity = 4', run=lambda f: f([[2, 1, 5], [3, 3, 7]], 4), expect=False,
     tests=[(lambda f: f([[2, 1, 5], [3, 3, 7]], 5), True), (lambda f: f([[2, 1, 5], [3, 5, 7]], 3), True)],
     algo=['Difference array over positions: diff[from] += passengers, diff[to] −= passengers (they leave AT to).',
           'Prefix-sum the diff array to get the load at each position.',
           'Load ever above capacity → False.',
           'Meeting Rooms II (premium): same sweep with +1 / −1, answer = max load.'],
     dry=['diff[1] += 2, diff[5] −= 2, diff[3] += 3, diff[7] −= 3',
          'pos 1: load 2',
          'pos 2: load 2',
          'pos 3: load 5 > 4 → False'])
def carPooling(trips, capacity):
    diff = [0] * 1001
    for p, frm, to in trips:
        diff[frm] += p
        diff[to] -= p
    load = 0
    for change in diff:
        load += change
        if load > capacity:
            return False
    return True


@sol(145, ex='intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]',
     run=lambda f: f([[1, 4], [2, 4], [3, 6], [4, 4]], [2, 3, 4, 5]), expect=[3, 3, 1, 4],
     tests=[(lambda f: f([[2, 3], [2, 5], [1, 8], [20, 25]], [2, 19, 5, 22]), [2, -1, 4, 6])],
     algo=['Sort intervals by start; answer queries in increasing order (remember the original order).',
           'For query q: push every interval with start ≤ q into a min-heap of (size, end).',
           'Pop heap entries whose end < q (they can never contain later queries either).',
           'Heap top size is the answer, or −1 if the heap is empty.'],
     dry=['q=2: push [1,4] (size 4), [2,4] (size 3) → top 3',
          'q=3: push [3,6] (size 4) → top 3',
          'q=4: push [4,4] (size 1) → top 1',
          'q=5: pop (1, end 4), (3, end 4), (4, end 4) → top (4, end 6) → 4',
          '⇒ [3, 3, 1, 4]'])
def minInterval(intervals, queries):
    intervals.sort()
    heap = []
    ans = {}
    i = 0
    for q in sorted(queries):
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(heap, (r - l + 1, r))
            i += 1
        while heap and heap[0][1] < q:
            heapq.heappop(heap)
        ans[q] = heap[0][0] if heap else -1
    return [ans[q] for q in queries]


# ── Math & Geometry ───────────────────────────────────────────────

@sol(147, ex='n = 19', run=lambda f: f(19), expect=True,
     tests=[(lambda f: f(2), False), (lambda f: f(1), True)],
     algo=['next(x) = sum of the squares of x’s digits.',
           'Keep applying it, remembering every number seen.',
           'Reach 1 → happy. See a number twice → stuck in a cycle → not happy.'],
     dry=['19 → 1² + 9² = 82',
          '82 → 64 + 4 = 68',
          '68 → 36 + 64 = 100',
          '100 → 1 ⇒ True'])
def isHappy(n):
    def nxt(x):
        return sum(int(d) ** 2 for d in str(x))

    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = nxt(n)
    return n == 1


def _rotated(f, m):
    m = [row[:] for row in m]
    f(m)
    return m


@sol(148, ex='matrix = [[1,2,3],[4,5,6],[7,8,9]]', run=lambda f: _rotated(f, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
     expect=[[7, 4, 1], [8, 5, 2], [9, 6, 3]],
     tests=[(lambda f: _rotated(f, [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]),
             [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]])],
     algo=['Rotate 90° clockwise in place = transpose, then reverse each row.',
           'Transpose: swap m[i][j] with m[j][i] for j > i only (each pair once).'],
     dry=['transpose → [[1,4,7],[2,5,8],[3,6,9]]',
          'reverse rows → [[7,4,1],[8,5,2],[9,6,3]]'])
def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()


@sol(149, ex='matrix = [[1,2,3],[4,5,6],[7,8,9]]', run=lambda f: f([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
     expect=[1, 2, 3, 6, 9, 8, 7, 4, 5],
     tests=[(lambda f: f([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]), [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]),
            (lambda f: f([[1], [2], [3]]), [1, 2, 3]), (lambda f: f([[1, 2, 3]]), [1, 2, 3])],
     algo=['Boundaries top, bottom, left, right.',
           'Go right along top (top++), down the right column (right−−).',
           'Only if rows remain: left along bottom (bottom−−). Only if columns remain: up the left column (left++).',
           'Repeat while top ≤ bottom and left ≤ right.'],
     dry=['top row → 1, 2, 3',
          'right column → 6, 9',
          'bottom row → 8, 7',
          'left column → 4',
          'inner: top row → 5 ⇒ [1,2,3,6,9,8,7,4,5]'])
def spiralOrder(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    return res


@sol(150, ex='matrix = [[1,1,1],[1,0,1],[1,1,1]]', run=lambda f: _rotated(f, [[1, 1, 1], [1, 0, 1], [1, 1, 1]]),
     expect=[[1, 0, 1], [0, 0, 0], [1, 0, 1]],
     tests=[(lambda f: _rotated(f, [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]), [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]])],
     algo=['Remember whether the first row / first column themselves contain a 0.',
           'Use row 0 and column 0 as markers: a 0 at (r, c) sets matrix[r][0] = matrix[0][c] = 0.',
           'Zero every inner cell whose row or column marker is 0.',
           'Finally zero the first row / column if they had a 0 originally.'],
     dry=['first row / column: no zeros',
          '(1,1) is 0 → mark matrix[1][0] = 0 and matrix[0][1] = 0',
          'fill: row 1 marker → (1,2) = 0; column 1 marker → (2,1) = 0',
          '⇒ [[1,0,1],[0,0,0],[1,0,1]]'])
def setZeroes(matrix):
    rows, cols = len(matrix), len(matrix[0])
    first_row = any(matrix[0][c] == 0 for c in range(cols))
    first_col = any(matrix[r][0] == 0 for r in range(rows))
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = matrix[0][c] = 0
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0
    if first_row:
        for c in range(cols):
            matrix[0][c] = 0
    if first_col:
        for r in range(rows):
            matrix[r][0] = 0


# ── Bit Manipulation ──────────────────────────────────────────────

@sol(152, ex='nums = [4, 1, 2, 1, 2]', run=lambda f: f([4, 1, 2, 1, 2]), expect=4,
     tests=[(lambda f: f([1]), 1), (lambda f: f([2, 2, 1]), 1)],
     algo=['XOR everything together.',
           'a ^ a = 0 and a ^ 0 = a, and order doesn’t matter → every pair cancels, the single number remains.'],
     dry=['0 ^ 4 = 4',
          '4 ^ 1 = 5',
          '5 ^ 2 = 7',
          '7 ^ 1 = 6',
          '6 ^ 2 = 4 ⇒ 4'])
def singleNumber(nums):
    res = 0
    for x in nums:
        res ^= x
    return res


@sol(153, ex='n = 11  (binary 1011)', run=lambda f: f(11), expect=3,
     tests=[(lambda f: f(128), 1), (lambda f: f(2147483645), 30)],
     algo=['n & (n − 1) clears the lowest set bit.',
           'Repeat until n is 0, counting the steps.'],
     dry=['1011 & 1010 = 1010 → count 1',
          '1010 & 1001 = 1000 → count 2',
          '1000 & 0111 = 0000 → count 3 ⇒ 3'])
def hammingWeight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count


@sol(154, ex='n = 5', run=lambda f: f(5), expect=[0, 1, 1, 2, 1, 2],
     tests=[(lambda f: f(0), [0]), (lambda f: f(2), [0, 1, 1])],
     algo=['bits[i] = bits[i >> 1] + (i & 1).',
           'i >> 1 is i without its last bit (already computed); add that last bit back.'],
     dry=['bits[1] = bits[0] + 1 = 1',
          'bits[2] = bits[1] + 0 = 1',
          'bits[3] = bits[1] + 1 = 2',
          'bits[4] = bits[2] + 0 = 1',
          'bits[5] = bits[2] + 1 = 2'])
def countBits(n):
    bits = [0] * (n + 1)
    for i in range(1, n + 1):
        bits[i] = bits[i >> 1] + (i & 1)
    return bits


@sol(155, ex='n = 43261596', run=lambda f: f(43261596), expect=964176192,
     tests=[(lambda f: f(4294967293), 3221225471), (lambda f: f(0), 0)],
     algo=['Exactly 32 times: shift res left, put n’s lowest bit into it, shift n right.',
           'The first bit taken from n ends up as the highest bit of res.'],
     dry=['n   = 00000010100101000001111010011100',
          'bits taken from the right: 0, 0, 1, 1, 1, 0, 0, 1, …',
          'each one is pushed into res from the right, so the order flips',
          'res = 00111001011110000010100101000000 = 964176192'])
def reverseBits(n):
    res = 0
    for _ in range(32):
        res = (res << 1) | (n & 1)
        n >>= 1
    return res


@sol(156, ex='nums = [3, 0, 1]', run=lambda f: f([3, 0, 1]), expect=2,
     tests=[(lambda f: f([0, 1]), 2), (lambda f: f([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8)],
     algo=['XOR all indices 0..n with all values: every present number cancels with its index.',
           'Start res = n (the index that has no slot), then res ^= i and res ^= nums[i].',
           '(Gauss alternative: n(n+1)/2 − Σ nums.)'],
     dry=['res = 3',
          'i=0, x=3: 3 ^ 0 ^ 3 = 0',
          'i=1, x=0: 0 ^ 1 ^ 0 = 1',
          'i=2, x=1: 1 ^ 2 ^ 1 = 2 ⇒ 2'])
def missingNumber(nums):
    res = len(nums)
    for i, x in enumerate(nums):
        res ^= i ^ x
    return res
