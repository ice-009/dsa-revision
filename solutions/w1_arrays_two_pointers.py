from _harness import *

# ── Arrays & Hashing ──────────────────────────────────────────────

@sol(3, ex='nums = [1, 2, 3, 1]', run=lambda f: f([1, 2, 3, 1]), expect=True,
     tests=[(lambda f: f([1, 2, 3, 4]), False), (lambda f: f([]), False)],
     algo=['Create an empty set seen.',
           'For each x in nums: if x is in seen return True, otherwise add x.',
           'Loop finishes without a repeat → return False.'],
     dry=['x=1 → not in {} → seen={1}',
          'x=2 → not in seen → seen={1,2}',
          'x=3 → not in seen → seen={1,2,3}',
          'x=1 → already in seen → return True'])
def containsDuplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False


@sol(4, ex='s = "rat", t = "tar"', run=lambda f: f('rat', 'tar'), expect=True,
     tests=[(lambda f: f('rat', 'car'), False), (lambda f: f('anagram', 'nagaram'), True), (lambda f: f('a', 'ab'), False)],
     algo=['If lengths differ → False.',
           'count = 26 zeros. Walk both strings together: count[s[i]] += 1, count[t[i]] -= 1.',
           'Anagram exactly when every count is back to 0.'],
     dry=['len 3 == 3 → continue',
          "('r','t') → r:+1, t:-1",
          "('a','a') → a:+1-1 = 0",
          "('t','r') → t:-1+1 = 0, r:+1-1 = 0",
          'all counts 0 → True'])
def isAnagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - ord('a')] += 1
        count[ord(b) - ord('a')] -= 1
    return all(c == 0 for c in count)


@sol(5, ex='nums = [2, 7, 11, 15], target = 9', run=lambda f: f([2, 7, 11, 15], 9), expect=[0, 1],
     tests=[(lambda f: f([3, 2, 4], 6), [1, 2]), (lambda f: f([3, 3], 6), [0, 1])],
     algo=['seen = {} mapping value → index.',
           'For i, x: need = target − x. If need in seen → return [seen[need], i].',
           'Otherwise store seen[x] = i (after the check, so x never pairs with itself).'],
     dry=['i=0 x=2 need=7 → not in {} → seen={2:0}',
          'i=1 x=7 need=2 → found at index 0 → return [0, 1]'])
def twoSum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []


@sol(6, ex='strs = ["eat","tea","tan","ate","nat","bat"]',
     run=lambda f: f(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']),
     expect=[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']], norm='deep',
     tests=[(lambda f: f(['']), [['']]), (lambda f: f(['a']), [['a']])],
     algo=['groups = hash map from key → list of words.',
           'For each word build key = its 26 letter counts (anagrams share the same counts).',
           'Append the word to groups[key]; return all the groups.'],
     dry=['"eat" → key(a1,e1,t1) → G1=[eat]',
          '"tea" → same key → G1=[eat,tea]',
          '"tan" → key(a1,n1,t1) → G2=[tan]',
          '"ate" → G1=[eat,tea,ate]',
          '"nat" → G2=[tan,nat]',
          '"bat" → key(a1,b1,t1) → G3=[bat]'])
def groupAnagrams(strs):
    groups = defaultdict(list)
    for w in strs:
        key = [0] * 26
        for c in w:
            key[ord(c) - ord('a')] += 1
        groups[tuple(key)].append(w)
    return list(groups.values())


@sol(7, ex='nums = [1,1,1,2,2,3], k = 2', run=lambda f: f([1, 1, 1, 2, 2, 3], 2), expect=[1, 2], norm='sorted',
     tests=[(lambda f: f([1], 1), [1]), (lambda f: f([4, 4, 5, 5, 5, 6], 2), [4, 5])],
     algo=['count[x] = how often each number appears (hash map).',
           'buckets[f] = numbers that appear exactly f times (f ≤ n).',
           'Walk buckets from high f to low, collecting numbers until k are taken.'],
     dry=['count = {1:3, 2:2, 3:1}',
          'buckets[3]=[1], buckets[2]=[2], buckets[1]=[3]',
          'f=6..4 empty; f=3 → res=[1]',
          'f=2 → res=[1,2] → len == k → return [1,2]'])
def topKFrequent(nums, k):
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, f in count.items():
        buckets[f].append(num)
    res = []
    for f in range(len(buckets) - 1, 0, -1):
        for num in buckets[f]:
            res.append(num)
            if len(res) == k:
                return res
    return res


@sol(8, ex='nums = [1, 2, 3, 4]', run=lambda f: f([1, 2, 3, 4]), expect=[24, 12, 8, 6],
     tests=[(lambda f: f([-1, 1, 0, -3, 3]), [0, 0, 9, 0, 0])],
     algo=['res[i] starts as the product of everything LEFT of i (forward pass, running prefix).',
           'Backward pass with running suffix: res[i] *= suffix, then suffix *= nums[i].',
           'No division, so zeros are handled naturally.'],
     dry=['forward: prefix 1→1→2→6 ⇒ res = [1, 1, 2, 6]',
          'i=3: res[3]=6·1=6, suffix=4',
          'i=2: res[2]=2·4=8, suffix=12',
          'i=1: res[1]=1·12=12, suffix=24',
          'i=0: res[0]=1·24=24 ⇒ [24, 12, 8, 6]'])
def productExceptSelf(nums):
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= nums[i]
    return res


_SUDOKU = [
    ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
    ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
    ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
    ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
    ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
    ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
    ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
    ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
    ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
]
_SUDOKU_BAD = [row[:] for row in _SUDOKU]
_SUDOKU_BAD[0][0] = '8'


@sol(9, ex='LeetCode example 2: example 1 board with the top-left 5 changed to 8',
     run=lambda f: f(_SUDOKU_BAD), expect=False,
     tests=[(lambda f: f(_SUDOKU), True)],
     algo=['Keep a set per row, per column and per 3×3 box (box id = (r / 3) · 3 + c / 3, integer division).',
           'Scan every filled cell v: if v is already in its row, column or box set → False.',
           'Otherwise add v to all three sets. Finish the scan → True.'],
     dry=["(0,0)='8' → row0={8}, col0={8}, box(0,0)={8}",
          "(0,1)='3', (0,4)='7' → added",
          "(1,0)='6', (1,3)='1', (1,4)='9', (1,5)='5' → added",
          "(2,1)='9' → box(0,0)={8,3,6,9}",
          "(2,2)='8' → box(0,0) already has 8 → return False"])
def isValidSudoku(board):
    rows, cols, boxes = defaultdict(set), defaultdict(set), defaultdict(set)
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == '.':
                continue
            b = (r // 3, c // 3)
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[b].add(v)
    return True


@sol(10, ex='s = "3[a2[c]]"', run=lambda f: f('3[a2[c]]'), expect='accaccacc',
     tests=[(lambda f: f('2[abc]3[cd]ef'), 'abcabccdcdcdef'), (lambda f: f('10[a]'), 'a' * 10)],
     algo=['cur = string being built at this depth, k = number being read.',
           "Digit → k = k*10 + digit (multi-digit counts).",
           "'[' → push (cur, k), start fresh: cur='', k=0.",
           "']' → pop (prev, times): cur = prev + cur*times.",
           'Letter → cur += letter. Answer is cur.'],
     dry=["'3' → k=3",
          "'[' → push ('',3); cur='', k=0",
          "'a' → cur='a'",
          "'2' → k=2",
          "'[' → push ('a',2); cur=''",
          "'c' → cur='c'",
          "']' → pop ('a',2) → cur='a'+'cc'='acc'",
          "']' → pop ('',3) → cur='accaccacc'"])
def decodeString(s):
    stack = []
    cur, k = '', 0
    for ch in s:
        if ch.isdigit():
            k = k * 10 + int(ch)
        elif ch == '[':
            stack.append((cur, k))
            cur, k = '', 0
        elif ch == ']':
            prev, times = stack.pop()
            cur = prev + cur * times
        else:
            cur += ch
    return cur


@sol(11, ex='nums = [100, 4, 200, 1, 3, 2]', run=lambda f: f([100, 4, 200, 1, 3, 2]), expect=4,
     tests=[(lambda f: f([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), 9), (lambda f: f([]), 0)],
     algo=['s = hash set of all the numbers.',
           'For each x in s: only if x−1 is NOT in s (x starts a run), walk y = x, x+1, … while present.',
           'best = max(best, run length).'],
     dry=['s = {100, 4, 200, 1, 3, 2}',
          '100: 99 missing → run [100] → len 1',
          '4: 3 present → not a start, skip',
          '200: run [200] → len 1',
          '1: 0 missing → 1,2,3,4 → len 4 → best=4',
          '3, 2: not starts → skip ⇒ 4'])
def longestConsecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best


# ── Two Pointers ──────────────────────────────────────────────────

@sol(13, ex='s = "race a car"', run=lambda f: f('race a car'), expect=False,
     tests=[(lambda f: f('A man, a plan, a canal: Panama'), True), (lambda f: f(' '), True)],
     algo=['l = 0, r = len−1.',
           'Skip non-alphanumeric chars from both ends (keep l < r).',
           'Compare lowercased s[l] and s[r]; mismatch → False. Move both inward.',
           'Pointers meet → True.'],
     dry=["l=0 'r' vs r=9 'r' → equal",
          "l=1 'a' vs r=8 'a' → equal",
          "l=2 'c' vs r=7 'c' → equal",
          "l=3 'e'; r=6 is ' ' → skip to r=5 'a'",
          "'e' ≠ 'a' → return False"])
def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l, r = l + 1, r - 1
    return True


@sol(14, ex='numbers = [2, 7, 11, 15], target = 9', run=lambda f: f([2, 7, 11, 15], 9), expect=[1, 2],
     tests=[(lambda f: f([2, 3, 4], 6), [1, 3]), (lambda f: f([-1, 0], -1), [1, 2])],
     algo=['l = 0, r = len−1 on the sorted array.',
           'sum = a[l] + a[r]. Too small → l += 1; too big → r −= 1.',
           'Equal → return [l+1, r+1] (1-indexed).'],
     dry=['l=0, r=3: 2+15=17 > 9 → r=2',
          'l=0, r=2: 2+11=13 > 9 → r=1',
          'l=0, r=1: 2+7=9 → return [1, 2]'])
def twoSumII(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1
    return []


@sol(15, ex='nums = [-1, 0, 1, 2, -1, -4]', run=lambda f: f([-1, 0, 1, 2, -1, -4]),
     expect=[[-1, -1, 2], [-1, 0, 1]], norm='deep',
     tests=[(lambda f: f([0, 0, 0, 0]), [[0, 0, 0]]), (lambda f: f([0, 1, 1]), [])],
     algo=['Sort nums.',
           'For each i: stop if nums[i] > 0; skip if nums[i] equals nums[i−1] (same first number).',
           'Two pointers l=i+1, r=end: sum < 0 → l++, sum > 0 → r−−.',
           'sum == 0 → record, move both, and skip duplicate values of nums[l].'],
     dry=['sorted: [-4, -1, -1, 0, 1, 2]',
          'i=0 (-4): best sum is -4+1+2 = -1 < 0 → nothing',
          'i=1 (-1): l=2,r=5: -1-1+2=0 → add [-1,-1,2]; l=3,r=4',
          '         l=3,r=4: -1+0+1=0 → add [-1,0,1]; l=4,r=3 stop',
          'i=2 (-1): same as nums[1] → skip',
          'i=3 (0): l=4,r=5: 0+1+2=3 > 0 → r=4 → stop'])
def threeSum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l, r = l + 1, r - 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return res


@sol(16, ex='height = [1, 8, 6, 2, 5, 4, 8, 3, 7]', run=lambda f: f([1, 8, 6, 2, 5, 4, 8, 3, 7]), expect=49,
     tests=[(lambda f: f([1, 1]), 1)],
     algo=['l = 0, r = len−1, best = 0.',
           'area = min(h[l], h[r]) × (r − l); best = max(best, area).',
           'Move the SHORTER side inward (moving the taller one can never help).'],
     dry=['l=0(1) r=8(7): 1×8=8 → move l',
          'l=1(8) r=8(7): 7×7=49 ★ → move r',
          'r=7(3): 3×6=18 → move r',
          'r=6(8): 8×5=40 → equal, move r',
          'r=5(4): 16, r=4(5): 15, r=3(2): 4, r=2(6): 6 → best = 49'])
def maxArea(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best


@sol(17, ex='height = [4, 2, 0, 3, 2, 5]', run=lambda f: f([4, 2, 0, 3, 2, 5]), expect=9,
     tests=[(lambda f: f([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), 6), (lambda f: f([]), 0)],
     algo=['Water above i = min(maxLeft, maxRight) − h[i].',
           'l, r at both ends with leftMax, rightMax.',
           'If h[l] < h[r]: the left side is the bottleneck → update leftMax, add leftMax − h[l], l++.',
           'Else do the same on the right side. Stop when l meets r.'],
     dry=['l=0(4) < r=5(5): left_max=4, +0, l=1',
          'h[1]=2 < 5: +4−2=2 → water=2, l=2',
          'h[2]=0 < 5: +4 → water=6, l=3',
          'h[3]=3 < 5: +1 → water=7, l=4',
          'h[4]=2 < 5: +2 → water=9, l=5 = r → stop ⇒ 9'])
def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = water = 0
    while l < r:
        if height[l] < height[r]:
            left_max = max(left_max, height[l])
            water += left_max - height[l]
            l += 1
        else:
            right_max = max(right_max, height[r])
            water += right_max - height[r]
            r -= 1
    return water
