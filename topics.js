// Pattern cheat sheets, one per DSA topic in the tracker. `name` must match the sheet's Topic column.
// template: the core pattern in C++, Java and JavaScript.
window.TOPICS = [
  {
    name: 'Arrays & Hashing', icon: '#',
    gist: 'Trade space for time: a hash map/set turns "have I seen X?" from O(n) into O(1).',
    signals: [
      'Duplicate / "seen before?" / membership checks',
      'Count frequencies, group things that share a key',
      'Find a pair that sums/relates to a target (complement lookup)',
      'Subarray sum = k → prefix sum + hashmap of prefix counts',
    ],
    template: {
      cpp: `// complement lookup (Two Sum family)
unordered_map<int, int> seen;            // value -> index
for (int i = 0; i < n; i++) {
    if (seen.count(target - nums[i]))    // check BEFORE inserting
        return {seen[target - nums[i]], i};
    seen[nums[i]] = i;
}

// prefix sum + count map (subarrays summing to k)
unordered_map<int, int> count{{0, 1}};
int pre = 0, ans = 0;
for (int x : nums) {
    pre += x;
    ans += count[pre - k];
    count[pre]++;
}`,
      java: `// complement lookup (Two Sum family)
Map<Integer, Integer> seen = new HashMap<>();  // value -> index
for (int i = 0; i < n; i++) {
    Integer j = seen.get(target - nums[i]);    // check BEFORE inserting
    if (j != null) return new int[]{j, i};
    seen.put(nums[i], i);
}

// prefix sum + count map (subarrays summing to k)
Map<Integer, Integer> count = new HashMap<>(Map.of(0, 1));
int pre = 0, ans = 0;
for (int x : nums) {
    pre += x;
    ans += count.getOrDefault(pre - k, 0);
    count.merge(pre, 1, Integer::sum);
}`,
      js: `// complement lookup (Two Sum family)
const seen = new Map(); // value -> index
for (let i = 0; i < nums.length; i++) {
  if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]; // check BEFORE inserting
  seen.set(nums[i], i);
}

// prefix sum + count map (subarrays summing to k)
const count = new Map([[0, 1]]);
let pre = 0, ans = 0;
for (const x of nums) {
  pre += x;
  ans += count.get(pre - k) || 0;
  count.set(pre, (count.get(pre) || 0) + 1);
}`,
    },
    traps: [
      'Insert after lookup, or you match an element with itself',
      'Arrays aren’t map keys by value — build a string key (e.g. letter counts joined)',
      'Bucket sort (index = frequency) beats a heap when values are bounded by n',
    ],
    cx: 'Usually O(n) time, O(n) space',
  },
  {
    name: 'Two Pointers', icon: '⇄',
    gist: 'Two indices moving toward each other (sorted data) or at different speeds — each step safely discards candidates.',
    signals: [
      'Input is sorted (or you can sort it) and you need pairs/triplets',
      'Palindrome / reverse / compare from both ends',
      'In-place partition or dedupe with a write pointer',
      '"Move the side that limits the answer" arguments',
    ],
    template: {
      cpp: `// opposite ends on a sorted array
int l = 0, r = a.size() - 1;
while (l < r) {
    int s = a[l] + a[r];
    if (s == target) return {l, r};
    if (s < target) l++;   // need bigger
    else r--;              // need smaller
}

// k-sum: sort, fix one, two-pointer the rest, skip dupes
sort(a.begin(), a.end());
for (int i = 0; i < n; i++) {
    if (i > 0 && a[i] == a[i - 1]) continue;
    // ... two pointers on i+1 .. n-1
}`,
      java: `// opposite ends on a sorted array
int l = 0, r = a.length - 1;
while (l < r) {
    int s = a[l] + a[r];
    if (s == target) return new int[]{l, r};
    if (s < target) l++;   // need bigger
    else r--;              // need smaller
}

// k-sum: sort, fix one, two-pointer the rest, skip dupes
Arrays.sort(a);
for (int i = 0; i < n; i++) {
    if (i > 0 && a[i] == a[i - 1]) continue;
    // ... two pointers on i+1 .. n-1
}`,
      js: `// opposite ends on a sorted array
let l = 0, r = a.length - 1;
while (l < r) {
  const s = a[l] + a[r];
  if (s === target) return [l, r];
  if (s < target) l++; // need bigger
  else r--; // need smaller
}

// k-sum: sort, fix one, two-pointer the rest, skip dupes
a.sort((x, y) => x - y); // numeric sort — default sort compares strings!
for (let i = 0; i < a.length; i++) {
  if (i > 0 && a[i] === a[i - 1]) continue;
  // ... two pointers on i+1 .. n-1
}`,
    },
    traps: [
      'Skip duplicates on both the fixed index and the moving pointer (3Sum)',
      'Prove why moving a pointer cannot skip the optimum — interviewers ask',
      'l < r vs l <= r: do you allow the same element twice?',
      'JS: arr.sort() sorts as strings — always pass (a, b) => a - b',
    ],
    cx: 'O(n) per pass, O(n²) for 3Sum; O(1) extra space',
  },
  {
    name: 'Sliding Window', icon: '▭',
    gist: 'A contiguous range [l, r] that grows on the right and shrinks on the left while maintaining a running summary.',
    signals: [
      '"Longest / shortest / count of SUBARRAY or SUBSTRING" with a condition',
      'Fixed window of size k (anagram/permutation in string)',
      'Window max/min → monotonic deque',
    ],
    template: {
      cpp: `// variable window: expand r, shrink l while invalid
vector<int> count(128, 0);
int l = 0, best = 0;
for (int r = 0; r < (int)s.size(); r++) {
    count[s[r]]++;
    while (windowInvalid(count, l, r)) {
        count[s[l]]--;
        l++;
    }
    best = max(best, r - l + 1);
}
// shortest valid window: shrink WHILE valid, record inside the loop`,
      java: `// variable window: expand r, shrink l while invalid
int[] count = new int[128];
int l = 0, best = 0;
for (int r = 0; r < s.length(); r++) {
    count[s.charAt(r)]++;
    while (windowInvalid(count, l, r)) {
        count[s.charAt(l)]--;
        l++;
    }
    best = Math.max(best, r - l + 1);
}
// shortest valid window: shrink WHILE valid, record inside the loop`,
      js: `// variable window: expand r, shrink l while invalid
const count = new Map();
let l = 0, best = 0;
for (let r = 0; r < s.length; r++) {
  count.set(s[r], (count.get(s[r]) || 0) + 1);
  while (windowInvalid(count, l, r)) {
    count.set(s[l], count.get(s[l]) - 1);
    l++;
  }
  best = Math.max(best, r - l + 1);
}
// shortest valid window: shrink WHILE valid, record inside the loop`,
    },
    traps: [
      'Longest → record after shrinking; shortest → record while shrinking',
      'Only works when validity is monotonic (negative numbers break sum windows)',
      'Track "have vs need" counters instead of comparing whole maps each step',
    ],
    cx: 'O(n) — each index enters and leaves once',
  },
  {
    name: 'Stack', icon: '≡',
    gist: 'LIFO for nested/matching structure; a monotonic stack answers "next greater/smaller" in one pass.',
    signals: [
      'Matching brackets, nested structure, undo, expression evaluation',
      '"Next greater / previous smaller element", days until warmer',
      'Largest rectangle / span problems',
    ],
    template: {
      cpp: `// monotonic decreasing stack: next greater element
vector<int> ans(n, 0);
vector<int> st;                    // indices, values decreasing
for (int i = 0; i < n; i++) {
    while (!st.empty() && a[st.back()] < a[i]) {
        int j = st.back();
        st.pop_back();
        ans[j] = i - j;            // or a[i], a width, ...
    }
    st.push_back(i);
}`,
      java: `// monotonic decreasing stack: next greater element
int[] ans = new int[n];
Deque<Integer> st = new ArrayDeque<>();  // indices, values decreasing
for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && a[st.peek()] < a[i]) {
        int j = st.pop();
        ans[j] = i - j;                  // or a[i], a width, ...
    }
    st.push(i);
}`,
      js: `// monotonic decreasing stack: next greater element
const ans = new Array(n).fill(0);
const st = []; // indices, values decreasing
for (let i = 0; i < n; i++) {
  while (st.length && a[st[st.length - 1]] < a[i]) {
    const j = st.pop();
    ans[j] = i - j; // or a[i], a width, ...
  }
  st.push(i);
}`,
    },
    traps: [
      'Store indices, not values — you usually need distances/widths',
      'Flush the stack at the end (or append a sentinel 0 / −∞)',
      'Check empty before peeking/popping',
      'Java: use ArrayDeque, not the old synchronized Stack class',
    ],
    cx: 'O(n) — each element pushed/popped once',
  },
  {
    name: 'Binary Search', icon: '½',
    gist: 'Halve the search space whenever a predicate is monotonic — on indices OR on the answer itself.',
    signals: [
      'Sorted / rotated-sorted input, O(log n) required',
      '"Minimum X such that feasible(X)" → binary search on the answer',
      'Lookup by timestamp / floor / ceiling',
    ],
    template: {
      cpp: `// first index where pred(i) is true (lower bound)
int lo = 0, hi = n;                 // hi = n means "not found"
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;   // no overflow
    if (pred(mid)) hi = mid;
    else lo = mid + 1;
}
return lo;
// built-in: lower_bound(a.begin(), a.end(), x) - a.begin()

// on the answer: smallest speed that finishes in time
int lo = 1, hi = *max_element(piles.begin(), piles.end());
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (feasible(mid)) hi = mid;
    else lo = mid + 1;
}`,
      java: `// first index where pred(i) is true (lower bound)
int lo = 0, hi = n;                 // hi = n means "not found"
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;   // no overflow
    if (pred(mid)) hi = mid;
    else lo = mid + 1;
}
return lo;
// built-in floor/ceiling: TreeMap.floorKey / ceilingKey

// on the answer: smallest speed that finishes in time
int lo = 1, hi = Arrays.stream(piles).max().getAsInt();
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (feasible(mid)) hi = mid;
    else lo = mid + 1;
}`,
      js: `// first index where pred(i) is true (lower bound)
let lo = 0, hi = n; // hi = n means "not found"
while (lo < hi) {
  const mid = (lo + hi) >> 1; // integer midpoint
  if (pred(mid)) hi = mid;
  else lo = mid + 1;
}
return lo;

// on the answer: smallest speed that finishes in time
let lo = 1, hi = Math.max(...piles);
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (feasible(mid)) hi = mid;
  else lo = mid + 1;
}`,
    },
    traps: [
      'Pick ONE convention (lo < hi with hi = mid) and stick to it',
      'Infinite loop: lo = mid without +1 when mid rounds down',
      'Rotated arrays: compare mid with the RIGHT end to know which half is sorted',
      'C++/Java: mid = lo + (hi − lo) / 2 avoids int overflow; JS: (lo + hi) / 2 must be floored',
    ],
    cx: 'O(log n) · cost of predicate',
  },
  {
    name: 'Linked List', icon: '→',
    gist: 'Pointer surgery: dummy head for edge cases, fast/slow for middle & cycles, prev/cur/next for reversal.',
    signals: [
      'Reverse (whole, part, k-groups), reorder, merge',
      'Middle node, cycle, nth from end → fast & slow pointers',
      'O(1) LRU-style ops → hashmap + doubly linked list',
    ],
    template: {
      cpp: `// reverse
ListNode *prev = nullptr, *cur = head;
while (cur) {
    ListNode* nxt = cur->next;
    cur->next = prev;
    prev = cur;
    cur = nxt;
}
return prev;

// middle / cycle (Floyd)
ListNode *slow = head, *fast = head;
while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
}

// dummy head removes "is it the first node?" cases
ListNode dummy(0, head);
ListNode* tail = &dummy;`,
      java: `// reverse
ListNode prev = null, cur = head;
while (cur != null) {
    ListNode nxt = cur.next;
    cur.next = prev;
    prev = cur;
    cur = nxt;
}
return prev;

// middle / cycle (Floyd)
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
}

// dummy head removes "is it the first node?" cases
ListNode dummy = new ListNode(0, head), tail = dummy;`,
      js: `// reverse
let prev = null, cur = head;
while (cur) {
  const nxt = cur.next;
  cur.next = prev;
  prev = cur;
  cur = nxt;
}
return prev;

// middle / cycle (Floyd)
let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
}

// dummy head removes "is it the first node?" cases
const dummy = new ListNode(0, head);
let tail = dummy;`,
    },
    traps: [
      'Save next before rewiring',
      'Use a dummy when the head itself may change or be removed',
      'Draw it: 3 nodes on paper catches most bugs',
    ],
    cx: 'O(n) time, O(1) space for most',
  },
  {
    name: 'Trees', icon: 'Y',
    gist: 'Recursion where each node combines answers from its children; BFS with a queue for anything "per level".',
    signals: [
      'Height, diameter, balance, path sums → post-order DFS returning a value',
      'Level by level / right side view → BFS',
      'BST → in-order is sorted; use min/max bounds to validate',
    ],
    template: {
      cpp: `// DFS returning info up, member variable for the answer
int best = 0;
int dfs(TreeNode* node) {
    if (!node) return 0;
    int l = dfs(node->left), r = dfs(node->right);
    best = max(best, l + r);        // answer through node
    return 1 + max(l, r);           // what the parent needs
}

// BFS by level
queue<TreeNode*> q;
q.push(root);
while (!q.empty()) {
    for (int i = q.size(); i > 0; i--) {  // exactly one level
        TreeNode* node = q.front(); q.pop();
        // ... use node
        if (node->left) q.push(node->left);
        if (node->right) q.push(node->right);
    }
}`,
      java: `// DFS returning info up, field for the answer
private int best = 0;
private int dfs(TreeNode node) {
    if (node == null) return 0;
    int l = dfs(node.left), r = dfs(node.right);
    best = Math.max(best, l + r);   // answer through node
    return 1 + Math.max(l, r);      // what the parent needs
}

// BFS by level
Queue<TreeNode> q = new ArrayDeque<>();
q.add(root);
while (!q.isEmpty()) {
    for (int i = q.size(); i > 0; i--) {  // exactly one level
        TreeNode node = q.poll();
        // ... use node
        if (node.left != null) q.add(node.left);
        if (node.right != null) q.add(node.right);
    }
}`,
      js: `// DFS returning info up, closure variable for the answer
let best = 0;
const dfs = node => {
  if (!node) return 0;
  const l = dfs(node.left), r = dfs(node.right);
  best = Math.max(best, l + r); // answer through node
  return 1 + Math.max(l, r); // what the parent needs
};

// BFS by level (arrays per level — shift() is O(n))
let level = [root];
while (level.length) {
  const next = [];
  for (const node of level) {
    // ... use node
    if (node.left) next.push(node.left);
    if (node.right) next.push(node.right);
  }
  level = next;
}`,
    },
    traps: [
      'Distinguish "value returned to parent" from "best answer seen anywhere"',
      'Validate BST with bounds (use long / ±∞ so INT_MIN/INT_MAX values work), not just node vs children',
      'Handle a null root up front',
    ],
    cx: 'O(n) time, O(h) recursion space',
  },
  {
    name: 'Tries', icon: 'T',
    gist: 'A tree of characters: shared prefixes stored once, so prefix lookups cost O(word length).',
    signals: [
      'Prefix search / autocomplete / startsWith',
      'Many words searched together in a grid (Word Search II)',
      'Wildcard match against a dictionary',
    ],
    template: {
      cpp: `struct TrieNode {
    TrieNode* child[26] = {};
    bool end = false;
};

void insert(TrieNode* root, const string& word) {
    TrieNode* node = root;
    for (char c : word) {
        if (!node->child[c - 'a']) node->child[c - 'a'] = new TrieNode();
        node = node->child[c - 'a'];
    }
    node->end = true;
}`,
      java: `class TrieNode {
    TrieNode[] child = new TrieNode[26];
    boolean end;
}

void insert(TrieNode root, String word) {
    TrieNode node = root;
    for (char c : word.toCharArray()) {
        if (node.child[c - 'a'] == null) node.child[c - 'a'] = new TrieNode();
        node = node.child[c - 'a'];
    }
    node.end = true;
}`,
      js: `const root = { children: {}, end: false };

function insert(word) {
  let node = root;
  for (const c of word) {
    if (!node.children[c]) node.children[c] = { children: {}, end: false };
    node = node.children[c];
  }
  node.end = true;
}`,
    },
    traps: [
      'search() needs node.end; startsWith() does not',
      'Prune found words / empty branches to avoid TLE in grid search',
    ],
    cx: 'O(L) per insert/search; space O(total chars)',
  },
  {
    name: 'Heap / Priority Queue', icon: '△',
    gist: 'Always pop the min (or max) in O(log n): top-k, k-way merge, running median, scheduling.',
    signals: [
      '"K largest / smallest / closest / most frequent"',
      'Merge k sorted things',
      'Running median → two heaps',
      'Repeatedly take the best available option (greedy + heap)',
    ],
    template: {
      cpp: `// priority_queue is a MAX-heap by default
priority_queue<int> maxHeap;
priority_queue<int, vector<int>, greater<int>> minHeap;

// top-k largest: keep a MIN-heap of size k
for (int x : nums) {
    minHeap.push(x);
    if ((int)minHeap.size() > k) minHeap.pop();
}
// minHeap.top() is the kth largest

// custom order: comparator returns true when a goes BELOW b
auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);`,
      java: `// PriorityQueue is a MIN-heap by default
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());

// top-k largest: keep a MIN-heap of size k
for (int x : nums) {
    minHeap.add(x);
    if (minHeap.size() > k) minHeap.poll();
}
// minHeap.peek() is the kth largest

// custom order
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);`,
      js: `// JS has no built-in heap — keep this one handy (also in every JS heap solution here)
class Heap {
  // binary heap; less(a, b) returns true when a should come out first
  constructor(less) {
    this.items = [];
    this.less = less;
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(value) {
    const items = this.items;
    items.push(value);

    // move the new value up while it beats its parent
    let i = items.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (!this.less(items[i], items[parent])) {
        break;
      }
      this.swap(i, parent);
      i = parent;
    }
  }

  pop() {
    const items = this.items;
    const top = items[0];
    const last = items.pop();

    if (items.length > 0) {
      items[0] = last;

      // move the root down while a child beats it
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let best = i;

        if (left < items.length && this.less(items[left], items[best])) {
          best = left;
        }
        if (right < items.length && this.less(items[right], items[best])) {
          best = right;
        }
        if (best === i) {
          break;
        }

        this.swap(i, best);
        i = best;
      }
    }

    return top;
  }

  swap(i, j) {
    const temp = this.items[i];
    this.items[i] = this.items[j];
    this.items[j] = temp;
  }
}

// top-k largest: keep a MIN-heap of size k
const heap = new Heap((a, b) => a < b);
for (const x of nums) {
  heap.push(x);
  if (heap.size > k) heap.pop();
}
// heap.peek() is the kth largest`,
    },
    traps: [
      'C++ priority_queue is max-first; Java PriorityQueue is min-first — know which you have',
      'k-largest uses a MIN-heap (evict the smallest)',
      'Comparator a − b can overflow for huge ints — use Integer.compare in Java',
      'JS: no built-in heap; sorting every step is O(n log n) per operation',
    ],
    cx: 'O(n log k) for top-k; heapify is O(n)',
  },
  {
    name: 'Backtracking', icon: '↺',
    gist: 'Build candidates step by step: choose → explore → un-choose. Prune early.',
    signals: [
      '"All" subsets / permutations / combinations / partitions',
      'Place items under constraints (N-Queens, Sudoku)',
      'Search a path in a grid with no reuse',
    ],
    template: {
      cpp: `vector<vector<int>> res;
vector<int> path;
void bt(vector<int>& nums, int start) {
    res.push_back(path);                        // record (subsets) or check goal
    for (int i = start; i < (int)nums.size(); i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;  // skip dupes (sorted)
        path.push_back(nums[i]);                // choose
        bt(nums, i + 1);                        // explore (i if reuse allowed)
        path.pop_back();                        // un-choose
    }
}`,
      java: `List<List<Integer>> res = new ArrayList<>();
List<Integer> path = new ArrayList<>();
void bt(int[] nums, int start) {
    res.add(new ArrayList<>(path));             // record a COPY
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;  // skip dupes (sorted)
        path.add(nums[i]);                      // choose
        bt(nums, i + 1);                        // explore (i if reuse allowed)
        path.remove(path.size() - 1);           // un-choose
    }
}`,
      js: `const res = [], path = [];
const bt = start => {
  res.push([...path]); // record a COPY
  for (let i = start; i < nums.length; i++) {
    if (i > start && nums[i] === nums[i - 1]) continue; // skip dupes (sorted)
    path.push(nums[i]); // choose
    bt(i + 1); // explore (i if reuse allowed)
    path.pop(); // un-choose
  }
};
bt(0);`,
    },
    traps: [
      'Record a COPY of path (Java: new ArrayList<>(path); JS: [...path])',
      'Combinations use start index; permutations use a used[] array',
      'Undo every mutation (visited marks, counters) on the way back',
    ],
    cx: 'Exponential: O(n·2ⁿ) subsets, O(n·n!) permutations',
  },
  {
    name: 'Graphs', icon: '◎',
    gist: 'Model nodes + edges, then BFS (shortest unweighted), DFS (reachability/components), topo sort (dependencies) or Union-Find (connectivity).',
    signals: [
      'Grid of cells → implicit graph, 4-directional neighbours',
      'Islands / regions / components → DFS flood fill or Union-Find',
      'Minimum steps / spreading over time → (multi-source) BFS',
      'Prerequisites / ordering → topological sort, cycle detection',
    ],
    template: {
      cpp: `// BFS on a grid (multi-source: push every source first)
int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
queue<pair<int, int>> q;          // seeded with sources, marked seen
for (int steps = 0; !q.empty(); steps++) {
    for (int i = q.size(); i > 0; i--) {
        auto [r, c] = q.front(); q.pop();
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) continue;
            seen[nr][nc] = true;  // mark when ENQUEUED
            q.push({nr, nc});
        }
    }
}

// Kahn topological sort
vector<int> indeg(n), order;
queue<int> zero;                  // all nodes with indeg 0
while (!zero.empty()) {
    int u = zero.front(); zero.pop();
    order.push_back(u);
    for (int v : adj[u])
        if (--indeg[v] == 0) zero.push(v);
}
// cycle if order.size() < n

// Union-Find
vector<int> parent(n);            // iota(parent.begin(), parent.end(), 0)
int find(int x) {
    while (parent[x] != x) x = parent[x] = parent[parent[x]];
    return x;
}`,
      java: `// BFS on a grid (multi-source: add every source first)
int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
Queue<int[]> q = new ArrayDeque<>();  // seeded with sources, marked seen
for (int steps = 0; !q.isEmpty(); steps++) {
    for (int i = q.size(); i > 0; i--) {
        int[] cell = q.poll();
        for (int[] d : dirs) {
            int nr = cell[0] + d[0], nc = cell[1] + d[1];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) continue;
            seen[nr][nc] = true;      // mark when ENQUEUED
            q.add(new int[]{nr, nc});
        }
    }
}

// Kahn topological sort
Queue<Integer> zero = new ArrayDeque<>();  // all nodes with indeg 0
List<Integer> order = new ArrayList<>();
while (!zero.isEmpty()) {
    int u = zero.poll();
    order.add(u);
    for (int v : adj.get(u))
        if (--indeg[v] == 0) zero.add(v);
}
// cycle if order.size() < n

// Union-Find
int find(int x) {
    while (parent[x] != x) x = parent[x] = parent[parent[x]];
    return x;
}`,
      js: `// BFS on a grid (multi-source: start with every source)
let level = sources; // all marked seen
for (let steps = 0; level.length; steps++) {
  const next = [];
  for (const [r, c] of level) {
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) continue;
      seen[nr][nc] = true; // mark when ENQUEUED
      next.push([nr, nc]);
    }
  }
  level = next;
}

// Kahn topological sort (the order array doubles as the queue)
const order = [];
for (let i = 0; i < n; i++) if (indeg[i] === 0) order.push(i);
for (let h = 0; h < order.length; h++)
  for (const v of adj[order[h]]) if (--indeg[v] === 0) order.push(v);
// cycle if order.length < n

// Union-Find
const parent = Array.from({ length: n }, (_, i) => i);
const find = x => {
  while (parent[x] !== x) x = parent[x] = parent[parent[x]];
  return x;
};`,
    },
    traps: [
      'Mark visited when you ENQUEUE, not when you dequeue',
      'Think in reverse: start from borders/targets (Pacific Atlantic, Surrounded Regions)',
      'Deep recursion on big grids can overflow the stack — use an explicit stack/queue',
      'JS: array.shift() is O(n); use an index pointer or level arrays',
    ],
    cx: 'O(V + E); grid O(R·C)',
  },
  {
    name: 'Advanced Graphs', icon: '⚡',
    gist: 'Weighted shortest paths (Dijkstra / Bellman-Ford), minimum spanning trees (Prim / Kruskal), Eulerian paths.',
    signals: [
      'Non-negative weights, shortest path → Dijkstra',
      'At most K edges / negative weights → Bellman-Ford (K+1 rounds)',
      'Connect all points at min cost → MST',
      'Use every edge exactly once → Hierholzer',
      'Path cost = max edge on path → Dijkstra with max instead of +',
    ],
    template: {
      cpp: `// Dijkstra
vector<int> dist(n, INT_MAX);
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;  // (dist, node)
dist[src] = 0;
pq.push({0, src});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;                  // stale entry
    for (auto [v, w] : adj[u])
        if (d + w < dist[v]) {
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
}

// Bellman-Ford limited to k + 1 edges
vector<int> price(n, INT_MAX);
price[src] = 0;
for (int i = 0; i <= k; i++) {
    vector<int> next = price;                   // copy: no chaining in a round
    for (auto& e : edges)
        if (price[e[0]] != INT_MAX && price[e[0]] + e[2] < next[e[1]])
            next[e[1]] = price[e[0]] + e[2];
    price = next;
}`,
      java: `// Dijkstra
int[] dist = new int[n];
Arrays.fill(dist, Integer.MAX_VALUE);
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);  // {dist, node}
dist[src] = 0;
pq.add(new int[]{0, src});
while (!pq.isEmpty()) {
    int[] top = pq.poll();
    int d = top[0], u = top[1];
    if (d > dist[u]) continue;                  // stale entry
    for (int[] e : adj.get(u))
        if (d + e[1] < dist[e[0]]) {
            dist[e[0]] = d + e[1];
            pq.add(new int[]{dist[e[0]], e[0]});
        }
}

// Bellman-Ford limited to k + 1 edges
int[] price = new int[n];
Arrays.fill(price, Integer.MAX_VALUE);
price[src] = 0;
for (int i = 0; i <= k; i++) {
    int[] next = price.clone();                 // copy: no chaining in a round
    for (int[] e : edges)
        if (price[e[0]] != Integer.MAX_VALUE && price[e[0]] + e[2] < next[e[1]])
            next[e[1]] = price[e[0]] + e[2];
    price = next;
}`,
      js: `// Dijkstra (Heap class from the Heap pattern)
const dist = new Array(n).fill(Infinity);
const pq = new Heap((a, b) => a[0] < b[0]); // [dist, node]
dist[src] = 0;
pq.push([0, src]);
while (pq.size) {
  const [d, u] = pq.pop();
  if (d > dist[u]) continue; // stale entry
  for (const [v, w] of adj[u])
    if (d + w < dist[v]) {
      dist[v] = d + w;
      pq.push([dist[v], v]);
    }
}

// Bellman-Ford limited to k + 1 edges
let price = new Array(n).fill(Infinity);
price[src] = 0;
for (let i = 0; i <= k; i++) {
  const next = [...price]; // copy: no chaining in a round
  for (const [u, v, w] of edges) if (price[u] + w < next[v]) next[v] = price[u] + w;
  price = next;
}`,
    },
    traps: [
      'Skip stale heap entries (d > dist[u])',
      'Dijkstra fails with negative edges',
      'Bellman-Ford with stop limit: relax from a COPY of last round',
      'INT_MAX + w overflows in C++/Java — check for "unreached" first',
    ],
    cx: 'Dijkstra O(E log V); Bellman-Ford O(k·E); Prim O(V²) dense',
  },
  {
    name: '1-D DP', icon: '▤',
    gist: 'Answer for i depends on a few earlier answers. Define the state in words, write the recurrence, then roll variables.',
    signals: [
      '"Number of ways", "min/max cost", "can you reach" over a sequence',
      'Choices at each index (take / skip, 1 or 2 steps)',
      'Brute-force recursion recomputes the same subproblems',
    ],
    template: {
      cpp: `// 1) state: dp[i] = best answer for the prefix up to i
// 2) recurrence  3) base cases  4) iteration order  5) answer
vector<int> dp(n + 1, 0);
for (int i = 1; i <= n; i++)
    dp[i] = max(dp[i - 1], (i >= 2 ? dp[i - 2] : 0) + nums[i - 1]);  // skip vs take

// rolling variables when only the last two matter
int prev2 = 0, prev1 = 0;
for (int x : nums) {
    int cur = max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
}`,
      java: `// 1) state: dp[i] = best answer for the prefix up to i
// 2) recurrence  3) base cases  4) iteration order  5) answer
int[] dp = new int[n + 1];
for (int i = 1; i <= n; i++)
    dp[i] = Math.max(dp[i - 1], (i >= 2 ? dp[i - 2] : 0) + nums[i - 1]);  // skip vs take

// rolling variables when only the last two matter
int prev2 = 0, prev1 = 0;
for (int x : nums) {
    int cur = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
}`,
      js: `// 1) state: dp[i] = best answer for the prefix up to i
// 2) recurrence  3) base cases  4) iteration order  5) answer
const dp = new Array(n + 1).fill(0);
for (let i = 1; i <= n; i++)
  dp[i] = Math.max(dp[i - 1], (i >= 2 ? dp[i - 2] : 0) + nums[i - 1]); // skip vs take

// rolling variables when only the last two matter
let prev2 = 0, prev1 = 0;
for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];`,
    },
    traps: [
      'Say the state definition out loud before coding',
      'Unreachable states: init with ∞ / −∞ (or amount + 1), not 0',
      'Products: track BOTH max and min (negatives flip)',
    ],
    cx: 'O(n) or O(n·choices); O(1) space with rolling vars',
  },
  {
    name: '2-D DP', icon: '▦',
    gist: 'State needs two indices: grid cells, positions in two strings, or (item, capacity) for knapsack.',
    signals: [
      'Two strings → dp[i][j] over prefixes (LCS, edit distance)',
      'Grid paths → dp[r][c] from top/left',
      'Pick items to hit a target → knapsack (0/1 or unbounded)',
      'Stock with states (holding / cooldown) → state machine',
    ],
    template: {
      cpp: `// two strings: dp[i][j] = answer for a[0..i), b[0..j)
vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1
                                        : max(dp[i - 1][j], dp[i][j - 1]);

// knapsack in 1-D: 0/1 -> capacity DOWN; unbounded -> capacity UP
for (int x : items)
    for (int c = target; c >= x; c--)          // 0/1
        dp1[c] = dp1[c] || dp1[c - x];`,
      java: `// two strings: dp[i][j] = answer for a[0..i), b[0..j)
int[][] dp = new int[n + 1][m + 1];
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);

// knapsack in 1-D: 0/1 -> capacity DOWN; unbounded -> capacity UP
for (int x : items)
    for (int c = target; c >= x; c--)          // 0/1
        dp1[c] = dp1[c] || dp1[c - x];`,
      js: `// two strings: dp[i][j] = answer for a[0..i), b[0..j)
const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
for (let i = 1; i <= n; i++)
  for (let j = 1; j <= m; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

// knapsack in 1-D: 0/1 -> capacity DOWN; unbounded -> capacity UP
for (const x of items)
  for (let c = target; c >= x; c--) // 0/1
    dp1[c] = dp1[c] || dp1[c - x];`,
    },
    traps: [
      'Off-by-one: dp has size n+1 so row/col 0 is the empty prefix',
      'Combinations vs permutations: coins in OUTER loop = combinations',
      'Counts can overflow int — use long (Java) / long long or unsigned (C++)',
      'JS: new Array(n).fill([]) shares ONE row — use Array.from',
    ],
    cx: 'O(n·m) time; often O(m) space with one row',
  },
  {
    name: 'Greedy', icon: '✓',
    gist: 'Make the locally best choice and argue (exchange argument) that it never hurts the global answer.',
    signals: [
      'Max subarray, reachability, "minimum number of jumps"',
      'Sort, then always take the earliest-ending / smallest / cheapest',
      'A running total that resets when it goes negative',
    ],
    template: {
      cpp: `// Kadane
int cur = nums[0], best = nums[0];
for (int i = 1; i < n; i++) {
    cur = max(nums[i], cur + nums[i]);
    best = max(best, cur);
}

// farthest reach
int reach = 0;
for (int i = 0; i < n; i++) {
    if (i > reach) return false;
    reach = max(reach, i + nums[i]);
}`,
      java: `// Kadane
int cur = nums[0], best = nums[0];
for (int i = 1; i < n; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
}

// farthest reach
int reach = 0;
for (int i = 0; i < n; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
}`,
      js: `// Kadane
let cur = nums[0], best = nums[0];
for (let i = 1; i < nums.length; i++) {
  cur = Math.max(nums[i], cur + nums[i]);
  best = Math.max(best, cur);
}

// farthest reach
let reach = 0;
for (let i = 0; i < nums.length; i++) {
  if (i > reach) return false;
  reach = Math.max(reach, i + nums[i]);
}`,
    },
    traps: [
      'Greedy needs a proof — try a small counter-example first',
      'If greedy fails, it is usually DP',
    ],
    cx: 'Typically O(n) or O(n log n) with sorting',
  },
  {
    name: 'Intervals', icon: '⟷',
    gist: 'Sort by start (to merge) or by end (to keep the most non-overlapping); sweep line for "how many at once".',
    signals: [
      'Merge / insert overlapping ranges',
      'Min removals to avoid overlap → sort by END, greedy',
      'Max concurrent meetings / capacity → sweep line or min-heap of ends',
    ],
    template: {
      cpp: `sort(iv.begin(), iv.end());                      // by start
vector<vector<int>> merged;
for (auto& x : iv) {
    if (!merged.empty() && x[0] <= merged.back()[1])
        merged.back()[1] = max(merged.back()[1], x[1]);
    else
        merged.push_back(x);
}

// sweep line / difference array: +load at start, -load at end
for (auto& t : trips) { diff[t[1]] += t[0]; diff[t[2]] -= t[0]; }`,
      java: `Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));  // by start
List<int[]> merged = new ArrayList<>();
for (int[] x : iv) {
    if (!merged.isEmpty() && x[0] <= merged.get(merged.size() - 1)[1])
        merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], x[1]);
    else
        merged.add(x);
}

// sweep line / difference array: +load at start, -load at end
for (int[] t : trips) { diff[t[1]] += t[0]; diff[t[2]] -= t[0]; }`,
      js: `iv.sort((a, b) => a[0] - b[0]); // by start
const merged = [];
for (const [s, e] of iv) {
  const last = merged[merged.length - 1];
  if (last && s <= last[1]) last[1] = Math.max(last[1], e);
  else merged.push([s, e]);
}

// sweep line / difference array: +load at start, -load at end
for (const [p, from, to] of trips) { diff[from] += p; diff[to] -= p; }`,
    },
    traps: [
      'Touching endpoints: is [1,2] and [2,3] an overlap? Read the problem',
      'Sweep ties: process ends before starts when ends are exclusive',
    ],
    cx: 'O(n log n) for the sort',
  },
  {
    name: 'Math & Geometry', icon: '∑',
    gist: 'Matrix index tricks and simulation with clean boundaries; cycle detection on number sequences.',
    signals: [
      'Rotate / spiral / mark a matrix in place',
      'Repeating digit transformation → cycle detection',
    ],
    template: {
      cpp: `// rotate 90° clockwise in place = transpose + reverse rows
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++) swap(m[i][j], m[j][i]);
for (auto& row : m) reverse(row.begin(), row.end());

// spiral: shrink four boundaries
int top = 0, bottom = R - 1, left = 0, right = C - 1;`,
      java: `// rotate 90° clockwise in place = transpose + reverse rows
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++) {
        int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t;
    }
for (int[] row : m)
    for (int l = 0, r = n - 1; l < r; l++, r--) {
        int t = row[l]; row[l] = row[r]; row[r] = t;
    }

// spiral: shrink four boundaries
int top = 0, bottom = R - 1, left = 0, right = C - 1;`,
      js: `// rotate 90° clockwise in place = transpose + reverse rows
for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++) [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
for (const row of m) row.reverse();

// spiral: shrink four boundaries
let top = 0, bottom = R - 1, left = 0, right = C - 1;`,
    },
    traps: [
      'Spiral: re-check top<=bottom / left<=right before the 3rd and 4th edges',
      'O(1) space marking: use first row/col as flags, handle them last',
    ],
    cx: 'O(R·C) for matrix problems',
  },
  {
    name: 'Bit Manipulation', icon: '⊕',
    gist: 'XOR cancels pairs, n & (n-1) drops the lowest set bit, shifts walk the bits.',
    signals: [
      'Every element appears twice except one → XOR all',
      'Count set bits, powers of two, missing number',
      'O(1) extra space required on counting problems',
    ],
    template: {
      cpp: `x ^ x == 0;  x ^ 0 == x;      // XOR cancels pairs
n & (n - 1);                    // clear the lowest set bit
n & -n;                         // isolate the lowest set bit
(n >> i) & 1;                   // i-th bit
bits[i] = bits[i >> 1] + (i & 1);
__builtin_popcount(n);          // count set bits (GCC/Clang)
uint32_t u = n;                 // use unsigned for bit reversal / shifts`,
      java: `x ^ x == 0;  x ^ 0 == x;      // XOR cancels pairs
n & (n - 1);                    // clear the lowest set bit
n & -n;                         // isolate the lowest set bit
(n >> i) & 1;                   // i-th bit
bits[i] = bits[i >> 1] + (i & 1);
Integer.bitCount(n);            // count set bits
n >>> 1;                        // UNSIGNED right shift (>> keeps the sign)`,
      js: `x ^ x === 0; x ^ 0 === x; // XOR cancels pairs
n & (n - 1); // clear the lowest set bit
n & -n; // isolate the lowest set bit
(n >> i) & 1; // i-th bit
bits[i] = bits[i >> 1] + (i & 1);
n >>> 1; // UNSIGNED right shift
result >>> 0; // read a 32-bit result as unsigned`,
    },
    traps: [
      'Bit ops work on 32-bit ints: mind signed vs unsigned (Java/JS >>> vs >>)',
      'Operator precedence: == binds tighter than & in C++/Java — wrap bit ops in parentheses',
    ],
    cx: 'O(1) per op; O(32) per number',
  },
];
