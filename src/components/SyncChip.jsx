import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMyCode } from '../lib/store';

const ago = t => {
  const s = (Date.now() - t) / 1000;
  return s < 45 ? 'just now' : s < 5400 ? `${Math.max(1, Math.round(s / 60))}m ago` : s < 86400 * 1.5 ? `${Math.round(s / 3600)}h ago` : `${Math.round(s / 86400)}d ago`;
};

export default function SyncChip() {
  const MyCode = useMyCode();
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick(x => x + 1), 30000); return () => clearInterval(id); }, []);
  const st = MyCode.state;
  const [cls, text, title] = !MyCode.configured() ? ['off', 'Not syncing · set up', 'Progress lives on this device only — tap to connect your other devices']
    : st.busy ? ['busy', 'Syncing…', 'Syncing with your GitHub repo']
    : st.error ? ['err', 'Sync problem', st.error]
    : st.last ? ['ok', `Synced · ${ago(st.last)}`, `Last synced ${new Date(st.last).toLocaleString()} — tap to sync now`]
    : ['busy', 'Not synced yet', 'Waiting for the first sync — tap to sync now'];
  return (
    <Link className={`sync-chip ${cls}`} to="/more" title={title} onClick={() => { if (MyCode.configured() && !st.error) MyCode.sync(); }}>
      <i aria-hidden="true" /><span>{text}</span>
    </Link>
  );
}
