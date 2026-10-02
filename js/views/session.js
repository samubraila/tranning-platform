import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, fmtClock, fmtDuration, fmtNum, fmtDateLong, parseRange, parseNum, debounce } from '../utils.js';
import { on, onInput, go, rerender } from '../router.js';
import { openSheet, closeSheet, confirmDialog, toast, backHeader } from '../ui/components.js';
import { startTimer, stopTimer, unlockAudio } from '../ui/timer.js';
import { lastPerformance, suggestion, finishSession, makeItem, sessionSetCount } from '../logic.js';
import { EX_BY_ID, MUSCLES, EQUIPMENT } from '../data/exercises.js';
import { WARMUP, targetText } from '../data/program.js';
import { XP } from '../data/academy.js';
import { exerciseBody } from './library.js';

let tick = null;
let wakeLock = null;
let lastUnlocked = [];

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

function prevText(set, ex) {
  if (!set) return '–';
  const kg = set.kg !== '' && set.kg != null ? `${set.kg}` : '';
  if (ex.type === 'cardio') return `${set.reps || '–'}′`;
  return kg ? `${kg}×${set.reps || '–'}` : `${set.reps || '–'}`;
}

function setRow(item, i, s, ex, last) {
  const set = item.log[s];
  const [lo, hi] = parseRange(item.reps);
  const repsPh = lo === hi ? `${lo}` : `${lo}–${hi}`;
  const prev = last?.sets[s];
  const kgPh = prev?.kg ? String(prev.kg) : (ex.bw || ex.type === 'time' ? '0' : 'kg');
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
    <input class="num" inputmode="decimal" placeholder="${esc(kgPh)}" value="${esc(set.kg)}" data-input="set-field" data-i="${i}" data-s="${s}" data-f="kg" aria-label="Gewicht Satz ${s + 1}" />
    <input class="num" inputmode="numeric" placeholder="${esc(repsPh)}" value="${esc(set.reps)}" data-input="set-field" data-i="${i}" data-s="${s}" data-f="reps" aria-label="${unitFor(ex)} Satz ${s + 1}" />
    ${check}
  </div>`;
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
  const head = ex.type === 'cardio'
    ? `<div class="set-row cardio-row headrow"><span>#</span><span>Vorher</span><span>Min</span><span></span></div>`
    : `<div class="set-row headrow"><span>#</span><span>Vorher</span><span>${kgLabel(ex)}</span><span>${unitFor(ex)}</span><span></span></div>`;

  return `<section class="card ex-card ${complete ? 'complete' : ''}" id="ex-${i}">
    <div class="ex-head">
      <div class="idx ${complete ? 'ok' : ''}">${complete ? icon('check', 16) : item.finisher ? icon('heart', 15) : i + 1}</div>
      <div class="grow">
        <button class="ex-name row" style="gap:8px;text-align:left" data-action="ex-info" data-i="${i}">${ssLabel}<span>${esc(ex.name)}</span>${icon('info', 16, 'faint')}</button>
        <div class="ex-target">${esc(target)}</div>
        ${swapped ? `<div class="tiny faint mt-8">Ersetzt: ${esc(EX_BY_ID[item.planned].name)}</div>` : ''}
      </div>
    </div>
    ${item.tags.length ? `<div class="chips mt-8">${item.tags.map((t) => `<span class="chip chip-warn">${esc(t)}</span>`).join('')}</div>` : ''}
    ${item.note ? `<div class="tiny muted mt-8">${esc(item.note)}</div>` : ''}
    ${myNote ? `<div class="my-note">${icon('settings', 14)} ${esc(myNote)}</div>` : ''}
    ${sug ? `<div class="suggest ${sug.kind}">${icon(sug.kind === 'up' ? 'trend' : 'target', 16)}<span>${esc(sug.text)}</span></div>` : (ex.type === 'reps' ? `<div class="suggest">${icon('bulb', 16)}<span>Erstes Mal: wähle ein Gewicht, mit dem du ${esc(item.reps)} saubere Wdh schaffst.</span></div>` : '')}
    <div class="sets">${head}${item.log.map((_, s) => setRow(item, i, s, ex, last)).join('')}</div>
    <div class="ex-actions">
      <button class="btn btn-xs" data-action="add-set" data-i="${i}">${icon('plus', 14)} Satz</button>
      ${item.log.length > 1 ? `<button class="btn btn-xs" data-action="remove-set" data-i="${i}">${icon('minus', 14)} Satz</button>` : ''}
      ${ex.alternatives.length ? `<button class="btn btn-xs" data-action="swap-ex" data-i="${i}">${icon('swap', 14)} Tauschen</button>` : ''}
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
  if (el) el.outerHTML = exCard(A().items[i], i);
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

onInput('set-field', (el) => {
  const a = A();
  if (!a) return;
  const set = a.items[+el.dataset.i].log[+el.dataset.s];
  set[el.dataset.f] = el.value.replace(',', '.').trim();
  saveSoon();
});

on('toggle-set', (el) => {
  unlockAudio();
  const a = A();
  const i = +el.dataset.i;
  const s = +el.dataset.s;
  const item = a.items[i];
  const ex = EX_BY_ID[item.ex];
  const set = item.log[s];
  if (!set.done) {
    const row = el.closest('.set-row');
    const inputs = row.querySelectorAll('.num');
    inputs.forEach((inp) => {
      const f = inp.dataset.f;
      if (inp.value.trim() === '') {
        if (f === 'reps') set.reps = String(parseRange(item.reps)[0]);
        if (f === 'kg') {
          const ph = parseNum(inp.placeholder);
          set.kg = Number.isNaN(ph) ? '' : String(ph);
        }
      } else set[f] = inp.value.replace(',', '.').trim();
    });
    set.done = true;
    // Gewicht in die folgenden, noch leeren Sätze übernehmen
    if (set.kg !== '') item.log.forEach((x, j) => { if (j > s && !x.done && (x.kg === '' || x.kg == null)) x.kg = set.kg; });
    if (navigator.vibrate && store.state.settings.vibrate) navigator.vibrate(15);
    // Pause: im Supersatz kurze Wechselzeit, sonst reguläre Pause
    const next = a.items[i + 1];
    const lastSetOfItem = item.log.every((x) => x.done);
    const restSec = ex.type === 'cardio' ? 0 : item.rest;
    const ssSwitch = item.ss && next && next.ss === item.ss;
    if (restSec && !(lastSetOfItem && i === a.items.length - 1)) startTimer(restSec, ssSwitch ? `Wechsel zu ${item.ss}2` : 'Pause');
    if (lastSetOfItem && !item.ss && next) {
      setTimeout(() => document.getElementById(`ex-${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    }
  } else {
    set.done = false;
  }
  store.save();
  refreshCard(i);
});

on('add-set', (el) => {
  const i = +el.dataset.i;
  const item = A().items[i];
  const prev = item.log[item.log.length - 1];
  item.log.push({ kg: prev?.kg || '', reps: '', done: false });
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
  const ex = EX_BY_ID[A().items[+el.dataset.i].ex];
  openSheet(`<div class="row-between"><span class="eyebrow">Technik</span><button class="icon-btn sm" data-action="close-sheet" aria-label="Schließen">${icon('x', 18)}</button></div>${exerciseBody(ex, { compact: true })}`);
});

on('close-sheet', () => closeSheet());

on('swap-ex', (el) => {
  const i = +el.dataset.i;
  const item = A().items[i];
  const planned = EX_BY_ID[item.planned];
  const options = [planned, ...planned.alternatives.map((id) => EX_BY_ID[id])].filter(Boolean);
  openSheet(`<h3 class="h" style="font-size:19px">Übung tauschen</h3>
    <p class="small muted mt-8">Gerät besetzt oder nicht vorhanden? Wähle eine gleichwertige Alternative.</p>
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
  if (old.ex !== el.dataset.ex) {
    const fresh = makeItem({ ex: old.planned, sets: old.log.length, reps: old.reps, rest: old.rest, rir: old.rir, note: old.note, ss: old.ss, finisher: old.finisher, tags: old.tags }, el.dataset.ex);
    fresh.planned = old.planned;
    a.items[i] = fresh;
    store.save();
  }
  closeSheet();
  refreshCard(i);
  toast(`Getauscht: ${EX_BY_ID[el.dataset.ex].name}`, 'swap');
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
  lastUnlocked = res.unlocked;
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

// ───── Zusammenfassung ─────
export const summaryView = {
  name: 'summary',
  tab: 'home',
  render({ id }) {
    const s = store.state.sessions.find((x) => x.id === id);
    if (!s) return `${backHeader('Training', { back: '#/' })}<p class="muted">Nicht gefunden.</p>`;
    const xp = XP.workout + s.prs.length * XP.pr;
    const unlocked = lastUnlocked;
    lastUnlocked = [];
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
      <div class="callout mt-16">${icon('bulb', 20)}<div><b>Jetzt:</b> 25–40 g Eiweiß in den nächsten Stunden, viel trinken und heute Nacht 7–9 Stunden schlafen.</div></div>
      <div class="stack mt-24">
        <a class="btn btn-primary btn-block" href="#/">Zur Übersicht</a>
        <a class="btn btn-ghost btn-block" href="#/verlauf/${s.id}">Details ansehen</a>
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
          <div class="sub num-tab">${it.log.map((x) => `${x.kg !== '' && x.kg != null ? `${esc(x.kg)} kg × ` : ''}${esc(x.reps)}${ex?.type === 'time' ? ' s' : ex?.type === 'cardio' ? ' min' : ''}`).join(' · ')}</div></div>
      </div>`;
    }).join('');
    return `${backHeader(s.name, { back: 'back:#/fortschritt', sub: fmtDateLong(new Date(s.date)) })}
      <div class="stats three">
        <div class="stat"><div class="v">${Math.round(s.duration / 60)}<small> Min</small></div><div class="l">Dauer</div></div>
        <div class="stat"><div class="v">${sessionSetCount(s)}</div><div class="l">Sätze</div></div>
        <div class="stat"><div class="v">${fmtNum(s.volume)}<small> kg</small></div><div class="l">Volumen</div></div>
      </div>
      <div class="card mt-12"><div class="list">${items || '<div class="item muted">Keine Sätze gespeichert.</div>'}</div></div>
      <button class="btn btn-danger btn-block mt-24" data-action="delete-session" data-id="${s.id}">${icon('trash', 18)} Training löschen</button>`;
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
