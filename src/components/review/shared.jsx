// Pieces shared by Review, Quiz, Parsons and Mock (ported from legacy/app.js).
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NOTES, PLUS, EXPLAIN, SOLUTIONS, BY_N, TOPIC_BY_SLUG, MyCode, getViz } from '../../data';
import { S, set, save, useApp, useMyCode } from '../../lib/store';
import { today } from '../../lib/dates';
import { toast } from '../../lib/toast';
import { highlight } from '../../lib/util.jsx';

export const LANGS = [['cpp', 'C++'], ['java', 'Java'], ['js', 'JS']];
export const LANG_NAME = Object.fromEntries(LANGS);
export const SLIPS = [['pattern', 'Didn’t spot the pattern'], ['trick', 'Forgot the key trick'], ['edge', 'Edge case'], ['index', 'Off-by-one / indices'],
  ['cx', 'Complexity'], ['api', 'Syntax / library']];

export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function logSlip(n, why) { (S.slips[n] ||= []).push({ why, at: today() }); }

export const FAMILY = {
  hash: 'Hash map / set', prefix: 'Prefix / suffix sums', twoptr: 'Two pointers', window: 'Sliding window',
  stack: 'Stack', monostack: 'Monotonic stack / deque', bsearch: 'Binary search', bsanswer: 'Binary search on the answer',
  llist: 'Linked-list pointer surgery', fastslow: 'Fast & slow pointers', design: 'Data-structure design',
  treedfs: 'Tree DFS (recursion)', bfs: 'BFS level by level', trie: 'Trie', heap: 'Heap / priority queue',
  backtrack: 'Backtracking', graphdfs: 'Graph DFS / flood fill', multibfs: 'Multi-source BFS', topo: 'Topological sort',
  unionfind: 'Union-Find', dijkstra: 'Shortest path (Dijkstra / Bellman-Ford)', mst: 'Minimum spanning tree',
  dp1: '1-D dynamic programming', dp2: '2-D dynamic programming', knapsack: 'Knapsack DP', greedy: 'Greedy',
  intervals: 'Sort intervals + scan', sweep: 'Sweep line / events', matrix: 'Matrix simulation', bits: 'Bit manipulation',
};
export const CONFUSE = {
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

export const codeFor = src => {
  const [kind, id] = src.split(':');
  if (kind === 'mine') {
    const r = MyCode.review(id);
    return r && r.code ? r.code[S.lang] || r.code[r.lang] || '' : '';
  }
  if (kind === 'raw') return MyCode.get(id)?.code || '';
  const code = kind === 'sol' ? SOLUTIONS[id]?.code : TOPIC_BY_SLUG[id]?.template;
  return (code && (code[S.lang] || code.cpp)) || '';
};

export const DiffBadge = ({ d }) => (d ? <span className={`badge d-${d}`}>{d}</span> : null);

export function LangTabs() {
  const S2 = useApp();
  return (
    <div className="segmented lang-tabs" role="tablist">
      {LANGS.map(([v, l]) => <button key={v} type="button" className={S2.lang === v ? 'on' : ''} onClick={() => set({ lang: v })}>{l}</button>)}
    </div>
  );
}

export function CodeBlock({ src }) {
  useApp();
  const code = codeFor(src);
  const copy = () => (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
    .then(() => toast('Code copied'), () => toast('Copy not available here'));
  return (
    <div className="code-wrap">
      <div className="row code-bar"><LangTabs /><span className="spacer" /><button type="button" className="btn small ghost" onClick={copy}>Copy</button></div>
      <pre className="code" dangerouslySetInnerHTML={{ __html: highlight(code) }} />
    </div>
  );
}

export function Hints({ n, shown, onMore }) {
  const x = PLUS[n];
  if (!x) return null;
  return (
    <div className="hints">
      <ol>{x.hints.slice(0, shown).map((h, i) => <li key={i}><span className="hint-n">Hint {i + 1}</span>{h}</li>)}</ol>
      {shown < x.hints.length && (
        <button type="button" className="btn small hint-btn" onClick={e => { e.stopPropagation(); onMore(shown + 1); }}>
          💡 {shown ? 'Next hint' : 'Stuck? Hint'} {shown + 1}/{x.hints.length}
        </button>
      )}
    </div>
  );
}

export function Notes({ p }) {
  useMyCode();
  const x = NOTES[p.n];
  if (!x) return null;
  const r = MyCode.review(p.n);
  const differs = !!(r && !r.stale && r.same === false);
  return (
    <div className="notes">
      <div><div className="lbl">What it tests</div>{x.tests}</div>
      {EXPLAIN[p.n]?.a && <div className="why"><div className="lbl">Understand the approach</div>{EXPLAIN[p.n].a}</div>}
      <div><div className="lbl">Approach{differs && <> <Link to={`/problem/${p.n}/code`} className="mine-chip">you solved it differently →</Link></>}</div>
        <ol>{x.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
      <div className="key"><div className="lbl">Key insight</div>{x.key}</div>
      <div className="facts">
        <div><div className="lbl">Complexity</div><span className="cx">{x.cx}</span></div>
        {x.trap && x.trap !== '—' && <div><div className="lbl">Watch out</div>{x.trap}</div>}
      </div>
      {p.note && <div className="sheet">From your sheet: {p.note}</div>}
    </div>
  );
}

export function PathBox({ p }) {
  const Viz = getViz();
  return (
    <>
      {PLUS[p.n] && <div className="pathbox"><div className="lbl">From brute force to optimal</div>
        <ol className="path">{PLUS[p.n].path.map((t, i) => <li key={i}>{t}</li>)}</ol></div>}
      {Viz && Viz.has(p.n) && <div className="pathbox"><div className="lbl">See it run</div><div dangerouslySetInnerHTML={{ __html: Viz.htmlProblem(p.n) }} /></div>}
    </>
  );
}

export function Solution({ p }) {
  const s = SOLUTIONS[p.n];
  const [recall, setRecall] = useState(false);
  const [seen, setSeen] = useState({});
  const [k, setK] = useState(null); // null: everything visible; else steps revealed so far (steps.length + 1 = output too)
  if (!s) return null;
  const total = s.dry.length;
  const step = () => {
    const cur = k == null || k > total ? 0 : k;
    setK(cur + 1);
  };
  const next = k == null || k > total ? 0 : k;
  const label = k == null ? '▶ Step through — predict each step'
    : k > total ? '↺ Step through again' : k === total ? 'Reveal the output' : `Next step (${k}/${total}) — predict it first`;
  const visibleSteps = k == null || k > total ? total : k;
  const showOut = k == null || k > total;
  void next;
  return (
    <div className="sol">
      <div className="sol-h"><span>Full solution</span><span className="verified">✓ passes {s.tests} test{s.tests === 1 ? '' : 's'}</span></div>
      <div>
        <div className="row" style={{ gap: 8 }}><div className="lbl" style={{ margin: 0 }}>Algorithm</div><span className="spacer" />
          <button type="button" className="btn small ghost" onClick={() => { setRecall(r => !r); setSeen({}); if (!recall) toast('Say each step out loud, then tap it to check'); }}>
            {recall ? 'Show all steps' : '🙈 Hide & recall'}</button></div>
        <ol className={`algo${recall ? ' recall' : ''}`}>{s.algo.map((a, i) => <li key={i} className={seen[i] ? 'seen' : ''} onClick={() => recall && setSeen(v => ({ ...v, [i]: true }))}>{a}</li>)}</ol>
      </div>
      <div><div className="lbl">Code</div><CodeBlock src={`sol:${p.n}`} /></div>
      <div>
        <div className="row" style={{ gap: 8 }}><div className="lbl" style={{ margin: 0 }}>Dry run</div><span className="spacer" />
          <button type="button" className="btn small ghost" onClick={step}>{label}</button></div>
        <div className="dry">
          <div className="io"><b>Input</b>{s.ex}</div>
          <ol className="trace">{s.dry.map((d, i) => <li key={i} hidden={i >= visibleSteps}>{d}</li>)}</ol>
          <div className="io out" hidden={!showOut}><b>Output</b>{s.out}</div>
        </div>
      </div>
    </div>
  );
}

export function Deeper({ p }) {
  const x = PLUS[p.n];
  if (!x) return null;
  return (
    <div className="deeper">
      <div><div className="lbl">Interviewer follow-ups <span className="muted">· think first, then tap</span></div>
        {x.fu.map(([q, a], i) => <details className="fu" key={i}><summary>{q}</summary><p>{a}</p></details>)}</div>
      {x.rel.length > 0 && <div><div className="lbl">Related in your sheet</div><div className="rel">{x.rel.map(r => <Link key={r} className="chip" to={`/problem/${r}`}>{BY_N[r].title}</Link>)}</div></div>}
      <div className="row"><Link className="btn small" to={`/parsons/${p.n}`}>🧩 Rebuild the code</Link>
        <span className="muted small">Put the solution’s lines back in order</span></div>
    </div>
  );
}

// Editor for your own solution (used during a mock; the Problem page has its own).
export function MineEditor({ n }) {
  const MC = useMyCode();
  const e = MC.get(n);
  const [lang, setLang] = useState(e?.lang || S.lang);
  const ta = useRef(null);
  const timer = useRef(0);
  const langRef = useRef(lang);
  langRef.current = lang;
  const flush = () => { clearTimeout(timer.current); if (ta.current && ta.current.value.trim()) MyCode.set(n, langRef.current, ta.current.value); };
  useEffect(() => () => flush(), []); // eslint-disable-line
  const onInput = () => { clearTimeout(timer.current); timer.current = setTimeout(flush, 500); };
  const onKey = ev => {
    const t = ev.target;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const { selectionStart: a, selectionEnd: b, value } = t;
    if (ev.key === 'Tab') {
      ev.preventDefault();
      const ls = value.lastIndexOf('\n', a - 1) + 1;
      if (ev.shiftKey) {
        const cut = value.slice(ls, ls + 4).match(/^ */)[0].length;
        if (cut) { t.setRangeText('', ls, ls + cut, 'preserve'); t.setSelectionRange(Math.max(ls, a - cut), Math.max(ls, b - cut)); }
      } else t.setRangeText('    ', a, b, 'end');
      onInput();
    } else if (ev.key === 'Enter' && a === b) {
      const line = value.slice(value.lastIndexOf('\n', a - 1) + 1, a);
      let indent = line.match(/^\s*/)[0];
      if (/[{(\[:]\s*$/.test(line)) indent += '    ';
      if (!indent) return;
      ev.preventDefault();
      t.setRangeText('\n' + indent, a, b, 'end');
      onInput();
    }
  };
  let st = '';
  const r = MC.review(n);
  if (e) {
    if (r && !r.stale) st = '✓ Reviewed by Claude';
    else if (!MC.configured()) st = 'Saved on this device';
    else if (MC.state.busy || e.dirty) st = 'Saved on this device · syncing…';
    else if (MC.state.error) st = `Saved on this device · ${MC.state.error}`;
    else st = 'Synced · run /review-my-code in Claude Code';
  }
  return (
    <div className="mine" id={`mine-${n}`}>
      <div className="mine-h"><span>Write your solution</span><span className="mine-st small">{st}</span></div>
      <div className="row" style={{ gap: 8 }}>
        <div className="segmented">{LANGS.map(([v, l]) => <button key={v} type="button" className={lang === v ? 'on' : ''}
          onClick={() => { setLang(v); langRef.current = v; if (ta.current?.value.trim()) flush(); }}>{l}</button>)}</div>
      </div>
      <textarea ref={ta} className="editor" defaultValue={e?.code || ''} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off"
        placeholder="Write or paste your solution…" onInput={onInput} onKeyDown={onKey} onBlur={flush} />
      <p className="small muted" style={{ margin: 0 }}>Tab indents · saved on this device as you type{MC.configured() ? ' and synced to your repo' : ''}.</p>
    </div>
  );
}
export { save };
