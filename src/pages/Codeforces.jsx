import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp, setCfStatus } from '../lib/store';
import { CF_LADDERS, CF_ALL, CF_LADDER_BY_ID, CF_TAGS, cfTier } from '../data/cf';
import { today, addDays } from '../lib/dates';
import '../styles/cf.css';
import '../styles/cf-add.css';

const STATUSES = [['all', 'All'], ['todo', 'To do'], ['solved', 'Solved'], ['revisit', 'Revisit']];

function streakOf(cfOn) {
  const days = new Set(Object.values(cfOn));
  let d = today();
  if (!days.has(d)) d = addDays(d, -1);
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

function Ring({ done, total, label, tier, active, to }) {
  const r = 18, c = 2 * Math.PI * r, f = total ? done / total : 0;
  return (
    <Link to={to} className={`cf-ring t-${tier} ${active ? 'on' : ''}`} aria-current={active ? 'page' : undefined}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r={r} className="trk" />
        <circle cx="22" cy="22" r={r} className="val" strokeDasharray={`${c * f} ${c}`} transform="rotate(-90 22 22)" />
      </svg>
      <b>{label}</b>
      <small>{done}/{total}</small>
    </Link>
  );
}

function Row({ p, st }) {
  return (
    <div className={`cf-prob ${st || ''}`}>
      <div className="cf-main">
        <div className="cf-top">
          <span className={`cf-rate t-${cfTier(p.rating)}`}>{p.rating}</span>
          <span className="cf-name" title={p.name}>{p.name}</span>
          <span className="cf-id">{p.id}</span>
        </div>
        <div className="cf-tags">{(p.tags || []).slice(0, 3).map(t => <span key={t} className="cf-tag">{t}</span>)}</div>
      </div>
      <div className="cf-acts">
        <button type="button" className="cf-tick" aria-label={st === 'solved' ? 'Mark not solved' : 'Mark solved'} onClick={() => setCfStatus(p.id, 'solved')}>
          {st === 'solved' ? '✓' : ''}
        </button>
        <button type="button" className={`cf-flag ${st === 'revisit' ? 'on' : ''}`} aria-label="Flag for revisit" aria-pressed={st === 'revisit'} onClick={() => setCfStatus(p.id, 'revisit')}>↻</button>
        <Link className="cf-solve" to={`/cf/solve/${p.id}`} aria-label={`Solve ${p.name} in the app`}>Solve</Link>
        <a className="cf-open" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.name} on Codeforces`}>↗</a>
      </div>
    </div>
  );
}

export default function Codeforces() {
  const S = useApp();
  const nav = useNavigate();
  const { ladder: lid } = useParams();
  const isMine = lid === 'mine';
  // "Mine" is a pseudo-ladder built from problems you added yourself
  const mine = useMemo(() => ({
    id: 'mine', label: 'Mine', blurb: 'Problems you added yourself.',
    problems: Object.values(S.cfProb || {}).map(p => ({ id: p.id, name: p.name, rating: p.rating || 800, tags: p.tags || [], url: p.url })),
  }), [S.cfProb]);
  const ladder = isMine ? mine : (CF_LADDER_BY_ID[lid] || CF_LADDERS[0]);
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');

  const doneIn = l => l.problems.filter(p => S.cf[p.id] === 'solved').length;
  const total = CF_ALL.length;
  const solved = CF_ALL.filter(p => S.cf[p.id] === 'solved').length;
  const revisit = CF_ALL.filter(p => S.cf[p.id] === 'revisit').length;
  const streak = streakOf(S.cfOn);
  const next = ladder.problems.find(p => S.cf[p.id] !== 'solved');

  const tags = useMemo(() => {
    const c = {};
    ladder.problems.forEach(p => p.tags.forEach(t => { c[t] = (c[t] || 0) + 1; }));
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [ladder]);

  const list = ladder.problems.filter(p => {
    const st = S.cf[p.id];
    if (tag && !p.tags.includes(tag)) return false;
    if (status === 'todo' ? st === 'solved' : status !== 'all' && st !== status) return false;
    if (q && !(`${p.name} ${p.id}`.toLowerCase().includes(q.trim().toLowerCase()))) return false;
    return true;
  });

  const random = () => {
    const pool = ladder.problems.filter(p => S.cf[p.id] !== 'solved');
    if (pool.length) nav(`/cf/solve/${pool[Math.floor(Math.random() * pool.length)].id}`);
  };
  const pickTag = t => setTag(x => (x === t ? '' : t));
  const tier = isMine ? 'blue' : cfTier(+ladder.id);

  return (
    <div className="cf-wrap"><div className="cf">
      <header className="cf-hero card">
        <div className="cf-ttl">
          <h1>Codeforces</h1>
          <p className="sub">{CF_LADDERS.length} ladders, {total} classic problems.</p>
        </div>
        <div className="cf-stats">
          <span><b>{solved}</b> solved</span>
          <span><b>{streak}</b> day streak</span>
          <span><b>{revisit}</b> to revisit</span>
        </div>
        <Link className="btn small primary cf-addbtn" to="/cf/add">+ Add problem</Link>
        <div className="bar cf-total"><i style={{ width: `${(solved / total) * 100}%` }} /></div>
      </header>

      <div className="cf-layout">
        <nav className="cf-ladders" aria-label="Rating ladders">
          {CF_LADDERS.map(l => (
            <Ring key={l.id} to={`/cf/${l.id}`} label={l.label} tier={cfTier(+l.id)} done={doneIn(l)} total={l.problems.length} active={l.id === ladder.id} />
          ))}
          <Ring to="/cf/mine" label="Mine" tier="blue" done={doneIn(mine)} total={mine.problems.length} active={isMine} />
        </nav>

        <section className="cf-panel">
          <div className={`cf-ladder-head t-${tier}`}>
            <div>
              <h2>{isMine ? 'Mine' : `Rating ${ladder.label}`}</h2>
              <p className="muted small">{ladder.blurb} {doneIn(ladder)} of {ladder.problems.length} solved.</p>
            </div>
            <button type="button" className="btn small" onClick={random} disabled={!next}>Random unsolved</button>
          </div>

          {next && (
            <div className="card cf-next">
              <small className="cf-k">Next up</small>
              <b title={next.name}>{next.id} · {next.name}</b>
              <Link className="btn small primary" to={`/cf/solve/${next.id}`}>Solve</Link>
              <a className="btn small ghost" href={next.url} target="_blank" rel="noopener noreferrer">Codeforces ↗</a>
            </div>
          )}

          <input className="search" type="search" placeholder="Search by name or id" value={q} onChange={e => setQ(e.target.value)} />
          <div className="cf-filters">
            <div className="segmented" role="group" aria-label="Status filter">
              {STATUSES.map(([k, l]) => <button key={k} type="button" className={status === k ? 'on' : ''} onClick={() => setStatus(k)}>{l}</button>)}
            </div>
          </div>
          <div className="chips cf-tagchips">
            <button type="button" className={`chip ${tag ? '' : 'on'}`} onClick={() => setTag('')}>All tags</button>
            {tags.map(t => <button key={t} type="button" className={`chip ${tag === t ? 'on' : ''}`} onClick={() => pickTag(t)}>{t}</button>)}
          </div>

          <div className="cf-grid">
            {list.map(p => <Row key={p.id} p={p} st={S.cf[p.id]} />)}
          </div>
          {!list.length && (isMine && !ladder.problems.length
            ? <p className="muted cf-empty">Nothing added yet. <Link to="/cf/add">Add a problem</Link> by link or id.</p>
            : <p className="muted cf-empty">Nothing matches these filters.</p>)}
        </section>
      </div>
    </div></div>
  );
}
