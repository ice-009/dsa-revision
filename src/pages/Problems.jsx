import { useState } from 'react';
import { PROBLEMS, TOPICS, NOTES } from '../data';
import { useApp } from '../lib/store';
import { ProblemRow } from '../components/bits.jsx';

// kept at module level so filters survive leaving and coming back, as in the old app
let saved = { q: '', topic: '', diff: '', status: '' };
const escRe = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Sel({ f, label, opts, value, onChange }) {
  return (
    <label className={`fsel${value ? ' on' : ''}`}><span className="sr">{label}</span>
      <select value={value} onChange={e => onChange(f, e.target.value)}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select></label>
  );
}

export default function Problems() {
  const S = useApp();
  const [filters, setF] = useState(saved);
  const change = (f, v) => { saved = { ...saved, [f]: v }; setF(saved); };
  const clear = () => { saved = { q: '', topic: '', diff: '', status: '' }; setF(saved); };

  const q = filters.q.trim().toLowerCase();
  // every search word must match the start of a word, so "heap" doesn't hit "cheapest"
  const words = q.split(/\s+/).filter(Boolean).map(w => new RegExp(`(^|[^a-z0-9])${escRe(w)}`));
  const match = p => {
    if (filters.topic && p.topic !== filters.topic) return false;
    if (filters.diff && p.diff !== filters.diff) return false;
    if (filters.status && (S.status[p.n] || 'todo') !== filters.status) return false;
    if (!q) return true;
    const x = NOTES[p.n] || {};
    const hay = [p.title, p.topic, x.pat, x.tests, x.key, `#${p.n}`].join(' ').toLowerCase();
    return words.every(w => w.test(hay));
  };
  const shown = PROBLEMS.filter(match);
  const groups = TOPICS.map(tp => [tp, shown.filter(p => p.topic === tp.name)]).filter(([, ps]) => ps.length);
  const active = ['topic', 'diff', 'status'].some(f => filters[f]) || q;

  return (
    <>
      <header className="page-h"><h1>Problems</h1>
        <p className="sub">Every problem in your sheet. Tick the circle when you’ve solved one; open it to study it step by step.</p></header>
      <div className="filters">
        <input className="search" type="search" placeholder="Search by name, pattern or trick" aria-label="Search problems" value={filters.q}
          onChange={e => change('q', e.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false} />
        <div className="fsels">
          <Sel f="topic" label="Topic" value={filters.topic} onChange={change} opts={[['', 'All topics'], ...TOPICS.map(t => [t.name, t.name])]} />
          <Sel f="diff" label="Difficulty" value={filters.diff} onChange={change} opts={[['', 'Any difficulty'], ['Easy', 'Easy'], ['Medium', 'Medium'], ['Hard', 'Hard']]} />
          <Sel f="status" label="Status" value={filters.status} onChange={change} opts={[['', 'Any status'], ['todo', 'To do'], ['solved', 'Solved'], ['revisit', 'To revisit']]} />
        </div>
        <div className="fcount" aria-live="polite">
          {shown.length === PROBLEMS.length ? `${PROBLEMS.length} problems` : `${shown.length} of ${PROBLEMS.length} problems`}
          {active && <> <button type="button" className="linkbtn" onClick={clear}>Clear filters</button></>}
        </div>
      </div>
      {shown.length ? groups.map(([tp, ps]) => {
        const done = tp.problems.filter(p => S.status[p.n] === 'solved').length;
        return (
          <div key={tp.name}>
            <div className="group-h"><h2>{tp.name}</h2><span>{done}/{tp.problems.length} solved</span></div>
            <div className="list">{ps.map(p => <ProblemRow key={p.n} p={p} />)}</div>
          </div>
        );
      }) : (
        <div className="empty-state"><b>No problems match</b><p>Try a shorter search or clear the filters.</p>
          <button type="button" className="btn small" onClick={clear}>Clear filters</button></div>
      )}
    </>
  );
}
