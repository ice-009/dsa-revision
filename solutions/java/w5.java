// Week 5 — Heap / Priority Queue, Backtracking.

// @@ 73
class KthLargest {
    private final int k;
    private final PriorityQueue<Integer> heap = new PriorityQueue<>();  // min-heap of the k largest

    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int x : nums) add(x);
    }

    public int add(int val) {
        heap.add(val);
        if (heap.size() > k) heap.poll();
        return heap.peek();
    }
}

// @@ 74
class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());  // max-heap
        for (int s : stones) heap.add(s);
        while (heap.size() > 1) {
            int a = heap.poll(), b = heap.poll();
            if (a != b) heap.add(a - b);
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }
}

// @@ 75
class Solution {
    public int[][] kClosest(int[][] points, int k) {
        // max-heap by distance², size k: the farthest is on top and gets dropped
        PriorityQueue<int[]> heap = new PriorityQueue<>(
            (a, b) -> (b[0] * b[0] + b[1] * b[1]) - (a[0] * a[0] + a[1] * a[1]));
        for (int[] p : points) {
            heap.add(p);
            if (heap.size() > k) heap.poll();
        }
        return heap.toArray(new int[0][]);
    }
}

// @@ 76
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();  // min-heap of the k largest
        for (int x : nums) {
            heap.add(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}

// @@ 77
class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] count = new int[26];
        for (char t : tasks) count[t - 'A']++;
        int maxF = Arrays.stream(count).max().getAsInt();
        int nMax = 0;
        for (int c : count)
            if (c == maxF) nMax++;
        return Math.max(tasks.length, (maxF - 1) * (n + 1) + nMax);
    }
}

// @@ 78
class Twitter {
    private int time = 0;
    private final Map<Integer, List<int[]>> tweets = new HashMap<>();  // user -> {time, tweetId}, oldest first
    private final Map<Integer, Set<Integer>> follows = new HashMap<>();

    public Twitter() {}

    public void postTweet(int userId, int tweetId) {
        tweets.computeIfAbsent(userId, u -> new ArrayList<>()).add(new int[]{time++, tweetId});
    }

    public List<Integer> getNewsFeed(int userId) {
        // max-heap by time of {time, tweetId, user, index}
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        Set<Integer> users = new HashSet<>(follows.getOrDefault(userId, Set.of()));
        users.add(userId);
        for (int u : users) {
            List<int[]> t = tweets.get(u);
            if (t != null && !t.isEmpty()) {
                int[] last = t.get(t.size() - 1);
                heap.add(new int[]{last[0], last[1], u, t.size() - 1});
            }
        }
        List<Integer> feed = new ArrayList<>();
        while (!heap.isEmpty() && feed.size() < 10) {
            int[] top = heap.poll();
            feed.add(top[1]);
            int i = top[3];
            if (i > 0) {
                int[] older = tweets.get(top[2]).get(i - 1);
                heap.add(new int[]{older[0], older[1], top[2], i - 1});
            }
        }
        return feed;
    }

    public void follow(int followerId, int followeeId) {
        if (followerId != followeeId) follows.computeIfAbsent(followerId, u -> new HashSet<>()).add(followeeId);
    }

    public void unfollow(int followerId, int followeeId) {
        Set<Integer> s = follows.get(followerId);
        if (s != null) s.remove(followeeId);
    }
}

// @@ 79
class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder());  // smaller half
    private final PriorityQueue<Integer> high = new PriorityQueue<>();                          // larger half

    public MedianFinder() {}

    public void addNum(int num) {
        low.add(num);
        high.add(low.poll());  // keep every low <= every high
        if (high.size() > low.size()) low.add(high.poll());  // low may hold one extra
    }

    public double findMedian() {
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + (double) high.peek()) / 2.0;
    }
}

// @@ 81
class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        bt(nums, 0);
        return res;
    }

    private void bt(int[] nums, int start) {
        res.add(new ArrayList<>(path));  // every node is a subset
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            bt(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}

// @@ 82
class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        bt(candidates, 0, target);
        return res;
    }

    private void bt(int[] cand, int start, int remaining) {
        if (remaining == 0) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < cand.length; i++) {
            if (cand[i] > remaining) break;  // sorted, so nothing later fits either
            path.add(cand[i]);
            bt(cand, i, remaining - cand[i]);  // i, not i + 1: reuse allowed
            path.remove(path.size() - 1);
        }
    }
}

// @@ 83
class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();
    private boolean[] used;

    public List<List<Integer>> permute(int[] nums) {
        used = new boolean[nums.length];
        bt(nums);
        return res;
    }

    private void bt(int[] nums) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            bt(nums);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}

// @@ 84
class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        bt(nums, 0);
        return res;
    }

    private void bt(int[] nums, int start) {
        res.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;  // same value at the same depth
            path.add(nums[i]);
            bt(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}

// @@ 85
class Solution {
    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }

    private boolean dfs(char[][] board, String word, int r, int c, int i) {
        if (i == word.length()) return true;
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || board[r][c] != word.charAt(i))
            return false;
        board[r][c] = '#';  // mark visited
        boolean found = dfs(board, word, r + 1, c, i + 1) || dfs(board, word, r - 1, c, i + 1)
                || dfs(board, word, r, c + 1, i + 1) || dfs(board, word, r, c - 1, i + 1);
        board[r][c] = word.charAt(i);  // restore
        return found;
    }
}

// @@ 86
class Solution {
    private final List<List<String>> res = new ArrayList<>();
    private final List<String> path = new ArrayList<>();

    public List<List<String>> partition(String s) {
        bt(s, 0);
        return res;
    }

    private void bt(String s, int start) {
        if (start == s.length()) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int end = start; end < s.length(); end++) {
            if (!isPal(s, start, end)) continue;
            path.add(s.substring(start, end + 1));
            bt(s, end + 1);
            path.remove(path.size() - 1);
        }
    }

    private boolean isPal(String s, int l, int r) {
        while (l < r)
            if (s.charAt(l++) != s.charAt(r--)) return false;
        return true;
    }
}

// @@ 87
class Solution {
    private final List<List<String>> res = new ArrayList<>();
    private final Set<Integer> cols = new HashSet<>(), diag = new HashSet<>(), anti = new HashSet<>();
    private char[][] board;

    public List<List<String>> solveNQueens(int n) {
        board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');
        bt(0, n);
        return res;
    }

    private void bt(int r, int n) {
        if (r == n) {
            List<String> rows = new ArrayList<>();
            for (char[] row : board) rows.add(new String(row));
            res.add(rows);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols.contains(c) || diag.contains(r - c) || anti.contains(r + c)) continue;
            cols.add(c); diag.add(r - c); anti.add(r + c);
            board[r][c] = 'Q';
            bt(r + 1, n);
            board[r][c] = '.';
            cols.remove(c); diag.remove(r - c); anti.remove(r + c);
        }
    }
}
