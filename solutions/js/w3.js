// Week 3 — Binary Search, Linked List.

// @@ 34
function search(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const mid = (l + r) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}

// @@ 35
function searchMatrix(matrix, target) {
  const rows = matrix.length, cols = matrix[0].length;
  let l = 0, r = rows * cols - 1;
  while (l <= r) {
    const mid = (l + r) >> 1;
    const v = matrix[Math.floor(mid / cols)][mid % cols];
    if (v === target) return true;
    if (v < target) l = mid + 1;
    else r = mid - 1;
  }
  return false;
}

// @@ 36
function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const k = Math.floor((lo + hi) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    if (hours <= h) hi = k;
    else lo = k + 1;
  }
  return lo;
}

// @@ 37
function findMin(nums) {
  let l = 0, r = nums.length - 1;
  while (l < r) {
    const mid = (l + r) >> 1;
    if (nums[mid] > nums[r]) l = mid + 1; // minimum is right of mid
    else r = mid;
  }
  return nums[l];
}

// @@ 38
function search(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const mid = (l + r) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[l] <= nums[mid]) { // left half sorted
      if (nums[l] <= target && target < nums[mid]) r = mid - 1;
      else l = mid + 1;
    } else { // right half sorted
      if (nums[mid] < target && target <= nums[r]) l = mid + 1;
      else r = mid - 1;
    }
  }
  return -1;
}

// @@ 39
class TimeMap {
  constructor() {
    this.store = new Map(); // key -> [[timestamp, value]] in time order
  }

  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }

  get(key, timestamp) {
    const items = this.store.get(key) || [];
    let lo = 0, hi = items.length; // first index with time > timestamp
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (items[mid][0] <= timestamp) lo = mid + 1;
      else hi = mid;
    }
    return lo ? items[lo - 1][1] : '';
  }
}

// @@ 40
function findMedianSortedArrays(nums1, nums2) {
  const [A, B] = nums1.length <= nums2.length ? [nums1, nums2] : [nums2, nums1]; // A is the shorter
  const m = A.length, n = B.length, half = (m + n + 1) >> 1;
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1, j = half - i;
    const aLeft = i > 0 ? A[i - 1] : -Infinity, aRight = i < m ? A[i] : Infinity;
    const bLeft = j > 0 ? B[j - 1] : -Infinity, bRight = j < n ? B[j] : Infinity;
    if (aLeft <= bRight && bLeft <= aRight) {
      if ((m + n) % 2) return Math.max(aLeft, bLeft);
      return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2;
    }
    if (aLeft > bRight) hi = i - 1;
    else lo = i + 1;
  }
  return 0;
}

// @@ 42
function reverseList(head) {
  let prev = null, cur = head;
  while (cur) {
    const nxt = cur.next;
    cur.next = prev;
    prev = cur;
    cur = nxt;
  }
  return prev;
}

// @@ 43
function mergeTwoLists(list1, list2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 || list2;
  return dummy.next;
}

// @@ 44
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// @@ 45
function reorderList(head) {
  // 1) middle: slow ends at the end of the first half
  let slow = head, fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  // 2) cut and reverse the second half
  let second = slow.next, prev = null;
  slow.next = null;
  while (second) {
    const nxt = second.next;
    second.next = prev;
    prev = second;
    second = nxt;
  }
  // 3) weave the two halves
  let first = head;
  second = prev;
  while (second) {
    const n1 = first.next, n2 = second.next;
    first.next = second;
    second.next = n1;
    first = n1;
    second = n2;
  }
}

// @@ 46
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let slow = dummy, fast = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next; // gap of n + 1
  while (fast) {
    slow = slow.next;
    fast = fast.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}

// @@ 47
function copyRandomList(head) {
  const clone = new Map([[null, null]]);
  for (let cur = head; cur; cur = cur.next) clone.set(cur, new _Node(cur.val, null, null));
  for (let cur = head; cur; cur = cur.next) {
    clone.get(cur).next = clone.get(cur.next);
    clone.get(cur).random = clone.get(cur.random);
  }
  return clone.get(head);
}

// @@ 48
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode();
  let tail = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const total = carry + (l1 ? l1.val : 0) + (l2 ? l2.val : 0);
    carry = Math.floor(total / 10);
    tail.next = new ListNode(total % 10);
    tail = tail.next;
    l1 = l1 && l1.next;
    l2 = l2 && l2.next;
  }
  return dummy.next;
}

// @@ 49
function findDuplicate(nums) {
  let slow = 0, fast = 0;
  do { // phase 1: meet inside the cycle
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  let slow2 = 0; // phase 2: meet at the cycle entrance
  while (slow !== slow2) {
    slow = nums[slow];
    slow2 = nums[slow2];
  }
  return slow;
}

// @@ 50
class LRUCache {
  // A JS Map remembers insertion order, so its first key is always the least recently used.
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key); // re-insert to mark as most recent
    this.map.set(key, val);
    return val;
  }

  put(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value); // evict LRU
  }
}

// @@ 51
function mergeKLists(lists) {
  const heap = new Heap((a, b) => a.val < b.val); // min-heap by val
  for (const head of lists) if (head) heap.push(head);
  const dummy = new ListNode();
  let tail = dummy;
  while (heap.size) {
    const node = heap.pop();
    tail.next = node;
    tail = node;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}

// @@ 52
function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let groupPrev = dummy;
  while (true) {
    let kth = groupPrev;
    for (let i = 0; i < k && kth; i++) kth = kth.next;
    if (!kth) return dummy.next;
    const groupNext = kth.next;
    let prev = groupNext, cur = groupPrev.next; // reverse the group
    while (cur !== groupNext) {
      const nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    const first = groupPrev.next;
    groupPrev.next = kth;
    groupPrev = first;
  }
}
