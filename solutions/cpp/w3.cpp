// Week 3 — Binary Search, Linked List.

// @@ 34
class Solution {
public:
    int search(vector<int>& nums, int target) {

        int left = 0;
        int right = nums.size() - 1;

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
};

// @@ 35
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {

        int rows = matrix.size();
        int cols = matrix[0].size();

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
};

// @@ 36
class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {

        int left = 1;
        int right = 0;
        for (int pile : piles) {
            right = max(right, pile);
        }

        while (left < right) {

            int speed = left + (right - left) / 2;

            long long hours = 0;
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
};

// @@ 37
class Solution {
public:
    int findMin(vector<int>& nums) {

        int left = 0;
        int right = nums.size() - 1;

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
};

// @@ 38
class Solution {
public:
    int search(vector<int>& nums, int target) {

        int left = 0;
        int right = nums.size() - 1;

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
};

// @@ 39
class TimeMap {
    // key -> list of (timestamp, value), in increasing time order
    unordered_map<string, vector<pair<int, string>>> store;

public:
    TimeMap() {
    }

    void set(string key, string value, int timestamp) {
        store[key].push_back({timestamp, value});
    }

    string get(string key, int timestamp) {

        if (store.count(key) == 0) {
            return "";
        }

        vector<pair<int, string>>& items = store[key];

        string ans = "";
        int left = 0;
        int right = items.size() - 1;

        while (left <= right) {

            int mid = left + (right - left) / 2;

            if (items[mid].first <= timestamp) {
                ans = items[mid].second;
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }

        return ans;
    }
};

// @@ 40
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {

        // always binary search the shorter array
        if (nums1.size() > nums2.size()) {
            return findMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.size();
        int n = nums2.size();
        int half = (m + n + 1) / 2;

        int low = 0;
        int high = m;

        while (low <= high) {

            int i = (low + high) / 2;  // items taken from nums1
            int j = half - i;          // items taken from nums2

            int left1 = (i > 0) ? nums1[i - 1] : INT_MIN;
            int right1 = (i < m) ? nums1[i] : INT_MAX;
            int left2 = (j > 0) ? nums2[j - 1] : INT_MIN;
            int right2 = (j < n) ? nums2[j] : INT_MAX;

            if (left1 <= right2 && left2 <= right1) {

                if ((m + n) % 2 == 1) {
                    return max(left1, left2);
                }

                return (max(left1, left2) + (double)min(right1, right2)) / 2.0;
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
};

// @@ 42
class Solution {
public:
    ListNode* reverseList(ListNode* head) {

        ListNode* prev = nullptr;
        ListNode* curr = head;

        while (curr != nullptr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }

        return prev;
    }
};

// @@ 43
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {

        ListNode dummy;
        ListNode* tail = &dummy;

        while (list1 != nullptr && list2 != nullptr) {

            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            }
            else {
                tail->next = list2;
                list2 = list2->next;
            }

            tail = tail->next;
        }

        if (list1 != nullptr) {
            tail->next = list1;
        }
        else {
            tail->next = list2;
        }

        return dummy.next;
    }
};

// @@ 44
class Solution {
public:
    bool hasCycle(ListNode* head) {

        ListNode* slow = head;
        ListNode* fast = head;

        while (fast != nullptr && fast->next != nullptr) {

            slow = slow->next;
            fast = fast->next->next;

            if (slow == fast) {
                return true;
            }
        }

        return false;
    }
};

// @@ 45
class Solution {
public:
    void reorderList(ListNode* head) {

        // 1. find the middle (slow ends at the end of the first half)
        ListNode* slow = head;
        ListNode* fast = head->next;

        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }

        // 2. cut the list and reverse the second half
        ListNode* curr = slow->next;
        slow->next = nullptr;

        ListNode* prev = nullptr;
        while (curr != nullptr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }

        // 3. weave the two halves together
        ListNode* first = head;
        ListNode* second = prev;

        while (second != nullptr) {

            ListNode* next1 = first->next;
            ListNode* next2 = second->next;

            first->next = second;
            second->next = next1;

            first = next1;
            second = next2;
        }
    }
};

// @@ 46
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {

        ListNode dummy(0, head);
        ListNode* slow = &dummy;
        ListNode* fast = &dummy;

        // put a gap of n + 1 nodes between fast and slow
        for (int i = 0; i <= n; i++) {
            fast = fast->next;
        }

        while (fast != nullptr) {
            slow = slow->next;
            fast = fast->next;
        }

        slow->next = slow->next->next;

        return dummy.next;
    }
};

// @@ 47
class Solution {
public:
    Node* copyRandomList(Node* head) {

        unordered_map<Node*, Node*> clone;
        clone[nullptr] = nullptr;

        // pass 1: create a copy of every node
        for (Node* curr = head; curr != nullptr; curr = curr->next) {
            clone[curr] = new Node(curr->val);
        }

        // pass 2: connect next and random pointers
        for (Node* curr = head; curr != nullptr; curr = curr->next) {
            clone[curr]->next = clone[curr->next];
            clone[curr]->random = clone[curr->random];
        }

        return clone[head];
    }
};

// @@ 48
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {

        ListNode dummy;
        ListNode* tail = &dummy;
        int carry = 0;

        while (l1 != nullptr || l2 != nullptr || carry != 0) {

            int total = carry;

            if (l1 != nullptr) {
                total += l1->val;
                l1 = l1->next;
            }

            if (l2 != nullptr) {
                total += l2->val;
                l2 = l2->next;
            }

            carry = total / 10;
            tail->next = new ListNode(total % 10);
            tail = tail->next;
        }

        return dummy.next;
    }
};

// @@ 49
class Solution {
public:
    int findDuplicate(vector<int>& nums) {

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
};

// @@ 50
class LRUCache {

    struct Node {
        int key;
        int val;
        Node* prev;
        Node* next;

        Node(int k, int v) {
            key = k;
            val = v;
            prev = nullptr;
            next = nullptr;
        }
    };

    int cap;
    unordered_map<int, Node*> map;
    Node* head;  // head->next is the most recently used
    Node* tail;  // tail->prev is the least recently used

    void remove(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void addToFront(Node* node) {
        node->prev = head;
        node->next = head->next;
        head->next->prev = node;
        head->next = node;
    }

public:
    LRUCache(int capacity) {

        cap = capacity;

        head = new Node(0, 0);
        tail = new Node(0, 0);

        head->next = tail;
        tail->prev = head;
    }

    int get(int key) {

        if (map.count(key) == 0) {
            return -1;
        }

        Node* node = map[key];
        remove(node);
        addToFront(node);

        return node->val;
    }

    void put(int key, int value) {

        if (map.count(key) > 0) {
            Node* old = map[key];
            remove(old);
            map.erase(key);
            delete old;
        }

        Node* node = new Node(key, value);
        map[key] = node;
        addToFront(node);

        if ((int)map.size() > cap) {
            Node* lru = tail->prev;
            remove(lru);
            map.erase(lru->key);
            delete lru;
        }
    }
};

// @@ 51
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {

        // min-heap ordered by node value
        auto cmp = [](ListNode* a, ListNode* b) {
            return a->val > b->val;
        };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> heap(cmp);

        for (ListNode* head : lists) {
            if (head != nullptr) {
                heap.push(head);
            }
        }

        ListNode dummy;
        ListNode* tail = &dummy;

        while (!heap.empty()) {

            ListNode* node = heap.top();
            heap.pop();

            tail->next = node;
            tail = node;

            if (node->next != nullptr) {
                heap.push(node->next);
            }
        }

        return dummy.next;
    }
};

// @@ 52
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {

        ListNode dummy(0, head);
        ListNode* groupPrev = &dummy;

        while (true) {

            // find the k-th node of this group
            ListNode* kth = groupPrev;
            for (int i = 0; i < k && kth != nullptr; i++) {
                kth = kth->next;
            }

            if (kth == nullptr) {
                break;
            }

            ListNode* groupNext = kth->next;

            // reverse the group; its first node will point to groupNext
            ListNode* prev = groupNext;
            ListNode* curr = groupPrev->next;

            while (curr != groupNext) {
                ListNode* next = curr->next;
                curr->next = prev;
                prev = curr;
                curr = next;
            }

            ListNode* first = groupPrev->next;
            groupPrev->next = kth;
            groupPrev = first;
        }

        return dummy.next;
    }
};
