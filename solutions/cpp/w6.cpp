// Week 6 — Graphs.

// @@ 89
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), count = 0;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                count++;
                grid[r][c] = '0';  // sink the whole island with an explicit stack
                vector<pair<int, int>> st{{r, c}};
                while (!st.empty()) {
                    auto [y, x] = st.back();
                    st.pop_back();
                    for (int d = 0; d < 4; d++) {
                        int ny = y + dr[d], nx = x + dc[d];
                        if (ny >= 0 && nx >= 0 && ny < rows && nx < cols && grid[ny][nx] == '1') {
                            grid[ny][nx] = '0';
                            st.push_back({ny, nx});
                        }
                    }
                }
            }
        }
        return count;
    }
};

// @@ 90
class Solution {
    unordered_map<Node*, Node*> clones;  // original -> copy
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        if (clones.count(node)) return clones[node];
        Node* copy = new Node(node->val);
        clones[node] = copy;  // store before recursing: handles cycles
        for (Node* nb : node->neighbors) copy->neighbors.push_back(cloneGraph(nb));
        return copy;
    }
};

// @@ 91
class Solution {
    int area(vector<vector<int>>& grid, int r, int c) {
        if (r < 0 || c < 0 || r >= (int)grid.size() || c >= (int)grid[0].size() || grid[r][c] != 1) return 0;
        grid[r][c] = 0;  // sink
        return 1 + area(grid, r + 1, c) + area(grid, r - 1, c) + area(grid, r, c + 1) + area(grid, r, c - 1);
    }
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int best = 0;
        for (int r = 0; r < (int)grid.size(); r++)
            for (int c = 0; c < (int)grid[0].size(); c++)
                best = max(best, area(grid, r, c));
        return best;
    }
};

// @@ 92
class Solution {
    int rows, cols;
    void climb(vector<vector<int>>& h, vector<vector<bool>>& seen, int r, int c) {
        seen[r][c] = true;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && h[nr][nc] >= h[r][c])
                climb(h, seen, nr, nc);  // water could flow from (nr,nc) down to (r,c)
        }
    }
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        rows = heights.size();
        cols = heights[0].size();
        vector<vector<bool>> pac(rows, vector<bool>(cols)), atl(rows, vector<bool>(cols));
        for (int c = 0; c < cols; c++) {
            if (!pac[0][c]) climb(heights, pac, 0, c);
            if (!atl[rows - 1][c]) climb(heights, atl, rows - 1, c);
        }
        for (int r = 0; r < rows; r++) {
            if (!pac[r][0]) climb(heights, pac, r, 0);
            if (!atl[r][cols - 1]) climb(heights, atl, r, cols - 1);
        }
        vector<vector<int>> res;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (pac[r][c] && atl[r][c]) res.push_back({r, c});
        return res;
    }
};

// @@ 93
class Solution {
    void mark(vector<vector<char>>& b, int r, int c) {
        if (r < 0 || c < 0 || r >= (int)b.size() || c >= (int)b[0].size() || b[r][c] != 'O') return;
        b[r][c] = 'T';  // safe: connected to the border
        mark(b, r + 1, c); mark(b, r - 1, c); mark(b, r, c + 1); mark(b, r, c - 1);
    }
public:
    void solve(vector<vector<char>>& board) {
        int rows = board.size(), cols = board[0].size();
        for (int r = 0; r < rows; r++) { mark(board, r, 0); mark(board, r, cols - 1); }
        for (int c = 0; c < cols; c++) { mark(board, 0, c); mark(board, rows - 1, c); }
        for (auto& row : board)
            for (char& ch : row) ch = ch == 'O' ? 'X' : ch == 'T' ? 'O' : ch;
    }
};

// @@ 94
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), fresh = 0;
        queue<pair<int, int>> q;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.push({r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        int minutes = 0, dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty() && fresh) {
            for (int i = q.size(); i > 0; i--) {  // one BFS level = one minute
                auto [r, c] = q.front();
                q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        q.push({nr, nc});
                    }
                }
            }
            minutes++;
        }
        return fresh ? -1 : minutes;
    }
};

// @@ 95
class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int rows = mat.size(), cols = mat[0].size();
        vector<vector<int>> dist(rows, vector<int>(cols, -1));
        queue<pair<int, int>> q;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (mat[r][c] == 0) {
                    dist[r][c] = 0;
                    q.push({r, c});  // every zero is a source
                }
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r, c] = q.front();
            q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[r][c] + 1;
                    q.push({nr, nc});
                }
            }
        }
        return dist;
    }
};

// @@ 96
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) {  // [course, pre] means pre -> course
            adj[p[1]].push_back(p[0]);
            indeg[p[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.push(i);
        int taken = 0;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            taken++;
            for (int v : adj[u])
                if (--indeg[v] == 0) q.push(v);
        }
        return taken == numCourses;
    }
};

// @@ 97
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indeg(numCourses, 0), order;
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            indeg[p[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.push(i);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            order.push_back(u);
            for (int v : adj[u])
                if (--indeg[v] == 0) q.push(v);
        }
        if ((int)order.size() < numCourses) return {};  // cycle
        return order;
    }
};

// @@ 98
class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];  // path halving
            x = parent[x];
        }
        return x;
    }
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        parent.resize(edges.size() + 1);
        iota(parent.begin(), parent.end(), 0);
        for (auto& e : edges) {
            int ra = find(e[0]), rb = find(e[1]);
            if (ra == rb) return e;  // already connected: this edge closes a cycle
            parent[ra] = rb;
        }
        return {};
    }
};

// @@ 99
class Solution {
    void dfs(vector<vector<int>>& g, vector<bool>& seen, int i) {
        for (int j = 0; j < (int)g.size(); j++)
            if (g[i][j] && !seen[j]) {
                seen[j] = true;
                dfs(g, seen, j);
            }
    }
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size(), provinces = 0;
        vector<bool> seen(n, false);
        for (int i = 0; i < n; i++) {
            if (seen[i]) continue;
            seen[i] = true;
            dfs(isConnected, seen, i);
            provinces++;
        }
        return provinces;
    }
};

// @@ 100
class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
public:
    int makeConnected(int n, vector<vector<int>>& connections) {
        if ((int)connections.size() < n - 1) return -1;  // not enough cables
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        int components = n;
        for (auto& c : connections) {
            int ra = find(c[0]), rb = find(c[1]);
            if (ra != rb) {
                parent[ra] = rb;
                components--;
            }
        }
        return components - 1;
    }
};

// @@ 101
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) return 0;
        unordered_map<string, vector<string>> buckets;  // "h*t" -> words matching it
        words.insert(beginWord);
        for (const string& w : words)
            for (int i = 0; i < (int)w.size(); i++) {
                string key = w;
                key[i] = '*';
                buckets[key].push_back(w);
            }
        queue<string> q;
        q.push(beginWord);
        unordered_set<string> seen{beginWord};
        for (int steps = 1; !q.empty(); steps++) {
            for (int k = q.size(); k > 0; k--) {
                string w = q.front();
                q.pop();
                if (w == endWord) return steps;
                for (int i = 0; i < (int)w.size(); i++) {
                    string key = w;
                    key[i] = '*';
                    for (const string& next : buckets[key])
                        if (seen.insert(next).second) q.push(next);
                }
            }
        }
        return 0;
    }
};
