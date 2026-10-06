// Week 3 — Binary Search, Linked List.

// @@ 34
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = (int)nums.size() - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
};

// @@ 35
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int rows = matrix.size(), cols = matrix[0].size();
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
};

// @@ 36
class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int k = lo + (hi - lo) / 2;
            long long hours = 0;
            for (int p : piles) hours += (p + k - 1) / k;  // ceil(p / k)
            if (hours <= h) hi = k;
            else lo = k + 1;
        }
        return lo;
    }
};

// @@ 37
class Solution {
public:
    int findMin(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] > nums[r]) l = mid + 1;  // minimum is right of mid
            else r = mid;
        }
        return nums[l];
    }
};

// @@ 38
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = (int)nums.size() - 1;
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
};

// @@ 39
class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;  // key -> (timestamp, value), time order
public:
    TimeMap() {}

    void set(string key, string value, int timestamp) {
        store[key].push_back({timestamp, value});
    }

    string get(string key, int timestamp) {
        auto& items = store[key];
        int lo = 0, hi = items.size();  // first index with time > timestamp
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (items[mid].first <= timestamp) lo = mid + 1;
            else hi = mid;
        }
        return lo ? items[lo - 1].second : "";
    }
};

// @@ 40
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int>& A = nums1.size() <= nums2.size() ? nums1 : nums2;  // A is the shorter
        vector<int>& B = nums1.size() <= nums2.size() ? nums2 : nums1;
        int m = A.size(), n = B.size(), half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int aLeft = i > 0 ? A[i - 1] : INT_MIN, aRight = i < m ? A[i] : INT_MAX;
            int bLeft = j > 0 ? B[j - 1] : INT_MIN, bRight = j < n ? B[j] : INT_MAX;
            if (aLeft <= bRight && bLeft <= aRight) {
                if ((m + n) % 2) return max(aLeft, bLeft);
                return (max(aLeft, bLeft) + (double)min(aRight, bRight)) / 2.0;
            }
            if (aLeft > bRight) hi = i - 1;
            else lo = i + 1;
        }
        return 0;
    }
};

// @@ 42
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode *prev = nullptr, *cur = head;
        while (cur) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
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
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            } else {
                tail->next = list2;
                list2 = list2->next;
            }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};

// @@ 44
class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};

// @@ 45
class Solution {
public:
    void reorderList(ListNode* head) {
        // 1) middle: slow ends at the end of the first half
        ListNode *slow = head, *fast = head->next;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        // 2) cut and reverse the second half
        ListNode *second = slow->next, *prev = nullptr;
        slow->next = nullptr;
        while (second) {
            ListNode* nxt = second->next;
            second->next = prev;
            prev = second;
            second = nxt;
        }
        // 3) weave the two halves
        ListNode* first = head;
        second = prev;
        while (second) {
            ListNode *n1 = first->next, *n2 = second->next;
            first->next = second;
            second->next = n1;
            first = n1;
            second = n2;
        }
    }
};

// @@ 46
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0, head);
        ListNode *slow = &dummy, *fast = &dummy;
        for (int i = 0; i <= n; i++) fast = fast->next;  // gap of n + 1
        while (fast) {
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
        unordered_map<Node*, Node*> clone{{nullptr, nullptr}};
        for (Node* cur = head; cur; cur = cur->next) clone[cur] = new Node(cur->val);
        for (Node* cur = head; cur; cur = cur->next) {
            clone[cur]->next = clone[cur->next];
            clone[cur]->random = clone[cur->random];
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
        while (l1 || l2 || carry) {
            int total = carry + (l1 ? l1->val : 0) + (l2 ? l2->val : 0);
            carry = total / 10;
            tail->next = new ListNode(total % 10);
            tail = tail->next;
            if (l1) l1 = l1->next;
            if (l2) l2 = l2->next;
        }
        return dummy.next;
    }
};

// @@ 49
class Solution {
public:
    int findDuplicate(vector<int>& nums) {
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
};

// @@ 50
class LRUCache {
    int cap;
    list<pair<int, int>> items;  // (key, value), front = most recently used
    unordered_map<int, list<pair<int, int>>::iterator> pos;
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        items.splice(items.begin(), items, it->second);  // move to front, O(1)
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = pos.find(key);
        if (it != pos.end()) {
            it->second->second = value;
            items.splice(items.begin(), items, it->second);
            return;
        }
        items.emplace_front(key, value);
        pos[key] = items.begin();
        if ((int)pos.size() > cap) {  // evict least recently used
            pos.erase(items.back().first);
            items.pop_back();
        }
    }
};

// @@ 51
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);  // min-heap by val
        for (ListNode* head : lists)
            if (head) pq.push(head);
        ListNode dummy;
        ListNode* tail = &dummy;
        while (!pq.empty()) {
            ListNode* node = pq.top();
            pq.pop();
            tail->next = node;
            tail = node;
            if (node->next) pq.push(node->next);
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
            ListNode* kth = groupPrev;
            for (int i = 0; i < k && kth; i++) kth = kth->next;
            if (!kth) return dummy.next;
            ListNode* groupNext = kth->next;
            ListNode *prev = groupNext, *cur = groupPrev->next;  // reverse the group
            while (cur != groupNext) {
                ListNode* nxt = cur->next;
                cur->next = prev;
                prev = cur;
                cur = nxt;
            }
            ListNode* first = groupPrev->next;
            groupPrev->next = kth;
            groupPrev = first;
        }
    }
};
