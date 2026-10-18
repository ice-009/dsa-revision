// Bottom console of the Codeforces workspace: Testcase | Result.
import { useEffect, useState } from 'react';
import { normLines, firstDiffLine } from '../../lib/cfrun';
import { copyText, Ico, ICONS } from './shared.jsx';

const VCLASS = { AC: 'ok', OK: 'info', WA: 'bad', TLE: 'warn', MLE: 'warn', RE: 'bad', CE: 'bad', ERR: 'bad' };
const VNAME = { AC: 'Accepted', OK: 'Finished', WA: 'Wrong Answer', TLE: 'Time Limit Exceeded', MLE: 'Memory Limit Exceeded', RE: 'Runtime Error', CE: 'Compile Error', ERR: 'Runner Error' };
const RANK = ['CE', 'RE', 'TLE', 'MLE', 'ERR', 'WA', 'OK', 'AC'];

const MAXL = 300;
function Diff({ exp, got }) {
  const a = normLines(exp), b = normLines(got), d = firstDiffLine(exp, got);
  const n = Math.min(Math.max(a.length, b.length), MAXL);
  const col = (lines, title) => (
    <div className="cfs-dcol">
      <div className="cfs-k">{title}</div>
      <pre className="cfs-pre cfs-diff">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`cfs-dl ${i === d ? 'first' : ''}`}><i>{i + 1}</i>{lines[i] ?? ''}{'\n'}</span>
        ))}
        {!lines.length && '(empty)'}
      </pre>
    </div>
  );
  return (
    <div>
      {d >= 0 && <p className="cfs-dnote">First difference on line {d + 1}.</p>}
      <div className="cfs-dgrid">{col(a, 'Expected')}{col(b, 'Got')}</div>
      {Math.max(a.length, b.length) > MAXL && <p className="small muted">Showing the first {MAXL} lines.</p>}
    </div>
  );
}

function CaseDetail({ c, r }) {
  const { r: x, exp, verdict } = r;
  const hasExp = exp != null && String(exp).trim() !== '';
  return (
    <div className="cfs-res">
      {x.compile && <div><div className="cfs-k">Compiler output</div><pre className="cfs-pre err">{x.compile}</pre></div>}
      <div className="cfs-io">
        <div><div className="cfs-k">Input</div><pre className="cfs-pre">{c.in || '(empty)'}</pre></div>
        {hasExp && verdict === 'AC' && <div><div className="cfs-k">Expected</div><pre className="cfs-pre">{exp}</pre></div>}
      </div>
      {(x.status === 'ok' || x.out) && (
        hasExp && verdict !== 'AC' ? <Diff exp={exp} got={x.out} /> : <div><div className="cfs-k">Output</div><pre className="cfs-pre">{x.out || '(empty)'}</pre></div>
      )}
      {x.err && <div><div className="cfs-k">{x.status === 'ok' ? 'stderr' : 'Error'}</div><pre className="cfs-pre err">{x.err}</pre></div>}
      {(x.status === 'tle' || x.status === 'mle') && !x.err && <p className="small muted" style={{ margin: 0 }}>{x.status === 'tle' ? 'Exceeded the time limit.' : 'Exceeded the memory limit.'}</p>}
    </div>
  );
}

function ResultTab({ cases, res, stale, err, active, setActive, onSolve, solved, url, code, samplesDone, busy }) {
  const ran = cases.filter(c => res[c.key]);
  const [sel, setSel] = useState(active);
  useEffect(() => { setSel(active); }, [active]);
  if (err) return <div className="cfs-err" role="alert"><p>{err}</p></div>;
  if (!ran.length) return <div className="cfw-empty">{busy ? 'Running…' : <>Run your code to see the verdict here.<br /><span className="muted">Ctrl/Cmd + ' runs the selected case, Ctrl/Cmd + Enter runs all cases.</span></>}</div>;
  const worst = ran.map(c => res[c.key].verdict).sort((a, b) => RANK.indexOf(a) - RANK.indexOf(b))[0];
  const times = ran.map(c => res[c.key].r.timeMs).filter(t => t != null), mems = ran.map(c => res[c.key].r.memKb).filter(Boolean);
  const failedIdx = ran.findIndex(c => ['WA', 'RE', 'TLE', 'MLE', 'CE', 'ERR'].includes(res[c.key].verdict));
  const cur = ran.find(c => c.key === sel) || ran[failedIdx >= 0 ? failedIdx : 0];
  const passed = ran.filter(c => res[c.key].verdict === 'AC' || res[c.key].verdict === 'OK').length;
  return (
    <div className={`cfw-result ${stale ? 'stale' : ''}`} aria-live="polite">
      <div className="cfw-vhead">
        <h3 className={`cfw-verdict ${VCLASS[worst]}`}>{VNAME[worst]}</h3>
        <span className="cfw-vstats">
          {times.length > 0 && <span>Runtime <b>{Math.round(Math.max(...times))} ms</b></span>}
          {mems.length > 0 && <span>Memory <b>{(Math.max(...mems) / 1024).toFixed(1)} MB</b></span>}
          <span>{passed}/{ran.length} cases</span>
        </span>
        {stale && <span className="cfw-stale">Code changed since this run</span>}
      </div>
      {samplesDone && (
        <div className="cfs-win" role="status">
          <b>All samples passed</b>
          <div className="row" style={{ gap: 8 }}>
            {solved ? <span className="cfs-solved">Solved ✓</span> : <button type="button" className="btn small primary" onClick={onSolve}>Mark solved</button>}
            <a className="btn small" href={url} target="_blank" rel="noopener noreferrer">Submit on Codeforces ↗</a>
            <button type="button" className="btn small ghost" onClick={() => copyText(code, 'Code copied')}>Copy code</button>
          </div>
        </div>
      )}
      <div className="cfw-chips" role="tablist" aria-label="Case results">
        {ran.map(c => {
          const v = res[c.key].verdict;
          return <button key={c.key} type="button" role="tab" aria-selected={cur.key === c.key} className={`cfw-chip r-${VCLASS[v]} ${cur.key === c.key ? 'on' : ''}`} onClick={() => { setSel(c.key); setActive(c.key); }}>
            <span className="dot" />{c.label}<small>{v === 'OK' ? 'Ran' : v}</small></button>;
        })}
      </div>
      <CaseDetail c={cur} r={res[cur.key]} />
    </div>
  );
}

function CaseTab({ cases, active, setActive, editCase, addCase, delCase }) {
  const c = cases.find(x => x.key === active) || cases[0];
  return (
    <div className="cfw-cases">
      <div className="cfw-chips" role="tablist" aria-label="Test cases">
        {cases.map(x => (
          <button key={x.key} type="button" role="tab" aria-selected={c?.key === x.key} className={`cfw-chip ${c?.key === x.key ? 'on' : ''}`} onClick={() => setActive(x.key)}>{x.label}</button>
        ))}
        <button type="button" className="cfw-chip add" onClick={addCase} aria-label="Add custom case" title="Add custom case">+</button>
      </div>
      {!c ? <p className="muted small">No test cases yet. Press + to add one.</p> : (
        <div className="cfs-io">
          <label className="cfs-f"><span>Input</span>
            <textarea className="cfs-cta" value={c.in} onChange={e => editCase(c.key, { in: e.target.value })} spellCheck={false} autoCapitalize="off" autoCorrect="off" /></label>
          <label className="cfs-f"><span>Expected output {c.sample ? <i>(editable copy)</i> : <i>(optional)</i>}</span>
            <textarea className="cfs-cta" value={c.out} onChange={e => editCase(c.key, { out: e.target.value })} spellCheck={false} autoCapitalize="off" autoCorrect="off" /></label>
        </div>
      )}
      {c && !c.sample && <div><button type="button" className="cfw-lnk danger" onClick={() => delCase(c.key)}>Delete {c.label}</button></div>}
    </div>
  );
}

export default function Console(props) {
  const { tab, setTab, open, onToggle, busy, res, cases } = props;
  const ran = cases.filter(c => res[c.key]);
  const worst = ran.length ? ran.map(c => res[c.key].verdict).sort((a, b) => RANK.indexOf(a) - RANK.indexOf(b))[0] : null;
  const TABS = [['case', 'Testcase'], ['result', 'Result']];
  const onKey = e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    setTab(tab === 'case' ? 'result' : 'case');
  };
  return (
    <div className="cfw-console">
      <div className="cfw-chead" onClick={onToggle ? e => { if (e.target === e.currentTarget) onToggle(); } : undefined}>
        <div className="cfw-ctabs" role="tablist" aria-label="Console" onKeyDown={onKey}>
          {TABS.map(([v, l]) => (
            <button key={v} type="button" role="tab" aria-selected={tab === v} tabIndex={tab === v ? 0 : -1} className={tab === v ? 'on' : ''}
              onClick={() => { setTab(v); if (onToggle && !open) onToggle(); }}>
              {l}{v === 'result' && worst && <span className={`pip ${VCLASS[worst]}`} aria-hidden="true" />}{v === 'result' && busy && <span className="cfw-spin sm" aria-hidden="true" />}
            </button>
          ))}
        </div>
        {onToggle && (
          <button type="button" className="cfw-ibtn collapse" onClick={onToggle} aria-expanded={open} aria-label={open ? 'Collapse console' : 'Expand console'} title={open ? 'Collapse console' : 'Expand console'}>
            <span style={{ display: 'inline-flex', transform: open ? 'none' : 'rotate(180deg)' }}><Ico d={ICONS.chev} s={16} /></span>
          </button>
        )}
      </div>
      {(!onToggle || open) && (
        <div className="cfw-cbody">
          {tab === 'case' ? <CaseTab {...props} /> : <ResultTab {...props} />}
        </div>
      )}
    </div>
  );
}
