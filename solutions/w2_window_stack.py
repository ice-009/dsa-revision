from _harness import *

# ── Sliding Window ────────────────────────────────────────────────

@sol(19, ex='prices = [7, 1, 5, 3, 6, 4]', run=lambda f: f([7, 1, 5, 3, 6, 4]), expect=5,
     tests=[(lambda f: f([7, 6, 4, 3, 1]), 0)],
     algo=['lowest = cheapest price seen so far (the best day to have bought).',
           'For each price p: lowest = min(lowest, p); best = max(best, p − lowest).',
           'Return best (0 if prices only fall).'],
     dry=['p=7 → lowest=7, profit 0',
          'p=1 → lowest=1, profit 0',
          'p=5 → profit 4 → best=4',
          'p=3 → profit 2',
          'p=6 → profit 5 → best=5',
          'p=4 → profit 3 ⇒ 5'])
def maxProfit(prices):
    lowest = float('inf')
    best = 0
    for p in prices:
        lowest = min(lowest, p)
        best = max(best, p - lowest)
    return best


@sol(20, ex='s = "abba"', run=lambda f: f('abba'), expect=2,
     tests=[(lambda f: f('abcabcbb'), 3), (lambda f: f('pwwkew'), 3), (lambda f: f(''), 0), (lambda f: f('bbbbb'), 1)],
     algo=['last[c] = latest index of c; window is s[l..r].',
           'At each r: if c was seen, jump l = max(l, last[c] + 1) — max() so l never moves backwards.',
           'last[c] = r; best = max(best, r − l + 1).'],
     dry=["r=0 'a' → l=0, last={a:0}, best=1",
          "r=1 'b' → l=0, best=2",
          "r=2 'b' seen at 1 → l=max(0,2)=2, window 'b'",
          "r=3 'a' seen at 0 → l=max(2,1)=2 (stays!), window 'ba', best=2"])
def lengthOfLongestSubstring(s):
    last = {}
    l = best = 0
    for r, c in enumerate(s):
        if c in last:
            l = max(l, last[c] + 1)
        last[c] = r
        best = max(best, r - l + 1)
    return best


@sol(21, ex='s = "AABABBA", k = 1', run=lambda f: f('AABABBA', 1), expect=4,
     tests=[(lambda f: f('ABAB', 2), 4), (lambda f: f('A', 0), 1)],
     algo=['Window s[l..r] is valid if (length − count of its most common char) ≤ k.',
           'Add s[r]; update max_f.',
           'While invalid: drop s[l] from counts, l++.',
           'best = max(best, window length). max_f never needs to decrease.'],
     dry=['r=0 A → A1, win 1, best 1',
          'r=1 A → A2, max_f 2, win 2, best 2',
          'r=2 B → win 3, 3−2=1 ≤ 1, best 3',
          'r=3 A → A3, win 4, 4−3=1, best 4',
          'r=4 B → win 5, 5−3=2 > 1 → drop A, l=1 → win 4',
          'r=5 B → B3, win 5 → drop A, l=2 → win 4',
          'r=6 A → win 5 → drop B, l=3 → win 4 ⇒ 4'])
def characterReplacement(s, k):
    count = defaultdict(int)
    l = max_f = best = 0
    for r, c in enumerate(s):
        count[c] += 1
        max_f = max(max_f, count[c])
        while (r - l + 1) - max_f > k:
            count[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best


@sol(22, ex='s1 = "ab", s2 = "eidbaooo"', run=lambda f: f('ab', 'eidbaooo'), expect=True,
     tests=[(lambda f: f('ab', 'eidboaoo'), False), (lambda f: f('abc', 'ab'), False)],
     algo=['If s1 is longer than s2 → False.',
           'need = letter counts of s1; window = counts of the first len(s1) chars of s2.',
           'Slide one step at a time: add s2[r], remove s2[r − n]; equal counts → True.'],
     dry=['need: a1 b1',
          "window 'ei' → no",
          "r=2: +d −e → 'id' → no",
          "r=3: +b −i → 'db' → no",
          "r=4: +a −d → 'ba' = need → True"])
def checkInclusion(s1, s2):
    n = len(s1)
    if n > len(s2):
        return False
    need, window = [0] * 26, [0] * 26
    for i in range(n):
        need[ord(s1[i]) - ord('a')] += 1
        window[ord(s2[i]) - ord('a')] += 1
    if need == window:
        return True
    for r in range(n, len(s2)):
        window[ord(s2[r]) - ord('a')] += 1
        window[ord(s2[r - n]) - ord('a')] -= 1
        if need == window:
            return True
    return False


@sol(23, ex='nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3', run=lambda f: f([1, 3, -1, -3, 5, 3, 6, 7], 3),
     expect=[3, 3, 5, 5, 6, 7],
     tests=[(lambda f: f([1], 1), [1]), (lambda f: f([9, 8, 7, 6], 2), [9, 8, 7])],
     algo=['q = deque (double-ended queue) of indices whose values are decreasing (front = current max).',
           'For each r: pop from the back while nums[back] < nums[r]; append r.',
           'If the front index left the window (≤ r − k) pop it from the front.',
           'Once r ≥ k−1, record nums[q[0]].'],
     dry=['r=0 (1) → q=[0]',
          'r=1 (3) → pop 0 → q=[1]',
          'r=2 (-1) → q=[1,2] → max 3',
          'r=3 (-3) → q=[1,2,3] → max 3',
          'r=4 (5) → pop 3,2,1 → q=[4] → max 5',
          'r=5 (3) → q=[4,5] → max 5',
          'r=6 (6) → q=[6] → 6;  r=7 (7) → q=[7] → 7'])
def maxSlidingWindow(nums, k):
    q = deque()
    res = []
    for r, x in enumerate(nums):
        while q and nums[q[-1]] < x:
            q.pop()
        q.append(r)
        if q[0] <= r - k:
            q.popleft()
        if r >= k - 1:
            res.append(nums[q[0]])
    return res


@sol(24, ex='s = "ADOBECODEBANC", t = "ABC"', run=lambda f: f('ADOBECODEBANC', 'ABC'), expect='BANC',
     tests=[(lambda f: f('a', 'a'), 'a'), (lambda f: f('a', 'aa'), ''), (lambda f: f('aa', 'aa'), 'aa')],
     algo=['need[c] = count of each char in t; required = number of distinct chars in t; have = how many are satisfied.',
           'Expand r: window[c] += 1; when window[c] reaches need[c], have += 1.',
           'While have == required: record the window if shorter, then drop s[l] (have −= 1 if it falls below need) and l++.',
           'Return the best window (or "" if none).'],
     dry=["r=0..5 'ADOBEC' → A,B,C satisfied → have=3 → best='ADOBEC' (6)",
          "shrink: drop A → have=2, l=1",
          "r=6..9 'ODEB' → still missing A",
          "r=10 'A' → have=3 → shrink l=1→5 (lengths 10..6, none < 6), drop C → have=2, l=6",
          "r=12 'C' → have=3 → shrink: 'DEBANC'(6) → 'EBANC'(5) ★ → 'BANC'(4) ★ → drop B, have=2",
          "⇒ 'BANC'"])
def minWindow(s, t):
    if not s or not t:
        return ''
    need = Counter(t)
    window = defaultdict(int)
    have, required = 0, len(need)
    best_len, best_l = float('inf'), 0
    l = 0
    for r, c in enumerate(s):
        window[c] += 1
        if c in need and window[c] == need[c]:
            have += 1
        while have == required:
            if r - l + 1 < best_len:
                best_len, best_l = r - l + 1, l
            window[s[l]] -= 1
            if s[l] in need and window[s[l]] < need[s[l]]:
                have -= 1
            l += 1
    return '' if best_len == float('inf') else s[best_l:best_l + best_len]


# ── Stack ─────────────────────────────────────────────────────────

@sol(26, ex='s = "([]{})"', run=lambda f: f('([]{})'), expect=True,
     tests=[(lambda f: f('(]'), False), (lambda f: f('(('), False), (lambda f: f(')'), False), (lambda f: f('()[]{}'), True)],
     algo=['match maps each closer to its opener.',
           'Opener → push. Closer → stack must be non-empty with the matching opener on top; pop it.',
           'Valid only if the stack is empty at the end.'],
     dry=["'(' → push → ['(']",
          "'[' → push → ['(', '[']",
          "']' → top '[' matches → pop → ['(']",
          "'{' → push; '}' → matches → pop",
          "')' → matches → pop → [] ⇒ True"])
def isValid(s):
    match = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in match:
            if not stack or stack[-1] != match[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack


@sol(27, ex='push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()',
     run=lambda C: play(C, [('push', -2), ('push', 0), ('push', -3), ('getMin',), ('pop',), ('top',), ('getMin',)]),
     expect=[-3, 0, -2],
     algo=['Each stack entry stores (value, minimum of the stack up to and including it).',
           'push(v): min = min(v, top.min) (or v when empty).',
           'pop/top/getMin just read or remove the top pair — all O(1).'],
     dry=['push -2 → [(-2,-2)]',
          'push 0 → [(-2,-2), (0,-2)]',
          'push -3 → [..., (-3,-3)]',
          'getMin → -3',
          'pop → [(-2,-2), (0,-2)]',
          'top → 0, getMin → -2'])
class MinStack:
    def __init__(self):
        self.stack = []  # (value, min so far)

    def push(self, val):
        low = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, low))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def getMin(self):
        return self.stack[-1][1]


@sol(28, ex='tokens = ["2", "1", "+", "3", "*"]', run=lambda f: f(['2', '1', '+', '3', '*']), expect=9,
     tests=[(lambda f: f(['4', '13', '5', '/', '+']), 6),
            (lambda f: f(['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']), 22)],
     algo=['Number → push.',
           'Operator → b = pop(), a = pop() (b is the RIGHT operand), push a op b.',
           'Division truncates toward zero (C++/Java integer "/" already does; JS needs Math.trunc).',
           'Answer is the single value left.'],
     dry=["'2' → [2];  '1' → [2,1]",
          "'+' → 2+1 → [3]",
          "'3' → [3,3]",
          "'*' → 3*3 → [9] ⇒ 9"])
def evalRPN(tokens):
    stack = []
    for tok in tokens:
        if tok in ('+', '-', '*', '/'):
            b, a = stack.pop(), stack.pop()
            if tok == '+':
                stack.append(a + b)
            elif tok == '-':
                stack.append(a - b)
            elif tok == '*':
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(tok))
    return stack[0]


@sol(29, ex='n = 2', run=lambda f: f(2), expect=['(())', '()()'], norm='sorted',
     tests=[(lambda f: f(3), ['((()))', '(()())', '(())()', '()(())', '()()()']), (lambda f: f(1), ['()'])],
     algo=['Backtrack with counts opened and closed.',
           "Add '(' while opened < n.",
           "Add ')' only while closed < opened — keeps every prefix valid.",
           'Length 2n → record.'],
     dry=["'' → '(' → '((' (opened=2, can't open more)",
          "'((' → '(()' → '(())' ✓",
          "back to '(' → '()' → '()(' → '()()' ✓"])
def generateParenthesis(n):
    res = []

    def bt(cur, opened, closed):
        if len(cur) == 2 * n:
            res.append(cur)
            return
        if opened < n:
            bt(cur + '(', opened + 1, closed)
        if closed < opened:
            bt(cur + ')', opened, closed + 1)

    bt('', 0, 0)
    return res


@sol(30, ex='temperatures = [73, 74, 75, 71, 69, 72, 76, 73]',
     run=lambda f: f([73, 74, 75, 71, 69, 72, 76, 73]), expect=[1, 1, 4, 2, 1, 1, 0, 0],
     tests=[(lambda f: f([30, 60, 90]), [1, 1, 0])],
     algo=['stack = indices of days still waiting for a warmer day (temps decreasing).',
           'For day i: while today is warmer than the top day j, pop j and set ans[j] = i − j.',
           'Push i. Days left on the stack keep 0.'],
     dry=['i0 73 → [0]',
          'i1 74 → pop 0 (ans=1) → [1]',
          'i2 75 → pop 1 (ans=1) → [2]',
          'i3 71 → [2,3];  i4 69 → [2,3,4]',
          'i5 72 → pop 4 (ans=1), pop 3 (ans=2) → [2,5]',
          'i6 76 → pop 5 (ans=1), pop 2 (ans=4) → [6]',
          'i7 73 → [6,7] → both stay 0'])
def dailyTemperatures(temperatures):
    ans = [0] * len(temperatures)
    stack = []
    for i, t in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < t:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans


@sol(31, ex='target = 12, position = [10, 8, 0, 5, 3], speed = [2, 4, 1, 1, 3]',
     run=lambda f: f(12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]), expect=3,
     tests=[(lambda f: f(10, [3], [3]), 1), (lambda f: f(100, [0, 2, 4], [4, 2, 1]), 1)],
     algo=['Sort cars by position, closest to target first.',
           'time = (target − position) / speed — when it would arrive alone.',
           'If it takes longer than the fleet ahead (stack top), it is a new fleet → push.',
           'Otherwise it catches up and merges (do nothing). Answer = stack size.'],
     dry=['(10,2) t=1 → [1]',
          '(8,4) t=1 ≤ 1 → merges',
          '(5,1) t=7 > 1 → [1, 7]',
          '(3,3) t=3 ≤ 7 → merges',
          '(0,1) t=12 > 7 → [1, 7, 12] ⇒ 3 fleets'])
def carFleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)
    stack = []
    for p, s in cars:
        t = (target - p) / s
        if not stack or t > stack[-1]:
            stack.append(t)
    return len(stack)


@sol(32, ex='heights = [2, 1, 5, 6, 2, 3]', run=lambda f: f([2, 1, 5, 6, 2, 3]), expect=10,
     tests=[(lambda f: f([2, 4]), 4), (lambda f: f([1]), 1)],
     algo=['stack of (start index, height) with increasing heights.',
           'For bar i with height h: pop every taller bar; its rectangle ends at i → area = height × (i − start).',
           'The new bar extends back to the last popped start; push (start, h).',
           'After the loop, remaining bars extend to the end: area = height × (n − start).'],
     dry=['i0 h2 → [(0,2)]',
          'i1 h1 → pop (0,2): 2×1=2; push (0,1)',
          'i2 h5 → push (2,5);  i3 h6 → push (3,6)',
          'i4 h2 → pop (3,6): 6×1=6; pop (2,5): 5×2=10 ★; push (2,2)',
          'i5 h3 → push (5,3)',
          'flush n=6: (0,1)→6, (2,2)→8, (5,3)→3 ⇒ 10'])
def largestRectangleArea(heights):
    stack = []
    best = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            best = max(best, height * (i - idx))
            start = idx
        stack.append((start, h))
    for idx, height in stack:
        best = max(best, height * (len(heights) - idx))
    return best
