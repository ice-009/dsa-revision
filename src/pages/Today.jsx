import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderToday)
export default function Today() {
  useApp();
  return <><h1>Today</h1><p className="sub">Coming soon.</p></>;
}
