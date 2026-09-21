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
| Buying $1,000 monthly since 2012 and never selling | **1,006x** ($178,000 → $179.1m) |
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
| **Selective** | RSI < 30 | RSI > 90 and %R > −10 | RSI alone on the buy side, sell same week |
| **Sequential** | RSI < 30 and %R < −85, staggered | RSI > 88 and %R > −5 | either leg first, the other within 26 weeks |
| **More active** | RSI < 35 and %R < −70, staggered | RSI > 78 and %R > −5 | looser on both sides |
| **Failed high** | RSI < 30 | price makes a new high, RSI does not | RSI alone on the buy side, exit below |

### What "sequential" means

The two indicators rarely reach their extremes in the same week, so the Sequential and More active presets
wait for them to arrive **staggered**: one leg hits its extreme, and the signal fires when the other follows
within the window. Crucially this works **in either direction**. RSI leading %R counts, and %R leading RSI
counts equally.

That matters. Across the ten buy episodes this produces, RSI led six times, %R led twice, and twice both legs
were active on the completing week. An earlier version of this project only accepted RSI-leading, which
silently discarded every %R-led entry, including the January 2015 and February 2026 bottoms.

### The failed-high exit

RSI must first run hot (above 80 within the previous 78 weeks). After that, the exit fires when price puts in
a new peak **above** the previous one while RSI puts in a peak **below** its previous one, with the two peaks
20 to 40 weeks apart. It lands on the two turns you would want, at 2021-11-08 and 2025-07-21.

**A peak can only be identified after it has passed.** The rule waits six weeks to confirm one, so the sale
always happens below the top. That lag is the price of the pattern and it is included in every figure here,
because pretending you could sell on the peak week would be using information that did not exist yet.

## Results

Weekly data, 2011-12 to 2026-09, paying in $1,000 a month. **Figures below are a snapshot taken 2026-09-21,
weekly series through 2026-09-14, with Bitcoin at $81,152. The live page recomputes from current data and
will differ.**

| Preset | Trades | Median hold | Multiple | Worst dip | 2022 position |
|---|---|---|---|---|---|
| Selective | 2 | 30 mo | **793.6x** | 54% | still open |
| Sequential | 3 | 26 mo | 252.0x | 53% | closed 2024-03 |
| More active | 4 | 15 mo | 22.4x | **46%** | closed 2023-11 |
| Failed high | 3 | 36 mo | 144.4x | 52% | closed 2025-09 |

Every trade under all four lasted months rather than weeks. The pattern is consistent and worth stating
plainly: **each extra trade cost return**, though it also reduced the worst dip. Out of 163,840 combinations
searched, none produced four or more trades that beat the two-trade Selective preset.

## Are both indicators actually needed?

Not equally, and the page says so rather than implying a tidy symmetry.

**On the buy side the two legs do different jobs.** Weekly RSI has closed below 30 only **12 times since
2012**, and on **all 12** occasions %R was already below −80 within eight weeks, so **%R has never vetoed an
entry** — the entry dates are identical with or without it.

It is not free to remove, though. %R holds the buying window open longer, and a longer window means more
monthly contributions land while the price is still low:

| Window opened | With %R | RSI only |
|---|---|---|
| 2015-01-12 | 9 weeks | 1 week |
| 2018-12-10 | 9 weeks | 1 week |
| 2022-06-13 | 13 weeks | 5 weeks |
| 2026-02-02 | 13 weeks | 5 weeks |

**Selective and Failed high now buy on RSI alone.** Both use the order-agnostic mode where the entry dates
are provably unchanged, so the second condition was dropped in favour of a rule that is simpler to state and
honest about what is doing the work. It costs about 4%: Selective 828.8x → **793.6x**, Failed high
149.5x → **144.4x**. Both figures in the results table above reflect the simpler rule.

**Sequential and More active keep it**, because for them it is structurally load-bearing: the `seq` mode is
defined as the two readings arriving in different weeks, and a staggered sequence needs two legs to stagger.
Removing it there takes Sequential to 227.5x and costs six of its ten entries.

**On the sell side it genuinely binds.** Dropping the %R requirement takes Selective from 793.6x to 629.9x,
so the confluence is doing real work at tops.

## Does lowering the thresholds help?

No. Both live at a sharp optimum and move away from it in either direction.

Measured on the presets as shipped.

| Buy RSI | Selective | Sequential |
|---|---|---|
| 20 or 25 | no signals at all | no signals at all |
| **30** | **793.6x** | **252.0x** |
| 35 | 270.7x | 90.3x |
| 40 | 173.5x | 45.5x |

Each preset carries its own %R sell level, so the two columns are not directly comparable; only the RSI
level changes down each one. The shipped level is bold.

| Sell RSI | Selective | Sequential |
|---|---|---|
| 75 | 5.4x | 6.3x |
| 80 | 14.3x | 38.5x |
| 85 | 34.3x | 75.4x |
| 88 | 131.5x | **252.0x** |
| **90** | **793.6x** | 553.5x |
| 92 | 143.8x | no trades |
| 95 | no trades | no trades |

Sequential's shipped level of 88 is not the top of its column: 90 would reach 553.5x. It was left at 88
because that is what produces its three completed trades, and because the peak of the wider grid is a spike
rather than a plateau, as below.

Lowering the sell RSI is actively destructive: at 75 Selective gives up more than 99% of its return.

Across the full 1,044-combination grid the best setting reaches 891.6x, but only **19% of its immediate
neighbours reach even half that**. That is a spike rather than a plateau, which is the signature of a result
fitted to this particular history. Nothing here was retuned on the strength of it.

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
