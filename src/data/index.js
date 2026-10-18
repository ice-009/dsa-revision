// Content data. The generated files at the repo root still assign to window.* (scripts/ writes them),
// so we import them for their side effects and re-export typed constants.
import '../../mycode.js';
import '../../problems.js';
import '../../notes.js';
import '../../topics.js';
import '../../solutions.js';
import '../../explain.js';
import '../../lessons.js';
import '../../plus/plus1.js';
import '../../plus/plus2.js';
import '../../plus/plus3.js';
import '../../plus/plus4.js';
import '../../playbook.js';
import '../../viz.js';

export const ITEMS = window.ITEMS;
export const NOTES = window.NOTES;
export const SOLUTIONS = window.SOLUTIONS || {};
export const LESSONS = window.LESSONS || {};
export const PLUS = window.PLUS || {};
export const EXPLAIN = window.EXPLAIN || {};
export const PLAYBOOK_HTML = window.PLAYBOOK_HTML || '';
export const MyCode = window.MyCode;
export const getViz = () => window.Viz; // Viz.html(topic) / Viz.has(n) / Viz.htmlProblem(n) return HTML strings (players mount themselves)

export const WEEKS = Math.max(...ITEMS.map(i => i.week));
export const PROBLEMS = ITEMS.filter(i => i.kind === 'Practice');
export const BY_N = Object.fromEntries(ITEMS.map(i => [i.n, i]));
export const WEEK_DATES = Object.fromEntries(ITEMS.map(i => [i.week, i.dates]));

export const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const TOPICS = window.TOPICS;
export const TOPIC_BY_SLUG = {};
export const TOPIC_BY_NAME = {};
for (const t of TOPICS) {
  t.slug = slug(t.name);
  t.items = ITEMS.filter(i => i.topic === t.name);
  t.problems = t.items.filter(i => i.kind === 'Practice');
  t.learn = t.items.filter(i => i.kind === 'Learn');
  t.week = Math.min(...t.items.map(i => i.week));
  TOPIC_BY_SLUG[t.slug] = t;
  TOPIC_BY_NAME[t.name] = t;
}
