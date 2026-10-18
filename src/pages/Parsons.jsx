import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderParsons)
export default function Parsons() {
  useApp();
  return <><h1>Parsons</h1><p className="sub">Coming soon.</p></>;
}
