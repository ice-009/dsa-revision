// Week 5 — Heap / Priority Queue, Backtracking.

// @@ 73
class KthLargest {
    int k;
    priority_queue<int, vector<int>, greater<int>> heap;  // min-heap of the k largest
public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int x : nums) add(x);
    }

    int add(int val) {
        heap.push(val);
        if ((int)heap.size() > k) heap.pop();
        return heap.top();
    }
};

// @@ 74
class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> heap(stones.begin(), stones.end());  // max-heap
        while (heap.size() > 1) {
            int a = heap.top(); heap.pop();
            int b = heap.top(); heap.pop();
            if (a != b) heap.push(a - b);
        }
        return heap.empty() ? 0 : heap.top();
    }
};

// @@ 75
class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        priority_queue<pair<int, int>> heap;  // max-heap of (distance², index), size k
        for (int i = 0; i < (int)points.size(); i++) {
            int d = points[i][0] * points[i][0] + points[i][1] * points[i][1];
            heap.push({d, i});
            if ((int)heap.size() > k) heap.pop();  // drop the farthest
        }
        vector<vector<int>> res;
        while (!heap.empty()) {
            res.push_back(points[heap.top().second]);
            heap.pop();
        }
        return res;
    }
};

// @@ 76
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> heap;  // min-heap of the k largest
        for (int x : nums) {
            heap.push(x);
            if ((int)heap.size() > k) heap.pop();
        }
        return heap.top();
    }
};

// @@ 77
class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int count[26] = {0};
        for (char t : tasks) count[t - 'A']++;
        int maxF = *max_element(count, count + 26);
        int nMax = 0;
        for (int c : count)
            if (c == maxF) nMax++;
        return max((int)tasks.size(), (maxF - 1) * (n + 1) + nMax);
    }
};

// @@ 78
class Twitter {
    int time = 0;
    unordered_map<int, vector<pair<int, int>>> tweets;  // user -> (time, tweetId), oldest first
    unordered_map<int, unordered_set<int>> follows;
public:
    Twitter() {}

    void postTweet(int userId, int tweetId) {
        tweets[userId].push_back({time++, tweetId});
    }

    vector<int> getNewsFeed(int userId) {
        priority_queue<tuple<int, int, int, int>> heap;  // (time, tweetId, user, index), newest on top
        auto pushLatest = [&](int u) {
            auto& t = tweets[u];
            if (!t.empty()) heap.push({t.back().first, t.back().second, u, (int)t.size() - 1});
        };
        pushLatest(userId);
        for (int f : follows[userId]) pushLatest(f);
        vector<int> feed;
        while (!heap.empty() && feed.size() < 10) {
            auto [t, id, u, i] = heap.top();
            heap.pop();
            feed.push_back(id);
            if (i > 0) heap.push({tweets[u][i - 1].first, tweets[u][i - 1].second, u, i - 1});
        }
        return feed;
    }

    void follow(int followerId, int followeeId) {
        if (followerId != followeeId) follows[followerId].insert(followeeId);
    }

    void unfollow(int followerId, int followeeId) {
        follows[followerId].erase(followeeId);
    }
};

// @@ 79
class MedianFinder {
    priority_queue<int> low;                             // max-heap: smaller half
    priority_queue<int, vector<int>, greater<int>> high;  // min-heap: larger half
public:
    MedianFinder() {}

    void addNum(int num) {
        low.push(num);
        high.push(low.top());  // keep every low <= every high
        low.pop();
        if (high.size() > low.size()) {  // low may hold one extra
            low.push(high.top());
            high.pop();
        }
    }

    double findMedian() {
        if (low.size() > high.size()) return low.top();
        return (low.top() + (double)high.top()) / 2.0;
    }
};

// @@ 81
class Solution {
    vector<vector<int>> res;
    vector<int> path;
    void bt(vector<int>& nums, int start) {
        res.push_back(path);  // every node is a subset
        for (int i = start; i < (int)nums.size(); i++) {
            path.push_back(nums[i]);
            bt(nums, i + 1);
            path.pop_back();
        }
    }
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        bt(nums, 0);
        return res;
    }
};

// @@ 82
class Solution {
    vector<vector<int>> res;
    vector<int> path;
    void bt(vector<int>& cand, int start, int remaining) {
        if (remaining == 0) {
            res.push_back(path);
            return;
        }
        for (int i = start; i < (int)cand.size(); i++) {
            if (cand[i] > remaining) break;  // sorted, so nothing later fits either
            path.push_back(cand[i]);
            bt(cand, i, remaining - cand[i]);  // i, not i + 1: reuse allowed
            path.pop_back();
        }
    }
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        bt(candidates, 0, target);
        return res;
    }
};

// @@ 83
class Solution {
    vector<vector<int>> res;
    vector<int> path;
    vector<bool> used;
    void bt(vector<int>& nums) {
        if (path.size() == nums.size()) {
            res.push_back(path);
            return;
        }
        for (int i = 0; i < (int)nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            path.push_back(nums[i]);
            bt(nums);
            path.pop_back();
            used[i] = false;
        }
    }
public:
    vector<vector<int>> permute(vector<int>& nums) {
        used.assign(nums.size(), false);
        bt(nums);
        return res;
    }
};

// @@ 84
class Solution {
    vector<vector<int>> res;
    vector<int> path;
    void bt(vector<int>& nums, int start) {
        res.push_back(path);
        for (int i = start; i < (int)nums.size(); i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;  // same value at the same depth
            path.push_back(nums[i]);
            bt(nums, i + 1);
            path.pop_back();
        }
    }
public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        bt(nums, 0);
        return res;
    }
};

// @@ 85
class Solution {
    bool dfs(vector<vector<char>>& board, const string& word, int r, int c, int i) {
        if (i == (int)word.size()) return true;
        if (r < 0 || c < 0 || r >= (int)board.size() || c >= (int)board[0].size() || board[r][c] != word[i])
            return false;
        board[r][c] = '#';  // mark visited
        bool found = dfs(board, word, r + 1, c, i + 1) || dfs(board, word, r - 1, c, i + 1) ||
                     dfs(board, word, r, c + 1, i + 1) || dfs(board, word, r, c - 1, i + 1);
        board[r][c] = word[i];  // restore
        return found;
    }
public:
    bool exist(vector<vector<char>>& board, string word) {
        for (int r = 0; r < (int)board.size(); r++)
            for (int c = 0; c < (int)board[0].size(); c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }
};

// @@ 86
class Solution {
    vector<vector<string>> res;
    vector<string> path;
    bool isPal(const string& s, int l, int r) {
        while (l < r)
            if (s[l++] != s[r--]) return false;
        return true;
    }
    void bt(const string& s, int start) {
        if (start == (int)s.size()) {
            res.push_back(path);
            return;
        }
        for (int end = start; end < (int)s.size(); end++) {
            if (!isPal(s, start, end)) continue;
            path.push_back(s.substr(start, end - start + 1));
            bt(s, end + 1);
            path.pop_back();
        }
    }
public:
    vector<vector<string>> partition(string s) {
        bt(s, 0);
        return res;
    }
};

// @@ 87
class Solution {
    vector<vector<string>> res;
    vector<string> board;
    unordered_set<int> cols, diag, anti;  // diag = r - c, anti = r + c
    void bt(int r, int n) {
        if (r == n) {
            res.push_back(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols.count(c) || diag.count(r - c) || anti.count(r + c)) continue;
            cols.insert(c); diag.insert(r - c); anti.insert(r + c);
            board[r][c] = 'Q';
            bt(r + 1, n);
            board[r][c] = '.';
            cols.erase(c); diag.erase(r - c); anti.erase(r + c);
        }
    }
public:
    vector<vector<string>> solveNQueens(int n) {
        board.assign(n, string(n, '.'));
        bt(0, n);
        return res;
    }
};
