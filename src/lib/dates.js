// Dates are local calendar days as YYYY-MM-DD strings.
import { WEEKS } from '../data';

export const PLAN_START = [2026, 8, 20]; // 20 Sep 2026 (month is 0-based)
export const PLAN_END = '2026-11-21'; // default finish-by date: the sheet's last day

export const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = () => iso(new Date());
export const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
export const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return iso(new Date(y, m - 1, d + n)); };
export const planDay = () => dayNum(today()) - Date.UTC(...PLAN_START) / 864e5;
export const currentWeek = () => Math.min(WEEKS, Math.max(1, Math.floor(planDay() / 7) + 1));
export const fmtDay = (s, o = { weekday: 'short', day: 'numeric', month: 'short' }) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, o);
};
export const fmtShort = s => fmtDay(s, { day: 'numeric', month: 'short' });
export const mondayOf = s => { const [y, m, d] = s.split('-').map(Number); return addDays(s, -((new Date(y, m - 1, d).getDay() + 6) % 7)); };
