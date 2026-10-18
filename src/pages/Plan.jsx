import { Link } from 'react-router-dom';
import { NOTES, PROBLEMS, TOPIC_BY_NAME } from '../data';
import { useApp, setStatus } from '../lib/store';
import { schedule, paceText, planOptions, setPlanEnd } from '../lib/plan';
import { solvedCount } from '../lib/srs';
import { today, addDays, fmtDay, fmtShort, mondayOf } from '../lib/dates';
import { DiffBadge, StatusDot } from '../components/bits';

function PlanRow({ p }) {
  const S = useApp();
  const solved = S.status[p.n] === 'solved', pat = NOTES[p.n]?.pat;
  return (
    <div className={`plan-p${solved ? ' done' : ''}`}>
      <button type="button" className="plan-tick" aria-label={solved ? 'Mark not solved' : 'Mark solved'} onClick={() => setStatus(p.n, 'solved')}><StatusDot n={p.n} /></button>
      <Link to={`/problem/${p.n}`}><span className="t">{p.title}</span><DiffBadge d={p.diff} />{pat && <span className="tag">{pat}</span>}</Link>
    </div>
  );
}

function StartLine({ tp }) {
  const reads = tp.learn.filter(l => l.url);
  return (
    <div className="plan-start">Start of <Link to={`/pattern/${tp.slug}`}>{tp.name}</Link>
      {reads.length > 0 && <> — read: {reads.map((l, i) => <span key={l.url}>{i > 0 && ', '}<a href={l.url} target="_blank" rel="noopener">{l.title} ↗</a></span>)}</>}
    </div>
  );
}

export default function Plan() {
  const S = useApp();
  const t = today(), s = schedule(t), tomorrow = addDays(t, 1);
  // first scheduled problem of a topic you haven't touched yet gets a pointer to its Learn reading
  const startAt = {}, seen = new Set();
  for (const d of s.days) for (const p of d.todo) {
    if (seen.has(p.topic)) continue;
    seen.add(p.topic);
    const tp = TOPIC_BY_NAME[p.topic];
    if (tp && !tp.problems.some(q => S.status[q.n])) startAt[p.n] = tp;
  }
  const thisWeek = mondayOf(t), weeks = [];
  s.days.forEach((day, i) => {
    const w = mondayOf(day.date);
    if (!weeks.length || weeks[weeks.length - 1].w !== w) weeks.push({ w, days: [] });
    weeks[weeks.length - 1].days.push([day, i]);
  });
  const weekLabel = w => w === thisWeek ? 'This week' : w === addDays(thisWeek, 7) ? 'Next week' : `Week of ${fmtShort(w)}`;
  const groups = {};
  for (const p of PROBLEMS) if (S.status[p.n] === 'solved') (groups[S.solvedOn[p.n] || ''] ||= []).push(p);
  const keys = Object.keys(groups).sort((a, b) => (b || '0').localeCompare(a || '0'));
  const solved = solvedCount();
  const pastEnd = S.planEnd && S.planEnd < t;

  const dayCard = (day, i) => {
    const total = day.done.length + day.todo.length;
    const label = i === 0 ? 'Today' : day.date === tomorrow ? 'Tomorrow' : fmtDay(day.date);
    const count = i === 0 ? (total ? (day.todo.length ? `${day.done.length} of ${total} done` : 'Done for today ✓') : 'Nothing left')
      : `${total} problem${total === 1 ? '' : 's'}`;
    return (
      <section key={day.date} className={`card plan-day${i === 0 ? ' today' : ''}`}>
        <div className="plan-day-h"><b>{label}</b>{label !== fmtDay(day.date) && <span className="muted small">{fmtDay(day.date)}</span>}
          <span className="spacer" /><span className="small muted">{count}</span></div>
        {day.done.map(p => <PlanRow key={p.n} p={p} />)}
        {day.todo.map(p => <div key={p.n}>{startAt[p.n] && <StartLine tp={startAt[p.n]} />}<PlanRow p={p} /></div>)}
      </section>
    );
  };

  return (
    <>
      <h1>Your plan</h1>
      <p className="sub">{s.left ? `${s.left} left · ${paceText(s)} a day · finish by ${fmtDay(s.end)}` : 'Every problem is solved. Keep reviewing to make it stick.'}</p>
      {pastEnd && <p className="plan-note">Your finish date ({fmtDay(S.planEnd)}) has passed, so everything is on today. Pick a new date below.</p>}
      {s.behind > 0 && <p className="plan-note">{s.behind} of these {s.behind === 1 ? 'is' : 'are'} from earlier weeks. They’re spread across the coming days, so nothing piles up.</p>}
      <div className="card plan-end">
        <div className="row"><label htmlFor="plan-end"><b>Finish by</b></label><span className="spacer" />
          <input type="date" id="plan-end" className="plan-date" min={t} value={pastEnd ? t : s.end} onChange={e => setPlanEnd(e.target.value)} /></div>
        <div className="chips">{planOptions().map(([d, l]) =>
          <button key={d} type="button" className={`chip${s.end === d ? ' on' : ''}`} onClick={() => setPlanEnd(d)}>{l} · {fmtShort(d)}</button>)}</div>
        <p className="small muted">A missed day doesn’t pile up: what’s left is re-spread over the days remaining.</p>
      </div>
      {weeks.map(w => (
        <div key={w.w}>
          <h3 className="eyebrow plan-wk">{weekLabel(w.w)}</h3>
          <div className="plan-days">{w.days.map(([day, i]) => dayCard(day, i))}</div>
        </div>
      ))}
      {solved > 0 && (
        <details className="card plan-done"><summary><b>Done so far</b> <span className="muted small">{solved} solved</span></summary>
          {keys.map(k => (
            <div key={k || 'earlier'}><div className="eyebrow">{k ? (k === t ? 'Today' : fmtDay(k)) : 'Earlier'}</div>
              {groups[k].map(p => <PlanRow key={p.n} p={p} />)}</div>
          ))}
        </details>
      )}
    </>
  );
}
