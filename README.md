# The Patience Premium

**Live: [amirthanvenkat.github.io/btc-patience-premium](https://amirthanvenkat.github.io/btc-patience-premium/)**

A single page walking a complete beginner through what fourteen years of weekly Bitcoin prices actually show
about buying, waiting and selling. No build step, no dependencies, no backend. Every figure is calculated in
the browser from public price data, so the page is always current and anything it shows can be checked
against the code.

> **Version 1.** Planned next: longer history from additional exchanges, user-editable settings rather than
> fixed presets, and results measured from different starting years.

> Educational material, not financial advice. No recommendation to buy, sell or hold is made or implied,
> and the author is not a licensed financial adviser.

---

## The headline findings

These lead the page because they held up best across the whole history, and because they need no parameter
tuning to be true.

| Finding | Figure |
|---|---|
| Share of all weeks followed by a higher price **three years** later | **99%** |
| Buying $1,000 monthly since 2012 and never selling | **1,007x** ($178,000 → $179.3m) |
| Buying signals so far followed by a higher price | **4 of 4** |

Holding period mattered more than entry timing:

| Held for | Price higher afterwards |
|---|---|
| 1 year | 72% |
| 2 years | 83% |
| 3 years | 99% |
| 4 years | 100% |

**Read the four year figure carefully.** It comes from a single asset over a single run in which the price
rose from a few dollars to tens of thousands. Any asset with that shape produces a number near 100% at long
horizons, so it describes what happened rather than what must happen. The page says so directly underneath
the chart. The nearer horizons are the more informative ones.

**The simplest approach returned the most.** Buying the same amount every month and never selling beat every
signal preset tested. The signals are worth understanding, but the record does not say they are necessary.
They did cut the worst drawdown substantially (54% against 83%), which is a real benefit of a different kind.

## The rule

Monthly savings accumulate as cash and go in when the buy signal appears, so purchases land in the weakest
stretches rather than being spread evenly.

| Preset | Buy | Sell | Timing |
|---|---|---|---|
| **Selective** | RSI < 30 and %R < −80 | RSI > 90 and %R > −10 | buy either order within 8 weeks, sell same week |
| **Sequential** | RSI < 30 then %R < −85 | RSI > 88 and %R > −5 | buy requires RSI first, %R within 26 weeks |
| **More active** | RSI < 35 then %R < −70 | RSI > 78 and %R > −5 | looser on both sides |
| **Failed high** | RSI < 30 and %R < −80 | price makes a new high, RSI does not | see below |

### The failed-high exit

RSI must first run hot (above 80 within the previous 78 weeks). After that, the exit fires when price puts in
a new peak **above** the previous one while RSI puts in a peak **below** its previous one, with the two peaks
20 to 40 weeks apart. It lands on the two turns you would want, at 2021-11-08 and 2025-07-21.

**A peak can only be identified after it has passed.** The rule waits six weeks to confirm one, so the sale
always happens below the top. That lag is the price of the pattern and it is included in every figure here,
because pretending you could sell on the peak week would be using information that did not exist yet.

## Results

Weekly data, 2011-12 to 2026-09, paying in $1,000 a month. **Figures below are a snapshot taken 2026-09-20
with Bitcoin at $81,235; the live page recomputes from current data and will differ.**

| Preset | Trades | Median hold | Multiple | Worst dip | 2022 position |
|---|---|---|---|---|---|
| Selective | 2 | 30 mo | **829.7x** | 54% | still open |
| Sequential | 3 | 24 mo | 254.2x | 53% | closed 2024-03 |
| More active | 4 | 14 mo | 23.9x | **45%** | closed 2023-11 |
| Failed high | 3 | 36 mo | 149.6x | 53% | closed 2025-09 |

Every trade under all four lasted months rather than weeks. The pattern is consistent and worth stating
plainly: **each extra trade cost return**, though it also reduced the worst dip. Out of 163,840 combinations
searched, none produced four or more trades that beat the two-trade Selective preset.

## Do the two indicators peak together?

No, and this turned out to be the most interesting thing in the data.

| Side | Same week | %R first | RSI first | Average gap |
|---|---|---|---|---|
| Tops | 0 | 2 | 0 | 25 weeks |
| Bottoms | 0 | 2 | 1 | 4 weeks |

**They never arrive in the same week.** At tops Williams %R got there first every time, on average about six
months ahead of RSI. At bottoms the order was mixed. The two runs do overlap later, which is why a same-week
rule still finds anything at all, but the onsets are clearly staggered.

## Reading it fairly

- Two to four completed trades depending on preset. That is a small sample, and small samples flatter backtests.
- **163,840 parameter combinations were searched.** With that many attempts, the best result is partly luck.
  The presets shipped here were chosen to span a trade-off rather than to maximise any single number, and the
  headline findings above deliberately rest on statistics that involve no fitting at all.
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
aggregated into Monday-start weeks and the in-progress day is dropped. The series is cached in
`localStorage` for the rest of the UTC day, so repeat visits render immediately instead of refetching.

## Files

| File | Purpose |
|---|---|
| `index.html` | Structure, styling, glossary and written explanation |
| `engine.js` | RSI, Williams %R, WMA, weekly aggregation, signal logic, simulation and the threshold sweep |
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
