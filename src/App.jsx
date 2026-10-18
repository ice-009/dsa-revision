import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/Shell';
import Today from './pages/Today';
import Plan from './pages/Plan';
import Patterns from './pages/Patterns';
import Pattern from './pages/Pattern';
import Playbook from './pages/Playbook';
import Problems from './pages/Problems';
import Problem from './pages/Problem';
import Review from './pages/Review';
import Quiz from './pages/Quiz';
import Parsons from './pages/Parsons';
import Mock from './pages/Mock';
import More from './pages/More';
import Codeforces from './pages/Codeforces';
import NotFound from './pages/NotFound';

// Hash routes match the old app, so existing bookmarks and the PWA shortcuts keep working.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="today" element={<Today />} />
          <Route path="plan" element={<Plan />} />
          <Route path="patterns" element={<Patterns />} />
          <Route path="pattern/:slug" element={<Pattern />} />
          <Route path="playbook" element={<Playbook />} />
          <Route path="problems" element={<Problems />} />
          <Route path="problem/:n" element={<Problem />} />
          <Route path="problem/:n/:tab" element={<Problem />} />
          <Route path="review" element={<Review />} />
          <Route path="review/:kind" element={<Review />} />
          <Route path="review/:kind/:arg" element={<Review />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/:scope" element={<Quiz />} />
          <Route path="parsons" element={<Parsons />} />
          <Route path="parsons/:n" element={<Parsons />} />
          <Route path="mock" element={<Mock />} />
          <Route path="more" element={<More />} />
          <Route path="cf" element={<Codeforces />} />
          <Route path="cf/:ladder" element={<Codeforces />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
