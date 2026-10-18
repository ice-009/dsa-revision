import { useEffect, useReducer, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PROBLEMS, BY_N, NOTES, PLUS, EXPLAIN, TOPICS, TOPIC_BY_SLUG } from '../data';
import { useApp } from '../lib/store';
import { currentWeek } from '../lib/dates';
import { dueToday, rate, preview, GRADES, fmtDays, recallNow, streak } from '../lib/srs';
import { LANGS, SLIPS, logSlip, DiffBadge, Hints, Notes, PathBox, Solution, Deeper } from '../components/review/shared.jsx';
import NotFound from './NotFound';

function startSession(S, kind, arg) {
  let cards, title;
  if (kind === 'today') { cards = dueToday().all; title = 'Today’s review'; }
  else if (kind === 'topic') { const tp = TOPIC_BY_SLUG[arg]; if (!tp) return null; cards = tp.problems.slice(); title = tp.name; }
  else if (kind === 'revisit') { cards = PROBLEMS.filter(p => S.status[p.n] === 'revisit'); title = 'Revisit pile'; }
  else if (kind === 'random') { cards = PROBLEMS.filter(p => p.week <= currentWeek()).sort(() => Math.random() - .5).slice(0, 10); title = 'Random 10'; }
  else return null;
  return { key: `${kind}/${arg || ''}`, title, queue: cards.map(p => p.n), idx: 0, flipped: false, requeued: {}, total: cards.length, counts: [0, 0, 0, 0], slip: null, hintsShown: 0, showSol: false };
}

function ReviewHome() {
  const S = useApp();
  const q = dueToday();
  const revisit = PROBLEMS.filter(p => S.status[p.n] === 'revisit').length;
  const cx = S.cxq;
  return (
    <>
      <h1>Review</h1>
      <p className="sub">See a problem, recall its pattern and approach, then reveal and grade yourself.</p>
      <div className="row" style={{ marginBottom: 8 }}>
        {q.all.length ? <Link className="btn primary" to="/review/today">Today’s cards · {q.all.length}</Link>
          : <span className="btn primary disabled" aria-disabled="true">Today’s cards · 0</span>}
        <Link className="btn" to="/review/random">Random 10</Link>
        {revisit > 0 && <Link className="btn" to="/review/revisit">Revisit pile · {revisit}</Link>}
      </div>
      <h2>Practice modes</h2>
      <div className="practice-row">
        <Link className="card practice" to="/quiz/mix"><span className="pr-ico">🎯</span><span><b>Spot the pattern · mixed</b><small>Interleaved across weeks 1–{currentWeek()}</small></span></Link>
        <Link className="card practice" to="/quiz/all"><span className="pr-ico">🌍</span><span><b>Spot the pattern · all</b><small>Every problem in the sheet</small></span></Link>
        <Link className="card practice" to="/parsons/random"><span className="pr-ico">🧩</span><span><b>Rebuild the code</b><small>Parsons puzzle, in {LANGS.find(l => l[0] === S.lang)[1]}</small></span></Link>
        <Link className="card practice" to="/quiz/cx"><span className="pr-ico">⏳</span><span><b>Complexity drill</b><small>Name the time complexity{cx[1] ? ` · ${Math.round(cx[0] / cx[1] * 100)}% so far` : ''}</small></span></Link>
        <Link className="card practice" to="/mock"><span className="pr-ico">⏱</span><span><b>Mock interview</b><small>45 minutes, timed, self-assessed</small></span></Link>
      </div>
      <h2>Drill a pattern</h2>
      <div className="drill-list">{TOPICS.map(tp => <Link key={tp.slug} to={`/review/topic/${tp.slug}`}><span>{tp.name}</span><span className="muted small">{tp.problems.length}</span></Link>)}</div>
      <h2>How grading works</h2>
      <div className="grade-key">
        <div className="g0"><b>Again</b><span>Couldn’t recall it. It comes back later this session.</span></div>
        <div className="g1"><b>Hard</b><span>Got there slowly, or needed a hint.</span></div>
        <div className="g2"><b>Good</b><span>Recalled the pattern and the approach.</span></div>
        <div className="g3"><b>Easy</b><span>Instant.</span></div>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>Cards are scheduled with <b>FSRS-6</b> (the algorithm in modern Anki) to come back just before you’d forget them, aiming for {Math.round(S.retention * 100)}% recall. Today’s cards mix topics, which trains you to spot which pattern applies. New cards come from your solved problems first, then this week’s plan ({S.newPerDay} a day). Change both in More.</p>
    </>
  );
}

function Done({ s }) {
  useApp();
  const [a, h, g, e] = s.counts;
  const st = streak();
  return (
    <div className="review"><div className="card done-card">
      <div className="big">✓</div>
      <h1>{s.title} done</h1>
      <p className="sub">{s.total} cards · {g + e} good/easy · {h} hard · {a} again</p>
      <p className="muted">Streak: {st} day{st === 1 ? '' : 's'}</p>
      <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
        <Link className="btn primary" to="/today">Back to Today</Link>
        <Link className="btn" to="/review">More review</Link>
      </div></div></div>
  );
}

function Session({ kind, arg }) {
  const S = useApp();
  const [, force] = useReducer(x => x + 1, 0);
  const ref = useRef(null);
  if (!ref.current) ref.current = startSession(S, kind, arg);
  const s = ref.current;
  const sRef = useRef(s);
  sRef.current = s;

  const flip = () => { if (s && !s.flipped) { s.flipped = true; force(); } };
  const grade = g => {
    const n = s.queue[s.idx];
    if (s.slip) logSlip(n, s.slip);
    s.slip = null;
    rate(n, g);
    s.counts[g]++;
    if (g === 0 && !s.requeued[n]) { s.requeued[n] = true; s.queue.splice(Math.min(s.queue.length, s.idx + 4), 0, n); }
    s.idx++; s.flipped = false; s.showSol = false; s.hintsShown = 0;
    force();
    window.scrollTo(0, 0);
  };
  const gradeRef = useRef(grade); gradeRef.current = grade;

  useEffect(() => {
    const onKey = e => {
      const s = sRef.current;
      if (!s || s.idx >= s.queue.length || e.target.matches?.('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (!s.flipped && k === 'h') { const n = s.queue[s.idx]; if (PLUS[n] && s.hintsShown < PLUS[n].hints.length) { s.hintsShown++; force(); } }
      else if (!s.flipped && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); s.flipped = true; force(); }
      else if (s.flipped && /^[1-4]$/.test(e.key)) { e.preventDefault(); gradeRef.current(Number(e.key) - 1); }
      else if (s.flipped && !s.showSol && k === 's') { s.showSol = true; force(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!s) return <ReviewHome />;
  if (!s.queue.length) {
    return (
      <div className="review"><div className="card done-card"><div className="big">☀︎</div><h1>Nothing to review</h1>
        <p className="sub">You’re all caught up.</p><Link className="btn primary" to="/review">Drill a pattern</Link></div></div>
    );
  }
  if (s.idx >= s.queue.length) return <Done s={s} />;

  const n = s.queue[s.idx];
  const p = BY_N[n];
  const x = NOTES[n];
  const card = S.srs[n];
  const pct = Math.round(s.idx / s.queue.length * 100);
  const flipProps = s.flipped ? {} : {
    role: 'button', tabIndex: 0, onClick: flip,
    onKeyDown: e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flip(); } },
  };
  return (
    <div className="review">
      <div className="rv-top">
        <Link to="/review" className="btn small ghost" aria-label="End session">✕</Link>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        <span className="small muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.idx + 1}/{s.queue.length}</span>
      </div>
      <div className={`card flash ${s.flipped ? 'flipped' : ''}`} {...flipProps}>
        <div className="row small muted" style={{ gap: 8 }}>{s.title} · #{n}{card ? ` · recall ${Math.round(recallNow(card) * 100)}%` : ' · new'} <DiffBadge d={p.diff} />
          {S.status[n] === 'revisit' && <span className="badge d-Hard">revisit</span>}</div>
        <div className="q-title">{p.title}</div>
        {PLUS[n] && <p className="q-text">{PLUS[n].q}</p>}
        {EXPLAIN[n]?.q && <details className="explain-d" onClick={e => e.stopPropagation()}><summary>Understand the question</summary><p>{EXPLAIN[n].q}</p></details>}
        {s.flipped ? (
          <>
            <div className="row" style={{ gap: 8 }}><span className="tag" style={{ fontSize: 14 }}>{x?.pat}</span><span className="muted small">{p.topic}</span><span className="spacer" />
              <a className="small" href={p.url} target="_blank" rel="noopener noreferrer">LeetCode ↗</a></div>
            <Notes p={p} />
            <PathBox p={p} />
            {s.showSol ? <><Solution p={p} /><Deeper p={p} /></>
              : <button type="button" className="btn small" style={{ marginTop: 14, alignSelf: 'flex-start' }} onClick={() => { s.showSol = true; force(); }}>Show algorithm, code &amp; dry run <span className="kbd">S</span></button>}
          </>
        ) : (
          <>
            <Hints n={n} shown={s.hintsShown} onMore={v => { s.hintsShown = v; force(); }} />
            <div className="prompt">Recall: <b>pattern</b> · <b>approach</b> · <b>key trick</b> · <b>complexity</b><br /><br />Tap to reveal <span className="kbd">space</span> · hint <span className="kbd">H</span></div>
          </>
        )}
      </div>
      {s.flipped && s.hintsShown > 0 && <p className="small muted" style={{ margin: '10px 2px 0' }}>You used {s.hintsShown} hint{s.hintsShown === 1 ? '' : 's'} — <b>Hard</b> is the honest grade unless it clicked instantly.</p>}
      {s.flipped && (
        <div className="slips"><span className="small muted">What slowed you down? (optional)</span>{SLIPS.map(([k, l]) =>
          <button key={k} type="button" className={`chip ${s.slip === k ? 'on' : ''}`} onClick={() => { s.slip = s.slip === k ? null : k; force(); }}>{l}</button>)}</div>
      )}
      {s.flipped && (
        <div className="grades">{GRADES.map((g, i) =>
          <button key={g} type="button" className={`g${i}${s.hintsShown && i === 1 ? ' suggest' : ''}`} onClick={() => grade(i)}>{g}<small>{fmtDays(preview(card, i))} <span className="kbd">{i + 1}</span></small></button>)}</div>
      )}
    </div>
  );
}

export default function Review() {
  const { kind, arg } = useParams();
  useApp();
  if (!kind) return <ReviewHome />;
  if (!['today', 'topic', 'revisit', 'random'].includes(kind) || (kind === 'topic' && !TOPIC_BY_SLUG[arg])) return <ReviewHome />;
  return <Session key={`${kind}/${arg || ''}`} kind={kind} arg={arg} />;
}
void NotFound;
