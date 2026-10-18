import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { PROBLEMS, TOPICS } from '../data';
import { S, useApp, useMyCode, set, save, seeded, KEY, applyTheme, exportBackup, importBackup } from '../lib/store';
import { schedule, paceText, setPlanEnd } from '../lib/plan';
import { today } from '../lib/dates';
import { toast } from '../lib/toast';
import { useInstall } from '../lib/install';

const Seg = ({ options, value, onPick }) => (
  <div className="segmented">{options.map(([v, l]) =>
    <button key={String(v)} type="button" className={value === v ? 'on' : ''} onClick={() => onPick(v)}>{l}</button>)}</div>
);

function SyncCard() {
  const MyCode = useMyCode();
  const st = MyCode.state;
  const mine = PROBLEMS.filter(p => MyCode.get(p.n));
  const reviewed = mine.filter(p => { const r = MyCode.review(p.n); return r && !r.stale; }).length;
  return (
    <div className="setting"><div><b>{st.busy ? 'Syncing…' : st.error ? 'Sync problem' : st.last ? '✓ Synced' : 'Not synced yet'}</b>
      <p>{st.error ? st.error : `Every device that opens this app shares one progress — solved marks, reviews, streak, quiz scores, mocks and your code. ${mine.length} solution${mine.length === 1 ? '' : 's'} of yours · ${reviewed} reviewed by Claude${st.last ? ` · last sync ${new Date(st.last).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` : ''}`}</p></div>
      <button type="button" className="btn small" disabled={!!st.busy} onClick={() => MyCode.sync()}>Sync now</button></div>
  );
}

function Hint({ parts }) {
  return parts.map(([t, b], i) => (b ? <b key={i}>{t}</b> : <span key={i}>{t}</span>));
}

export default function More() {
  useApp();
  const inst = useInstall();
  const MyCode = useMyCode();
  const [cached, setCached] = useState('Checking offline cache…');
  const file = useRef();
  useEffect(() => {
    if (!('caches' in window)) { setCached(''); return; }
    caches.keys().then(keys => setCached(keys.some(k => k.startsWith('dsa-revise')) ? '✓ Saved for offline use on this device.' : 'Not cached yet — reload once while online.'));
  }, []);
  const sched = schedule();
  const reviewedTotal = Object.values(S.days).reduce((a, d) => a + (d.reviewed || 0), 0);

  const doImport = async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const k = importBackup(await f.text());
      toast(k ? `Backup imported, with ${k} solution${k === 1 ? '' : 's'} of yours` : 'Backup imported');
    } catch (err) { toast('That file is not a DSA Revise backup'); }
  };
  const reset = () => {
    if (!confirm('Reset all progress on this device? Export a backup first if you might want it back.')) return;
    try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
    for (const k of Object.keys(S)) delete S[k];
    Object.assign(S, seeded());
    save(); applyTheme(); toast('Progress reset');
  };

  return (
    <>
      <h1>More</h1>
      <p className="sub">Settings, backup and install help.</p>
      <div className="card">
        <div className="setting"><div><b>Finish the sheet by</b><p>Unsolved problems are spread evenly up to this date — {paceText(sched)} a day right now. <Link to="/plan">See the plan →</Link></p></div>
          <input type="date" id="plan-end" className="plan-date" min={today()} value={sched.end} onChange={e => setPlanEnd(e.target.value)} /></div>
        <div className="setting"><div><b>New cards per day</b><p>Unseen problems added to today’s review.</p></div>
          <Seg options={[5, 8, 12, 20].map(v => [v, v])} value={S.newPerDay} onPick={v => set({ newPerDay: v })} /></div>
        <div className="setting"><div><b>Target recall</b><p>FSRS schedules each card for when your recall would drop to this. Higher = more reviews, stronger memory.</p></div>
          <Seg options={[0.85, 0.9, 0.95].map(v => [v, `${Math.round(v * 100)}%`])} value={S.retention} onPick={v => set({ retention: v })} /></div>
        <div className="setting"><div><b>Code language</b><p>Used for every solution and pattern template.</p></div>
          <div className="segmented lang-tabs" role="tablist">{[['cpp', 'C++'], ['java', 'Java'], ['js', 'JS']].map(([v, l]) =>
            <button key={v} type="button" className={S.lang === v ? 'on' : ''} onClick={() => set({ lang: v })}>{l}</button>)}</div></div>
        <div className="setting"><div><b>Appearance</b><p>Follows the device setting by default.</p></div>
          <Seg options={['auto', 'light', 'dark'].map(v => [v, v[0].toUpperCase() + v.slice(1)])} value={S.theme} onPick={v => { set({ theme: v }); applyTheme(); }} /></div>
        <div className="setting"><div><b>Backup</b><p>{MyCode.configured() ? 'Progress syncs to your repo; a JSON backup is a handy extra copy.' : 'Progress lives on this device only — set up sync below, or export a JSON backup now and then.'}</p></div>
          <div className="row"><button type="button" className="btn small" onClick={exportBackup}>Export</button>
            <label className="btn small" style={{ margin: 0 }}>Import<input ref={file} type="file" accept="application/json,.json" hidden onChange={doImport} /></label></div></div>
        <div className="setting"><div><b>Reset progress</b><p>Clears statuses, review history and streak (your code is kept). Re-seeds from the sheet.</p></div>
          <button type="button" className="btn small" style={{ color: 'var(--hard)' }} onClick={reset}>Reset</button></div>
      </div>

      <h2 id="sync">Sync across devices</h2>
      <div className="card" id="sync-card"><SyncCard /></div>

      <h2>Stats</h2>
      <div className="stats">
        <div className="card stat"><b>{Object.keys(S.srs).length}</b><span>cards seen</span></div>
        <div className="card stat"><b>{reviewedTotal}</b><span>total reviews</span></div>
        <div className="card stat"><b>{PROBLEMS.filter(p => (S.srs[p.n]?.s || 0) >= 21).length}</b><span>long-term (stability 3w+)</span></div>
      </div>

      <h2>Get the app</h2>
      <div className="card get-app">
        <div className="setting"><div><b>{inst.standalone ? '✓ Installed' : 'Install from the browser'}</b>
          <p>{inst.standalone ? 'You’re using the installed app.' : <Hint parts={inst.hint} />}</p></div>
          {!inst.standalone && inst.canInstall && <button type="button" className="btn small primary" onClick={inst.install}>Install app</button>}</div>
        <div className="setting"><div><b>Android app (APK)</b>
          <p>Allow <b>Install unknown apps</b> for Chrome the first time.</p></div>
          <a className="btn small primary" href="./downloads/dsa-revise.apk" download="dsa-revise.apk" data-apk>Download for Android (APK)</a></div>
        <div className="setting"><div><b>iPhone / iPad</b>
          <ol style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: 14, color: 'var(--ink-2)' }}>
            <li>Open this page in <b>Safari</b>.</li>
            <li>Tap the <b>Share</b> button → <b>Add to Home Screen</b> → <b>Add</b>.</li>
            <li>Launch it once while online, then it works fully offline.</li>
          </ol></div></div>
        {cached && <p className="small muted" style={{ margin: '12px 0 0' }}>{cached}</p>}
      </div>
      <p className="small muted" style={{ marginTop: 24 }}>Content: {PROBLEMS.length} problems from switch_prep_tracker.xlsx (DSA sheet), {TOPICS.length} patterns. Every problem has an algorithm, a dry run and code in C++, Java and JavaScript; every solution in every language passed its example and edge-case tests before publishing.</p>
    </>
  );
}
