import { NOTES } from '../data';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// C++ / Java / JavaScript highlighter: returns an HTML string (use with dangerouslySetInnerHTML, or <Code>)
const KEYWORDS = 'auto|bool|boolean|break|case|catch|char|class|const|constexpr|continue|default|delete|do|double|else|' +
  'enum|extends|false|final|for|function|if|implements|import|in|instanceof|int|interface|let|long|new|null|nullptr|of|' +
  'private|protected|public|return|short|static|struct|switch|this|throw|true|try|typeof|uint32_t|undefined|unsigned|' +
  'using|var|void|while|Infinity|template|typename|decltype|get|set|size_t';
const CODE_RE = new RegExp(String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\x60(?:\\.|[^\x60\\])*\x60)|\b(${KEYWORDS})\b(?!\s*\()|\b(\d+(?:\.\d+)?)\b|\b([A-Z]\w*)\b|\b([A-Za-z_]\w*)(?=\s*\()`, 'g');
export const highlight = code => {
  let out = '', last = 0;
  code.replace(CODE_RE, (m, com, str, kw, num, type, fn, at) => {
    out += esc(code.slice(last, at));
    const cls = com ? 'c' : str ? 's' : kw ? 'k' : num ? 'n' : type ? 't' : 'f';
    out += `<span class="${cls}">${esc(m)}</span>`;
    last = at + m.length;
    return m;
  });
  return out + esc(code.slice(last));
};

export function Code({ code, className = '' }) {
  return <pre className={className}><code dangerouslySetInnerHTML={{ __html: highlight(code) }} /></pre>;
}

export const patOf = n => NOTES[n]?.pat;
