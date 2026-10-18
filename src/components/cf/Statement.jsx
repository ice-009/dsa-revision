// Left pane of the Codeforces workspace: Description | Samples | Notes.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { renderMath } from '../../lib/cfrun';
import { copyText, lsGet, lsSet } from './shared.jsx';

function useMath(html) {
  const [out, setOut] = useState(() => (html && html.includes('$$$') ? '' : html || ''));
  useEffect(() => {
    let live = true;
    if (!html) { setOut(''); return; }
    if (!html.includes('$$$')) { setOut(html); return; }
    renderMath(html).then(h => { if (live) setOut(h); });
    return () => { live = false; };
  }, [html]);
  return out;
}
function Section({ title, html }) {
  const out = useMath(html);
  if (!html) return null;
  return (
    <section className="cfs-sec">
      <h2>{title}</h2>
      <div className="cfs-html" dangerouslySetInnerHTML={{ __html: out || '<span class="muted">…</span>' }} />
    </section>
  );
}
function SampleBlock({ label, text }) {
  return (
    <div className="cfs-sb">
      <div className="cfs-sbh"><span>{label}</span>
        <button type="button" className="cfw-lnk" onClick={() => copyText(text, `${label} copied`)} aria-label={`Copy ${label}`}>Copy</button></div>
      <pre>{text}</pre>
    </div>
  );
}

function Notes({ id }) {
  const key = `cfs-notes-${id}`;
  const [v, setV] = useState(() => lsGet(key, ''));
  return (
    <div className="cfs-notes">
      <textarea value={v} onChange={e => { setV(e.target.value); lsSet(key, e.target.value); }} placeholder="Your notes for this problem: ideas, pitfalls, the approach that worked. Saved on this device."
        aria-label="Notes" spellCheck />
    </div>
  );
}

const TABS = [['desc', 'Description'], ['samples', 'Samples'], ['notes', 'Notes']];

export default function Statement({ id, p, load, cached, retry, url }) {
  const [tab, setTab] = useState('desc');
  const onKey = e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const k = TABS.findIndex(([v]) => v === tab), j = (k + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[j][0]); setTimeout(() => document.getElementById(`cfw-st-${TABS[j][0]}`)?.focus(), 0);
  };
  return (
    <div className="cfw-stmt">
      <div className="cfw-tabs" role="tablist" aria-label="Problem sections" onKeyDown={onKey}>
        {TABS.map(([v, l]) => (
          <button key={v} type="button" role="tab" id={`cfw-st-${v}`} aria-selected={tab === v} tabIndex={tab === v ? 0 : -1} className={tab === v ? 'on' : ''} onClick={() => setTab(v)}>
            {l}{v === 'samples' && p.samples?.length ? <i>{p.samples.length}</i> : null}
          </button>
        ))}
      </div>
      <div className="cfw-scroll" role="tabpanel" aria-labelledby={`cfw-st-${tab}`}>
        {tab === 'desc' && (
          <div className="cfs-stmt">
            <h1 className="cfw-ptitle">{p.name || id}</h1>
            <div className="cfs-facts">
              {p.timeLimit && <span><b>Time</b> {p.timeLimit}</span>}
              {p.memoryLimit && <span><b>Memory</b> {p.memoryLimit}</span>}
              <a href={url} target="_blank" rel="noopener noreferrer">Open on Codeforces ↗</a>
            </div>
            {p.tags?.length > 0 && <div className="cf-tags">{p.tags.map(t => <span key={t} className="cf-tag">{t}</span>)}</div>}
            {!cached && load.busy && <p className="muted" role="status">Loading the statement…</p>}
            {!cached && load.error && (
              <div className="cfs-err" role="alert">
                <b>Could not load the statement.</b>
                <p>{load.error}</p>
                <div className="row" style={{ gap: 8 }}>
                  <button type="button" className="btn small primary" onClick={retry}>Try again</button>
                  <Link to="/cf/add" className="btn small">Add it manually</Link>
                  <a className="btn small ghost" href={url} target="_blank" rel="noopener noreferrer">Read on Codeforces ↗</a>
                </div>
                <p className="small muted" style={{ margin: 0 }}>You can still write code and add your own test cases.</p>
              </div>
            )}
            <Section title="" html={p.legend} />
            <Section title="Input" html={p.input} />
            <Section title="Output" html={p.output} />
            <Section title="Note" html={p.note} />
          </div>
        )}
        {tab === 'samples' && (
          <div className="cfs-stmt">
            {p.samples?.length ? p.samples.map((s, i) => (
              <div key={i} className="cfs-sample">
                <SampleBlock label={`Input ${i + 1}`} text={s.in} />
                <SampleBlock label={`Output ${i + 1}`} text={s.out} />
              </div>
            )) : <p className="muted">No samples for this problem yet. Add custom cases in the console.</p>}
          </div>
        )}
        {tab === 'notes' && <Notes id={id} />}
      </div>
    </div>
  );
}
