/**
 * 0DTE War Room — Live Trading Dashboard (SPA exports only)
 *
 * Exports: getTradingPageCSS, getTradingPageHTML, getTradingPageJS
 * Embedded by the SPA shell — no standalone route.
 */

// ── SPA Embedding Exports ─────────────────────────────────────────────

function getTradingPageCSS() {
  return `
/* ── Keyframes (global) ──────────────────────────────── */
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

/* ── Trading Page Scoped Styles ──────────────────────── */
#page-trading .daily-pnl-box {
  font-family: var(--font-mono); font-size: 20px; font-weight: 700;
  padding: 0 16px; white-space: nowrap;
}
#page-trading .daily-pnl-box .sub { font-size: 10px; color: var(--text-muted); font-weight: 400; }

#page-trading .main {
  display: grid; grid-template-columns: 1.5fr 1fr;
  gap: 12px; padding: 12px; flex: 1; min-height: 0;
  overflow: auto;
}
#page-trading .col-left, #page-trading .col-right { display: flex; flex-direction: column; gap: 12px; min-height: 0; }

#page-trading .panel {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;
}
#page-trading .panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  text-transform: uppercase; flex-shrink: 0;
}
#page-trading .panel-body { padding: 12px 14px; flex: 1; overflow: auto; }

#page-trading .chart-wrap { position: relative; flex: 1; min-height: 320px; }
#page-trading .chart-wrap canvas { width: 100% !important; height: 100% !important; display: block; }

#page-trading .signal-list { max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
#page-trading .signal-row {
  display: grid; grid-template-columns: 70px 48px 60px 1fr 56px;
  align-items: center; gap: 8px; padding: 5px 8px; border-radius: 4px;
  font-size: 12px; font-family: var(--font-mono); background: var(--bg-surface);
  animation: fadeIn 0.3s ease;
}
#page-trading .signal-time { color: var(--text-muted); font-size: 10px; }
#page-trading .signal-ticker { color: var(--text); font-weight: 600; }
#page-trading .signal-type { font-size: 10px; padding: 1px 5px; border-radius: 3px; text-align: center; }
#page-trading .score-bar-wrap { height: 6px; background: var(--bar-track); border-radius: 3px; overflow: hidden; }
#page-trading .score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

#page-trading .pos-list { display: flex; flex-direction: column; gap: 8px; }
#page-trading .pos-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px;
  padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;
}
#page-trading .pos-row { display: flex; align-items: center; gap: 8px; }
#page-trading .pos-symbol { font-family: var(--font-mono); font-weight: 700; font-size: 13px; color: var(--text); }
#page-trading .badge {
  font-family: var(--font-mono); font-size: 9px; font-weight: 600;
  padding: 2px 6px; border-radius: 3px; text-transform: uppercase;}
#page-trading .badge-call { background: var(--accent-subtle); color: var(--green); border: 1px solid var(--border-subtle); }
#page-trading .badge-put { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid var(--border-subtle); }
#page-trading .badge-phase-initial { background: var(--info-dim); color: var(--text-secondary); }
#page-trading .badge-phase-active { background: var(--accent-subtle); color: var(--green); }
#page-trading .badge-phase-profit { background: var(--accent-subtle); color: var(--accent); }
#page-trading .pos-pnl { font-family: var(--font-mono); font-weight: 700; font-size: 14px; }
#page-trading .pos-meta { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
#page-trading .btn-close {
  font-family: var(--font-mono); font-size: 10px; padding: 3px 8px;
  background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid var(--border-subtle);
  border-radius: 4px; cursor: pointer; transition: all 0.15s; margin-left: auto;
}
#page-trading .btn-close:hover { background: var(--red); color: #fff; }

#page-trading .risk-grid { display: flex; flex-direction: column; gap: 10px; }
#page-trading .risk-item { display: flex; flex-direction: column; gap: 4px; }
#page-trading .risk-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;  }
#page-trading .risk-bar { height: 8px; background: var(--bar-track); border-radius: 4px; overflow: hidden; }
#page-trading .risk-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s, background 0.4s; }
#page-trading .risk-value { font-family: var(--font-mono); font-size: 13px; font-weight: 600; }
#page-trading .tz-badge {
  display: inline-block; font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  padding: 3px 8px; border-radius: 4px;}
#page-trading .tz-opening { background: var(--accent-subtle); color: var(--accent); }
#page-trading .tz-prime { background: var(--accent-subtle); color: var(--green); }
#page-trading .tz-midday { background: var(--info-dim); color: var(--text-secondary); }
#page-trading .tz-theta { background: var(--warn-dim); color: var(--yellow); }
#page-trading .tz-power { background: var(--accent-subtle); color: var(--accent); }

#page-trading .journal-toggle {
  cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px;
}
#page-trading .journal-toggle .arrow { transition: transform 0.2s; font-size: 10px; color: var(--text-muted); }
#page-trading .journal-toggle.open .arrow { transform: rotate(90deg); }
#page-trading .journal-body { display: none; }
#page-trading .journal-body.open { display: block; }
#page-trading .journal-summary {
  display: flex; gap: 14px; padding: 8px 0; border-bottom: 1px solid var(--border);
  margin-bottom: 8px; flex-wrap: wrap;
}
#page-trading .journal-stat { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
#page-trading .journal-stat .val { color: var(--text); font-weight: 600; }
#page-trading .journal-list { display: flex; flex-direction: column; gap: 3px; max-height: 200px; overflow-y: auto; }
#page-trading .journal-row {
  display: grid; grid-template-columns: 56px 48px 44px 64px 64px 72px 1fr;
  align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11px;
  padding: 4px 6px; border-radius: 3px; background: var(--bg-surface);
}
#page-trading .journal-row .time { color: var(--text-muted); font-size: 10px; }
#page-trading .journal-row .reason { font-size: 9px; padding: 1px 5px; border-radius: 3px; }
#page-trading .equity-wrap { height: 48px; margin-top: 8px; }
#page-trading .equity-wrap canvas { width: 100% !important; height: 100% !important; display: block; }

#page-trading .bottombar {
  display: flex; align-items: center; gap: 16px; padding: 8px 20px;
  background: var(--bg-surface); border-top: 1px solid var(--border);
  flex-shrink: 0; flex-wrap: wrap;
}
#page-trading .config-group { display: flex; align-items: center; gap: 6px; }
#page-trading .config-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
#page-trading .config-input {
  font-family: var(--font-mono); font-size: 12px; color: var(--text);
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 4px 8px; width: 72px; outline: none;
}
#page-trading .config-input:focus { border-color: var(--border); }
#page-trading .config-select {
  font-family: var(--font-mono); font-size: 12px; color: var(--text);
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 4px 8px; outline: none;
}
#page-trading .config-select:focus { border-color: var(--border); }
#page-trading .btn-kill {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 6px 16px; background: var(--red); color: #fff;
  border: none; border-radius: 4px; cursor: pointer; margin-left: auto;
  text-transform: uppercase; transition: all 0.15s;
}
#page-trading .btn-kill:hover { background: var(--red); }
#page-trading .tz-note { font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); margin-left: 8px; }

#page-trading .empty { color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; padding: 20px 0; text-align: center; }

#page-trading .cockpit-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 20px; background: var(--bg-surface);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
  overflow-x: auto;
}
#page-trading .cockpit-group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
#page-trading .cockpit-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;  }
#page-trading .cockpit-sep { width: 1px; height: 20px; background: var(--border); flex-shrink: 0; }
#page-trading .cockpit-right { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-shrink: 0; }
#page-trading .cockpit-stat { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); white-space: nowrap; }
#page-trading .mode-toggle { display: flex; border: 1px solid var(--border); border-radius: 5px; overflow: hidden; }
#page-trading .mode-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  padding: 4px 12px; background: transparent; color: var(--text-muted);
  border: none; cursor: pointer; transition: all 0.15s;}
#page-trading .mode-btn.active { background: var(--accent-subtle); color: var(--accent); }
#page-trading .mode-btn:hover:not(.active) { color: var(--text); }
#page-trading .scan-switch { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
#page-trading .scan-switch input { opacity: 0; width: 0; height: 0; }
#page-trading .scan-slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg-surface-hover); border: 1px solid var(--border); border-radius: 10px; transition: 0.2s;
}
#page-trading .scan-slider:before {
  position: absolute; content: ''; height: 14px; width: 14px; left: 2px; bottom: 2px;
  background: var(--text-muted); border-radius: 50%; transition: 0.2s;
}
#page-trading .scan-switch input:checked + .scan-slider { background: var(--accent-subtle); border-color: var(--border); }
#page-trading .scan-switch input:checked + .scan-slider:before { transform: translateX(16px); background: var(--green); }
#page-trading .conv-slider {
  -webkit-appearance: none; appearance: none; width: 80px; height: 6px;
  background: var(--bar-track); border-radius: 3px; outline: none;
}
#page-trading .conv-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 14px; height: 14px;
  background: var(--accent); border-radius: 50%; cursor: pointer;
}
#page-trading .conv-value { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--accent); min-width: 16px; text-align: center; }
#page-trading .ticker-group { display: flex; gap: 4px; flex-wrap: wrap; }
#page-trading .ticker-badge {
  font-family: var(--font-mono); font-size: 9px; font-weight: 600;
  padding: 3px 8px; border-radius: 4px; cursor: pointer; transition: all 0.15s;
   user-select: none; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted);
}
#page-trading .ticker-badge.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--border); }
#page-trading .ticker-badge:hover { border-color: var(--border); }
#page-trading .badge-paper { font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
#page-trading .badge-paper.paper { background: var(--warn-dim); color: var(--yellow); border: 1px solid var(--border-subtle); }
#page-trading .badge-paper.live { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid var(--border-subtle); }
#page-trading .cb-reset-btn {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  padding: 4px 12px; border-radius: 4px;  background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid var(--border);
  cursor: pointer; white-space: nowrap;
}
#page-trading .cb-reset-btn:hover { background: var(--border); }

#page-trading .pending-list { display: flex; flex-direction: column; gap: 6px; }
#page-trading .pending-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px;
  padding: 10px 12px; display: flex; flex-direction: column; gap: 8px;
  animation: fadeIn 0.3s ease;
}
#page-trading .pending-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
#page-trading .pending-ticker { font-family: var(--font-mono); font-weight: 700; font-size: 14px; color: var(--text); }
#page-trading .pending-meta { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
#page-trading .pending-reason { font-family: var(--font-mono); font-size: 11px; color: var(--text); line-height: 1.4; }
#page-trading .pending-timer-bar { height: 3px; background: var(--bar-track); border-radius: 2px; overflow: hidden; }
#page-trading .pending-timer-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 1s linear; }
#page-trading .pending-actions { display: flex; gap: 8px; }
#page-trading .btn-approve {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 6px 16px; background: var(--accent-subtle); color: var(--green);
  border: 1px solid var(--border-subtle); border-radius: 4px; cursor: pointer;
  transition: all 0.15s;  flex: 1;
}
#page-trading .btn-approve:hover { background: var(--green); color: #fff; }
#page-trading .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
#page-trading .btn-skip {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  padding: 6px 12px; background: var(--bg-surface-hover); color: var(--text-muted);
  border: 1px solid var(--border); border-radius: 4px; cursor: pointer;
  transition: all 0.15s;
}
#page-trading .btn-skip:hover { color: var(--text); border-color: var(--text-muted); }

#page-trading .activity-log { max-height: 260px; overflow-y: auto; font-family: var(--font-mono); font-size: 11px; }
#page-trading .log-entry { display: flex; gap: 8px; padding: 3px 14px; border-bottom: 1px solid var(--border); align-items: baseline; }
#page-trading .log-entry:last-child { border-bottom: none; }
#page-trading .log-ts { color: var(--text-muted); font-size: 9px; flex-shrink: 0; min-width: 56px; }
#page-trading .log-icon { flex-shrink: 0; min-width: 14px; text-align: center; }
#page-trading .log-msg { color: var(--text-muted); word-break: break-word; }
#page-trading .log-entry.type-execute .log-msg { color: var(--green); }
#page-trading .log-entry.type-error .log-msg { color: var(--red); }
#page-trading .log-entry.type-close .log-msg { color: var(--accent); }
#page-trading .log-entry.type-circuit .log-msg { color: var(--red); font-weight: 600; }
#page-trading .log-entry.type-qualify .log-msg { color: var(--accent); }
#page-trading .log-entry.type-control .log-msg { color: var(--accent); }
#page-trading .log-entry.type-scan .log-msg { color: var(--text-muted); }
#page-trading .log-entry.type-score .log-msg { color: var(--accent); }
#page-trading .log-entry.type-phase .log-msg { color: var(--text-secondary); }
#page-trading .log-entry.type-skip .log-msg { color: var(--yellow); }
#page-trading .log-entry.type-monitor .log-msg { color: var(--text-secondary); }
#page-trading .log-entry.type-blocked .log-msg { color: var(--yellow); font-weight: 600; }

#page-trading .regime-badge {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 11px;
  padding: 3px 10px; border-radius: 4px;
  background: var(--bg-surface); border: 1px solid var(--border);
  white-space: nowrap;
}
#page-trading .regime-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
#page-trading .regime-label { font-weight: 600;  }
#page-trading .regime-conf { color: var(--text-muted); font-size: 10px; }
#page-trading .regime-blocked {
  font-size: 9px; font-weight: 700; color: var(--red);
  padding: 1px 6px; border-radius: 3px; background: rgba(239,68,68,0.12);
  border: 1px solid var(--border-subtle);}
#page-trading .regime-pulsing .regime-dot { }
#page-trading .vix-badge {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 11px;
  padding: 4px 10px; border-radius: 6px;
  background: var(--bg-surface); border: 1px solid var(--border-subtle);
}
#page-trading .vix-level { font-weight: 700; }
#page-trading .vix-zone { font-size: 9px; opacity: 0.7; }

#page-trading .micro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
#page-trading .micro-item { display: flex; flex-direction: column; gap: 4px; }
#page-trading .micro-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase;  }
#page-trading .oir-gauge { height: 10px; border-radius: 5px; position: relative; overflow: visible; }
#page-trading .oir-track {
  height: 100%; border-radius: 5px;
  background: linear-gradient(to right, var(--red), var(--text-muted), var(--green));
  opacity: 0.25;
}
#page-trading .oir-marker {
  position: absolute; top: -2px; width: 4px; height: 14px;
  background: var(--text); border-radius: 2px;
  transition: left 0.3s ease; transform: translateX(-50%);
}
#page-trading .micro-value { font-family: var(--font-mono); font-size: 16px; font-weight: 700; }
#page-trading .micro-dir { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
#page-trading .micro-velocity { font-family: var(--font-mono); font-size: 12px; font-weight: 600; padding: 2px 6px; border-radius: 3px; display: inline-block; }
#page-trading .spread-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }
#page-trading .spread-label { font-family: var(--font-mono); font-size: 12px; font-weight: 500; }

@media (max-width: 960px) {
  #page-trading .main { grid-template-columns: 1fr; }
  #page-trading .cockpit-bar { flex-wrap: wrap; }
}
`;
}

function getTradingPageHTML() {
  return `<div class="page" id="page-trading">
<div class="page-header"><div><h2>War Room</h2><div class="subtitle">0DTE live trading cockpit</div></div><div style="display:flex;align-items:center;gap:12px;"><div id="tradingMarketStatus" style="display:flex;align-items:center;gap:6px;"><span class="status-dot closed" id="tradingStatusDot"></span><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)" id="tradingMarketLabel">CLOSED</span></div><div id="tradingRegimeBadge" class="regime-badge" style="display:none;"><span class="regime-dot" id="tradingRegimeDot"></span><span class="regime-label" id="tradingRegimeLabel">--</span><span class="regime-conf" id="tradingRegimeConf"></span><span class="regime-blocked" id="tradingRegimeBlocked" style="display:none;">SITTING OUT</span></div><div id="tradingVixBadge" class="vix-badge" style="display:none;"><span class="vix-level" id="tradingVixLevel">--</span><span class="vix-zone" id="tradingVixZone"></span></div><div class="daily-pnl-box" id="tradingDailyPnl"><span id="tradingPnlValue" style="color:var(--text-muted)">$0.00</span><div class="sub" id="tradingPnlSub">0W / 0L</div></div></div></div>

<!-- COCKPIT BAR -->
<div class="cockpit-bar" id="tradingCockpitBar">
  <div class="cockpit-group">
    <div class="mode-toggle" id="tradingModeToggle">
      <button class="mode-btn active" data-mode="auto">AUTO</button>
      <button class="mode-btn" data-mode="manual">MANUAL</button>
    </div>
  </div>
  <div class="cockpit-sep"></div>
  <div class="cockpit-group">
    <span class="cockpit-label">Scanning</span>
    <label class="scan-switch">
      <input type="checkbox" id="tradingScanToggle" checked>
      <span class="scan-slider"></span>
    </label>
  </div>
  <div class="cockpit-sep"></div>
  <div class="cockpit-group">
    <span class="cockpit-label">Min Conv</span>
    <input type="range" class="conv-slider" id="tradingConvSlider" min="1" max="10" value="5">
    <span class="conv-value" id="tradingConvValue">5</span>
  </div>
  <div class="cockpit-sep"></div>
  <div class="cockpit-group ticker-group" id="tradingTickerGroup"></div>
  <div class="cockpit-sep"></div>
  <div class="cockpit-group">
    <span class="badge-paper paper" id="tradingPaperBadge">PAPER</span>
  </div>
  <div class="cockpit-right">
    <button class="cb-reset-btn" id="tradingCbResetBtn" style="display:none" title="Reset Circuit Breaker">CIRCUIT BREAKER TRIPPED — RESET</button>
    <span class="cockpit-stat" id="tradingNextScan">Next: --:--</span>
    <span class="cockpit-stat" id="tradingCockpitPos">Pos: 0/3</span>
  </div>
</div>

<!-- MAIN GRID -->
<div class="main">
  <!-- LEFT COLUMN -->
  <div class="col-left">
    <div class="panel" style="flex:1.4;">
      <div class="panel-head">
        <span>SPY 1m</span>
        <span id="tradingChartPrice" style="color:var(--text);font-weight:600;">---</span>
      </div>
      <div class="panel-body" style="padding:4px;">
        <div class="chart-wrap" id="tradingTvChartContainer" style="width:100%;height:100%;"></div>
      </div>
    </div>
    <div class="panel" style="flex:0.8;">
      <div class="panel-head"><span>Signal Feed</span><span id="tradingSignalCount">0</span></div>
      <div class="panel-body">
        <div class="signal-list" id="tradingSignalList">
          <div class="empty">Waiting for signals...</div>
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT COLUMN -->
  <div class="col-right">
    <div class="panel" style="flex:1;">
      <div class="panel-head"><span>Positions</span><span id="tradingPosCount">0</span></div>
      <div class="panel-body">
        <div class="pos-list" id="tradingPosList">
          <div class="empty">No open positions</div>
        </div>
      </div>
    </div>
    <div class="panel" style="flex:0;" id="tradingMicroPanel">
      <div class="panel-head"><span>Microstructure</span><span id="tradingMicroTs" style="font-size:9px;color:var(--text-muted);">--</span></div>
      <div class="panel-body">
        <div class="micro-grid">
          <div class="micro-item" style="grid-column:span 2;">
            <span class="micro-label">Order Imbalance Ratio (OIR)</span>
            <div class="oir-gauge">
              <div class="oir-track"></div>
              <div class="oir-marker" id="tradingOirMarker" style="left:50%;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:9px;color:var(--text-muted);">
              <span>SELL</span>
              <span id="tradingOirValue" style="color:var(--text-muted);">50%</span>
              <span>BUY</span>
            </div>
          </div>
          <div class="micro-item">
            <span class="micro-label">Sweep Score</span>
            <div style="display:flex;align-items:baseline;gap:6px;">
              <span class="micro-value" id="tradingSweepScore" style="color:var(--text-muted);">0</span>
              <span class="micro-dir" id="tradingSweepDir">--</span>
            </div>
          </div>
          <div class="micro-item">
            <span class="micro-label">Velocity</span>
            <span class="micro-velocity" id="tradingVelocityLabel" style="color:var(--text-muted);background:var(--bg-surface);">NORMAL</span>
          </div>
          <div class="micro-item" style="grid-column:span 2;">
            <span class="micro-label">Spread Health</span>
            <div style="display:flex;align-items:center;">
              <span class="spread-dot" id="tradingSpreadDot" style="background:var(--text-muted);"></span>
              <span class="spread-label" id="tradingSpreadLabel" style="color:var(--text-muted);">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel" style="flex:0;">
      <div class="panel-head"><span>Risk</span></div>
      <div class="panel-body">
        <div class="risk-grid">
          <div class="risk-item">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="risk-label">Daily P&L Limit</span>
              <span class="risk-value" id="tradingRiskPnlVal">$0 / -$500</span>
            </div>
            <div class="risk-bar"><div class="risk-bar-fill" id="tradingRiskPnlBar" style="width:0%;background:var(--green);"></div></div>
          </div>
          <div class="risk-item">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="risk-label">Positions</span>
              <span class="risk-value" id="tradingRiskPosVal">0 / 3</span>
            </div>
            <div class="risk-bar"><div class="risk-bar-fill" id="tradingRiskPosBar" style="width:0%;background:var(--text-secondary);"></div></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
            <div class="risk-item" style="flex:1;">
              <span class="risk-label">Time Zone</span>
              <span class="tz-badge tz-prime" id="tradingTzBadge">--</span>
            </div>
            <div class="risk-item" style="flex:1;">
              <span class="risk-label">Consec. Losses</span>
              <span class="risk-value" id="tradingRiskLossStreak" style="color:var(--text);">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel" style="flex:1;">
      <div class="panel-head">
        <div class="journal-toggle" id="tradingJournalToggle">
          <span class="arrow">&#9654;</span>
          <span>Trade Journal</span>
        </div>
        <span id="tradingJournalCountHead">0 trades</span>
      </div>
      <div class="journal-body" id="tradingJournalBody">
        <div style="padding:12px 14px;">
          <div class="journal-summary" id="tradingJournalSummary"></div>
          <div class="equity-wrap"><canvas id="tradingEquityCurve"></canvas></div>
          <div class="journal-list" id="tradingJournalList">
            <div class="empty">No completed trades today</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel" style="flex:1;">
      <div class="panel-head"><span>Activity Log</span><span id="tradingLogCount">0</span></div>
      <div class="panel-body" style="padding:0;">
        <div class="activity-log" id="tradingActivityLog">
          <div class="empty" style="padding:20px;">Engine idle...</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- BOTTOM BAR -->
<div class="bottombar">
  <div class="config-group">
    <span class="config-label">Max Loss</span>
    <input type="number" class="config-input" id="tradingCfgMaxLoss" value="500" min="50" max="5000" step="50">
  </div>
  <div class="config-group">
    <span class="config-label">Max Pos</span>
    <select class="config-select" id="tradingCfgMaxPos">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3" selected>3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
      <option value="7">7</option>
      <option value="8">8</option>
      <option value="9">9</option>
      <option value="10">10</option>
    </select>
  </div>
  <span class="tz-note">All times ET</span>
  <button class="btn-kill" id="tradingBtnKill">Kill All</button>
</div>
</div>`;
}

function getTradingPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.trading = (function() {
  'use strict';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function formatET(ts) {
    try {
      var d = new Date(ts);
      return d.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) {
      return '--:--';
    }
  }

  // ── State ───────────────────────────────────────────────
  var state = {
    bars: [],
    trades: [],
    positions: [],
    signals: [],
    journal: [],
    pnl: { daily: 0, wins: 0, losses: 0 },
    risk: { dailyPnL: 0, maxLoss: 500, posCount: 0, maxPos: 3, lossStreak: 0, timeZone: '--' },
    maxSignals: 50,
    cockpit: { mode: 'auto', scanning: true, conviction: 5, underlyings: ['SPY','QQQ'], isPaper: true, nextScanTime: null, positionCount: 0, maxPositions: 3, pendingCount: 0, dailyPnL: 0 },
    pendingTrades: [],
    activityLog: []
  };

  // ── DOM refs ────────────────────────────────────────────
  var $ = {};
  var intervals = [];
  var socketHandlers = [];

  function cacheDom() {
    $.pnlValue = document.getElementById('tradingPnlValue');
    $.pnlSub = document.getElementById('tradingPnlSub');
    $.chartPrice = document.getElementById('tradingChartPrice');
    $.signalList = document.getElementById('tradingSignalList');
    $.signalCount = document.getElementById('tradingSignalCount');
    $.posList = document.getElementById('tradingPosList');
    $.posCount = document.getElementById('tradingPosCount');
    $.riskPnlVal = document.getElementById('tradingRiskPnlVal');
    $.riskPnlBar = document.getElementById('tradingRiskPnlBar');
    $.riskPosVal = document.getElementById('tradingRiskPosVal');
    $.riskPosBar = document.getElementById('tradingRiskPosBar');
    $.tzBadge = document.getElementById('tradingTzBadge');
    $.riskLossStreak = document.getElementById('tradingRiskLossStreak');
    $.journalToggle = document.getElementById('tradingJournalToggle');
    $.journalBody = document.getElementById('tradingJournalBody');
    $.journalSummary = document.getElementById('tradingJournalSummary');
    $.journalList = document.getElementById('tradingJournalList');
    $.journalCountHead = document.getElementById('tradingJournalCountHead');
    $.statusDot = document.getElementById('tradingStatusDot');
    $.marketLabel = document.getElementById('tradingMarketLabel');
    $.cfgMaxLoss = document.getElementById('tradingCfgMaxLoss');
    $.cfgMaxPos = document.getElementById('tradingCfgMaxPos');
    $.btnKill = document.getElementById('tradingBtnKill');
    $.tvContainer = document.getElementById('tradingTvChartContainer');
    $.equityCanvas = document.getElementById('tradingEquityCurve');
    $.modeToggle = document.getElementById('tradingModeToggle');
    $.scanToggle = document.getElementById('tradingScanToggle');
    $.convSlider = document.getElementById('tradingConvSlider');
    $.convValue = document.getElementById('tradingConvValue');
    $.tickerGroup = document.getElementById('tradingTickerGroup');
    $.paperBadge = document.getElementById('tradingPaperBadge');
    $.cbResetBtn = document.getElementById('tradingCbResetBtn');
    $.nextScan = document.getElementById('tradingNextScan');
    $.cockpitPos = document.getElementById('tradingCockpitPos');
    $.activityLog = document.getElementById('tradingActivityLog');
    $.logCount = document.getElementById('tradingLogCount');
    $.regimeBadge = document.getElementById('tradingRegimeBadge');
    $.regimeDot = document.getElementById('tradingRegimeDot');
    $.regimeLabel = document.getElementById('tradingRegimeLabel');
    $.regimeConf = document.getElementById('tradingRegimeConf');
    $.regimeBlocked = document.getElementById('tradingRegimeBlocked');
    $.vixBadge = document.getElementById('tradingVixBadge');
    $.vixLevel = document.getElementById('tradingVixLevel');
    $.vixZone = document.getElementById('tradingVixZone');
    $.oirMarker = document.getElementById('tradingOirMarker');
    $.oirValue = document.getElementById('tradingOirValue');
    $.sweepScore = document.getElementById('tradingSweepScore');
    $.sweepDir = document.getElementById('tradingSweepDir');
    $.velocityLabel = document.getElementById('tradingVelocityLabel');
    $.spreadDot = document.getElementById('tradingSpreadDot');
    $.spreadLabel = document.getElementById('tradingSpreadLabel');
    $.microTs = document.getElementById('tradingMicroTs');
  }

  // ── Market Status ───────────────────────────────────────
  function getMarketStatus() {
    var now = new Date();
    var et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    var h = et.getHours(), m = et.getMinutes();
    var mins = h * 60 + m;
    var day = et.getDay();
    if (day === 0 || day === 6) return 'CLOSED';
    if (mins >= 570 && mins < 960) return 'OPEN';
    if (mins >= 540 && mins < 570) return 'PRE';
    return 'CLOSED';
  }

  function updateMarketStatus() {
    var s = getMarketStatus();
    $.marketLabel.textContent = s;
    $.statusDot.className = 'status-dot ' + s.toLowerCase();
  }

  function getTimeZone() {
    var now = new Date();
    var et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    var h = et.getHours(), m = et.getMinutes();
    var mins = h * 60 + m;
    if (mins < 570 || mins >= 960) return '--';
    if (mins < 600) return 'OPENING';
    if (mins < 690) return 'PRIME';
    if (mins < 810) return 'MIDDAY';
    if (mins < 900) return 'THETA';
    return 'POWER';
  }

  // ── P&L Display ─────────────────────────────────────────
  function updatePnL(data) {
    if (data == null) return;
    var pnl = typeof data.dailyPnL === 'number' ? data.dailyPnL : (typeof data.daily === 'number' ? data.daily : 0);
    var wins = data.wins || 0;
    var losses = data.losses || 0;
    state.pnl.daily = pnl;
    state.pnl.wins = wins;
    state.pnl.losses = losses;
    var sign = pnl >= 0 ? '+' : '';
    $.pnlValue.textContent = sign + '$' + Math.abs(pnl).toFixed(2);
    $.pnlValue.style.color = pnl >= 0 ? 'var(--green)' : 'var(--red)';
    $.pnlSub.textContent = wins + 'W / ' + losses + 'L';
  }

  // ── Positions ───────────────────────────────────────────
  function renderPositions(positions) {
    if (!Array.isArray(positions)) positions = [];
    state.positions = positions;
    $.posCount.textContent = positions.length;
    if (positions.length === 0) {
      $.posList.innerHTML = '<div class="empty">No open positions</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      var dir = (p.direction || p.type || '').toUpperCase();
      var isCall = dir === 'CALL' || dir === 'C';
      var pnlVal = typeof p.pnl === 'number' ? p.pnl : 0;
      var pnlPct = typeof p.pnlPct === 'number' ? p.pnlPct : 0;
      var phase = (p.phase || 'INITIAL').toUpperCase();
      var phaseClass = phase === 'PROFIT_ZONE' ? 'badge-phase-profit' : (phase === 'ACTIVE' ? 'badge-phase-active' : 'badge-phase-initial');
      var pnlColor = pnlVal >= 0 ? 'var(--green)' : 'var(--red)';
      var pnlSign = pnlVal >= 0 ? '+' : '';
      var qty = p.qty || p.quantity || 1;
      var totalQty = p.totalQty || p.initialQty || qty;
      var stop = typeof p.trailingStop === 'number' ? p.trailingStop.toFixed(2) : (typeof p.stopLoss === 'number' ? p.stopLoss.toFixed(2) : '--');
      html += '<div class="pos-card">';
      html += '<div class="pos-row">';
      html += '<span class="pos-symbol">' + esc(p.symbol || p.ticker || '???') + '</span>';
      html += '<span class="badge ' + (isCall ? 'badge-call' : 'badge-put') + '">' + dir + '</span>';
      html += '<span class="badge ' + phaseClass + '">' + phase.replace('_', ' ') + '</span>';
      html += '<button class="btn-close" data-sym="' + esc(p.symbol || '') + '">Close</button>';
      html += '</div>';
      html += '<div class="pos-row">';
      html += '<span class="pos-pnl" style="color:' + pnlColor + ';">' + pnlSign + '$' + Math.abs(pnlVal).toFixed(2) + ' (' + pnlSign + pnlPct.toFixed(1) + '%)</span>';
      html += '</div>';
      html += '<div class="pos-row">';
      html += '<span class="pos-meta">Stop: ' + stop + '</span>';
      html += '<span class="pos-meta">Qty: ' + qty + '/' + totalQty + '</span>';
      html += '</div>';
      html += '</div>';
    }
    $.posList.innerHTML = html;
    var btns = $.posList.querySelectorAll('.btn-close');
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener('click', function() {
        var sym = this.getAttribute('data-sym');
        if (confirm('Close position ' + sym + '?')) {
          killPosition(sym);
        }
      });
    }
  }

  function killPosition(sym) {
    fetch('/api/trading/kill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: sym })
    }).catch(function(err) { console.error('Kill failed:', err); });
  }

  // ── Signals ─────────────────────────────────────────────
  function renderSignals(signals) {
    if (!Array.isArray(signals)) signals = [];
    for (var i = signals.length - 1; i >= 0; i--) {
      var sig = signals[i];
      var exists = false;
      for (var j = 0; j < state.signals.length; j++) {
        if (state.signals[j].id === sig.id || (state.signals[j].ticker === sig.ticker && state.signals[j].ts === sig.ts)) {
          exists = true; break;
        }
      }
      if (!exists) state.signals.unshift(sig);
    }
    if (state.signals.length > state.maxSignals) {
      state.signals = state.signals.slice(0, state.maxSignals);
    }
    rebuildSignalDOM();
  }

  function addSignals(signals) {
    if (!Array.isArray(signals)) signals = [signals];
    for (var i = 0; i < signals.length; i++) {
      state.signals.unshift(signals[i]);
    }
    if (state.signals.length > state.maxSignals) {
      state.signals = state.signals.slice(0, state.maxSignals);
    }
    rebuildSignalDOM();
  }

  function rebuildSignalDOM() {
    $.signalCount.textContent = state.signals.length;
    if (state.signals.length === 0) {
      $.signalList.innerHTML = '<div class="empty">Waiting for signals...</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < state.signals.length; i++) {
      var s = state.signals[i];
      var ts = s.ts ? formatET(s.ts) : '--:--';
      var ticker = s.ticker || s.symbol || '???';
      var score = s.score || s.totalScore || 0;
      var maxScore = s.maxScore || 12;
      var pct = Math.min(score / maxScore * 100, 100);
      var scoreColor = pct >= 75 ? 'var(--green)' : (pct >= 50 ? 'var(--yellow)' : 'var(--text-muted)');
      var dir = (s.direction || s.type || '').toUpperCase();
      var dirClass = dir === 'CALL' || dir === 'C' || dir === 'BULL' ? 'badge-call' : 'badge-put';
      html += '<div class="signal-row">';
      html += '<span class="signal-time">' + ts + '</span>';
      html += '<span class="signal-ticker">' + esc(ticker) + '</span>';
      html += '<span class="badge ' + dirClass + '">' + (dir || '--') + '</span>';
      html += '<div><div class="score-bar-wrap"><div class="score-bar-fill" style="width:' + pct + '%;background:' + scoreColor + ';"></div></div></div>';
      html += '<span style="font-size:10px;color:' + scoreColor + ';">' + score + '/' + maxScore + '</span>';
      html += '</div>';
    }
    $.signalList.innerHTML = html;
  }

  // ── Risk Gauges ─────────────────────────────────────────
  function updateRiskGauges(risk) {
    if (!risk) return;
    var pnl = typeof risk.dailyPnL === 'number' ? risk.dailyPnL : state.pnl.daily;
    var maxLoss = risk.maxLoss || state.risk.maxLoss || 500;
    var posCount = typeof risk.posCount === 'number' ? risk.posCount : state.positions.length;
    var maxPos = risk.maxPos || state.risk.maxPos || 3;
    var lossStreak = risk.lossStreak || risk.consecutiveLosses || 0;
    var tz = risk.timeZone || getTimeZone();
    state.risk = { dailyPnL: pnl, maxLoss: maxLoss, posCount: posCount, maxPos: maxPos, lossStreak: lossStreak, timeZone: tz };
    var pnlPct = Math.min(Math.abs(pnl) / maxLoss * 100, 100);
    var pnlBarColor = pnlPct < 50 ? 'var(--green)' : (pnlPct < 80 ? 'var(--yellow)' : 'var(--red)');
    if (pnl >= 0) { pnlBarColor = 'var(--green)'; pnlPct = 0; }
    $.riskPnlVal.textContent = '$' + pnl.toFixed(0) + ' / -$' + maxLoss;
    $.riskPnlBar.style.width = pnlPct + '%';
    $.riskPnlBar.style.background = pnlBarColor;
    var posPct = maxPos > 0 ? (posCount / maxPos * 100) : 0;
    $.riskPosVal.textContent = posCount + ' / ' + maxPos;
    $.riskPosBar.style.width = posPct + '%';
    $.riskPosBar.style.background = posPct >= 100 ? 'var(--yellow)' : 'var(--text-secondary)';
    $.tzBadge.textContent = tz;
    $.tzBadge.className = 'tz-badge';
    var tzMap = { OPENING: 'tz-opening', PRIME: 'tz-prime', MIDDAY: 'tz-midday', THETA: 'tz-theta', POWER: 'tz-power' };
    if (tzMap[tz]) $.tzBadge.classList.add(tzMap[tz]);
    $.riskLossStreak.textContent = lossStreak;
    $.riskLossStreak.style.color = lossStreak >= 3 ? 'var(--red)' : (lossStreak >= 2 ? 'var(--yellow)' : 'var(--text)');
  }

  // ── Journal ─────────────────────────────────────────────
  function bindJournalToggle() {
    $.journalToggle.addEventListener('click', function() {
      var isOpen = $.journalBody.classList.contains('open');
      if (isOpen) {
        $.journalBody.classList.remove('open');
        $.journalToggle.classList.remove('open');
      } else {
        $.journalBody.classList.add('open');
        $.journalToggle.classList.add('open');
      }
    });
  }

  function addJournalEntry(trade) {
    if (!trade) return;
    if (Array.isArray(trade)) {
      for (var i = 0; i < trade.length; i++) addJournalEntry(trade[i]);
      return;
    }
    state.journal.push(trade);
    rebuildJournal();
  }

  function rebuildJournal() {
    var trades = state.journal;
    $.journalCountHead.textContent = trades.length + ' trade' + (trades.length !== 1 ? 's' : '');
    if (trades.length === 0) {
      $.journalSummary.innerHTML = '';
      $.journalList.innerHTML = '<div class="empty">No completed trades today</div>';
      drawEquityCurve([]);
      return;
    }
    var wins = 0, losses = 0, totalPnL = 0, best = -Infinity, worst = Infinity;
    var cumPnl = [];
    var running = 0;
    for (var i = 0; i < trades.length; i++) {
      var t = trades[i];
      var pl = typeof t.pnl === 'number' ? t.pnl : 0;
      totalPnL += pl;
      running += pl;
      cumPnl.push(running);
      if (pl >= 0) wins++; else losses++;
      if (pl > best) best = pl;
      if (pl < worst) worst = pl;
    }
    var wr = trades.length > 0 ? (wins / trades.length * 100).toFixed(0) : 0;
    $.journalSummary.innerHTML =
      '<span class="journal-stat">Trades: <span class="val">' + trades.length + '</span></span>' +
      '<span class="journal-stat">Win: <span class="val" style="color:var(--green);">' + wins + '</span></span>' +
      '<span class="journal-stat">Loss: <span class="val" style="color:var(--red);">' + losses + '</span></span>' +
      '<span class="journal-stat">Rate: <span class="val">' + wr + '%</span></span>' +
      '<span class="journal-stat">Best: <span class="val" style="color:var(--green);">$' + (best === -Infinity ? '0' : best.toFixed(2)) + '</span></span>' +
      '<span class="journal-stat">Worst: <span class="val" style="color:var(--red);">$' + (worst === Infinity ? '0' : worst.toFixed(2)) + '</span></span>';
    var html = '';
    for (var j = trades.length - 1; j >= 0; j--) {
      var tr = trades[j];
      var dir = (tr.direction || tr.type || '').toUpperCase();
      var isCall = dir === 'CALL' || dir === 'C';
      var pl2 = typeof tr.pnl === 'number' ? tr.pnl : 0;
      var pct = typeof tr.pnlPct === 'number' ? tr.pnlPct : 0;
      var pnlColor = pl2 >= 0 ? 'var(--green)' : 'var(--red)';
      var pnlSign = pl2 >= 0 ? '+' : '';
      var reason = tr.exitReason || tr.reason || '--';
      var reasonColor = reason === 'PROFIT_TARGET' || reason === 'SCALE_OUT' ? 'var(--accent-subtle)' : 'rgba(239,68,68,0.12)';
      var reasonText = reason === 'PROFIT_TARGET' || reason === 'SCALE_OUT' ? 'var(--green)' : 'var(--red)';
      html += '<div class="journal-row">';
      html += '<span class="time">' + (tr.exitTime ? formatET(tr.exitTime) : '--:--') + '</span>';
      html += '<span style="font-weight:600;">' + esc(tr.symbol || tr.ticker || '???') + '</span>';
      html += '<span class="badge ' + (isCall ? 'badge-call' : 'badge-put') + '">' + dir + '</span>';
      html += '<span style="color:var(--text-muted);">' + (tr.entryPrice ? '$' + Number(tr.entryPrice).toFixed(2) : '--') + '</span>';
      html += '<span style="color:var(--text-muted);">' + (tr.exitPrice ? '$' + Number(tr.exitPrice).toFixed(2) : '--') + '</span>';
      html += '<span style="color:' + pnlColor + ';font-weight:600;">' + pnlSign + '$' + Math.abs(pl2).toFixed(2) + '</span>';
      html += '<span class="reason" style="background:' + reasonColor + ';color:' + reasonText + ';">' + esc(reason.replace(/_/g, ' ')) + '</span>';
      html += '</div>';
    }
    $.journalList.innerHTML = html;
    drawEquityCurve(cumPnl);
  }

  // ── Equity Curve ──────────────────────────────────────
  function drawEquityCurve(points) {
    var canvas = $.equityCanvas;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    var w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    if (!points || points.length < 2) return;
    var min = Infinity, max = -Infinity;
    for (var i = 0; i < points.length; i++) {
      if (points[i] < min) min = points[i];
      if (points[i] > max) max = points[i];
    }
    if (min === max) { min -= 1; max += 1; }
    var range = max - min;
    var pad = 2;
    var zeroY = h - pad - ((0 - min) / range) * (h - pad * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(w, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    var last = points[points.length - 1];
    ctx.strokeStyle = last >= 0 ? '#22C55E' : '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var j = 0; j < points.length; j++) {
      var x = (j / (points.length - 1)) * w;
      var y = h - pad - ((points[j] - min) / range) * (h - pad * 2);
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // ── TradingView Chart ─────────────────────────────────
  function msToSec(ms) { return Math.floor(ms / 1000); }
  function barsToTV(bars) {
    return bars.map(function(b) { return { time: msToSec(b.t), open: b.o, high: b.h, low: b.l, close: b.c }; });
  }

  var chart = {
    bars: [],
    markers: [],
    stopLine: null,
    targets: [],
    tv: null,
    tvCandle: null,
    priceLines: [],
    seriesMarkers: null,
  };

  function initTVChart() {
    if (!$.tvContainer) return;
    chart.tv = LightweightCharts.createChart($.tvContainer, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' },
        textColor: '#71717A',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: { color: 'rgba(59,130,246,0.4)', labelBackgroundColor: '#18181B' },
        horzLine: { color: 'rgba(59,130,246,0.4)', labelBackgroundColor: '#18181B' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    chart.tvCandle = chart.tv.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });
  }

  function clearPriceLines() {
    for (var i = 0; i < chart.priceLines.length; i++) {
      chart.tvCandle.removePriceLine(chart.priceLines[i]);
    }
    chart.priceLines = [];
  }

  function updateChartBar(bar) {
    if (!bar || !bar.t) return;
    var bars = chart.bars;
    if (bars.length > 0 && bars[bars.length - 1].t === bar.t) {
      bars[bars.length - 1] = bar;
    } else {
      bars.push(bar);
      if (bars.length > 500) bars.shift();
    }
    if (chart.tvCandle) {
      chart.tvCandle.update({ time: msToSec(bar.t), open: bar.o, high: bar.h, low: bar.l, close: bar.c });
    }
    if (bars.length > 0) {
      var lastBar = bars[bars.length - 1];
      $.chartPrice.textContent = lastBar.c.toFixed(2);
      $.chartPrice.style.color = lastBar.c >= lastBar.o ? 'var(--green)' : 'var(--red)';
    }
  }

  function updateChartOverlays() {
    if (!chart.tvCandle) return;
    clearPriceLines();
    var stopPrice = null;
    var targets = [];
    var markers = [];
    for (var i = 0; i < state.positions.length; i++) {
      var p = state.positions[i];
      if (typeof p.trailingStop === 'number' || typeof p.stopLoss === 'number') {
        stopPrice = p.trailingStop || p.stopLoss;
      }
      if (Array.isArray(p.targets)) {
        for (var t = 0; t < p.targets.length; t++) targets.push(p.targets[t]);
      }
      if (p.entryTime) {
        var dir = (p.direction || p.type || 'CALL').toUpperCase();
        var isCall = dir === 'CALL' || dir === 'C';
        markers.push({
          time: msToSec(new Date(p.entryTime).getTime()),
          position: isCall ? 'belowBar' : 'aboveBar',
          color: isCall ? '#22C55E' : '#EF4444',
          shape: isCall ? 'arrowUp' : 'arrowDown',
          text: isCall ? 'C' : 'P',
        });
      }
    }
    for (var j = 0; j < state.journal.length; j++) {
      var tr = state.journal[j];
      var trDir = (tr.direction || tr.type || 'CALL').toUpperCase();
      var isCallDir = trDir === 'CALL' || trDir === 'C';
      if (tr.entryTime) {
        markers.push({
          time: msToSec(new Date(tr.entryTime).getTime()),
          position: isCallDir ? 'belowBar' : 'aboveBar',
          color: isCallDir ? '#22C55E' : '#EF4444',
          shape: isCallDir ? 'arrowUp' : 'arrowDown',
          text: isCallDir ? 'C' : 'P',
        });
      }
      if (tr.exitTime) {
        var pnlLabel = tr.pnl != null ? (tr.pnl >= 0 ? '+' : '') + '$' + Math.round(tr.pnl) : '';
        markers.push({
          time: msToSec(new Date(tr.exitTime).getTime()),
          position: isCallDir ? 'aboveBar' : 'belowBar',
          color: isCallDir ? '#22C55E' : '#EF4444',
          shape: isCallDir ? 'arrowDown' : 'arrowUp',
          text: pnlLabel,
        });
      }
    }
    if (stopPrice != null) {
      chart.priceLines.push(chart.tvCandle.createPriceLine({
        price: stopPrice, color: 'rgba(239,68,68,0.7)', lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: true, title: 'STOP',
      }));
    }
    for (var tl = 0; tl < targets.length; tl++) {
      chart.priceLines.push(chart.tvCandle.createPriceLine({
        price: targets[tl], color: 'rgba(59,130,246,0.5)', lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dotted, axisLabelVisible: true, title: 'T' + (tl + 1),
      }));
    }
    markers.sort(function(a, b) { return a.time - b.time; });
    if (markers.length > 0) {
      if (chart.seriesMarkers) {
        chart.seriesMarkers.setMarkers(markers);
      } else {
        chart.seriesMarkers = LightweightCharts.createSeriesMarkers(chart.tvCandle, markers);
      }
    } else if (chart.seriesMarkers) {
      chart.seriesMarkers.setMarkers([]);
    }
  }

  // ── Config Controls ─────────────────────────────────────
  function sendConfig() {
    var maxLoss = parseInt($.cfgMaxLoss.value) || 500;
    var maxPos = parseInt($.cfgMaxPos.value) || 3;
    fetch('/api/trading/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxDailyLoss: maxLoss, maxPositions: maxPos })
    }).catch(function(err) { console.error('Config update failed:', err); });
  }

  // ── Cockpit Panel ──────────────────────────────────────
  var ALL_TICKERS = ['SPY','QQQ','IWM','AAPL','MSFT','NVDA','AMZN','META','GOOGL','TSLA','AMD','NFLX'];

  function updateCockpitPanel(settings) {
    if (!settings) return;
    state.cockpit.mode = settings.mode || 'auto';
    state.cockpit.scanning = settings.scanning !== false;
    state.cockpit.conviction = settings.conviction || 5;
    state.cockpit.underlyings = settings.underlyings || ['SPY','QQQ'];
    state.cockpit.isPaper = settings.isPaper !== false;
    state.cockpit.nextScanTime = settings.nextScanTime || null;
    state.cockpit.positionCount = settings.positionCount || 0;
    state.cockpit.maxPositions = settings.maxPositions || 3;
    state.cockpit.pendingCount = settings.pendingCount || 0;
    state.cockpit.dailyPnL = typeof settings.dailyPnL === 'number' ? settings.dailyPnL : 0;
    var btns = $.modeToggle.querySelectorAll('.mode-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-mode') === state.cockpit.mode);
    }
    $.scanToggle.checked = state.cockpit.scanning;
    $.convSlider.value = state.cockpit.conviction;
    $.convValue.textContent = state.cockpit.conviction;
    renderTickerBadges();
    $.paperBadge.textContent = state.cockpit.isPaper ? 'PAPER' : 'LIVE';
    $.paperBadge.className = 'badge-paper ' + (state.cockpit.isPaper ? 'paper' : 'live');
    $.cbResetBtn.style.display = settings.circuitBreakerPaused ? '' : 'none';
    $.cockpitPos.textContent = 'Pos: ' + state.cockpit.positionCount + '/' + state.cockpit.maxPositions;
    state.risk.maxPos = state.cockpit.maxPositions;
    updateRiskGauges(state.risk);
  }

  function renderTickerBadges() {
    var html = '';
    var active = state.cockpit.underlyings;
    for (var i = 0; i < ALL_TICKERS.length; i++) {
      var t = ALL_TICKERS[i];
      var isActive = active.indexOf(t) !== -1;
      html += '<span class="ticker-badge' + (isActive ? ' active' : '') + '" data-ticker="' + t + '">' + t + '</span>';
    }
    $.tickerGroup.innerHTML = html;
    var badges = $.tickerGroup.querySelectorAll('.ticker-badge');
    for (var j = 0; j < badges.length; j++) {
      badges[j].addEventListener('click', function() {
        var ticker = this.getAttribute('data-ticker');
        var idx = state.cockpit.underlyings.indexOf(ticker);
        if (idx !== -1) { state.cockpit.underlyings.splice(idx, 1); }
        else { state.cockpit.underlyings.push(ticker); }
        renderTickerBadges();
        if (SQ.socket) SQ.socket.emit('trading:set_underlyings', { tickers: state.cockpit.underlyings });
      });
    }
  }

  function updateNextScanCountdown() {
    if (!state.cockpit.nextScanTime) { $.nextScan.textContent = 'Next: --:--'; return; }
    var diff = state.cockpit.nextScanTime - Date.now();
    if (diff <= 0) { $.nextScan.textContent = 'Next: now'; return; }
    var mins = Math.floor(diff / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    $.nextScan.textContent = 'Next: ' + mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  // ── Pending Trades ────────────────────────────────────
  function addPendingTrade(trade) {
    for (var i = state.pendingTrades.length - 1; i >= 0; i--) {
      if (state.pendingTrades[i].tradeId === trade.tradeId) state.pendingTrades.splice(i, 1);
    }
    state.pendingTrades.push(trade);
    renderPendingTrades();
  }

  function removePendingTrade(tradeId) {
    for (var i = state.pendingTrades.length - 1; i >= 0; i--) {
      if (state.pendingTrades[i].tradeId === tradeId) state.pendingTrades.splice(i, 1);
    }
    renderPendingTrades();
  }

  function renderPendingTrades() {
    var trades = state.pendingTrades;
    if (state.cockpit.mode === 'manual' && trades.length > 0) {
      $.signalCount.textContent = trades.length + ' pending';
      var html = '<div class="pending-list">';
      for (var i = 0; i < trades.length; i++) {
        var t = trades[i];
        var dir = (t.optionType || t.direction || '').toUpperCase();
        var isCall = dir === 'CALL' || dir === 'C';
        var timeLeft = t.expiresAt ? Math.max(0, t.expiresAt - Date.now()) : 0;
        var pct = t.expiresAt ? (timeLeft / (2 * 60 * 1000) * 100) : 100;
        html += '<div class="pending-card" data-trade-id="' + esc(t.tradeId) + '">';
        html += '<div class="pending-header">';
        html += '<span class="pending-ticker">' + esc(t.underlying || '???') + '</span>';
        html += '<span class="badge ' + (isCall ? 'badge-call' : 'badge-put') + '">' + dir + '</span>';
        if (t.conviction) html += '<span style="font-family:var(--font-mono);font-size:10px;color:var(--accent);">Conv ' + t.conviction + '/10</span>';
        if (t.scannerScore) html += '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">Score ' + t.scannerScore + '</span>';
        html += '</div>';
        if (t.setupType) html += '<div class="pending-meta">' + esc(t.setupType.replace(/_/g, ' ')) + (t.strategy ? ' \\u2014 ' + esc(t.strategy) : '') + '</div>';
        if (t.reason) html += '<div class="pending-reason">' + esc(t.reason) + '</div>';
        if (t.spot) html += '<div class="pending-meta">Spot: $' + Number(t.spot).toFixed(2) + '</div>';
        html += '<div class="pending-timer-bar"><div class="pending-timer-fill" style="width:' + pct.toFixed(1) + '%;"></div></div>';
        html += '<div class="pending-actions">';
        html += '<button class="btn-approve" data-id="' + esc(t.tradeId) + '">Execute</button>';
        html += '<button class="btn-skip" data-id="' + esc(t.tradeId) + '">Skip</button>';
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
      $.signalList.innerHTML = html;
      var approveBtns = $.signalList.querySelectorAll('.btn-approve');
      for (var a = 0; a < approveBtns.length; a++) {
        approveBtns[a].addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          this.disabled = true;
          this.textContent = 'Executing...';
          if (SQ.socket) SQ.socket.emit('trading:approve', { tradeId: id });
        });
      }
      var skipBtns = $.signalList.querySelectorAll('.btn-skip');
      for (var s = 0; s < skipBtns.length; s++) {
        skipBtns[s].addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          if (SQ.socket) SQ.socket.emit('trading:reject', { tradeId: id });
        });
      }
    } else {
      rebuildSignalDOM();
    }
  }

  function updatePendingTimers() {
    var el = document.getElementById('page-trading');
    if (!el) return;
    var cards = el.querySelectorAll('.pending-card');
    for (var i = 0; i < cards.length; i++) {
      var tradeId = cards[i].getAttribute('data-trade-id');
      var trade = null;
      for (var j = 0; j < state.pendingTrades.length; j++) {
        if (state.pendingTrades[j].tradeId === tradeId) { trade = state.pendingTrades[j]; break; }
      }
      if (trade && trade.expiresAt) {
        var timeLeft = Math.max(0, trade.expiresAt - Date.now());
        var pct = timeLeft / (2 * 60 * 1000) * 100;
        var fill = cards[i].querySelector('.pending-timer-fill');
        if (fill) fill.style.width = pct.toFixed(1) + '%';
      }
    }
  }

  // ── Activity Log ──────────────────────────────────────
  var iconMap = { bolt: '\\u26A1', check: '\\u2713', x: '\\u2717', bell: '\\u25C6', radar: '\\u25CE', shield: '\\u2298', moon: '\\u25D1', star: '\\u2605', switch: '\\u21C4', eye: '\\u25C9', clock: '\\u25F7' };

  function addLogEntry(entry) {
    if (!entry) return;
    state.activityLog.push(entry);
    if (state.activityLog.length > 200) state.activityLog.shift();
    var nearBottom = $.activityLog.scrollHeight - $.activityLog.scrollTop - $.activityLog.clientHeight < 40;
    appendLogEntryDOM(entry);
    $.logCount.textContent = state.activityLog.length;
    if (nearBottom) $.activityLog.scrollTop = $.activityLog.scrollHeight;
  }

  function appendLogEntryDOM(entry) {
    var div = document.createElement('div');
    div.className = 'log-entry type-' + (entry.type || 'info');
    var ts = entry.ts ? formatET(entry.ts) : '--:--:--';
    var icon = iconMap[entry.icon] || '\\u00B7';
    div.innerHTML = '<span class="log-ts">' + ts + '</span><span class="log-icon">' + icon + '</span><span class="log-msg">' + esc(entry.message || '') + '</span>';
    $.activityLog.appendChild(div);
    var empty = $.activityLog.querySelector('.empty');
    if (empty) empty.remove();
  }

  function renderFullActivityLog(entries) {
    if (!Array.isArray(entries)) return;
    state.activityLog = entries;
    $.activityLog.innerHTML = '';
    if (entries.length === 0) {
      $.activityLog.innerHTML = '<div class="empty" style="padding:20px;">Engine idle...</div>';
    } else {
      for (var i = 0; i < entries.length; i++) appendLogEntryDOM(entries[i]);
      $.activityLog.scrollTop = $.activityLog.scrollHeight;
    }
    $.logCount.textContent = entries.length;
  }

  // ── Regime & Microstructure ─────────────────────────────
  var REGIME_COLORS = {
    TRENDING: '#22C55E',
    MEAN_REVERTING: '#3B82F6',
    CHOPPY: '#EF4444',
    SQUEEZE: '#60A5FA',
    EXHAUSTION: '#F59E0B'
  };

  function updateRegimeBadge(data) {
    if (!data) return;
    var regime = (data.regime || data.label || '').toUpperCase();
    var confidence = typeof data.confidence === 'number' ? data.confidence : 0;
    var blocked = !!data.blocked;
    var color = REGIME_COLORS[regime] || 'var(--text-muted)';
    $.regimeBadge.style.display = 'flex';
    $.regimeDot.style.background = color;
    $.regimeDot.style.boxShadow = 'none';
    $.regimeLabel.textContent = regime.replace(/_/g, ' ') || '--';
    $.regimeLabel.style.color = color;
    $.regimeConf.textContent = (confidence * 100).toFixed(0) + '%';
    if (regime === 'CHOPPY') {
      $.regimeBadge.classList.add('regime-pulsing');
    } else {
      $.regimeBadge.classList.remove('regime-pulsing');
    }
    $.regimeBlocked.style.display = blocked ? 'inline-block' : 'none';
  }

  function updateMicrostructure(data) {
    if (!data) return;
    var oir = typeof data.oir === 'number' ? data.oir : 0.5;
    var oirPct = Math.max(0, Math.min(100, oir * 100));
    $.oirMarker.style.left = oirPct + '%';
    $.oirValue.textContent = oirPct.toFixed(0) + '%';
    $.oirValue.style.color = oir > 0.6 ? 'var(--green)' : (oir < 0.4 ? 'var(--red)' : 'var(--text-muted)');
    var sweep = typeof data.sweepScore === 'number' ? data.sweepScore : 0;
    var sweepDir = data.sweepDirection || data.direction || '--';
    $.sweepScore.textContent = sweep.toFixed(1);
    $.sweepScore.style.color = sweep >= 7 ? 'var(--accent)' : (sweep >= 4 ? 'var(--text)' : 'var(--text-muted)');
    $.sweepDir.textContent = sweepDir;
    var velocity = (data.velocity || 'NORMAL').toUpperCase();
    $.velocityLabel.textContent = velocity;
    if (velocity === 'SPIKE') {
      $.velocityLabel.style.color = 'var(--red)';
      $.velocityLabel.style.background = 'rgba(239,68,68,0.12)';
    } else if (velocity === 'FADING') {
      $.velocityLabel.style.color = 'var(--yellow)';
      $.velocityLabel.style.background = 'var(--warn-dim)';
    } else {
      $.velocityLabel.style.color = 'var(--text-muted)';
      $.velocityLabel.style.background = 'var(--bg-surface)';
    }
    var spread = (data.spreadHealth || data.spread || '--').toUpperCase();
    $.spreadLabel.textContent = spread;
    if (spread === 'TIGHT') {
      $.spreadDot.style.background = 'var(--green)';
      $.spreadLabel.style.color = 'var(--green)';
    } else if (spread === 'NORMAL') {
      $.spreadDot.style.background = 'var(--yellow)';
      $.spreadLabel.style.color = 'var(--yellow)';
    } else if (spread === 'WIDE') {
      $.spreadDot.style.background = 'var(--red)';
      $.spreadLabel.style.color = 'var(--red)';
    } else {
      $.spreadDot.style.background = 'var(--text-muted)';
      $.spreadLabel.style.color = 'var(--text-muted)';
    }
    if (data.ts) {
      $.microTs.textContent = formatET(data.ts);
    }
  }

  // ── Socket Handlers ───────────────────────────────────
  function onConnect() {
    console.log('[WR-SPA] Socket connected');
    SQ.socket.emit('subscribe:trading');
    SQ.socket.emit('subscribe:chart', { ticker: 'SPY', tf: '1m' });
    fetch('/api/chart/bars/SPY?tf=1m&limit=390')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.bars && data.bars.length > 0) {
          chart.bars = data.bars;
          if (chart.tvCandle) chart.tvCandle.setData(barsToTV(data.bars));
        }
      })
      .catch(function(e) { console.error('[WR-SPA] Reconnect chart backfill failed:', e); });
  }
  function onPositions(positions) { renderPositions(positions); updateRiskGauges(state.risk); updateChartOverlays(); }
  function onSignals(signals) { addSignals(signals); }
  function onPnl(pnl) { updatePnL(pnl); updateRiskGauges({ dailyPnL: pnl.dailyPnL || pnl.daily || 0 }); }
  function onJournal(trade) { addJournalEntry(trade); updateChartOverlays(); }
  function onRisk(risk) { updateRiskGauges(risk); }
  function onSettings(settings) { updateCockpitPanel(settings); }
  function onPending(trade) { addPendingTrade(trade); }
  function onPendingList(trades) { state.pendingTrades = trades || []; renderPendingTrades(); }
  function onPendingResolved(data) { removePendingTrade(data.tradeId); }
  function onPendingExpired(data) { removePendingTrade(data.tradeId); }
  function onLog(entry) { addLogEntry(entry); }
  function onActivityLog(entries) { renderFullActivityLog(entries); }
  function onRegime(data) { updateRegimeBadge(data); }
  function onMicrostructure(data) { updateMicrostructure(data); }
  function onVix(data) {
    if (!$.vixBadge || !$.vixLevel || !$.vixZone) return;
    if (!data || typeof data.level !== 'number') return;
    $.vixBadge.style.display = 'flex';
    var arrow = data.direction === 'rising' ? '\\u2191' : data.direction === 'falling' ? '\\u2193' : '';
    $.vixLevel.textContent = 'VIX ' + data.level.toFixed(1) + arrow;
    var zoneColors = { LOW: '#22C55E', NORMAL: '#3B82F6', ELEVATED: '#F59E0B', HIGH: '#EF4444', EXTREME: '#EF4444' };
    var color = zoneColors[data.zone] || 'var(--text-muted)';
    $.vixLevel.style.color = color;
    $.vixZone.textContent = data.zone;
    $.vixZone.style.color = color;
    if (data.spike) {
      $.vixBadge.style.borderColor = '#EF4444';
      $.vixBadge.style.background = 'rgba(239, 68, 68, 0.1)';
    } else {
      $.vixBadge.style.borderColor = 'var(--border-subtle)';
      $.vixBadge.style.background = 'var(--bg-surface)';
    }
  }
  function onChartBar(bar) { updateChartBar(bar); }

  function subscribeSocket() {
    if (!SQ.socket) return;
    socketHandlers = [
      ['connect', onConnect],
      ['trading:positions', onPositions],
      ['trading:signals', onSignals],
      ['trading:pnl', onPnl],
      ['trading:journal', onJournal],
      ['trading:risk', onRisk],
      ['trading:settings', onSettings],
      ['trading:pending', onPending],
      ['trading:pending_list', onPendingList],
      ['trading:pending_resolved', onPendingResolved],
      ['trading:pending_expired', onPendingExpired],
      ['trading:log', onLog],
      ['trading:activity_log', onActivityLog],
      ['trading:regime', onRegime],
      ['trading:microstructure', onMicrostructure],
      ['trading:vix', onVix],
      ['chart:bar', onChartBar],
    ];
    for (var i = 0; i < socketHandlers.length; i++) {
      SQ.socket.on(socketHandlers[i][0], socketHandlers[i][1]);
    }
    // If already connected, fire connect handler immediately
    if (SQ.socket.connected) onConnect();
  }

  function unsubscribeSocket() {
    if (!SQ.socket) return;
    for (var i = 0; i < socketHandlers.length; i++) {
      SQ.socket.off(socketHandlers[i][0], socketHandlers[i][1]);
    }
    socketHandlers = [];
  }

  // ── Initial Data Fetch ──────────────────────────────────
  function fetchInitialData() {
    fetch('/api/chart/bars/SPY?tf=1m&limit=390')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.bars && data.bars.length > 0) {
          chart.bars = data.bars;
          if (chart.tvCandle) chart.tvCandle.setData(barsToTV(data.bars));
          if (chart.bars.length > 0) {
            var lb = chart.bars[chart.bars.length - 1];
            $.chartPrice.textContent = lb.c.toFixed(2);
            $.chartPrice.style.color = lb.c >= lb.o ? 'var(--green)' : 'var(--red)';
          }
        }
      })
      .catch(function(e) { console.error('[WR-SPA] Chart fetch failed:', e); });

    fetch('/api/trading/state')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.positions) renderPositions(data.positions);
        if (typeof data.dailyPnL === 'number') {
          updatePnL({ dailyPnL: data.dailyPnL, wins: data.wins || 0, losses: data.losses || 0 });
        }
        if (data.closedTrades) addJournalEntry(data.closedTrades);
        if (data.config) {
          if (data.config.maxDailyLoss) $.cfgMaxLoss.value = data.config.maxDailyLoss;
          if (data.config.maxPositions) $.cfgMaxPos.value = data.config.maxPositions;
          state.risk.maxLoss = data.config.maxDailyLoss || 500;
          state.risk.maxPos = data.config.maxPositions || 3;
        }
        updateRiskGauges(state.risk);
        updateChartOverlays();
      })
      .catch(function(e) { console.error('[WR-SPA] State fetch failed:', e); });

    fetch('/api/trading/signals')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.signals) renderSignals(data.signals);
      })
      .catch(function(e) { console.error('[WR-SPA] Signals fetch failed:', e); });
  }

  // ── Init / Destroy ──────────────────────────────────────
  function init() {
    cacheDom();
    updateMarketStatus();
    updateRiskGauges(state.risk);
    bindJournalToggle();

    // Event bindings
    $.cfgMaxLoss.addEventListener('change', sendConfig);
    $.cfgMaxPos.addEventListener('change', sendConfig);
    $.btnKill.addEventListener('click', function() {
      if (!confirm('KILL SWITCH: Close ALL positions immediately?')) return;
      fetch('/api/trading/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.closed) alert('Closed: ' + data.closed.join(', '));
        })
        .catch(function(err) { alert('Kill failed: ' + err.message); });
    });
    $.modeToggle.addEventListener('click', function(e) {
      var btn = e.target.closest('.mode-btn');
      if (!btn) return;
      var mode = btn.getAttribute('data-mode');
      if (mode && SQ.socket) SQ.socket.emit('trading:set_mode', { mode: mode });
    });
    $.scanToggle.addEventListener('change', function() {
      if (SQ.socket) SQ.socket.emit('trading:set_scanning', { enabled: this.checked });
    });
    $.convSlider.addEventListener('input', function() {
      $.convValue.textContent = this.value;
    });
    $.convSlider.addEventListener('change', function() {
      if (SQ.socket) SQ.socket.emit('trading:set_conviction', { value: parseInt(this.value) });
    });
    $.cbResetBtn.addEventListener('click', function() {
      if (SQ.socket) SQ.socket.emit('trading:reset_cb');
    });

    renderTickerBadges();

    // Intervals
    intervals.push(setInterval(updateMarketStatus, 30000));
    intervals.push(setInterval(function() {
      var tz = getTimeZone();
      if (tz !== state.risk.timeZone) {
        state.risk.timeZone = tz;
        updateRiskGauges(state.risk);
      }
    }, 60000));
    intervals.push(setInterval(updateNextScanCountdown, 1000));
    intervals.push(setInterval(updatePendingTimers, 1000));

    // Start chart + data + socket
    initTVChart();
    fetchInitialData();
    subscribeSocket();
  }

  function destroy() {
    // Unsubscribe socket events
    unsubscribeSocket();
    // Clear intervals
    for (var i = 0; i < intervals.length; i++) clearInterval(intervals[i]);
    intervals = [];
    // Destroy TV chart
    if (chart.tv) {
      chart.tv.remove();
      chart.tv = null;
      chart.tvCandle = null;
      chart.priceLines = [];
      chart.seriesMarkers = null;
    }
    // Reset state
    chart.bars = [];
    state.bars = [];
    state.positions = [];
    state.signals = [];
    state.journal = [];
    state.pendingTrades = [];
    state.activityLog = [];
    state.pnl = { daily: 0, wins: 0, losses: 0 };
    state.risk = { dailyPnL: 0, maxLoss: 500, posCount: 0, maxPos: 3, lossStreak: 0, timeZone: '--' };
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getTradingPageCSS, getTradingPageHTML, getTradingPageJS };
