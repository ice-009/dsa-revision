// Competitive-programming autocomplete for Monaco (cpp, java, python, javascript).
// No language server in the browser, so this is a curated symbol library + light
// regex type inference for member completion, snippets, signature help and hover.
import * as cpp from './cfcomplete-data/cpp.js';
import * as java from './cfcomplete-data/java.js';
import * as py from './cfcomplete-data/python.js';
import * as js from './cfcomplete-data/js.js';

export const EDITOR_OPTIONS = {
  quickSuggestions: { other: true, comments: false, strings: false },
  quickSuggestionsDelay: 10,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  snippetSuggestions: 'top',
  wordBasedSuggestions: 'currentDocument',
  parameterHints: { enabled: true, cycle: true },
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoSurround: 'languageDefined',
  formatOnType: true,
  formatOnPaste: true,
  bracketPairColorization: { enabled: true },
  guides: { indentation: true, bracketPairs: true },
  smoothScrolling: true,
  cursorSmoothCaretAnimation: 'on',
  renderLineHighlight: 'all',
  suggest: {
    showIcons: true, showStatusBar: true, preview: true, showSnippets: true, showWords: true,
    showMethods: true, showFunctions: true, showClasses: true, showKeywords: true,
    showFields: true, showVariables: true, showConstants: true, showModules: true,
    showProperties: true, showStructs: true, showInterfaces: true, localityBonus: true,
  },
  minimap: { enabled: false },
  padding: { top: 12, bottom: 12 },
  scrollBeyondLastLine: false,
  matchBrackets: 'always',
  folding: true,
  lineNumbersMinChars: 3,
  fontLigatures: false,
};

// ---------- data parsing ----------
const hasParen = (e) => new RegExp('\\b' + e.label.replace(/[$]/g, '\\$') + '\\s*\\(').test(e.detail || '');

function parse(text, defKind) {
  const out = [];
  let kind = defKind;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('## ')) { kind = line.slice(3).trim(); continue; }
    const [label, detail = '', doc = '', insert] = line.split(' :: ');
    const e = { label, detail, doc, insert, kind };
    if ((e.kind === 'Function' || e.kind === 'Method') && detail && !hasParen(e) && !insert) e.kind = 'Property';
    out.push(e);
  }
  return out;
}
const parseMap = (obj, kind) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, parse(v, kind)]));
const body = (s) => s.replace(/@/g, '$');
const plain = (s) => s.replace(/@\{\d+:([^}]*)\}/g, '$1').replace(/@\{\d+\|([^,|}]*)[^}]*\}/g, '$1').replace(/@\d/g, '');

const LANGS = {};
function build(id, d, o) {
  const members = parseMap(d.members, 'Method');
  const statics = d.statics ? parseMap(d.statics, 'Function') : {};
  const globals = parse(d.globals, 'Function');
  const snippets = d.snippets.map(([prefix, desc, text]) => ({ prefix, desc, text }));
  LANGS[id] = { id, d, members, statics, globals, snippets, ...o };
}
build('cpp', cpp, { triggers: ['.', ':', '>', '<', '#'], hl: 'cpp', typeOf: cpp.TYPE_OF });
build('java', java, { triggers: ['.', ' '], hl: 'java', typeOf: java.TYPE_OF });
build('python', { ...py, statics: py.modules }, { triggers: ['.', ' '], hl: 'python' });
build('javascript', js, { triggers: ['.'], hl: 'javascript' });

// ---------- type inference ----------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function lastBy(cands, off) {
  const before = cands.filter((c) => c.idx < off);
  const pool = before.length ? before : cands;
  return pool.length ? pool.reduce((a, b) => (b.idx >= a.idx ? b : a)).type : null;
}
function inferCpp(text, name, off) {
  if (cpp.SPECIAL_VARS[name]) return cpp.SPECIAL_VARS[name];
  const alias = {};
  for (const m of text.matchAll(/\busing\s+(\w+)\s*=\s*(?:std::)?(\w+)/g)) alias[m[1]] = m[2];
  for (const m of text.matchAll(/\btypedef\s+(?:std::)?(\w+)[^;]*?\s(\w+)\s*;/g)) alias[m[2]] = m[1];
  const re = new RegExp('(?:^|[^\\w.])((?:std::)?[A-Za-z_]\\w*)\\s*(?:<[^;(){}]*?>)?\\s*[&*]*\\s*\\b' + esc(name) + '\\b\\s*(?=[;=,(){\\[:)])', 'g');
  const cands = [];
  for (const m of text.matchAll(re)) {
    let t = m[1].replace(/^std::/, '');
    t = alias[t] || t;
    const ty = cpp.TYPE_OF[t];
    if (ty) cands.push({ idx: m.index, type: ty });
  }
  return lastBy(cands, off);
}
function inferJava(text, name, off) {
  const n = esc(name), cands = [];
  for (const m of text.matchAll(new RegExp('\\b[A-Za-z_]\\w*\\s*(?:<[^;(){}=]*?>)?\\s*(?:\\[\\s*\\]\\s*)+' + n + '\\b', 'g'))) cands.push({ idx: m.index, type: 'array' });
  for (const m of text.matchAll(new RegExp('(?:^|[^\\w.])([A-Z]\\w*)\\s*(?:<[^;(){}=]*?>)?\\s+' + n + '\\b(?=\\s*[;=,):])', 'g')))
    if (java.TYPE_OF[m[1]]) cands.push({ idx: m.index, type: java.TYPE_OF[m[1]] });
  for (const m of text.matchAll(new RegExp('\\b' + n + '\\s*=\\s*new\\s+([A-Z]\\w*)', 'g')))
    if (java.TYPE_OF[m[1]]) cands.push({ idx: m.index, type: java.TYPE_OF[m[1]] });
  for (const m of text.matchAll(new RegExp('\\b' + n + '\\s*=\\s*new\\s+\\w+\\s*\\[', 'g'))) cands.push({ idx: m.index, type: 'array' });
  return lastBy(cands, off);
}
function inferByRhs(rules, re) {
  return (text, name, off) => {
    const cands = [];
    for (const m of text.matchAll(re(esc(name)))) {
      const rhs = m[1].trim();
      for (const [r, ty] of rules) if (r.test(rhs)) { cands.push({ idx: m.index, type: ty }); break; }
    }
    return lastBy(cands, off);
  };
}
LANGS.cpp.infer = inferCpp;
LANGS.java.infer = inferJava;
LANGS.python.infer = inferByRhs(py.RHS_TYPES, (n) => new RegExp('^[ \\t]*' + n + '[ \\t]*(?::[^=\\n]+)?=(?!=)[ \\t]*(.+)$', 'gm'));
LANGS.javascript.infer = inferByRhs(js.RHS_TYPES, (n) => new RegExp('\\b' + n + '\\s*=(?!=)\\s*(.+)$', 'gm'));

// Most-used members float to the top of a member list.
const HOT_LIST = ('push_back emplace_back pop_back size empty begin end front back insert erase find count top pop push emplace clear substr lower_bound upper_bound first second append add get put contains containsKey getOrDefault length keys values items split join strip append popleft appendleft heappush'.split(' '));
const HOT = new Map(HOT_LIST.map((w, i) => [w, i]));

// ---------- helpers ----------
const CHAIN = /((?:[A-Za-z_]\w*(?:\s*\[[^\]]*\])*\s*(?:\.|->)\s*)*[A-Za-z_]\w*)((?:\s*\[[^\]]*\])*)\s*$/;

// Returns { entries, tier } for member access `recv.`
function memberEntries(L, text, off, beforeDot) {
  const m = CHAIN.exec(beforeDot);
  const union = () => {
    const seen = new Set(), res = [];
    for (const list of Object.values(L.members)) for (const e of list) if (!seen.has(e.label)) { seen.add(e.label); res.push(e); }
    return res;
  };
  if (!m) {
    if (/[)\]]\s*$/.test(beforeDot)) return { entries: union(), tier: '6' };
    return null;
  }
  const chain = m[1].replace(/\s+/g, ''), indexed = !!m[2].trim();
  if (!indexed && L.statics[chain]) return { entries: L.statics[chain], tier: '1' };
  const last = chain.split(/\.|->/).pop();
  if (!indexed && !chain.includes('.') && !chain.includes('->')) {
    const ty = L.infer(text, last, off);
    if (ty && L.members[ty]) {
      let es = L.members[ty];
      if (L.id === 'cpp' && ty === 'pair') es = L.members.pair;
      return { entries: es, tier: '1' };
    }
  }
  const es = union();
  return { entries: es, tier: '6' };
}

export function registerCompletions(monaco) {
  if (!monaco || !monaco.languages) return () => {};
  if (monaco.__cfcompleteDispose) return monaco.__cfcompleteDispose;
  const K = monaco.languages.CompletionItemKind;
  const SNIP = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
  const disposables = [];

  const kindOf = (k) => K[k] ?? K.Text;
  const mdFor = (L, e) => {
    const sigs = (e.detail || '').split(' | ').filter(Boolean);
    let v = sigs.length ? '```' + L.hl + '\n' + sigs.join('\n') + '\n```\n\n' : '';
    return { value: v + (e.doc || '') };
  };
  function toItem(L, e, range, tier, tag) {
    const kind = e.kind;
    let insert = e.insert ? body(e.insert) : e.label;
    let rules;
    if (e.insert) rules = SNIP;
    else if ((kind === 'Function' || kind === 'Method') && hasParen(e)) {
      const empty = new RegExp('\\b' + e.label + '\\s*\\(\\s*\\)').test(e.detail.split(' | ')[0]);
      insert = e.label + (empty ? '()$0' : '($0)');
      rules = SNIP;
    }
    const sigs = (e.detail || '').split(' | ');
    const detail = sigs[0] + (sigs.length > 1 ? `  (+${sigs.length - 1} overload${sigs.length > 2 ? 's' : ''})` : '');
    return {
      label: e.label, kind: kindOf(kind), detail, documentation: mdFor(L, e), insertText: insert,
      insertTextRules: rules, range, filterText: e.label,
      sortText: (kind === 'Keyword' ? '8' : tier === '1' && HOT.has(e.label) ? '0' + String(HOT.get(e.label)).padStart(3, '0') + '~' : tier) + e.label,
    };
  }
  function snippetItems(L, range) {
    return L.snippets.map((s) => ({
      label: s.prefix, kind: K.Snippet, detail: s.desc,
      documentation: { value: '```' + L.hl + '\n' + plain(s.text) + '\n```' },
      insertText: body(s.text), insertTextRules: SNIP, range, sortText: '0' + s.prefix, filterText: s.prefix,
    }));
  }
  const wordRange = (model, pos) => {
    const w = model.getWordUntilPosition(pos);
    return { startLineNumber: pos.lineNumber, endLineNumber: pos.lineNumber, startColumn: w.startColumn, endColumn: pos.column };
  };

  function provide(L) {
    return (model, pos, ctx) => {
      const line = model.getLineContent(pos.lineNumber);
      const w = model.getWordUntilPosition(pos);
      const before = line.slice(0, w.startColumn - 1);
      const range = wordRange(model, pos);
      const trig = ctx && ctx.triggerCharacter;
      const none = { suggestions: [] };
      const text = model.getValue();
      const off = model.getOffsetAt(pos);

      // comments
      if (/\/\/[^'"]*$/.test(before) && L.id !== 'python') return none;
      if (L.id === 'python' && /#[^'"]*$/.test(before)) return none;

      if (L.id === 'cpp') {
        const inc = /^\s*#\s*include\s*([<"])([^>"]*)$/.exec(before);
        if (inc) {
          const start = before.length - inc[2].length + 1;
          const closed = line.slice(pos.column - 1).startsWith(inc[1] === '<' ? '>' : '"');
          const r = { startLineNumber: pos.lineNumber, endLineNumber: pos.lineNumber, startColumn: start, endColumn: pos.column + (closed ? 1 : 0) };
          return { suggestions: cpp.headers.map((h) => ({ label: h, kind: K.File, insertText: h + (inc[1] === '<' ? '>' : '"'), range: r, filterText: h, sortText: h === 'bits/stdc++.h' ? '0' : '1' + h, detail: 'header' })) };
        }
        const pre = /^\s*(#\s*)(\w*)$/.exec(line.slice(0, pos.column - 1));
        if (pre) {
          const r = { startLineNumber: pos.lineNumber, endLineNumber: pos.lineNumber, startColumn: line.indexOf('#') + 1, endColumn: pos.column };
          const mk = (l, t, d) => ({ label: '#' + l, kind: K.Keyword, insertText: t, insertTextRules: SNIP, range: r, detail: d, filterText: '#' + l, sortText: '0' + l });
          return { suggestions: [
            mk('include', '#include <${1:bits/stdc++.h}>', 'include a header'),
            mk('define', '#define ${1:NAME} ${2:value}', 'macro'),
            mk('pragma once', '#pragma once', 'include guard'),
            mk('pragma GCC optimize', '#pragma GCC optimize("O3,unroll-loops")', 'speed hint'),
            mk('ifdef', '#ifdef ${1:LOCAL}\n    $0\n#endif', 'conditional'),
          ] };
        }
        if (trig === '<' || (trig === '>' && !/->\s*$/.test(before))) return none;
        if (trig === ':' && !/::\s*$/.test(before)) return none;
        if (trig === '#') return none;
        const scope = /([A-Za-z_]\w*)(?:<[^;>]*>)?\s*::\s*$/.exec(before);
        if (scope) {
          const q = scope[1];
          const r = (arr) => ({ suggestions: parse(arr, 'Function').map((e) => toItem(L, e, range, '1')) });
          if (q === 'std') return { suggestions: L.globals.filter((e) => e.kind !== 'Keyword').map((e) => toItem(L, e, range, '3')) };
          if (q === 'ios' || q === 'ios_base') return r('sync_with_stdio :: bool sync_with_stdio(bool sync) :: Fast I/O: ios::sync_with_stdio(false). Do not mix cin/scanf afterwards.');
          if (q === 'numeric_limits') return r('max :: T max() :: Largest finite value.\nmin :: T min() :: Smallest positive (floats) / lowest (ints).\nlowest :: T lowest() :: Most negative value.\ninfinity :: T infinity() :: Floating infinity.');
          if (q === 'chrono') return r('steady_clock :: class steady_clock :: Monotonic clock.\nsystem_clock :: class system_clock :: Wall clock.\nduration_cast :: duration_cast<D>(d) :: Convert durations.');
          if (q === 'string') return r('npos :: static const size_t npos :: Not-found value of string::find.');
          return none;
        }
      }
      if (L.id === 'java') {
        if (/\bnew\s+$/.test(before)) {
          const mk = (l, t, d) => ({ label: l, kind: K.Constructor, insertText: t, insertTextRules: SNIP, range, detail: d, sortText: '0' + l, filterText: l });
          return { suggestions: [
            mk('ArrayList', 'ArrayList<>($0)', 'new ArrayList<>()'), mk('LinkedList', 'LinkedList<>($0)', 'new LinkedList<>()'),
            mk('HashMap', 'HashMap<>($0)', 'new HashMap<>()'), mk('TreeMap', 'TreeMap<>($0)', 'new TreeMap<>()'),
            mk('HashSet', 'HashSet<>($0)', 'new HashSet<>()'), mk('TreeSet', 'TreeSet<>($0)', 'new TreeSet<>()'),
            mk('PriorityQueue', 'PriorityQueue<>($0)', 'min-heap; pass a comparator for max-heap'), mk('ArrayDeque', 'ArrayDeque<>($0)', 'fast deque / stack / queue'),
            mk('StringBuilder', 'StringBuilder($0)', 'mutable string'), mk('Scanner', 'Scanner(System.in)', 'stdin scanner'),
            mk('StringTokenizer', 'StringTokenizer(${1:line})', 'token splitter'), mk('int[]', 'int[${1:n}]', 'int array'),
            mk('long[]', 'long[${1:n}]', 'long array'), mk('boolean[]', 'boolean[${1:n}]', 'boolean array'),
            mk('int[][]', 'int[${1:n}][${2:m}]', '2D int array'), mk('String[]', 'String[${1:n}]', 'String array'),
          ] };
        }
        if (trig === ' ') return none;
      }
      if (L.id === 'python') {
        const imp = /^\s*from\s+([\w.]+)\s+import\s+[\w,\s]*$/.exec(before);
        if (imp) {
          const es = L.statics[imp[1]];
          return es ? { suggestions: es.map((e) => ({ ...toItem(L, { ...e, kind: e.kind === 'Property' ? 'Constant' : e.kind }, range, '1'), insertText: e.label, insertTextRules: undefined })) } : none;
        }
        const mod = /^\s*(import|from)\s+[\w,\s]*$/.exec(before);
        if (mod) {
          return { suggestions: Object.keys(py.modules).filter((k) => !k.includes('.')).map((k) => ({ label: k, kind: K.Module, detail: 'module', documentation: py.moduleDocs[k] || '', insertText: k + (mod[1] === 'from' ? ' import ' : ''), range, sortText: '0' + k })) };
        }
        if (trig === ' ') return none;
      }

      // member access
      const dot = /(\.|->)\s*$/.exec(before);
      if (dot) {
        const r = memberEntries(L, text, off, before.slice(0, before.length - dot[0].length));
        if (!r) return none;
        let entries = r.entries;
        if (L.id === 'cpp' && dot[1] === '->' && r.tier === '6') entries = [...L.members.pair, ...entries];
        return { suggestions: entries.map((e) => toItem(L, e, range, r.tier)) };
      }
      if (trig) return none;
      if (/->\s*$/.test(before)) return none;

      // numbers like 1.5
      if (/\d$/.test(before) && !w.word) return none;

      const lib = L.globals.map((e) => toItem(L, e, range, '3'));
      // Monaco only falls back to its own word list when NO provider returns items, so
      // the user's own identifiers are supplied here to keep them in the list.
      const wEnd = (model.getWordAtPosition(pos) || { endColumn: pos.column }).endColumn;
      const rest = text.slice(0, off - w.word.length) + ' ' + text.slice(off + (wEnd - pos.column));
      const known = new Set(lib.map((i) => i.label));
      for (const sn of L.snippets) known.add(sn.prefix);
      const words = [];
      for (const m of rest.matchAll(/[A-Za-z_$][\w$]{1,}/g)) {
        if (known.has(m[0])) continue;
        known.add(m[0]);
        if (words.length < 400) words.push({ label: m[0], kind: K.Variable, insertText: m[0], range, sortText: '2' + m[0], detail: 'in this file' });
      }
      return { suggestions: [...snippetItems(L, range), ...words, ...lib] };
    };
  }

  // ----- signature help -----
  const NOT_CALL = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'sizeof', 'def', 'elif', 'and', 'or', 'not', 'in', 'is', 'function']);
  function splitParams(sig) {
    const open = sig.indexOf('(');
    if (open < 0) return null;
    let depth = 0, end = -1, q = null;
    for (let i = open; i < sig.length; i++) {
      const c = sig[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end < 0) end = sig.length;
    const inner = sig.slice(open + 1, end);
    const params = [];
    let d = 0, start = 0; q = null;
    for (let i = 0; i <= inner.length; i++) {
      const c = inner[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c && '(<[{'.includes(c)) d++;
      else if (c && ')>]}'.includes(c)) d--;
      else if (i === inner.length || (c === ',' && d === 0)) {
        const raw = inner.slice(start, i), t = raw.trim();
        if (t) params.push(t);
        start = i + 1;
      }
    }
    return params;
  }
  function callContext(text, off) {
    const from = Math.max(0, off - 4000);
    const s = text.slice(from, off);
    const stack = [];
    let q = null;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === '(' || c === '[' || c === '{') stack.push({ c, pos: i, commas: 0 });
      else if (c === ')' || c === ']' || c === '}') stack.pop();
      else if (c === ',' && stack.length) stack[stack.length - 1].commas++;
    }
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].c !== '(') continue;
      const m = /([A-Za-z_][\w]*(?:\s*(?:\.|->|::)\s*[A-Za-z_]\w*)*)\s*$/.exec(s.slice(0, stack[i].pos));
      if (!m) return null;
      const parts = m[1].split(/\s*(?:\.|->|::)\s*/);
      const fname = parts[parts.length - 1];
      if (NOT_CALL.has(fname)) return null;
      return { fname, qualifier: parts.length > 1 ? parts.slice(0, -1).join('.') : null, active: stack[i].commas, sep: m[1].includes('::') ? '::' : '.' };
    }
    return null;
  }
  function lookup(L, text, off, qualifier, name) {
    const hit = (list) => list && list.filter((e) => e.label === name);
    let es;
    if (qualifier) {
      if (qualifier === 'std') es = hit(L.globals);
      else if (L.statics[qualifier]) es = hit(L.statics[qualifier]);
      else if (!qualifier.includes('.')) {
        const ty = L.infer(text, qualifier, off);
        if (ty) es = hit(L.members[ty]);
      }
    }
    if (!es || !es.length) es = hit(L.globals);
    if (!es || !es.length) { es = []; for (const list of Object.values(L.members)) es.push(...hit(list)); }
    return es;
  }
  function sigProvider(L) {
    return {
      signatureHelpTriggerCharacters: ['(', ','],
      signatureHelpRetriggerCharacters: [')'],
      provideSignatureHelp(model, pos) {
        const off = model.getOffsetAt(pos), text = model.getValue();
        const ctx = callContext(text, off);
        if (!ctx) return null;
        const es = lookup(L, text, off, ctx.qualifier, ctx.fname);
        const sigs = [], seen = new Set();
        for (const e of es) for (const d of e.detail.split(' | ')) {
          if (seen.has(d)) continue;
          const params = splitParams(d);
          if (!params) continue;
          seen.add(d);
          sigs.push({ label: d, documentation: { value: e.doc || '' }, parameters: params.map((p) => ({ label: p })), n: params.length, variadic: /\.\.\.|^\*/.test(params[params.length - 1] || '') });
        }
        if (!sigs.length) return null;
        let idx = sigs.findIndex((s) => s.n > ctx.active || s.variadic);
        if (idx < 0) idx = 0;
        const sig = sigs[idx];
        const ps = sig.parameters.map((x) => x.label);
        const vi = ps.findIndex((x) => /^\*[^*]|\.\.\./.test(x));
        let active = Math.min(ctx.active, Math.max(sig.n - 1, 0));
        if (vi >= 0 && ctx.active >= vi && ps.slice(vi + 1).every((x) => /=|\*\*/.test(x))) active = vi;
        return {
          value: { signatures: sigs.map(({ label, documentation, parameters }) => ({ label, documentation, parameters })), activeSignature: idx, activeParameter: active },
          dispose() {},
        };
      },
    };
  }

  // ----- hover -----
  function hoverProvider(L) {
    return {
      provideHover(model, pos) {
        const w = model.getWordAtPosition(pos);
        if (!w) return null;
        const line = model.getLineContent(pos.lineNumber);
        const before = line.slice(0, w.startColumn - 1);
        const q = /([A-Za-z_]\w*(?:\s*(?:\.|->)\s*[A-Za-z_]\w*)*)\s*(?:\.|->|::)\s*$/.exec(before);
        const qualifier = q ? q[1].replace(/\s+/g, '').replace(/->/g, '.') : null;
        const text = model.getValue(), off = model.getOffsetAt(pos);
        let es = lookup(L, text, off, qualifier, w.word);
        es = (es || []).filter((e) => e.kind !== 'Keyword' && (e.detail || e.doc));
        if (!es.length) return null;
        const e = es[0];
        return {
          range: { startLineNumber: pos.lineNumber, endLineNumber: pos.lineNumber, startColumn: w.startColumn, endColumn: w.endColumn },
          contents: [mdFor(L, e)],
        };
      },
    };
  }

  for (const L of Object.values(LANGS)) {
    disposables.push(monaco.languages.registerCompletionItemProvider(L.id, { triggerCharacters: L.triggers, provideCompletionItems: provide(L) }));
    disposables.push(monaco.languages.registerSignatureHelpProvider(L.id, sigProvider(L)));
    disposables.push(monaco.languages.registerHoverProvider(L.id, hoverProvider(L)));
  }
  const dispose = () => {
    for (const d of disposables) { try { d.dispose(); } catch { /* ignore */ } }
    disposables.length = 0;
    try { delete monaco.__cfcompleteDispose; } catch { monaco.__cfcompleteDispose = null; }
  };
  try { monaco.__cfcompleteDispose = dispose; } catch { /* frozen */ }
  return dispose;
}
