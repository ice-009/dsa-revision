// Week 4 — Trees, Tries.

// @@ 55
function invertTree(root) {

  if (root === null) {
    return null;
  }

  const left = invertTree(root.left);
  const right = invertTree(root.right);

  root.left = right;
  root.right = left;

  return root;
}

// @@ 56
function maxDepth(root) {

  if (root === null) {
    return 0;
  }

  const left = maxDepth(root.left);
  const right = maxDepth(root.right);

  return 1 + Math.max(left, right);
}

// @@ 57
function diameterOfBinaryTree(root) {

  let best = 0;

  function height(node) {

    if (node === null) {
      return 0;
    }

    const left = height(node.left);
    const right = height(node.right);

    // longest path through this node, counted in edges
    best = Math.max(best, left + right);

    return 1 + Math.max(left, right);
  }

  height(root);

  return best;
}

// @@ 58
function isBalanced(root) {

  // returns -1 if the subtree is unbalanced
  function height(node) {

    if (node === null) {
      return 0;
    }

    const left = height(node.left);
    const right = height(node.right);

    if (left === -1 || right === -1) {
      return -1;
    }

    if (Math.abs(left - right) > 1) {
      return -1;
    }

    return 1 + Math.max(left, right);
  }

  return height(root) !== -1;
}

// @@ 59
function isSameTree(p, q) {

  if (p === null && q === null) {
    return true;
  }

  if (p === null || q === null) {
    return false;
  }

  if (p.val !== q.val) {
    return false;
  }

  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

// @@ 60
function isSubtree(root, subRoot) {

  function same(a, b) {

    if (a === null && b === null) {
      return true;
    }

    if (a === null || b === null) {
      return false;
    }

    if (a.val !== b.val) {
      return false;
    }

    return same(a.left, b.left) && same(a.right, b.right);
  }

  if (subRoot === null) {
    return true;
  }

  if (root === null) {
    return false;
  }

  if (same(root, subRoot)) {
    return true;
  }

  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

// @@ 61
function lowestCommonAncestor(root, p, q) {

  let node = root;

  while (node !== null) {

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

// @@ 62
function levelOrder(root) {

  const ans = [];

  if (root === null) {
    return ans;
  }

  let level = [root];

  while (level.length > 0) {

    const values = [];
    const next = [];

    for (const node of level) {

      values.push(node.val);

      if (node.left !== null) {
        next.push(node.left);
      }

      if (node.right !== null) {
        next.push(node.right);
      }
    }

    ans.push(values);
    level = next;
  }

  return ans;
}

// @@ 63
function rightSideView(root) {

  const ans = [];

  if (root === null) {
    return ans;
  }

  let level = [root];

  while (level.length > 0) {

    // the last node of this level is the one seen from the right
    ans.push(level[level.length - 1].val);

    const next = [];

    for (const node of level) {

      if (node.left !== null) {
        next.push(node.left);
      }

      if (node.right !== null) {
        next.push(node.right);
      }
    }

    level = next;
  }

  return ans;
}

// @@ 64
function isValidBST(root) {

  function valid(node, low, high) {

    if (node === null) {
      return true;
    }

    if (node.val <= low || node.val >= high) {
      return false;
    }

    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
  }

  return valid(root, -Infinity, Infinity);
}

// @@ 65
function kthSmallest(root, k) {

  const stack = [];
  let node = root;

  while (node !== null || stack.length > 0) {

    // go as far left as possible
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }

    node = stack.pop();

    k--;

    if (k === 0) {
      return node.val;
    }

    node = node.right;
  }

  return -1;
}

// @@ 66
function buildTree(preorder, inorder) {

  const index = new Map();  // value -> position in inorder

  for (let i = 0; i < inorder.length; i++) {
    index.set(inorder[i], i);
  }

  let preIndex = 0;

  function build(start, end) {

    if (start > end) {
      return null;
    }

    const val = preorder[preIndex];
    preIndex++;

    const node = new TreeNode(val);
    const mid = index.get(val);

    node.left = build(start, mid - 1);
    node.right = build(mid + 1, end);

    return node;
  }

  return build(0, inorder.length - 1);
}

// @@ 67
function maxPathSum(root) {

  let best = -Infinity;

  function gain(node) {

    if (node === null) {
      return 0;
    }

    // drop negative branches
    const left = Math.max(gain(node.left), 0);
    const right = Math.max(gain(node.right), 0);

    // path that bends at this node
    best = Math.max(best, node.val + left + right);

    // the parent can use only one branch
    return node.val + Math.max(left, right);
  }

  gain(root);

  return best;
}

// @@ 69
class Trie {
  constructor() {
    this.root = { children: new Map(), isEnd: false };
  }

  insert(word) {

    let node = this.root;

    for (const ch of word) {

      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), isEnd: false });
      }

      node = node.children.get(ch);
    }

    node.isEnd = true;
  }

  search(word) {

    const node = this.walk(word);

    return node !== null && node.isEnd;
  }

  startsWith(prefix) {
    return this.walk(prefix) !== null;
  }

  walk(s) {

    let node = this.root;

    for (const ch of s) {

      if (!node.children.has(ch)) {
        return null;
      }

      node = node.children.get(ch);
    }

    return node;
  }
}

// @@ 70
class WordDictionary {
  constructor() {
    this.root = { children: new Map(), isEnd: false };
  }

  addWord(word) {

    let node = this.root;

    for (const ch of word) {

      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), isEnd: false });
      }

      node = node.children.get(ch);
    }

    node.isEnd = true;
  }

  search(word) {
    return this.dfs(word, 0, this.root);
  }

  dfs(word, i, node) {

    if (i === word.length) {
      return node.isEnd;
    }

    const ch = word[i];

    // '.' matches any letter: try every child
    if (ch === '.') {

      for (const child of node.children.values()) {

        if (this.dfs(word, i + 1, child)) {
          return true;
        }
      }

      return false;
    }

    if (!node.children.has(ch)) {
      return false;
    }

    return this.dfs(word, i + 1, node.children.get(ch));
  }
}

// @@ 71
function findWords(board, words) {

  // each trie node: children map, and the full word if one ends here
  const root = { children: new Map(), word: null };

  for (const word of words) {

    let node = root;

    for (const ch of word) {

      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), word: null });
      }

      node = node.children.get(ch);
    }

    node.word = word;
  }

  const rows = board.length;
  const cols = board[0].length;
  const ans = [];

  const dRow = [1, -1, 0, 0];
  const dCol = [0, 0, 1, -1];

  function dfs(row, col, parent) {

    const ch = board[row][col];
    const node = parent.children.get(ch);

    if (node.word !== null) {
      ans.push(node.word);
      node.word = null;  // record each word only once
    }

    board[row][col] = '#';

    for (let d = 0; d < 4; d++) {

      const newRow = row + dRow[d];
      const newCol = col + dCol[d];

      if (newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols) {
        continue;
      }

      if (node.children.has(board[newRow][newCol])) {
        dfs(newRow, newCol, node);
      }
    }

    board[row][col] = ch;

    // prune this trie node once it has no word and no children left
    if (node.word === null && node.children.size === 0) {
      parent.children.delete(ch);
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {

      if (root.children.has(board[row][col])) {
        dfs(row, col, root);
      }
    }
  }

  return ans;
}
