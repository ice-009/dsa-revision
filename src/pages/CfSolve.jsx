// Codeforces solve workspace: a full-window IDE (LeetCode style) on desktop, tabs on phones.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, addCfProblem, setCfCode, setCfCases, setCfStatus, applyTheme } from '../lib/store';
import { CF_BY_ID, CF_LADDERS } from '../data/cf';
import { toast } from '../lib/toast';
import Toaster from '../components/Toaster';
import { isCfLang, cfTemplate } from '../lib/cftemplates';
import { CF_ID, fetchCfProblem, runCode, parseLimits, verdictOf } from '../lib/cfrun';
import TopBar, { MOD } from '../components/cf/TopBar.jsx';
import Statement from '../components/cf/Statement.jsx';
import EditorPane from '../components/cf/EditorPane.jsx';
import Console from '../components/cf/Console.jsx';
import { Divider, clamp, lsGet, lsSet, useMedia, usePersisted } from '../components/cf/shared.jsx';
import '../styles/cf.css';
import '../styles/cf-solve.css';

const fallbackUrl = id => { const m = /^(\d+)([A-Z]\d?)$/.exec(id); return m ? `https://codeforces.com/problemset/problem/${m[1]}/${m[2]}` : 'https://codeforces.com/'; };

export default function CfSolve() {
  const { id } = useParams();
  return <Solve key={id} id={id} />;
}

function useSettings() {
  const [cfg, setCfgState] = useState(() => ({
    fs: clamp(+lsGet('cfs-fs', 17) || 17, 12, 30),
    tab: lsGet('cfs-tab', '4') === '2' ? 2 : 4,
    plain: lsGet('cfs-plain', '0') === '1',
  }));
  const setCfg = patch => setCfgState(c => {
    const n = { ...c, ...patch };
    if (patch.fs != null) lsSet('cfs-fs', n.fs);
    if (patch.tab != null) lsSet('cfs-tab', n.tab);
    if (patch.plain != null) lsSet('cfs-plain', n.plain ? '1' : '0');
    return n;
  });
  return [cfg, setCfg];
}

function Solve({ id }) {
  const S = useApp();
  const nav = useNavigate();
  const wide = useMedia('(min-width: 900px)');
  const touch = useMedia('(pointer: coarse)');
  const [pane, setPane] = useState('problem');
  const [attempt, setAttempt] = useState(0);
  const [load, setLoad] = useState({ busy: false, error: '' });
  const [cfg, setCfg] = useSettings();
  useEffect(() => { applyTheme(); }, [S.theme]);

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
  const samples = useMemo(() => (cached ? (cached.samples || []) : []), [cached]);
  const solved = S.cf[id] === 'solved';
  const toggleSolved = () => { const was = S.cf[id] === 'solved'; setCfStatus(id, 'solved'); toast(was ? 'Marked unsolved' : 'Marked solved'); };
  const markSolved = () => { if (S.cf[id] !== 'solved') { setCfStatus(id, 'solved'); toast('Marked solved'); } };

  // prev/next within the ladder this problem belongs to (or the Mine list)
  const { prev, next } = useMemo(() => {
    const lad = CF_LADDERS.find(l => l.problems.some(x => x.id === id));
    const list = lad ? lad.problems.map(x => x.id) : Object.keys(S.cfProb || {});
    const i = list.indexOf(id);
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
  }, [id, S.cfProb]);
  const go = to => nav(`/cf/solve/${to}`);

  // ── code ──
  const [lang, setLang] = useState(() => (isCfLang(S.lang) ? S.lang : 'cpp'));
  const tpl = useMemo(() => cfTemplate(lang, p), [lang, p.id, p.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const saved0 = S.cfCode[id]?.[lang];
  const [code, setCodeState] = useState(() => saved0 ?? tpl);
  const [codeSaved, setCodeSaved] = useState(true);
  const codeRef = useRef(code); codeRef.current = code;
  const langRef = useRef(lang); langRef.current = lang;
  const timer = useRef(0);
  const flush = useCallback(() => {
    if (!timer.current) return;
    clearTimeout(timer.current); timer.current = 0;
    setCfCode(id, langRef.current, codeRef.current);
    setCodeSaved(true);
  }, [id]);
  useEffect(() => () => flush(), [flush]);
  const edit = v => {
    setCodeState(v); codeRef.current = v; setCodeSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 600);
  };
  const pickLang = l => {
    if (l === lang) return;
    flush();
    langRef.current = l; setLang(l);
    const nx = S.cfCode[id]?.[l] ?? cfTemplate(l, p);
    setCodeState(nx); codeRef.current = nx;
  };
  const reset = () => {
    if (!window.confirm('Replace your code with the starter template? This cannot be undone.')) return;
    clearTimeout(timer.current); timer.current = 0;
    const t = cfTemplate(lang, p);
    setCodeState(t); codeRef.current = t; setCfCode(id, lang, t); setCodeSaved(true);
  };

  // ── layout state ──
  const [split, setSplit] = usePersisted('cfs-split', 45, 25, 75);
  const [conH, setConH] = usePersisted('cfs-con-h', 32, 12, 80);
  const [conOpen, setConOpen] = useState(() => lsGet('cfs-con-open', '1') !== '0');
  const setOpen = o => { setConOpen(o); lsSet('cfs-con-open', o ? '1' : '0'); };
  const [conTab, setConTab] = useState('case');

  // ── cases (sample edits are in-memory copies; the fetched sample is never touched) ──
  const custom = S.cfCases[id] || [];
  const [sEdit, setSEdit] = useState({});
  const cases = useMemo(() => [
    ...samples.map((s, i) => ({ key: `s${i}`, label: `Sample ${i + 1}`, in: sEdit[`s${i}`]?.in ?? s.in, out: sEdit[`s${i}`]?.out ?? s.out, sample: true })),
    ...custom.map((c, i) => ({ key: `c${i}`, label: `Custom ${i + 1}`, in: c.in || '', out: c.out || '', sample: false, i })),
  ], [samples, custom, sEdit]);
  const casesRef = useRef(cases); casesRef.current = cases;
  const [active, setActive] = useState('s0');
  const activeKey = cases.some(c => c.key === active) ? active : cases[0]?.key;
  const activeRef = useRef(activeKey); activeRef.current = activeKey;

  const editCase = (key, patch) => {
    if (key[0] === 's') setSEdit(m => ({ ...m, [key]: { ...(m[key] || {}), ...patch } }));
    else { const i = +key.slice(1); setCfCases(id, custom.map((c, j) => (j === i ? { ...c, ...patch } : c))); }
  };
  const addCase = () => {
    setCfCases(id, [...custom, { in: '', out: '' }]);
    setActive(`c${custom.length}`); setConTab('case'); setOpen(true);
  };

  // ── running ──
  const [res, setRes] = useState({});
  const [ran, setRan] = useState(null);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState('');
  const sig = `${lang}\0${code}`;
  const stale = ran !== null && ran !== sig;
  const delCase = key => {
    const i = +key.slice(1);
    setCfCases(id, custom.filter((_, j) => j !== i));
    setRes(r => { const n = { ...r }; for (const k of Object.keys(n)) if (k[0] === 'c') delete n[k]; return n; });
    setActive(cases[0]?.key || 's0');
  };

  const run = useCallback(async which => {
    const list = casesRef.current.filter(c => which === 'all' || c.key === activeRef.current);
    if (!list.length) { toast('Add a test case first'); setConTab('case'); return; }
    flush();
    const source = codeRef.current, l = langRef.current;
    setBusy(which); setErr('');
    try {
      const out = await runCode({ lang: l, source, tests: list, ...parseLimits(p) });
      setRes(prev => {
        const base = ran === `${l}\0${source}` ? prev : {};
        const nx = { ...base };
        list.forEach((c, i) => { nx[c.key] = { verdict: verdictOf(out[i], c.out), r: out[i], exp: c.out }; });
        return nx;
      });
      setRan(`${l}\0${source}`);
    } catch (e) { setErr(e.message); }
    setBusy(null);
    setConTab('result'); setOpen(true); setPane('console');
  }, [flush, p, ran]); // eslint-disable-line react-hooks/exhaustive-deps
  const runRef = useRef(run); runRef.current = run;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const f = e => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || busyRef.current) return;
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); runRef.current('all'); }
      else if (e.key === "'" && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); runRef.current('active'); }
    };
    window.addEventListener('keydown', f, true);
    return () => window.removeEventListener('keydown', f, true);
  }, []);

  const samplesDone = samples.length > 0 && samples.every((_, i) => res[`s${i}`]?.verdict === 'AC') && !stale;

  // ── window ──
  const bodyRef = useRef(null), rightRef = useRef(null);
  const [full, setFull] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => toast('Full screen is not available here'));
    else toast('Full screen is not available here');
  };

  const statement = <Statement id={id} p={p} load={load} cached={!!cached} retry={() => setAttempt(a => a + 1)} url={url} />;
  const editor = (
    <EditorPane lang={lang} pickLang={pickLang} code={code} edit={edit} reset={reset} saved={codeSaved} cfg={cfg}
      usePlain={touch || !wide || cfg.plain} runHint={wide ? `${MOD}+' run · ${MOD}+Enter run all` : ''} />
  );
  const consoleProps = { cases, active: activeKey, setActive, editCase, addCase, delCase, res, stale, busy, err, tab: conTab, setTab: setConTab,
    onSolve: markSolved, solved, url, code, samplesDone };
  const topProps = { id, p, solved, onSolve: toggleSolved, url, prev, next, nav: go, run, busy, hasCases: cases.length > 0, cfg, setCfg, plainForced: touch, full, toggleFull };

  if (wide) {
    return (
      <div className="cfw">
        <TopBar {...topProps} />
        <div className="cfw-body" ref={bodyRef}>
          <section className="cfw-left" style={{ flexBasis: `${split}%` }} aria-label="Problem">{statement}</section>
          <Divider axis="x" value={split} min={25} max={75} onChange={setSplit} onReset={() => setSplit(45)} containerRef={bodyRef}
            calc={(r, e) => ((e.clientX - r.left) / r.width) * 100} label="Resize problem and code panes" />
          <section className="cfw-right" ref={rightRef} aria-label="Code and console">
            <div className="cfw-ed">{editor}</div>
            {conOpen && <Divider axis="y" value={conH} min={12} max={80} onChange={setConH} onReset={() => setConH(32)} containerRef={rightRef}
              calc={(r, e) => ((r.bottom - e.clientY) / r.height) * 100} label="Resize editor and console" />}
            <div className="cfw-con" style={{ flexBasis: conOpen ? `${conH}%` : 'auto' }}>
              <Console {...consoleProps} open={conOpen} onToggle={() => setOpen(!conOpen)} />
            </div>
          </section>
        </div>
        <Toaster />
      </div>
    );
  }

  const PANES = [['problem', 'Problem'], ['code', 'Code'], ['console', 'Console']];
  const onKey = e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const k = PANES.findIndex(([v]) => v === pane), j = (k + (e.key === 'ArrowRight' ? 1 : PANES.length - 1)) % PANES.length;
    setPane(PANES[j][0]); setTimeout(() => document.getElementById(`cfm-tab-${PANES[j][0]}`)?.focus(), 0);
  };
  return (
    <div className="cfw cfw-m">
      <TopBar {...topProps} />
      <div className="cfm-tabs" role="tablist" aria-label="Sections" onKeyDown={onKey}>
        {PANES.map(([v, l]) => (
          <button key={v} type="button" role="tab" id={`cfm-tab-${v}`} aria-selected={pane === v} tabIndex={pane === v ? 0 : -1} className={pane === v ? 'on' : ''} onClick={() => setPane(v)}>{l}</button>
        ))}
      </div>
      <div className="cfm-pane" hidden={pane !== 'problem'}>{statement}</div>
      <div className="cfm-pane cfm-code" hidden={pane !== 'code'}>
        {editor}
        <div className="cfm-run">
          <button type="button" className="btn primary" disabled={!!busy} onClick={() => run('all')}>{busy ? 'Running…' : 'Run all'}</button>
          <button type="button" className="btn" onClick={() => setPane('console')}>Console</button>
        </div>
      </div>
      <div className="cfm-pane" hidden={pane !== 'console'}><Console {...consoleProps} /></div>
      <Toaster />
    </div>
  );
}
