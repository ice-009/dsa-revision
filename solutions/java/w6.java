// Week 6 — Graphs.

// @@ 89
class Solution {
    public int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length, count = 0;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                count++;
                grid[r][c] = '0';  // sink the whole island with an explicit stack
                Deque<int[]> st = new ArrayDeque<>();
                st.push(new int[]{r, c});
                while (!st.isEmpty()) {
                    int[] cell = st.pop();
                    for (int[] d : dirs) {
                        int ny = cell[0] + d[0], nx = cell[1] + d[1];
                        if (ny >= 0 && nx >= 0 && ny < rows && nx < cols && grid[ny][nx] == '1') {
                            grid[ny][nx] = '0';
                            st.push(new int[]{ny, nx});
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
    private final Map<Node, Node> clones = new HashMap<>();  // original -> copy

    public Node cloneGraph(Node node) {
        if (node == null) return null;
        if (clones.containsKey(node)) return clones.get(node);
        Node copy = new Node(node.val);
        clones.put(node, copy);  // store before recursing: handles cycles
        for (Node nb : node.neighbors) copy.neighbors.add(cloneGraph(nb));
        return copy;
    }
}

// @@ 91
class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        int best = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                best = Math.max(best, area(grid, r, c));
        return best;
    }

    private int area(int[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != 1) return 0;
        grid[r][c] = 0;  // sink
        return 1 + area(grid, r + 1, c) + area(grid, r - 1, c) + area(grid, r, c + 1) + area(grid, r, c - 1);
    }
}

// @@ 92
class Solution {
    private int rows, cols;

    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        rows = heights.length;
        cols = heights[0].length;
        boolean[][] pac = new boolean[rows][cols], atl = new boolean[rows][cols];
        for (int c = 0; c < cols; c++) {
            if (!pac[0][c]) climb(heights, pac, 0, c);
            if (!atl[rows - 1][c]) climb(heights, atl, rows - 1, c);
        }
        for (int r = 0; r < rows; r++) {
            if (!pac[r][0]) climb(heights, pac, r, 0);
            if (!atl[r][cols - 1]) climb(heights, atl, r, cols - 1);
        }
        List<List<Integer>> res = new ArrayList<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (pac[r][c] && atl[r][c]) res.add(List.of(r, c));
        return res;
    }

    private void climb(int[][] h, boolean[][] seen, int r, int c) {
        seen[r][c] = true;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && h[nr][nc] >= h[r][c])
                climb(h, seen, nr, nc);  // water could flow from (nr,nc) down to (r,c)
        }
    }
}

// @@ 93
class Solution {
    public void solve(char[][] board) {
        int rows = board.length, cols = board[0].length;
        for (int r = 0; r < rows; r++) { mark(board, r, 0); mark(board, r, cols - 1); }
        for (int c = 0; c < cols; c++) { mark(board, 0, c); mark(board, rows - 1, c); }
        for (char[] row : board)
            for (int c = 0; c < cols; c++)
                row[c] = row[c] == 'O' ? 'X' : row[c] == 'T' ? 'O' : row[c];
    }

    private void mark(char[][] b, int r, int c) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != 'O') return;
        b[r][c] = 'T';  // safe: connected to the border
        mark(b, r + 1, c); mark(b, r - 1, c); mark(b, r, c + 1); mark(b, r, c - 1);
    }
}

// @@ 94
class Solution {
    public int orangesRotting(int[][] grid) {
        int rows = grid.length, cols = grid[0].length, fresh = 0;
        Queue<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.add(new int[]{r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        int minutes = 0;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty() && fresh > 0) {
            for (int i = q.size(); i > 0; i--) {  // one BFS level = one minute
                int[] cell = q.poll();
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        q.add(new int[]{nr, nc});
                    }
                }
            }
            minutes++;
        }
        return fresh > 0 ? -1 : minutes;
    }
}

// @@ 95
class Solution {
    public int[][] updateMatrix(int[][] mat) {
        int rows = mat.length, cols = mat[0].length;
        int[][] dist = new int[rows][cols];
        Queue<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (mat[r][c] == 0) q.add(new int[]{r, c});  // every zero is a source
                else dist[r][c] = -1;
            }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[cell[0]][cell[1]] + 1;
                    q.add(new int[]{nr, nc});
                }
            }
        }
        return dist;
    }
}

// @@ 96
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) {  // [course, pre] means pre -> course
            adj.get(p[1]).add(p[0]);
            indeg[p[0]]++;
        }
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.add(i);
        int taken = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            taken++;
            for (int v : adj.get(u))
                if (--indeg[v] == 0) q.add(v);
        }
        return taken == numCourses;
    }
}

// @@ 97
class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            indeg[p[0]]++;
        }
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.add(i);
        int[] order = new int[numCourses];
        int taken = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[taken++] = u;
            for (int v : adj.get(u))
                if (--indeg[v] == 0) q.add(v);
        }
        return taken == numCourses ? order : new int[0];  // cycle -> empty
    }
}

// @@ 98
class Solution {
    private int[] parent;

    public int[] findRedundantConnection(int[][] edges) {
        parent = new int[edges.length + 1];
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        for (int[] e : edges) {
            int ra = find(e[0]), rb = find(e[1]);
            if (ra == rb) return e;  // already connected: this edge closes a cycle
            parent[ra] = rb;
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
        int n = isConnected.length, provinces = 0;
        boolean[] seen = new boolean[n];
        for (int i = 0; i < n; i++) {
            if (seen[i]) continue;
            seen[i] = true;
            dfs(isConnected, seen, i);
            provinces++;
        }
        return provinces;
    }

    private void dfs(int[][] g, boolean[] seen, int i) {
        for (int j = 0; j < g.length; j++)
            if (g[i][j] == 1 && !seen[j]) {
                seen[j] = true;
                dfs(g, seen, j);
            }
    }
}

// @@ 100
class Solution {
    private int[] parent;

    public int makeConnected(int n, int[][] connections) {
        if (connections.length < n - 1) return -1;  // not enough cables
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int components = n;
        for (int[] c : connections) {
            int ra = find(c[0]), rb = find(c[1]);
            if (ra != rb) {
                parent[ra] = rb;
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
        if (!words.contains(endWord)) return 0;
        words.add(beginWord);
        Map<String, List<String>> buckets = new HashMap<>();  // "h*t" -> words matching it
        for (String w : words)
            for (int i = 0; i < w.length(); i++)
                buckets.computeIfAbsent(w.substring(0, i) + '*' + w.substring(i + 1), k -> new ArrayList<>()).add(w);
        Queue<String> q = new ArrayDeque<>(List.of(beginWord));
        Set<String> seen = new HashSet<>(List.of(beginWord));
        for (int steps = 1; !q.isEmpty(); steps++) {
            for (int k = q.size(); k > 0; k--) {
                String w = q.poll();
                if (w.equals(endWord)) return steps;
                for (int i = 0; i < w.length(); i++)
                    for (String next : buckets.get(w.substring(0, i) + '*' + w.substring(i + 1)))
                        if (seen.add(next)) q.add(next);
            }
        }
        return 0;
    }
}
