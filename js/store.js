import { mondayOf, toISO, parseISO } from './utils.js';
import { EX_BY_ID } from './data/exercises.js';
import { LESSON_BY_ID, ACHIEVEMENTS } from './data/academy.js';

const KEY = 'forge52.v1';

export function defaults() {
  return {
    version: 1,
    profile: { name: '', sex: 'm', age: '', height: '', weight: '', activity: 1.55, goal: 'aufbau' },
    settings: {
      startDate: toISO(mondayOf(new Date())), // Montag, an dem Woche `startWeek` beginnt
      startWeek: 1,
      days3: [0, 2, 4],
      days4: [0, 1, 3, 4],
      theme: 'auto',
      sound: true,
      vibrate: true,
      onboarded: false,
      cycle: 1,
      replacements: {},
    },
    sessions: [],
    active: null,
    bodyweight: [],
    measurements: [],
    lessons: {},
    achievements: {},
    exNotes: {},
  };
}

// ───── Validierung: alles, was aus localStorage oder einem Backup kommt, wird geprüft ─────
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const str = (v, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');
const int = (v, min, max, def) => (Number.isInteger(v) && v >= min && v <= max ? v : def);
const bool = (v, def) => (typeof v === 'boolean' ? v : def);
const validDay = (v) => typeof v === 'string' && ISO_DAY.test(v) && !Number.isNaN(parseISO(v).getTime()) && toISO(parseISO(v)) === v;

// Zahl als String ("62.5") oder '' – ungültige oder unplausible Werte werden verworfen
export function cleanNum(v, max = 9999) {
  if (v === '' || v == null) return '';
  const n = parseFloat(String(v).replace(',', '.').trim());
  return Number.isFinite(n) && n >= 0 && n <= max ? String(Math.round(n * 100) / 100) : '';
}

function dayList(v, n, def) {
  if (!Array.isArray(v) || v.length !== n) return def;
  if (!v.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) || new Set(v).size !== n) return def;
  return [...v].sort((a, b) => a - b);
}

function cleanSet(s) {
  if (!isObj(s)) return null;
  return { kg: cleanNum(s.kg, 1000), reps: cleanNum(s.reps, 9999), done: bool(s.done, false), auto: bool(s.auto, false) };
}

function cleanItem(it) {
  if (!isObj(it) || !EX_BY_ID[it.ex]) return null;
  return {
    ex: it.ex,
    planned: EX_BY_ID[it.planned] ? it.planned : it.ex,
    sets: int(it.sets, 1, 30, 1),
    reps: /^\d{1,4}(–\d{1,4})?$/.test(it.reps) ? it.reps : '10',
    rest: int(it.rest, 0, 900, 90),
    rir: typeof it.rir === 'string' ? it.rir.slice(0, 10) : null,
    note: str(it.note, 300),
    ss: typeof it.ss === 'string' && /^[A-Z]$/.test(it.ss) ? it.ss : null,
    finisher: bool(it.finisher, false),
    tags: Array.isArray(it.tags) ? it.tags.filter((t) => typeof t === 'string').slice(0, 5).map((t) => t.slice(0, 60)) : [],
    log: Array.isArray(it.log) ? it.log.slice(0, 40).map(cleanSet).filter(Boolean) : [],
  };
}

function cleanSession(s, { active = false } = {}) {
  if (!isObj(s) || !SAFE_ID.test(s.id || '')) return null;
  const out = {
    id: s.id,
    workoutId: typeof s.workoutId === 'string' && SAFE_ID.test(s.workoutId) ? s.workoutId : '',
    week: int(s.week, 1, 53, 1),
    slot: int(s.slot, 0, 6, 0),
    cycle: int(s.cycle, 1, 999, 1),
    name: str(s.name, 120) || 'Training',
    items: Array.isArray(s.items) ? s.items.slice(0, 40).map(cleanItem).filter(Boolean) : [],
  };
  if (active) {
    out.startedAt = Number.isFinite(s.startedAt) ? s.startedAt : Date.now();
    return out;
  }
  if (typeof s.date !== 'string' || Number.isNaN(Date.parse(s.date))) return null;
  out.date = new Date(s.date).toISOString();
  out.duration = int(Math.round(Number(s.duration) || 0), 0, 86400, 0);
  out.prs = Array.isArray(s.prs)
    ? s.prs.filter((p) => isObj(p) && EX_BY_ID[p.ex]).map((p) => ({
        ex: p.ex, kg: Number(cleanNum(p.kg, 1000)) || 0, reps: Number(cleanNum(p.reps, 999)) || 0, e1rm: Number(cleanNum(p.e1rm, 2000)) || 0,
      }))
    : [];
  out.volume = Number(cleanNum(s.volume, 1e7)) || 0;
  out.feel = int(s.feel, 1, 5, null);
  out.note = str(s.note, 500);
  return out;
}

function cleanDated(list, fields) {
  if (!Array.isArray(list)) return [];
  const byDate = new Map();
  for (const e of list) {
    if (!isObj(e) || !validDay(e.date)) continue;
    const row = { date: e.date };
    let any = false;
    for (const [k, min, max] of fields) {
      const n = Number(cleanNum(e[k], max));
      if (e[k] !== '' && e[k] != null && n >= min) { row[k] = n; any = true; }
    }
    if (any) byDate.set(e.date, row);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function sanitize(data) {
  const base = defaults();
  if (!isObj(data)) return base;
  const p = isObj(data.profile) ? data.profile : {};
  const s = isObj(data.settings) ? data.settings : {};
  const replacements = {};
  if (isObj(s.replacements)) {
    for (const [k, v] of Object.entries(s.replacements)) if (EX_BY_ID[k] && EX_BY_ID[v] && k !== v) replacements[k] = v;
  }
  const lessons = {};
  if (isObj(data.lessons)) {
    for (const [k, v] of Object.entries(data.lessons)) {
      if (LESSON_BY_ID[k] && isObj(v)) lessons[k] = { done: bool(v.done, false), score: int(v.score, 0, 20, 0), perfect: bool(v.perfect, false), date: str(v.date, 40) };
    }
  }
  const achievements = {};
  if (isObj(data.achievements)) {
    for (const a of ACHIEVEMENTS) if (typeof data.achievements[a.id] === 'string') achievements[a.id] = data.achievements[a.id].slice(0, 40);
  }
  const exNotes = {};
  if (isObj(data.exNotes)) {
    for (const [k, v] of Object.entries(data.exNotes)) if (EX_BY_ID[k] && typeof v === 'string' && v.trim()) exNotes[k] = v.slice(0, 200);
  }
  const seen = new Set();
  const sessions = (Array.isArray(data.sessions) ? data.sessions : [])
    .map((x) => cleanSession(x))
    .filter((x) => x && !seen.has(x.id) && seen.add(x.id))
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    version: 1,
    profile: {
      name: str(p.name, 40),
      sex: p.sex === 'w' ? 'w' : 'm',
      age: cleanNum(p.age, 120),
      height: cleanNum(p.height, 260),
      weight: cleanNum(p.weight, 400),
      activity: [1.375, 1.55, 1.725].includes(Number(p.activity)) ? Number(p.activity) : 1.55,
      goal: ['aufbau', 'halten', 'definition'].includes(p.goal) ? p.goal : 'aufbau',
    },
    settings: {
      startDate: validDay(s.startDate) ? toISO(mondayOf(parseISO(s.startDate))) : base.settings.startDate,
      startWeek: int(s.startWeek, 1, 52, 1),
      days3: dayList(s.days3, 3, base.settings.days3),
      days4: dayList(s.days4, 4, base.settings.days4),
      theme: ['auto', 'dark', 'light'].includes(s.theme) ? s.theme : 'auto',
      sound: bool(s.sound, true),
      vibrate: bool(s.vibrate, true),
      onboarded: bool(s.onboarded, false),
      cycle: int(s.cycle, 1, 999, 1),
      replacements,
    },
    sessions,
    active: data.active ? cleanSession(data.active, { active: true }) : null,
    bodyweight: cleanDated(data.bodyweight, [['kg', 20, 400]]),
    measurements: cleanDated(data.measurements, [['waist', 30, 250], ['chest', 40, 250], ['arm', 10, 80], ['thigh', 20, 120]]),
    lessons,
    achievements,
    exNotes,
  };
}

let storageOk = true;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return sanitize(JSON.parse(raw));
  } catch (e) {
    storageOk = false;
    console.warn('Speicher konnte nicht gelesen werden', e);
  }
  return defaults();
}

export const store = {
  state: load(),
  onError: null, // wird von main.js gesetzt (Hinweis an die Nutzerin/den Nutzer)
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
      storageOk = true;
      return true;
    } catch (e) {
      storageOk = false;
      console.warn('Speichern fehlgeschlagen', e);
      this.onError?.(e);
      return false;
    }
  },
  get storageOk() { return storageOk; },
  replace(data) {
    this.state = sanitize(data);
    return this.save();
  },
  reset() {
    this.state = defaults();
    this.save();
  },
  exportJSON() {
    return JSON.stringify({ app: 'FORGE52', exportedAt: new Date().toISOString(), ...this.state }, null, 2);
  },
};
