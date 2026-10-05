export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// ───── Datum ─────
export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function parseISO(s) {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export const todayISO = () => toISO(new Date());

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
export function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (x.getDay() + 6) % 7; // 0 = Montag
  return addDays(x, -wd);
}
export const weekdayIndex = (d) => (d.getDay() + 6) % 7;

export function daysBetween(a, b) {
  const A = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const B = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((B - A) / 86400000);
}

const fmtShort = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLong = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtDay = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' });
const fmtFull = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
export const fmtDateShort = (d) => fmtShort.format(d instanceof Date ? d : parseISO(d));
export const fmtDateLong = (d) => fmtLong.format(d instanceof Date ? d : parseISO(d));
export const fmtDayMonth = (d) => fmtDay.format(d instanceof Date ? d : parseISO(d));
export const fmtDateFull = (d) => fmtFull.format(d instanceof Date ? d : parseISO(d));

// ───── Zahlen ─────
const nf = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
export const fmtNum = (n) => nf.format(n || 0);
// Gespeicherte Dezimalzahl ("62.5") für die Anzeige im deutschen Format ("62,5")
export const fmtDec = (v) => (v === '' || v == null ? '' : String(v).replace('.', ','));
export function fmtCompact(n) {
  if (n >= 1_000_000) return nf.format(n / 1_000_000) + ' Mio.';
  if (n >= 10_000) return nf.format(Math.round(n / 100) / 10) + ' t';
  return nf.format(n);
}
export function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h) return `${h} h ${m} min`;
  return `${m} min`;
}
export function fmtClock(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
export const parseNum = (v) => {
  if (v === '' || v == null) return NaN;
  return parseFloat(String(v).replace(',', '.'));
};

// "10–12" → [10, 12] · "30" → [30, 30]
export function parseRange(r) {
  const nums = String(r).split(/[–-]/).map((x) => parseInt(x, 10)).filter((x) => !Number.isNaN(x));
  if (!nums.length) return [0, 0];
  return [nums[0], nums[nums.length - 1]];
}

// Geschätztes 1-Wiederholungs-Maximum (Epley)
export const e1rm = (kg, reps) => (reps <= 1 ? kg : kg * (1 + reps / 30));

export function debounce(fn, ms = 300) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'Gute Nacht';
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Hallo';
  return 'Guten Abend';
}

export function pluralize(n, one, many) {
  return `${fmtNum(n)} ${n === 1 ? one : many}`;
}
