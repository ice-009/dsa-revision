import { useEffect, useReducer, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PROBLEMS, BY_N, NOTES, PLUS, TOPIC_BY_SLUG } from '../data';
import { S, save, useApp } from '../lib/store';
import { currentWeek } from '../lib/dates';
import { interleave } from '../lib/srs';
import { shuffle, FAMILY, CONFUSE, DiffBadge } from '../components/review/shared.jsx';
import NotFound from './NotFound';

const famAcc = f => { const [r, t] = S.quiz[f] || [0, 0]; return (r + 1) / (t + 2); };
const CX_RANK = ['O(1)', 'O(log n)', 'O(h)', 'O(n)', 'O(n + m)', 'O(n log k)', 'O(n log n)', 'O(m·n)', 'O(n²)', 'O(n² log n)', 'O(V + E)', 'O(E log V)', 'O(n·2ⁿ)', 'O(n·n!)'];
const cxTime = n => NOTES[n].cx.split(' / ')[0].trim();
const cxOk = n => /^O\([^()]*(\([^()]*\))?[^()]*\)$/.test(cxTime(n)) && !/ or | per |avg|worst|all ops|81|output|32|set bits|t\/min|maxPos/.test(cxTime(n));
const CX_SAME = [['O(n)', 'O(n + m)', 'O(max(m,n))', 'O(|s| + |t|)', 'O(V + E)'], ['O(n²)', 'O(m·n)', 'O(R·C)'],
  ['O(log n)', 'O(log(m·n))', 'O(log min(m,n))', 'O(h)'], ['O(n log n)', 'O(E log E)', 'O(E log V)', 'O(n² log n)']];
export const cxSame = (a, b) => a === b || CX_SAME.some(g => g.includes(a) && g.includes(b));
export function cxOptions(n) {
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

function Done({ z, again }) {
  const misses = z.qs.filter(q => q.picked !== q.fam);
  const weak = Object.keys(FAMILY).filter(f => (S.quiz[f]?.[1] || 0) >= 2).sort((a, b) => famAcc(a) - famAcc(b)).slice(0, 4);
  return (
    <div className="review"><div className="card done-card">
      <div className="big">{z.score >= 8 ? '🎯' : z.score >= 5 ? '👍' : '💪'}</div>
      <h1>{z.score}/{z.qs.length} {z.scope === 'cx' ? 'correct' : 'recognised'}</h1>
      <p className="sub">{z.title}</p>
      {misses.length > 0 && <div className="quiz-miss"><div className="eyebrow">Worth another look</div>{misses.map(q =>
        <Link key={q.n} to={`/problem/${q.n}`} className="chip">{BY_N[q.n].title} → {q.cx ? q.fam : FAMILY[q.fam]}</Link>)}</div>}
      {weak.length > 0 && z.scope !== 'cx' && <p className="small muted" style={{ marginTop: 14 }}>Your least-recognised so far: {weak.map((f, i) =>
        <span key={f}>{i ? ', ' : ''}<b>{FAMILY[f]}</b> ({Math.round(S.quiz[f][0] / S.quiz[f][1] * 100)}%)</span>)}</p>}
      <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
        <button type="button" className="btn primary" onClick={again}>Another round</button>
        <Link className="btn" to="/today">Back to Today</Link>
      </div></div></div>
  );
}

function Game({ scope }) {
  useApp();
  const [, force] = useReducer(x => x + 1, 0);
  const ref = useRef(null);
  if (!ref.current) ref.current = startQuiz(scope);
  const z = ref.current;
  const zRef = useRef(z); zRef.current = z;

  const pick = v => {
    const q = z.qs[z.idx];
    if (q.picked != null) return;
    q.picked = v;
    const ok = v === q.fam;
    if (ok) z.score++;
    if (q.cx) S.cxq = [S.cxq[0] + (ok ? 1 : 0), S.cxq[1] + 1];
    else { const st = S.quiz[q.fam] || [0, 0]; S.quiz[q.fam] = [st[0] + (ok ? 1 : 0), st[1] + 1]; }
    save();
    force();
  };
  const next = () => { z.idx++; force(); window.scrollTo(0, 0); };
  const act = useRef({}); act.current = { pick, next };

  useEffect(() => {
    const onKey = e => {
      const z = zRef.current;
      if (!z || e.target.matches?.('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
      const q = z.qs[z.idx];
      if (!q) return;
      if (q.picked == null && /^[1-4]$/.test(e.key)) { const o = q.options[Number(e.key) - 1]; if (o != null) { e.preventDefault(); act.current.pick(o); } }
      else if (q.picked != null && e.key === 'Enter') { e.preventDefault(); act.current.next(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!z) return <NotFound />;
  if (z.idx >= z.qs.length) return <Done z={z} again={() => { ref.current = startQuiz(z.scope); force(); }} />;
  const q = z.qs[z.idx];
  const p = BY_N[q.n];
  const answered = q.picked != null;
  const pct = Math.round(z.idx / z.qs.length * 100);
  return (
    <div className="review">
      <div className="rv-top">
        <Link to="/review" className="btn small ghost" aria-label="End quiz">✕</Link>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        <span className="small muted">{z.idx + 1}/{z.qs.length} · {z.score} ✓</span>
      </div>
      <div className="card quiz-card">
        <div className="eyebrow">{q.cx ? 'Complexity drill' : `Spot the pattern · ${z.title}`}</div>
        <p className="quiz-q">{PLUS[q.n].q}</p>
        <p className="small muted">{q.cx ? <>Optimal approach: <b>{NOTES[q.n].pat}</b>. What is its time complexity?</> : 'Which technique gives the optimal solution?'}</p>
        <div className="quiz-opts">{q.options.map((f, i) => {
          const cls = !answered ? '' : f === q.fam ? 'right' : f === q.picked ? 'wrong' : 'dim';
          return <button key={f} type="button" className={`quiz-opt ${cls} ${q.cx ? 'mono' : ''}`} disabled={answered} onClick={() => pick(f)}><span className="kbd">{i + 1}</span>{q.cx ? f : FAMILY[f]}</button>;
        })}</div>
        {answered && (
          <>
            <div className={`quiz-fb ${q.picked === q.fam ? 'ok' : 'no'}`}>
              <b>{q.picked === q.fam ? '✓ Right' : `✗ It’s ${q.cx ? q.fam : FAMILY[q.fam]}`}</b> — <Link to={`/problem/${p.n}`}>{p.title}</Link> <DiffBadge d={p.diff} />
              {q.cx && <p><span className="lbl">Time / space</span><span className="cx">{NOTES[p.n].cx}</span></p>}
              <p><span className="lbl">Key insight</span>{NOTES[p.n].key}</p>
              {!q.cx && <p className="small muted">Cue: {PLUS[q.n].hints[1]}</p>}
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}><button type="button" className="btn primary" onClick={next}>{z.idx + 1 < z.qs.length ? 'Next' : 'Finish'} <span className="kbd">↵</span></button></div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Quiz() {
  const { scope = 'mix' } = useParams();
  if (scope !== 'cx' && scope !== 'all' && scope !== 'mix' && !TOPIC_BY_SLUG[scope]) return <NotFound />;
  return <Game key={scope} scope={scope} />;
}
