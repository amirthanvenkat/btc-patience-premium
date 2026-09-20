// Indicators and strategy simulation. Pure functions, no dependencies.
// The same code powers the live signal panel and every table on the page.

const DAY = 86400000;

/* ---------------- primitives ---------------- */

export function rma(v, n) {
  const o = new Array(v.length).fill(null);
  let s = 0;
  for (let i = 0; i < v.length; i++) {
    if (i < n) { s += v[i]; if (i === n - 1) o[i] = s / n; }
    else o[i] = (o[i - 1] * (n - 1) + v[i]) / n;
  }
  return o;
}

export function rsi(closes, n = 14) {
  const g = [0], l = [0];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    g.push(Math.max(d, 0)); l.push(Math.max(-d, 0));
  }
  const ag = rma(g, n), al = rma(l, n);
  return closes.map((_, i) => ag[i] === null ? null : al[i] === 0 ? 100 : 100 - 100 / (1 + ag[i] / al[i]));
}

export function williamsR(highs, lows, closes, n = 14) {
  return closes.map((c, i) => {
    if (i < n - 1) return null;
    let hh = -Infinity, ll = Infinity;
    for (let j = i - n + 1; j <= i; j++) { if (highs[j] > hh) hh = highs[j]; if (lows[j] < ll) ll = lows[j]; }
    return hh === ll ? -50 : -100 * (hh - c) / (hh - ll);
  });
}

export function wma(v, n) {
  const o = new Array(v.length).fill(null);
  const d = n * (n + 1) / 2;
  for (let i = n - 1; i < v.length; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += v[i - j] * (n - j);
    o[i] = s / d;
  }
  return o;
}

export function toWeekly(daily) {
  const m = new Map();
  for (const b of daily) {
    const dow = (new Date(b.t).getUTCDay() + 6) % 7;      // Monday = 0
    const k = b.t - dow * DAY;
    const key = new Date(k).toISOString().slice(0, 10);
    if (!m.has(key)) m.set(key, { date: key, t: k, o: b.o, h: b.h, l: b.l, c: b.c });
    else { const w = m.get(key); w.h = Math.max(w.h, b.h); w.l = Math.min(w.l, b.l); w.c = b.c; }
  }
  return [...m.values()].sort((a, b) => a.t - b.t);
}

/* ---------------- configuration ---------------- */

export const CFG = {
  rsiLen: 14, wprLen: 14, wmaLen: 100,
  buyRsi: 30, buyWpr: -80, buyOrder: 'either', buyWin: 8,
  sellMode: 'confluence',
  sellRsi: 90, sellWpr: -10, sellOrder: 'sim', sellWin: 8,
  // failed-high exit
  fhPivot: 6, fhRefRsi: 65, fhMinGap: 20, fhMaxGap: 40, fhArm: 80, fhArmWin: 78,
  monthly: 1000,
};

// Three presets sitting at different points on the same trade-off:
// fewer, larger trades at one end and more, smaller ones at the other.
export const PRESETS = [
  { id: 'selective', label: 'Selective',
    blurb: 'Waits for the most extreme readings. Fewest trades, largest gains, deepest dips.',
    cfg: { buyRsi: 30, buyWpr: -80, buyOrder: 'either', buyWin: 8,
           sellRsi: 90, sellWpr: -10, sellOrder: 'sim', sellWin: 8 } },
  { id: 'sequential', label: 'Sequential',
    blurb: 'Requires RSI to hit its extreme first and Williams %R to follow, rather than both together.',
    cfg: { buyRsi: 30, buyWpr: -85, buyOrder: 'rw', buyWin: 26,
           sellRsi: 88, sellWpr: -5, sellOrder: 'sim', sellWin: 8 } },
  { id: 'active', label: 'More active',
    blurb: 'Looser thresholds on both sides. More trades, still months long, noticeably smaller returns.',
    cfg: { buyRsi: 35, buyWpr: -70, buyOrder: 'rw', buyWin: 26,
           sellRsi: 78, sellWpr: -5, sellOrder: 'either', sellWin: 4 } },
  { id: 'failedhigh', label: 'Failed high',
    blurb: 'Exits when price makes a new high but RSI does not, having been overheated beforehand. Three completed trades, and the only preset that has closed the 2022 position.',
    cfg: { buyRsi: 30, buyWpr: -80, buyOrder: 'either', buyWin: 8,
           sellMode: 'failedHigh',
           fhPivot: 6, fhRefRsi: 65, fhMinGap: 20, fhMaxGap: 40, fhArm: 80, fhArmWin: 78 } },
];

// Combine two conditions under one of four timing rules.
//   sim    both true in the same week
//   rw     condition A (RSI) fired earlier, B (%R) fires now
//   wr     condition B (%R) fired earlier, A (RSI) fires now
//   either both true within `win` weeks, in any order
export function combine(A, B, order, win) {
  const n = A.length;
  const out = new Array(n).fill(false);
  let lastA = -1e9, lastB = -1e9;
  for (let i = 0; i < n; i++) {
    // `prev*` excludes the current week, which the ordered modes need so that
    // "first" genuinely means an earlier week. `last*` includes it, so `either`
    // still counts a week where both legs happen at once.
    const prevA = lastA, prevB = lastB;
    if (A[i]) lastA = i;
    if (B[i]) lastB = i;
    if (order === 'sim') out[i] = A[i] && B[i];
    else if (order === 'rw') out[i] = B[i] && i - prevA >= 1 && i - prevA <= win;
    else if (order === 'wr') out[i] = A[i] && i - prevB >= 1 && i - prevB <= win;
    else out[i] = (i - lastA <= win) && (i - lastB <= win);
  }
  return out;
}

// "RSI hit an extreme, then failed to make a new high while price did."
// A price peak is only confirmable `pivot` weeks after it forms, so the signal fires
// there rather than on the peak itself. Nothing here uses future information.
export function failedHigh(W, C, R, o) {
  const n = C.length;
  const peaks = [];
  for (let i = o.fhPivot; i < n - o.fhPivot; i++) {
    let isPeak = true;
    for (let j = i - o.fhPivot; j <= i + o.fhPivot; j++) if (j !== i && C[j] >= C[i]) { isPeak = false; break; }
    if (isPeak && R[i] !== null) peaks.push({ i, px: C[i], r: R[i] });
  }

  const signal = new Array(n).fill(false);
  const meta = new Map();
  for (let k = 1; k < peaks.length; k++) {
    const cur = peaks[k];
    for (let j = k - 1; j >= 0; j--) {
      const prev = peaks[j];
      if (prev.r < o.fhRefRsi) continue;          // the earlier peak must itself have been strong
      const gap = cur.i - prev.i;
      if (gap < o.fhMinGap || gap > o.fhMaxGap) break;
      if (cur.px > prev.px && cur.r < prev.r) {   // price higher, momentum lower
        let armed = false;
        for (let a = Math.max(0, cur.i - o.fhArmWin); a <= cur.i; a++) {
          if (R[a] !== null && R[a] > o.fhArm) { armed = true; break; }
        }
        if (armed) {
          const fire = Math.min(cur.i + o.fhPivot, n - 1);
          signal[fire] = true;
          meta.set(fire, { peakDate: W[cur.i].date, peakPx: cur.px, peakRsi: cur.r,
                           refDate: W[prev.i].date, refRsi: prev.r });
        }
      }
      break;
    }
  }
  return { signal, meta };
}

export function computeWeekly(daily, cfg = {}) {
  const o = { ...CFG, ...cfg };
  const W = toWeekly(daily);
  const H = W.map(b => b.h), L = W.map(b => b.l), C = W.map(b => b.c);
  const r = rsi(C, o.rsiLen);
  const pr = williamsR(H, L, C, o.wprLen);
  const wm = wma(C, o.wmaLen);

  const rsiLow = r.map(x => x !== null && x < o.buyRsi);
  const wprLow = pr.map(x => x !== null && x < o.buyWpr);
  const rsiHigh = r.map(x => x !== null && x > o.sellRsi);
  const wprHigh = pr.map(x => x !== null && x > o.sellWpr);

  const buySignal = combine(rsiLow, wprLow, o.buyOrder, o.buyWin);
  let sellSignal, sellMeta = new Map();
  if (o.sellMode === 'failedHigh') {
    const fh = failedHigh(W, C, r, o);
    sellSignal = fh.signal; sellMeta = fh.meta;
  } else {
    sellSignal = combine(rsiHigh, wprHigh, o.sellOrder, o.sellWin);
  }

  return { cfg: o, W, C, H, L, rsi: r, wpr: pr, wma: wm,
           rsiLow, wprLow, rsiHigh, wprHigh, buySignal, sellSignal, sellMeta };
}

// Collapse a run of true bars into episodes separated by at least `gap` weeks.
function episodeStarts(flags, gap = 26) {
  const out = [];
  let prev = -1e9;
  for (let i = 0; i < flags.length; i++) {
    if (!flags[i]) continue;
    if (i - prev > gap) out.push(i);
    prev = i;
  }
  return out;
}

// Do the two indicators actually reach their extremes at the same time?
// For each RSI episode, find the closest %R episode and measure the offset in weeks.
export function leadLag(S, side = 'top', gap = 26, maxOffset = 52) {
  const { W } = S;
  const a = side === 'top' ? S.rsiHigh : S.rsiLow;
  const b = side === 'top' ? S.wprHigh : S.wprLow;
  const rE = episodeStarts(a, gap), wE = episodeStarts(b, gap);
  const rows = [];
  for (const ri of rE) {
    let best = null;
    for (const wi of wE) if (best === null || Math.abs(wi - ri) < Math.abs(best - ri)) best = wi;
    if (best === null || Math.abs(best - ri) > maxOffset) continue;
    rows.push({ rsiDate: W[ri].date, wprDate: W[best].date, offset: best - ri });
  }
  const same = rows.filter(x => x.offset === 0).length;
  const wprFirst = rows.filter(x => x.offset < 0).length;
  const rsiFirst = rows.filter(x => x.offset > 0).length;
  const mean = rows.length ? rows.reduce((s, x) => s + x.offset, 0) / rows.length : 0;
  return { rows, same, wprFirst, rsiFirst, mean, rsiEpisodes: rE.length, wprEpisodes: wE.length };
}

/* ---------------- simulation ---------------- */

const isMonthStart = (W, i) => i === 0 || W[i].date.slice(0, 7) !== W[i - 1].date.slice(0, 7);

function stats(name, note, W, C, curve, contributed, coins, cash, trades, openFrom) {
  const final = cash + coins * C[C.length - 1];
  let peak = -Infinity, mdd = 0;
  for (const v of curve) { if (v > peak) peak = v; if (peak > 0) mdd = Math.max(mdd, (peak - v) / peak); }
  return {
    name, note, final, contributed, multiple: contributed ? final / contributed : 0,
    maxDD: mdd * 100, trades, coins, cash, openFrom, curve,
    cashPct: final > 0 ? (cash / final) * 100 : 0,
  };
}

// buyMode: 'signal' = only on the confluence, 'always' = every month.
export function simulate(S, { buyMode = 'signal', sell = true, monthly = CFG.monthly,
                              sellArr = null, name, note } = {}) {
  const { W, C, buySignal } = S;
  const sells = sellArr || S.sellSignal;
  let coins = 0, cash = 0, contributed = 0, units = 0, avgCost = 0, entry = null, entryI = null;
  const curve = [], paidCurve = [], trades = [];

  for (let i = 0; i < W.length; i++) {
    const px = C[i];
    if (isMonthStart(W, i)) { cash += monthly; contributed += monthly; }
    const wantBuy = buyMode === 'always' ? true : buySignal[i];
    if (wantBuy && cash > 0) {
      const u = cash / px;
      avgCost = (avgCost * units + cash) / (units + u);
      units += u; coins += u; cash = 0;
      if (entry === null) { entry = W[i].date; entryI = i; }
    }
    if (sell && sells[i] && coins > 0) {
      const m = S.sellMeta ? S.sellMeta.get(i) : null;
      trades.push({ entry, exit: W[i].date, avgCost, exitPx: px,
                    ret: (px / avgCost - 1) * 100, weeks: i - entryI,
                    peakDate: m ? m.peakDate : null, peakPx: m ? m.peakPx : null });
      cash += coins * px; coins = 0; units = 0; avgCost = 0; entry = null; entryI = null;
    }
    curve.push(cash + coins * px);
    paidCurve.push(contributed);
  }

  const defName = buyMode === 'always'
    ? (sell ? 'Buy every month, sell on the signal' : 'Buy every month, never sell')
    : (sell ? 'Buy the signal, sell the signal' : 'Buy the signal, never sell');
  const defNote = buyMode === 'always'
    ? (sell ? 'Invests every month and exits when the sell conditions line up.'
            : 'Invests every month and holds throughout.')
    : (sell ? 'Saves monthly, invests only when both buy conditions line up, and exits on the sell conditions.'
            : 'Saves monthly, invests only when both buy conditions line up, and holds.');
  const out = stats(name || defName, note || defNote, W, C, curve, contributed, coins, cash, trades, entry);
  out.paidCurve = paidCurve;
  return out;
}

export function buyHold(S, amount = 10000) {
  const { W, C } = S;
  const coins = amount / C[0];
  return stats('One lump sum, held', 'A single purchase at the start, never touched.',
    W, C, C.map(c => coins * c), amount, coins, 0, [], W[0].date);
}

export function runAll(S) {
  return [
    simulate(S, { buyMode: 'signal', sell: true }),
    simulate(S, { buyMode: 'signal', sell: false }),
    simulate(S, { buyMode: 'always', sell: true }),
    simulate(S, { buyMode: 'always', sell: false }),
  ];
}

// How the result changes with the sell RSI threshold, holding everything else fixed.
export function thresholdSweep(S, levels = [81, 85, 88, 90, 92]) {
  return levels.map(th => {
    const arr = S.C.map((_, i) => S.rsi[i] !== null && S.rsi[i] > th && S.wpr[i] !== null && S.wpr[i] > S.cfg.sellWpr);
    const r = simulate(S, { buyMode: 'signal', sell: true, sellArr: arr, name: 'x', note: '' });
    return { level: th, final: r.final, multiple: r.multiple, maxDD: r.maxDD, sells: r.trades.length,
             weeks: arr.filter(Boolean).length };
  });
}

// Contiguous stretches where the buy signal was active.
export function buyEpisodes(S) {
  const { W, C, buySignal } = S;
  const out = [];
  let start = null, lo = Infinity, loI = null;
  for (let i = 0; i < W.length; i++) {
    if (buySignal[i]) {
      if (start === null) { start = i; lo = C[i]; loI = i; }
      else if (C[i] < lo) { lo = C[i]; loI = i; }
    } else if (start !== null) { out.push({ s: start, e: i - 1, lo, loI }); start = null; lo = Infinity; }
  }
  if (start !== null) out.push({ s: start, e: W.length - 1, lo, loI, open: true });

  return out.map((w, k) => {
    let units = 0, spend = 0;
    for (let i = w.s; i <= w.e; i++) { units += 100 / C[i]; spend += 100; }
    const avg = spend / units;
    const next = k + 1 < out.length ? out[k + 1].s : W.length - 1;
    let peak = -Infinity, pi = w.e;
    for (let i = w.e; i <= next; i++) if (C[i] > peak) { peak = C[i]; pi = i; }
    return {
      from: W[w.s].date, to: w.open ? null : W[w.e].date, weeks: w.e - w.s + 1,
      low: w.lo, lowDate: W[w.loI].date, avgIn: avg,
      peak, peakDate: W[pi].date, gain: (peak / avg - 1) * 100,
      open: !!w.open, current: w.open ? (C[C.length - 1] / avg - 1) * 100 : null,
    };
  });
}
