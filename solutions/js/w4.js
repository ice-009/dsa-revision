// Week 4 — Trees, Tries.

// @@ 55
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}

// @@ 56
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// @@ 57
function diameterOfBinaryTree(root) {
  let best = 0;
  const height = node => {
    if (!node) return 0;
    const l = height(node.left), r = height(node.right);
    best = Math.max(best, l + r); // longest path through this node (edges)
    return 1 + Math.max(l, r);
  };
  height(root);
  return best;
}

// @@ 58
function isBalanced(root) {
  const height = node => { // -1 means "unbalanced"
    if (!node) return 0;
    const l = height(node.left), r = height(node.right);
    if (l === -1 || r === -1 || Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  };
  return height(root) !== -1;
}

// @@ 59
function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

// @@ 60
function isSubtree(root, subRoot) {
  const same = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return same(a.left, b.left) && same(a.right, b.right);
  };
  if (!subRoot) return true;
  if (!root) return false;
  return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

// @@ 61
function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left;
    else if (p.val > node.val && q.val > node.val) node = node.right;
    else return node; // they split here
  }
  return null;
}

// @@ 62
function levelOrder(root) {
  if (!root) return [];
  const res = [];
  let level = [root];
  while (level.length) {
    res.push(level.map(node => node.val));
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return res;
}

// @@ 63
function rightSideView(root) {
  if (!root) return [];
  const res = [];
  let level = [root];
  while (level.length) {
    res.push(level[level.length - 1].val); // last node of this level
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return res;
}

// @@ 64
function isValidBST(root) {
  const valid = (node, low, high) => {
    if (!node) return true;
    if (node.val <= low || node.val >= high) return false;
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
  };
  return valid(root, -Infinity, Infinity);
}

// @@ 65
function kthSmallest(root, k) {
  const st = [];
  let node = root;
  while (node || st.length) {
    while (node) { // go as far left as possible
      st.push(node);
      node = node.left;
    }
    node = st.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
  return -1;
}

// @@ 66
function buildTree(preorder, inorder) {
  const index = new Map(inorder.map((v, i) => [v, i])); // value -> position in inorder
  let pre = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const val = preorder[pre++];
    const node = new TreeNode(val);
    const mid = index.get(val);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, inorder.length - 1);
}

// @@ 67
function maxPathSum(root) {
  let best = -Infinity;
  const gain = node => {
    if (!node) return 0;
    const l = Math.max(gain(node.left), 0); // drop negative branches
    const r = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + l + r); // path bending at this node
    return node.val + Math.max(l, r); // parent may use one branch only
  };
  gain(root);
  return best;
}

// @@ 69
class Trie {
  constructor() {
    this.root = { children: {}, end: false };
  }

  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node.children[c]) node.children[c] = { children: {}, end: false };
      node = node.children[c];
    }
    node.end = true;
  }

  walk(s) {
    let node = this.root;
    for (const c of s) {
      node = node.children[c];
      if (!node) return null;
    }
    return node;
  }

  search(word) {
    const node = this.walk(word);
    return node !== null && node.end;
  }

  startsWith(prefix) {
    return this.walk(prefix) !== null;
  }
}

// @@ 70
class WordDictionary {
  constructor() {
    this.root = { children: {}, end: false };
  }

  addWord(word) {
    let node = this.root;
    for (const c of word) {
      if (!node.children[c]) node.children[c] = { children: {}, end: false };
      node = node.children[c];
    }
    node.end = true;
  }

  search(word) {
    const dfs = (node, i) => {
      if (i === word.length) return node.end;
      const c = word[i];
      if (c === '.') return Object.values(node.children).some(child => dfs(child, i + 1));
      return c in node.children && dfs(node.children[c], i + 1);
    };
    return dfs(this.root, 0);
  }
}

// @@ 71
function findWords(board, words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const c of w) node = node[c] || (node[c] = {});
    node.$ = w; // store the word at its end node
  }
  const rows = board.length, cols = board[0].length;
  const found = [];
  const dfs = (r, c, parent) => {
    const ch = board[r][c];
    const node = parent[ch];
    if (node.$) {
      found.push(node.$);
      delete node.$; // record each word once
    }
    board[r][c] = '#';
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && node[board[nr][nc]]) dfs(nr, nc, node);
    }
    board[r][c] = ch;
    if (Object.keys(node).length === 0) delete parent[ch]; // prune finished branches
  };
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (root[board[r][c]]) dfs(r, c, root);
  return found;
}
