/**
 * Command Center — DecisionSpace
 *
 * Flagship unified page: market thesis, translated signals, key levels,
 * price chart with level callouts, exposure chart, and trade ideas.
 *
 * Retail-friendly: all raw Greek metrics are translated into plain language.
 * Raw data still powers the derived signals internally.
 *
 * Exports:
 *   getPageCSS()  -> scoped CSS for #page-command
 *   getPageHTML() -> HTML fragment
 *   getPageJS()   -> client-side IIFE on SQ.command namespace
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * CSS
 * ────────────────────────────────────────────────────────────────────────── */
function getPageCSS() {
  return `
/* ── Command Center scoped styles ── */
#page-command {
  flex-direction: column; height: 100%; overflow-y: auto;
  font-family: var(--font-body, 'Inter', sans-serif);
}
#page-command.active { display: flex; }

/* ── Market State Bar ── */
#page-command .market-state-bar {
  display: flex; align-items: stretch; justify-content: space-between;
  padding: 0; flex-shrink: 0;
  background: var(--bg-surface); border-bottom: 1px solid var(--border);
  transition: background 0.3s ease;
}
#page-command .market-state-bar.bearish { background: rgba(239,68,68,0.08); }
#page-command .market-state-bar.bullish { background: rgba(34,197,94,0.08); }
#page-command .market-state-bar.neutral { background: rgba(234,179,8,0.08); }

#page-command .msb-section {
  display: flex; flex-direction: column; gap: 3px;
  padding: 12px 18px;
}
#page-command .msb-section + .msb-section {
  border-left: 1px solid var(--border);
}
#page-command .msb-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 8px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: var(--text-muted);
}
#page-command .msb-value {
  font-family: var(--font-heading, 'DM Sans', sans-serif);
  font-size: 14px; font-weight: 700; color: var(--text);
}
#page-command .msb-value.bearish { color: #ef4444; }
#page-command .msb-value.bullish { color: #22c55e; }
#page-command .msb-value.neutral { color: #eab308; }
#page-command .msb-sub {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 11px; color: var(--text-muted); line-height: 1.3;
}

#page-command .msb-ticker-price {
  display: flex; align-items: baseline; gap: 8px;
}
#page-command .msb-ticker {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 18px; font-weight: 700; color: var(--text);
}
#page-command .msb-price {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 14px; color: var(--text-muted);
}

#page-command .msb-levels {
  display: flex; flex-direction: column; gap: 2px;
}
#page-command .msb-level-row {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
}
#page-command .msb-level-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
#page-command .msb-level-name { color: var(--text-muted); }
#page-command .msb-level-price { font-weight: 600; color: var(--text); }

/* ── Market Thesis ── */
#page-command .market-thesis {
  padding: 14px 20px; background: var(--bg);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
#page-command .thesis-header {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: var(--accent, #fbbf24); margin-bottom: 6px;
}
#page-command .thesis-text {
  font-size: 13px; color: var(--text); line-height: 1.6;
}

/* ── Derived Signals Grid (replaces raw metrics) ── */
#page-command .signals-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  padding: 12px 20px; background: var(--bg); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
#page-command .signal-card {
  background: var(--glass, var(--bg-surface)); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: 3px;
  padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;
}
#page-command .signal-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 10px; color: var(--text-muted); font-weight: 500;
}
#page-command .signal-value {
  font-family: var(--font-heading, 'DM Sans', sans-serif);
  font-size: 14px; font-weight: 700; color: var(--text);
}
#page-command .signal-value.pos { color: var(--green, #22c55e); }
#page-command .signal-value.neg { color: var(--red, #ef4444); }
#page-command .signal-value.ntrl { color: var(--yellow, #eab308); }
#page-command .signal-sub {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px; color: var(--text-muted);
}

#page-command .data-ts {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px; color: var(--text-muted); padding: 4px 20px;
  text-align: right;
}

/* ── Key Level Callouts (under price chart) ── */
#page-command .key-levels-bar {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 10px 14px; background: var(--bg);
  border-top: 1px solid var(--border);
}
#page-command .kl-item {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 11px;
}
#page-command .kl-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
#page-command .kl-name { color: var(--text-muted); font-weight: 500; }
#page-command .kl-price { font-weight: 700; color: var(--text); }

/* ── Collapsible Panels ── */
#page-command .panels-area {
  flex: 1; overflow-y: auto; padding: 0 20px 20px;
}
#page-command .panel {
  border: 1px solid var(--border); border-radius: 3px;
  margin-top: 12px; overflow: hidden; background: var(--glass, var(--bg-surface)); backdrop-filter: blur(8px);
}
#page-command .panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; cursor: pointer; user-select: none;
  background: var(--bg-surface); border-bottom: 1px solid transparent;
  transition: background 0.15s;
}
#page-command .panel-header:hover { background: var(--bg); }
#page-command .panel-header .panel-title {
  font-family: var(--font-heading, 'DM Sans', sans-serif);
  font-size: 13px; font-weight: 600; color: var(--text);
}
#page-command .panel-header .panel-arrow {
  font-size: 12px; color: var(--text-muted); transition: transform 0.2s;
}
#page-command .panel.collapsed .panel-arrow { transform: rotate(-90deg); }
#page-command .panel.collapsed .panel-body { display: none; }
#page-command .panel-header:has(+ .panel-body) { border-bottom-color: var(--border); }
#page-command .panel.collapsed .panel-header { border-bottom-color: transparent; }
#page-command .panel-body {
  padding: 14px;
}
#page-command .panel-body .chart-container {
  width: 100%; height: 300px; position: relative;
}
#page-command .panel-body .chart-container canvas {
  width: 100% !important; height: 100% !important;
}
#page-command .chart-placeholder {
  display: flex; align-items: center; justify-content: center;
  height: 300px; color: var(--text-muted);
  font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 12px;
}

/* ── Trade Cards ── */
#page-command .trade-cards-list {
  display: flex; flex-direction: column; gap: 14px;
}
#page-command .tc-card {
  background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
  padding: 18px 20px; display: flex; flex-direction: column; gap: 14px;
  border-left: 4px solid var(--border); position: relative;
}
#page-command .tc-card.tc-call { border-left-color: #22c55e; }
#page-command .tc-card.tc-put { border-left-color: #ef4444; }
#page-command .tc-card.tc-top { box-shadow: 0 0 0 1px rgba(251,191,36,0.2); }

#page-command .tc-rank {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  color: var(--accent, #fbbf24); margin-bottom: -6px;
}
#page-command .tc-headline {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
#page-command .tc-trade-label {
  font-family: var(--font-heading, 'DM Sans', sans-serif);
  font-size: 11px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
}
#page-command .tc-direction {
  font-family: var(--font-heading, 'DM Sans', sans-serif);
  font-size: 18px; font-weight: 700;
}
#page-command .tc-direction.call { color: #22c55e; }
#page-command .tc-direction.put { color: #ef4444; }

#page-command .tc-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
#page-command .tc-section {
  display: flex; flex-direction: column; gap: 3px;
}
#page-command .tc-section-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: var(--text-muted);
}
#page-command .tc-section-value {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 13px; color: var(--text); line-height: 1.4;
}
#page-command .tc-targets {
  display: flex; flex-direction: column; gap: 2px;
}
#page-command .tc-target-line {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px; color: var(--text);
}
#page-command .tc-target-line .label { color: var(--text-muted); }

#page-command .tc-why {
  font-size: 12px; color: var(--text-muted); line-height: 1.6;
  padding: 10px 12px; background: var(--glass, var(--bg-surface)); backdrop-filter: blur(8px); border-radius: 3px;
  border-left: 2px solid var(--border);
}

#page-command .tc-meta {
  display: flex; gap: 14px; flex-wrap: wrap;
  font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 11px;
}
#page-command .tc-meta-item {
  display: flex; flex-direction: column; gap: 1px;
}
#page-command .tc-meta-label {
  font-size: 8px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: var(--text-muted);
}
#page-command .tc-meta-value { font-weight: 600; color: var(--text); }
#page-command .tc-meta-value.high { color: #22c55e; }
#page-command .tc-meta-value.medium { color: #eab308; }
#page-command .tc-meta-value.low { color: #ef4444; }

#page-command .tc-no-trade {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 30px 20px; text-align: center;
}
#page-command .tc-no-trade-title {
  font-family: var(--font-heading, 'DM Sans', sans-serif);
  font-size: 16px; font-weight: 700; color: var(--text);
}
#page-command .tc-no-trade-reason {
  font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 400px;
}

#page-command .tc-disclaimer {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 8px; color: var(--text-muted); text-align: center; font-style: italic;
  padding-top: 6px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  #page-command .signals-grid { grid-template-columns: repeat(2, 1fr); }
  #page-command .market-state-bar { flex-direction: column; }
  #page-command .msb-section + .msb-section { border-left: none; border-top: 1px solid var(--border); }
  #page-command .panels-area { padding: 0 12px 16px; }
  #page-command .key-levels-bar { flex-direction: column; align-items: flex-start; gap: 8px; }
}
`;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * HTML
 * ────────────────────────────────────────────────────────────────────────── */
function getPageHTML() {
  return `
<div id="page-command" class="page">

  <!-- Market State Bar (replaces old Regime Bar) -->
  <div class="market-state-bar" id="cmd-state-bar">
    <div class="msb-section">
      <span class="msb-label">Ticker</span>
      <div class="msb-ticker-price">
        <span class="msb-ticker" id="cmd-msb-ticker">SPY</span>
        <span class="msb-price" id="cmd-msb-price">--</span>
      </div>
    </div>
    <div class="msb-section">
      <span class="msb-label">Market State</span>
      <span class="msb-value" id="cmd-msb-state">--</span>
      <span class="msb-sub" id="cmd-msb-state-desc">Loading...</span>
    </div>
    <div class="msb-section">
      <span class="msb-label">Dealer Positioning</span>
      <span class="msb-value" id="cmd-msb-dealer">--</span>
      <span class="msb-sub" id="cmd-msb-dealer-desc"></span>
    </div>
    <div class="msb-section">
      <span class="msb-label">Key Levels</span>
      <div class="msb-levels" id="cmd-msb-levels">
        <div class="msb-level-row">
          <span class="msb-level-dot" style="background:#ef4444;"></span>
          <span class="msb-level-name">Support</span>
          <span class="msb-level-price" id="cmd-msb-support">--</span>
        </div>
        <div class="msb-level-row">
          <span class="msb-level-dot" style="background:#22c55e;"></span>
          <span class="msb-level-name">Resistance</span>
          <span class="msb-level-price" id="cmd-msb-resistance">--</span>
        </div>
      </div>
    </div>
    <div class="msb-section">
      <span class="msb-label">Expected Range</span>
      <span class="msb-value" id="cmd-msb-range">--</span>
    </div>
  </div>

  <!-- Market Thesis -->
  <div class="market-thesis" id="cmd-thesis-box">
    <div class="thesis-header">Today's Market Thesis</div>
    <div class="thesis-text" id="cmd-thesis-text">Analyzing market structure...</div>
  </div>

  <!-- Derived Signals (replaces raw GEX/DEX/VEX/CEX/HIRO/Flow) -->
  <div class="signals-grid">
    <div class="signal-card">
      <span class="signal-label">Dealer Positioning</span>
      <span class="signal-value" id="cmd-sig-dealer">--</span>
      <span class="signal-sub" id="cmd-sig-dealer-sub"></span>
    </div>
    <div class="signal-card">
      <span class="signal-label">Dealer Pressure</span>
      <span class="signal-value" id="cmd-sig-pressure">--</span>
      <span class="signal-sub" id="cmd-sig-pressure-sub"></span>
    </div>
    <div class="signal-card">
      <span class="signal-label">Volatility Regime</span>
      <span class="signal-value" id="cmd-sig-vol">--</span>
      <span class="signal-sub" id="cmd-sig-vol-sub"></span>
    </div>
    <div class="signal-card">
      <span class="signal-label">Options Flow</span>
      <span class="signal-value" id="cmd-sig-flow">--</span>
      <span class="signal-sub" id="cmd-sig-flow-sub"></span>
    </div>
  </div>

  <div class="data-ts" id="cmd-data-ts"></div>

  <!-- Collapsible Panels -->
  <div class="panels-area">

    <div class="panel" data-panel="chart">
      <div class="panel-header">
        <span class="panel-title">Price Chart + Key Levels</span>
        <span class="panel-arrow">&#9660;</span>
      </div>
      <div class="panel-body">
        <div class="chart-container"><canvas id="cmd-chart-price"></canvas></div>
        <div class="key-levels-bar" id="cmd-key-levels">
          <div class="kl-item">
            <span class="kl-dot" style="background:#ef4444;"></span>
            <span class="kl-name">Support:</span>
            <span class="kl-price" id="cmd-kl-support">--</span>
          </div>
          <div class="kl-item">
            <span class="kl-dot" style="background:#eab308;"></span>
            <span class="kl-name">Pivot:</span>
            <span class="kl-price" id="cmd-kl-pivot">--</span>
          </div>
          <div class="kl-item">
            <span class="kl-dot" style="background:#22c55e;"></span>
            <span class="kl-name">Resistance:</span>
            <span class="kl-price" id="cmd-kl-resistance">--</span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel" data-panel="exposure">
      <div class="panel-header">
        <span class="panel-title">Where Is the Market Pinned?</span>
        <span class="panel-arrow">&#9660;</span>
      </div>
      <div class="panel-body">
        <div class="chart-container"><canvas id="cmd-chart-exposure"></canvas></div>
      </div>
    </div>

    <div class="panel" data-panel="flow-timeline">
      <div class="panel-header">
        <span class="panel-title">Options Flow Timeline</span>
        <span class="panel-arrow">&#9660;</span>
      </div>
      <div class="panel-body">
        <div class="chart-container"><canvas id="cmd-chart-flow"></canvas></div>
      </div>
    </div>

    <div class="panel collapsed" data-panel="key-strikes">
      <div class="panel-header">
        <span class="panel-title">Level Movement Over Time</span>
        <span class="panel-arrow">&#9660;</span>
      </div>
      <div class="panel-body">
        <div class="chart-container"><canvas id="cmd-chart-strikes"></canvas></div>
      </div>
    </div>

    <div class="panel collapsed" data-panel="iv-rank">
      <div class="panel-header">
        <span class="panel-title">Volatility History</span>
        <span class="panel-arrow">&#9660;</span>
      </div>
      <div class="panel-body">
        <div class="chart-container"><canvas id="cmd-chart-iv"></canvas></div>
      </div>
    </div>

    <div class="panel" data-panel="top-plays">
      <div class="panel-header">
        <span class="panel-title">Trade Ideas</span>
        <span class="panel-arrow">&#9660;</span>
      </div>
      <div class="panel-body">
        <div class="trade-cards-list" id="cmd-trade-cards">
          <div class="chart-placeholder">Scanning for trade ideas...</div>
        </div>
        <div class="tc-disclaimer">Not financial advice. Decision support tool only.</div>
      </div>
    </div>

  </div>

</div>
`;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * JS (client-side IIFE)
 * ────────────────────────────────────────────────────────────────────────── */
function getPageJS() {
  return `
(function() {
  'use strict';

  var _interval = null;
  var _charts = {};
  var _socketHandlers = {};
  var _ticker = 'SPY';
  var _lastRegime = null;

  /* ── Helpers ── */

  function _fmt(val) {
    if (val == null || isNaN(val)) return '--';
    var abs = Math.abs(val);
    if (abs >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    return val.toFixed(2);
  }

  function _el(id) { return document.getElementById(id); }

  /* ── Regime name translation (internal → retail-friendly) ── */

  function _translateRegime(regimeText) {
    var r = (regimeText || '').toLowerCase();
    if (r.indexOf('short') !== -1 || r.indexOf('waterfall') !== -1 || r.indexOf('crash') !== -1) return 'Fast Moves Likely';
    if (r.indexOf('breakout') !== -1) return 'Breakout Setup';
    if (r.indexOf('long') !== -1 || r.indexOf('stable') !== -1 || r.indexOf('pin') !== -1) return 'Mean Reversion Likely';
    if (r.indexOf('fragile') !== -1) return 'Fragile — Caution';
    if (r.indexOf('chop') !== -1 || r.indexOf('neutral') !== -1) return 'Chop / Range Market';
    if (r.indexOf('bear') !== -1) return 'Bearish Pressure';
    if (r.indexOf('bull') !== -1) return 'Bullish Pressure';
    return regimeText || '--';
  }

  function _regimeDescription(regimeText) {
    var r = (regimeText || '').toLowerCase();
    if (r.indexOf('short') !== -1 || r.indexOf('waterfall') !== -1) return 'Dealers are hedging aggressively — price moves may accelerate in either direction.';
    if (r.indexOf('breakout') !== -1) return 'Price is near a critical level — a breakout could trigger a fast directional move.';
    if (r.indexOf('long') !== -1 || r.indexOf('stable') !== -1 || r.indexOf('pin') !== -1) return 'Dealers are suppressing volatility — price tends to stay in a range and revert to key levels.';
    if (r.indexOf('fragile') !== -1) return 'Market structure is unstable — exercise extra caution with directional trades.';
    if (r.indexOf('chop') !== -1 || r.indexOf('neutral') !== -1) return 'No clear directional edge — market is likely to chop sideways.';
    return '';
  }

  function _biasClass(bias) {
    var b = (bias || '').toLowerCase();
    if (b.indexOf('bear') !== -1) return 'bearish';
    if (b.indexOf('bull') !== -1) return 'bullish';
    return 'neutral';
  }

  /* ── Market State Bar ── */

  function _renderMarketState(v) {
    if (!v) return;
    _lastRegime = v;

    var bar = _el('cmd-state-bar');
    var bias = (v.bias || v.direction || '').toLowerCase();
    var regimeText = v.regime || v.label || bias || '--';

    // Color the bar
    bar.className = 'market-state-bar ' + _biasClass(bias);

    // Ticker + Price
    _el('cmd-msb-ticker').textContent = v.ticker || _ticker;
    var spot = v.spot || (v.components && v.components.spot) || null;
    _el('cmd-msb-price').textContent = spot ? '$' + Number(spot).toFixed(2) : '--';

    // Market State (translated)
    var stateEl = _el('cmd-msb-state');
    stateEl.textContent = _translateRegime(regimeText);
    stateEl.className = 'msb-value ' + _biasClass(bias);
    _el('cmd-msb-state-desc').textContent = _regimeDescription(regimeText);

    // Dealer Positioning
    var dealerEl = _el('cmd-msb-dealer');
    var dealerDescEl = _el('cmd-msb-dealer-desc');
    var r = (regimeText || '').toLowerCase();
    if (r.indexOf('short') !== -1 || r.indexOf('waterfall') !== -1 || r.indexOf('breakout') !== -1) {
      dealerEl.textContent = 'Short Gamma';
      dealerEl.className = 'msb-value neg';
      dealerDescEl.textContent = 'Dealers likely amplify moves';
    } else if (r.indexOf('long') !== -1 || r.indexOf('stable') !== -1 || r.indexOf('pin') !== -1) {
      dealerEl.textContent = 'Long Gamma';
      dealerEl.className = 'msb-value pos';
      dealerDescEl.textContent = 'Dealers likely suppress volatility';
    } else {
      dealerEl.textContent = 'Neutral';
      dealerEl.className = 'msb-value ntrl';
      dealerDescEl.textContent = 'Mixed dealer positioning';
    }

    // Key Levels
    var flip = v.flip != null ? v.flip : (v.keyLevels && v.keyLevels.gammaFlip != null ? v.keyLevels.gammaFlip : null);
    var callWall = v.keyLevels && v.keyLevels.callWall != null ? v.keyLevels.callWall : null;
    var putWall = v.keyLevels && v.keyLevels.putWall != null ? v.keyLevels.putWall : null;

    var support = putWall || (flip && spot && flip < spot ? flip : null);
    var resistance = callWall || (flip && spot && flip > spot ? flip : null);
    _el('cmd-msb-support').textContent = support != null ? '$' + Number(support).toFixed(0) : '--';
    _el('cmd-msb-resistance').textContent = resistance != null ? '$' + Number(resistance).toFixed(0) : '--';

    // Expected Range
    var rangeLow = v.rangeLow != null ? v.rangeLow : (v.expectedMove && v.expectedMove.lower != null ? v.expectedMove.lower : null);
    var rangeHigh = v.rangeHigh != null ? v.rangeHigh : (v.expectedMove && v.expectedMove.upper != null ? v.expectedMove.upper : null);
    if (rangeLow != null && rangeHigh != null) {
      _el('cmd-msb-range').textContent = '$' + Number(rangeLow).toFixed(0) + ' — $' + Number(rangeHigh).toFixed(0);
    } else if (v.range) {
      _el('cmd-msb-range').textContent = v.range;
    }

    // Key Level Callouts (under price chart)
    _el('cmd-kl-support').textContent = support != null ? '$' + Number(support).toFixed(2) : '--';
    _el('cmd-kl-pivot').textContent = flip != null ? '$' + Number(flip).toFixed(2) : '--';
    _el('cmd-kl-resistance').textContent = resistance != null ? '$' + Number(resistance).toFixed(2) : '--';

    // Generate Market Thesis
    _generateThesis(v, spot, flip, callWall, putWall, rangeLow, rangeHigh);
  }

  /* ── Market Thesis (auto-generated narrative) ── */

  function _generateThesis(v, spot, flip, callWall, putWall, rangeLow, rangeHigh) {
    var thesisEl = _el('cmd-thesis-text');
    if (!thesisEl || !spot) return;

    var ticker = v.ticker || _ticker;
    var regimeText = (v.regime || v.label || '').toLowerCase();
    var bias = (v.bias || v.direction || '').toLowerCase();
    var sentences = [];

    // Position relative to gamma flip
    if (flip) {
      if (spot > flip) {
        sentences.push(ticker + ' is trading above the key pivot at $' + Number(flip).toFixed(0) + ', which supports upside momentum.');
      } else if (spot < flip) {
        sentences.push(ticker + ' is trading below the key pivot at $' + Number(flip).toFixed(0) + ', which increases downside risk.');
      } else {
        sentences.push(ticker + ' is sitting right at the key pivot ($' + Number(flip).toFixed(0) + ') — a decision point for direction.');
      }
    }

    // Dealer hedging implication
    if (regimeText.indexOf('short') !== -1 || regimeText.indexOf('waterfall') !== -1) {
      if (bias.indexOf('bear') !== -1 && putWall) {
        sentences.push('If price breaks below $' + Number(putWall).toFixed(0) + ', dealer hedging may accelerate downside momentum.');
      } else if (bias.indexOf('bull') !== -1 && callWall) {
        sentences.push('If price breaks above $' + Number(callWall).toFixed(0) + ', dealer hedging may accelerate upside momentum.');
      } else {
        sentences.push('Dealer positioning is amplifying moves — be ready for fast price action in either direction.');
      }
    } else if (regimeText.indexOf('long') !== -1 || regimeText.indexOf('stable') !== -1 || regimeText.indexOf('pin') !== -1) {
      sentences.push('Dealers are suppressing volatility, so price tends to revert toward key levels rather than trend.');
    } else if (regimeText.indexOf('fragile') !== -1) {
      sentences.push('Market structure is fragile — avoid large directional bets until positioning stabilizes.');
    }

    // Expected range
    if (rangeLow != null && rangeHigh != null) {
      sentences.push('Expected behavior: Range between $' + Number(rangeLow).toFixed(0) + ' and $' + Number(rangeHigh).toFixed(0) + ' unless a breakout occurs.');
    }

    thesisEl.textContent = sentences.length > 0 ? sentences.join(' ') : 'Analyzing market structure...';
  }

  /* ── Derived Signals (translated from raw metrics) ── */

  function _updateDerivedSignals(exp) {
    if (!exp || exp.error) return;

    // Extract raw values (support flat and nested formats)
    function _raw(field) {
      var val = exp[field];
      if (val != null && typeof val === 'object' && val.net != null) return val.net;
      if (val == null && exp.metrics) val = exp.metrics[field];
      return val != null ? Number(val) : null;
    }

    var gex = _raw('gex');
    var dex = _raw('dex');
    var vex = _raw('vex');
    var hiro = _raw('hiro');
    var flow = _raw('flow');

    // 1. Dealer Positioning (from GEX sign)
    var dealerEl = _el('cmd-sig-dealer');
    var dealerSubEl = _el('cmd-sig-dealer-sub');
    if (gex != null) {
      if (gex > 0) {
        dealerEl.textContent = 'Long Gamma';
        dealerEl.className = 'signal-value pos';
        dealerSubEl.textContent = 'Suppressing volatility';
      } else if (gex < 0) {
        dealerEl.textContent = 'Short Gamma';
        dealerEl.className = 'signal-value neg';
        dealerSubEl.textContent = 'Amplifying moves';
      } else {
        dealerEl.textContent = 'Neutral';
        dealerEl.className = 'signal-value ntrl';
        dealerSubEl.textContent = '';
      }
    }

    // 2. Dealer Pressure (from DEX direction)
    var pressureEl = _el('cmd-sig-pressure');
    var pressureSubEl = _el('cmd-sig-pressure-sub');
    if (dex != null) {
      if (dex > 0) {
        pressureEl.textContent = 'Upside Support';
        pressureEl.className = 'signal-value pos';
        pressureSubEl.textContent = 'Dealers supporting price';
      } else if (dex < 0) {
        pressureEl.textContent = 'Downside Pressure';
        pressureEl.className = 'signal-value neg';
        pressureSubEl.textContent = 'Dealers pushing price down';
      } else {
        pressureEl.textContent = 'Balanced';
        pressureEl.className = 'signal-value ntrl';
        pressureSubEl.textContent = '';
      }
    }

    // 3. Volatility Regime (from VEX)
    var volEl = _el('cmd-sig-vol');
    var volSubEl = _el('cmd-sig-vol-sub');
    if (vex != null) {
      if (vex > 0) {
        volEl.textContent = 'Suppressed';
        volEl.className = 'signal-value pos';
        volSubEl.textContent = 'Volatility likely to stay low';
      } else if (vex < 0) {
        volEl.textContent = 'Expanding';
        volEl.className = 'signal-value neg';
        volSubEl.textContent = 'Volatility likely increasing';
      } else {
        volEl.textContent = 'Stable';
        volEl.className = 'signal-value ntrl';
        volSubEl.textContent = '';
      }
    }

    // 4. Options Flow (from HIRO + flow)
    var flowEl = _el('cmd-sig-flow');
    var flowSubEl = _el('cmd-sig-flow-sub');
    var flowSignal = hiro != null ? hiro : flow;
    if (flowSignal != null) {
      if (flowSignal > 0) {
        flowEl.textContent = 'Call Dominant';
        flowEl.className = 'signal-value pos';
        flowSubEl.textContent = 'Bullish hedging flow';
      } else if (flowSignal < 0) {
        flowEl.textContent = 'Put Dominant';
        flowEl.className = 'signal-value neg';
        flowSubEl.textContent = 'Bearish hedging flow';
      } else {
        flowEl.textContent = 'Mixed';
        flowEl.className = 'signal-value ntrl';
        flowSubEl.textContent = '';
      }
    }
  }

  /* ── Trade Cards (simplified retail-friendly trade ideas) ── */

  var _lastTradeCardsFetch = 0;
  var _tradeCardsData = null;

  function _renderTradeCards() {
    var container = _el('cmd-trade-cards');
    if (!container) return;

    if (!_tradeCardsData) {
      var status = (typeof SQ !== 'undefined' && SQ.marketStatus) || 'unknown';
      var msg, sub;
      if (status === 'closed' || status === 'afterhours') {
        msg = 'Market Closed'; sub = 'Trade ideas update at market open';
      } else if (status === 'premarket') {
        msg = 'Pre-Market'; sub = 'Trade ideas activate at 9:30 AM ET';
      } else {
        msg = 'Scanning for trade ideas...'; sub = 'Analyzing options positioning';
      }
      container.innerHTML = '<div class="chart-placeholder" style="flex-direction:column;gap:6px;height:auto;padding:30px 0;">' + msg
        + '<div style="font-size:10px;color:var(--text-muted);">' + sub + '</div></div>';
      return;
    }

    var data = _tradeCardsData;

    // No trade scenario
    if (data.noTrade) {
      container.innerHTML = '<div class="tc-no-trade">'
        + '<div class="tc-no-trade-title">NO TRADE RIGHT NOW</div>'
        + '<div class="tc-no-trade-reason">' + (data.reason || '') + '</div>'
        + (data.marketType ? '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-top:4px;">Market: ' + data.marketType + '</div>' : '')
        + '</div>';
      return;
    }

    if (!data.cards || data.cards.length === 0) {
      container.innerHTML = '<div class="chart-placeholder">No setups found</div>';
      return;
    }

    container.innerHTML = data.cards.map(function(card, idx) {
      var dirClass = card.direction === 'PUT' ? 'put' : 'call';
      var topClass = idx === 0 ? ' tc-top' : '';
      var confClass = card.confidence === 'High' ? 'high' : card.confidence === 'Low' ? 'low' : 'medium';

      return '<div class="tc-card tc-' + dirClass + topClass + '">'
        + '<div class="tc-rank">' + card.rank + '</div>'
        + '<div class="tc-headline">'
          + '<span class="tc-trade-label">Trade Idea</span>'
          + '<span class="tc-direction ' + dirClass + '">' + card.ticker + ' ' + card.direction + '</span>'
        + '</div>'

        + '<div class="tc-grid">'
          + '<div class="tc-section">'
            + '<span class="tc-section-label">Entry</span>'
            + '<span class="tc-section-value">' + card.entry + '</span>'
          + '</div>'
          + '<div class="tc-section">'
            + '<span class="tc-section-label">Stop Loss</span>'
            + '<span class="tc-section-value" style="color:var(--red,#ef4444);">' + card.stopLoss + '</span>'
          + '</div>'
        + '</div>'

        + '<div class="tc-section">'
          + '<span class="tc-section-label">Targets</span>'
          + '<div class="tc-targets">'
            + '<span class="tc-target-line"><span class="label">First target: </span>$' + Number(card.targets.first).toFixed(2) + '</span>'
            + '<span class="tc-target-line"><span class="label">Main target: </span>$' + Number(card.targets.main).toFixed(2) + '</span>'
          + '</div>'
        + '</div>'

        + '<div class="tc-why">' + card.why + '</div>'

        + '<div class="tc-meta">'
          + '<div class="tc-meta-item"><span class="tc-meta-label">Confidence</span><span class="tc-meta-value ' + confClass + '">' + card.confidence + '</span></div>'
          + '<div class="tc-meta-item"><span class="tc-meta-label">Market</span><span class="tc-meta-value">' + card.marketType + '</span></div>'
          + '<div class="tc-meta-item"><span class="tc-meta-label">Timeframe</span><span class="tc-meta-value">' + card.timeframe + '</span></div>'
        + '</div>'
      + '</div>';
    }).join('');
  }

  function _fetchTradeCards() {
    if (Date.now() - _lastTradeCardsFetch < 30000) return;
    _lastTradeCardsFetch = Date.now();
    var headers = {};
    if (window.DASHBOARD_API_KEY) headers['x-api-key'] = window.DASHBOARD_API_KEY;
    fetch('/api/trade-cards/' + _ticker, { headers: headers, credentials: 'include' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (data) _tradeCardsData = data;
        _renderTradeCards();
      })
      .catch(function() { _renderTradeCards(); });
  }

  /* ── Collapsible Panels ── */

  var _PANEL_VERSION = 4; // bump to reset saved panel state
  function _getPanelState() {
    try {
      var s = localStorage.getItem('sq_cmd_panels');
      var parsed = s ? JSON.parse(s) : null;
      if (parsed && parsed._v !== _PANEL_VERSION) return null;
      return parsed;
    } catch(e) { return null; }
  }

  function _savePanelState(state) {
    try { state._v = _PANEL_VERSION; localStorage.setItem('sq_cmd_panels', JSON.stringify(state)); } catch(e) {}
  }

  function _bindPanels() {
    var defaults = {
      'chart': true, 'top-plays': true,
      'exposure': true, 'flow-timeline': true,
      'key-strikes': false, 'iv-rank': false
    };
    var saved = _getPanelState() || defaults;

    var panels = document.querySelectorAll('#page-command .panel');
    panels.forEach(function(panel) {
      var key = panel.getAttribute('data-panel');
      if (saved[key] === false) {
        panel.classList.add('collapsed');
      } else {
        panel.classList.remove('collapsed');
      }

      var header = panel.querySelector('.panel-header');
      header.addEventListener('click', function() {
        panel.classList.toggle('collapsed');
        var st = _getPanelState() || {};
        st[key] = !panel.classList.contains('collapsed');
        _savePanelState(st);
        if (!panel.classList.contains('collapsed')) {
          _redrawPanelChart(key);
        }
      });
    });
  }

  function _redrawPanelChart() {
    _lastPriceUpdate = 0;
    _lastFlowUpdate = 0;
    _lastStrikesUpdate = 0;
    _ivLoaded = false;
    _fetch();
  }

  /* ── Data Fetch ── */

  function _fetch() {
    var headers = {};
    if (window.DASHBOARD_API_KEY) {
      headers['x-api-key'] = window.DASHBOARD_API_KEY;
    }
    var opts = { headers: headers, credentials: 'include' };

    Promise.all([
      fetch('/api/regime/' + _ticker, opts).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
      fetch('/api/exposure/' + _ticker, opts).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; })
    ]).then(function(results) {
      _renderMarketState(results[0]);

      // Merge regime components into exposure for signal derivation
      var expData = results[1] && !results[1].error ? results[1] : {};
      var regime = results[0];
      if (regime && regime.components) {
        if (expData.gex == null && regime.components.netGEX != null) expData.gex = regime.components.netGEX;
        if (expData.dex == null && regime.components.netDEX != null) expData.dex = regime.components.netDEX;
        if (expData.vex == null && regime.components.netVEX != null) expData.vex = regime.components.netVEX;
        if (expData.cex == null && regime.components.netCEX != null) expData.cex = regime.components.netCEX;
        if (expData.hiro == null && regime.components.netHIRO != null) expData.hiro = regime.components.netHIRO;
      }
      _updateDerivedSignals(expData);

      // Update freshness timestamp
      var tsEl = document.getElementById('cmd-data-ts');
      if (tsEl) {
        tsEl.textContent = 'Updated: ' + new Date().toLocaleTimeString('en-US', { hour12: false });
        tsEl.className = 'data-ts';
      }

      // Exposure chart
      var exposureRes = results[1] && !results[1].error ? results[1] : null;
      if (exposureRes && exposureRes.dex && exposureRes.dex.byStrike) {
        _renderExposureChart(exposureRes);
      } else if (!_charts.exposure) {
        var expCtx = _el('cmd-chart-exposure');
        if (expCtx && expCtx.parentElement) expCtx.parentElement.innerHTML = '<div class="chart-placeholder">Exposure data available during market hours</div>';
      }

      // Price chart (throttled to every 15s)
      if (!_lastPriceUpdate || Date.now() - _lastPriceUpdate > 15000) {
        _lastPriceUpdate = Date.now();
        _fetchAndRenderPriceChart(results[0]);
      }

      // Flow timeline (throttled to every 10s)
      if (!_lastFlowUpdate || Date.now() - _lastFlowUpdate > 10000) {
        _lastFlowUpdate = Date.now();
        _fetchAndRenderFlowChart();
      }

      // Key Strikes chart (throttled to every 30s, skip if panel collapsed)
      var strikesPanel = document.querySelector('#page-command [data-panel="key-strikes"]');
      if ((!_lastStrikesUpdate || Date.now() - _lastStrikesUpdate > 30000) && strikesPanel && !strikesPanel.classList.contains('collapsed')) {
        _renderStrikesChart();
        _lastStrikesUpdate = Date.now();
      }

      // Trade Cards (throttled to every 30s)
      _fetchTradeCards();

      // IV chart (load once per session, skip if panel collapsed)
      var ivPanel = document.querySelector('#page-command [data-panel="iv-rank"]');
      if (!_ivLoaded && ivPanel && !ivPanel.classList.contains('collapsed')) {
        _ivLoaded = true;
        var ivHeaders = {};
        if (window.DASHBOARD_API_KEY) ivHeaders['x-api-key'] = window.DASHBOARD_API_KEY;
        fetch('/api/iv/' + _ticker, { headers: ivHeaders, credentials: 'include' })
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(iv) {
            if (iv && iv.history && iv.history.length > 0) {
              _renderIVChart(iv);
            } else {
              var ctx = _el('cmd-chart-iv');
              if (ctx && ctx.parentElement) ctx.parentElement.innerHTML = '<div class="chart-placeholder">Volatility history building — data accumulates over time</div>';
            }
          })
          .catch(function() {
            var ivCtx = _el('cmd-chart-iv');
            if (ivCtx && ivCtx.parentElement) ivCtx.parentElement.innerHTML = '<div class="chart-placeholder">Volatility history unavailable</div>';
          });
      }
    });
  }

  /* ── Socket.IO Listeners ── */

  function _bindSocket() {
    if (!SQ.socket) return;

    _socketHandlers['scanner:update'] = function() {
      _lastTradeCardsFetch = 0;
      _fetchTradeCards();
    };
    _socketHandlers['exposure:update'] = function(data) {
      if (data && (data.ticker === _ticker || !data.ticker)) {
        _updateDerivedSignals(data);
      }
    };

    Object.keys(_socketHandlers).forEach(function(evt) {
      SQ.socket.on(evt, _socketHandlers[evt]);
    });
  }

  function _unbindSocket() {
    if (!SQ.socket) return;
    Object.keys(_socketHandlers).forEach(function(evt) {
      SQ.socket.off(evt, _socketHandlers[evt]);
    });
    _socketHandlers = {};
  }

  /* ── Chart: Exposure by Strike (enhanced with key level highlights) ── */

  function _renderExposureChart(exp) {
    var ctx = _el('cmd-chart-exposure');
    if (!ctx) return;

    var strikes = exp.dex.byStrike.map(function(s) { return s.strike; });
    var dexData = exp.dex.byStrike.map(function(s) { return s.value != null ? s.value : s.net; });

    // Find key levels for annotation
    var maxPos = -Infinity, maxPosStrike = null;
    var maxNeg = Infinity, maxNegStrike = null;
    dexData.forEach(function(v, i) {
      if (v > maxPos) { maxPos = v; maxPosStrike = strikes[i]; }
      if (v < maxNeg) { maxNeg = v; maxNegStrike = strikes[i]; }
    });

    // Color bars: highlight largest call wall (green) and put wall (red) with stronger opacity
    var barColors = dexData.map(function(v, i) {
      if (strikes[i] === maxPosStrike && v > 0) return 'rgba(34,197,94,0.9)';
      if (strikes[i] === maxNegStrike && v < 0) return 'rgba(239,68,68,0.9)';
      return v >= 0 ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)';
    });

    // Border to highlight key strikes
    var barBorders = dexData.map(function(v, i) {
      if (strikes[i] === maxPosStrike && v > 0) return '#22c55e';
      if (strikes[i] === maxNegStrike && v < 0) return '#ef4444';
      return 'transparent';
    });
    var barBorderWidths = dexData.map(function(v, i) {
      if (strikes[i] === maxPosStrike || strikes[i] === maxNegStrike) return 2;
      return 0;
    });

    if (_charts.exposure) {
      _charts.exposure.data.labels = strikes;
      _charts.exposure.data.datasets[0].data = dexData;
      _charts.exposure.data.datasets[0].backgroundColor = barColors;
      _charts.exposure.data.datasets[0].borderColor = barBorders;
      _charts.exposure.data.datasets[0].borderWidth = barBorderWidths;
      _charts.exposure.update('none');
      return;
    }

    // Find spot price for annotation line
    var spotPrice = _lastRegime && _lastRegime.spot ? _lastRegime.spot : (exp.spot || null);
    var annotations = {};
    if (spotPrice) {
      annotations.spotLine = {
        type: 'line', scaleID: 'x',
        value: spotPrice, borderColor: '#f8fafc',
        borderWidth: 2, borderDash: [4, 4],
        label: { display: true, content: 'Price', position: 'start', backgroundColor: 'rgba(248,250,252,0.15)', color: '#f8fafc', font: { size: 10 } }
      };
    }

    _charts.exposure = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: strikes,
        datasets: [{
          label: 'Options Positioning',
          data: dexData,
          backgroundColor: barColors,
          borderColor: barBorders,
          borderWidth: barBorderWidths,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          annotation: Object.keys(annotations).length > 0 ? { annotations: annotations } : undefined,
          tooltip: {
            callbacks: {
              title: function(items) { return 'Strike: $' + items[0].label; },
              label: function(item) {
                var v = item.raw;
                var dir = v >= 0 ? 'Call Wall' : 'Put Wall';
                return dir + ': ' + _fmt(Math.abs(v));
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8', callback: function(v) { var a = Math.abs(v); return a >= 1e9 ? (v/1e9).toFixed(1)+'B' : a >= 1e6 ? (v/1e6).toFixed(1)+'M' : a >= 1e3 ? (v/1e3).toFixed(0)+'K' : v; } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  /* ── Chart: Price + Key Levels ── */

  function _fetchAndRenderPriceChart(regimeData) {
    var headers = {};
    if (window.DASHBOARD_API_KEY) headers['x-api-key'] = window.DASHBOARD_API_KEY;
    fetch('/api/bars/' + _ticker + '?timeframe=5Min&limit=78', { headers: headers, credentials: 'include' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(bars) {
        if (!bars || !bars.length) return;
        var ctx = _el('cmd-chart-price');
        if (!ctx) return;
        if (_charts.price) _charts.price.destroy();

        var labels = bars.map(function(b) { return new Date(b.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); });
        var prices = bars.map(function(b) { return b.close; });
        var vwaps = bars.map(function(b) { return b.vwap; });

        var datasets = [
          { label: 'Price', data: prices, borderColor: '#f8fafc', pointRadius: 0, borderWidth: 2, yAxisID: 'y', tension: 0.1 },
          { label: 'VWAP', data: vwaps, borderColor: '#fbbf24', pointRadius: 0, borderWidth: 1.5, borderDash: [4, 2], yAxisID: 'y', tension: 0.1 }
        ];

        // Add key levels with retail-friendly names
        if (regimeData && regimeData.keyLevels) {
          var kl = regimeData.keyLevels;
          if (kl.gammaFlip) {
            datasets.push({ label: 'Pivot Level', data: bars.map(function() { return kl.gammaFlip; }), borderColor: '#eab308', pointRadius: 0, borderWidth: 2, borderDash: [5, 5], yAxisID: 'y' });
          }
          if (kl.callWall) {
            datasets.push({ label: 'Resistance', data: bars.map(function() { return kl.callWall; }), borderColor: '#22c55e', pointRadius: 0, borderWidth: 2, borderDash: [3, 3], yAxisID: 'y' });
          }
          if (kl.putWall) {
            datasets.push({ label: 'Support', data: bars.map(function() { return kl.putWall; }), borderColor: '#ef4444', pointRadius: 0, borderWidth: 2, borderDash: [3, 3], yAxisID: 'y' });
          }
        }

        _charts.price = new Chart(ctx, {
          type: 'line',
          data: { labels: labels, datasets: datasets },
          options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
            scales: {
              x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 12 }, grid: { display: false } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
          }
        });
      })
      .catch(function() {});
  }

  /* ── Chart: Flow Timeline ── */

  function _fetchAndRenderFlowChart() {
    var headers = {};
    if (window.DASHBOARD_API_KEY) headers['x-api-key'] = window.DASHBOARD_API_KEY;
    fetch('/api/flow/' + _ticker + '?minutes=30', { headers: headers, credentials: 'include' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(flow) {
        var ctx = _el('cmd-chart-flow');
        if (!ctx) return;
        if (!flow) {
          if (!_charts.flow && ctx.parentElement) ctx.parentElement.innerHTML = '<div class="chart-placeholder">Flow data available during market hours</div>';
          return;
        }
        if (_charts.flow) _charts.flow.destroy();

        var trades = flow.trades || flow.timeline || (Array.isArray(flow) ? flow : []);
        if (!trades.length) {
          var status = (typeof SQ !== 'undefined' && SQ.marketStatus) || 'unknown';
          var flowParent = ctx.parentElement;
          if (flowParent) {
            var flowMsg = status === 'open' ? 'Awaiting flow data...' : 'Flow data available during market hours';
            flowParent.innerHTML = '<div class="chart-placeholder">' + flowMsg + '</div>';
          }
          return;
        }

        var buckets = {};
        trades.forEach(function(t) {
          var ts = t.timestamp || t.ts || t.time;
          if (!ts) return;
          var d = new Date(ts);
          var key = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
          if (!buckets[key]) buckets[key] = { calls: 0, puts: 0 };
          var premium = Math.abs(t.premium || t.notional || (t.price * t.size * 100) || 0);
          if (t.type === 'call' || t.optionType === 'call') buckets[key].calls += premium;
          else buckets[key].puts += premium;
        });

        var keys = Object.keys(buckets).sort();
        if (!keys.length) return;
        var callData = keys.map(function(k) { return buckets[k].calls; });
        var putData = keys.map(function(k) { return -buckets[k].puts; });

        _charts.flow = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: keys,
            datasets: [
              { label: 'Call Flow', data: callData, backgroundColor: 'rgba(34,197,94,0.6)', barPercentage: 0.8 },
              { label: 'Put Flow', data: putData, backgroundColor: 'rgba(239,68,68,0.6)', barPercentage: 0.8 }
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
            scales: {
              x: { stacked: true, ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 12 }, grid: { display: false } },
              y: { stacked: true, ticks: { color: '#94a3b8', callback: function(v) { var a = Math.abs(v); return a >= 1e6 ? (v/1e6).toFixed(1)+'M' : a >= 1e3 ? (v/1e3).toFixed(0)+'K' : v; } }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
          }
        });
      })
      .catch(function() {
        var flowCtx = _el('cmd-chart-flow');
        if (flowCtx && flowCtx.parentElement && !_charts.flow) flowCtx.parentElement.innerHTML = '<div class="chart-placeholder">Flow data available during market hours</div>';
      });
  }

  /* ── Chart: Key Strikes Evolution ── */

  var _lastStrikesUpdate = 0;
  var _lastPriceUpdate = 0;
  var _lastFlowUpdate = 0;

  function _renderStrikesChart() {
    var headers = {};
    if (window.DASHBOARD_API_KEY) headers['x-api-key'] = window.DASHBOARD_API_KEY;
    fetch('/api/regime/' + _ticker + '/strikes', { headers: headers, credentials: 'include' })
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(history) {
        if (!history || !history.length) return;
        var ctx = _el('cmd-chart-strikes');
        if (!ctx) return;
        if (_charts.strikes) _charts.strikes.destroy();

        var labels = history.map(function(h) { return new Date(h.ts).toLocaleTimeString(); });
        _charts.strikes = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              { label: 'Resistance', data: history.map(function(h) { return h.callWall; }), borderColor: '#22c55e', pointRadius: 0, borderWidth: 2 },
              { label: 'Support', data: history.map(function(h) { return h.putWall; }), borderColor: '#ef4444', pointRadius: 0, borderWidth: 2 },
              { label: 'Pivot', data: history.map(function(h) { return h.gammaFlip; }), borderColor: '#eab308', pointRadius: 0, borderWidth: 2, borderDash: [5, 5] },
              { label: 'Price', data: history.map(function(h) { return h.spot; }), borderColor: '#f8fafc', pointRadius: 0, borderWidth: 1.5 }
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
            scales: {
              x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 10 }, grid: { display: false } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
          }
        });
      })
      .catch(function() {});
  }

  /* ── Chart: IV Rank History ── */

  var _ivLoaded = false;

  function _renderIVChart(iv) {
    var ctx = _el('cmd-chart-iv');
    if (!ctx) return;
    if (_charts.iv) _charts.iv.destroy();

    var labels = iv.history.map(function(h) { return h.date; });
    var data = iv.history.map(function(h) { return (h.atmIV * 100).toFixed(1); });

    _charts.iv = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{ label: 'ATM IV %', data: data, borderColor: '#fbbf24', pointRadius: 0, borderWidth: 2, fill: true, backgroundColor: 'rgba(251,191,36,0.1)' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: 'IV Rank: ' + (iv.rank != null ? iv.rank : '--') + '% | Percentile: ' + (iv.percentile != null ? iv.percentile : '--') + '%', color: '#94a3b8', font: { size: 12 } } },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 10 }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8', callback: function(v) { return v + '%'; } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  /* ── Chart Cleanup ── */

  function _destroyCharts() {
    Object.keys(_charts).forEach(function(k) {
      if (_charts[k] && typeof _charts[k].destroy === 'function') {
        _charts[k].destroy();
      }
    });
    _charts = {};
  }

  /* ── Lifecycle ── */

  function init() {
    _bindPanels();
    _fetch();
    _interval = setInterval(_fetch, 5000);
    _bindSocket();
  }

  function destroy() {
    if (_interval) { clearInterval(_interval); _interval = null; }
    _destroyCharts();
    _unbindSocket();
  }

  SQ.command = { init: init, destroy: destroy };
})();
`;
}

module.exports = { getPageCSS, getPageHTML, getPageJS };
