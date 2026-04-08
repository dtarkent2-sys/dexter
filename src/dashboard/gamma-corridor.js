'use strict';

/**
 * Spot-Centered Gamma Corridor — Dashboard Page
 *
 * Visualizes the gamma structure engine output as a vertical corridor map.
 * Region-based rendering: walls, air pockets, acceleration paths, pin zones.
 * Follows spec Section 7 and the HUD design system (amber/cyan, glass panels, angular corners).
 *
 * SPA module pattern: getPageCSS() / getPageHTML() / getPageJS()
 * CSS scoped under #page-corridor, JS on SQ.corridor namespace.
 */

function getPageCSS() {
  return `
/* ── Gamma Corridor Page ── */
#page-corridor {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* Ticker Tabs */
#page-corridor .corr-ticker-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
}
#page-corridor .corr-ticker-tab {
  padding: 6px 20px;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
  transition: all 0.15s;
}
#page-corridor .corr-ticker-tab.active {
  background: rgba(251,191,36,0.12);
  color: var(--accent);
  border-color: rgba(251,191,36,0.3);
}

/* Regime Banner */
#page-corridor .corr-regime-banner {
  margin: 12px 20px 0;
  padding: 12px 16px;
  border-radius: 4px;
  border-left: 4px solid var(--border);
  background: var(--glass);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: border-color 0.4s, background 0.4s;
  position: relative;
  overflow: hidden;
}
#page-corridor .corr-regime-banner.regime-LONG_GAMMA {
  border-left-color: var(--cyan);
  background: rgba(34,211,238,0.06);
}
#page-corridor .corr-regime-banner.regime-SHORT_GAMMA {
  border-left-color: var(--red);
  background: rgba(248,113,113,0.06);
}
#page-corridor .corr-regime-banner.regime-NEUTRAL {
  border-left-color: var(--accent);
  background: rgba(251,191,36,0.06);
}
#page-corridor .corr-regime-banner.regime-UNCERTAIN {
  border-left-color: #64748b;
  background: rgba(100,116,139,0.06);
}
#page-corridor .corr-regime-banner.is-historical {
  opacity: 0.6;
}
#page-corridor .regime-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border);
  flex-shrink: 0;
}
#page-corridor .regime-LONG_GAMMA .regime-dot { background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }
#page-corridor .regime-SHORT_GAMMA .regime-dot { background: var(--red); box-shadow: 0 0 6px var(--red); }
#page-corridor .regime-NEUTRAL .regime-dot { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
#page-corridor .regime-UNCERTAIN .regime-dot { background: #64748b; }
#page-corridor .regime-text {
  flex: 1;
}
#page-corridor .regime-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text);
}
#page-corridor .regime-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  letter-spacing: 0.5px;
}
#page-corridor .regime-conf {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text-muted);
  text-align: right;
}
#page-corridor .regime-historical-badge {
  font-size: 10px;
  color: var(--accent);
  background: rgba(251,191,36,0.1);
  border: 1px solid rgba(251,191,36,0.2);
  border-radius: 2px;
  padding: 2px 6px;
  letter-spacing: 1px;
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
}

/* Path Summary */
#page-corridor .corr-path-summary {
  margin: 10px 20px 0;
  padding: 12px 16px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  backdrop-filter: blur(8px);
}
#page-corridor .corr-path-summary .summary-line {
  font-size: 13px;
  color: var(--text);
  font-family: Inter, sans-serif;
  line-height: 1.6;
}
#page-corridor .corr-path-summary .summary-line + .summary-line {
  margin-top: 3px;
  color: var(--text-muted);
}
#page-corridor .corr-path-summary .summary-line:last-child {
  color: #94a3b8;
  font-style: italic;
}
#page-corridor .corr-path-summary .summary-empty {
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
}

/* Main Layout: Corridor + Detail Panel */
#page-corridor .corr-body {
  flex: 1;
  display: flex;
  gap: 0;
  min-height: 0;
  margin-top: 12px;
  overflow: hidden;
}

/* Corridor Map */
#page-corridor .corr-map-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 12px 0 20px;
  position: relative;
}
#page-corridor .corr-map {
  position: relative;
  width: 100%;
  min-height: 400px;
}

/* Path of Least Resistance overlay */
#page-corridor .corr-polr-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

/* Strike rows */
#page-corridor .corr-strike-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  margin-bottom: 2px;
  position: relative;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.15s;
}
#page-corridor .corr-strike-row:hover {
  background: rgba(255,255,255,0.03);
}
#page-corridor .corr-strike-row.is-spot {
  height: 32px;
  z-index: 10;
  margin-bottom: 2px;
  margin-top: 2px;
}
#page-corridor .corr-strike-label {
  width: 52px;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}
#page-corridor .corr-strike-row.is-spot .corr-strike-label {
  color: var(--text);
  font-weight: 700;
}
#page-corridor .corr-bar-wrap {
  flex: 1;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

/* Normal bar (thin, subdued) */
#page-corridor .corr-bar {
  height: 20px;
  border-radius: 2px;
  background: rgba(148,163,184,0.12);
  min-width: 2px;
  transition: width 0.4s ease;
  position: relative;
}

/* Spot line */
#page-corridor .corr-spot-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: #f8fafc;
  box-shadow: 0 0 8px rgba(248,250,252,0.6), 0 0 16px rgba(248,250,252,0.3);
  border-radius: 2px;
  z-index: 8;
}
#page-corridor .corr-spot-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
  margin-left: 8px;
}

/* Wall bars — call (amber) and put (cyan) */
#page-corridor .corr-bar.wall-call {
  height: 28px;
  background: rgba(251,191,36,0.25);
  border: 1px solid rgba(251,191,36,0.5);
  border-radius: 2px;
}
#page-corridor .corr-bar.wall-put {
  height: 28px;
  background: rgba(34,211,238,0.2);
  border: 1px solid rgba(34,211,238,0.4);
  border-radius: 2px;
}

/* State overlays — applied on top of identity classes */
#page-corridor .corr-bar.overlay-weakening {
  border-style: dashed !important;
  opacity: 0.75;
}
#page-corridor .corr-bar.overlay-breached {
  opacity: 0.4;
  border-style: dashed !important;
  text-decoration: line-through;
}
#page-corridor .corr-bar.overlay-trap-pulse {
  animation: corr-trap-pulse 1.2s ease-in-out infinite;
}
@keyframes corr-trap-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(251,191,36,0); }
}
#page-corridor .corr-bar.overlay-trap-break {
  animation: corr-trap-break 0.3s ease-out 3;
}
@keyframes corr-trap-break {
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
}
#page-corridor .corr-bar.overlay-emerging {
  animation: corr-emerge 0.6s ease-in forwards;
}
@keyframes corr-emerge {
  from { opacity: 0; transform: scaleX(0.5); }
  to { opacity: 1; transform: scaleX(1); }
}
#page-corridor .corr-bar.overlay-defended {
  box-shadow: 0 0 0 2px rgba(34,211,238,0.4), inset 0 0 0 1px rgba(34,211,238,0.2);
}

/* Air pocket region */
#page-corridor .corr-air-pocket {
  position: absolute;
  left: 60px;
  right: 0;
  pointer-events: none;
  border-left: 2px solid rgba(148,163,184,0.15);
  background: rgba(148,163,184,0.03);
  z-index: 1;
  border-radius: 0 2px 2px 0;
}
#page-corridor .corr-air-pocket-label {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 9px;
  color: #64748b;
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Acceleration path region */
#page-corridor .corr-accel-region {
  position: absolute;
  left: 60px;
  right: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    rgba(251,191,36,0.04) 0px,
    rgba(251,191,36,0.04) 4px,
    transparent 4px,
    transparent 8px
  );
  border-left: 2px solid rgba(251,191,36,0.15);
  z-index: 2;
}

/* Pin zone region */
#page-corridor .corr-pin-zone {
  position: absolute;
  left: 60px;
  right: 0;
  pointer-events: none;
  background: rgba(34,211,238,0.04);
  border: 1px dashed rgba(34,211,238,0.15);
  z-index: 2;
}

/* Wall icons */
#page-corridor .corr-wall-icon {
  font-size: 10px;
  margin-left: 4px;
  opacity: 0.8;
}

/* Compact hover tooltip */
#page-corridor .corr-hover-tip {
  display: none;
  position: fixed;
  z-index: 200;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  padding: 10px 14px;
  min-width: 180px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  pointer-events: none;
}
#page-corridor .corr-hover-tip.visible { display: block; }
#page-corridor .corr-hover-tip .tip-strike {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}
#page-corridor .corr-hover-tip .tip-type {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}
#page-corridor .corr-hover-tip .tip-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 12px;
  margin-bottom: 3px;
}
#page-corridor .corr-hover-tip .tip-key { color: var(--text-muted); }
#page-corridor .corr-hover-tip .tip-val {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text);
}

/* Detail Panel (click/pin) */
#page-corridor .corr-detail-panel {
  width: 0;
  overflow: hidden;
  transition: width 0.25s ease;
  background: var(--glass);
  border-left: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  flex-shrink: 0;
}
#page-corridor .corr-detail-panel.open {
  width: 280px;
  overflow-y: auto;
}
#page-corridor .corr-detail-inner {
  padding: 16px;
  min-width: 280px;
}
#page-corridor .corr-detail-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  float: right;
  line-height: 1;
}
#page-corridor .corr-detail-close:hover { color: var(--text); }
#page-corridor .corr-detail-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text);
  margin-bottom: 4px;
  margin-top: 4px;
}
#page-corridor .corr-detail-subtitle {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
#page-corridor .corr-detail-section {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
#page-corridor .corr-detail-section:last-child { border: none; margin: 0; padding: 0; }
#page-corridor .corr-detail-section-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}
#page-corridor .corr-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}
#page-corridor .corr-detail-key { color: var(--text-muted); }
#page-corridor .corr-detail-val {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text);
}
#page-corridor .corr-detail-val.amber { color: var(--accent); }
#page-corridor .corr-detail-val.cyan { color: var(--cyan); }
#page-corridor .corr-detail-val.green { color: var(--green); }
#page-corridor .corr-detail-val.red { color: var(--red); }
#page-corridor .corr-detail-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
#page-corridor .corr-detail-flag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  background: rgba(251,191,36,0.1);
  color: var(--accent);
  border: 1px solid rgba(251,191,36,0.2);
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
#page-corridor .corr-persist-bar {
  display: flex;
  gap: 2px;
  margin-top: 6px;
}
#page-corridor .corr-persist-tick {
  width: 8px;
  height: 14px;
  border-radius: 1px;
  background: var(--border);
  transition: background 0.2s;
}
#page-corridor .corr-persist-tick.present { background: var(--accent); }
#page-corridor .corr-persist-tick.absent { background: rgba(148,163,184,0.15); }

/* State Bar */
#page-corridor .corr-state-bar {
  margin: 10px 20px 0;
  padding: 10px 16px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
#page-corridor .state-bar-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
}
#page-corridor .state-bar-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text);
}
#page-corridor .state-bar-sep {
  color: var(--border);
  font-size: 18px;
}
#page-corridor .state-bar-uncertain {
  color: #94a3b8;
  font-size: 12px;
  font-style: italic;
  font-family: Inter, sans-serif;
}

/* Replay Mode */
#page-corridor.replay-mode {
  border: 2px solid var(--accent);
  border-radius: 4px;
}
#page-corridor .replay-badge {
  display: none;
  position: absolute;
  top: 8px;
  right: 12px;
  background: rgba(251,191,36,0.15);
  border: 1px solid rgba(251,191,36,0.4);
  color: var(--accent);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 2px;
  z-index: 100;
}
#page-corridor.replay-mode .replay-badge { display: block; }
#page-corridor .replay-controls {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
}
#page-corridor.replay-mode .replay-controls { display: flex; }
#page-corridor .replay-btn {
  background: rgba(251,191,36,0.08);
  border: 1px solid rgba(251,191,36,0.2);
  color: var(--accent);
  border-radius: 3px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 1px;
}
#page-corridor .replay-btn:hover { background: rgba(251,191,36,0.15); }
#page-corridor .replay-ts {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
}

/* Connection Status */
#page-corridor .corr-conn-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-muted);
  margin-left: auto;
}
#page-corridor .corr-conn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
}
#page-corridor .corr-conn-dot.live { background: var(--green); box-shadow: 0 0 4px var(--green); }
#page-corridor .corr-conn-dot.error { background: var(--red); }

/* Empty / Loading states */
#page-corridor .corr-empty {
  padding: 48px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  font-family: Inter, sans-serif;
}
#page-corridor .corr-empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.4;
}

/* Bottom spacing */
#page-corridor .corr-spacer { height: 16px; }

/* Light mode overrides */
:root.light #page-corridor .wall-call {
  background: rgba(217,119,6,0.15);
  border-color: rgba(217,119,6,0.4);
}
:root.light #page-corridor .wall-put {
  background: rgba(8,145,178,0.12);
  border-color: rgba(8,145,178,0.35);
}
:root.light #page-corridor .corr-spot-line {
  background: #0f172a;
  box-shadow: 0 0 8px rgba(15,23,42,0.4);
}
`;
}

function getPageHTML() {
  return `
  <!-- GAMMA CORRIDOR PAGE -->
  <div class="page" id="page-corridor" style="position:relative;">
    <div class="replay-badge" id="corr-replay-badge">&#9654; REPLAY</div>
    <div class="page-header" style="padding:16px 20px 0;">
      <div>
        <h2 style="font-family:'Barlow Condensed',sans-serif;letter-spacing:2px;text-transform:uppercase;">Gamma Corridor</h2>
        <div class="subtitle">Spot-centered gamma structure map</div>
      </div>
      <div class="corr-conn-status" id="corr-conn-status">
        <span class="corr-conn-dot" id="corr-conn-dot"></span>
        <span id="corr-conn-label">Offline</span>
      </div>
    </div>

    <!-- Ticker Tabs -->
    <div class="corr-ticker-tabs" id="corr-ticker-tabs">
      <button class="corr-ticker-tab active" data-ticker="SPY">SPY</button>
      <button class="corr-ticker-tab" data-ticker="QQQ">QQQ</button>
    </div>

    <!-- Replay Controls (hidden unless replay mode) -->
    <div class="replay-controls" id="corr-replay-controls">
      <button class="replay-btn" id="corr-replay-back">&#9664; Back</button>
      <button class="replay-btn" id="corr-replay-play">&#9646;&#9646; Pause</button>
      <button class="replay-btn" id="corr-replay-fwd">Fwd &#9654;</button>
      <span class="replay-ts" id="corr-replay-ts"></span>
    </div>

    <!-- Regime Banner -->
    <div class="corr-regime-banner" id="corr-regime-banner">
      <div class="regime-dot" id="corr-regime-dot"></div>
      <div class="regime-text">
        <div class="regime-label" id="corr-regime-label">Waiting for data...</div>
        <div class="regime-sub" id="corr-regime-sub"></div>
      </div>
      <div class="regime-conf" id="corr-regime-conf"></div>
      <div class="regime-historical-badge" id="corr-regime-hist-badge" style="display:none;">(historical)</div>
    </div>

    <!-- Path Summary -->
    <div class="corr-path-summary" id="corr-path-summary">
      <div class="summary-empty" id="corr-summary-empty">Computing path summary...</div>
      <div id="corr-summary-lines" style="display:none;"></div>
    </div>

    <!-- Body: Corridor Map + Detail Panel -->
    <div class="corr-body" id="corr-body">
      <!-- Map -->
      <div class="corr-map-wrap" id="corr-map-wrap">
        <div class="corr-map" id="corr-map">
          <svg class="corr-polr-svg" id="corr-polr-svg"></svg>
          <div class="corr-empty" id="corr-map-empty">
            <div class="corr-empty-icon">&#9644;</div>
            <div>No corridor data — connect to stream or wait for next snapshot.</div>
          </div>
        </div>
        <div class="corr-spacer"></div>
      </div>

      <!-- Detail Panel -->
      <div class="corr-detail-panel" id="corr-detail-panel">
        <div class="corr-detail-inner" id="corr-detail-inner">
          <!-- populated dynamically -->
        </div>
      </div>
    </div>

    <!-- State Bar -->
    <div class="corr-state-bar" id="corr-state-bar">
      <div>
        <div class="state-bar-label">State</div>
        <div class="state-bar-value" id="corr-state-value">—</div>
      </div>
      <div class="state-bar-sep">|</div>
      <div>
        <div class="state-bar-label">Duration</div>
        <div class="state-bar-value" id="corr-state-dur">—</div>
      </div>
      <div class="state-bar-sep">|</div>
      <div>
        <div class="state-bar-label">Transitions</div>
        <div class="state-bar-value" id="corr-state-trans">—</div>
      </div>
      <div class="state-bar-uncertain" id="corr-state-uncertain" style="display:none;"></div>
    </div>

    <!-- Hover Tooltip (global, positioned by JS) -->
    <div class="corr-hover-tip" id="corr-hover-tip">
      <div class="tip-strike" id="tip-strike"></div>
      <div class="tip-type" id="tip-type"></div>
      <div class="tip-row"><span class="tip-key">Eff GEX</span><span class="tip-val" id="tip-gex"></span></div>
      <div class="tip-row"><span class="tip-key">Quality</span><span class="tip-val" id="tip-qual"></span></div>
      <div class="tip-row" id="tip-status-row"><span class="tip-key">Status</span><span class="tip-val" id="tip-status"></span></div>
    </div>
  </div>
`;
}

function getPageJS() {
  return `
;(function() {
  'use strict';

  // ── Module State ──────────────────────────────────────────────────────
  var _ticker = 'SPY';
  var _sse = null;
  var _sseRetryTimer = null;
  var _animPriority = 0; // tracks highest-priority animation currently running
  var _lastData = null;  // last full structure data
  var _pinnedStrike = null; // currently pinned detail panel strike
  var _replayMode = false;
  var _replayHistory = [];
  var _replayIdx = 0;
  var _replayTimer = null;
  var _isAlive = false;

  // Animation priority constants
  var ANIM = { NONE: 0, EMERGING: 1, SPOT: 2, ACCEL: 3, TRAP_PULSE: 4, TRAP_BREAK: 5 };

  // ── Public API ────────────────────────────────────────────────────────
  SQ.corridor = {
    init: function() {
      _isAlive = true;
      _initTickerTabs();
      _connectSSE();
    },
    destroy: function() {
      _isAlive = false;
      _disconnectSSE();
      if (_sseRetryTimer) { clearTimeout(_sseRetryTimer); _sseRetryTimer = null; }
      if (_replayTimer) { clearInterval(_replayTimer); _replayTimer = null; }
      _hideTip();
      _closeDetail();
      _animPriority = 0;
      _pinnedStrike = null;
    }
  };

  // ── Ticker Tabs ───────────────────────────────────────────────────────
  function _initTickerTabs() {
    var tabs = document.querySelectorAll('#corr-ticker-tabs .corr-ticker-tab');
    tabs.forEach(function(btn) {
      btn.onclick = function() {
        tabs.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        _ticker = btn.dataset.ticker;
        _lastData = null;
        _resetView();
        _disconnectSSE();
        _connectSSE();
      };
    });
  }

  // ── SSE Connection ────────────────────────────────────────────────────
  function _connectSSE() {
    if (!_isAlive) return;
    _setConnStatus('connecting');
    try {
      _sse = new EventSource('/api/gamma/corridor/' + _ticker + '/stream');

      _sse.addEventListener('structure_full', function(e) {
        try { _handleStructureFull(JSON.parse(e.data)); } catch(ex) { console.warn('[corridor] structure_full parse error', ex); }
      });
      _sse.addEventListener('state_change', function(e) {
        try { _handleStateChange(JSON.parse(e.data)); } catch(ex) {}
      });
      _sse.addEventListener('spot_update', function(e) {
        try { _handleSpotUpdate(JSON.parse(e.data)); } catch(ex) {}
      });
      _sse.addEventListener('wall_break', function(e) {
        try { _handleWallBreak(JSON.parse(e.data)); } catch(ex) {}
      });
      _sse.addEventListener('trap_event', function(e) {
        try { _handleTrapEvent(JSON.parse(e.data)); } catch(ex) {}
      });
      _sse.addEventListener('regime_change', function(e) {
        try { _handleRegimeChange(JSON.parse(e.data)); } catch(ex) {}
      });
      _sse.onmessage = function(e) {
        // Generic message fallback — try to parse as structure_full
        try {
          var d = JSON.parse(e.data);
          if (d && (d.structures || d.state)) _handleStructureFull(d);
        } catch(ex) {}
      };
      _sse.onopen = function() {
        _setConnStatus('live');
      };
      _sse.onerror = function() {
        _setConnStatus('error');
        if (_sse) { _sse.close(); _sse = null; }
        if (_isAlive) {
          _sseRetryTimer = setTimeout(_connectSSE, 10000);
        }
      };
    } catch(ex) {
      _setConnStatus('error');
      if (_isAlive) _sseRetryTimer = setTimeout(_connectSSE, 15000);
    }
  }

  function _disconnectSSE() {
    if (_sse) { try { _sse.close(); } catch(ex) {} _sse = null; }
    _setConnStatus('offline');
  }

  function _setConnStatus(status) {
    var dot = document.getElementById('corr-conn-dot');
    var lbl = document.getElementById('corr-conn-label');
    if (!dot || !lbl) return;
    dot.className = 'corr-conn-dot';
    if (status === 'live') { dot.classList.add('live'); lbl.textContent = 'Live'; }
    else if (status === 'connecting') { lbl.textContent = 'Connecting...'; }
    else if (status === 'error') { dot.classList.add('error'); lbl.textContent = 'Reconnecting...'; }
    else { lbl.textContent = 'Offline'; }
  }

  // ── SSE Event Handlers ────────────────────────────────────────────────
  function _handleStructureFull(data) {
    _lastData = data;
    _renderRegimeBanner(data.regime);
    _renderPathSummary(data);
    _renderCorridor(data);
    _renderStateBar(data);
    _setConnStatus('live');
  }

  function _handleStateChange(data) {
    if (!_lastData) return;
    _lastData.state = data.state;
    _lastData.state_duration = data.duration;
    _lastData.possible_transitions = data.possible_transitions;
    _renderStateBar(_lastData);
  }

  function _handleSpotUpdate(data) {
    if (!_lastData) return;
    var oldSpot = _lastData.spot;
    _lastData.spot = data.spot;
    // Animate spot if not higher-priority animation running
    if (_animPriority <= ANIM.SPOT) {
      _animPriority = ANIM.SPOT;
      _updateSpotRow(data.spot, oldSpot);
      setTimeout(function() { if (_animPriority === ANIM.SPOT) _animPriority = ANIM.NONE; }, 400);
    }
    _updatePolrArrow(_lastData);
  }

  function _handleWallBreak(data) {
    // Highest priority animation — always fires
    _animPriority = ANIM.TRAP_BREAK;
    var row = document.querySelector('.corr-strike-row[data-strike="' + data.strike + '"]');
    if (row) {
      var bar = row.querySelector('.corr-bar');
      if (bar) {
        bar.classList.remove('overlay-trap-pulse', 'overlay-weakening');
        bar.classList.add('overlay-breached', 'overlay-trap-break');
        setTimeout(function() {
          bar.classList.remove('overlay-trap-break');
          _animPriority = ANIM.NONE;
        }, 1000);
      }
    }
  }

  function _handleTrapEvent(data) {
    if (_animPriority >= ANIM.TRAP_BREAK) return;
    _animPriority = data.event_type === 'forming' ? ANIM.TRAP_PULSE : ANIM.TRAP_BREAK;
    var row = document.querySelector('.corr-strike-row[data-strike="' + data.strike + '"]');
    if (row) {
      var bar = row.querySelector('.corr-bar');
      if (bar) {
        if (data.event_type === 'forming') {
          bar.classList.add('overlay-trap-pulse');
          setTimeout(function() { if (_animPriority === ANIM.TRAP_PULSE) _animPriority = ANIM.NONE; }, 5000);
        } else {
          bar.classList.remove('overlay-trap-pulse');
          bar.classList.add('overlay-trap-break');
          setTimeout(function() { bar.classList.remove('overlay-trap-break'); _animPriority = ANIM.NONE; }, 1000);
        }
      }
    }
  }

  function _handleRegimeChange(data) {
    if (!_lastData) return;
    _lastData.regime = data;
    _renderRegimeBanner(data);
  }

  // ── Regime Banner ─────────────────────────────────────────────────────
  function _renderRegimeBanner(regime) {
    var banner = document.getElementById('corr-regime-banner');
    var labelEl = document.getElementById('corr-regime-label');
    var subEl = document.getElementById('corr-regime-sub');
    var confEl = document.getElementById('corr-regime-conf');
    var histBadge = document.getElementById('corr-regime-hist-badge');
    if (!banner || !regime) return;

    // Remove old regime classes
    banner.className = 'corr-regime-banner';
    var r = regime.regime_label || 'UNCERTAIN';
    banner.classList.add('regime-' + r);
    if (_replayMode) banner.classList.add('is-historical');

    var labels = {
      LONG_GAMMA: 'LONG GAMMA',
      SHORT_GAMMA: 'SHORT GAMMA',
      NEUTRAL: 'NEUTRAL',
      UNCERTAIN: 'UNCERTAIN'
    };
    var expansionText = {
      LONG_GAMMA: 'compression favored',
      SHORT_GAMMA: 'expansion favored',
      NEUTRAL: 'balanced flow',
      UNCERTAIN: 'regime undefined'
    };

    var conf = regime.regime_confidence ? Math.round(regime.regime_confidence * 100) + '%' : '—';
    var instability = _instabilityWord(regime.regime_instability);

    labelEl.textContent = (labels[r] || r) + ' · ' + (expansionText[r] || '') + ' · conf ' + conf;
    subEl.textContent = (regime.regime_transition || 'established') + ' · instability: ' + instability;
    confEl.textContent = 'conf ' + conf;
    if (histBadge) histBadge.style.display = _replayMode ? '' : 'none';
  }

  function _instabilityWord(v) {
    if (v == null) return 'unknown';
    if (v < 0.25) return 'low';
    if (v < 0.55) return 'moderate';
    return 'high';
  }

  // ── Path Summary ──────────────────────────────────────────────────────
  function _renderPathSummary(data) {
    var emptyEl = document.getElementById('corr-summary-empty');
    var linesEl = document.getElementById('corr-summary-lines');
    if (!emptyEl || !linesEl) return;

    var lines = _buildPathSummary(data);
    if (!lines || !lines.length) {
      emptyEl.style.display = '';
      linesEl.style.display = 'none';
      return;
    }
    emptyEl.style.display = 'none';
    linesEl.style.display = '';
    linesEl.innerHTML = lines.map(function(line, i) {
      return '<div class="summary-line">' + _esc(line) + '</div>';
    }).join('');
  }

  function _buildPathSummary(data) {
    if (!data) return [];
    var lines = [];
    var spot = data.spot;
    var structures = data.structures || [];
    var regime = data.regime || {};
    var state = data.state || 'REBALANCING';

    // Line 1: Dominant thesis
    var trapStrike = null;
    var nearWall = null;
    var airPocket = null;

    structures.forEach(function(s) {
      if ((s.type === 'GAMMA_TRAP' || s.type === 'TRAP_FORMING') && !trapStrike) trapStrike = s;
      if ((s.type === 'CALL_WALL' || s.type === 'PUT_WALL') && !nearWall) {
        var dist = Math.abs((s.strike || 0) - spot);
        if (!nearWall || dist < Math.abs((nearWall.strike || 0) - spot)) nearWall = s;
      }
      if (s.type === 'AIR_POCKET' && !airPocket) airPocket = s;
    });

    if (trapStrike) {
      lines.push('Trap forming at ' + trapStrike.strike + ' — break would accelerate to ' + (trapStrike.target_strike || '?'));
    } else if (nearWall && spot) {
      var side = nearWall.strike > spot ? 'above' : 'below';
      var wallType = nearWall.type === 'CALL_WALL' ? 'call wall' : 'put wall';
      var stateStr = nearWall.state ? ' (' + nearWall.state.toLowerCase() + ')' : '';
      lines.push((side === 'above' ? 'Above' : 'Below') + ' spot: ' + wallType + ' at ' + nearWall.strike + stateStr + '.');
    } else {
      lines.push('No dominant wall structure near spot.');
    }

    // Line 2: Directional path
    if (airPocket && spot) {
      var dir = airPocket.low > spot ? 'above' : 'below';
      lines.push((dir === 'above' ? 'Above' : 'Below') + ' spot: thin corridor to ' + (airPocket.type === 'AIR_POCKET' ? 'air pocket' : 'open zone') + ' at ' + (airPocket.low || airPocket.strike || '?') + '–' + (airPocket.high || '') + '.');
    } else if (nearWall) {
      lines.push('Path of least resistance: ' + (nearWall.path_integrity > 0.5 ? 'open' : 'contested') + ' toward ' + nearWall.strike + '.');
    }

    // Line 3: Caution/context
    if (regime.regime_label === 'SHORT_GAMMA') {
      lines.push('Short gamma — moves may accelerate if wall breaks.');
    } else if (regime.regime_label === 'LONG_GAMMA') {
      lines.push('Long gamma — pinning tendency, mean-reversion favored.');
    } else if (regime.regime_instability > 0.5) {
      lines.push('Regime unstable — signals may shift rapidly.');
    } else if (state === 'REBALANCING') {
      lines.push('Market rebalancing — no strong structural bias.');
    }

    return lines.slice(0, 3);
  }

  // ── Corridor Rendering ────────────────────────────────────────────────
  function _renderCorridor(data) {
    var map = document.getElementById('corr-map');
    var empty = document.getElementById('corr-map-empty');
    if (!map) return;

    var structures = data.structures || [];
    var strikes = data.strikes || [];
    var spot = data.spot;

    if (!strikes.length && !spot) {
      empty.style.display = '';
      // Remove all rows except empty + SVG
      _clearMapRows(map);
      return;
    }
    empty.style.display = 'none';

    // Build a lookup of structure data by strike
    var structByStrike = {};
    structures.forEach(function(s) {
      var key = s.strike;
      if (!structByStrike[key]) structByStrike[key] = [];
      structByStrike[key].push(s);
    });

    // Build sorted list of strikes (ascending)
    var allStrikes = strikes.slice().sort(function(a, b) { return a - b; });

    // Find max effective gex for bar scaling
    var maxGex = 0;
    allStrikes.forEach(function(st) {
      var ss = structByStrike[st] || [];
      ss.forEach(function(s) { if (s.effective_gex && Math.abs(s.effective_gex) > maxGex) maxGex = Math.abs(s.effective_gex); });
    });
    if (maxGex === 0) maxGex = 1;

    // Build rows (rendered top-to-bottom = highest strike first)
    var sortedDesc = allStrikes.slice().reverse();
    var html = '';
    // Region overlay spans
    var regionOverlays = _buildRegionOverlays(data, sortedDesc, spot);

    sortedDesc.forEach(function(strike, idx) {
      var isSpot = spot && Math.abs(strike - spot) < 0.5;
      var ss = structByStrike[strike] || [];
      var wallInfo = _getWallInfo(ss);
      var classes = ['corr-strike-row'];
      if (isSpot) classes.push('is-spot');
      var structType = wallInfo ? wallInfo.type : (ss[0] ? ss[0].type : 'NORMAL');
      var effGex = wallInfo ? wallInfo.effective_gex : (ss[0] ? ss[0].effective_gex : 0);
      var barClasses = _buildBarClasses(wallInfo, ss, effGex, maxGex);
      var barWidth = _barWidth(effGex, maxGex, wallInfo);
      var labelStr = _fmtStrike(strike);
      var iconStr = _wallIcon(wallInfo);

      if (isSpot) {
        html += '<div class="' + classes.join(' ') + ' is-spot" data-strike="' + strike + '" data-struct-type="spot">';
        html += '<div class="corr-strike-label">' + labelStr + '</div>';
        html += '<div class="corr-bar-wrap"><div class="corr-spot-line"></div><span class="corr-spot-price">' + _fmtSpot(spot) + '</span></div>';
        html += '</div>';
      } else {
        html += '<div class="' + classes.join(' ') + '" data-strike="' + strike + '" data-struct-type="' + structType + '">';
        html += '<div class="corr-strike-label">' + labelStr + '</div>';
        html += '<div class="corr-bar-wrap"><div class="corr-bar ' + barClasses + '" style="width:' + barWidth + '%">' + iconStr + '</div></div>';
        html += '</div>';
      }
    });

    // Replace rows (keep SVG + empty)
    _clearMapRows(map);
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    while (tmp.firstChild) map.appendChild(tmp.firstChild);

    // Inject region overlays (absolute positioned)
    _injectRegionOverlays(map, regionOverlays, sortedDesc);

    // Attach hover/click events
    _attachRowEvents(map, data);

    // Draw POLR arrow
    _updatePolrArrow(data);
  }

  function _clearMapRows(map) {
    var children = Array.from(map.children);
    children.forEach(function(c) {
      if (!c.classList.contains('corr-polr-svg') && c.id !== 'corr-map-empty') {
        map.removeChild(c);
      } else if (c.classList && !c.classList.contains('corr-polr-svg') && c.id !== 'corr-map-empty') {
        map.removeChild(c);
      }
    });
    // Cleaner: just rebuild, keeping SVG and empty
    var svg = document.getElementById('corr-polr-svg');
    var empty = document.getElementById('corr-map-empty');
    while (map.firstChild) map.removeChild(map.firstChild);
    if (svg) map.appendChild(svg);
    if (empty) map.appendChild(empty);
  }

  function _getWallInfo(ss) {
    // Returns the most significant wall structure for this strike, or null
    for (var i = 0; i < ss.length; i++) {
      if (ss[i].type === 'CALL_WALL' || ss[i].type === 'PUT_WALL') return ss[i];
    }
    return null;
  }

  function _buildBarClasses(wallInfo, ss, effGex, maxGex) {
    var classes = [];
    if (wallInfo) {
      classes.push(wallInfo.type === 'CALL_WALL' ? 'wall-call' : 'wall-put');
      var state = wallInfo.state || '';
      if (state === 'WEAKENING') classes.push('overlay-weakening');
      else if (state === 'BREACHED') classes.push('overlay-breached');
      else if (state === 'DEFENDED') classes.push('overlay-defended');
      else if (state === 'TRAP_FORMING') classes.push('overlay-trap-pulse');
      else if (state === 'EMERGING') classes.push('overlay-emerging');
    }
    return classes.join(' ');
  }

  function _barWidth(effGex, maxGex, wallInfo) {
    if (wallInfo) {
      // Walls always show proportionally but at least 25% for visibility
      var w = Math.abs(effGex || 0) / maxGex * 80;
      return Math.max(w, 25).toFixed(1);
    }
    if (!effGex) return '8';
    return Math.max(Math.abs(effGex) / maxGex * 60, 4).toFixed(1);
  }

  function _wallIcon(wallInfo) {
    if (!wallInfo) return '';
    var state = wallInfo ? wallInfo.state : '';
    if (state === 'WEAKENING') return '<span class="corr-wall-icon" style="color:var(--red)">&#9660;</span>';
    if (state === 'DEFENDED') return '<span class="corr-wall-icon" style="color:var(--cyan)">&#9650;</span>';
    if (state === 'TRAP_FORMING') return '<span class="corr-wall-icon" style="color:var(--accent)">&#9670;</span>';
    if (state === 'BREACHED') return '<span class="corr-wall-icon" style="color:var(--red)">&#10005;</span>';
    return '';
  }

  function _buildRegionOverlays(data, sortedDesc, spot) {
    // Returns a list of region descriptors {type, startIdx, endIdx, label}
    var regions = [];
    var structures = data.structures || [];
    var airPockets = structures.filter(function(s) { return s.type === 'AIR_POCKET'; });
    var accelPaths = structures.filter(function(s) { return s.type === 'ACCELERATION_PATH'; });
    var pinZones = structures.filter(function(s) { return s.type === 'PIN_ZONE'; });

    function strikeIdx(v) { return sortedDesc.indexOf(v); }
    function closestIdx(v) {
      var best = 0, bestDist = Infinity;
      sortedDesc.forEach(function(st, i) { var d = Math.abs(st - v); if (d < bestDist) { bestDist = d; best = i; } });
      return best;
    }

    airPockets.forEach(function(ap) {
      var hi = ap.high || ap.strike;
      var lo = ap.low || ap.strike;
      regions.push({ type: 'air', startIdx: closestIdx(hi), endIdx: closestIdx(lo), label: 'Air Pocket' });
    });
    accelPaths.forEach(function(ap) {
      var hi = ap.high || ap.strike;
      var lo = ap.low || ap.strike;
      regions.push({ type: 'accel', startIdx: closestIdx(hi), endIdx: closestIdx(lo), label: 'Accel Path' });
    });
    pinZones.forEach(function(pz) {
      var hi = pz.high || pz.strike;
      var lo = pz.low || pz.strike;
      regions.push({ type: 'pin', startIdx: closestIdx(hi), endIdx: closestIdx(lo), label: 'Pin Zone' });
    });
    return regions;
  }

  function _injectRegionOverlays(map, regions, sortedDesc) {
    // Each strike row is 24px (+ 2px margin) = 26px. First row offset: rows start after SVG+empty (which have height 0/display:none)
    // We use offsetTop of the actual DOM rows for precision.
    // This is a best-effort overlay — positioned after rows are in DOM.
    setTimeout(function() {
      var rows = map.querySelectorAll('.corr-strike-row');
      if (!rows.length) return;
      var rowH = 26; // approximate
      regions.forEach(function(region) {
        var startRow = rows[region.startIdx];
        var endRow = rows[region.endIdx];
        if (!startRow || !endRow) return;
        var topY = startRow.offsetTop;
        var botY = endRow.offsetTop + endRow.offsetHeight;
        var height = botY - topY;
        if (height <= 0) return;

        var el = document.createElement('div');
        el.className = region.type === 'air' ? 'corr-air-pocket' : region.type === 'accel' ? 'corr-accel-region' : 'corr-pin-zone';
        el.style.top = topY + 'px';
        el.style.height = height + 'px';
        if (region.label) {
          var lbl = document.createElement('div');
          lbl.className = 'corr-air-pocket-label';
          lbl.textContent = region.label;
          el.appendChild(lbl);
        }
        map.appendChild(el);
      });
    }, 20);
  }

  // ── Spot Row Update ───────────────────────────────────────────────────
  function _updateSpotRow(newSpot, oldSpot) {
    // Update spot price label if spot row exists
    var spotRow = document.querySelector('.corr-strike-row.is-spot .corr-spot-price');
    if (spotRow) spotRow.textContent = _fmtSpot(newSpot);
  }

  // ── Path of Least Resistance (SVG Arrow) ─────────────────────────────
  function _updatePolrArrow(data) {
    var svg = document.getElementById('corr-polr-svg');
    if (!svg) return;
    svg.innerHTML = '';

    if (!data || !data.spot) return;
    var polr = data.path_of_least_resistance;
    if (!polr || polr.direction === 'NONE' || polr.direction === 'UNCERTAIN') return;

    var spotRow = document.querySelector('.corr-strike-row.is-spot');
    var destStrike = polr.destination;
    var destRow = destStrike ? document.querySelector('.corr-strike-row[data-strike="' + destStrike + '"]') : null;
    if (!spotRow) return;

    var mapWrap = document.getElementById('corr-map-wrap');
    if (!mapWrap) return;

    var spotY = spotRow.offsetTop + spotRow.offsetHeight / 2;
    var destY = destRow ? destRow.offsetTop + destRow.offsetHeight / 2 : (polr.direction === 'UP' ? spotY - 80 : spotY + 80);
    var x = 80; // horizontal position of arrow (in bar area)

    // Draw gradient arrow
    var ns = 'http://www.w3.org/2000/svg';
    var defs = document.createElementNS(ns, 'defs');
    var grad = document.createElementNS(ns, 'linearGradient');
    var gradId = 'corr-polr-grad';
    grad.setAttribute('id', gradId);
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('x1', x); grad.setAttribute('y1', spotY);
    grad.setAttribute('x2', x); grad.setAttribute('y2', destY);
    var stop1 = document.createElementNS(ns, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgba(248,250,252,0.6)');
    var stop2 = document.createElementNS(ns, 'stop');
    stop2.setAttribute('offset', '100%');
    var arrowColor = polr.direction === 'UP' ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)';
    stop2.setAttribute('stop-color', arrowColor);
    grad.appendChild(stop1); grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Line
    var line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x); line.setAttribute('y1', spotY);
    line.setAttribute('x2', x); line.setAttribute('y2', destY);
    line.setAttribute('stroke', 'url(#' + gradId + ')');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-dasharray', '4 3');
    svg.appendChild(line);

    // Arrowhead
    var arrowY = destY;
    var arrowDir = polr.direction === 'UP' ? -6 : 6;
    var poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('points', (x-5) + ',' + arrowY + ' ' + (x+5) + ',' + arrowY + ' ' + x + ',' + (arrowY + arrowDir));
    poly.setAttribute('fill', arrowColor);
    svg.appendChild(poly);

    // Label
    if (polr.destination) {
      var txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', x + 10);
      txt.setAttribute('y', (destY + spotY) / 2);
      txt.setAttribute('fill', '#94a3b8');
      txt.setAttribute('font-size', '10');
      txt.setAttribute('font-family', 'JetBrains Mono, monospace');
      txt.textContent = 'Path → ' + polr.destination;
      svg.appendChild(txt);
    }
  }

  // ── State Bar ─────────────────────────────────────────────────────────
  function _renderStateBar(data) {
    var stateEl = document.getElementById('corr-state-value');
    var durEl = document.getElementById('corr-state-dur');
    var transEl = document.getElementById('corr-state-trans');
    var uncEl = document.getElementById('corr-state-uncertain');
    if (!stateEl) return;

    var state = data.state || 'UNKNOWN';
    var dur = data.state_duration ? _fmtDuration(data.state_duration) : '—';
    var trans = (data.possible_transitions || []).join(' · ') || '—';

    stateEl.textContent = state.replace(/_/g, ' ');
    durEl.textContent = dur;
    transEl.textContent = trans;

    // Uncertainty messages
    var uncertain = '';
    if (state === 'PRESSURING_WALL' || state === 'TRAP_FORMING') {
      uncertain = 'Wall resolution pending';
    } else if (data.regime && data.regime.regime_instability > 0.5) {
      uncertain = 'Regime unstable — signals may shift';
    } else if (data.structure_confidence != null && data.structure_confidence < 0.4) {
      uncertain = 'Low-confidence path';
    } else if (state === 'REBALANCING' && !(data.structures || []).length) {
      uncertain = 'No clear edge';
    }

    if (uncEl) {
      uncEl.style.display = uncertain ? '' : 'none';
      uncEl.textContent = uncertain;
    }

    if (_replayMode && stateEl) {
      stateEl.textContent += ' (historical)';
    }
  }

  // ── Hover Tooltip ─────────────────────────────────────────────────────
  function _attachRowEvents(map, data) {
    var structByStrike = {};
    (data.structures || []).forEach(function(s) {
      var key = s.strike;
      if (!structByStrike[key]) structByStrike[key] = [];
      structByStrike[key].push(s);
    });

    map.querySelectorAll('.corr-strike-row').forEach(function(row) {
      var strike = parseFloat(row.dataset.strike);
      if (isNaN(strike)) return;
      var ss = structByStrike[strike] || [];

      row.onmouseenter = function(e) { _showTip(e, strike, ss); };
      row.onmousemove = function(e) { _moveTip(e); };
      row.onmouseleave = function() { _hideTip(); };
      row.onclick = function(e) {
        e.stopPropagation();
        if (_pinnedStrike === strike) {
          _closeDetail();
        } else {
          _pinnedStrike = strike;
          _openDetail(strike, ss, data);
        }
      };
    });

    // Close detail on map background click
    map.onclick = function() { _closeDetail(); };
  }

  function _showTip(e, strike, ss) {
    var tip = document.getElementById('corr-hover-tip');
    if (!tip) return;
    var wallInfo = _getWallInfo(ss);
    var s = wallInfo || ss[0];
    document.getElementById('tip-strike').textContent = _fmtStrike(strike);
    document.getElementById('tip-type').textContent = s ? _structLabel(s.type) : 'Strike';
    document.getElementById('tip-gex').textContent = s ? _fmtGex(s.effective_gex) : '—';
    document.getElementById('tip-qual').textContent = wallInfo && wallInfo.wall_quality != null ? (wallInfo.wall_quality * 100).toFixed(0) + '%' : '—';
    document.getElementById('tip-status').textContent = s ? (s.state || '—').replace(/_/g,' ') : '—';
    tip.classList.add('visible');
    _moveTip(e);
  }

  function _moveTip(e) {
    var tip = document.getElementById('corr-hover-tip');
    if (!tip || !tip.classList.contains('visible')) return;
    var x = e.clientX + 14;
    var y = e.clientY - 8;
    // Keep in viewport
    if (x + 200 > window.innerWidth) x = e.clientX - 210;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }

  function _hideTip() {
    var tip = document.getElementById('corr-hover-tip');
    if (tip) tip.classList.remove('visible');
  }

  // ── Detail Panel ──────────────────────────────────────────────────────
  function _openDetail(strike, ss, data) {
    var panel = document.getElementById('corr-detail-panel');
    var inner = document.getElementById('corr-detail-inner');
    if (!panel || !inner) return;
    var wallInfo = _getWallInfo(ss);
    var s = wallInfo || ss[0];

    var html = '<button class="corr-detail-close" onclick="SQ.corridor._closeDetail()">&#10005;</button>';
    html += '<div class="corr-detail-title">' + _fmtStrike(strike) + '</div>';
    html += '<div class="corr-detail-subtitle">' + (s ? _structLabel(s.type) : 'Strike') + '</div>';

    if (s) {
      // Core metrics
      html += '<div class="corr-detail-section">';
      html += '<div class="corr-detail-section-label">GEX Breakdown</div>';
      html += _detailRow('Raw GEX', _fmtGex(s.raw_gex));
      html += _detailRow('Effective GEX', _fmtGex(s.effective_gex), 'amber');
      html += _detailRow('Relevance', s.relevance != null ? (s.relevance * 100).toFixed(0) + '%' : '—');
      html += _detailRow('Confidence', s.confidence != null ? (s.confidence * 100).toFixed(0) + '%' : '—');
      html += '</div>';

      if (wallInfo) {
        html += '<div class="corr-detail-section">';
        html += '<div class="corr-detail-section-label">Wall Quality</div>';
        html += _detailRow('Wall Quality', wallInfo.wall_quality != null ? (wallInfo.wall_quality * 100).toFixed(0) + '%' : '—', 'amber');
        html += _detailRow('State', (wallInfo.state || '—').replace(/_/g,' '));
        html += _detailRow('Path Integrity', wallInfo.path_integrity != null ? (wallInfo.path_integrity * 100).toFixed(0) + '%' : '—');
        html += '</div>';
      }

      // Weight decomposition (Section A)
      if (s.weights) {
        html += '<div class="corr-detail-section">';
        html += '<div class="corr-detail-section-label">Weight Factors</div>';
        Object.keys(s.weights).forEach(function(k) {
          html += _detailRow(k, (s.weights[k] * 100).toFixed(1) + '%');
        });
        html += '</div>';
      }

      // Flow metrics
      if (s.volume != null || s.open_interest != null) {
        html += '<div class="corr-detail-section">';
        html += '<div class="corr-detail-section-label">Flow</div>';
        if (s.volume != null) html += _detailRow('Volume', _fmtInt(s.volume));
        if (s.open_interest != null) html += _detailRow('Open Interest', _fmtInt(s.open_interest));
        if (s.flow_ratio != null) html += _detailRow('Flow Ratio', s.flow_ratio.toFixed(2));
        html += '</div>';
      }

      // Persistence trend (last 10 snapshots as tick bar)
      if (s.persistence_trend && s.persistence_trend.length) {
        html += '<div class="corr-detail-section">';
        html += '<div class="corr-detail-section-label">Persistence (last 10)</div>';
        html += '<div class="corr-persist-bar">';
        var ticks = s.persistence_trend.slice(-10);
        for (var i = 0; i < 10; i++) {
          var present = ticks[i] ? 'present' : 'absent';
          html += '<div class="corr-persist-tick ' + present + '"></div>';
        }
        html += '</div></div>';
      }

      // Flags + reason codes
      if ((s.flags && s.flags.length) || (s.reason_codes && s.reason_codes.length)) {
        html += '<div class="corr-detail-section">';
        html += '<div class="corr-detail-section-label">Flags</div>';
        html += '<div class="corr-detail-flags">';
        (s.flags || []).concat(s.reason_codes || []).forEach(function(f) {
          html += '<span class="corr-detail-flag">' + _esc(f) + '</span>';
        });
        html += '</div></div>';
      }
    } else {
      html += '<div style="color:var(--text-muted);font-size:13px;font-style:italic;padding:20px 0;">No structure data for this strike.</div>';
    }

    inner.innerHTML = html;
    panel.classList.add('open');
  }

  SQ.corridor._closeDetail = function() { _closeDetail(); };
  function _closeDetail() {
    var panel = document.getElementById('corr-detail-panel');
    if (panel) panel.classList.remove('open');
    _pinnedStrike = null;
  }

  function _detailRow(key, val, cls) {
    return '<div class="corr-detail-row"><span class="corr-detail-key">' + key + '</span><span class="corr-detail-val' + (cls ? ' ' + cls : '') + '">' + _esc(String(val)) + '</span></div>';
  }

  // ── Reset View ────────────────────────────────────────────────────────
  function _resetView() {
    var emptyEl = document.getElementById('corr-summary-empty');
    var linesEl = document.getElementById('corr-summary-lines');
    if (emptyEl) { emptyEl.style.display = ''; emptyEl.textContent = 'Computing path summary...'; }
    if (linesEl) linesEl.style.display = 'none';
    var banner = document.getElementById('corr-regime-banner');
    if (banner) { banner.className = 'corr-regime-banner'; }
    var labelEl = document.getElementById('corr-regime-label');
    if (labelEl) labelEl.textContent = 'Waiting for data...';
    var subEl = document.getElementById('corr-regime-sub');
    if (subEl) subEl.textContent = '';
    var stateEl = document.getElementById('corr-state-value');
    if (stateEl) stateEl.textContent = '—';
    _clearMapRows(document.getElementById('corr-map'));
    var emptyMap = document.getElementById('corr-map-empty');
    if (emptyMap) emptyMap.style.display = '';
  }

  // ── Formatting Helpers ────────────────────────────────────────────────
  function _fmtStrike(v) { return v != null ? v.toFixed(0) : '—'; }
  function _fmtSpot(v) { return v != null ? v.toFixed(2) : '—'; }
  function _fmtGex(v) {
    if (v == null) return '—';
    var abs = Math.abs(v);
    if (abs >= 1e9) return (v/1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (v/1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (v/1e3).toFixed(1) + 'K';
    return v.toFixed(1);
  }
  function _fmtInt(v) {
    if (v == null) return '—';
    return v.toLocaleString();
  }
  function _fmtDuration(secs) {
    if (secs < 60) return secs + 's';
    if (secs < 3600) return Math.round(secs/60) + 'm';
    return (secs/3600).toFixed(1) + 'h';
  }
  function _structLabel(t) {
    var m = { CALL_WALL:'CALL WALL', PUT_WALL:'PUT WALL', AIR_POCKET:'AIR POCKET',
      ACCELERATION_PATH:'ACCEL PATH', PIN_ZONE:'PIN ZONE', GAMMA_TRAP:'GAMMA TRAP',
      TRAP_FORMING:'TRAP FORMING', NORMAL:'STRIKE', SNAPBACK_DEST:'SNAPBACK DEST' };
    return m[t] || (t || 'STRIKE').replace(/_/g,' ');
  }
  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
`;
}

module.exports = { getPageCSS, getPageHTML, getPageJS };
