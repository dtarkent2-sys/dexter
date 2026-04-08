/**
 * Options Flow Dashboard — SPA-embeddable exports
 *
 * Exports:
 *   getFlowPageCSS()  → scoped CSS for the flow page
 *   getFlowPageHTML() → HTML fragment for the flow page
 *   getFlowPageJS()   → client-side JS for the flow page
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * SPA-embeddable exports: getFlowPageCSS / getFlowPageHTML / getFlowPageJS
 * ────────────────────────────────────────────────────────────────────────── */

function getFlowPageCSS() {
  return `
/* ── Flow page scoped styles ── */
#page-flow .ticker-select {
  font-family: var(--font-mono); font-size: 13px; font-weight: 600;
  background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
  border-radius: 3px; padding: 5px 10px; cursor: pointer; outline: none;
}
#page-flow .ticker-select:focus { border-color: var(--border); }
#page-flow .spot-badge {
  font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text);
  padding: 4px 10px; background: var(--bg-surface); border-radius: 3px;
  border: 1px solid var(--border);
}
#page-flow .spot-change { font-size: 12px; margin-left: 4px; }
#page-flow .spot-change.up { color: var(--green); }
#page-flow .spot-change.down { color: var(--red); }
#page-flow .direction-badge {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  padding: 4px 10px; border-radius: 4px; text-transform: uppercase;
}
#page-flow .direction-badge.bullish { color: var(--green); background: var(--accent-subtle); border: 1px solid var(--border-subtle); }
#page-flow .direction-badge.bearish { color: var(--red); background: rgba(239,68,68,0.12); border: 1px solid var(--border-subtle); }
#page-flow .direction-badge.neutral { color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border); }
#page-flow .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
#page-flow .live-label { font-family: var(--font-mono); font-size: 10px; color: var(--green); text-transform: uppercase; }

/* ── Summary Cards ── */
#page-flow .cards-row {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
  padding: 12px 20px; background: var(--bg); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
#page-flow .card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 12px 14px; display: flex; flex-direction: column; gap: 4px;
}
#page-flow .card-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
#page-flow .card-value { font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text); }
#page-flow .card-value.pos { color: var(--green); }
#page-flow .card-value.neg { color: var(--red); }
#page-flow .card-sub { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }

/* ── Main Layout ── */
#page-flow .main-area {
  flex: 1; display: flex; overflow: hidden; min-height: 0;
}
#page-flow .tape-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
#page-flow .sidebar-col {
  width: 300px; flex-shrink: 0; border-left: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
}

/* ── Tape Header ── */
#page-flow .tape-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 20px; background: var(--bg-surface);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
#page-flow .tape-header-title {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  text-transform: uppercase;
}
#page-flow .tape-filter {
  font-family: var(--font-mono); font-size: 11px;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 8px; cursor: pointer; transition: all 0.15s;
}
#page-flow .tape-filter:hover { color: var(--text); border-color: var(--border); }
#page-flow .tape-filter.active { color: var(--accent); border-color: var(--border); background: var(--accent-subtle); }
#page-flow .tape-count { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-left: auto; }
#page-flow .premium-select {
  font-family: var(--font-mono); font-size: 11px;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 8px; cursor: pointer; outline: none;
  margin-left: 4px;
}
#page-flow .premium-select:focus { border-color: var(--accent); }

#page-flow .tape-new-badge {
  position: sticky; top: 0; z-index: 10;
  display: none; justify-content: center; align-items: center;
  padding: 6px 16px; margin: 0;
  background: var(--accent); color: #fff;
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  cursor: pointer; text-align: center;
  border-bottom: 1px solid var(--border);
}
#page-flow .tape-new-badge:hover { opacity: 0.9; }

/* ── Trade Tape ── */
#page-flow .tape-scroll {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: var(--bg-surface-hover) transparent;
}
#page-flow .tape-scroll::-webkit-scrollbar { width: 4px; }
#page-flow .tape-scroll::-webkit-scrollbar-track { background: transparent; }
#page-flow .tape-scroll::-webkit-scrollbar-thumb { background: var(--bg-surface-hover); border-radius: 2px; }

#page-flow .tape-row {
  display: grid; grid-template-columns: 60px 48px 70px 56px 80px 80px 80px 1fr;
  align-items: center; gap: 6px;
  padding: 6px 20px; border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 12px;
  transition: background 0.15s;
}
#page-flow .tape-row:hover { background: var(--bg-surface); }
#page-flow .tape-row.large-block {
  background: var(--accent-subtle); border-left: 2px solid var(--accent);
}
#page-flow .tape-row.sweep {
  background: var(--accent-subtle); border-left: 2px solid var(--accent);
}


#page-flow .tape-time { color: var(--text-muted); font-size: 11px; }
#page-flow .tape-type { font-weight: 600; font-size: 11px; text-transform: uppercase; }
#page-flow .tape-type.call { color: var(--green); }
#page-flow .tape-type.put { color: var(--red); }
#page-flow .tape-strike { color: var(--text); font-weight: 500; }
#page-flow .tape-exp { color: var(--text-muted); font-size: 11px; }
#page-flow .tape-size { color: var(--text); text-align: right; }
#page-flow .tape-premium { font-weight: 600; text-align: right; }
#page-flow .tape-premium.buy { color: var(--green); }
#page-flow .tape-premium.sell { color: var(--red); }
#page-flow .tape-side { font-size: 10px; text-transform: uppercase; }
#page-flow .tape-side.buy { color: var(--green); }
#page-flow .tape-side.sell { color: var(--red); }
#page-flow .tape-side.unknown { color: var(--text-muted); }
#page-flow .tape-tag {
  font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 3px;
  text-transform: uppercase; width: fit-content; justify-self: end;
}
#page-flow .tape-tag.block { color: var(--accent); background: var(--accent-subtle); border: 1px solid var(--border); }
#page-flow .tape-tag.sweep { color: var(--accent); background: var(--accent-subtle); border: 1px solid var(--border-subtle); }

/* Large block highlight */

/* ── Sidebar ── */
#page-flow .sidebar-section {
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
#page-flow .sidebar-title {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; margin-bottom: 10px;
}
#page-flow .strike-row {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 0; font-family: var(--font-mono); font-size: 12px;
}
#page-flow .strike-price { color: var(--text); font-weight: 600; width: 60px; }
#page-flow .strike-bar-wrap { flex: 1; height: 14px; background: var(--bg-surface); border-radius: 3px; overflow: hidden; position: relative; }
#page-flow .strike-bar {
  position: absolute; top: 0; height: 100%; border-radius: 3px; transition: width 0.5s ease;
}
#page-flow .strike-bar.call { left: 50%; background: var(--green); opacity: 0.5; }
#page-flow .strike-bar.put { right: 50%; background: var(--red); opacity: 0.5; }
#page-flow .strike-center { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--border); }
#page-flow .strike-vol { color: var(--text-muted); font-size: 11px; width: 50px; text-align: right; }

#page-flow .sweep-item {
  padding: 8px 0; border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 11px;
}
#page-flow .sweep-item:last-child { border-bottom: none; }
#page-flow .sweep-head { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
#page-flow .sweep-ticker { font-weight: 700; color: var(--accent); font-size: 12px; }
#page-flow .sweep-dir { font-size: 10px; font-weight: 600; text-transform: uppercase; }
#page-flow .sweep-dir.buy { color: var(--green); }
#page-flow .sweep-dir.sell { color: var(--red); }
#page-flow .sweep-detail { color: var(--text-muted); }
#page-flow .sweep-premium { color: var(--accent); font-weight: 600; }
#page-flow .sweep-time { color: var(--text-muted); font-size: 10px; }

/* ── HFT Signals ── */
#page-flow .hft-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 0; font-family: var(--font-mono); font-size: 11px;
}
#page-flow .hft-label { color: var(--text-muted); }
#page-flow .hft-value { font-weight: 600; }

/* ── Scroll Shadow ── */
#page-flow .sidebar-scroll {
  flex: 1; overflow-y: auto; scrollbar-width: thin;
  scrollbar-color: var(--bg-surface-hover) transparent;
}
#page-flow .sidebar-scroll::-webkit-scrollbar { width: 4px; }
#page-flow .sidebar-scroll::-webkit-scrollbar-thumb { background: var(--bg-surface-hover); border-radius: 2px; }

/* ── Empty State ── */
#page-flow .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; color: var(--text-muted);
  font-family: var(--font-mono); font-size: 13px; text-align: center; gap: 8px;
}
#page-flow .empty-icon { font-size: 32px; opacity: 0.3; }

/* ── Page Header ── */
#page-flow .page-header { padding: 20px 24px 12px; }
#page-flow .page-header h2 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
#page-flow .page-header .subtitle { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
#page-flow .controls-row { display: flex; align-items: center; gap: 10px; padding: 0 20px 8px; flex-shrink: 0; }

/* ── Flow Metric Cards ── */
#page-flow .flow-metric-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  padding: 0 24px 12px;
}
@media (max-width: 768px) { #page-flow .flow-metric-stats { grid-template-columns: 1fr; } }
#page-flow .flow-metric-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 14px 16px; display: flex; align-items: center; gap: 12px;
}
#page-flow .flow-metric-icon {
  width: 36px; height: 36px; border-radius: 3px; display: flex; align-items: center; justify-content: center;
}
#page-flow .flow-metric-icon.bullish { background: rgba(34,197,94,0.1); color: var(--green); }
#page-flow .flow-metric-icon.bearish { background: rgba(239,68,68,0.1); color: var(--red); }
#page-flow .flow-metric-icon.neutral { background: rgba(234,179,8,0.1); color: var(--yellow); }
#page-flow .flow-metric-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; }
#page-flow .flow-metric-value { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--text); }
#page-flow .flow-metric-sub { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-top: 1px; }

/* ── Options Inventory Chart ── */
#page-flow .inventory-section { padding: 12px 16px; border-bottom: 1px solid var(--border); }
#page-flow .inventory-title {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; margin-bottom: 10px;
}
#page-flow .inventory-chart { display: flex; flex-direction: column; gap: 3px; }
#page-flow .inv-row { display: flex; align-items: center; gap: 4px; height: 22px; }
#page-flow .inv-strike {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted);
  width: 55px; text-align: right; flex-shrink: 0;
}
#page-flow .inv-bar-wrap { flex: 1; display: flex; height: 16px; position: relative; }
#page-flow .inv-bar-calls {
  background: rgba(34,197,94,0.4); height: 100%; border-radius: 2px 0 0 2px;
  position: absolute; right: 50%;
}
#page-flow .inv-bar-puts {
  background: rgba(239,68,68,0.4); height: 100%; border-radius: 0 2px 2px 0;
  position: absolute; left: 50%;
}
#page-flow .inv-center { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--border); }

#page-flow .drift-chart-wrap { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
#page-flow .drift-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
#page-flow .drift-title { font-family: var(--font-body); font-size: 12px; font-weight: 600; color: var(--text); }
#page-flow .drift-value { font-family: var(--font-mono); font-size: 16px; font-weight: 700; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  #page-flow .sidebar-col { display: none; }
}
@media (max-width: 900px) {
  #page-flow .cards-row { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  #page-flow .cards-row { grid-template-columns: repeat(2, 1fr); }
  #page-flow .tape-row { grid-template-columns: 48px 40px 60px 48px 64px 64px 64px 1fr; font-size: 11px; padding: 5px 12px; }
}
`;
}

function getFlowPageHTML() {
  return `<div class="page" id="page-flow">
  <div class="page-header"><div><h2>SharkFlow&trade;</h2><div class="subtitle">Live trade tape &amp; sweep detection</div></div></div>
  <div class="controls-row">
    <select class="ticker-select" id="flowTickerSelect">
      <option value="SPY">SPY</option>
      <option value="QQQ">QQQ</option>
      <option value="IWM">IWM</option>
      <option value="AAPL">AAPL</option>
      <option value="TSLA">TSLA</option>
      <option value="NVDA">NVDA</option>
      <option value="AMZN">AMZN</option>
      <option value="META">META</option>
      <option value="MSFT">MSFT</option>
      <option value="GOOGL">GOOGL</option>
      <option value="AMD">AMD</option>
    </select>
    <div class="spot-badge" id="flowSpotBadge">--</div>
    <div class="direction-badge neutral" id="flowDirBadge">--</div>
    <div class="live-dot"></div>
    <span class="live-label">Live</span>
  </div>

  <!-- Flow Metric Cards -->
    <div class="flow-metric-stats">
      <div class="flow-metric-card">
        <div class="flow-metric-icon neutral" id="flowRatioIcon"><i data-lucide="gauge" style="width:18px;height:18px;"></i></div>
        <div>
          <div class="flow-metric-label">Flow Ratio</div>
          <div class="flow-metric-value" id="flowRatioValue">&mdash;</div>
          <div class="flow-metric-sub" id="flowRatioSub">Loading...</div>
        </div>
      </div>
      <div class="flow-metric-card">
        <div class="flow-metric-icon neutral" id="netFlowIcon"><i data-lucide="dollar-sign" style="width:18px;height:18px;"></i></div>
        <div>
          <div class="flow-metric-label">Net Flow</div>
          <div class="flow-metric-value" id="netFlowValue">&mdash;</div>
          <div class="flow-metric-sub" id="netFlowSub">&nbsp;</div>
        </div>
      </div>
      <div class="flow-metric-card">
        <div class="flow-metric-icon neutral" id="pcRatioIcon"><i data-lucide="scale" style="width:18px;height:18px;"></i></div>
        <div>
          <div class="flow-metric-label">P/C Volume</div>
          <div class="flow-metric-value" id="pcRatioValue">&mdash;</div>
          <div class="flow-metric-sub" id="pcRatioSub">&nbsp;</div>
        </div>
      </div>
    </div>

  <!-- Summary Cards -->
  <div class="cards-row">
    <div class="card">
      <div class="card-label">Net Premium</div>
      <div class="card-value" id="flowCardNetPrem">--</div>
      <div class="card-sub" id="flowCardNetPremDir">--</div>
    </div>
    <div class="card">
      <div class="card-label">Call Premium</div>
      <div class="card-value pos" id="flowCardCallPrem">--</div>
      <div class="card-sub" id="flowCardCallVol">--</div>
    </div>
    <div class="card">
      <div class="card-label">Put Premium</div>
      <div class="card-value neg" id="flowCardPutPrem">--</div>
      <div class="card-sub" id="flowCardPutVol">--</div>
    </div>
    <div class="card">
      <div class="card-label">P/C Ratio</div>
      <div class="card-value" id="flowCardPCR">--</div>
      <div class="card-sub" id="flowCardTradeCount">--</div>
    </div>
    <div class="card">
      <div class="card-label">Sweeps</div>
      <div class="card-value" id="flowCardSweeps" style="color:var(--accent)">--</div>
      <div class="card-sub" id="flowCardSweepPrem">--</div>
    </div>
    <div class="card">
      <div class="card-label">Aggression</div>
      <div class="card-value" id="flowCardAggr">--</div>
      <div class="card-sub" id="flowCardHFT">--</div>
    </div>
  </div>

  <div class="drift-chart-wrap" id="flowDriftWrap">
    <div class="drift-header">
      <span class="drift-title">Net Drift</span>
      <span class="drift-value" id="flowDriftValue">$0</span>
    </div>
    <canvas id="flowDriftCanvas" height="160"></canvas>
  </div>

  <!-- Main Area -->
  <div class="main-area">
    <div class="tape-col">
      <div class="tape-header">
        <span class="tape-header-title">Live Trade Tape</span>
        <button class="tape-filter active" data-filter="all">All</button>
        <button class="tape-filter" data-filter="blocks">Blocks</button>
        <button class="tape-filter" data-filter="sweeps">Sweeps</button>
        <button class="tape-filter" data-filter="calls">Calls</button>
        <button class="tape-filter" data-filter="puts">Puts</button>
        <select class="premium-select" id="flowPremiumSelect">
          <option value="0">All Sizes</option>
          <option value="1000">$1K+</option>
          <option value="10000">$10K+</option>
          <option value="25000" selected>$25K+</option>
          <option value="50000">$50K+</option>
          <option value="100000">$100K+</option>
        </select>
        <span class="tape-count" id="flowTapeCount">0 trades</span>
      </div>
      <div class="tape-scroll" id="flowTapeScroll">
        <div class="tape-new-badge" id="flowNewBadge">0 new trades — click to resume</div>
        <div class="empty-state" id="flowTapeEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>Waiting for options flow data...</div>
          <div style="font-size:11px;color:var(--text-muted)">Trades appear here in real-time during market hours</div>
        </div>
      </div>
    </div>

    <div class="sidebar-col">
      <div class="sidebar-scroll">
        <div class="sidebar-section">
          <div class="sidebar-title">Top Strikes</div>
          <div id="flowTopStrikes">
            <div style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">No data yet</div>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">Recent Sweeps</div>
          <div id="flowRecentSweeps">
            <div style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">No sweeps detected</div>
          </div>
        </div>
        <div class="inventory-section">
          <div class="inventory-title">Options Inventory</div>
          <div class="inventory-chart" id="flowInventoryChart"><div style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">No inventory data</div></div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">HFT Signals</div>
          <div id="flowHftPanel">
            <div class="hft-row"><span class="hft-label">Book Skew</span><span class="hft-value" id="flowHftSkew">--</span></div>
            <div class="hft-row"><span class="hft-label">VWAP</span><span class="hft-value" id="flowHftVwap">--</span></div>
            <div class="hft-row"><span class="hft-label">Aggression</span><span class="hft-value" id="flowHftAggr">--</span></div>
            <div class="hft-row"><span class="hft-label">Direction</span><span class="hft-value" id="flowHftDir">--</span></div>
            <div class="hft-row"><span class="hft-label">Confidence</span><span class="hft-value" id="flowHftConf">--</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function getFlowPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.flow = (function() {
  'use strict';

  // ── State ──
  var ticker = 'SPY';
  var flowData = null;
  var tapeRows = [];
  var activeFilter = 'all';
  var minPremium = parseInt(localStorage.getItem('flowMinPremium') || '25000', 10);
  var refreshTimer = null;
  var socketHandlers = {};

  var MAX_TAPE_ROWS = 500;

  // ── Auto-pause state ──
  var _paused = false;
  var _pausedNewCount = 0;

  // ── Render throttle ──
  var _renderScheduled = false;
  var _renderTimer = null;
  var RENDER_INTERVAL = 250; // ms — max 4 renders/sec

  function scheduleRender() {
    if (_paused) {
      _pausedNewCount++;
      if ($newBadge) {
        $newBadge.style.display = 'flex';
        $newBadge.textContent = _pausedNewCount + ' new trade' + (_pausedNewCount === 1 ? '' : 's') + ' — click to resume';
      }
      return;
    }
    if (_renderScheduled) return;
    _renderScheduled = true;
    _renderTimer = setTimeout(function() {
      _renderScheduled = false;
      _renderTimer = null;
      renderTape();
    }, RENDER_INTERVAL);
  }

  function resumeLive() {
    _paused = false;
    _pausedNewCount = 0;
    if ($newBadge) $newBadge.style.display = 'none';
    renderTape();
    if ($tapeScroll) $tapeScroll.scrollTop = 0;
  }

  // ── DOM refs (resolved at init time) ──
  var $tickerSelect, $spotBadge, $dirBadge, $tapeScroll, $tapeEmpty, $tapeCount, $premiumSelect, $newBadge;
  var $cardNetPrem, $cardNetPremDir, $cardCallPrem, $cardCallVol;
  var $cardPutPrem, $cardPutVol, $cardPCR, $cardTradeCount;
  var $cardSweeps, $cardSweepPrem, $cardAggr, $cardHFT;
  var $topStrikes, $recentSweeps;
  var $hftSkew, $hftVwap, $hftAggr, $hftDir, $hftConf;

  function cacheDom() {
    $tickerSelect = document.getElementById('flowTickerSelect');
    $spotBadge = document.getElementById('flowSpotBadge');
    $dirBadge = document.getElementById('flowDirBadge');
    $tapeScroll = document.getElementById('flowTapeScroll');
    $tapeEmpty = document.getElementById('flowTapeEmpty');
    $tapeCount = document.getElementById('flowTapeCount');
    $cardNetPrem = document.getElementById('flowCardNetPrem');
    $cardNetPremDir = document.getElementById('flowCardNetPremDir');
    $cardCallPrem = document.getElementById('flowCardCallPrem');
    $cardCallVol = document.getElementById('flowCardCallVol');
    $cardPutPrem = document.getElementById('flowCardPutPrem');
    $cardPutVol = document.getElementById('flowCardPutVol');
    $cardPCR = document.getElementById('flowCardPCR');
    $cardTradeCount = document.getElementById('flowCardTradeCount');
    $cardSweeps = document.getElementById('flowCardSweeps');
    $cardSweepPrem = document.getElementById('flowCardSweepPrem');
    $cardAggr = document.getElementById('flowCardAggr');
    $cardHFT = document.getElementById('flowCardHFT');
    $topStrikes = document.getElementById('flowTopStrikes');
    $recentSweeps = document.getElementById('flowRecentSweeps');
    $hftSkew = document.getElementById('flowHftSkew');
    $hftVwap = document.getElementById('flowHftVwap');
    $hftAggr = document.getElementById('flowHftAggr');
    $hftDir = document.getElementById('flowHftDir');
    $hftConf = document.getElementById('flowHftConf');
    $premiumSelect = document.getElementById('flowPremiumSelect');
    $newBadge = document.getElementById('flowNewBadge');
  }

  // ── Formatting ──
  function fmtPrem(v) {
    if (v == null || isNaN(v)) return '--';
    var abs = Math.abs(v);
    if (abs >= 1e6) return (v < 0 ? '-' : '') + '$' + (abs / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (v < 0 ? '-' : '') + '$' + (abs / 1e3).toFixed(0) + 'K';
    return (v < 0 ? '-' : '') + '$' + abs.toFixed(0);
  }

  function fmtVol(v) {
    if (v == null || isNaN(v)) return '--';
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return String(v);
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    var h = d.getHours().toString().padStart(2, '0');
    var m = d.getMinutes().toString().padStart(2, '0');
    var s = d.getSeconds().toString().padStart(2, '0');
    return h + ':' + m + ':' + s;
  }

  function fmtStrike(v) {
    if (v == null) return '--';
    return v >= 100 ? v.toFixed(0) : v.toFixed(1);
  }

  function fmtExp(exp) {
    if (!exp) return '--';
    var parts = exp.split('-');
    if (parts.length === 3) return parts[1] + '/' + parts[2];
    return exp;
  }

  var driftData = [];

    function pushDrift(netFlow) {
      // netFlow is already cumulative — use directly, don't re-accumulate
      driftData.push({ time: new Date(), cumulative: netFlow });
      if (driftData.length > 5000) driftData = driftData.slice(-4000);
      renderDrift();
    }

    function renderDrift() {
      var canvas = document.getElementById('flowDriftCanvas');
      if (!canvas || driftData.length < 2) return;
      var wrap = canvas.parentElement;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = wrap.clientWidth * dpr;
      canvas.style.width = wrap.clientWidth + 'px';
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var W = wrap.clientWidth, H = 160;
      var PAD = { left: 50, right: 10, top: 10, bottom: 20 };
      ctx.clearRect(0, 0, W, H);

      var vals = driftData.map(function(d) { return d.cumulative; });
      var maxAbs = Math.max(Math.abs(Math.min.apply(null, vals)), Math.abs(Math.max.apply(null, vals)), 1);
      var xScale = function(i) { return PAD.left + (i / (driftData.length - 1)) * (W - PAD.left - PAD.right); };
      var yScale = function(v) { return PAD.top + (1 - (v + maxAbs) / (2 * maxAbs)) * (H - PAD.top - PAD.bottom); };
      var zeroY = yScale(0);

      // Fill area
      ctx.beginPath();
      ctx.moveTo(xScale(0), zeroY);
      driftData.forEach(function(d, i) { ctx.lineTo(xScale(i), yScale(d.cumulative)); });
      ctx.lineTo(xScale(driftData.length - 1), zeroY);
      ctx.closePath();
      var last = driftData[driftData.length - 1].cumulative;
      ctx.fillStyle = last >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      driftData.forEach(function(d, i) {
        if (i === 0) ctx.moveTo(xScale(i), yScale(d.cumulative));
        else ctx.lineTo(xScale(i), yScale(d.cumulative));
      });
      ctx.strokeStyle = last >= 0 ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Zero line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, zeroY); ctx.lineTo(W - PAD.right, zeroY); ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis labels
      ctx.fillStyle = '#666';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText('+$' + fmtDrift(maxAbs), PAD.left - 6, PAD.top + 6);
      ctx.fillText('-$' + fmtDrift(maxAbs), PAD.left - 6, H - PAD.bottom);
      ctx.fillText('$0', PAD.left - 6, zeroY + 3);

      // Update header value
      var $v = document.getElementById('flowDriftValue');
      if ($v) {
        $v.textContent = (last >= 0 ? '+$' : '-$') + fmtDrift(Math.abs(last));
        $v.style.color = last >= 0 ? 'var(--green)' : 'var(--red)';
      }
    }

    function fmtDrift(v) {
      if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
      if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
      if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
      return v.toFixed(0);
    }

  // ── Render Summary Cards ──
  function renderCards(data) {
    if (!data) return;

    $cardNetPrem.textContent = fmtPrem(data.netPremium || data.netFlow);
    var netDir = data.netPremiumDirection || data.flowDirection || 'NEUTRAL';
    $cardNetPrem.className = 'card-value ' + (netDir === 'BULLISH' ? 'pos' : netDir === 'BEARISH' ? 'neg' : '');
    $cardNetPremDir.textContent = netDir;

    $cardCallPrem.textContent = fmtPrem(data.callPremium);
    $cardCallVol.textContent = fmtVol(data.callVolume) + ' contracts';

    $cardPutPrem.textContent = fmtPrem(Math.abs(data.putPremium));
    $cardPutVol.textContent = fmtVol(data.putVolume) + ' contracts';

    var pcr = data.pcVolumeRatio;
    $cardPCR.textContent = pcr === 'N/A' || pcr == null ? '--' : pcr.toFixed(2);
    $cardPCR.className = 'card-value ' + (pcr > 1 ? 'neg' : pcr < 0.7 ? 'pos' : '');
    $cardTradeCount.textContent = fmtVol(data.tradeCount) + ' trades';

    $cardSweeps.textContent = data.sweepCount || 0;
    var sweepPremTotal = (data.sweeps || []).reduce(function(s, sw) { return s + Math.abs(sw.totalPremium || 0); }, 0);
    $cardSweepPrem.textContent = fmtPrem(sweepPremTotal) + ' premium';

    var aggr = data.aggressionRatio;
    if (aggr != null) {
      $cardAggr.textContent = (aggr * 100).toFixed(0) + '%';
      $cardAggr.className = 'card-value ' + (aggr > 0.55 ? 'pos' : aggr < 0.45 ? 'neg' : '');
    } else {
      $cardAggr.textContent = '--';
    }
    $cardHFT.textContent = data.hftDirection ? data.hftDirection + ' (' + (data.hftConfidence || '?') + ')' : '--';

    // Direction badge
    $dirBadge.textContent = netDir;
    $dirBadge.className = 'direction-badge ' + netDir.toLowerCase();
  }

  // ── Build Tape Rows from Flow Data ──
  function buildTapeFromFlow(data) {
    if (!data) return;
    var rows = [];

    if (data.largeBlocks) {
      for (var i = 0; i < data.largeBlocks.length; i++) {
        var b = data.largeBlocks[i];
        rows.push({ time: b.time, type: b.type, strike: b.strike, exp: b.expiration, size: b.size, premium: b.premium, side: b.side, tag: 'block' });
      }
    }

    if (data.sweeps) {
      for (var j = 0; j < data.sweeps.length; j++) {
        var s = data.sweeps[j];
        rows.push({ time: s.time, type: s.optionType || 'call', strike: s.strike, exp: s.expirationDate, size: s.totalSize, premium: s.totalPremium, side: s.side, tag: 'sweep', legs: s.legs, exchanges: s.exchanges });
      }
    }

    rows.sort(function(a, b) { return b.time - a.time; });
    return rows;
  }

  // ── Render Tape ──
  function renderTape() {
    if (!$tapeScroll) return;
    var filtered = tapeRows.filter(function(r) {
      var prem = r.premium != null ? r.premium : (r.price || 0) * (r.size || 0) * 100;
      if (minPremium > 0 && Math.abs(prem) < minPremium) return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'blocks') return r.tag === 'block';
      if (activeFilter === 'sweeps') return r.tag === 'sweep';
      if (activeFilter === 'calls') return r.type === 'call';
      if (activeFilter === 'puts') return r.type === 'put';
      return true;
    });

    if (filtered.length === 0) {
      $tapeEmpty.style.display = 'flex';
      $tapeScroll.querySelectorAll('.tape-row').forEach(function(el) { el.remove(); });
      $tapeCount.textContent = '0 trades';
      return;
    }

    $tapeEmpty.style.display = 'none';
    $tapeCount.textContent = filtered.length + ' trades';

    var html = '';
    var slice = filtered.slice(0, MAX_TAPE_ROWS);
    for (var i = 0; i < slice.length; i++) {
      var r = slice[i];
      var rowClass = r.tag === 'block' ? ' large-block' : r.tag === 'sweep' ? ' sweep' : '';
      var typeClass = r.type === 'call' ? 'call' : 'put';
      var sideClass = r.side === 'buy' ? 'buy' : r.side === 'sell' ? 'sell' : 'unknown';
      var premClass = r.side === 'buy' ? 'buy' : r.side === 'sell' ? 'sell' : '';
      var tagHtml = r.tag === 'block'
        ? '<span class="tape-tag block">BLOCK</span>'
        : r.tag === 'sweep'
          ? '<span class="tape-tag sweep">SWEEP x' + (r.legs || '?') + '</span>'
          : '';

      html += '<div class="tape-row' + rowClass + '">'
        + '<span class="tape-time">' + fmtTime(r.time) + '</span>'
        + '<span class="tape-type ' + typeClass + '">' + r.type + '</span>'
        + '<span class="tape-strike">' + fmtStrike(r.strike) + '</span>'
        + '<span class="tape-exp">' + fmtExp(r.exp) + '</span>'
        + '<span class="tape-size">' + fmtVol(r.size) + '</span>'
        + '<span class="tape-premium ' + premClass + '">' + fmtPrem(r.premium) + '</span>'
        + '<span class="tape-side ' + sideClass + '">' + (r.side || '?') + '</span>'
        + tagHtml
        + '</div>';
    }

    var wasAtTop = $tapeScroll.scrollTop < 10;
    $tapeScroll.querySelectorAll('.tape-row').forEach(function(el) { el.remove(); });
    $tapeEmpty.insertAdjacentHTML('afterend', html);
    if (wasAtTop) $tapeScroll.scrollTop = 0;
  }

  // ── Render Top Strikes ──
  function renderTopStrikes(data) {
    if (!data || !data.topStrikes || data.topStrikes.length === 0) {
      $topStrikes.innerHTML = '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">No data yet</div>';
      return;
    }

    var strikes = data.topStrikes.slice(0, 10);
    var maxVol = Math.max.apply(null, strikes.map(function(s) { return Math.max(s.callVol || 0, s.putVol || 0, 1); }));

    var html = '';
    for (var i = 0; i < strikes.length; i++) {
      var s = strikes[i];
      var callW = ((s.callVol || 0) / maxVol * 50).toFixed(1);
      var putW = ((s.putVol || 0) / maxVol * 50).toFixed(1);
      var totalVol = (s.callVol || 0) + (s.putVol || 0);

      html += '<div class="strike-row">'
        + '<span class="strike-price">' + fmtStrike(s.strike) + '</span>'
        + '<div class="strike-bar-wrap">'
        +   '<div class="strike-center"></div>'
        +   '<div class="strike-bar call" style="width:' + callW + '%"></div>'
        +   '<div class="strike-bar put" style="width:' + putW + '%"></div>'
        + '</div>'
        + '<span class="strike-vol">' + fmtVol(totalVol) + '</span>'
        + '</div>';
    }
    $topStrikes.innerHTML = html;
  }

  // ── Render Recent Sweeps ──
  function renderSweeps(data) {
    if (!data || !data.sweeps || data.sweeps.length === 0) {
      $recentSweeps.innerHTML = '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">No sweeps detected</div>';
      return;
    }

    var sweeps = data.sweeps.slice(-10).reverse();
    var html = '';
    for (var i = 0; i < sweeps.length; i++) {
      var s = sweeps[i];
      var dirClass = s.side === 'buy' ? 'buy' : 'sell';
      html += '<div class="sweep-item">'
        + '<div class="sweep-head">'
        +   '<span class="sweep-ticker">' + (s.underlying || ticker) + '</span>'
        +   '<span class="sweep-dir ' + dirClass + '">' + (s.side || '?') + '</span>'
        +   '<span class="sweep-detail">' + fmtStrike(s.strike) + ' ' + (s.optionType || '') + ' ' + fmtExp(s.expirationDate) + '</span>'
        + '</div>'
        + '<div style="display:flex;gap:8px;align-items:center">'
        +   '<span class="sweep-premium">' + fmtPrem(s.totalPremium) + '</span>'
        +   '<span class="sweep-detail">' + (s.legs || '?') + ' legs / ' + (s.exchanges || '?') + ' exch / ' + fmtVol(s.totalSize) + ' contracts</span>'
        +   '<span class="sweep-time" style="margin-left:auto">' + fmtTime(s.time) + '</span>'
        + '</div>'
        + '</div>';
    }
    $recentSweeps.innerHTML = html;
  }

  // ── Render HFT Signals ──
  function renderHFT(data) {
    if (!data) return;
    $hftSkew.textContent = data.bookSkew != null ? data.bookSkew.toFixed(3) : '--';
    $hftSkew.style.color = data.bookSkew > 0 ? 'var(--green)' : data.bookSkew < 0 ? 'var(--red)' : 'var(--text)';

    $hftVwap.textContent = data.vwap != null ? '$' + data.vwap.toFixed(2) : '--';

    if (data.aggressionRatio != null) {
      var pct = (data.aggressionRatio * 100).toFixed(0) + '%';
      $hftAggr.textContent = pct;
      $hftAggr.style.color = data.aggressionRatio > 0.55 ? 'var(--green)' : data.aggressionRatio < 0.45 ? 'var(--red)' : 'var(--text)';
    } else { $hftAggr.textContent = '--'; }

    $hftDir.textContent = data.hftDirection || '--';
    $hftDir.style.color = data.hftDirection === 'BULLISH' ? 'var(--green)' : data.hftDirection === 'BEARISH' ? 'var(--red)' : 'var(--text)';

    $hftConf.textContent = data.hftConfidence != null ? data.hftConfidence : '--';
  }

  // ── Fetch Flow Data (REST) ──
  function fetchFlow() {
    fetch('/api/flow/' + ticker)
      .then(function(resp) { return resp.json(); })
      .then(function(data) {
        if (data.error && !data.tradeCount) return;
        flowData = data;
        renderCards(data);
        tapeRows = buildTapeFromFlow(data) || [];
        renderTape();
        renderTopStrikes(data);
        renderSweeps(data);
        renderHFT(data);
      })
      .catch(function(e) {
        console.warn('[Flow] fetch error:', e.message);
      });
  }

  // ── Fetch Spot Price ──
  function fetchSpot() {
    fetch('/api/chart/bars/' + ticker + '?tf=1m&limit=1')
      .then(function(resp) { return resp.json(); })
      .then(function(data) {
        if (data.bars && data.bars.length > 0) {
          var last = data.bars[data.bars.length - 1];
          $spotBadge.textContent = '$' + last.c.toFixed(2);
        }
      })
      .catch(function() {});
  }

  function handleFlowUpdate(data) {
    if (!data) return;
    flowData = data;
    renderCards(data);
    tapeRows = buildTapeFromFlow(data) || [];
    renderTape();
    renderTopStrikes(data);
    renderSweeps(data);
    renderHFT(data);
  }

  function handleFlowTrade(trade) {
    if (!trade) return;
    tapeRows.unshift(trade);
    if (tapeRows.length > MAX_TAPE_ROWS) tapeRows.length = MAX_TAPE_ROWS;
    scheduleRender();
  }

  function handleFlowTrades(trades) {
    if (!trades || !trades.length) return;
    for (var i = trades.length - 1; i >= 0; i--) {
      tapeRows.unshift(trades[i]);
    }
    if (tapeRows.length > MAX_TAPE_ROWS) tapeRows.length = MAX_TAPE_ROWS;
    scheduleRender();
  }

  function handleFlowSweep(sweep) {
    if (!sweep) return;
    tapeRows.unshift({
      time: sweep.time, type: sweep.optionType || 'call', strike: sweep.strike,
      exp: sweep.expirationDate, size: sweep.totalSize, premium: sweep.totalPremium,
      side: sweep.side, tag: 'sweep', legs: sweep.legs, exchanges: sweep.exchanges
    });
    if (tapeRows.length > MAX_TAPE_ROWS) tapeRows.length = MAX_TAPE_ROWS;
    scheduleRender();
    if (flowData && flowData.sweeps) {
      flowData.sweeps.push(sweep);
      renderSweeps(flowData);
    }
  }

  function handleChartTick(data) {
    if (data && data.ticker === ticker && data.p) {
      $spotBadge.textContent = '$' + data.p.toFixed(2);
    }
  }

  function switchTicker(newTicker) {
    if (newTicker === ticker) return;
    driftData = [];
    var old = ticker;
    ticker = newTicker;

    if (SQ.socket) {
      SQ.socket.emit('unsubscribe:flow', { ticker: old });
      SQ.socket.emit('unsubscribe:chart', { ticker: old, tf: '1m' });
      SQ.socket.emit('subscribe:flow', { ticker: ticker });
      SQ.socket.emit('subscribe:chart', { ticker: ticker, tf: '1m' });
    }

    tapeRows = [];
    _paused = false;
    _pausedNewCount = 0;
    if ($newBadge) $newBadge.style.display = 'none';
    renderTape();
    $spotBadge.textContent = '--';
    fetchFlow();
    fetchSpot();
  }

  function bindFilterButtons() {
    var container = document.getElementById('page-flow');
    if (!container) return;
    container.querySelectorAll('.tape-filter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        container.querySelectorAll('.tape-filter').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderTape();
      });
    });
  }

  // ── Flow Metric Cards ──
  var _metricsInterval = null;

  function fetchMetrics() {
    var tickerVal = (document.getElementById('flowTickerSelect') || {}).value || 'SPY';
    fetch('/api/metrics/' + tickerVal).then(function(r) { return r.json(); }).then(function(m) {
      if (!m || m.error) return;
      var dir = m.flow.ratio > 0.55 ? 'bullish' : m.flow.ratio < 0.45 ? 'bearish' : 'neutral';
      document.getElementById('flowRatioValue').textContent = m.flow.ratio.toFixed(2);
      document.getElementById('flowRatioSub').textContent = dir === 'bullish' ? 'Bullish Flow' : dir === 'bearish' ? 'Bearish Flow' : 'Neutral';
      document.getElementById('flowRatioIcon').className = 'flow-metric-icon ' + dir;

      var nf = m.flow.netFlow;
      pushDrift(nf);
      var fmt = Math.abs(nf) >= 1e6 ? (nf / 1e6).toFixed(1) + 'M' : Math.abs(nf) >= 1e3 ? (nf / 1e3).toFixed(0) + 'K' : String(Math.round(Math.abs(nf)));
      document.getElementById('netFlowValue').textContent = (nf >= 0 ? '+$' : '-$') + fmt;
      document.getElementById('netFlowValue').style.color = nf >= 0 ? 'var(--green)' : 'var(--red)';
      document.getElementById('netFlowIcon').className = 'flow-metric-icon ' + (nf > 0 ? 'bullish' : nf < 0 ? 'bearish' : 'neutral');

      var cb = m.flow.callsBought + m.flow.callsSold;
      var pb = m.flow.putsBought + m.flow.putsSold;
      var pcr = cb > 0 ? (pb / cb) : 0;
      document.getElementById('pcRatioValue').textContent = pcr.toFixed(2);
      document.getElementById('pcRatioSub').textContent = pcr > 1 ? 'Puts > Calls' : pcr < 0.8 ? 'Calls > Puts' : 'Balanced';
      document.getElementById('pcRatioIcon').className = 'flow-metric-icon ' + (pcr > 1 ? 'bearish' : pcr < 0.8 ? 'bullish' : 'neutral');

      _renderInventory(m.inventory);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }).catch(function() {});
  }

  function _renderInventory(inventory) {
    var el = document.getElementById('flowInventoryChart');
    if (!el) return;
    if (!inventory || !inventory.length) { el.innerHTML = '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">No inventory data</div>'; return; }
    var maxVol = 1;
    inventory.forEach(function(s) { maxVol = Math.max(maxVol, s.netCalls, s.netPuts); });
    var html = '';
    inventory.forEach(function(s) {
      var callW = Math.round((s.netCalls / maxVol) * 48);
      var putW = Math.round((s.netPuts / maxVol) * 48);
      html += '<div class="inv-row">';
      html += '<div class="inv-strike">$' + s.strike + '</div>';
      html += '<div class="inv-bar-wrap">';
      html += '<div class="inv-center"></div>';
      if (callW > 0) html += '<div class="inv-bar-calls" style="width:' + callW + '%;"></div>';
      if (putW > 0) html += '<div class="inv-bar-puts" style="width:' + putW + '%;"></div>';
      html += '</div></div>';
    });
    el.innerHTML = html;
  }

  // ── init / destroy ──
  function init() {
    cacheDom();
    bindFilterButtons();

    if ($tickerSelect) {
      $tickerSelect.addEventListener('change', function(e) {
        switchTicker(e.target.value);
      });
    }

    if ($premiumSelect) {
      $premiumSelect.value = String(minPremium);
      $premiumSelect.addEventListener('change', function(e) {
        minPremium = parseInt(e.target.value, 10);
        localStorage.setItem('flowMinPremium', String(minPremium));
        renderTape();
      });
    }

    // Subscribe via shared socket
    if (SQ.socket) {
      SQ.socket.emit('subscribe:flow', { ticker: ticker });
      SQ.socket.emit('subscribe:chart', { ticker: ticker, tf: '1m' });

      socketHandlers = {
        'flow:update': handleFlowUpdate,
        'flow:trade': handleFlowTrade,
        'flow:trades': handleFlowTrades,
        'flow:sweep': handleFlowSweep,
        'chart:tick': handleChartTick
      };
      Object.keys(socketHandlers).forEach(function(evt) {
        SQ.socket.on(evt, socketHandlers[evt]);
      });
    }

    // Auto-pause on scroll
    if ($tapeScroll) {
      $tapeScroll.addEventListener('scroll', function() {
        if ($tapeScroll.scrollTop > 10) {
          _paused = true;
        } else if (_paused && $tapeScroll.scrollTop <= 10) {
          resumeLive();
        }
      });
    }
    if ($newBadge) {
      $newBadge.addEventListener('click', function() {
        resumeLive();
      });
    }

    fetchFlow();
    fetchSpot();
    refreshTimer = setInterval(fetchFlow, 10000);
    fetchMetrics();
    _metricsInterval = setInterval(fetchMetrics, 30000);
  }

  function destroy() {
    // Unsubscribe socket
    if (SQ.socket) {
      SQ.socket.emit('unsubscribe:flow', { ticker: ticker });
      SQ.socket.emit('unsubscribe:chart', { ticker: ticker, tf: '1m' });

      Object.keys(socketHandlers).forEach(function(evt) {
        SQ.socket.off(evt, socketHandlers[evt]);
      });
      socketHandlers = {};
    }

    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
    if (_metricsInterval) { clearInterval(_metricsInterval); _metricsInterval = null; }
    if (_renderTimer) { clearTimeout(_renderTimer); _renderTimer = null; }
    _renderScheduled = false;

    // Reset state
    ticker = 'SPY';
    flowData = null;
    tapeRows = [];
    activeFilter = 'all';
    minPremium = parseInt(localStorage.getItem('flowMinPremium') || '25000', 10);
    driftData = [];
    _paused = false;
    _pausedNewCount = 0;
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getFlowPageCSS, getFlowPageHTML, getFlowPageJS };
