// Week 4 — Trees, Tries.

// @@ 55
class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        root.left = invertTree(root.right);
        root.right = left;
        return root;
    }
}

// @@ 56
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}

// @@ 57
class Solution {
    private int best = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        height(root);
        return best;
    }

    private int height(TreeNode node) {
        if (node == null) return 0;
        int l = height(node.left), r = height(node.right);
        best = Math.max(best, l + r);  // longest path through this node (edges)
        return 1 + Math.max(l, r);
    }
}

// @@ 58
class Solution {
    public boolean isBalanced(TreeNode root) {
        return height(root) != -1;
    }

    private int height(TreeNode node) {  // -1 means "unbalanced"
        if (node == null) return 0;
        int l = height(node.left), r = height(node.right);
        if (l == -1 || r == -1 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }
}

// @@ 59
class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null || p.val != q.val) return false;
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}

// @@ 60
class Solution {
    public boolean isSubtree(TreeNode root, TreeNode subRoot) {
        if (subRoot == null) return true;
        if (root == null) return false;
        return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
    }

    private boolean same(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null || a.val != b.val) return false;
        return same(a.left, b.left) && same(a.right, b.right);
    }
}

// @@ 61
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode node = root;
        while (node != null) {
            if (p.val < node.val && q.val < node.val) node = node.left;
            else if (p.val > node.val && q.val > node.val) node = node.right;
            else return node;  // they split here
        }
        return null;
    }
}

// @@ 62
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int i = q.size(); i > 0; i--) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.add(node.left);
                if (node.right != null) q.add(node.right);
            }
            res.add(level);
        }
        return res;
    }
}

// @@ 63
class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        Deque<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            res.add(q.peekLast().val);  // last node of this level
            for (int i = q.size(); i > 0; i--) {
                TreeNode node = q.poll();
                if (node.left != null) q.add(node.left);
                if (node.right != null) q.add(node.right);
            }
        }
        return res;
    }
}

// @@ 64
class Solution {
    public boolean isValidBST(TreeNode root) {
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean valid(TreeNode node, long low, long high) {
        if (node == null) return true;
        if (node.val <= low || node.val >= high) return false;
        return valid(node.left, low, node.val) && valid(node.right, node.val, high);
    }
}

// @@ 65
class Solution {
    public int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> st = new ArrayDeque<>();
        TreeNode node = root;
        while (node != null || !st.isEmpty()) {
            while (node != null) {  // go as far left as possible
                st.push(node);
                node = node.left;
            }
            node = st.pop();
            if (--k == 0) return node.val;
            node = node.right;
        }
        return -1;
    }
}

// @@ 66
class Solution {
    private final Map<Integer, Integer> index = new HashMap<>();  // value -> position in inorder
    private int pre = 0;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) index.put(inorder[i], i);
        return build(preorder, 0, inorder.length - 1);
    }

    private TreeNode build(int[] preorder, int lo, int hi) {
        if (lo > hi) return null;
        int val = preorder[pre++];
        TreeNode node = new TreeNode(val);
        int mid = index.get(val);
        node.left = build(preorder, lo, mid - 1);
        node.right = build(preorder, mid + 1, hi);
        return node;
    }
}

// @@ 67
class Solution {
    private int best = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        gain(root);
        return best;
    }

    private int gain(TreeNode node) {
        if (node == null) return 0;
        int l = Math.max(gain(node.left), 0);   // drop negative branches
        int r = Math.max(gain(node.right), 0);
        best = Math.max(best, node.val + l + r);  // path bending at this node
        return node.val + Math.max(l, r);         // parent may use one branch only
    }
}

// @@ 69
class Trie {
    private static class Node {
        Node[] child = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    public Trie() {}

    public void insert(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            if (node.child[c - 'a'] == null) node.child[c - 'a'] = new Node();
            node = node.child[c - 'a'];
        }
        node.end = true;
    }

    public boolean search(String word) {
        Node node = walk(word);
        return node != null && node.end;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Node walk(String s) {
        Node node = root;
        for (char c : s.toCharArray()) {
            node = node.child[c - 'a'];
            if (node == null) return null;
        }
        return node;
    }
}

// @@ 70
class WordDictionary {
    private static class Node {
        Node[] child = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    public WordDictionary() {}

    public void addWord(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            if (node.child[c - 'a'] == null) node.child[c - 'a'] = new Node();
            node = node.child[c - 'a'];
        }
        node.end = true;
    }

    public boolean search(String word) {
        return dfs(word, 0, root);
    }

    private boolean dfs(String word, int i, Node node) {
        if (i == word.length()) return node.end;
        char c = word.charAt(i);
        if (c == '.') {
            for (Node next : node.child)
                if (next != null && dfs(word, i + 1, next)) return true;
            return false;
        }
        Node next = node.child[c - 'a'];
        return next != null && dfs(word, i + 1, next);
    }
}

// @@ 71
class Solution {
    private static class Node {
        Node[] child = new Node[26];
        String word;  // set at the end of a word
    }

    private final List<String> found = new ArrayList<>();

    public List<String> findWords(char[][] board, String[] words) {
        Node root = new Node();
        for (String w : words) {
            Node node = root;
            for (char c : w.toCharArray()) {
                if (node.child[c - 'a'] == null) node.child[c - 'a'] = new Node();
                node = node.child[c - 'a'];
            }
            node.word = w;
        }
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (root.child[board[r][c] - 'a'] != null) dfs(board, r, c, root);
        return found;
    }

    private void dfs(char[][] board, int r, int c, Node parent) {
        char ch = board[r][c];
        Node node = parent.child[ch - 'a'];
        if (node.word != null) {
            found.add(node.word);
            node.word = null;  // record each word once
        }
        board[r][c] = '#';
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr < 0 || nc < 0 || nr >= board.length || nc >= board[0].length) continue;
            char next = board[nr][nc];
            if (next != '#' && node.child[next - 'a'] != null) dfs(board, nr, nc, node);
        }
        board[r][c] = ch;
        boolean leaf = node.word == null;
        for (Node x : node.child) leaf = leaf && x == null;
        if (leaf) parent.child[ch - 'a'] = null;  // prune finished branches
    }
}
