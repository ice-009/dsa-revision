// Week 3 — Binary Search, Linked List.

// @@ 34
class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
}

// @@ 35
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int rows = matrix.length, cols = matrix[0].length;
        int l = 0, r = rows * cols - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            int v = matrix[mid / cols][mid % cols];
            if (v == target) return true;
            if (v < target) l = mid + 1;
            else r = mid - 1;
        }
        return false;
    }
}

// @@ 36
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = Arrays.stream(piles).max().getAsInt();
        while (lo < hi) {
            int k = lo + (hi - lo) / 2;
            long hours = 0;
            for (int p : piles) hours += (p + k - 1) / k;  // ceil(p / k)
            if (hours <= h) hi = k;
            else lo = k + 1;
        }
        return lo;
    }
}

// @@ 37
class Solution {
    public int findMin(int[] nums) {
        int l = 0, r = nums.length - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] > nums[r]) l = mid + 1;  // minimum is right of mid
            else r = mid;
        }
        return nums[l];
    }
}

// @@ 38
class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {  // left half sorted
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {                     // right half sorted
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        return -1;
    }
}

// @@ 39
class TimeMap {
    private final Map<String, TreeMap<Integer, String>> store = new HashMap<>();

    public TimeMap() {}

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value);
    }

    public String get(String key, int timestamp) {
        TreeMap<Integer, String> items = store.get(key);
        if (items == null) return "";
        Map.Entry<Integer, String> e = items.floorEntry(timestamp);  // largest time <= timestamp
        return e == null ? "" : e.getValue();
    }
}

// @@ 40
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);  // search the shorter
        int[] A = nums1, B = nums2;
        int m = A.length, n = B.length, half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int aLeft = i > 0 ? A[i - 1] : Integer.MIN_VALUE, aRight = i < m ? A[i] : Integer.MAX_VALUE;
            int bLeft = j > 0 ? B[j - 1] : Integer.MIN_VALUE, bRight = j < n ? B[j] : Integer.MAX_VALUE;
            if (aLeft <= bRight && bLeft <= aRight) {
                if ((m + n) % 2 == 1) return Math.max(aLeft, bLeft);
                return (Math.max(aLeft, bLeft) + (double) Math.min(aRight, bRight)) / 2.0;
            }
            if (aLeft > bRight) hi = i - 1;
            else lo = i + 1;
        }
        return 0;
    }
}

// @@ 42
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode nxt = cur.next;
            cur.next = prev;
            prev = cur;
            cur = nxt;
        }
        return prev;
    }
}

// @@ 43
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(), tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }
        tail.next = list1 != null ? list1 : list2;
        return dummy.next;
    }
}

// @@ 44
class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}

// @@ 45
class Solution {
    public void reorderList(ListNode head) {
        // 1) middle: slow ends at the end of the first half
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        // 2) cut and reverse the second half
        ListNode second = slow.next, prev = null;
        slow.next = null;
        while (second != null) {
            ListNode nxt = second.next;
            second.next = prev;
            prev = second;
            second = nxt;
        }
        // 3) weave the two halves
        ListNode first = head;
        second = prev;
        while (second != null) {
            ListNode n1 = first.next, n2 = second.next;
            first.next = second;
            second.next = n1;
            first = n1;
            second = n2;
        }
    }
}

// @@ 46
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode slow = dummy, fast = dummy;
        for (int i = 0; i <= n; i++) fast = fast.next;  // gap of n + 1
        while (fast != null) {
            slow = slow.next;
            fast = fast.next;
        }
        slow.next = slow.next.next;
        return dummy.next;
    }
}

// @@ 47
class Solution {
    public Node copyRandomList(Node head) {
        Map<Node, Node> clone = new HashMap<>();
        clone.put(null, null);
        for (Node cur = head; cur != null; cur = cur.next) clone.put(cur, new Node(cur.val));
        for (Node cur = head; cur != null; cur = cur.next) {
            clone.get(cur).next = clone.get(cur.next);
            clone.get(cur).random = clone.get(cur.random);
        }
        return clone.get(head);
    }
}

// @@ 48
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(), tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int total = carry + (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0);
            carry = total / 10;
            tail.next = new ListNode(total % 10);
            tail = tail.next;
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        return dummy.next;
    }
}

// @@ 49
class Solution {
    public int findDuplicate(int[] nums) {
        int slow = 0, fast = 0;
        do {  // phase 1: meet inside the cycle
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        int slow2 = 0;  // phase 2: meet at the cycle entrance
        while (slow != slow2) {
            slow = nums[slow];
            slow2 = nums[slow2];
        }
        return slow;
    }
}

// @@ 50
class LRUCache {
    private static class Node {
        int key, val;
        Node prev, next;
        Node(int key, int val) { this.key = key; this.val = val; }
    }

    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);  // head side = most recent

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addFront(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;
        remove(node);
        addFront(node);
        return node.val;
    }

    public void put(int key, int value) {
        Node old = map.get(key);
        if (old != null) remove(old);
        Node node = new Node(key, value);
        map.put(key, node);
        addFront(node);
        if (map.size() > cap) {  // evict least recently used
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }
}

// @@ 51
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);  // min-heap by val
        for (ListNode head : lists)
            if (head != null) pq.add(head);
        ListNode dummy = new ListNode(), tail = dummy;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            tail.next = node;
            tail = node;
            if (node.next != null) pq.add(node.next);
        }
        return dummy.next;
    }
}

// @@ 52
class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head);
        ListNode groupPrev = dummy;
        while (true) {
            ListNode kth = groupPrev;
            for (int i = 0; i < k && kth != null; i++) kth = kth.next;
            if (kth == null) return dummy.next;
            ListNode groupNext = kth.next;
            ListNode prev = groupNext, cur = groupPrev.next;  // reverse the group
            while (cur != groupNext) {
                ListNode nxt = cur.next;
                cur.next = prev;
                prev = cur;
                cur = nxt;
            }
            ListNode first = groupPrev.next;
            groupPrev.next = kth;
            groupPrev = first;
        }
    }
}
