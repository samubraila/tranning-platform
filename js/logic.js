// Abgeleitete Werte: aktuelle Woche, Fortschritt, Vorschläge, Rekorde, Erfolge, XP.
import { store } from './store.js';
import { parseISO, daysBetween, addDays, weekdayIndex, e1rm, parseRange, parseNum, uid, mondayOf, toISO } from './utils.js';
import { TOTAL_WEEKS, weekInfo, weekSchedule, buildWorkout, PHASES } from './data/program.js';
import { EX_BY_ID } from './data/exercises.js';
import { ACHIEVEMENTS, LESSONS, XP, LEVELS } from './data/academy.js';

const S = () => store.state;

// ───── Woche & Termine ─────
export function planStart() {
  return parseISO(S().settings.startDate);
}

// 0 = Plan hat noch nicht begonnen, 1–52 = laufend, 53 = abgeschlossen
export function currentWeek(date = new Date()) {
  const d = daysBetween(planStart(), date);
  if (d < 0) return 0;
  return Math.min(Math.floor(d / 7) + 1, TOTAL_WEEKS + 1);
}

export function weekStartDate(week) {
  return addDays(planStart(), (week - 1) * 7);
}

export function dateFor(week, day) {
  return addDays(weekStartDate(week), day);
}

export function setStartForPhase(phaseNum, baseMonday = mondayOf(new Date())) {
  const phase = PHASES.find((p) => p.num === phaseNum) || PHASES[0];
  S().settings.startDate = toISO(addDays(baseMonday, -(phase.weeks[0] - 1) * 7));
}

const cycleOf = (s) => s.cycle || 1;
export const currentCycle = () => S().settings.cycle || 1;

export function sessionsInWeek(week) {
  const c = currentCycle();
  return S().sessions.filter((s) => s.week === week && cycleOf(s) === c);
}

export function slotSession(week, slot) {
  const c = currentCycle();
  return S().sessions.find((s) => s.week === week && s.slot === slot && cycleOf(s) === c);
}

export function weekStatus(week) {
  const sched = weekSchedule(week, S().settings);
  const done = sched.filter((x) => slotSession(week, x.slot)).length;
  return { total: sched.length, done, complete: done >= sched.length };
}

export function nextOpenSlot(week) {
  return weekSchedule(week, S().settings).find((x) => !slotSession(week, x.slot)) || null;
}

export function todayPlan(date = new Date()) {
  const week = currentWeek(date);
  if (week < 1 || week > TOTAL_WEEKS) return { week, info: null, todaySlot: null, next: null, schedule: [] };
  const schedule = weekSchedule(week, S().settings);
  const wd = weekdayIndex(date);
  const todaySlot = schedule.find((x) => x.day === wd) || null;
  return { week, info: weekInfo(week), schedule, todaySlot, next: nextOpenSlot(week) };
}

// ───── Leistungsdaten ─────
function doneSets(item) {
  return (item.log || []).filter((s) => s.done);
}

export function lastPerformance(exId, excludeId) {
  const sessions = S().sessions;
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    if (s.id === excludeId) continue;
    const item = s.items.find((it) => it.ex === exId && doneSets(it).length);
    if (item) return { date: s.date, sets: doneSets(item), reps: item.reps };
  }
  return null;
}

export function bestE1RM(exId, excludeId) {
  let best = 0;
  for (const s of S().sessions) {
    if (s.id === excludeId) continue;
    for (const it of s.items) {
      if (it.ex !== exId) continue;
      for (const set of doneSets(it)) {
        const kg = parseNum(set.kg);
        const reps = parseNum(set.reps);
        if (kg > 0 && reps > 0) best = Math.max(best, e1rm(kg, reps));
      }
    }
  }
  return best;
}

export function exerciseHistory(exId) {
  const out = [];
  for (const s of S().sessions) {
    let best = 0;
    let top = null;
    for (const it of s.items) {
      if (it.ex !== exId) continue;
      for (const set of doneSets(it)) {
        const kg = parseNum(set.kg);
        const reps = parseNum(set.reps);
        if (kg > 0 && reps > 0 && e1rm(kg, reps) > best) {
          best = e1rm(kg, reps);
          top = { kg, reps };
        }
      }
    }
    if (best) out.push({ date: s.date, e1rm: Math.round(best * 10) / 10, ...top });
  }
  return out;
}

// Vorschlag nach doppelter Progression
export function suggestion(exId, targetReps) {
  const ex = EX_BY_ID[exId];
  const last = lastPerformance(exId);
  if (!last || !ex || ex.type === 'cardio') return null;
  const [, top] = parseRange(targetReps);
  const reps = last.sets.map((s) => parseNum(s.reps)).filter((n) => !Number.isNaN(n));
  const kgs = last.sets.map((s) => parseNum(s.kg)).filter((n) => !Number.isNaN(n));
  const hitTop = reps.length > 0 && reps.every((r) => r >= top);
  const kg = kgs.length ? Math.max(...kgs) : null;
  if (ex.type === 'time') {
    return hitTop
      ? { kind: 'up', text: 'Ziel erreicht – halte 5–10 Sek. länger oder nimm Zusatzgewicht.' }
      : { kind: 'same', text: 'Gleiche Variante – versuche ein paar Sekunden länger zu halten.' };
  }
  if (hitTop) {
    if (ex.assisted) return { kind: 'up', kg, text: 'Ziel erreicht – Unterstützung um 5 kg verringern.' };
    const step = ex.equipment === 'kh' ? '+1–2 kg pro Hantel' : ex.equipment === 'kabel' ? '+1 Stufe (2,5–5 kg)' : '+2,5–5 kg';
    return { kind: 'up', kg, text: `Ziel erreicht – Gewicht erhöhen (${step}).` };
  }
  return { kind: 'same', kg, text: 'Gleiches Gewicht – schaffe 1–2 Wiederholungen mehr.' };
}

export function sessionVolume(session) {
  let v = 0;
  for (const it of session.items) {
    const ex = EX_BY_ID[it.ex];
    if (!ex || ex.type !== 'reps' || ex.assisted) continue;
    for (const s of doneSets(it)) {
      const kg = parseNum(s.kg);
      const reps = parseNum(s.reps);
      if (kg > 0 && reps > 0) v += kg * reps;
    }
  }
  return Math.round(v);
}

export function sessionSetCount(session) {
  return session.items.reduce((n, it) => n + doneSets(it).length, 0);
}

export function totals() {
  const sessions = S().sessions;
  return {
    workouts: sessions.length,
    volume: sessions.reduce((n, s) => n + (s.volume || 0), 0),
    prs: sessions.reduce((n, s) => n + (s.prs?.length || 0), 0),
    sets: sessions.reduce((n, s) => n + sessionSetCount(s), 0),
    minutes: Math.round(sessions.reduce((n, s) => n + (s.duration || 0), 0) / 60),
  };
}

export function streakWeeks() {
  const now = Math.min(currentWeek(), TOTAL_WEEKS);
  if (now < 1) return 0;
  let w = weekStatus(now).complete ? now : now - 1;
  let n = 0;
  while (w >= 1 && weekStatus(w).complete) {
    n++;
    w--;
  }
  return n;
}

// ───── XP & Level ─────
export function xpTotal() {
  const st = S();
  const t = totals();
  const lessons = Object.values(st.lessons).filter((l) => l.done);
  const perfect = lessons.filter((l) => l.perfect).length;
  return t.workouts * XP.workout + lessons.length * XP.lesson + perfect * XP.quizPerfect + t.prs * XP.pr;
}

export function levelInfo(xp = xpTotal()) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.min) idx = i; });
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const progress = next ? (xp - cur.min) / (next.min - cur.min) : 1;
  return { level: idx + 1, name: cur.name, xp, next: next ? next.min : null, progress };
}

// ───── Training starten / beenden ─────
export function startSession(workoutId, week, slot) {
  const w = buildWorkout(workoutId, week);
  const items = w.items.map((it) => makeItem(it));
  S().active = {
    id: uid(),
    workoutId,
    week,
    slot,
    cycle: currentCycle(),
    name: w.name,
    startedAt: Date.now(),
    items,
  };
  store.save();
  return S().active;
}

export function makeItem(it, exId = it.ex) {
  const last = lastPerformance(exId);
  const log = Array.from({ length: it.sets }, (_, i) => {
    const prev = last?.sets[i] || last?.sets[last.sets.length - 1];
    return { kg: prev && prev.kg !== '' ? String(prev.kg) : '', reps: '', done: false };
  });
  return {
    ex: exId,
    planned: it.ex,
    sets: it.sets,
    reps: it.reps,
    rest: it.rest,
    rir: it.rir,
    note: it.note || '',
    ss: it.ss || null,
    finisher: !!it.finisher,
    tags: it.tags || [],
    log,
  };
}

export function finishSession() {
  const st = S();
  const a = st.active;
  if (!a) return null;
  const end = Date.now();
  const session = {
    id: a.id,
    workoutId: a.workoutId,
    week: a.week,
    slot: a.slot,
    cycle: a.cycle || 1,
    name: a.name,
    date: new Date(a.startedAt).toISOString(),
    duration: Math.round((end - a.startedAt) / 1000),
    items: a.items.map((it) => ({ ...it, log: it.log.filter((s) => s.done) })),
  };
  // Rekorde gegen alle bisherigen Trainings
  const prs = [];
  for (const it of session.items) {
    const ex = EX_BY_ID[it.ex];
    if (!ex || ex.type !== 'reps' || ex.assisted) continue;
    const before = bestE1RM(it.ex);
    let best = 0;
    let top = null;
    for (const s of it.log) {
      const kg = parseNum(s.kg);
      const reps = parseNum(s.reps);
      if (kg > 0 && reps > 0 && e1rm(kg, reps) > best) { best = e1rm(kg, reps); top = { kg, reps }; }
    }
    if (before > 0 && best > before + 0.01) prs.push({ ex: it.ex, kg: top.kg, reps: top.reps, e1rm: Math.round(best * 10) / 10 });
  }
  session.prs = prs;
  session.volume = sessionVolume(session);
  st.sessions.push(session);
  st.active = null;
  const unlocked = checkAchievements();
  store.save();
  return { session, unlocked };
}

// ───── Erfolge ─────
export function checkAchievements() {
  const st = S();
  const t = totals();
  const have = st.achievements;
  const unlocked = [];
  const give = (id, cond) => {
    if (cond && !have[id]) {
      have[id] = new Date().toISOString();
      unlocked.push(ACHIEVEMENTS.find((a) => a.id === id));
    }
  };
  give('first-workout', t.workouts >= 1);
  give('workouts-10', t.workouts >= 10);
  give('workouts-25', t.workouts >= 25);
  give('workouts-50', t.workouts >= 50);
  give('workouts-100', t.workouts >= 100);
  give('workouts-150', t.workouts >= 150);
  const weeksDone = new Set(st.sessions.map((s) => s.week));
  give('week-complete', [...weeksDone].some((w) => w >= 1 && w <= TOTAL_WEEKS && weekStatus(w).complete));
  const streak = streakWeeks();
  give('streak-4', streak >= 4);
  give('streak-12', streak >= 12);
  give('first-pr', t.prs >= 1);
  give('prs-25', t.prs >= 25);
  give('tons-10', t.volume >= 10_000);
  give('tons-100', t.volume >= 100_000);
  give('tons-500', t.volume >= 500_000);
  give('deload', st.sessions.some((s) => s.week >= 1 && s.week <= TOTAL_WEEKS && weekInfo(s.week).kind === 'deload'));
  give('test', st.sessions.some((s) => s.week >= 1 && s.week <= TOTAL_WEEKS && weekInfo(s.week).kind === 'test'));
  const cw = currentWeek();
  give('phase-2', cw >= 9);
  give('phase-4', cw >= 29);
  give('phase-6', cw >= 47);
  const lessons = Object.values(st.lessons).filter((l) => l.done);
  give('first-lesson', lessons.length >= 1);
  give('all-lessons', lessons.length >= LESSONS.length);
  give('quiz-perfect', lessons.some((l) => l.perfect));
  give('bodyweight', st.bodyweight.length >= 1);
  if (unlocked.length) store.save();
  return unlocked.filter(Boolean);
}
