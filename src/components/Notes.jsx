// Study notes for a problem (legacy notesHTML).
//   <Notes p={problem} />               full notes
//   <Notes p={problem} tests={false} /> leave out "What it tests"
// p is an item from PROBLEMS / BY_N (needs p.n and optional p.note).
import { Link } from 'react-router-dom';
import { NOTES, EXPLAIN } from '../data';
import { useMyCode } from '../lib/store';

export default function Notes({ p, tests = true }) {
  const MyCode = useMyCode();
  const x = NOTES[p.n];
  if (!x) return null;
  const r = MyCode.review(p.n);
  const differs = !!(r && !r.stale && r.same === false);
  return (
    <div className="notes">
      {tests && <div><div className="lbl">What it tests</div>{x.tests}</div>}
      {EXPLAIN[p.n]?.a && <div className="why"><div className="lbl">Understand the approach</div>{EXPLAIN[p.n].a}</div>}
      <div>
        <div className="lbl">Approach{differs && <> <Link to={`/problem/${p.n}/code`} className="mine-chip">you solved it differently →</Link></>}</div>
        <ol>{x.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>
      <div className="key"><div className="lbl">Key insight</div>{x.key}</div>
      <div className="facts">
        <div><div className="lbl">Complexity</div><span className="cx">{x.cx}</span></div>
        {x.trap && x.trap !== '—' && <div><div className="lbl">Watch out</div>{x.trap}</div>}
      </div>
      {p.note && <div className="sheet">From your sheet: {p.note}</div>}
    </div>
  );
}
