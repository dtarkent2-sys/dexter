/**
 * Edge Board — SPA-embeddable exports
 *
 * Edge Detection Engine dashboard showing active alerts, prediction market
 * radar, and alert history with IV outcome tracking.
 *
 * Exports:
 *   getEdgeBoardPageCSS()  -> scoped CSS for the edge board page
 *   getEdgeBoardPageHTML() -> HTML fragment for the edge board page
 *   getEdgeBoardPageJS()   -> client-side JS for the edge board page
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * SPA-embeddable exports: getEdgeBoardPageCSS / getEdgeBoardPageHTML / getEdgeBoardPageJS
 * ────────────────────────────────────────────────────────────────────────── */

function getEdgeBoardPageCSS() {
  return `
/* ── Edge Board scoped styles ── */
#page-edge.active { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

/* ── Page Header ── */
#page-edge .page-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
#page-edge .page-header h2 {
  font-family: var(--font-heading); font-size: 18px; font-weight: 700;
  color: var(--text); margin: 0;
}
#page-edge .subtitle {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  margin-top: 2px;
}
#page-edge .header-right {
  display: flex; align-items: center; gap: 10px;
}
#page-edge .refresh-badge {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
}
#page-edge .live-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--green);
  animation: edgePulse 2s ease-in-out infinite;
}
#page-edge .live-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--green);
  text-transform: uppercase;
}
@keyframes edgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── Scrollable content ── */
#page-edge .edge-content {
  flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 20px;
}

/* ── Section Headers ── */
#page-edge .section-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
#page-edge .section-title {
  font-family: var(--font-heading); font-size: 14px; font-weight: 700;
  color: var(--text); text-transform: uppercase; letter-spacing: 0.5px;
}
#page-edge .section-count {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 4px; padding: 1px 6px;
}

/* ── Active Alerts Panel ── */
#page-edge .alerts-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 12px;
}
#page-edge .alert-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
  transition: border-color 0.15s;
}
#page-edge .alert-card:hover { border-color: var(--accent); }
#page-edge .alert-card.high-edge { border-left: 3px solid var(--green); }
#page-edge .alert-card.medium-edge { border-left: 3px solid #eab308; }
#page-edge .alert-card.low-edge { border-left: 3px solid var(--text-muted); }

/* Alert card header */
#page-edge .alert-top {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
#page-edge .alert-type-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px;
}
#page-edge .alert-type-badge.underpriced {
  color: var(--green); background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25);
}
#page-edge .alert-type-badge.overpriced {
  color: var(--red); background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
}

/* Signal type badges — v2 */
#page-edge .alert-type-badge.convergence {
  color: #818cf8; background: rgba(129,140,248,0.12); border: 1px solid rgba(129,140,248,0.25);
}
#page-edge .alert-type-badge.whale-shock {
  color: #a855f7; background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.25);
}
#page-edge .alert-type-badge.shock-mapped {
  color: #f59e0b; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25);
}
#page-edge .alert-type-badge.options-lead {
  color: #06b6d4; background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.25);
}

/* Cluster summary line */
#page-edge .alert-cluster-summary {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  display: flex; gap: 12px; flex-wrap: wrap;
}
#page-edge .alert-cluster-summary .summary-item { display: flex; gap: 4px; align-items: center; }
#page-edge .alert-cluster-summary .summary-label { font-size: 9px; text-transform: uppercase; }

/* Time horizon badge */
#page-edge .horizon-badge {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  background: var(--bg); border: 1px solid var(--border); border-radius: 3px;
  padding: 1px 6px;
}

/* Rank number */
#page-edge .alert-rank {
  font-family: var(--font-mono); font-size: 13px; font-weight: 700;
  color: var(--text-muted); min-width: 24px; text-align: center;
}

/* Also moving list */
#page-edge .also-moving {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  margin-top: 4px; padding-left: 8px; border-left: 2px solid var(--border);
}
#page-edge .also-moving-item { margin-bottom: 2px; }

#page-edge .alert-edge-score {
  font-family: var(--font-mono); font-size: 24px; font-weight: 800; color: var(--accent);
  line-height: 1;
}
#page-edge .alert-edge-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  text-transform: uppercase; text-align: right;
}

/* Alert event info */
#page-edge .alert-event {
  font-family: var(--font-heading); font-size: 14px; font-weight: 600; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#page-edge .alert-category {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.3px;
}

/* Alert metrics grid */
#page-edge .alert-metrics {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
}
#page-edge .alert-metric {
  display: flex; flex-direction: column; gap: 1px;
}
#page-edge .alert-metric-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  text-transform: uppercase;
}
#page-edge .alert-metric-value {
  font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--text);
}

/* Leader indicator */
#page-edge .leader-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  padding: 2px 6px; border-radius: 3px; display: inline-flex; align-items: center; gap: 4px;
}
#page-edge .leader-badge.is-leader {
  color: #eab308; background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.25);
}
#page-edge .leader-badge.not-leader {
  color: var(--text-muted); background: transparent; border: 1px solid var(--border);
}

/* Trade expression */
#page-edge .alert-trade {
  background: var(--bg); border: 1px solid var(--border); border-radius: 3px;
  padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;
}
#page-edge .alert-trade-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  text-transform: uppercase;
}
#page-edge .alert-trade-expr {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--green);
}
#page-edge .alert-assets {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
}
#page-edge .alert-horizon {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  display: flex; align-items: center; gap: 4px;
}

/* ── Radar Table ── */
#page-edge .radar-table-wrap {
  overflow-x: auto; border: 1px solid var(--border); border-radius: 3px;
  background: var(--bg-surface);
}
#page-edge .radar-table {
  width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px;
}
#page-edge .radar-table thead th {
  padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
  background: var(--bg); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 1;
}
#page-edge .radar-table tbody td {
  padding: 8px 12px; color: var(--text); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
#page-edge .radar-table tbody tr:last-child td { border-bottom: none; }
#page-edge .radar-table tbody tr:hover { background: rgba(251,191,36,0.04); }

/* ── History Table ── */
#page-edge .history-table-wrap {
  overflow-x: auto; border: 1px solid var(--border); border-radius: 3px;
  background: var(--bg-surface);
}
#page-edge .history-table {
  width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px;
}
#page-edge .history-table thead th {
  padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
  background: var(--bg); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 1; cursor: pointer; user-select: none;
}
#page-edge .history-table thead th:hover { color: var(--text); }
#page-edge .history-table thead th .sort-arrow {
  font-size: 9px; margin-left: 3px; opacity: 0.5;
}
#page-edge .history-table thead th.sort-active .sort-arrow { opacity: 1; color: var(--accent); }
#page-edge .history-table tbody td {
  padding: 8px 12px; color: var(--text); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
#page-edge .history-table tbody tr:last-child td { border-bottom: none; }
#page-edge .history-table tbody tr:hover { background: rgba(251,191,36,0.04); }

/* ── Shared value colors ── */
#page-edge .val-pos { color: var(--green); }
#page-edge .val-neg { color: var(--red); }
#page-edge .val-warn { color: #eab308; }
#page-edge .val-accent { color: var(--accent); }
#page-edge .val-muted { color: var(--text-muted); }

/* ── Change indicators ── */
#page-edge .change-up { color: var(--green); }
#page-edge .change-up::before { content: '+'; }
#page-edge .change-down { color: var(--red); }

/* ── Empty state ── */
#page-edge .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px; color: var(--text-muted); font-family: var(--font-mono);
  font-size: 13px; text-align: center; gap: 8px;
}
#page-edge .empty-icon { font-size: 28px; opacity: 0.3; }
#page-edge .empty-sub { font-size: 11px; color: var(--text-muted); opacity: 0.7; }

/* ── Whale Activity Table ── */
#page-edge .whale-table-wrap {
  overflow-x: auto; border: 1px solid var(--border); border-radius: 3px;
  background: var(--bg-surface);
}
#page-edge .whale-table {
  width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px;
}
#page-edge .whale-table thead th {
  padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
  background: var(--bg); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 1;
}
#page-edge .whale-table tbody td {
  padding: 8px 12px; color: var(--text); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
#page-edge .whale-table tbody tr:last-child td { border-bottom: none; }
#page-edge .whale-table tbody tr:hover { background: rgba(251,191,36,0.04); }

#page-edge .whale-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  padding: 2px 6px; border-radius: 3px; text-transform: uppercase;
}
#page-edge .whale-badge.large-trade {
  color: #eab308; background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.25);
}
#page-edge .whale-badge.accumulation {
  color: var(--accent); background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.25);
}
#page-edge .whale-badge.known-whale {
  color: #a855f7; background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.25);
}
#page-edge .whale-wallet {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  max-width: 120px; overflow: hidden; text-overflow: ellipsis;
}
#page-edge .whale-side-buy { color: var(--green); font-weight: 600; }
#page-edge .whale-side-sell { color: var(--red); font-weight: 600; }

/* ── Tabs ── */
#page-edge .edge-tabs {
  display: flex; gap: 0; border-bottom: 1px solid var(--border);
  padding: 0 20px; flex-shrink: 0;
}
#page-edge .edge-tab {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  color: var(--text-muted); background: none; border: none;
  padding: 10px 16px; cursor: pointer; position: relative;
  border-bottom: 2px solid transparent; transition: color 0.15s;
}
#page-edge .edge-tab:hover { color: var(--text); }
#page-edge .edge-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
#page-edge .edge-tab-panel { display: none; flex-direction: column; gap: 20px; }
#page-edge .edge-tab-panel.active { display: flex; }
#page-edge .section-sub {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  margin-left: 8px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  #page-edge .alerts-grid { grid-template-columns: 1fr; }
  #page-edge .alert-metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  #page-edge .edge-content { padding: 12px; }
  #page-edge .alert-card { padding: 12px; }
  #page-edge .alert-edge-score { font-size: 20px; }
}
`;
}

function getEdgeBoardPageHTML() {
  return `<div class="page" id="page-edge">
  <div class="page-header">
    <div>
      <h2>SharkEdge&trade;</h2>
      <div class="subtitle">Prediction market event risk vs options volatility</div>
    </div>
    <div class="header-right">
      <span class="refresh-badge" id="edgeLastRefresh">--</span>
      <div class="live-dot"></div>
      <span class="live-label">Live</span>
    </div>
  </div>

  <!-- Tab bar -->
  <div class="edge-tabs" id="edgeTabs">
    <button class="edge-tab active" data-tab="board" onclick="SQ.edge.switchTab('board')">Edge Board</button>
    <button class="edge-tab" data-tab="radar" onclick="SQ.edge.switchTab('radar')">Prediction Radar</button>
    <button class="edge-tab" data-tab="feed" onclick="SQ.edge.switchTab('feed')">Raw Feed</button>
  </div>

  <div class="edge-content">

    <!-- ═══ TAB 1: EDGE BOARD — tradeable intelligence only ═══ -->
    <div class="edge-tab-panel active" id="edgeTabBoard">

      <!-- Active Vol-Lag Alerts -->
      <div class="edge-section">
        <div class="section-header">
          <span class="section-title">Edge Signals</span>
          <span class="section-count" id="edgeAlertCount">0</span>
        </div>
        <div class="alerts-grid" id="edgeAlertsGrid">
          <div class="empty-state" id="edgeAlertsEmpty">
            <div class="empty-icon"><i data-lucide="zap" style="width:28px;height:28px;"></i></div>
            <div>No active edge signals</div>
            <div class="empty-sub">Signals appear when high-conviction tradeable events are detected across prediction markets</div>
          </div>
        </div>
      </div>

      <!-- Whale Activity -->
      <div class="edge-section">
        <div class="section-header">
          <span class="section-title">Whale Activity</span>
          <span class="section-count" id="edgeWhaleCount">0</span>
        </div>
        <div class="whale-table-wrap">
          <table class="whale-table" id="edgeWhaleTable">
            <thead><tr>
              <th>Time</th><th>Type</th><th>Contract</th><th>Side</th>
              <th>Size</th><th>Price</th><th>Wallet</th><th>Username</th><th>Prob</th>
            </tr></thead>
            <tbody id="edgeWhaleBody">
              <tr><td colspan="9"><div class="empty-state">
                <div class="empty-icon"><i data-lucide="fish" style="width:28px;height:28px;"></i></div>
                <div>No whale activity detected</div>
                <div class="empty-sub">Large trades and accumulation patterns appear here</div>
              </div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alert History -->
      <div class="edge-section">
        <div class="section-header">
          <span class="section-title">Alert History</span>
          <span class="section-count" id="edgeHistoryCount">0</span>
        </div>
        <div class="history-table-wrap">
          <table class="history-table" id="edgeHistoryTable">
            <thead><tr>
              <th data-sort="date" class="sort-active">Date <span class="sort-arrow">&#9660;</span></th>
              <th data-sort="event">Event <span class="sort-arrow">&#9660;</span></th>
              <th data-sort="type">Type <span class="sort-arrow">&#9660;</span></th>
              <th data-sort="score">Edge Score <span class="sort-arrow">&#9660;</span></th>
              <th>Probability</th><th>Shock</th><th>IV Reaction</th>
              <th>IV Outcome</th><th>P&amp;L</th>
            </tr></thead>
            <tbody id="edgeHistoryBody">
              <tr><td colspan="9"><div class="empty-state">
                <div class="empty-icon"><i data-lucide="history" style="width:28px;height:28px;"></i></div>
                <div>No alert history yet</div>
              </div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ TAB 2: PREDICTION RADAR — classified macro events ═══ -->
    <div class="edge-tab-panel" id="edgeTabRadar">
      <div class="edge-section">
        <div class="section-header">
          <span class="section-title">Macro Event Radar</span>
          <span class="section-count" id="edgeRadarCount">0</span>
          <span class="section-sub">Classified events &mdash; fed, inflation, geopolitics, energy, AI/semi, banking</span>
        </div>
        <div class="radar-table-wrap">
          <table class="radar-table" id="edgeRadarTable">
            <thead><tr>
              <th>Event</th><th>Platform</th><th>Category</th><th>Probability</th>
              <th>1h Chg</th><th>24h Chg</th><th>Volume 24h</th>
              <th>Liquidity</th><th>Confidence</th><th>Shock</th>
            </tr></thead>
            <tbody id="edgeRadarBody">
              <tr><td colspan="10"><div class="empty-state">
                <div class="empty-icon"><i data-lucide="radar" style="width:28px;height:28px;"></i></div>
                <div>No classified macro events</div>
                <div class="empty-sub">Events appear when prediction markets match known event&rarr;asset mappings</div>
              </div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ TAB 3: RAW FEED — all ingested contracts ═══ -->
    <div class="edge-tab-panel" id="edgeTabFeed">
      <div class="edge-section">
        <div class="section-header">
          <span class="section-title">Raw Market Feed</span>
          <span class="section-count" id="edgeFeedCount">0</span>
          <span class="section-sub">All tracked contracts by volume &mdash; unfiltered ingestion output</span>
        </div>
        <div class="radar-table-wrap">
          <table class="radar-table" id="edgeFeedTable">
            <thead><tr>
              <th>Contract</th><th>Platform</th><th>Category</th><th>Probability</th>
              <th>1h Chg</th><th>24h Chg</th><th>Volume 24h</th>
              <th>Liquidity</th><th>Confidence</th>
            </tr></thead>
            <tbody id="edgeFeedBody">
              <tr><td colspan="9"><div class="empty-state">
                <div class="empty-icon"><i data-lucide="database" style="width:28px;height:28px;"></i></div>
                <div>No contracts ingested</div>
              </div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</div>`;
}

function getEdgeBoardPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.edge = (function() {
  'use strict';

  // ── State ──
  var activeAlerts = [];
  var radarEvents = [];
  var feedData = [];
  var historyData = [];
  var whaleSignals = [];
  var refreshTimer = null;
  var socketHandlers = {};
  var sortField = 'date';
  var sortDir = 'desc';
  var currentTab = 'board';

  // ── DOM refs ──
  var $alertsGrid, $alertsEmpty, $alertCount;
  var $radarBody, $radarCount;
  var $feedBody, $feedCount;
  var $whaleBody, $whaleCount;
  var $historyBody, $historyCount;
  var $lastRefresh;

  function cacheDom() {
    $alertsGrid = document.getElementById('edgeAlertsGrid');
    $alertsEmpty = document.getElementById('edgeAlertsEmpty');
    $alertCount = document.getElementById('edgeAlertCount');
    $radarBody = document.getElementById('edgeRadarBody');
    $radarCount = document.getElementById('edgeRadarCount');
    $feedBody = document.getElementById('edgeFeedBody');
    $feedCount = document.getElementById('edgeFeedCount');
    $whaleBody = document.getElementById('edgeWhaleBody');
    $whaleCount = document.getElementById('edgeWhaleCount');
    $historyBody = document.getElementById('edgeHistoryBody');
    $historyCount = document.getElementById('edgeHistoryCount');
    $lastRefresh = document.getElementById('edgeLastRefresh');
  }

  // ── Tab switching ──
  function switchTab(tab) {
    currentTab = tab;
    var tabs = document.querySelectorAll('#page-edge .edge-tab');
    var panels = document.querySelectorAll('#page-edge .edge-tab-panel');
    tabs.forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
    panels.forEach(function(p) {
      var id = p.id.replace('edgeTab', '').toLowerCase();
      p.classList.toggle('active', id === tab);
    });
  }

  // ── Formatting helpers ──
  function fmtPct(v) {
    if (v == null || isNaN(v)) return '--';
    return (v * 100).toFixed(1) + '%';
  }

  function fmtScore(v) {
    if (v == null || isNaN(v)) return '--';
    return v.toFixed(2);
  }

  function fmtChange(v) {
    if (v == null || isNaN(v)) return '--';
    var pct = (v * 100).toFixed(1);
    return (v >= 0 ? '+' : '') + pct + '%';
  }

  function fmtDate(ts) {
    if (!ts) return '--';
    var d = new Date(ts);
    var mo = (d.getMonth() + 1).toString().padStart(2, '0');
    var dy = d.getDate().toString().padStart(2, '0');
    var hh = d.getHours().toString().padStart(2, '0');
    var mm = d.getMinutes().toString().padStart(2, '0');
    return mo + '/' + dy + ' ' + hh + ':' + mm;
  }

  function fmtTime(d) {
    var hh = d.getHours().toString().padStart(2, '0');
    var mm = d.getMinutes().toString().padStart(2, '0');
    var ss = d.getSeconds().toString().padStart(2, '0');
    return hh + ':' + mm + ':' + ss;
  }

  function changeClass(v) {
    if (v == null || isNaN(v)) return 'val-muted';
    return v > 0 ? 'change-up' : v < 0 ? 'change-down' : 'val-muted';
  }

  function edgeClass(score) {
    if (score == null || isNaN(score)) return 'low-edge';
    if (score >= 0.7) return 'high-edge';
    if (score >= 0.4) return 'medium-edge';
    return 'low-edge';
  }

  function signalBadgeClass(type) {
    if (!type) return 'underpriced';
    var t = type.toUpperCase();
    if (t === 'VOL_LAG') return 'underpriced';
    if (t === 'VOL_OVERPRICE') return 'overpriced';
    if (t === 'CONVERGENCE') return 'convergence';
    if (t === 'WHALE_SHOCK') return 'whale-shock';
    if (t === 'SHOCK_MAPPED') return 'shock-mapped';
    if (t === 'OPTIONS_LEAD') return 'options-lead';
    return 'underpriced';
  }

  function pnlClass(v) {
    if (v == null || isNaN(v)) return 'val-muted';
    return v > 0 ? 'val-pos' : v < 0 ? 'val-neg' : 'val-muted';
  }

  function fmtDollar(v) {
    if (v == null || isNaN(v)) return '--';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + v.toFixed(0);
  }

  function truncWallet(w) {
    if (!w || w.length < 12) return w || '--';
    return w.slice(0, 6) + '...' + w.slice(-4);
  }

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Update refresh timestamp ──
  function updateRefreshTime() {
    if ($lastRefresh) {
      $lastRefresh.textContent = 'Updated ' + fmtTime(new Date());
    }
  }

  // ── Fetch data ──
  function fetchAlerts() {
    fetch('/api/edge/active').then(function(r) { return r.json(); }).then(function(data) {
      if (!data || data.error) { activeAlerts = []; } else {
        activeAlerts = Array.isArray(data) ? data : (data.clusters || data.alerts || []);
      }
      renderAlerts();
      updateRefreshTime();
    }).catch(function() { activeAlerts = []; renderAlerts(); });
  }

  function fetchEvents() {
    fetch('/api/edge/events').then(function(r) { return r.json(); }).then(function(data) {
      if (!data || data.error) { radarEvents = []; } else {
        radarEvents = Array.isArray(data) ? data : (data.events || []);
      }
      renderRadar();
    }).catch(function() { radarEvents = []; renderRadar(); });
  }

  function fetchHistory() {
    fetch('/api/edge/history').then(function(r) { return r.json(); }).then(function(data) {
      if (!data || data.error) { historyData = []; } else {
        historyData = Array.isArray(data) ? data : (data.history || []);
      }
      renderHistory();
    }).catch(function() { historyData = []; renderHistory(); });
  }

  function fetchWhales() {
    fetch('/api/edge/whales').then(function(r) { return r.json(); }).then(function(data) {
      if (!data || data.error) { whaleSignals = []; } else {
        whaleSignals = Array.isArray(data) ? data : (data.signals || []);
      }
      renderWhales();
    }).catch(function() { whaleSignals = []; renderWhales(); });
  }

  function fetchFeed() {
    fetch('/api/edge/feed').then(function(r) { return r.json(); }).then(function(data) {
      if (!data || data.error) { feedData = []; } else {
        feedData = Array.isArray(data) ? data : (data.events || []);
      }
      renderFeed();
    }).catch(function() { feedData = []; renderFeed(); });
  }

  function fetchAll() {
    fetchAlerts();
    fetchEvents();
    fetchFeed();
    fetchWhales();
    fetchHistory();
  }

  // ── Render Active Alerts ──
  function renderAlerts() {
    if (!$alertsGrid) return;

    activeAlerts.sort(function(a, b) {
      return (b.edgeScore || 0) - (a.edgeScore || 0);
    });

    if ($alertCount) $alertCount.textContent = String(activeAlerts.length);

    if (activeAlerts.length === 0) {
      $alertsGrid.innerHTML = '<div class="empty-state">'
        + '<div class="empty-icon"><i data-lucide="bell-off" style="width:28px;height:28px;"></i></div>'
        + '<div>No active edge signals</div>'
        + '<div class="empty-sub">Signals appear when high-conviction tradeable events are detected</div>'
        + '</div>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    var html = '';
    activeAlerts.forEach(function(c, idx) {
      var ec = edgeClass(c.edgeScore != null ? c.edgeScore / 100 : 0);
      var badgeCls = signalBadgeClass(c.signalType);
      var nodeName = (c.eventNode || '').replace(/_/g, ' ').replace(/\b\w/g, function(ch) { return ch.toUpperCase(); });

      html += '<div class="alert-card ' + ec + '">';

      // Top row: rank + signal badge + edge score + horizon
      html += '<div class="alert-top">';
      html += '<div style="display:flex;align-items:center;gap:8px">';
      html += '<span class="alert-rank">#' + (idx + 1) + '</span>';
      html += '<span class="alert-type-badge ' + badgeCls + '">' + escHtml(c.signalBadge || c.signalType || '') + '</span>';
      if (c.timeHorizon) {
        html += '<span class="horizon-badge">' + escHtml(c.timeHorizon) + '</span>';
      }
      html += '</div>';
      html += '<div style="text-align:right">';
      html += '<div class="alert-edge-score">' + (c.edgeScore != null ? c.edgeScore.toFixed(0) : '--') + '</div>';
      html += '<div class="alert-edge-label">Edge Score</div>';
      html += '</div>';
      html += '</div>';

      // Event name + category
      html += '<div>';
      html += '<div class="alert-event">' + escHtml(nodeName) + '</div>';
      html += '<div class="alert-category">' + escHtml(c.category || '--') + '</div>';
      html += '</div>';

      // Cluster summary
      html += '<div class="alert-cluster-summary">';
      html += '<div class="summary-item"><span class="summary-label">Contracts</span> ' + (c.contractsCount || 0) + ' tracked</div>';
      html += '<div class="summary-item"><span class="summary-label">Moving</span> ' + (c.contractsMoving || 0) + '</div>';
      html += '<div class="summary-item"><span class="summary-label">Agreement</span> ' + ((c.directionalAgreement || 0) * 100).toFixed(0) + '%</div>';
      html += '</div>';

      // Metrics grid
      html += '<div class="alert-metrics">';
      html += '<div class="alert-metric"><div class="alert-metric-label">Prob (weighted)</div>';
      html += '<div class="alert-metric-value">' + fmtPct(c.weightedProbability) + '</div></div>';
      html += '<div class="alert-metric"><div class="alert-metric-label">Shock</div>';
      html += '<div class="alert-metric-value">' + (c.weightedShock != null ? c.weightedShock.toFixed(0) : '--') + '</div></div>';
      html += '<div class="alert-metric"><div class="alert-metric-label">Confidence</div>';
      html += '<div class="alert-metric-value">' + fmtPct(c.weightedConfidence) + '</div></div>';
      html += '<div class="alert-metric"><div class="alert-metric-label">IV Reaction</div>';
      html += '<div class="alert-metric-value">' + (c.basketIvReaction != null ? c.basketIvReaction.toFixed(0) : '--') + '</div></div>';
      html += '<div class="alert-metric"><div class="alert-metric-label">Attribution</div>';
      html += '<div class="alert-metric-value">' + fmtPct(c.attributionConf) + '</div></div>';
      html += '<div class="alert-metric"><div class="alert-metric-label">Convergence</div>';
      html += '<div class="alert-metric-value">' + (c.convergenceScore != null ? c.convergenceScore.toFixed(0) : '--') + '</div></div>';
      html += '</div>';

      // Trade expression
      var assets = '';
      if (c.suggestedAssets && c.suggestedAssets.length) {
        assets = c.suggestedAssets.map(function(s) { return escHtml(s); }).join(' \u00b7 ');
      }
      html += '<div class="alert-trade">';
      if (c.suggestedExpression) {
        html += '<div class="alert-trade-label">Trade Expression</div>';
        html += '<div class="alert-trade-expr">' + escHtml(c.suggestedExpression) + '</div>';
      }
      if (assets) {
        html += '<div class="alert-assets">Assets: ' + assets + '</div>';
      }
      html += '</div>';

      // Lead contract + also moving
      if (c.leadContract) {
        html += '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);margin-top:4px">';
        html += 'Lead: ' + escHtml(c.leadContract.title || '--');
        if (c.leadContract.platform) html += ' (' + escHtml(c.leadContract.platform) + ')';
        if (c.leadContract.probability != null) html += ' \u2014 ' + fmtPct(c.leadContract.probability);
        html += '</div>';
      }
      if (c.alsoMoving && c.alsoMoving.length > 0) {
        html += '<div class="also-moving">';
        c.alsoMoving.forEach(function(m) {
          html += '<div class="also-moving-item">';
          html += escHtml(m.title || '--') + ' <span class="' + changeClass(m.change1h) + '">' + fmtChange(m.change1h) + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
    });

    $alertsGrid.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Render Prediction Market Radar ──
  function renderRadar() {
    if (!$radarBody) return;

    // Sort by volume descending
    radarEvents.sort(function(a, b) { return (b.volume24h || 0) - (a.volume24h || 0); });

    if ($radarCount) $radarCount.textContent = String(radarEvents.length);

    if (radarEvents.length === 0) {
      $radarBody.innerHTML = '<tr><td colspan="10">'
        + '<div class="empty-state">'
        + '<div class="empty-icon"><i data-lucide="radar" style="width:28px;height:28px;"></i></div>'
        + '<div>No prediction market events tracked</div>'
        + '<div class="empty-sub">Events appear when the engine begins monitoring prediction markets</div>'
        + '</div></td></tr>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    var html = '';
    radarEvents.forEach(function(e) {
      var title = e.title || e.eventNode || e.event || '--';
      if (title.length > 60) title = title.substring(0, 57) + '...';
      html += '<tr>';
      html += '<td title="' + escHtml(e.title || '') + '">' + escHtml(title) + '</td>';
      html += '<td>' + escHtml(e.platform || '--') + '</td>';
      html += '<td>' + escHtml(e.category || '--') + '</td>';
      html += '<td>' + fmtPct(e.probability) + '</td>';
      html += '<td class="' + changeClass(e.change1h) + '">' + fmtChange(e.change1h) + '</td>';
      html += '<td class="' + changeClass(e.change24h) + '">' + fmtChange(e.change24h) + '</td>';
      html += '<td>' + fmtDollar(e.volume24h) + '</td>';
      html += '<td>' + fmtDollar(e.liquidity) + '</td>';
      html += '<td>' + fmtPct(e.confidence) + '</td>';
      html += '<td>' + fmtScore(e.shockScore) + '</td>';
      html += '</tr>';
    });

    $radarBody.innerHTML = html;
  }

  // ── Render Raw Feed ──
  function renderFeed() {
    if (!$feedBody) return;

    feedData.sort(function(a, b) { return (b.volume24h || 0) - (a.volume24h || 0); });

    if ($feedCount) $feedCount.textContent = String(feedData.length);

    if (feedData.length === 0) {
      $feedBody.innerHTML = '<tr><td colspan="9">'
        + '<div class="empty-state">'
        + '<div class="empty-icon"><i data-lucide="database" style="width:28px;height:28px;"></i></div>'
        + '<div>No contracts ingested</div>'
        + '<div class="empty-sub">Contracts appear when the scanner fetches from prediction markets</div>'
        + '</div></td></tr>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    var html = '';
    feedData.forEach(function(e) {
      var title = e.title || e.eventNode || e.event || '--';
      if (title.length > 60) title = title.substring(0, 57) + '...';
      html += '<tr>';
      html += '<td title="' + escHtml(e.title || '') + '">' + escHtml(title) + '</td>';
      html += '<td>' + escHtml(e.platform || '--') + '</td>';
      html += '<td>' + escHtml(e.category || '--') + '</td>';
      html += '<td>' + fmtPct(e.probability) + '</td>';
      html += '<td class="' + changeClass(e.change1h) + '">' + fmtChange(e.change1h) + '</td>';
      html += '<td class="' + changeClass(e.change24h) + '">' + fmtChange(e.change24h) + '</td>';
      html += '<td>' + fmtDollar(e.volume24h) + '</td>';
      html += '<td>' + fmtDollar(e.liquidity) + '</td>';
      html += '<td>' + fmtPct(e.confidence) + '</td>';
      html += '</tr>';
    });

    $feedBody.innerHTML = html;
  }

  // ── Render Whale Activity ──
  function renderWhales() {
    if (!$whaleBody) return;

    if ($whaleCount) $whaleCount.textContent = String(whaleSignals.length);

    if (whaleSignals.length === 0) {
      $whaleBody.innerHTML = '<tr><td colspan="9">'
        + '<div class="empty-state">'
        + '<div class="empty-icon"><i data-lucide="fish" style="width:28px;height:28px;"></i></div>'
        + '<div>No whale activity detected</div>'
        + '<div class="empty-sub">Large trades, accumulation patterns, and known whale entries appear here</div>'
        + '</div></td></tr>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    var html = '';
    whaleSignals.forEach(function(w) {
      var typeCls = w.signalType === 'large_trade' ? 'large-trade'
        : w.signalType === 'accumulation' ? 'accumulation' : 'known-whale';
      var typeLabel = w.signalType === 'large_trade' ? 'LARGE'
        : w.signalType === 'accumulation' ? 'ACCUM' : 'WHALE';
      var sideCls = w.side === 'buy' ? 'whale-side-buy' : 'whale-side-sell';
      var title = w.title || '--';
      if (title.length > 45) title = title.substring(0, 42) + '...';

      html += '<tr>';
      html += '<td>' + fmtDate(w.tradeTs || w.ts) + '</td>';
      html += '<td><span class="whale-badge ' + typeCls + '">' + typeLabel + '</span></td>';
      html += '<td title="' + escHtml(w.title || '') + '">' + escHtml(title) + '</td>';
      html += '<td class="' + sideCls + '">' + (w.side || '--').toUpperCase() + ' ' + escHtml(w.outcome || '') + '</td>';
      html += '<td>' + fmtDollar(w.dollarValue || w.size) + '</td>';
      html += '<td>' + (w.price != null ? w.price.toFixed(3) : '--') + '</td>';
      html += '<td class="whale-wallet" title="' + escHtml(w.wallet) + '">' + truncWallet(w.wallet) + '</td>';
      html += '<td>' + escHtml(w.username || w.pseudonym || '--') + '</td>';
      html += '<td>' + fmtPct(w.probability) + '</td>';
      html += '</tr>';
    });

    $whaleBody.innerHTML = html;
  }

  // ── Render Alert History ──
  function renderHistory() {
    if (!$historyBody) return;

    // Sort history
    var sorted = historyData.slice().sort(function(a, b) {
      var av, bv;
      if (sortField === 'date') {
        av = new Date(a.date || a.timestamp || 0).getTime();
        bv = new Date(b.date || b.timestamp || 0).getTime();
      } else if (sortField === 'score') {
        av = a.finalEdgeScore || 0;
        bv = b.finalEdgeScore || 0;
      } else if (sortField === 'event') {
        av = (a.eventNode || a.event || '').toLowerCase();
        bv = (b.eventNode || b.event || '').toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      } else if (sortField === 'type') {
        av = (a.alertType || '').toLowerCase();
        bv = (b.alertType || '').toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      } else {
        av = 0; bv = 0;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    if ($historyCount) $historyCount.textContent = String(sorted.length);

    if (sorted.length === 0) {
      $historyBody.innerHTML = '<tr><td colspan="9">'
        + '<div class="empty-state">'
        + '<div class="empty-icon"><i data-lucide="history" style="width:28px;height:28px;"></i></div>'
        + '<div>No alert history yet</div>'
        + '<div class="empty-sub">Past alerts with IV outcome tracking will appear here</div>'
        + '</div></td></tr>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    var html = '';
    sorted.forEach(function(h) {
      var typeLabel = h.alertType === 'overpriced' ? 'OVER' : 'UNDER';
      var typeCls = h.alertType === 'overpriced' ? 'val-neg' : 'val-pos';

      html += '<tr>';
      html += '<td>' + fmtDate(h.date || h.timestamp) + '</td>';
      html += '<td>' + escHtml(h.eventNode || h.event || '--') + '</td>';
      html += '<td class="' + typeCls + '">' + typeLabel + '</td>';
      html += '<td class="val-accent" style="font-weight:700">' + fmtScore(h.finalEdgeScore) + '</td>';
      html += '<td>' + fmtPct(h.predictionProbability) + '</td>';
      html += '<td>' + fmtScore(h.shockScore) + '</td>';
      html += '<td>' + fmtScore(h.basketIvReaction) + '</td>';
      html += '<td class="' + pnlClass(h.ivOutcome) + '">' + (h.ivOutcome != null ? fmtChange(h.ivOutcome) : '--') + '</td>';
      html += '<td class="' + pnlClass(h.pnl) + '">' + (h.pnl != null ? (h.pnl >= 0 ? '+' : '') + h.pnl.toFixed(2) + '%' : '--') + '</td>';
      html += '</tr>';
    });

    $historyBody.innerHTML = html;
  }

  // ── Sort handler ──
  function bindSort() {
    var table = document.getElementById('edgeHistoryTable');
    if (!table) return;
    table.querySelectorAll('thead th[data-sort]').forEach(function(th) {
      th.addEventListener('click', function() {
        var field = th.dataset.sort;
        if (sortField === field) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortField = field;
          sortDir = 'desc';
        }
        // Update active class
        table.querySelectorAll('thead th').forEach(function(h) { h.classList.remove('sort-active'); });
        th.classList.add('sort-active');
        // Update arrow
        table.querySelectorAll('thead th .sort-arrow').forEach(function(a) {
          a.innerHTML = '&#9660;';
        });
        th.querySelector('.sort-arrow').innerHTML = sortDir === 'asc' ? '&#9650;' : '&#9660;';
        renderHistory();
      });
    });
  }

  // ── Socket handlers for real-time updates ──
  function handleEdgeAlert(alert) {
    if (!alert) return;
    var idx = -1;
    for (var i = 0; i < activeAlerts.length; i++) {
      if ((alert.id && activeAlerts[i].id === alert.id) ||
          (alert.eventNode && activeAlerts[i].eventNode === alert.eventNode)) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      activeAlerts[idx] = alert;
    } else {
      activeAlerts.push(alert);
    }
    renderAlerts();
  }

  function handleWhaleSignals(signals) {
    if (!signals || !Array.isArray(signals)) return;
    // Prepend new signals, cap at 100
    whaleSignals = signals.concat(whaleSignals).slice(0, 100);
    renderWhales();
  }

  // ── init / destroy ──
  function init() {
    cacheDom();
    bindSort();

    // Subscribe via shared socket
    if (SQ.socket) {
      socketHandlers = {
        'edge:alert': handleEdgeAlert,
        'edge:whale': handleWhaleSignals
      };
      Object.keys(socketHandlers).forEach(function(evt) {
        SQ.socket.on(evt, socketHandlers[evt]);
      });
    }

    // Initial fetch
    fetchAll();

    // Auto-refresh every 60s
    refreshTimer = setInterval(fetchAll, 60000);
  }

  function destroy() {
    // Unsubscribe socket
    if (SQ.socket) {
      Object.keys(socketHandlers).forEach(function(evt) {
        SQ.socket.off(evt, socketHandlers[evt]);
      });
      socketHandlers = {};
    }

    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }

    // Reset state
    activeAlerts = [];
    radarEvents = [];
    feedData = [];
    whaleSignals = [];
    historyData = [];
    sortField = 'date';
    sortDir = 'desc';
  }

  return { init: init, destroy: destroy, switchTab: switchTab };
})();
`;
}

module.exports = { getEdgeBoardPageCSS, getEdgeBoardPageHTML, getEdgeBoardPageJS };
