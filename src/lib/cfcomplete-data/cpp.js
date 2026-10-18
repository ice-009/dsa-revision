// C++ completion data. Line format: label :: detail :: doc [:: snippet]. "## Kind" switches the kind.
export const globals = `
## Class
vector :: template<class T> class vector :: Dynamic array. push_back amortized O(1), random access O(1), insert/erase in middle O(n). :: vector<\${1:int}>$0
string :: class string :: Mutable character sequence. Concatenation \`+=\` amortized O(1) per char.
map :: template<class K, class V> class map :: Ordered key-value map (red-black tree). find/insert/erase O(log n). :: map<\${1:int}, \${2:int}>$0
unordered_map :: template<class K, class V> class unordered_map :: Hash map. Average O(1), worst O(n). Can be hacked on Codeforces with anti-hash tests. :: unordered_map<\${1:int}, \${2:int}>$0
multimap :: template<class K, class V> class multimap :: Ordered map allowing duplicate keys. :: multimap<\${1:int}, \${2:int}>$0
set :: template<class T> class set :: Ordered unique set. insert/find/erase O(log n). :: set<\${1:int}>$0
multiset :: template<class T> class multiset :: Ordered set allowing duplicates. erase(value) removes ALL equal; use erase(find(x)) for one. :: multiset<\${1:int}>$0
unordered_set :: template<class T> class unordered_set :: Hash set, average O(1). :: unordered_set<\${1:int}>$0
queue :: template<class T> class queue :: FIFO queue. push/pop/front O(1). :: queue<\${1:int}>$0
deque :: template<class T> class deque :: Double-ended queue. push/pop at both ends O(1), random access O(1). :: deque<\${1:int}>$0
stack :: template<class T> class stack :: LIFO stack. push/pop/top O(1). :: stack<\${1:int}>$0
priority_queue :: template<class T, class C = vector<T>, class Cmp = less<T>> class priority_queue :: Max-heap by default. Use \`priority_queue<T, vector<T>, greater<T>>\` for a min-heap. push/pop O(log n), top O(1). :: priority_queue<\${1:int}>$0
pair :: template<class A, class B> struct pair :: Two values: .first and .second. Compares lexicographically. :: pair<\${1:int}, \${2:int}>$0
tuple :: template<class... T> class tuple :: Fixed-size heterogeneous tuple. Access with get<i>(t) or structured bindings. :: tuple<\${1:int}, \${2:int}, \${3:int}>$0
bitset :: template<size_t N> class bitset :: Fixed-size bit array. Bitwise ops O(N/64). :: bitset<\${1:N}>$0
array :: template<class T, size_t N> struct array :: Fixed-size array with STL interface. :: array<\${1:int}, \${2:N}>$0
list :: template<class T> class list :: Doubly linked list. O(1) insert/erase given an iterator. :: list<\${1:int}>$0
greater :: template<class T> struct greater :: Comparator for descending order, e.g. sort(v.begin(), v.end(), greater<int>()). :: greater<\${1:int}>()
less :: template<class T> struct less :: Comparator for ascending order. :: less<\${1:int}>()
numeric_limits :: template<class T> class numeric_limits :: e.g. numeric_limits<int>::max() :: numeric_limits<\${1:int}>::\${2|max,min,lowest|}()
mt19937 :: class mt19937 :: Mersenne twister RNG. Seed with chrono::steady_clock::now().time_since_epoch().count(). :: mt19937 \${1:rng}(chrono::steady_clock::now().time_since_epoch().count());
size_t :: typedef unsigned long size_t :: Unsigned size type returned by .size().
## Function
sort :: void sort(RandomIt first, RandomIt last) | void sort(RandomIt first, RandomIt last, Compare comp) :: Sorts [first, last) ascending. O(n log n). Comparator must be a strict weak ordering (use < not <=).
stable_sort :: void stable_sort(RandomIt first, RandomIt last) | void stable_sort(RandomIt first, RandomIt last, Compare comp) :: Stable sort, O(n log n).
partial_sort :: void partial_sort(RandomIt first, RandomIt middle, RandomIt last) :: Smallest elements sorted in [first, middle). O(n log k).
nth_element :: void nth_element(RandomIt first, RandomIt nth, RandomIt last) :: Puts the nth smallest at position nth. Average O(n).
lower_bound :: It lower_bound(It first, It last, const T& value) | It lower_bound(It first, It last, const T& value, Compare comp) :: First element >= value in a sorted range. O(log n). For set/map use the member function.
upper_bound :: It upper_bound(It first, It last, const T& value) | It upper_bound(It first, It last, const T& value, Compare comp) :: First element > value in a sorted range. O(log n).
binary_search :: bool binary_search(It first, It last, const T& value) :: Whether value exists in the sorted range. O(log n).
equal_range :: pair<It, It> equal_range(It first, It last, const T& value) :: Range of elements equal to value in a sorted range. O(log n).
reverse :: void reverse(BidirIt first, BidirIt last) :: Reverses [first, last). O(n).
rotate :: It rotate(It first, It middle, It last) :: Left-rotates so middle becomes first. O(n).
unique :: It unique(It first, It last) :: Removes consecutive duplicates, returns new end. Use with erase: v.erase(unique(v.begin(), v.end()), v.end()). O(n).
next_permutation :: bool next_permutation(It first, It last) :: Next lexicographic permutation; false when wrapped around. Sort first to enumerate all.
prev_permutation :: bool prev_permutation(It first, It last) :: Previous lexicographic permutation.
accumulate :: T accumulate(It first, It last, T init) | T accumulate(It first, It last, T init, BinaryOp op) :: Sum (or fold) of a range. Use 0LL as init to avoid int overflow. Needs <numeric>. O(n).
partial_sum :: OutIt partial_sum(It first, It last, OutIt out) :: Prefix sums into out. <numeric>. O(n).
adjacent_difference :: OutIt adjacent_difference(It first, It last, OutIt out) :: Differences of neighbours. <numeric>.
inner_product :: T inner_product(It1 f1, It1 l1, It2 f2, T init) :: Dot product. <numeric>.
iota :: void iota(It first, It last, T value) :: Fills with value, value+1, ... e.g. iota(p.begin(), p.end(), 0). <numeric>.
fill :: void fill(It first, It last, const T& value) :: Assigns value to every element. O(n).
fill_n :: It fill_n(It first, Size n, const T& value) :: Assigns value to n elements.
memset :: void* memset(void* ptr, int value, size_t num) :: Fills bytes. Only reliable for 0, -1 and 0x3f (large ~1e9 INF). e.g. memset(a, -1, sizeof a).
memcpy :: void* memcpy(void* dest, const void* src, size_t n) :: Copies n bytes.
memcmp :: int memcmp(const void* a, const void* b, size_t n) :: Compares n bytes.
min :: const T& min(const T& a, const T& b) | T min(initializer_list<T> il) :: Smaller of a and b. Both must be the same type (e.g. min(1LL, x)).
max :: const T& max(const T& a, const T& b) | T max(initializer_list<T> il) :: Larger of a and b. Both must be the same type.
minmax :: pair<T, T> minmax(const T& a, const T& b) :: Pair of (min, max).
min_element :: It min_element(It first, It last) :: Iterator to the smallest element. O(n).
max_element :: It max_element(It first, It last) :: Iterator to the largest element. Dereference with *. O(n).
swap :: void swap(T& a, T& b) :: Swaps two values.
__gcd :: T __gcd(T a, T b) :: GCD (GCC builtin). O(log n).
gcd :: T gcd(T a, T b) :: Greatest common divisor, C++17 <numeric>. O(log n).
lcm :: T lcm(T a, T b) :: Least common multiple, C++17. Overflows easily: use a / gcd(a, b) * b.
abs :: int abs(int x) | double abs(double x) :: Absolute value. Use llabs for long long.
llabs :: long long llabs(long long x) :: Absolute value of long long.
fabs :: double fabs(double x) :: Absolute value of a double.
pow :: double pow(double base, double exp) :: Floating-point power. Not exact for big integers; use a modpow loop instead.
sqrt :: double sqrt(double x) :: Square root. Use sqrtl for long double.
sqrtl :: long double sqrtl(long double x) :: Square root in long double.
cbrt :: double cbrt(double x) :: Cube root.
ceil :: double ceil(double x) :: Rounds up.
floor :: double floor(double x) :: Rounds down.
round :: double round(double x) :: Rounds to nearest integer.
trunc :: double trunc(double x) :: Rounds toward zero.
fmod :: double fmod(double x, double y) :: Floating-point remainder.
hypot :: double hypot(double x, double y) :: sqrt(x*x + y*y).
atan2 :: double atan2(double y, double x) :: Angle of point (x, y).
log :: double log(double x) :: Natural logarithm.
log2 :: double log2(double x) :: Base-2 logarithm.
log10 :: double log10(double x) :: Base-10 logarithm.
exp :: double exp(double x) :: e raised to x.
sin :: double sin(double x) :: Sine (radians).
cos :: double cos(double x) :: Cosine (radians).
__builtin_popcount :: int __builtin_popcount(unsigned x) :: Number of set bits (32-bit).
__builtin_popcountll :: int __builtin_popcountll(unsigned long long x) :: Number of set bits (64-bit).
__builtin_clz :: int __builtin_clz(unsigned x) :: Leading zeros (x != 0). floor(log2 x) = 31 - clz(x).
__builtin_clzll :: int __builtin_clzll(unsigned long long x) :: Leading zeros, 64-bit (x != 0). floor(log2 x) = 63 - clzll(x).
__builtin_ctz :: int __builtin_ctz(unsigned x) :: Trailing zeros (x != 0).
__builtin_ctzll :: int __builtin_ctzll(unsigned long long x) :: Trailing zeros, 64-bit (x != 0).
__builtin_parity :: int __builtin_parity(unsigned x) :: Parity of set bits.
__lg :: int __lg(unsigned x) :: floor(log2(x)) (GCC internal).
count :: Size count(It first, It last, const T& value) :: Number of elements equal to value. O(n).
count_if :: Size count_if(It first, It last, Pred p) :: Number of elements satisfying p.
find :: It find(It first, It last, const T& value) :: Linear search, returns last if not found. O(n).
find_if :: It find_if(It first, It last, Pred p) :: First element satisfying p.
any_of :: bool any_of(It first, It last, Pred p) :: True if any element satisfies p.
all_of :: bool all_of(It first, It last, Pred p) :: True if all elements satisfy p.
none_of :: bool none_of(It first, It last, Pred p) :: True if no element satisfies p.
for_each :: void for_each(It first, It last, Fn f) :: Applies f to each element.
transform :: OutIt transform(It first, It last, OutIt out, UnaryOp op) :: Applies op and writes to out.
copy :: OutIt copy(It first, It last, OutIt out) :: Copies a range.
remove :: It remove(It first, It last, const T& value) :: Shifts out matching values; use erase-remove idiom.
remove_if :: It remove_if(It first, It last, Pred p) :: Shifts out elements satisfying p.
replace :: void replace(It first, It last, const T& old, const T& neu) :: Replaces values.
merge :: OutIt merge(It1 f1, It1 l1, It2 f2, It2 l2, OutIt out) :: Merges two sorted ranges. O(n).
is_sorted :: bool is_sorted(It first, It last) :: Whether sorted ascending.
shuffle :: void shuffle(It first, It last, URBG&& g) :: Random permutation, e.g. shuffle(v.begin(), v.end(), rng).
distance :: ptrdiff_t distance(It first, It last) :: Number of steps, e.g. distance(v.begin(), it) is the index.
next :: It next(It it, ptrdiff_t n = 1) :: Iterator advanced by n.
prev :: It prev(It it, ptrdiff_t n = 1) :: Iterator moved back by n.
advance :: void advance(It& it, ptrdiff_t n) :: Moves iterator by n.
make_pair :: pair<A, B> make_pair(A a, B b) :: Builds a pair.
make_tuple :: tuple<T...> make_tuple(T... args) :: Builds a tuple.
tie :: tuple<T&...> tie(T&... args) :: Tuple of references, e.g. tie(a, b) = make_pair(1, 2).
get :: auto get<I>(tuple) :: Access tuple element I. :: get<\${1:0}>($0)
to_string :: string to_string(number value) :: Converts a number to string.
stoi :: int stoi(const string& s) :: Parses int.
stoll :: long long stoll(const string& s) :: Parses long long.
stod :: double stod(const string& s) :: Parses double.
stoul :: unsigned long stoul(const string& s) :: Parses unsigned long.
getline :: istream& getline(istream& in, string& s) :: Reads a whole line (use after cin >> x with cin.ignore() or ws).
move :: T&& move(T& x) :: Casts to rvalue to avoid a copy.
printf :: int printf(const char* fmt, ...) :: Formatted output. %d int, %lld long long, %c char, %s C-string, %.9f double, %lf double.
scanf :: int scanf(const char* fmt, ...) :: Formatted input. Pass addresses: scanf("%d", &x).
sprintf :: int sprintf(char* buf, const char* fmt, ...) :: Formatted write into a buffer.
snprintf :: int snprintf(char* buf, size_t n, const char* fmt, ...) :: Safe formatted write.
puts :: int puts(const char* s) :: Prints string and newline.
putchar :: int putchar(int c) :: Prints a char.
getchar :: int getchar() :: Reads a char.
strlen :: size_t strlen(const char* s) :: Length of a C-string.
strcmp :: int strcmp(const char* a, const char* b) :: Compares C-strings.
strcpy :: char* strcpy(char* dst, const char* src) :: Copies a C-string.
strcat :: char* strcat(char* dst, const char* src) :: Appends a C-string.
strchr :: char* strchr(const char* s, int c) :: First occurrence of c.
strstr :: char* strstr(const char* hay, const char* needle) :: First occurrence of substring.
isdigit :: int isdigit(int c) :: Is a decimal digit.
isalpha :: int isalpha(int c) :: Is a letter.
isalnum :: int isalnum(int c) :: Is a letter or digit.
islower :: int islower(int c) :: Is lowercase.
isupper :: int isupper(int c) :: Is uppercase.
toupper :: int toupper(int c) :: Uppercase char.
tolower :: int tolower(int c) :: Lowercase char.
setprecision :: setprecision(int n) :: Digits for output; use with fixed: cout << fixed << setprecision(9) << x.
setw :: setw(int n) :: Field width for next output.
sync_with_stdio :: bool ios::sync_with_stdio(bool sync) :: Pass false for fast I/O (don't mix with printf/scanf afterwards).
rand :: int rand() :: Poor RNG; prefer mt19937.
exit :: void exit(int code) :: Terminates the program.
clock :: clock_t clock() :: CPU time; divide by CLOCKS_PER_SEC.
## Variable
cin :: istream cin :: Standard input stream.
cout :: ostream cout :: Standard output stream. Prefer '\\n' over endl (endl flushes).
cerr :: ostream cerr :: Standard error stream (not judged).
endl :: ostream& endl(ostream&) :: Newline AND flush; slow in tight loops, prefer '\\n'.
fixed :: ios_base& fixed(ios_base&) :: Fixed-point float output.
npos :: static const size_t npos :: Returned by string::find when not found. :: string::npos
## Constant
INT_MAX :: 2147483647 :: Max int (~2.1e9). <climits>
INT_MIN :: -2147483648 :: Min int. <climits>
LLONG_MAX :: 9223372036854775807 :: Max long long (~9.2e18). <climits>
LLONG_MIN :: -9223372036854775808 :: Min long long. <climits>
UINT_MAX :: 4294967295 :: Max unsigned int.
ULLONG_MAX :: 18446744073709551615 :: Max unsigned long long.
INFINITY :: float INFINITY :: Floating infinity. <cmath>
M_PI :: 3.14159265358979 :: Pi (<cmath>, GCC).
nullptr :: nullptr_t :: Null pointer literal.
## Keyword
auto
const
constexpr
static
inline
struct
class
template
typename
namespace
using
typedef
return
continue
break
while
for
if
else
switch
case
default
do
true
false
long long
unsigned long long
int
double
char
bool
void
`;

const CONT = `
size :: size_t size() const :: Number of elements. O(1).
empty :: bool empty() const :: True if no elements. O(1).
clear :: void clear() :: Removes all elements.
begin :: iterator begin() :: Iterator to the first element.
end :: iterator end() :: Iterator past the last element.
rbegin :: reverse_iterator rbegin() :: Reverse iterator to the last element.
rend :: reverse_iterator rend() :: Reverse iterator before the first element.
cbegin :: const_iterator cbegin() const :: Const iterator to the first element.
cend :: const_iterator cend() const :: Const iterator past the end.
swap :: void swap(container& other) :: Swaps contents with another container. O(1) for most.
`;
const SEQ = `
front :: T& front() :: First element.
back :: T& back() :: Last element.
at :: T& at(size_t i) :: Bounds-checked access (throws out_of_range).
insert :: iterator insert(const_iterator pos, const T& value) | iterator insert(const_iterator pos, size_t n, const T& value) | iterator insert(const_iterator pos, It first, It last) :: Inserts before pos. O(n) for vector.
erase :: iterator erase(const_iterator pos) | iterator erase(const_iterator first, const_iterator last) :: Erases element(s). O(n) for vector.
emplace :: iterator emplace(const_iterator pos, Args&&... args) :: Constructs in place before pos.
resize :: void resize(size_t n) | void resize(size_t n, const T& value) :: Changes size, filling new slots with value (default 0).
assign :: void assign(size_t n, const T& value) | void assign(It first, It last) :: Replaces contents, e.g. v.assign(n, 0).
`;
const VEC = `
push_back :: void push_back(const T& value) :: Appends to the end. Amortized O(1).
emplace_back :: T& emplace_back(Args&&... args) :: Constructs in place at the end (e.g. v.emplace_back(a, b) for pairs).
pop_back :: void pop_back() :: Removes the last element. O(1).
reserve :: void reserve(size_t n) :: Reserves capacity to avoid reallocation.
capacity :: size_t capacity() const :: Allocated capacity.
data :: T* data() :: Pointer to the underlying array.
shrink_to_fit :: void shrink_to_fit() :: Releases unused capacity.
`;
const SETLIKE = `
insert :: pair<iterator, bool> insert(const T& value) :: Inserts value; .second tells if it was new. O(log n).
emplace :: pair<iterator, bool> emplace(Args&&... args) :: Constructs in place.
find :: iterator find(const T& key) :: Iterator to key or end(). O(log n) (hash: O(1) avg).
count :: size_t count(const T& key) const :: Occurrences of key (0 or 1 for set).
contains :: bool contains(const T& key) const :: Membership test (C++20).
erase :: size_t erase(const T& key) | iterator erase(iterator pos) :: Erases by key or iterator. For multiset, erase(find(x)) removes just one.
lower_bound :: iterator lower_bound(const T& key) :: First element >= key. O(log n). Use this, not std::lower_bound, on sets.
upper_bound :: iterator upper_bound(const T& key) :: First element > key. O(log n).
equal_range :: pair<iterator, iterator> equal_range(const T& key) :: Range of equal elements.
`;
const MAPLIKE = `
insert :: pair<iterator, bool> insert(const pair<K,V>& kv) :: Inserts if key is absent.
emplace :: pair<iterator, bool> emplace(Args&&... args) :: Constructs in place.
try_emplace :: pair<iterator, bool> try_emplace(const K& key, Args&&... args) :: Inserts only if key is absent (no overwrite).
find :: iterator find(const K& key) :: Iterator to key or end(); it->first, it->second. O(log n).
count :: size_t count(const K& key) const :: 1 if key exists else 0.
contains :: bool contains(const K& key) const :: Key membership (C++20).
erase :: size_t erase(const K& key) | iterator erase(iterator pos) :: Erase by key or iterator.
at :: V& at(const K& key) :: Value for key (throws if missing). Unlike [], never inserts.
lower_bound :: iterator lower_bound(const K& key) :: First entry with key >= key. O(log n).
upper_bound :: iterator upper_bound(const K& key) :: First entry with key > key. O(log n).
equal_range :: pair<iterator, iterator> equal_range(const K& key) :: Range of equal keys.
reserve :: void reserve(size_t n) :: Reserve buckets (unordered_*).
`;
const STR = `
length :: size_t length() const :: Number of characters. O(1).
substr :: string substr(size_t pos, size_t len = npos) const :: Substring starting at pos of length len. O(len).
find :: size_t find(const string& s, size_t pos = 0) const | size_t find(char c, size_t pos = 0) const :: First occurrence or string::npos.
rfind :: size_t rfind(const string& s, size_t pos = npos) const :: Last occurrence or string::npos.
find_first_of :: size_t find_first_of(const string& chars, size_t pos = 0) const :: First char in set.
find_last_of :: size_t find_last_of(const string& chars, size_t pos = npos) const :: Last char in set.
find_first_not_of :: size_t find_first_not_of(const string& chars, size_t pos = 0) const :: First char not in set.
append :: string& append(const string& s) :: Appends.
push_back :: void push_back(char c) :: Appends a char.
pop_back :: void pop_back() :: Removes last char.
compare :: int compare(const string& s) const :: <0, 0, >0 lexicographic.
c_str :: const char* c_str() const :: C-string pointer (for printf).
replace :: string& replace(size_t pos, size_t len, const string& s) :: Replaces a range.
starts_with :: bool starts_with(string_view sv) const :: Prefix check (C++20).
ends_with :: bool ends_with(string_view sv) const :: Suffix check (C++20).
data :: const char* data() const :: Pointer to chars.
`;
const QUEUE = `
push :: void push(const T& value) :: Adds an element.
emplace :: void emplace(Args&&... args) :: Constructs in place.
pop :: void pop() :: Removes the front element (does not return it).
front :: T& front() :: Front element.
back :: T& back() :: Last pushed element.
`;
const PQ = `
push :: void push(const T& value) :: Inserts. O(log n).
emplace :: void emplace(Args&&... args) :: Constructs in place. O(log n).
pop :: void pop() :: Removes the top element (does not return it). O(log n).
top :: const T& top() const :: Highest-priority element. O(1).
`;
const BITS = `
set :: bitset& set(size_t pos, bool v = true) | bitset& set() :: Sets bit(s) to 1.
reset :: bitset& reset(size_t pos) | bitset& reset() :: Clears bit(s).
flip :: bitset& flip(size_t pos) | bitset& flip() :: Toggles bit(s).
test :: bool test(size_t pos) const :: Checks a bit with bounds check.
count :: size_t count() const :: Number of set bits.
any :: bool any() const :: Any bit set.
none :: bool none() const :: No bits set.
all :: bool all() const :: All bits set.
to_string :: string to_string() const :: String of 0/1.
to_ulong :: unsigned long to_ulong() const :: As unsigned long.
to_ullong :: unsigned long long to_ullong() const :: As unsigned long long.
_Find_first :: size_t _Find_first() const :: Index of first set bit (GCC).
_Find_next :: size_t _Find_next(size_t pos) const :: Next set bit after pos (GCC).
`;
export const members = {
  vector: CONT + SEQ + VEC,
  string: CONT + SEQ + VEC + STR,
  deque: CONT + SEQ + `
push_back :: void push_back(const T& value) :: Appends. O(1).
push_front :: void push_front(const T& value) :: Prepends. O(1).
pop_back :: void pop_back() :: Removes last. O(1).
pop_front :: void pop_front() :: Removes first. O(1).
emplace_back :: T& emplace_back(Args&&... args) :: Constructs at the back.
emplace_front :: T& emplace_front(Args&&... args) :: Constructs at the front.
`,
  set: CONT + SETLIKE,
  map: CONT + MAPLIKE,
  queue: CONT + QUEUE,
  stack: CONT + `
push :: void push(const T& value) :: Pushes onto the stack.
emplace :: void emplace(Args&&... args) :: Constructs in place.
pop :: void pop() :: Removes the top (does not return it).
top :: T& top() :: Top element.
size :: size_t size() const :: Number of elements.
empty :: bool empty() const :: True if empty.
`,
  priority_queue: `size :: size_t size() const :: Number of elements.\nempty :: bool empty() const :: True if empty.\n` + PQ,
  pair: `## Field\nfirst :: T1 first :: First element.\nsecond :: T2 second :: Second element.\n`,
  bitset: `size :: size_t size() const :: Number of bits (N).\n` + BITS,
  array: CONT + `front :: T& front() :: First element.\nback :: T& back() :: Last element.\nat :: T& at(size_t i) :: Bounds-checked access.\nfill :: void fill(const T& value) :: Sets all elements.\ndata :: T* data() :: Underlying pointer.\n`,
  istream: `tie :: ostream* tie(ostream* os) :: cin.tie(nullptr) untangles cin from cout for speed.\nignore :: istream& ignore(streamsize n = 1, int delim = EOF) :: Skips characters, e.g. cin.ignore(). \nget :: int get() :: Reads one char.\npeek :: int peek() :: Next char without consuming.\neof :: bool eof() const :: End of input reached.\nfail :: bool fail() const :: Last read failed.\nclear :: void clear() :: Clears error flags.\nread :: istream& read(char* buf, streamsize n) :: Raw read.\nsync_with_stdio :: static bool sync_with_stdio(bool sync) :: Fast I/O toggle.\n`,
  ostream: `flush :: ostream& flush() :: Flush output (needed for interactive problems).\nprecision :: streamsize precision(streamsize n) :: Set float precision.\nput :: ostream& put(char c) :: Writes a char.\nwrite :: ostream& write(const char* s, streamsize n) :: Raw write.\nwidth :: streamsize width(streamsize n) :: Field width.\n`,
};
export const TYPE_OF = {
  vector: 'vector', deque: 'deque', list: 'deque', string: 'string', basic_string: 'string',
  map: 'map', unordered_map: 'map', multimap: 'map', unordered_multimap: 'map',
  set: 'set', unordered_set: 'set', multiset: 'set', unordered_multiset: 'set',
  queue: 'queue', stack: 'stack', priority_queue: 'priority_queue', pair: 'pair',
  bitset: 'bitset', array: 'array', istream: 'istream', ostream: 'ostream',
};
export const SPECIAL_VARS = { cin: 'istream', cout: 'ostream', cerr: 'ostream' };

export const headers = `bits/stdc++.h iostream cstdio cstdlib cstring cmath climits cfloat algorithm numeric vector string map unordered_map set unordered_set queue deque stack list array bitset tuple utility functional iomanip sstream fstream chrono random cassert cctype limits iterator memory optional variant string_view ext/pb_ds/assoc_container.hpp ext/pb_ds/tree_policy.hpp`.split(' ');

export const snippets = [
['tmpl', 'Competitive programming template', String.raw`#include <bits/stdc++.h>
using namespace std;

using ll = long long;

void solve() {
    @0
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t = 1;
    cin >> t;
    while (t--) solve();
    return 0;
}`],
['inc', '#include <bits/stdc++.h>', String.raw`#include <bits/stdc++.h>
using namespace std;
@0`],
['fastio', 'Fast I/O', `ios::sync_with_stdio(false);\ncin.tie(nullptr);\n@0`],
['tc', 'Testcase loop', String.raw`int t;
cin >> t;
while (t--) {
    @0
}`],
['fori', 'for i in [0, n)', String.raw`for (int @{1:i} = 0; @{1:i} < @{2:n}; @{1:i}++) {
    @0
}`],
['forr', 'for i from n-1 down to 0', String.raw`for (int @{1:i} = @{2:n} - 1; @{1:i} >= 0; @{1:i}--) {
    @0
}`],
['forn', 'for i in [1, n]', String.raw`for (int @{1:i} = 1; @{1:i} <= @{2:n}; @{1:i}++) {
    @0
}`],
['forea', 'range-based for', String.raw`for (auto& @{1:x} : @{2:v}) {
    @0
}`],
['forit', 'for with iterator', String.raw`for (auto it = @{1:v}.begin(); it != @{1:v}.end(); ++it) {
    @0
}`],
['vi', 'vector<int> name(n)', `vector<int> @{1:v}(@{2:n});@0`],
['vll', 'vector<long long> name(n)', `vector<long long> @{1:v}(@{2:n});@0`],
['vvi', '2D vector<int>', `vector<vector<int>> @{1:g}(@{2:n}, vector<int>(@{3:m}, @{4:0}));@0`],
['vpii', 'vector<pair<int,int>>', `vector<pair<int, int>> @{1:v};@0`],
['readv', 'Read n and a vector', String.raw`int n;
cin >> n;
vector<int> @{1:a}(n);
for (auto& x : @{1:a}) cin >> x;
@0`],
['ll', 'using ll = long long', `using ll = long long;\n@0`],
['mod', 'const MOD', `const int MOD = @{1|1000000007,998244353|};\n@0`],
['inf', 'const INF', `const int INF = 1e9;\nconst long long LINF = 1e18;\n@0`],
['bs', 'Binary search: first index where pred is true', String.raw`int lo = @{1:0}, hi = @{2:n};  // answer in [lo, hi]
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (@{3:check(mid)}) hi = mid;
    else lo = mid + 1;
}
// lo is the first true
@0`],
['bsa', 'Binary search on answer (maximize)', String.raw`long long lo = @{1:0}, hi = @{2:1e9};  // largest x with ok(x)
while (lo < hi) {
    long long mid = lo + (hi - lo + 1) / 2;
    if (@{3:ok(mid)}) lo = mid;
    else hi = mid - 1;
}
@0`],
['bsd', 'Binary search on doubles', String.raw`double lo = @{1:0}, hi = @{2:1e9};
for (int it = 0; it < 100; it++) {
    double mid = (lo + hi) / 2;
    if (@{3:ok(mid)}) hi = mid;
    else lo = mid;
}
@0`],
['twoptr', 'Two pointers / sliding window', String.raw`int l = 0;
for (int r = 0; r < @{1:n}; r++) {
    // add a[r]
    while (@{2:l < r /* window invalid */}) {
        // remove a[l]
        l++;
    }
    // window is [l, r]
    @0
}`],
['prefix', 'Prefix sums', String.raw`vector<long long> pre(@{1:n} + 1, 0);
for (int i = 0; i < @{1:n}; i++) pre[i + 1] = pre[i] + @{2:a}[i];
// sum of [l, r) = pre[r] - pre[l]
@0`],
['sortcmp', 'sort with comparator lambda', String.raw`sort(@{1:v}.begin(), @{1:v}.end(), [&](const auto& a, const auto& b) {
    return @{2:a < b};
});
@0`],
['lam', 'Lambda', `auto @{1:f} = [&](@{2:int x}) {\n    @0\n};`],
['uniq', 'Sort + unique', `sort(@{1:v}.begin(), @{1:v}.end());\n@{1:v}.erase(unique(@{1:v}.begin(), @{1:v}.end()), @{1:v}.end());@0`],
['modpow', 'Modular exponentiation', String.raw`long long modpow(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e > 0) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}
@0`],
['ncr', 'nCr mod p with factorials', String.raw`const int MOD = @{1:1000000007};
const int MAXN = @{2:1000001};
long long fact[MAXN], inv_fact[MAXN];
long long power(long long b, long long e) {
    long long r = 1; b %= MOD;
    for (; e > 0; e >>= 1, b = b * b % MOD) if (e & 1) r = r * b % MOD;
    return r;
}
void init_fact() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++) fact[i] = fact[i - 1] * i % MOD;
    inv_fact[MAXN - 1] = power(fact[MAXN - 1], MOD - 2);
    for (int i = MAXN - 1; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
}
long long ncr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD;
}
@0`],
['sieve', 'Sieve of Eratosthenes', String.raw`vector<bool> is_prime(@{1:N} + 1, true);
is_prime[0] = is_prime[1] = false;
for (long long i = 2; i * i <= @{1:N}; i++)
    if (is_prime[i])
        for (long long j = i * i; j <= @{1:N}; j += i) is_prime[j] = false;
@0`],
['dsu', 'Disjoint set union struct', String.raw`struct DSU {
    vector<int> p, sz;
    DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};
@0`],
['seg', 'Iterative segment tree (sum, point update)', String.raw`struct SegTree {
    int n; vector<long long> t;
    SegTree(int n) : n(n), t(2 * n, 0) {}
    void update(int i, long long v) {
        for (t[i += n] = v; i > 1; i >>= 1) t[i >> 1] = t[i] + t[i ^ 1];
    }
    long long query(int l, int r) {  // [l, r)
        long long res = 0;
        for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
            if (l & 1) res += t[l++];
            if (r & 1) res += t[--r];
        }
        return res;
    }
};
@0`],
['fenwick', 'Fenwick tree (BIT)', String.raw`struct BIT {
    int n; vector<long long> t;
    BIT(int n) : n(n), t(n + 1, 0) {}
    void add(int i, long long v) { for (i++; i <= n; i += i & -i) t[i] += v; }
    long long sum(int i) { long long s = 0; for (i++; i > 0; i -= i & -i) s += t[i]; return s; }  // [0, i]
    long long range(int l, int r) { return sum(r) - (l ? sum(l - 1) : 0); }  // [l, r]
};
@0`],
['bfsgrid', 'BFS on a grid', String.raw`int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
vector<vector<int>> dist(@{1:n}, vector<int>(@{2:m}, -1));
queue<pair<int, int>> q;
dist[@{3:sx}][@{4:sy}] = 0;
q.push({@{3:sx}, @{4:sy}});
while (!q.empty()) {
    auto [x, y] = q.front(); q.pop();
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        if (nx < 0 || ny < 0 || nx >= @{1:n} || ny >= @{2:m} || dist[nx][ny] != -1) continue;
        dist[nx][ny] = dist[x][y] + 1;
        q.push({nx, ny});
    }
}
@0`],
['dfsgrid', 'DFS on a grid (recursive)', String.raw`int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
vector<vector<bool>> vis(@{1:n}, vector<bool>(@{2:m}, false));
function<void(int, int)> dfs = [&](int x, int y) {
    vis[x][y] = true;
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        if (nx < 0 || ny < 0 || nx >= @{1:n} || ny >= @{2:m} || vis[nx][ny]) continue;
        dfs(nx, ny);
    }
};
@0`],
['bfs', 'BFS on a graph', String.raw`vector<int> dist(@{1:n}, -1);
queue<int> q;
dist[@{2:s}] = 0;
q.push(@{2:s});
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : @{3:adj}[u]) {
        if (dist[v] != -1) continue;
        dist[v] = dist[u] + 1;
        q.push(v);
    }
}
@0`],
['dfs', 'DFS on a graph (recursive)', String.raw`vector<vector<int>> adj(@{1:n});
vector<bool> vis(@{1:n}, false);
function<void(int)> dfs = [&](int u) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs(v);
};
@0`],
['graph', 'Read an undirected graph', String.raw`int n, m;
cin >> n >> m;
vector<vector<int>> adj(n + 1);
for (int i = 0; i < m; i++) {
    int u, v;
    cin >> u >> v;
    adj[u].push_back(v);
    adj[v].push_back(u);
}
@0`],
['dijk', 'Dijkstra with priority_queue', String.raw`vector<long long> dist(@{1:n} + 1, LLONG_MAX);
priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
dist[@{2:s}] = 0;
pq.push({0, @{2:s}});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;
    for (auto [v, w] : @{3:adj}[u]) {  // adj[u] = vector<pair<int, long long>>
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
    }
}
@0`],
['topo', 'Topological sort (Kahn)', String.raw`vector<int> indeg(@{1:n}, 0), order;
// fill indeg from edges first
queue<int> q;
for (int i = 0; i < @{1:n}; i++) if (indeg[i] == 0) q.push(i);
while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : @{2:adj}[u]) if (--indeg[v] == 0) q.push(v);
}
@0`],
['pminheap', 'Min-heap priority_queue', `priority_queue<@{1:int}, vector<@{1:int}>, greater<@{1:int}>> @{2:pq};@0`],
['permute', 'Iterate all permutations', String.raw`sort(@{1:v}.begin(), @{1:v}.end());
do {
    @0
} while (next_permutation(@{1:v}.begin(), @{1:v}.end()));`],
['submask', 'Iterate all submasks', String.raw`for (int sub = @{1:mask}; ; sub = (sub - 1) & @{1:mask}) {
    @0
    if (sub == 0) break;
}`],
['yesno', 'Print YES/NO', `cout << (@{1:cond} ? "YES" : "NO") << '\\n';@0`],
['cl', 'cout << x << newline', `cout << @{1:x} << '\\n';@0`],
['rng', 'Random number generator', `mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());\n@0`],
];
