import { store } from './store.js';
import { icon } from './icons.js';
import { esc, fmtClock, todayISO } from './utils.js';
import { route, startRouter, onAfterRender, on, go, back, rerender, currentRoute, setRenderErrorHandler } from './router.js';
import { applyTheme } from './theme.js';
import { initTimer, unlockAudio } from './ui/timer.js';
import { closeSheet, toast } from './ui/components.js';
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
      pill.innerHTML = `<span class="pulse"></span><span>${esc(a.name.split(' – ')[0])} · ${fmtClock((Date.now() - a.startedAt) / 1000)}</span><span class="go">Weiter</span>`;
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

on('go-back', (el) => back(el.dataset.fallback || '#/'));
on('reload-home', () => { location.replace('#/'); location.reload(); });

// Fehlerseite statt leerem Bildschirm – mit Rettungsoptionen
setRenderErrorHandler((root, e) => {
  root.innerHTML = `<div class="onb"><div class="body">
    <div class="tile-ic accent" style="margin-top:24px">${icon('alert', 22)}</div>
    <h1 class="page-title mt-16">Da ist etwas schiefgelaufen</h1>
    <p class="muted mt-8">Die Seite konnte nicht angezeigt werden. Deine Daten sind weiterhin gespeichert.</p>
    <p class="tiny faint mt-8">${esc(String(e?.message || e).slice(0, 200))}</p>
    <div class="stack mt-24">
      <button class="btn btn-primary btn-block" data-action="reload-home">Neu laden</button>
      <button class="btn btn-outline btn-block" data-action="export">${icon('download', 18)} Backup herunterladen</button>
      <button class="btn btn-danger btn-block" data-action="reset-all">${icon('trash', 18)} Alle Daten löschen</button>
    </div></div></div>`;
  document.body.classList.remove('no-nav');
});

// Speicherfehler (voller Speicher, privater Modus) sichtbar machen – höchstens alle 20 Sekunden
let lastSaveWarn = 0;
store.onError = () => {
  const now = Date.now();
  if (now - lastSaveWarn < 20000) return;
  lastSaveWarn = now;
  toast('Speichern nicht möglich – Speicher voll oder privater Modus. Bitte ein Backup machen.', 'alert', 6000);
};

// Neuer Tag, während die App offen bleibt: Heute-/Plan-Ansicht aktualisieren
let lastDay = todayISO();
function checkDayChange() {
  if (document.hidden) return;
  const d = todayISO();
  if (d === lastDay) return;
  lastDay = d;
  const name = currentRoute()?.view?.name;
  if (['home', 'plan', 'week', 'progress'].includes(name)) rerender();
}
document.addEventListener('visibilitychange', checkDayChange);
window.addEventListener('focus', checkDayChange);
setInterval(checkDayChange, 60000);

document.getElementById('live-pill').addEventListener('click', () => go('#/session'));
document.addEventListener('pointerdown', unlockAudio, { once: true });

applyTheme();
buildNav();
initTimer();
onAfterRender((view) => updateShell(view));
try { checkAchievements(); } catch (e) { console.warn('Erfolge konnten nicht geprüft werden', e); }
startRouter();
if (!store.storageOk) setTimeout(() => store.onError?.(), 800);

// Offline-Fähigkeit
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  // Neue Version aktiv: sofort neu laden – außer mitten im Training oder beim Tippen
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    const typing = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (!store.state.active && !typing) { reloading = true; location.reload(); }
    else toast('Neue App-Version geladen – sie startet beim nächsten Öffnen.', 'refresh', 4000);
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('Service Worker nicht registriert', e));
  });
}
