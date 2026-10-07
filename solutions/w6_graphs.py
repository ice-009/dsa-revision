from _harness import *

_ISLANDS = [['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]


@sol(89, ex='grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
     run=lambda f: f([r[:] for r in _ISLANDS]), expect=3,
     tests=[(lambda f: f([['1', '1', '1'], ['0', '1', '0'], ['1', '1', '1']]), 1), (lambda f: f([['0']]), 0)],
     algo=['Scan every cell.',
           "On a '1': count a new island, then flood-fill (DFS with a stack) turning its whole island to '0'.",
           'Each land cell is sunk once, so the count is the number of islands.'],
     dry=['(0,0) is 1 → count=1 → sink (0,0) (0,1) (1,0) (1,1)',
          '(2,2) is 1 → count=2 → sink it',
          '(3,3) is 1 → count=3 → sink (3,3) (3,4)',
          'no land left ⇒ 3'])
def numIslands(grid):
    rows, cols = len(grid), len(grid[0])

    def sink(r, c):
        grid[r][c] = '0'
        stack = [(r, c)]
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                    grid[nr][nc] = '0'
                    stack.append((nr, nc))

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                sink(r, c)
    return count


class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def _run_clone(f, adj):
    if not adj:
        return f(None)
    nodes = [Node(i + 1) for i in range(len(adj))]
    for i, nbs in enumerate(adj):
        nodes[i].neighbors = [nodes[j - 1] for j in nbs]
    copy = f(nodes[0])
    originals = {id(n) for n in nodes}
    seen, order, stack = {}, [], [copy]
    while stack:
        n = stack.pop()
        if id(n) in originals:
            return 'shares nodes with the original!'
        if n.val in seen:
            continue
        seen[n.val] = n
        order.append(n)
        stack.extend(n.neighbors)
    return [[nb.val for nb in seen[v].neighbors] for v in sorted(seen)]


@sol(90, ex='adjList = [[2,4],[1,3],[2,4],[1,3]]  (node 1 links to 2 and 4, …)',
     run=lambda f: _run_clone(f, [[2, 4], [1, 3], [2, 4], [1, 3]]), expect=[[2, 4], [1, 3], [2, 4], [1, 3]],
     tests=[(lambda f: _run_clone(f, [[]]), [[]]), (lambda f: _run_clone(f, []), None)],
     algo=['clones = {original node: its copy}.',
           'clone(node): if node is already in clones return its copy (handles cycles).',
           'Otherwise create the copy, store it in clones FIRST, then clone each neighbour into copy.neighbors.'],
     dry=["clone(1) → 1' stored → neighbour 2",
          "clone(2) → 2' → neighbour 1 is in clones → 1'; neighbour 3",
          "clone(3) → 3' → 2' (stored), neighbour 4",
          "clone(4) → 4' → 1', 3' (both stored)",
          "back in 1: neighbour 4 → 4' ⇒ return 1'"])
def cloneGraph(node):
    clones = {}

    def clone(n):
        if n in clones:
            return clones[n]
        copy = Node(n.val)
        clones[n] = copy
        for nb in n.neighbors:
            copy.neighbors.append(clone(nb))
        return copy

    return clone(node) if node else None


@sol(91, ex='grid = [[0,1,1],[1,1,0],[0,0,1]]', run=lambda f: f([[0, 1, 1], [1, 1, 0], [0, 0, 1]]), expect=4,
     tests=[(lambda f: f([[0, 0, 0]]), 0), (lambda f: f([[1, 1], [1, 0]]), 3)],
     algo=['area(r, c): 0 if out of bounds or not land.',
           'Otherwise sink the cell (set 0) and return 1 + area of its four neighbours.',
           'Answer = max area started from any cell.'],
     dry=['area(0,1): sink → down (1,1) → sink → left (1,0) → 1 → (1,1) gives 2',
          'back at (0,1): right (0,2) → 1',
          'area(0,1) = 1 + 2 + 1 = 4',
          '(2,2) is a separate island → 1 ⇒ 4'])
def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])

    def area(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)

    return max(area(r, c) for r in range(rows) for c in range(cols))


_PA = [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]


@sol(92, ex='heights = [[1, 2], [4, 3]]', run=lambda f: f([[1, 2], [4, 3]]), expect=[[0, 1], [1, 0], [1, 1]], norm='sorted',
     tests=[(lambda f: f(_PA), [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]), (lambda f: f([[1]]), [[0, 0]])],
     algo=['Think backwards: water flows from a cell to an ocean ⇔ from the ocean you can climb UP to that cell.',
           'dfs(ocean, r, c): from each border cell of that ocean, move only to neighbours with height ≥ current.',
           'Pacific starts = top row + left column; Atlantic = bottom row + right column.',
           'Answer = cells reachable from both.'],
     dry=['Pacific starts (0,0)(0,1)(1,0); from (0,1)=2 climb to (1,1)=3 → all 4 cells',
          'Atlantic starts (1,0)(1,1)(0,1); (0,0)=1 is lower than every neighbour → not reached',
          'both = (0,1), (1,0), (1,1)'])
def pacificAtlantic(heights):
    rows, cols = len(heights), len(heights[0])

    def reach(starts):
        seen = set(starts)
        stack = list(starts)
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if (0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen
                        and heights[nr][nc] >= heights[r][c]):
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        return seen

    pacific = reach([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])
    atlantic = reach([(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)])
    return [list(p) for p in pacific & atlantic]


def _run_solve(f, board):
    b = [row[:] for row in board]
    f(b)
    return b


@sol(93, ex='board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]',
     run=lambda f: _run_solve(f, [list('XXXX'), list('XOOX'), list('XXOX'), list('XOXX')]),
     expect=[list('XXXX'), list('XXXX'), list('XXXX'), list('XOXX')],
     tests=[(lambda f: _run_solve(f, [['X']]), [['X']]), (lambda f: _run_solve(f, [list('OO'), list('OO')]), [list('OO'), list('OO')])],
     algo=["An 'O' survives only if it connects to the border.",
           "DFS from every border 'O', marking its region 'T' (safe).",
           "Then flip every remaining 'O' → 'X' and every 'T' back → 'O'."],
     dry=["border scan: only (3,1) is 'O' → mark 'T' (no O neighbours)",
          "(1,1), (1,2), (2,2) never reached → still 'O'",
          "flip: those three → 'X'; (3,1) 'T' → 'O'"])
def solve(board):
    rows, cols = len(board), len(board[0])

    def mark(r, c):
        if 0 <= r < rows and 0 <= c < cols and board[r][c] == 'O':
            board[r][c] = 'T'
            mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1)

    for r in range(rows):
        mark(r, 0); mark(r, cols - 1)
    for c in range(cols):
        mark(0, c); mark(rows - 1, c)
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == 'O':
                board[r][c] = 'X'
            elif board[r][c] == 'T':
                board[r][c] = 'O'


@sol(94, ex='grid = [[2,1,1],[1,1,0],[0,1,1]]', run=lambda f: f([[2, 1, 1], [1, 1, 0], [0, 1, 1]]), expect=4,
     tests=[(lambda f: f([[2, 1, 1], [0, 1, 1], [1, 0, 1]]), -1), (lambda f: f([[0, 2]]), 0)],
     algo=['Queue ALL rotten oranges at time 0 and count the fresh ones.',
           'BFS one level per minute: every rotten orange rots its fresh neighbours.',
           'Stop when the queue empties or nothing is fresh. Fresh left → −1, else the minutes.'],
     dry=['start queue=[(0,0)], fresh=6',
          'minute 1: rot (1,0), (0,1) → fresh 4',
          'minute 2: rot (1,1), (0,2) → fresh 2',
          'minute 3: rot (2,1) → fresh 1',
          'minute 4: rot (2,2) → fresh 0 ⇒ 4'])
def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes


@sol(95, ex='mat = [[0,0,0],[0,1,0],[1,1,1]]', run=lambda f: f([[0, 0, 0], [0, 1, 0], [1, 1, 1]]),
     expect=[[0, 0, 0], [0, 1, 0], [1, 2, 1]],
     tests=[(lambda f: f([[0], [1], [1]]), [[0], [1], [2]])],
     algo=['dist = −1 everywhere (unvisited); every 0 gets dist 0 and goes in the queue.',
           'BFS: an unvisited neighbour gets dist = current + 1 and is queued.',
           'BFS order guarantees each cell is first reached from its NEAREST zero.'],
     dry=['queue the six 0s with dist 0',
          'their neighbours (1,1), (2,0), (2,2) → dist 1',
          '(2,1) is reached from (1,1) → dist 2'])
def updateMatrix(mat):
    rows, cols = len(mat), len(mat[0])
    dist = [[-1] * cols for _ in range(rows)]
    q = deque()
    for r in range(rows):
        for c in range(cols):
            if mat[r][c] == 0:
                dist[r][c] = 0
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist


@sol(96, ex='numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
     run=lambda f: f(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), expect=True,
     tests=[(lambda f: f(2, [[1, 0], [0, 1]]), False), (lambda f: f(1, []), True)],
     algo=['[course, pre] means an edge pre → course in graph; indegree[course] += 1.',
           "Kahn's algorithm: queue every course with indegree 0.",
           'Pop a course, count it as taken, decrement indegree of each next course; enqueue any that hit 0.',
           'All courses taken ⇔ no cycle.'],
     dry=['edges 0→1, 0→2, 1→3, 2→3; indegree [0,1,1,2]',
          'queue=[0] → take 0 → indegree 1, 2 become 0 → queue=[1,2]',
          'take 1 → indegree[3]=1;  take 2 → indegree[3]=0 → queue=[3]',
          'take 3 → taken 4 == 4 ⇒ True'])
def canFinish(numCourses, prerequisites):
    adj = defaultdict(list)
    indeg = [0] * numCourses
    for course, pre in prerequisites:
        adj[pre].append(course)
        indeg[course] += 1
    q = deque(i for i in range(numCourses) if indeg[i] == 0)
    taken = 0
    while q:
        u = q.popleft()
        taken += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return taken == numCourses


@sol(97, ex='numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
     run=lambda f: f(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), expect=[0, 1, 2, 3],
     tests=[(lambda f: f(2, [[1, 0], [0, 1]]), []), (lambda f: f(1, []), [0]), (lambda f: f(2, [[0, 1]]), [1, 0])],
     algo=['Same graph and indegrees as Course Schedule.',
           "Kahn's algorithm, appending each popped course to order.",
           'If order has fewer than numCourses entries there is a cycle → [].'],
     dry=['indegree [0,1,1,2] → queue=[0]',
          'pop 0 → order [0] → queue=[1,2]',
          'pop 1 → order [0,1];  pop 2 → order [0,1,2] → queue=[3]',
          'pop 3 → order [0,1,2,3] ✓'])
def findOrder(numCourses, prerequisites):
    adj = defaultdict(list)
    indeg = [0] * numCourses
    for course, pre in prerequisites:
        adj[pre].append(course)
        indeg[course] += 1
    q = deque(i for i in range(numCourses) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == numCourses else []


@sol(98, ex='edges = [[1,2],[1,3],[2,3]]', run=lambda f: f([[1, 2], [1, 3], [2, 3]]), expect=[2, 3],
     tests=[(lambda f: f([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]), [1, 4])],
     algo=['Union-Find over nodes 1..n: parent[x] = x initially.',
           'find(x) follows parents to the root (with path halving).',
           'For each edge: if both ends already share a root, this edge closes a cycle → return it.',
           'Otherwise union the two roots.'],
     dry=['[1,2]: roots 1, 2 → union (parent[1]=2)',
          '[1,3]: roots 2, 3 → union (parent[2]=3)',
          '[2,3]: find(2)=3, find(3)=3 → same root ⇒ [2,3]'])
def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        parent[ra] = rb


@sol(99, ex='isConnected = [[1,1,0],[1,1,0],[0,0,1]]', run=lambda f: f([[1, 1, 0], [1, 1, 0], [0, 0, 1]]), expect=2,
     tests=[(lambda f: f([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 3), (lambda f: f([[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1]]), 1)],
     algo=['Each city is a node; isConnected[i][j] == 1 is an edge.',
           'For each unvisited city: start a DFS that marks its whole component, count one province.'],
     dry=['city 0 unvisited → province 1 → DFS visits 1',
          'city 1 already visited',
          'city 2 unvisited → province 2 ⇒ 2'])
def findCircleNum(isConnected):
    n = len(isConnected)
    seen = set()

    def dfs(i):
        for j in range(n):
            if isConnected[i][j] and j not in seen:
                seen.add(j)
                dfs(j)

    provinces = 0
    for i in range(n):
        if i not in seen:
            seen.add(i)
            dfs(i)
            provinces += 1
    return provinces


@sol(100, ex='n = 4, connections = [[0,1],[0,2],[1,2]]', run=lambda f: f(4, [[0, 1], [0, 2], [1, 2]]), expect=1,
     tests=[(lambda f: f(6, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]]), 2), (lambda f: f(6, [[0, 1], [0, 2], [0, 3], [1, 2]]), -1)],
     algo=['Connecting n computers needs at least n − 1 cables → otherwise −1.',
           'Union-Find: start with n components; each union of two different roots removes one.',
           'Extra cables can always be moved, so the answer is components − 1.'],
     dry=['3 cables ≥ n−1 = 3 → possible',
          '[0,1] → 3 components;  [0,2] → 2',
          '[1,2] → same root (spare cable)',
          'computer 3 is alone → 2 components ⇒ 1 move'])
def makeConnected(n, connections):
    if len(connections) < n - 1:
        return -1
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for a, b in connections:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            components -= 1
    return components - 1


@sol(101, ex='beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
     run=lambda f: f('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']), expect=5,
     tests=[(lambda f: f('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']), 0), (lambda f: f('a', 'c', ['a', 'b', 'c']), 2)],
     algo=['endWord not in the list → 0.',
           'Bucket every word by its wildcard patterns: "hot" → "*ot", "h*t", "ho*".',
           'BFS from beginWord level by level (steps counts words in the sequence).',
           'Neighbours of word = all words sharing one of its patterns. Reaching endWord → return steps.'],
     dry=['level 1: hit',
          'level 2: hot (shares h*t)',
          'level 3: dot, lot (share *ot)',
          'level 4: dog (do*), log (lo*)',
          'level 5: cog (*og) == endWord ⇒ 5'])
def ladderLength(beginWord, endWord, wordList):
    words = set(wordList)
    if endWord not in words:
        return 0
    buckets = defaultdict(list)
    for w in words | {beginWord}:
        for i in range(len(w)):
            buckets[w[:i] + '*' + w[i + 1:]].append(w)
    q = deque([beginWord])
    seen = {beginWord}
    steps = 1
    while q:
        for _ in range(len(q)):
            w = q.popleft()
            if w == endWord:
                return steps
            for i in range(len(w)):
                for nxt in buckets[w[:i] + '*' + w[i + 1:]]:
                    if nxt not in seen:
                        seen.add(nxt)
                        q.append(nxt)
        steps += 1
    return 0
