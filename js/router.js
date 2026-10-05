// Hash-Router + globale Event-Delegation (data-action / data-input / data-change).
const routes = [];
const actions = {};
const inputs = {};
const changes = {};
let current = null;
let afterRender = () => {};
let onRenderError = null;

// Verlaufstiefe innerhalb der App (in history.state gespeichert), damit „Zurück“ nie aus der App führt
let depth = 0;
let replacing = false;

export function route(pattern, view) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ re, keys, view });
}

export const on = (name, fn) => { actions[name] = fn; };
export const onInput = (name, fn) => { inputs[name] = fn; };
export const onChange = (name, fn) => { changes[name] = fn; };
export const onAfterRender = (fn) => { afterRender = fn; };
export const setRenderErrorHandler = (fn) => { onRenderError = fn; };
export const currentRoute = () => current;
export const navDepth = () => depth;

const decode = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

function match(hash) {
  const h = hash.replace(/^#/, '') || '/';
  for (const r of routes) {
    const m = h.match(r.re);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decode(m[i + 1]); });
      return { view: r.view, params };
    }
  }
  return { view: routes[0].view, params: {} };
}

function render(keepScroll) {
  const root = document.getElementById('view');
  const y = window.scrollY;
  let view;
  let params;
  try {
    ({ view, params } = match(location.hash));
    if (current?.view !== view || !keepScroll) current?.view.unmount?.();
    const redirect = view.guard?.(params);
    if (redirect) { replace(redirect); return; }
    root.innerHTML = view.render(params);
    current = { view, params };
    view.mount?.(root, params);
    afterRender(view, params);
    window.scrollTo(0, keepScroll ? y : 0);
  } catch (e) {
    console.error('Darstellungsfehler', e);
    current = { view: { name: 'error' }, params: {} };
    if (onRenderError) onRenderError(root, e);
    else root.innerHTML = '<p style="padding:24px">Es ist ein Fehler aufgetreten.</p>';
  }
}

export function go(hash) {
  if (location.hash === hash) render(false);
  else location.hash = hash;
}

// Ersetzt den aktuellen Verlaufseintrag (keine zusätzliche „Zurück“-Stufe)
export function replace(hash) {
  if (location.hash === hash) { render(false); return; }
  replacing = true;
  location.replace(hash);
}

export function back(fallback = '#/') {
  if (depth > 0) history.back();
  else replace(fallback);
}

export function rerender() {
  render(true);
}

export function startRouter() {
  const st = history.state;
  if (st && typeof st.forge === 'number') depth = st.forge;
  else { try { history.replaceState({ forge: 0 }, ''); } catch { /* ignore */ } }

  window.addEventListener('hashchange', () => {
    const st2 = history.state;
    if (st2 && typeof st2.forge === 'number' && !replacing) {
      depth = st2.forge; // Zurück/Vor zu einem bekannten Eintrag
    } else {
      if (!replacing) depth += 1;
      replacing = false;
      try { history.replaceState({ forge: depth }, ''); } catch { /* ignore */ }
    }
    render(false);
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (fn) {
      e.preventDefault();
      fn(el, e);
    }
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el && inputs[el.dataset.input]) inputs[el.dataset.input](el, e);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && changes[el.dataset.change]) changes[el.dataset.change](el, e);
  });
  render(false);
}
