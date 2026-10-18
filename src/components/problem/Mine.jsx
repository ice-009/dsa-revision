// "Your code": write your own solution; Claude reviews it via /review-my-code.
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MyCode as MC } from '../../data';
import { useApp, useMyCode } from '../../lib/store';
import { toast } from '../../lib/toast';
import { highlight } from '../../lib/util.jsx';
import { LANGS, LANG_NAME, CodeBlock, codeFor } from './CodeBits.jsx';

function mineStatus(n, MyCode) {
  const e = MyCode.get(n), r = MyCode.review(n), st = MyCode.state;
  if (!e) return null;
  if (r && !r.stale) return <span className="ok">✓ Reviewed by Claude</span>;
  if (!MyCode.configured()) return <>Saved on this device · <Link to="/more">set up sync</Link> to get it reviewed</>;
  if (st.busy || e.dirty) return 'Saved on this device · syncing…';
  if (st.error) return `Saved on this device · ${st.error}`;
  return <>Synced · run <code>/review-my-code</code> in Claude Code</>;
}

function Review({ n, r }) {
  const a = r.approach || {};
  return (
    <div className="mine-review">
      <div className="mine-appr">
        <div className="row" style={{ gap: 8 }}><div className="lbl" style={{ margin: 0 }}>Your approach</div>
          <span className={`badge ${r.same ? 'd-Easy' : 'd-Medium'}`}>{r.same ? 'Same as the reference' : 'Different approach'}</span></div>
        {a.name && <b className="mine-name">{a.name}</b>}
        {a.summary && <p>{a.summary}</p>}
        {a.steps?.length > 0 && <ol>{a.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
        {a.cx && <div className="small"><span className="lbl">Complexity</span> <span className="cx">{a.cx}</span></div>}
      </div>
      {r.compare && <div className="mine-cmp"><div className="lbl">Compared with the reference</div>{r.compare}</div>}
      {r.notes?.length > 0 && <div><div className="lbl">Review notes</div><ul className="mine-notes">{r.notes.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
      <div><div className="row" style={{ gap: 8 }}><div className="lbl" style={{ margin: 0 }}>Your code, commented &amp; translated</div><span className="spacer" />
        {Object.entries(r.tests || {}).map(([l, t]) => (
          <span key={l} className={`verified ${t.ok ? '' : 'bad'}`} title={`${LANG_NAME[l] || l} tests`}>{LANG_NAME[l] || l} {t.ok ? '✓' : '✗'} {t.pass}/{t.total}</span>
        ))}</div>
        <CodeBlock src={`mine:${n}`} /></div>
    </div>
  );
}

// Tab indents, Enter keeps the indent (one level deeper after { ( [ or :)
export function editorKeyDown(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const ta = e.currentTarget;
  const { selectionStart: a, selectionEnd: b, value } = ta;
  const fire = () => ta.dispatchEvent(new Event('input', { bubbles: true }));
  if (e.key === 'Tab') {
    e.preventDefault();
    const lineStart = value.lastIndexOf('\n', a - 1) + 1;
    if (e.shiftKey) {
      const cut = value.slice(lineStart, lineStart + 4).match(/^ */)[0].length;
      if (cut) { ta.setRangeText('', lineStart, lineStart + cut, 'preserve'); ta.setSelectionRange(Math.max(lineStart, a - cut), Math.max(lineStart, b - cut)); }
    } else {
      ta.setRangeText('    ', a, b, 'end');
    }
    fire();
  } else if (e.key === 'Enter' && a === b) {
    const line = value.slice(value.lastIndexOf('\n', a - 1) + 1, a);
    let indent = line.match(/^\s*/)[0];
    if (/[{(\[:]\s*$/.test(line)) indent += '    ';
    if (!indent) return;
    e.preventDefault();
    ta.setRangeText('\n' + indent, a, b, 'end');
    fire();
  }
}

export default function Mine({ n }) {
  const S = useApp();
  const MyCode = useMyCode();
  const [editing, setEditing] = useState(false);
  const [lang, setLang] = useState(null);
  const ta = useRef(null);
  const timer = useRef(0);
  const e = MyCode.get(n);
  const r = MyCode.review(n);
  const curLang = lang || e?.lang || S.lang;

  const flush = () => {
    clearTimeout(timer.current);
    if (ta.current) MC.set(n, ta.current.dataset.lang, ta.current.value);
  };
  const flushRef = useRef(flush); flushRef.current = flush;
  useEffect(() => () => { if (timer.current) flushRef.current(); }, []); // save pending typing on leaving
  useEffect(() => { setEditing(false); setLang(null); }, [n]);
  useEffect(() => {
    if (editing && ta.current) { ta.current.focus(); const l = ta.current.value.length; ta.current.setSelectionRange(l, l); }
  }, [editing]);

  const head = (
    <div className="mine-h"><span>Your code</span><span className="mine-st small">{mineStatus(n, MyCode)}</span></div>
  );

  if (editing) {
    return (
      <div className="mine" id={`mine-${n}`}>
        {head}
        <div className="row" style={{ gap: 8 }}>
          <div className="segmented">{LANGS.map(([v, l]) => (
            <button key={v} type="button" className={curLang === v ? 'on' : ''} onClick={() => {
              setLang(v); if (ta.current) { ta.current.dataset.lang = v; if (ta.current.value.trim()) flush(); }
            }}>{l}</button>
          ))}</div>
          <span className="spacer" />
          <button type="button" className="btn small primary" onClick={() => {
            flush(); setEditing(false); setLang(null);
            if (MyCode.get(n)) toast(MyCode.configured() ? 'Saved — syncing to your repo' : 'Saved on this device');
          }}>Done</button>
        </div>
        <textarea ref={ta} className="editor" data-lang={curLang} defaultValue={e?.code || ''} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off"
          placeholder="Write or paste your solution…" onKeyDown={editorKeyDown}
          onInput={() => { clearTimeout(timer.current); timer.current = setTimeout(flush, 500); }} />
        <p className="small muted" style={{ margin: 0 }}>Tab indents · saved on this device as you type{MyCode.configured() ? ' and synced to your repo' : ''}.</p>
      </div>
    );
  }
  if (!e) {
    return (
      <div className="mine empty" id={`mine-${n}`}>
        <div><b>Your code</b><p className="small muted" style={{ margin: '2px 0 0' }}>Write your own solution — Claude comments it, translates it to C++, Java and JS, tests every version and explains your approach.</p></div>
        <button type="button" className="btn small primary" onClick={() => setEditing(true)}>✍️ Write your solution</button>
      </div>
    );
  }
  const copy = () => (navigator.clipboard ? navigator.clipboard.writeText(codeFor(`raw:${n}`, MyCode, S.lang)) : Promise.reject())
    .then(() => toast('Code copied'), () => toast('Copy not available here'));
  return (
    <div className="mine" id={`mine-${n}`}>
      {head}
      {r && !r.stale ? <Review n={n} r={r} /> : (
        <>
          <div className="code-wrap"><pre className="code" dangerouslySetInnerHTML={{ __html: highlight(e.code) }} /></div>
          {r && <details className="mine-old"><summary>Review of your previous version</summary><Review n={n} r={r} /></details>}
        </>
      )}
      <div className="row" style={{ gap: 8 }}>
        <button type="button" className="btn small" onClick={() => setEditing(true)}>Edit</button>
        <button type="button" className="btn small ghost" onClick={copy}>Copy what you wrote</button>
        <span className="spacer" /><span className="small muted">{LANG_NAME[e.lang] || e.lang} · {e.code.split('\n').length} lines</span>
      </div>
    </div>
  );
}
