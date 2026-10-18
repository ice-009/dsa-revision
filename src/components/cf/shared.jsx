// Small hooks and helpers shared by the Codeforces workspace.
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '../../lib/toast';

export const copyText = (txt, what = 'Copied') =>
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
    .then(() => toast(what), () => toast('Copy not available here'));

export const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
export const lsSet = (k, v) => { try { localStorage.setItem(k, String(v)); } catch (e) { /* ignore */ } };
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function useMedia(q) {
  const [m, set] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q), f = () => set(mq.matches);
    f(); mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return m;
}

export function useDark() {
  const get = () => {
    const t = document.documentElement.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [d, set] = useState(get);
  useEffect(() => {
    const f = () => set(get());
    const mo = new MutationObserver(f); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change', f);
    return () => { mo.disconnect(); mq.removeEventListener('change', f); };
  }, []);
  return d;
}

/** A persisted number (percent) in localStorage. */
export function usePersisted(key, def, lo, hi) {
  const [v, set] = useState(() => clamp(+lsGet(key, def) || def, lo, hi));
  const put = useCallback(n => { const c = clamp(n, lo, hi); set(c); lsSet(key, Math.round(c * 10) / 10); }, [key, lo, hi]);
  return [v, put];
}

/**
 * Draggable divider. axis 'x' resizes by the container width, 'y' by its height.
 * `onChange(pct)` receives the new percentage (0-100) of the first/second pane as computed by `calc(rect, e)`.
 */
export function Divider({ axis, value, min, max, onChange, calc, onReset, label, containerRef }) {
  const drag = useRef(false);
  const move = e => {
    if (!drag.current || !containerRef.current) return;
    onChange(calc(containerRef.current.getBoundingClientRect(), e));
  };
  const step = axis === 'x' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
  const onKey = e => {
    const dir = e.key === step[0] ? -1 : e.key === step[1] ? 1 : 0;
    if (e.key === 'Home') { e.preventDefault(); onChange(min); return; }
    if (e.key === 'End') { e.preventDefault(); onChange(max); return; }
    if (!dir) return;
    e.preventDefault();
    // x: value grows rightwards. y: value is the console height, which grows upwards.
    onChange(value + (axis === 'x' ? dir : -dir) * (e.shiftKey ? 10 : 2));
  };
  return (
    <div className={`cfw-div cfw-div-${axis}`} role="separator" tabIndex={0} aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)}
      onPointerDown={e => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); document.body.classList.add('cfw-dragging'); }}
      onPointerMove={move}
      onPointerUp={e => { drag.current = false; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (x) { /* ignore */ } document.body.classList.remove('cfw-dragging'); }}
      onPointerCancel={() => { drag.current = false; document.body.classList.remove('cfw-dragging'); }}
      onDoubleClick={onReset} onKeyDown={onKey} />
  );
}

export const Ico = ({ d, s = 18 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
export const ICONS = {
  back: <path d="M15 5l-7 7 7 7" />,
  prev: <path d="M15 5l-7 7 7 7" />,
  next: <path d="M9 5l7 7-7 7" />,
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" />,
  playAll: <><path d="M3 5v14l9-7z" fill="currentColor" /><path d="M12 5v14l9-7z" fill="currentColor" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  gear: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  full: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  exitfull: <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />,
  reset: <><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  chev: <path d="M6 9l6 6 6-6" />,
  ext: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></>,
  clock: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9v4l2.5 1.5M9.5 2.5h5" /></>,
  pause: <path d="M8 5v14M16 5v14" strokeWidth="3" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};
