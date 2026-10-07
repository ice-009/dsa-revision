// Week 5 — Heap / Priority Queue, Backtracking.

// @@ 73
class KthLargest {
    private int k;
    private PriorityQueue<Integer> minHeap = new PriorityQueue<>();  // holds the k largest values

    public KthLargest(int k, int[] nums) {
        this.k = k;

        for (int num : nums) {
            add(num);
        }
    }

    public int add(int val) {
        minHeap.add(val);

        if (minHeap.size() > k) {
            minHeap.poll();
        }

        return minHeap.peek();
    }
}

// @@ 74
class Solution {
    public int lastStoneWeight(int[] stones) {

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());

        for (int stone : stones) {
            maxHeap.add(stone);
        }

        while (maxHeap.size() > 1) {

            int first = maxHeap.poll();
            int second = maxHeap.poll();

            if (first != second) {
                maxHeap.add(first - second);
            }
        }

        if (maxHeap.isEmpty()) {
            return 0;
        }

        return maxHeap.peek();
    }
}

// @@ 75
class Solution {
    public int[][] kClosest(int[][] points, int k) {

        // max-heap by distance²: the farthest point is on top
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(dist(b), dist(a)));

        for (int[] point : points) {
            maxHeap.add(point);

            if (maxHeap.size() > k) {
                maxHeap.poll();
            }
        }

        int[][] ans = new int[maxHeap.size()][];

        for (int i = 0; i < ans.length; i++) {
            ans[i] = maxHeap.poll();
        }

        return ans;
    }

    private int dist(int[] point) {
        return point[0] * point[0] + point[1] * point[1];
    }
}

// @@ 76
class Solution {
    public int findKthLargest(int[] nums, int k) {

        PriorityQueue<Integer> minHeap = new PriorityQueue<>();  // holds the k largest values

        for (int num : nums) {
            minHeap.add(num);

            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }

        return minHeap.peek();
    }
}

// @@ 77
class Solution {
    public int leastInterval(char[] tasks, int n) {

        int[] count = new int[26];

        for (char task : tasks) {
            count[task - 'A']++;
        }

        int maxFreq = 0;

        for (int i = 0; i < 26; i++) {
            maxFreq = Math.max(maxFreq, count[i]);
        }

        int maxCount = 0;

        for (int i = 0; i < 26; i++) {
            if (count[i] == maxFreq) {
                maxCount++;
            }
        }

        int frames = (maxFreq - 1) * (n + 1) + maxCount;

        return Math.max(tasks.length, frames);
    }
}

// @@ 78
class Twitter {
    private int time = 0;
    private Map<Integer, List<int[]>> tweets = new HashMap<>();  // user -> {time, tweetId}, oldest first
    private Map<Integer, Set<Integer>> follows = new HashMap<>();

    public Twitter() {}

    public void postTweet(int userId, int tweetId) {
        if (!tweets.containsKey(userId)) {
            tweets.put(userId, new ArrayList<>());
        }

        tweets.get(userId).add(new int[]{time, tweetId});
        time++;
    }

    public List<Integer> getNewsFeed(int userId) {

        // each entry: {time, tweetId, user, index}, newest on top
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> b[0] - a[0]);

        List<Integer> users = new ArrayList<>();
        users.add(userId);

        if (follows.containsKey(userId)) {
            users.addAll(follows.get(userId));
        }

        for (int user : users) {
            List<int[]> list = tweets.get(user);

            if (list != null && !list.isEmpty()) {
                int index = list.size() - 1;
                int[] latest = list.get(index);
                maxHeap.add(new int[]{latest[0], latest[1], user, index});
            }
        }

        List<Integer> feed = new ArrayList<>();

        while (!maxHeap.isEmpty() && feed.size() < 10) {

            int[] top = maxHeap.poll();

            int tweetId = top[1];
            int user = top[2];
            int index = top[3];

            feed.add(tweetId);

            if (index > 0) {
                int[] older = tweets.get(user).get(index - 1);
                maxHeap.add(new int[]{older[0], older[1], user, index - 1});
            }
        }

        return feed;
    }

    public void follow(int followerId, int followeeId) {
        if (followerId == followeeId) {
            return;
        }

        if (!follows.containsKey(followerId)) {
            follows.put(followerId, new HashSet<>());
        }

        follows.get(followerId).add(followeeId);
    }

    public void unfollow(int followerId, int followeeId) {
        if (follows.containsKey(followerId)) {
            follows.get(followerId).remove(followeeId);
        }
    }
}

// @@ 79
class MedianFinder {
    private PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder());  // max-heap: smaller half
    private PriorityQueue<Integer> high = new PriorityQueue<>();                          // min-heap: larger half

    public MedianFinder() {}

    public void addNum(int num) {

        low.add(num);

        // move the biggest of low into high, so every low <= every high
        high.add(low.poll());

        // low may hold one extra, never high
        if (high.size() > low.size()) {
            low.add(high.poll());
        }
    }

    public double findMedian() {
        if (low.size() > high.size()) {
            return low.peek();
        }

        return (low.peek() + (double) high.peek()) / 2.0;
    }
}

// @@ 81
class Solution {
    private List<List<Integer>> res = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        backtrack(nums, 0);
        return res;
    }

    private void backtrack(int[] nums, int start) {

        res.add(new ArrayList<>(path));  // every node is a subset

        for (int i = start; i < nums.length; i++) {

            path.add(nums[i]);

            backtrack(nums, i + 1);

            path.remove(path.size() - 1);
        }
    }
}

// @@ 82
class Solution {
    private List<List<Integer>> res = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        backtrack(candidates, 0, target);
        return res;
    }

    private void backtrack(int[] candidates, int start, int remaining) {

        if (remaining == 0) {
            res.add(new ArrayList<>(path));
            return;
        }

        for (int i = start; i < candidates.length; i++) {

            // sorted, so nothing after this fits either
            if (candidates[i] > remaining) {
                break;
            }

            path.add(candidates[i]);

            backtrack(candidates, i, remaining - candidates[i]);  // i, not i + 1: reuse allowed

            path.remove(path.size() - 1);
        }
    }
}

// @@ 83
class Solution {
    private List<List<Integer>> res = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();
    private boolean[] used;

    public List<List<Integer>> permute(int[] nums) {
        used = new boolean[nums.length];
        backtrack(nums);
        return res;
    }

    private void backtrack(int[] nums) {

        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }

        for (int i = 0; i < nums.length; i++) {

            if (used[i]) {
                continue;
            }

            used[i] = true;
            path.add(nums[i]);

            backtrack(nums);

            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}

// @@ 84
class Solution {
    private List<List<Integer>> res = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        backtrack(nums, 0);
        return res;
    }

    private void backtrack(int[] nums, int start) {

        res.add(new ArrayList<>(path));

        for (int i = start; i < nums.length; i++) {

            // skip the same value at the same depth
            if (i > start && nums[i] == nums[i - 1]) {
                continue;
            }

            path.add(nums[i]);

            backtrack(nums, i + 1);

            path.remove(path.size() - 1);
        }
    }
}

// @@ 85
class Solution {
    public boolean exist(char[][] board, String word) {

        for (int r = 0; r < board.length; r++) {
            for (int c = 0; c < board[0].length; c++) {
                if (dfs(board, word, r, c, 0)) {
                    return true;
                }
            }
        }

        return false;
    }

    private boolean dfs(char[][] board, String word, int r, int c, int i) {

        if (i == word.length()) {
            return true;
        }

        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) {
            return false;
        }

        if (board[r][c] != word.charAt(i)) {
            return false;
        }

        board[r][c] = '#';  // mark visited

        boolean found = dfs(board, word, r + 1, c, i + 1)
                     || dfs(board, word, r - 1, c, i + 1)
                     || dfs(board, word, r, c + 1, i + 1)
                     || dfs(board, word, r, c - 1, i + 1);

        board[r][c] = word.charAt(i);  // restore

        return found;
    }
}

// @@ 86
class Solution {
    private List<List<String>> res = new ArrayList<>();
    private List<String> path = new ArrayList<>();

    public List<List<String>> partition(String s) {
        backtrack(s, 0);
        return res;
    }

    private void backtrack(String s, int start) {

        if (start == s.length()) {
            res.add(new ArrayList<>(path));
            return;
        }

        for (int end = start; end < s.length(); end++) {

            if (!isPalindrome(s, start, end)) {
                continue;
            }

            path.add(s.substring(start, end + 1));

            backtrack(s, end + 1);

            path.remove(path.size() - 1);
        }
    }

    private boolean isPalindrome(String s, int left, int right) {
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }
}

// @@ 87
class Solution {
    private List<List<String>> res = new ArrayList<>();
    private Set<Integer> cols = new HashSet<>();
    private Set<Integer> diag = new HashSet<>();  // r - c
    private Set<Integer> anti = new HashSet<>();  // r + c
    private char[][] board;

    public List<List<String>> solveNQueens(int n) {
        board = new char[n][n];

        for (char[] row : board) {
            Arrays.fill(row, '.');
        }

        backtrack(0, n);
        return res;
    }

    private void backtrack(int r, int n) {

        if (r == n) {
            List<String> rows = new ArrayList<>();

            for (char[] row : board) {
                rows.add(new String(row));
            }

            res.add(rows);
            return;
        }

        for (int c = 0; c < n; c++) {

            if (cols.contains(c) || diag.contains(r - c) || anti.contains(r + c)) {
                continue;
            }

            cols.add(c);
            diag.add(r - c);
            anti.add(r + c);
            board[r][c] = 'Q';

            backtrack(r + 1, n);

            board[r][c] = '.';
            cols.remove(c);
            diag.remove(r - c);
            anti.remove(r + c);
        }
    }
}
