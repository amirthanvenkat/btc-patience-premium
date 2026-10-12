# The Patience Premium

**Live: [amirthanvenkat.github.io/btc-patience-premium](https://amirthanvenkat.github.io/btc-patience-premium/)**

A single page walking a complete beginner through what the last two Bitcoin market cycles actually show
about buying, waiting and selling. No build step, no dependencies, no backend. Every figure is calculated in
the browser from public price data, so the page is always current and anything it shows can be checked
against the code.

> **Version 1.** Planned next: user-editable settings rather than fixed presets, and results measured from
> different starting years.

> Educational material, not financial advice. No recommendation to buy, sell or hold is made or implied,
> and the author is not a licensed financial adviser.

---

## The window: December 2017 to today

Every result on the page is measured from the week of the **December 2017 peak** (2017-12-11) onward.
Price data goes back to 2012, and the indicators are still computed on all of it so they are warmed up, but
the backtest and the statistics only count the window.

**Why not the full history.** From 2012 a monthly saver ended with roughly 1,000x, because the early
purchases were made at $5 to $500. That cannot repeat at today's market size, and each cycle has returned
less than the one before. The last two cycles give a more believable scale.

**Why the 2017 peak rather than the 2018 low.** The low is the obvious place to start a cycle, and it is the
wrong place to start a backtest. The simulation begins with no savings, and the week of the December 2018
low is itself a buy signal, so a rule that waits for signals walks into the best entry of the period holding
one month of cash. Starting a year earlier lets savings build first, which is what a real saver would have
had. It also puts the whole 2018 bear market inside the window.

| Window starts | Selective | Sequential | More active | Failed high | Monthly, never sell |
|---|---|---|---|---|---|
| **2017-12-11 (peak, shipped)** | **7.3x** | **11.6x** | **6.7x** | **15.6x** | **5.1x** |
| 2018-12-10 (low) | 2.9x | 4.0x | 3.9x | 4.6x | 4.5x |
| 2020-01-06 | 2.3x | 2.4x | 1.8x | 3.2x | 2.9x |

Read that table as a warning as much as a result. Plain monthly buying barely notices the start date. The
signal presets swing threefold on it, purely from how much cash happened to be on hand when the signal
arrived.

**All figures below are a snapshot taken 2026-10-12, weekly series through 2026-10-05, with Bitcoin at
$83,679. The live page recomputes from current data and will differ.**

## The headline findings

| Finding | Figure |
|---|---|
| Share of weeks followed by a higher price **three years** later | **99%** (305 weeks) |
| Buying $1,000 monthly since the 2017 peak and never selling | **5.1x** ($107,000 → $548,998) |
| Buying signals so far followed by a higher price | **3 of 3** |

Holding period mattered more than entry timing:

| Held for | Price higher afterwards |
|---|---|
| 1 year | 64% |
| 2 years | 76% |
| 3 years | 99% |
| 4 years | 100% |

**Read the four year figure carefully.** It comes from a single asset over a single nine year run in which
the price went from $18,953 to $83,679. It describes what happened rather than what must happen, and the page
says so directly underneath the chart. The nearer horizons are the more informative ones: in roughly one
week out of three, a buyer was still behind twelve months later.

**The simplest approach held its own.** Buying the same amount every month and never selling returned 5.1x
with nothing to decide. In this window the signal presets ended with more and with smaller dips (35% to 50%
against 73%), but on one to three trades each and with the start-date sensitivity shown above. A $10,000
lump sum bought on the 2017 peak itself is worth $44,151.

## The rule

Monthly savings accumulate as cash and go in when the buy signal appears, so purchases land in the weakest
stretches rather than being spread evenly.

| Preset | Buy | Sell | Timing |
|---|---|---|---|
| **Selective** | RSI < 30 | RSI > 90 and %R > −10 | RSI alone on the buy side, sell same week |
| **Sequential** | RSI < 30 and %R < −85, staggered | RSI > 88 and %R > −5 | either leg first, the other within 26 weeks |
| **More active** | RSI < 35 and %R < −70, staggered | RSI > 78 and %R > −5 | looser on both sides |
| **Failed high** | RSI < 30 | price makes a new high, RSI does not | RSI alone on the buy side, exit below |

### What "sequential" means

The two indicators rarely reach their extremes in the same week, so the Sequential and More active presets
wait for them to arrive **staggered**: one leg hits its extreme, and the signal fires when the other follows
within the window. Crucially this works **in either direction**. RSI leading %R counts, and %R leading RSI
counts equally. An earlier version of this project only accepted RSI-leading, which silently discarded every
%R-led entry, including the February 2026 bottom.

### The failed-high exit

RSI must first run hot (above 80 within the previous 78 weeks). After that, the exit fires when price puts in
a new peak **above** the previous one while RSI puts in a peak **below** its previous one, with the two peaks
20 to 40 weeks apart. It lands on the two turns you would want:

| Peak identified | Peak price | Sold | Sale price |
|---|---|---|---|
| 2021-11-08 | $65,510 | 2021-12-20 | $50,791 |
| 2025-07-21 | $119,469 | 2025-09-01 | $111,144 |

**A peak can only be identified after it has passed.** The rule waits six weeks to confirm one, so the sale
always happens below the top. That lag is the price of the pattern and it is included in every figure here,
because pretending you could sell on the peak week would be using information that did not exist yet.

## Results

461 weeks, 2017-12-11 to 2026-10-05, paying in $1,000 a month ($107,000 in total).

| Preset | Sells | Median hold | Ended with | Multiple | Worst dip | Position now |
|---|---|---|---|---|---|---|
| Selective | 1 | 25 mo | $782,984 | 7.3x | 50% | held since 2022-06 |
| Sequential | 2 | 23 mo | $1,243,590 | 11.6x | **35%** | held since 2026-02 |
| More active | 3 | 11 mo | $719,964 | 6.7x | 45% | held since 2026-01 |
| Failed high | 2 | 38 mo | $1,667,315 | **15.6x** | 41% | held since 2026-02 |
| Monthly, never sell | 0 | n/a | $548,998 | 5.1x | 73% | always held |

Every trade under all four lasted months rather than weeks. There is no tidy ordering by trade count here:
the one-trade and three-trade presets finished close together and the two-trade ones finished ahead. With
this few trades that says more about where the market tops happened to fall than about the rules.

## Are both indicators actually needed?

Not equally.

**On the buy side %R never changes which lows are caught.** Weekly RSI closed below 30 in only 11 weeks of
the window, in three clusters (December 2018, June 2022, February 2026), and Williams %R was below −80
nearby every time. What %R does is hold the buying window open longer, so more monthly contributions land
while the price is still low:

| Window opened | With %R | RSI only |
|---|---|---|
| 2018-12-10 | 9 weeks | 1 week |
| 2022-06-13 | 13 weeks | 5 weeks |
| 2026-02-02 | 13 weeks | 5 weeks |

**Selective and Failed high buy on RSI alone.** The entry dates are unchanged, so the second condition was
dropped in favour of a rule that is simpler to state. It costs about a tenth of the return in this window:
Selective 8.0x → **7.3x**, Failed high 17.3x → **15.6x**.

**Sequential and More active keep it**, because for them it is structural: the `seq` mode is defined as the
two readings arriving in different weeks, and a staggered sequence needs two legs to stagger. Removing it
takes Sequential from 11.6x to 10.9x.

**On the sell side it binds.** Dropping the %R requirement takes Selective from 7.3x to 6.3x.

## Does lowering the thresholds help?

No. Measured on the presets as shipped, with the shipped level in bold.

| Buy RSI | Selective | Sequential |
|---|---|---|
| 20 or 25 | no signals at all | no signals at all |
| **30** | **7.3x** | **11.6x** |
| 35 | 6.8x | 9.6x |
| 40 | 5.2x | 6.5x |

| Sell RSI | Selective | Sequential |
|---|---|---|
| 75 | 2.1x | 2.2x |
| 80 | 3.4x | 6.7x |
| 85 | 5.3x | 9.4x |
| 88 | 7.2x | **11.6x** |
| **90** | **7.3x** | never sells |
| 92 | 7.3x | never sells |
| 95 | never sells | never sells |

Each preset carries its own %R sell level, so the two columns are not directly comparable; only the RSI
level changes down each one. Selling early is the expensive mistake: at 75 both presets give up most of
their return. Above 88 the sell side becomes fragile instead, because weekly RSI has rarely reached those
levels since 2017, and a rule that never fires is just holding.

These thresholds were chosen on the full history from 2012, where 163,840 combinations were searched. The
best cell there was a spike rather than a plateau, with only 19% of its neighbours reaching half its return,
which is the signature of a result fitted to one particular history. Nothing was retuned for this window.

## Do the two indicators peak together?

No. This one comparison is measured on the **full history from 2012**, because two cycles hold too few
extremes to show it.

| Side | Same week | %R first | RSI first | Average gap |
|---|---|---|---|---|
| Tops | 0 | 2 | 0 | 26 weeks |
| Bottoms | 0 | 2 | 1 | 4 weeks |

**They never arrive in the same week.** At tops Williams %R got there first every time, on average about six
months ahead of RSI. At bottoms the order was mixed. The two runs do overlap later, which is why a same-week
rule still finds anything at all, but the onsets are clearly staggered.

## Reading it fairly

- One to three completed trades depending on preset. That is a very small sample, and small samples flatter
  backtests.
- The window was chosen after seeing the data, and the start date moves the signal results threefold. The
  monthly-buying and holding-period figures are the ones that depend on it least.
- The thresholds were fitted on the longer history that includes this window, so this is not an
  out-of-sample test.
- The lead and lag finding rests on five matched pairs. It is suggestive, not established.
- Long gaps between signals mean cash can sit uninvested for years, which is difficult to stick with.
- Trading costs, spreads and tax are excluded and reduce real world results.

## Data

| Source | Role |
|---|---|
| Bitstamp `/api/v2/ohlc/btcusd` | Primary, daily back to 2012 (the years before the window warm up the indicators) |
| Binance `/api/v3/klines` | Fallback |
| Coinbase `/products/BTC-USD/candles` | Fallback |

All three send `Access-Control-Allow-Origin: *`, so the page runs as static hosting. Daily bars are
aggregated into Monday-start weeks and the in-progress day is dropped. The series is cached in
`localStorage` for the rest of the UTC day, so repeat visits render immediately instead of refetching.

## Files

| File | Purpose |
|---|---|
| `index.html` | Structure, styling, glossary and written explanation |
| `engine.js` | RSI, Williams %R, WMA, weekly aggregation, the window trim, signal logic, simulation and the threshold sweep |
| `chart.js` | Log-scale SVG price and equity charts, drawn without a charting library |
| `data.js` | Multi-source fetching, fallbacks and the day cache |
| `app.js` | Rendering; every number shown is derived from computed results |
| `social-card.png` | Open Graph preview image, 1200x630 |
| `icon.svg` | Favicon |

## Running locally

ES modules, so serve rather than opening `file://`:

```bash
python3 -m http.server 8000
```

## Licence

MIT, see `LICENSE`.
