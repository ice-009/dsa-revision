import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderMore)
export default function More() {
  useApp();
  return <><h1>More</h1><p className="sub">Coming soon.</p></>;
}
