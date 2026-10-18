// Small shared pieces. Safe to extend; keep existing exports stable.
import { Link } from 'react-router-dom';
import { useApp, useMyCode, setStatus } from '../lib/store';
import { patOf } from '../lib/util.jsx';
import { NOTES } from '../data';

export const DiffBadge = ({ d }) => (d ? <span className={`badge d-${d}`}>{d}</span> : null);

export function StatusDot({ n }) {
  const S = useApp();
  return <span className={`dot ${S.status[n] || ''}`} aria-label={S.status[n] || 'not started'} />;
}

export function SolveTick({ n, className = 'prob-tick' }) {
  const S = useApp();
  const solved = S.status[n] === 'solved';
  return (
    <button type="button" className={className} aria-label={solved ? 'Mark not solved' : 'Mark solved'} onClick={() => setStatus(n, 'solved')}>
      <StatusDot n={n} />
    </button>
  );
}

export function StatusButtons({ n }) {
  const S = useApp();
  const s = S.status[n];
  return (
    <>
      <button type="button" className={`btn small ${s === 'solved' ? 'on-solved' : ''}`} onClick={() => setStatus(n, 'solved')}>{s === 'solved' ? '✓ Solved' : 'Mark solved'}</button>
      <button type="button" className={`btn small ${s === 'revisit' ? 'on-revisit' : ''}`} onClick={() => setStatus(n, 'revisit')}>{s === 'revisit' ? '↻ Revisit' : 'Flag revisit'}</button>
    </>
  );
}

// one line per problem: tick it off in place, or open its page
export function ProblemRow({ p, showKey = false, showTopic = false }) {
  const MyCode = useMyCode();
  const x = NOTES[p.n] || {};
  return (
    <div className="prob">
      <SolveTick n={p.n} />
      <Link className="prob-link" to={`/problem/${p.n}`}>
        <span className="t">{p.title}</span>
        <span className="prob-meta">
          <DiffBadge d={p.diff} />
          {x.pat && <span className="tag">{x.pat}</span>}
          {showTopic && <span className="muted small">{p.topic}</span>}
          {MyCode.get(p.n) && <span className="minemark" title="Has your code">✎</span>}
        </span>
        {showKey && x.key && <span className="key-line">{x.key}</span>}
      </Link>
      <span className="chev" aria-hidden="true">›</span>
    </div>
  );
}
export { patOf };
