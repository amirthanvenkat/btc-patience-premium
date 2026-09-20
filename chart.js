// Inline SVG price chart on a log scale, with buy signals shaded and sell signals marked.
// No libraries: the whole thing is a string of SVG.

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export function priceChart(S, { w = 900, h = 340, pad = { l: 52, r: 12, t: 14, b: 26 } } = {}) {
  const { W, C, wma, buySignal, sellSignal } = S;
  const n = W.length;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;

  const vals = C.filter(v => v > 0);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const yl = Math.log10(lo), yh = Math.log10(hi);
  const X = i => pad.l + (i / (n - 1)) * iw;
  const Y = v => pad.t + ih - ((Math.log10(v) - yl) / (yh - yl)) * ih;

  // shaded buy stretches (widened to at least 2px so single weeks stay visible)
  let bands = '', s = null;
  const band = (a, b, cls) => {
    const x = X(a), wid = Math.max(2.5, X(b) - X(a));
    bands += `<rect x="${x.toFixed(1)}" y="${pad.t}" width="${wid.toFixed(1)}" height="${ih}" class="${cls}"/>`;
  };
  for (let i = 0; i < n; i++) {
    if (buySignal[i] && s === null) s = i;
    else if (!buySignal[i] && s !== null) { band(s, i, 'band'); s = null; }
  }
  if (s !== null) band(s, n - 1, 'band band-open');

  const path = (arr, cls) => {
    let d = '', pen = false;
    for (let i = 0; i < n; i++) {
      const v = arr[i];
      if (v === null || !isFinite(v) || v <= 0) { pen = false; continue; }
      d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) + ' ';
      pen = true;
    }
    return `<path d="${d.trim()}" class="${cls}"/>`;
  };

  let grid = '';
  for (let p = Math.ceil(yl); p <= Math.floor(yh); p++) {
    const v = 10 ** p, y = Y(v).toFixed(1);
    grid += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" class="grid"/>`
         +  `<text x="${pad.l - 7}" y="${+y + 3.5}" class="ylab">$${v >= 1000 ? (v / 1000) + 'k' : v}</text>`;
  }

  let xlab = '', lastYear = null;
  for (let i = 0; i < n; i++) {
    const yr = W[i].date.slice(0, 4);
    if (yr !== lastYear) {
      if ((+yr) % 2 === 0) xlab += `<text x="${X(i).toFixed(1)}" y="${h - 8}" class="xlab">${yr}</text>`;
      lastYear = yr;
    }
  }

  let marks = '';
  for (let i = 0; i < n; i++) {
    if (sellSignal[i]) {
      marks += `<line x1="${X(i).toFixed(1)}" y1="${pad.t}" x2="${X(i).toFixed(1)}" y2="${pad.t + ih}" class="sellline"/>`
            +  `<circle cx="${X(i).toFixed(1)}" cy="${Y(C[i]).toFixed(1)}" r="4" class="sell"/>`;
    }
  }

  return `
<svg viewBox="0 0 ${w} ${h}" class="chart" role="img"
     aria-label="Bitcoin weekly price on a log scale from ${esc(W[0].date)} to ${esc(W[n - 1].date)}, with buy signals shaded and sell signals marked">
  <g>${grid}</g>
  <g>${bands}</g>
  ${path(wma, 'wma')}
  ${path(C, 'price')}
  <g>${marks}</g>
  <circle cx="${X(n - 1).toFixed(1)}" cy="${Y(C[n - 1]).toFixed(1)}" r="3.5" class="now"/>
  <g>${xlab}</g>
</svg>`;
}

// Equity over time on a log scale: what the money did, against what was paid in.
// Log scale because the growth spans several orders of magnitude and a linear
// axis would hide everything before the final year.
export function equityChart(W, curve, paidCurve, { w = 900, h = 260,
                            pad = { l: 58, r: 12, t: 14, b: 26 } } = {}) {
  const n = W.length;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const all = [...curve, ...paidCurve].filter(v => v > 0);
  if (!all.length) return '';
  const lo = Math.min(...all), hi = Math.max(...all);
  const yl = Math.log10(lo), yh = Math.log10(hi) || 1;
  const X = i => pad.l + (i / (n - 1)) * iw;
  const Y = v => pad.t + ih - ((Math.log10(Math.max(v, lo)) - yl) / ((yh - yl) || 1)) * ih;

  const path = (arr, cls) => {
    let d = '', pen = false;
    for (let i = 0; i < n; i++) {
      const v = arr[i];
      if (!(v > 0)) { pen = false; continue; }
      d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) + ' ';
      pen = true;
    }
    return `<path d="${d.trim()}" class="${cls}"/>`;
  };

  let grid = '';
  for (let p = Math.ceil(yl); p <= Math.floor(yh); p++) {
    const v = 10 ** p, y = Y(v).toFixed(1);
    const lab = v >= 1e6 ? '$' + (v / 1e6) + 'm' : v >= 1e3 ? '$' + (v / 1e3) + 'k' : '$' + v;
    grid += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" class="grid"/>`
         +  `<text x="${pad.l - 7}" y="${+y + 3.5}" class="ylab">${lab}</text>`;
  }
  let xlab = '', lastYear = null;
  for (let i = 0; i < n; i++) {
    const yr = W[i].date.slice(0, 4);
    if (yr !== lastYear) {
      if ((+yr) % 2 === 0) xlab += `<text x="${X(i).toFixed(1)}" y="${h - 8}" class="xlab">${yr}</text>`;
      lastYear = yr;
    }
  }
  const endV = curve[n - 1], endP = paidCurve[n - 1];
  return `
<svg viewBox="0 0 ${w} ${h}" class="chart eq" role="img"
     aria-label="Portfolio value against total money paid in, on a logarithmic scale, from ${W[0].date} to ${W[n - 1].date}. Ended at ${Math.round(endV).toLocaleString()} dollars from ${Math.round(endP).toLocaleString()} dollars paid in.">
  <g>${grid}</g>
  ${path(paidCurve, 'paid')}
  ${path(curve, 'equity')}
  <circle cx="${X(n - 1).toFixed(1)}" cy="${Y(endV).toFixed(1)}" r="3.5" class="now"/>
  <g>${xlab}</g>
</svg>`;
}
