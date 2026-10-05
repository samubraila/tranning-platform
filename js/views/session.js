import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, fmtClock, fmtNum, fmtDateLong, parseRange, debounce, fmtDec } from '../utils.js';
import { on, onInput, go, rerender } from '../router.js';
import { openSheet, closeSheet, confirmDialog, toast, backHeader } from '../ui/components.js';
import { startTimer, stopTimer, unlockAudio } from '../ui/timer.js';
import { lastPerformance, suggestion, finishSession, makeItem, sessionSetCount, warmupSets, setReplacement, replacementFor } from '../logic.js';
import { EX_BY_ID, MUSCLES, EQUIPMENT } from '../data/exercises.js';
import { WARMUP, targetText } from '../data/program.js';
import { XP } from '../data/academy.js';
import { exerciseBody } from './library.js';

let tick = null;
let wakeLock = null;
let lastUnlocked = { id: null, list: [] };

const A = () => store.state.active;
const saveSoon = debounce(() => store.save(), 300);

async function keepAwake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener?.('release', () => { wakeLock = null; });
    }
  } catch { /* nicht unterstützt */ }
}
function releaseAwake() {
  try { wakeLock?.release(); } catch { /* ignore */ }
  wakeLock = null;
}

function unitFor(ex) {
  return ex.type === 'time' ? 'Sek' : ex.type === 'cardio' ? 'Min' : 'Wdh';
}

function kgLabel(ex) {
  if (ex.assisted) return 'Hilfe';
  if (ex.bw || ex.type === 'time') return '+kg';
  return 'kg';
}

// Plausible Grenzen für Eingaben
function limitsFor(ex) {
  return {
    kg: ex.assisted ? 200 : 600,
    reps: ex.type === 'time' ? 900 : ex.type === 'cardio' ? 300 : 100,
  };
}

function prevText(set, ex) {
  if (!set) return '–';
  const kg = set.kg !== '' && set.kg != null ? fmtDec(set.kg) : '';
  if (ex.type === 'cardio') return `${set.reps || '–'}′`;
  return kg ? `${kg}×${set.reps || '–'}` : `${set.reps || '–'}`;
}

function setRow(item, i, s, ex, last) {
  const set = item.log[s];
  const [lo, hi] = parseRange(item.reps);
  const repsPh = lo === hi ? `${lo}` : `${lo}–${hi}`;
  const prev = last?.sets[s];
  const kgPh = prev?.kg ? fmtDec(prev.kg) : (ex.bw || ex.type === 'time' ? '0' : 'kg');
  const check = `<button class="check-btn" data-action="toggle-set" data-i="${i}" data-s="${s}" aria-label="Satz ${s + 1} ${set.done ? 'als offen markieren' : 'abhaken'}">${icon('check', 20)}</button>`;
  if (ex.type === 'cardio') {
    return `<div class="set-row cardio-row ${set.done ? 'done' : ''}">
      <div class="set-no">${s + 1}</div>
      <div class="set-prev">${esc(prevText(prev, ex))}</div>
      <input class="num" inputmode="numeric" placeholder="${esc(repsPh)}" value="${esc(set.reps)}" data-input="set-field" data-i="${i}" data-s="${s}" data-f="reps" aria-label="Minuten" />
      ${check}
    </div>`;
  }
  return `<div class="set-row ${set.done ? 'done' : ''}">
    <div class="set-no">${s + 1}</div>
    <div class="set-prev">${esc(prevText(prev, ex))}</div>
    <input class="num" inputmode="decimal" placeholder="${esc(kgPh)}" value="${esc(fmtDec(set.kg))}" data-input="set-field" data-i="${i}" data-s="${s}" data-f="kg" aria-label="Gewicht Satz ${s + 1}" />
    <input class="num" inputmode="numeric" placeholder="${esc(repsPh)}" value="${esc(set.reps)}" data-input="set-field" data-i="${i}" data-s="${s}" data-f="reps" aria-label="${unitFor(ex)} Satz ${s + 1}" />
    ${check}
  </div>`;
}

// Aufwärmsätze für die ersten Übungen einer neuen Muskelgruppe
function warmupLine(item, i) {
  const a = A();
  const ex = EX_BY_ID[item.ex];
  if (ex.type !== 'reps' || ex.assisted || item.finisher || i > 3) return '';
  const earlier = a.items.slice(0, i).map((x) => EX_BY_ID[x.ex]?.muscles[0]);
  if (earlier.includes(ex.muscles[0])) return '';
  const work = Number(item.log.find((s) => s.kg !== '')?.kg) || 0;
  const sets = warmupSets(item.ex, work, item.reps);
  const text = sets.length
    ? sets.map((w) => `${fmtDec(w.kg)} kg × ${w.reps}`).join(' · ')
    : 'ca. 50 % × 10 · 70 % × 5 deines Arbeitsgewichts';
  return `<div class="warmup">${icon('flame', 15)}<span><b>Aufwärmen:</b> ${esc(text)}</span></div>`;
}

function exCard(item, i) {
  const a = A();
  const ex = EX_BY_ID[item.ex];
  const last = lastPerformance(item.ex);
  const sug = suggestion(item.ex, item.reps);
  const done = item.log.filter((s) => s.done).length;
  const complete = done === item.log.length && item.log.length > 0;
  const target = targetText(a.items, i, item.log.length);
  const prevSS = a.items[i - 1]?.ss;
  const ssLabel = item.ss ? `<span class="ss-badge">${item.ss}${item.ss === prevSS ? 2 : 1}</span>` : '';
  const myNote = store.state.exNotes[ex.id];
  const swapped = item.ex !== item.planned;
  const nextHold = ex.type === 'time' ? item.log.findIndex((s) => !s.done) : -1;
  const head = ex.type === 'cardio'
    ? `<div class="set-row cardio-row headrow"><span>#</span><span>Vorher</span><span>Min</span><span></span></div>`
    : `<div class="set-row headrow"><span>#</span><span>Vorher</span><span>${kgLabel(ex)}</span><span>${unitFor(ex)}</span><span></span></div>`;

  return `<section class="card ex-card ${complete ? 'complete' : ''}" id="ex-${i}">
    <div class="ex-head">
      <div class="idx ${complete ? 'ok' : ''}">${complete ? icon('check', 16) : item.finisher ? icon('heart', 15) : i + 1}</div>
      <div class="grow">
        <button class="ex-name row" style="gap:8px;text-align:left" data-action="ex-info" data-i="${i}">${ssLabel}<span>${esc(ex.name)}</span>${icon('info', 16, 'faint')}</button>
        <div class="ex-target">${esc(target)}</div>
        ${swapped ? `<div class="tiny faint mt-8">Statt: ${esc(EX_BY_ID[item.planned].name)}${replacementFor(item.planned) === item.ex ? ' · dauerhaft ersetzt' : ''}</div>` : ''}
      </div>
    </div>
    ${item.tags.length ? `<div class="chips mt-8">${item.tags.map((t) => `<span class="chip chip-warn">${esc(t)}</span>`).join('')}</div>` : ''}
    ${item.note ? `<div class="tiny muted mt-8">${esc(item.note)}</div>` : ''}
    ${myNote ? `<div class="my-note">${icon('settings', 14)} ${esc(myNote)}</div>` : ''}
    ${sug ? `<div class="suggest ${sug.kind}">${icon(sug.kind === 'up' ? 'trend' : 'target', 16)}<span>${esc(sug.text)}</span></div>` : (ex.type === 'reps' ? `<div class="suggest">${icon('bulb', 16)}<span>Erstes Mal: wähle ein Gewicht, mit dem du ${esc(item.reps)} saubere Wdh schaffst.</span></div>` : '')}
    ${warmupLine(item, i)}
    <div class="sets">${head}${item.log.map((_, s) => setRow(item, i, s, ex, last)).join('')}</div>
    <div class="ex-actions">
      ${nextHold >= 0 ? `<button class="btn btn-xs btn-primary" data-action="hold-start" data-i="${i}" data-s="${nextHold}">${icon('play', 14)} Halten starten</button>` : ''}
      <button class="btn btn-xs" data-action="add-set" data-i="${i}">${icon('plus', 14)} Satz</button>
      ${item.log.length > 1 ? `<button class="btn btn-xs" data-action="remove-set" data-i="${i}">${icon('minus', 14)} Satz</button>` : ''}
      ${EX_BY_ID[item.planned].alternatives.length ? `<button class="btn btn-xs" data-action="swap-ex" data-i="${i}">${icon('swap', 14)} Tauschen</button>` : ''}
    </div>
  </section>`;
}

function progressInfo() {
  const a = A();
  const total = a.items.reduce((n, it) => n + it.log.length, 0);
  const done = a.items.reduce((n, it) => n + it.log.filter((s) => s.done).length, 0);
  return { total, done };
}

function updateProgress() {
  const { total, done } = progressInfo();
  const bar = document.getElementById('sess-bar');
  const txt = document.getElementById('sess-count');
  if (bar) bar.style.width = `${total ? (done / total) * 100 : 0}%`;
  if (txt) txt.textContent = `${done}/${total} Sätze`;
}

function refreshCard(i) {
  const el = document.getElementById(`ex-${i}`);
  if (el && A()?.items[i]) el.outerHTML = exCard(A().items[i], i);
  updateProgress();
}

export const sessionView = {
  name: 'session',
  tab: 'home',
  nav: false,
  guard() { return A() ? null : '#/'; },
  render() {
    const a = A();
    const { total, done } = progressInfo();
    return `<header class="topbar topbar-sticky session-head" style="flex-wrap:wrap">
        <a class="icon-btn" href="#/" aria-label="Minimieren">${icon('down', 22)}</a>
        <div class="grow titles" style="text-align:center">
          <div class="bold ellipsis">${esc(a.name)}</div>
          <div class="tiny faint"><span id="elapsed">${fmtClock((Date.now() - a.startedAt) / 1000)}</span> · <span id="sess-count">${done}/${total} Sätze</span></div>
        </div>
        <button class="btn btn-sm btn-primary" data-action="finish-session">Fertig</button>
        <div class="progress thin" style="flex-basis:100%;margin-top:12px"><span id="sess-bar" style="width:${total ? (done / total) * 100 : 0}%"></span></div>
      </header>
      <details class="card card-flat disclosure">
        <summary class="row-between"><div class="row">${icon('flame', 18)}<b class="small">Aufwärmen nicht vergessen</b></div>${icon('down', 18, 'chev')}</summary>
        <ul class="bullets small muted mt-8">${WARMUP.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      </details>
      <div class="stack mt-12">${a.items.map((it, i) => exCard(it, i)).join('')}</div>
      <div class="stack mt-24">
        <button class="btn btn-primary btn-block" data-action="finish-session">${icon('check', 18)} Training abschließen</button>
        <button class="btn btn-ghost btn-block" data-action="discard-session">Training verwerfen</button>
      </div>`;
  },
  mount() {
    keepAwake();
    clearInterval(tick);
    tick = setInterval(() => {
      const el = document.getElementById('elapsed');
      if (el && A()) el.textContent = fmtClock((Date.now() - A().startedAt) / 1000);
    }, 1000);
  },
  unmount() {
    clearInterval(tick);
    releaseAwake();
  },
};

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && A() && location.hash === '#/session') keepAwake();
});

// Nur Ziffern und ein Dezimaltrennzeichen zulassen
function cleanInput(v, f) {
  if (f === 'reps') return v.replace(/\D/g, '').slice(0, 4);
  let out = v.replace(/[^\d.,]/g, '');
  const k = out.search(/[.,]/);
  if (k >= 0) out = out.slice(0, k + 1) + out.slice(k + 1).replace(/[.,]/g, '').slice(0, 2);
  return out.slice(0, 7);
}

onInput('set-field', (el) => {
  const a = A();
  if (!a) return;
  const f = el.dataset.f;
  const clean = cleanInput(el.value, f);
  if (clean !== el.value) el.value = clean;
  el.classList.remove('invalid');
  const set = a.items[+el.dataset.i].log[+el.dataset.s];
  set[f] = clean.replace(',', '.');
  if (f === 'kg') set.auto = false;
  saveSoon();
});

function markDone(i, s, { repsOverride } = {}) {
  const a = A();
  const item = a.items[i];
  const ex = EX_BY_ID[item.ex];
  const set = item.log[s];
  const lim = limitsFor(ex);
  const row = document.querySelector(`#ex-${i} .set-row:not(.headrow):nth-of-type(${s + 2})`);
  const inputs = row ? row.querySelectorAll('.num') : [];
  inputs.forEach((inp) => {
    const f = inp.dataset.f;
    const v = inp.value.trim().replace(',', '.');
    if (v === '') {
      if (f === 'reps') set.reps = String(repsOverride ?? parseRange(item.reps)[0]);
      if (f === 'kg') {
        const ph = Number(inp.placeholder.replace(',', '.'));
        set.kg = Number.isFinite(ph) ? String(ph) : '';
      }
    } else set[f] = v;
  });
  if (repsOverride != null) set.reps = String(repsOverride);
  // Plausibilität prüfen
  const kg = set.kg === '' ? 0 : Number(set.kg);
  const reps = Number(set.reps);
  const badKg = set.kg !== '' && !(Number.isFinite(kg) && kg >= 0 && kg <= lim.kg);
  const badReps = !(Number.isInteger(reps) && reps >= 1 && reps <= lim.reps);
  if (badKg || badReps) {
    inputs.forEach((inp) => { if ((inp.dataset.f === 'kg' && badKg) || (inp.dataset.f === 'reps' && badReps)) inp.classList.add('invalid'); });
    toast(badKg ? `Gewicht bitte zwischen 0 und ${lim.kg} kg eingeben` : `${unitFor(ex)} bitte zwischen 1 und ${lim.reps} eingeben`, 'alert');
    return false;
  }
  set.done = true;
  set.auto = false;
  // Neues Gewicht in die folgenden Sätze übernehmen (nur leere oder automatisch vorbelegte)
  if (set.kg !== '') item.log.forEach((x, j) => { if (j > s && !x.done && (x.kg === '' || x.auto)) { x.kg = set.kg; x.auto = true; } });
  if (navigator.vibrate && store.state.settings.vibrate) navigator.vibrate(15);
  return true;
}

function afterDone(i) {
  const a = A();
  const item = a.items[i];
  const ex = EX_BY_ID[item.ex];
  const next = a.items[i + 1];
  const lastSetOfItem = item.log.every((x) => x.done);
  const restSec = ex.type === 'cardio' ? 0 : item.rest;
  const ssSwitch = item.ss && next && next.ss === item.ss;
  if (restSec && !(lastSetOfItem && i === a.items.length - 1)) startTimer(restSec, ssSwitch ? `Wechsel zu ${item.ss}2` : 'Pause');
  if (lastSetOfItem && !item.ss && next) {
    setTimeout(() => document.getElementById(`ex-${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  }
}

on('toggle-set', (el) => {
  unlockAudio();
  const i = +el.dataset.i;
  const s = +el.dataset.s;
  const set = A().items[i].log[s];
  if (!set.done) {
    if (!markDone(i, s)) return;
    afterDone(i);
  } else {
    set.done = false;
  }
  store.save();
  refreshCard(i);
});

// Halteübungen (z. B. Plank): Countdown, danach wird der Satz automatisch abgehakt
on('hold-start', (el) => {
  unlockAudio();
  const i = +el.dataset.i;
  const s = +el.dataset.s;
  const item = A().items[i];
  const typed = Number(document.querySelector(`#ex-${i} .set-row:not(.headrow):nth-of-type(${s + 2}) input[data-f="reps"]`)?.value);
  const secs = Number.isInteger(typed) && typed >= 5 && typed <= 900 ? typed : parseRange(item.reps)[0];
  startTimer(secs, `Halten · Satz ${s + 1}`, {
    mode: 'hold',
    onDone: () => {
      if (!A() || !A().items[i]) return;
      if (markDone(i, s, { repsOverride: secs })) {
        store.save();
        refreshCard(i);
        afterDone(i);
      }
    },
  });
});

on('add-set', (el) => {
  const i = +el.dataset.i;
  const item = A().items[i];
  const prev = item.log[item.log.length - 1];
  item.log.push({ kg: prev?.kg || '', reps: '', done: false, auto: true });
  store.save();
  refreshCard(i);
});

on('remove-set', (el) => {
  const i = +el.dataset.i;
  const item = A().items[i];
  if (item.log.length > 1) item.log.pop();
  store.save();
  refreshCard(i);
});

on('ex-info', (el) => {
  const i = +el.dataset.i;
  const ex = EX_BY_ID[A().items[i].ex];
  openSheet(`<div class="row-between"><span class="eyebrow">Technik</span><button class="icon-btn sm" data-action="close-sheet" aria-label="Schließen">${icon('x', 18)}</button></div>${exerciseBody(ex, { compact: true })}`,
    { onClose: () => refreshCard(i) }); // z. B. neue Geräte-Einstellung sofort anzeigen
});

on('close-sheet', () => closeSheet());

on('swap-ex', (el) => {
  const i = +el.dataset.i;
  const item = A().items[i];
  const planned = EX_BY_ID[item.planned];
  const options = [planned, ...planned.alternatives.map((id) => EX_BY_ID[id])].filter(Boolean);
  const done = item.log.filter((s) => s.done).length;
  openSheet(`<h3 class="h" style="font-size:19px">Übung tauschen</h3>
    <p class="small muted mt-8">Gerät besetzt oder nicht vorhanden? Wähle eine gleichwertige Alternative.${done ? ` Deine ${done} erledigten Sätze bleiben gespeichert.` : ''}</p>
    <label class="row-between card card-flat mt-12" style="padding:12px 14px">
      <div><div class="bold small">Für alle Trainings merken</div><div class="tiny muted">z. B. wenn es das Gerät in deinem Studio nicht gibt</div></div>
      <span class="switch"><input type="checkbox" id="swap-remember" ${replacementFor(item.planned) ? 'checked' : ''} /><span></span></span>
    </label>
    <div class="list mt-12">${options.map((o) => `
      <button class="item" style="width:100%;text-align:left" data-action="swap-pick" data-i="${i}" data-ex="${o.id}">
        <div class="tile-ic ${o.id === item.ex ? 'accent' : ''}">${icon(o.id === item.ex ? 'check' : 'dumbbell', 18)}</div>
        <div class="grow"><div class="title">${esc(o.name)}${o.id === planned.id ? ' <span class="chip" style="height:20px">Original</span>' : ''}</div><div class="sub">${esc(EQUIPMENT[o.equipment])} · ${esc(o.muscles.map((m) => MUSCLES[m].name).join(', '))}</div></div>
      </button>`).join('')}</div>`);
});

on('swap-pick', (el) => {
  const i = +el.dataset.i;
  const a = A();
  const old = a.items[i];
  const newEx = el.dataset.ex;
  const remember = document.getElementById('swap-remember')?.checked;
  const hadRule = replacementFor(old.planned);
  if (remember) setReplacement(old.planned, newEx);
  else if (hadRule) setReplacement(old.planned, null);
  const ruleChanged = replacementFor(old.planned) !== hadRule;
  let changed = false;
  if (old.ex !== newEx) {
    changed = true;
    const proto = { ex: old.planned, sets: old.log.length, reps: old.reps, rest: old.rest, rir: old.rir, note: old.note, ss: old.ss, finisher: old.finisher, tags: old.tags };
    const doneLog = old.log.filter((s) => s.done);
    if (doneLog.length) {
      // Erledigte Sätze bleiben bei der alten Übung, die restlichen Sätze gehen mit der neuen weiter
      const remaining = Math.max(1, old.log.length - doneLog.length);
      old.log = doneLog;
      const fresh = makeItem({ ...proto, sets: remaining, ss: null }, newEx, old.planned);
      a.items.splice(i + 1, 0, fresh);
    } else {
      a.items[i] = makeItem(proto, newEx, old.planned);
    }
  }
  store.save();
  closeSheet();
  if (changed) rerender();
  if (changed) toast(`Getauscht: ${EX_BY_ID[newEx].name}${remember && newEx !== old.planned ? ' · gilt jetzt für alle Trainings' : ''}`, 'swap');
  else if (ruleChanged) toast(remember ? 'Für alle Trainings gemerkt' : 'Dauerhafte Ersetzung aufgehoben', 'check');
});

on('finish-session', async () => {
  const { done } = progressInfo();
  if (done === 0) {
    const ok = await confirmDialog({ title: 'Noch keine Sätze abgehakt', text: 'Ein Training ohne erledigte Sätze wird nicht gespeichert. Training verwerfen?', ok: 'Verwerfen', danger: true });
    if (ok) { store.state.active = null; store.save(); stopTimer(); go('#/'); }
    return;
  }
  const { total } = progressInfo();
  if (done < total) {
    const ok = await confirmDialog({ title: 'Training abschließen?', text: `Du hast ${done} von ${total} Sätzen erledigt. Offene Sätze werden nicht gespeichert.`, ok: 'Abschließen' });
    if (!ok) return;
  }
  stopTimer();
  const res = finishSession();
  lastUnlocked = { id: res.session.id, list: res.unlocked };
  go(`#/zusammenfassung/${res.session.id}`);
});

on('discard-session', async () => {
  const ok = await confirmDialog({ title: 'Training verwerfen?', text: 'Alle Eingaben dieses Trainings gehen verloren.', ok: 'Verwerfen', danger: true });
  if (!ok) return;
  store.state.active = null;
  store.save();
  stopTimer();
  go('#/');
});

// ───── Gefühl & Notiz zum Training ─────
const FEEL = [
  [1, 'Sehr leicht'],
  [2, 'Leicht'],
  [3, 'Genau richtig'],
  [4, 'Hart'],
  [5, 'Sehr hart'],
];
const FEEL_TIP = {
  1: 'Zu leicht? Nächstes Mal die Gewichte steigern – die letzte Wiederholung soll fordernd sein.',
  2: 'Gut machbar. Achte darauf, die Ziel-RIR wirklich zu treffen.',
  3: 'Perfekt dosiert – genau so soll es sein.',
  4: 'Fordernd, aber gut. Achte heute auf Eiweiß und Schlaf.',
  5: 'Sehr hart. Wenn das öfter vorkommt: mehr Schlaf, mehr Essen – oder die nächste Woche etwas leichter angehen.',
};

function feelBlock(s) {
  return `<div class="card">
    <div class="bold">Wie war das Training?</div>
    <div class="feel mt-12" role="group" aria-label="Anstrengung">${FEEL.map(([v, t]) =>
      `<button class="${s.feel === v ? 'on' : ''}" data-action="session-feel" data-id="${esc(s.id)}" data-v="${v}" aria-pressed="${s.feel === v}"><span class="fv">${v}</span><span class="ft">${t}</span></button>`).join('')}</div>
    ${s.feel ? `<div class="tiny muted mt-8">${esc(FEEL_TIP[s.feel])}</div>` : ''}
    <label class="field mt-12"><span class="lbl">Notiz (optional)</span>
      <textarea class="input" rows="2" data-input="session-note" data-id="${esc(s.id)}" placeholder="z. B. Knie zwickt bei der Beinpresse, Studio war voll …">${esc(s.note || '')}</textarea>
    </label>
  </div>`;
}

on('session-feel', (el) => {
  const s = store.state.sessions.find((x) => x.id === el.dataset.id);
  if (!s) return;
  const v = +el.dataset.v;
  s.feel = s.feel === v ? null : v;
  store.save();
  rerender();
});
const saveNote = debounce(() => store.save(), 400);
onInput('session-note', (el) => {
  const s = store.state.sessions.find((x) => x.id === el.dataset.id);
  if (!s) return;
  s.note = el.value.slice(0, 500);
  saveNote();
});

// ───── Zusammenfassung ─────
export const summaryView = {
  name: 'summary',
  tab: 'home',
  render({ id }) {
    const s = store.state.sessions.find((x) => x.id === id);
    if (!s) return `${backHeader('Training', { back: '#/' })}<p class="muted">Nicht gefunden.</p>`;
    const xp = XP.workout + s.prs.length * XP.pr;
    const unlocked = lastUnlocked.id === s.id ? lastUnlocked.list : [];
    return `<div class="celebrate">
        <div class="burst">${icon('trophy', 40)}</div>
        <div class="eyebrow">Training abgeschlossen</div>
        <h1 class="page-title mt-8">Stark gemacht!</h1>
        <p class="muted mt-8">${esc(s.name)} · Woche ${s.week}</p>
      </div>
      <div class="stats three mt-16">
        <div class="stat"><div class="v">${Math.round(s.duration / 60)}<small> Min</small></div><div class="l">Dauer</div></div>
        <div class="stat"><div class="v">${sessionSetCount(s)}</div><div class="l">Sätze</div></div>
        <div class="stat"><div class="v">${fmtNum(Math.round(s.volume / 100) / 10)}<small> t</small></div><div class="l">Volumen</div></div>
      </div>
      <div class="card mt-12 row"><div class="tile-ic accent">${icon('sparkle', 20)}</div><div class="grow"><div class="bold">+${xp} XP</div><div class="small muted">${s.prs.length ? `inkl. ${s.prs.length} Bestleistung${s.prs.length > 1 ? 'en' : ''}` : 'für dein Training'}</div></div></div>
      ${s.prs.length ? `<div class="section"><div class="section-head"><h2 class="h">Neue Bestleistungen</h2></div><div class="card"><div class="list">${s.prs.map((p) => `
        <div class="item"><div class="tile-ic accent">${icon('trend', 18)}</div><div class="grow"><div class="title">${esc(EX_BY_ID[p.ex].name)}</div><div class="sub">${fmtNum(p.kg)} kg × ${p.reps} · geschätztes 1RM ${fmtNum(p.e1rm)} kg</div></div></div>`).join('')}</div></div></div>` : ''}
      ${unlocked.length ? `<div class="section"><div class="section-head"><h2 class="h">Neue Erfolge</h2></div><div class="badges">${unlocked.map((b) => `<div class="badge"><div class="bi">${icon(b.icon, 22)}</div><div class="bn">${esc(b.name)}</div><div class="bd">${esc(b.desc)}</div></div>`).join('')}</div></div>` : ''}
      <div class="section">${feelBlock(s)}</div>
      <div class="callout mt-16">${icon('bulb', 20)}<div><b>Jetzt:</b> 25–40 g Eiweiß in den nächsten Stunden, viel trinken und heute Nacht 7–9 Stunden schlafen.</div></div>
      <div class="stack mt-24">
        <a class="btn btn-primary btn-block" href="#/">Zur Übersicht</a>
        <a class="btn btn-ghost btn-block" href="#/verlauf/${esc(s.id)}">Details ansehen</a>
      </div>`;
  },
};

// ───── Verlauf: einzelnes Training ─────
export const historyDetailView = {
  name: 'history',
  tab: 'progress',
  render({ id }) {
    const s = store.state.sessions.find((x) => x.id === id);
    if (!s) return `${backHeader('Training', { back: '#/fortschritt' })}<p class="muted">Nicht gefunden.</p>`;
    const items = s.items.filter((it) => it.log.length).map((it) => {
      const ex = EX_BY_ID[it.ex];
      const pr = s.prs.find((p) => p.ex === it.ex);
      return `<div class="item" style="align-items:flex-start">
        <div class="tile-ic">${icon(pr ? 'trend' : 'dumbbell', 18)}</div>
        <div class="grow"><div class="title">${esc(ex?.name || it.ex)} ${pr ? '<span class="chip chip-accent" style="height:20px">Rekord</span>' : ''}</div>
          <div class="sub num-tab">${it.log.map((x) => `${x.kg !== '' && x.kg != null ? `${esc(fmtDec(x.kg))} kg × ` : ''}${esc(x.reps)}${ex?.type === 'time' ? ' s' : ex?.type === 'cardio' ? ' min' : ''}`).join(' · ')}</div></div>
      </div>`;
    }).join('');
    return `${backHeader(s.name, { back: 'back:#/fortschritt', sub: fmtDateLong(new Date(s.date)) })}
      <div class="stats three">
        <div class="stat"><div class="v">${Math.round(s.duration / 60)}<small> Min</small></div><div class="l">Dauer</div></div>
        <div class="stat"><div class="v">${sessionSetCount(s)}</div><div class="l">Sätze</div></div>
        <div class="stat"><div class="v">${fmtNum(s.volume)}<small> kg</small></div><div class="l">Volumen</div></div>
      </div>
      <div class="card mt-12"><div class="list">${items || '<div class="item muted">Keine Sätze gespeichert.</div>'}</div></div>
      <div class="section">${feelBlock(s)}</div>
      <button class="btn btn-danger btn-block mt-24" data-action="delete-session" data-id="${esc(s.id)}">${icon('trash', 18)} Training löschen</button>`;
  },
};

on('delete-session', async (el) => {
  const ok = await confirmDialog({ title: 'Training löschen?', text: 'Das Training wird dauerhaft aus deinem Verlauf entfernt.', ok: 'Löschen', danger: true });
  if (!ok) return;
  store.state.sessions = store.state.sessions.filter((s) => s.id !== el.dataset.id);
  store.save();
  toast('Training gelöscht', 'trash');
  go('#/fortschritt');
});
