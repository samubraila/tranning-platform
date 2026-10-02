import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, fmtNum, parseNum } from '../utils.js';
import { on, onInput, onChange, rerender } from '../router.js';
import { backHeader, ring, toast } from '../ui/components.js';
import { MODULES, LESSONS, LESSON_BY_ID, XP } from '../data/academy.js';
import { checkAchievements } from '../logic.js';

const quizState = {}; // lessonId -> { answers: { qIndex: optionIndex } }

export const academyView = {
  name: 'academy',
  tab: 'academy',
  render() {
    const done = LESSONS.filter((l) => store.state.lessons[l.id]?.done).length;
    const mods = MODULES.map((m) => {
      const lessons = LESSONS.filter((l) => l.module === m.id);
      const md = lessons.filter((l) => store.state.lessons[l.id]?.done).length;
      return `<div class="section">
        <div class="section-head"><div><h2 class="h">${esc(m.name)}</h2><div class="small faint">${esc(m.desc)}</div></div><span class="chip">${md}/${lessons.length}</span></div>
        <div class="card"><div class="list">${lessons.map((l) => {
          const st = store.state.lessons[l.id];
          return `<a class="item" href="#/lektion/${l.id}">
            <div class="idx ${st?.done ? 'ok' : ''}">${st?.done ? icon('check', 16) : LESSONS.indexOf(l) + 1}</div>
            <div class="grow"><div class="title">${esc(l.title)}</div><div class="sub">${l.minutes} Min · Quiz ${st?.done ? `· ${st.score}/${l.quiz.length} richtig` : `· +${XP.lesson} XP`}</div></div>
            ${icon('right', 18, 'faint')}
          </a>`;
        }).join('')}</div></div>
      </div>`;
    }).join('');
    return `<header class="topbar"><div class="titles"><h1 class="page-title">Akademie</h1><p class="page-sub">Trainer-Wissen in kleinen Lektionen – mit Quiz</p></div></header>
      <div class="card row" style="gap:16px">
        ${ring(done / LESSONS.length, { size: 72, label: `<span style="font-size:17px">${Math.round((done / LESSONS.length) * 100)}%</span>` })}
        <div class="grow"><div class="bold" style="font-size:17px">${done} von ${LESSONS.length} Lektionen</div><div class="small muted mt-8">Je Lektion +${XP.lesson} XP, fehlerfreies Quiz +${XP.quizPerfect} XP extra.</div></div>
      </div>
      <a class="card card-link row mt-12" href="#/rechner">
        <div class="tile-ic accent">${icon('calc', 22)}</div>
        <div class="grow"><div class="bold">Kalorien- & Makro-Rechner</div><div class="small muted">Dein Bedarf für Muskelaufbau oder Definition</div></div>
        ${icon('right', 18, 'faint')}
      </a>
      ${mods}`;
  },
};

function section(s) {
  if (s.list) return `<h3>${esc(s.h)}</h3><ul>${s.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<h3>${esc(s.h)}</h3><p>${esc(s.p)}</p>`;
}

function quizHTML(l) {
  const qs = quizState[l.id] || (quizState[l.id] = { answers: {} });
  const answered = Object.keys(qs.answers).length;
  const score = l.quiz.filter((q, i) => qs.answers[i] === q.correct).length;
  const stored = store.state.lessons[l.id];
  return `<div class="stack">${l.quiz.map((q, qi) => {
    const a = qs.answers[qi];
    const has = a !== undefined;
    return `<div class="card">
      <div class="eyebrow">Frage ${qi + 1} von ${l.quiz.length}</div>
      <div class="quiz-q mt-8">${esc(q.q)}</div>
      <div class="stack-sm mt-12">${q.options.map((o, oi) => {
        let cls = '';
        if (has && oi === q.correct) cls = 'correct';
        else if (has && oi === a) cls = 'wrong';
        return `<button class="opt ${cls}" ${has ? 'disabled' : ''} data-action="quiz-answer" data-l="${l.id}" data-q="${qi}" data-o="${oi}">
          <span class="mark">${cls === 'correct' ? icon('check', 14) : cls === 'wrong' ? icon('x', 14) : ''}</span><span>${esc(o)}</span></button>`;
      }).join('')}</div>
      ${has ? `<div class="explain mt-12">${a === q.correct ? '<b>Richtig!</b> ' : '<b>Nicht ganz.</b> '}${esc(q.explain)}</div>` : ''}
    </div>`;
  }).join('')}
  ${answered === l.quiz.length ? `<div class="card center" style="padding:22px">
      <div class="tile-ic accent" style="margin:0 auto 10px">${icon(score === l.quiz.length ? 'star' : 'check', 22)}</div>
      <div class="bold" style="font-size:18px">${score} von ${l.quiz.length} richtig</div>
      <p class="small muted mt-8">${score === l.quiz.length ? `Perfekt! +${XP.lesson + XP.quizPerfect} XP` : `+${XP.lesson} XP – du kannst das Quiz jederzeit wiederholen.`}</p>
      ${stored?.done ? '' : `<button class="btn btn-primary btn-block mt-16" data-action="lesson-complete" data-l="${l.id}">Lektion abschließen</button>`}
      <button class="btn btn-ghost btn-block mt-8" data-action="quiz-reset" data-l="${l.id}">Quiz wiederholen</button>
    </div>` : ''}
  </div>`;
}

export const lessonView = {
  name: 'lesson',
  tab: 'academy',
  render({ id }) {
    const l = LESSON_BY_ID[id];
    if (!l) return `${backHeader('Lektion', { back: '#/akademie' })}<p class="muted">Nicht gefunden.</p>`;
    const mod = MODULES.find((m) => m.id === l.module);
    const idx = LESSONS.indexOf(l);
    const next = LESSONS[idx + 1];
    const st = store.state.lessons[l.id];
    return `${backHeader(l.title, { back: '#/akademie', sub: mod.name })}
      <div class="eyebrow">${esc(mod.name)} · ${l.minutes} Min${st?.done ? ' · abgeschlossen' : ''}</div>
      <h1 class="page-title mt-8">${esc(l.title)}</h1>
      <p class="lead mt-16">${esc(l.intro)}</p>
      <div class="prose">${l.sections.map(section).join('')}</div>
      <div class="takeaways mt-24"><div class="eyebrow" style="color:var(--accent-ink)">Das Wichtigste</div><ul class="bullets good mt-8">${l.takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="section"><div class="section-head"><h2 class="h">Quiz</h2><span class="small faint">${l.quiz.length} Fragen</span></div><div id="quiz">${quizHTML(l)}</div></div>
      ${next ? `<a class="card card-link row mt-24" href="#/lektion/${next.id}"><div class="grow"><div class="eyebrow">Nächste Lektion</div><div class="bold mt-8">${esc(next.title)}</div></div>${icon('right', 20, 'faint')}</a>` : ''}`;
  },
};

on('quiz-answer', (el) => {
  const l = LESSON_BY_ID[el.dataset.l];
  const qs = quizState[l.id] || (quizState[l.id] = { answers: {} });
  qs.answers[+el.dataset.q] = +el.dataset.o;
  document.getElementById('quiz').innerHTML = quizHTML(l);
  // Bereits abgeschlossene Lektion: Ergebnis aktualisieren, wenn das Quiz komplett ist
  const st = store.state.lessons[l.id];
  if (st?.done && Object.keys(qs.answers).length === l.quiz.length) {
    const score = l.quiz.filter((q, i) => qs.answers[i] === q.correct).length;
    st.score = Math.max(st.score || 0, score);
    st.perfect = st.perfect || score === l.quiz.length;
    store.save();
    checkAchievements().forEach((a) => toast(`Erfolg: ${a.name}`, 'trophy', 3200));
  }
});

on('quiz-reset', (el) => {
  quizState[el.dataset.l] = { answers: {} };
  document.getElementById('quiz').innerHTML = quizHTML(LESSON_BY_ID[el.dataset.l]);
});

on('lesson-complete', (el) => {
  const l = LESSON_BY_ID[el.dataset.l];
  const qs = quizState[l.id];
  const score = l.quiz.filter((q, i) => qs.answers[i] === q.correct).length;
  store.state.lessons[l.id] = { done: true, score, perfect: score === l.quiz.length, date: new Date().toISOString() };
  store.save();
  toast(`Lektion abgeschlossen · +${XP.lesson + (score === l.quiz.length ? XP.quizPerfect : 0)} XP`, 'grad');
  checkAchievements().forEach((a) => setTimeout(() => toast(`Erfolg: ${a.name}`, 'trophy', 3200), 600));
  rerender();
});

// ───── Rechner ─────
const ACTIVITY = [
  [1.375, 'Wenig aktiv', 'Bürojob + 3× Training'],
  [1.55, 'Mäßig aktiv', 'Etwas Bewegung im Alltag + 3–4× Training'],
  [1.725, 'Sehr aktiv', 'Körperliche Arbeit oder 5+× Sport'],
];
const GOALS = [
  ['aufbau', 'Muskelaufbau', 250, 1.8],
  ['halten', 'Halten / Rekomposition', 0, 2.0],
  ['definition', 'Definition', -400, 2.2],
];

function calc(p) {
  const w = parseNum(p.weight);
  const h = parseNum(p.height);
  const a = parseNum(p.age);
  if (!(w > 0 && h > 0 && a > 0)) return null;
  const bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === 'w' ? -161 : 5);
  const tdee = bmr * Number(p.activity || 1.55);
  const goal = GOALS.find((g) => g[0] === p.goal) || GOALS[0];
  const kcal = Math.round((tdee + goal[2]) / 10) * 10;
  const protein = Math.round(w * goal[3]);
  const fat = Math.round(w * 0.9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs };
}

function resultHTML() {
  const r = calc(store.state.profile);
  if (!r) return `<div class="callout">${icon('info', 20)}<div>Gib Alter, Größe und Gewicht ein, um deinen Bedarf zu berechnen.</div></div>`;
  const goal = GOALS.find((g) => g[0] === store.state.profile.goal) || GOALS[0];
  return `<div class="card hero ph-3">
      <div class="eyebrow">Dein Tagesziel · ${esc(goal[1])}</div>
      <div class="big mt-12">${fmtNum(r.kcal)}<small> kcal</small></div>
      <div class="small muted mt-8">Grundumsatz ${fmtNum(r.bmr)} kcal · Gesamtumsatz ${fmtNum(r.tdee)} kcal</div>
    </div>
    <div class="stats three mt-12">
      <div class="stat"><div class="v">${r.protein}<small> g</small></div><div class="l">Eiweiß</div></div>
      <div class="stat"><div class="v">${r.carbs}<small> g</small></div><div class="l">Kohlenhydrate</div></div>
      <div class="stat"><div class="v">${r.fat}<small> g</small></div><div class="l">Fett</div></div>
    </div>
    <div class="callout mt-12">${icon('bulb', 20)}<div>Das ist ein <b>Startwert</b>. Wiege dich 3–4× pro Woche morgens und passe nach 2–3 Wochen um 100–200 kcal an, falls sich der Wochenschnitt nicht wie gewünscht bewegt.</div></div>`;
}

export const calculatorView = {
  name: 'calc',
  tab: 'academy',
  render() {
    const p = store.state.profile;
    return `${backHeader('Kalorienrechner', { back: '#/akademie' })}
      <p class="muted">Berechnung nach Mifflin-St-Jeor mit Aktivitätsfaktor. Deine Angaben bleiben nur auf diesem Gerät.</p>
      <div class="card mt-16 stack">
        <div class="field"><span class="lbl">Geschlecht</span>
          <div class="seg">${[['m', 'Männlich'], ['w', 'Weiblich']].map(([k, v]) => `<button class="${p.sex === k ? 'on' : ''}" data-action="calc-set" data-k="sex" data-v="${k}">${v}</button>`).join('')}</div>
        </div>
        <div class="grid-2">
          <label class="field"><span class="lbl">Alter</span><input class="input" inputmode="numeric" value="${esc(p.age)}" placeholder="Jahre" data-input="calc-field" data-k="age" /></label>
          <label class="field"><span class="lbl">Größe (cm)</span><input class="input" inputmode="numeric" value="${esc(p.height)}" placeholder="z. B. 180" data-input="calc-field" data-k="height" /></label>
        </div>
        <label class="field"><span class="lbl">Gewicht (kg)</span><input class="input" inputmode="decimal" value="${esc(p.weight)}" placeholder="z. B. 80" data-input="calc-field" data-k="weight" /></label>
        <label class="field"><span class="lbl">Aktivität</span>
          <select class="input" data-change="calc-select" data-k="activity">${ACTIVITY.map(([v, n, d]) => `<option value="${v}" ${Number(p.activity) === v ? 'selected' : ''}>${n} – ${d}</option>`).join('')}</select>
        </label>
        <div class="field"><span class="lbl">Ziel</span>
          <div class="seg">${GOALS.map(([k, n]) => `<button class="${p.goal === k ? 'on' : ''}" data-action="calc-set" data-k="goal" data-v="${k}">${n.split(' /')[0]}</button>`).join('')}</div>
        </div>
      </div>
      <div class="section" id="calc-result">${resultHTML()}</div>
      <a class="callout card-link mt-16" href="#/lektion/kalorien">${icon('grad', 20)}<div class="grow">Mehr dazu in der Lektion <b>Kalorien & Energiebilanz</b></div>${icon('right', 18)}</a>`;
  },
};

on('calc-set', (el) => {
  store.state.profile[el.dataset.k] = el.dataset.v;
  store.save();
  rerender();
});
onInput('calc-field', (el) => {
  store.state.profile[el.dataset.k] = el.value.replace(',', '.').trim();
  store.save();
  document.getElementById('calc-result').innerHTML = resultHTML();
});
onChange('calc-select', (el) => {
  store.state.profile[el.dataset.k] = Number(el.value);
  store.save();
  document.getElementById('calc-result').innerHTML = resultHTML();
});
