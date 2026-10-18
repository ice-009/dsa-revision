// Day-by-day plan: every unsolved problem, in sheet order, spread evenly over the days left until S.planEnd.
// A missed day just raises the pace for every day after it. Today's list is fixed for the day.
import { PROBLEMS, WEEKS } from '../data';
import { S, save } from './store';
import { today, addDays, dayNum, PLAN_START, PLAN_END } from './dates';
import { toast } from './toast';

export function schedule(t = today(), want = S.planEnd) {
  const end = want && want >= t ? want : t;
  const daysLeft = dayNum(end) - dayNum(t) + 1;
  const isSolved = p => S.status[p.n] === 'solved';
  const doneToday = PROBLEMS.filter(p => isSolved(p) && S.solvedOn[p.n] === t);
  const left = PROBLEMS.filter(p => !isSolved(p));
  const pace = Math.ceil((left.length + doneToday.length) / daysLeft);
  const todo = left.slice(0, Math.max(0, pace - doneToday.length));
  const days = [{ date: t, done: doneToday, todo }];
  let rest = left.slice(todo.length);
  for (let d = 1; d < daysLeft && rest.length; d++) {
    const k = Math.ceil(rest.length / (daysLeft - d));
    days.push({ date: addDays(t, d), done: [], todo: rest.slice(0, k) });
    rest = rest.slice(k);
  }
  const wk = Math.min(WEEKS, Math.max(1, Math.floor((dayNum(t) - Date.UTC(...PLAN_START) / 864e5) / 7) + 1));
  return {
    end, daysLeft, pace,
    today: days[0],   // { date, done: [problem], todo: [problem] } — todo[0] is "do this now"
    days,             // today first, then one entry per future day that has problems
    left: left.length,
    behind: left.filter(p => p.week < wk).length, // unsolved from weeks the sheet has already passed
  };
}

// "3", or "2–3" when the problems don't split evenly over the days left
export const paceText = s => { const lo = Math.floor((s.left + s.today.done.length) / s.daysLeft); return lo && lo !== s.pace ? `${lo}–${s.pace}` : `${s.pace}`; };
export const planOptions = () => [[PLAN_END, 'Sheet end'], [addDays(PLAN_END, 7), '+1 week'], [addDays(PLAN_END, 14), '+2 weeks'], [addDays(PLAN_END, 28), '+4 weeks']]
  .filter(([d]) => d >= today());

export function setPlanEnd(v) {
  if (!/^\d{4}-\d\d-\d\d$/.test(v || '') || v < today()) { toast('Pick a date from today on'); return; }
  S.planEnd = v; save();
  toast(`Plan updated — ${paceText(schedule())} a day`);
}
