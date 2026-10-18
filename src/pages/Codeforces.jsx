import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (new)
export default function Codeforces() {
  useApp();
  return <><h1>Codeforces</h1><p className="sub">Coming soon.</p></>;
}
