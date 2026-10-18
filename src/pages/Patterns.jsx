import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderPatterns)
export default function Patterns() {
  useApp();
  return <><h1>Learn</h1><p className="sub">Coming soon.</p></>;
}
