'use strict';

const CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'gex-levels', label: 'GEX & Levels' },
  { id: 'dealer-mechanics', label: 'Dealer Mechanics' },
  { id: 'options', label: 'Options Concepts' },
  { id: 'trading', label: 'Trading with Billy' },
  { id: 'platform', label: 'Platform Guide' },
];

const ARTICLES = [
  // ═══════════════════════════════════════════════════════════════
  // GETTING STARTED
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'what-is-sharkquant',
    title: 'What is SharkQuant\u2122?',
    category: 'getting-started',
    order: 1,
    difficulty: 'beginner',
    icon: 'zap',
    description: 'Platform overview — what Billy does and why it matters.',
    content: `SharkQuant\u2122 is a real-time options intelligence platform built around **Billy**, an AI agent that continuously monitors gamma exposure (GEX), options flow, implied volatility, and dealer positioning across the US equity market.

**What Billy Does**

Billy ingests live options chain data, calculates net gamma exposure at every strike, identifies key mechanical levels (call walls, put walls, gamma flip), and delivers actionable briefings before the market opens each day.

**Why It Matters**

Options market makers must hedge their positions. When they sell options to retail and institutional traders, they inherit gamma risk. Their hedging activity — buying into dips, selling into rips (positive gamma) or the reverse (negative gamma) — creates invisible support and resistance levels that move price mechanically.

SharkQuant\u2122 makes this invisible structure visible. Instead of guessing where support and resistance are, you can see exactly where dealer hedging pressure is concentrated.

**Core Features**

- Daily pre-market briefings with key levels and scenarios
- Real-time GEX heatmaps and analytics
- Options flow tracking (whale trades, unusual activity)
- Multi-agent AI analysis for deeper market research
- Smart money tracking (insider transactions, institutional filings)
- Automated alerts for GEX flips and regime changes`,
    tryItLink: { hash: 'command', label: 'Open Dashboard' },
  },
  {
    id: 'what-is-gex',
    title: 'What is Gamma Exposure (GEX)?',
    category: 'getting-started',
    order: 2,
    difficulty: 'beginner',
    icon: 'bar-chart-2',
    description: 'Learn how dealer hedging creates invisible support and resistance levels.',
    content: `**Gamma Exposure (GEX)** measures the total gamma risk held by options market makers across all strikes and expirations for a given underlying.

**The Formula**

GEX$ = Sum of (Open Interest x Gamma x 100 x Spot Price squared) across all strikes

**How It Works**

When a market maker sells an option, they inherit gamma exposure. To maintain a delta-neutral portfolio, they must continuously hedge — buying or selling shares of the underlying as its price moves.

**Positive GEX (Dealers Long Gamma)**

When net GEX is positive, dealers are long gamma. As price rises, their delta increases and they sell. As price falls, their delta decreases and they buy. This creates a **dampening effect** — dealers act as a buffer, reducing volatility and creating range-bound conditions.

**Negative GEX (Dealers Short Gamma)**

When net GEX is negative, dealers are short gamma. Their hedging works in the **same direction** as price movement — they buy as price rises and sell as price falls. This **amplifies** moves and creates trending, volatile conditions.

**Key Takeaway**

GEX doesn't predict direction. It tells you **how** the market will behave — whether moves will be dampened (positive GEX) or amplified (negative GEX).`,
    tryItLink: { hash: 'gex', label: 'Open GEX Chart' },
  },
  {
    id: 'reading-briefing',
    title: "Reading Billy\u2019s SharkBrief\u2122",
    category: 'getting-started',
    order: 3,
    difficulty: 'beginner',
    icon: 'file-text',
    description: 'How to read and act on the pre-market briefing.',
    content: `Billy delivers a daily briefing before the market opens, packed with everything you need to prepare for the trading day.

**Briefing Sections**

**1. Market Verdict** — A one-line directional bias (Bullish, Bearish, Neutral) with a confidence score. This is the headline takeaway.

**2. Key Levels** — The most important prices to watch:
- **HVL (Highest Volume Level)** — Where the most gamma is concentrated. Acts as a magnet.
- **Call Wall** — Upside resistance from dealer hedging. Price tends to stall here.
- **Put Wall** — Downside support from dealer hedging. Price tends to bounce here.
- **Gamma Flip** — The price where net GEX switches from positive to negative (or vice versa). Regime change point.
- **Vol Trigger** — The level where volatility regime shifts.

**3. Scenarios** — Billy provides IF/THEN scenarios:
- "IF SPY holds above 585, THEN expect consolidation between 585-590"
- "IF SPY breaks below the gamma flip at 582, THEN expect accelerated selling toward the put wall at 578"

**4. Stability Score** — A 1-10 rating of market structure stability. Higher = more predictable. Lower = more fragile, expect larger moves.

**How to Use It**

Read the verdict for directional bias. Note the key levels on your chart. Use the scenarios to plan your trades before the market opens. Let the stability score guide your position sizing — smaller when stability is low.`,
    tryItLink: { hash: 'briefing', label: 'View Briefing' },
  },
  {
    id: 'understanding-levels',
    title: 'Understanding Key Levels',
    category: 'getting-started',
    order: 4,
    difficulty: 'beginner',
    icon: 'git-branch',
    description: 'Call walls, put walls, gamma flip, and vol trigger explained.',
    content: `Billy identifies several key mechanical levels each day. These aren't traditional support/resistance — they're derived from options positioning data.

**Call Wall**

The strike with the highest **positive** net gamma. It acts as a ceiling. As price approaches a call wall, dealers who are long gamma at that strike sell shares to hedge, creating resistance. The higher the gamma concentration, the stronger the wall.

**Put Wall**

The strike with the highest **negative** net gamma. It acts as a floor. As price drops toward a put wall, dealers buy shares to hedge, creating support. Put walls are often wider (less precise) than call walls because put gamma tends to be more distributed.

**Gamma Flip (GEX Zero Line)**

The price where net dealer gamma switches from positive to negative. Above the flip, dealers dampen moves (range-bound). Below the flip, dealers amplify moves (trending/volatile). This is the single most important level to watch.

**Vol Trigger**

The level where implied volatility regime shifts. Above the vol trigger, volatility tends to compress. Below it, volatility tends to expand. Often near or at the gamma flip.

**HVL (Highest Volume Level)**

The strike with the most total gamma exposure (regardless of sign). Acts as a gravitational center — price tends to gravitate toward the HVL during positive gamma environments.

**How Levels Change**

These levels are recalculated from live options data and can shift as new positions are opened or closed. Billy updates them in real-time and flags significant changes.`,
    tryItLink: { hash: 'gex', label: 'See Live Levels' },
  },
  {
    id: 'first-trading-day',
    title: 'Your First Trading Day with Billy',
    category: 'getting-started',
    order: 5,
    difficulty: 'beginner',
    icon: 'play-circle',
    description: 'A walkthrough of putting it all together for your first session.',
    content: `Here's a step-by-step guide to your first day using SharkQuant\u2122.

**Before Market Open (8:00-9:30 AM ET)**

1. Check Billy's daily briefing for the market verdict and key levels
2. Note the gamma flip level — this is your regime boundary
3. Read the IF/THEN scenarios and mark them on your chart
4. Check the stability score to calibrate position sizing

**At the Open (9:30 AM)**

1. Watch where price opens relative to the gamma flip
   - Above = positive gamma environment (range-bound, mean-reverting)
   - Below = negative gamma environment (trending, volatile)
2. Note which scenario is playing out
3. Watch for price reactions at call wall and put wall levels

**During the Session**

1. Monitor SharkGrid\u2122 for real-time level updates
2. Watch for GEX flip alerts — regime changes are the highest-signal events
3. Check options flow for unusual activity (whale trades, sweeps)
4. If you're Pro, use SharkMind\u2122 for deeper analysis on specific tickers

**After Close (4:00 PM)**

1. Review what happened vs. Billy's morning scenarios
2. Check the post-market recap
3. Note which levels held and which broke — this builds pattern recognition

**Position Sizing Rule of Thumb**

- Stability 7-10: Normal size, tight stops
- Stability 4-6: Half size, wider stops
- Stability 1-3: Quarter size or sit out — high fragility means unpredictable moves`,
    tryItLink: { hash: 'briefing', label: 'Start with Briefing' },
  },

  // ═══════════════════════════════════════════════════════════════
  // GEX & LEVELS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'call-put-walls',
    title: 'Call Walls & Put Walls',
    category: 'gex-levels',
    order: 1,
    difficulty: 'intermediate',
    icon: 'shield',
    description: 'How dealer hedging creates mechanical resistance and support.',
    content: `Call walls and put walls are the strikes where the most gamma is concentrated on each side of the market.

**Call Walls (Upside Resistance)**

A call wall forms at the strike with the highest positive gamma from call options. When price approaches this level:
- Dealers who sold calls see their delta increase
- To stay neutral, they sell shares (or futures)
- This selling pressure creates resistance

The strength of a call wall depends on:
- **Concentration** — How much gamma is at that single strike vs. distributed
- **Expiration** — Nearby expirations have stronger gamma effects (gamma increases as expiration approaches)
- **Proximity** — Walls become more powerful as price gets closer (gamma increases as an option moves toward ATM)

**Put Walls (Downside Support)**

A put wall forms at the strike with the highest gamma from put options. When price drops toward this level:
- Dealers who sold puts see their delta decrease (more negative)
- To stay neutral, they buy shares
- This buying pressure creates support

**Important Nuances**

- Call walls are often sharper (more precise) because call OI tends to concentrate at round strikes
- Put walls tend to be wider because put OI is more distributed (hedging activity spreads across strikes)
- Walls can break if a large flow overwhelms dealer hedging capacity
- A broken wall often becomes the next acceleration zone as dealers are forced to unwind`,
    tryItLink: { hash: 'gex', label: 'View Walls on GEX' },
  },
  {
    id: 'gamma-flip',
    title: 'The Gamma Flip',
    category: 'gex-levels',
    order: 2,
    difficulty: 'intermediate',
    icon: 'repeat',
    description: 'The regime transition point between positive and negative gamma.',
    content: `The gamma flip is the price level where net dealer gamma crosses from positive to negative (or vice versa). It's the single most important level in GEX analysis.

**Above the Gamma Flip (Positive Gamma)**

- Dealers dampen price movement
- Ranges tend to narrow
- Mean-reversion strategies work well
- Implied volatility compresses
- Think of it as "cruise control" mode

**Below the Gamma Flip (Negative Gamma)**

- Dealers amplify price movement
- Moves accelerate and trend
- Momentum strategies work well
- Implied volatility expands
- Think of it as "turbo" mode

**Trading the Flip**

When price crosses the gamma flip, the market regime changes. This is a high-signal event because:
1. The nature of dealer hedging literally reverses
2. Strategies that worked in one regime stop working in the other
3. Volatility behavior changes (compression vs. expansion)

**Flip Alerts**

Billy sends automated alerts when the gamma flip is crossed. These are among the most valuable signals because regime changes often lead to extended moves in the new direction.

**Common Patterns**

- Price often tests the flip level multiple times before committing to a direction
- Once the flip is decisively crossed, the subsequent move tends to accelerate
- The gamma flip often acts as a "line in the sand" — the most contested price of the day`,
    tryItLink: { hash: 'gex', label: 'Watch Gamma Flip' },
  },
  {
    id: 'short-long-gamma',
    title: 'Short vs. Long Gamma',
    category: 'gex-levels',
    order: 3,
    difficulty: 'intermediate',
    icon: 'trending-up',
    description: 'What each gamma regime means for price action and volatility.',
    content: `Understanding whether dealers are net long or short gamma is crucial for knowing what kind of market behavior to expect.

**Long Gamma (Positive Net GEX)**

Dealers are long gamma when they've bought more options than they've sold (net), or more commonly, when the aggregate positioning across all strikes results in positive net gamma.

Characteristics:
- Low realized volatility
- Price moves are damped and mean-reverting
- Intraday ranges are compressed
- Overnight gaps are smaller
- SPY/QQQ tend to "pin" near high-gamma strikes
- VIX tends to drift lower

Best strategies:
- Selling premium (theta collection)
- Mean-reversion scalps
- Range-bound strategies (iron condors, butterflies)

**Short Gamma (Negative Net GEX)**

Dealers are short gamma when the aggregate positioning results in negative net gamma. This is the more dangerous regime.

Characteristics:
- High realized volatility
- Price moves are amplified and self-reinforcing
- Intraday ranges expand significantly (2-3x normal)
- Gap risk increases
- Trends develop and extend
- VIX spikes higher

Best strategies:
- Momentum and trend-following
- Buying premium (especially puts for protection)
- Wider stops, smaller position sizes
- Breakout strategies

**Regime Duration**

Positive gamma environments tend to persist for days or weeks. Negative gamma environments are usually shorter (hours to days) but more intense. The shift between them is the gamma flip.`,
  },
  {
    id: 'gex-velocity',
    title: 'GEX Velocity & Regime Changes',
    category: 'gex-levels',
    order: 4,
    difficulty: 'advanced',
    icon: 'activity',
    description: 'How day-over-day GEX shifts signal regime transitions.',
    content: `GEX velocity measures the rate of change in gamma exposure over time. It's a second-derivative signal that can anticipate regime changes before they happen.

**What GEX Velocity Tells You**

- **Positive velocity (GEX increasing)** — Gamma is building. The market is moving toward more stability. Dealers are accumulating long gamma positions. Expect volatility to compress.
- **Negative velocity (GEX decreasing)** — Gamma is draining. The market is moving toward less stability. Often happens as options expire (gamma decay) or as positions are unwound. Expect volatility to expand.
- **Sharp velocity spikes** — Large, sudden changes in GEX signal a rapid repositioning. Often coincides with major events (earnings, FOMC, OpEx).

**Regime Change Signals**

A regime change (positive to negative gamma, or vice versa) doesn't happen instantly. The sequence is typically:

1. GEX velocity turns negative (gamma is draining)
2. Net GEX approaches zero (the flip line)
3. A catalyst pushes price through the flip
4. Dealers switch from dampening to amplifying
5. Volatility expands and the move accelerates

**OpEx (Options Expiration) Effects**

GEX velocity is most pronounced around monthly options expiration (OpEx, third Friday). As options expire, gamma rolls off. If new positions aren't established, net GEX can drop sharply, opening the door for volatile post-OpEx moves.

**How Billy Uses This**

Billy tracks GEX velocity and flags when it enters warning territory. The stability score incorporates velocity — a rapidly declining GEX environment receives a lower stability rating even if absolute GEX is still positive.`,
    tryItLink: { hash: 'gex-analytics', label: 'SharkAnalytics\u2122' },
  },
  {
    id: 'reading-heatmap',
    title: 'Reading SharkGrid\u2122',
    category: 'gex-levels',
    order: 5,
    difficulty: 'intermediate',
    icon: 'grid',
    description: 'Visual guide to interpreting the gamma exposure heatmap.',
    content: `The GEX heatmap displays gamma exposure across strikes and expirations in a color-coded grid, making it easy to see where dealer positioning is concentrated.

**Reading the Grid**

- **X-axis:** Strike prices (horizontal)
- **Y-axis:** Expiration dates (vertical, nearest at top)
- **Color intensity:** Amount of gamma at that strike/expiration
  - **Green** = Positive gamma (call-dominated, dealer long gamma)
  - **Red** = Negative gamma (put-dominated, dealer short gamma)
  - **Brighter** = More gamma concentrated at that point

**What to Look For**

**1. Bright Clusters**
Large bright spots indicate heavy positioning at specific strikes. These are your walls — price will react when it reaches these levels.

**2. The Gamma Flip Zone**
Look for where green transitions to red across the strike axis. This is where net gamma crosses zero. Price above this zone = positive gamma regime. Price below = negative gamma regime.

**3. Expiration Concentration**
If most gamma is concentrated in the nearest expiration, levels are more powerful but temporary (they'll roll off at expiration). If gamma is distributed across multiple expirations, levels are more durable.

**4. Asymmetry**
Compare the size of the call wall cluster vs. the put wall cluster. Asymmetric positioning (much larger call wall than put wall, or vice versa) signals directional bias in the market.

**5. Changes Over Time**
Use the time slider to see how the heatmap evolves. Shifting gamma concentration signals changing market expectations.`,
    tryItLink: { hash: 'gex', label: 'Open Heatmap' },
  },

  // ═══════════════════════════════════════════════════════════════
  // DEALER MECHANICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'how-mm-hedge',
    title: 'How Market Makers Hedge',
    category: 'dealer-mechanics',
    order: 1,
    difficulty: 'intermediate',
    icon: 'shield-check',
    description: 'Delta hedging basics — the mechanical engine behind GEX.',
    content: `Market makers (dealers) provide liquidity by taking the other side of options trades. To manage the risk of these positions, they continuously delta-hedge.

**Delta Hedging Explained**

Delta measures how much an option's price changes per $1 move in the underlying. A call with delta 0.50 gains $0.50 when the stock rises $1.

When a dealer sells a call (delta +0.50 from the buyer's perspective), the dealer's position has delta -0.50. To neutralize this, the dealer buys 50 shares of the underlying. Now their combined position has delta near zero — they're "delta neutral."

**Continuous Rebalancing**

As the stock price moves, delta changes (this change is gamma). The dealer must continuously rebalance:

- Stock rises $1 → Call delta increases to +0.55 → Dealer needs 5 more shares
- Stock falls $1 → Call delta decreases to +0.45 → Dealer sells 5 shares

This continuous buying and selling IS the mechanical force that GEX measures.

**The Scale**

Options market makers collectively hold positions worth billions of dollars in delta. Their hedging flows are large enough to move the underlying, especially in concentrated areas (around walls) and during low-liquidity periods (open, close, after-hours).

**Why This Matters for You**

Understanding delta hedging means understanding why GEX levels work. They're not patterns or indicators — they're the direct result of real money flows from institutions that are contractually obligated to hedge.`,
  },
  {
    id: 'dealer-pressure-flow',
    title: 'Dealer Pressure & Flow',
    category: 'dealer-mechanics',
    order: 2,
    difficulty: 'intermediate',
    icon: 'wind',
    description: 'How inventory positioning creates directional pressure.',
    content: `Dealer pressure refers to the directional bias created by market makers' aggregate hedging activity. Flow refers to the real-time options transactions that change dealer positioning.

**Dealer Inventory**

Dealers accumulate inventory as they make markets. Their current inventory determines:
- **How much** they need to hedge
- **In which direction** they need to hedge
- **How sensitive** their hedging is to price movement

When dealers are heavily short calls (long delta hedge), they have upward pressure on the underlying. When heavily short puts (short delta hedge), they have downward pressure. The net effect depends on the aggregate across all strikes and expirations.

**Flow Signals**

Options flow shows you what's happening in real-time:
- **Large call buying** → Dealers sell calls → Need to buy shares → Bullish pressure
- **Large put buying** → Dealers sell puts → Need to sell shares → Bearish pressure
- **Sweep orders** → Aggressive, time-sensitive trades that hit multiple exchanges → High conviction signal
- **Block trades** → Large institutional orders negotiated off-exchange → Whale positioning

**Reading Flow Direction**

Not all flow is directional:
- Bought calls at ask = bullish
- Sold calls at bid = bearish (could be a covered call or position close)
- Bought puts at ask = bearish
- Sold puts at bid = could be bullish (closing a hedge)

**Flow + GEX Together**

The most powerful signals come when flow confirms GEX structure. Large call buying near a call wall suggests the wall may hold. Large put buying below the gamma flip suggests a move into negative gamma territory.`,
    tryItLink: { hash: 'flow', label: 'View SharkFlow\u2122' },
  },
  {
    id: 'charm-vanna',
    title: 'Charm & Vanna Effects',
    category: 'dealer-mechanics',
    order: 3,
    difficulty: 'advanced',
    icon: 'clock',
    description: 'How time decay and volatility changes force dealer rebalancing.',
    content: `Beyond gamma, two other Greeks — charm and vanna — create significant hedging flows that move markets.

**Charm (Delta Decay)**

Charm measures how delta changes as time passes (with price held constant). As options approach expiration:
- Out-of-the-money (OTM) options: delta decays toward zero
- In-the-money (ITM) options: delta approaches 1.0 (or -1.0 for puts)
- At-the-money (ATM) options: charm is most pronounced

**Charm's Market Impact**

Charm creates a predictable daily hedging flow:
- Dealers who are short OTM calls see their delta decline → they sell some hedge shares
- Dealers who are short OTM puts see their delta decline → they buy back some hedge shares
- Net effect depends on positioning, but charm flows often create a slight upward drift in positive gamma environments

This is one reason markets tend to melt up slowly in low-volatility, positive gamma periods.

**Vanna (Delta-Vol Sensitivity)**

Vanna measures how delta changes when implied volatility (IV) changes. When IV drops:
- Call delta decreases → Dealers sell shares
- Put delta increases (less negative) → Dealers buy shares
- Net vanna flow depends on skew (puts vs. calls positioning)

**Vanna's Market Impact**

The "vanna rally" is a well-known effect: as markets rise and IV drops, vanna forces create additional buying pressure, reinforcing the move. Conversely, when markets fall and IV spikes, vanna creates additional selling pressure.

**Why This Matters**

Charm and vanna explain market behavior that pure GEX doesn't capture — the slow drift during quiet periods, the acceleration during vol spikes, and the predictable end-of-day flows as charm effects accumulate.`,
  },
  {
    id: 'gamma-squeeze',
    title: 'Gamma Squeeze Mechanics',
    category: 'dealer-mechanics',
    order: 4,
    difficulty: 'advanced',
    icon: 'alert-triangle',
    description: 'When dealer hedging creates a self-reinforcing feedback loop.',
    content: `A gamma squeeze occurs when dealer hedging creates a positive feedback loop that drives price rapidly in one direction.

**The Setup**

A gamma squeeze typically requires:
1. **Large short gamma positioning** — Dealers have sold many near-the-money options
2. **Price movement toward concentrated strikes** — Pushing options toward ATM increases gamma
3. **Insufficient liquidity** — Not enough natural flow to absorb dealer hedging
4. **Momentum** — Once the loop starts, it's self-reinforcing

**The Mechanism**

1. Price rises toward a strike with heavy call open interest
2. Dealer delta increases — they must buy shares to hedge
3. Their buying pushes price higher
4. Higher price increases delta further — they must buy more
5. Repeat — the loop feeds on itself

**Classic Examples**

- **GameStop (Jan 2021)** — Massive short-dated call buying forced dealers into an unprecedented gamma squeeze. Dealers' hedging drove the stock from $20 to $483.
- **Post-FOMC rallies** — After dovish Fed statements, IV crush (vanna) + call buying (gamma) can create sharp upside squeezes.

**Identifying Squeeze Risk**

Billy flags elevated squeeze risk when:
- Large open interest is concentrated near current price
- Net gamma is highly negative
- Short-dated options dominate the gamma profile
- Options volume exceeds average by 2x or more

**Downside Squeezes**

Gamma squeezes work in both directions. Put-driven squeezes (dealer selling to hedge short puts) can accelerate selloffs, though these are less common because put gamma is typically more distributed.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // OPTIONS CONCEPTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'iv-basics',
    title: 'Implied Volatility Basics',
    category: 'options',
    order: 1,
    difficulty: 'beginner',
    icon: 'trending-down',
    description: 'Understanding IV, skew, and term structure.',
    content: `Implied volatility (IV) is the market's forecast of how much a stock will move over a given period. It's extracted from option prices using pricing models.

**What IV Tells You**

- **High IV** — The market expects large moves. Options are expensive. Think: earnings, FOMC, CPI.
- **Low IV** — The market expects small moves. Options are cheap. Think: summer doldrums, post-event compression.
- **IV Rank/Percentile** — Where current IV sits relative to its historical range. IV at 80th percentile means it's higher than 80% of readings over the past year.

**Volatility Skew**

Skew refers to the difference in IV across strikes at the same expiration:
- **Put skew** — OTM puts have higher IV than OTM calls. This is the "normal" state — markets pay more for downside protection. Steeper skew = more fear.
- **Call skew** — OTM calls have higher IV than normal. Unusual — signals speculative call buying or short squeeze risk.
- **Flat skew** — IV is similar across strikes. Can signal complacency or an unusual regime.

**Term Structure**

Term structure shows IV across different expirations:
- **Contango** (normal) — Longer-dated IV is higher than shorter-dated. The market is calm.
- **Backwardation** (inverted) — Shorter-dated IV is higher. Signals near-term stress or an event (earnings, FOMC).

**How Billy Uses IV**

Billy monitors IV levels, skew, and term structure to assess market conditions. The stability score incorporates IV metrics — inverted term structure or extreme skew readings lower the stability score.`,
  },
  {
    id: '0dte-options',
    title: '0DTE Options',
    category: 'options',
    order: 2,
    difficulty: 'intermediate',
    icon: 'timer',
    description: 'Same-day expiry dynamics and their market impact.',
    content: `0DTE (zero days to expiration) options expire on the same day they're traded. Since SPX/SPY options now expire every trading day (Mon-Fri), 0DTE has become a massive part of the options market.

**Why 0DTE Matters**

0DTE options have unique characteristics:
- **Maximum gamma** — Gamma is highest at expiration. Near-the-money 0DTE options have enormous gamma.
- **Rapid theta decay** — Time value evaporates throughout the day. A $2 option at 9:30 AM might be worth $0.10 by 3:00 PM.
- **Binary outcomes** — 0DTE options either finish in-the-money or expire worthless.

**0DTE's Impact on GEX**

0DTE options now represent a significant portion of daily gamma. This means:
- GEX levels shift more during the day as 0DTE positions are opened and closed
- Gamma "rolls off" at 4:00 PM, potentially creating end-of-day volatility
- Pinning effects (price gravitating toward high-gamma strikes) are strongest with 0DTE

**0DTE Trading Dynamics**

- **Morning:** Spreads are wide, premium is high. Directional bets are popular.
- **Midday:** Theta accelerates. Sellers benefit if price is range-bound.
- **Afternoon:** Gamma peaks. Small price moves create large P&L swings. Hedging flows intensify.
- **Last hour:** Maximum gamma creates "magnet" and "wall" effects at key strikes.

**Billy's 0DTE Tracking**

Billy monitors 0DTE gamma separately from total GEX because 0DTE positioning creates intraday effects that differ from the multi-day GEX structure.`,
    tryItLink: { hash: '0dte', label: 'View Shark0DTE\u2122' },
  },
  {
    id: 'put-call-ratios',
    title: 'Put/Call Ratios & Flow',
    category: 'options',
    order: 3,
    difficulty: 'intermediate',
    icon: 'bar-chart',
    description: 'Reading the options tape for sentiment and positioning.',
    content: `Put/call ratios measure the relative volume or open interest of puts versus calls. They're a contrarian sentiment indicator.

**Types of Put/Call Ratios**

- **Volume P/C ratio** — Puts traded / Calls traded on a given day. Measures current activity.
- **OI P/C ratio** — Put open interest / Call open interest. Measures accumulated positioning.
- **Equity-only P/C** — Excludes index options (removes hedging noise).
- **Index P/C** — SPX/SPY puts vs. calls (more institutional).

**Interpreting the Ratio**

- **P/C > 1.0** — More puts than calls. Can signal fear/bearishness. Contrarians see this as potentially bullish (too much hedging = market protected).
- **P/C < 0.7** — More calls than puts. Can signal greed/complacency. Contrarians see this as potentially bearish (not enough protection).
- **Extremes** — Readings above 1.2 or below 0.5 often mark turning points.

**Flow Quality Matters**

Raw ratios don't tell the whole story. Billy analyzes flow quality:
- **Premium-weighted flow** — A single $5M put trade matters more than 1,000 small call trades
- **Aggressor side** — Did the buyer initiate (hitting ask) or seller (hitting bid)?
- **Sweep vs. single** — Sweeps across exchanges signal urgency
- **Size vs. average** — Unusually large trades stand out

**Smart Money Flow**

Billy specifically tracks large, aggressive, unusual options flow — these tend to come from institutional traders with an edge. Consistent large put buying in a rally, or call buying in a selloff, often precedes reversals.`,
    tryItLink: { hash: 'flow', label: 'SharkFlow\u2122' },
  },
  {
    id: 'expected-move',
    title: 'Expected Move',
    category: 'options',
    order: 4,
    difficulty: 'beginner',
    icon: 'move',
    description: 'What the options market predicts for price range.',
    content: `The expected move is the range the options market predicts a stock will stay within over a given period. It's derived from at-the-money straddle pricing.

**How It's Calculated**

Expected Move = ATM Straddle Price x 0.85 (approximately)

For example, if the SPY weekly ATM straddle costs $5.00, the expected move is roughly +/- $4.25 from the current price.

**What It Tells You**

- The expected move represents a roughly 68% probability range (one standard deviation)
- Price should stay within this range about two-thirds of the time
- Moves beyond the expected move are "outliers" — they happen about one-third of the time

**Using Expected Move with GEX**

The expected move and GEX levels together give you a complete picture:
- If the call wall is inside the expected move → Price is likely to reach it and stall
- If the call wall is outside the expected move → That level is unlikely to be tested
- If the gamma flip is inside the expected move → Regime change is plausible
- If the expected move is unusually large → Market is pricing in an event (FOMC, CPI, earnings)

**Daily vs. Weekly**

- **Daily expected move** — Useful for day traders. How much price should move today.
- **Weekly expected move** — Useful for swing traders. The range for the full week.

**Billy's Integration**

Billy includes the expected move in daily briefings and uses it to calibrate scenario probabilities. A scenario that requires a move beyond the expected range is flagged as lower probability.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // TRADING WITH BILLY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'scenario-trading',
    title: 'Scenario-Based Trading',
    category: 'trading',
    order: 1,
    difficulty: 'intermediate',
    icon: 'map',
    description: 'Using IF/THEN frameworks from Billy\'s briefings.',
    content: `Scenario-based trading means planning your trades around predefined conditions rather than reacting emotionally to price movement.

**Billy's IF/THEN Framework**

Each morning briefing includes scenarios like:

"IF SPY opens above 590 and holds, THEN expect consolidation between 590-594 (call wall). Trade: sell premium or fade breakouts."

"IF SPY breaks below 585 (gamma flip), THEN expect acceleration toward 580 (put wall). Trade: momentum short or buy puts."

**How to Use Scenarios**

1. **Pre-market:** Read all scenarios and identify which is most likely based on pre-market price action
2. **At the open:** Wait 5-15 minutes to see which scenario is developing
3. **Confirmation:** Don't trade the scenario until you see price action confirming it
4. **Execute:** Follow the scenario's trade suggestion with proper sizing
5. **Invalidation:** Each scenario has a built-in invalidation level. If price crosses it, the scenario is dead — move to the next one.

**Why Scenarios Work**

- They remove decision fatigue. You've already planned your response to different market conditions.
- They're based on mechanical levels (GEX), not opinions or predictions.
- They include invalidation criteria, so you know when to exit.
- They keep you from chasing — if no scenario is triggered, you don't trade.

**Building Your Own Scenarios**

Once you understand key levels, you can build custom scenarios:
- Identify the gamma flip, call wall, and put wall
- Define what happens if price goes to each level
- Plan your entry, stop, and target for each case
- Size based on the stability score`,
    tryItLink: { hash: 'briefing', label: 'See Today\'s Scenarios' },
  },
  {
    id: 'risk-calibration',
    title: 'Risk Calibration',
    category: 'trading',
    order: 2,
    difficulty: 'intermediate',
    icon: 'sliders',
    description: 'Sizing positions based on stability scores and gamma regime.',
    content: `Risk calibration means adjusting your position size and stop distance based on current market conditions — not using the same size every trade.

**Stability Score Guide**

Billy's stability score (1-10) directly informs position sizing:

- **8-10 (Very Stable):** Full size. Positive gamma, tight ranges, predictable. Use tight stops (0.3-0.5% from entry).
- **6-7 (Stable):** 75% size. Generally positive gamma but some uncertainty. Standard stops (0.5-1%).
- **4-5 (Neutral):** 50% size. Mixed signals, near the gamma flip. Wider stops (1-1.5%).
- **2-3 (Fragile):** 25% size. Negative gamma or transitioning. Wide stops (1.5-2%) or use options.
- **1 (Very Fragile):** Minimal or no position. Extreme conditions — sit out or use defined-risk options only.

**Gamma Regime Position Sizing**

Beyond the stability score, the gamma regime itself guides your approach:

**Positive Gamma:**
- Tighter stops work (price tends to revert)
- Can use larger sizes because ranges are compressed
- Mean-reversion entries near walls have higher win rates
- Multiple entries/averages are safer

**Negative Gamma:**
- Wider stops are essential (price trends and extends)
- Smaller sizes because volatility is amplified
- Momentum entries work better than fading
- Avoid averaging into losing positions

**The 2% Rule Adjusted**

Many traders use a 2% of capital max risk per trade. In the GEX framework:
- Stability 8-10: Full 2% risk per trade
- Stability 5-7: 1% risk per trade
- Stability 1-4: 0.5% risk per trade or less

This approach prevents large drawdowns during volatile, fragile market conditions while allowing full participation during stable periods.`,
  },
  {
    id: 'using-ai-agents',
    title: 'Using SharkMind\u2122',
    category: 'trading',
    order: 3,
    difficulty: 'intermediate',
    icon: 'cpu',
    description: 'Multi-agent analysis for deeper market research.',
    content: `SharkMind\u2122 is SharkQuant\u2122's multi-agent analysis system (Pro tier). It deploys specialized AI agents that each analyze a different aspect of the market, then synthesizes their findings into a unified research report.

**How It Works**

When you submit a query (e.g., "Analyze AAPL for tomorrow"), the system deploys multiple agents:

1. **Market Analyst** — Analyzes price action, trends, and technical patterns
2. **Sentiment Analyst** — Scans news, social media, and analyst opinions
3. **Fundamentals Analyst** — Reviews earnings, valuations, and macro data
4. **Risk Manager** — Assesses risk factors and position sizing recommendations
5. **Research Director** — Synthesizes all agents' findings into a coherent report

Each agent works independently, then the Research Director combines their outputs, identifies consensus and conflicts, and delivers a final analysis.

**Best Prompts**

- "Analyze NVDA ahead of earnings" — Gets you a comprehensive pre-earnings report
- "What's the risk/reward on buying SPY puts here?" — Gets a specific trade analysis
- "Compare AAPL vs MSFT for a swing trade" — Gets a comparative analysis
- "What are the macro risks this week?" — Gets a broader market assessment

**Reading the Report**

The report includes:
- **Summary verdict** — Bullish, bearish, or neutral with confidence
- **Key findings** from each agent
- **Risk factors** — What could go wrong
- **Trade ideas** — Specific entry/exit/size suggestions
- **Dissenting views** — Where agents disagreed (often the most valuable part)

**Limitations**

SharkMind\u2122 provides analysis, not predictions. It's best used for research and preparation — combining its insights with GEX levels and your own judgment.`,
    tryItLink: { hash: 'agents', label: 'Try SharkMind\u2122' },
  },
  {
    id: 'gex-patterns',
    title: 'SharkSense\u2122 Pattern Recognition',
    category: 'trading',
    order: 4,
    difficulty: 'advanced',
    icon: 'eye',
    description: 'AI-detected patterns in gamma exposure data.',
    content: `SharkSense\u2122 (Pro tier) uses machine learning to identify recurring patterns in gamma exposure data that precede specific market outcomes.

**Pattern Types**

**1. Gamma Compression**
When GEX builds rapidly at nearby strikes, creating a narrow band of high positive gamma. This often precedes a breakout — price coils in a tight range until a catalyst breaks through the gamma walls. Direction of breakout is uncertain, but the magnitude is often large.

**2. Put Wall Migration**
When the put wall shifts higher over consecutive sessions, it signals increasing downside protection buying. This often precedes a correction — smart money is hedging ahead of a move lower.

**3. Call Wall Expansion**
When the call wall shifts higher over consecutive sessions while positive gamma increases. This is a healthy uptrend signal — the market is building upside structure with dealer support.

**4. Gamma Drain**
When total absolute GEX declines over multiple sessions (often approaching OpEx). This signals decreasing dealer influence and increasing vulnerability to moves in either direction.

**5. Flip Convergence**
When the gamma flip level converges with the current price. This signals an imminent regime change — the market is at the exact boundary between positive and negative gamma.

**Using Patterns**

Billy flags these patterns in the briefing and on the SharkAnalytics\u2122 page. They're most useful as confirming signals — use them alongside the daily levels and scenarios, not as standalone trade signals.

**Accuracy**

Patterns are probabilistic, not certain. Billy displays a confidence level for each pattern detection. Higher confidence (>70%) patterns have historically had better follow-through.`,
    tryItLink: { hash: 'gex-analytics', label: 'View SharkAnalytics\u2122' },
  },

  // ═══════════════════════════════════════════════════════════════
  // PLATFORM GUIDE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'dashboard-navigation',
    title: 'Dashboard Navigation',
    category: 'platform',
    order: 1,
    difficulty: 'beginner',
    icon: 'layout',
    description: 'Tour of all dashboard pages and how to find what you need.',
    content: `The SharkQuant\u2122 dashboard is organized into sections accessible via the sidebar navigation.

**SharkCommand\u2122**

Your home page. Shows the market verdict, key levels overview, stability score, and confluence widget. Everything at a glance.

**SharkBrief\u2122**

Billy's full morning report with verdict, levels, scenarios, and analysis. Updated each morning before market open. Historical briefings are available for review.

**GEX Pages**

- **SharkGrid\u2122** — Real-time gamma exposure across strikes. Shows call wall, put wall, gamma flip, and HVL with live updates.
- **SharkAnalytics\u2122** — Historical GEX data, trends, velocity metrics, and pattern detection.
- **SharkVisor\u2122** — Augmented reality overlay of GEX levels on a price chart.

**Shark0DTE\u2122**

Real-time tracking of zero-day options activity with gamma impact analysis.

**SharkChart\u2122**

Standard price chart with GEX levels overlaid as horizontal lines. See how price reacts at mechanical levels in real-time.

**SharkFlow\u2122**

Live feed of notable options trades — sweeps, blocks, and unusual activity. Filtered for quality (minimum size, premium, and significance thresholds).

**SharkMind\u2122 (Pro)**

Multi-agent research system. Submit queries for comprehensive AI-powered market analysis.

**Research Section**

- **SharkScan\u2122** — Filter stocks by options metrics, GEX levels, and flow signals.
- **SharkPlaybook\u2122** — Pre-built trading strategies with GEX-aware entry/exit rules.
- **SharkIntel\u2122** — News, earnings calendar, and macro event tracking.
- **SharkMoney\u2122** — Insider transactions, institutional filings, and whale tracking.`,
    tryItLink: { hash: 'command', label: 'Go to SharkCommand\u2122' },
  },
  {
    id: 'options-flow-page',
    title: 'SharkFlow\u2122 Guide',
    category: 'platform',
    order: 2,
    difficulty: 'beginner',
    icon: 'list',
    description: 'How to read and filter the options flow feed.',
    content: `The SharkFlow\u2122 page shows real-time options transactions filtered for significance.

**Flow Table Columns**

- **Time** — When the trade occurred
- **Ticker** — The underlying symbol
- **Exp** — Expiration date
- **Strike** — Strike price
- **C/P** — Call or Put
- **Spot** — Current stock price when the trade occurred
- **Type** — SWEEP (multi-exchange), BLOCK (negotiated), SPLIT (across strikes)
- **Size** — Number of contracts
- **Premium** — Total dollar value of the trade
- **Side** — ASK (buyer-initiated, bullish for calls), BID (seller-initiated)
- **Unusual** — Flag for trades that exceed normal volume/OI at that strike

**Filtering the Feed**

Use the filter controls to focus on what matters:
- **Ticker filter** — Watch specific symbols
- **Min premium** — Filter out small trades (try $100K+ for significant flow)
- **Type** — Focus on sweeps for urgency signals
- **Sentiment** — Bullish, bearish, or all
- **Expiration** — Short-dated (0-7 days) for near-term signals, longer-dated for positioning

**Reading Flow Signals**

- **Large sweep at ask** — Aggressive buying. High conviction.
- **Repeated strikes** — Same strike/expiration hit multiple times. Building a position.
- **Unusual flag** — Volume exceeds open interest. New position being established.
- **Premium spike** — Much larger than typical. Institutional player.

**Common Pitfalls**

- Not all flow is directional — some is hedging or spreading
- One big trade doesn't make a trend — look for clusters
- Flow near expiration is often closing, not opening
- Compare flow to GEX levels for confirmation`,
    tryItLink: { hash: 'flow', label: 'Open SharkFlow\u2122' },
  },
  {
    id: 'smart-money-tracking',
    title: 'SharkMoney\u2122 Tracking',
    category: 'platform',
    order: 3,
    difficulty: 'beginner',
    icon: 'search',
    description: 'Tracking whale trades, insider transactions, and institutional filings.',
    content: `The SharkMoney\u2122 page aggregates signals from institutional investors, corporate insiders, and large traders.

**Insider Transactions**

Corporate insiders (CEO, CFO, directors, 10%+ holders) must report trades to the SEC. Billy tracks these filings:
- **Cluster buying** — Multiple insiders buying within days. Strong bullish signal.
- **Large purchases** — Single insider buying >$1M worth. Significant conviction.
- **Selling** — Less useful (insiders sell for many reasons), but large, unusual selling can signal trouble.
- **10b5-1 plans** — Pre-scheduled sales. Less informative than discretionary trades.

**Institutional Filings**

- **13F filings** — Quarterly disclosures by large investment managers. Shows what hedge funds and mutual funds own. Delayed (45 days after quarter-end) but useful for identifying positioning trends.
- **13D/G filings** — Filed when an investor acquires 5%+ of a company. Can signal activist interest or takeover potential.
- **Form 4** — Real-time insider transaction reports. The freshest signal.

**Whale Flow**

Options trades exceeding $1M in premium are flagged as whale trades. These typically come from institutional investors with deep research teams:
- Whale call buying = institutional bullishness
- Whale put buying = institutional hedging or bearishness
- Repeated whale trades at the same strike = high-conviction positioning

**Using Smart Money Data**

Smart money signals work best as a longer-term overlay:
- Insider buying clusters → Consider the stock for swing/position trades
- Whale options flow → Watch for confirmation from GEX and price action
- 13F trends → Understand what the big players are building

Don't blindly follow smart money — they have different time horizons and risk tolerances. Use their signals as one input among many.`,
    tryItLink: { hash: 'smartmoney', label: 'SharkMoney\u2122' },
  },
];

module.exports = { ARTICLES, CATEGORIES };
