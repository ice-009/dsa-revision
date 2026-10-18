import { createRoot } from 'react-dom/client';
import './data';
import './lib/toast';
import { applyTheme } from './lib/store';
import './styles/base.css';
import './styles/tablet.css';
import App from './App';
import './styles/crystal.css';
import './styles/crystal-home.css';
import './styles/crystal-learn.css';
import './styles/crystal-practice.css';

applyTheme();
createRoot(document.getElementById('root')).render(<App />);

// Offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support unavailable */ });
  });
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
