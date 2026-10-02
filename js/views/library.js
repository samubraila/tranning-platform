import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, debounce, fmtNum, fmtDayMonth } from '../utils.js';
import { on, onInput } from '../router.js';
import { backHeader } from '../ui/components.js';
import { lineChart, bindCharts } from '../ui/charts.js';
import { EXERCISES, EX_BY_ID, MUSCLES, MUSCLE_GROUPS, EQUIPMENT, ZONES, exerciseGroups } from '../data/exercises.js';
import { PHASES, WORKOUTS } from '../data/program.js';
import { exerciseHistory, lastPerformance } from '../logic.js';

const filter = { q: '', group: 'alle', equip: 'alle' };
const LEVEL = ['', 'Einsteiger', 'Fortgeschritten', 'Erfahren'];

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');

function matches(ex) {
  if (filter.group !== 'alle' && !exerciseGroups(ex).includes(filter.group)) return false;
  if (filter.equip !== 'alle' && ex.equipment !== filter.equip) return false;
  if (filter.q) {
    const hay = norm(`${ex.name} ${ex.en} ${ex.muscles.map((m) => MUSCLES[m].name).join(' ')} ${EQUIPMENT[ex.equipment]}`);
    return norm(filter.q).split(/\s+/).every((t) => hay.includes(t));
  }
  return true;
}

function levelDots(l) {
  return `<span class="row" style="gap:3px" aria-label="${LEVEL[l]}">${[1, 2, 3].map((i) => `<span style="width:6px;height:6px;border-radius:3px;background:${i <= l ? 'var(--accent-ink)' : 'var(--surface-3)'}"></span>`).join('')}</span>`;
}

function exIcon(ex) {
  return ex.type === 'cardio' ? 'heart' : ex.equipment === 'koerper' ? 'user' : ex.equipment === 'kabel' ? 'zap' : 'dumbbell';
}

function listHTML() {
  const list = EXERCISES.filter(matches);
  if (!list.length) return `<div class="card center muted" style="padding:28px">Keine Übung gefunden. Probier einen anderen Suchbegriff.</div>`;
  return `<div class="card"><div class="list">${list.map((ex) => `
    <a class="item" href="#/uebung/${ex.id}">
      <div class="tile-ic">${icon(exIcon(ex), 20)}</div>
      <div class="grow">
        <div class="title">${esc(ex.name)}</div>
        <div class="sub ellipsis">${esc(ex.muscles.map((m) => MUSCLES[m].name).join(', '))} · ${esc(EQUIPMENT[ex.equipment])}</div>
      </div>
      ${levelDots(ex.level)}
    </a>`).join('')}</div></div>
    <p class="tiny faint mt-8 center">${list.length} von ${EXERCISES.length} Übungen</p>`;
}

export const libraryView = {
  name: 'library',
  tab: 'library',
  render() {
    return `<header class="topbar"><div class="titles"><h1 class="page-title">Übungen</h1><p class="page-sub">${EXERCISES.length} Übungen für McFit – Geräte, Kabel & Freihantel</p></div></header>
      <div class="search"><span>${icon('search', 18)}</span><input class="input" type="search" placeholder="Übung, Muskel oder Gerät suchen" value="${esc(filter.q)}" data-input="lib-search" aria-label="Suchen" /></div>
      <div class="filter-scroll mt-12" role="group" aria-label="Muskelgruppe">
        ${[{ id: 'alle', name: 'Alle' }, ...MUSCLE_GROUPS].map((g) => `<button class="filter-chip ${filter.group === g.id ? 'on' : ''}" data-action="lib-group" data-g="${g.id}">${esc(g.name)}</button>`).join('')}
      </div>
      <div class="filter-scroll" role="group" aria-label="Ausstattung">
        ${[['alle', 'Jede Ausstattung'], ...Object.entries(EQUIPMENT)].map(([k, v]) => `<button class="filter-chip ${filter.equip === k ? 'on' : ''}" data-action="lib-equip" data-e="${k}">${esc(v)}</button>`).join('')}
      </div>
      <div id="lib-list" class="mt-12">${listHTML()}</div>`;
  },
};

on('lib-group', (el) => {
  filter.group = el.dataset.g;
  el.parentElement.querySelectorAll('.filter-chip').forEach((b) => b.classList.toggle('on', b === el));
  document.getElementById('lib-list').innerHTML = listHTML();
});
on('lib-equip', (el) => {
  filter.equip = el.dataset.e;
  el.parentElement.querySelectorAll('.filter-chip').forEach((b) => b.classList.toggle('on', b === el));
  document.getElementById('lib-list').innerHTML = listHTML();
});
const updateSearch = debounce(() => { const l = document.getElementById('lib-list'); if (l) l.innerHTML = listHTML(); }, 120);
onInput('lib-search', (el) => { filter.q = el.value.trim(); updateSearch(); });

// ───── Übungsdetail (Seite & Sheet) ─────
function usedIn(exId) {
  const out = [];
  for (const p of PHASES) {
    const ids = [...new Set(p.rotation(p.weeks[0]))];
    for (const id of ids) if (WORKOUTS[id].items.some((it) => it.ex === exId)) out.push(`Phase ${p.num}: ${WORKOUTS[id].name}`);
  }
  return out;
}

export function exerciseBody(ex, { compact = false } = {}) {
  const note = store.state.exNotes[ex.id] || '';
  const video = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${ex.name} richtig ausführen Technik`)}`;
  const alts = ex.alternatives.map((id) => EX_BY_ID[id]).filter(Boolean);
  const hist = compact ? [] : exerciseHistory(ex.id);
  const last = compact ? null : lastPerformance(ex.id);
  const plan = compact ? [] : usedIn(ex.id);
  const best = hist.length ? Math.max(...hist.map((h) => h.e1rm)) : 0;

  return `
    <div class="exercise-hero">
      <div class="eyebrow">${esc(EQUIPMENT[ex.equipment])} · ${esc(ZONES[ex.zone] || '')}</div>
      <h2 class="h mt-8" style="font-size:24px">${esc(ex.name)}</h2>
      <div class="small faint">${esc(ex.en)}</div>
      <div class="chips mt-12">
        ${ex.muscles.map((m) => `<span class="chip chip-accent">${esc(MUSCLES[m].name)}</span>`).join('')}
        ${ex.secondary.map((m) => `<span class="chip">${esc(MUSCLES[m].name)}</span>`).join('')}
        <span class="chip chip-outline">${levelDots(ex.level)} ${LEVEL[ex.level]}</span>
      </div>
    </div>

    <div class="card card-flat mt-16">
      <label class="field"><span class="lbl row" style="gap:6px">${icon('settings', 15)} Meine Geräte-Einstellung</span>
        <textarea class="input" rows="2" data-input="ex-note" data-id="${ex.id}" placeholder="z. B. Sitz 4 · Lehne 2 · Griff mittig">${esc(note)}</textarea>
      </label>
      <div class="tiny faint mt-8">Wird im Training bei dieser Übung angezeigt.</div>
    </div>

    <a class="btn btn-outline btn-block mt-12" href="${video}" target="_blank" rel="noopener">${icon('video', 18)} Technik-Videos ansehen ${icon('external', 14, 'faint')}</a>

    <div class="prose mt-8">
      <h3>So stellst du ein</h3>
      <ul class="bullets">${ex.setup.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h3>Ausführung</h3>
      <ol class="steps">${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <h3>Häufige Fehler</h3>
      <ul class="bullets bad">${ex.mistakes.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h3>Profi-Tipps</h3>
      <ul class="bullets good">${ex.tips.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>

    ${alts.length ? `<div class="section"><div class="section-head"><h2 class="h">Alternativen</h2><span class="small faint">falls besetzt</span></div>
      <div class="card"><div class="list">${alts.map((a) => `<a class="item" href="#/uebung/${a.id}"><div class="tile-ic">${icon(exIcon(a), 18)}</div><div class="grow"><div class="title">${esc(a.name)}</div><div class="sub">${esc(EQUIPMENT[a.equipment])}</div></div>${icon('right', 18, 'faint')}</a>`).join('')}</div></div></div>` : ''}

    ${compact ? '' : `<div class="section"><div class="section-head"><h2 class="h">Mein Verlauf</h2></div>
      ${ex.type === 'reps' && !ex.assisted ? `<div class="stats">
        <div class="stat"><div class="v">${best ? fmtNum(best) : '–'}<small> kg</small></div><div class="l">Geschätztes 1RM (Bestwert)</div></div>
        <div class="stat"><div class="v">${last ? esc(last.sets.map((s) => s.reps || '–').join('·')) : '–'}</div><div class="l">${last ? `Wdh. am ${esc(fmtDayMonth(new Date(last.date)))}${last.sets[0]?.kg ? ` · ${esc(last.sets[0].kg)} kg` : ''}` : 'Noch nicht trainiert'}</div></div>
      </div>
      <div class="card mt-12"><div class="small bold">Geschätztes 1RM im Verlauf (kg)</div><div class="mt-8">${lineChart(hist.map((h) => ({ label: fmtDayMonth(new Date(h.date)), value: h.e1rm, tip: `${fmtDayMonth(new Date(h.date))}: <b>${fmtNum(h.e1rm)} kg</b> (${fmtNum(h.kg)} kg × ${h.reps})` })), { unit: 'kg' })}</div></div>`
        : `<div class="card muted small">${last ? `Zuletzt am ${esc(fmtDayMonth(new Date(last.date)))}: ${esc(last.sets.map((s) => `${s.kg ? s.kg + ' kg × ' : ''}${s.reps}`).join(' · '))}` : 'Noch nicht trainiert.'}</div>`}
    </div>
    ${plan.length ? `<div class="section"><div class="section-head"><h2 class="h">In deinem Plan</h2></div><div class="chips">${plan.map((p) => `<span class="chip">${esc(p)}</span>`).join('')}</div></div>` : ''}`}
  `;
}

export const exerciseView = {
  name: 'exercise',
  tab: 'library',
  render({ id }) {
    const ex = EX_BY_ID[id];
    if (!ex) return `${backHeader('Übung', { back: '#/uebungen' })}<p class="muted">Übung nicht gefunden.</p>`;
    return `${backHeader(ex.name, { back: 'back:#/uebungen' })}${exerciseBody(ex)}`;
  },
  mount(root) { bindCharts(root); },
};

const saveNote = debounce(() => store.save(), 400);
onInput('ex-note', (el) => {
  const v = el.value.trim();
  if (v) store.state.exNotes[el.dataset.id] = v;
  else delete store.state.exNotes[el.dataset.id];
  saveNote();
});
