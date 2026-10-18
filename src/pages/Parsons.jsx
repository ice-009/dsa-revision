import { useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PROBLEMS, BY_N, PLUS, SOLUTIONS } from '../data';
import { S, save, useApp } from '../lib/store';
import { currentWeek, today } from '../lib/dates';
import { shuffle, codeFor, LangTabs } from '../components/review/shared.jsx';
import NotFound from './NotFound';
import '../styles/review.css';

const isFixedLine = l => /^\s*[{}\[\]();,]*\s*$/.test(l) || /^\s*(public|private|protected):\s*$/.test(l);
function startParsons(n) {
  const lines = codeFor(`sol:${n}`).split('\n').filter(l => l.trim() && !/defined by LeetCode/.test(l));
  const slots = lines.map((text, i) => ({ i, text, indent: text.match(/^\s*/)[0].length, fixed: isFixedLine(text), placed: null }));
  const movable = slots.filter(x => !x.fixed);
  let pieces;
  let guard = 0;
  do pieces = shuffle(movable.map(x => ({ id: x.i, text: x.text.trim() })));
  while (pieces.length > 2 && pieces.every((pc, k) => pc.id === movable[k].i) && ++guard < 20);
  return { n, lang: S.lang, slots, pieces, target: null, checked: false, tries: 0, done: false };
}

function Game({ n }) {
  useApp();
  const [, force] = useReducer(x => x + 1, 0);
  const ref = useRef(null);
  if (!ref.current || ref.current.lang !== S.lang) ref.current = startParsons(n);
  const z = ref.current;
  const p = BY_N[n];
  const [drag, setDrag] = useState(null); // { src, text, x, y, over }
  const dragRef = useRef(null);

  const movable = z.slots.filter(x => !x.fixed);
  const placed = movable.filter(x => x.placed).length;
  const correct = movable.filter(x => x.placed && x.placed.text === x.text.trim()).length;
  const emptySlot = () => z.slots.find(x => !x.fixed && !x.placed);

  const act = {
    piece(id) {
      const k = z.pieces.findIndex(pc => pc.id === Number(id));
      if (k < 0) return;
      const slot = (z.target != null && z.slots[z.target] && !z.slots[z.target].placed) ? z.slots[z.target] : emptySlot();
      if (!slot) return;
      slot.placed = z.pieces.splice(k, 1)[0];
      z.target = null; z.checked = false;
    },
    slot(i) {
      const slot = z.slots[Number(i)];
      if (slot.placed) { z.pieces.push(slot.placed); slot.placed = null; z.checked = false; }
      else z.target = z.target === slot.i ? null : slot.i;
    },
    check() {
      z.checked = true; z.tries++;
      if (movable.every(x => x.placed && x.placed.text === x.text.trim())) {
        z.done = true;
        S.parsons[z.n] = { solved: true, tries: Math.min(z.tries, S.parsons[z.n]?.tries || Infinity), at: today() };
        save();
      }
    },
    hint() {
      for (let guard = 0; guard < 5; guard++) {
        const slot = z.slots.find(x => !x.fixed && (!x.placed || x.placed.text !== x.text.trim()));
        if (!slot) return;
        if (slot.placed) { z.pieces.push(slot.placed); slot.placed = null; }
        const k = z.pieces.findIndex(pc => pc.text === slot.text.trim());
        if (k < 0) {
          const other = z.slots.find(x => x.placed && x.placed.text === slot.text.trim());
          if (!other) return;
          z.pieces.push(other.placed); other.placed = null;
          continue;
        }
        slot.placed = z.pieces.splice(k, 1)[0];
        z.checked = false;
        return;
      }
    },
    reset() { ref.current = startParsons(z.n); },
    show() {
      for (const x of z.slots) if (!x.fixed) x.placed = { id: x.i, text: x.text.trim() };
      z.pieces = []; z.checked = true; z.done = true; z.tries = Infinity;
    },
  };
  const run = (name, v) => { act[name](v); force(); };

  // move a dragged piece/line onto slot `to`
  const drop = (src, to) => {
    const target = z.slots[to];
    if (!target || target.fixed) return;
    let piece;
    let from = null;
    if (src.type === 'piece') {
      const k = z.pieces.findIndex(pc => pc.id === src.id);
      if (k < 0) return;
      piece = z.pieces.splice(k, 1)[0];
    } else {
      from = z.slots[src.i];
      if (from === target) return;
      piece = from.placed; from.placed = null;
    }
    if (target.placed) { if (from) from.placed = target.placed; else z.pieces.push(target.placed); }
    target.placed = piece;
    z.target = null; z.checked = false;
    force();
  };

  const startDrag = (e, src, text) => {
    if (z.done) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { src, text, id: e.pointerId };
    setDrag({ src, text, x: e.clientX, y: e.clientY, over: null });
  };
  const moveDrag = e => {
    if (!dragRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('[data-slot]');
    setDrag(d => d && { ...d, x: e.clientX, y: e.clientY, over: el ? Number(el.dataset.slot) : null });
  };
  const endDrag = e => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('[data-slot]');
    setDrag(null);
    if (e.type === 'pointerup' && el) drop(d.src, Number(el.dataset.slot));
  };
  useEffect(() => {
    // Escape cancels a drag; also cleans up if unmounted mid-drag
    const onKey = e => { if (e.key === 'Escape') { dragRef.current = null; setDrag(null); } };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); dragRef.current = null; };
  }, []);

  const gripProps = (src, text) => ({
    className: 'pz-grip', 'aria-hidden': 'true', onPointerDown: e => startDrag(e, src, text),
    onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag,
  });

  return (
    <>
      <Link to={`/problem/${p.n}`} className="back">‹ {p.title}</Link>
      <h1 style={{ marginTop: 10 }}>Rebuild the code</h1>
      <p className="sub">{p.title} · tap lines in the order they belong, or drag the ⠿ handle onto a slot. Braces are already in place.</p>
      <div className="row" style={{ marginBottom: 12 }}><LangTabs /><span className="spacer" />
        <span className="small muted">{placed}/{movable.length} placed{z.checked ? ` · ${correct} in the right place` : ''}</span></div>
      {PLUS[p.n] && <p className="small" style={{ margin: '0 0 12px', color: 'var(--ink-2)' }}>{PLUS[p.n].q}</p>}
      <div className={`pz-board ${z.done ? 'solved' : ''}`}>{z.slots.map(x => {
        const pad = { paddingLeft: 10 + x.indent * 7 };
        if (x.fixed) return <div key={x.i} className="pz-line fixed" style={pad}>{x.text.trim()}</div>;
        const hover = drag && drag.over === x.i ? ' hover' : '';
        if (!x.placed) {
          return <div key={x.i} className="pz-row" data-slot={x.i}>
            <button type="button" className={`pz-line empty ${z.target === x.i ? 'target' : ''}${hover}`} style={pad} onClick={() => run('slot', x.i)}>{z.target === x.i ? 'next line goes here' : ' '}</button>
          </div>;
        }
        const st = z.checked ? (x.placed.text === x.text.trim() ? 'ok' : 'bad') : '';
        const dragging = drag && drag.src.type === 'slot' && drag.src.i === x.i;
        return <div key={x.i} className={`pz-row${dragging ? ' dragging' : ''}`} data-slot={x.i}>
          <button type="button" className={`pz-line placed ${st}${hover}`} style={pad} onClick={() => run('slot', x.i)}>{x.placed.text}</button>
          {!z.done && <span {...gripProps({ type: 'slot', i: x.i }, x.placed.text)}>⠿</span>}
        </div>;
      })}</div>
      {z.done ? (
        <div className="card pz-win"><b>✓ Rebuilt{z.tries > 1 && z.tries !== Infinity ? ` in ${z.tries} checks` : z.tries === Infinity ? '' : ' first time'}!</b> Now try writing it from memory on LeetCode.
          <div className="row" style={{ marginTop: 10 }}><Link className="btn small primary" to="/parsons/random">Another problem</Link><Link className="btn small" to={`/problem/${p.n}`}>Back to the problem</Link></div></div>
      ) : (
        <>
          <div className="eyebrow" style={{ marginTop: 18 }}>Lines to place</div>
          <div className="pz-pool">{z.pieces.map(pc => {
            const dragging = drag && drag.src.type === 'piece' && drag.src.id === pc.id;
            return <div key={pc.id} className={`pz-row${dragging ? ' dragging' : ''}`}>
              <button type="button" className="pz-piece" onClick={() => run('piece', pc.id)}>{pc.text}</button>
              <span {...gripProps({ type: 'piece', id: pc.id }, pc.text)}>⠿</span>
            </div>;
          })}{!z.pieces.length && <span className="muted small">All lines placed — check your answer.</span>}</div>
          <div className="row" style={{ marginTop: 14 }}>
            <button type="button" className="btn primary" disabled={!placed} onClick={() => run('check')}>Check</button>
            <button type="button" className="btn" onClick={() => run('hint')}>Place one for me</button>
            <button type="button" className="btn ghost" onClick={() => run('reset')}>Start over</button>
            <span className="spacer" />
            <button type="button" className="btn ghost" onClick={() => run('show')}>Show answer</button>
          </div>
        </>
      )}
      {drag && <div className="pz-ghost" style={{ left: drag.x, top: drag.y }}>{drag.text}</div>}
    </>
  );
}

export default function Parsons() {
  useApp();
  const { n: a } = useParams();
  const navigate = useNavigate();
  const num = Number(a);
  const valid = BY_N[num] && SOLUTIONS[num];
  const wantRandom = !a || a === 'random' || !valid;
  const picked = useRef({ a: null, n: null });
  if (wantRandom && picked.current.a !== a) {
    const pool = PROBLEMS.filter(p => p.week <= currentWeek() && SOLUTIONS[p.n]);
    const list = pool.length ? pool : PROBLEMS.filter(p => SOLUTIONS[p.n]);
    picked.current = { a, n: list.length ? list[Math.floor(Math.random() * list.length)].n : null };
  }
  const n = wantRandom ? picked.current.n : num;
  useEffect(() => { if (wantRandom && n != null) navigate(`/parsons/${n}`, { replace: true }); }, [wantRandom, n, navigate]);
  if (n == null) return <NotFound />;
  return <Game key={n} n={n} />;
}
