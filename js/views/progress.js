import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, fmtNum, fmtDayMonth, fmtDateShort, todayISO, parseNum, parseISO } from '../utils.js';
import { on, onChange, rerender } from '../router.js';
import { toast, confirmDialog } from '../ui/components.js';
import { barChart, lineChart, bindCharts } from '../ui/charts.js';
import { totals, streakWeeks, levelInfo, currentWeek, exerciseHistory, sessionsInWeek, checkAchievements, sessionSetCount } from '../logic.js';
import { TOTAL_WEEKS } from '../data/program.js';
import { EX_BY_ID } from '../data/exercises.js';
import { ACHIEVEMENTS } from '../data/academy.js';

let selectedEx = null;
let showAllHistory = false;

function weeklyChart() {
  const cw = Math.min(Math.max(currentWeek(), 1), TOTAL_WEEKS);
  const from = Math.max(1, cw - 11);
  const data = [];
  for (let w = from; w <= cw; w++) {
    const ss = sessionsInWeek(w);
    const vol = ss.reduce((n, s) => n + (s.volume || 0), 0);
    data.push({ label: `W${w}`, value: vol, tip: `Woche ${w}: <b>${fmtNum(vol)} kg</b> · ${ss.length} Training${ss.length === 1 ? '' : 's'}` });
  }
  return barChart(data, { unit: 'kg', valueFmt: (v) => (v >= 1000 ? `${fmtNum(Math.round(v / 100) / 10)}k` : fmtNum(v)), tableHead: ['Woche', 'Volumen'] });
}

function trainedExercises() {
  const set = new Map();
  for (const s of store.state.sessions) {
    for (const it of s.items) {
      const ex = EX_BY_ID[it.ex];
      if (ex && ex.type === 'reps' && !ex.assisted && it.log.some((x) => parseNum(x.kg) > 0)) set.set(ex.id, (set.get(ex.id) || 0) + 1);
    }
  }
  return [...set.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => EX_BY_ID[id]);
}

function exerciseChart() {
  const list = trainedExercises();
  if (!list.length) return `<div class="chart-empty">Sobald du Gewichte einträgst, siehst du hier deine Kraftentwicklung pro Übung.</div>`;
  if (!selectedEx || !list.find((e) => e.id === selectedEx)) selectedEx = list[0].id;
  const hist = exerciseHistory(selectedEx);
  return `<select class="input" data-change="prog-ex" aria-label="Übung wählen">${list.map((e) => `<option value="${e.id}" ${e.id === selectedEx ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select>
    <div class="small faint mt-12">Geschätztes 1RM (kg) – berechnet aus Gewicht × Wiederholungen</div>
    <div class="mt-8">${lineChart(hist.map((h) => ({ label: fmtDayMonth(new Date(h.date)), value: h.e1rm, tip: `${fmtDayMonth(new Date(h.date))}: <b>${fmtNum(h.e1rm)} kg</b> (${fmtNum(h.kg)} × ${h.reps})` })), { unit: 'kg' })}</div>`;
}

function bodyweightBlock() {
  const bw = [...store.state.bodyweight].sort((a, b) => a.date.localeCompare(b.date));
  const last = bw[bw.length - 1];
  const first = bw[0];
  const diff = last && first && bw.length > 1 ? Math.round((last.kg - first.kg) * 10) / 10 : null;
  return `<div class="row" style="align-items:flex-end;gap:8px">
      <label class="field grow"><span class="lbl">Gewicht (kg)</span><input class="input" id="bw-kg" inputmode="decimal" placeholder="${last ? esc(String(last.kg).replace('.', ',')) : 'z. B. 80,5'}" /></label>
      <label class="field" style="width:42%"><span class="lbl">Datum</span><input class="input" id="bw-date" type="date" value="${todayISO()}" max="${todayISO()}" /></label>
      <button class="icon-btn" style="height:48px;width:48px;background:var(--accent);color:var(--on-accent)" data-action="bw-add" aria-label="Gewicht speichern">${icon('plus', 22)}</button>
    </div>
    ${last ? `<div class="row-between mt-12 small"><span class="muted">Aktuell <b style="color:var(--text)">${fmtNum(last.kg)} kg</b></span>${diff !== null ? `<span class="muted">seit Start <b style="color:var(--text)">${diff > 0 ? '+' : ''}${fmtNum(diff)} kg</b></span>` : ''}</div>` : ''}
    <div class="mt-12">${lineChart(bw.map((b) => ({ label: fmtDayMonth(parseISO(b.date)), value: b.kg, tip: `${fmtDateShort(b.date)}: <b>${fmtNum(b.kg)} kg</b>` })), { unit: 'kg' })}</div>
    ${bw.length ? `<details class="mt-8"><summary class="tiny faint" style="cursor:pointer">Einträge bearbeiten</summary><div class="list mt-8">${bw.slice().reverse().map((b) => `<div class="item"><div class="grow small">${esc(fmtDateShort(b.date))}</div><div class="bold small">${fmtNum(b.kg)} kg</div><button class="icon-btn sm plain" data-action="bw-del" data-date="${b.date}" aria-label="Eintrag löschen">${icon('trash', 16)}</button></div>`).join('')}</div></details>` : ''}`;
}

function historyList() {
  const ss = [...store.state.sessions].reverse();
  if (!ss.length) return `<div class="card muted small center" style="padding:24px">Noch keine Trainings. Dein erstes Training erscheint hier.</div>`;
  const shown = showAllHistory ? ss : ss.slice(0, 8);
  return `<div class="card"><div class="list">${shown.map((s) => `
    <a class="item" href="#/verlauf/${s.id}">
      <div class="tile-ic ${s.prs?.length ? 'accent' : ''}">${icon(s.prs?.length ? 'trend' : 'check', 18)}</div>
      <div class="grow"><div class="title">${esc(s.name)}</div><div class="sub">${esc(fmtDateShort(new Date(s.date)))} · ${Math.round(s.duration / 60)} Min · ${sessionSetCount(s)} Sätze${s.prs?.length ? ` · ${s.prs.length} Rekord${s.prs.length > 1 ? 'e' : ''}` : ''}</div></div>
      ${icon('right', 18, 'faint')}
    </a>`).join('')}</div></div>
    ${ss.length > 8 && !showAllHistory ? `<button class="btn btn-ghost btn-block mt-8" data-action="history-all">Alle ${ss.length} Trainings anzeigen</button>` : ''}`;
}

export const progressView = {
  name: 'progress',
  tab: 'progress',
  render() {
    const t = totals();
    const lv = levelInfo();
    const have = store.state.achievements;
    const unlockedCount = ACHIEVEMENTS.filter((a) => have[a.id]).length;
    return `<header class="topbar"><div class="titles"><h1 class="page-title">Fortschritt</h1><p class="page-sub">Deine Zahlen, Rekorde und Erfolge</p></div></header>
      <div class="card hero ph-3">
        <div class="row-between"><div class="eyebrow">Level ${lv.level}</div><span class="chip chip-outline">${fmtNum(lv.xp)} XP</span></div>
        <div class="big mt-12" style="font-size:36px">${esc(lv.name)}</div>
        <div class="progress mt-16"><span style="width:${lv.progress * 100}%"></span></div>
        <div class="tiny faint mt-8">${lv.next ? `Noch ${fmtNum(lv.next - lv.xp)} XP bis Level ${lv.level + 1}` : 'Höchstes Level erreicht'}</div>
      </div>
      <div class="stats four mt-12">
        <div class="stat"><div class="v">${t.workouts}</div><div class="l">Trainings</div></div>
        <div class="stat"><div class="v">${fmtNum(Math.round(t.volume / 100) / 10)}<small> t</small></div><div class="l">Bewegtes Gewicht</div></div>
        <div class="stat"><div class="v">${t.prs}</div><div class="l">Bestleistungen</div></div>
        <div class="stat"><div class="v">${streakWeeks()}<small> Wo.</small></div><div class="l">Volle Wochen in Folge</div></div>
      </div>

      <div class="section"><div class="section-head"><h2 class="h">Volumen pro Woche</h2><span class="small faint">kg × Wdh</span></div>
        <div class="card">${weeklyChart()}</div></div>

      <div class="section"><div class="section-head"><h2 class="h">Kraftentwicklung</h2></div>
        <div class="card" id="ex-chart">${exerciseChart()}</div></div>

      <div class="section"><div class="section-head"><h2 class="h">Körpergewicht</h2></div>
        <div class="card">${bodyweightBlock()}</div></div>

      <div class="section"><div class="section-head"><h2 class="h">Erfolge</h2><span class="chip">${unlockedCount}/${ACHIEVEMENTS.length}</span></div>
        <div class="badges">${ACHIEVEMENTS.map((a) => `<div class="badge ${have[a.id] ? '' : 'locked'}"><div class="bi">${icon(have[a.id] ? a.icon : 'lock', 20)}</div><div class="bn">${esc(a.name)}</div><div class="bd">${esc(a.desc)}</div></div>`).join('')}</div></div>

      <div class="section"><div class="section-head"><h2 class="h">Verlauf</h2></div>${historyList()}</div>`;
  },
  mount(root) { bindCharts(root); },
};

onChange('prog-ex', (el) => {
  selectedEx = el.value;
  const box = document.getElementById('ex-chart');
  box.innerHTML = exerciseChart();
  bindCharts(box);
});

on('history-all', () => { showAllHistory = true; rerender(); });

on('bw-add', () => {
  const kg = parseNum(document.getElementById('bw-kg').value);
  const date = document.getElementById('bw-date').value || todayISO();
  if (!(kg > 20 && kg < 400)) { toast('Bitte ein gültiges Gewicht eingeben', 'alert'); return; }
  const bw = store.state.bodyweight.filter((b) => b.date !== date);
  bw.push({ date, kg: Math.round(kg * 10) / 10 });
  store.state.bodyweight = bw;
  store.state.profile.weight = String(Math.round(kg * 10) / 10);
  store.save();
  checkAchievements().forEach((a) => setTimeout(() => toast(`Erfolg: ${a.name}`, 'trophy', 3200), 500));
  toast('Gewicht gespeichert', 'scale');
  rerender();
});

on('bw-del', async (el) => {
  const ok = await confirmDialog({ title: 'Eintrag löschen?', ok: 'Löschen', danger: true });
  if (!ok) return;
  store.state.bodyweight = store.state.bodyweight.filter((b) => b.date !== el.dataset.date);
  store.save();
  rerender();
});
