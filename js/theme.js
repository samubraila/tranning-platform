import { store } from './store.js';

export function applyTheme() {
  const t = store.state.settings.theme;
  const root = document.documentElement;
  if (t === 'dark' || t === 'light') root.setAttribute('data-theme', t);
  else root.removeAttribute('data-theme');
  const dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0c0f' : '#f2f3f5');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
