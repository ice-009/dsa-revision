/* Scribble boxes — one hand-writing page per DSA problem, Apple Pencil first.
   Ported from the System Design atlas (ipad/annotate.js): same pens, pressure-shaped
   ink, eraser, undo, paper styles and touch rules.

   Touch rules (the part that keeps Safari scrolling smooth):
     The app only takes over a touch when the Pencil (or a finger, if finger drawing
     is on) lands inside a scribble pad, or while a stroke is in progress.
     Everywhere else — including a finger on the pad — the page scrolls as usual.

   Storage: IndexedDB "dsa-revise-ink", one record per problem
     { n, h, paper, collapsed, strokes: [{ id, c, w, p, at }], at }
   Points are stored in box units (0–1000 across the pad) so the drawing only scales
   with the iPad's width or rotation, never distorts. Each finished stroke is saved on
   pen-up; the stroke in progress is checkpointed every 250 ms and recovered on the
   next launch if the app was closed mid-stroke.

   Markup: Ink.html(n) returns a placeholder; a MutationObserver paints it.
   Exposes window.Ink = { html, has, exportAll, importAll, ready }. */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const PENS = ['ink', 'red', 'blue', 'green', 'marker'];
  const PEN_LABEL = { ink: 'Ink', red: 'Red', blue: 'Blue', green: 'Green', marker: 'Marker' };
  const SIZES = { fine: 3, medium: 5, bold: 8.5 }; // box units (1000 = box width)
  const MARKER = 2.6; // marker strokes are this much wider
  const PAPERS = ['dots', 'lines', 'blank'];
  const BOX_START = 0.42; // new box height / width
  const BOX_MAX = 4;
  const GROW = 0.3;
  const STROKE_IDLE_MS = 1500; // safety timer for a lift that never arrives

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => Date.now();
  const toast = (msg, action) => (window.appToast ? window.appToast(msg, action) : undefined);
  const clone = v => (v ? JSON.parse(JSON.stringify(v)) : v);
  const newId = () => `s${now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

  /* ---------- tool state (per device) ---------- */

  const TOOL_KEY = 'dsa-revise:ink-tool';
  const tool = { pen: 'ink', size: 'medium', paper: 'blank', finger: false, v: 2 };
  try {
    const saved = JSON.parse(localStorage.getItem(TOOL_KEY) || '{}') || {};
    for (const k of Object.keys(tool)) if (k in saved && typeof saved[k] === typeof tool[k]) tool[k] = saved[k];
    if (saved.v !== 2) { tool.paper = 'blank'; tool.v = 2; } // plain paper is the default from v2
    if (!PENS.includes(tool.pen)) tool.pen = 'ink';
    if (!SIZES[tool.size]) tool.size = 'medium';
    if (!PAPERS.includes(tool.paper)) tool.paper = 'blank';
  } catch (e) { /* defaults */ }
  let eraser = false; // session only: an eraser left on shouldn't greet you tomorrow
  const saveTool = () => {
    try { localStorage.setItem(TOOL_KEY, JSON.stringify(tool)); } catch (e) { /* not persisted */ }
  };

  /* ---------- IndexedDB ---------- */

  let dbPromise = null;
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open('dsa-revise-ink', 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('pages', { keyPath: 'n' });
        req.result.createObjectStore('meta', { keyPath: 'k' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => (dbPromise = null));
    return dbPromise;
  }
  async function tx(store, mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(store, mode);
      let out;
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
      out = fn(t.objectStore(store));
    });
  }
  const reqP = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

  const PAGES = new Map(); // n -> page, everything kept in memory (small)
  let failedSave = false;

  async function writePage(page) {
    PAGES.set(page.n, page);
    try {
      await tx('pages', 'readwrite', s => s.put(page));
      failedSave = false;
    } catch (e) {
      if (!failedSave) toast('Couldn’t save your scribble — storage is full or blocked.');
      failedSave = true;
    }
    changed(page.n);
  }
  async function removePage(n) {
    PAGES.delete(n);
    try { await tx('pages', 'readwrite', s => s.delete(n)); } catch (e) { /* ignore */ }
    changed(n);
  }
  const saveDraft = draft => tx('meta', 'readwrite', s => (draft ? s.put({ k: 'draft', v: draft }) : s.delete('draft'))).catch(() => {});

  function changed(n) {
    document.dispatchEvent(new CustomEvent('ink-change', { detail: { n, has: has(n) } }));
  }

  const blankPage = n => ({ n, h: BOX_START, paper: tool.paper, collapsed: false, strokes: [], at: now() });
  const pageOf = n => PAGES.get(n) || blankPage(n);
  const has = n => !!(PAGES.get(n) && PAGES.get(n).strokes.length);

  const ready = (async () => {
    try {
      const all = await tx('pages', 'readonly', s => reqP(s.getAll()));
      for (const page of all) PAGES.set(page.n, page);
      if (!localStorage.getItem('dsa-revise:ink-plain')) {
        for (const page of all) if (page.paper === 'dots') await writePage({ ...page, paper: 'blank' });
        try { localStorage.setItem('dsa-revise:ink-plain', '1'); } catch (e) { /* retry next launch */ }
      }
      saveTool();
      // a stroke the app was closed in the middle of
      const draft = await tx('meta', 'readonly', s => reqP(s.get('draft')));
      if (draft && draft.v) {
        const { n, stroke } = draft.v;
        const page = clone(pageOf(n));
        if (!page.strokes.some(s => s.id === stroke.id)) {
          page.strokes.push(stroke);
          await writePage(page);
        }
        await saveDraft(null);
      }
    } catch (e) { /* no IndexedDB: boxes still work for this session */ }
    paintAll(document);
    document.dispatchEvent(new CustomEvent('ink-ready'));
  })();

  /* ---------- stroke geometry (from the atlas) ---------- */

  function decode(p) {
    const out = [];
    let x = 0, y = 0, q = 0;
    for (let i = 0; i + 2 < p.length; i += 3) {
      x += p[i]; y += p[i + 1]; q += p[i + 2];
      out.push([x / 100, y / 100, q / 100]);
    }
    return out;
  }
  function encode(points) {
    const out = [];
    let px = 0, py = 0, pq = 0;
    for (const [x, y, q] of points) {
      const ix = Math.round(x * 100), iy = Math.round(y * 100), iq = Math.round(q * 100);
      out.push(ix - px, iy - py, iq - pq);
      px = ix; py = iy; pq = iq;
    }
    return out;
  }
  // stored in tenths of a box unit
  const boxPoints = s => decode(s.p || []).map(([x, y, q]) => [x * 10, y * 10, q]);
  const packBox = pts => encode(pts.map(([x, y, q]) => [x / 10, y / 10, q]));

  /* Variable-width ink outline (pressure, light taper at both ends). */
  function outline(points, size, flat = false) {
    if (!points.length) return '';
    const pts = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const prev = pts[pts.length - 1];
      const p = points[i];
      if (Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 0.35 && i < points.length - 1) continue;
      pts.push([prev[0] + (p[0] - prev[0]) * 0.65, prev[1] + (p[1] - prev[1]) * 0.65, p[2]]);
    }
    pts.push(points[points.length - 1]);
    const pressures = pts.map(p => p[2]);
    const varies = !flat && Math.max(...pressures) - Math.min(...pressures) > 0.08;
    const n = pts.length;
    const r = pts.map((p, i) => {
      const press = varies ? 0.45 + 0.85 * p[2] : 1;
      const taper = flat ? 1 : Math.min(1, 0.55 + 0.15 * Math.min(i, n - 1 - i));
      return Math.max(0.35, (size / 2) * press * taper);
    });
    if (n < 3) {
      const [x, y] = pts[0];
      const rr = (size / 2).toFixed(2);
      return `M${(x - +rr).toFixed(2)} ${y.toFixed(2)}a${rr} ${rr} 0 1 0 ${(2 * rr).toFixed(2)} 0a${rr} ${rr} 0 1 0 ${(-2 * rr).toFixed(2)} 0Z`;
    }
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;
      L.push([pts[i][0] - dy * r[i], pts[i][1] + dx * r[i]]);
      R.push([pts[i][0] + dy * r[i], pts[i][1] - dx * r[i]]);
    }
    const f = v => v.toFixed(2);
    const curve = arr => {
      let d = '';
      for (let i = 1; i < arr.length - 1; i++) {
        const mx = (arr[i][0] + arr[i + 1][0]) / 2, my = (arr[i][1] + arr[i + 1][1]) / 2;
        d += `Q${f(arr[i][0])} ${f(arr[i][1])} ${f(mx)} ${f(my)}`;
      }
      const e = arr[arr.length - 1];
      return d + `L${f(e[0])} ${f(e[1])}`;
    };
    const Rr = R.slice().reverse();
    return `M${f(L[0][0])} ${f(L[0][1])}` + curve(L) +
      `A${f(r[n - 1])} ${f(r[n - 1])} 0 0 1 ${f(Rr[0][0])} ${f(Rr[0][1])}` + curve(Rr) +
      `A${f(r[0])} ${f(r[0])} 0 0 1 ${f(L[0][0])} ${f(L[0][1])}Z`;
  }

  const penClass = c => `pen-${PENS.includes(c) ? c : 'ink'}`;
  const strokeWidth = (pen, size) => (SIZES[size] || SIZES.medium) * (pen === 'marker' ? MARKER : 1);
  function pathEl(d, pen, id) {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', penClass(pen));
    if (id) p.dataset.id = id;
    return p;
  }

  function thumb(strokes, maxW = 220, maxH = 46) {
    const all = strokes.flatMap(boxPoints);
    if (!all.length) return '<svg class="ink-thumb" viewBox="0 0 10 10" aria-hidden="true"></svg>';
    const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    const w = Math.max(1, Math.max(...xs) - x0), h = Math.max(1, Math.max(...ys) - y0);
    const scale = Math.min(maxW / w, maxH / h);
    const paths = strokes.map(s => {
      const pts = boxPoints(s).map(([x, y, q]) => [(x - x0) * scale + 3, (y - y0) * scale + 3, q]);
      return `<path class="${penClass(s.c)}" d="${outline(pts, Math.max(1.2, (s.w || 5) * scale), s.c === 'marker')}"/>`;
    }).join('');
    return `<svg class="ink-thumb" viewBox="0 0 ${Math.ceil(w * scale) + 6} ${Math.ceil(h * scale) + 6}" aria-hidden="true">${paths}</svg>`;
  }

  /* ---------- icons ---------- */

  const ICONS = {
    eraser: '<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 19"/><path d="M22 21H7M5 11l9 9"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
    pencil: '<path d="M3 17c3-6 5-10 7-10s-2 10 1 10 4-8 6-8-1 6 1 6 2-2 3-3"/>',
  };
  const svgIcon = (name, size = 20) =>
    `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------- painting ---------- */

  const html = n => `<section class="scribble" data-scribble="${Number(n)}" aria-label="Scribble"></section>`;

  function toolsHtml() {
    return `<div class="sb-tools" role="toolbar" aria-label="Scribble tools">
      <div class="sb-pens">${PENS.map(c =>
        `<button type="button" class="swatch pen-${c}${tool.pen === c && !eraser ? ' on' : ''}" data-ink="pen" data-v="${c}" aria-label="${PEN_LABEL[c]} pen"></button>`).join('')}</div>
      <div class="sb-sizes">${Object.keys(SIZES).map(s =>
        `<button type="button" class="size-${s}${tool.size === s ? ' on' : ''}" data-ink="size" data-v="${s}" aria-label="${s} line"><i></i></button>`).join('')}</div>
      <button type="button" class="sb-btn${eraser ? ' on' : ''}" data-ink="eraser" aria-pressed="${eraser}" aria-label="Eraser" title="Eraser (two-finger tap)">${svgIcon('eraser', 18)}</button>
      <button type="button" class="sb-btn" data-ink="undo" ${undoStack.length ? '' : 'disabled'} aria-label="Undo">${svgIcon('undo', 18)}</button>
      <button type="button" class="sb-btn" data-ink="redo" ${redoStack.length ? '' : 'disabled'} aria-label="Redo">${svgIcon('redo', 18)}</button>
    </div>`;
  }

  function paint(el) {
    const n = Number(el.dataset.scribble);
    const page = pageOf(n);
    const h = Math.max(0.2, Math.min(BOX_MAX, page.h || BOX_START));
    const paper = PAPERS.includes(page.paper) ? page.paper : 'blank';
    const collapsed = !!page.collapsed;
    const count = page.strokes.length;
    const pid = `pp-${n}-${Math.random().toString(36).slice(2, 6)}`;
    const H = Math.round(h * 1000);
    const pattern = paper === 'dots'
      ? `<pattern id="${pid}" width="25" height="25" patternUnits="userSpaceOnUse"><circle class="paper-mark" cx="12.5" cy="12.5" r="1.7"/></pattern>`
      : paper === 'lines'
        ? `<pattern id="${pid}" width="1000" height="40" patternUnits="userSpaceOnUse"><rect class="paper-mark" x="0" y="39" width="1000" height="1.4"/></pattern>`
        : '';
    el.dataset.painted = '1';
    el.classList.toggle('collapsed', collapsed);
    el.innerHTML = `
      <header class="sb-head">
        <button type="button" class="sb-title" data-ink="collapse" aria-expanded="${!collapsed}">
          <span class="sb-chev">${svgIcon('chev', 16)}</span>
          <span class="sb-label">Scribble <span class="sb-hint">· work it out before the code</span></span>
        </button>
        ${collapsed ? '' : toolsHtml()}
        <button type="button" class="sb-btn" data-ink="more" aria-label="Scribble options">${svgIcon('more', 18)}</button>
      </header>
      ${collapsed
        ? `<button type="button" class="sb-peek" data-ink="collapse">${thumb(page.strokes)}<span>${count ? `${count} stroke${count === 1 ? '' : 's'} · tap to open` : 'Empty · tap to open'}</span></button>`
        : `<div class="sb-body">
            <svg class="scribble-pad" viewBox="0 0 1000 ${H}" preserveAspectRatio="xMidYMid meet" aria-label="Scribble area — write with Apple Pencil">
              <defs>${pattern}</defs>
              ${pattern ? `<rect class="paper" x="0" y="0" width="1000" height="${H}" fill="url(#${pid})"/>` : ''}
              <g class="strokes"></g>
            </svg>
            ${count ? '' : `<div class="sb-empty">${tool.finger ? 'Write here with Apple Pencil or your finger' : 'Write here with Apple Pencil · fingers scroll'}</div>`}
            ${h < BOX_MAX - 0.01 ? `<button type="button" class="sb-more-space" data-ink="grow">${svgIcon('plus', 16)} More space</button>` : ''}
          </div>`}`;
    if (!collapsed) {
      const g = el.querySelector('.strokes');
      for (const s of page.strokes) g.appendChild(pathEl(outline(boxPoints(s), s.w || SIZES.medium, s.c === 'marker'), s.c, s.id));
    }
  }

  function paintAll(root) {
    (root.querySelectorAll ? root.querySelectorAll('.scribble[data-scribble]') : []).forEach(el => {
      if (!(gesture && el.contains(gesture.pad))) paint(el);
    });
  }
  const repaint = n => document.querySelectorAll(`.scribble[data-scribble="${n}"]`).forEach(paint);
  const refreshToolbars = () => document.querySelectorAll('.scribble:not(.collapsed) .sb-tools').forEach(t => { t.outerHTML = toolsHtml(); });

  new MutationObserver(muts => {
    for (const m of muts)
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches('.scribble[data-scribble]:not([data-painted])')) paint(node);
        else node.querySelectorAll && node.querySelectorAll('.scribble[data-scribble]:not([data-painted])').forEach(paint);
      }
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- changes, undo, redo ---------- */

  let undoStack = [];
  let redoStack = [];

  async function commit(n, after, { undoable = true } = {}) {
    const before = PAGES.has(n) ? clone(PAGES.get(n)) : null;
    after.at = now();
    await writePage(after);
    if (undoable) {
      undoStack.push({ n, before, after: clone(after) });
      if (undoStack.length > 200) undoStack.shift();
      redoStack = [];
    }
    repaint(n);
  }
  async function restore(n, page) {
    if (page) await writePage(clone(page));
    else await removePage(n);
    repaint(n);
  }
  async function undo() {
    const step = undoStack.pop();
    if (!step) return;
    await restore(step.n, step.before);
    redoStack.push(step);
    refreshToolbars();
  }
  async function redo() {
    const step = redoStack.pop();
    if (!step) return;
    await restore(step.n, step.after);
    undoStack.push(step);
    refreshToolbars();
  }

  /* ---------- touch and pointer input ---------- */

  let gesture = null;
  let draftTimer = 0;
  let watchdog = 0;
  let suppressClick = false;

  const drawsWith = e => e.pointerType === 'pen' || e.pointerType === 'mouse' || (tool.finger && e.pointerType === 'touch');
  const armWatchdog = () => {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => gesture && finishGesture(false), STROKE_IDLE_MS);
  };

  /* The only touches ever cancelled: the Pencil (or an enabled finger) on a pad, and
     anything while a stroke is in progress. A finger elsewhere always scrolls. */
  document.addEventListener('touchstart', e => {
    const stylus = Array.from(e.changedTouches).some(t => t.touchType === 'stylus');
    const pad = e.target.closest && e.target.closest('.scribble-pad');
    if (gesture || (pad && (stylus || tool.finger))) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', e => { if (gesture) e.preventDefault(); }, { passive: false });

  document.addEventListener('pointerdown', e => {
    suppressClick = false;
    if (e.button > 0) return;
    if (gesture) finishGesture(false); // a stroke whose lift never came is saved, not lost
    const pad = e.target.closest && e.target.closest('.scribble-pad');
    if (!pad || !drawsWith(e)) return; // a finger scrolls past the box
    e.preventDefault();
    try { pad.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ }
    closeMenu();
    if (eraser) startErase(e, pad);
    else startInk(e, pad);
    gesture.mouse = e.pointerType === 'mouse';
    armWatchdog();
  });

  document.addEventListener('pointermove', e => {
    if (!gesture) {
      // the safety timer ended a stroke while the Pencil rested; carry on
      const pad = e.buttons === 1 && drawsWith(e) && !eraser && e.target.closest && e.target.closest('.scribble-pad');
      if (pad) { startInk(e, pad); armWatchdog(); }
      return;
    }
    if (e.pointerId !== gesture.id) return;
    e.preventDefault();
    armWatchdog();
    if (gesture.type === 'ink') moveInk(e);
    else eraseAt(e);
  });

  const end = e => { if (gesture && e.pointerId === gesture.id) finishGesture(e.type === 'pointercancel'); };
  window.addEventListener('pointerup', end, true);
  window.addEventListener('pointercancel', end, true);
  document.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; e.preventDefault(); e.stopPropagation(); }
  }, true);

  function finishGesture(cancelled) {
    const g = gesture;
    if (!g) return;
    gesture = null;
    clearTimeout(watchdog);
    if (g.mouse && !cancelled) suppressClick = true;
    if (g.type === 'ink') endInk(g, cancelled);
    else endErase(g);
  }

  /* Two-finger tap inside a box toggles the eraser. */
  let twoTap = null;
  document.addEventListener('touchstart', e => {
    if (!e.target.closest || !e.target.closest('.scribble')) return;
    const fingers = Array.from(e.touches).filter(t => t.touchType !== 'stylus');
    if (fingers.length === 2 && !twoTap) twoTap = { at: now(), n: 2, start: new Map(fingers.map(f => [f.identifier, [f.clientX, f.clientY]])), moved: false };
    else if (twoTap && fingers.length > 2) twoTap.n = fingers.length;
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!twoTap) return;
    for (const t of e.changedTouches) {
      const s0 = twoTap.start.get(t.identifier);
      if (s0 && Math.hypot(t.clientX - s0[0], t.clientY - s0[1]) > 14) twoTap.moved = true;
    }
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!twoTap || e.touches.length) return;
    const t = twoTap;
    twoTap = null;
    if (t.n === 2 && !t.moved && now() - t.at < 350) toggleEraser();
  }, { passive: true });
  document.addEventListener('touchcancel', () => (twoTap = null), { passive: true });

  function toggleEraser() {
    eraser = !eraser;
    refreshToolbars();
    toast(eraser ? 'Eraser on — swipe over strokes to remove them.' : 'Pen on.');
  }

  /* ---------- writing ---------- */

  function padPoint(ev, pad) {
    const r = pad.getBoundingClientRect();
    const k = 1000 / r.width;
    const q = ev.pointerType === 'pen' && ev.pressure > 0 ? ev.pressure : 0.5;
    return [(ev.clientX - r.left) * k, (ev.clientY - r.top) * k, q];
  }

  function startInk(e, pad) {
    const box = pad.closest('.scribble');
    gesture = {
      type: 'ink', id: e.pointerId, n: Number(box.dataset.scribble), pad, pts: [],
      pen: tool.pen, size: tool.size, startedAt: now(), rid: newId(),
    };
    gesture.live = pathEl('', tool.pen);
    pad.querySelector('.strokes').appendChild(gesture.live);
    const hint = box.querySelector('.sb-empty');
    if (hint) hint.remove();
    addPoints(e);
    clearInterval(draftTimer);
    draftTimer = setInterval(saveDraftNow, 250);
  }

  function addPoints(e) {
    const g = gesture;
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of list.length ? list : [e]) {
      const p = padPoint(ev, g.pad);
      const last = g.pts[g.pts.length - 1];
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= 0.5) g.pts.push(p);
    }
  }

  let liveQueued = false;
  function moveInk(e) {
    addPoints(e);
    if (liveQueued) return;
    liveQueued = true;
    requestAnimationFrame(() => {
      liveQueued = false;
      const g = gesture;
      if (!g || g.type !== 'ink') return;
      g.live.setAttribute('d', outline(g.pts, strokeWidth(g.pen, g.size), g.pen === 'marker'));
    });
  }

  const strokeOf = g => ({ id: g.rid, c: g.pen, w: strokeWidth(g.pen, g.size), p: packBox(g.pts), at: g.startedAt });

  function saveDraftNow() {
    const g = gesture;
    if (g && g.type === 'ink' && g.pts.length) saveDraft({ n: g.n, stroke: strokeOf(g) });
  }

  async function endInk(g, cancelled) {
    clearInterval(draftTimer);
    // iOS can cancel a touch mid-stroke; ink already drawn is kept
    if (!g.pts.length || (cancelled && g.pts.length < 3)) {
      if (g.live) g.live.remove();
      saveDraft(null);
      return;
    }
    const page = clone(pageOf(g.n));
    page.strokes.push(strokeOf(g));
    // writing near the bottom makes the box grow, like a Notes page
    const lowest = Math.max(...g.pts.map(p => p[1]));
    if (lowest > (page.h || BOX_START) * 1000 * 0.78 && page.h < BOX_MAX) page.h = Math.min(BOX_MAX, page.h + GROW);
    await commit(g.n, page);
    saveDraft(null);
    refreshToolbars();
  }

  /* ---------- eraser ---------- */

  function distToSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const len = dx * dx + dy * dy;
    let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  function startErase(e, pad) {
    const n = Number(pad.closest('.scribble').dataset.scribble);
    gesture = { type: 'erase', id: e.pointerId, n, pad, ids: new Set(), cache: pageOf(n).strokes.map(s => ({ s, pts: boxPoints(s) })) };
    eraseAt(e);
  }

  // checks the whole path since the last sample: a quick swipe can jump over a thin stroke
  function eraseAt(e) {
    const g = gesture;
    const [x, y] = padPoint(e, g.pad);
    const tol = 12;
    const from = g.last || [x, y];
    g.last = [x, y];
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from[0], y - from[1]) / 6));
    for (let k = 1; k <= steps; k++) {
      const px = from[0] + ((x - from[0]) * k) / steps;
      const py = from[1] + ((y - from[1]) * k) / steps;
      for (const { s, pts } of g.cache) {
        if (g.ids.has(s.id)) continue;
        const w = (s.w || 5) / 2;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
          if (distToSeg(px, py, a[0], a[1], b[0], b[1]) <= tol + w) {
            g.ids.add(s.id);
            const el = g.pad.querySelector(`[data-id="${s.id}"]`);
            if (el) el.style.opacity = '0.15';
            break;
          }
        }
      }
    }
  }

  async function endErase(g) {
    if (!g.ids.size) return;
    const page = clone(pageOf(g.n));
    page.strokes = page.strokes.filter(s => !g.ids.has(s.id));
    await commit(g.n, page);
    refreshToolbars();
    toast(`${g.ids.size} stroke${g.ids.size === 1 ? '' : 's'} erased.`, { label: 'Undo', run: undo });
  }

  /* ---------- buttons and the options menu ---------- */

  document.addEventListener('click', async e => {
    const b = e.target.closest && e.target.closest('[data-ink]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    const box = b.closest('[data-scribble], [data-for]');
    const n = box ? Number(box.dataset.scribble || box.dataset.for) : NaN;
    const act = b.dataset.ink;
    switch (act) {
      case 'collapse': {
        const page = clone(pageOf(n));
        page.collapsed = !page.collapsed;
        await commit(n, page, { undoable: false });
        break;
      }
      case 'pen': tool.pen = b.dataset.v; eraser = false; saveTool(); refreshToolbars(); break;
      case 'size': tool.size = b.dataset.v; eraser = false; saveTool(); refreshToolbars(); break;
      case 'eraser': toggleEraser(); break;
      case 'undo': await undo(); break;
      case 'redo': await redo(); break;
      case 'grow': {
        const page = clone(pageOf(n));
        page.h = Math.min(BOX_MAX, (page.h || BOX_START) + GROW);
        await commit(n, page, { undoable: false });
        break;
      }
      case 'more': openMenu(n, b); break;
      case 'paper': {
        const page = clone(pageOf(n));
        page.paper = b.dataset.v;
        tool.paper = b.dataset.v;
        saveTool();
        await commit(n, page);
        closeMenu();
        break;
      }
      case 'finger':
        tool.finger = !tool.finger;
        saveTool();
        closeMenu();
        document.querySelectorAll('.scribble[data-scribble]').forEach(paint);
        toast(tool.finger ? 'Fingers now draw in scribble boxes (scroll outside them).' : 'Fingers scroll again — draw with Apple Pencil.');
        break;
      case 'clear': {
        const page = clone(pageOf(n));
        if (!page.strokes.length) return closeMenu();
        const removed = page.strokes.length;
        page.strokes = [];
        page.h = BOX_START;
        await commit(n, page);
        closeMenu();
        refreshToolbars();
        toast(`Cleared ${removed} stroke${removed === 1 ? '' : 's'}.`, { label: 'Undo', run: undo });
        break;
      }
    }
  });

  let menu = null;
  function closeMenu() {
    if (menu) menu.remove();
    menu = null;
  }
  function openMenu(n, btn) {
    closeMenu();
    const page = pageOf(n);
    menu = document.createElement('div');
    menu.className = 'ink-menu';
    menu.dataset.for = String(n);
    menu.innerHTML = `
      <div class="menu-head">Paper</div>
      <div class="segmented">${PAPERS.map(p => `<button type="button" class="${page.paper === p ? 'on' : ''}" data-ink="paper" data-v="${p}">${{ dots: 'Dots', lines: 'Lines', blank: 'Plain' }[p]}</button>`).join('')}</div>
      <button type="button" class="menu-item" data-ink="finger">${tool.finger ? '✓ ' : ''}Draw with finger too</button>
      <button type="button" class="menu-item danger" data-ink="clear">Clear this page</button>`;
    document.body.appendChild(menu);
    const r = btn.getBoundingClientRect();
    const w = menu.offsetWidth;
    menu.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w))}px`;
    menu.style.top = `${r.bottom + 6 + window.scrollY}px`;
  }
  document.addEventListener('pointerdown', e => {
    if (menu && !menu.contains(e.target) && !e.target.closest('[data-ink="more"]')) closeMenu();
  });
  window.addEventListener('hashchange', closeMenu);

  /* ---------- backup ---------- */

  async function exportAll() {
    await ready;
    return [...PAGES.values()].filter(p => p.strokes.length);
  }
  async function importAll(list) {
    if (!Array.isArray(list)) return 0;
    let count = 0;
    for (const page of list) {
      if (!page || typeof page.n !== 'number' || !Array.isArray(page.strokes)) continue;
      await writePage({ ...blankPage(page.n), ...page });
      count++;
    }
    paintAll(document);
    return count;
  }

  window.Ink = { html, has, exportAll, importAll, ready };
})();
