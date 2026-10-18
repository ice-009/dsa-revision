// Statement, hint ladder, approach notes, solution, follow-ups for the problem page.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NOTES, PLUS, EXPLAIN, SOLUTIONS, BY_N, getViz } from '../../data';
import { useMyCode } from '../../lib/store';
import { toast } from '../../lib/toast';
import { CodeBlock } from './CodeBits.jsx';

export function Statement({ p }) {
  const x = PLUS[p.n];
  if (!x) return <p className="q-text">Open it on LeetCode to read the full statement.</p>;
  return (
    <div className="qline"><div className="lbl">The problem</div>{x.q}
      {EXPLAIN[p.n]?.q && <div className="explain"><div className="lbl">Understand the question</div>{EXPLAIN[p.n].q}</div>}
    </div>
  );
}

export function Hints({ n }) {
  const [shown, setShown] = useState(0);
  const x = PLUS[n];
  if (!x) return null;
  return (
    <div className="hints">
      <ol>{x.hints.slice(0, shown).map((h, i) => <li key={i}><span className="hint-n">Hint {i + 1}</span>{h}</li>)}</ol>
      {shown < x.hints.length && (
        <button type="button" className="btn small hint-btn" onClick={() => setShown(shown + 1)}>
          💡 {shown ? 'Next hint' : 'Stuck? Hint'} {shown + 1}/{x.hints.length}
        </button>
      )}
    </div>
  );
}

export function Approach({ p }) {
  const MyCode = useMyCode();
  const x = NOTES[p.n];
  const viz = getViz();
  const r = MyCode.review(p.n);
  const differs = !!(r && !r.stale && r.same === false);
  return (
    <>
      {x && (
        <div className="notes">
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
      )}
      {PLUS[p.n] && <div className="pathbox"><div className="lbl">From brute force to optimal</div>
        <ol className="path">{PLUS[p.n].path.map((t, i) => <li key={i}>{t}</li>)}</ol></div>}
      {viz && viz.has(p.n) && <div className="pathbox"><div className="lbl">See it run</div>
        <div dangerouslySetInnerHTML={{ __html: viz.htmlProblem(p.n) }} /></div>}
    </>
  );
}

function DryRun({ s }) {
  const [k, setK] = useState(0); // number of trace lines revealed; k > length means output shown
  const len = s.dry.length;
  const label = k === 0 ? '▶ Step through — predict each step' : k > len ? '↺ Step through again' : k === len ? 'Reveal the output' : `Next step (${k}/${len}) — predict it first`;
  const advance = () => setK(k > len ? 0 : k + 1);
  return (
    <div>
      <div className="row" style={{ gap: 8 }}><div className="lbl" style={{ margin: 0 }}>Dry run</div><span className="spacer" />
        <button type="button" className="btn small ghost" onClick={advance}>{label}</button></div>
      <div className="dry">
        <div className="io"><b>Input</b>{s.ex}</div>
        <ol className="trace">{s.dry.map((d, i) => <li key={i} hidden={k !== 0 && i >= k} className={k === i + 1 ? 'just' : ''}>{d}</li>)}</ol>
        <div className="io out" hidden={k <= len}><b>Output</b>{s.out}</div>
      </div>
    </div>
  );
}

export function Solution({ p }) {
  const s = SOLUTIONS[p.n];
  const [recall, setRecall] = useState(false);
  const [seen, setSeen] = useState({});
  if (!s) return null;
  const toggle = () => {
    setSeen({});
    if (!recall) toast('Say each step out loud, then tap it to check');
    setRecall(!recall);
  };
  return (
    <div className="sol">
      <div className="sol-h"><span>Full solution</span><span className="verified">✓ passes {s.tests} test{s.tests === 1 ? '' : 's'}</span></div>
      <div><div className="row" style={{ gap: 8 }}><div className="lbl" style={{ margin: 0 }}>Algorithm</div><span className="spacer" />
        <button type="button" className="btn small ghost" onClick={toggle}>{recall ? 'Show all steps' : '🙈 Hide & recall'}</button></div>
        <ol className={`algo${recall ? ' recall' : ''}`}>
          {s.algo.map((a, i) => <li key={i} className={recall && seen[i] ? 'seen' : ''} onClick={() => recall && setSeen({ ...seen, [i]: true })}>{a}</li>)}
        </ol></div>
      <div><div className="lbl">Code</div><CodeBlock src={`sol:${p.n}`} /></div>
      <DryRun s={s} />
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
      {x.rel.length > 0 && <div><div className="lbl">Related in your sheet</div>
        <div className="rel">{x.rel.map(r => <Link key={r} className="chip" to={`/problem/${r}`}>{BY_N[r].title}</Link>)}</div></div>}
      <div className="row"><Link className="btn small" to={`/parsons/${p.n}`}>🧩 Rebuild the code</Link>
        <span className="muted small">Put the solution’s lines back in order</span></div>
    </div>
  );
}
