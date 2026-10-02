// FORGE52 – periodisierter 52-Wochen-Plan (Makrozyklus) für das Training bei McFit.
// Aufbau: 6 Phasen (Mesozyklen) mit Belastungswochen, Deloads und Testwochen.

import { EX_BY_ID } from './exercises.js';
import { fmtClock } from '../utils.js';

export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const WEEKDAYS_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export const WARMUP = [
  '5–8 Min locker auf Crosstrainer, Rad oder Laufband (leicht ins Schwitzen kommen).',
  '1–2 Aufwärmsätze bei der ersten Übung jeder Muskelgruppe: ca. 50 % × 10 Wdh, dann 75 % × 5 Wdh.',
  'Bei Bein- und Rückentagen: 10 Hüftkreise, 10 Körpergewicht-Kniebeugen, 10 Good Mornings ohne Gewicht.',
];

// ───────────────────────── Workouts ─────────────────────────
// item: { ex, sets, reps, rest (Sek.), note?, ss? (Supersatz-Gruppe), finisher? }
const W = (name, focus, items) => ({ name, focus, items });

export const WORKOUTS = {
  // Phase 1 – Fundament
  'p1-a': W('Ganzkörper A', 'Beinpresse · Brust · Latzug', [
    { ex: 'beinpresse', sets: 3, reps: '12–15', rest: 120 },
    { ex: 'brustpresse', sets: 3, reps: '12–15', rest: 90 },
    { ex: 'latzug-breit', sets: 3, reps: '12–15', rest: 90 },
    { ex: 'beinbeuger-sitzend', sets: 2, reps: '12–15', rest: 75 },
    { ex: 'schulterpresse', sets: 2, reps: '12–15', rest: 75 },
    { ex: 'wadenheben-stehend', sets: 2, reps: '15–20', rest: 60 },
    { ex: 'bauchmaschine', sets: 2, reps: '15–20', rest: 60 },
  ]),
  'p1-b': W('Ganzkörper B', 'Kniebeuge · Rudern · Arme', [
    { ex: 'goblet-squat', sets: 3, reps: '10–12', rest: 120, note: 'Technik lernen: lieber leichter und tief.' },
    { ex: 'rudern-kabel', sets: 3, reps: '12–15', rest: 90 },
    { ex: 'butterfly', sets: 3, reps: '12–15', rest: 75 },
    { ex: 'rueckenstrecker', sets: 2, reps: '12–15', rest: 75 },
    { ex: 'seitheben-maschine', sets: 2, reps: '12–15', rest: 60 },
    { ex: 'bizepsmaschine', sets: 2, reps: '12–15', rest: 60 },
    { ex: 'trizeps-seil', sets: 2, reps: '12–15', rest: 60 },
    { ex: 'plank', sets: 2, reps: '30–45', rest: 45 },
  ]),

  // Phase 2 – Aufbau
  'p2-a': W('Ganzkörper A – Kniebeuge', 'Kniebeuge · Bankdrücken · Latzug', [
    { ex: 'multipresse-kniebeuge', sets: 3, reps: '8–10', rest: 150 },
    { ex: 'kh-bankdruecken', sets: 3, reps: '8–12', rest: 120 },
    { ex: 'latzug-eng', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'beinbeuger-liegend', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'kh-seitheben', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'kh-curls', sets: 2, reps: '10–12', rest: 15, ss: 'A' },
    { ex: 'trizeps-ueberkopf', sets: 2, reps: '10–12', rest: 60, ss: 'A' },
    { ex: 'kabel-crunch', sets: 3, reps: '12–15', rest: 60 },
  ]),
  'p2-b': W('Ganzkörper B – Hüfte', 'Kreuzheben · Schultern · Rudern', [
    { ex: 'rumaenisches-kreuzheben-kh', sets: 3, reps: '8–10', rest: 150 },
    { ex: 'schulterpresse', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'kh-rudern', sets: 3, reps: '10–12', rest: 90, note: 'Wiederholungen pro Seite.' },
    { ex: 'beinpresse', sets: 3, reps: '10–12', rest: 120 },
    { ex: 'butterfly', sets: 2, reps: '12–15', rest: 60 },
    { ex: 'kabel-curls', sets: 2, reps: '10–12', rest: 15, ss: 'A' },
    { ex: 'trizeps-seil', sets: 2, reps: '10–12', rest: 60, ss: 'A' },
    { ex: 'seitstuetz', sets: 2, reps: '30', rest: 45, note: 'Zeit pro Seite.' },
  ]),
  'p2-c': W('Ganzkörper C – Volumen', 'Hip Thrust · Schrägbank · Klimmzüge', [
    { ex: 'hip-thrust', sets: 3, reps: '8–12', rest: 120 },
    { ex: 'schraegbank-brustpresse', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'klimmzuege-assistiert', sets: 3, reps: '6–10', rest: 120, note: 'Eingetragenes Gewicht = Unterstützung.' },
    { ex: 'ausfallschritte', sets: 2, reps: '10–12', rest: 90, note: 'Wiederholungen pro Bein.' },
    { ex: 'reverse-butterfly', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'wadenheben-stehend', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'beinheben', sets: 3, reps: '10–15', rest: 60 },
  ]),

  // Phase 3 – Hypertrophie I (Oberkörper/Unterkörper)
  'p3-oa': W('Oberkörper A', 'Brust & Rücken horizontal', [
    { ex: 'kh-bankdruecken', sets: 4, reps: '8–10', rest: 120 },
    { ex: 'rudern-kabel', sets: 4, reps: '8–12', rest: 120 },
    { ex: 'schraegbank-brustpresse', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'latzug-breit', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'kh-seitheben', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'trizeps-seil', sets: 3, reps: '10–12', rest: 15, ss: 'A' },
    { ex: 'hammer-curls', sets: 3, reps: '10–12', rest: 60, ss: 'A' },
  ]),
  'p3-ua': W('Unterkörper A – Quadrizeps', 'Kniebeuge · Beinpresse · Waden', [
    { ex: 'multipresse-kniebeuge', sets: 4, reps: '6–10', rest: 180, note: 'Alternativ: Hackenschmidt-Kniebeuge.' },
    { ex: 'beinpresse', sets: 3, reps: '10–12', rest: 120 },
    { ex: 'beinbeuger-sitzend', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'beinstrecker', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'wadenheben-stehend', sets: 4, reps: '10–15', rest: 60 },
    { ex: 'kabel-crunch', sets: 3, reps: '10–15', rest: 60 },
  ]),
  'p3-ob': W('Oberkörper B', 'Schultern & Rücken vertikal', [
    { ex: 'kh-schulterdruecken', sets: 4, reps: '8–10', rest: 120 },
    { ex: 'klimmzuege-assistiert', sets: 4, reps: '6–10', rest: 120 },
    { ex: 'brustpresse', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'rudermaschine', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'butterfly', sets: 2, reps: '12–15', rest: 60 },
    { ex: 'face-pulls', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'bizepsmaschine', sets: 3, reps: '10–12', rest: 15, ss: 'A' },
    { ex: 'trizeps-ueberkopf', sets: 3, reps: '10–12', rest: 60, ss: 'A' },
  ]),
  'p3-ub': W('Unterkörper B – Hüfte & Po', 'Kreuzheben · Hip Thrust · Split Squat', [
    { ex: 'rumaenisches-kreuzheben-lh', sets: 4, reps: '6–10', rest: 180, note: 'Alternativ mit Kurzhanteln.' },
    { ex: 'hip-thrust', sets: 3, reps: '8–12', rest: 120 },
    { ex: 'bulgarian-split-squat', sets: 3, reps: '8–12', rest: 90, note: 'Wiederholungen pro Bein.' },
    { ex: 'beinbeuger-liegend', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'abduktoren', sets: 2, reps: '15–20', rest: 60 },
    { ex: 'wadenheben-beinpresse', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'beinheben', sets: 3, reps: '10–15', rest: 60 },
  ]),

  // Phase 4 – Kraft
  'p4-oa': W('Oberkörper A – Kraft Drücken', 'Bankdrücken schwer', [
    { ex: 'lh-bankdruecken', sets: 4, reps: '5–6', rest: 210, note: 'Ohne Sicherungspartner: Multipresse oder Brustpresse.' },
    { ex: 'rudermaschine', sets: 4, reps: '6–8', rest: 150 },
    { ex: 'kh-schraegbankdruecken', sets: 3, reps: '8–10', rest: 120 },
    { ex: 'latzug-breit', sets: 3, reps: '8–10', rest: 120 },
    { ex: 'dips-assistiert', sets: 3, reps: '8–10', rest: 90 },
    { ex: 'kh-curls', sets: 3, reps: '8–10', rest: 60 },
  ]),
  'p4-ua': W('Unterkörper A – Kraft Kniebeuge', 'Kniebeuge schwer', [
    { ex: 'lh-kniebeuge', sets: 4, reps: '5–6', rest: 240, note: 'Alternativ: Multipresse-Kniebeuge.' },
    { ex: 'beinpresse', sets: 3, reps: '8–10', rest: 150 },
    { ex: 'beinbeuger-sitzend', sets: 3, reps: '8–10', rest: 90 },
    { ex: 'beinstrecker', sets: 2, reps: '10–12', rest: 60 },
    { ex: 'wadenheben-stehend', sets: 4, reps: '8–12', rest: 60 },
    { ex: 'pallof-press', sets: 3, reps: '10', rest: 60, note: 'Wiederholungen pro Seite.' },
  ]),
  'p4-ob': W('Oberkörper B – Kraft Überkopf', 'Schulterdrücken & Klimmzüge schwer', [
    { ex: 'kh-schulterdruecken', sets: 4, reps: '6–8', rest: 150 },
    { ex: 'klimmzuege-assistiert', sets: 4, reps: '5–8', rest: 150, note: 'Unterstützung reduzieren!' },
    { ex: 'brustpresse', sets: 3, reps: '8–10', rest: 120 },
    { ex: 'rudern-kabel', sets: 3, reps: '8–10', rest: 120 },
    { ex: 'kabel-seitheben', sets: 3, reps: '10–12', rest: 60 },
    { ex: 'sz-french-press', sets: 3, reps: '8–10', rest: 75 },
    { ex: 'hammer-curls', sets: 2, reps: '10–12', rest: 60 },
  ]),
  'p4-ub': W('Unterkörper B – Kraft Hüfte', 'Kreuzheben & Hip Thrust schwer', [
    { ex: 'rumaenisches-kreuzheben-lh', sets: 4, reps: '5–6', rest: 210 },
    { ex: 'hip-thrust', sets: 4, reps: '6–8', rest: 150 },
    { ex: 'ausfallschritte', sets: 3, reps: '8–10', rest: 120, note: 'Wiederholungen pro Bein.' },
    { ex: 'beinbeuger-liegend', sets: 3, reps: '8–10', rest: 90 },
    { ex: 'rueckenstrecker', sets: 3, reps: '10–12', rest: 75 },
    { ex: 'kabel-crunch', sets: 3, reps: '10–12', rest: 60 },
  ]),

  // Phase 5 – Hypertrophie II (Beine · Push · Pull · Ganzkörper)
  'p5-legs': W('Beine – komplett', 'Kniebeuge · Kreuzheben · Waden', [
    { ex: 'hackenschmidt', sets: 4, reps: '8–10', rest: 180, note: 'Keine Hackenschmidt? Multipresse-Kniebeuge.' },
    { ex: 'rumaenisches-kreuzheben-kh', sets: 3, reps: '8–10', rest: 150 },
    { ex: 'beinpresse', sets: 3, reps: '12–15', rest: 120 },
    { ex: 'beinbeuger-sitzend', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'beinstrecker', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'wadenheben-stehend', sets: 4, reps: '10–15', rest: 60 },
  ]),
  'p5-push': W('Push – Brust, Schultern, Trizeps', 'Drücken', [
    { ex: 'kh-schraegbankdruecken', sets: 4, reps: '8–10', rest: 120 },
    { ex: 'brustpresse', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'schulterpresse', sets: 3, reps: '8–12', rest: 90 },
    { ex: 'kabel-crossover', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'kabel-seitheben', sets: 4, reps: '12–15', rest: 45 },
    { ex: 'trizeps-seil', sets: 3, reps: '10–12', rest: 60 },
    { ex: 'trizeps-ueberkopf', sets: 2, reps: '10–12', rest: 60 },
  ]),
  'p5-pull': W('Pull – Rücken, Bizeps, hintere Schulter', 'Ziehen', [
    { ex: 'latzug-breit', sets: 4, reps: '8–10', rest: 120 },
    { ex: 'kh-rudern', sets: 3, reps: '8–12', rest: 90, note: 'Wiederholungen pro Seite.' },
    { ex: 'rudermaschine', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'ueberzuege-kabel', sets: 2, reps: '12–15', rest: 60 },
    { ex: 'reverse-butterfly', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'bizepsmaschine', sets: 3, reps: '10–12', rest: 60 },
    { ex: 'hammer-curls', sets: 2, reps: '10–12', rest: 60 },
    { ex: 'beinheben', sets: 3, reps: '10–15', rest: 60 },
  ]),
  'p5-full': W('Ganzkörper – Pump & Schwachstellen', 'Alles einmal, moderat', [
    { ex: 'hip-thrust', sets: 3, reps: '10–12', rest: 120 },
    { ex: 'klimmzuege-assistiert', sets: 3, reps: '8–10', rest: 90 },
    { ex: 'kh-bankdruecken', sets: 3, reps: '10–12', rest: 90 },
    { ex: 'beinbeuger-liegend', sets: 3, reps: '12–15', rest: 75 },
    { ex: 'wadenheben-beinpresse', sets: 3, reps: '12–15', rest: 60 },
    { ex: 'kabel-curls', sets: 2, reps: '12–15', rest: 15, ss: 'A' },
    { ex: 'trizeps-seil', sets: 2, reps: '12–15', rest: 60, ss: 'A' },
    { ex: 'kabel-crunch', sets: 3, reps: '12–15', rest: 60 },
  ]),

  // Phase 6 – Definition & Peak (Supersätze + Finisher)
  'p6-a': W('Ganzkörper A – Supersätze', 'Kniebeuge · Brust/Rücken · HIIT', [
    { ex: 'multipresse-kniebeuge', sets: 3, reps: '8–10', rest: 120 },
    { ex: 'kh-bankdruecken', sets: 3, reps: '8–10', rest: 15, ss: 'A' },
    { ex: 'rudern-kabel', sets: 3, reps: '10–12', rest: 90, ss: 'A' },
    { ex: 'beinbeuger-sitzend', sets: 3, reps: '10–12', rest: 15, ss: 'B' },
    { ex: 'kh-seitheben', sets: 3, reps: '12–15', rest: 60, ss: 'B' },
    { ex: 'kabel-crunch', sets: 3, reps: '12–15', rest: 15, ss: 'C' },
    { ex: 'plank', sets: 3, reps: '45', rest: 45, ss: 'C' },
    { ex: 'ergometer', sets: 1, reps: '10', rest: 0, finisher: true, note: 'HIIT: 8 × 30 Sek. hart / 60 Sek. locker.' },
  ]),
  'p6-b': W('Ganzkörper B – Supersätze', 'Kreuzheben · Schultern/Lat · Rudern', [
    { ex: 'rumaenisches-kreuzheben-kh', sets: 3, reps: '8–10', rest: 150 },
    { ex: 'schulterpresse', sets: 3, reps: '10–12', rest: 15, ss: 'A' },
    { ex: 'latzug-eng', sets: 3, reps: '10–12', rest: 90, ss: 'A' },
    { ex: 'ausfallschritte', sets: 3, reps: '10', rest: 15, ss: 'B', note: 'Wiederholungen pro Bein.' },
    { ex: 'butterfly', sets: 3, reps: '12–15', rest: 75, ss: 'B' },
    { ex: 'bizepsmaschine', sets: 2, reps: '12–15', rest: 15, ss: 'C' },
    { ex: 'trizeps-seil', sets: 2, reps: '12–15', rest: 60, ss: 'C' },
    { ex: 'rudergeraet', sets: 1, reps: '10', rest: 0, finisher: true, note: 'Zügiges Tempo, ca. 85 % Anstrengung.' },
  ]),
  'p6-c': W('Ganzkörper C – Supersätze', 'Hip Thrust · Schrägbank · Steigung', [
    { ex: 'hip-thrust', sets: 3, reps: '10–12', rest: 120 },
    { ex: 'schraegbank-brustpresse', sets: 3, reps: '10–12', rest: 15, ss: 'A' },
    { ex: 'kh-rudern', sets: 3, reps: '10–12', rest: 90, ss: 'A' },
    { ex: 'beinpresse', sets: 2, reps: '15–20', rest: 90 },
    { ex: 'face-pulls', sets: 3, reps: '15', rest: 15, ss: 'B' },
    { ex: 'wadenheben-stehend', sets: 3, reps: '15', rest: 60, ss: 'B' },
    { ex: 'beinheben', sets: 3, reps: '12', rest: 60 },
    { ex: 'laufband-steigung', sets: 1, reps: '15', rest: 0, finisher: true, note: '10–12 % Steigung, 5–5,5 km/h.' },
  ]),
};

// ───────────────────────── Phasen ─────────────────────────
// Wochen-Typen: load = Belastung, deload = Entlastung, test = Leistungstest
const L = (rir, label, extra = {}) => ({ kind: 'load', rir, label, setsAdj: 0, ...extra });
const DELOAD = (label = 'Deload') => ({ kind: 'deload', rir: '4–5', label, setsAdj: 0 });
const TEST = (label = 'Testwoche') => ({ kind: 'test', rir: '1–2', label, setsAdj: 0 });

export const PHASES = [
  {
    id: 'p1', num: 1, name: 'Fundament', tagline: 'Technik, Geräte & Gewohnheit',
    weeks: [1, 8], perWeek: 3, split: 'Ganzkörper (A/B im Wechsel)', reps: '12–15',
    color: 1,
    goal: 'Du lernst alle wichtigen McFit-Geräte richtig einzustellen und zu bedienen. Sehnen, Bänder und Gelenke gewöhnen sich an die Belastung, und Training wird zur festen Gewohnheit.',
    why: 'Am Anfang wächst der Körper schon mit wenig Volumen. Maschinen führen die Bewegung, darum kannst du sicher lernen und dich trotzdem schnell steigern. Jeder Muskel wird 3× pro Woche trainiert – ideal für Einsteiger.',
    cardio: '2× pro Woche 20 Min Zone 2 (z. B. Laufband mit Steigung) an trainingsfreien Tagen oder nach dem Training. Täglich 7.000–10.000 Schritte.',
    rotation: (week) => (week % 2 === 1 ? ['p1-a', 'p1-b', 'p1-a'] : ['p1-b', 'p1-a', 'p1-b']),
    weekPlan: [
      L('4', 'Gewöhnung', { setsAdj: -1, note: 'Lerne die Geräte kennen: leichtes Gewicht, Sitzpositionen notieren, saubere Technik.' }),
      L('3', 'Technik', { setsAdj: -1, note: 'Finde dein Arbeitsgewicht: die letzte Wiederholung soll fordernd, aber sauber sein.' }),
      L('3', 'Aufbau', { note: 'Jetzt volle Satzanzahl. Steigere das Gewicht, sobald du das obere Ende der Wdh-Spanne schaffst.' }),
      L('3', 'Aufbau'),
      L('2', 'Steigerung', { note: 'Etwas härter: nur noch ca. 2 Wiederholungen „im Tank“ lassen.' }),
      L('2', 'Steigerung'),
      L('1–2', 'Höhepunkt', { note: 'Die härteste Woche der Phase – volle Konzentration auf jede Wiederholung.' }),
      DELOAD(),
    ],
  },
  {
    id: 'p2', num: 2, name: 'Aufbau', tagline: 'Freie Gewichte & mehr Volumen',
    weeks: [9, 16], perWeek: 3, split: 'Ganzkörper (A/B/C)', reps: '8–12',
    color: 2,
    goal: 'Du baust Grundkraft auf und lernst die wichtigsten Freihantel-Übungen: Kniebeuge, rumänisches Kreuzheben, Kurzhantel-Bankdrücken und Rudern.',
    why: 'Drei unterschiedliche Ganzkörper-Einheiten sorgen für Abwechslung und trainieren jeden Muskel aus verschiedenen Winkeln. Der Wiederholungsbereich sinkt auf 8–12 – mehr Gewicht, mehr Spannung.',
    cardio: '2× pro Woche 25 Min Zone 2 (Crosstrainer, Rad oder Laufband). Täglich 8.000–10.000 Schritte.',
    rotation: () => ['p2-a', 'p2-b', 'p2-c'],
    weekPlan: [
      L('3', 'Einstieg', { note: 'Neue Übungen: Startgewicht konservativ wählen und die Technik festigen.' }),
      L('2–3', 'Aufbau'),
      L('2', 'Aufbau'),
      L('2', 'Steigerung'),
      L('1–2', 'Steigerung'),
      L('1–2', 'Steigerung', { setsAdj: 1, note: 'Hauptübungen +1 Satz.' }),
      L('1', 'Höhepunkt', { setsAdj: 1, note: 'Hauptübungen +1 Satz – letzte harte Woche vor dem Deload.' }),
      DELOAD(),
    ],
  },
  {
    id: 'p3', num: 3, name: 'Hypertrophie I', tagline: 'Muskelaufbau mit Split',
    weeks: [17, 28], perWeek: 4, split: 'Oberkörper / Unterkörper', reps: '6–12',
    color: 3,
    goal: 'Maximaler Muskelaufbau: Mit vier Einheiten pro Woche kannst du pro Muskel mehr Sätze machen und jeden Muskel trotzdem 2× pro Woche trainieren.',
    why: 'Der Oberkörper/Unterkörper-Split ist für Fortgeschrittene einer der effektivsten Splits: hohe Frequenz, genug Erholung und 10–16 harte Sätze pro Muskel und Woche.',
    cardio: '2× pro Woche 20–30 Min Zone 2 an trainingsfreien Tagen. Täglich 8.000–10.000 Schritte.',
    rotation: () => ['p3-oa', 'p3-ua', 'p3-ob', 'p3-ub'],
    weekPlan: [
      L('3', 'Einstieg', { setsAdj: -1, note: 'Neuer Split: erst einmal mit einem Satz weniger reinkommen.' }),
      L('2', 'Aufbau'),
      L('2', 'Aufbau'),
      L('1', 'Steigerung'),
      L('0–1', 'Höhepunkt', { setsAdj: 1, note: 'Hauptübungen +1 Satz, bis kurz vor das Muskelversagen.' }),
      DELOAD(),
      L('2', 'Block 2', { note: 'Zweiter Block: Starte mit etwas mehr Gewicht als im ersten Block.' }),
      L('2', 'Aufbau'),
      L('1', 'Steigerung'),
      L('1', 'Steigerung', { setsAdj: 1, note: 'Hauptübungen +1 Satz.' }),
      L('0–1', 'Höhepunkt', { setsAdj: 1, note: 'Hauptübungen +1 Satz – volle Intensität.' }),
      DELOAD(),
    ],
  },
  {
    id: 'p4', num: 4, name: 'Kraft', tagline: 'Schwer & stark werden',
    weeks: [29, 36], perWeek: 4, split: 'Oberkörper / Unterkörper (Kraft)', reps: '5–10',
    color: 4,
    goal: 'Du wirst richtig stark. Die Hauptübungen werden schwer mit 5–6 Wiederholungen trainiert – das macht dich für die nächste Muskelaufbauphase noch leistungsfähiger.',
    why: 'Mehr Kraft = mehr Gewicht in der nächsten Hypertrophie-Phase = mehr Muskelreiz. Die Pausen sind länger, damit jeder Satz mit voller Kraft gelingt.',
    cardio: '2× pro Woche 20 Min locker (nicht vor dem Beintraining!). Täglich 8.000+ Schritte.',
    rotation: () => ['p4-oa', 'p4-ua', 'p4-ob', 'p4-ub'],
    weekPlan: [
      L('3', 'Einstieg', { note: 'Schwerer Bereich: steigere dich langsam, Technik bleibt oberstes Gebot.' }),
      L('2', 'Aufbau'),
      L('2', 'Aufbau'),
      L('1–2', 'Steigerung'),
      L('1', 'Steigerung'),
      L('1', 'Höhepunkt'),
      TEST('Kraft-Test'),
      DELOAD(),
    ],
  },
  {
    id: 'p5', num: 5, name: 'Hypertrophie II', tagline: 'Volumen & Intensitätstechniken',
    weeks: [37, 46], perWeek: 4, split: 'Beine · Push · Pull · Ganzkörper', reps: '8–15',
    color: 5,
    goal: 'Mit der neu gewonnenen Kraft holst du das Maximum an Muskelmasse heraus. Im zweiten Block kommen Drop-Sätze dazu.',
    why: 'Neue Übungsreihenfolge, neuer Split und Intensitätstechniken setzen frische Reize. Der Ganzkörpertag sorgt dafür, dass jeder Muskel trotzdem ca. 2× pro Woche trainiert wird.',
    cardio: '2–3× pro Woche 25 Min Zone 2. Täglich 8.000–10.000 Schritte.',
    rotation: () => ['p5-legs', 'p5-push', 'p5-pull', 'p5-full'],
    weekPlan: [
      L('3', 'Einstieg', { setsAdj: -1 }),
      L('2', 'Aufbau'),
      L('2', 'Aufbau'),
      L('1', 'Steigerung'),
      L('0–1', 'Höhepunkt', { setsAdj: 1, note: 'Hauptübungen +1 Satz.' }),
      DELOAD(),
      L('2', 'Drop-Sätze', { dropsets: true, note: 'Letzter Satz an Maschinen & Kabel als Drop-Satz: Gewicht ~25 % runter und sofort weiter bis kurz vor Versagen.' }),
      L('1', 'Drop-Sätze', { dropsets: true }),
      L('0–1', 'Höhepunkt', { dropsets: true, setsAdj: 1, note: 'Hauptübungen +1 Satz + Drop-Sätze – die härteste Woche des Jahres.' }),
      DELOAD(),
    ],
  },
  {
    id: 'p6', num: 6, name: 'Definition & Peak', tagline: 'Form zeigen & Jahr abschließen',
    weeks: [47, 52], perWeek: 3, split: 'Ganzkörper mit Supersätzen + Finisher', reps: '8–15',
    color: 6,
    goal: 'Muskeln halten, Fett verlieren, Kondition steigern – und am Ende des Jahres deine Bestleistungen testen.',
    why: 'Supersätze sparen Zeit und erhöhen den Kalorienverbrauch. Wer Fett verlieren will, kombiniert diese Phase mit einem leichten Kaloriendefizit (ca. 300–500 kcal/Tag) und hoher Eiweißzufuhr.',
    cardio: '3× pro Woche 30 Min Zone 2 + die Finisher im Training. Täglich 10.000 Schritte.',
    rotation: () => ['p6-a', 'p6-b', 'p6-c'],
    weekPlan: [
      L('2', 'Einstieg', { note: 'Supersätze: zwei Übungen direkt nacheinander, dann Pause.' }),
      L('2', 'Aufbau'),
      L('1', 'Steigerung'),
      L('1', 'Höhepunkt'),
      TEST('Jahres-Test'),
      DELOAD('Rückblick'),
    ],
  },
];

export const TOTAL_WEEKS = 52;

// Phasen-Farben (validierte Kategorie-Palette, Reihenfolge fest)
export const PHASE_COLORS = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'],
  dark:  ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'],
};

export function phaseForWeek(week) {
  return PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) || PHASES[0];
}

export function weekInfo(week) {
  const w = Math.min(Math.max(week, 1), TOTAL_WEEKS);
  const phase = phaseForWeek(w);
  const idx = w - phase.weeks[0];
  const cfg = phase.weekPlan[idx] || phase.weekPlan[phase.weekPlan.length - 1];
  const notes = [];
  if (cfg.kind === 'deload') {
    notes.push('Entlastungswoche: nur die Hälfte der Sätze und ca. 10–15 % weniger Gewicht. Der Körper repariert und wird stärker – nicht auslassen!');
    if (w === TOTAL_WEEKS) notes.push('Das letzte Training des Jahres: Schau dir deinen Fortschritt an und plane dein nächstes Jahr.');
  }
  if (cfg.kind === 'test') {
    notes.push('Testwoche: Bei der ersten Übung jedes Trainings arbeitest du dich über Aufwärmsätze an ein sauberes 5-Wiederholungs-Maximum heran (1 Satz, RIR 0–1). Danach normal weiter mit RIR 2.');
  }
  if (cfg.note) notes.push(cfg.note);
  return {
    week: w,
    phase,
    weekOfPhase: idx + 1,
    phaseLength: phase.weeks[1] - phase.weeks[0] + 1,
    ...cfg,
    notes,
    rotation: phase.rotation(w),
  };
}

// Erzeugt das konkrete Training für eine Woche (Sätze/RIR werden nach Wochentyp angepasst).
export function buildWorkout(workoutId, week) {
  const base = WORKOUTS[workoutId];
  const info = weekInfo(week);
  const items = base.items.map((it, i) => {
    const ex = EX_BY_ID[it.ex];
    let sets = it.sets;
    if (!it.finisher) {
      if (info.kind === 'deload') sets = Math.max(1, Math.ceil(sets / 2));
      else if (info.setsAdj < 0) sets = Math.max(2, sets + info.setsAdj);
      else if (info.setsAdj > 0 && i < 2) sets = sets + info.setsAdj;
    }
    const tags = [];
    if (info.kind === 'test' && i === 0) tags.push('Test: 5-Wdh-Max');
    if (info.dropsets && !it.finisher && (ex.equipment === 'maschine' || ex.equipment === 'kabel') && i >= 1) tags.push('Drop-Satz im letzten Satz');
    if (info.kind === 'deload' && !it.finisher) tags.push('−10–15 % Gewicht');
    return { ...it, sets, rir: it.finisher ? null : info.rir, tags, exercise: ex };
  });
  return { id: workoutId, name: base.name, focus: base.focus, items, week: info.week, info };
}

export function estimateMinutes(workout) {
  let sec = 8 * 60; // Aufwärmen
  for (const it of workout.items) {
    if (it.exercise.type === 'cardio') { sec += parseInt(it.reps, 10) * 60; continue; }
    const work = it.exercise.type === 'time' ? parseInt(it.reps, 10) || 40 : 40;
    sec += it.sets * (work + (it.rest || 60)) + 60;
  }
  return Math.round(sec / 60 / 5) * 5;
}

export function workoutMuscles(workout) {
  const count = {};
  for (const it of workout.items) {
    for (const m of it.exercise.muscles) count[m] = (count[m] || 0) + it.sets;
  }
  return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([m]) => m);
}

// Liste der Trainingstage einer Woche: [{ day (0=Mo), slot, workoutId }]
export function weekSchedule(week, settings) {
  const info = weekInfo(week);
  const days = info.phase.perWeek === 4 ? settings.days4 : settings.days3;
  return info.rotation.map((workoutId, slot) => ({ day: days[slot] ?? slot, slot, workoutId, week: info.week }));
}

// Kurzlabels für Wochenübersicht
export const SHORT = {
  'p1-a': 'GK A', 'p1-b': 'GK B',
  'p2-a': 'GK A', 'p2-b': 'GK B', 'p2-c': 'GK C',
  'p3-oa': 'OK A', 'p3-ua': 'UK A', 'p3-ob': 'OK B', 'p3-ub': 'UK B',
  'p4-oa': 'OK A', 'p4-ua': 'UK A', 'p4-ob': 'OK B', 'p4-ub': 'UK B',
  'p5-legs': 'Beine', 'p5-push': 'Push', 'p5-pull': 'Pull', 'p5-full': 'GK',
  'p6-a': 'GK A', 'p6-b': 'GK B', 'p6-c': 'GK C',
};

// Zieltext einer Übung, z. B. "3 × 10–12 · RIR 2 · 1:30 Pause" (Supersatz: "direkt weiter zu A2")
export function targetText(items, i, sets = items[i].sets) {
  const it = items[i];
  const ex = EX_BY_ID[it.ex];
  if (ex.type === 'cardio') return `${it.reps} Min`;
  const unit = ex.type === 'time' ? ' Sek' : '';
  const rir = ex.type === 'reps' && it.rir ? ` · RIR ${it.rir}` : '';
  const next = items[i + 1];
  const rest = it.ss && next && next.ss === it.ss ? `direkt weiter zu ${it.ss}2` : `${fmtClock(it.rest)} Pause`;
  return `${sets} × ${it.reps}${unit}${rir} · ${rest}`;
}
