// Week 3 — Binary Search, Linked List.

// @@ 34
function search(nums, target) {

  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {

    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    }

    if (nums[mid] < target) {
      left = mid + 1;
    }
    else {
      right = mid - 1;
    }
  }

  return -1;
}

// @@ 35
function searchMatrix(matrix, target) {

  const rows = matrix.length;
  const cols = matrix[0].length;

  let left = 0;
  let right = rows * cols - 1;

  while (left <= right) {

    const mid = Math.floor((left + right) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];

    if (value === target) {
      return true;
    }

    if (value < target) {
      left = mid + 1;
    }
    else {
      right = mid - 1;
    }
  }

  return false;
}

// @@ 36
function minEatingSpeed(piles, h) {

  let left = 1;
  let right = 0;
  for (const pile of piles) {
    right = Math.max(right, pile);
  }

  while (left < right) {

    const speed = Math.floor((left + right) / 2);

    let hours = 0;
    for (const pile of piles) {
      hours += Math.ceil(pile / speed);
    }

    if (hours <= h) {
      right = speed;
    }
    else {
      left = speed + 1;
    }
  }

  return left;
}

// @@ 37
function findMin(nums) {

  let left = 0;
  let right = nums.length - 1;

  while (left < right) {

    const mid = Math.floor((left + right) / 2);

    if (nums[mid] > nums[right]) {
      left = mid + 1; // minimum is right of mid
    }
    else {
      right = mid;
    }
  }

  return nums[left];
}

// @@ 38
function search(nums, target) {

  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {

    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    }

    if (nums[left] <= nums[mid]) {
      // left half is sorted
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      }
      else {
        left = mid + 1;
      }
    }
    else {
      // right half is sorted
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      }
      else {
        right = mid - 1;
      }
    }
  }

  return -1;
}

// @@ 39
class TimeMap {

  constructor() {
    // key -> list of { time, value }, in increasing time order
    this.store = new Map();
  }

  set(key, value, timestamp) {

    if (!this.store.has(key)) {
      this.store.set(key, []);
    }

    this.store.get(key).push({ time: timestamp, value: value });
  }

  get(key, timestamp) {

    if (!this.store.has(key)) {
      return '';
    }

    const items = this.store.get(key);

    let ans = '';
    let left = 0;
    let right = items.length - 1;

    while (left <= right) {

      const mid = Math.floor((left + right) / 2);

      if (items[mid].time <= timestamp) {
        ans = items[mid].value;
        left = mid + 1;
      }
      else {
        right = mid - 1;
      }
    }

    return ans;
  }
}

// @@ 40
function findMedianSortedArrays(nums1, nums2) {

  // always binary search the shorter array
  if (nums1.length > nums2.length) {
    return findMedianSortedArrays(nums2, nums1);
  }

  const m = nums1.length;
  const n = nums2.length;
  const half = Math.floor((m + n + 1) / 2);

  let low = 0;
  let high = m;

  while (low <= high) {

    const i = Math.floor((low + high) / 2); // items taken from nums1
    const j = half - i;                     // items taken from nums2

    const left1 = (i > 0) ? nums1[i - 1] : -Infinity;
    const right1 = (i < m) ? nums1[i] : Infinity;
    const left2 = (j > 0) ? nums2[j - 1] : -Infinity;
    const right2 = (j < n) ? nums2[j] : Infinity;

    if (left1 <= right2 && left2 <= right1) {

      if ((m + n) % 2 === 1) {
        return Math.max(left1, left2);
      }

      return (Math.max(left1, left2) + Math.min(right1, right2)) / 2;
    }

    if (left1 > right2) {
      high = i - 1;
    }
    else {
      low = i + 1;
    }
  }

  return 0;
}

// @@ 42
function reverseList(head) {

  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}

// @@ 43
function mergeTwoLists(list1, list2) {

  const dummy = new ListNode();
  let tail = dummy;

  while (list1 !== null && list2 !== null) {

    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    }
    else {
      tail.next = list2;
      list2 = list2.next;
    }

    tail = tail.next;
  }

  if (list1 !== null) {
    tail.next = list1;
  }
  else {
    tail.next = list2;
  }

  return dummy.next;
}

// @@ 44
function hasCycle(head) {

  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {

    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true;
    }
  }

  return false;
}

// @@ 45
function reorderList(head) {

  // 1. find the middle (slow ends at the end of the first half)
  let slow = head;
  let fast = head.next;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // 2. cut the list and reverse the second half
  let curr = slow.next;
  slow.next = null;

  let prev = null;
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  // 3. weave the two halves together
  let first = head;
  let second = prev;

  while (second !== null) {

    const next1 = first.next;
    const next2 = second.next;

    first.next = second;
    second.next = next1;

    first = next1;
    second = next2;
  }
}

// @@ 46
function removeNthFromEnd(head, n) {

  const dummy = new ListNode(0, head);
  let slow = dummy;
  let fast = dummy;

  // put a gap of n + 1 nodes between fast and slow
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }

  while (fast !== null) {
    slow = slow.next;
    fast = fast.next;
  }

  slow.next = slow.next.next;

  return dummy.next;
}

// @@ 47
function copyRandomList(head) {

  const clone = new Map();
  clone.set(null, null);

  // pass 1: create a copy of every node
  for (let curr = head; curr !== null; curr = curr.next) {
    clone.set(curr, new _Node(curr.val, null, null));
  }

  // pass 2: connect next and random pointers
  for (let curr = head; curr !== null; curr = curr.next) {
    clone.get(curr).next = clone.get(curr.next);
    clone.get(curr).random = clone.get(curr.random);
  }

  return clone.get(head);
}

// @@ 48
function addTwoNumbers(l1, l2) {

  const dummy = new ListNode();
  let tail = dummy;
  let carry = 0;

  while (l1 !== null || l2 !== null || carry !== 0) {

    let total = carry;

    if (l1 !== null) {
      total += l1.val;
      l1 = l1.next;
    }

    if (l2 !== null) {
      total += l2.val;
      l2 = l2.next;
    }

    carry = Math.floor(total / 10);
    tail.next = new ListNode(total % 10);
    tail = tail.next;
  }

  return dummy.next;
}

// @@ 49
function findDuplicate(nums) {

  // phase 1: slow and fast meet inside the cycle
  let slow = nums[0];
  let fast = nums[nums[0]];

  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[nums[fast]];
  }

  // phase 2: they meet again at the cycle entrance
  let slow2 = 0;

  while (slow !== slow2) {
    slow = nums[slow];
    slow2 = nums[slow2];
  }

  return slow;
}

// @@ 50
class LRUCache {

  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map(); // key -> node

    // head.next is the most recently used, tail.prev the least
    this.head = { key: 0, val: 0, prev: null, next: null };
    this.tail = { key: 0, val: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  addToFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {

    if (!this.map.has(key)) {
      return -1;
    }

    const node = this.map.get(key);
    this.remove(node);
    this.addToFront(node);

    return node.val;
  }

  put(key, value) {

    if (this.map.has(key)) {
      this.remove(this.map.get(key));
      this.map.delete(key);
    }

    const node = { key: key, val: value, prev: null, next: null };
    this.map.set(key, node);
    this.addToFront(node);

    if (this.map.size > this.cap) {
      const lru = this.tail.prev;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}

// @@ 51
function mergeKLists(lists) {

  // min-heap ordered by node value
  const heap = new Heap((a, b) => a.val < b.val);

  for (const head of lists) {
    if (head !== null) {
      heap.push(head);
    }
  }

  const dummy = new ListNode();
  let tail = dummy;

  while (heap.size > 0) {

    const node = heap.pop();

    tail.next = node;
    tail = node;

    if (node.next !== null) {
      heap.push(node.next);
    }
  }

  return dummy.next;
}

// @@ 52
function reverseKGroup(head, k) {

  const dummy = new ListNode(0, head);
  let groupPrev = dummy;

  while (true) {

    // find the k-th node of this group
    let kth = groupPrev;
    for (let i = 0; i < k && kth !== null; i++) {
      kth = kth.next;
    }

    if (kth === null) {
      break;
    }

    const groupNext = kth.next;

    // reverse the group; its first node will point to groupNext
    let prev = groupNext;
    let curr = groupPrev.next;

    while (curr !== groupNext) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }

    const first = groupPrev.next;
    groupPrev.next = kth;
    groupPrev = first;
  }

  return dummy.next;
}
