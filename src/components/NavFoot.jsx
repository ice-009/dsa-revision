import { PROBLEMS } from '../data';
import { useApp } from '../lib/store';
import { solvedCount, streak } from '../lib/srs';

export default function NavFoot() {
  useApp();
  const pct = Math.round(solvedCount() / PROBLEMS.length * 100);
  return (
    <div className="nav-foot">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}><span>{solvedCount()}/{PROBLEMS.length} solved</span><span>{streak()}d streak</span></div>
      <div className="bar"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
