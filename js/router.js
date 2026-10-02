// Hash-Router + globale Event-Delegation (data-action / data-input / data-change).
const routes = [];
const actions = {};
const inputs = {};
const changes = {};
let current = null;
let afterRender = () => {};

export function route(pattern, view) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ re, keys, view });
}

export const on = (name, fn) => { actions[name] = fn; };
export const onInput = (name, fn) => { inputs[name] = fn; };
export const onChange = (name, fn) => { changes[name] = fn; };
export const onAfterRender = (fn) => { afterRender = fn; };
export const currentRoute = () => current;

function match(hash) {
  const h = hash.replace(/^#/, '') || '/';
  for (const r of routes) {
    const m = h.match(r.re);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { view: r.view, params };
    }
  }
  return { view: routes[0].view, params: {} };
}

function render(keepScroll) {
  const { view, params } = match(location.hash);
  const root = document.getElementById('view');
  const y = window.scrollY;
  if (current?.view !== view || !keepScroll) current?.view.unmount?.();
  const redirect = view.guard?.(params);
  if (redirect) { location.replace(redirect); return; }
  root.innerHTML = view.render(params);
  current = { view, params };
  view.mount?.(root, params);
  afterRender(view, params);
  window.scrollTo(0, keepScroll ? y : 0);
}

export function go(hash) {
  if (location.hash === hash) render(false);
  else location.hash = hash;
}

export function rerender() {
  render(true);
}

export function startRouter() {
  window.addEventListener('hashchange', () => render(false));
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
