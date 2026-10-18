// Right-top: language bar, Monaco (or plain textarea) and a status bar.
import { lazy, Suspense, useRef, useState } from 'react';
import { editorKeyDown } from '../problem/Mine.jsx';
import { CF_LANGS, MONACO_LANG } from '../../lib/cftemplates';
import { registerCompletions, EDITOR_OPTIONS } from '../../lib/cfcomplete';
import { copyText, Ico, ICONS, useDark } from './shared.jsx';

const Monaco = lazy(() => import('@monaco-editor/react'));
let registered = false;
const beforeMount = monaco => { if (!registered) { registered = true; try { registerCompletions(monaco); } catch (e) { /* completions are optional */ } } };

export default function EditorPane({ lang, pickLang, code, edit, reset, saved, cfg, usePlain, runHint }) {
  const dark = useDark();
  const [pos, setPos] = useState({ ln: 1, col: 1 });
  const ta = useRef(null);
  const taPos = () => {
    const el = ta.current; if (!el) return;
    const before = el.value.slice(0, el.selectionStart).split('\n');
    setPos({ ln: before.length, col: before[before.length - 1].length + 1 });
  };
  return (
    <div className="cfw-editor" style={{ '--cfs-fs': `${cfg.fs}px` }}>
      <div className="cfw-lbar">
        <div className="cfw-langs" role="group" aria-label="Language">
          {CF_LANGS.map(([v, l]) => <button key={v} type="button" className={lang === v ? 'on' : ''} aria-pressed={lang === v} onClick={() => pickLang(v)}>{l}</button>)}
        </div>
        <span className="spacer" />
        <button type="button" className="cfw-ibtn" onClick={reset} aria-label="Reset to template" title="Reset to starter template"><Ico d={ICONS.reset} s={16} /></button>
        <button type="button" className="cfw-ibtn" onClick={() => copyText(code, 'Code copied')} aria-label="Copy code" title="Copy code"><Ico d={ICONS.copy} s={16} /></button>
      </div>
      <div className="cfw-code">
        {usePlain ? (
          <textarea ref={ta} className="cfs-ta" value={code} onChange={e => { edit(e.target.value); taPos(); }} onKeyDown={editorKeyDown} onKeyUp={taPos} onClick={taPos} onSelect={taPos}
            aria-label={`${lang} code`} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" style={{ tabSize: cfg.tab }} />
        ) : (
          <Suspense fallback={<div className="cfs-loading muted" role="status">Loading editor…</div>}>
            <Monaco height="100%" language={MONACO_LANG[lang]} path={`cf-${lang}`} theme={dark ? 'vs-dark' : 'light'} value={code}
              beforeMount={beforeMount}
              onMount={ed => { ed.onDidChangeCursorPosition(e => setPos({ ln: e.position.lineNumber, col: e.position.column })); }}
              onChange={v => edit(v ?? '')}
              options={{
                minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 10, bottom: 10 },
                fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace', renderLineHighlight: 'line', smoothScrolling: true,
                ...EDITOR_OPTIONS,
                fontSize: cfg.fs, lineHeight: Math.round(cfg.fs * 1.6), tabSize: cfg.tab,
              }} />
          </Suspense>
        )}
      </div>
      <div className="cfw-status" role="status">
        <span>Ln {pos.ln}, Col {pos.col}</span>
        <span>{CF_LANGS.find(([k]) => k === lang)?.[1]}</span>
        <span className="spacer" />
        {usePlain && <span className="cfw-dim">Tab indents</span>}
        <span className="cfw-dim">{runHint}</span>
        <span className={`cfw-saved ${saved ? '' : 'pending'}`}>{saved ? 'Saved' : 'Saving…'}</span>
      </div>
    </div>
  );
}
