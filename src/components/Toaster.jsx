import { useEffect, useRef, useState } from 'react';
import { onToast } from '../lib/toast';

export default function Toaster() {
  const [t, setT] = useState(null);
  const [show, setShow] = useState(false);
  const timer = useRef();
  useEffect(() => onToast(next => {
    setT(next); setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), next.action ? 8000 : 2400);
  }), []);
  return (
    <div className={`toast${show ? ' show' : ''}`} id="toast" role="status" aria-live="polite">
      {t && <><span>{t.msg}</span>{t.action && <button type="button" onClick={() => { t.action.run(); setShow(false); }}>{t.action.label}</button>}</>}
    </div>
  );
}
