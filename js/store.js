import { mondayOf, toISO } from './utils.js';

const KEY = 'forge52.v1';

export function defaults() {
  return {
    version: 1,
    profile: { name: '', sex: 'm', age: '', height: '', weight: '', activity: 1.55, goal: 'aufbau' },
    settings: {
      startDate: toISO(mondayOf(new Date())),
      days3: [0, 2, 4],
      days4: [0, 1, 3, 4],
      theme: 'auto',
      sound: true,
      vibrate: true,
      onboarded: false,
      cycle: 1,
    },
    sessions: [],
    active: null,
    bodyweight: [],
    lessons: {},
    achievements: {},
    exNotes: {},
  };
}

function merge(data) {
  const base = defaults();
  if (!data || typeof data !== 'object') return base;
  return {
    ...base,
    ...data,
    profile: { ...base.profile, ...(data.profile || {}) },
    settings: { ...base.settings, ...(data.settings || {}) },
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    bodyweight: Array.isArray(data.bodyweight) ? data.bodyweight : [],
    lessons: data.lessons || {},
    achievements: data.achievements || {},
    exNotes: data.exNotes || {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return merge(JSON.parse(raw));
  } catch (e) {
    console.warn('Speicher konnte nicht gelesen werden', e);
  }
  return defaults();
}

export const store = {
  state: load(),
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
      return true;
    } catch (e) {
      console.warn('Speichern fehlgeschlagen', e);
      return false;
    }
  },
  replace(data) {
    this.state = merge(data);
    this.save();
  },
  reset() {
    this.state = defaults();
    this.save();
  },
  exportJSON() {
    return JSON.stringify({ app: 'FORGE52', exportedAt: new Date().toISOString(), ...this.state }, null, 2);
  },
};
