import { store } from './store.js';
import { icon } from './icons.js';
import { fmtClock } from './utils.js';
import { route, startRouter, onAfterRender, on, go } from './router.js';
import { applyTheme } from './theme.js';
import { initTimer, unlockAudio } from './ui/timer.js';
import { closeSheet } from './ui/components.js';
import { checkAchievements } from './logic.js';

import { homeView } from './views/home.js';
import { planView, weekView, workoutPreviewView } from './views/plan.js';
import { sessionView, summaryView, historyDetailView } from './views/session.js';
import { libraryView, exerciseView } from './views/library.js';
import { academyView, lessonView, calculatorView } from './views/academy.js';
import { progressView } from './views/progress.js';
import { settingsView, onboardingView } from './views/settings.js';

const TABS = [
  ['home', '#/', 'home', 'Heute'],
  ['plan', '#/plan', 'calendar', 'Plan'],
  ['library', '#/uebungen', 'dumbbell', 'Übungen'],
  ['academy', '#/akademie', 'book', 'Akademie'],
  ['progress', '#/fortschritt', 'chart', 'Fortschritt'],
];

function buildNav() {
  document.querySelector('.tabbar .inner').innerHTML = TABS.map(([id, href, ic, label]) =>
    `<a class="tab" data-tab="${id}" href="${href}">${icon(ic, 23)}<span>${label}</span></a>`).join('');
}

let pillTimer = null;
function updateShell(view) {
  document.body.classList.toggle('no-nav', view.nav === false);
  document.querySelectorAll('.tab').forEach((t) => {
    const active = t.dataset.tab === view.tab;
    t.classList.toggle('active', active);
    if (active) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });
  const pill = document.getElementById('live-pill');
  const a = store.state.active;
  clearInterval(pillTimer);
  if (a && view.name !== 'session') {
    const render = () => {
      pill.innerHTML = `<span class="pulse"></span><span>${a.name.split(' – ')[0]} · ${fmtClock((Date.now() - a.startedAt) / 1000)}</span><span class="go">Weiter</span>`;
    };
    render();
    pill.hidden = false;
    pillTimer = setInterval(render, 1000);
  } else {
    pill.hidden = true;
  }
  closeSheet();
}

function guardOnboarding(view) {
  return (params) => {
    if (!store.state.settings.onboarded && view !== onboardingView) return '#/start';
    return view.guard?.(params) || null;
  };
}

function register(pattern, view) {
  route(pattern, { ...view, guard: guardOnboarding(view), _base: view });
}

// Reihenfolge: erste Route = Fallback
register('/', homeView);
register('/plan', planView);
register('/woche/:n', weekView);
register('/workout/:id/:week/:slot', workoutPreviewView);
register('/session', sessionView);
register('/zusammenfassung/:id', summaryView);
register('/verlauf/:id', historyDetailView);
register('/uebungen', libraryView);
register('/uebung/:id', exerciseView);
register('/akademie', academyView);
register('/lektion/:id', lessonView);
register('/rechner', calculatorView);
register('/fortschritt', progressView);
register('/einstellungen', settingsView);
register('/start', onboardingView);

// Eigener Verlauf, damit „Zurück“ nie aus der App herausführt
const navStack = [location.hash || '#/'];
let replacing = false;
window.addEventListener('hashchange', () => {
  const h = location.hash || '#/';
  if (replacing) { navStack[navStack.length - 1] = h; replacing = false; return; }
  if (navStack.length >= 2 && navStack[navStack.length - 2] === h) navStack.pop();
  else navStack.push(h);
});
on('go-back', (el) => {
  if (navStack.length > 1) history.back();
  else { replacing = true; location.replace(el.dataset.fallback || '#/'); }
});

document.getElementById('live-pill').addEventListener('click', () => go('#/session'));
document.addEventListener('pointerdown', unlockAudio, { once: true });

applyTheme();
buildNav();
initTimer();
onAfterRender((view) => updateShell(view));
checkAchievements();
startRouter();

// Offline-Fähigkeit
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('Service Worker nicht registriert', e));
  });
}
