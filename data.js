// Daily BTC/USD history from public APIs. No key, no backend.
// Primary: Bitstamp (back to 2012). Fallbacks: Binance, Coinbase.

const DAY = 86400000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function bitstamp(onProgress) {
  const out = [];
  let start = Math.floor(new Date('2012-01-01T00:00:00Z').getTime() / 1000);
  const nowS = Math.floor(Date.now() / 1000);
  for (let i = 0; i < 20 && start < nowS; i++) {
    onProgress?.(`Loading history… ${out.length.toLocaleString()} days`);
    const res = await fetch(`https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=1000&start=${start}`);
    if (!res.ok) throw new Error(`Bitstamp HTTP ${res.status}`);
    const rows = (await res.json())?.data?.ohlc ?? [];
    if (!rows.length) break;
    for (const r of rows) out.push({ t: +r.timestamp * 1000, o: +r.open, h: +r.high, l: +r.low, c: +r.close });
    const last = +rows[rows.length - 1].timestamp;
    if (last <= start) break;
    start = last + 86400;
    await sleep(120);
  }
  return { source: 'Bitstamp BTC/USD daily', bars: out };
}

async function binance(onProgress) {
  const out = [];
  let start = 0;
  for (let i = 0; i < 6; i++) {
    onProgress?.(`Loading history… ${out.length.toLocaleString()} days`);
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${start}&limit=1000`);
    if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
    const rows = await res.json();
    if (!rows.length) break;
    for (const r of rows) out.push({ t: r[0], o: +r[1], h: +r[2], l: +r[3], c: +r[4] });
    if (rows.length < 1000) break;
    start = rows[rows.length - 1][0] + 1;
    await sleep(120);
  }
  return { source: 'Binance BTCUSDT daily', bars: out };
}

async function coinbase(onProgress) {
  const out = [];
  let cur = new Date('2015-01-05T00:00:00Z');
  const end = new Date();
  while (cur < end) {
    onProgress?.(`Loading history… ${out.length.toLocaleString()} days`);
    const chunk = new Date(Math.min(cur.getTime() + 250 * DAY, end.getTime()));
    const res = await fetch(`https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=86400`
      + `&start=${cur.toISOString()}&end=${chunk.toISOString()}`);
    if (!res.ok) throw new Error(`Coinbase HTTP ${res.status}`);
    for (const r of await res.json()) out.push({ t: r[0] * 1000, l: r[1], h: r[2], o: r[3], c: r[4] });
    cur = chunk;
    await sleep(120);
  }
  return { source: 'Coinbase BTC-USD daily', bars: out };
}

// Cached for the rest of the UTC day. The series only gains one bar a day, so a
// repeat visit has nothing to gain from refetching and a lot to gain from not
// making six sequential requests before anything renders.
const CACHE_KEY = 'btc-daily-v1';

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (c.day !== new Date().toISOString().slice(0, 10)) return null;
    if (!Array.isArray(c.bars) || c.bars.length < 800) return null;
    return c;
  } catch { return null; }
}

function writeCache(bars, source) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      day: new Date().toISOString().slice(0, 10), bars, source,
    }));
  } catch { /* private mode, quota, or storage disabled: not worth failing over */ }
}

export async function loadDaily(onProgress) {
  const cached = readCache();
  if (cached) return { bars: cached.bars, source: cached.source + ' (cached today)' };

  let got, errs = [];
  for (const fn of [bitstamp, binance, coinbase]) {
    try {
      const r = await fn(onProgress);
      if (r.bars.length > 800) { got = r; break; }
      errs.push(`${r.source}: only ${r.bars.length} bars`);
    } catch (e) { errs.push(e.message); }
  }
  if (!got) throw new Error('All data sources failed: ' + errs.join('; '));

  const seen = new Set();
  const todayUTC = Math.floor(Date.now() / DAY) * DAY;
  const bars = got.bars
    .filter(b => b.c > 0 && b.t < todayUTC && (seen.has(b.t) ? false : (seen.add(b.t), true)))
    .sort((a, b) => a.t - b.t)
    .map(b => ({ ...b, date: new Date(b.t).toISOString().slice(0, 10) }));

  writeCache(bars, got.source);
  return { bars, source: got.source };
}
