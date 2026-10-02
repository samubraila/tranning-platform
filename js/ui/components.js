import { icon } from '../icons.js';
import { esc } from '../utils.js';

// ───── Toast ─────
export function toast(msg, ic = 'check', ms = 2600) {
  const root = document.getElementById('toast-root');
  while (root.children.length >= 2) root.firstElementChild.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(ic, 18)}<span>${esc(msg)}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 320);
  }, ms);
}

// ───── Bottom-Sheet ─────
let sheetClose = null;
export function openSheet(html, { onClose } = {}) {
  closeSheet();
  const root = document.getElementById('sheet-root');
  root.innerHTML = `<div class="backdrop" data-close-sheet></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  document.body.style.overflow = 'hidden';
  const onKey = (e) => { if (e.key === 'Escape') closeSheet(); };
  document.addEventListener('keydown', onKey);
  root.querySelector('[data-close-sheet]').addEventListener('click', () => closeSheet());
  sheetClose = () => {
    document.removeEventListener('keydown', onKey);
    root.innerHTML = '';
    document.body.style.overflow = '';
    sheetClose = null;
    onClose?.();
  };
  return root.querySelector('.sheet');
}
export function closeSheet() {
  sheetClose?.();
}
export const sheetOpen = () => !!sheetClose;

// ───── Bestätigungsdialog ─────
export function confirmDialog({ title, text = '', ok = 'OK', cancel = 'Abbrechen', danger = false }) {
  return new Promise((resolve) => {
    const root = document.getElementById('sheet-root');
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="backdrop"></div>
      <div class="dialog" role="alertdialog" aria-modal="true">
        <h3 class="h" style="font-size:19px">${esc(title)}</h3>
        ${text ? `<p class="muted mt-8">${esc(text)}</p>` : ''}
        <div class="btn-row mt-24">
          <button class="btn" data-r="0">${esc(cancel)}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-r="1">${esc(ok)}</button>
        </div>
      </div>`;
    root.appendChild(wrap);
    const done = (v) => { wrap.remove(); resolve(v); };
    wrap.querySelector('.backdrop').addEventListener('click', () => done(false));
    wrap.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => done(b.dataset.r === '1')));
    wrap.querySelector('[data-r="1"]').focus();
  });
}

// ───── Fortschrittsring ─────
export function ring(value, { size = 64, stroke = 7, label = '', color = 'var(--accent-ink)' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>
    <div class="ring-label">${label}</div>
  </div>`;
}

export function backHeader(title, { back = '#/', sub = '', right = '' } = {}) {
  return `<header class="topbar topbar-sticky">
    ${back.startsWith('back:')
      ? `<button class="icon-btn" data-action="go-back" data-fallback="${back.slice(5)}" aria-label="Zurück">${icon('left', 22)}</button>`
      : `<a class="icon-btn" href="${back}" aria-label="Zurück">${icon('left', 22)}</a>`}
    <div class="grow titles" style="text-align:center">
      <div class="bold ellipsis" style="font-size:16px">${esc(title)}</div>
      ${sub ? `<div class="tiny faint ellipsis">${esc(sub)}</div>` : ''}
    </div>
    ${right || '<span style="width:42px"></span>'}
  </header>`;
}
