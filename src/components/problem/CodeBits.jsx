// Private language tabs + highlighted code block for the problem page.
import { useApp, set } from '../../lib/store';
import { useMyCode } from '../../lib/store';
import { SOLUTIONS, TOPIC_BY_SLUG } from '../../data';
import { highlight } from '../../lib/util.jsx';
import { toast } from '../../lib/toast';

export const LANGS = [['cpp', 'C++'], ['java', 'Java'], ['js', 'JS']];
export const LANG_NAME = Object.fromEntries(LANGS);

export function ProbLangTabs() {
  const S = useApp();
  return (
    <div className="segmented lang-tabs" role="tablist">
      {LANGS.map(([v, l]) => (
        <button key={v} type="button" role="tab" aria-selected={S.lang === v} className={S.lang === v ? 'on' : ''} onClick={() => set({ lang: v })}>{l}</button>
      ))}
    </div>
  );
}

// src: "sol:<n>", "tpl:<slug>", "mine:<n>" (your code as reviewed) or "raw:<n>" (exactly what you wrote)
export function codeFor(src, MyCode, lang) {
  const [kind, id] = src.split(':');
  if (kind === 'mine') {
    const r = MyCode.review(id);
    return r && r.code ? r.code[lang] || r.code[r.lang] || '' : '';
  }
  if (kind === 'raw') return MyCode.get(id)?.code || '';
  const code = kind === 'sol' ? SOLUTIONS[id]?.code : TOPIC_BY_SLUG[id]?.template;
  return (code && (code[lang] || code.cpp)) || '';
}

export function CodeBlock({ src }) {
  const S = useApp();
  const MyCode = useMyCode();
  const code = codeFor(src, MyCode, S.lang);
  const copy = () => {
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
      .then(() => toast('Code copied'), () => toast('Copy not available here'));
  };
  return (
    <div className="code-wrap">
      <div className="row code-bar"><ProbLangTabs /><span className="spacer" />
        <button type="button" className="btn small ghost" onClick={copy}>Copy</button></div>
      <pre className="code" dangerouslySetInnerHTML={{ __html: highlight(code) }} />
    </div>
  );
}
