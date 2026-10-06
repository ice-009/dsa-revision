from _harness import *

# ── Trees ─────────────────────────────────────────────────────────

@sol(55, ex='root = [4, 2, 7, 1, 3, 6, 9]', run=lambda f: TV(f(T([4, 2, 7, 1, 3, 6, 9]))), expect=[4, 7, 2, 9, 6, 3, 1],
     tests=[(lambda f: TV(f(T([]))), []), (lambda f: TV(f(T([2, 1, 3]))), [2, 3, 1])],
     algo=['Empty node → None.',
           'Invert both subtrees recursively and swap them: left = invert(right), right = invert(left).',
           'Return the node.'],
     dry=['invert(7): children 6, 9 swapped → 7(9, 6)',
          'invert(2): children 1, 3 swapped → 2(3, 1)',
          'root 4: left = inverted 7, right = inverted 2',
          '⇒ [4, 7, 2, 9, 6, 3, 1]'])
def invertTree(root):
    if not root:
        return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root


@sol(56, ex='root = [3, 9, 20, null, null, 15, 7]', run=lambda f: f(T([3, 9, 20, None, None, 15, 7])), expect=3,
     tests=[(lambda f: f(T([1, None, 2])), 2), (lambda f: f(None), 0)],
     algo=['Empty node has depth 0.',
           'depth(node) = 1 + max(depth(left), depth(right)).'],
     dry=['depth(9) = 1 (leaf)',
          'depth(15) = 1, depth(7) = 1 → depth(20) = 2',
          'depth(3) = 1 + max(1, 2) = 3'])
def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))


@sol(57, ex='root = [1, 2, 3, 4, 5]', run=lambda f: f(T([1, 2, 3, 4, 5])), expect=3,
     tests=[(lambda f: f(T([1, 2])), 1), (lambda f: f(T([1])), 0)],
     algo=['height(node) returns the number of nodes on the longest downward path.',
           'At every node the longest path THROUGH it has l + r edges → best = max(best, l + r).',
           'Return 1 + max(l, r) to the parent.'],
     dry=['height(4) = 1, height(5) = 1',
          'node 2: l=1, r=1 → best = 2, returns 2',
          'height(3) = 1',
          'node 1: l=2, r=1 → best = 3 ⇒ 3 (path 4-2-1-3)'])
def diameterOfBinaryTree(root):
    best = 0

    def height(node):
        nonlocal best
        if not node:
            return 0
        l, r = height(node.left), height(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)

    height(root)
    return best


@sol(58, ex='root = [1, 2, 2, 3, 3, null, null, 4, 4]', run=lambda f: f(T([1, 2, 2, 3, 3, None, None, 4, 4])), expect=False,
     tests=[(lambda f: f(T([3, 9, 20, None, None, 15, 7])), True), (lambda f: f(None), True)],
     algo=['height(node) returns the height, or −1 if the subtree is unbalanced.',
           'If either child is −1, or their heights differ by more than 1 → −1.',
           'Otherwise 1 + max(l, r). Balanced ⇔ height(root) ≠ −1.'],
     dry=['leaves 4, 4 → 1 each → node 3 (left) = 2',
          'right 3 = 1 → node 2 (left): |2−1| ok → 3',
          'right 2 = 1 (leaf)',
          'root: |3 − 1| = 2 > 1 → −1 ⇒ False'])
def isBalanced(root):
    def height(node):
        if not node:
            return 0
        l, r = height(node.left), height(node.right)
        if l == -1 or r == -1 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)

    return height(root) != -1


@sol(59, ex='p = [1, 2], q = [1, null, 2]', run=lambda f: f(T([1, 2]), T([1, None, 2])), expect=False,
     tests=[(lambda f: f(T([1, 2, 3]), T([1, 2, 3])), True), (lambda f: f(None, None), True)],
     algo=['Both empty → True.',
           'Exactly one empty, or values differ → False.',
           'Otherwise both left subtrees and both right subtrees must be the same.'],
     dry=['roots 1 == 1 → compare children',
          'left: p has 2, q has None → False ⇒ False'])
def isSameTree(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)


@sol(60, ex='root = [3, 4, 5, 1, 2], subRoot = [4, 1, 2]', run=lambda f: f(T([3, 4, 5, 1, 2]), T([4, 1, 2])), expect=True,
     tests=[(lambda f: f(T([3, 4, 5, 1, 2, None, None, None, None, 0]), T([4, 1, 2])), False)],
     algo=['same(a, b) checks two trees are identical (Same Tree).',
           'At each node of root: if same(node, subRoot) → True.',
           'Otherwise try the left subtree, then the right subtree.'],
     dry=['same(3, 4)? 3 ≠ 4 → no',
          'go left: same(4, 4) → 1 == 1, 2 == 2, leaves match → True'])
def isSubtree(root, subRoot):
    def same(a, b):
        if not a and not b:
            return True
        if not a or not b or a.val != b.val:
            return False
        return same(a.left, b.left) and same(a.right, b.right)

    if not subRoot:
        return True
    if not root:
        return False
    return same(root, subRoot) or isSubtree(root.left, subRoot) or isSubtree(root.right, subRoot)


_BST = [6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]


def _lca(f, vals, p, q):
    root = T(vals)
    return f(root, find(root, p), find(root, q)).val


@sol(61, ex='root = [6,2,8,0,4,7,9,null,null,3,5], p = 3, q = 5', run=lambda f: _lca(f, _BST, 3, 5), expect=4,
     tests=[(lambda f: _lca(f, _BST, 2, 8), 6), (lambda f: _lca(f, _BST, 2, 4), 2)],
     algo=['Start at the root.',
           'Both p and q smaller → LCA is in the left subtree; both larger → right subtree.',
           'Otherwise they split here (or one equals the node) → this node is the LCA.'],
     dry=['node 6: 3 and 5 both < 6 → go left',
          'node 2: 3 and 5 both > 2 → go right',
          'node 4: 3 < 4 < 5 → split → return 4'])
def lowestCommonAncestor(root, p, q):
    node = root
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left
        elif p.val > node.val and q.val > node.val:
            node = node.right
        else:
            return node


@sol(62, ex='root = [3, 9, 20, null, null, 15, 7]', run=lambda f: f(T([3, 9, 20, None, None, 15, 7])),
     expect=[[3], [9, 20], [15, 7]],
     tests=[(lambda f: f(None), []), (lambda f: f(T([1])), [[1]])],
     algo=['Queue starts with the root.',
           'Each round: the queue holds exactly one level — pop q.size() nodes, collect their values.',
           'Push each popped node’s children for the next level.'],
     dry=['q=[3] → level [3], push 9, 20',
          'q=[9,20] → level [9,20], push 15, 7',
          'q=[15,7] → level [15,7] ⇒ [[3],[9,20],[15,7]]'])
def levelOrder(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        res.append(level)
    return res


@sol(63, ex='root = [1, 2, 3, null, 5, null, 4]', run=lambda f: f(T([1, 2, 3, None, 5, None, 4])), expect=[1, 3, 4],
     tests=[(lambda f: f(T([1, 2])), [1, 2]), (lambda f: f(None), [])],
     algo=['BFS level by level; at the start of each level the queue holds exactly that level.',
           'Its last node q[-1] is the one visible from the right → record it.',
           'Pop the level, pushing children left-to-right.'],
     dry=['level [1] → see 1',
          'level [2, 3] → see 3',
          'level [5, 4] → see 4 ⇒ [1, 3, 4]'])
def rightSideView(root):
    res, q = [], deque([root] if root else [])
    while q:
        res.append(q[-1].val)
        for _ in range(len(q)):
            node = q.popleft()
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
    return res


@sol(64, ex='root = [5, 4, 6, null, null, 3, 7]', run=lambda f: f(T([5, 4, 6, None, None, 3, 7])), expect=False,
     tests=[(lambda f: f(T([2, 1, 3])), True), (lambda f: f(T([5, 1, 4, None, None, 3, 6])), False), (lambda f: f(T([2, 2, 2])), False)],
     algo=['valid(node, low, high): every value must satisfy low < val < high.',
           'Going left tightens high to node.val; going right tightens low to node.val.',
           'Empty node → True.'],
     dry=['5 in (-inf, inf) ✓',
          '4 in (-inf, 5) ✓',
          '6 in (5, inf) ✓',
          '3 in (5, 6)? ✗ — 3 is in 5’s RIGHT subtree ⇒ False'])
def isValidBST(root):
    def valid(node, low, high):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return valid(node.left, low, node.val) and valid(node.right, node.val, high)

    return valid(root, float('-inf'), float('inf'))


@sol(65, ex='root = [5, 3, 6, 2, 4, null, null, 1], k = 3', run=lambda f: f(T([5, 3, 6, 2, 4, None, None, 1]), 3), expect=3,
     tests=[(lambda f: f(T([3, 1, 4, None, 2]), 1), 1)],
     algo=['Iterative in-order traversal (left, node, right) visits BST values in sorted order.',
           'Push nodes while going left; pop one = next smallest; decrement k.',
           'k hits 0 → that value is the answer; else continue with the right child.'],
     dry=['push 5, 3, 2, 1 (going left)',
          'pop 1 → k=2',
          'pop 2 → k=1',
          'pop 3 → k=0 → return 3'])
def kthSmallest(root, k):
    stack, node = [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right


@sol(66, ex='preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]',
     run=lambda f: TV(f([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])), expect=[3, 9, 20, None, None, 15, 7],
     tests=[(lambda f: TV(f([-1], [-1])), [-1]), (lambda f: TV(f([1, 2], [2, 1])), [1, 2])],
     algo=['index = value → position in inorder.',
           'Preorder gives roots in order: take the next value as the root of the current range.',
           'Its inorder position splits the range: build left from [lo, mid−1] FIRST, then right from [mid+1, hi].'],
     dry=['root 3 (inorder idx 1) → left range [0,0], right [2,4]',
          'next 9 → idx 0 → leaf (left of 3)',
          'next 20 → idx 3 → left [2,2], right [4,4]',
          'next 15 → left of 20;  next 7 → right of 20'])
def buildTree(preorder, inorder):
    index = {v: i for i, v in enumerate(inorder)}
    pre = iter(preorder)

    def build(lo, hi):
        if lo > hi:
            return None
        val = next(pre)
        node = TreeNode(val)
        mid = index[val]
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node

    return build(0, len(inorder) - 1)


@sol(67, ex='root = [-10, 9, 20, null, null, 15, 7]', run=lambda f: f(T([-10, 9, 20, None, None, 15, 7])), expect=42,
     tests=[(lambda f: f(T([-3])), -3), (lambda f: f(T([1, 2, 3])), 6), (lambda f: f(T([2, -1])), 2)],
     algo=['gain(node) = best downward path starting at node (may use only ONE child).',
           'Ignore negative child gains: l = max(gain(left), 0), r = max(gain(right), 0).',
           'A path that bends at node is node.val + l + r → update best.',
           'Return node.val + max(l, r) to the parent. Start best at −inf.'],
     dry=['gain(9) = 9 → best 9',
          'gain(15) = 15 → best 15;  gain(7) = 7',
          'node 20: 20 + 15 + 7 = 42 → best 42; returns 20 + 15 = 35',
          'root -10: -10 + 9 + 35 = 34 < 42 ⇒ 42'])
def maxPathSum(root):
    best = float('-inf')

    def gain(node):
        nonlocal best
        if not node:
            return 0
        l = max(gain(node.left), 0)
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)
        return node.val + max(l, r)

    gain(root)
    return best


# ── Tries ─────────────────────────────────────────────────────────

@sol(69, ex='insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")',
     run=lambda C: play(C, [('insert', 'apple'), ('search', 'apple'), ('search', 'app'), ('startsWith', 'app'),
                            ('insert', 'app'), ('search', 'app')]),
     expect=[True, False, True, True],
     algo=['Each node has children (char → node) and an end flag.',
           'insert: walk/create a node per char; mark end on the last one.',
           'search: walk the word; True only if it exists AND the last node has end set.',
           'startsWith: True if the walk succeeds at all.'],
     dry=['insert apple → a→p→p→l→e, e.end = True',
          'search apple → walk ok, end ✓ → True',
          'search app → walk ok, but 2nd p.end is False → False',
          'startsWith app → walk ok → True',
          'insert app → 2nd p.end = True → search app → True'])
class Trie:
    class Node:
        def __init__(self):
            self.children = {}
            self.end = False

    def __init__(self):
        self.root = self.Node()

    def insert(self, word):
        node = self.root
        for c in word:
            node = node.children.setdefault(c, self.Node())
        node.end = True

    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node.children:
                return None
            node = node.children[c]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix):
        return self._walk(prefix) is not None


@sol(70, ex='addWord bad, dad, mad; search("pad"), search("bad"), search(".ad"), search("b..")',
     run=lambda C: play(C, [('addWord', 'bad'), ('addWord', 'dad'), ('addWord', 'mad'), ('search', 'pad'),
                            ('search', 'bad'), ('search', '.ad'), ('search', 'b..')]),
     expect=[False, True, True, True],
     algo=['Same trie insert as Implement Trie.',
           'search uses dfs(node, i): at the end of the word return node.end.',
           "Letter → follow that child (if missing → False). '.' → try every child; any success → True."],
     dry=["'pad': root has no 'p' → False",
          "'bad': b → a → d, end ✓ → True",
          "'.ad': try 'b' → a → d end ✓ → True",
          "'b..': b → any child (a) → any child (d) end ✓ → True"])
class WordDictionary:
    class Node:
        def __init__(self):
            self.children = {}
            self.end = False

    def __init__(self):
        self.root = self.Node()

    def addWord(self, word):
        node = self.root
        for c in word:
            node = node.children.setdefault(c, self.Node())
        node.end = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.end
            c = word[i]
            if c == '.':
                return any(dfs(child, i + 1) for child in node.children.values())
            return c in node.children and dfs(node.children[c], i + 1)

        return dfs(self.root, 0)


_BOARD = [['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']]


@sol(71, ex='board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]',
     run=lambda f: f([r[:] for r in _BOARD], ['oath', 'pea', 'eat', 'rain']), expect=['eat', 'oath'], norm='sorted',
     tests=[(lambda f: f([['a', 'b'], ['c', 'd']], ['abcb']), []), (lambda f: f([['a', 'a']], ['aaa', 'aa']), ['aa'])],
     algo=['Build a trie of all words; store the full word in its end node.',
           'DFS from every cell whose letter starts a word, following trie children.',
           'Reaching a node that holds a word → record it and clear it (no duplicates).',
           "Mark the cell '#' while visiting, restore it after. Prune trie nodes that become empty."],
     dry=['trie holds oath, pea, eat, rain',
          "(0,0) 'o' → (0,1) 'a' → (1,1) 't' → (2,1) 'h' → found 'oath'",
          "(1,0) 'e' → no neighbour 'a' → back",
          "(1,3) 'e' → (1,2) 'a' → (1,1) 't' → found 'eat'",
          "no cell path for 'pea' or 'rain' ⇒ ['oath', 'eat']"])
def findWords(board, words):
    root = {}
    for w in words:
        node = root
        for c in w:
            node = node.setdefault(c, {})
        node['$'] = w
    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent[ch]
        if '$' in node:
            found.append(node.pop('$'))
        board[r][c] = '#'
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in node:
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            parent.pop(ch)

    for r in range(rows):
        for c in range(cols):
            if board[r][c] in root:
                dfs(r, c, root)
    return found
