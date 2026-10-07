// Week 3 — Binary Search, Linked List.

// @@ 34
class Solution {
    public int search(int[] nums, int target) {

        int left = 0;
        int right = nums.length - 1;

        while (left <= right) {

            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
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
}

// @@ 35
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {

        int rows = matrix.length;
        int cols = matrix[0].length;

        int left = 0;
        int right = rows * cols - 1;

        while (left <= right) {

            int mid = left + (right - left) / 2;
            int value = matrix[mid / cols][mid % cols];

            if (value == target) {
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
}

// @@ 36
class Solution {
    public int minEatingSpeed(int[] piles, int h) {

        int left = 1;
        int right = 0;
        for (int pile : piles) {
            right = Math.max(right, pile);
        }

        while (left < right) {

            int speed = left + (right - left) / 2;

            long hours = 0;
            for (int pile : piles) {
                hours += (pile + speed - 1) / speed;  // ceil(pile / speed)
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
}

// @@ 37
class Solution {
    public int findMin(int[] nums) {

        int left = 0;
        int right = nums.length - 1;

        while (left < right) {

            int mid = left + (right - left) / 2;

            if (nums[mid] > nums[right]) {
                left = mid + 1;  // minimum is right of mid
            }
            else {
                right = mid;
            }
        }

        return nums[left];
    }
}

// @@ 38
class Solution {
    public int search(int[] nums, int target) {

        int left = 0;
        int right = nums.length - 1;

        while (left <= right) {

            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
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
}

// @@ 39
class TimeMap {

    private static class Item {
        int time;
        String value;

        Item(int time, String value) {
            this.time = time;
            this.value = value;
        }
    }

    // key -> list of items, in increasing time order
    private Map<String, List<Item>> store = new HashMap<>();

    public TimeMap() {
    }

    public void set(String key, String value, int timestamp) {

        if (!store.containsKey(key)) {
            store.put(key, new ArrayList<>());
        }

        store.get(key).add(new Item(timestamp, value));
    }

    public String get(String key, int timestamp) {

        if (!store.containsKey(key)) {
            return "";
        }

        List<Item> items = store.get(key);

        String ans = "";
        int left = 0;
        int right = items.size() - 1;

        while (left <= right) {

            int mid = left + (right - left) / 2;

            if (items.get(mid).time <= timestamp) {
                ans = items.get(mid).value;
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
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {

        // always binary search the shorter array
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.length;
        int n = nums2.length;
        int half = (m + n + 1) / 2;

        int low = 0;
        int high = m;

        while (low <= high) {

            int i = (low + high) / 2;  // items taken from nums1
            int j = half - i;          // items taken from nums2

            int left1 = (i > 0) ? nums1[i - 1] : Integer.MIN_VALUE;
            int right1 = (i < m) ? nums1[i] : Integer.MAX_VALUE;
            int left2 = (j > 0) ? nums2[j - 1] : Integer.MIN_VALUE;
            int right2 = (j < n) ? nums2[j] : Integer.MAX_VALUE;

            if (left1 <= right2 && left2 <= right1) {

                if ((m + n) % 2 == 1) {
                    return Math.max(left1, left2);
                }

                return (Math.max(left1, left2) + (double) Math.min(right1, right2)) / 2.0;
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
}

// @@ 42
class Solution {
    public ListNode reverseList(ListNode head) {

        ListNode prev = null;
        ListNode curr = head;

        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }

        return prev;
    }
}

// @@ 43
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {

        ListNode dummy = new ListNode();
        ListNode tail = dummy;

        while (list1 != null && list2 != null) {

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

        if (list1 != null) {
            tail.next = list1;
        }
        else {
            tail.next = list2;
        }

        return dummy.next;
    }
}

// @@ 44
class Solution {
    public boolean hasCycle(ListNode head) {

        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {

            slow = slow.next;
            fast = fast.next.next;

            if (slow == fast) {
                return true;
            }
        }

        return false;
    }
}

// @@ 45
class Solution {
    public void reorderList(ListNode head) {

        // 1. find the middle (slow ends at the end of the first half)
        ListNode slow = head;
        ListNode fast = head.next;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        // 2. cut the list and reverse the second half
        ListNode curr = slow.next;
        slow.next = null;

        ListNode prev = null;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }

        // 3. weave the two halves together
        ListNode first = head;
        ListNode second = prev;

        while (second != null) {

            ListNode next1 = first.next;
            ListNode next2 = second.next;

            first.next = second;
            second.next = next1;

            first = next1;
            second = next2;
        }
    }
}

// @@ 46
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {

        ListNode dummy = new ListNode(0, head);
        ListNode slow = dummy;
        ListNode fast = dummy;

        // put a gap of n + 1 nodes between fast and slow
        for (int i = 0; i <= n; i++) {
            fast = fast.next;
        }

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

        // pass 1: create a copy of every node
        for (Node curr = head; curr != null; curr = curr.next) {
            clone.put(curr, new Node(curr.val));
        }

        // pass 2: connect next and random pointers
        for (Node curr = head; curr != null; curr = curr.next) {
            clone.get(curr).next = clone.get(curr.next);
            clone.get(curr).random = clone.get(curr.random);
        }

        return clone.get(head);
    }
}

// @@ 48
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {

        ListNode dummy = new ListNode();
        ListNode tail = dummy;
        int carry = 0;

        while (l1 != null || l2 != null || carry != 0) {

            int total = carry;

            if (l1 != null) {
                total += l1.val;
                l1 = l1.next;
            }

            if (l2 != null) {
                total += l2.val;
                l2 = l2.next;
            }

            carry = total / 10;
            tail.next = new ListNode(total % 10);
            tail = tail.next;
        }

        return dummy.next;
    }
}

// @@ 49
class Solution {
    public int findDuplicate(int[] nums) {

        // phase 1: slow and fast meet inside the cycle
        int slow = nums[0];
        int fast = nums[nums[0]];

        while (slow != fast) {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }

        // phase 2: they meet again at the cycle entrance
        int slow2 = 0;

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
        int key;
        int val;
        Node prev;
        Node next;

        Node(int key, int val) {
            this.key = key;
            this.val = val;
        }
    }

    private int cap;
    private Map<Integer, Node> map = new HashMap<>();
    private Node head = new Node(0, 0);  // head.next is the most recently used
    private Node tail = new Node(0, 0);  // tail.prev is the least recently used

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addToFront(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {

        if (!map.containsKey(key)) {
            return -1;
        }

        Node node = map.get(key);
        remove(node);
        addToFront(node);

        return node.val;
    }

    public void put(int key, int value) {

        if (map.containsKey(key)) {
            remove(map.get(key));
            map.remove(key);
        }

        Node node = new Node(key, value);
        map.put(key, node);
        addToFront(node);

        if (map.size() > cap) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }
}

// @@ 51
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {

        // min-heap ordered by node value
        PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> a.val - b.val);

        for (ListNode head : lists) {
            if (head != null) {
                heap.add(head);
            }
        }

        ListNode dummy = new ListNode();
        ListNode tail = dummy;

        while (!heap.isEmpty()) {

            ListNode node = heap.poll();

            tail.next = node;
            tail = node;

            if (node.next != null) {
                heap.add(node.next);
            }
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

            // find the k-th node of this group
            ListNode kth = groupPrev;
            for (int i = 0; i < k && kth != null; i++) {
                kth = kth.next;
            }

            if (kth == null) {
                break;
            }

            ListNode groupNext = kth.next;

            // reverse the group; its first node will point to groupNext
            ListNode prev = groupNext;
            ListNode curr = groupPrev.next;

            while (curr != groupNext) {
                ListNode next = curr.next;
                curr.next = prev;
                prev = curr;
                curr = next;
            }

            ListNode first = groupPrev.next;
            groupPrev.next = kth;
            groupPrev = first;
        }

        return dummy.next;
    }
}
