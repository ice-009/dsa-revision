import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, addCfProblem, removeCfProblem } from '../lib/store';
import { cfTier } from '../data/cf';
import '../styles/cf.css';
import '../styles/cf-add.css';

// Pull "1850A" out of an id or any Codeforces problem link; null if it doesn't look like one.
function parseId(raw) {
  const s = (raw || '').trim();
  let m = s.match(/(?:problemset\/problem|gym)\/(\d+)\/([A-Za-z]\d?)/i) || s.match(/contest\/(\d+)\/problem\/([A-Za-z]\d?)/i) || s.match(/^(\d+)\s*[\/\s-]?\s*([A-Za-z]\d?)$/);
  return m ? { contest: +m[1], index: m[2].toUpperCase() } : null;
}

async function fetchProblem(q) {
  let res, data;
  try { res = await fetch(`/api/cf?q=${encodeURIComponent(q)}`); } catch { throw new Error('Could not reach the server. Check your connection.'); }
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok || !data || data.error) throw new Error(data && data.error ? `${data.error}${data.hint ? ` ${data.hint}` : ''}` : `Request failed (${res.status}).`);
  return data;
}

const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Plain text to HTML: blank lines split paragraphs, single newlines become <br>.
const toHtml = t => t.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x).replace(/\n/g, '<br>')}</p>`).join('');

const EMPTY = { id: '', name: '', rating: '', tags: '', legend: '', input: '', output: '', samples: [{ in: '', out: '' }] };

function Manual({ onSave, defaultId }) {
  const [f, setF] = useState({ ...EMPTY, id: defaultId || '' });
  const [err, setErr] = useState('');
  const up = k => e => setF(x => ({ ...x, [k]: e.target.value }));
  const upS = (i, k) => e => setF(x => ({ ...x, samples: x.samples.map((s, j) => (j === i ? { ...s, [k]: e.target.value } : s)) }));

  const submit = e => {
    e.preventDefault();
    const pid = parseId(f.id);
    const id = pid ? `${pid.contest}${pid.index}` : f.id.trim().replace(/\s+/g, '-');
    if (!id) return setErr('Give the problem an id.');
    if (!f.name.trim()) return setErr('Give the problem a name.');
    const rating = parseInt(f.rating, 10);
    onSave({
      id, contest: pid ? pid.contest : null, index: pid ? pid.index : null, name: f.name.trim(),
      rating: rating > 0 ? rating : null,
      tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
      url: pid ? `https://codeforces.com/problemset/problem/${pid.contest}/${pid.index}` : '',
      timeLimit: '', memoryLimit: '',
      legend: toHtml(f.legend), input: toHtml(f.input), output: toHtml(f.output), note: '',
      samples: f.samples.filter(s => s.in.trim() || s.out.trim()).map(s => ({ in: s.in.replace(/\s+$/, '') + '\n', out: s.out.replace(/\s+$/, '') + '\n' })),
      custom: true,
    });
  };

  return (
    <form className="card ca-manual" onSubmit={submit}>
      <h2>Add manually</h2>
      <div className="ca-grid">
        <label>Id or link<input className="search" value={f.id} onChange={up('id')} placeholder="1850A or my-problem" /></label>
        <label>Name<input className="search" value={f.name} onChange={up('name')} /></label>
        <label>Rating (optional)<input className="search" inputMode="numeric" value={f.rating} onChange={up('rating')} placeholder="800" /></label>
        <label>Tags (comma separated)<input className="search" value={f.tags} onChange={up('tags')} placeholder="math, greedy" /></label>
      </div>
      <label>Statement<textarea className="search" rows={6} value={f.legend} onChange={up('legend')} placeholder="Plain text. Blank lines start a new paragraph." /></label>
      <div className="ca-grid">
        <label>Input spec (optional)<textarea className="search" rows={3} value={f.input} onChange={up('input')} /></label>
        <label>Output spec (optional)<textarea className="search" rows={3} value={f.output} onChange={up('output')} /></label>
      </div>
      {f.samples.map((s, i) => (
        <fieldset key={i} className="ca-sample">
          <legend>Sample {i + 1}</legend>
          <div className="ca-grid">
            <label>Input<textarea className="search ca-mono" rows={3} value={s.in} onChange={upS(i, 'in')} /></label>
            <label>Output<textarea className="search ca-mono" rows={3} value={s.out} onChange={upS(i, 'out')} /></label>
          </div>
          {f.samples.length > 1 && <button type="button" className="btn small ghost" onClick={() => setF(x => ({ ...x, samples: x.samples.filter((_, j) => j !== i) }))}>Remove sample {i + 1}</button>}
        </fieldset>
      ))}
      <div className="ca-actions">
        <button type="button" className="btn small" onClick={() => setF(x => ({ ...x, samples: [...x.samples, { in: '', out: '' }] }))}>+ Sample</button>
        <button type="submit" className="btn primary">Save problem</button>
      </div>
      {err && <p className="ca-err" role="alert">{err}</p>}
    </form>
  );
}

function Preview({ p, onAdd }) {
  const s = p.samples && p.samples[0];
  return (
    <div className="card ca-preview">
      <div className="cf-top">
        <span className={`cf-rate t-${cfTier(p.rating || 800)}`}>{p.rating || '?'}</span>
        <span className="cf-name ca-wrap">{p.name}</span>
        <span className="cf-id">{p.id}</span>
      </div>
      <div className="cf-tags">{(p.tags || []).map(t => <span key={t} className="cf-tag">{t}</span>)}</div>
      <p className="muted small">
        {[p.timeLimit && `Time ${p.timeLimit}`, p.memoryLimit && `Memory ${p.memoryLimit}`, `${(p.samples || []).length} sample${(p.samples || []).length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
      </p>
      {s && (
        <div className="ca-grid">
          <div><small className="cf-k">Sample input</small><pre className="ca-pre">{s.in}</pre></div>
          <div><small className="cf-k">Sample output</small><pre className="ca-pre">{s.out}</pre></div>
        </div>
      )}
      <div className="ca-actions">
        <button type="button" className="btn primary" onClick={() => onAdd(true)}>Add &amp; solve</button>
        <button type="button" className="btn" onClick={() => onAdd(false)}>Add only</button>
      </div>
    </div>
  );
}

export default function CfAdd() {
  const S = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [prev, setPrev] = useState(null);
  const [err, setErr] = useState('');
  const [manual, setManual] = useState(false);
  const [note, setNote] = useState('');
  const [bulk, setBulk] = useState('');
  const [prog, setProg] = useState(null); // { done, total, fails: [] }

  const fetchOne = async e => {
    e.preventDefault();
    if (!q.trim() || busy) return;
    setBusy(true); setErr(''); setPrev(null); setNote('');
    try { setPrev(await fetchProblem(q.trim())); }
    catch (x) { setErr(x.message); setManual(true); }
    setBusy(false);
  };

  const add = go => {
    addCfProblem(prev);
    if (go) nav(`/cf/solve/${prev.id}`);
    else { setNote(`Added ${prev.id} · ${prev.name}.`); setPrev(null); setQ(''); }
  };

  const saveManual = p => {
    addCfProblem(p);
    nav(`/cf/solve/${p.id}`);
  };

  const runBulk = async () => {
    const lines = [...new Set(bulk.split('\n').map(l => l.trim()).filter(Boolean))];
    if (!lines.length || prog) return;
    const fails = [];
    setProg({ done: 0, total: lines.length, fails });
    for (let i = 0; i < lines.length; i++) {
      try { addCfProblem(await fetchProblem(lines[i])); }
      catch (x) { fails.push(`${lines[i]}: ${x.message}`); }
      setProg({ done: i + 1, total: lines.length, fails: [...fails] });
    }
    setBulk(fails.length ? fails.map(f => f.split(': ')[0]).join('\n') : '');
  };

  const mine = Object.values(S.cfProb || {});
  const remove = p => { if (window.confirm(`Remove ${p.id} · ${p.name}? Your saved code and test cases for it are deleted too.`)) removeCfProblem(p.id); };
  const running = prog && prog.done < prog.total;

  return (
    <div className="cf ca">
      <header className="card ca-head">
        <h1>Add a Codeforces problem</h1>
        <p className="sub">Paste a problem link or an id like 1850A or 1850/A. The statement and samples are fetched so you can solve it here.</p>
        <form className="ca-fetch" onSubmit={fetchOne}>
          <label className="ca-big">
            <span className="cf-k">Link or id</span>
            <input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder="https://codeforces.com/problemset/problem/1850/A" autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          </label>
          <button type="submit" className="btn primary" disabled={busy || !q.trim()}>{busy ? 'Fetching…' : 'Fetch'}</button>
        </form>
        <div aria-live="polite">
          {busy && <p className="muted">Fetching problem…</p>}
          {note && <p className="ca-ok">{note}</p>}
          {err && <p className="ca-err" role="alert">{err}</p>}
        </div>
      </header>

      {prev && <Preview p={prev} onAdd={add} />}

      {!manual && <button type="button" className="btn small ghost ca-toggle" onClick={() => setManual(true)}>Add manually instead</button>}
      {manual && <Manual onSave={saveManual} defaultId={parseId(q) ? `${parseId(q).contest}${parseId(q).index}` : ''} />}

      <details className="card ca-bulk">
        <summary>Paste several</summary>
        <label>One link or id per line
          <textarea className="search ca-mono" rows={5} value={bulk} onChange={e => setBulk(e.target.value)} disabled={running} placeholder={'1850A\n1850/B\nhttps://codeforces.com/problemset/problem/4/A'} />
        </label>
        <div className="ca-actions">
          <button type="button" className="btn primary" onClick={runBulk} disabled={running || !bulk.trim()}>{running ? 'Adding…' : 'Fetch all'}</button>
          {prog && <span className="muted small" role="status">{prog.done}/{prog.total} done{prog.fails.length ? `, ${prog.fails.length} failed` : ''}</span>}
        </div>
        {prog && <div className="bar"><i style={{ width: `${(prog.done / prog.total) * 100}%` }} /></div>}
        {prog && prog.fails.length > 0 && <ul className="ca-err ca-fails">{prog.fails.map(f => <li key={f}>{f}</li>)}</ul>}
      </details>

      <section aria-labelledby="ca-mine">
        <h2 id="ca-mine">Your added problems</h2>
        {!mine.length && <p className="muted">Nothing yet.</p>}
        <div className="cf-grid">
          {mine.map(p => (
            <div key={p.id} className="cf-prob">
              <div className="cf-main">
                <div className="cf-top">
                  <span className={`cf-rate t-${cfTier(p.rating || 800)}`}>{p.rating || '?'}</span>
                  <span className="cf-name">{p.name}</span>
                  <span className="cf-id">{p.id}</span>
                </div>
                <div className="cf-tags">{(p.tags || []).slice(0, 4).map(t => <span key={t} className="cf-tag">{t}</span>)}</div>
              </div>
              <Link className="btn small primary" to={`/cf/solve/${p.id}`}>Solve</Link>
              <button type="button" className="btn small ghost" onClick={() => remove(p)} aria-label={`Remove ${p.name}`}>Remove</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
