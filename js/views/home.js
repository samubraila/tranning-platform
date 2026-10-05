import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, greeting, fmtDateLong, fmtDateFull, toISO, daysBetween, mondayOf, weekdayIndex } from '../utils.js';
import { on, rerender } from '../router.js';
import { confirmDialog, toast } from '../ui/components.js';
import { todayPlan, slotSession, dateFor, totals, streakWeeks, levelInfo, weekStatus, planStart, setStartForPhase } from '../logic.js';
import { WORKOUTS, SHORT, WEEKDAYS, WEEKDAYS_LONG, TOTAL_WEEKS, phaseForWeek } from '../data/program.js';
import { TIPS, LESSONS } from '../data/academy.js';
import { phaseChip, kindChip, rirChip, workoutCard } from './shared.js';

function header() {
  const name = store.state.profile.name;
  return `<header class="topbar">
    <div class="titles">
      <div class="eyebrow">${esc(fmtDateLong(new Date()))}</div>
      <h1 class="page-title mt-8">${esc(greeting())}${name ? `, ${esc(name)}` : ''}</h1>
    </div>
    <a class="icon-btn" href="#/einstellungen" aria-label="Einstellungen">${icon('settings', 20)}</a>
  </header>`;
}

function weekStrip(week, schedule) {
  const today = toISO(new Date());
  return `<div class="weekstrip">${WEEKDAYS.map((wd, d) => {
    const date = dateFor(week, d);
    const iso = toISO(date);
    const slot = schedule.find((x) => x.day === d);
    const done = slot && slotSession(week, slot.slot);
    const cls = ['day'];
    if (slot) cls.push('train');
    if (done) cls.push('done');
    if (iso === today) cls.push('today');
    if (slot && !done && iso < today) cls.push('missed');
    const inner = `<span class="w">${wd}</span><span class="d">${date.getDate()}</span><span class="lbl">${slot ? (done ? '✓ ' : '') + esc(SHORT[slot.workoutId] || '') : ''}</span>`;
    return slot
      ? `<a class="${cls.join(' ')}" href="#/workout/${slot.workoutId}/${week}/${slot.slot}" aria-label="${WEEKDAYS_LONG[d]}: ${esc(WORKOUTS[slot.workoutId].name)}${done ? ' (erledigt)' : ''}">${inner}</a>`
      : `<div class="${cls.join(' ')}">${inner}</div>`;
  }).join('')}</div>`;
}

function todaySection(plan) {
  const st = store.state;
  const { week, todaySlot, next, info } = plan;
  if (st.active) {
    const done = st.active.items.reduce((n, it) => n + it.log.filter((s) => s.done).length, 0);
    const total = st.active.items.reduce((n, it) => n + it.log.length, 0);
    return `<div class="card hero ph-${info.phase.num}">
      <div class="eyebrow">Training läuft</div>
      <h2 class="h mt-8" style="font-size:22px">${esc(st.active.name)}</h2>
      <div class="progress mt-12"><span style="width:${total ? (done / total) * 100 : 0}%"></span></div>
      <div class="small muted mt-8">${done} von ${total} Sätzen erledigt</div>
      <a class="btn btn-primary btn-block mt-16" href="#/session">${icon('play', 18)} Fortsetzen</a>
    </div>`;
  }
  const todayDone = todaySlot && slotSession(week, todaySlot.slot);
  if (todaySlot && !todayDone) return workoutCard(todaySlot, { eyebrow: 'Dein Training heute' });
  if (next) {
    const wd = weekdayIndex(new Date());
    const open = plan.schedule.filter((x) => !slotSession(week, x.slot));
    const missed = open.find((x) => x.day < wd);
    const upcoming = open.find((x) => x.day > wd);
    const head = todayDone
      ? `<div class="callout accent">${icon('check', 20)}<div><b>Heute erledigt – stark!</b><br>Gönn deinem Körper jetzt Eiweiß, Wasser und guten Schlaf.</div></div>`
      : `<div class="callout">${icon('leaf', 20)}<div><b>Heute ist Ruhetag.</b><br>${esc(info.phase.cardio)}</div></div>`;
    // Verpasstes Training an einem freien Tag nachholen, sonst das nächste anstehende zeigen
    if (missed && !todayDone) {
      return `${head}<div class="mt-12">${workoutCard(missed, { eyebrow: `Noch offen von ${WEEKDAYS_LONG[missed.day]} · heute nachholen?` })}</div>`;
    }
    const show = upcoming || missed;
    const eyebrow = upcoming ? `Nächstes Training · ${WEEKDAYS_LONG[upcoming.day]}` : `Noch offen diese Woche`;
    return `${head}<div class="mt-12">${workoutCard(show, { eyebrow, primary: false })}</div>`;
  }
  return `<div class="card center" style="padding:26px 18px">
    <div class="tile-ic accent" style="margin:0 auto 12px">${icon('trophy', 22)}</div>
    <h2 class="h">Woche ${week} komplett!</h2>
    <p class="muted mt-8">Alle Trainings dieser Woche sind geschafft. Jetzt zählen Erholung, Schritte und gutes Essen.</p>
  </div>`;
}

function statsRow() {
  const t = totals();
  const lv = levelInfo();
  return `<div class="stats three">
    <div class="stat"><div class="v">${t.workouts}</div><div class="l">Trainings</div></div>
    <div class="stat"><div class="v">${streakWeeks()}<small> Wo.</small></div><div class="l">Serie</div></div>
    <a class="stat" href="#/fortschritt"><div class="v">${lv.level}</div><div class="l">${esc(lv.name)}</div></a>
  </div>`;
}

function academyTeaser() {
  const doneMap = store.state.lessons;
  const next = LESSONS.find((l) => !doneMap[l.id]?.done);
  const done = LESSONS.filter((l) => doneMap[l.id]?.done).length;
  if (!next) {
    return `<a class="card card-link row" href="#/akademie"><div class="tile-ic accent">${icon('grad', 22)}</div>
      <div class="grow"><div class="bold">Akademie abgeschlossen</div><div class="small muted">Alle ${LESSONS.length} Lektionen geschafft – Wissen wiederholen?</div></div>${icon('right', 20, 'faint')}</a>`;
  }
  return `<a class="card card-link row" href="#/lektion/${next.id}">
    <div class="tile-ic accent">${icon('book', 22)}</div>
    <div class="grow"><div class="eyebrow">Akademie · ${done}/${LESSONS.length}</div><div class="bold mt-8">${esc(next.title)}</div><div class="small muted">${next.minutes} Min Lesezeit + Quiz</div></div>
    ${icon('right', 20, 'faint')}
  </a>`;
}

function tipOfDay() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const doy = Math.floor((new Date() - start) / 86400000);
  return `<div class="callout">${icon('bulb', 20)}<div><b>Trainer-Tipp</b><br>${esc(TIPS[doy % TIPS.length])}</div></div>`;
}

export const homeView = {
  name: 'home',
  tab: 'home',
  render() {
    const plan = todayPlan();
    const { week, info, schedule } = plan;
    let main = '';

    if (week === 0) {
      const days = daysBetween(new Date(), planStart());
      main = `<div class="card hero ph-1">
        <div class="eyebrow">Bald geht's los</div>
        <div class="big mt-12">${days}<small> ${days === 1 ? 'Tag' : 'Tage'}</small></div>
        <p class="muted mt-8">Dein Plan startet am ${esc(fmtDateFull(planStart()))}${store.state.settings.startWeek > 1 ? ` mit Woche ${store.state.settings.startWeek} (Phase ${phaseForWeek(store.state.settings.startWeek).num} · ${esc(phaseForWeek(store.state.settings.startWeek).name)})` : ''}. Schau dir schon mal die Übungen und die Akademie an.</p>
        <a class="btn btn-primary btn-block mt-16" href="#/plan">${icon('calendar', 18)} Jahresplan ansehen</a>
      </div>`;
    } else if (week > TOTAL_WEEKS) {
      main = `<div class="card hero ph-6 center" style="padding:28px 18px">
        <div class="tile-ic accent" style="margin:0 auto 12px">${icon('crown', 24)}</div>
        <h2 class="h" style="font-size:24px">Dein Trainingsjahr ist geschafft!</h2>
        <p class="muted mt-8">52 Wochen, 6 Phasen – Respekt. Sieh dir deinen Fortschritt an und starte das nächste Jahr. Deine Daten bleiben erhalten.</p>
        <div class="btn-row mt-16"><a class="btn btn-outline" href="#/fortschritt">Fortschritt</a><button class="btn btn-primary" data-action="new-year">Neues Jahr</button></div>
      </div>`;
    } else {
      const ws = weekStatus(week);
      main = `
      <a class="card hero card-link ph-${info.phase.num}" href="#/woche/${week}">
        <div class="row-between"><div class="eyebrow">Phase ${info.phase.num} · ${esc(info.phase.name)}</div>${icon('right', 18, 'faint')}</div>
        <div class="big mt-12">Woche ${week}<small> / ${TOTAL_WEEKS}</small></div>
        <div class="chips mt-12"><span class="chip chip-outline">${esc(info.label)}</span>${rirChip(info)}${kindChip(info)}<span class="chip">${ws.done}/${ws.total} Trainings</span></div>
        <div class="progress mt-16" aria-label="Jahresfortschritt"><span style="width:${((week - 1 + ws.done / Math.max(1, ws.total)) / TOTAL_WEEKS) * 100}%"></span></div>
        <div class="row-between tiny faint mt-8"><span>Jahresfortschritt</span><span>Woche ${info.weekOfPhase} von ${info.phaseLength} in Phase ${info.phase.num}</span></div>
      </a>
      <div class="section">${todaySection(plan)}</div>
      <div class="section">
        <div class="section-head"><h2 class="h">Diese Woche</h2><a href="#/woche/${week}">Details</a></div>
        ${weekStrip(week, schedule)}
        ${info.notes.length ? `<div class="stack-sm mt-12">${info.notes.map((n) => `<div class="callout ${info.kind === 'deload' ? 'accent' : info.kind === 'test' ? 'warn' : ''}">${icon(info.kind === 'deload' ? 'leaf' : info.kind === 'test' ? 'target' : 'info', 20)}<div>${esc(n)}</div></div>`).join('')}</div>` : ''}
      </div>`;
    }

    return `${header()}
      ${main}
      <div class="section">${statsRow()}</div>
      <div class="section stack">${academyTeaser()}${tipOfDay()}</div>`;
  },
};

on('new-year', async () => {
  const ok = await confirmDialog({ title: 'Neues Trainingsjahr starten?', text: 'Der Plan beginnt diese Woche wieder mit Phase 1. Deine Trainings, Rekorde und Erfolge bleiben gespeichert.', ok: 'Starten' });
  if (!ok) return;
  store.state.settings.cycle = (store.state.settings.cycle || 1) + 1;
  setStartForPhase(1, mondayOf(new Date()));
  store.save();
  toast('Neues Jahr gestartet – auf geht’s!', 'zap');
  rerender();
});
