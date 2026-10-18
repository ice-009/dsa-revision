import { useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BY_N, PROBLEMS, TOPIC_BY_NAME, NOTES, SOLUTIONS, PLUS } from '../data';
import { useApp, useMyCode } from '../lib/store';
import { StatusButtons, DiffBadge } from '../components/bits.jsx';
import { Statement, Hints, Approach, Solution, Deeper } from '../components/problem/Study.jsx';
import Mine from '../components/problem/Mine.jsx';
import NotFound from './NotFound';
import '../styles/problem.css';

const PSTEPS = [
  ['problem', 'Problem', ''],
  ['approach', 'Approach', 'Tried it? See the approach'],
  ['solution', 'Solution', 'See the full solution'],
  ['code', 'Your code', 'Write your own version'],
  ['deeper', 'Go deeper', 'Follow-ups & related problems'],
];

export default function Problem() {
  const { n: ns, tab: tabParam } = useParams();
  const n = Number(ns);
  const p = BY_N[n];
  if (!p || p.kind !== 'Practice') return <NotFound />;
  return <ProblemPage key={n} p={p} tabParam={tabParam} />;
}

function ProblemPage({ p, tabParam }) {
  const S = useApp();
  const MyCode = useMyCode();
  const nav = useNavigate();
  const n = p.n;
  const tp = TOPIC_BY_NAME[p.topic];
  const x = NOTES[n] || {};
  const i = PROBLEMS.indexOf(p);
  const prev = PROBLEMS[i - 1], next = PROBLEMS[i + 1];
  const has = { problem: true, approach: !!NOTES[n], solution: !!SOLUTIONS[n], code: true, deeper: !!PLUS[n] };
  const steps = PSTEPS.filter(([k]) => has[k]);
  const tab = steps.some(([k]) => k === tabParam) ? tabParam : 'problem';
  const barRef = useRef(null), cardRef = useRef(null), first = useRef(true);

  const go = (k, focus = false) => {
    nav(`/problem/${n}/${k}`, { replace: true });
    if (focus) setTimeout(() => document.getElementById(`ptab-${k}`)?.focus(), 0);
  };

  useEffect(() => {
    document.getElementById(`ptab-${tab}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (first.current) { first.current = false; window.scrollTo(0, 0); return; }
    const bar = barRef.current, card = cardRef.current;
    if (bar && card && card.getBoundingClientRect().top < bar.offsetHeight) {
      window.scrollTo({ top: window.scrollY + card.getBoundingClientRect().top - bar.offsetHeight - 8 });
    }
  }, [tab]);

  const onKey = e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const k = steps.findIndex(([s]) => s === tab);
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? steps.length - 1 : (k + (e.key === 'ArrowRight' ? 1 : -1) + steps.length) % steps.length;
    go(steps[j][0], true);
  };

  const body = {
    problem: <>
      <Statement p={p} />
      {x.tests && <div className="pt-tests"><div className="lbl">What it tests</div>{x.tests}</div>}
      {p.note && <div className="notes"><div className="sheet">From your sheet: {p.note}</div></div>}
      <div className="pt-tip"><b>How to use this:</b> try it on LeetCode first. Stuck? Open one hint at a time before moving on.</div>
      <Hints n={n} />
    </>,
    approach: <Approach p={p} />,
    solution: <Solution p={p} />,
    code: <Mine n={n} />,
    deeper: <Deeper p={p} />,
  };

  return (
    <>
      <Link to={`/pattern/${tp.slug}`} className="back">‹ {tp.name}</Link>
      <header className="pp-head">
        <div className="pp-kicker">#{p.n} · Week {p.week} · {p.topic}</div>
        <h1>{p.title}</h1>
        <div className="pp-meta"><DiffBadge d={p.diff} />{x.pat && <span className="tag">{x.pat}</span>}{MyCode.get(n) && <span className="minemark" title="Has your code">✎</span>}</div>
        <div className="pp-acts">
          <StatusButtons n={n} />
          <a className="btn small primary" href={p.url} target="_blank" rel="noopener noreferrer">Solve on LeetCode ↗</a>
        </div>
      </header>
      <nav className="ptabs" role="tablist" aria-label="Study steps" ref={barRef} onKeyDown={onKey}>
        {steps.map(([k, l], j) => (
          <button key={k} type="button" role="tab" id={`ptab-${k}`} aria-controls={`pt-${k}`} aria-selected={k === tab}
            tabIndex={k === tab ? 0 : -1} className={k === tab ? 'on' : ''} onClick={() => go(k)}>
            <span className="ptab-n">{j + 1}</span>{l}
          </button>
        ))}
      </nav>
      <div className="card pt-card" ref={cardRef}>
        {steps.map(([k], j) => {
          const nx = steps[j + 1];
          return (
            <section key={k} className="pt-pane" id={`pt-${k}`} role="tabpanel" aria-labelledby={`ptab-${k}`} hidden={k !== tab}>
              {body[k]}
              {nx && <div className="pt-next"><button type="button" className="btn" onClick={() => go(nx[0])}>{nx[2]} <span aria-hidden="true">→</span></button></div>}
            </section>
          );
        })}
      </div>
      <nav className="pp-nav" aria-label="Other problems">
        {prev ? <Link to={`/problem/${prev.n}`}><small>‹ Previous</small><span>{prev.title}</span></Link> : <span />}
        {next && <Link to={`/problem/${next.n}`} className="nx"><small>Next ›</small><span>{next.title}</span></Link>}
      </nav>
    </>
  );
}
