# Bitcoin, Patiently

**Live: [amirthanvenkat.github.io/bitcoin-patiently](https://amirthanvenkat.github.io/bitcoin-patiently/)**

A single page walking a complete beginner through what fourteen years of weekly Bitcoin prices actually show
about buying, waiting and selling. No build step, no dependencies, no backend. Every figure is calculated in
the browser from public price data, so anything shown can be checked against the code.

> **Version 1.** First public release. Planned next: longer history from additional exchanges, user-editable
> settings rather than fixed presets, and results measured from different starting years.

> Educational material, not financial advice. No recommendation to buy, sell or hold is made or implied,
> and the author is not a licensed financial adviser.

## The headline findings

These lead the page because they held up best across the whole history, and because they need no parameter
tuning to be true.

| Finding | Figure |
|---|---|
| Share of all weeks followed by a higher price **three years** later | **99%** |
| Buying $1,000 monthly since 2012 and never selling | **799x** ($177,000 → $141.4m) |
| Buying signals so far followed by a higher price | **4 of 4** |

Holding period mattered more than entry timing:

| Held for | Price higher afterwards |
|---|---|
| 1 year | 72% |
| 2 years | 83% |
| 3 years | 99% |
| 4 years | 100% |

**The simplest approach returned the most.** Buying the same amount every month and never selling beat every
signal preset tested. The signals are worth understanding, but the record does not say they are necessary.
They did cut the worst drawdown substantially (54% against 83%), which is a real benefit of a different kind.

### A note on method

An earlier version of this project searched over 160,000 parameter combinations against this same history.
That is enough attempts that the best-looking result is partly luck, so the presets shipped here were chosen
to span a trade-off rather than to maximise any single number, and the headline findings above deliberately
rest on statistics that involve no fitting at all.

## The rule

Monthly savings accumulate as cash and go in when the buy signal appears, so purchases land in the weakest
stretches rather than being spread evenly. Three presets sit at different points on the same trade-off:

| Preset | Buy | Sell | Timing |
|---|---|---|---|
| **Selective** | RSI < 30 and %R < −80 | RSI > 90 and %R > −10 | buy either order within 8 weeks, sell same week |
| **Sequential** | RSI < 30 then %R < −85 | RSI > 88 and %R > −5 | buy requires RSI first, %R within 26 weeks |
| **More active** | RSI < 35 then %R < −70 | RSI > 78 and %R > −5 | looser on both sides |
| **Failed high** | RSI < 30 and %R < −80 | price makes a new high, RSI does not | see below |

### The failed-high exit

RSI must first run hot (above 80 within the previous 78 weeks). After that, the exit fires when price puts in
a new peak **above** the previous one while RSI puts in a peak **below** its previous one, with the two peaks
20 to 40 weeks apart. It lands on the two turns you would want:

| Peak spotted | Price at peak | Confirmed and sold | Sold at | Give-back |
|---|---|---|---|---|
| 2021-11-08 | $65,510 | 2021-12-20 | $50,791 | −22% |
| 2025-07-21 | $119,469 | 2025-09-01 | $111,144 | −7% |

**A peak can only be identified after it has passed.** The rule waits six weeks to confirm one, so the sale
always happens below the top. That lag is the price of the pattern and it is included in every figure here,
because pretending you could sell on the peak week would be using information that did not exist yet.

## Do the two indicators peak together?

No, and this turned out to be the most interesting thing in the data. Comparing when each indicator first
reaches its extreme:

| Side | Same week | %R first | RSI first | Average gap |
|---|---|---|---|---|
| Tops | 0 | 2 | 0 | 25 weeks |
| Bottoms | 0 | 2 | 1 | 4 weeks |

**They never arrive in the same week.** At tops Williams %R got there first every time, on average about six
months ahead of RSI. At bottoms the order was mixed. The two runs do overlap later, which is why a same-week
rule still finds anything at all, but the onsets are clearly staggered.

Sequential ordering helps at looser thresholds and hurts at the strictest one. Holding the buy rule fixed and
varying only the sell:

| Sell RSI | Same week | RSI first, then %R |
|---|---|---|
| 75 | 2.2x | 2.5x |
| 80 | 5.3x | 5.9x |
| 85 | 12.2x | **20.8x** |
| 90 | **256.2x** | 59.8x |

So the sequential idea is real but conditional. It rescues mid-range thresholds and damages the extreme one.

## Results

Weekly data, 2011-12 to 2026-08, paying in $1,000 a month. Figures below are from a snapshot; the page
recomputes from live data so it will drift slightly.

### More signals, or bigger ones?

| Preset | Trades | Median hold | Shortest hold | Multiple | Worst dip | 2022 position |
|---|---|---|---|---|---|---|
| Selective | 2 | 30 mo | 25 mo | **657.9x** | 54% | still open |
| Sequential | 3 | 24 mo | 20 mo | 201.6x | 53% | closed 2024-03 |
| More active | 4 | 14 mo | 6 mo | 19.0x | **45%** | closed 2023-11 |
| Failed high | 3 | 36 mo | 27 mo | 118.6x | 53% | closed 2025-09 |

Every trade under all four lasted months rather than weeks. The pattern is consistent and worth stating
plainly: **each extra trade cost return**, though it also reduced the worst dip. Out of 163,840 combinations
searched, none produced four or more trades that beat the two-trade Selective preset.

The Failed high preset trades off return for behaviour: it is the only one that both closed the 2022 position
and exited near the 2021 and 2025 tops, but the six week confirmation delay and an early 2017 exit
(at $1,162 rather than $18,953) cost it most of the difference against Selective.

### Selective, in detail

| Approach | Ended with | Multiple | Worst dip | Sells |
|---|---|---|---|---|
| **Buy the signal, sell the signal** | $116,452,350 | **657.9x** | **54%** | 2 |
| Buy the signal, never sell | $13,123,998 | 74.1x | 82% | 0 |
| Buy every month, sell on the signal | $38,808,000 | 219.2x | 80% | 11 |
| Buy every month, never sell | $141,369,632 | 798.7x | 83% | 0 |

Two comparisons matter here.

**The buy rule is a clear improvement.** Buying only on the RSI/%R confluence and never selling returned
74.1x against 52.1x for the previous rule of buying whenever price sat below its two year average. Both
never sell, so the difference is purely the entry.

**Buying every month and never selling still finished higher in absolute terms** (798.7x against 657.9x),
but it did so with an 83% drawdown rather than 54%. The signal rule gives up some return for a
substantially smoother ride, which is a genuine trade rather than a free win.

Completed trades:

| Bought from | Average price | Sold | Sold at | Result |
|---|---|---|---|---|
| 2015-01-12 | $213 | 2017-12-11 | $18,953 | +8,783% |
| 2018-12-10 | $3,194 | 2020-12-28 | $33,098 | +936% |

Holding since 2022-06-13.

## The sell level is the whole strategy

Same rule, only the RSI level for selling changed:

| Sell when RSI is over | Weeks that fired | Sells | Multiple |
|---|---|---|---|
| 81 | 30 | 3 | 11.7x |
| 85 | 20 | 3 | 28.1x |
| 88 | 14 | 3 | 108.6x |
| **90** | 11 | 2 | **657.9x** |
| 92 | 8 | 1 | 118.8x |

At 81 the rule sells during ordinary strength and exits rallies that keep running. It sold in June 2016 at
$672, immediately before the run to $19,000. Raising the bar to 90 cuts the number of qualifying weeks from
30 to 11 and changes the outcome by a factor of about fifty.

**This sensitivity is a warning, not a selling point.** A robust parameter usually shows a broad plateau of
similar results. This one is a spike: results collapse at 88 and again at 92. That pattern is what
overfitting looks like, and the sweep is displayed on the page rather than hidden for that reason.

## Buy signals

Four occasions in fourteen years, roughly one per cycle:

| Signal | Weeks | Average price | Peak before next signal |
|---|---|---|---|
| 2015-01-12 | 9 | $243 | $18,953 (+7,687%) |
| 2018-12-10 | 9 | $3,612 | $65,510 (+1,714%) |
| 2022-06-13 | 13 | $21,352 | $123,519 (+478%) |
| 2026-02-02 | 13 | $70,209 | active |

Peaks are visible only with hindsight.

## Reading it fairly

- Two to four completed trades depending on preset. That is a small sample, and small samples flatter backtests.
- **163,840 parameter combinations were searched.** With that many attempts, the best result is partly luck.
  The presets shipped here were chosen to span the trade-off rather than to maximise any single number.
- The lead and lag finding rests on five matched pairs. It is suggestive, not established.
- Long gaps between signals mean cash can sit uninvested for years, which is difficult to stick with.
- Trading costs, spreads and tax are excluded and reduce real world results.

## Data

| Source | Role |
|---|---|
| Bitstamp `/api/v2/ohlc/btcusd` | Primary, daily back to 2012 |
| Binance `/api/v3/klines` | Fallback |
| Coinbase `/products/BTC-USD/candles` | Fallback |

All three send `Access-Control-Allow-Origin: *`, so the page runs as static hosting. Daily bars are
aggregated into Monday-start weeks and the in-progress day is dropped.

## Files

| File | Purpose |
|---|---|
| `index.html` | Structure, styling, glossary and written explanation |
| `engine.js` | RSI, Williams %R, WMA, weekly aggregation, signal logic, simulation and the threshold sweep |
| `chart.js` | Log-scale SVG price chart with shaded buy signals and sell markers |
| `data.js` | Multi-source fetching with fallbacks |
| `app.js` | Rendering; every number shown is derived from computed results |

## Running locally

ES modules, so serve rather than opening `file://`:

```bash
python3 -m http.server 8000
```

## Deploying to GitHub Pages

```bash
git init && git add . && git commit -m "Bitcoin weekly signal"
git branch -M main && git remote add origin git@github.com:USER/REPO.git && git push -u origin main
```

Then **Settings → Pages → Source: deploy from branch → `main` / root**.

## Licence

MIT, see `LICENSE`.
