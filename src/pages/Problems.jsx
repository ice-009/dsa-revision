import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderProblems)
export default function Problems() {
  useApp();
  return <><h1>Problems</h1><p className="sub">Coming soon.</p></>;
}
