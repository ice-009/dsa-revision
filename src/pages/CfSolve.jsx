// Codeforces solve page: statement, editor and tests side by side (tabs on phones).
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp, addCfProblem, setCfCode, setCfCases, setCfStatus } from '../lib/store';
import { CF_BY_ID, cfTier } from '../data/cf';
import { toast } from '../lib/toast';
import { editorKeyDown } from '../components/problem/Mine.jsx';
import { CF_LANGS, MONACO_LANG, isCfLang, cfTemplate } from '../lib/cftemplates';
import { CF_ID, fetchCfProblem, renderMath, runCode, parseLimits, verdictOf, normLines, firstDiffLine } from '../lib/cfrun';
import '../styles/cf.css';
import '../styles/cf-solve.css';

const Monaco = lazy(() => import('@monaco-editor/react'));

const copyText = (txt, what = 'Copied') =>
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
    .then(() => toast(what), () => toast('Copy not available here'));

function useMedia(q) {
  const [m, set] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q), f = () => set(mq.matches);
    f(); mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return m;
}
function useDark() {
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

const fallbackUrl = id => { const m = /^(\d+)([A-Z]\d?)$/.exec(id); return m ? `https://codeforces.com/problemset/problem/${m[1]}/${m[2]}` : 'https://codeforces.com/'; };

export default function CfSolve() {
  const { id } = useParams();
  return <Solve key={id} id={id} />;
}

function Solve({ id }) {
  const S = useApp();
  const wide = useMedia('(min-width: 900px)');
  const [pane, setPane] = useState('problem');
  const [attempt, setAttempt] = useState(0);
  const [load, setLoad] = useState({ busy: false, error: '' });
  const cached = S.cfProb[id];
  const meta = CF_BY_ID[id];

  useEffect(() => {
    if (cached) return;
    if (!CF_ID.test(id)) { setLoad({ busy: false, error: `"${id}" is not a Codeforces problem id (like 1850A).` }); return; }
    const ac = new AbortController();
    setLoad({ busy: true, error: '' });
    fetchCfProblem(id, ac.signal).then(p => { addCfProblem({ ...p, id }); setLoad({ busy: false, error: '' }); },
      e => { if (e.name !== 'AbortError') setLoad({ busy: false, error: e.message }); });
    return () => ac.abort();
  }, [id, attempt, !cached]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = cached || (meta ? { ...meta, samples: [], tags: meta.tags || [] } : { id, name: id, tags: [], samples: [], url: fallbackUrl(id) });
  const url = p.url || fallbackUrl(id);
  const samples = cached ? (p.samples || []) : [];
  const solved = S.cf[id] === 'solved';

  // ── code ──
  const [lang, setLang] = useState(() => (isCfLang(S.lang) ? S.lang : 'cpp'));
  const tpl = useMemo(() => cfTemplate(lang, p), [lang, p.id, p.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const saved = S.cfCode[id]?.[lang];
  const [code, setCodeState] = useState(() => saved ?? tpl);
  const codeRef = useRef(code); codeRef.current = code;
  const langRef = useRef(lang); langRef.current = lang;
  const timer = useRef(0);
  const flush = useCallback(() => {
    if (!timer.current) return;
    clearTimeout(timer.current); timer.current = 0;
    setCfCode(id, langRef.current, codeRef.current);
  }, [id]);
  useEffect(() => () => flush(), [flush]);
  const edit = v => {
    setCodeState(v); codeRef.current = v;
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 600);
  };
  const pickLang = l => {
    if (l === lang) return;
    flush();
    langRef.current = l; setLang(l);
    const next = S.cfCode[id]?.[l] ?? cfTemplate(l, p);
    setCodeState(next); codeRef.current = next;
  };
  const reset = () => {
    if (!window.confirm('Replace your code with the starter template? This cannot be undone.')) return;
    clearTimeout(timer.current); timer.current = 0;
    const t = cfTemplate(lang, p);
    setCodeState(t); codeRef.current = t; setCfCode(id, lang, t);
  };

  // ── tests ──
  const custom = S.cfCases[id] || [];
  const cases = useMemo(() => [
    ...samples.map((s, i) => ({ key: `s${i}`, label: `Sample ${i + 1}`, in: s.in, out: s.out, sample: true })),
    ...custom.map((c, i) => ({ key: `c${i}`, label: `Custom ${i + 1}`, in: c.in || '', out: c.out || '', sample: false, i })),
  ], [samples, custom]);
  const casesRef = useRef(cases); casesRef.current = cases;
  const [res, setRes] = useState({}); // key -> { verdict, r, exp }
  const [ran, setRan] = useState(null); // `${lang}\0${code}` the results belong to
  const [busy, setBusy] = useState(null); // 'samples' | 'all' | case key
  const [err, setErr] = useState('');
  const sig = `${lang}\0${code}`;
  const stale = ran !== null && ran !== sig;

  const run = useCallback(async keys => {
    const list = casesRef.current.filter(c => keys === 'all' || (keys === 'samples' ? c.sample : c.key === keys));
    if (!list.length) { toast(keys === 'samples' ? 'This problem has no samples yet. Add a custom case.' : 'Nothing to run'); return; }
    flush();
    const source = codeRef.current, l = langRef.current;
    setBusy(keys); setErr('');
    try {
      const out = await runCode({ lang: l, source, tests: list, ...parseLimits(p) });
      setRes(prev => {
        const base = ran === `${l}\0${source}` ? prev : {};
        const next = { ...base };
        list.forEach((c, i) => { next[c.key] = { verdict: verdictOf(out[i], c.out), r: out[i], exp: c.out }; });
        return next;
      });
      setRan(`${l}\0${source}`);
    } catch (e) { setErr(e.message); }
    setBusy(null);
  }, [flush, p, ran]); // eslint-disable-line react-hooks/exhaustive-deps
  const runRef = useRef(run); runRef.current = run;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const f = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!busyRef.current) runRef.current(casesRef.current.some(c => c.sample) ? 'samples' : 'all');
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  const addCase = () => { setCfCases(id, [...custom, { in: '', out: '' }]); if (!wide) setPane('tests'); };
  const editCase = (i, patch) => setCfCases(id, custom.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const delCase = i => { setCfCases(id, custom.filter((_, j) => j !== i)); setRes(r => { const n = { ...r }; for (const k of Object.keys(n)) if (k[0] === 'c') delete n[k]; return n; }); };

  const samplesDone = samples.length > 0 && samples.every((_, i) => res[`s${i}`]?.verdict === 'AC') && !stale;

  const statement = <Statement p={p} load={load} cached={!!cached} retry={() => setAttempt(a => a + 1)} url={url} />;
  const editor = (
    <EditorPane lang={lang} pickLang={pickLang} code={code} edit={edit} reset={reset} url={url} />
  );
  const tests = (
    <TestsPane onSolve={() => { if (S.cf[id] !== 'solved') { setCfStatus(id, 'solved'); toast('Marked solved'); } }} cases={cases} res={res} stale={stale} busy={busy} err={err} run={run} addCase={addCase} editCase={editCase} delCase={delCase}
      samplesDone={samplesDone} solved={solved} url={url} code={code} hasSamples={samples.length > 0} wide={wide} />
  );

  const head = (
    <header className="cfs-head">
      <Link to="/cf" className="back">‹ Codeforces</Link>
      <div className="cfs-title">
        <h1>{p.name || id}</h1>
        <div className="cfs-meta">
          <span className="cf-id">{id}</span>
          {p.rating ? <span className={`cf-rate t-${cfTier(p.rating)}`}>{p.rating}</span> : null}
          {solved && <span className="cfs-solved">Solved ✓</span>}
        </div>
      </div>
    </header>
  );

  if (wide) {
    return (
      <div className="cfs">
        {head}
        <div className="cfs-cols">
          <section className="cfs-col card" aria-label="Problem statement">{statement}</section>
          <div className="cfs-col cfs-right" aria-label="Code and tests">{editor}{tests}</div>
        </div>
      </div>
    );
  }
  const PANES = [['problem', 'Problem'], ['code', 'Code'], ['tests', 'Tests']];
  const onKey = e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const k = PANES.findIndex(([v]) => v === pane), j = (k + (e.key === 'ArrowRight' ? 1 : PANES.length - 1)) % PANES.length;
    setPane(PANES[j][0]); setTimeout(() => document.getElementById(`cfs-tab-${PANES[j][0]}`)?.focus(), 0);
  };
  return (
    <div className="cfs">
      {head}
      <div className="cfs-tabs" role="tablist" aria-label="Sections" onKeyDown={onKey}>
        {PANES.map(([v, l]) => (
          <button key={v} type="button" role="tab" id={`cfs-tab-${v}`} aria-selected={pane === v} aria-controls={`cfs-pane-${v}`}
            tabIndex={pane === v ? 0 : -1} className={pane === v ? 'on' : ''} onClick={() => setPane(v)}>{l}</button>
        ))}
      </div>
      <section id="cfs-pane-problem" role="tabpanel" aria-labelledby="cfs-tab-problem" className="card" hidden={pane !== 'problem'}>{statement}</section>
      <section id="cfs-pane-code" role="tabpanel" aria-labelledby="cfs-tab-code" hidden={pane !== 'code'}>
        {editor}
        <div className="cfs-runbar">
          <button type="button" className="btn primary" disabled={!!busy} onClick={() => run(samples.length ? 'samples' : 'all')}>{busy ? 'Running…' : 'Run samples'}</button>
          <button type="button" className="btn" onClick={() => setPane('tests')}>See tests</button>
        </div>
      </section>
      <section id="cfs-pane-tests" role="tabpanel" aria-labelledby="cfs-tab-tests" hidden={pane !== 'tests'}>{tests}</section>
    </div>
  );
}

// ── Statement ──
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
function Statement({ p, load, cached, retry, url }) {
  return (
    <div className="cfs-stmt">
      <div className="cfs-facts small">
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
      {p.samples?.length > 0 && (
        <section className="cfs-sec">
          <h2>{p.samples.length > 1 ? 'Examples' : 'Example'}</h2>
          {p.samples.map((s, i) => (
            <div key={i} className="cfs-sample">
              <SampleBlock label={`Input ${i + 1}`} text={s.in} />
              <SampleBlock label={`Output ${i + 1}`} text={s.out} />
            </div>
          ))}
        </section>
      )}
      <Section title="Note" html={p.note} />
    </div>
  );
}
function SampleBlock({ label, text }) {
  return (
    <div className="cfs-sb">
      <div className="cfs-sbh"><span>{label}</span>
        <button type="button" className="btn small ghost" onClick={() => copyText(text, `${label} copied`)} aria-label={`Copy ${label}`}>Copy</button></div>
      <pre>{text}</pre>
    </div>
  );
}

// ── Editor ──
function EditorPane({ lang, pickLang, code, edit, reset, url }) {
  const dark = useDark();
  const small = useMedia('(max-width: 759px), (pointer: coarse)');
  const [plain, setPlain] = useState(() => { try { return localStorage.getItem('cfs-plain') === '1'; } catch (e) { return false; } });
  const togglePlain = () => setPlain(v => { try { localStorage.setItem('cfs-plain', v ? '0' : '1'); } catch (e) { /* ignore */ } return !v; });
  const usePlain = small || plain;
  const [fs, setFs] = useState(() => { try { return Math.min(30, Math.max(12, +localStorage.getItem('cfs-fs') || 18)); } catch (e) { return 18; } });
  const bump = d => setFs(v => { const n = Math.min(30, Math.max(12, v + d)); try { localStorage.setItem('cfs-fs', String(n)); } catch (e) { /* ignore */ } return n; });
  return (
    <div className="cfs-editor card" style={{ '--cfs-fs': `${fs}px` }}>
      <div className="cfs-bar">
        <div className="segmented" role="group" aria-label="Language">
          {CF_LANGS.map(([v, l]) => <button key={v} type="button" className={lang === v ? 'on' : ''} aria-pressed={lang === v} onClick={() => pickLang(v)}>{l}</button>)}
        </div>
        <span className="spacer" />
        <div className="cfs-fs" role="group" aria-label="Code size">
          <button type="button" className="btn small ghost" aria-label="Smaller code" disabled={fs <= 12} onClick={() => bump(-1)}>A−</button>
          <button type="button" className="btn small ghost" aria-label="Larger code" disabled={fs >= 30} onClick={() => bump(1)}>A+</button>
        </div>
        <button type="button" className="btn small ghost" onClick={reset}>Reset to template</button>
        <button type="button" className="btn small" onClick={() => copyText(code, 'Code copied')}>Copy code</button>
      </div>
      {usePlain ? (
        <textarea className="editor cfs-ta" value={code} onChange={e => edit(e.target.value)} onKeyDown={editorKeyDown} aria-label={`${lang} code`}
          spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" />
      ) : (
        <div className="cfs-monaco">
          <Suspense fallback={<div className="cfs-loading muted" role="status">Loading editor…</div>}>
            <Monaco height="100%" language={MONACO_LANG[lang]} path={`cf-${lang}`} theme={dark ? 'vs-dark' : 'light'} value={code}
              onChange={v => edit(v ?? '')}
              options={{ minimap: { enabled: false }, fontSize: fs, lineHeight: Math.round(fs * 1.55), tabSize: 4, scrollBeyondLastLine: false, automaticLayout: true, fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace', padding: { top: 10 } }} />
          </Suspense>
        </div>
      )}
      <div className="cfs-foot small muted">
        <span>Autosaved on this device · Ctrl/Cmd+Enter runs{usePlain ? ' · Tab indents' : ''}</span>
        {!small && <button type="button" className="linklike" onClick={togglePlain}>{plain ? 'Use Monaco' : 'Use plain editor'}</button>}
        <a href={url} target="_blank" rel="noopener noreferrer" className="cfs-sub">Codeforces ↗</a>
      </div>
    </div>
  );
}

// ── Tests ──
const VCLASS = { AC: 'ok', OK: 'info', WA: 'bad', TLE: 'warn', MLE: 'warn', RE: 'bad', CE: 'bad', ERR: 'bad' };
function Verdict({ v }) { return <span className={`cfs-v ${VCLASS[v] || 'info'}`}>{v === 'OK' ? 'Ran' : v}</span>; }

function TestsPane({ onSolve, cases, res, stale, busy, err, run, addCase, editCase, delCase, samplesDone, solved, url, code, hasSamples, wide }) {
  return (
    <div className="cfs-tests card">
      <div className="cfs-bar">
        <h2 className="cfs-h2">Tests</h2>
        <span className="spacer" />
        {hasSamples && <button type="button" className="btn small primary" disabled={!!busy} onClick={() => run('samples')}>{busy === 'samples' ? 'Running…' : 'Run samples'}</button>}
        <button type="button" className={`btn small ${hasSamples ? '' : 'primary'}`} disabled={!!busy || !cases.length} onClick={() => run('all')}>{busy === 'all' ? 'Running…' : 'Run all'}</button>
      </div>
      <div aria-live="polite">
        {err && <div className="cfs-err" role="alert"><p style={{ margin: 0 }}>{err}</p></div>}
        {samplesDone && (
          <div className="cfs-win" role="status">
            <b>All samples passed</b>
            <div className="row" style={{ gap: 8 }}>
              {solved ? <span className="cfs-solved">Solved ✓</span>
                : <button type="button" className="btn small primary" onClick={onSolve}>Mark solved</button>}
              <a className="btn small" href={url} target="_blank" rel="noopener noreferrer">Submit on Codeforces ↗</a>
              <button type="button" className="btn small ghost" onClick={() => copyText(code, 'Code copied')}>Copy code</button>
            </div>
          </div>
        )}
        {stale && Object.keys(res).length > 0 && <p className="small muted cfs-stale">Your code changed since these results. Run again.</p>}
      </div>
      {!cases.length && <p className="muted small">No test cases yet. Add one below to try your code.</p>}
      <div className="cfs-cases">
        {cases.map(c => <CaseCard key={c.key} c={c} r={res[c.key]} stale={stale} busy={busy} run={run} editCase={editCase} delCase={delCase} />)}
      </div>
      <button type="button" className="btn" onClick={addCase}>+ Add custom test</button>
    </div>
  );
}
function CaseCard({ c, r, stale, busy, run, editCase, delCase }) {
  const idx = c.i;
  return (
    <article className={`cfs-case ${r && !stale ? 'v-' + r.verdict : ''}`}>
      <div className="cfs-ch">
        <b>{c.label}</b>
        {r && <Verdict v={r.verdict} />}
        {r && <span className="small muted cfs-st">{r.r.timeMs != null ? `${Math.round(r.r.timeMs)} ms` : ''}{r.r.memKb ? ` · ${(r.r.memKb / 1024).toFixed(1)} MB` : ''}</span>}
        <span className="spacer" />
        <button type="button" className="btn small" disabled={!!busy} onClick={() => run(c.key)}>{busy === c.key ? 'Running…' : 'Run'}</button>
        {!c.sample && <button type="button" className="btn small ghost" onClick={() => delCase(idx)} aria-label={`Delete ${c.label}`}>Delete</button>}
      </div>
      {c.sample ? (
        <div className="cfs-io">
          <SampleBlock label="Input" text={c.in} />
          <SampleBlock label="Expected" text={c.out} />
        </div>
      ) : (
        <div className="cfs-io">
          <label className="cfs-f"><span>Input</span>
            <textarea className="cfs-cta" rows={4} value={c.in} onChange={e => editCase(idx, { in: e.target.value })} spellCheck={false} autoCapitalize="off" autoCorrect="off" /></label>
          <label className="cfs-f"><span>Expected output <i>(optional)</i></span>
            <textarea className="cfs-cta" rows={4} value={c.out} onChange={e => editCase(idx, { out: e.target.value })} spellCheck={false} autoCapitalize="off" autoCorrect="off" /></label>
        </div>
      )}
      {r && <Result r={r} stale={stale} />}
    </article>
  );
}

const MAXL = 300;
function Result({ r, stale }) {
  const { r: x, exp, verdict } = r;
  const hasExp = exp != null && String(exp).trim() !== '';
  return (
    <div className={`cfs-res ${stale ? 'stale' : ''}`}>
      {x.compile && <div><div className="cfs-k">Compiler output</div><pre className="cfs-pre err">{x.compile}</pre></div>}
      {x.status === 'ok' || x.out ? (
        hasExp && verdict !== 'AC' ? <Diff exp={exp} got={x.out} /> : (
          <div><div className="cfs-k">Output</div><pre className="cfs-pre">{x.out || '(empty)'}</pre></div>
        )
      ) : null}
      {x.err && <div><div className="cfs-k">{x.status === 'ok' ? 'stderr' : 'Error'}</div><pre className="cfs-pre err">{x.err}</pre></div>}
      {(x.status === 'tle' || x.status === 'mle') && !x.err && <p className="small muted" style={{ margin: 0 }}>{x.status === 'tle' ? 'Exceeded the time limit.' : 'Exceeded the memory limit.'}</p>}
    </div>
  );
}
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
      {d >= 0 && <p className="small cfs-dnote">First difference on line {d + 1}.</p>}
      <div className="cfs-dgrid">{col(a, 'Expected')}{col(b, 'Got')}</div>
      {Math.max(a.length, b.length) > MAXL && <p className="small muted">Showing the first {MAXL} lines.</p>}
    </div>
  );
}
