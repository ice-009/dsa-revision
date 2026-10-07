// The Playbook: how to study, how to run an interview, and quick-reference tables.
// Static content (written for this app) — rendered as-is by app.js.
window.PLAYBOOK_HTML = `
<section class="pb-sec" id="pb-study">
  <h2>How to study with this app — and why it works</h2>
  <p class="sub">Every feature here maps to a learning technique with strong evidence behind it. Dunlosky et al. (2013) reviewed ten popular study techniques; only two earned a “high utility” rating: <b>practice testing</b> and <b>distributed (spaced) practice</b>. Re-reading and highlighting were rated low.</p>
  <div class="pb-grid">
    <div class="card pb-card"><div class="pb-ico">↻</div><h3>Retrieve, don’t re-read</h3>
      <p>Pulling an answer out of memory strengthens it far more than reading it again — the <i>testing effect</i> (Roediger &amp; Karpicke, 2006).</p>
      <p class="pb-do"><b>Here:</b> on every flashcard, say the pattern, approach and complexity out loud <i>before</i> you reveal. Use hints one at a time, only when stuck.</p></div>
    <div class="card pb-card"><div class="pb-ico">📅</div><h3>Space it out</h3>
      <p>The same study time spread across days beats cramming (Cepeda et al., 2006). The best moment to review is just before you would forget.</p>
      <p class="pb-do"><b>Here:</b> reviews are scheduled by <b>FSRS-6</b>, which models your memory stability per card and brings it back near the 90% recall point. Ten minutes every day beats an hour once a week.</p></div>
    <div class="card pb-card"><div class="pb-ico">🔀</div><h3>Mix problem types</h3>
      <p>Interleaving different kinds of problems feels harder but teaches you to <i>recognise which method applies</i> — in one classroom study, 72% vs 38% on a delayed test (Rohrer &amp; Taylor, 2007; Taylor &amp; Rohrer, 2010).</p>
      <p class="pb-do"><b>Here:</b> today’s cards alternate topics, and <b>Spot the pattern</b> drills recognition across every pattern you’ve unlocked.</p></div>
    <div class="card pb-card"><div class="pb-ico">🪜</div><h3>Learn from labelled steps</h3>
      <p>Worked examples help novices (Sweller); adding short <i>subgoal labels</i> (“find the middle”, “reverse the second half”) improves transfer to new problems in programming (Margulieux, Guzdial &amp; Catrambone, 2012).</p>
      <p class="pb-do"><b>Here:</b> every pattern lesson has a labelled method, and every problem has a step-by-step algorithm and dry run.</p></div>
    <div class="card pb-card"><div class="pb-ico">✍️</div><h3>Explain it to yourself</h3>
      <p>Students who explain each step to themselves learn more from the same examples — the <i>self-explanation effect</i> (Chi et al., 1989).</p>
      <p class="pb-do"><b>Here:</b> tap <b>Hide &amp; recall</b> on the algorithm and say each step before revealing it, then <b>step through the dry run</b> predicting every line. Write it yourself in <b>Your code</b> and let Claude review it.</p></div>
    <div class="card pb-card"><div class="pb-ico">🧩</div><h3>Rebuild, then write</h3>
      <p>Parsons problems — putting scrambled code lines in order — teach the structure of a solution efficiently: similar learning to writing code from scratch in less time (Parsons &amp; Haden, 2006; Ericson, Margulieux &amp; Rick, 2017).</p>
      <p class="pb-do"><b>Here:</b> <b>Rebuild the code</b> on any problem, in C++, Java or JS.</p></div>
  </div>
  <div class="card pb-note"><b>“It feels hard” is often a good sign.</b> Spacing, mixing and testing all feel slower than re-reading, but produce better long-term memory — Bjork calls these <i>desirable difficulties</i> (Bjork, 1994). Judge progress by what you can recall a week later, not by how smooth today felt.</div>
  <h3 class="pb-h3">A daily routine (45–60 min)</h3>
  <ol class="pb-steps">
    <li><b>Warm-up · 5 min</b> — one round of Spot the pattern (10 questions).</li>
    <li><b>Review · 10–15 min</b> — today’s cards. Recall first, then grade honestly.</li>
    <li><b>New problem · 25–35 min</b> — timed, LeetCode open. Write the approach as comments in Your code before coding. If stuck at 15 min, take hint 1; at 25 min, hint 2.</li>
    <li><b>Close the loop · 5 min</b> — read the follow-ups, mark Solved or Revisit, and rebuild the code once if it felt shaky.</li>
  </ol>
</section>

<section class="pb-sec" id="pb-method">
  <h2>The interview method</h2>
  <p class="sub">A repeatable script for 45 minutes. Interviewers grade communication and process, not just the final code.</p>
  <div class="pb-method">
    <div class="pb-m"><span class="pb-t">~5 min</span><h3>1 · Understand</h3><ul class="clean">
      <li>Restate the problem in your own words.</li><li>Ask: input size? value ranges? duplicates? negatives? empty input? sorted?</li>
      <li>Work one example by hand; invent an edge case.</li></ul>
      <p class="pb-say">“So I need …, and n can be up to 10⁵ — so O(n²) is probably too slow.”</p></div>
    <div class="pb-m"><span class="pb-t">~2 min</span><h3>2 · Match</h3><ul class="clean">
      <li>Use the constraints table below to set a target complexity.</li><li>Scan the cue table: contiguous? sorted? “all”? shortest? dependencies?</li></ul>
      <p class="pb-say">“Contiguous substring with a condition — that smells like a sliding window.”</p></div>
    <div class="pb-m"><span class="pb-t">~5–8 min</span><h3>3 · Plan</h3><ul class="clean">
      <li>State the brute force and its complexity first — it is a safe baseline.</li><li>Find the bottleneck; pick the structure that removes it.</li>
      <li>Say the final complexity <i>before</i> coding and get a nod.</li></ul>
      <p class="pb-say">“Brute force is O(n²). The repeated work is the lookup, so a hash map makes it O(n). Shall I code that?”</p></div>
    <div class="pb-m"><span class="pb-t">~15–20 min</span><h3>4 · Implement</h3><ul class="clean">
      <li>Write in subgoals: set-up, main loop, update, answer.</li><li>Clear names (left, right, window), small helper functions.</li>
      <li>Narrate decisions; don’t go silent.</li></ul></div>
    <div class="pb-m"><span class="pb-t">~5 min</span><h3>5 · Review</h3><ul class="clean">
      <li>Dry-run your code on the example, line by line, tracking variables.</li><li>Then an edge case: empty, one element, all equal, negatives.</li></ul>
      <p class="pb-say">“Let me trace [2, 7, 11, 15] with target 9 …”</p></div>
    <div class="pb-m"><span class="pb-t">~2–3 min</span><h3>6 · Evaluate</h3><ul class="clean">
      <li>Final time and space complexity.</li><li>Trade-offs and follow-ups: streaming? less memory? distributed?</li></ul></div>
  </div>
</section>

<section class="pb-sec" id="pb-constraints">
  <h2>Constraints → target complexity</h2>
  <p class="sub">Roughly 10⁸ simple operations run in about a second. The input size usually tells you what the interviewer expects (table adapted from the USACO Guide).</p>
  <table class="pb-table"><thead><tr><th>n up to</th><th>Target</th><th>Typical approach</th></tr></thead><tbody>
    <tr><td>10–12</td><td>O(n!), O(n·2ⁿ)</td><td>Permutations, brute force backtracking</td></tr>
    <tr><td>20–25</td><td>O(2ⁿ · n)</td><td>Subsets, bitmask DP, meet in the middle (n ≤ 40)</td></tr>
    <tr><td>~100</td><td>O(n⁴)</td><td>Small DP over intervals/pairs</td></tr>
    <tr><td>~400–500</td><td>O(n³)</td><td>Floyd-Warshall, interval DP, 3 nested loops</td></tr>
    <tr><td>~5,000–10⁴</td><td>O(n²)</td><td>2-D DP, all pairs, simple nested loops</td></tr>
    <tr><td>~10⁵–10⁶</td><td>O(n log n)</td><td>Sorting, heaps, binary search, divide &amp; conquer</td></tr>
    <tr><td>~10⁶–10⁷</td><td>O(n)</td><td>Hashing, two pointers, sliding window, one pass, BFS/DFS</td></tr>
    <tr><td>&gt; 10⁹</td><td>O(log n) / O(1)</td><td>Binary search on the answer, math, fast exponentiation</td></tr>
  </tbody></table>
</section>

<section class="pb-sec" id="pb-cues">
  <h2>Which pattern? Cue → technique</h2>
  <p class="sub">Read the problem for these signals. Several can apply — pick the one that removes the brute force’s bottleneck.</p>
  <table class="pb-table cues"><thead><tr><th>If the problem says / has…</th><th>Reach for</th></tr></thead><tbody>
    <tr><td>“have I seen…”, duplicates, counts, pairs with a target (unsorted)</td><td>Hash map / set</td></tr>
    <tr><td>sorted array + pair/triplet, palindrome, compare from both ends</td><td>Two pointers</td></tr>
    <tr><td>longest / shortest / count of <b>contiguous</b> subarray or substring</td><td>Sliding window (prefix sums if negatives)</td></tr>
    <tr><td>subarray sum = k, range sums, “product except self”</td><td>Prefix / suffix sums (+ hash map)</td></tr>
    <tr><td>matching brackets, nested structure, undo, evaluate expression</td><td>Stack</td></tr>
    <tr><td>“next greater / smaller”, days until, spans, largest rectangle</td><td>Monotonic stack</td></tr>
    <tr><td>window maximum / minimum</td><td>Monotonic deque</td></tr>
    <tr><td>sorted or rotated input, O(log n), “minimum X such that…”</td><td>Binary search (on index or on the answer)</td></tr>
    <tr><td>linked list: middle, cycle, kth from end, reverse</td><td>Fast &amp; slow pointers, pointer surgery</td></tr>
    <tr><td>tree: height, path, balance, validate, LCA</td><td>DFS returning values up</td></tr>
    <tr><td>tree / graph “per level”, fewest steps (unweighted)</td><td>BFS</td></tr>
    <tr><td>prefix lookups, many words at once, autocomplete</td><td>Trie</td></tr>
    <tr><td>k largest / smallest / closest, merge k sorted, running median</td><td>Heap</td></tr>
    <tr><td>“all” subsets / permutations / combinations / placements</td><td>Backtracking</td></tr>
    <tr><td>grid regions, connected components, flood fill</td><td>DFS/BFS or Union-Find</td></tr>
    <tr><td>spreading from many sources at once</td><td>Multi-source BFS</td></tr>
    <tr><td>prerequisites, “a before b”, build order</td><td>Topological sort</td></tr>
    <tr><td>weighted shortest path (non-negative)</td><td>Dijkstra</td></tr>
    <tr><td>at most k edges / negative weights</td><td>Bellman-Ford</td></tr>
    <tr><td>connect everything at minimum cost</td><td>MST (Prim / Kruskal)</td></tr>
    <tr><td>“number of ways”, min/max cost, “can you reach” with overlapping choices</td><td>Dynamic programming</td></tr>
    <tr><td>two strings compared position by position</td><td>2-D DP over prefixes</td></tr>
    <tr><td>pick items to hit a target sum</td><td>Knapsack DP</td></tr>
    <tr><td>locally best choice that provably never hurts</td><td>Greedy (often after sorting)</td></tr>
    <tr><td>ranges, meetings, bookings, overlaps</td><td>Sort intervals + sweep</td></tr>
    <tr><td>“appears twice except one”, O(1) space counting</td><td>Bit manipulation (XOR)</td></tr>
  </tbody></table>
</section>

<section class="pb-sec" id="pb-stuck">
  <h2>When you’re stuck</h2>
  <div class="pb-grid two-col">
    <div class="card"><ol class="pb-steps">
      <li><b>Solve it by hand</b> on a small example, as a non-programmer would. Write down the rules you used — they are your algorithm.</li>
      <li><b>Draw it</b>: the array with pointers, the tree, the grid with arrows.</li>
      <li><b>Make more examples</b>, especially edge cases; a pattern often appears.</li>
      <li><b>Write the brute force</b> and find the repeated work — that’s what to optimise.</li>
    </ol></div>
    <div class="card"><ol class="pb-steps" start="5">
      <li><b>Run through the data structures</b>: hash map, two pointers, stack, heap, tree, graph, DP table.</li>
      <li><b>Simplify the problem</b>: smaller constraints, one dimension, sorted input — solve that first.</li>
      <li><b>Work backwards</b> from the answer (Pacific Atlantic, Surrounded Regions).</li>
      <li><b>Say what you’re thinking</b>: interviewers give hints to candidates they can follow.</li>
    </ol></div>
  </div>
</section>

<section class="pb-sec" id="pb-ds">
  <h2>Data structures in C++, Java and JavaScript</h2>
  <table class="pb-table ds"><thead><tr><th>Need</th><th>C++</th><th>Java</th><th>JavaScript</th><th>Cost</th></tr></thead><tbody>
    <tr><td>Dynamic array</td><td>vector</td><td>ArrayList / int[]</td><td>Array</td><td>index O(1), push O(1)*, insert/remove middle O(n)</td></tr>
    <tr><td>Hash map</td><td>unordered_map</td><td>HashMap</td><td>Map</td><td>get/put O(1) average</td></tr>
    <tr><td>Hash set</td><td>unordered_set</td><td>HashSet</td><td>Set</td><td>add/has O(1) average</td></tr>
    <tr><td>Ordered map / set</td><td>map / set</td><td>TreeMap / TreeSet</td><td><i>none</i> — sort + binary search</td><td>O(log n); floor/ceiling via lower_bound / floorKey</td></tr>
    <tr><td>Heap</td><td>priority_queue (<b>max</b> first)</td><td>PriorityQueue (<b>min</b> first)</td><td><i>none</i> — write a Heap class</td><td>push/pop O(log n), top O(1)</td></tr>
    <tr><td>Stack</td><td>vector / stack</td><td>ArrayDeque (push/pop)</td><td>Array push/pop</td><td>O(1)</td></tr>
    <tr><td>Queue / deque</td><td>queue / deque</td><td>ArrayDeque</td><td>Array + head index (shift() is O(n))</td><td>O(1) at both ends</td></tr>
    <tr><td>Sort</td><td>sort (introsort)</td><td>Arrays.sort / Collections.sort</td><td>arr.sort((a, b) =&gt; a − b)</td><td>O(n log n)</td></tr>
    <tr><td>String building</td><td>string +=, reserve</td><td>StringBuilder</td><td>parts.push() then join('')</td><td>amortised O(1) per char</td></tr>
  </tbody></table>
  <p class="small muted">* amortised. JavaScript’s default sort compares as strings — always pass a comparator for numbers. Java’s <code>a − b</code> comparator can overflow; use <code>Integer.compare(a, b)</code> for large values.</p>
</section>

<section class="pb-sec" id="pb-edge">
  <h2>Edge-case checklist</h2>
  <div class="pb-chips">
    <span>empty input</span><span>one element</span><span>two elements</span><span>all equal</span><span>duplicates</span><span>negatives &amp; zero</span>
    <span>already sorted / reverse sorted</span><span>int overflow (sums, products, mid)</span><span>k = 0, k = n, k &gt; n</span><span>null head / root</span>
    <span>single row or column</span><span>disconnected graph</span><span>cycles</span><span>no valid answer → return −1 / [] / ""</span><span>very large n (recursion depth)</span>
  </div>
</section>

<section class="pb-sec" id="pb-recursion">
  <h2>Complexity of recursion at a glance</h2>
  <table class="pb-table"><thead><tr><th>Recurrence</th><th>Time</th><th>Example</th></tr></thead><tbody>
    <tr><td>T(n) = T(n/2) + O(1)</td><td>O(log n)</td><td>Binary search</td></tr>
    <tr><td>T(n) = 2T(n/2) + O(n)</td><td>O(n log n)</td><td>Merge sort</td></tr>
    <tr><td>T(n) = 2T(n/2) + O(1)</td><td>O(n)</td><td>Tree traversal</td></tr>
    <tr><td>T(n) = T(n−1) + O(1)</td><td>O(n)</td><td>Linear recursion</td></tr>
    <tr><td>T(n) = 2T(n−1) + O(1)</td><td>O(2ⁿ)</td><td>Naive Fibonacci, subsets</td></tr>
    <tr><td>b branches, depth d</td><td>O(b^d)</td><td>Backtracking (Word Search: 4 · 3^(L−1))</td></tr>
    <tr><td>Memoised: states × work per state</td><td>e.g. O(n · amount)</td><td>Coin Change</td></tr>
  </tbody></table>
</section>

<section class="pb-sec" id="pb-sources">
  <h2>Sources</h2>
  <ul class="pb-refs">
    <li>Dunlosky, Rawson, Marsh, Nathan &amp; Willingham (2013). Improving students’ learning with effective learning techniques. <i>Psychological Science in the Public Interest</i>.</li>
    <li>Roediger &amp; Karpicke (2006). Test-enhanced learning. <i>Psychological Science</i>.</li>
    <li>Cepeda, Pashler, Vul, Wixted &amp; Rohrer (2006). Distributed practice in verbal recall tasks. <i>Psychological Bulletin</i>.</li>
    <li>Rohrer &amp; Taylor (2007). The shuffling of mathematics problems improves learning. <i>Instructional Science</i>; Taylor &amp; Rohrer (2010). The effects of interleaved practice. <i>Applied Cognitive Psychology</i>.</li>
    <li>Kornell &amp; Bjork (2008). Learning concepts and categories: Is spacing the “enemy of induction”? <i>Psychological Science</i>.</li>
    <li>Chi, Bassok, Lewis, Reimann &amp; Glaser (1989). Self-explanations. <i>Cognitive Science</i>.</li>
    <li>Margulieux, Guzdial &amp; Catrambone (2012). Subgoal-labeled instructional material improves performance and transfer. <i>ICER</i>.</li>
    <li>Parsons &amp; Haden (2006). Parson’s programming puzzles. <i>ACE</i>; Ericson, Margulieux &amp; Rick (2017). Solving Parsons problems versus fixing and writing code. <i>Koli Calling</i>.</li>
    <li>Bjork (1994). Memory and metamemory considerations in the training of human beings. In <i>Metacognition</i>.</li>
    <li>Ye et al. — FSRS (Free Spaced Repetition Scheduler), open-spaced-repetition, FSRS-6 default parameters.</li>
    <li>USACO Guide — Time complexity; Tech Interview Handbook — Coding interview techniques.</li>
  </ul>
</section>`;
