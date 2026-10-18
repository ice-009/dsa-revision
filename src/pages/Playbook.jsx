import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderPlaybook)
export default function Playbook() {
  useApp();
  return <><h1>Playbook</h1><p className="sub">Coming soon.</p></>;
}
