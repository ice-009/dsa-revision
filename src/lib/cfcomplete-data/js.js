// JavaScript completion data (CP extras on top of Monaco's built-in JS service).
export const globals = `
## Class
Map :: new Map(iterable?) :: Hash map with any key type. get/set/has O(1). :: new Map()
Set :: new Set(iterable?) :: Hash set. add/has/delete O(1). :: new Set()
BigInt :: BigInt(value) :: Arbitrary-precision integers (needed past 2**53): 10n ** 18n.
Array :: Array(n) :: Array constructor: Array(n).fill(0), Array.from({length: n}, fn).
## Function
require :: require(module) :: CommonJS import: const fs = require('fs'). :: require('\${1|fs,readline|}')
parseInt :: parseInt(string, radix?) :: Parses an integer.
parseFloat :: parseFloat(string) :: Parses a float.
## Variable
console :: console :: console.log(x) prints; console.log(arr.join('\\n')) is much faster than many calls.
process :: process :: Node process: process.stdin, process.stdout.write.
Infinity :: Infinity :: Positive infinity.
## Keyword
const
let
var
function
return
for
while
if
else
break
continue
new
`;
const ARR = `
push :: arr.push(...items) :: Appends; returns new length. O(1).
pop :: arr.pop() :: Removes last. O(1).
shift :: arr.shift() :: Removes first. O(n)! Use an index pointer for BFS queues.
unshift :: arr.unshift(...items) :: Prepends. O(n).
slice :: arr.slice(start?, end?) :: Shallow copy of [start, end). O(k).
splice :: arr.splice(start, deleteCount, ...items) :: Removes/inserts in place. O(n).
concat :: arr.concat(...arrays) :: Concatenation copy.
indexOf :: arr.indexOf(x) :: First index or -1. O(n).
lastIndexOf :: arr.lastIndexOf(x) :: Last index or -1.
includes :: arr.includes(x) :: Membership. O(n).
find :: arr.find(fn) :: First matching element.
findIndex :: arr.findIndex(fn) :: Index of first match.
filter :: arr.filter(fn) :: Elements passing the test.
map :: arr.map(fn) :: Transforms elements.
reduce :: arr.reduce((acc, x) => acc, init) :: Folds the array.
forEach :: arr.forEach(fn) :: Iterates.
some :: arr.some(fn) :: Any passes.
every :: arr.every(fn) :: All pass.
sort :: arr.sort(compareFn) :: Sorts in place. DEFAULT SORTS AS STRINGS: use (a, b) => a - b for numbers. O(n log n).
reverse :: arr.reverse() :: Reverses in place.
join :: arr.join(sep = ',') :: Joins into a string.
fill :: arr.fill(value, start?, end?) :: Fills in place. Do not fill with an array/object (shared reference).
flat :: arr.flat(depth = 1) :: Flattens nested arrays.
at :: arr.at(i) :: Element at index; negative counts from the end.
keys :: arr.keys() :: Iterator of indices.
entries :: arr.entries() :: Iterator of [index, value].
`;
const STR = `
split :: str.split(sep, limit?) :: Splits into an array: line.split(' ').map(Number).
trim :: str.trim() :: Strips whitespace.
slice :: str.slice(start, end?) :: Substring [start, end).
substring :: str.substring(start, end?) :: Substring.
indexOf :: str.indexOf(s) :: First index or -1.
includes :: str.includes(s) :: Substring test.
startsWith :: str.startsWith(s) :: Prefix test.
endsWith :: str.endsWith(s) :: Suffix test.
charAt :: str.charAt(i) :: Char at i.
charCodeAt :: str.charCodeAt(i) :: UTF-16 code of char: c.charCodeAt(0) - 97 for 'a'.
repeat :: str.repeat(n) :: Repeats n times.
replace :: str.replace(pattern, replacement) :: First match only; use replaceAll for all.
replaceAll :: str.replaceAll(a, b) :: Replaces all.
padStart :: str.padStart(len, fill) :: Pad left.
padEnd :: str.padEnd(len, fill) :: Pad right.
toUpperCase :: str.toUpperCase() :: Uppercase.
toLowerCase :: str.toLowerCase() :: Lowercase.
localeCompare :: str.localeCompare(other) :: Compare strings.
`;
const MAP = `
get :: map.get(key) :: Value or undefined.
set :: map.set(key, value) :: Sets and returns the map.
has :: map.has(key) :: Key exists.
delete :: map.delete(key) :: Removes key.
clear :: map.clear() :: Removes all.
keys :: map.keys() :: Iterator of keys.
values :: map.values() :: Iterator of values.
entries :: map.entries() :: Iterator of [k, v].
forEach :: map.forEach((v, k) => {}) :: Iterates.
## Property
size :: map.size :: Number of entries.
`;
const SET = `
add :: set.add(x) :: Adds x.
has :: set.has(x) :: Membership. O(1).
delete :: set.delete(x) :: Removes x.
clear :: set.clear() :: Removes all.
values :: set.values() :: Iterator of values.
forEach :: set.forEach(fn) :: Iterates.
## Property
size :: set.size :: Number of elements.
`;
export const members = {
  array: ARR + `## Property\nlength :: arr.length :: Number of elements.\n`,
  string: STR + `## Property\nlength :: str.length :: Length.\n`,
  map: MAP,
  set: SET,
};
export const statics = {
  Math: `
max :: Math.max(...values) :: Largest. Math.max(...arr) breaks for ~100k+ elements; use a loop.
min :: Math.min(...values) :: Smallest.
abs :: Math.abs(x) :: Absolute value.
floor :: Math.floor(x) :: Round down.
ceil :: Math.ceil(x) :: Round up.
round :: Math.round(x) :: Round to nearest.
trunc :: Math.trunc(x) :: Integer part.
sqrt :: Math.sqrt(x) :: Square root.
cbrt :: Math.cbrt(x) :: Cube root.
pow :: Math.pow(base, exp) :: Power (floating point; use BigInt for exact big numbers).
log :: Math.log(x) :: Natural log.
log2 :: Math.log2(x) :: Base-2 log.
log10 :: Math.log10(x) :: Base-10 log.
hypot :: Math.hypot(...values) :: sqrt of sum of squares.
sign :: Math.sign(x) :: -1, 0, 1.
random :: Math.random() :: [0, 1).
imul :: Math.imul(a, b) :: 32-bit integer multiply (for hashing/mod tricks).
clz32 :: Math.clz32(x) :: Leading zeros of 32-bit int.
## Constant
PI :: Math.PI :: 3.14159...
E :: Math.E :: 2.71828...
`,
  console: `
log :: console.log(...data) :: Prints a line to stdout.
error :: console.error(...data) :: Prints to stderr.
table :: console.table(data) :: Table output.
`,
  Array: `
from :: Array.from(iterable | {length}, mapFn?) :: e.g. Array.from({length: n}, () => 0).
isArray :: Array.isArray(x) :: Array check.
of :: Array.of(...items) :: Array from args.
`,
  Number: `
isInteger :: Number.isInteger(x) :: Integer check.
isSafeInteger :: Number.isSafeInteger(x) :: Within 2**53.
parseInt :: Number.parseInt(s, radix?) :: Parse integer.
## Constant
MAX_SAFE_INTEGER :: Number.MAX_SAFE_INTEGER :: 9007199254740991
MIN_SAFE_INTEGER :: Number.MIN_SAFE_INTEGER :: -9007199254740991
EPSILON :: Number.EPSILON :: Float epsilon.
`,
  Object: `
keys :: Object.keys(obj) :: Own keys.
values :: Object.values(obj) :: Own values.
entries :: Object.entries(obj) :: [key, value] pairs.
assign :: Object.assign(target, ...src) :: Shallow merge.
`,
  JSON: `stringify :: JSON.stringify(value) :: To JSON.\nparse :: JSON.parse(text) :: From JSON.\n`,
  process: `
## Variable
stdin :: process.stdin :: Input stream.
stdout :: process.stdout :: Output stream.
`,
  'process.stdout': `write :: process.stdout.write(s) :: Writes without newline; build one big string and write once.\n`,
  'process.stdin': `on :: process.stdin.on(event, cb) :: Events: 'data', 'end'.\nsetEncoding :: process.stdin.setEncoding(enc) :: e.g. 'utf8'.\n`,
  fs: `
readFileSync :: fs.readFileSync(path | 0, encoding?) :: Reads stdin with fs.readFileSync(0, 'utf8') or '/dev/stdin'. Fast.
writeFileSync :: fs.writeFileSync(path | 1, data) :: Writes output, e.g. fs.writeFileSync(1, out).
`,
  readline: `createInterface :: readline.createInterface({ input: process.stdin }) :: Line-by-line reader.\n`,
  BigInt: `asUintN :: BigInt.asUintN(bits, n) :: Wrap to unsigned.\nasIntN :: BigInt.asIntN(bits, n) :: Wrap to signed.\n`,
};
export const RHS_TYPES = [
  [/^\[/, 'array'], [/^(new\s+)?Array\b/, 'array'], [/\.(split|map|filter|slice|sort)\s*\(/, 'array'],
  [/^new\s+Map\b/, 'map'], [/^new\s+Set\b/, 'set'],
  [/^(["'`]|String\s*\()/, 'string'], [/\.(toString|trim|join|toUpperCase|toLowerCase)\s*\(/, 'string'],
];
export const snippets = [
['tmpl', 'Competitive programming template (read all stdin)', String.raw`const data = require('fs').readFileSync(0, 'utf8').split('\n');
let ptr = 0;
const readLine = () => data[ptr++];
const readInts = () => readLine().split(' ').map(Number);

function solve() {
    @0
}

const t = parseInt(readLine());
const out = [];
for (let i = 0; i < t; i++) out.push(solve());
console.log(out.join('\n'));`],
['fastio', 'Fast input helpers', String.raw`const data = require('fs').readFileSync(0, 'utf8').split('\n');
let ptr = 0;
const readLine = () => data[ptr++];
const readInts = () => readLine().split(' ').map(Number);
@0`],
['readn', 'Read n and an array', String.raw`const n = parseInt(readLine());
const @{1:a} = readInts();
@0`],
['fori', 'for i in [0, n)', String.raw`for (let @{1:i} = 0; @{1:i} < @{2:n}; @{1:i}++) {
    @0
}`],
['forr', 'for i from n-1 down to 0', String.raw`for (let @{1:i} = @{2:n} - 1; @{1:i} >= 0; @{1:i}--) {
    @0
}`],
['forn', 'for i in [1, n]', String.raw`for (let @{1:i} = 1; @{1:i} <= @{2:n}; @{1:i}++) {
    @0
}`],
['forof', 'for...of', String.raw`for (const @{1:x} of @{2:arr}) {
    @0
}`],
['tc', 'Testcase loop', String.raw`const t = parseInt(readLine());
for (let tc = 0; tc < t; tc++) {
    @0
}`],
['arr2d', '2D array filled with value', `const @{1:grid} = Array.from({ length: @{2:n} }, () => new Array(@{3:m}).fill(@{4:0}));@0`],
['bs', 'Binary search: first index where pred is true', String.raw`let lo = @{1:0}, hi = @{2:n};
while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (@{3:check(mid)}) hi = mid;
    else lo = mid + 1;
}
@0`],
['bsa', 'Binary search on answer (maximize)', String.raw`let lo = @{1:0}, hi = @{2:1e9};
while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (@{3:ok(mid)}) lo = mid;
    else hi = mid - 1;
}
@0`],
['twoptr', 'Two pointers / sliding window', String.raw`let l = 0;
for (let r = 0; r < @{1:n}; r++) {
    // add a[r]
    while (@{2:false}) {  // window invalid
        // remove a[l]
        l++;
    }
    @0
}`],
['prefix', 'Prefix sums', String.raw`const pre = new Array(@{1:n} + 1).fill(0);
for (let i = 0; i < @{1:n}; i++) pre[i + 1] = pre[i] + @{2:a}[i];
// sum of [l, r) = pre[r] - pre[l]
@0`],
['sortcmp', 'Numeric sort / comparator', `@{1:a}.sort((a, b) => @{2:a - b});@0`],
['modpow', 'Modular exponentiation (BigInt)', String.raw`function modpow(b, e, m) {
    b = BigInt(b) % m; e = BigInt(e);
    let r = 1n;
    while (e > 0n) {
        if (e & 1n) r = r * b % m;
        b = b * b % m;
        e >>= 1n;
    }
    return r;
}
@0`],
['sieve', 'Sieve of Eratosthenes', String.raw`const isPrime = new Uint8Array(@{1:N} + 1).fill(1);
isPrime[0] = isPrime[1] = 0;
for (let i = 2; i * i <= @{1:N}; i++)
    if (isPrime[i])
        for (let j = i * i; j <= @{1:N}; j += i) isPrime[j] = 0;
@0`],
['dsu', 'Disjoint set union', String.raw`class DSU {
    constructor(n) { this.p = Array.from({ length: n }, (_, i) => i); this.sz = new Array(n).fill(1); }
    find(x) { while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; }
    union(a, b) {
        a = this.find(a); b = this.find(b);
        if (a === b) return false;
        if (this.sz[a] < this.sz[b]) [a, b] = [b, a];
        this.p[b] = a; this.sz[a] += this.sz[b];
        return true;
    }
}
@0`],
['fenwick', 'Fenwick tree (BIT)', String.raw`class BIT {
    constructor(n) { this.n = n; this.t = new Array(n + 1).fill(0); }
    add(i, v) { for (i++; i <= this.n; i += i & -i) this.t[i] += v; }
    sum(i) { let s = 0; for (i++; i > 0; i -= i & -i) s += this.t[i]; return s; }  // [0, i]
}
@0`],
['seg', 'Iterative segment tree (sum)', String.raw`class SegTree {
    constructor(n) { this.n = n; this.t = new Array(2 * n).fill(0); }
    update(i, v) { for (this.t[i += this.n] = v; i > 1; i >>= 1) this.t[i >> 1] = this.t[i] + this.t[i ^ 1]; }
    query(l, r) {  // [l, r)
        let res = 0;
        for (l += this.n, r += this.n; l < r; l >>= 1, r >>= 1) {
            if (l & 1) res += this.t[l++];
            if (r & 1) res += this.t[--r];
        }
        return res;
    }
}
@0`],
['bfsgrid', 'BFS on a grid', String.raw`const dist = Array.from({ length: @{1:n} }, () => new Array(@{2:m}).fill(-1));
const q = [[@{3:sx}, @{4:sy}]];
dist[@{3:sx}][@{4:sy}] = 0;
for (let head = 0; head < q.length; head++) {
    const [x, y] = q[head];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= @{1:n} || ny >= @{2:m} || dist[nx][ny] !== -1) continue;
        dist[nx][ny] = dist[x][y] + 1;
        q.push([nx, ny]);
    }
}
@0`],
['bfs', 'BFS on a graph', String.raw`const dist = new Array(@{1:n}).fill(-1);
const q = [@{2:s}];
dist[@{2:s}] = 0;
for (let head = 0; head < q.length; head++) {
    const u = q[head];
    for (const v of @{3:adj}[u]) {
        if (dist[v] !== -1) continue;
        dist[v] = dist[u] + 1;
        q.push(v);
    }
}
@0`],
['heap', 'Binary min-heap class', String.raw`class MinHeap {
    constructor(cmp = (a, b) => a - b) { this.h = []; this.cmp = cmp; }
    get size() { return this.h.length; }
    push(x) {
        const h = this.h; h.push(x);
        let i = h.length - 1;
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.cmp(h[i], h[p]) >= 0) break;
            [h[i], h[p]] = [h[p], h[i]]; i = p;
        }
    }
    pop() {
        const h = this.h, top = h[0], last = h.pop();
        if (h.length) {
            h[0] = last;
            let i = 0;
            for (;;) {
                let l = 2 * i + 1, r = l + 1, m = i;
                if (l < h.length && this.cmp(h[l], h[m]) < 0) m = l;
                if (r < h.length && this.cmp(h[r], h[m]) < 0) m = r;
                if (m === i) break;
                [h[i], h[m]] = [h[m], h[i]]; i = m;
            }
        }
        return top;
    }
}
@0`],
['dijk', 'Dijkstra (needs MinHeap)', String.raw`const dist = new Array(@{1:n} + 1).fill(Infinity);
const pq = new MinHeap((a, b) => a[0] - b[0]);
dist[@{2:s}] = 0;
pq.push([0, @{2:s}]);
while (pq.size) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;
    for (const [v, w] of @{3:adj}[u]) {
        if (d + w < dist[v]) {
            dist[v] = d + w;
            pq.push([dist[v], v]);
        }
    }
}
@0`],
['yesno', 'YES/NO', `out.push(@{1:cond} ? 'YES' : 'NO');@0`],
];
