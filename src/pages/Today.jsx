import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NOTES, PLUS, PROBLEMS, WEEKS } from '../data';
import { useApp, useMyCode, setStatus, set } from '../lib/store';
import { schedule, paceText } from '../lib/plan';
import { dueToday, streak, solvedCount } from '../lib/srs';
import { today, fmtDay, currentWeek } from '../lib/dates';
import { useInstall } from '../lib/install';
import { topSlip, weakFamilies } from '../lib/insights';
import { DiffBadge, StatusDot } from '../components/bits';
import SyncChip from '../components/SyncChip';

const reviewMinutes = k => Math.max(1, Math.round(k * 1.5));
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

// optional Codeforces "next up" card (another agent owns it)
const cfMods = import.meta.glob('../components/CfNext.jsx', { eager: true });
const CfNext = Object.values(cfMods)[0]?.default;

function InstallBar() {
  const S = useApp();
  const { canInstall, standalone, install, hint } = useInstall();
  if (standalone || S.hideInstall) return null;
  return (
    <div className="td-install">
      {canInstall
        ? <><span className="td-install-t"><b>Install the app</b> · full screen, works offline</span>
          <button type="button" className="btn small primary" onClick={install}>Install app</button></>
        : <details><summary><b>Install the app</b> · works offline <span className="td-how">How?</span></summary>
          <p>{hint.map(([t, b], i) => (b ? <b key={i}>{t}</b> : <span key={i}>{t}</span>))}</p></details>}
      <button type="button" className="td-x" aria-label="Dismiss install tip" onClick={() => set({ hideInstall: true })}>✕</button>
    </div>
  );
}

function Hero({ plan, q }) {
  const MyCode = useMyCode();
  const { done, todo } = plan.today;
  const p = todo[0];
  if (p) {
    const x = NOTES[p.n] || {};
    const hint = PLUS[p.n]?.hints?.[0] || x.key;
    const total = done.length + todo.length;
    return (
      <section className="card td-now" aria-label="Do this now">
        <div className="td-kicker">Do this now{total > 1 && <span> · {done.length + 1} of {total} today</span>}</div>
        <h1 className="td-title"><Link to={`/problem/${p.n}`}>{p.title}</Link></h1>
        <div className="td-meta">
          <DiffBadge d={p.diff} />{x.pat && <span className="tag">{x.pat}</span>}<span className="muted">{p.topic}</span>
          {MyCode.get(p.n) && <span className="minemark" title="Has your code">✎</span>}
        </div>
        {hint && <details className="td-hint"><summary>Stuck? Show a hint</summary><p>{hint}</p></details>}
        <div className="td-acts">
          <a className="btn primary" href={p.url} target="_blank" rel="noopener">Solve on LeetCode ↗</a>
          <button type="button" className="btn" onClick={() => setStatus(p.n, 'solved')}>✓ Mark solved</button>
          <Link className="btn ghost" to={`/problem/${p.n}/approach`}><span>Notes<span className="td-wide"> &amp; solution</span></span></Link>
        </div>
      </section>
    );
  }
  const next = plan.days[1]?.todo?.[0];
  const hasReview = q.all.length > 0;
  return (
    <section className="card td-now td-won" aria-label="Today is done">
      <div className="td-kicker">{plan.left ? `✓ Today’s ${done.length} done` : '✓ Every problem solved'}</div>
      <h1 className="td-title">{plan.left ? 'Nice work — that’s today.' : 'The whole sheet is done.'}</h1>
      <p className="td-sub">{hasReview ? 'Lock it in with a quick review' : 'Reviews are done too'}{next ? ', or get ahead on tomorrow.' : '.'}</p>
      <div className="td-acts">
        {hasReview && <Link className="btn primary" to="/review/today">Review {plural(q.all.length, 'card')} · ~{reviewMinutes(q.all.length)} min</Link>}
        {next && <Link className={`btn ${hasReview ? '' : 'primary'}`} to={`/problem/${next.n}`}>Get ahead: {next.title}</Link>}
        {!hasReview && !next && <Link className="btn primary" to="/review">Drill a pattern</Link>}
      </div>
    </section>
  );
}

function TodayList({ plan }) {
  const { done, todo } = plan.today;
  const total = done.length + todo.length;
  if (!total) return null;
  const row = (p, isDone, isNow) => (
    <li key={p.n} className={`td-item${isDone ? ' done' : ''}${isNow ? ' now' : ''}`}>
      <button type="button" className="td-check" aria-label={`${isDone ? 'Mark not solved' : 'Mark solved'}: ${p.title}`} onClick={() => setStatus(p.n, 'solved')}><StatusDot n={p.n} /></button>
      <Link to={`/problem/${p.n}`}><span className="td-it">{p.title}</span><span className="td-im">{NOTES[p.n]?.pat || p.topic}</span></Link>
      <DiffBadge d={p.diff} />
    </li>
  );
  return (
    <section className="td-sec">
      <div className="td-sec-h"><h2>Today’s list</h2><span>{done.length} of {total} done</span></div>
      <div className="bar td-bar"><i style={{ width: `${Math.round(done.length / total * 100)}%` }} /></div>
      <ul className="td-list">{done.map(p => row(p, true))}{todo.map((p, i) => row(p, false, i === 0))}</ul>
      <Link className="td-link" to="/plan">See the full plan →</Link>
    </section>
  );
}

function ReviewCard({ q, reviewedToday }) {
  if (!q.all.length) {
    return (
      <div className="card td-review calm"><span className="td-ico">✓</span>
        <span><b>Reviews done</b><small>{reviewedToday ? `${plural(reviewedToday, 'card')} reviewed today` : 'Nothing due right now'}</small></span>
        <Link className="td-go" to="/review">Drill a pattern →</Link></div>
    );
  }
  const parts = [[q.due.length, 'due'], [q.revisit.length, 'flagged'], [q.fresh.length, 'new']].filter(([c]) => c).map(([c, l]) => `${c} ${l}`);
  return (
    <Link className="card td-review" to="/review/today"><span className="td-ico">↻</span>
      <span><b>{plural(q.all.length, 'card')} to review</b><small>~{reviewMinutes(q.all.length)} min · {parts.join(' · ')}</small></span>
      <span className="td-go">Start →</span></Link>
  );
}

export default function Today() {
  const S = useApp();
  // new day while the app sat open/backgrounded: re-render
  const [day, setDay] = useState(today());
  useEffect(() => {
    const f = () => { if (document.visibilityState === 'visible') setDay(today()); };
    document.addEventListener('visibilitychange', f);
    const id = setInterval(f, 60000);
    return () => { document.removeEventListener('visibilitychange', f); clearInterval(id); };
  }, []);

  const t = day;
  const plan = schedule(t);
  const q = dueToday();
  const reviewedToday = S.days[t]?.reviewed || 0;
  const revisit = PROBLEMS.filter(p => S.status[p.n] === 'revisit').length;
  const mockOn = S.mock && !S.mock.ended;
  const allDone = !plan.today.todo.length;
  const sk = streak();
  const tDone = plan.today.done.length, tTotal = tDone + plan.today.todo.length;
  const weak = weakFamilies(S), slip = topSlip(S);

  return (
    <div className="td">
      <InstallBar />
      <div className="td-head">
        <span className="td-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
        <span className="spacer" /><SyncChip />
      </div>
      {plan.left > 0 && <Link className="td-pace" to="/plan">{paceText(plan)} a day · {plan.left} left · finish by {fmtDay(plan.end, { day: 'numeric', month: 'short' })} <span aria-hidden="true">→</span></Link>}

      <div className="td-stats">
        <div className="stat-tile td-st-ring">
          <span className="ring-wrap"><span className="ring" style={{ '--v': tTotal ? Math.round(tDone / tTotal * 100) : 100, '--size': '56px', '--w': '6px' }} /><b>{tTotal ? `${tDone}/${tTotal}` : '✓'}</b></span>
          <span>done today</span>
        </div>
        <div className="stat-tile"><b>{sk}</b><span>day streak</span></div>
        <div className="stat-tile"><b>{solvedCount()}</b><span>of {PROBLEMS.length} solved</span></div>
      </div>
      <Hero plan={plan} q={q} />
      <TodayList plan={plan} />
      {CfNext && <CfNext />}
      {!allDone && <section className="td-sec"><div className="td-sec-h"><h2>Then</h2></div><ReviewCard q={q} reviewedToday={reviewedToday} /></section>}

      <section className="td-sec td-extra">
        <div className="td-sec-h"><h2>When you have time</h2></div>
        <div className="td-more">
          {mockOn && <Link className="td-chip hot" to="/mock">⏱ Mock in progress — resume</Link>}
          <Link className="td-chip" to="/quiz/mix">🎯 Spot the pattern</Link>
          <Link className="td-chip" to="/parsons/random">🧩 Rebuild the code</Link>
          {!mockOn && <Link className="td-chip" to="/mock">⏱ Mock interview</Link>}
          {revisit > 0 && <Link className="td-chip" to="/review/revisit">↻ {revisit} flagged to revisit</Link>}
        </div>
        {(weak.length > 0 || slip) && (
          <div className="td-insights">
            {weak.length > 0 && <p className="small weak-line">Recognition to work on: {weak.map((w, i) => <span key={w.label}>{i > 0 && ' · '}<b>{w.label}</b> {w.pct}%</span>)}</p>}
            {slip && <p className="small weak-line">Most common slip: <b>{slip.label}</b> ({slip.count}×) — {slip.advice}</p>}
          </div>
        )}
        <p className="td-foot">{sk ? `${sk}-day review streak · ` : ''}{solvedCount()}/{PROBLEMS.length} solved · week {currentWeek()} of {WEEKS}</p>
      </section>
    </div>
  );
}
