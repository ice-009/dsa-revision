// Week 6 — Graphs.

// @@ 89
class Solution {
    public int numIslands(char[][] grid) {

        int rows = grid.length;
        int cols = grid[0].length;
        int count = 0;

        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {

                if (grid[r][c] != '1') {
                    continue;
                }

                count++;

                // sink the whole island with an explicit stack
                Deque<int[]> stack = new ArrayDeque<>();
                stack.push(new int[]{r, c});
                grid[r][c] = '0';

                while (!stack.isEmpty()) {

                    int[] cell = stack.pop();

                    for (int[] dir : dirs) {

                        int nr = cell[0] + dir[0];
                        int nc = cell[1] + dir[1];

                        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                            continue;
                        }

                        if (grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            stack.push(new int[]{nr, nc});
                        }
                    }
                }
            }
        }

        return count;
    }
}

// @@ 90
class Solution {
    private Map<Node, Node> clones = new HashMap<>();  // original -> copy

    public Node cloneGraph(Node node) {

        if (node == null) {
            return null;
        }

        if (clones.containsKey(node)) {
            return clones.get(node);
        }

        Node copy = new Node(node.val);
        clones.put(node, copy);  // store before recursing: handles cycles

        for (Node neighbor : node.neighbors) {
            copy.neighbors.add(cloneGraph(neighbor));
        }

        return copy;
    }
}

// @@ 91
class Solution {
    public int maxAreaOfIsland(int[][] grid) {

        int rows = grid.length;
        int cols = grid[0].length;
        int best = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                best = Math.max(best, area(grid, r, c));
            }
        }

        return best;
    }

    private int area(int[][] grid, int r, int c) {

        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) {
            return 0;
        }

        if (grid[r][c] != 1) {
            return 0;
        }

        grid[r][c] = 0;  // sink

        int total = 1;
        total += area(grid, r + 1, c);
        total += area(grid, r - 1, c);
        total += area(grid, r, c + 1);
        total += area(grid, r, c - 1);

        return total;
    }
}

// @@ 92
class Solution {
    public List<List<Integer>> pacificAtlantic(int[][] heights) {

        int rows = heights.length;
        int cols = heights[0].length;

        boolean[][] pacific = new boolean[rows][cols];
        boolean[][] atlantic = new boolean[rows][cols];

        // top row + bottom row
        for (int c = 0; c < cols; c++) {
            dfs(heights, pacific, 0, c);
            dfs(heights, atlantic, rows - 1, c);
        }

        // left column + right column
        for (int r = 0; r < rows; r++) {
            dfs(heights, pacific, r, 0);
            dfs(heights, atlantic, r, cols - 1);
        }

        List<List<Integer>> result = new ArrayList<>();

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (pacific[r][c] && atlantic[r][c]) {
                    result.add(Arrays.asList(r, c));
                }
            }
        }

        return result;
    }

    private void dfs(int[][] heights, boolean[][] ocean, int r, int c) {

        if (ocean[r][c]) {
            return;
        }

        ocean[r][c] = true;

        int rows = heights.length;
        int cols = heights[0].length;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        for (int[] dir : dirs) {

            int nr = r + dir[0];
            int nc = c + dir[1];

            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                continue;
            }

            // from the ocean we can only climb up (or stay level)
            if (heights[nr][nc] >= heights[r][c]) {
                dfs(heights, ocean, nr, nc);
            }
        }
    }
}

// @@ 93
class Solution {
    public void solve(char[][] board) {

        int rows = board.length;
        int cols = board[0].length;

        for (int r = 0; r < rows; r++) {
            mark(board, r, 0);
            mark(board, r, cols - 1);
        }

        for (int c = 0; c < cols; c++) {
            mark(board, 0, c);
            mark(board, rows - 1, c);
        }

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {

                if (board[r][c] == 'O') {
                    board[r][c] = 'X';
                }

                else if (board[r][c] == 'T') {
                    board[r][c] = 'O';
                }
            }
        }
    }

    private void mark(char[][] board, int r, int c) {

        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) {
            return;
        }

        if (board[r][c] != 'O') {
            return;
        }

        board[r][c] = 'T';  // safe: connected to the border

        mark(board, r + 1, c);
        mark(board, r - 1, c);
        mark(board, r, c + 1);
        mark(board, r, c - 1);
    }
}

// @@ 94
class Solution {
    public int orangesRotting(int[][] grid) {

        int rows = grid.length;
        int cols = grid[0].length;
        int fresh = 0;

        Queue<int[]> queue = new ArrayDeque<>();

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {

                if (grid[r][c] == 2) {
                    queue.add(new int[]{r, c});
                }

                else if (grid[r][c] == 1) {
                    fresh++;
                }
            }
        }

        int minutes = 0;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!queue.isEmpty() && fresh > 0) {

            // one BFS level = one minute
            int size = queue.size();

            for (int i = 0; i < size; i++) {

                int[] cell = queue.poll();

                for (int[] dir : dirs) {

                    int nr = cell[0] + dir[0];
                    int nc = cell[1] + dir[1];

                    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                        continue;
                    }

                    if (grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        queue.add(new int[]{nr, nc});
                    }
                }
            }

            minutes++;
        }

        if (fresh > 0) {
            return -1;
        }

        return minutes;
    }
}

// @@ 95
class Solution {
    public int[][] updateMatrix(int[][] mat) {

        int rows = mat.length;
        int cols = mat[0].length;

        int[][] dist = new int[rows][cols];
        Queue<int[]> queue = new ArrayDeque<>();

        // every zero is a source; everything else starts unvisited (-1)
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {

                if (mat[r][c] == 0) {
                    dist[r][c] = 0;
                    queue.add(new int[]{r, c});
                }

                else {
                    dist[r][c] = -1;
                }
            }
        }

        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!queue.isEmpty()) {

            int[] cell = queue.poll();
            int r = cell[0];
            int c = cell[1];

            for (int[] dir : dirs) {

                int nr = r + dir[0];
                int nc = c + dir[1];

                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                    continue;
                }

                if (dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[r][c] + 1;
                    queue.add(new int[]{nr, nc});
                }
            }
        }

        return dist;
    }
}

// @@ 96
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {

        List<List<Integer>> graph = new ArrayList<>();
        int[] indegree = new int[numCourses];

        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }

        // [course, pre] means pre -> course
        for (int[] prereq : prerequisites) {
            int course = prereq[0];
            int pre = prereq[1];
            graph.get(pre).add(course);
            indegree[course]++;
        }

        Queue<Integer> queue = new ArrayDeque<>();

        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) {
                queue.add(i);
            }
        }

        int taken = 0;

        while (!queue.isEmpty()) {

            int course = queue.poll();
            taken++;

            for (int next : graph.get(course)) {
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue.add(next);
                }
            }
        }

        return taken == numCourses;
    }
}

// @@ 97
class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {

        List<List<Integer>> graph = new ArrayList<>();
        int[] indegree = new int[numCourses];

        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }

        // [course, pre] means pre -> course
        for (int[] prereq : prerequisites) {
            int course = prereq[0];
            int pre = prereq[1];
            graph.get(pre).add(course);
            indegree[course]++;
        }

        Queue<Integer> queue = new ArrayDeque<>();

        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) {
                queue.add(i);
            }
        }

        int[] order = new int[numCourses];
        int taken = 0;

        while (!queue.isEmpty()) {

            int course = queue.poll();
            order[taken] = course;
            taken++;

            for (int next : graph.get(course)) {
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue.add(next);
                }
            }
        }

        // a cycle leaves some courses untaken
        if (taken < numCourses) {
            return new int[0];
        }

        return order;
    }
}

// @@ 98
class Solution {
    private int[] parent;

    public int[] findRedundantConnection(int[][] edges) {

        int n = edges.length;
        parent = new int[n + 1];

        for (int i = 0; i <= n; i++) {
            parent[i] = i;
        }

        for (int[] edge : edges) {

            int rootA = find(edge[0]);
            int rootB = find(edge[1]);

            // already connected: this edge closes a cycle
            if (rootA == rootB) {
                return edge;
            }

            parent[rootA] = rootB;
        }

        return new int[0];
    }

    private int find(int x) {

        while (parent[x] != x) {
            parent[x] = parent[parent[x]];  // path halving
            x = parent[x];
        }

        return x;
    }
}

// @@ 99
class Solution {
    public int findCircleNum(int[][] isConnected) {

        int n = isConnected.length;
        int provinces = 0;

        boolean[] visited = new boolean[n];

        for (int i = 0; i < n; i++) {

            if (visited[i]) {
                continue;
            }

            visited[i] = true;
            dfs(isConnected, visited, i);
            provinces++;
        }

        return provinces;
    }

    private void dfs(int[][] isConnected, boolean[] visited, int city) {

        for (int j = 0; j < isConnected.length; j++) {

            if (isConnected[city][j] == 1 && !visited[j]) {
                visited[j] = true;
                dfs(isConnected, visited, j);
            }
        }
    }
}

// @@ 100
class Solution {
    private int[] parent;

    public int makeConnected(int n, int[][] connections) {

        // not enough cables
        if (connections.length < n - 1) {
            return -1;
        }

        parent = new int[n];

        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }

        int components = n;

        for (int[] cable : connections) {

            int rootA = find(cable[0]);
            int rootB = find(cable[1]);

            if (rootA != rootB) {
                parent[rootA] = rootB;
                components--;
            }
        }

        return components - 1;
    }

    private int find(int x) {

        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }

        return x;
    }
}

// @@ 101
class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {

        Set<String> words = new HashSet<>(wordList);

        if (!words.contains(endWord)) {
            return 0;
        }

        words.add(beginWord);

        // "h*t" -> every word matching that pattern
        Map<String, List<String>> buckets = new HashMap<>();

        for (String word : words) {
            for (int i = 0; i < word.length(); i++) {

                String pattern = word.substring(0, i) + "*" + word.substring(i + 1);

                if (!buckets.containsKey(pattern)) {
                    buckets.put(pattern, new ArrayList<>());
                }

                buckets.get(pattern).add(word);
            }
        }

        Queue<String> queue = new ArrayDeque<>();
        queue.add(beginWord);

        Set<String> visited = new HashSet<>();
        visited.add(beginWord);

        int steps = 1;

        while (!queue.isEmpty()) {

            int size = queue.size();

            for (int k = 0; k < size; k++) {

                String word = queue.poll();

                if (word.equals(endWord)) {
                    return steps;
                }

                for (int i = 0; i < word.length(); i++) {

                    String pattern = word.substring(0, i) + "*" + word.substring(i + 1);

                    for (String next : buckets.get(pattern)) {
                        if (!visited.contains(next)) {
                            visited.add(next);
                            queue.add(next);
                        }
                    }
                }
            }

            steps++;
        }

        return 0;
    }
}
