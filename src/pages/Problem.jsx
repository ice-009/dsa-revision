import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderProblem)
export default function Problem() {
  useApp();
  return <><h1>Problem</h1><p className="sub">Coming soon.</p></>;
}
