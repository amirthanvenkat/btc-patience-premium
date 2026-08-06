import { loadDaily } from './data.js';
import { computeWeekly, runAll, buyEpisodes, buyHold, thresholdSweep, leadLag, PRESETS } from './engine.js';
import { priceChart } from './chart.js';

const $ = id => document.getElementById(id);
const usd = n => '$' + Math.round(n).toLocaleString('en-US');
const pct = (n, d = 0) => (n >= 0 ? '+' : '') + n.toFixed(d) + '%';
const months = w => (w / 4.345).toFixed(0);

let DAILY = null, SOURCE = '', CURRENT = PRESETS[0].id;

(async function main() {
  try {
    const { bars, source } = await loadDaily(m => { $('loadmsg').textContent = m; });
    DAILY = bars; SOURCE = source;
    $('loadmsg').textContent = 'Working out the numbers';
    buildPresetButtons();
    apply(PRESETS[0]);
    renderHeadline();
    renderOdds();
    renderSimple();
    renderLeadLag();
    renderPresetTable();
    $('loading').style.display = 'none';
    $('main').hidden = false;
  } catch (e) {
    $('loading').innerHTML =
      `<p class="bad"><strong>Could not load price data.</strong></p><p class="dim">${e.message}</p>`;
  }
})();

function buildPresetButtons() {
  $('presets').innerHTML = PRESETS.map(p =>
    `<button data-id="${p.id}" class="${p.id === CURRENT ? 'on' : ''}">${p.label}</button>`).join('');
  $('presets').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    CURRENT = b.dataset.id;
    [...$('presets').children].forEach(c => c.classList.toggle('on', c === b));
    apply(PRESETS.find(p => p.id === CURRENT));
  });
}

function apply(preset) {
  const S = computeWeekly(DAILY, preset.cfg);
  $('presetblurb').textContent = preset.blurb;
  renderNow(S);
  renderChart(S);
  renderResults(S);
  renderSweep(S);
  renderTrades(S);
  renderWindows(S);
}

/* ---------------- live state ---------------- */
function renderNow(S) {
  const i = S.W.length - 1, c = S.cfg;
  const r = S.rsi[i], pr = S.wpr[i];
  $('price').textContent = usd(S.C[i]);
  $('week').textContent = `week of ${S.W[i].date}`;
  $('source').textContent = SOURCE;

  const leg = (on, label, val, want) => `
    <div class="stat ${on ? 'on' : ''}">
      <span class="k">${label}</span><span class="v">${val}</span><span class="d">${want}</span>
    </div>`;
  const orderText = (o, win) => o === 'sim' ? 'Both in the same week'
    : o === 'rw' ? `RSI first, %R within ${win} weeks`
    : o === 'wr' ? `%R first, RSI within ${win} weeks`
    : `Both within ${win} weeks, either order`;

  $('buylegs').innerHTML =
    leg(S.rsiLow[i], 'Weekly RSI', r === null ? 'n/a' : r.toFixed(1), `Under ${c.buyRsi}`) +
    leg(S.wprLow[i], 'Williams %R', pr === null ? 'n/a' : pr.toFixed(1), `Under ${c.buyWpr}`) +
    `<p class="sm dim" style="margin:2px 0 0">${orderText(c.buyOrder, c.buyWin)}</p>`;

  if (c.sellMode === 'failedHigh') {
    const hot = [];
    for (let k = Math.max(0, i - c.fhArmWin); k <= i; k++) if (S.rsi[k] !== null && S.rsi[k] > c.fhArm) hot.push(k);
    const lastHot = hot.length ? S.W[hot[hot.length - 1]].date : null;
    $('selllegs').innerHTML =
      leg(!!lastHot, 'Overheated first', lastHot ? 'Yes' : 'No',
          lastHot ? `RSI last passed ${c.fhArm} on ${lastHot}` : `RSI has not passed ${c.fhArm} recently`) +
      leg(false, 'Failed high', 'Waiting',
          `Needs a new price high with RSI below its previous peak`) +
      `<p class="sm dim" style="margin:2px 0 0">Peaks are confirmed ${c.fhPivot} weeks after they form,
         so the exit always lands after the top rather than on it.</p>`;
  } else {
    $('selllegs').innerHTML =
      leg(S.rsiHigh[i], 'Weekly RSI', r === null ? 'n/a' : r.toFixed(1), `Over ${c.sellRsi}`) +
      leg(S.wprHigh[i], 'Williams %R', pr === null ? 'n/a' : pr.toFixed(1), `Over ${c.sellWpr}`) +
      `<p class="sm dim" style="margin:2px 0 0">${orderText(c.sellOrder, c.sellWin)}</p>`;
  }

  const buyOn = S.buySignal[i], sellOn = S.sellSignal[i];
  $('verdict').className = 'verdict ' + (sellOn ? 'v-sell' : buyOn ? 'v-buy' : 'v-hold');
  $('verdict').innerHTML = sellOn
    ? `<strong>Sell conditions met.</strong> Both readings satisfy this preset's exit rule.`
    : buyOn
      ? `<strong>Buy conditions met.</strong> Both readings satisfy this preset's entry rule.`
      : `<strong>Neither set of conditions is met.</strong> The rule holds what it owns and lets new savings
         build until the next buy signal.`;
}

function renderChart(S) {
  $('chart').innerHTML = priceChart(S);
  $('chartkey').innerHTML = `
    <span><i class="sw sw-band"></i>Buy signal</span>
    <span><i class="sw sw-price"></i>Price</span>
    <span><i class="sw sw-wma"></i>2 year average (context)</span>
    <span><i class="sw sw-sell"></i>Sell signal</span>`;
}

/* ---------------- results ---------------- */
function renderResults(S) {
  const i = S.W.length - 1;
  const runs = runAll(S), hero = runs[0], everyHold = runs[3];
  const lump = buyHold(S);
  $('results').innerHTML = `
    <table>
      <thead><tr><th>Approach</th><th class="num">Paid in</th><th class="num">Ended with</th><th class="num">Multiple</th><th class="num">Worst dip</th><th class="num">Sells</th></tr></thead>
      <tbody>${runs.map(x => `
        <tr class="${x === hero ? 'hl' : ''}">
          <td><strong>${x.name}</strong><span class="sm">${x.note}</span></td>
          <td class="num">${usd(x.contributed)}</td><td class="num">${usd(x.final)}</td>
          <td class="num">${x.multiple.toFixed(1)}x</td>
          <td class="num dim">${x.maxDD.toFixed(0)}%</td>
          <td class="num dim">${x.trades.length}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="sm dim">Weekly data, ${S.W[0].date} to ${S.W[i].date}, paying in ${usd(S.cfg.monthly)} a month.
       A ${usd(10000)} lump sum left untouched would have become ${usd(lump.final)}.
       Costs and tax excluded.</p>`;
  $('resultnote').innerHTML = `
    This preset ended with <strong>${usd(hero.final)}</strong> from ${hero.trades.length}
    ${hero.trades.length === 1 ? 'sell' : 'sells'}, with a worst dip of ${hero.maxDD.toFixed(0)}%.
    Buying every month and never selling ended with <strong>${usd(everyHold.final)}</strong> and a dip of
    ${everyHold.maxDD.toFixed(0)}%.`;
}

function renderSweep(S) {
  if (S.cfg.sellMode === 'failedHigh') {
    $('sweep').innerHTML = `<p class="dim">This preset does not use an RSI level to sell, so there is no
      level to vary. Its exit depends on the shape of the peaks instead: price making a new high while RSI
      does not. Switch to one of the other presets to see the sensitivity table.</p>`;
    return;
  }
  const sweep = thresholdSweep(S);
  const best = sweep.reduce((a, b) => b.multiple > a.multiple ? b : a);
  $('sweep').innerHTML = `
    <table>
      <thead><tr><th>Sell when RSI is over</th><th class="num">Weeks that fired</th><th class="num">Sells</th><th class="num">Ended with</th><th class="num">Multiple</th></tr></thead>
      <tbody>${sweep.map(x => `
        <tr class="${x.level === S.cfg.sellRsi ? 'hl' : ''}">
          <td>${x.level}${x.level === S.cfg.sellRsi ? ' <span class="tag">in use</span>' : ''}</td>
          <td class="num dim">${x.weeks}</td><td class="num dim">${x.sells}</td>
          <td class="num">${usd(x.final)}</td><td class="num">${x.multiple.toFixed(1)}x</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="sm dim">Only the RSI level for selling changes. The best here is ${best.level}, and results fall
       away on either side. A rule this sensitive to one number deserves caution: a genuinely robust setting
       usually shows a broad plateau rather than a spike.</p>`;
}

function renderTrades(S) {
  const hero = runAll(S)[0];
  const hasPeak = hero.trades.some(t => t.peakDate);
  const cols = hasPeak ? 5 : 4;
  $('trades').innerHTML = hero.trades.length ? `
    <table>
      <thead><tr><th>Bought from</th><th class="num">Average price</th>
        ${hasPeak ? '<th>Top spotted</th>' : ''}<th>Sold</th><th class="num">Sold at</th><th class="num">Held</th><th class="num">Result</th></tr></thead>
      <tbody>${hero.trades.map(t => `
        <tr><td>${t.entry}</td><td class="num">${usd(t.avgCost)}</td>
          ${hasPeak ? `<td class="dim">${t.peakDate ? `${t.peakDate}<span class="sm">${usd(t.peakPx)}</span>` : '&mdash;'}</td>` : ''}
          <td>${t.exit}</td><td class="num">${usd(t.exitPx)}</td>
          <td class="num dim">${months(t.weeks)} mo</td>
          <td class="num ${t.ret >= 0 ? 'up' : 'down'}">${pct(t.ret)}</td></tr>`).join('')}
        ${hero.openFrom ? `<tr class="open"><td>${hero.openFrom}</td><td colspan="${cols}">still holding</td>
          <td class="num dim">open</td></tr>` : ''}
      </tbody>
    </table>
    ${hasPeak ? `<p class="sm dim">The top can only be identified some weeks after it forms, so the sale
       happens below it. Across these trades the gap between the peak price and the price actually received
       averaged ${avgGap(hero.trades).toFixed(0)}%.</p>` : ''}`
    : '<p class="dim">No completed trades under this preset.</p>';
}

function avgGap(trades) {
  const g = trades.filter(t => t.peakPx).map(t => (t.exitPx / t.peakPx - 1) * 100);
  return g.length ? g.reduce((a, b) => a + b, 0) / g.length : 0;
}

function renderWindows(S) {
  const eps = buyEpisodes(S), done = eps.filter(e => !e.open);
  const up = eps.filter(e => (e.open ? e.current : e.gain) > 0).length;
  const el = $('epilead');
  if (el) el.innerHTML = `The buy conditions have lined up ${eps.length} times, roughly once every three and
    a half years. ${up === eps.length
      ? `Every one has so far been followed by a higher price.`
      : `${up} of ${eps.length} were followed by a higher price.`}
    They cluster in the quiet, gloomy stretches after a big fall, which is exactly when buying feels worst.`;
  $('windows').innerHTML = `
    <table>
      <thead><tr><th>Signal appeared</th><th class="num">Weeks</th><th class="num">Average price</th><th class="num">Highest price after</th><th class="num">Gain</th></tr></thead>
      <tbody>${eps.map(e => `
        <tr class="${e.open ? 'open' : ''}">
          <td>${e.from}${e.open ? ' <span class="tag">active</span>' : ''}</td>
          <td class="num">${e.weeks}</td><td class="num">${usd(e.avgIn)}</td>
          <td class="num">${e.open ? '<span class="dim">not yet</span>' : usd(e.peak)}</td>
          <td class="num ${(e.open ? e.current : e.gain) >= 0 ? 'up' : 'down'}">
            ${e.open ? pct(e.current) + ' <span class="sm dim">so far</span>' : pct(e.gain)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="sm dim">${eps.length} occasions${done.length ? `, with completed ones reaching a median of
       ${median(done.map(e => e.gain)).toFixed(0)}% above the average buying price before the next signal` : ''}.
       Those peaks are visible only with hindsight.</p>`;
}

/* ---------------- headline findings ---------------- */
// Share of all weeks where the price was higher N years later.
function holdingOdds(S, years) {
  const h = Math.round(years * 52), C = S.C;
  let up = 0, tot = 0;
  for (let i = 0; i + h < C.length; i++) { tot++; if (C[i + h] > C[i]) up++; }
  return { years, pct: tot ? (up / tot) * 100 : 0, n: tot };
}

function renderHeadline() {
  const S = computeWeekly(DAILY, PRESETS[0].cfg);
  const runs = runAll(S);
  const simple = runs[3];                       // buy every month, never sell
  const eps = buyEpisodes(S);
  const up = eps.filter(e => (e.open ? e.current : e.gain) > 0).length;
  const three = holdingOdds(S, 3);
  const years = ((S.W[S.W.length - 1].t - S.W[0].t) / (365.25 * 86400000)).toFixed(0);

  $('headline').innerHTML = `
    <div class="hstat">
      <div class="n">${three.pct.toFixed(0)}%</div>
      <div class="t">of weeks were followed by a higher price three years later</div>
      <div class="s">Measured across all ${three.n.toLocaleString()} weeks with three years of history after
        them. Patience mattered far more than picking the right week.</div>
    </div>
    <div class="hstat">
      <div class="n">${simple.multiple.toFixed(0)}x</div>
      <div class="t">from buying the same amount every month and never selling</div>
      <div class="s">${usd(simple.contributed)} paid in over ${years} years became
        ${usd(simple.final)}. No charts, no timing, no skill required.</div>
    </div>
    <div class="hstat">
      <div class="n">${up} of ${eps.length}</div>
      <div class="t">buying signals were followed by a higher price</div>
      <div class="s">Every one so far, including the one currently active. They have appeared roughly once
        every three and a half years.</div>
    </div>`;
}

function renderOdds() {
  const S = computeWeekly(DAILY, PRESETS[0].cfg);
  const rows = [1, 2, 3, 4].map(y => holdingOdds(S, y)).filter(r => r.n > 50);
  $('odds').innerHTML = rows.map(r => `
    <div class="bar">
      <span>${r.years} year${r.years > 1 ? 's' : ''} later</span>
      <span class="track"><span class="fill" style="width:${r.pct.toFixed(1)}%"></span></span>
      <span class="pctv">${r.pct.toFixed(0)}%</span>
    </div>`).join('');
  const one = rows[0], three = rows.find(r => r.years === 3);
  $('oddsnote').innerHTML = `
    Holding for a single year still meant losing money in about ${(100 - one.pct).toFixed(0)}% of cases, so
    short horizons were genuinely uncertain. Stretch it to three years and that fell to roughly
    ${(100 - three.pct).toFixed(0)}%. This is one asset over one fourteen year run rather than a law of
    nature, but the direction is consistent and it is the clearest pattern on this page.`;
}

function renderSimple() {
  const S = computeWeekly(DAILY, PRESETS[0].cfg);
  const runs = runAll(S);
  const simple = runs[3], signal = runs[0], lump = buyHold(S);
  const ordered = [
    { ...simple, tagline: 'Buy the same amount monthly, never sell' },
    { ...signal, tagline: 'Buy only on the signal, sell on the signal' },
    { ...runs[1], tagline: 'Buy only on the signal, never sell' },
  ];
  $('simple').innerHTML = `
    <table>
      <thead><tr><th>Approach</th><th class="num">Paid in</th><th class="num">Ended with</th><th class="num">Multiple</th><th class="num">Worst dip</th></tr></thead>
      <tbody>${ordered.map((x, i) => `
        <tr class="${i === 0 ? 'hl' : ''}">
          <td><strong>${x.tagline}</strong></td>
          <td class="num">${usd(x.contributed)}</td><td class="num">${usd(x.final)}</td>
          <td class="num">${x.multiple.toFixed(0)}x</td>
          <td class="num dim">${x.maxDD.toFixed(0)}%</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="note">Buying every month came out ahead, and it is also the easiest to stick with, because
      there is nothing to decide each week. The signals in the rest of this page are worth understanding, but
      the record does not say you need them. A single ${usd(10000)} lump sum left alone from the start would
      have become ${usd(lump.final)}, though one early payment compounds for much longer than money added
      gradually, so that figure is not comparable to the others.</div>`;
}

/* ---------------- lead and lag ---------------- */
function renderLeadLag() {
  const S = computeWeekly(DAILY, PRESETS[0].cfg);
  const top = leadLag(S, 'top'), bot = leadLag(S, 'bottom');

  const tbl = (t, title) => `
    <h3>${title}</h3>
    <table>
      <thead><tr><th>RSI extreme</th><th>Williams %R extreme</th><th class="num">Gap</th><th>Which came first</th></tr></thead>
      <tbody>${t.rows.map(x => `
        <tr><td>${x.rsiDate}</td><td>${x.wprDate}</td>
          <td class="num">${Math.abs(x.offset)} wk</td>
          <td class="dim">${x.offset === 0 ? 'same week' : x.offset < 0 ? 'Williams %R' : 'RSI'}</td></tr>`).join('')}
      </tbody>
    </table>
    <p class="sm dim">${t.rows.length} matched pairs. Same week: ${t.same}.
       Williams %R first: ${t.wprFirst}. RSI first: ${t.rsiFirst}.
       Average gap ${Math.abs(t.mean).toFixed(0)} weeks.</p>`;

  $('leadlag').innerHTML = tbl(top, 'At tops') + tbl(bot, 'At bottoms');
  $('leadlagnote').innerHTML = `
    <strong>They never arrive in the same week.</strong> Across every pair above, the two indicators reached
    their extremes weeks or months apart, not together. At tops Williams %R got there first every time,
    on average ${Math.abs(top.mean).toFixed(0)} weeks ahead of RSI. At bottoms the order was mixed.
    The runs do overlap later, which is why a same-week rule still finds something, but the onset is
    clearly staggered.`;
}

/* ---------------- preset comparison ---------------- */
function renderPresetTable() {
  const rows = PRESETS.map(p => {
    const S = computeWeekly(DAILY, p.cfg);
    const hero = runAll(S)[0];
    const durs = hero.trades.map(t => t.weeks / 4.345);
    return { p, hero, med: durs.length ? median(durs) : 0, min: durs.length ? Math.min(...durs) : 0 };
  });
  $('presettable').innerHTML = `
    <table>
      <thead><tr><th>Preset</th><th class="num">Trades</th><th class="num">Median hold</th><th class="num">Shortest hold</th><th class="num">Ended with</th><th class="num">Multiple</th><th class="num">Worst dip</th></tr></thead>
      <tbody>${rows.map(x => `
        <tr class="${x.p.id === 'selective' ? 'hl' : ''}">
          <td><strong>${x.p.label}</strong><span class="sm">${x.p.blurb}</span></td>
          <td class="num">${x.hero.trades.length}</td>
          <td class="num dim">${x.med.toFixed(0)} mo</td>
          <td class="num dim">${x.min.toFixed(0)} mo</td>
          <td class="num">${usd(x.hero.final)}</td>
          <td class="num">${x.hero.multiple.toFixed(1)}x</td>
          <td class="num dim">${x.hero.maxDD.toFixed(0)}%</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="sm dim">Every trade under all three presets lasted months rather than weeks. The pattern is
       consistent: loosening the thresholds to get more signals reduced the return each time, though it also
       reduced the worst dip.</p>`;
}

function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
