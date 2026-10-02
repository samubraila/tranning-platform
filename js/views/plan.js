import { icon } from '../icons.js';
import { esc, fmtDayMonth, fmtClock, addDays } from '../utils.js';
import { backHeader } from '../ui/components.js';
import { currentWeek, weekStatus, slotSession, dateFor, weekStartDate } from '../logic.js';
import { store } from '../store.js';
import { PHASES, TOTAL_WEEKS, WORKOUTS, WEEKDAYS_LONG, WARMUP, weekInfo, weekSchedule, buildWorkout, estimateMinutes } from '../data/program.js';
import { phaseChip, kindChip, rirChip, muscleChips } from './shared.js';
import { workoutMuscles, targetText } from '../data/program.js';

function timeline(cw) {
  const segs = PHASES.map((p) => `<span class="ph-${p.num}" style="flex:${p.weeks[1] - p.weeks[0] + 1}" title="Phase ${p.num}: ${esc(p.name)}"></span>`).join('');
  const marker = cw >= 1 && cw <= TOTAL_WEEKS
    ? `<div class="timeline-marker" style="left:${((cw - 0.5) / TOTAL_WEEKS) * 100}%">W${cw}</div>` : '';
  return `<div class="timeline-wrap">${marker}<div class="timeline">${segs}</div></div>
    <div class="legend mt-12">${PHASES.map((p) => `<span><i class="sw ph-${p.num}" style="background:var(--phase)"></i>${p.num} · ${esc(p.name)}</span>`).join('')}</div>`;
}

function yearGrid(cw) {
  const cells = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const info = weekInfo(w);
    const st = weekStatus(w);
    const cls = ['wcell', `ph-${info.phase.num}`];
    if (info.kind === 'deload') cls.push('deload');
    if (info.kind === 'test') cls.push('test');
    if (st.complete) cls.push('full');
    if (w === cw) cls.push('cur');
    if (w < cw) cls.push('past');
    const label = `Woche ${w}, Phase ${info.phase.num} ${info.phase.name}${info.kind === 'deload' ? ', Deload' : info.kind === 'test' ? ', Testwoche' : ''}${st.complete ? ', komplett' : ''}`;
    cells.push(`<a class="${cls.join(' ')}" href="#/woche/${w}" aria-label="${esc(label)}">${st.complete ? '✓' : w}</a>`);
  }
  return `<div class="yeargrid">${cells.join('')}</div>
  <div class="legend mt-12">
    <span><i class="sw" style="background:repeating-linear-gradient(45deg,var(--text-3) 0 2px,transparent 2px 4px)"></i>Deload</span>
    <span><i class="sw" style="background:repeating-linear-gradient(135deg,var(--text-3) 0 2px,transparent 2px 4px)"></i>Testwoche</span>
    <span><i class="sw" style="background:var(--text-2)"></i>✓ komplett</span>
  </div>`;
}

function phaseCard(p, cw) {
  const isCur = cw >= p.weeks[0] && cw <= p.weeks[1];
  const refWeek = isCur ? cw : p.weeks[0];
  const rot = p.rotation(refWeek);
  const unique = [...new Set(rot)];
  const workouts = unique.map((id) => {
    const slot = rot.indexOf(id);
    const w = buildWorkout(id, refWeek);
    return `<a class="item" href="#/workout/${id}/${refWeek}/${slot}">
      <div class="idx">${String.fromCharCode(65 + unique.indexOf(id))}</div>
      <div class="grow"><div class="title">${esc(w.name)}</div><div class="sub">${w.items.length} Übungen · ca. ${estimateMinutes(w)} Min</div></div>
      ${icon('right', 18, 'faint')}
    </a>`;
  }).join('');
  return `<details class="card phase-card disclosure ph-${p.num}" ${isCur ? 'open' : ''}>
    <summary class="row-between">
      <div class="grow">
        <div class="row" style="gap:8px"><span class="phase-dot"></span><span class="eyebrow">Phase ${p.num} · Woche ${p.weeks[0]}–${p.weeks[1]}</span>${isCur ? '<span class="chip chip-solid" style="height:22px">Aktuell</span>' : ''}</div>
        <h3 class="h mt-8" style="font-size:19px">${esc(p.name)}</h3>
        <div class="small muted">${esc(p.tagline)}</div>
      </div>
      ${icon('down', 22, 'chev')}
    </summary>
    <div class="mt-16">
      <dl class="kv">
        <dt>Split</dt><dd>${esc(p.split)}</dd>
        <dt>Frequenz</dt><dd>${p.perWeek}× pro Woche</dd>
        <dt>Wiederholungen</dt><dd>${esc(p.reps)}</dd>
        <dt>Dauer</dt><dd>${p.weeks[1] - p.weeks[0] + 1} Wochen</dd>
      </dl>
      <h4 class="h mt-16" style="font-size:15px">Ziel</h4>
      <p class="small muted mt-8">${esc(p.goal)}</p>
      <h4 class="h mt-16" style="font-size:15px">Warum so?</h4>
      <p class="small muted mt-8">${esc(p.why)}</p>
      <div class="callout mt-16">${icon('heart', 18)}<div><b>Cardio:</b> ${esc(p.cardio)}</div></div>
      <h4 class="h mt-16" style="font-size:15px">Trainingseinheiten</h4>
      <div class="list mt-8">${workouts}</div>
    </div>
  </details>`;
}

export const planView = {
  name: 'plan',
  tab: 'plan',
  render() {
    const cw = currentWeek();
    return `<header class="topbar"><div class="titles"><h1 class="page-title">Jahresplan</h1><p class="page-sub">52 Wochen · 6 Phasen · periodisiert für dein McFit-Training</p></div></header>
      <div class="card">${timeline(cw)}</div>
      <div class="section">
        <div class="section-head"><h2 class="h">Alle 52 Wochen</h2>${cw >= 1 && cw <= TOTAL_WEEKS ? `<a href="#/woche/${cw}">Aktuelle Woche</a>` : ''}</div>
        <div class="card">${yearGrid(cw)}</div>
      </div>
      <div class="section">
        <a class="callout accent card-link" href="#/lektion/periodisierung">${icon('grad', 20)}<div class="grow"><b>Wie funktioniert dein Plan?</b><br>Periodisierung, Deloads und Testwochen in 5 Minuten erklärt.</div>${icon('right', 18)}</a>
      </div>
      <div class="section">
        <div class="section-head"><h2 class="h">Die 6 Phasen</h2></div>
        <div class="stack">${PHASES.map((p) => phaseCard(p, cw)).join('')}</div>
      </div>`;
  },
};

export const weekView = {
  name: 'week',
  tab: 'plan',
  render({ n }) {
    const week = Math.min(Math.max(parseInt(n, 10) || 1, 1), TOTAL_WEEKS);
    const info = weekInfo(week);
    const sched = weekSchedule(week, store.state.settings);
    const st = weekStatus(week);
    const start = weekStartDate(week);
    const cw = currentWeek();
    const rows = sched.map((x) => {
      const w = buildWorkout(x.workoutId, week);
      const s = slotSession(week, x.slot);
      const date = dateFor(week, x.day);
      const href = s ? `#/verlauf/${s.id}` : `#/workout/${x.workoutId}/${week}/${x.slot}`;
      return `<a class="item" href="${href}">
        <div class="idx ${s ? 'ok' : ''}">${s ? icon('check', 16) : x.slot + 1}</div>
        <div class="grow"><div class="title">${esc(w.name)}</div><div class="sub">${WEEKDAYS_LONG[x.day]}, ${esc(fmtDayMonth(date))} · ca. ${estimateMinutes(w)} Min${s ? ' · erledigt' : ''}</div></div>
        ${icon('right', 18, 'faint')}
      </a>`;
    }).join('');
    return `${backHeader(`Woche ${week}`, { back: '#/plan', sub: `Phase ${info.phase.num} · ${info.phase.name}` })}
      <div class="row-between">
        <a class="btn btn-sm btn-outline" href="#/woche/${Math.max(1, week - 1)}" ${week === 1 ? 'aria-disabled="true" style="visibility:hidden"' : ''}>${icon('left', 16)} W${week - 1}</a>
        <span class="small faint">${esc(fmtDayMonth(start))} – ${esc(fmtDayMonth(addDays(start, 6)))}${week === cw ? ' · diese Woche' : ''}</span>
        <a class="btn btn-sm btn-outline" href="#/woche/${Math.min(TOTAL_WEEKS, week + 1)}" ${week === TOTAL_WEEKS ? 'style="visibility:hidden"' : ''}>W${week + 1} ${icon('right', 16)}</a>
      </div>
      <div class="card hero ph-${info.phase.num} mt-16">
        <div class="eyebrow">Woche ${info.weekOfPhase} von ${info.phaseLength} · ${esc(info.phase.split)}</div>
        <h2 class="h mt-8" style="font-size:24px">${esc(info.label)}</h2>
        <div class="chips mt-12">${phaseChip(info.phase)}${rirChip(info)}${kindChip(info)}</div>
        <div class="progress mt-16"><span style="width:${(st.done / Math.max(1, st.total)) * 100}%"></span></div>
        <div class="small muted mt-8">${st.done} von ${st.total} Trainings erledigt</div>
      </div>
      ${info.notes.length ? `<div class="stack-sm mt-12">${info.notes.map((t) => `<div class="callout ${info.kind === 'deload' ? 'accent' : info.kind === 'test' ? 'warn' : ''}">${icon('info', 20)}<div>${esc(t)}</div></div>`).join('')}</div>` : ''}
      <div class="section">
        <div class="section-head"><h2 class="h">Trainings</h2></div>
        <div class="card"><div class="list">${rows}</div></div>
        <p class="tiny faint mt-8">Tage anpassen unter Einstellungen → Trainingstage. Verpasst? Mach einfach mit dem nächsten offenen Training weiter.</p>
      </div>
      <div class="section">
        <div class="section-head"><h2 class="h">Zusätzlich diese Woche</h2></div>
        <div class="stack-sm">
          <div class="callout">${icon('heart', 20)}<div><b>Cardio</b><br>${esc(info.phase.cardio)}</div></div>
          <div class="callout">${icon('flame', 20)}<div><b>Aufwärmen vor jedem Training</b><ul class="bullets mt-8">${WARMUP.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div></div>
        </div>
      </div>`;
  },
};

export const workoutPreviewView = {
  name: 'workout',
  tab: 'plan',
  render({ id, week, slot }) {
    if (!WORKOUTS[id]) return `${backHeader('Training', { back: '#/plan' })}<p class="muted">Training nicht gefunden.</p>`;
    const wk = Math.min(Math.max(parseInt(week, 10) || 1, 1), TOTAL_WEEKS);
    const w = buildWorkout(id, wk);
    const info = w.info;
    const sets = w.items.reduce((n, it) => n + it.sets, 0);
    const done = slotSession(wk, Number(slot));
    const items = w.items.map((it, i) => {
      const ex = it.exercise;
      const target = targetText(w.items, i);
      const prevSS = w.items[i - 1]?.ss;
      const nextSS = w.items[i + 1]?.ss;
      const ssLabel = it.ss ? `<span class="ss-badge">${it.ss}${it.ss === prevSS ? 2 : 1}</span>` : '';
      return `<a class="item" href="#/uebung/${ex.id}">
        <div class="idx">${it.finisher ? icon('heart', 15) : i + 1}</div>
        <div class="grow">
          <div class="title row" style="gap:8px">${ssLabel}<span>${esc(ex.name)}</span></div>
          <div class="sub">${esc(target)}</div>
          ${it.note ? `<div class="tiny faint mt-8">${esc(it.note)}</div>` : ''}
          ${it.tags.length ? `<div class="chips mt-8">${it.tags.map((t) => `<span class="chip chip-warn">${esc(t)}</span>`).join('')}</div>` : ''}
        </div>
        ${icon('right', 18, 'faint')}
      </a>`;
    }).join('');
    return `${backHeader(w.name, { back: `#/woche/${wk}`, sub: `Woche ${wk} · Phase ${info.phase.num} ${info.phase.name}` })}
      <div class="card hero ph-${info.phase.num}">
        <div class="eyebrow">${esc(w.focus)}</div>
        <h2 class="h mt-8" style="font-size:24px">${esc(w.name)}</h2>
        <div class="small muted mt-8 row wrap" style="gap:14px">
          <span class="row" style="gap:5px">${icon('clock', 15)} ca. ${estimateMinutes(w)} Min</span>
          <span class="row" style="gap:5px">${icon('list', 15)} ${w.items.length} Übungen</span>
          <span class="row" style="gap:5px">${icon('layers', 15)} ${sets} Sätze</span>
        </div>
        <div class="chips mt-12">${rirChip(info)}${kindChip(info)}${muscleChips(workoutMuscles(w), 4, 2)}</div>
        ${done
          ? `<a class="btn btn-outline btn-block mt-16" href="#/verlauf/${done.id}">${icon('check', 18)} Erledigt – Ergebnis ansehen</a>`
          : `<button class="btn btn-primary btn-block mt-16" data-action="start-workout" data-w="${id}" data-week="${wk}" data-slot="${Number(slot)}">${icon('play', 18)} Training starten</button>`}
      </div>
      ${info.notes.length ? `<div class="stack-sm mt-12">${info.notes.map((t) => `<div class="callout">${icon('info', 20)}<div>${esc(t)}</div></div>`).join('')}</div>` : ''}
      <div class="section">
        <details class="card disclosure">
          <summary class="row-between"><div class="row">${icon('flame', 20)}<b>Aufwärmen (8–10 Min)</b></div>${icon('down', 20, 'chev')}</summary>
          <ul class="bullets small muted mt-12">${WARMUP.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </details>
      </div>
      <div class="section">
        <div class="section-head"><h2 class="h">Übungen</h2><span class="small faint">Tippen für Technik</span></div>
        <div class="card"><div class="list">${items}</div></div>
      </div>`;
  },
};
