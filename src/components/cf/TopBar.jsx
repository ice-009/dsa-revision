// 48px top bar of the Codeforces workspace.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cfTier } from '../../data/cf';
import { Ico, ICONS, lsGet, lsSet } from './shared.jsx';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const MOD = isMac ? '⌘' : 'Ctrl';

function useStudyTimer(id) {
  const key = `cfs-timer-${id}`;
  const read = () => { try { return JSON.parse(lsGet(key, '')) || { ms: 0, at: 0 }; } catch (e) { return { ms: 0, at: 0 }; } };
  const [st, setSt] = useState(read);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!st.at) return;
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, [st.at]);
  const elapsed = st.ms + (st.at ? Date.now() - st.at : 0);
  const toggle = () => {
    const n = st.at ? { ms: elapsed, at: 0 } : { ms: st.ms, at: Date.now() };
    lsSet(key, JSON.stringify(n)); setSt(n);
  };
  const reset = () => { const n = { ms: 0, at: 0 }; lsSet(key, JSON.stringify(n)); setSt(n); };
  return { elapsed, running: !!st.at, toggle, reset };
}
const fmt = ms => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return `${h ? h + ':' + String(m).padStart(2, '0') : m}:${String(s % 60).padStart(2, '0')}`; };

function Settings({ cfg, set, plainForced }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const f = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', f); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('pointerdown', f); document.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <div className="cfw-pop-wrap" ref={ref}>
      <button type="button" className="cfw-ibtn" aria-haspopup="dialog" aria-expanded={open} aria-label="Editor settings" title="Editor settings" onClick={() => setOpen(o => !o)}><Ico d={ICONS.gear} /></button>
      {open && (
        <div className="cfw-pop" role="dialog" aria-label="Editor settings">
          <label className="cfw-row"><span>Font size <b>{cfg.fs}px</b></span>
            <input type="range" min="12" max="30" step="1" value={cfg.fs} onChange={e => set({ fs: +e.target.value })} aria-label="Font size" /></label>
          <div className="cfw-row"><span>Tab size</span>
            <div className="segmented" role="group" aria-label="Tab size">
              {[2, 4].map(n => <button key={n} type="button" className={cfg.tab === n ? 'on' : ''} aria-pressed={cfg.tab === n} onClick={() => set({ tab: n })}>{n}</button>)}
            </div></div>
          <label className="cfw-row cfw-check"><span>Plain editor <small>No syntax highlighting</small></span>
            <input type="checkbox" checked={cfg.plain || plainForced} disabled={plainForced} onChange={e => set({ plain: e.target.checked })} /></label>
          <p className="cfw-hint">Theme follows the app. Change it from the sidebar settings.</p>
        </div>
      )}
    </div>
  );
}

export default function TopBar({ id, p, solved, onSolve, url, prev, next, nav, run, busy, hasCases, cfg, setCfg, plainForced, full, toggleFull }) {
  const timer = useStudyTimer(id);
  return (
    <header className="cfw-top">
      <div className="cfw-l">
        <Link to="/cf" className="cfw-ibtn" aria-label="Back to Codeforces" title="Back to Codeforces"><Ico d={ICONS.back} /></Link>
        <div className="cfw-id">
          <span className="cfw-pid">{id}</span>
          <span className="cfw-pname" title={p.name || id}>{p.name || id}</span>
          {p.rating ? <span className={`cf-rate t-${cfTier(p.rating)}`}>{p.rating}</span> : null}
        </div>
        <div className="cfw-pn">
          <button type="button" className="cfw-ibtn" disabled={!prev} onClick={() => prev && nav(prev)} aria-label="Previous problem" title={prev ? `Previous: ${prev}` : 'No previous problem'}><Ico d={ICONS.prev} /></button>
          <button type="button" className="cfw-ibtn" disabled={!next} onClick={() => next && nav(next)} aria-label="Next problem" title={next ? `Next: ${next}` : 'No next problem'}><Ico d={ICONS.next} /></button>
        </div>
      </div>
      <div className="cfw-c">
        <button type="button" className="cfw-btn" disabled={!!busy || !hasCases} onClick={() => run('active')} title={`Run the selected case (${MOD}+')`}>
          {busy === 'active' ? <span className="cfw-spin" /> : <Ico d={ICONS.play} s={14} />}Run
        </button>
        <button type="button" className="cfw-btn primary" disabled={!!busy || !hasCases} onClick={() => run('all')} title={`Run all cases (${MOD}+Enter)`}>
          {busy === 'all' ? <span className="cfw-spin" /> : <Ico d={ICONS.playAll} s={14} />}Run all
        </button>
        <button type="button" className={`cfw-btn solve ${solved ? 'on' : ''}`} aria-pressed={solved} onClick={onSolve} title={solved ? 'Marked solved. Click to undo.' : 'Mark this problem solved'}>
          <Ico d={ICONS.check} s={15} />{solved ? 'Solved' : 'Mark solved'}
        </button>
      </div>
      <div className="cfw-r">
        <div className={`cfw-timer ${timer.running ? 'run' : ''}`}>
          <button type="button" className="cfw-tbtn" onClick={timer.toggle} aria-label={timer.running ? 'Pause study timer' : 'Start study timer'} title={timer.running ? 'Pause timer' : 'Start study timer'}>
            <Ico d={timer.running ? ICONS.pause : ICONS.clock} s={15} /><span className="t">{fmt(timer.elapsed)}</span>
          </button>
          {timer.elapsed > 0 && !timer.running && <button type="button" className="cfw-tx" onClick={timer.reset} aria-label="Reset timer" title="Reset timer"><Ico d={ICONS.close} s={12} /></button>}
        </div>
        <Settings cfg={cfg} set={setCfg} plainForced={plainForced} />
        <button type="button" className="cfw-ibtn" onClick={toggleFull} aria-pressed={full} aria-label={full ? 'Exit full screen' : 'Full screen'} title={full ? 'Exit full screen' : 'Full screen'}><Ico d={full ? ICONS.exitfull : ICONS.full} /></button>
        <a className="cfw-btn ext" href={url} target="_blank" rel="noopener noreferrer" title="Open the submit page on Codeforces">Submit<Ico d={ICONS.ext} s={13} /></a>
      </div>
    </header>
  );
}
