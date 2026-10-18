import '../styles/patterns.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../lib/store';
import { currentWeek } from '../lib/dates';
import { TOPICS, PROBLEMS, NOTES, TOPIC_BY_NAME } from '../data';
import { DiffBadge } from '../components/bits';

// How the patterns build on each other (after the NeetCode roadmap). Each node: topic, x (0-100), row.
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

const solvedIn = (S, tp) => tp.problems.filter(p => S.status[p.n] === 'solved').length;

function Roadmap({ S }) {
  const wk = currentWeek();
  const pos = Object.fromEntries(ROADMAP.map(([n, x, r]) => [n, [x * 10, r * 104 + 48]]));
  const W = 1000, H = 7 * 104 + 10, NW = 150, NH = 64;
  return (
    <div className="card roadmap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pattern roadmap">
        <g className="rm-edges">
          {ROAD_EDGES.map(([a, b]) => {
            const [x1, y1] = pos[a], [x2, y2] = pos[b];
            const my = (y1 + y2) / 2;
            return <path key={a + b} d={`M${x1} ${y1 + NH / 2} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2 - NH / 2}`} />;
          })}
        </g>
        {ROADMAP.map(([name]) => {
          const tp = TOPIC_BY_NAME[name];
          const [x, y] = pos[name];
          const done = solvedIn(S, tp);
          const frac = tp.problems.length ? done / tp.problems.length : 0;
          const state = tp.week < wk ? 'past' : tp.week === wk ? 'now' : 'later';
          return (
            <Link key={name} to={`/pattern/${tp.slug}`} className={`rm-node ${state}`}>
              <rect x={x - NW / 2} y={y - NH / 2} width={NW} height={NH} rx="14" />
              <text x={x} y={y - 6} className="rm-name">{name.replace(' / Priority Queue', '')}</text>
              <text x={x} y={y + 13} className="rm-sub">Week {tp.week} · {done}/{tp.problems.length}</text>
              <rect className="rm-track" x={x - NW / 2 + 14} y={y + 21} width={NW - 28} height="4" rx="2" />
              <rect className="rm-fill" x={x - NW / 2 + 14} y={y + 21} width={(NW - 28) * frac} height="4" rx="2" />
            </Link>
          );
        })}
      </svg>
      <div className="rm-legend small muted"><span className="rm-key now"></span>this week <span className="rm-key past"></span>earlier weeks <span className="rm-key later"></span>coming up · read top to bottom: each line leads to a pattern that builds on the one above</div>
    </div>
  );
}

function Cards({ S }) {
  const wk = currentWeek();
  return (
    <div className="pgrid">
      {TOPICS.map(tp => {
        const done = solvedIn(S, tp);
        const pct = tp.problems.length ? Math.round(done / tp.problems.length * 100) : 0;
        return (
          <Link key={tp.slug} className="card pcard" to={`/pattern/${tp.slug}`}>
            <div className="row"><div className="ico">{tp.icon}</div><span className="spacer"></span>
              <span className={`small ${tp.week === wk ? 'pc-now' : 'muted'}`}>{tp.week === wk ? 'This week' : `Week ${tp.week}`}</span></div>
            <h3 style={{ margin: '4px 0 0' }}>{tp.name}</h3>
            <p>{tp.gist}</p>
            <div className="row small muted" style={{ gap: 8 }}><div className="bar" style={{ flex: 1 }}><i style={{ width: `${pct}%` }} /></div>{done}/{tp.problems.length}</div>
          </Link>
        );
      })}
    </div>
  );
}

function OnePage() {
  return TOPICS.map(tp => (
    <section className="op-topic" key={tp.slug}>
      <h3><Link to={`/pattern/${tp.slug}`} style={{ color: 'inherit' }}>{tp.name}</Link><span className="muted small">Week {tp.week}</span></h3>
      <p>{tp.gist}</p>
      <table className="op-table"><tbody>
        {tp.problems.map(p => {
          const x = NOTES[p.n] || {};
          return (
            <tr key={p.n}>
              <td><Link to={`/problem/${p.n}`}>{p.title}</Link> <DiffBadge d={p.diff} /></td>
              <td><span className="tag">{x.pat}</span></td>
              <td>{x.key}</td>
            </tr>
          );
        })}
      </tbody></table>
    </section>
  ));
}

export default function Patterns() {
  const S = useApp();
  const [mode, setMode] = useState('map');
  const modes = [['map', 'Roadmap'], ['cards', 'Cards'], ['page', 'One-page skim']];
  return (
    <>
      <header className="page-h"><h1>Learn</h1>
        <p className="sub">The {TOPICS.length} patterns behind the {PROBLEMS.length} problems in your sheet, and how to run an interview.</p></header>
      <Link className="card entry" to="/playbook"><span className="entry-ico" aria-hidden="true">📘</span>
        <span><b>Interview playbook</b><small>How to study, the 6-step interview method, and which pattern fits which cue</small></span>
        <span className="chev" aria-hidden="true">›</span></Link>
      <div className="sec-h"><h2>Patterns</h2></div>
      <div className="segmented" role="group" aria-label="Show patterns as" style={{ marginBottom: 16 }}>
        {modes.map(([v, l]) => <button key={v} type="button" className={mode === v ? 'on' : ''} onClick={() => setMode(v)}>{l}</button>)}
      </div>
      {mode === 'map' ? <Roadmap S={S} /> : mode === 'cards' ? <Cards S={S} /> : <OnePage />}
    </>
  );
}
