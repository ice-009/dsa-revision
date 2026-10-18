import { Link } from 'react-router-dom';
import { PLAYBOOK_HTML } from '../data';

const TOC = [['pb-study', 'How to study'], ['pb-method', 'Interview method'], ['pb-constraints', 'Constraints'], ['pb-cues', 'Which pattern?'],
  ['pb-stuck', 'When stuck'], ['pb-ds', 'Data structures'], ['pb-edge', 'Edge cases'], ['pb-recursion', 'Recursion'], ['pb-sources', 'Sources']];

export const jump = (e, id) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Playbook() {
  return (
    <>
      <Link to="/patterns" className="back">‹ Learn</Link>
      <header className="page-h"><h1>Interview playbook</h1>
        <p className="sub">How to study, how to run the interview, and the reference tables you’ll look at most.</p></header>
      <nav className="lesson-toc">{TOC.map(([id, l]) => <a key={id} href={`#${id}`} onClick={e => jump(e, id)}>{l}</a>)}</nav>
      <div className="playbook" dangerouslySetInnerHTML={{ __html: PLAYBOOK_HTML }} />
    </>
  );
}
