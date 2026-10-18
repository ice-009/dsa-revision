import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderPlan)
export default function Plan() {
  useApp();
  return <><h1>Your plan</h1><p className="sub">Coming soon.</p></>;
}
