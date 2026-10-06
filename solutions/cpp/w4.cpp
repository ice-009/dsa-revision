// Week 4 — Trees, Tries.

// @@ 55
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* left = invertTree(root->left);
        root->left = invertTree(root->right);
        root->right = left;
        return root;
    }
};

// @@ 56
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};

// @@ 57
class Solution {
    int best = 0;
    int height(TreeNode* node) {
        if (!node) return 0;
        int l = height(node->left), r = height(node->right);
        best = max(best, l + r);  // longest path through this node (edges)
        return 1 + max(l, r);
    }
public:
    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return best;
    }
};

// @@ 58
class Solution {
    int height(TreeNode* node) {  // -1 means "unbalanced"
        if (!node) return 0;
        int l = height(node->left), r = height(node->right);
        if (l == -1 || r == -1 || abs(l - r) > 1) return -1;
        return 1 + max(l, r);
    }
public:
    bool isBalanced(TreeNode* root) {
        return height(root) != -1;
    }
};

// @@ 59
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};

// @@ 60
class Solution {
    bool same(TreeNode* a, TreeNode* b) {
        if (!a && !b) return true;
        if (!a || !b || a->val != b->val) return false;
        return same(a->left, b->left) && same(a->right, b->right);
    }
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if (!subRoot) return true;
        if (!root) return false;
        return same(root, subRoot) || isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
};

// @@ 61
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        TreeNode* node = root;
        while (node) {
            if (p->val < node->val && q->val < node->val) node = node->left;
            else if (p->val > node->val && q->val > node->val) node = node->right;
            else return node;  // they split here
        }
        return nullptr;
    }
};

// @@ 62
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> res;
        if (!root) return res;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            vector<int> level;
            for (int i = q.size(); i > 0; i--) {
                TreeNode* node = q.front();
                q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            res.push_back(level);
        }
        return res;
    }
};

// @@ 63
class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> res;
        if (!root) return res;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            res.push_back(q.back()->val);  // last node of this level
            for (int i = q.size(); i > 0; i--) {
                TreeNode* node = q.front();
                q.pop();
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
        }
        return res;
    }
};

// @@ 64
class Solution {
    bool valid(TreeNode* node, long long low, long long high) {
        if (!node) return true;
        if (node->val <= low || node->val >= high) return false;
        return valid(node->left, low, node->val) && valid(node->right, node->val, high);
    }
public:
    bool isValidBST(TreeNode* root) {
        return valid(root, LLONG_MIN, LLONG_MAX);
    }
};

// @@ 65
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        TreeNode* node = root;
        while (node || !st.empty()) {
            while (node) {  // go as far left as possible
                st.push(node);
                node = node->left;
            }
            node = st.top();
            st.pop();
            if (--k == 0) return node->val;
            node = node->right;
        }
        return -1;
    }
};

// @@ 66
class Solution {
    unordered_map<int, int> index;  // value -> position in inorder
    int pre = 0;
    TreeNode* build(vector<int>& preorder, int lo, int hi) {
        if (lo > hi) return nullptr;
        int val = preorder[pre++];
        TreeNode* node = new TreeNode(val);
        int mid = index[val];
        node->left = build(preorder, lo, mid - 1);
        node->right = build(preorder, mid + 1, hi);
        return node;
    }
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for (int i = 0; i < (int)inorder.size(); i++) index[inorder[i]] = i;
        return build(preorder, 0, inorder.size() - 1);
    }
};

// @@ 67
class Solution {
    int best = INT_MIN;
    int gain(TreeNode* node) {
        if (!node) return 0;
        int l = max(gain(node->left), 0);   // drop negative branches
        int r = max(gain(node->right), 0);
        best = max(best, node->val + l + r);  // path bending at this node
        return node->val + max(l, r);         // parent may use one branch only
    }
public:
    int maxPathSum(TreeNode* root) {
        gain(root);
        return best;
    }
};

// @@ 69
class Trie {
    struct Node {
        Node* child[26] = {};
        bool end = false;
    };
    Node* root = new Node();

    Node* walk(const string& s) {
        Node* node = root;
        for (char c : s) {
            node = node->child[c - 'a'];
            if (!node) return nullptr;
        }
        return node;
    }
public:
    Trie() {}

    void insert(string word) {
        Node* node = root;
        for (char c : word) {
            if (!node->child[c - 'a']) node->child[c - 'a'] = new Node();
            node = node->child[c - 'a'];
        }
        node->end = true;
    }

    bool search(string word) {
        Node* node = walk(word);
        return node && node->end;
    }

    bool startsWith(string prefix) {
        return walk(prefix) != nullptr;
    }
};

// @@ 70
class WordDictionary {
    struct Node {
        Node* child[26] = {};
        bool end = false;
    };
    Node* root = new Node();

    bool dfs(const string& word, int i, Node* node) {
        if (i == (int)word.size()) return node->end;
        char c = word[i];
        if (c == '.') {
            for (Node* next : node->child)
                if (next && dfs(word, i + 1, next)) return true;
            return false;
        }
        Node* next = node->child[c - 'a'];
        return next && dfs(word, i + 1, next);
    }
public:
    WordDictionary() {}

    void addWord(string word) {
        Node* node = root;
        for (char c : word) {
            if (!node->child[c - 'a']) node->child[c - 'a'] = new Node();
            node = node->child[c - 'a'];
        }
        node->end = true;
    }

    bool search(string word) {
        return dfs(word, 0, root);
    }
};

// @@ 71
class Solution {
    struct Node {
        Node* child[26] = {};
        string word;  // non-empty at the end of a word
    };
    vector<string> found;
    int rows, cols;

    void dfs(vector<vector<char>>& board, int r, int c, Node* parent) {
        char ch = board[r][c];
        Node* node = parent->child[ch - 'a'];
        if (!node->word.empty()) {
            found.push_back(node->word);
            node->word.clear();  // record each word once
        }
        board[r][c] = '#';
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
            char next = board[nr][nc];
            if (next != '#' && node->child[next - 'a']) dfs(board, nr, nc, node);
        }
        board[r][c] = ch;
        bool leaf = node->word.empty();
        for (Node* x : node->child) leaf = leaf && !x;
        if (leaf) parent->child[ch - 'a'] = nullptr;  // prune finished branches
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        Node* root = new Node();
        for (const string& w : words) {
            Node* node = root;
            for (char c : w) {
                if (!node->child[c - 'a']) node->child[c - 'a'] = new Node();
                node = node->child[c - 'a'];
            }
            node->word = w;
        }
        rows = board.size();
        cols = board[0].size();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (root->child[board[r][c] - 'a']) dfs(board, r, c, root);
        return found;
    }
};
