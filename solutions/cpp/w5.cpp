// Week 5 — Heap / Priority Queue, Backtracking.

// @@ 73
class KthLargest {
    int k;
    priority_queue<int, vector<int>, greater<int>> minHeap;  // holds the k largest values

public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int num : nums) {
            add(num);
        }
    }

    int add(int val) {
        minHeap.push(val);

        if ((int)minHeap.size() > k) {
            minHeap.pop();
        }

        return minHeap.top();
    }
};

// @@ 74
class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {

        priority_queue<int> maxHeap(stones.begin(), stones.end());

        while (maxHeap.size() > 1) {

            int first = maxHeap.top();
            maxHeap.pop();

            int second = maxHeap.top();
            maxHeap.pop();

            if (first != second) {
                maxHeap.push(first - second);
            }
        }

        if (maxHeap.empty()) {
            return 0;
        }

        return maxHeap.top();
    }
};

// @@ 75
class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {

        // max-heap of {distance², index}: the farthest point is on top
        priority_queue<pair<int, int>> maxHeap;

        for (int i = 0; i < (int)points.size(); i++) {

            int x = points[i][0];
            int y = points[i][1];
            int dist = x * x + y * y;

            maxHeap.push({dist, i});

            if ((int)maxHeap.size() > k) {
                maxHeap.pop();
            }
        }

        vector<vector<int>> ans;

        while (!maxHeap.empty()) {
            int index = maxHeap.top().second;
            maxHeap.pop();

            ans.push_back(points[index]);
        }

        return ans;
    }
};

// @@ 76
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {

        priority_queue<int, vector<int>, greater<int>> minHeap;  // holds the k largest values

        for (int num : nums) {
            minHeap.push(num);

            if ((int)minHeap.size() > k) {
                minHeap.pop();
            }
        }

        return minHeap.top();
    }
};

// @@ 77
class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {

        int count[26] = {0};

        for (char task : tasks) {
            count[task - 'A']++;
        }

        int maxFreq = 0;

        for (int i = 0; i < 26; i++) {
            maxFreq = max(maxFreq, count[i]);
        }

        int maxCount = 0;

        for (int i = 0; i < 26; i++) {
            if (count[i] == maxFreq) {
                maxCount++;
            }
        }

        int frames = (maxFreq - 1) * (n + 1) + maxCount;

        return max((int)tasks.size(), frames);
    }
};

// @@ 78
class Twitter {
    int time = 0;
    unordered_map<int, vector<pair<int, int>>> tweets;  // user -> {time, tweetId}, oldest first
    unordered_map<int, unordered_set<int>> follows;

public:
    Twitter() {}

    void postTweet(int userId, int tweetId) {
        tweets[userId].push_back({time, tweetId});
        time++;
    }

    vector<int> getNewsFeed(int userId) {

        // each entry: {time, tweetId, user, index}, newest on top
        priority_queue<vector<int>> maxHeap;

        vector<int> users;
        users.push_back(userId);

        for (int followee : follows[userId]) {
            users.push_back(followee);
        }

        for (int user : users) {
            vector<pair<int, int>>& list = tweets[user];

            if (!list.empty()) {
                int index = list.size() - 1;
                maxHeap.push({list[index].first, list[index].second, user, index});
            }
        }

        vector<int> feed;

        while (!maxHeap.empty() && feed.size() < 10) {

            vector<int> top = maxHeap.top();
            maxHeap.pop();

            int tweetId = top[1];
            int user = top[2];
            int index = top[3];

            feed.push_back(tweetId);

            if (index > 0) {
                pair<int, int>& older = tweets[user][index - 1];
                maxHeap.push({older.first, older.second, user, index - 1});
            }
        }

        return feed;
    }

    void follow(int followerId, int followeeId) {
        if (followerId != followeeId) {
            follows[followerId].insert(followeeId);
        }
    }

    void unfollow(int followerId, int followeeId) {
        follows[followerId].erase(followeeId);
    }
};

// @@ 79
class MedianFinder {
    priority_queue<int> low;                              // max-heap: smaller half
    priority_queue<int, vector<int>, greater<int>> high;  // min-heap: larger half

public:
    MedianFinder() {}

    void addNum(int num) {

        low.push(num);

        // move the biggest of low into high, so every low <= every high
        high.push(low.top());
        low.pop();

        // low may hold one extra, never high
        if (high.size() > low.size()) {
            low.push(high.top());
            high.pop();
        }
    }

    double findMedian() {
        if (low.size() > high.size()) {
            return low.top();
        }

        return (low.top() + (double)high.top()) / 2.0;
    }
};

// @@ 81
class Solution {
    vector<vector<int>> res;
    vector<int> path;

    void backtrack(vector<int>& nums, int start) {

        res.push_back(path);  // every node is a subset

        for (int i = start; i < (int)nums.size(); i++) {

            path.push_back(nums[i]);

            backtrack(nums, i + 1);

            path.pop_back();
        }
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        backtrack(nums, 0);
        return res;
    }
};

// @@ 82
class Solution {
    vector<vector<int>> res;
    vector<int> path;

    void backtrack(vector<int>& candidates, int start, int remaining) {

        if (remaining == 0) {
            res.push_back(path);
            return;
        }

        for (int i = start; i < (int)candidates.size(); i++) {

            // sorted, so nothing after this fits either
            if (candidates[i] > remaining) {
                break;
            }

            path.push_back(candidates[i]);

            backtrack(candidates, i, remaining - candidates[i]);  // i, not i + 1: reuse allowed

            path.pop_back();
        }
    }

public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        backtrack(candidates, 0, target);
        return res;
    }
};

// @@ 83
class Solution {
    vector<vector<int>> res;
    vector<int> path;
    vector<bool> used;

    void backtrack(vector<int>& nums) {

        if (path.size() == nums.size()) {
            res.push_back(path);
            return;
        }

        for (int i = 0; i < (int)nums.size(); i++) {

            if (used[i]) {
                continue;
            }

            used[i] = true;
            path.push_back(nums[i]);

            backtrack(nums);

            path.pop_back();
            used[i] = false;
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        used.assign(nums.size(), false);
        backtrack(nums);
        return res;
    }
};

// @@ 84
class Solution {
    vector<vector<int>> res;
    vector<int> path;

    void backtrack(vector<int>& nums, int start) {

        res.push_back(path);

        for (int i = start; i < (int)nums.size(); i++) {

            // skip the same value at the same depth
            if (i > start && nums[i] == nums[i - 1]) {
                continue;
            }

            path.push_back(nums[i]);

            backtrack(nums, i + 1);

            path.pop_back();
        }
    }

public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        backtrack(nums, 0);
        return res;
    }
};

// @@ 85
class Solution {
    bool dfs(vector<vector<char>>& board, string& word, int r, int c, int i) {

        if (i == (int)word.size()) {
            return true;
        }

        if (r < 0 || c < 0 || r >= (int)board.size() || c >= (int)board[0].size()) {
            return false;
        }

        if (board[r][c] != word[i]) {
            return false;
        }

        board[r][c] = '#';  // mark visited

        bool found = dfs(board, word, r + 1, c, i + 1)
                  || dfs(board, word, r - 1, c, i + 1)
                  || dfs(board, word, r, c + 1, i + 1)
                  || dfs(board, word, r, c - 1, i + 1);

        board[r][c] = word[i];  // restore

        return found;
    }

public:
    bool exist(vector<vector<char>>& board, string word) {

        for (int r = 0; r < (int)board.size(); r++) {
            for (int c = 0; c < (int)board[0].size(); c++) {
                if (dfs(board, word, r, c, 0)) {
                    return true;
                }
            }
        }

        return false;
    }
};

// @@ 86
class Solution {
    vector<vector<string>> res;
    vector<string> path;

    bool isPalindrome(string& s, int left, int right) {
        while (left < right) {
            if (s[left] != s[right]) {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }

    void backtrack(string& s, int start) {

        if (start == (int)s.size()) {
            res.push_back(path);
            return;
        }

        for (int end = start; end < (int)s.size(); end++) {

            if (!isPalindrome(s, start, end)) {
                continue;
            }

            path.push_back(s.substr(start, end - start + 1));

            backtrack(s, end + 1);

            path.pop_back();
        }
    }

public:
    vector<vector<string>> partition(string s) {
        backtrack(s, 0);
        return res;
    }
};

// @@ 87
class Solution {
    vector<vector<string>> res;
    vector<string> board;
    unordered_set<int> cols;
    unordered_set<int> diag;  // r - c
    unordered_set<int> anti;  // r + c

    void backtrack(int r, int n) {

        if (r == n) {
            res.push_back(board);
            return;
        }

        for (int c = 0; c < n; c++) {

            if (cols.count(c) || diag.count(r - c) || anti.count(r + c)) {
                continue;
            }

            cols.insert(c);
            diag.insert(r - c);
            anti.insert(r + c);
            board[r][c] = 'Q';

            backtrack(r + 1, n);

            board[r][c] = '.';
            cols.erase(c);
            diag.erase(r - c);
            anti.erase(r + c);
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        board.assign(n, string(n, '.'));
        backtrack(0, n);
        return res;
    }
};
