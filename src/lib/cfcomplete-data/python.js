// Python completion data. Line format: label :: detail :: doc [:: snippet].
export const globals = `
## Function
print :: print(*values, sep=' ', end='\\n', file=sys.stdout, flush=False) :: Prints values. Use print(*a) to print a list space-separated; sys.stdout.write is faster for huge output.
input :: input() -> str :: Reads a line. Alias sys.stdin.readline for speed (keeps the trailing newline).
len :: len(obj) -> int :: Number of items. O(1).
range :: range(stop) | range(start, stop) | range(start, stop, step) :: Integer sequence [start, stop). range(n - 1, -1, -1) goes backwards.
int :: int(x=0, base=10) -> int :: Converts to int (arbitrary precision).
float :: float(x) -> float :: Converts to float. float('inf') is infinity.
str :: str(obj) -> str :: Converts to string.
list :: list(iterable=()) -> list :: Builds a list.
dict :: dict(**kwargs) -> dict :: Builds a dict.
set :: set(iterable=()) -> set :: Builds a set. Membership O(1) average.
tuple :: tuple(iterable=()) -> tuple :: Builds a tuple (hashable).
frozenset :: frozenset(iterable=()) -> frozenset :: Hashable set.
sorted :: sorted(iterable, *, key=None, reverse=False) -> list :: New sorted list. O(n log n), stable.
reversed :: reversed(seq) -> iterator :: Reverse iterator.
enumerate :: enumerate(iterable, start=0) :: Yields (index, item): for i, x in enumerate(a).
zip :: zip(*iterables) :: Pairs items: for x, y in zip(a, b). Stops at the shortest.
map :: map(func, *iterables) :: Lazy apply: list(map(int, input().split())).
filter :: filter(func, iterable) :: Items where func is truthy.
sum :: sum(iterable, start=0) :: Sum of items. O(n).
min :: min(iterable, *, key=None, default=...) | min(a, b, *args) :: Smallest item.
max :: max(iterable, *, key=None, default=...) | max(a, b, *args) :: Largest item.
abs :: abs(x) :: Absolute value.
pow :: pow(base, exp, mod=None) :: pow(b, e, m) is fast modular exponentiation, O(log e).
divmod :: divmod(a, b) -> (a // b, a % b) :: Quotient and remainder.
round :: round(x, ndigits=None) :: Banker's rounding (round half to even).
any :: any(iterable) -> bool :: True if any item is truthy.
all :: all(iterable) -> bool :: True if all items are truthy.
chr :: chr(i) -> str :: Character from code point.
ord :: ord(c) -> int :: Code point of a character.
bin :: bin(x) -> str :: Binary string like '0b101'.
hex :: hex(x) -> str :: Hex string.
bool :: bool(x) -> bool :: Truthiness.
isinstance :: isinstance(obj, cls) -> bool :: Type check.
iter :: iter(iterable) :: Iterator.
next :: next(iterator, default) :: Next item.
open :: open(file, mode='r') :: Opens a file.
exit :: exit(code=0) :: Exits the program.
## Class
deque :: collections.deque(iterable=(), maxlen=None) :: Double-ended queue: append/popleft O(1). Use for BFS. :: deque($0)
defaultdict :: collections.defaultdict(default_factory) :: Dict with default values: defaultdict(list), defaultdict(int). :: defaultdict(\${1|int,list,set|})
Counter :: collections.Counter(iterable) :: Multiset counting: Counter(s).most_common(k). :: Counter($0)
OrderedDict :: collections.OrderedDict() :: Dict with order operations (move_to_end).
## Constant
inf :: math.inf :: Floating infinity (also float('inf')). :: float('inf')
None
True
False
## Keyword
def
class
lambda
return
yield
import
from
as
if
elif
else
for
while
in
not
and
or
is
pass
break
continue
try
except
finally
with
global
nonlocal
del
assert
`;

const LIST = `
append :: list.append(x) :: Adds x to the end. Amortized O(1).
extend :: list.extend(iterable) :: Appends all items. O(k).
insert :: list.insert(i, x) :: Inserts before index i. O(n).
pop :: list.pop(i=-1) :: Removes and returns item (last by default O(1); pop(0) is O(n), use deque).
remove :: list.remove(x) :: Removes first occurrence. O(n).
index :: list.index(x, start=0) :: Index of first occurrence (ValueError if missing). O(n).
count :: list.count(x) :: Number of occurrences. O(n).
sort :: list.sort(*, key=None, reverse=False) :: Sorts in place. O(n log n), stable.
reverse :: list.reverse() :: Reverses in place.
copy :: list.copy() :: Shallow copy.
clear :: list.clear() :: Removes all items.
`;
const STR = `
split :: str.split(sep=None, maxsplit=-1) -> list :: Splits on whitespace by default: input().split().
join :: str.join(iterable) :: Joins strings with this separator: ' '.join(map(str, a)).
strip :: str.strip(chars=None) :: Strips whitespace/chars from both ends.
lstrip :: str.lstrip(chars=None) :: Strips left.
rstrip :: str.rstrip(chars=None) :: Strips right.
replace :: str.replace(old, new, count=-1) :: Replaces occurrences.
find :: str.find(sub, start=0, end=len) :: Index or -1.
rfind :: str.rfind(sub) :: Last index or -1.
index :: str.index(sub) :: Index (ValueError if missing).
count :: str.count(sub) :: Non-overlapping occurrences.
startswith :: str.startswith(prefix) -> bool :: Prefix test (accepts a tuple).
endswith :: str.endswith(suffix) -> bool :: Suffix test.
upper :: str.upper() :: Uppercase.
lower :: str.lower() :: Lowercase.
isdigit :: str.isdigit() -> bool :: All chars are digits.
isalpha :: str.isalpha() -> bool :: All chars are letters.
isalnum :: str.isalnum() -> bool :: Letters or digits.
islower :: str.islower() -> bool :: Lowercase.
isupper :: str.isupper() -> bool :: Uppercase.
isspace :: str.isspace() -> bool :: Whitespace.
format :: str.format(*args, **kwargs) :: String formatting.
zfill :: str.zfill(width) :: Pads with zeros on the left.
ljust :: str.ljust(width, fillchar=' ') :: Left-justify.
rjust :: str.rjust(width, fillchar=' ') :: Right-justify.
center :: str.center(width, fillchar=' ') :: Center.
splitlines :: str.splitlines() :: Splits by line breaks.
partition :: str.partition(sep) :: (before, sep, after).
swapcase :: str.swapcase() :: Swap case.
title :: str.title() :: Title case.
encode :: str.encode(encoding='utf-8') :: To bytes.
`;
const DICT = `
get :: dict.get(key, default=None) :: Value or default; never raises.
keys :: dict.keys() :: View of keys.
values :: dict.values() :: View of values.
items :: dict.items() :: View of (key, value): for k, v in d.items().
pop :: dict.pop(key, default) :: Removes key and returns value.
popitem :: dict.popitem() :: Removes the last inserted pair.
setdefault :: dict.setdefault(key, default=None) :: Gets or inserts default.
update :: dict.update(other) :: Merges other.
clear :: dict.clear() :: Removes all.
copy :: dict.copy() :: Shallow copy.
fromkeys :: dict.fromkeys(iterable, value=None) :: New dict from keys.
`;
const COUNTER = `
most_common :: Counter.most_common(n=None) :: List of (elem, count) sorted by count. O(n log k).
elements :: Counter.elements() :: Iterator repeating each element count times.
subtract :: Counter.subtract(iterable) :: Subtracts counts.
total :: Counter.total() :: Sum of counts (3.10+).
`;
const SET = `
add :: set.add(x) :: Adds x. O(1) average.
remove :: set.remove(x) :: Removes x (KeyError if missing).
discard :: set.discard(x) :: Removes x if present.
pop :: set.pop() :: Removes an arbitrary element.
union :: set.union(*others) :: Union (a | b).
intersection :: set.intersection(*others) :: Intersection (a & b).
difference :: set.difference(*others) :: Difference (a - b).
symmetric_difference :: set.symmetric_difference(other) :: XOR (a ^ b).
issubset :: set.issubset(other) :: Subset test.
issuperset :: set.issuperset(other) :: Superset test.
update :: set.update(*others) :: Adds all items.
clear :: set.clear() :: Removes all.
copy :: set.copy() :: Shallow copy.
`;
const DEQUE = `
append :: deque.append(x) :: Right append. O(1).
appendleft :: deque.appendleft(x) :: Left append. O(1).
pop :: deque.pop() :: Remove right. O(1).
popleft :: deque.popleft() :: Remove left. O(1).
extend :: deque.extend(iterable) :: Extend right.
extendleft :: deque.extendleft(iterable) :: Extend left (reversed order).
rotate :: deque.rotate(n=1) :: Rotate right by n.
clear :: deque.clear() :: Remove all.
count :: deque.count(x) :: Occurrences.
index :: deque.index(x) :: Index of x.
insert :: deque.insert(i, x) :: Insert at i.
remove :: deque.remove(x) :: Remove first occurrence.
reverse :: deque.reverse() :: Reverse in place.
`;
const STDIN = `
readline :: sys.stdin.readline() :: Reads one line (fast). Strip with .rstrip() or int() it.
read :: sys.stdin.read() :: Reads all input: data = sys.stdin.read().split().
readlines :: sys.stdin.readlines() :: All lines.
buffer :: sys.stdin.buffer :: Binary stream: sys.stdin.buffer.read().split() is fastest.
`;
export const members = {
  list: LIST,
  str: STR,
  dict: DICT,
  counter: DICT + COUNTER,
  set: SET,
  deque: DEQUE,
  stdin: STDIN,
  stdout: `write :: sys.stdout.write(s) :: Writes a string (no newline added).\nflush :: sys.stdout.flush() :: Flush (interactive problems).\n`,
};

// receiver-type inference rules for assignments `name = <rhs>`
export const RHS_TYPES = [
  [/^\[/, 'list'], [/^(list|sorted)\s*\(/, 'list'], [/\.split\s*\(/, 'list'], [/^list\s*\(map/, 'list'],
  [/^(\{\s*\}|dict\s*\(|defaultdict\s*\(|OrderedDict)/, 'dict'], [/^Counter\s*\(/, 'counter'],
  [/^\{[^}:]*:/, 'dict'], [/^(set\s*\(|\{)/, 'set'], [/^(collections\.)?deque\s*\(/, 'deque'],
  [/^(["']|f["']|str\s*\(|input\s*\(|sys\.stdin\.readline)/, 'str'],
];

export const modules = {
  heapq: `
heappush :: heapq.heappush(heap, item) :: Pushes onto a min-heap. O(log n). Use tuples (priority, item); negate for max-heap.
heappop :: heapq.heappop(heap) :: Pops the smallest item. O(log n).
heapify :: heapq.heapify(x) :: Turns a list into a min-heap in place. O(n).
heappushpop :: heapq.heappushpop(heap, item) :: Push then pop smallest, faster than separate calls.
heapreplace :: heapq.heapreplace(heap, item) :: Pop smallest then push item.
nlargest :: heapq.nlargest(n, iterable, key=None) :: n largest items. O(N log n).
nsmallest :: heapq.nsmallest(n, iterable, key=None) :: n smallest items.
merge :: heapq.merge(*iterables) :: Merges sorted inputs lazily.
`,
  bisect: `
bisect_left :: bisect.bisect_left(a, x, lo=0, hi=len(a), *, key=None) :: Leftmost insertion index (first element >= x) in sorted a. O(log n). Like C++ lower_bound.
bisect_right :: bisect.bisect_right(a, x, lo=0, hi=len(a), *, key=None) :: Rightmost insertion index (first element > x). Like C++ upper_bound.
bisect :: bisect.bisect(a, x, lo=0, hi=len(a)) :: Alias of bisect_right.
insort :: bisect.insort(a, x) :: Inserts keeping sorted order. O(n) insert.
insort_left :: bisect.insort_left(a, x) :: Insert before equal items.
insort_right :: bisect.insort_right(a, x) :: Insert after equal items.
`,
  math: `
sqrt :: math.sqrt(x) :: Square root (float).
isqrt :: math.isqrt(n) :: Exact integer square root.
gcd :: math.gcd(*integers) :: Greatest common divisor.
lcm :: math.lcm(*integers) :: Least common multiple (3.9+).
factorial :: math.factorial(n) :: n!
comb :: math.comb(n, k) :: Binomial coefficient (exact).
perm :: math.perm(n, k=None) :: Permutations count.
ceil :: math.ceil(x) :: Smallest int >= x.
floor :: math.floor(x) :: Largest int <= x.
log :: math.log(x, base=e) :: Logarithm.
log2 :: math.log2(x) :: Base-2 log.
log10 :: math.log10(x) :: Base-10 log.
exp :: math.exp(x) :: e**x.
sin :: math.sin(x) :: Sine.
cos :: math.cos(x) :: Cosine.
atan2 :: math.atan2(y, x) :: Angle.
hypot :: math.hypot(*coords) :: Euclidean norm.
dist :: math.dist(p, q) :: Distance between points.
fabs :: math.fabs(x) :: Float abs.
isclose :: math.isclose(a, b, rel_tol=1e-9, abs_tol=0.0) :: Approx equality.
prod :: math.prod(iterable, start=1) :: Product.
trunc :: math.trunc(x) :: Truncate toward zero.
## Constant
pi :: math.pi :: 3.14159...
e :: math.e :: 2.71828...
inf :: math.inf :: Infinity.
`,
  itertools: `
permutations :: itertools.permutations(iterable, r=None) :: r-length permutations in lexicographic order of positions.
combinations :: itertools.combinations(iterable, r) :: r-length combinations without replacement.
combinations_with_replacement :: itertools.combinations_with_replacement(iterable, r) :: Combinations with repeats.
product :: itertools.product(*iterables, repeat=1) :: Cartesian product: product('01', repeat=n).
accumulate :: itertools.accumulate(iterable, func=operator.add, initial=None) :: Prefix sums: list(accumulate(a, initial=0)).
chain :: itertools.chain(*iterables) :: Concatenates iterables.
groupby :: itertools.groupby(iterable, key=None) :: Groups consecutive equal keys.
islice :: itertools.islice(iterable, stop) :: Slices an iterator.
count :: itertools.count(start=0, step=1) :: Infinite counter.
cycle :: itertools.cycle(iterable) :: Repeats forever.
repeat :: itertools.repeat(x, times=None) :: Repeats x.
zip_longest :: itertools.zip_longest(*iterables, fillvalue=None) :: Zip padding shorter.
pairwise :: itertools.pairwise(iterable) :: Consecutive pairs (3.10+).
`,
  collections: `
deque :: collections.deque(iterable=(), maxlen=None) :: Double-ended queue, O(1) at both ends.
defaultdict :: collections.defaultdict(default_factory) :: Dict with default factory.
Counter :: collections.Counter(iterable) :: Counts hashables.
OrderedDict :: collections.OrderedDict() :: Ordered dict.
namedtuple :: collections.namedtuple(typename, field_names) :: Tuple with named fields.
`,
  functools: `
lru_cache :: functools.lru_cache(maxsize=128) :: Memoization decorator: @lru_cache(None) on recursive functions. Raise recursion limit for deep recursion.
cache :: functools.cache :: Unbounded memoization decorator (3.9+).
reduce :: functools.reduce(function, iterable, initial) :: Folds an iterable.
cmp_to_key :: functools.cmp_to_key(func) :: Converts an old-style comparator to a sort key.
total_ordering :: functools.total_ordering :: Fill in comparison methods.
`,
  sys: `
stdin :: sys.stdin :: Standard input stream.
stdout :: sys.stdout :: Standard output stream.
stderr :: sys.stderr :: Standard error.
setrecursionlimit :: sys.setrecursionlimit(limit) :: Raise for deep recursion (also consider threading.stack_size).
exit :: sys.exit(code=0) :: Exits.
maxsize :: sys.maxsize :: Largest machine int (2**63 - 1).
argv :: sys.argv :: Command-line args.
`,
  random: `
randint :: random.randint(a, b) :: Random int in [a, b].
random :: random.random() :: Float in [0, 1).
shuffle :: random.shuffle(x) :: Shuffles in place.
choice :: random.choice(seq) :: Random element.
sample :: random.sample(population, k) :: k unique elements.
seed :: random.seed(a=None) :: Seeds the RNG.
randrange :: random.randrange(start, stop) :: Random from range.
`,
  string: `
## Constant
ascii_lowercase :: string.ascii_lowercase :: 'abc...z'
ascii_uppercase :: string.ascii_uppercase :: 'ABC...Z'
ascii_letters :: string.ascii_letters :: Lower + upper letters.
digits :: string.digits :: '0123456789'
`,
  operator: `
itemgetter :: operator.itemgetter(*items) :: Key function: sorted(a, key=itemgetter(1)).
add :: operator.add(a, b) :: a + b.
mul :: operator.mul(a, b) :: a * b.
xor :: operator.xor(a, b) :: a ^ b.
`,
  'sys.stdin': STDIN,
  'sys.stdout': `write :: sys.stdout.write(s) :: Writes a string (no newline).\nflush :: sys.stdout.flush() :: Flush output.\n`,
};
export const moduleDocs = {
  heapq: 'Heap queue (min-heap).', bisect: 'Binary search on sorted lists.', math: 'Math functions.', itertools: 'Iterator building blocks.',
  collections: 'Container datatypes.', functools: 'Higher-order functions & caching.', sys: 'System-specific parameters (stdin/stdout).',
  random: 'Random numbers.', string: 'String constants.', operator: 'Operators as functions.',
};

export const snippets = [
['tmpl', 'Competitive programming template', String.raw`import sys
input = sys.stdin.readline

def solve():
    @0

def main():
    t = int(input())
    for _ in range(t):
        solve()

main()`],
['fastin', 'Fast input', `import sys\ninput = sys.stdin.readline\n@0`],
['readall', 'Read all input as tokens', String.raw`import sys
data = sys.stdin.buffer.read().split()
idx = 0
@0`],
['ints', 'Read a line of ints', `@{1:a} = list(map(int, input().split()))@0`],
['mi', 'Read ints into variables', `@{1:n}, @{2:m} = map(int, input().split())@0`],
['readn', 'Read n and a list', String.raw`n = int(input())
@{1:a} = list(map(int, input().split()))
@0`],
['fori', 'for i in range(n)', String.raw`for @{1:i} in range(@{2:n}):
    @0`],
['forr', 'for i descending', String.raw`for @{1:i} in range(@{2:n} - 1, -1, -1):
    @0`],
['fore', 'for index, value in enumerate', String.raw`for @{1:i}, @{2:x} in enumerate(@{3:a}):
    @0`],
['tc', 'Testcase loop', String.raw`for _ in range(int(input())):
    @0`],
['main', 'if __name__ == main', String.raw`def main():
    @0

if __name__ == "__main__":
    main()`],
['bs', 'Binary search: first index where pred is true', String.raw`lo, hi = @{1:0}, @{2:n}
while lo < hi:
    mid = (lo + hi) // 2
    if @{3:check(mid)}:
        hi = mid
    else:
        lo = mid + 1
# lo is the first true
@0`],
['bsa', 'Binary search on answer (maximize)', String.raw`lo, hi = @{1:0}, @{2:10**9}
while lo < hi:
    mid = (lo + hi + 1) // 2
    if @{3:ok(mid)}:
        lo = mid
    else:
        hi = mid - 1
@0`],
['twoptr', 'Two pointers / sliding window', String.raw`l = 0
for r in range(@{1:n}):
    # add a[r]
    while @{2:False}:  # window invalid
        # remove a[l]
        l += 1
    @0`],
['prefix', 'Prefix sums', String.raw`pre = [0] * (@{1:n} + 1)
for i in range(@{1:n}):
    pre[i + 1] = pre[i] + @{2:a}[i]
# sum of [l, r) = pre[r] - pre[l]
@0`],
['sortkey', 'sort with key', `@{1:a}.sort(key=lambda @{2:x}: @{3:x})@0`],
['modpow', 'Modular exponentiation', `pow(@{1:b}, @{2:e}, @{3:MOD})@0`],
['ncr', 'nCr mod p with factorials', String.raw`MOD = @{1:10**9 + 7}
N = @{2:10**6 + 1}
fact = [1] * N
for i in range(1, N):
    fact[i] = fact[i - 1] * i % MOD
inv_fact = [1] * N
inv_fact[N - 1] = pow(fact[N - 1], MOD - 2, MOD)
for i in range(N - 1, 0, -1):
    inv_fact[i - 1] = inv_fact[i] * i % MOD

def ncr(n, r):
    if r < 0 or r > n:
        return 0
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD
@0`],
['sieve', 'Sieve of Eratosthenes', String.raw`N = @{1:10**6}
is_prime = [True] * (N + 1)
is_prime[0] = is_prime[1] = False
for i in range(2, int(N ** 0.5) + 1):
    if is_prime[i]:
        for j in range(i * i, N + 1, i):
            is_prime[j] = False
@0`],
['dsu', 'Disjoint set union', String.raw`class DSU:
    def __init__(self, n):
        self.p = list(range(n))
        self.sz = [1] * n

    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.sz[a] < self.sz[b]:
            a, b = b, a
        self.p[b] = a
        self.sz[a] += self.sz[b]
        return True
@0`],
['seg', 'Iterative segment tree (sum)', String.raw`class SegTree:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (2 * n)

    def update(self, i, v):
        i += self.n
        self.t[i] = v
        while i > 1:
            i >>= 1
            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]

    def query(self, l, r):  # [l, r)
        res = 0
        l += self.n
        r += self.n
        while l < r:
            if l & 1:
                res += self.t[l]
                l += 1
            if r & 1:
                r -= 1
                res += self.t[r]
            l >>= 1
            r >>= 1
        return res
@0`],
['fenwick', 'Fenwick tree (BIT)', String.raw`class BIT:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, v):
        i += 1
        while i <= self.n:
            self.t[i] += v
            i += i & -i

    def sum(self, i):  # [0, i]
        i += 1
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s
@0`],
['bfsgrid', 'BFS on a grid', String.raw`from collections import deque
dist = [[-1] * @{2:m} for _ in range(@{1:n})]
dist[@{3:sx}][@{4:sy}] = 0
q = deque([(@{3:sx}, @{4:sy})])
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < @{1:n} and 0 <= ny < @{2:m} and dist[nx][ny] == -1:
            dist[nx][ny] = dist[x][y] + 1
            q.append((nx, ny))
@0`],
['bfs', 'BFS on a graph', String.raw`from collections import deque
dist = [-1] * @{1:n}
dist[@{2:s}] = 0
q = deque([@{2:s}])
while q:
    u = q.popleft()
    for v in @{3:adj}[u]:
        if dist[v] == -1:
            dist[v] = dist[u] + 1
            q.append(v)
@0`],
['dfs', 'Iterative DFS', String.raw`vis = [False] * @{1:n}
stack = [@{2:s}]
while stack:
    u = stack.pop()
    if vis[u]:
        continue
    vis[u] = True
    for v in @{3:adj}[u]:
        if not vis[v]:
            stack.append(v)
@0`],
['graph', 'Read an undirected graph', String.raw`n, m = map(int, input().split())
adj = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    adj[u].append(v)
    adj[v].append(u)
@0`],
['dijk', 'Dijkstra with heapq', String.raw`import heapq
dist = [float('inf')] * (@{1:n} + 1)
dist[@{2:s}] = 0
pq = [(0, @{2:s})]
while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]:
        continue
    for v, w in @{3:adj}[u]:  # adj[u] = [(v, w), ...]
        nd = d + w
        if nd < dist[v]:
            dist[v] = nd
            heapq.heappush(pq, (nd, v))
@0`],
['lru', 'Memoized recursion', String.raw`from functools import lru_cache
import sys
sys.setrecursionlimit(1 << 20)

@lru_cache(maxsize=None)
def @{1:f}(@{2:n}):
    @0`],
['dd', 'defaultdict', `from collections import defaultdict\n@{1:d} = defaultdict(@{2|int,list,set|})@0`],
['cnt', 'Counter', `from collections import Counter\n@{1:c} = Counter(@{2:a})@0`],
['yesno', 'Print YES/NO', `print("YES" if @{1:cond} else "NO")@0`],
['grid', 'Read an n x m grid', String.raw`n, m = map(int, input().split())
grid = [input().strip() for _ in range(n)]
@0`],
];
