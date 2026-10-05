import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { on, go } from '../router.js';
import { confirmDialog } from '../ui/components.js';
import { startSession, personalWorkout } from '../logic.js';
import { buildWorkout, estimateMinutes, workoutMuscles } from '../data/program.js';
import { MUSCLES } from '../data/exercises.js';

export function phaseChip(phase) {
  return `<span class="chip chip-phase ph-${phase.num}">Phase ${phase.num} · ${esc(phase.name)}</span>`;
}

export function kindChip(info) {
  if (info.kind === 'deload') return `<span class="chip chip-good">${icon('leaf', 13)} Deload</span>`;
  if (info.kind === 'test') return `<span class="chip chip-warn">${icon('target', 13)} Testwoche</span>`;
  return '';
}

export function rirChip(info) {
  return `<span class="chip">RIR ${esc(info.rir)}</span>`;
}

export function muscleChips(muscles, max = 5, accentFirst = 2) {
  return muscles.slice(0, max).map((m, i) =>
    `<span class="chip ${i < accentFirst ? 'chip-accent' : ''}">${esc(MUSCLES[m]?.name || m)}</span>`).join('');
}

export function workoutCard({ workoutId, week, slot }, { eyebrow = '', primary = true } = {}) {
  const w = personalWorkout(workoutId, week);
  const mins = estimateMinutes(w);
  const sets = w.items.reduce((n, it) => n + it.sets, 0);
  const preview = w.items.slice(0, 5).map((it) => `<li>${esc(it.exercise.name)} <span class="faint">· ${it.sets}×${esc(it.reps)}</span></li>`).join('');
  return `<div class="card">
    ${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}
    <div class="row-between mt-8" style="align-items:flex-start">
      <div class="grow">
        <h2 class="h" style="font-size:22px">${esc(w.name)}</h2>
        <div class="small muted mt-8 row" style="gap:14px">
          <span class="row" style="gap:5px">${icon('clock', 15)} ca. ${mins} Min</span>
          <span class="row" style="gap:5px">${icon('list', 15)} ${w.items.length} Übungen</span>
          <span class="row" style="gap:5px">${icon('layers', 15)} ${sets} Sätze</span>
        </div>
      </div>
    </div>
    <div class="chips mt-12">${muscleChips(workoutMuscles(w))}</div>
    <ul class="bullets small muted mt-12">${preview}${w.items.length > 5 ? `<li class="faint">+ ${w.items.length - 5} weitere</li>` : ''}</ul>
    <div class="btn-row mt-16">
      <a class="btn btn-outline" href="#/workout/${workoutId}/${week}/${slot}">Details</a>
      <button class="btn ${primary ? 'btn-primary' : 'btn-dark'}" data-action="start-workout" data-w="${workoutId}" data-week="${week}" data-slot="${slot}">${icon('play', 18)} Starten</button>
    </div>
  </div>`;
}

export async function startWorkoutFlow(workoutId, week, slot) {
  const st = store.state;
  if (st.active) {
    if (st.active.workoutId === workoutId && st.active.week === week && st.active.slot === slot) return go('#/session');
    const ok = await confirmDialog({
      title: 'Es läuft bereits ein Training',
      text: `„${st.active.name}“ ist noch offen. Verwerfen und neues Training starten?`,
      ok: 'Neu starten', danger: true,
    });
    if (!ok) return;
  }
  startSession(workoutId, week, slot);
  go('#/session');
}

on('start-workout', (el) => startWorkoutFlow(el.dataset.w, Number(el.dataset.week), Number(el.dataset.slot)));
