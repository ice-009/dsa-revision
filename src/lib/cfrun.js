// Codeforces solve helpers: run code through /api/run, compare outputs, fetch problems, render $$$math$$$.

/** "2 seconds" -> 2000, "256 megabytes" -> 262144 (KB). Returns undefined when unparseable. */
export function parseLimits(p) {
  const t = parseFloat(String(p?.timeLimit ?? '').replace(',', '.'));
  const m = parseFloat(String(p?.memoryLimit ?? '').replace(',', '.'));
  return {
    timeLimitMs: t > 0 ? Math.round(t * 1000) : undefined,
    memoryLimitKb: m > 0 ? Math.round(m * (/gig/i.test(p.memoryLimit) ? 1048576 : /kil/i.test(p.memoryLimit) ? 1 : 1024)) : undefined,
  };
}

// ── comparison ──
/** Lines with trailing whitespace trimmed and trailing blank lines dropped. */
export function normLines(s) {
  const l = String(s ?? '').replace(/\r/g, '').split('\n').map(x => x.replace(/\s+$/, ''));
  while (l.length && l[l.length - 1] === '') l.pop();
  return l;
}
export const tokens = s => String(s ?? '').split(/\s+/).filter(Boolean);
export function sameTokens(a, b) {
  const x = tokens(a), y = tokens(b);
  return x.length === y.length && x.every((t, i) => t === y[i]);
}
/** Index of the first differing line (after normalising), or -1. */
export function firstDiffLine(exp, got) {
  const a = normLines(exp), b = normLines(got), n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return -1;
}
const STATUS_VERDICT = { ce: 'CE', re: 'RE', tle: 'TLE', mle: 'MLE', err: 'ERR' };
/** Verdict for one /api/run result against an optional expected output. */
export function verdictOf(r, expected) {
  if (r.status !== 'ok') return STATUS_VERDICT[r.status] || 'ERR';
  if (expected == null || String(expected).trim() === '') return 'OK';
  return sameTokens(expected, r.out) ? 'AC' : 'WA';
}

// ── running ──
/** Run `tests` ([{in}]) through the sandbox. Always resolves to an array of results (one per test) or throws Error with a readable message. */
export async function runCode({ lang, source, tests, timeLimitMs, memoryLimitKb, signal }) {
  let res;
  try {
    res = await fetch('/api/run', {
      method: 'POST', headers: { 'content-type': 'application/json' }, signal,
      body: JSON.stringify({ lang, source, tests: tests.map(t => ({ in: t.in })), timeLimitMs, memoryLimitKb }),
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error('Could not reach the runner. Check your connection and try again.');
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* not JSON */ }
  if (res.status === 429) throw new Error('Too many runs. Wait a few seconds and try again.');
  if (!res.ok) throw new Error(data?.error || `Runner error (${res.status}).`);
  if (!data || !Array.isArray(data.results)) throw new Error('The runner sent back something unexpected.');
  return tests.map((_, i) => ({ status: 'err', out: '', err: 'No result returned.', compile: '', timeMs: 0, memKb: 0, ...(data.results[i] || {}) }));
}

// ── problem fetch ──
export const CF_ID = /^\d+[A-Z]\d?$/;
export async function fetchCfProblem(id, signal) {
  let res;
  try { res = await fetch(`/api/cf?q=${encodeURIComponent(id)}`, { signal }); }
  catch (e) { if (e.name === 'AbortError') throw e; throw new Error('Could not reach the server. Check your connection.'); }
  let data = null;
  try { data = await res.json(); } catch (e) { /* not JSON */ }
  if (!res.ok || !data || data.error) throw new Error(data?.error || `Could not load this problem (${res.status}).`);
  return data;
}

// ── math ──
const ENT = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ' };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const c = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(c); } catch (x) { return m; }
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let katexP = null;
export function loadKatex() {
  return (katexP ||= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([k]) => k.default || k));
}
/** Replace $$$...$$$ in sanitized HTML with KaTeX markup. Falls back to the raw (escaped) text if KaTeX fails. */
export async function renderMath(html) {
  if (!html || !html.includes('$$$')) return html || '';
  let katex;
  try { katex = await loadKatex(); } catch (e) { return html.replace(/\$\$\$/g, ''); }
  return html.replace(/\$\$\$([\s\S]+?)\$\$\$/g, (m, tex) => {
    const raw = decodeEntities(tex);
    try { return katex.renderToString(raw, { throwOnError: true, strict: 'ignore', output: 'html' }); }
    catch (e) { return `<code>${esc(raw)}</code>`; }
  });
}
