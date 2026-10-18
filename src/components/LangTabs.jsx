// Language switcher bound to S.lang (legacy langTabs/paintLang), plus a code block that follows it.
//   <LangTabs />                       segmented C++/Java/JS control; clicking sets S.lang and saves.
//   <CodeBlock src="tpl:<slug>" />     tabs + Copy + highlighted code. src is "sol:<n>", "tpl:<slug>",
//                                      "mine:<n>" (reviewed user code) or "raw:<n>" (user's raw code).
//   <CodeBlock src=... bar={false} />  omit the tabs/Copy bar.
//   codeFor(src, lang)                 returns the plain code string for a src.
import { useApp, useMyCode, save } from '../lib/store';
import { SOLUTIONS, TOPIC_BY_SLUG } from '../data';
import { highlight } from '../lib/util.jsx';
import { toast } from '../lib/toast';

export const LANGS = [['cpp', 'C++'], ['java', 'Java'], ['js', 'JS']];

export function LangTabs() {
  const S = useApp();
  return (
    <div className="segmented lang-tabs" role="tablist">
      {LANGS.map(([v, l]) => (
        <button key={v} type="button" className={S.lang === v ? 'on' : ''} onClick={() => { S.lang = v; save(); }}>{l}</button>
      ))}
    </div>
  );
}

export function codeFor(src, lang, MyCode) {
  const [kind, id] = src.split(':');
  if (kind === 'mine') {
    const r = MyCode.review(id);
    return r && r.code ? r.code[lang] || r.code[r.lang] || '' : '';
  }
  if (kind === 'raw') return MyCode.get(id)?.code || '';
  const code = kind === 'sol' ? SOLUTIONS[id]?.code : TOPIC_BY_SLUG[id]?.template;
  return (code && (code[lang] || code.cpp)) || '';
}

export function CodeBlock({ src, bar = true }) {
  const S = useApp();
  const MyCode = useMyCode();
  const code = codeFor(src, S.lang, MyCode);
  const copy = () => {
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
      .then(() => toast('Code copied'), () => toast('Copy not available here'));
  };
  return (
    <div className="code-wrap">
      {bar && (
        <div className="row code-bar">
          <LangTabs /><span className="spacer"></span>
          <button type="button" className="btn small ghost" onClick={copy}>Copy</button>
        </div>
      )}
      <pre className="code" dangerouslySetInnerHTML={{ __html: highlight(code) }} />
    </div>
  );
}

export default LangTabs;
