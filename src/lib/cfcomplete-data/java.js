// Java completion data. Line format: label :: detail :: doc [:: snippet].
export const globals = `
## Class
Scanner :: class Scanner :: Simple tokenizer for stdin. Convenient but slow for big input (use BufferedReader). :: Scanner \${1:sc} = new Scanner(System.in);
BufferedReader :: class BufferedReader :: Fast buffered input. readLine() O(len). :: BufferedReader \${1:br} = new BufferedReader(new InputStreamReader(System.in));
InputStreamReader :: class InputStreamReader :: Bytes-to-chars adapter, wrap System.in.
StringTokenizer :: class StringTokenizer :: Splits a line into tokens: new StringTokenizer(line). :: StringTokenizer \${1:st} = new StringTokenizer(\${2:br.readLine()});
PrintWriter :: class PrintWriter :: Buffered output. Remember pw.flush() / close() at the end. :: PrintWriter \${1:out} = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));
BufferedWriter :: class BufferedWriter :: Buffered writer.
StringBuilder :: class StringBuilder :: Mutable string. append amortized O(1). :: StringBuilder \${1:sb} = new StringBuilder();
ArrayList :: class ArrayList<E> :: Resizable array. get O(1), add amortized O(1), remove(index) O(n). :: ArrayList<\${1:Integer}> \${2:list} = new ArrayList<>();
LinkedList :: class LinkedList<E> :: Doubly linked list / deque. :: LinkedList<\${1:Integer}> \${2:list} = new LinkedList<>();
List :: interface List<E> :: Ordered collection. :: List<\${1:Integer}> \${2:list} = new ArrayList<>();
HashMap :: class HashMap<K,V> :: Hash map. Average O(1); keys need hashCode/equals. :: HashMap<\${1:Integer}, \${2:Integer}> \${3:map} = new HashMap<>();
TreeMap :: class TreeMap<K,V> :: Sorted map (red-black tree). O(log n); floorKey/ceilingKey/firstKey. :: TreeMap<\${1:Integer}, \${2:Integer}> \${3:map} = new TreeMap<>();
Map :: interface Map<K,V> :: Key-value mapping. :: Map<\${1:Integer}, \${2:Integer}> \${3:map} = new HashMap<>();
HashSet :: class HashSet<E> :: Hash set. Average O(1). :: HashSet<\${1:Integer}> \${2:set} = new HashSet<>();
TreeSet :: class TreeSet<E> :: Sorted set. O(log n); floor/ceiling/first/last. :: TreeSet<\${1:Integer}> \${2:set} = new TreeSet<>();
Set :: interface Set<E> :: Unique collection. :: Set<\${1:Integer}> \${2:set} = new HashSet<>();
PriorityQueue :: class PriorityQueue<E> :: Min-heap by default. offer/poll O(log n), peek O(1). Pass a comparator for max-heap. :: PriorityQueue<\${1:Integer}> \${2:pq} = new PriorityQueue<>();
ArrayDeque :: class ArrayDeque<E> :: Fast deque, use as stack or queue (faster than Stack/LinkedList). :: ArrayDeque<\${1:Integer}> \${2:dq} = new ArrayDeque<>();
Deque :: interface Deque<E> :: Double-ended queue. :: Deque<\${1:Integer}> \${2:dq} = new ArrayDeque<>();
Queue :: interface Queue<E> :: FIFO queue. :: Queue<\${1:Integer}> \${2:q} = new ArrayDeque<>();
Stack :: class Stack<E> :: Legacy synchronized stack; prefer ArrayDeque.
Arrays :: class Arrays :: Static array utilities: sort, fill, copyOf, asList, toString.
Collections :: class Collections :: Static collection utilities: sort, reverse, max, min, swap, shuffle.
Math :: class Math :: Math functions: max, min, abs, pow, sqrt, floorMod.
Integer :: class Integer :: int wrapper: parseInt, MAX_VALUE, bitCount, toBinaryString.
Long :: class Long :: long wrapper: parseLong, MAX_VALUE, bitCount.
Double :: class Double :: double wrapper: parseDouble, compare.
Character :: class Character :: char helpers: isDigit, isLetter, getNumericValue.
String :: class String :: Immutable string. Use StringBuilder for repeated concatenation.
System :: class System :: System.in, System.out, currentTimeMillis, exit.
Objects :: class Objects :: equals, hash, requireNonNull.
Comparator :: interface Comparator<T> :: comparing, comparingInt, reversed, thenComparing. :: Comparator<\${1:int[]}> \${2:cmp} = (a, b) -> \${3:a[0] - b[0]};
BigInteger :: class BigInteger :: Arbitrary-precision integer (java.math).
BigDecimal :: class BigDecimal :: Arbitrary-precision decimal (java.math).
IOException :: class IOException :: Checked IO exception; declare main throws IOException.
Random :: class Random :: RNG.
## Function
main :: public static void main(String[] args) :: Entry point. :: public static void main(String[] args) throws IOException {\n    $0\n}
## Keyword
public
private
static
final
void
int
long
double
boolean
char
class
new
return
break
continue
while
for
if
else
switch
case
null
true
false
this
throws
import
`;

const COLL = `
size :: int size() :: Number of elements. O(1).
isEmpty :: boolean isEmpty() :: True if empty.
clear :: void clear() :: Removes everything.
contains :: boolean contains(Object o) :: Membership. O(n) for lists, O(1) hash, O(log n) tree.
remove :: boolean remove(Object o) | E remove(int index) :: Removes by value or index. NOTE list.remove(int) removes the index; use remove(Integer.valueOf(x)) for value.
add :: boolean add(E e) | void add(int index, E e) :: Appends or inserts. List add is amortized O(1).
addAll :: boolean addAll(Collection<? extends E> c) :: Adds all.
stream :: Stream<E> stream() :: Stream view.
forEach :: void forEach(Consumer<? super E> action) :: Iterates.
iterator :: Iterator<E> iterator() :: Iterator.
toArray :: Object[] toArray() :: Array copy.
removeIf :: boolean removeIf(Predicate<? super E> p) :: Removes matching elements.
`;
const LIST = `
get :: E get(int index) :: Element at index. O(1) for ArrayList.
set :: E set(int index, E e) :: Replaces element at index, returns old.
indexOf :: int indexOf(Object o) :: First index or -1. O(n).
lastIndexOf :: int lastIndexOf(Object o) :: Last index or -1.
subList :: List<E> subList(int from, int to) :: View of [from, to).
sort :: void sort(Comparator<? super E> c) :: Sorts in place. list.sort(null) for natural order. O(n log n).
`;
const MAP = `
put :: V put(K key, V value) :: Inserts or overwrites; returns previous value or null.
get :: V get(Object key) :: Value or null.
getOrDefault :: V getOrDefault(Object key, V def) :: Value or default. map.put(k, map.getOrDefault(k, 0) + 1) counts.
containsKey :: boolean containsKey(Object key) :: Key membership.
containsValue :: boolean containsValue(Object v) :: Value membership. O(n).
remove :: V remove(Object key) :: Removes key.
putIfAbsent :: V putIfAbsent(K key, V value) :: Puts only if key missing.
computeIfAbsent :: V computeIfAbsent(K key, Function f) :: Computes and stores when missing: map.computeIfAbsent(k, x -> new ArrayList<>()).add(v).
merge :: V merge(K key, V value, BiFunction f) :: map.merge(k, 1, Integer::sum) for counting.
keySet :: Set<K> keySet() :: View of keys.
values :: Collection<V> values() :: View of values.
entrySet :: Set<Map.Entry<K,V>> entrySet() :: Entries; use getKey()/getValue().
size :: int size() :: Number of entries.
isEmpty :: boolean isEmpty() :: True if empty.
clear :: void clear() :: Removes everything.
putAll :: void putAll(Map<? extends K, ? extends V> m) :: Copies all entries.
`;
const TREEMAP = `
firstKey :: K firstKey() :: Smallest key. O(log n).
lastKey :: K lastKey() :: Largest key. O(log n).
firstEntry :: Map.Entry<K,V> firstEntry() :: Smallest entry.
lastEntry :: Map.Entry<K,V> lastEntry() :: Largest entry.
floorKey :: K floorKey(K key) :: Greatest key <= key, or null. O(log n).
ceilingKey :: K ceilingKey(K key) :: Least key >= key, or null. O(log n).
lowerKey :: K lowerKey(K key) :: Greatest key < key.
higherKey :: K higherKey(K key) :: Least key > key.
floorEntry :: Map.Entry<K,V> floorEntry(K key) :: Entry for floorKey.
ceilingEntry :: Map.Entry<K,V> ceilingEntry(K key) :: Entry for ceilingKey.
pollFirstEntry :: Map.Entry<K,V> pollFirstEntry() :: Removes and returns smallest entry.
pollLastEntry :: Map.Entry<K,V> pollLastEntry() :: Removes and returns largest entry.
headMap :: SortedMap<K,V> headMap(K to) :: Keys < to.
tailMap :: SortedMap<K,V> tailMap(K from) :: Keys >= from.
descendingMap :: NavigableMap<K,V> descendingMap() :: Reverse-order view.
`;
const TREESET = `
first :: E first() :: Smallest element. O(log n).
last :: E last() :: Largest element.
floor :: E floor(E e) :: Greatest element <= e or null. O(log n).
ceiling :: E ceiling(E e) :: Least element >= e or null. O(log n).
lower :: E lower(E e) :: Greatest element < e.
higher :: E higher(E e) :: Least element > e.
pollFirst :: E pollFirst() :: Removes and returns the smallest.
pollLast :: E pollLast() :: Removes and returns the largest.
headSet :: SortedSet<E> headSet(E to) :: Elements < to.
tailSet :: SortedSet<E> tailSet(E from) :: Elements >= from.
descendingSet :: NavigableSet<E> descendingSet() :: Reverse-order view.
`;
const QD = `
offer :: boolean offer(E e) :: Adds to the queue. O(log n) for PriorityQueue.
poll :: E poll() :: Removes and returns head, or null if empty.
peek :: E peek() :: Head without removing, or null.
push :: void push(E e) :: Push on the front (stack semantic for Deque).
pop :: E pop() :: Remove from the front (throws if empty).
addFirst :: void addFirst(E e) :: Insert at front. O(1).
addLast :: void addLast(E e) :: Insert at end. O(1).
offerFirst :: boolean offerFirst(E e) :: Insert at front.
offerLast :: boolean offerLast(E e) :: Insert at end.
pollFirst :: E pollFirst() :: Remove first or null.
pollLast :: E pollLast() :: Remove last or null.
peekFirst :: E peekFirst() :: First or null.
peekLast :: E peekLast() :: Last or null.
getFirst :: E getFirst() :: First (throws if empty).
getLast :: E getLast() :: Last (throws if empty).
removeFirst :: E removeFirst() :: Remove first.
removeLast :: E removeLast() :: Remove last.
`;
const SB = `
append :: StringBuilder append(Object x) :: Appends text or value. O(1) amortized.
insert :: StringBuilder insert(int offset, Object x) :: Inserts at offset. O(n).
reverse :: StringBuilder reverse() :: Reverses in place. O(n).
toString :: String toString() :: Builds the String.
length :: int length() :: Length.
charAt :: char charAt(int i) :: Char at i.
setCharAt :: void setCharAt(int i, char c) :: Replaces char at i.
deleteCharAt :: StringBuilder deleteCharAt(int i) :: Removes char at i. O(n).
setLength :: void setLength(int n) :: Truncates/extends; sb.setLength(0) clears.
indexOf :: int indexOf(String s) :: First index or -1.
delete :: StringBuilder delete(int start, int end) :: Removes [start, end).
replace :: StringBuilder replace(int start, int end, String s) :: Replaces range.
`;
const STR = `
length :: int length() :: Length.
charAt :: char charAt(int i) :: Char at i.
substring :: String substring(int begin) | String substring(int begin, int end) :: Substring [begin, end). O(len).
indexOf :: int indexOf(String s) | int indexOf(char c) :: First index or -1.
lastIndexOf :: int lastIndexOf(String s) :: Last index or -1.
equals :: boolean equals(Object o) :: Value equality (never use == for strings).
equalsIgnoreCase :: boolean equalsIgnoreCase(String s) :: Case-insensitive equality.
compareTo :: int compareTo(String s) :: Lexicographic compare.
split :: String[] split(String regex) :: Splits by regex, e.g. s.split(" ").
toCharArray :: char[] toCharArray() :: Char array copy. O(n).
toUpperCase :: String toUpperCase() :: Uppercase.
toLowerCase :: String toLowerCase() :: Lowercase.
trim :: String trim() :: Strips whitespace.
isEmpty :: boolean isEmpty() :: Length is 0.
contains :: boolean contains(CharSequence s) :: Substring test.
startsWith :: boolean startsWith(String p) :: Prefix test.
endsWith :: boolean endsWith(String p) :: Suffix test.
replace :: String replace(CharSequence a, CharSequence b) :: Replaces all occurrences.
repeat :: String repeat(int n) :: Repeats n times.
chars :: IntStream chars() :: Stream of chars.
hashCode :: int hashCode() :: Hash.
`;
const SC = `
nextInt :: int nextInt() :: Reads an int.
nextLong :: long nextLong() :: Reads a long.
nextDouble :: double nextDouble() :: Reads a double.
next :: String next() :: Reads a token.
nextLine :: String nextLine() :: Reads a line.
hasNext :: boolean hasNext() :: More tokens?
hasNextInt :: boolean hasNextInt() :: Next token is an int?
close :: void close() :: Closes.
`;
const BR = `
readLine :: String readLine() throws IOException :: Reads a line, null at EOF.
read :: int read() throws IOException :: Reads one char.
lines :: Stream<String> lines() :: All lines as a stream.
ready :: boolean ready() :: Input available?
close :: void close() :: Closes.
`;
const ST = `
nextToken :: String nextToken() :: Next token.
hasMoreTokens :: boolean hasMoreTokens() :: More tokens?
countTokens :: int countTokens() :: Remaining token count.
`;
const OUT = `
println :: void println(Object x) :: Prints with newline.
print :: void print(Object x) :: Prints without newline.
printf :: PrintStream printf(String fmt, Object... args) :: Formatted print: %d, %s, %.2f, %n.
flush :: void flush() :: Flush output (required for PrintWriter, interactive).
close :: void close() :: Close/flush writer.
write :: void write(String s) :: Writes a string.
`;
export const members = {
  list: COLL + LIST,
  map: MAP,
  treemap: MAP + TREEMAP,
  set: COLL,
  treeset: COLL + TREESET,
  queue: COLL + QD,
  sb: SB,
  string: STR,
  scanner: SC,
  reader: BR,
  tokenizer: ST,
  out: OUT,
  array: `## Field\nlength :: int length :: Number of elements (a field, no parentheses).\n`,
  entry: `getKey :: K getKey() :: Entry key.\ngetValue :: V getValue() :: Entry value.\nsetValue :: V setValue(V v) :: Replace value.\n`,
};
export const TYPE_OF = {
  ArrayList: 'list', List: 'list', LinkedList: 'queue', Vector: 'list',
  HashMap: 'map', Map: 'map', LinkedHashMap: 'map', TreeMap: 'treemap', NavigableMap: 'treemap',
  HashSet: 'set', Set: 'set', LinkedHashSet: 'set', TreeSet: 'treeset', NavigableSet: 'treeset',
  PriorityQueue: 'queue', ArrayDeque: 'queue', Deque: 'queue', Queue: 'queue', Stack: 'queue',
  StringBuilder: 'sb', StringBuffer: 'sb', String: 'string',
  Scanner: 'scanner', BufferedReader: 'reader', StringTokenizer: 'tokenizer',
  PrintWriter: 'out', PrintStream: 'out', BufferedWriter: 'out', Entry: 'entry',
};

// Static members, keyed by class name.
export const statics = {
  Arrays: `
sort :: static void sort(int[] a) | static void sort(T[] a, Comparator<T> c) | static void sort(int[] a, int from, int to) :: Sorts in place. O(n log n). Primitive sort is dual-pivot quicksort (hackable on Codeforces; shuffle first or use Integer[]).
fill :: static void fill(int[] a, int v) | static void fill(int[] a, int from, int to, int v) :: Fills the array.
copyOf :: static int[] copyOf(int[] a, int newLength) :: Copy / resize. O(n).
copyOfRange :: static int[] copyOfRange(int[] a, int from, int to) :: Copies [from, to).
asList :: static List<T> asList(T... a) :: Fixed-size list view.
toString :: static String toString(int[] a) :: "[1, 2, 3]".
deepToString :: static String deepToString(Object[] a) :: Prints nested arrays.
binarySearch :: static int binarySearch(int[] a, int key) :: Index or -(insertion point)-1. O(log n).
stream :: static IntStream stream(int[] a) :: Stream of an array: Arrays.stream(a).sum().
equals :: static boolean equals(int[] a, int[] b) :: Element-wise equality.
hashCode :: static int hashCode(int[] a) :: Content hash.
setAll :: static void setAll(int[] a, IntUnaryOperator f) :: a[i] = f(i).
`,
  Collections: `
sort :: static void sort(List<T> list) | static void sort(List<T> list, Comparator<T> c) :: Sorts. O(n log n), stable.
reverse :: static void reverse(List<?> list) :: Reverses in place.
max :: static T max(Collection<T> c) :: Largest element.
min :: static T min(Collection<T> c) :: Smallest element.
swap :: static void swap(List<?> list, int i, int j) :: Swaps two elements.
shuffle :: static void shuffle(List<?> list) :: Random permutation.
reverseOrder :: static Comparator<T> reverseOrder() :: Descending comparator: Collections.reverseOrder().
binarySearch :: static int binarySearch(List<T> list, T key) :: Binary search on a sorted list.
frequency :: static int frequency(Collection<?> c, Object o) :: Occurrence count. O(n).
unmodifiableList :: static List<T> unmodifiableList(List<T> l) :: Read-only view.
nCopies :: static List<T> nCopies(int n, T o) :: n copies.
emptyList :: static List<T> emptyList() :: Immutable empty list.
`,
  Math: `
max :: static int max(int a, int b) :: Larger value (int/long/double overloads).
min :: static int min(int a, int b) :: Smaller value.
abs :: static int abs(int x) :: Absolute value (abs(Integer.MIN_VALUE) overflows).
pow :: static double pow(double a, double b) :: Power as double (not exact for large ints).
sqrt :: static double sqrt(double x) :: Square root.
cbrt :: static double cbrt(double x) :: Cube root.
floor :: static double floor(double x) :: Round down.
ceil :: static double ceil(double x) :: Round up.
round :: static long round(double x) :: Round to nearest.
floorMod :: static int floorMod(int a, int b) :: Always non-negative modulo for positive b.
floorDiv :: static int floorDiv(int a, int b) :: Floor division.
log :: static double log(double x) :: Natural log.
log10 :: static double log10(double x) :: Base-10 log.
hypot :: static double hypot(double x, double y) :: sqrt(x*x + y*y).
random :: static double random() :: [0, 1).
addExact :: static int addExact(int a, int b) :: Throws on overflow.
multiplyExact :: static long multiplyExact(long a, long b) :: Throws on overflow.
toIntExact :: static int toIntExact(long x) :: Throws if it does not fit.
## Constant
PI :: static final double PI :: 3.14159...
`,
  Integer: `
parseInt :: static int parseInt(String s) | static int parseInt(String s, int radix) :: Parses an int.
valueOf :: static Integer valueOf(int i) :: Boxed Integer (use for list.remove(Integer.valueOf(x))).
toString :: static String toString(int i) | static String toString(int i, int radix) :: To string in radix.
toBinaryString :: static String toBinaryString(int i) :: Binary representation.
bitCount :: static int bitCount(int i) :: Number of set bits.
highestOneBit :: static int highestOneBit(int i) :: Highest set bit value.
numberOfTrailingZeros :: static int numberOfTrailingZeros(int i) :: Trailing zeros.
numberOfLeadingZeros :: static int numberOfLeadingZeros(int i) :: Leading zeros; floor(log2 x) = 31 - this.
compare :: static int compare(int a, int b) :: -1, 0, 1 (safe, no overflow).
signum :: static int signum(int i) :: Sign.
sum :: static int sum(int a, int b) :: a + b (use with merge: Integer::sum).
max :: static int max(int a, int b) :: Larger.
min :: static int min(int a, int b) :: Smaller.
## Constant
MAX_VALUE :: static final int MAX_VALUE :: 2147483647
MIN_VALUE :: static final int MIN_VALUE :: -2147483648
`,
  Long: `
parseLong :: static long parseLong(String s) :: Parses a long.
valueOf :: static Long valueOf(long l) :: Boxed Long.
toString :: static String toString(long l) :: To string.
toBinaryString :: static String toBinaryString(long l) :: Binary representation.
bitCount :: static int bitCount(long l) :: Set bits.
numberOfTrailingZeros :: static int numberOfTrailingZeros(long l) :: Trailing zeros.
numberOfLeadingZeros :: static int numberOfLeadingZeros(long l) :: Leading zeros.
compare :: static int compare(long a, long b) :: -1, 0, 1.
sum :: static long sum(long a, long b) :: a + b.
max :: static long max(long a, long b) :: Larger.
min :: static long min(long a, long b) :: Smaller.
## Constant
MAX_VALUE :: static final long MAX_VALUE :: 9223372036854775807
MIN_VALUE :: static final long MIN_VALUE :: -9223372036854775808
`,
  Double: `
parseDouble :: static double parseDouble(String s) :: Parses a double.
compare :: static int compare(double a, double b) :: Compares.
valueOf :: static Double valueOf(double d) :: Boxed Double.
isNaN :: static boolean isNaN(double d) :: NaN check.
## Constant
MAX_VALUE :: static final double MAX_VALUE :: Largest finite double.
POSITIVE_INFINITY :: static final double POSITIVE_INFINITY :: +Infinity.
`,
  Character: `
isDigit :: static boolean isDigit(char c) :: Is 0-9.
isLetter :: static boolean isLetter(char c) :: Is a letter.
isLetterOrDigit :: static boolean isLetterOrDigit(char c) :: Letter or digit.
isUpperCase :: static boolean isUpperCase(char c) :: Uppercase?
isLowerCase :: static boolean isLowerCase(char c) :: Lowercase?
toUpperCase :: static char toUpperCase(char c) :: Uppercase.
toLowerCase :: static char toLowerCase(char c) :: Lowercase.
getNumericValue :: static int getNumericValue(char c) :: Digit value, or c - '0'.
isWhitespace :: static boolean isWhitespace(char c) :: Whitespace?
`,
  String: `
valueOf :: static String valueOf(Object o) | static String valueOf(char[] a) :: To string; String.valueOf(charArray).
format :: static String format(String fmt, Object... args) :: Formatted string.
join :: static String join(CharSequence sep, Iterable<?> parts) :: Joins parts.
`,
  System: `
currentTimeMillis :: static long currentTimeMillis() :: Wall clock ms.
nanoTime :: static long nanoTime() :: Monotonic ns timer.
exit :: static void exit(int status) :: Terminates JVM.
arraycopy :: static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length) :: Fast array copy.
## Variable
in :: static final InputStream in :: Standard input.
out :: static final PrintStream out :: Standard output.
err :: static final PrintStream err :: Standard error.
`,
  'System.out': OUT,
  List: `of :: static List<E> of(E... es) :: Immutable list: List.of(1, 2, 3).\ncopyOf :: static List<E> copyOf(Collection<E> c) :: Immutable copy.\n`,
  Map: `of :: static Map<K,V> of(K k, V v, ...) :: Immutable map.\nentry :: static Map.Entry<K,V> entry(K k, V v) :: Immutable entry.\n`,
  Objects: `equals :: static boolean equals(Object a, Object b) :: Null-safe equality.\nhash :: static int hash(Object... values) :: Combined hash.\nrequireNonNull :: static T requireNonNull(T o) :: Null check.\n`,
  Comparator: `comparingInt :: static Comparator<T> comparingInt(ToIntFunction<T> f) :: Comparator by int key: Comparator.comparingInt(a -> a[0]).\ncomparing :: static Comparator<T> comparing(Function<T,U> f) :: Comparator by key.\nnaturalOrder :: static Comparator<T> naturalOrder() :: Natural ascending.\nreverseOrder :: static Comparator<T> reverseOrder() :: Descending.\n`,
  Stream: ``,
};

export const snippets = [
['tmpl', 'Competitive programming template (fast IO)', String.raw`import java.util.*;
import java.io.*;

public class Main {
    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer st;
    static PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));

    static String next() throws IOException {
        while (st == null || !st.hasMoreTokens()) st = new StringTokenizer(br.readLine());
        return st.nextToken();
    }
    static int nextInt() throws IOException { return Integer.parseInt(next()); }
    static long nextLong() throws IOException { return Long.parseLong(next()); }

    public static void main(String[] args) throws IOException {
        @0
        out.flush();
    }
}`],
['fastio', 'Fast reader/writer fields and helpers', String.raw`static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
static StringTokenizer st;
static PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));

static String next() throws IOException {
    while (st == null || !st.hasMoreTokens()) st = new StringTokenizer(br.readLine());
    return st.nextToken();
}
static int nextInt() throws IOException { return Integer.parseInt(next()); }
static long nextLong() throws IOException { return Long.parseLong(next()); }
@0`],
['reader', 'Fast byte-level reader class (DataInputStream)', String.raw`static class FastReader {
    private final InputStream in = System.in;
    private final byte[] buf = new byte[1 << 16];
    private int len = 0, ptr = 0;
    private int read() throws IOException {
        if (ptr == len) { len = in.read(buf, 0, buf.length); ptr = 0; if (len <= 0) return -1; }
        return buf[ptr++];
    }
    int nextInt() throws IOException {
        int c = read();
        while (c <= ' ') c = read();
        boolean neg = false;
        if (c == '-') { neg = true; c = read(); }
        int r = 0;
        while (c >= '0' && c <= '9') { r = r * 10 + (c - '0'); c = read(); }
        return neg ? -r : r;
    }
    long nextLong() throws IOException {
        int c = read();
        while (c <= ' ') c = read();
        boolean neg = false;
        if (c == '-') { neg = true; c = read(); }
        long r = 0;
        while (c >= '0' && c <= '9') { r = r * 10 + (c - '0'); c = read(); }
        return neg ? -r : r;
    }
}
@0`],
['imp', 'Common imports', `import java.util.*;\nimport java.io.*;\n@0`],
['sc', 'Scanner', `Scanner @{1:sc} = new Scanner(System.in);@0`],
['br', 'BufferedReader', `BufferedReader @{1:br} = new BufferedReader(new InputStreamReader(System.in));@0`],
['pw', 'PrintWriter', `PrintWriter @{1:out} = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));@0`],
['sout', 'System.out.println', `System.out.println(@{1});@0`],
['fori', 'for i in [0, n)', String.raw`for (int @{1:i} = 0; @{1:i} < @{2:n}; @{1:i}++) {
    @0
}`],
['forr', 'for i from n-1 down to 0', String.raw`for (int @{1:i} = @{2:n} - 1; @{1:i} >= 0; @{1:i}--) {
    @0
}`],
['forn', 'for i in [1, n]', String.raw`for (int @{1:i} = 1; @{1:i} <= @{2:n}; @{1:i}++) {
    @0
}`],
['forea', 'enhanced for', String.raw`for (@{1:int} @{2:x} : @{3:arr}) {
    @0
}`],
['tc', 'Testcase loop', String.raw`int t = nextInt();
while (t-- > 0) {
    @0
}`],
['readarr', 'Read n and an int array', String.raw`int n = nextInt();
int[] @{1:a} = new int[n];
for (int i = 0; i < n; i++) @{1:a}[i] = nextInt();
@0`],
['bs', 'Binary search: first index where pred is true', String.raw`int lo = @{1:0}, hi = @{2:n};
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (@{3:check(mid)}) hi = mid;
    else lo = mid + 1;
}
@0`],
['bsa', 'Binary search on answer (maximize)', String.raw`long lo = @{1:0}, hi = @{2:(long) 1e9};
while (lo < hi) {
    long mid = lo + (hi - lo + 1) / 2;
    if (@{3:ok(mid)}) lo = mid;
    else hi = mid - 1;
}
@0`],
['twoptr', 'Two pointers / sliding window', String.raw`int l = 0;
for (int r = 0; r < @{1:n}; r++) {
    // add a[r]
    while (@{2:false /* window invalid */}) {
        // remove a[l]
        l++;
    }
    @0
}`],
['prefix', 'Prefix sums', String.raw`long[] pre = new long[@{1:n} + 1];
for (int i = 0; i < @{1:n}; i++) pre[i + 1] = pre[i] + @{2:a}[i];
// sum of [l, r) = pre[r] - pre[l]
@0`],
['sortcmp', 'Sort with comparator (boxed or int[] rows)', `Arrays.sort(@{1:arr}, (a, b) -> @{2:a[0] - b[0]});@0`],
['pqcmp', 'PriorityQueue with comparator', `PriorityQueue<@{1:int[]}> @{2:pq} = new PriorityQueue<>((a, b) -> @{3:a[0] - b[0]});@0`],
['modpow', 'Modular exponentiation', String.raw`static long modpow(long b, long e, long m) {
    long r = 1;
    b %= m;
    while (e > 0) {
        if ((e & 1) == 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}
@0`],
['ncr', 'nCr mod p with factorials', String.raw`static final long MOD = @{1:1_000_000_007L};
static long[] fact, inv;
static void initFact(int n) {
    fact = new long[n + 1]; inv = new long[n + 1];
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    inv[n] = modpow(fact[n], MOD - 2, MOD);
    for (int i = n; i > 0; i--) inv[i - 1] = inv[i] * i % MOD;
}
static long ncr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * inv[r] % MOD * inv[n - r] % MOD;
}
@0`],
['sieve', 'Sieve of Eratosthenes', String.raw`boolean[] composite = new boolean[@{1:N} + 1];
for (int i = 2; (long) i * i <= @{1:N}; i++)
    if (!composite[i])
        for (int j = i * i; j <= @{1:N}; j += i) composite[j] = true;
@0`],
['dsu', 'Disjoint set union', String.raw`static class DSU {
    int[] p, sz;
    DSU(int n) { p = new int[n]; sz = new int[n]; for (int i = 0; i < n; i++) { p[i] = i; sz[i] = 1; } }
    int find(int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
    boolean union(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) { int t = a; a = b; b = t; }
        p[b] = a; sz[a] += sz[b];
        return true;
    }
}
@0`],
['seg', 'Iterative segment tree (sum)', String.raw`static class SegTree {
    int n; long[] t;
    SegTree(int n) { this.n = n; t = new long[2 * n]; }
    void update(int i, long v) {
        for (t[i += n] = v; i > 1; i >>= 1) t[i >> 1] = t[i] + t[i ^ 1];
    }
    long query(int l, int r) {  // [l, r)
        long res = 0;
        for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
            if ((l & 1) == 1) res += t[l++];
            if ((r & 1) == 1) res += t[--r];
        }
        return res;
    }
}
@0`],
['fenwick', 'Fenwick tree (BIT)', String.raw`static class BIT {
    int n; long[] t;
    BIT(int n) { this.n = n; t = new long[n + 1]; }
    void add(int i, long v) { for (i++; i <= n; i += i & -i) t[i] += v; }
    long sum(int i) { long s = 0; for (i++; i > 0; i -= i & -i) s += t[i]; return s; }  // [0, i]
    long range(int l, int r) { return sum(r) - (l > 0 ? sum(l - 1) : 0); }
}
@0`],
['bfsgrid', 'BFS on a grid', String.raw`int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
int[][] dist = new int[@{1:n}][@{2:m}];
for (int[] row : dist) Arrays.fill(row, -1);
ArrayDeque<int[]> q = new ArrayDeque<>();
dist[@{3:sx}][@{4:sy}] = 0;
q.add(new int[]{@{3:sx}, @{4:sy}});
while (!q.isEmpty()) {
    int[] cur = q.poll();
    for (int d = 0; d < 4; d++) {
        int nx = cur[0] + dx[d], ny = cur[1] + dy[d];
        if (nx < 0 || ny < 0 || nx >= @{1:n} || ny >= @{2:m} || dist[nx][ny] != -1) continue;
        dist[nx][ny] = dist[cur[0]][cur[1]] + 1;
        q.add(new int[]{nx, ny});
    }
}
@0`],
['dfsgrid', 'DFS on a grid (recursive method)', String.raw`static int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
static boolean[][] vis;
static void dfs(int x, int y, int n, int m) {
    vis[x][y] = true;
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        if (nx < 0 || ny < 0 || nx >= n || ny >= m || vis[nx][ny]) continue;
        dfs(nx, ny, n, m);
    }
}
@0`],
['bfs', 'BFS on a graph', String.raw`int[] dist = new int[@{1:n}];
Arrays.fill(dist, -1);
ArrayDeque<Integer> q = new ArrayDeque<>();
dist[@{2:s}] = 0;
q.add(@{2:s});
while (!q.isEmpty()) {
    int u = q.poll();
    for (int v : @{3:adj}[u]) {
        if (dist[v] != -1) continue;
        dist[v] = dist[u] + 1;
        q.add(v);
    }
}
@0`],
['graph', 'Adjacency list graph', String.raw`List<Integer>[] adj = new ArrayList[@{1:n} + 1];
for (int i = 0; i <= @{1:n}; i++) adj[i] = new ArrayList<>();
@0`],
['dijk', 'Dijkstra with PriorityQueue', String.raw`long[] dist = new long[@{1:n} + 1];
Arrays.fill(dist, Long.MAX_VALUE);
PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
dist[@{2:s}] = 0;
pq.add(new long[]{0, @{2:s}});
while (!pq.isEmpty()) {
    long[] cur = pq.poll();
    int u = (int) cur[1];
    if (cur[0] > dist[u]) continue;
    for (long[] e : @{3:adj}[u]) {  // e = {to, weight}
        int v = (int) e[0];
        if (dist[u] + e[1] < dist[v]) {
            dist[v] = dist[u] + e[1];
            pq.add(new long[]{dist[v], v});
        }
    }
}
@0`],
['yesno', 'Print YES/NO', `out.println(@{1:cond} ? "YES" : "NO");@0`],
['shuf', 'Shuffle int[] (anti-hack before sort)', String.raw`{
    Random rnd = new Random();
    for (int i = @{1:a}.length - 1; i > 0; i--) {
        int j = rnd.nextInt(i + 1);
        int tmp = @{1:a}[i]; @{1:a}[i] = @{1:a}[j]; @{1:a}[j] = tmp;
    }
}
@0`],
];
