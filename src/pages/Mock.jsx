import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderMock)
export default function Mock() {
  useApp();
  return <><h1>Mock</h1><p className="sub">Coming soon.</p></>;
}
