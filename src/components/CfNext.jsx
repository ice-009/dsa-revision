import { Link } from 'react-router-dom';
import { useApp } from '../lib/store';
import { CF_LADDERS, cfTier } from '../data/cf';
import '../styles/cf.css';

/** Compact "Codeforces next up" card: first unsolved problem of the lowest unfinished ladder. */
export default function CfNext() {
  const S = useApp();
  const ladder = CF_LADDERS.find(l => l.problems.some(p => S.cf[p.id] !== 'solved'));
  if (!ladder) {
    return <Link to="/cf" className="card cfn"><div className="cfn-body"><b>Codeforces sheet complete</b><small>Every ladder solved. Nice.</small></div></Link>;
  }
  const p = ladder.problems.find(x => S.cf[x.id] !== 'solved');
  const done = ladder.problems.filter(x => S.cf[x.id] === 'solved').length;
  return (
    <div className="card cfn">
      <span className={`cf-rate t-${cfTier(p.rating)}`}>{p.rating}</span>
      <div className="cfn-body">
        <small className="cfn-k">Codeforces next up · {done}/{ladder.problems.length} on the {ladder.label} ladder</small>
        <b>{p.id} · {p.name}</b>
      </div>
      <a className="btn small primary" href={p.url} target="_blank" rel="noopener noreferrer">Open</a>
      <Link className="btn small ghost" to={`/cf/${ladder.id}`}>Sheet</Link>
    </div>
  );
}
