import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PROBLEMS, BY_N, PLUS } from '../data';
import { S, save, useApp } from '../lib/store';
import { currentWeek, today } from '../lib/dates';
import { rate } from '../lib/srs';
import { toast } from '../lib/toast';
import { SLIPS, logSlip, DiffBadge, Hints, MineEditor } from '../components/review/shared.jsx';

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
const mmss = ms => { const t = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
const phaseAt = min => PHASES.findIndex(ph => min < ph.until);

export function pickMockProblem(diff) {
  const pool = PROBLEMS.filter(p => p.week <= currentWeek() && (!diff || p.diff === diff));
  const fresh = pool.filter(p => S.status[p.n] !== 'solved' && !S.mocks.some(m => m.n === p.n));
  const list = fresh.length ? fresh : pool.length ? pool : PROBLEMS;
  return list[Math.floor(Math.random() * list.length)];
}

function Home() {
  const hist = S.mocks.slice(-8).reverse();
  const start = d => { const p = pickMockProblem(d); S.mock = { n: p.n, start: Date.now(), hints: 0 }; save(); };
  return (
    <>
      <h1>Mock interview</h1>
      <p className="sub">45 minutes, one problem, the six-step method from the Playbook — then an honest self-assessment. Practising under realistic conditions is what makes the real thing feel familiar.</p>
      <div className="card">
        <div className="eyebrow">Start a mock</div>
        <p className="small muted" style={{ marginTop: 0 }}>Picks an unsolved problem from weeks 1–{currentWeek()}. Keep LeetCode open in another tab; the timer keeps running if you switch apps.</p>
        <div className="row">{['', 'Easy', 'Medium', 'Hard'].map(d => <button key={d} type="button" className={`btn ${d ? '' : 'primary'}`} onClick={() => start(d)}>{d || 'Surprise me'}</button>)}</div>
      </div>
      {hist.length > 0 && (
        <>
          <h2>Recent mocks</h2>
          <div className="list">{hist.map((h, i) => {
            const avg = RUBRIC.reduce((a, [k]) => a + ((h.rubric || {})[k] || 0), 0) / RUBRIC.length;
            return <Link key={i} className="card mock-row" to={`/problem/${h.n}`}><b>{BY_N[h.n].title}</b>
              <span className="small muted">{h.date} · {h.minutes} min · {h.hints} hint{h.hints === 1 ? '' : 's'}</span>
              <span className={`badge ${h.outcome === 'solved' ? 'd-Easy' : h.outcome === 'partial' ? 'd-Medium' : 'd-Hard'}`}>{h.outcome}</span>
              <span className="small">rubric {avg.toFixed(1)}/4</span></Link>;
          })}</div>
        </>
      )}
    </>
  );
}

function Running({ m }) {
  const p = BY_N[m.n];
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    const onVis = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  const elapsed = Math.max(0, now - m.start);
  const ph = Math.max(0, phaseAt(elapsed / 60000));
  const cur = PHASES[ph < 0 ? PHASES.length - 1 : ph];
  const end = () => { m.ended = true; m.minutes = Math.max(1, Math.round((Date.now() - m.start) / 60000)); m.rubric = {}; m.slips = []; save(); };
  const quit = () => { if (!window.confirm('Abandon this mock? It won’t be saved.')) return; S.mock = null; save(); };
  return (
    <div className="mock">
      <div className="mock-bar card">
        <div><div className="eyebrow">Mock interview</div><div className={`mock-timer${elapsed > MOCK_MIN * 60000 ? ' over' : ''}`}>{mmss(elapsed)}</div><div className="small muted">of {MOCK_MIN}:00</div></div>
        <div className="mock-phases">{PHASES.map((x, i) => <span key={x.name} className={`mph ${i < ph ? 'done' : i === ph ? 'now' : ''}`}>{x.name}<small>{i ? PHASES[i - 1].until : 0}–{x.until}′</small></span>)}</div>
        <button type="button" className="btn primary" onClick={end}>I’m done</button>
      </div>
      <div className="card mock-phase"><div className="eyebrow">Now: {cur.name}</div><ul className="clean">{cur.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
      <div className="card">
        <div className="row"><h2 style={{ margin: 0 }}>{p.title}</h2><DiffBadge d={p.diff} /><span className="spacer" /><a className="btn small" href={p.url} target="_blank" rel="noopener noreferrer">Open on LeetCode ↗</a></div>
        <p className="quiz-q" style={{ fontWeight: 500 }}>{PLUS[p.n]?.q || ''}</p>
        <p className="small muted">Hints are best after 15 minutes of honest effort — each one used is recorded.</p>
        <div className="mock-hints"><Hints n={p.n} shown={m.hints || 0} onMore={v => { m.hints = v; save(); }} /></div>
      </div>
      <h2>Your solution</h2>
      <MineEditor n={p.n} />
      <p className="small muted" style={{ marginTop: 12 }}>The solution stays hidden until you finish. <button type="button" className="btn small ghost" onClick={quit}>Abandon this mock</button></p>
    </div>
  );
}

function ReviewForm({ m }) {
  const navigate = useNavigate();
  const p = BY_N[m.n];
  const upd = fn => { fn(); save(); };
  const finish = () => {
    S.mocks.push({ n: m.n, date: today(), minutes: m.minutes, hints: m.hints || 0, outcome: m.outcome, rubric: m.rubric, slips: m.slips });
    for (const sl of m.slips) logSlip(m.n, sl);
    // feed the result into spaced repetition: solved clean → Good, with hints → Hard, otherwise Again
    rate(m.n, m.outcome === 'solved' ? (m.hints ? 1 : 2) : 0);
    if (m.outcome === 'solved') S.status[m.n] = 'solved';
    else if (S.status[m.n] !== 'solved') S.status[m.n] = 'revisit';
    const n = m.n;
    S.mock = null;
    save();
    toast('Mock saved — scheduled for review.');
    navigate(`/problem/${n}/solution`);
  };
  return (
    <div className="mock">
      <h1>How did it go?</h1>
      <p className="sub">{p.title} · {m.minutes} min · {m.hints || 0} hint{m.hints === 1 ? '' : 's'} used</p>
      <div className="card">
        <div className="eyebrow">Outcome</div>
        <div className="segmented">{[['solved', 'Solved'], ['partial', 'Partly'], ['missed', 'Didn’t get there']].map(([v, l]) =>
          <button key={v} type="button" className={m.outcome === v ? 'on' : ''} onClick={() => upd(() => { m.outcome = v; })}>{l}</button>)}</div>
        <div className="eyebrow" style={{ marginTop: 16 }}>Rate yourself, 1–4</div>
        <div className="rubric">{RUBRIC.map(([k, l]) => <div className="rub" key={k}><span>{l}</span><div className="segmented">{[1, 2, 3, 4].map(v =>
          <button key={v} type="button" className={(m.rubric || {})[k] === v ? 'on' : ''} onClick={() => upd(() => { m.rubric[k] = v; })}>{v}</button>)}</div></div>)}</div>
        <div className="eyebrow" style={{ marginTop: 16 }}>What slowed you down?</div>
        <div className="slips">{SLIPS.map(([k, l]) => <button key={k} type="button" className={`chip ${(m.slips || []).includes(k) ? 'on' : ''}`}
          onClick={() => upd(() => { m.slips = m.slips.includes(k) ? m.slips.filter(x => x !== k) : [...m.slips, k]; })}>{l}</button>)}</div>
        <div className="row" style={{ marginTop: 16 }}><button type="button" className="btn primary" disabled={!m.outcome} onClick={finish}>Save &amp; see the solution</button></div>
      </div>
    </div>
  );
}

export default function Mock() {
  const S2 = useApp();
  const m = S2.mock;
  if (!m || !BY_N[m.n]) return <Home />;
  if (m.ended) return <ReviewForm m={m} />;
  return <Running m={m} />;
}
