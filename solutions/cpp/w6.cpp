// Week 6 — Graphs.

// @@ 89
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {

        int rows = grid.size();
        int cols = grid[0].size();
        int count = 0;

        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {

                if (grid[r][c] != '1') {
                    continue;
                }

                count++;

                // sink the whole island with an explicit stack
                stack<pair<int, int>> cells;
                cells.push({r, c});
                grid[r][c] = '0';

                while (!cells.empty()) {

                    int row = cells.top().first;
                    int col = cells.top().second;
                    cells.pop();

                    for (int d = 0; d < 4; d++) {

                        int nr = row + dirs[d][0];
                        int nc = col + dirs[d][1];

                        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                            continue;
                        }

                        if (grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            cells.push({nr, nc});
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

        if (node == nullptr) {
            return nullptr;
        }

        if (clones.count(node)) {
            return clones[node];
        }

        Node* copy = new Node(node->val);
        clones[node] = copy;  // store before recursing: handles cycles

        for (Node* neighbor : node->neighbors) {
            copy->neighbors.push_back(cloneGraph(neighbor));
        }

        return copy;
    }
};

// @@ 91
class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {

        int rows = grid.size();
        int cols = grid[0].size();
        int best = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                best = max(best, area(grid, r, c));
            }
        }

        return best;
    }

private:
    int area(vector<vector<int>>& grid, int r, int c) {

        if (r < 0 || c < 0 || r >= (int)grid.size() || c >= (int)grid[0].size()) {
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
};

// @@ 92
class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {

        int rows = heights.size();
        int cols = heights[0].size();

        vector<vector<bool>> pacific(rows, vector<bool>(cols, false));
        vector<vector<bool>> atlantic(rows, vector<bool>(cols, false));

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

        vector<vector<int>> result;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (pacific[r][c] && atlantic[r][c]) {
                    result.push_back({r, c});
                }
            }
        }

        return result;
    }

private:
    void dfs(vector<vector<int>>& heights, vector<vector<bool>>& ocean, int r, int c) {

        if (ocean[r][c]) {
            return;
        }

        ocean[r][c] = true;

        int rows = heights.size();
        int cols = heights[0].size();
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        for (int d = 0; d < 4; d++) {

            int nr = r + dirs[d][0];
            int nc = c + dirs[d][1];

            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                continue;
            }

            // from the ocean we can only climb up (or stay level)
            if (heights[nr][nc] >= heights[r][c]) {
                dfs(heights, ocean, nr, nc);
            }
        }
    }
};

// @@ 93
class Solution {
public:
    void solve(vector<vector<char>>& board) {

        int rows = board.size();
        int cols = board[0].size();

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

private:
    void mark(vector<vector<char>>& board, int r, int c) {

        if (r < 0 || c < 0 || r >= (int)board.size() || c >= (int)board[0].size()) {
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
};

// @@ 94
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {

        int rows = grid.size();
        int cols = grid[0].size();
        int fresh = 0;

        queue<pair<int, int>> queue;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {

                if (grid[r][c] == 2) {
                    queue.push({r, c});
                }

                else if (grid[r][c] == 1) {
                    fresh++;
                }
            }
        }

        int minutes = 0;
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!queue.empty() && fresh > 0) {

            // one BFS level = one minute
            int size = queue.size();

            for (int i = 0; i < size; i++) {

                int r = queue.front().first;
                int c = queue.front().second;
                queue.pop();

                for (int d = 0; d < 4; d++) {

                    int nr = r + dirs[d][0];
                    int nc = c + dirs[d][1];

                    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                        continue;
                    }

                    if (grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        queue.push({nr, nc});
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
};

// @@ 95
class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {

        int rows = mat.size();
        int cols = mat[0].size();

        vector<vector<int>> dist(rows, vector<int>(cols, -1));
        queue<pair<int, int>> queue;

        // every zero is a source
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (mat[r][c] == 0) {
                    dist[r][c] = 0;
                    queue.push({r, c});
                }
            }
        }

        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!queue.empty()) {

            int r = queue.front().first;
            int c = queue.front().second;
            queue.pop();

            for (int d = 0; d < 4; d++) {

                int nr = r + dirs[d][0];
                int nc = c + dirs[d][1];

                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
                    continue;
                }

                if (dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[r][c] + 1;
                    queue.push({nr, nc});
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

        vector<vector<int>> graph(numCourses);
        vector<int> indegree(numCourses, 0);

        // [course, pre] means pre -> course
        for (vector<int>& prereq : prerequisites) {
            int course = prereq[0];
            int pre = prereq[1];
            graph[pre].push_back(course);
            indegree[course]++;
        }

        queue<int> queue;

        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) {
                queue.push(i);
            }
        }

        int taken = 0;

        while (!queue.empty()) {

            int course = queue.front();
            queue.pop();
            taken++;

            for (int next : graph[course]) {
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue.push(next);
                }
            }
        }

        return taken == numCourses;
    }
};

// @@ 97
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {

        vector<vector<int>> graph(numCourses);
        vector<int> indegree(numCourses, 0);

        // [course, pre] means pre -> course
        for (vector<int>& prereq : prerequisites) {
            int course = prereq[0];
            int pre = prereq[1];
            graph[pre].push_back(course);
            indegree[course]++;
        }

        queue<int> queue;

        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) {
                queue.push(i);
            }
        }

        vector<int> order;

        while (!queue.empty()) {

            int course = queue.front();
            queue.pop();
            order.push_back(course);

            for (int next : graph[course]) {
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue.push(next);
                }
            }
        }

        // a cycle leaves some courses untaken
        if ((int)order.size() < numCourses) {
            return {};
        }

        return order;
    }
};

// @@ 98
class Solution {
    vector<int> parent;

public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {

        int n = edges.size();
        parent.resize(n + 1);

        for (int i = 0; i <= n; i++) {
            parent[i] = i;
        }

        for (vector<int>& edge : edges) {

            int rootA = find(edge[0]);
            int rootB = find(edge[1]);

            // already connected: this edge closes a cycle
            if (rootA == rootB) {
                return edge;
            }

            parent[rootA] = rootB;
        }

        return {};
    }

private:
    int find(int x) {

        while (parent[x] != x) {
            parent[x] = parent[parent[x]];  // path halving
            x = parent[x];
        }

        return x;
    }
};

// @@ 99
class Solution {
public:
    int findCircleNum(vector<vector<int>>& isConnected) {

        int n = isConnected.size();
        int provinces = 0;

        vector<bool> visited(n, false);

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

private:
    void dfs(vector<vector<int>>& isConnected, vector<bool>& visited, int city) {

        for (int j = 0; j < (int)isConnected.size(); j++) {

            if (isConnected[city][j] == 1 && !visited[j]) {
                visited[j] = true;
                dfs(isConnected, visited, j);
            }
        }
    }
};

// @@ 100
class Solution {
    vector<int> parent;

public:
    int makeConnected(int n, vector<vector<int>>& connections) {

        // not enough cables
        if ((int)connections.size() < n - 1) {
            return -1;
        }

        parent.resize(n);

        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }

        int components = n;

        for (vector<int>& cable : connections) {

            int rootA = find(cable[0]);
            int rootB = find(cable[1]);

            if (rootA != rootB) {
                parent[rootA] = rootB;
                components--;
            }
        }

        return components - 1;
    }

private:
    int find(int x) {

        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }

        return x;
    }
};

// @@ 101
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {

        unordered_set<string> words(wordList.begin(), wordList.end());

        if (words.count(endWord) == 0) {
            return 0;
        }

        words.insert(beginWord);

        // "h*t" -> every word matching that pattern
        unordered_map<string, vector<string>> buckets;

        for (const string& word : words) {
            for (int i = 0; i < (int)word.size(); i++) {
                string pattern = word;
                pattern[i] = '*';
                buckets[pattern].push_back(word);
            }
        }

        queue<string> queue;
        queue.push(beginWord);

        unordered_set<string> visited;
        visited.insert(beginWord);

        int steps = 1;

        while (!queue.empty()) {

            int size = queue.size();

            for (int k = 0; k < size; k++) {

                string word = queue.front();
                queue.pop();

                if (word == endWord) {
                    return steps;
                }

                for (int i = 0; i < (int)word.size(); i++) {

                    string pattern = word;
                    pattern[i] = '*';

                    for (const string& next : buckets[pattern]) {
                        if (visited.count(next) == 0) {
                            visited.insert(next);
                            queue.push(next);
                        }
                    }
                }
            }

            steps++;
        }

        return 0;
    }
};
