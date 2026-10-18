// Code runner proxy to Judge0. POST { lang, source, tests:[{in}], timeLimitMs?, memoryLimitKb? }
const LANGS = { cpp: 105, java: 91, python: 100, js: 102 };
const MAX_SOURCE = 64 * 1024;
const MAX_STDIN = 256 * 1024;
const MAX_TESTS = 12;
const CONCURRENCY = 4;
const MAX_OUT = 64 * 1024;

const b64 = (s) => Buffer.from(String(s), 'utf8').toString('base64');
const unb64 = (s) => (s ? Buffer.from(String(s), 'base64').toString('utf8') : '');
const clip = (s) => (s.length > MAX_OUT ? s.slice(0, MAX_OUT) + '\n...[truncated]' : s);
const errResult = (msg) => ({ status: 'err', out: '', err: msg, compile: '', timeMs: 0, memKb: 0 });

async function runOne(base, key, lang, source, stdin, timeLimitMs, memoryLimitKb) {
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['X-Auth-Token'] = key;
  const memKb = lang === 'java' ? Math.max(memoryLimitKb, 131072) : memoryLimitKb;
  const body = {
    language_id: LANGS[lang],
    source_code: b64(source),
    stdin: b64(stdin),
    cpu_time_limit: timeLimitMs / 1000,
    wall_time_limit: Math.min(timeLimitMs / 1000 * 3 + 2, 20),
    memory_limit: memKb,
  };
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 45000);
  let r;
  try {
    r = await fetch(`${base}/submissions?base64_encoded=true&wait=true`, { method: 'POST', headers, body: JSON.stringify(body), signal: ctl.signal });
  } catch (e) {
    return errResult(e && e.name === 'AbortError' ? 'Judge timed out, try again' : 'Judge unreachable: ' + (e && e.message || e));
  } finally { clearTimeout(t); }
  if (r.status === 429) return errResult('Judge is rate limited, wait a few seconds and retry');
  const text = await r.text();
  if (!r.ok) {
    let detail = '';
    try { detail = JSON.stringify(JSON.parse(text)).slice(0, 300); } catch { detail = text.slice(0, 200); }
    return errResult(`Judge error (HTTP ${r.status})${r.status >= 500 ? '' : ': ' + detail}`);
  }
  let j;
  try { j = JSON.parse(text); } catch { return errResult('Judge returned invalid response'); }
  const id = j.status && j.status.id;
  const stderr = unb64(j.stderr);
  const compile = unb64(j.compile_output);
  const message = unb64(j.message);
  let status;
  if (id === 3) status = 'ok';
  else if (id === 5) status = 'tle';
  else if (id === 6) status = 'ce';
  else if (id >= 7 && id <= 12) status = 're';
  else status = 'err';
  const memHit = (j.memory != null && j.memory >= memKb * 0.98) || /std::bad_alloc|OutOfMemoryError|MemoryError|out of memory/i.test(stderr);
  if (status === 're' && memHit) status = 'mle';
  let err = stderr;
  if (status === 'err') err = [j.status && j.status.description, message, stderr].filter(Boolean).join(': ');
  else if (status === 're' && !err) err = (j.status && j.status.description) || 'Runtime error';
  else if (status === 'tle' && !err) err = 'Time limit exceeded';
  else if (status === 'mle' && !err) err = 'Memory limit exceeded';
  return {
    status, out: clip(unb64(j.stdout)), err: clip(err), compile: clip(compile),
    timeMs: Math.round(parseFloat(j.time || 0) * 1000) || 0, memKb: j.memory || 0,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'bad body' });
  const { lang, source, tests } = b;
  if (!Object.prototype.hasOwnProperty.call(LANGS, lang)) return res.status(400).json({ error: 'unknown lang' });
  if (typeof source !== 'string' || !source.length || Buffer.byteLength(source) > MAX_SOURCE) return res.status(400).json({ error: 'source missing or over 64KB' });
  if (!Array.isArray(tests) || !tests.length || tests.length > MAX_TESTS) return res.status(400).json({ error: `tests must have 1-${MAX_TESTS} items` });
  for (const t of tests) {
    if (!t || typeof t.in !== 'string' || Buffer.byteLength(t.in) > MAX_STDIN) return res.status(400).json({ error: 'each test needs a string "in" up to 256KB' });
  }
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const timeLimitMs = Math.min(10000, Math.max(500, num(b.timeLimitMs, 2000)));
  const memoryLimitKb = Math.min(512000, Math.max(16384, num(b.memoryLimitKb, 262144)));

  const base = (process.env.JUDGE0_URL || 'https://ce.judge0.com').replace(/\/+$/, '');
  const key = process.env.JUDGE0_KEY;
  const run = (t) => runOne(base, key, lang, source, t.in, timeLimitMs, memoryLimitKb);

  const results = new Array(tests.length);
  // First test alone: a compile error applies to every test, so skip the rest.
  results[0] = await run(tests[0]);
  if (results[0].status === 'ce') {
    for (let i = 1; i < tests.length; i++) results[i] = { ...results[0] };
    return res.status(200).json({ results });
  }
  let next = 1;
  const worker = async () => {
    while (next < tests.length) { const i = next++; results[i] = await run(tests[i]); }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tests.length - 1) }, worker));
  return res.status(200).json({ results });
}
