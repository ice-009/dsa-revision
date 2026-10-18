import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavFoot from './NavFoot';
import Toaster from './Toaster';
import { applyTheme, useApp } from '../lib/store';

// Which top-level tab owns each route
const TAB = { today: 'today', plan: 'today', review: 'review', quiz: 'review', parsons: 'review', mock: 'review',
  patterns: 'patterns', pattern: 'patterns', playbook: 'patterns', problems: 'problems', problem: 'problems',
  cf: 'cf', more: 'more' };

const I = d => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
const TABS = [
  ['today', '/today', 'Today', I(<><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /><circle cx="12" cy="12" r="4" /></>)],
  ['review', '/review', 'Review', I(<><rect x="3" y="6" width="14" height="14" rx="2" /><path d="M7 3h12a2 2 0 0 1 2 2v12" /></>)],
  ['patterns', '/patterns', 'Learn', I(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>)],
  ['problems', '/problems', 'Problems', I(<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>)],
  ['cf', '/cf', 'Codeforces', I(<><path d="M5 20V10M12 20V4M19 20v-7" /></>)],
  ['more', '/more', 'More', I(<><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>)],
];

export default function Shell() {
  const S = useApp();
  const { pathname } = useLocation();
  const page = pathname.split('/')[1] || 'today';
  useEffect(() => { applyTheme(); }, [S.theme]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const active = TAB[page];
  return (
    <div className="app">
      <nav className="nav" aria-label="Main">
        <div className="brand"><img src="/icons/icon-192.png" alt="" width="32" height="32" /><span>DSA Revise</span></div>
        {TABS.map(([k, to, label, icon]) => (
          <NavLink key={k} to={to} className={active === k ? 'active' : ''}>{icon}<span>{label}</span></NavLink>
        ))}
        <NavFoot />
      </nav>
      <main id="view" key={page} tabIndex={-1}><Outlet /></main>
      <Toaster />
    </div>
  );
}
