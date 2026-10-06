(() => {
  'use strict';

  const ITEMS = window.ITEMS, NOTES = window.NOTES, TOPICS = window.TOPICS, SOLUTIONS = window.SOLUTIONS || {};
  const LESSONS = window.LESSONS || {}, PLUS = window.PLUS || {};
  const PLAN_START = [2026, 8, 20]; // 20 Sep 2026 (month is 0-based)
  const WEEKS = Math.max(...ITEMS.map(i => i.week));
  const PROBLEMS = ITEMS.filter(i => i.kind === 'Practice');
  const BY_N = Object.fromEntries(ITEMS.map(i => [i.n, i]));
  const WEEK_DATES = Object.fromEntries(ITEMS.map(i => [i.week, i.dates]));

  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const TOPIC_BY_SLUG = {};
  const TOPIC_BY_NAME = {};
  for (const t of TOPICS) {
    t.slug = slug(t.name);
    t.items = ITEMS.filter(i => i.topic === t.name);
    t.problems = t.items.filter(i => i.kind === 'Practice');
    t.learn = t.items.filter(i => i.kind === 'Learn');
    t.week = Math.min(...t.items.map(i => i.week));
    TOPIC_BY_SLUG[t.slug] = t;
    TOPIC_BY_NAME[t.name] = t;
  }

  // ── Dates (local calendar days as YYYY-MM-DD) ─────────────────
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => iso(new Date());
  const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return iso(new Date(y, m - 1, d + n)); };
  const planDay = () => dayNum(today()) - Date.UTC(...PLAN_START) / 864e5;
  const currentWeek = () => Math.min(WEEKS, Math.max(1, Math.floor(planDay() / 7) + 1));

  // ── State ─────────────────────────────────────────────────────
  const KEY = 'dsa-revise:v1';
  const defaults = () => ({ status: {}, srs: {}, days: {}, newPerDay: 8, theme: 'auto', hideInstall: false, lang: 'cpp', retention: 0.9, quiz: {}, parsons: {}, cxq: [0, 0], slips: {}, mocks: [], mock: null });
  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && typeof saved === 'object') return { ...defaults(), ...saved };
    } catch (e) { /* storage unavailable */ }
    const s = defaults();
    for (const i of ITEMS) if (i.done) s.status[i.n] = 'solved';
    return s;
  };
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save — storage is full or blocked'); } };
  const dayLog = (d = today()) => (S.days[d] ||= { reviewed: 0, fresh: 0 });

  // ── Spaced repetition: FSRS-6 ────────────────────────────────
  // Free Spaced Repetition Scheduler (open-spaced-repetition, Jarrett Ye). Each card keeps
  // stability s (days until recall drops to 90%) and difficulty d (1–10). Default parameters
  // are the published FSRS-6 defaults, fitted on hundreds of millions of Anki reviews.
  const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
    1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const DECAY = -W[20];
  const FACTOR = 0.9 ** (1 / DECAY) - 1;
  const clampD = d => Math.min(10, Math.max(1, d));
  const clampS = v => Math.max(0.001, v);
  const recall = (t, st) => (1 + FACTOR * t / st) ** DECAY; // probability you still remember after t days
  const initD = g => W[4] - Math.exp(W[5] * (g - 1)) + 1;
  const intervalFor = st => Math.min(3650, Math.max(1, Math.round((st / FACTOR) * (S.retention ** (1 / DECAY) - 1))));

  // g: 1 Again, 2 Hard, 3 Good, 4 Easy. Returns the new { s, d }.
  function fsrsNext(card, g, elapsed) {
    if (!card || card.s == null) return { s: clampS(W[g - 1]), d: clampD(initD(g)) };
    const { s: st, d } = card;
    let ns;
    if (elapsed < 1) {
      ns = st * Math.exp(W[17] * (g - 3 + W[18])) * st ** -W[19];
    } else {
      const r = recall(elapsed, st);
      ns = g === 1
        ? Math.min(W[11] * d ** -W[12] * ((st + 1) ** W[13] - 1) * Math.exp((1 - r) * W[14]), st / Math.exp(W[17] * W[18]))
        : st * (1 + Math.exp(W[8]) * (11 - d) * st ** -W[9] * (Math.exp((1 - r) * W[10]) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
    }
    const d2 = d + ((10 - d) * -W[6] * (g - 3)) / 9; // linear damping
    return { s: clampS(ns), d: clampD(W[7] * initD(4) + (1 - W[7]) * d2) }; // mean reversion
  }

  const GRADES = ['Again', 'Hard', 'Good', 'Easy'];
  const elapsedFor = card => (card && card.last ? dayNum(today()) - dayNum(card.last) : 0);
  const preview = (card, i) => intervalFor(fsrsNext(card, i + 1, elapsedFor(card)).s);
  const fmtDays = d => d < 30 ? `${d}d` : d < 365 ? `${Math.round(d / 30)}mo` : `${(d / 365).toFixed(1)}y`;
  const recallNow = card => (card && card.s ? recall(elapsedFor(card), card.s) : null);

  // Cards from the earlier Leitner scheduler keep their progress.
  for (const [n, c] of Object.entries(S.srs)) {
    if (c.s == null) S.srs[n] = { ...c, s: [0.4, 1, 3, 7, 14, 30, 60][c.box || 0], d: 5 };
  }

  const rate = (n, gi) => {
    const t = today();
    const prev = S.srs[n];
    const { s: st, d } = fsrsNext(prev, gi + 1, elapsedFor(prev));
    S.srs[n] = { s: st, d, due: addDays(t, intervalFor(st)), last: t, reps: (prev?.reps || 0) + 1, lapses: (prev?.lapses || 0) + (gi === 0 ? 1 : 0) };
    const log = dayLog(t);
    log.reviewed++;
    if (!prev) log.fresh++;
    save();
  };

  // Mix topics so consecutive cards differ (interleaving builds pattern discrimination).
  function interleave(list) {
    const pool = [...list], out = [];
    while (pool.length) {
      const last = out[out.length - 1];
      let k = pool.findIndex(p => !last || p.topic !== last.topic);
      if (k < 0) k = 0;
      out.push(pool.splice(k, 1)[0]);
    }
    return out;
  }

  const dueToday = () => {
    const t = today();
    const due = PROBLEMS.filter(p => S.srs[p.n] && S.srs[p.n].due <= t)
      .sort((a, b) => (recallNow(S.srs[a.n]) ?? 1) - (recallNow(S.srs[b.n]) ?? 1) || a.n - b.n); // most forgotten first
    const revisit = PROBLEMS.filter(p => S.status[p.n] === 'revisit' && !due.includes(p) && S.srs[p.n]?.last !== t);
    const room = Math.max(0, S.newPerDay - (S.days[t]?.fresh || 0));
    const unseen = PROBLEMS.filter(p => !S.srs[p.n]);
    const fresh = [
      ...unseen.filter(p => S.status[p.n]),
      ...unseen.filter(p => !S.status[p.n] && p.week <= currentWeek()),
    ].filter(p => !revisit.includes(p)).slice(0, room);
    return { due, revisit, fresh, all: interleave([...due, ...revisit, ...fresh]) };
  };

  const streak = () => {
    let d = today(), n = 0;
    if (!S.days[d]?.reviewed) d = addDays(d, -1);
    while (S.days[d]?.reviewed) { n++; d = addDays(d, -1); }
    return n;
  };

  const solvedCount = () => PROBLEMS.filter(p => S.status[p.n] === 'solved').length;

  // ── Helpers ───────────────────────────────────────────────────
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const view = $('#view');

  // C++ / Java / JavaScript highlighter: comments, strings, keywords, numbers, Types, calls
  const KEYWORDS = 'auto|bool|boolean|break|case|catch|char|class|const|constexpr|continue|default|delete|do|double|else|' +
    'enum|extends|false|final|for|function|if|implements|import|in|instanceof|int|interface|let|long|new|null|nullptr|of|' +
    'private|protected|public|return|short|static|struct|switch|this|throw|true|try|typeof|uint32_t|undefined|unsigned|' +
    'using|var|void|while|Infinity|template|typename|decltype|get|set|size_t';
  const CODE_RE = new RegExp(String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\x60(?:\\.|[^\x60\\])*\x60)|\b(${KEYWORDS})\b(?!\s*\()|\b(\d+(?:\.\d+)?)\b|\b([A-Z]\w*)\b|\b([A-Za-z_]\w*)(?=\s*\()`, 'g');
  const highlight = code => {
    let out = '', last = 0;
    code.replace(CODE_RE, (m, com, str, kw, num, type, fn, at) => {
      out += esc(code.slice(last, at));
      const cls = com ? 'c' : str ? 's' : kw ? 'k' : num ? 'n' : type ? 't' : 'f';
      out += `<span class="${cls}">${esc(m)}</span>`;
      last = at + m.length;
      return m;
    });
    return out + esc(code.slice(last));
  };

  let toastTimer;
  function toast(msg, action) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
    if (action) el.querySelector('button').onclick = action.run;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), action ? 8000 : 2400);
  }

  window.appToast = toast;

  const inkMark = n => `<span class="inkmark" data-inkmark="${n}" title="Has your scribble" ${window.Ink && Ink.has(n) ? '' : 'hidden'}>✎</span>`;
  const diffBadge = d => d ? `<span class="badge d-${esc(d)}">${esc(d[0])}</span>` : '';
  const statusDot = n => `<span class="dot ${esc(S.status[n] || '')}" data-dot="${n}" aria-label="${esc(S.status[n] || 'not started')}"></span>`;

  function notesHTML(p) {
    const x = NOTES[p.n];
    if (!x) return '';
    return `<div class="notes">
      <div><div class="lbl">What it tests</div>${esc(x.tests)}</div>
      <div><div class="lbl">Approach</div><ol>${x.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="key"><div class="lbl">Key insight</div>${esc(x.key)}</div>
      <div class="facts">
        <div><div class="lbl">Complexity</div><span class="cx">${esc(x.cx)}</span></div>
        ${x.trap && x.trap !== '—' ? `<div><div class="lbl">Watch out</div>${esc(x.trap)}</div>` : ''}
      </div>
      ${p.note ? `<div class="sheet">From your sheet: ${esc(p.note)}</div>` : ''}
    </div>`;
  }

  const LANGS = [['cpp', 'C++'], ['java', 'Java'], ['js', 'JS']];
  const langTabs = () => `<div class="segmented lang-tabs" role="tablist">${LANGS.map(([v, l]) =>
    `<button type="button" class="${S.lang === v ? 'on' : ''}" data-act="lang" data-v="${v}">${l}</button>`).join('')}</div>`;
  // src: "sol:<n>" or "tpl:<slug>" — lets a language switch re-render every block on the page
  const codeFor = src => {
    const [kind, id] = src.split(':');
    const code = kind === 'sol' ? SOLUTIONS[id]?.code : TOPIC_BY_SLUG[id]?.template;
    return (code && (code[S.lang] || code.cpp)) || '';
  };
  const codeBlock = src => `<div class="code-wrap">
      <div class="row code-bar">${langTabs()}<span class="spacer"></span>
        <button type="button" class="btn small ghost" data-act="copy" data-src="${src}">Copy</button></div>
      <pre class="code" data-code="${src}">${highlight(codeFor(src))}</pre>
    </div>`;

  function solutionHTML(p) {
    const s = SOLUTIONS[p.n];
    if (!s) return '';
    return `<div class="sol">
      <div class="sol-h"><span>Full solution</span><span class="verified">✓ passes ${s.tests} test${s.tests === 1 ? '' : 's'}</span></div>
      <div><div class="lbl">Algorithm</div><ol>${s.algo.map(a => `<li>${esc(a)}</li>`).join('')}</ol></div>
      ${window.Ink ? Ink.html(p.n) : ''}
      <div>
        <div class="lbl">Code</div>
        ${codeBlock(`sol:${p.n}`)}
      </div>
      <div><div class="row" style="gap:8px"><div class="lbl" style="margin:0">Dry run</div><span class="spacer"></span>
          <button type="button" class="btn small ghost" data-act="drystep" data-v="0">▶ Step through — predict each step</button></div>
        <div class="dry">
          <div class="io"><b>Input</b>${esc(s.ex)}</div>
          <ol class="trace">${s.dry.map(d => `<li>${esc(d)}</li>`).join('')}</ol>
          <div class="io out"><b>Output</b>${esc(s.out)}</div>
        </div>
      </div>
    </div>`;
  }

  // ── Study extras: statement, hint ladder, brute force → optimal, follow-ups ──
  const FAMILY = {
    hash: 'Hash map / set', prefix: 'Prefix / suffix sums', twoptr: 'Two pointers', window: 'Sliding window',
    stack: 'Stack', monostack: 'Monotonic stack / deque', bsearch: 'Binary search', bsanswer: 'Binary search on the answer',
    llist: 'Linked-list pointer surgery', fastslow: 'Fast & slow pointers', design: 'Data-structure design',
    treedfs: 'Tree DFS (recursion)', bfs: 'BFS level by level', trie: 'Trie', heap: 'Heap / priority queue',
    backtrack: 'Backtracking', graphdfs: 'Graph DFS / flood fill', multibfs: 'Multi-source BFS', topo: 'Topological sort',
    unionfind: 'Union-Find', dijkstra: 'Shortest path (Dijkstra / Bellman-Ford)', mst: 'Minimum spanning tree',
    dp1: '1-D dynamic programming', dp2: '2-D dynamic programming', knapsack: 'Knapsack DP', greedy: 'Greedy',
    intervals: 'Sort intervals + scan', sweep: 'Sweep line / events', matrix: 'Matrix simulation', bits: 'Bit manipulation',
  };
  // families that are easy to confuse — used to pick believable wrong answers
  const CONFUSE = {
    hash: ['twoptr', 'prefix', 'window', 'design'], prefix: ['hash', 'window', 'dp1'], twoptr: ['hash', 'window', 'bsearch', 'greedy'],
    window: ['twoptr', 'hash', 'prefix', 'monostack'], stack: ['monostack', 'design', 'backtrack', 'llist'],
    monostack: ['stack', 'window', 'heap', 'twoptr'], bsearch: ['bsanswer', 'twoptr', 'hash'], bsanswer: ['bsearch', 'greedy', 'dp1', 'heap'],
    llist: ['fastslow', 'twoptr', 'design', 'stack'], fastslow: ['llist', 'twoptr', 'hash'], design: ['hash', 'heap', 'stack', 'llist'],
    treedfs: ['bfs', 'backtrack', 'dp1', 'graphdfs'], bfs: ['treedfs', 'graphdfs', 'multibfs', 'dijkstra'], trie: ['hash', 'backtrack', 'treedfs'],
    heap: ['greedy', 'bsearch', 'sweep', 'monostack'], backtrack: ['dp1', 'graphdfs', 'treedfs', 'greedy'],
    graphdfs: ['bfs', 'unionfind', 'backtrack', 'multibfs'], multibfs: ['bfs', 'graphdfs', 'dijkstra', 'dp2'],
    topo: ['graphdfs', 'bfs', 'unionfind'], unionfind: ['graphdfs', 'topo', 'mst'], dijkstra: ['bfs', 'mst', 'dp2', 'topo'],
    mst: ['dijkstra', 'unionfind', 'greedy'], dp1: ['greedy', 'backtrack', 'dp2', 'knapsack'], dp2: ['dp1', 'knapsack', 'graphdfs', 'backtrack'],
    knapsack: ['dp1', 'greedy', 'backtrack', 'dp2'], greedy: ['dp1', 'heap', 'twoptr', 'intervals'], intervals: ['sweep', 'greedy', 'heap'],
    sweep: ['intervals', 'heap', 'prefix'], matrix: ['graphdfs', 'twoptr', 'bits'], bits: ['hash', 'matrix', 'prefix'],
  };

  const statementHTML = p => PLUS[p.n] ? `<div class="qline"><div class="lbl">The problem</div>${esc(PLUS[p.n].q)}</div>` : '';
  function hintsHTML(n, shown = 0) {
    const x = PLUS[n];
    if (!x) return '';
    return `<div class="hints" data-hints="${n}" data-shown="${shown}">
      <ol>${x.hints.map((h, i) => `<li ${i < shown ? '' : 'hidden'}><span class="hint-n">Hint ${i + 1}</span>${esc(h)}</li>`).join('')}</ol>
      ${shown < x.hints.length ? `<button type="button" class="btn small hint-btn" data-act="hint" data-n="${n}">💡 ${shown ? 'Next hint' : 'Stuck? Hint'} ${shown + 1}/${x.hints.length}</button>` : ''}
    </div>`;
  }
  const pathHTML = p => (PLUS[p.n] ? `<div class="pathbox"><div class="lbl">From brute force to optimal</div>
      <ol class="path">${PLUS[p.n].path.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div>` : '') +
    (window.Viz && Viz.has(p.n) ? `<div class="pathbox"><div class="lbl">See it run</div>${Viz.htmlProblem(p.n)}</div>` : '');
  function deeperHTML(p) {
    const x = PLUS[p.n];
    if (!x) return '';
    return `<div class="deeper">
      <div><div class="lbl">Interviewer follow-ups <span class="muted">· think first, then tap</span></div>
        ${x.fu.map(([q, a]) => `<details class="fu"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      ${x.rel.length ? `<div><div class="lbl">Related in your sheet</div><div class="rel">${x.rel.map(r =>
        `<a class="chip" href="#/problem/${r}">${esc(BY_N[r].title)}</a>`).join('')}</div></div>` : ''}
      <div class="row"><a class="btn small" href="#/parsons/${p.n}">🧩 Rebuild the code</a>
        <span class="muted small">Put the solution’s lines back in order</span></div>
    </div>`;
  }

  function statusButtons(n) {
    const s = S.status[n];
    return `<button type="button" class="btn small ${s === 'solved' ? 'on-solved' : ''}" data-act="status" data-n="${n}" data-v="solved">${s === 'solved' ? '✓ Solved' : 'Mark solved'}</button>
      <button type="button" class="btn small ${s === 'revisit' ? 'on-revisit' : ''}" data-act="status" data-n="${n}" data-v="revisit">${s === 'revisit' ? '↻ Revisit' : 'Flag revisit'}</button>`;
  }

  function problemRow(p, { showKey = false, showTopic = false } = {}) {
    const x = NOTES[p.n] || {};
    return `<details class="prob" data-n="${p.n}">
      <summary>
        ${statusDot(p.n)}
        <span class="t">${esc(p.title)}<small>#${p.n}${showTopic ? ` · ${esc(p.topic)}` : ''}</small></span>
        <span class="meta">${inkMark(p.n)}<span class="tag">${esc(x.pat)}</span>${diffBadge(p.diff)}</span>
        ${showKey ? `<span class="key-line">${esc(x.key)}</span>` : ''}
      </summary>
      <div class="prob-body" data-body="${p.n}"></div>
    </details>`;
  }

  function problemBody(p) {
    return `${statementHTML(p)}
      ${hintsHTML(p.n)}
      ${notesHTML(p)}
      ${pathHTML(p)}
      ${solutionHTML(p)}
      ${deeperHTML(p)}
      <div class="actions">
        ${statusButtons(p.n)}
        <span class="spacer"></span>
        <a class="btn small ghost" href="#/problem/${p.n}">Full page</a>
        <a class="btn small ghost" href="${esc(p.url)}" target="_blank" rel="noopener">LeetCode ↗</a>
      </div>`;
  }

  function setStatus(n, v) {
    S.status[n] = S.status[n] === v ? undefined : v;
    if (!S.status[n]) delete S.status[n];
    save();
    document.querySelectorAll(`[data-dot="${n}"]`).forEach(el => { el.className = `dot ${S.status[n] || ''}`; });
    document.querySelectorAll(`[data-actions="${n}"], details.prob[data-n="${n}"] .actions`).forEach(el => {
      el.querySelectorAll('[data-act="status"]').forEach(b => b.remove());
      el.insertAdjacentHTML('afterbegin', statusButtons(n));
    });
    renderNavFoot();
  }

  // ── Views ─────────────────────────────────────────────────────
  function quizLine() {
    const tot = Object.values(S.quiz).reduce((a, [r, t]) => [a[0] + r, a[1] + t], [0, 0]);
    return tot[1] ? ` · ${Math.round(tot[0] / tot[1] * 100)}% so far` : '';
  }
  function slipLine() {
    const count = {};
    for (const list of Object.values(S.slips)) for (const x of list) count[x.why] = (count[x.why] || 0) + 1;
    const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
    if (!top || top[1] < 3) return '';
    const label = SLIPS.find(([k]) => k === top[0])[1];
    return `<p class="small weak-line">Most common slip: <b>${esc(label)}</b> (${top[1]}×) — ${esc(SLIP_ADVICE[top[0]])}</p>`;
  }
  function weakLine() {
    const fams = Object.keys(S.quiz).filter(f => S.quiz[f][1] >= 3 && S.quiz[f][0] / S.quiz[f][1] < 0.7)
      .sort((a, b) => S.quiz[a][0] / S.quiz[a][1] - S.quiz[b][0] / S.quiz[b][1]).slice(0, 3);
    if (!fams.length) return '';
    return `<p class="small weak-line">Recognition to work on: ${fams.map(f => `<b>${esc(FAMILY[f])}</b> ${Math.round(S.quiz[f][0] / S.quiz[f][1] * 100)}%`).join(' · ')}</p>`;
  }

  function renderToday() {
    const t = today();
    const wk = currentWeek();
    const q = dueToday();
    const reviewedToday = S.days[t]?.reviewed || 0;
    const weekTopics = TOPICS.filter(tp => tp.items.some(i => i.week === wk));
    const unlocked = TOPICS.filter(tp => tp.week <= wk);
    const potd = unlocked[((planDay() % unlocked.length) + unlocked.length) % unlocked.length] || TOPICS[0];
    const weekProblems = PROBLEMS.filter(p => p.week === wk);
    const weekDone = weekProblems.filter(p => S.status[p.n] === 'solved').length;
    const revisit = PROBLEMS.filter(p => S.status[p.n] === 'revisit');
    const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

    view.innerHTML = `
      ${!standalone && !S.hideInstall ? `<div class="card banner">
        <div style="flex:1"><b>Install on your iPad:</b> tap <b>Share</b> → <b>Add to Home Screen</b>. It then opens full screen and works offline.</div>
        <button type="button" class="btn small ghost" data-act="hide-install">Dismiss</button></div>` : ''}
      <div class="eyebrow">${esc(dateLabel)}</div>
      <h1>Week ${wk} of ${WEEKS}</h1>
      <p class="sub">${esc(WEEK_DATES[wk] || '')} · ${weekTopics.map(tp => esc(tp.name)).join(' · ')}</p>

      <div class="stats">
        <div class="card stat"><b>${q.all.length}</b><span>cards to review</span></div>
        <div class="card stat"><b>${streak()}<small style="font-size:16px"> d</small></b><span>review streak</span></div>
        <div class="card stat"><b>${solvedCount()}<small style="font-size:16px" class="muted">/${PROBLEMS.length}</small></b><span>solved</span></div>
      </div>

      ${q.all.length ? `<div class="card hero">
          <div style="flex:1;min-width:220px"><h3 style="margin:0;font-size:19px">Today’s review</h3>
          <p>${[[q.due.length, 'due'], [q.revisit.length, 'flagged revisit'], [q.fresh.length, 'new']].filter(([c]) => c).map(([c, l]) => `${c} ${l}`).join(' · ')}</p></div>
          <a class="btn" href="#/review/today">Start · ${q.all.length} cards</a>
        </div>`
      : `<div class="card hero calm">
          <div style="flex:1;min-width:220px"><h3 style="margin:0;font-size:19px">${reviewedToday ? 'All caught up for today' : 'Nothing due right now'}</h3>
          <p class="muted">${reviewedToday ? `${reviewedToday} cards reviewed today. ` : ''}Drill a pattern if you want more.</p></div>
          <a class="btn" href="#/review">Drill a pattern</a>
        </div>`}

      <div class="practice-row">
        <a class="card practice" href="#/quiz/mix"><span class="pr-ico">🎯</span><span><b>Spot the pattern</b>
          <small>10 mixed problems · name the technique${quizLine()}</small></span></a>
        <a class="card practice" href="#/parsons/random"><span class="pr-ico">🧩</span><span><b>Rebuild the code</b>
          <small>Put a solution’s lines back in order${Object.keys(S.parsons).length ? ` · ${Object.keys(S.parsons).length} rebuilt` : ''}</small></span></a>
        <a class="card practice" href="#/mock"><span class="pr-ico">⏱</span><span><b>Mock interview</b>
          <small>${S.mock && !S.mock.ended ? 'In progress — resume' : '45 min, six phases, self-assessment'}</small></span></a>
      </div>
      ${weakLine()}${slipLine()}

      <h2>Pattern of the day</h2>
      <div class="card potd">
        <div class="row" style="margin-bottom:6px"><div class="ico">${esc(potd.icon)}</div>
          <h3 style="margin:0;font-size:20px">${esc(potd.name)}</h3><span class="spacer"></span>
          <a class="btn small" href="#/pattern/${potd.slug}">Open sheet</a></div>
        <p class="gist" style="font-size:16px;margin:8px 0 12px">${esc(potd.gist)}</p>
        <div class="eyebrow">Reach for it when</div>
        <ul class="clean signals">${potd.signals.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>

      <h2>This week <span class="muted small" style="font-weight:500">${weekDone}/${weekProblems.length} solved</span></h2>
      <div class="list">${weekProblems.map(p => problemRow(p, { showKey: true })).join('')}</div>

      ${revisit.length ? `<h2>Revisit pile</h2><div class="list">${revisit.map(p => problemRow(p, { showKey: true, showTopic: true })).join('')}</div>` : ''}
    `;
  }

  let patternsMode = 'map';
  // How the patterns build on each other (after the NeetCode roadmap). Each node: topic, x (0–100), row.
  const ROADMAP = [
    ['Arrays & Hashing', 50, 0], ['Two Pointers', 30, 1], ['Stack', 70, 1],
    ['Binary Search', 14, 2], ['Sliding Window', 42, 2], ['Linked List', 70, 2],
    ['Trees', 42, 3], ['Tries', 14, 4], ['Heap / Priority Queue', 42, 4], ['Backtracking', 74, 4],
    ['Intervals', 8, 5], ['Greedy', 26, 5], ['Graphs', 56, 5], ['1-D DP', 84, 5],
    ['Advanced Graphs', 34, 6], ['Math & Geometry', 56, 6], ['2-D DP', 73, 6], ['Bit Manipulation', 91, 6],
  ];
  const ROAD_EDGES = [
    ['Arrays & Hashing', 'Two Pointers'], ['Arrays & Hashing', 'Stack'], ['Two Pointers', 'Binary Search'], ['Two Pointers', 'Sliding Window'],
    ['Two Pointers', 'Linked List'], ['Binary Search', 'Trees'], ['Linked List', 'Trees'], ['Trees', 'Tries'], ['Trees', 'Heap / Priority Queue'],
    ['Trees', 'Backtracking'], ['Heap / Priority Queue', 'Intervals'], ['Heap / Priority Queue', 'Greedy'], ['Heap / Priority Queue', 'Advanced Graphs'],
    ['Backtracking', 'Graphs'], ['Backtracking', '1-D DP'], ['Graphs', 'Advanced Graphs'], ['Graphs', 'Math & Geometry'], ['Graphs', '2-D DP'],
    ['1-D DP', '2-D DP'], ['1-D DP', 'Bit Manipulation'],
  ];
  function roadmapSVG() {
    const wk = currentWeek();
    const pos = Object.fromEntries(ROADMAP.map(([n, x, r]) => [n, [x * 10, r * 104 + 48]]));
    const W = 1000, H = 7 * 104 + 10, NW = 150, NH = 64;
    const edges = ROAD_EDGES.map(([a, b]) => {
      const [x1, y1] = pos[a], [x2, y2] = pos[b];
      const my = (y1 + y2) / 2;
      return `<path d="M${x1} ${y1 + NH / 2} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2 - NH / 2}"/>`;
    }).join('');
    const nodes = ROADMAP.map(([name]) => {
      const tp = TOPIC_BY_NAME[name];
      const [x, y] = pos[name];
      const done = tp.problems.filter(p => S.status[p.n] === 'solved').length;
      const frac = tp.problems.length ? done / tp.problems.length : 0;
      const state = tp.week < wk ? 'past' : tp.week === wk ? 'now' : 'later';
      const label = name.replace(' / Priority Queue', '');
      return `<a href="#/pattern/${tp.slug}" class="rm-node ${state}">
        <rect x="${x - NW / 2}" y="${y - NH / 2}" width="${NW}" height="${NH}" rx="14"/>
        <text x="${x}" y="${y - 6}" class="rm-name">${esc(label)}</text>
        <text x="${x}" y="${y + 13}" class="rm-sub">Week ${tp.week} · ${done}/${tp.problems.length}</text>
        <rect class="rm-track" x="${x - NW / 2 + 14}" y="${y + 21}" width="${NW - 28}" height="4" rx="2"/>
        <rect class="rm-fill" x="${x - NW / 2 + 14}" y="${y + 21}" width="${(NW - 28) * frac}" height="4" rx="2"/>
      </a>`;
    }).join('');
    return `<div class="card roadmap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pattern roadmap">
      <g class="rm-edges">${edges}</g>${nodes}</svg>
      <div class="rm-legend small muted"><span class="rm-key now"></span>this week <span class="rm-key past"></span>earlier weeks <span class="rm-key later"></span>coming up · read top to bottom: each line leads to a pattern that builds on the one above</div></div>`;
  }
  function renderPatterns() {
    const wk = currentWeek();
    const cards = `<div class="pgrid">${TOPICS.map(tp => {
      const done = tp.problems.filter(p => S.status[p.n] === 'solved').length;
      const pct = tp.problems.length ? Math.round(done / tp.problems.length * 100) : 0;
      return `<a class="card pcard" href="#/pattern/${tp.slug}">
        <div class="row"><div class="ico">${esc(tp.icon)}</div><span class="spacer"></span>
          <span class="small ${tp.week === wk ? '' : 'muted'}" style="${tp.week === wk ? 'color:var(--accent);font-weight:700' : ''}">${tp.week === wk ? 'This week' : `Week ${tp.week}`}</span></div>
        <h3 style="margin:4px 0 0">${esc(tp.name)}</h3>
        <p>${esc(tp.gist)}</p>
        <div class="row small muted" style="gap:8px"><div class="bar" style="flex:1"><i style="width:${pct}%"></i></div>${done}/${tp.problems.length}</div>
      </a>`;
    }).join('')}</div>`;

    const onePage = TOPICS.map(tp => `<section class="op-topic">
      <h3><a href="#/pattern/${tp.slug}" style="color:inherit">${esc(tp.name)}</a><span class="muted small">Week ${tp.week}</span></h3>
      <p>${esc(tp.gist)}</p>
      <table class="op-table"><tbody>${tp.problems.map(p => {
        const x = NOTES[p.n];
        return `<tr><td><a href="#/problem/${p.n}">${esc(p.title)}</a> ${diffBadge(p.diff)}</td><td><span class="tag">${esc(x.pat)}</span></td><td>${esc(x.key)}</td></tr>`;
      }).join('')}</tbody></table>
    </section>`).join('');

    view.innerHTML = `
      <h1>Patterns</h1>
      <p class="sub">${TOPICS.length} patterns behind the ${PROBLEMS.length} problems in your sheet.</p>
      <div class="segmented" style="margin-bottom:18px">
        <button type="button" class="${patternsMode === 'map' ? 'on' : ''}" data-act="pmode" data-v="map">Roadmap</button>
        <button type="button" class="${patternsMode === 'cards' ? 'on' : ''}" data-act="pmode" data-v="cards">Cards</button>
        <button type="button" class="${patternsMode === 'page' ? 'on' : ''}" data-act="pmode" data-v="page">One-page skim</button>
      </div>
      ${patternsMode === 'map' ? roadmapSVG() : patternsMode === 'cards' ? cards : onePage}`;
  }

  function renderPattern(s) {
    const tp = TOPIC_BY_SLUG[s];
    if (!tp) return renderNotFound();
    const L = LESSONS[tp.name] || {};
    const done = tp.problems.filter(p => S.status[p.n] === 'solved').length;
    const ladder = (L.ladder || tp.problems.map(p => p.n)).map(n => BY_N[n]).filter(Boolean);
    const traps = [...(L.mistakes || []), ...tp.traps.filter(t => !(L.mistakes || []).includes(t))];
    view.innerHTML = `
      <a href="#/patterns" class="small">‹ Patterns</a>
      <div class="row" style="margin:10px 0 6px"><div class="ico">${esc(tp.icon)}</div>
        <h1 style="margin:0">${esc(tp.name)}</h1></div>
      <p class="sub">Week ${tp.week} · ${done}/${tp.problems.length} solved</p>
      <p class="gist">${esc(tp.gist)}</p>
      <div class="row" style="margin-bottom:22px">
        <a class="btn primary" href="#/review/topic/${tp.slug}">Drill ${tp.problems.length} cards</a>
        <a class="btn" href="#/quiz/${tp.slug}">Spot the pattern</a>
        ${tp.learn.map(l => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">Learn: ${esc(l.title.split(':')[0])} ↗</a>`).join('')}
      </div>
      <nav class="lesson-toc">${[['l-model', 'Mental model'], ['l-when', 'When to use'], ['l-method', 'Method'], ['l-viz', 'See it run'],
        ['l-code', 'Template'], ['l-variants', 'Variants'], ['l-follow', 'Follow-ups'], ['l-debug', 'Debug'], ['l-ladder', 'Study order']]
        .map(([id, l]) => `<a href="#/pattern/${tp.slug}" data-act="jump" data-v="${id}">${l}</a>`).join('')}</nav>

      ${L.intuition ? `<section class="card lesson-hero" id="l-model">
        <div class="eyebrow">Mental model</div><p class="lesson-big">${esc(L.intuition)}</p>
        <div class="eyebrow" style="margin-top:14px">Why it works</div><p>${esc(L.why)}</p>
      </section>` : ''}

      <div class="two" id="l-when">
        <div class="card"><div class="eyebrow">Reach for it when</div><ul class="clean">${tp.signals.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        ${L.vs ? `<div class="card"><div class="eyebrow">This or something else?</div>
          <table class="vs">${L.vs.map(([a, b]) => `<tr><td>${esc(a)}</td><td>→ <b>${esc(b)}</b></td></tr>`).join('')}</table></div>` : ''}
      </div>

      ${L.steps ? `<h2 id="l-method">The method</h2>
        <ol class="method">${L.steps.map(([lbl, d]) => `<li><b>${esc(lbl)}</b><span>${esc(d)}</span></li>`).join('')}</ol>` : ''}

      <h2 id="l-viz">See it run</h2>
      ${window.Viz ? Viz.html(tp.name) : ''}

      <h2 id="l-code">Template</h2>
      ${codeBlock(`tpl:${tp.slug}`)}
      <p class="small muted" style="margin-top:8px">Complexity: <span class="cx">${esc(tp.cx)}</span></p>

      ${L.variants ? `<h2 id="l-variants">Variants you’ll meet</h2>
        <table class="pb-table variants"><thead><tr><th>Variant</th><th>Idea</th><th>Example</th></tr></thead><tbody>
        ${L.variants.map(([a, b, c]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join('')}</tbody></table>` : ''}

      ${L.say ? `<div class="card say-card"><div class="eyebrow">Say it in the interview</div><p>${esc(L.say)}</p></div>` : ''}

      ${L.followups ? `<h2 id="l-follow">Follow-ups interviewers ask <span class="muted small" style="font-weight:500">think first, then tap</span></h2>
        <div class="fu-list">${L.followups.map(([q, a]) => `<details class="fu"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : ''}

      <h2 id="l-debug">Debug checklist</h2>
      <div class="card"><ul class="checklist">${traps.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>

      <h2 id="l-ladder">Study order <span class="muted small" style="font-weight:500">easiest idea first, each builds on the last</span></h2>
      <div class="list ladder">${ladder.map((p, i) => `<div class="ladder-row"><span class="ladder-n">${i + 1}</span>${problemRow(p, { showKey: true })}</div>`).join('')}</div>`;
  }

  const filters = { q: '', topic: '', diff: '', status: '' };
  function renderProblems() {
    view.innerHTML = `
      <h1>Problems</h1>
      <p class="sub">Tap a problem for its approach and notes.</p>
      <div class="filters">
        <input class="search" type="search" placeholder="Search problems, patterns, tricks…" value="${esc(filters.q)}" data-filter="q" autocomplete="off" autocorrect="off" spellcheck="false">
        <div class="chips">
          <select class="chip" data-filter="topic" aria-label="Topic">
            <option value="">All topics</option>
            ${TOPICS.map(tp => `<option value="${esc(tp.name)}" ${filters.topic === tp.name ? 'selected' : ''}>${esc(tp.name)}</option>`).join('')}
          </select>
          ${['', 'Easy', 'Medium', 'Hard'].map(d => `<button type="button" class="chip ${filters.diff === d ? 'on' : ''}" data-act="fdiff" data-v="${d}">${d || 'Any level'}</button>`).join('')}
          ${[['', 'Any status'], ['todo', 'To do'], ['solved', 'Solved'], ['revisit', 'Revisit']].map(([v, l]) => `<button type="button" class="chip ${filters.status === v ? 'on' : ''}" data-act="fstatus" data-v="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <div id="plist"></div>`;
    renderProblemList();
  }

  function renderProblemList() {
    const q = filters.q.trim().toLowerCase();
    // every search word must match the start of a word, so "heap" doesn't hit "cheapest"
    const words = q.split(/\s+/).filter(Boolean).map(w => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    const match = p => {
      if (filters.topic && p.topic !== filters.topic) return false;
      if (filters.diff && p.diff !== filters.diff) return false;
      const st = S.status[p.n] || 'todo';
      if (filters.status && st !== filters.status) return false;
      if (!q) return true;
      const x = NOTES[p.n] || {};
      const hay = [p.title, p.topic, x.pat, x.tests, x.key, `#${p.n}`].join(' ').toLowerCase();
      return words.every(w => w.test(hay));
    };
    const shown = PROBLEMS.filter(match);
    const groups = TOPICS.map(tp => [tp, shown.filter(p => p.topic === tp.name)]).filter(([, ps]) => ps.length);
    $('#plist').innerHTML = shown.length
      ? groups.map(([tp, ps]) => `<div class="group-h"><h3>${esc(tp.name)}</h3><span class="muted small">${ps.length}</span></div>
          <div class="list">${ps.map(p => problemRow(p)).join('')}</div>`).join('')
      : `<p class="muted" style="text-align:center;padding:40px 0">No problems match.</p>`;
  }

  function renderProblem(n) {
    const p = BY_N[n];
    if (!p || p.kind !== 'Practice') return renderNotFound();
    const tp = TOPIC_BY_NAME[p.topic];
    const i = PROBLEMS.indexOf(p);
    const prev = PROBLEMS[i - 1], next = PROBLEMS[i + 1];
    view.innerHTML = `
      <a href="#/pattern/${tp.slug}" class="small">‹ ${esc(tp.name)}</a>
      <div class="row" style="margin-top:10px;gap:10px">${statusDot(p.n)}<h1 style="margin:0">${esc(p.title)}</h1></div>
      <p class="sub" style="margin-top:6px">#${p.n} · Week ${p.week} · ${diffBadge(p.diff)} <span class="tag">${esc(NOTES[p.n].pat)}</span></p>
      <div class="card prob-page">
        ${statementHTML(p)}
        ${hintsHTML(p.n)}
        ${notesHTML(p)}
        ${pathHTML(p)}
        ${solutionHTML(p)}
        ${deeperHTML(p)}
        <div class="actions" data-actions="${p.n}">
          ${statusButtons(p.n)}
          <span class="spacer"></span>
          <a class="btn small ghost" href="${esc(p.url)}" target="_blank" rel="noopener">LeetCode ↗</a>
        </div>
      </div>
      <div class="row" style="margin-top:16px">
        ${prev ? `<a class="btn small" href="#/problem/${prev.n}">‹ ${esc(prev.title)}</a>` : ''}
        <span class="spacer"></span>
        ${next ? `<a class="btn small" href="#/problem/${next.n}">${esc(next.title)} ›</a>` : ''}
      </div>`;
  }

  // ── Review session ───────────────────────────────────────────
  let session = null;
  function startSession(kind, arg) {
    let cards, title;
    if (kind === 'today') { cards = dueToday().all; title = 'Today’s review'; }
    else if (kind === 'topic') { const tp = TOPIC_BY_SLUG[arg]; if (!tp) return null; cards = tp.problems.slice(); title = tp.name; }
    else if (kind === 'revisit') { cards = PROBLEMS.filter(p => S.status[p.n] === 'revisit'); title = 'Revisit pile'; }
    else if (kind === 'random') {
      cards = PROBLEMS.filter(p => p.week <= currentWeek()).sort(() => Math.random() - .5).slice(0, 10); title = 'Random 10';
    } else return null;
    return { key: `${kind}/${arg || ''}`, title, queue: cards.map(p => p.n), idx: 0, flipped: false, requeued: {}, total: cards.length, counts: [0, 0, 0, 0] };
  }

  function renderReviewHome() {
    session = null;
    const q = dueToday();
    const revisit = PROBLEMS.filter(p => S.status[p.n] === 'revisit').length;
    view.innerHTML = `
      <h1>Review</h1>
      <p class="sub">See a problem, recall its pattern and approach, then reveal and grade yourself.</p>
      <div class="row" style="margin-bottom:8px">
        <a class="btn primary ${q.all.length ? '' : 'disabled'}" href="#/review/today" ${q.all.length ? '' : 'aria-disabled="true"'}>Today’s cards · ${q.all.length}</a>
        <a class="btn" href="#/review/random">Random 10</a>
        ${revisit ? `<a class="btn" href="#/review/revisit">Revisit pile · ${revisit}</a>` : ''}
      </div>
      <h2>Practice modes</h2>
      <div class="practice-row">
        <a class="card practice" href="#/quiz/mix"><span class="pr-ico">🎯</span><span><b>Spot the pattern · mixed</b><small>Interleaved across weeks 1–${currentWeek()}</small></span></a>
        <a class="card practice" href="#/quiz/all"><span class="pr-ico">🌍</span><span><b>Spot the pattern · all</b><small>Every problem in the sheet</small></span></a>
        <a class="card practice" href="#/parsons/random"><span class="pr-ico">🧩</span><span><b>Rebuild the code</b><small>Parsons puzzle, in ${LANGS.find(l => l[0] === S.lang)[1]}</small></span></a>
        <a class="card practice" href="#/quiz/cx"><span class="pr-ico">⏳</span><span><b>Complexity drill</b><small>Name the time complexity${S.cxq[1] ? ` · ${Math.round(S.cxq[0] / S.cxq[1] * 100)}% so far` : ''}</small></span></a>
        <a class="card practice" href="#/mock"><span class="pr-ico">⏱</span><span><b>Mock interview</b><small>45 minutes, timed, self-assessed</small></span></a>
      </div>
      <h2>Drill a pattern</h2>
      <div class="drill-list">${TOPICS.map(tp => `<a href="#/review/topic/${tp.slug}"><span>${esc(tp.name)}</span><span class="muted small">${tp.problems.length}</span></a>`).join('')}</div>
      <h2>How grading works</h2>
      <div class="card small" style="color:var(--ink-2)">
        Scheduling uses <b>FSRS-6</b>, the algorithm behind modern Anki: each card tracks how stable your memory is and comes back just before you would forget it (aiming for ${Math.round(S.retention * 100)}% recall — change in More).
        <b style="color:var(--hard)">Again</b> — couldn’t recall it (shows again this session).
        <b style="color:var(--med)">Hard</b> — got there slowly or needed a hint.
        <b style="color:var(--easy)">Good</b> — recalled the pattern and approach.
        <b style="color:var(--accent)">Easy</b> — instant.
        Today’s cards are <b>interleaved</b> across topics — mixing problem types trains you to recognise which pattern applies, not just how to run it.
        New cards come from your solved problems first, then the current week’s plan (${S.newPerDay}/day).
      </div>`;
  }

  function renderReview() {
    const s = session;
    if (s.idx >= s.queue.length) return renderSessionDone();
    const n = s.queue[s.idx];
    const p = BY_N[n];
    const x = NOTES[n];
    const card = S.srs[n];
    const pct = Math.round(s.idx / s.queue.length * 100);
    view.innerHTML = `<div class="review">
      <div class="rv-top">
        <a href="#/review" class="btn small ghost" aria-label="End session">✕</a>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <span class="small muted" style="font-variant-numeric:tabular-nums">${s.idx + 1}/${s.queue.length}</span>
      </div>
      <div class="card flash ${s.flipped ? 'flipped' : ''}" ${s.flipped ? '' : 'data-act="flip" role="button" tabindex="0"'}>
        <div class="row small muted" style="gap:8px">${esc(s.title)} · #${n}${card ? ` · recall ${Math.round(recallNow(card) * 100)}%` : ' · new'} ${diffBadge(p.diff)}${S.status[n] === 'revisit' ? ' <span class="badge d-Hard">revisit</span>' : ''}</div>
        <div class="q-title">${esc(p.title)}</div>
        ${PLUS[n] ? `<p class="q-text">${esc(PLUS[n].q)}</p>` : ''}
        ${s.flipped
          ? `<div class="row" style="gap:8px"><span class="tag" style="font-size:14px">${esc(x.pat)}</span><span class="muted small">${esc(p.topic)}</span><span class="spacer"></span><a class="small" href="${esc(p.url)}" target="_blank" rel="noopener">LeetCode ↗</a></div>${notesHTML(p)}
            ${pathHTML(p)}
            ${s.showSol ? solutionHTML(p) + deeperHTML(p) : `<button type="button" class="btn small" style="margin-top:14px;align-self:flex-start" data-act="showsol">Show algorithm, code &amp; dry run <span class="kbd">S</span></button>`}`
          : `${hintsHTML(n, s.hintsShown || 0)}
            <div class="prompt">Recall: <b>pattern</b> · <b>approach</b> · <b>key trick</b> · <b>complexity</b><br><br>Tap to reveal <span class="kbd">space</span> · hint <span class="kbd">H</span></div>`}
      </div>
      ${s.flipped && s.hintsShown ? `<p class="small muted" style="margin:10px 2px 0">You used ${s.hintsShown} hint${s.hintsShown === 1 ? '' : 's'} — <b>Hard</b> is the honest grade unless it clicked instantly.</p>` : ''}
      ${s.flipped ? `<div class="slips"><span class="small muted">What slowed you down? (optional)</span>${SLIPS.map(([k, l]) =>
        `<button type="button" class="chip ${s.slip === k ? 'on' : ''}" data-act="slip" data-v="${k}">${l}</button>`).join('')}</div>` : ''}
      ${s.flipped ? `<div class="grades">${GRADES.map((g, i) => `<button type="button" class="g${i}${s.hintsShown && i === 1 ? ' suggest' : ''}" data-act="grade" data-v="${i}">${g}<small>${fmtDays(preview(card, i))} <span class="kbd">${i + 1}</span></small></button>`).join('')}</div>` : ''}
    </div>`;
  }

  function renderSessionDone() {
    const s = session;
    const [a, h, g, e] = s.counts;
    view.innerHTML = `<div class="review"><div class="card done-card">
      <div class="big">✓</div>
      <h1>${esc(s.title)} done</h1>
      <p class="sub">${s.total} cards · ${g + e} good/easy · ${h} hard · ${a} again</p>
      <p class="muted">Streak: ${streak()} day${streak() === 1 ? '' : 's'}</p>
      <div class="row" style="justify-content:center;margin-top:16px">
        <a class="btn primary" href="#/today">Back to Today</a>
        <a class="btn" href="#/review">More review</a>
      </div></div></div>`;
    session = null;
  }

  const SLIPS = [['pattern', 'Didn’t spot the pattern'], ['trick', 'Forgot the key trick'], ['edge', 'Edge case'], ['index', 'Off-by-one / indices'],
    ['cx', 'Complexity'], ['api', 'Syntax / library']];
  const SLIP_ADVICE = { pattern: 'Do a round of Spot the pattern daily.', trick: 'Reread the key insight and say it aloud before revealing.',
    edge: 'Run the Playbook edge-case checklist before coding.', index: 'Dry-run 3-element examples by hand in the scribble box.',
    cx: 'Try the Complexity drill.', api: 'Rebuild the code in your interview language.' };
  function logSlip(n, why) {
    (S.slips[n] ||= []).push({ why, at: today() });
  }
  function grade(g) {
    const s = session;
    const n = s.queue[s.idx];
    if (s.slip) logSlip(n, s.slip);
    s.slip = null;
    rate(n, g);
    s.counts[g]++;
    if (g === 0 && !s.requeued[n]) {
      s.requeued[n] = true;
      s.queue.splice(Math.min(s.queue.length, s.idx + 4), 0, n);
    }
    s.idx++;
    s.flipped = false;
    s.showSol = false;
    s.hintsShown = 0;
    renderReview();
    renderNavFoot();
    window.scrollTo(0, 0);
  }

  // ── Spot the pattern: interleaved recognition quiz ───────────
  let quiz = null;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const famAcc = f => { const [r, t] = S.quiz[f] || [0, 0]; return (r + 1) / (t + 2); };
  // complexity drill: time complexity of the optimal solution
  const CX_RANK = ['O(1)', 'O(log n)', 'O(h)', 'O(n)', 'O(n + m)', 'O(n log k)', 'O(n log n)', 'O(m·n)', 'O(n²)', 'O(n² log n)', 'O(V + E)', 'O(E log V)', 'O(n·2ⁿ)', 'O(n·n!)'];
  const cxTime = n => NOTES[n].cx.split(' / ')[0].trim();
  const cxOk = n => /^O\([^()]*(\([^()]*\))?[^()]*\)$/.test(cxTime(n)) && !/ or | per |avg|worst|all ops|81|output|32|set bits|t\/min|maxPos/.test(cxTime(n));
  const CX_SAME = [['O(n)', 'O(n + m)', 'O(max(m,n))', 'O(|s| + |t|)', 'O(V + E)'], ['O(n²)', 'O(m·n)', 'O(R·C)'],
    ['O(log n)', 'O(log(m·n))', 'O(log min(m,n))', 'O(h)'], ['O(n log n)', 'O(E log E)', 'O(E log V)', 'O(n² log n)']];
  const cxSame = (a, b) => a === b || CX_SAME.some(g => g.includes(a) && g.includes(b));
  function cxOptions(n) {
    const right = cxTime(n);
    const k = CX_RANK.indexOf(right);
    let near = k >= 0 ? CX_RANK.filter((c, i) => !cxSame(c, right) && Math.abs(i - k) <= 3) : [];
    near = shuffle(near).slice(0, 2);
    const rest = shuffle(CX_RANK.filter(c => !cxSame(c, right) && !near.includes(c)));
    const picked = [right];
    for (const c of [...near, ...rest]) if (picked.length < 4 && !picked.some(x => cxSame(x, c))) picked.push(c);
    return shuffle(picked);
  }
  function startCxQuiz() {
    const pool = shuffle(PROBLEMS.filter(p => p.week <= currentWeek() && cxOk(p.n)));
    const qs = interleave(pool.slice(0, 10)).map(p => ({ n: p.n, fam: cxTime(p.n), options: cxOptions(p.n), picked: null, cx: true }));
    return { scope: 'cx', title: 'Complexity drill', qs, idx: 0, score: 0 };
  }

  function startQuiz(scope) {
    if (scope === 'cx') return startCxQuiz();
    let pool;
    if (scope === 'all') pool = PROBLEMS.slice();
    else if (scope && scope !== 'mix') { const tp = TOPIC_BY_SLUG[scope]; if (!tp) return null; pool = tp.problems.slice(); }
    else pool = PROBLEMS.filter(p => p.week <= currentWeek());
    pool = pool.filter(p => PLUS[p.n]);
    // favour families you get wrong, with randomness so it never repeats exactly
    const picks = pool.map(p => [famAcc(PLUS[p.n].fam) + Math.random() * 0.6, p]).sort((a, b) => a[0] - b[0]).slice(0, 10).map(x => x[1]);
    const qs = interleave(shuffle(picks)).map(p => {
      const fam = PLUS[p.n].fam;
      const near = shuffle([...(CONFUSE[fam] || [])]);
      const rest = shuffle(Object.keys(FAMILY).filter(f => f !== fam && !near.includes(f)));
      return { n: p.n, fam, options: shuffle([fam, ...[...near, ...rest].slice(0, 3)]), picked: null };
    });
    const title = scope && scope !== 'mix' && scope !== 'all' ? TOPIC_BY_SLUG[scope].name : scope === 'all' ? 'All patterns' : 'Mixed · weeks 1–' + currentWeek();
    return { scope: scope || 'mix', title, qs, idx: 0, score: 0 };
  }

  function renderQuiz() {
    const z = quiz;
    if (z.idx >= z.qs.length) return renderQuizDone();
    const q = z.qs[z.idx];
    const p = BY_N[q.n];
    const answered = q.picked != null;
    const pct = Math.round(z.idx / z.qs.length * 100);
    view.innerHTML = `<div class="review">
      <div class="rv-top">
        <a href="#/review" class="btn small ghost" aria-label="End quiz">✕</a>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <span class="small muted">${z.idx + 1}/${z.qs.length} · ${z.score} ✓</span>
      </div>
      <div class="card quiz-card">
        <div class="eyebrow">${q.cx ? 'Complexity drill' : `Spot the pattern · ${esc(z.title)}`}</div>
        <p class="quiz-q">${esc(PLUS[q.n].q)}</p>
        <p class="small muted">${q.cx ? `Optimal approach: <b>${esc(NOTES[q.n].pat)}</b>. What is its time complexity?` : 'Which technique gives the optimal solution?'}</p>
        <div class="quiz-opts">${q.options.map((f, i) => {
          const cls = !answered ? '' : f === q.fam ? 'right' : f === q.picked ? 'wrong' : 'dim';
          return `<button type="button" class="quiz-opt ${cls} ${q.cx ? 'mono' : ''}" data-act="qpick" data-v="${esc(f)}" ${answered ? 'disabled' : ''}><span class="kbd">${i + 1}</span>${esc(q.cx ? f : FAMILY[f])}</button>`;
        }).join('')}</div>
        ${answered ? `<div class="quiz-fb ${q.picked === q.fam ? 'ok' : 'no'}">
            <b>${q.picked === q.fam ? '✓ Right' : `✗ It’s ${esc(q.cx ? q.fam : FAMILY[q.fam])}`}</b> — <a href="#/problem/${p.n}">${esc(p.title)}</a> ${diffBadge(p.diff)}
            ${q.cx ? `<p><span class="lbl">Time / space</span><span class="cx">${esc(NOTES[p.n].cx)}</span></p>` : ''}
            <p><span class="lbl">Key insight</span>${esc(NOTES[p.n].key)}</p>
            ${q.cx ? '' : `<p class="small muted">Cue: ${esc(PLUS[q.n].hints[1])}</p>`}
          </div>
          <div class="row" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn primary" data-act="qnext">${z.idx + 1 < z.qs.length ? 'Next' : 'Finish'} <span class="kbd">↵</span></button></div>` : ''}
      </div>
    </div>`;
  }

  function renderQuizDone() {
    const z = quiz;
    const misses = z.qs.filter(q => q.picked !== q.fam);
    const weak = Object.keys(FAMILY).filter(f => (S.quiz[f]?.[1] || 0) >= 2).sort((a, b) => famAcc(a) - famAcc(b)).slice(0, 4);
    view.innerHTML = `<div class="review"><div class="card done-card">
      <div class="big">${z.score >= 8 ? '🎯' : z.score >= 5 ? '👍' : '💪'}</div>
      <h1>${z.score}/${z.qs.length} ${z.scope === 'cx' ? 'correct' : 'recognised'}</h1>
      <p class="sub">${esc(z.title)}</p>
      ${misses.length ? `<div class="quiz-miss"><div class="eyebrow">Worth another look</div>${misses.map(q =>
        `<a href="#/problem/${q.n}" class="chip">${esc(BY_N[q.n].title)} → ${esc(q.cx ? q.fam : FAMILY[q.fam])}</a>`).join('')}</div>` : ''}
      ${weak.length && z.scope !== 'cx' ? `<p class="small muted" style="margin-top:14px">Your least-recognised so far: ${weak.map(f => `<b>${esc(FAMILY[f])}</b> (${Math.round(S.quiz[f][0] / S.quiz[f][1] * 100)}%)`).join(', ')}</p>` : ''}
      <div class="row" style="justify-content:center;margin-top:16px">
        <a class="btn primary" href="#/quiz/${z.scope}" data-act="qagain">Another round</a>
        <a class="btn" href="#/today">Back to Today</a>
      </div></div></div>`;
  }

  // ── Rebuild the code (Parsons problems) ─────────────────────
  let pz = null;
  const isFixedLine = l => /^\s*[{}\[\]();,]*\s*$/.test(l) || /^\s*(public|private|protected):\s*$/.test(l);
  function startParsons(n) {
    const lines = codeFor(`sol:${n}`).split('\n').filter(l => l.trim() && !/defined by LeetCode/.test(l));
    const slots = lines.map((text, i) => ({ i, text, indent: text.match(/^\s*/)[0].length, fixed: isFixedLine(text), placed: null }));
    let pieces;
    do pieces = shuffle(slots.filter(x => !x.fixed).map(x => ({ id: x.i, text: x.text.trim() })));
    while (pieces.length > 2 && pieces.every((pc, k) => pc.id === slots.filter(x => !x.fixed)[k].i));
    return { n, lang: S.lang, slots, pieces, target: null, checked: false, tries: 0, done: false };
  }

  function renderParsons() {
    const z = pz;
    const p = BY_N[z.n];
    const movable = z.slots.filter(x => !x.fixed);
    const placed = movable.filter(x => x.placed).length;
    const correct = movable.filter(x => x.placed && x.placed.text === x.text.trim()).length;
    view.innerHTML = `
      <a href="#/problem/${p.n}" class="small">‹ ${esc(p.title)}</a>
      <h1 style="margin-top:10px">Rebuild the code</h1>
      <p class="sub">${esc(p.title)} · tap lines in the order they belong. Braces are already in place.</p>
      <div class="row" style="margin-bottom:12px">${langTabs()}<span class="spacer"></span>
        <span class="small muted">${placed}/${movable.length} placed${z.checked ? ` · ${correct} in the right place` : ''}</span></div>
      ${PLUS[p.n] ? `<p class="small" style="margin:0 0 12px;color:var(--ink-2)">${esc(PLUS[p.n].q)}</p>` : ''}
      <div class="pz-board ${z.done ? 'solved' : ''}">${z.slots.map(x => {
        const pad = `style="padding-left:${10 + x.indent * 7}px"`;
        if (x.fixed) return `<div class="pz-line fixed" ${pad}>${esc(x.text.trim())}</div>`;
        if (!x.placed) return `<button type="button" class="pz-line empty ${z.target === x.i ? 'target' : ''}" ${pad} data-act="pzslot" data-v="${x.i}">${z.target === x.i ? 'next line goes here' : '&nbsp;'}</button>`;
        const st = z.checked ? (x.placed.text === x.text.trim() ? 'ok' : 'bad') : '';
        return `<button type="button" class="pz-line placed ${st}" ${pad} data-act="pzslot" data-v="${x.i}">${esc(x.placed.text)}</button>`;
      }).join('')}</div>
      ${z.done ? `<div class="card pz-win"><b>✓ Rebuilt${z.tries > 1 ? ` in ${z.tries} checks` : ' first time'}!</b> Now try writing it from memory on LeetCode.
          <div class="row" style="margin-top:10px"><a class="btn small primary" href="#/parsons/random">Another problem</a><a class="btn small" href="#/problem/${p.n}">Back to the problem</a></div></div>`
        : `<div class="eyebrow" style="margin-top:18px">Lines to place</div>
      <div class="pz-pool">${z.pieces.map(pc => `<button type="button" class="pz-piece" data-act="pzpiece" data-v="${pc.id}">${esc(pc.text)}</button>`).join('') || '<span class="muted small">All lines placed — check your answer.</span>'}</div>
      <div class="row" style="margin-top:14px">
        <button type="button" class="btn primary" data-act="pzcheck" ${placed ? '' : 'disabled'}>Check</button>
        <button type="button" class="btn" data-act="pzhint">Place one for me</button>
        <button type="button" class="btn ghost" data-act="pzreset">Start over</button>
        <span class="spacer"></span>
        <button type="button" class="btn ghost" data-act="pzshow">Show answer</button>
      </div>`}`;
  }

  function parsonsAct(act, v) {
    const z = pz;
    const empty = () => z.slots.find(x => !x.fixed && !x.placed);
    if (act === 'pzpiece') {
      const k = z.pieces.findIndex(pc => pc.id === Number(v));
      if (k < 0) return;
      const slot = (z.target != null && z.slots[z.target] && !z.slots[z.target].placed) ? z.slots[z.target] : empty();
      if (!slot) return;
      slot.placed = z.pieces.splice(k, 1)[0];
      z.target = null;
      z.checked = false;
    } else if (act === 'pzslot') {
      const slot = z.slots[Number(v)];
      if (slot.placed) { z.pieces.push(slot.placed); slot.placed = null; z.checked = false; }
      else z.target = z.target === slot.i ? null : slot.i;
    } else if (act === 'pzcheck') {
      z.checked = true;
      z.tries++;
      const movable = z.slots.filter(x => !x.fixed);
      if (movable.every(x => x.placed && x.placed.text === x.text.trim())) {
        z.done = true;
        S.parsons[z.n] = { solved: true, tries: Math.min(z.tries, S.parsons[z.n]?.tries || Infinity), at: today() };
        save();
      }
    } else if (act === 'pzhint') {
      const slot = z.slots.find(x => !x.fixed && (!x.placed || x.placed.text !== x.text.trim()));
      if (!slot) return;
      if (slot.placed) { z.pieces.push(slot.placed); slot.placed = null; }
      const k = z.pieces.findIndex(pc => pc.text === slot.text.trim());
      if (k < 0) { // the matching piece sits in a wrong slot — pull it back
        const other = z.slots.find(x => x.placed && x.placed.text === slot.text.trim());
        z.pieces.push(other.placed); other.placed = null;
        return parsonsAct('pzhint');
      }
      slot.placed = z.pieces.splice(k, 1)[0];
      z.checked = false;
    } else if (act === 'pzreset') {
      pz = startParsons(z.n);
    } else if (act === 'pzshow') {
      for (const x of z.slots) if (!x.fixed) x.placed = { id: x.i, text: x.text.trim() };
      z.pieces = [];
      z.checked = true;
      z.done = true;
      z.tries = Infinity;
    }
    renderParsons();
  }

  // ── Mock interview: 45 minutes, six phases, honest self-assessment ──
  const MOCK_MIN = 45;
  const PHASES = [
    { name: 'Understand', until: 5, tips: ['Restate the problem in your own words', 'Ask about input size, ranges, duplicates, empty input', 'Work one example by hand; invent an edge case'] },
    { name: 'Match', until: 7, tips: ['Constraints → target complexity (Playbook table)', 'Scan the cues: contiguous? sorted? “all”? shortest? dependencies?'] },
    { name: 'Plan', until: 15, tips: ['Say the brute force and its cost', 'Find the bottleneck and the structure that removes it', 'State the final complexity before coding'] },
    { name: 'Implement', until: 35, tips: ['Code in subgoals: set-up, loop, update, answer', 'Clear names; narrate decisions', 'Write it on LeetCode (or by hand) in your interview language'] },
    { name: 'Review', until: 40, tips: ['Dry-run your code on the example, line by line', 'Then an edge case: empty, one element, duplicates, negatives'] },
    { name: 'Evaluate', until: 45, tips: ['Final time and space complexity', 'Trade-offs; what would you change for a stream / huge input?'] },
  ];
  const RUBRIC = [['understand', 'Understanding & questions'], ['approach', 'Approach & complexity'], ['code', 'Correct, clean code'], ['talk', 'Communication']];
  let mockTimer = 0;
  const mmss = ms => { const t = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
  const phaseAt = min => PHASES.findIndex(ph => min < ph.until);

  function pickMockProblem(diff) {
    const pool = PROBLEMS.filter(p => p.week <= currentWeek() && (!diff || p.diff === diff));
    const fresh = pool.filter(p => S.status[p.n] !== 'solved' && !S.mocks.some(m => m.n === p.n));
    const list = fresh.length ? fresh : pool;
    return list[Math.floor(Math.random() * list.length)];
  }

  function renderMock() {
    clearInterval(mockTimer);
    const m = S.mock;
    if (!m) return renderMockHome();
    if (m.ended) return renderMockReview();
    const p = BY_N[m.n];
    const elapsed = Date.now() - m.start;
    const ph = Math.max(0, phaseAt(elapsed / 60000));
    view.innerHTML = `<div class="mock">
      <div class="mock-bar card">
        <div><div class="eyebrow">Mock interview</div><div class="mock-timer" id="mock-timer">${mmss(elapsed)}</div><div class="small muted">of ${MOCK_MIN}:00</div></div>
        <div class="mock-phases">${PHASES.map((x, i) => `<span class="mph ${i < ph ? 'done' : i === ph ? 'now' : ''}" data-ph="${i}">${x.name}<small>${i ? PHASES[i - 1].until : 0}–${x.until}′</small></span>`).join('')}</div>
        <button type="button" class="btn primary" data-act="mockend">I’m done</button>
      </div>
      <div class="card mock-phase" id="mock-phase">${phaseCard(ph)}</div>
      <div class="card">
        <div class="row"><h2 style="margin:0">${esc(p.title)}</h2>${diffBadge(p.diff)}<span class="spacer"></span><a class="btn small" href="${esc(p.url)}" target="_blank" rel="noopener">Open on LeetCode ↗</a></div>
        <p class="quiz-q" style="font-weight:500">${esc(PLUS[p.n]?.q || '')}</p>
        <p class="small muted">Hints are best after 15 minutes of honest effort — each one used is recorded.</p>
        <div class="mock-hints">${hintsHTML(p.n, m.hints || 0)}</div>
      </div>
      <h2>Plan here</h2>
      ${window.Ink ? Ink.html(p.n) : ''}
      <p class="small muted" style="margin-top:12px">The solution stays hidden until you finish. <button type="button" class="btn small ghost" data-act="mockquit">Abandon this mock</button></p>
    </div>`;
    mockTimer = setInterval(() => {
      const t = $('#mock-timer');
      if (!t || !S.mock) return clearInterval(mockTimer);
      const el2 = Date.now() - S.mock.start;
      t.textContent = mmss(el2);
      t.classList.toggle('over', el2 > MOCK_MIN * 60000);
      const nowPh = Math.max(0, phaseAt(el2 / 60000));
      const box = $('#mock-phase');
      if (box && box.dataset.ph !== String(nowPh)) {
        box.dataset.ph = nowPh;
        box.innerHTML = phaseCard(nowPh);
        document.querySelectorAll('.mph').forEach(x => { const i = Number(x.dataset.ph); x.className = `mph ${i < nowPh ? 'done' : i === nowPh ? 'now' : ''}`; });
      }
    }, 1000);
  }
  function phaseCard(i) {
    const x = PHASES[i < 0 ? PHASES.length - 1 : i];
    return `<div class="eyebrow">Now: ${x.name}</div><ul class="clean">${x.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }

  function renderMockHome() {
    const hist = S.mocks.slice(-8).reverse();
    view.innerHTML = `
      <h1>Mock interview</h1>
      <p class="sub">45 minutes, one problem, the six-step method from the Playbook — then an honest self-assessment. Practising under realistic conditions is what makes the real thing feel familiar.</p>
      <div class="card">
        <div class="eyebrow">Start a mock</div>
        <p class="small muted" style="margin-top:0">Picks an unsolved problem from weeks 1–${currentWeek()}. Keep LeetCode open in another tab; the timer keeps running if you switch apps.</p>
        <div class="row">${['', 'Easy', 'Medium', 'Hard'].map(d => `<button type="button" class="btn ${d ? '' : 'primary'}" data-act="mockstart" data-v="${d}">${d || 'Surprise me'}</button>`).join('')}</div>
      </div>
      ${hist.length ? `<h2>Recent mocks</h2><div class="list">${hist.map(h => {
        const avg = RUBRIC.reduce((a, [k]) => a + (h.rubric[k] || 0), 0) / RUBRIC.length;
        return `<a class="card mock-row" href="#/problem/${h.n}"><b>${esc(BY_N[h.n].title)}</b>
          <span class="small muted">${esc(h.date)} · ${h.minutes} min · ${h.hints} hint${h.hints === 1 ? '' : 's'}</span>
          <span class="badge ${h.outcome === 'solved' ? 'd-Easy' : h.outcome === 'partial' ? 'd-Medium' : 'd-Hard'}">${h.outcome}</span>
          <span class="small">rubric ${avg.toFixed(1)}/4</span></a>`;
      }).join('')}</div>` : ''}`;
  }

  function renderMockReview() {
    const m = S.mock;
    const p = BY_N[m.n];
    view.innerHTML = `<div class="mock">
      <h1>How did it go?</h1>
      <p class="sub">${esc(p.title)} · ${m.minutes} min · ${m.hints || 0} hint${m.hints === 1 ? '' : 's'} used</p>
      <div class="card">
        <div class="eyebrow">Outcome</div>
        <div class="segmented">${[['solved', 'Solved'], ['partial', 'Partly'], ['missed', 'Didn’t get there']].map(([v, l]) =>
          `<button type="button" class="${m.outcome === v ? 'on' : ''}" data-act="mockout" data-v="${v}">${l}</button>`).join('')}</div>
        <div class="eyebrow" style="margin-top:16px">Rate yourself, 1–4</div>
        <div class="rubric">${RUBRIC.map(([k, l]) => `<div class="rub"><span>${l}</span><div class="segmented">${[1, 2, 3, 4].map(v =>
          `<button type="button" class="${(m.rubric || {})[k] === v ? 'on' : ''}" data-act="mockrub" data-k="${k}" data-v="${v}">${v}</button>`).join('')}</div></div>`).join('')}</div>
        <div class="eyebrow" style="margin-top:16px">What slowed you down?</div>
        <div class="slips">${SLIPS.map(([k, l]) => `<button type="button" class="chip ${(m.slips || []).includes(k) ? 'on' : ''}" data-act="mockslip" data-v="${k}">${l}</button>`).join('')}</div>
        <div class="row" style="margin-top:16px"><button type="button" class="btn primary" data-act="mocksave" ${m.outcome ? '' : 'disabled'}>Save &amp; see the solution</button></div>
      </div></div>`;
  }

  function mockAct(act, v, k) {
    const m = S.mock;
    if (act === 'mockstart') {
      const p = pickMockProblem(v);
      S.mock = { n: p.n, start: Date.now(), hints: 0 };
      save();
      return renderMock();
    }
    if (!m) return;
    if (act === 'mockend') { m.ended = true; m.minutes = Math.max(1, Math.round((Date.now() - m.start) / 60000)); m.rubric = {}; m.slips = []; }
    else if (act === 'mockquit') { if (!confirm('Abandon this mock? It won’t be saved.')) return; S.mock = null; }
    else if (act === 'mockout') m.outcome = v;
    else if (act === 'mockrub') m.rubric[k] = Number(v);
    else if (act === 'mockslip') m.slips = m.slips.includes(v) ? m.slips.filter(x => x !== v) : [...m.slips, v];
    else if (act === 'mocksave') {
      S.mocks.push({ n: m.n, date: today(), minutes: m.minutes, hints: m.hints || 0, outcome: m.outcome, rubric: m.rubric, slips: m.slips });
      for (const sl of m.slips) logSlip(m.n, sl);
      // feed the result into spaced repetition: solved clean → Good, with hints → Hard, otherwise Again
      rate(m.n, m.outcome === 'solved' ? (m.hints ? 1 : 2) : 0);
      if (m.outcome === 'solved') S.status[m.n] = 'solved';
      else if (S.status[m.n] !== 'solved') S.status[m.n] = 'revisit';
      const n = m.n;
      S.mock = null;
      save();
      renderNavFoot();
      toast('Mock saved — scheduled for review.');
      location.hash = `#/problem/${n}`;
      return;
    }
    save();
    renderMock();
  }

  function renderPlaybook() {
    const toc = [['pb-study', 'How to study'], ['pb-method', 'Interview method'], ['pb-constraints', 'Constraints'], ['pb-cues', 'Which pattern?'],
      ['pb-stuck', 'When stuck'], ['pb-ds', 'Data structures'], ['pb-edge', 'Edge cases'], ['pb-recursion', 'Recursion'], ['pb-sources', 'Sources']];
    view.innerHTML = `
      <h1>Playbook</h1>
      <p class="sub">How to study, how to run the interview, and the reference tables you’ll look at most.</p>
      <nav class="lesson-toc">${toc.map(([id, l]) => `<a href="#/playbook" data-act="jump" data-v="${id}">${l}</a>`).join('')}</nav>
      <div class="playbook">${window.PLAYBOOK_HTML || ''}</div>`;
  }

  function renderMore() {
    const reviewedTotal = Object.values(S.days).reduce((a, d) => a + (d.reviewed || 0), 0);
    view.innerHTML = `
      <h1>More</h1>
      <p class="sub">Settings, backup and install help.</p>
      <div class="card">
        <div class="setting"><div><b>New cards per day</b><p>Unseen problems added to today’s review.</p></div>
          <div class="segmented">${[5, 8, 12, 20].map(v => `<button type="button" class="${S.newPerDay === v ? 'on' : ''}" data-act="newper" data-v="${v}">${v}</button>`).join('')}</div></div>
        <div class="setting"><div><b>Target recall</b><p>FSRS schedules each card for when your recall would drop to this. Higher = more reviews, stronger memory.</p></div>
          <div class="segmented">${[0.85, 0.9, 0.95].map(v => `<button type="button" class="${S.retention === v ? 'on' : ''}" data-act="retention" data-v="${v}">${Math.round(v * 100)}%</button>`).join('')}</div></div>
        <div class="setting"><div><b>Code language</b><p>Used for every solution and pattern template.</p></div>
          ${langTabs()}</div>
        <div class="setting"><div><b>Appearance</b><p>Follows the iPad setting by default.</p></div>
          <div class="segmented">${['auto', 'light', 'dark'].map(v => `<button type="button" class="${S.theme === v ? 'on' : ''}" data-act="theme" data-v="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div></div>
        <div class="setting"><div><b>Backup</b><p>Progress lives on this device only. Export a JSON backup now and then.</p></div>
          <div class="row"><button type="button" class="btn small" data-act="export">Export</button>
          <label class="btn small" style="margin:0">Import<input type="file" accept="application/json,.json" data-act="import" hidden></label></div></div>
        <div class="setting"><div><b>Reset progress</b><p>Clears statuses, review history and streak (your scribbles are kept). Re-seeds from the sheet.</p></div>
          <button type="button" class="btn small" data-act="reset" style="color:var(--hard)">Reset</button></div>
      </div>

      <h2>Stats</h2>
      <div class="stats">
        <div class="card stat"><b>${Object.keys(S.srs).length}</b><span>cards seen</span></div>
        <div class="card stat"><b>${reviewedTotal}</b><span>total reviews</span></div>
        <div class="card stat"><b>${PROBLEMS.filter(p => (S.srs[p.n]?.s || 0) >= 21).length}</b><span>long-term (stability 3w+)</span></div>
      </div>

      <h2>Install on iPad</h2>
      <div class="card">
        <ol style="margin:0;padding-left:20px">
          <li>Open this page in <b>Safari</b>.</li>
          <li>Tap the <b>Share</b> button → <b>Add to Home Screen</b> → <b>Add</b>.</li>
          <li>Launch it once while online, then it works fully offline.</li>
        </ol>
        <p class="small muted" style="margin:12px 0 0" id="offline-status">Checking offline cache…</p>
      </div>
      <p class="small muted" style="margin-top:24px">Content: ${PROBLEMS.length} problems from switch_prep_tracker.xlsx (DSA sheet), ${TOPICS.length} patterns. Every problem has an algorithm, a dry run and code in C++, Java and JavaScript; every solution in every language passed its example and edge-case tests before publishing.</p>`;

    if ('caches' in window) {
      caches.keys().then(keys => {
        const el = $('#offline-status');
        if (el) el.textContent = keys.some(k => k.startsWith('dsa-revise')) ? '✓ Saved for offline use on this device.' : 'Not cached yet — reload once while online.';
      });
    }
  }

  function renderNotFound() {
    view.innerHTML = `<h1>Not found</h1><p><a href="#/today">Go to Today</a></p>`;
  }

  function renderNavFoot() {
    const el = $('#nav-foot');
    const pct = Math.round(solvedCount() / PROBLEMS.length * 100);
    el.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:6px"><span>${solvedCount()}/${PROBLEMS.length} solved</span><span>${streak()}d streak</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>`;
  }

  // ── Router ───────────────────────────────────────────────────
  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || 'today').split('/');
    const [page, a, b] = parts;
    document.querySelectorAll('[data-nav]').forEach(el => {
      const nav = el.dataset.nav;
      el.classList.toggle('active', nav === page || (nav === 'patterns' && (page === 'pattern' || page === 'problem')) ||
        (nav === 'review' && (page === 'quiz' || page === 'parsons' || page === 'mock')));
    });
    if (page !== 'review') session = null;
    if (page !== 'quiz') quiz = null;
    if (page !== 'parsons') pz = null;
    if (page !== 'mock') clearInterval(mockTimer);
    switch (page) {
      case 'today': renderToday(); break;
      case 'patterns': renderPatterns(); break;
      case 'pattern': renderPattern(a); break;
      case 'problems': renderProblems(); break;
      case 'problem': renderProblem(Number(a)); break;
      case 'more': renderMore(); break;
      case 'playbook': renderPlaybook(); break;
      case 'mock': renderMock(); break;
      case 'quiz':
        if (!quiz || quiz.scope !== (a || 'mix') || quiz.idx >= quiz.qs.length && quiz.restart) quiz = startQuiz(a || 'mix');
        if (!quiz) { renderNotFound(); break; }
        renderQuiz();
        break;
      case 'parsons': {
        let n = Number(a);
        if (a === 'random' || !BY_N[n]) {
          const pool = PROBLEMS.filter(p => p.week <= currentWeek() && SOLUTIONS[p.n]);
          n = pool[Math.floor(Math.random() * pool.length)].n;
          history.replaceState(null, '', `#/parsons/${n}`);
        }
        if (!pz || pz.n !== n || pz.lang !== S.lang) pz = startParsons(n);
        renderParsons();
        break;
      }
      case 'review': {
        if (!a) { renderReviewHome(); break; }
        const key = `${a}/${b || ''}`;
        if (!session || session.key !== key) session = startSession(a, b);
        if (!session) { renderReviewHome(); break; }
        if (!session.queue.length) {
          view.innerHTML = `<div class="review"><div class="card done-card"><div class="big">☀︎</div><h1>Nothing to review</h1><p class="sub">You’re all caught up.</p><a class="btn primary" href="#/review">Drill a pattern</a></div></div>`;
          session = null;
          break;
        }
        renderReview();
        break;
      }
      default: renderNotFound();
    }
    if (page !== 'review') window.scrollTo(0, 0);
  }

  // ── Events ───────────────────────────────────────────────────
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const { act, v, n } = el.dataset;
    switch (act) {
      case 'status': e.preventDefault(); setStatus(Number(n), v); break;
      case 'flip': if (session) { session.flipped = true; renderReview(); } break;
      case 'grade': grade(Number(v)); break;
      case 'showsol': if (session) { session.showSol = true; renderReview(); } break;
      case 'lang':
        S.lang = v;
        save();
        if (pz) { pz = startParsons(pz.n); renderParsons(); break; }
        document.querySelectorAll('pre[data-code]').forEach(el => { el.innerHTML = highlight(codeFor(el.dataset.code)); });
        document.querySelectorAll('.lang-tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
        break;
      case 'copy': {
        const code = codeFor(el.dataset.src);
        (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
          .then(() => toast('Code copied'), () => toast('Copy not available here'));
        break;
      }
      case 'pmode': patternsMode = v; renderPatterns(); break;
      case 'hint': {
        const box = el.closest('.hints');
        const shown = Number(box.dataset.shown) + 1;
        if (session && box.closest('.flash')) session.hintsShown = shown;
        if (S.mock && box.closest('.mock')) { S.mock.hints = shown; save(); }
        box.outerHTML = hintsHTML(Number(n), shown);
        break;
      }
      case 'qpick': {
        const q = quiz.qs[quiz.idx];
        if (q.picked != null) break;
        q.picked = v;
        const ok = v === q.fam;
        if (ok) quiz.score++;
        if (q.cx) S.cxq = [S.cxq[0] + (ok ? 1 : 0), S.cxq[1] + 1];
        else { const st = S.quiz[q.fam] || [0, 0]; S.quiz[q.fam] = [st[0] + (ok ? 1 : 0), st[1] + 1]; }
        save();
        renderQuiz();
        break;
      }
      case 'slip': if (session) { session.slip = session.slip === v ? null : v; el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.v === session.slip)); } break;
      case 'drystep': {
        const box = el.closest('div').parentElement.querySelector('.dry');
        const steps = [...box.querySelectorAll('ol.trace li')];
        const out = box.querySelector('.io.out');
        let k = Number(el.dataset.v);
        if (k === 0) { steps.forEach(li => (li.hidden = true)); out.hidden = true; }
        if (k < steps.length) { steps[k].hidden = false; steps[k].classList.add('just'); setTimeout(() => steps[k].classList.remove('just'), 700); }
        else { out.hidden = false; }
        k++;
        el.dataset.v = k > steps.length ? 0 : k;
        el.textContent = k > steps.length ? '↺ Step through again' : k === steps.length ? 'Reveal the output' : `Next step (${k}/${steps.length}) — predict it first`;
        break;
      }
      case 'qnext': quiz.idx++; renderQuiz(); window.scrollTo(0, 0); break;
      case 'qagain': e.preventDefault(); quiz = startQuiz(quiz.scope); renderQuiz(); break;
      case 'mockstart': case 'mockend': case 'mockquit': case 'mockout': case 'mockrub': case 'mockslip': case 'mocksave': mockAct(act, v, el.dataset.k); break;
      case 'pzpiece': case 'pzslot': case 'pzcheck': case 'pzhint': case 'pzreset': case 'pzshow': parsonsAct(act, v); break;
      case 'retention': S.retention = Number(v); save(); renderMore(); break;
      case 'jump': { e.preventDefault(); const t = document.getElementById(v); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); break; }
      case 'fdiff': filters.diff = v; renderProblems(); break;
      case 'fstatus': filters.status = v; renderProblems(); break;
      case 'newper': S.newPerDay = Number(v); save(); renderMore(); break;
      case 'theme': S.theme = v; save(); applyTheme(); renderMore(); break;
      case 'hide-install': S.hideInstall = true; save(); renderToday(); break;
      case 'export': exportBackup(); break;
      case 'reset':
        if (confirm('Reset all progress on this device? Export a backup first if you might want it back.')) {
          try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
          S = load(); save(); applyTheme(); renderNavFoot(); toast('Progress reset'); renderMore();
        }
        break;
    }
  });

  document.addEventListener('toggle', e => {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.open) return;
    const body = d.querySelector(':scope > [data-body]');
    if (body && !body.childElementCount) body.innerHTML = problemBody(BY_N[body.dataset.body]);
  }, true);

  document.addEventListener('input', e => {
    const f = e.target.dataset.filter;
    if (!f) return;
    filters[f] = e.target.value;
    renderProblemList();
  });

  document.addEventListener('change', e => {
    if (e.target.dataset.act !== 'import') return;
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(async txt => {
      const data = JSON.parse(txt);
      if (!data || typeof data.status !== 'object' || typeof data.srs !== 'object') throw new Error('bad file');
      const { ink, ...state } = data;
      S = { ...defaults(), ...state };
      save(); applyTheme(); renderNavFoot(); renderMore();
      const pages = ink && window.Ink ? await Ink.importAll(ink) : 0;
      toast(pages ? `Backup imported, with ${pages} scribble page${pages === 1 ? '' : 's'}` : 'Backup imported');
    }).catch(() => toast('That file is not a DSA Revise backup'));
  });

  document.addEventListener('keydown', e => {
    if (quiz && !e.target.matches('input, textarea, select') && !e.metaKey && !e.ctrlKey) {
      const q = quiz.qs[quiz.idx];
      if (q && q.picked == null && /^[1-4]$/.test(e.key)) { e.preventDefault(); $(`.quiz-opt:nth-child(${e.key})`)?.click(); }
      else if (q && q.picked != null && e.key === 'Enter') { e.preventDefault(); $('[data-act="qnext"]')?.click(); }
      return;
    }
    if (session && !session.flipped && e.key.toLowerCase() === 'h' && !e.target.matches('input, textarea, select')) {
      $('.flash [data-act="hint"]')?.click();
      return;
    }
    if (!session || e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey) return;
    if (!session.flipped && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); session.flipped = true; renderReview(); }
    else if (session.flipped && /^[1-4]$/.test(e.key)) { e.preventDefault(); grade(Number(e.key) - 1); }
    else if (session.flipped && !session.showSol && e.key.toLowerCase() === 's') { session.showSol = true; renderReview(); }
  });

  async function exportBackup() {
    const ink = window.Ink ? await Ink.exportAll() : [];
    const blob = new Blob([JSON.stringify({ ...S, ink }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dsa-revise-backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  function applyTheme() {
    if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', S.theme);
  }

  // Re-render Today when the app comes back on a new day.
  let shownDay = today();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && today() !== shownDay) {
      shownDay = today();
      if (!session) route();
      renderNavFoot();
    }
  });

  // ── Offline (service worker) ─────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) toast('New content downloaded', { label: 'Reload', run: () => location.reload() });
      });
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
    });
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  applyTheme();
  renderNavFoot();
  window.addEventListener('hashchange', route);
  // the ✎ marks next to problems you've written on
  const syncInkMarks = () => document.querySelectorAll('[data-inkmark]').forEach(el => { el.hidden = !Ink.has(Number(el.dataset.inkmark)); });
  document.addEventListener('ink-change', syncInkMarks);
  document.addEventListener('ink-ready', syncInkMarks);
  route();
})();
