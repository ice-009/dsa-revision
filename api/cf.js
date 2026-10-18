// Codeforces problem fetcher. Builds the codeforces.com URL itself from contest+index
// (never fetches user-supplied URLs), falls back to r.jina.ai when CF blocks the IP.
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const MAX_HTML = 6 * 1024 * 1024; // upstream page cap
const MAX_RESPONSE = 1024 * 1024; // JSON cap

const ALLOWED = new Set(['p', 'div', 'span', 'ul', 'ol', 'li', 'b', 'i', 'em', 'strong', 'sub', 'sup', 'code', 'pre', 'br', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'center', 'a']);
const VOID = new Set(['br', 'img']);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function parseInput(q) {
  let s = String(q || '').trim();
  if (!s || s.length > 200) return null;
  let m;
  if ((m = s.match(/^https?:\/\/(?:www\.)?codeforces\.com\/(?:problemset\/problem|contest|gym)\/(\d{1,5})\/(?:problem\/)?([A-Za-z][A-Za-z0-9]?)\/?(?:[?#].*)?$/i))) {
    if (/\/gym\//i.test(s)) return null;
  } else if (!(m = s.match(/^(\d{1,5})\s*\/?\s*([A-Za-z][A-Za-z0-9]?)$/))) {
    return null;
  }
  const index = m[2].toUpperCase();
  if (!/^[A-Z][0-9]?$/.test(index)) return null;
  return { contest: Number(m[1]), index };
}

function sanitizeNode(node, out) {
  if (node.type === 'text') { out.push(escText(node.data)); return; }
  if (node.type !== 'tag') return; // comments, scripts (type 'script'), styles ('style') dropped
  const name = node.name.toLowerCase();
  if (!ALLOWED.has(name)) {
    if (['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'svg', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'template'].includes(name)) return;
    for (const c of node.children || []) sanitizeNode(c, out); // unwrap unknown tags
    return;
  }
  const a = node.attribs || {};
  let attrs = '';
  if (a.class && /^[\w -]+$/.test(a.class)) attrs += ` class="${esc(a.class)}"`;
  if (name === 'img') {
    let src = (a.src || '').trim();
    if (src.startsWith('//')) src = 'https:' + src;
    else if (src.startsWith('/')) src = 'https://codeforces.com' + src;
    if (!/^https?:\/\//i.test(src)) return;
    attrs += ` src="${esc(src)}"`;
    if (a.alt) attrs += ` alt="${esc(a.alt)}"`;
  }
  if (name === 'a') {
    const href = (a.href || '').trim();
    if (/^https?:\/\//i.test(href)) attrs += ` href="${esc(href)}" rel="noopener noreferrer" target="_blank"`;
  }
  if (VOID.has(name)) { out.push(`<${name}${attrs}>`); return; }
  out.push(`<${name}${attrs}>`);
  for (const c of node.children || []) sanitizeNode(c, out);
  out.push(`</${name}>`);
}

function sanitizeChildren($, el) {
  const out = [];
  for (const c of el.contents().toArray()) sanitizeNode(c, out);
  return out.join('').trim();
}

function preText($, pre) {
  const lines = pre.find('.test-example-line');
  let text;
  if (lines.length) {
    text = lines.toArray().map((l) => $(l).text()).join('\n');
  } else {
    const c = pre.clone();
    c.find('br').replaceWith('\n');
    text = c.text();
  }
  text = text.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
  return text + '\n';
}

async function get(url, ms, headers = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) return { ok: false, status: r.status };
    const text = await r.text();
    return { ok: true, text: text.slice(0, MAX_HTML) };
  } catch (e) {
    return { ok: false, error: String(e && e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

async function fetchHtml(contest, index) {
  const target = `https://codeforces.com/problemset/problem/${contest}/${index}`;
  const direct = await get(target, 8000, { Accept: 'text/html' });
  if (direct.ok && direct.text.includes('class="problem-statement"')) return direct.text;
  const via = await get(`https://r.jina.ai/${target}`, 25000, { 'X-Return-Format': 'html' });
  if (via.ok && via.text.includes('class="problem-statement"')) return via.text;
  return null;
}

async function fetchMeta(contest, index) {
  // standings now only allows the bare form for non-admins; problemset.problems (2MB) is the fallback.
  const pick = async (url, ms, list) => {
    try {
      const r = await get(url, ms);
      if (!r.ok) return null;
      const j = JSON.parse(r.text);
      const p = list(j).find((x) => Number(x.contestId ?? contest) === contest && String(x.index).toUpperCase() === index);
      if (!p) return null;
      return { rating: typeof p.rating === 'number' ? p.rating : null, tags: Array.isArray(p.tags) ? p.tags.map(String) : [] };
    } catch { return null; }
  };
  return (await pick(`https://codeforces.com/api/contest.standings?contestId=${contest}`, 6000, (j) => j.result?.problems || []))
    || (await pick('https://codeforces.com/api/problemset.problems', 10000, (j) => j.result?.problems || []));
}

function propText($, el) {
  const c = el.clone();
  c.find('.property-title').remove();
  return c.text().replace(/\s+/g, ' ').trim();
}

export function parseProblem(html, contest, index) {
  const $ = cheerio.load(html);
  const ps = $('.problem-statement').first();
  if (!ps.length) return null;
  const header = ps.children('.header').first();
  const name = header.find('.title').first().text().trim().replace(/^[A-Za-z]\d?\.\s*/, '');
  const timeLimit = propText($, header.find('.time-limit').first());
  const memoryLimit = propText($, header.find('.memory-limit').first());

  // legend = first classless child div after the header
  let legendEl = null;
  ps.children('div').each((_, d) => { if (!legendEl && !$(d).attr('class')) legendEl = $(d); });
  const legend = legendEl ? sanitizeChildren($, legendEl) : '';

  const spec = (sel) => {
    const el = ps.children(sel).first();
    if (!el.length) return '';
    const c = el.clone();
    c.children('.section-title').remove();
    return sanitizeChildren($, c);
  };

  const samples = [];
  ps.find('.sample-test').first().each((_, st) => {
    const ins = $(st).find('.input pre').toArray();
    const outs = $(st).find('.output pre').toArray();
    for (let i = 0; i < Math.min(ins.length, outs.length); i++) samples.push({ in: preText($, $(ins[i])), out: preText($, $(outs[i])) });
  });

  return {
    id: `${contest}${index}`, contest, index, name, rating: null, tags: [],
    url: `https://codeforces.com/problemset/problem/${contest}/${index}`,
    timeLimit, memoryLimit, legend,
    input: spec('.input-specification'), output: spec('.output-specification'),
    note: spec('.note'), samples, custom: false,
  };
}

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });
  const parsed = parseInput(req.query?.q);
  if (!parsed) return res.status(400).json({ error: 'expected a Codeforces problem id or URL, e.g. 1850A' });
  const { contest, index } = parsed;

  const [html, meta] = await Promise.all([fetchHtml(contest, index), fetchMeta(contest, index)]);
  if (!html) return res.status(502).json({ error: 'could not fetch problem from Codeforces', hint: 'add manually' });
  let p;
  try { p = parseProblem(html, contest, index); } catch { p = null; }
  if (!p || !p.name) return res.status(502).json({ error: 'could not parse problem page', hint: 'add manually' });
  if (meta) { p.rating = meta.rating; p.tags = meta.tags; }

  const body = JSON.stringify(p);
  if (body.length > MAX_RESPONSE) return res.status(502).json({ error: 'problem too large', hint: 'add manually' });
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).send(body);
}
