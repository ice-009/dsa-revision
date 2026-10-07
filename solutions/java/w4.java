// Week 4 — Trees, Tries.

// @@ 55
class Solution {
    public TreeNode invertTree(TreeNode root) {

        if (root == null) {
            return null;
        }

        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);

        root.left = right;
        root.right = left;

        return root;
    }
}

// @@ 56
class Solution {
    public int maxDepth(TreeNode root) {

        if (root == null) {
            return 0;
        }

        int left = maxDepth(root.left);
        int right = maxDepth(root.right);

        return 1 + Math.max(left, right);
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

        if (node == null) {
            return 0;
        }

        int left = height(node.left);
        int right = height(node.right);

        // longest path through this node, counted in edges
        best = Math.max(best, left + right);

        return 1 + Math.max(left, right);
    }
}

// @@ 58
class Solution {
    public boolean isBalanced(TreeNode root) {
        return height(root) != -1;
    }

    // returns -1 if the subtree is unbalanced
    private int height(TreeNode node) {

        if (node == null) {
            return 0;
        }

        int left = height(node.left);
        int right = height(node.right);

        if (left == -1 || right == -1) {
            return -1;
        }

        if (Math.abs(left - right) > 1) {
            return -1;
        }

        return 1 + Math.max(left, right);
    }
}

// @@ 59
class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {

        if (p == null && q == null) {
            return true;
        }

        if (p == null || q == null) {
            return false;
        }

        if (p.val != q.val) {
            return false;
        }

        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}

// @@ 60
class Solution {
    public boolean isSubtree(TreeNode root, TreeNode subRoot) {

        if (subRoot == null) {
            return true;
        }

        if (root == null) {
            return false;
        }

        if (same(root, subRoot)) {
            return true;
        }

        return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
    }

    private boolean same(TreeNode a, TreeNode b) {

        if (a == null && b == null) {
            return true;
        }

        if (a == null || b == null) {
            return false;
        }

        if (a.val != b.val) {
            return false;
        }

        return same(a.left, b.left) && same(a.right, b.right);
    }
}

// @@ 61
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {

        TreeNode node = root;

        while (node != null) {

            if (p.val < node.val && q.val < node.val) {
                node = node.left;
            }

            else if (p.val > node.val && q.val > node.val) {
                node = node.right;
            }

            else {
                // p and q split here
                return node;
            }
        }

        return null;
    }
}

// @@ 62
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {

        List<List<Integer>> ans = new ArrayList<>();

        if (root == null) {
            return ans;
        }

        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);

        while (!queue.isEmpty()) {

            int size = queue.size();
            List<Integer> level = new ArrayList<>();

            for (int i = 0; i < size; i++) {

                TreeNode node = queue.poll();

                level.add(node.val);

                if (node.left != null) {
                    queue.add(node.left);
                }

                if (node.right != null) {
                    queue.add(node.right);
                }
            }

            ans.add(level);
        }

        return ans;
    }
}

// @@ 63
class Solution {
    public List<Integer> rightSideView(TreeNode root) {

        List<Integer> ans = new ArrayList<>();

        if (root == null) {
            return ans;
        }

        ArrayDeque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);

        while (!queue.isEmpty()) {

            // the last node in the queue is the rightmost of this level
            ans.add(queue.peekLast().val);

            int size = queue.size();

            for (int i = 0; i < size; i++) {

                TreeNode node = queue.poll();

                if (node.left != null) {
                    queue.add(node.left);
                }

                if (node.right != null) {
                    queue.add(node.right);
                }
            }
        }

        return ans;
    }
}

// @@ 64
class Solution {
    public boolean isValidBST(TreeNode root) {
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean valid(TreeNode node, long low, long high) {

        if (node == null) {
            return true;
        }

        if (node.val <= low || node.val >= high) {
            return false;
        }

        return valid(node.left, low, node.val) && valid(node.right, node.val, high);
    }
}

// @@ 65
class Solution {
    public int kthSmallest(TreeNode root, int k) {

        ArrayDeque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;

        while (node != null || !stack.isEmpty()) {

            // go as far left as possible
            while (node != null) {
                stack.push(node);
                node = node.left;
            }

            node = stack.pop();

            k--;

            if (k == 0) {
                return node.val;
            }

            node = node.right;
        }

        return -1;
    }
}

// @@ 66
class Solution {
    private Map<Integer, Integer> index = new HashMap<>();  // value -> position in inorder
    private int preIndex = 0;

    public TreeNode buildTree(int[] preorder, int[] inorder) {

        for (int i = 0; i < inorder.length; i++) {
            index.put(inorder[i], i);
        }

        return build(preorder, 0, inorder.length - 1);
    }

    private TreeNode build(int[] preorder, int start, int end) {

        if (start > end) {
            return null;
        }

        int val = preorder[preIndex];
        preIndex++;

        TreeNode node = new TreeNode(val);
        int mid = index.get(val);

        node.left = build(preorder, start, mid - 1);
        node.right = build(preorder, mid + 1, end);

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

        if (node == null) {
            return 0;
        }

        // drop negative branches
        int left = Math.max(gain(node.left), 0);
        int right = Math.max(gain(node.right), 0);

        // path that bends at this node
        best = Math.max(best, node.val + left + right);

        // the parent can use only one branch
        return node.val + Math.max(left, right);
    }
}

// @@ 69
class Trie {
    private static class Node {
        Node[] children = new Node[26];
        boolean isEnd = false;
    }

    private Node root;

    public Trie() {
        root = new Node();
    }

    public void insert(String word) {

        Node node = root;

        for (char ch : word.toCharArray()) {

            int i = ch - 'a';

            if (node.children[i] == null) {
                node.children[i] = new Node();
            }

            node = node.children[i];
        }

        node.isEnd = true;
    }

    public boolean search(String word) {

        Node node = walk(word);

        return node != null && node.isEnd;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Node walk(String s) {

        Node node = root;

        for (char ch : s.toCharArray()) {

            node = node.children[ch - 'a'];

            if (node == null) {
                return null;
            }
        }

        return node;
    }
}

// @@ 70
class WordDictionary {
    private static class Node {
        Node[] children = new Node[26];
        boolean isEnd = false;
    }

    private Node root;

    public WordDictionary() {
        root = new Node();
    }

    public void addWord(String word) {

        Node node = root;

        for (char ch : word.toCharArray()) {

            int i = ch - 'a';

            if (node.children[i] == null) {
                node.children[i] = new Node();
            }

            node = node.children[i];
        }

        node.isEnd = true;
    }

    public boolean search(String word) {
        return dfs(word, 0, root);
    }

    private boolean dfs(String word, int i, Node node) {

        if (i == word.length()) {
            return node.isEnd;
        }

        char ch = word.charAt(i);

        // '.' matches any letter: try every child
        if (ch == '.') {

            for (Node child : node.children) {

                if (child != null && dfs(word, i + 1, child)) {
                    return true;
                }
            }

            return false;
        }

        Node child = node.children[ch - 'a'];

        if (child == null) {
            return false;
        }

        return dfs(word, i + 1, child);
    }
}

// @@ 71
class Solution {
    private static class Node {
        Node[] children = new Node[26];
        String word = null;  // set at the end of a word
    }

    private List<String> ans = new ArrayList<>();
    private int rows = 0;
    private int cols = 0;

    public List<String> findWords(char[][] board, String[] words) {

        Node root = new Node();

        for (String word : words) {

            Node node = root;

            for (char ch : word.toCharArray()) {

                int i = ch - 'a';

                if (node.children[i] == null) {
                    node.children[i] = new Node();
                }

                node = node.children[i];
            }

            node.word = word;
        }

        rows = board.length;
        cols = board[0].length;

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {

                if (root.children[board[row][col] - 'a'] != null) {
                    dfs(board, row, col, root);
                }
            }
        }

        return ans;
    }

    private void dfs(char[][] board, int row, int col, Node parent) {

        char ch = board[row][col];
        Node node = parent.children[ch - 'a'];

        if (node.word != null) {
            ans.add(node.word);
            node.word = null;  // record each word only once
        }

        board[row][col] = '#';

        int[] dRow = {1, -1, 0, 0};
        int[] dCol = {0, 0, 1, -1};

        for (int d = 0; d < 4; d++) {

            int newRow = row + dRow[d];
            int newCol = col + dCol[d];

            if (newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols) {
                continue;
            }

            char next = board[newRow][newCol];

            if (next != '#' && node.children[next - 'a'] != null) {
                dfs(board, newRow, newCol, node);
            }
        }

        board[row][col] = ch;

        // prune this trie node once it has no word and no children left
        boolean empty = node.word == null;

        for (Node child : node.children) {
            if (child != null) {
                empty = false;
            }
        }

        if (empty) {
            parent.children[ch - 'a'] = null;
        }
    }
}
