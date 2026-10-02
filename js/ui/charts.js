// Schlanke SVG-Diagramme: eine Datenreihe, Hairline-Raster, Tooltip bei Hover/Tippen, Tabellenansicht.
import { esc, fmtNum } from '../utils.js';

const W = 340;

function niceMax(v) {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * exp;
}

function niceStep(range, count) {
  const raw = range / count;
  if (!(raw > 0)) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * exp;
}

function table(rows, head) {
  return `<details class="mt-8"><summary class="tiny faint" style="cursor:pointer">Als Tabelle anzeigen</summary>
    <table class="data-table"><thead><tr><th>${esc(head[0])}</th><th>${esc(head[1])}</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></details>`;
}

// data: [{ label, value, tip }]
export function barChart(data, { height = 170, unit = '', labelEvery = 0, valueFmt = fmtNum, tableHead = ['Woche', 'Wert'] } = {}) {
  if (!data.length || data.every((d) => !d.value)) return `<div class="chart-empty">Noch keine Daten – nach deinem ersten Training erscheint hier dein Verlauf.</div>`;
  const pad = { l: 38, r: 6, t: 18, b: 22 };
  const ih = height - pad.t - pad.b;
  const iw = W - pad.l - pad.r;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const slot = iw / data.length;
  const bw = Math.min(24, slot * 0.62);
  const every = labelEvery || (data.length > 8 ? 2 : 1);
  const ticks = [0, max / 2, max];
  let maxIdx = 0;
  data.forEach((d, i) => { if (d.value > data[maxIdx].value) maxIdx = i; });

  const grid = ticks.map((t) => {
    const y = pad.t + ih - (t / max) * ih;
    return `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"/>`;
  }).join('');
  const yAxis = ticks.map((t) => {
    const y = pad.t + ih - (t / max) * ih;
    return `<text x="${pad.l - 6}" y="${y + 3.5}" text-anchor="end">${esc(valueFmt(t))}</text>`;
  }).join('');
  const bars = data.map((d, i) => {
    const h = (d.value / max) * ih;
    const x = pad.l + i * slot + (slot - bw) / 2;
    const y = pad.t + ih - h;
    const r = Math.min(4, h, bw / 2);
    const path = h > 0
      ? `M${x},${pad.t + ih} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${pad.t + ih} Z`
      : '';
    return path ? `<path class="bar" data-i="${i}" d="${path}"/>` : '';
  }).join('');
  const labels = data.map((d, i) => (i % every === 0 || i === data.length - 1)
    ? `<text x="${pad.l + i * slot + slot / 2}" y="${height - 6}" text-anchor="middle">${esc(d.label)}</text>` : '').join('');
  const hits = data.map((d, i) => {
    const h = (d.value / max) * ih;
    return `<rect class="hit" x="${pad.l + i * slot}" y="${pad.t}" width="${slot}" height="${ih}" data-tip="${esc(d.tip || `${d.label}: <b>${valueFmt(d.value)} ${unit}</b>`)}" data-cx="${pad.l + i * slot + slot / 2}" data-cy="${pad.t + ih - h}" data-i="${i}"/>`;
  }).join('');
  const md = data[maxIdx];
  const mh = (md.value / max) * ih;
  const maxLabel = `<text class="val" x="${pad.l + maxIdx * slot + slot / 2}" y="${pad.t + ih - mh - 6}" text-anchor="middle">${esc(valueFmt(md.value))}</text>`;

  return `<div class="chart" data-kind="bar">
    <svg viewBox="0 0 ${W} ${height}" role="img" aria-label="Balkendiagramm">
      <g class="grid">${grid}</g>
      <g class="axis">${yAxis}${labels}</g>
      <g>${bars}</g>${maxLabel}
      <g>${hits}</g>
    </svg>
    <div class="chart-tip" hidden></div>
  </div>${table(data.map((d) => [d.label, `${valueFmt(d.value)} ${unit}`.trim()]), tableHead)}`;
}

// points: [{ label, value, tip }]
export function lineChart(points, { height = 170, unit = '', valueFmt = fmtNum, tableHead = ['Datum', 'Wert'], zero = false } = {}) {
  if (points.length < 2) {
    return `<div class="chart-empty">${points.length === 1 ? `Erster Wert: <b>${esc(valueFmt(points[0].value))} ${esc(unit)}</b> – ab dem zweiten Eintrag siehst du eine Kurve.` : 'Noch keine Daten.'}</div>`;
  }
  const pad = { l: 38, r: 30, t: 16, b: 22 };
  const ih = height - pad.t - pad.b;
  const iw = W - pad.l - pad.r;
  const vals = points.map((p) => p.value);
  let lo = zero ? 0 : Math.min(...vals);
  let hi = Math.max(...vals);
  if (hi === lo) { hi += 1; lo = Math.max(0, lo - 1); }
  const span = hi - lo;
  lo = zero ? 0 : Math.max(0, lo - span * 0.15);
  hi = hi + span * 0.15;
  // Achse auf runde Werte erweitern (z. B. 80 / 90 / 100)
  const step = niceStep(hi - lo, 3);
  lo = Math.floor(lo / step) * step;
  hi = Math.ceil(hi / step) * step;
  const tickFmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: step < 1 ? 2 : 0 });
  const x = (i) => pad.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v) => pad.t + ih - ((v - lo) / (hi - lo)) * ih;
  const ticks = [];
  for (let t = lo; t <= hi + step / 1000; t += step) ticks.push(t);
  const grid = ticks.map((t) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}"/>`).join('');
  const yAxis = ticks.map((t) => `<text x="${pad.l - 6}" y="${y(t) + 3.5}" text-anchor="end">${esc(tickFmt.format(t))}</text>`).join('');
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${d} L${x(points.length - 1).toFixed(1)},${pad.t + ih} L${x(0).toFixed(1)},${pad.t + ih} Z`;
  const last = points[points.length - 1];
  const every = Math.ceil(points.length / 5);
  const labels = points.map((p, i) => (i % every === 0 || i === points.length - 1) && !(i !== points.length - 1 && points.length - 1 - i < every / 2)
    ? `<text x="${x(i)}" y="${height - 6}" text-anchor="middle">${esc(p.label)}</text>` : '').join('');
  const band = iw / Math.max(1, points.length - 1);
  const hits = points.map((p, i) => `<rect class="hit" x="${x(i) - band / 2}" y="${pad.t}" width="${band}" height="${ih}" data-cx="${x(i)}" data-cy="${y(p.value)}" data-tip="${esc(p.tip || `${p.label}: <b>${valueFmt(p.value)} ${unit}</b>`)}"/>`).join('');

  return `<div class="chart" data-kind="line">
    <svg viewBox="0 0 ${W} ${height}" role="img" aria-label="Liniendiagramm">
      <g class="grid">${grid}</g>
      <g class="axis">${yAxis}${labels}</g>
      <path class="area" d="${area}"/>
      <path class="line" d="${d}"/>
      <circle class="dot" cx="${x(points.length - 1)}" cy="${y(last.value)}" r="4.5"/>
      <text class="val" x="${x(points.length - 1) + 8}" y="${y(last.value) + 4}">${esc(valueFmt(last.value))}</text>
      <g class="hl" style="opacity:0"><line x1="0" x2="0" y1="${pad.t}" y2="${pad.t + ih}"/><circle cx="0" cy="0" r="5"/></g>
      <g>${hits}</g>
    </svg>
    <div class="chart-tip" hidden></div>
  </div>${table(points.map((p) => [p.label, `${valueFmt(p.value)} ${unit}`.trim()]), tableHead)}`;
}

export function bindCharts(root) {
  root.querySelectorAll('.chart').forEach((chart) => {
    if (chart.dataset.bound) return;
    chart.dataset.bound = '1';
    const svg = chart.querySelector('svg');
    const tip = chart.querySelector('.chart-tip');
    const hl = chart.querySelector('.hl');
    const bars = chart.querySelectorAll('.bar');
    const show = (el) => {
      const r = svg.getBoundingClientRect();
      const cr = chart.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const sx = r.width / vb.width;
      const sy = r.height / vb.height;
      const cx = +el.dataset.cx;
      const cy = +el.dataset.cy;
      tip.innerHTML = el.dataset.tip;
      tip.hidden = false;
      const tw = tip.offsetWidth;
      let px = r.left - cr.left + cx * sx;
      px = Math.max(tw / 2, Math.min(cr.width - tw / 2, px));
      tip.style.left = `${px}px`;
      tip.style.top = `${r.top - cr.top + cy * sy}px`;
      if (hl) {
        hl.style.opacity = 1;
        hl.querySelector('line').setAttribute('x1', cx);
        hl.querySelector('line').setAttribute('x2', cx);
        hl.querySelector('circle').setAttribute('cx', cx);
        hl.querySelector('circle').setAttribute('cy', cy);
      }
      if (bars.length) bars.forEach((b) => b.classList.toggle('dim', b.dataset.i !== el.dataset.i));
    };
    const hide = () => {
      tip.hidden = true;
      if (hl) hl.style.opacity = 0;
      bars.forEach((b) => b.classList.remove('dim'));
    };
    const onMove = (e) => {
      const el = e.target.closest('[data-tip]');
      if (el) show(el);
    };
    chart.addEventListener('pointermove', onMove);
    chart.addEventListener('pointerdown', onMove);
    chart.addEventListener('pointerleave', hide);
  });
}
