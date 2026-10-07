// Week 4 — Trees, Tries.

// @@ 55
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {

        if (root == nullptr) {
            return nullptr;
        }

        TreeNode* left = invertTree(root->left);
        TreeNode* right = invertTree(root->right);

        root->left = right;
        root->right = left;

        return root;
    }
};

// @@ 56
class Solution {
public:
    int maxDepth(TreeNode* root) {

        if (root == nullptr) {
            return 0;
        }

        int left = maxDepth(root->left);
        int right = maxDepth(root->right);

        return 1 + max(left, right);
    }
};

// @@ 57
class Solution {
public:
    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return best;
    }

private:
    int best = 0;

    int height(TreeNode* node) {

        if (node == nullptr) {
            return 0;
        }

        int left = height(node->left);
        int right = height(node->right);

        // longest path through this node, counted in edges
        best = max(best, left + right);

        return 1 + max(left, right);
    }
};

// @@ 58
class Solution {
public:
    bool isBalanced(TreeNode* root) {
        return height(root) != -1;
    }

private:
    // returns -1 if the subtree is unbalanced
    int height(TreeNode* node) {

        if (node == nullptr) {
            return 0;
        }

        int left = height(node->left);
        int right = height(node->right);

        if (left == -1 || right == -1) {
            return -1;
        }

        if (abs(left - right) > 1) {
            return -1;
        }

        return 1 + max(left, right);
    }
};

// @@ 59
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {

        if (p == nullptr && q == nullptr) {
            return true;
        }

        if (p == nullptr || q == nullptr) {
            return false;
        }

        if (p->val != q->val) {
            return false;
        }

        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};

// @@ 60
class Solution {
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {

        if (subRoot == nullptr) {
            return true;
        }

        if (root == nullptr) {
            return false;
        }

        if (same(root, subRoot)) {
            return true;
        }

        return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }

private:
    bool same(TreeNode* a, TreeNode* b) {

        if (a == nullptr && b == nullptr) {
            return true;
        }

        if (a == nullptr || b == nullptr) {
            return false;
        }

        if (a->val != b->val) {
            return false;
        }

        return same(a->left, b->left) && same(a->right, b->right);
    }
};

// @@ 61
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {

        TreeNode* node = root;

        while (node != nullptr) {

            if (p->val < node->val && q->val < node->val) {
                node = node->left;
            }

            else if (p->val > node->val && q->val > node->val) {
                node = node->right;
            }

            else {
                // p and q split here
                return node;
            }
        }

        return nullptr;
    }
};

// @@ 62
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {

        vector<vector<int>> ans;

        if (root == nullptr) {
            return ans;
        }

        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty()) {

            int size = q.size();
            vector<int> level;

            for (int i = 0; i < size; i++) {

                TreeNode* node = q.front();
                q.pop();

                level.push_back(node->val);

                if (node->left != nullptr) {
                    q.push(node->left);
                }

                if (node->right != nullptr) {
                    q.push(node->right);
                }
            }

            ans.push_back(level);
        }

        return ans;
    }
};

// @@ 63
class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {

        vector<int> ans;

        if (root == nullptr) {
            return ans;
        }

        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty()) {

            // the last node in the queue is the rightmost of this level
            ans.push_back(q.back()->val);

            int size = q.size();

            for (int i = 0; i < size; i++) {

                TreeNode* node = q.front();
                q.pop();

                if (node->left != nullptr) {
                    q.push(node->left);
                }

                if (node->right != nullptr) {
                    q.push(node->right);
                }
            }
        }

        return ans;
    }
};

// @@ 64
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return valid(root, LLONG_MIN, LLONG_MAX);
    }

private:
    bool valid(TreeNode* node, long long low, long long high) {

        if (node == nullptr) {
            return true;
        }

        if (node->val <= low || node->val >= high) {
            return false;
        }

        return valid(node->left, low, node->val) && valid(node->right, node->val, high);
    }
};

// @@ 65
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {

        stack<TreeNode*> st;
        TreeNode* node = root;

        while (node != nullptr || !st.empty()) {

            // go as far left as possible
            while (node != nullptr) {
                st.push(node);
                node = node->left;
            }

            node = st.top();
            st.pop();

            k--;

            if (k == 0) {
                return node->val;
            }

            node = node->right;
        }

        return -1;
    }
};

// @@ 66
class Solution {
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {

        for (int i = 0; i < inorder.size(); i++) {
            index[inorder[i]] = i;
        }

        return build(preorder, 0, inorder.size() - 1);
    }

private:
    unordered_map<int, int> index;  // value -> position in inorder
    int preIndex = 0;

    TreeNode* build(vector<int>& preorder, int start, int end) {

        if (start > end) {
            return nullptr;
        }

        int val = preorder[preIndex];
        preIndex++;

        TreeNode* node = new TreeNode(val);
        int mid = index[val];

        node->left = build(preorder, start, mid - 1);
        node->right = build(preorder, mid + 1, end);

        return node;
    }
};

// @@ 67
class Solution {
public:
    int maxPathSum(TreeNode* root) {
        gain(root);
        return best;
    }

private:
    int best = INT_MIN;

    int gain(TreeNode* node) {

        if (node == nullptr) {
            return 0;
        }

        // drop negative branches
        int left = max(gain(node->left), 0);
        int right = max(gain(node->right), 0);

        // path that bends at this node
        best = max(best, node->val + left + right);

        // the parent can use only one branch
        return node->val + max(left, right);
    }
};

// @@ 69
class Trie {
public:
    Trie() {
        root = new Node();
    }

    void insert(string word) {

        Node* node = root;

        for (char ch : word) {

            int i = ch - 'a';

            if (node->children[i] == nullptr) {
                node->children[i] = new Node();
            }

            node = node->children[i];
        }

        node->isEnd = true;
    }

    bool search(string word) {

        Node* node = walk(word);

        return node != nullptr && node->isEnd;
    }

    bool startsWith(string prefix) {
        return walk(prefix) != nullptr;
    }

private:
    struct Node {
        Node* children[26] = {};
        bool isEnd = false;
    };

    Node* root;

    Node* walk(string s) {

        Node* node = root;

        for (char ch : s) {

            node = node->children[ch - 'a'];

            if (node == nullptr) {
                return nullptr;
            }
        }

        return node;
    }
};

// @@ 70
class WordDictionary {
public:
    WordDictionary() {
        root = new Node();
    }

    void addWord(string word) {

        Node* node = root;

        for (char ch : word) {

            int i = ch - 'a';

            if (node->children[i] == nullptr) {
                node->children[i] = new Node();
            }

            node = node->children[i];
        }

        node->isEnd = true;
    }

    bool search(string word) {
        return dfs(word, 0, root);
    }

private:
    struct Node {
        Node* children[26] = {};
        bool isEnd = false;
    };

    Node* root;

    bool dfs(string& word, int i, Node* node) {

        if (i == word.size()) {
            return node->isEnd;
        }

        char ch = word[i];

        // '.' matches any letter: try every child
        if (ch == '.') {

            for (Node* child : node->children) {

                if (child != nullptr && dfs(word, i + 1, child)) {
                    return true;
                }
            }

            return false;
        }

        Node* child = node->children[ch - 'a'];

        if (child == nullptr) {
            return false;
        }

        return dfs(word, i + 1, child);
    }
};

// @@ 71
class Solution {
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {

        Node* root = new Node();

        for (string& word : words) {

            Node* node = root;

            for (char ch : word) {

                int i = ch - 'a';

                if (node->children[i] == nullptr) {
                    node->children[i] = new Node();
                }

                node = node->children[i];
            }

            node->word = word;
        }

        rows = board.size();
        cols = board[0].size();

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {

                if (root->children[board[row][col] - 'a'] != nullptr) {
                    dfs(board, row, col, root);
                }
            }
        }

        return ans;
    }

private:
    struct Node {
        Node* children[26] = {};
        string word;  // non-empty at the end of a word
    };

    vector<string> ans;
    int rows = 0;
    int cols = 0;

    void dfs(vector<vector<char>>& board, int row, int col, Node* parent) {

        char ch = board[row][col];
        Node* node = parent->children[ch - 'a'];

        if (!node->word.empty()) {
            ans.push_back(node->word);
            node->word = "";  // record each word only once
        }

        board[row][col] = '#';

        int dRow[4] = {1, -1, 0, 0};
        int dCol[4] = {0, 0, 1, -1};

        for (int d = 0; d < 4; d++) {

            int newRow = row + dRow[d];
            int newCol = col + dCol[d];

            if (newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols) {
                continue;
            }

            char next = board[newRow][newCol];

            if (next != '#' && node->children[next - 'a'] != nullptr) {
                dfs(board, newRow, newCol, node);
            }
        }

        board[row][col] = ch;

        // prune this trie node once it has no word and no children left
        bool empty = node->word.empty();

        for (Node* child : node->children) {
            if (child != nullptr) {
                empty = false;
            }
        }

        if (empty) {
            parent->children[ch - 'a'] = nullptr;
        }
    }
};
