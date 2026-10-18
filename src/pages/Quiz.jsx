import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderQuiz)
export default function Quiz() {
  useApp();
  return <><h1>Quiz</h1><p className="sub">Coming soon.</p></>;
}
