import '../styles/patterns.css';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../lib/store';
import { TOPIC_BY_SLUG, LESSONS, BY_N, getViz } from '../data';
import { ProblemRow } from '../components/bits';
import { CodeBlock } from '../components/LangTabs';
import NotFound from './NotFound';
import { jump } from './Playbook';

const TOC = [['l-model', 'Mental model'], ['l-when', 'When to use'], ['l-method', 'Method'], ['l-viz', 'See it run'],
  ['l-code', 'Template'], ['l-variants', 'Variants'], ['l-follow', 'Follow-ups'], ['l-debug', 'Debug'], ['l-ladder', 'Study order']];

export default function Pattern() {
  const S = useApp();
  const { slug } = useParams();
  const tp = TOPIC_BY_SLUG[slug];
  // memoised so React never rewrites the viz markup after its players mount themselves
  const vizHtml = useMemo(() => (tp && getViz() ? getViz().html(tp.name) : ''), [tp]);
  if (!tp) return <NotFound />;
  const L = LESSONS[tp.name] || {};
  const done = tp.problems.filter(p => S.status[p.n] === 'solved').length;
  const ladder = (L.ladder || tp.problems.map(p => p.n)).map(n => BY_N[n]).filter(Boolean);
  const traps = [...(L.mistakes || []), ...tp.traps.filter(t => !(L.mistakes || []).includes(t))];
  return (
    <>
      <Link to="/patterns" className="back">‹ Patterns</Link>
      <div className="row" style={{ margin: '10px 0 6px' }}><div className="ico">{tp.icon}</div>
        <h1 style={{ margin: 0 }}>{tp.name}</h1></div>
      <p className="sub">Week {tp.week} · {done}/{tp.problems.length} solved</p>
      <p className="gist">{tp.gist}</p>
      <div className="row" style={{ marginBottom: 22 }}>
        <Link className="btn primary" to={`/review/topic/${tp.slug}`}>Drill {tp.problems.length} cards</Link>
        <Link className="btn" to={`/quiz/${tp.slug}`}>Spot the pattern</Link>
        {tp.learn.map(l => <a key={l.url} className="btn" href={l.url} target="_blank" rel="noopener noreferrer">Learn: {l.title.split(':')[0]} ↗</a>)}
      </div>
      <nav className="lesson-toc">{TOC.map(([id, l]) => <a key={id} href={`#${id}`} onClick={e => jump(e, id)}>{l}</a>)}</nav>

      {L.intuition && (
        <section className="card lesson-hero" id="l-model">
          <div className="eyebrow">Mental model</div><p className="lesson-big">{L.intuition}</p>
          <div className="eyebrow" style={{ marginTop: 14 }}>Why it works</div><p>{L.why}</p>
        </section>
      )}

      <div className="two" id="l-when">
        <div className="card"><div className="eyebrow">Reach for it when</div><ul className="clean">{tp.signals.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        {L.vs && (
          <div className="card"><div className="eyebrow">This or something else?</div>
            <table className="vs"><tbody>{L.vs.map(([a, b], i) => <tr key={i}><td>{a}</td><td>→ <b>{b}</b></td></tr>)}</tbody></table></div>
        )}
      </div>

      {L.steps && (
        <>
          <h2 id="l-method">The method</h2>
          <ol className="method">{L.steps.map(([lbl, d], i) => <li key={i}><b>{lbl}</b><span>{d}</span></li>)}</ol>
        </>
      )}

      <h2 id="l-viz">See it run</h2>
      <div className="viz-host" dangerouslySetInnerHTML={{ __html: vizHtml }} />

      <h2 id="l-code">Template</h2>
      <CodeBlock src={`tpl:${tp.slug}`} />
      <p className="small muted" style={{ marginTop: 8 }}>Complexity: <span className="cx">{tp.cx}</span></p>

      {L.variants && (
        <>
          <h2 id="l-variants">Variants you’ll meet</h2>
          <table className="pb-table variants"><thead><tr><th>Variant</th><th>Idea</th><th>Example</th></tr></thead><tbody>
            {L.variants.map(([a, b, c], i) => <tr key={i}><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>)}</tbody></table>
        </>
      )}

      {L.say && <div className="card say-card"><div className="eyebrow">Say it in the interview</div><p>{L.say}</p></div>}

      {L.followups && (
        <>
          <h2 id="l-follow">Follow-ups interviewers ask <span className="muted small" style={{ fontWeight: 500 }}>think first, then tap</span></h2>
          <div className="fu-list">{L.followups.map(([q, a], i) => <details className="fu" key={i}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </>
      )}

      <h2 id="l-debug">Debug checklist</h2>
      <div className="card"><ul className="checklist">{traps.map((t, i) => <li key={i}>{t}</li>)}</ul></div>

      <h2 id="l-ladder">Study order <span className="muted small" style={{ fontWeight: 500 }}>easiest idea first, each builds on the last</span></h2>
      <div className="list ladder">{ladder.map((p, i) => <div className="ladder-row" key={p.n}><span className="ladder-n">{i + 1}</span><ProblemRow p={p} showKey /></div>)}</div>
    </>
  );
}
