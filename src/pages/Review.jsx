import { useApp } from '../lib/store';

// TODO: port from legacy/app.js (renderReviewHome/renderReview)
export default function Review() {
  useApp();
  return <><h1>Review</h1><p className="sub">Coming soon.</p></>;
}
