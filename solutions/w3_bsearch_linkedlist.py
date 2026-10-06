from _harness import *

# ── Binary Search ─────────────────────────────────────────────────

@sol(34, ex='nums = [-1, 0, 3, 5, 9, 12], target = 9', run=lambda f: f([-1, 0, 3, 5, 9, 12], 9), expect=4,
     tests=[(lambda f: f([-1, 0, 3, 5, 9, 12], 2), -1), (lambda f: f([5], 5), 0)],
     algo=['l = 0, r = n−1. While l ≤ r: mid = l + (r − l) / 2.',
           'nums[mid] == target → return mid.',
           'nums[mid] < target → search right (l = mid+1); else search left (r = mid−1).',
           'Loop ends → −1.'],
     dry=['l=0 r=5 mid=2 (3) < 9 → l=3',
          'l=3 r=5 mid=4 (9) == 9 → return 4'])
def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1


@sol(35, ex='matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3',
     run=lambda f: f([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3), expect=True,
     tests=[(lambda f: f([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13), False), (lambda f: f([[1]], 1), True)],
     algo=['Treat the matrix as one sorted array of rows × cols cells.',
           'Binary search index mid in [0, rows·cols − 1]; its cell is matrix[mid / cols][mid % cols].',
           'Compare and move l / r as in normal binary search.'],
     dry=['l=0 r=11 mid=5 → (1,1)=11 > 3 → r=4',
          'mid=2 → (0,2)=5 > 3 → r=1',
          'mid=0 → (0,0)=1 < 3 → l=1',
          'mid=1 → (0,1)=3 → True'])
def searchMatrix(matrix, target):
    rows, cols = len(matrix), len(matrix[0])
    l, r = 0, rows * cols - 1
    while l <= r:
        mid = (l + r) // 2
        v = matrix[mid // cols][mid % cols]
        if v == target:
            return True
        if v < target:
            l = mid + 1
        else:
            r = mid - 1
    return False


@sol(36, ex='piles = [3, 6, 7, 11], h = 8', run=lambda f: f([3, 6, 7, 11], 8), expect=4,
     tests=[(lambda f: f([30, 11, 23, 4, 20], 5), 30), (lambda f: f([30, 11, 23, 4, 20], 6), 23)],
     algo=['Answer k lies in [1, max(piles)]; hours(k) = Σ ceil(p / k) only falls as k grows.',
           'Binary search for the smallest k with hours(k) ≤ h:',
           'feasible → hi = k (k might be the answer); not feasible → lo = k + 1.',
           'When lo == hi, that is the minimum speed.'],
     dry=['lo=1 hi=11 k=6 → 1+1+2+2=6 ≤ 8 → hi=6',
          'k=3 → 1+2+3+4=10 > 8 → lo=4',
          'k=5 → 1+2+2+3=8 ≤ 8 → hi=5',
          'k=4 → 1+2+2+3=8 ≤ 8 → hi=4',
          'lo == hi == 4 ⇒ 4'])
def minEatingSpeed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        k = (lo + hi) // 2
        hours = sum((p + k - 1) // k for p in piles)
        if hours <= h:
            hi = k
        else:
            lo = k + 1
    return lo


@sol(37, ex='nums = [3, 4, 5, 1, 2]', run=lambda f: f([3, 4, 5, 1, 2]), expect=1,
     tests=[(lambda f: f([4, 5, 6, 7, 0, 1, 2]), 0), (lambda f: f([11, 13, 15, 17]), 11), (lambda f: f([2, 1]), 1)],
     algo=['l = 0, r = n−1. While l < r: mid.',
           'nums[mid] > nums[r] → the drop (minimum) is right of mid → l = mid + 1.',
           'Else the minimum is at mid or to its left → r = mid.',
           'Return nums[l].'],
     dry=['l=0 r=4 mid=2 (5) > 2 → l=3',
          'l=3 r=4 mid=3 (1) ≤ 2 → r=3',
          'l == r → nums[3] = 1'])
def findMin(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        mid = (l + r) // 2
        if nums[mid] > nums[r]:
            l = mid + 1
        else:
            r = mid
    return nums[l]


@sol(38, ex='nums = [4, 5, 6, 7, 0, 1, 2], target = 0', run=lambda f: f([4, 5, 6, 7, 0, 1, 2], 0), expect=4,
     tests=[(lambda f: f([4, 5, 6, 7, 0, 1, 2], 3), -1), (lambda f: f([1], 0), -1), (lambda f: f([3, 1], 1), 1)],
     algo=['Standard binary search loop; found → return mid.',
           'If nums[l] ≤ nums[mid], the LEFT half is sorted: go left if nums[l] ≤ target < nums[mid], else right.',
           'Otherwise the RIGHT half is sorted: go right if nums[mid] < target ≤ nums[r], else left.'],
     dry=['l=0 r=6 mid=3 (7): left [4..7] sorted, 0 not in it → l=4',
          'l=4 r=6 mid=5 (1): left [0..1] sorted, 0 in [0,1) → r=4',
          'mid=4 (0) == target → return 4'])
def searchRotated(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]:
                r = mid - 1
            else:
                l = mid + 1
        else:
            if nums[mid] < target <= nums[r]:
                l = mid + 1
            else:
                r = mid - 1
    return -1


@sol(39, ex='set("foo","bar",1), get("foo",1), get("foo",3), set("foo","bar2",4), get("foo",4), get("foo",5), get("foo",0)',
     run=lambda C: play(C, [('set', 'foo', 'bar', 1), ('get', 'foo', 1), ('get', 'foo', 3), ('set', 'foo', 'bar2', 4),
                            ('get', 'foo', 4), ('get', 'foo', 5), ('get', 'foo', 0)]),
     expect=['bar', 'bar', 'bar2', 'bar2', ''],
     algo=['store[key] = list of (timestamp, value); timestamps arrive increasing, so it stays sorted.',
           'get: binary search for the first entry with time > timestamp (index lo).',
           'Answer is the entry just before it (lo − 1), or "" if lo == 0.'],
     dry=['set → foo: [(1,bar)]',
          'get(1): first time > 1 is index 1 → entry 0 → "bar"',
          'get(3) → index 1 → "bar"',
          'set → foo: [(1,bar), (4,bar2)]',
          'get(4) / get(5) → index 2 → "bar2"',
          'get(0) → index 0 → ""'])
class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)

    def set(self, key, value, timestamp):
        self.store[key].append((timestamp, value))

    def get(self, key, timestamp):
        items = self.store[key]
        lo, hi = 0, len(items)
        while lo < hi:
            mid = (lo + hi) // 2
            if items[mid][0] <= timestamp:
                lo = mid + 1
            else:
                hi = mid
        return items[lo - 1][1] if lo else ''


@sol(40, ex='nums1 = [1, 3], nums2 = [2]', run=lambda f: f([1, 3], [2]), expect=2.0,
     tests=[(lambda f: f([1, 2], [3, 4]), 2.5), (lambda f: f([], [1]), 1.0), (lambda f: f([0, 0], [0, 0]), 0.0),
            (lambda f: f([1, 2, 3, 4, 5], [6, 7, 8]), 4.5)],
     algo=['Let A be the shorter array. The left half of the merged array has half = (m+n+1) / 2 items.',
           'Binary search i = items taken from A (0..m); j = half − i from B.',
           'Valid cut when A[i−1] ≤ B[j] and B[j−1] ≤ A[i] (missing sides are ±inf).',
           'If A[i−1] > B[j] take fewer from A (hi = i−1), else more (lo = i+1).',
           'Odd total → max of the lefts; even → average of max(lefts) and min(rights).'],
     dry=['A=[2], B=[1,3], half=2',
          'i=0, j=2: A_left=-inf, A_right=2, B_left=3 → 3 > 2 → lo=1',
          'i=1, j=1: A_left=2, A_right=inf, B_left=1, B_right=3 → valid',
          'total 3 is odd → max(2, 1) = 2.0'])
def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A
    m, n = len(A), len(B)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = A[i - 1] if i > 0 else float('-inf')
        a_right = A[i] if i < m else float('inf')
        b_left = B[j - 1] if j > 0 else float('-inf')
        b_right = B[j] if j < n else float('inf')
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1


# ── Linked List ───────────────────────────────────────────────────

@sol(42, ex='head = 1 → 2 → 3', run=lambda f: LV(f(L([1, 2, 3]))), expect=[3, 2, 1],
     tests=[(lambda f: LV(f(L([]))), []), (lambda f: LV(f(L([1]))), [1])],
     algo=['prev = None, cur = head.',
           'Save nxt = cur.next, point cur.next back to prev.',
           'Advance: prev = cur, cur = nxt. When cur is None, prev is the new head.'],
     dry=['cur=1: 1 → None; prev=1, cur=2',
          'cur=2: 2 → 1; prev=2, cur=3',
          'cur=3: 3 → 2; prev=3, cur=None',
          'return 3 → 2 → 1'])
def reverseList(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev


@sol(43, ex='list1 = 1→2→4, list2 = 1→3→4', run=lambda f: LV(f(L([1, 2, 4]), L([1, 3, 4]))), expect=[1, 1, 2, 3, 4, 4],
     tests=[(lambda f: LV(f(L([]), L([0]))), [0]), (lambda f: LV(f(L([]), L([]))), [])],
     algo=['dummy node + tail pointer.',
           'While both lists have nodes: attach the smaller head to tail, advance that list and tail.',
           'Attach whichever list still has nodes. Return dummy.next.'],
     dry=['1 vs 1 → take list1’s 1',
          '2 vs 1 → take list2’s 1',
          '2 vs 3 → take 2',
          '4 vs 3 → take 3',
          '4 vs 4 → take list1’s 4',
          'list1 empty → attach [4] ⇒ 1,1,2,3,4,4'])
def mergeTwoLists(list1, list2):
    dummy = tail = ListNode()
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next


def _cycle(vals, pos):
    head = L(vals)
    if pos >= 0:
        nodes = []
        cur = head
        while cur:
            nodes.append(cur)
            cur = cur.next
        nodes[-1].next = nodes[pos]
    return head


@sol(44, ex='head = 3 → 2 → 0 → -4, tail links back to 2', run=lambda f: f(_cycle([3, 2, 0, -4], 1)), expect=True,
     tests=[(lambda f: f(_cycle([1], -1)), False), (lambda f: f(_cycle([1, 2], 0)), True), (lambda f: f(None), False)],
     algo=['slow moves 1 step, fast moves 2.',
           'If fast reaches the end → no cycle.',
           'If slow and fast ever point to the same node → cycle.'],
     dry=['start: slow=3, fast=3',
          'step 1: slow=2, fast=0',
          'step 2: slow=0, fast=2 (0 → -4 → 2)',
          'step 3: slow=-4, fast=-4 → same node → True'])
def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False


def _reorder(f, vals):
    head = L(vals)
    f(head)
    return LV(head)


@sol(45, ex='head = 1 → 2 → 3 → 4 → 5', run=lambda f: _reorder(f, [1, 2, 3, 4, 5]), expect=[1, 5, 2, 4, 3],
     tests=[(lambda f: _reorder(f, [1, 2, 3, 4]), [1, 4, 2, 3]), (lambda f: _reorder(f, [1]), [1])],
     algo=['Find the middle with slow/fast (slow ends at the end of the first half).',
           'Cut after slow and reverse the second half.',
           'Weave: take one node from the first half, then one from the reversed second half.'],
     dry=['middle: slow=1,fast=2 → slow=2,fast=4 → slow=3,fast=None',
          'first half 1→2→3, second half 4→5 reversed → 5→4',
          'weave: 1→5, 5→2, 2→4, 4→3 ⇒ 1,5,2,4,3'])
def reorderList(head):
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev, second = second, nxt
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next
        first.next = second
        second.next = n1
        first, second = n1, n2


@sol(46, ex='head = 1→2→3→4→5, n = 2', run=lambda f: LV(f(L([1, 2, 3, 4, 5]), 2)), expect=[1, 2, 3, 5],
     tests=[(lambda f: LV(f(L([1]), 1)), []), (lambda f: LV(f(L([1, 2]), 1)), [1]), (lambda f: LV(f(L([1, 2]), 2)), [2])],
     algo=['dummy → head; slow = fast = dummy.',
           'Move fast n + 1 steps ahead.',
           'Move both until fast is None — slow is now just before the node to delete.',
           'slow.next = slow.next.next; return dummy.next.'],
     dry=['fast moves 3 steps: dummy → 1 → 2 → 3',
          'both move: (slow,fast) = (1,4) → (2,5) → (3,None)',
          'slow=3 → skip 4 ⇒ 1,2,3,5'])
def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return dummy.next


class Node:
    def __init__(self, x, next=None, random=None):
        self.val, self.next, self.random = x, next, random


def _random_list(pairs):
    nodes = [Node(v) for v, _ in pairs]
    for i, (_, r) in enumerate(pairs):
        if i + 1 < len(nodes):
            nodes[i].next = nodes[i + 1]
        nodes[i].random = nodes[r] if r is not None else None
    return nodes[0] if nodes else None


def _run_copy(f, pairs):
    head = _random_list(pairs)
    originals = set()
    cur = head
    while cur:
        originals.add(id(cur))
        cur = cur.next
    copy = f(head)
    nodes, cur = [], copy
    while cur:
        if id(cur) in originals:
            return 'shares nodes with the original!'
        nodes.append(cur)
        cur = cur.next
    return [[n.val, nodes.index(n.random) if n.random else None] for n in nodes]


@sol(47, ex='[[7,null],[13,0],[11,4],[10,2],[1,0]]  (value, index of random)',
     run=lambda f: _run_copy(f, [(7, None), (13, 0), (11, 4), (10, 2), (1, 0)]),
     expect=[[7, None], [13, 0], [11, 4], [10, 2], [1, 0]],
     tests=[(lambda f: _run_copy(f, []), [])],
     algo=['clone = hash map from each original node to its copy (null maps to null).',
           'Pass 1: create a copy of each node (values only).',
           'Pass 2: copy.next = clone[orig.next], copy.random = clone[orig.random].',
           'Return clone[head].'],
     dry=["pass 1: 7', 13', 11', 10', 1' created",
          "pass 2: 7'.next=13', 7'.random=None",
          "13'.random = clone[7] = 7'",
          "11'.random = 1', 10'.random = 11', 1'.random = 7'",
          "return 7'"])
def copyRandomList(head):
    clone = {None: None}
    cur = head
    while cur:
        clone[cur] = Node(cur.val)
        cur = cur.next
    cur = head
    while cur:
        clone[cur].next = clone[cur.next]
        clone[cur].random = clone[cur.random]
        cur = cur.next
    return clone[head]


@sol(48, ex='l1 = 2→4→3, l2 = 5→6→4  (342 + 465)', run=lambda f: LV(f(L([2, 4, 3]), L([5, 6, 4]))), expect=[7, 0, 8],
     tests=[(lambda f: LV(f(L([9, 9, 9, 9, 9, 9, 9]), L([9, 9, 9, 9]))), [8, 9, 9, 9, 0, 0, 0, 1]),
            (lambda f: LV(f(L([0]), L([0]))), [0])],
     algo=['dummy + tail, carry = 0.',
           'Loop while l1 or l2 or carry: total = carry + both digits (0 if a list ran out).',
           'carry = total / 10, digit = total % 10; add a node for digit; advance the lists.'],
     dry=['2+5+0 = 7 → digit 7, carry 0',
          '4+6+0 = 10 → digit 0, carry 1',
          '3+4+1 = 8 → digit 8, carry 0',
          'all done ⇒ 7→0→8 (807)'])
def addTwoNumbers(l1, l2):
    dummy = tail = ListNode()
    carry = 0
    while l1 or l2 or carry:
        total = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
        carry, digit = divmod(total, 10)
        tail.next = ListNode(digit)
        tail = tail.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next


@sol(49, ex='nums = [1, 3, 4, 2, 2]', run=lambda f: f([1, 3, 4, 2, 2]), expect=2,
     tests=[(lambda f: f([3, 1, 3, 4, 2]), 3), (lambda f: f([3, 3, 3, 3, 3]), 3)],
     algo=['Treat i → nums[i] as a "next" pointer; the duplicate value is where the cycle starts.',
           'Phase 1: slow = nums[slow], fast = nums[nums[fast]] until they meet.',
           'Phase 2: start slow2 at 0; step slow and slow2 one at a time; where they meet is the duplicate.'],
     dry=['links: 0→1→3→2→4→2 (cycle 2↔4)',
          'phase 1: (slow,fast) = (1,3) → (3,4) → (2,4) → (4,4) meet',
          'phase 2: (slow,slow2) = (4,0) → (2,1) → (4,3) → (2,2) meet',
          'return 2'])
def findDuplicate(nums):
    slow = fast = 0
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow2 = 0
    while slow != slow2:
        slow, slow2 = nums[slow], nums[slow2]
    return slow


@sol(50, ex='capacity 2: put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)',
     run=lambda C: play(C, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2), ('put', 4, 4),
                            ('get', 1), ('get', 3), ('get', 4)], init=(2,)),
     expect=[1, -1, -1, 3, 4],
     algo=['map: key → node; doubly linked list between head/tail sentinels, most recent next to head.',
           'get: missing → −1; else move the node to the front and return its value.',
           'put: remove the old node if present, insert the new node at the front.',
           'Over capacity → remove tail.prev (least recent) from the list AND the map.'],
     dry=['put 1, put 2 → [2, 1]  (front = most recent)',
          'get 1 → 1, list [1, 2]',
          'put 3 → [3, 1, 2] → over cap → evict 2 → [3, 1]',
          'get 2 → -1',
          'put 4 → [4, 3, 1] → evict 1 → [4, 3]',
          'get 1 → -1, get 3 → 3, get 4 → 4'])
class LRUCache:
    class Node:
        def __init__(self, key=0, val=0):
            self.key, self.val = key, val
            self.prev = self.next = None

    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = self.Node(), self.Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = self.Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]


@sol(51, ex='lists = [1→4→5, 1→3→4, 2→6]', run=lambda f: LV(f([L([1, 4, 5]), L([1, 3, 4]), L([2, 6])])),
     expect=[1, 1, 2, 3, 4, 4, 5, 6],
     tests=[(lambda f: LV(f([])), []), (lambda f: LV(f([None])), [])],
     algo=['Push the head of every non-empty list into a min-heap ordered by node value.',
           'Pop the smallest, append it to the result, push that node’s next (if any).',
           'The heap only ever holds k nodes (one per list), so each push/pop is O(log k).'],
     dry=['heap: (1,L0) (1,L1) (2,L2)',
          'pop 1 (L0) → push 4;  pop 1 (L1) → push 3',
          'pop 2 (L2) → push 6;  pop 3 (L1) → push 4',
          'pop 4 (L0) → push 5;  pop 4 (L1)',
          'pop 5, pop 6 ⇒ 1,1,2,3,4,4,5,6'])
def mergeKLists(lists):
    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapq.heapify(heap)
    dummy = tail = ListNode()
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = node
        tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next


@sol(52, ex='head = 1→2→3→4→5, k = 2', run=lambda f: LV(f(L([1, 2, 3, 4, 5]), 2)), expect=[2, 1, 4, 3, 5],
     tests=[(lambda f: LV(f(L([1, 2, 3, 4, 5]), 3)), [3, 2, 1, 4, 5]), (lambda f: LV(f(L([1, 2]), 2)), [2, 1])],
     algo=['dummy → head; group_prev = dummy (node before the current group).',
           'Walk k nodes to find kth; if the list ends first, stop.',
           'Reverse the group with prev starting at kth.next (so the group’s tail links onward).',
           'Connect group_prev.next = kth; the group’s old first node becomes the next group_prev.'],
     dry=['group [1,2], after it 3 → reversed 2→1→3; dummy→2; group_prev=1',
          'group [3,4], after it 5 → reversed 4→3→5; 1→4; group_prev=3',
          'only 5 left (< k) → stop ⇒ 2,1,4,3,5'])
def reverseKGroup(head, k):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        first = group_prev.next
        group_prev.next = kth
        group_prev = first
