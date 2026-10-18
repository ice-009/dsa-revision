// PWA install flow. Chrome/Edge fire beforeinstallprompt; iOS/iPadOS Safari never does.
import { useSyncExternalStore } from 'react';
import { toast } from './toast';

let prompt = null;
let version = 0;
const subs = new Set();
const notify = () => { version++; subs.forEach(f => f()); };

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); prompt = e; notify(); });
  window.addEventListener('appinstalled', () => { prompt = null; toast('App installed'); notify(); });
}

export const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_ANDROID = /Android/i.test(navigator.userAgent);

export function useInstall() {
  useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => version);
  return { canInstall: !!prompt, standalone: isStandalone(), install, hint: installHint(!!prompt) };
}

export async function install() {
  if (!prompt) return;
  const p = prompt;
  prompt = null;
  notify();
  try { await p.prompt(); await p.userChoice; } catch (e) { /* dismissed */ }
}

// hint is an array of [text, bold] segments rendered by the page
export function installHint(has) {
  if (has) return [['One tap installs it: opens full screen and works offline.']];
  if (IS_IOS) return [['In '], ['Safari', 1], [', tap '], ['Share', 1], [' → '], ['Add to Home Screen', 1], ['. It then opens full screen and works offline.']];
  if (IS_ANDROID) return [['In '], ['Chrome', 1], [', open the menu '], ['⋮', 1], [' → '], ['Install app', 1], [' (or '], ['Add to Home screen', 1], ['). It then opens full screen and works offline.']];
  return [['On iPhone/iPad: Safari '], ['Share', 1], [' → '], ['Add to Home Screen', 1], ['. On Android: Chrome menu '], ['⋮', 1], [' → '], ['Install app', 1], ['. On desktop Chrome/Edge: the install icon in the address bar.']];
}
