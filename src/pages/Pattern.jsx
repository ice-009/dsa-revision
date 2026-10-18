import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderPattern)
export default function Pattern() {
  useApp();
  return <><h1>Pattern</h1><p className="sub">Coming soon.</p></>;
}
