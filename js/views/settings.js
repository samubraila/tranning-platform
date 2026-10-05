import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, fmtDateFull, mondayOf, parseISO, toISO, debounce, weekdayIndex, addDays } from '../utils.js';
import { on, onInput, onChange, rerender, go } from '../router.js';
import { backHeader, toast, confirmDialog } from '../ui/components.js';
import { currentWeek, setStartForPhase, setPlanWeek, weekStartDate, personalWorkout, setReplacement, slotSession } from '../logic.js';
import { EX_BY_ID } from '../data/exercises.js';
import { sanitize } from '../store.js';
import { PHASES, WEEKDAYS, TOTAL_WEEKS, phaseForWeek, weekSchedule, estimateMinutes } from '../data/program.js';
import { applyTheme } from '../theme.js';

export let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });

// Entwurf der Tagesauswahl – wird erst übernommen, wenn genau die richtige Anzahl gewählt ist
const dayDraft = {};
function dayPicker(key, count) {
  const days = dayDraft[key] || store.state.settings[key];
  return `<div class="daypick" role="group" aria-label="${count} Trainingstage">${WEEKDAYS.map((d, i) =>
    `<button class="${days.includes(i) ? 'on' : ''}" data-action="pick-day" data-key="${key}" data-count="${count}" data-d="${i}" aria-pressed="${days.includes(i)}">${d}</button>`).join('')}</div>
    <div class="tiny mt-8 ${days.length === count ? 'faint' : 'warn-text'}">${days.length === count ? `Reihenfolge: ${days.map((d) => WEEKDAYS[d]).join(' · ')}` : `Wähle noch ${count - days.length} Tag${count - days.length > 1 ? 'e' : ''} – gespeichert wird erst bei ${count} Tagen (aktuell gilt: ${store.state.settings[key].map((d) => WEEKDAYS[d]).join(' · ')})`}</div>`;
}

function toggle(key, label, sub) {
  return `<label class="row-between" style="padding:6px 0">
    <div><div class="bold">${label}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>
    <span class="switch"><input type="checkbox" ${store.state.settings[key] ? 'checked' : ''} data-change="toggle-setting" data-key="${key}" /><span></span></span>
  </label>`;
}

export const settingsView = {
  name: 'settings',
  tab: 'home',
  unmount() { for (const k of Object.keys(dayDraft)) delete dayDraft[k]; },
  render() {
    const s = store.state.settings;
    const cw = currentWeek();
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    return `${backHeader('Einstellungen', { back: 'back:#/' })}
      <div class="section" style="margin-top:8px">
        <div class="section-head"><h2 class="h">Profil</h2></div>
        <div class="card"><label class="field"><span class="lbl">Dein Name</span><input class="input" value="${esc(store.state.profile.name)}" placeholder="Vorname" data-input="profile-name" autocomplete="given-name" /></label></div>
      </div>

      <div class="section">
        <div class="section-head"><h2 class="h">Plan</h2></div>
        <div class="card stack">
          <div class="callout accent">${icon('calendar', 20)}<div>${cw === 0 ? `Dein Plan startet am <b>${esc(fmtDateFull(parseISO(s.startDate)))}</b>.` : cw > TOTAL_WEEKS ? 'Dein Trainingsjahr ist abgeschlossen.' : `Du bist in <b>Woche ${cw}</b> · Phase ${phaseForWeek(cw).num} (${esc(phaseForWeek(cw).name)}).`}</div></div>
          <label class="field"><span class="lbl">Woche ${s.startWeek} beginnt am (Montag)</span><input class="input" type="date" value="${esc(s.startDate)}" data-change="start-date" /></label>
          <label class="field"><span class="lbl">Aktuelle Woche direkt setzen</span>
            <select class="input" data-change="set-week">
              <option value="">– auswählen –</option>
              ${PHASES.map((p) => `<optgroup label="Phase ${p.num} · ${esc(p.name)}">${Array.from({ length: p.weeks[1] - p.weeks[0] + 1 }, (_, i) => p.weeks[0] + i).map((w) => `<option value="${w}" ${w === cw ? 'selected' : ''}>Woche ${w}</option>`).join('')}</optgroup>`).join('')}
            </select>
          </label>
          <div class="tiny faint">Damit verschiebst du den Plan so, dass diese Woche der gewählten Woche entspricht – z. B. um eine Woche nach Krankheit oder Urlaub zu wiederholen. Deine Trainings bleiben gespeichert.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-head"><h2 class="h">Trainingstage</h2></div>
        <div class="card stack">
          <div><div class="bold">Phasen mit 3 Trainings</div><div class="small muted mb-8">Phase 1, 2 & 6</div><div class="mt-8">${dayPicker('days3', 3)}</div></div>
          <div><div class="bold">Phasen mit 4 Trainings</div><div class="small muted">Phase 3, 4 & 5</div><div class="mt-8">${dayPicker('days4', 4)}</div></div>
          <div class="callout">${icon('bulb', 18)}<div class="small">Tipp: Zwischen zwei Trainings für dieselbe Muskelgruppe sollten 48 Stunden liegen. Bewährt: Mo/Mi/Fr bzw. Mo/Di/Do/Fr.</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-head"><h2 class="h">Ersetzte Übungen</h2></div>
        <div class="card">${replacementList()}</div>
      </div>

      <div class="section">
        <div class="section-head"><h2 class="h">Kalender & Erinnerungen</h2></div>
        <div class="card stack">
          <p class="small muted">Trag deine kommenden Trainings mit Erinnerung (1 Stunde vorher) in den Handy-Kalender ein – so wird Training zur festen Gewohnheit.</p>
          <div class="grid-2">
            <label class="field"><span class="lbl">Uhrzeit</span><input class="input" type="time" id="ics-time" value="18:00" /></label>
            <label class="field"><span class="lbl">Zeitraum</span><select class="input" id="ics-weeks"><option value="4">Nächste 4 Wochen</option><option value="12" selected>Nächste 12 Wochen</option><option value="52">Bis Planende</option></select></label>
          </div>
          <button class="btn btn-outline btn-block" data-action="ics-export">${icon('calendar', 18)} Termine exportieren (.ics)</button>
          <div class="tiny faint">iPhone: Datei öffnen → „Alle hinzufügen“. Android: mit Google Kalender öffnen. Nach Änderungen am Plan einfach neu exportieren.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-head"><h2 class="h">Darstellung & Timer</h2></div>
        <div class="card stack">
          <div class="field"><span class="lbl">Design</span>
            <div class="seg">${[['auto', 'Automatisch'], ['dark', 'Dunkel'], ['light', 'Hell']].map(([k, v]) => `<button class="${s.theme === k ? 'on' : ''}" data-action="set-theme" data-v="${k}">${v}</button>`).join('')}</div>
          </div>
          ${toggle('sound', 'Ton am Pausenende', 'Kurzer Signalton, wenn die Pause vorbei ist')}
          ${toggle('vibrate', 'Vibration', 'Nur auf Android-Geräten verfügbar')}
        </div>
      </div>

      <div class="section">
        <div class="section-head"><h2 class="h">App aufs Handy</h2></div>
        <div class="card stack">
          ${standalone ? `<div class="callout accent">${icon('check', 20)}<div>FORGE52 ist als App installiert.</div></div>` : ''}
          ${installPrompt ? `<button class="btn btn-primary btn-block" data-action="install">${icon('download', 18)} App installieren</button>` : ''}
          <div><div class="bold row" style="gap:8px">${icon('share', 18)} iPhone (Safari)</div><p class="small muted mt-8">Tippe unten auf <b>Teilen</b> → <b>Zum Home-Bildschirm</b>. Die App startet dann im Vollbild und funktioniert auch offline.</p></div>
          <div><div class="bold row" style="gap:8px">${icon('download', 18)} Android (Chrome)</div><p class="small muted mt-8">Menü <b>⋮</b> → <b>App installieren</b> bzw. <b>Zum Startbildschirm hinzufügen</b>.</p></div>
          ${isIOS ? '' : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-head"><h2 class="h">Daten</h2></div>
        <div class="card stack">
          <div class="callout">${icon('info', 18)}<div class="small">Alle Daten werden nur auf diesem Gerät gespeichert. Mach regelmäßig ein Backup – z. B. bevor du das Handy wechselst oder den Browser-Verlauf löschst.</div></div>
          <div class="btn-row">
            <button class="btn btn-outline" data-action="export">${icon('download', 18)} Backup</button>
            <button class="btn btn-outline" data-action="import">${icon('upload', 18)} Laden</button>
          </div>
          <input type="file" id="import-file" accept="application/json,.json" hidden data-change="import-file" />
          <button class="btn btn-danger btn-block" data-action="reset-all">${icon('trash', 18)} Alle Daten löschen</button>
        </div>
      </div>

      <div class="section center">
        <div class="logo" style="justify-content:center"><span class="mark">${icon('dumbbell', 20, 'accent-ic')}</span>FORGE<em>52</em></div>
        <p class="tiny faint mt-8">Version 1.1 · Dein 52-Wochen-Trainingsplan für McFit</p>
        <p class="tiny faint mt-8" style="max-width:420px;margin-left:auto;margin-right:auto">Hinweis: Die Inhalte ersetzen keine ärztliche Beratung. Bei Vorerkrankungen oder Beschwerden vor dem Training ärztlich abklären. McFit ist eine Marke der RSG Group; diese App ist ein unabhängiges Projekt.</p>
      </div>`;
  },
};

function replacementList() {
  const list = Object.entries(store.state.settings.replacements || {}).filter(([a, b]) => EX_BY_ID[a] && EX_BY_ID[b]);
  if (!list.length) return `<p class="small muted">Noch keine. Im Training kannst du unter „Tauschen“ eine Übung dauerhaft ersetzen – z. B. wenn es ein Gerät in deinem Studio nicht gibt.</p>`;
  return `<div class="list">${list.map(([from, to]) => `<div class="item">
      <div class="tile-ic">${icon('swap', 18)}</div>
      <div class="grow"><div class="title">${esc(EX_BY_ID[to].name)}</div><div class="sub">statt ${esc(EX_BY_ID[from].name)}</div></div>
      <button class="btn btn-xs" data-action="unreplace" data-ex="${esc(from)}">Aufheben</button>
    </div>`).join('')}</div>`;
}

on('unreplace', (el) => {
  setReplacement(el.dataset.ex, null);
  store.save();
  toast(`${EX_BY_ID[el.dataset.ex]?.name || 'Übung'} wieder wie geplant`, 'check');
  rerender();
});

// ───── Kalender-Export (.ics) ─────
const pad = (n) => String(n).padStart(2, '0');
const icsTime = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const icsText = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// Zeilen nach RFC 5545 auf max. 75 Zeichen umbrechen (Folgezeilen beginnen mit Leerzeichen)
function icsFold(line) {
  const out = [];
  let rest = line;
  while (rest.length > 70) { out.push(rest.slice(0, 70)); rest = ' ' + rest.slice(70); }
  out.push(rest);
  return out.join('\r\n');
}

on('ics-export', () => {
  const [hh, mm] = (document.getElementById('ics-time')?.value || '18:00').split(':').map(Number);
  const weeks = Number(document.getElementById('ics-weeks')?.value) || 12;
  const cw = Math.max(1, currentWeek());
  if (cw > TOTAL_WEEKS) { toast('Dein Trainingsjahr ist abgeschlossen', 'info'); return; }
  const today = toISO(new Date());
  const appUrl = location.origin + location.pathname;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FORGE52//Trainingsplan//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:FORGE52 Training'];
  let n = 0;
  for (let w = cw; w <= Math.min(TOTAL_WEEKS, cw + weeks - 1); w++) {
    for (const x of weekSchedule(w, store.state.settings)) {
      const day = addDays(weekStartDate(w), x.day);
      if (toISO(day) < today || slotSession(w, x.slot)) continue;
      const wo = personalWorkout(x.workoutId, w);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh || 0, mm || 0);
      const end = new Date(start.getTime() + estimateMinutes(wo) * 60000);
      const desc = [
        `Woche ${w} · Phase ${wo.info.phase.num} ${wo.info.phase.name}`,
        ...wo.items.map((it) => `• ${it.exercise.name}: ${it.sets} × ${it.reps}`),
        '',
        appUrl,
      ].join('\n');
      lines.push(
        'BEGIN:VEVENT',
        `UID:forge52-${toISO(day)}-${x.slot}@forge52`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsTime(start)}`,
        `DTEND:${icsTime(end)}`,
        `SUMMARY:${icsText(`FORGE52 · ${wo.name}`)}`,
        `DESCRIPTION:${icsText(desc)}`,
        `URL:${appUrl}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-PT60M',
        `DESCRIPTION:${icsText(`Training in 1 Stunde: ${wo.name}`)}`,
        'END:VALARM',
        'END:VEVENT',
      );
      n++;
    }
  }
  lines.push('END:VCALENDAR');
  if (!n) { toast('Keine offenen Trainings im gewählten Zeitraum', 'info'); return; }
  const blob = new Blob([lines.map(icsFold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'forge52-training.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  toast(`${n} Termine exportiert`, 'calendar');
});

const saveName = debounce(() => store.save(), 400);
onInput('profile-name', (el) => { store.state.profile.name = el.value.trim(); saveName(); });

onChange('start-date', (el) => {
  if (!el.value) return;
  store.state.settings.startDate = toISO(mondayOf(parseISO(el.value)));
  store.save();
  toast('Startdatum gespeichert', 'calendar');
  rerender();
});

onChange('set-week', (el) => {
  const w = parseInt(el.value, 10);
  if (!w) return;
  setPlanWeek(w, mondayOf(new Date()));
  store.save();
  toast(`Du bist jetzt in Woche ${w}`, 'calendar');
  rerender();
});

on('pick-day', (el) => {
  const key = el.dataset.key;
  const count = +el.dataset.count;
  const d = +el.dataset.d;
  let days = [...(dayDraft[key] || store.state.settings[key])];
  if (days.includes(d)) days = days.filter((x) => x !== d);
  else if (days.length < count) days.push(d);
  else { toast(`Maximal ${count} Tage – entferne zuerst einen Tag`, 'info'); return; }
  days.sort((a, b) => a - b);
  if (days.length === count) {
    delete dayDraft[key];
    store.state.settings[key] = days;
    store.save();
    toast(`Trainingstage gespeichert: ${days.map((x) => WEEKDAYS[x]).join(' · ')}`, 'calendar');
  } else {
    dayDraft[key] = days;
  }
  rerender();
});

on('set-theme', (el) => {
  store.state.settings.theme = el.dataset.v;
  store.save();
  applyTheme();
  rerender();
});

onChange('toggle-setting', (el) => {
  store.state.settings[el.dataset.key] = el.checked;
  store.save();
});

on('install', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  rerender();
});

on('export', () => {
  const blob = new Blob([store.exportJSON()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `forge52-backup-${toISO(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast('Backup erstellt', 'download');
});

on('import', () => document.getElementById('import-file').click());

onChange('import-file', async (el) => {
  const file = el.files?.[0];
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('size');
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.sessions) || typeof data.settings !== 'object' || !data.settings) throw new Error('format');
    const clean = sanitize(data);
    const dropped = data.sessions.length - clean.sessions.length;
    const ok = await confirmDialog({
      title: 'Backup laden?',
      text: `${clean.sessions.length} Trainings gefunden${dropped > 0 ? ` (${dropped} ungültige Einträge werden ignoriert)` : ''}. Deine aktuellen Daten auf diesem Gerät werden ersetzt.`,
      ok: 'Laden',
    });
    if (!ok) return;
    const prev = store.state;
    if (!store.replace(clean)) { store.state = prev; throw new Error('save'); }
    applyTheme();
    toast('Backup geladen', 'check');
    go('#/');
  } catch {
    toast('Das ist kein gültiges FORGE52-Backup – deine Daten bleiben unverändert.', 'alert', 4200);
  } finally {
    el.value = '';
  }
});

on('reset-all', async () => {
  const ok = await confirmDialog({ title: 'Wirklich alles löschen?', text: 'Alle Trainings, Rekorde, Lektionen und Einstellungen werden unwiderruflich gelöscht. Tipp: Vorher ein Backup machen.', ok: 'Alles löschen', danger: true });
  if (!ok) return;
  store.reset();
  applyTheme();
  go('#/start');
});

// ───── Onboarding ─────
// Ab Donnerstag ist die laufende Woche fast vorbei – dann standardmäßig am nächsten Montag starten
const onb = { step: 0, phase: 1, start: weekdayIndex(new Date()) >= 3 ? 'next' : 'this', preset3: 0, preset4: 0 };
const PRESET3 = [[0, 2, 4], [1, 3, 5], [0, 2, 5]];
const PRESET4 = [[0, 1, 3, 4], [0, 1, 3, 5], [0, 2, 4, 5]];
const LEVELS = [
  { phase: 1, t: 'Einsteiger / Wiedereinsteiger', s: 'Weniger als 3 Monate regelmäßiges Training – Start mit Phase 1 (Fundament).' },
  { phase: 2, t: 'Etwas Erfahrung', s: '3–6 Monate Training, Geräte sind bekannt – Start mit Phase 2 (Aufbau).' },
  { phase: 3, t: 'Fortgeschritten', s: 'Über 6 Monate regelmäßig, auch freie Gewichte – Start mit Phase 3 (Hypertrophie).' },
];

function dots(n) {
  return `<div class="dots" aria-label="Schritt ${n + 1} von 2">${[0, 1].map((i) => `<span class="${i === n ? 'on' : ''}"></span>`).join('')}</div>`;
}

export const onboardingView = {
  name: 'onboarding',
  tab: null,
  nav: false,
  guard() { return store.state.settings.onboarded ? '#/' : null; },
  render() {
    const logo = `<div class="logo"><span class="mark">${icon('dumbbell', 20, 'accent-ic')}</span>FORGE<em>52</em></div>`;
    if (onb.step === 0) {
      return `<div class="onb"><div class="body">
        ${logo}
        <h1 class="onb-hero">Dein Trainings&shy;jahr bei <em>McFit</em>.</h1>
        <p class="lead mt-16 muted">Ein professioneller 52-Wochen-Plan, wie von einem Personal Trainer – mit genauen Geräten, Sätzen, Wiederholungen und Pausen.</p>
        <div class="stack mt-24">
          ${[
            ['calendar', '52 Wochen · 6 Phasen', 'Von den Grundlagen bis zur Bestform – mit Deloads & Testwochen.'],
            ['dumbbell', '60+ Übungen für McFit', 'Einstellung, Ausführung, Fehler, Alternativen & Videos.'],
            ['timer', 'Training tracken', 'Gewichte loggen, Pausen-Timer und automatische Steigerungsvorschläge.'],
            ['grad', 'Akademie', 'Muskelaufbau, Ernährung, Schlaf & mehr – mit Quiz.'],
          ].map(([ic, t, s]) => `<div class="feature"><div class="tile-ic accent">${icon(ic, 20)}</div><div><div class="bold">${t}</div><div class="small muted">${s}</div></div></div>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary btn-block mt-24" data-action="onb-next">Los geht's ${icon('right', 18)}</button></div>`;
    }
    if (onb.step === 1) {
      return `<div class="onb"><div class="body">
        ${dots(0)}
        <h1 class="page-title mt-24">Wie heißt du und wo stehst du?</h1>
        <label class="field mt-24"><span class="lbl">Dein Vorname</span><input class="input" id="onb-name" value="${esc(store.state.profile.name)}" placeholder="z. B. Alex" autocomplete="given-name" data-input="profile-name" /></label>
        <div class="stack mt-24">${LEVELS.map((l) => `<button class="choice ${onb.phase === l.phase ? 'on' : ''}" data-action="onb-phase" data-p="${l.phase}">
          <div class="tile-ic ${onb.phase === l.phase ? 'accent' : ''}">${icon(onb.phase === l.phase ? 'check' : 'user', 20)}</div>
          <div><div class="t">${l.t}</div><div class="s">${l.s}</div></div></button>`).join('')}</div>
      </div>
      <div class="btn-row mt-24"><button class="btn btn-ghost" data-action="onb-back">Zurück</button><button class="btn btn-primary" data-action="onb-next">Weiter</button></div></div>`;
    }
    const nextMon = new Date(mondayOf(new Date()));
    nextMon.setDate(nextMon.getDate() + 7);
    return `<div class="onb"><div class="body">
      ${dots(1)}
      <h1 class="page-title mt-24">Wann trainierst du?</h1>
      <div class="field mt-24"><span class="lbl">Start</span>
        <div class="seg">
          <button class="${onb.start === 'this' ? 'on' : ''}" data-action="onb-start" data-v="this">Diese Woche</button>
          <button class="${onb.start === 'next' ? 'on' : ''}" data-action="onb-start" data-v="next">Ab Mo, ${nextMon.getDate()}.${nextMon.getMonth() + 1}.</button>
        </div>
        <div class="tiny faint">${onb.start === 'this'
          ? (weekdayIndex(new Date()) >= 3 ? 'Die Woche ist schon weit fortgeschritten – verpasste Trainings kannst du nachholen, ein Start am Montag ist aber entspannter.' : 'Woche 1 beginnt am Montag dieser Woche. Verpasste Tage kannst du einfach nachholen.')
          : 'Bis Montag kannst du dir schon Übungen und Akademie ansehen.'}</div>
      </div>
      <div class="field mt-24"><span class="lbl">Wochen mit 3 Trainings</span>
        <div class="stack-sm">${PRESET3.map((p, i) => `<button class="choice ${onb.preset3 === i ? 'on' : ''}" style="padding:12px 16px" data-action="onb-p3" data-i="${i}"><div class="t">${p.map((d) => WEEKDAYS[d]).join(' · ')}</div></button>`).join('')}</div>
      </div>
      <div class="field mt-24"><span class="lbl">Wochen mit 4 Trainings (ab Phase 3)</span>
        <div class="stack-sm">${PRESET4.map((p, i) => `<button class="choice ${onb.preset4 === i ? 'on' : ''}" style="padding:12px 16px" data-action="onb-p4" data-i="${i}"><div class="t">${p.map((d) => WEEKDAYS[d]).join(' · ')}</div></button>`).join('')}</div>
      </div>
      <p class="tiny faint mt-12">Du kannst die Tage später jederzeit in den Einstellungen ändern.</p>
    </div>
    <div class="btn-row mt-24"><button class="btn btn-ghost" data-action="onb-back">Zurück</button><button class="btn btn-primary" data-action="onb-finish">${icon('zap', 18)} Plan starten</button></div></div>`;
  },
};

on('onb-next', () => { onb.step = Math.min(2, onb.step + 1); rerender(); window.scrollTo(0, 0); });
on('onb-back', () => { onb.step = Math.max(0, onb.step - 1); rerender(); });
on('onb-phase', (el) => { onb.phase = +el.dataset.p; rerender(); });
on('onb-start', (el) => { onb.start = el.dataset.v; rerender(); });
on('onb-p3', (el) => { onb.preset3 = +el.dataset.i; rerender(); });
on('onb-p4', (el) => { onb.preset4 = +el.dataset.i; rerender(); });
on('onb-finish', () => {
  const s = store.state.settings;
  const base = mondayOf(new Date());
  if (onb.start === 'next') base.setDate(base.getDate() + 7);
  setStartForPhase(onb.phase, base);
  s.days3 = [...PRESET3[onb.preset3]];
  s.days4 = [...PRESET4[onb.preset4]];
  s.onboarded = true;
  store.save();
  onb.step = 0;
  toast(store.state.profile.name ? `Willkommen, ${store.state.profile.name}!` : 'Willkommen bei FORGE52!', 'zap');
  go('#/');
});
