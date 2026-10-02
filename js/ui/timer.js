// Pausen-Timer mit Ton & Vibration. Läuft über Zeitstempel, damit er auch im Hintergrund korrekt bleibt.
import { store } from '../store.js';
import { fmtClock } from '../utils.js';
import { icon } from '../icons.js';

let endAt = 0;
let total = 0;
let iv = null;
let finished = false;
let audioCtx = null;
let label = 'Pause';

export function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch { /* kein Audio */ }
}

function beep() {
  if (!store.state.settings.sound || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    [0, 0.22, 0.44].forEach((t, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = i === 2 ? 1175 : 880;
      g.gain.setValueAtTime(0.0001, now + t);
      g.gain.exponentialRampToValueAtTime(0.35, now + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.18);
      o.connect(g).connect(audioCtx.destination);
      o.start(now + t);
      o.stop(now + t + 0.2);
    });
  } catch { /* ignore */ }
}

const bar = () => document.getElementById('timerbar');

function render() {
  const el = bar();
  if (!el) return;
  const left = (endAt - Date.now()) / 1000;
  if (left <= 0 && !finished) {
    finished = true;
    beep();
    if (store.state.settings.vibrate && navigator.vibrate) navigator.vibrate([220, 100, 220]);
    setTimeout(() => { if (finished) stopTimer(); }, 4000);
  }
  el.classList.toggle('done', finished);
  el.querySelector('.t').textContent = finished ? 'Los!' : fmtClock(left);
  el.querySelector('.lbl').textContent = finished ? 'Nächster Satz' : label;
  el.querySelector('.bar').style.width = `${finished ? 100 : Math.max(0, 100 - (left / total) * 100)}%`;
}

export function startTimer(seconds, lbl = 'Pause') {
  if (!seconds || seconds < 5) return;
  label = lbl;
  const el = bar();
  total = seconds;
  endAt = Date.now() + seconds * 1000;
  finished = false;
  el.innerHTML = `
    <div><div class="lbl">${label}</div><div class="t">${fmtClock(seconds)}</div></div>
    <div class="grow"></div>
    <button class="tb" data-timer="-15" aria-label="15 Sekunden weniger">−15</button>
    <button class="tb" data-timer="15" aria-label="15 Sekunden mehr">+15</button>
    <button class="tb" data-timer="stop" aria-label="Pause beenden">${icon('skip', 18)}</button>
    <div class="bar"></div>`;
  el.hidden = false;
  clearInterval(iv);
  iv = setInterval(render, 250);
  render();
}

export function stopTimer() {
  clearInterval(iv);
  iv = null;
  finished = false;
  const el = bar();
  if (el) { el.hidden = true; el.innerHTML = ''; }
}

export function timerRunning() {
  return !!iv;
}

export function initTimer() {
  bar().addEventListener('click', (e) => {
    const b = e.target.closest('[data-timer]');
    if (!b) return;
    const v = b.dataset.timer;
    if (v === 'stop') return stopTimer();
    if (finished) return;
    endAt += Number(v) * 1000;
    total = Math.max(total, (endAt - Date.now()) / 1000);
    if (endAt <= Date.now()) endAt = Date.now() + 1000;
    render();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && iv) render(); });
}
