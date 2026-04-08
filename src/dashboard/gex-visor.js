// ── GEX Visor: Dual SVG gamma exposure visualization ──

function getGexVisorPageCSS() {
  return `
#page-gex-visor { padding: 0; flex-direction: column; height: 100%; overflow-y: auto; overflow-x: hidden; }
#page-gex-visor.active { display: flex; }

#page-gex-visor .gv-header {
  display: flex; justify-content: space-between; align-items: center;
  height: 44px; background: #1E293B; border-bottom: 1px solid #334155;
  padding: 0 16px; gap: 12px; flex-shrink: 0;
}
#page-gex-visor .gv-header-left { display: flex; align-items: center; gap: 12px; }
#page-gex-visor .gv-header-center { display: flex; align-items: center; gap: 16px; }
#page-gex-visor .gv-header-right { display: flex; align-items: center; gap: 8px; }

#page-gex-visor .gv-select {
  background: #1E293B; border: 1px solid #334155; color: #F8FAFC;
  border-radius: 3px; padding: 4px 8px; font-size: 0.8rem; outline: none;
}
#page-gex-visor .gv-select-sm { padding: 2px 6px; font-size: 0.7rem; }

#page-gex-visor .gv-mode-toggle {
  display: flex; border: 1px solid #334155; border-radius: 3px; overflow: hidden;
}
#page-gex-visor .gv-mode-btn {
  padding: 4px 12px; background: transparent; color: #94A3B8; border: none;
  cursor: pointer; font-size: 0.75rem; transition: background 0.15s, color 0.15s;
}
#page-gex-visor .gv-mode-btn.active { background: #fbbf24; color: #fff; }

#page-gex-visor .gv-stat {
  font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #F8FAFC;
}

#page-gex-visor .gv-playback { display: flex; gap: 2px; align-items: center; }
#page-gex-visor .gv-pb-btn,
#page-gex-visor .gv-icon-btn {
  width: 28px; height: 28px; border-radius: 4px; background: transparent;
  color: #94A3B8; border: none; cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: background 0.15s;
}
#page-gex-visor .gv-pb-btn:hover,
#page-gex-visor .gv-icon-btn:hover { background: #1E293B; }

#page-gex-visor .gv-sim-controls {
  display: flex; gap: 24px; padding: 8px 16px; background: #1E293B;
  border-bottom: 1px solid #334155; align-items: center; flex-shrink: 0;
}
#page-gex-visor .gv-sim-controls label {
  display: flex; gap: 8px; align-items: center; color: #94A3B8; font-size: 0.75rem;
}
#page-gex-visor .gv-sim-controls input[type=range] { width: 120px; accent-color: #fbbf24; }
#page-gex-visor .gv-sim-controls span {
  font-family: 'JetBrains Mono', monospace; color: #F8FAFC; min-width: 40px;
}

#page-gex-visor .gv-charts {
  display: flex; flex: 1; min-height: 300px; overflow: hidden; position: relative;
}
#page-gex-visor .gv-chart-panel {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
#page-gex-visor .gv-chart-divider { width: 2px; background: #334155; flex-shrink: 0; }

#page-gex-visor .gv-panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 12px; flex-shrink: 0;
}
#page-gex-visor .gv-panel-title {
  font-size: 0.7rem; letter-spacing: 0.1em; color: #94A3B8; text-transform: uppercase;
}
#page-gex-visor .gv-regime-badge {
  font-size: 0.65rem; padding: 2px 8px; border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

#page-gex-visor .gv-chart-wrap {
  flex: 1; display: flex; overflow: hidden; position: relative;
}
#page-gex-visor .gv-y-axis {
  width: 56px; display: flex; flex-direction: column; justify-content: space-between;
  padding: 4px 4px 4px 0; cursor: ns-resize; user-select: none; flex-shrink: 0;
}
#page-gex-visor .gv-y-axis span {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #94A3B8; text-align: right;
}
#page-gex-visor .gv-chart-area {
  flex: 1; position: relative; overflow: hidden; cursor: crosshair;
}
#page-gex-visor .gv-chart-svg { width: 100%; height: 100%; display: block; }

#page-gex-visor .gv-x-axis {
  height: 22px; display: flex; justify-content: space-between;
  padding: 0 56px 0 56px; flex-shrink: 0;
}
#page-gex-visor .gv-x-axis span {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #94A3B8;
}

#page-gex-visor .gv-bar { transition: opacity 0.15s ease; }
#page-gex-visor .bar-positive { fill: #00E5FF; }
#page-gex-visor .bar-negative { fill: #EF5350; }
#page-gex-visor .bar-saturated { fill: #ffffff; }

#page-gex-visor .gv-marker {
  position: absolute; right: 8px; pointer-events: none; z-index: 10;
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: bold;
  transform: translateY(-50%); padding: 1px 6px; border-radius: 3px;
}
#page-gex-visor .gv-price-marker { color: #FFD700; background: rgba(255,215,0,0.1); }
#page-gex-visor .gv-zero-marker { color: #A78BFA; background: rgba(167,139,250,0.1); }

#page-gex-visor .gv-timeline-section {
  padding: 8px 16px; border-top: 1px solid #334155; flex-shrink: 0;
}
#page-gex-visor .gv-timeline-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
}
#page-gex-visor .gv-timeline-title {
  font-size: 0.7rem; letter-spacing: 0.1em; color: #94A3B8; text-transform: uppercase;
}
#page-gex-visor .gv-timeline-stats {
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
}
#page-gex-visor .gv-timeline-bar {
  position: relative; height: 24px; background: #0F172A; border-radius: 4px; overflow: hidden;
}
#page-gex-visor .gv-seg {
  position: absolute; top: 0; height: 100%; cursor: pointer; transition: opacity 0.15s;
}
#page-gex-visor .gv-seg:hover { opacity: 0.8; }
#page-gex-visor .gv-seg-long { background: linear-gradient(to bottom, #26A69A, rgba(38,166,154,0.6)); }
#page-gex-visor .gv-seg-short { background: linear-gradient(to bottom, #EF5350, rgba(239,83,80,0.6)); }
#page-gex-visor .gv-seg-transition {
  position: absolute; top: -2px; width: 2px; height: 28px; background: #FFD700;
  transform: translateX(-50%);
}
#page-gex-visor .gv-seg-cursor {
  position: absolute; top: -2px; width: 3px; height: 28px; background: #fff;
  transform: translateX(-50%); z-index: 2;
}
#page-gex-visor .gv-timeline-detail {
  margin-top: 8px; padding: 8px 12px; background: #1E293B; border-radius: 3px; font-size: 0.75rem;
}

#page-gex-visor .gv-stats-panel {
  padding: 12px 16px; border-top: 1px solid #334155; flex-shrink: 0;
}
#page-gex-visor .gv-stats-grid {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 12px;
}
#page-gex-visor .gv-stat-card {
  background: #1E293B; border-radius: 3px; padding: 8px 10px; border: 1px solid #334155;
}
#page-gex-visor .gv-stat-label {
  font-size: 0.65rem; color: #94A3B8; text-transform: uppercase;
  letter-spacing: 0.05em; margin-bottom: 4px;
}
#page-gex-visor .gv-stat-value {
  font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #F8FAFC; font-weight: 600;
}

#page-gex-visor .gv-walls-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
#page-gex-visor .gv-walls-col { font-size: 0.75rem; }
#page-gex-visor .gv-walls-title {
  font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 4px; font-weight: 600;
}
#page-gex-visor .gv-persistence-bar { display: flex; gap: 2px; margin-top: 4px; }
#page-gex-visor .gv-p-seg {
  width: 16px; height: 8px; border-radius: 2px; background: #334155;
}
#page-gex-visor .gv-p-seg.active { background: #fbbf24; }

#page-gex-visor .gv-crosshair-h {
  position: absolute; left: 0; right: 0; height: 1px; background: #94A3B8;
  opacity: 0.5; pointer-events: none; z-index: 15;
}
#page-gex-visor .gv-crosshair-v {
  position: absolute; top: 0; bottom: 0; width: 1px; background: #94A3B8;
  opacity: 0.5; pointer-events: none; z-index: 15;
}
#page-gex-visor .gv-crosshair-tip {
  position: absolute; pointer-events: none; z-index: 25; background: #0F172A;
  border: 1px solid #334155; border-radius: 4px; padding: 3px 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #F8FAFC;
  white-space: nowrap;
}

#page-gex-visor .gv-help-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
#page-gex-visor .gv-help-content {
  background: #1E293B; border-radius: 4px; padding: 24px; max-width: 480px;
  color: #F8FAFC; border: 1px solid #334155;
}
#page-gex-visor .gv-help-content h3 {
  font-size: 0.85rem; margin: 0 0 12px; color: #F8FAFC;
}
#page-gex-visor .gv-help-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px;
  margin-bottom: 16px; font-size: 0.8rem; color: #94A3B8;
}
#page-gex-visor kbd {
  background: #0F172A; border: 1px solid #334155; border-radius: 3px;
  padding: 1px 6px; font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem; color: #F8FAFC;
}
#page-gex-visor .gv-help-close {
  background: #fbbf24; color: #fff; border: none; border-radius: 3px;
  padding: 6px 20px; cursor: pointer;
}

@media (max-width: 900px) {
  #page-gex-visor .gv-charts { flex-direction: column; }
  #page-gex-visor .gv-chart-divider { width: 100%; height: 2px; }
  #page-gex-visor .gv-stats-grid { grid-template-columns: repeat(3, 1fr); }
  #page-gex-visor .gv-walls-row { grid-template-columns: repeat(2, 1fr); }
}
`;
}

function getGexVisorPageHTML() {
  return [
'<div id="page-gex-visor" class="page">',

// Header bar
'  <div class="gv-header">',
'    <div class="gv-header-left">',
'      <select id="gv-ticker" class="gv-select"><option>SPY</option><option>QQQ</option><option>IWM</option><option>AAPL</option><option>TSLA</option><option>NVDA</option><option>MSFT</option><option>AMZN</option><option>META</option><option>GOOGL</option></select>',
'      <div class="gv-mode-toggle" id="gv-mode-toggle">',
'        <button class="gv-mode-btn active" data-mode="live">Live</button>',
'        <button class="gv-mode-btn" data-mode="sim">Sim</button>',
'      </div>',
'    </div>',
'    <div class="gv-header-center">',
'      <span class="gv-stat" id="gv-spot-label">SPOT \u2014</span>',
'      <span class="gv-stat" id="gv-s2-label">S\u00b2 \u2014</span>',
'      <span class="gv-stat" id="gv-gex-label">GEX \u2014</span>',
'    </div>',
'    <div class="gv-header-right">',
'      <div class="gv-playback" id="gv-playback">',
'        <button class="gv-pb-btn" id="gv-pb-start" title="Jump to start (Home)"><i data-lucide="skip-back" style="width:14px;height:14px;"></i></button>',
'        <button class="gv-pb-btn" id="gv-pb-prev" title="Step back (\u2190)"><i data-lucide="chevron-left" style="width:14px;height:14px;"></i></button>',
'        <button class="gv-pb-btn" id="gv-pb-play" title="Play/Pause (Space)"><i data-lucide="play" style="width:14px;height:14px;"></i></button>',
'        <button class="gv-pb-btn" id="gv-pb-next" title="Step forward (\u2192)"><i data-lucide="chevron-right" style="width:14px;height:14px;"></i></button>',
'        <button class="gv-pb-btn" id="gv-pb-end" title="Jump to end (End)"><i data-lucide="skip-forward" style="width:14px;height:14px;"></i></button>',
'        <select id="gv-speed" class="gv-select gv-select-sm"><option value="2000">0.5x</option><option value="1000" selected>1x</option><option value="500">2x</option></select>',
'      </div>',
'      <button class="gv-icon-btn" id="gv-reset-btn" title="Reset view (R)"><i data-lucide="rotate-ccw" style="width:16px;height:16px;"></i></button>',
'      <button class="gv-icon-btn" id="gv-fs-btn" title="Fullscreen (F)"><i data-lucide="maximize-2" style="width:16px;height:16px;"></i></button>',
'      <button class="gv-icon-btn" id="gv-help-btn" title="Help (?)"><i data-lucide="help-circle" style="width:16px;height:16px;"></i></button>',
'    </div>',
'  </div>',

// Simulation controls (hidden by default)
'  <div class="gv-sim-controls" id="gv-sim-controls" style="display:none;">',
'    <label>Price <input type="range" id="gv-sim-price" min="100" max="800" value="450" step="1"><span id="gv-sim-price-val">450</span></label>',
'    <label>Tilt <input type="range" id="gv-sim-tilt" min="-0.5" max="0.5" value="0.1" step="0.01"><span id="gv-sim-tilt-val">0.10</span></label>',
'    <label>OI <input type="range" id="gv-sim-oi" min="0.5" max="20" value="5" step="0.5"><span id="gv-sim-oi-val">5.0</span></label>',
'  </div>',

// Dual chart area
'  <div class="gv-charts">',
'    <div class="gv-chart-panel">',
'      <div class="gv-panel-header">',
'        <span class="gv-panel-title">PRACTITIONER VIEW</span>',
'        <span class="gv-regime-badge" id="gv-regime-left">\u2014</span>',
'      </div>',
'      <div class="gv-chart-wrap">',
'        <div class="gv-y-axis" id="gv-yaxis-left"></div>',
'        <div class="gv-chart-area" id="gv-chart-left"></div>',
'      </div>',
'      <div class="gv-x-axis" id="gv-xaxis-left"></div>',
'    </div>',
'    <div class="gv-chart-divider"></div>',
'    <div class="gv-chart-panel">',
'      <div class="gv-panel-header">',
'        <span class="gv-panel-title">ABSOLUTE GEX ($S\u00b2)</span>',
'        <span class="gv-regime-badge" id="gv-regime-right">\u2014</span>',
'      </div>',
'      <div class="gv-chart-wrap">',
'        <div class="gv-y-axis" id="gv-yaxis-right"></div>',
'        <div class="gv-chart-area" id="gv-chart-right"></div>',
'      </div>',
'      <div class="gv-x-axis" id="gv-xaxis-right"></div>',
'    </div>',
'  </div>',

// Regime timeline
'  <div class="gv-timeline-section">',
'    <div class="gv-timeline-header">',
'      <span class="gv-timeline-title">REGIME TIMELINE</span>',
'      <span class="gv-timeline-stats" id="gv-timeline-stats"></span>',
'    </div>',
'    <div class="gv-timeline-bar" id="gv-timeline-bar"></div>',
'    <div class="gv-timeline-detail" id="gv-timeline-detail" style="display:none;"></div>',
'  </div>',

// Stats panel
'  <div class="gv-stats-panel" id="gv-stats-panel">',
'    <div class="gv-stats-grid">',
'      <div class="gv-stat-card"><div class="gv-stat-label">Regime</div><div class="gv-stat-value" id="gv-stat-regime">\u2014</div></div>',
'      <div class="gv-stat-card"><div class="gv-stat-label">Flip Point</div><div class="gv-stat-value" id="gv-stat-flip">\u2014</div></div>',
'      <div class="gv-stat-card"><div class="gv-stat-label">Danger</div><div class="gv-stat-value" id="gv-stat-danger">\u2014</div></div>',
'      <div class="gv-stat-card"><div class="gv-stat-label">Squeeze</div><div class="gv-stat-value" id="gv-stat-squeeze">\u2014</div></div>',
'      <div class="gv-stat-card"><div class="gv-stat-label">Vol Trigger</div><div class="gv-stat-value" id="gv-stat-voltrigger">\u2014</div></div>',
'      <div class="gv-stat-card"><div class="gv-stat-label">Wall Stability</div><div class="gv-stat-value" id="gv-stat-stability">\u2014</div></div>',
'    </div>',
'    <div class="gv-walls-row">',
'      <div class="gv-walls-col"><div class="gv-walls-title" style="color:#00E5FF;">Call Walls</div><div id="gv-call-walls">\u2014</div></div>',
'      <div class="gv-walls-col"><div class="gv-walls-title" style="color:#EF5350;">Put Walls</div><div id="gv-put-walls">\u2014</div></div>',
'      <div class="gv-walls-col"><div class="gv-walls-title">Persistence</div><div id="gv-persistence">\u2014</div></div>',
'      <div class="gv-walls-col"><div class="gv-walls-title">Flip Zone</div><div id="gv-flip-indicator">\u2014</div></div>',
'    </div>',
'  </div>',

// Help overlay
'  <div class="gv-help-overlay" id="gv-help-overlay" style="display:none;">',
'    <div class="gv-help-content">',
'      <h3>Keyboard Shortcuts</h3>',
'      <div class="gv-help-grid">',
'        <div><kbd>Space</kbd> Play / Pause</div>',
'        <div><kbd>\u2190</kbd> <kbd>\u2192</kbd> Step timeline</div>',
'        <div><kbd>Home</kbd> <kbd>End</kbd> Jump to start / end</div>',
'        <div><kbd>R</kbd> Reset zoom</div>',
'        <div><kbd>F</kbd> Fullscreen</div>',
'        <div><kbd>?</kbd> Toggle help</div>',
'        <div><kbd>Esc</kbd> Close help</div>',
'      </div>',
'      <h3>Mouse Controls</h3>',
'      <div class="gv-help-grid">',
'        <div>Scroll Y-axis \u2192 Vertical zoom</div>',
'        <div>Scroll X-axis \u2192 Horizontal zoom</div>',
'        <div>Scroll chart \u2192 Pan price</div>',
'        <div>Double-click axis \u2192 Reset zoom</div>',
'        <div>Hover chart \u2192 Crosshair</div>',
'      </div>',
'      <button class="gv-help-close" id="gv-help-close-btn">Close</button>',
'    </div>',
'  </div>',

// Crosshair elements
'  <div class="gv-crosshair-h" id="gv-crosshair-h" style="display:none;"></div>',
'  <div class="gv-crosshair-v" id="gv-crosshair-v" style="display:none;"></div>',
'  <div class="gv-crosshair-tip" id="gv-crosshair-tip" style="display:none;"></div>',

'</div>'
  ].join('\n');
}

function getGexVisorPageJS() {
  return `
window.SQ = window.SQ || {};
SQ['gex-visor'] = SQ.gexVisor = (function() {
  'use strict';

  var GAMMA_SCALE = 50.0;
  var MAX_BAR_WIDTH = 48.0;
  var BAR_OPACITY = 0.85;
  var BAR_HEIGHT_BASE = 85.0;
  var MIN_BAR_HEIGHT = 0.5;
  var OFFSCREEN_MIN = -10.0;
  var OFFSCREEN_MAX = 110.0;
  var BASELINE_S2 = 90000;
  var SIM_SIGMA = 12.0;

  var state = {
    ticker: 'SPY',
    mode: 'live',
    heatmap: null,
    targets: null,
    intel: null,
    timeline: null,
    timelineIndex: 0,
    playing: false,
    playSpeed: 1000,
    playTimer: null,
    yAxisScale: 1.0,
    xAxisScale: 1.0,
    panOffsetY: 0,
    simPrice: 450,
    simTilt: 0.1,
    simOI: 5.0,
    sse: null,
    showCrosshair: false,
    crosshairX: 0,
    crosshairY: 0,
    lastBarHash: null,
    cachedBars: null,
    refreshInterval: null,
    isFullscreen: false,
    showHelp: false,
    keyHandler: null
  };

  function headers() {
    var h = { 'Content-Type': 'application/json' };
    if (window.DASHBOARD_API_KEY) h['x-api-key'] = window.DASHBOARD_API_KEY;
    return h;
  }

  function formatGex(v) {
    if (!v) return '\\u2014';
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + 'K';
    return v.toFixed(0);
  }

  function calculateBars(profile, spotPrice, isAbsolute) {
    if (!profile || !profile.length) return [];

    var strikes = profile.map(function(s) { return s.strike; });
    var minStrike = Math.min.apply(null, strikes);
    var maxStrike = Math.max.apply(null, strikes);
    var strikeRange = maxStrike - minStrike;
    if (strikeRange === 0) return [];

    var spotPosition = (spotPrice - minStrike) / strikeRange;
    var centerY = 100.0 - (spotPosition * 100.0) + state.panOffsetY;

    var maxAbsGex = 0;
    profile.forEach(function(s) {
      var abs = Math.abs(s.net);
      if (abs > maxAbsGex) maxAbsGex = abs;
    });
    if (maxAbsGex === 0) maxAbsGex = 1;

    var s2Factor = (spotPrice * spotPrice) / BASELINE_S2;
    var bars = [];

    profile.forEach(function(s) {
      var strikePos = (s.strike - minStrike) / strikeRange;
      var baseY = 100.0 - (strikePos * 100.0);
      var scaledY = centerY + (baseY - centerY) * state.yAxisScale;

      var val;
      if (isAbsolute) {
        val = (s.net / maxAbsGex) * GAMMA_SCALE * Math.min(s2Factor / 2, 3);
      } else {
        val = (s.net / maxAbsGex) * GAMMA_SCALE;
      }

      var scaledVal = val * state.xAxisScale;
      var width = Math.min(Math.abs(scaledVal), MAX_BAR_WIDTH);
      var x = val < 0 ? 50 - width : 50;

      var colorClass = 'bar-positive';
      if (val < 0) colorClass = 'bar-negative';
      if (isAbsolute && Math.abs(scaledVal) >= MAX_BAR_WIDTH - 3) colorClass = 'bar-saturated';

      var opacity = (scaledY < OFFSCREEN_MIN || scaledY > OFFSCREEN_MAX) ? 0 : BAR_OPACITY;
      var barH = Math.max(MIN_BAR_HEIGHT, (BAR_HEIGHT_BASE / profile.length) * state.yAxisScale);

      bars.push({
        x: x, y: scaledY - barH / 2, w: width, h: barH,
        cls: colorClass, opacity: opacity, strike: s.strike, net: s.net
      });
    });

    return bars;
  }

  function calculateSimBars(isAbsolute) {
    var strikeStart = Math.floor(state.simPrice * 0.9);
    var strikeEnd = Math.ceil(state.simPrice * 1.1);
    var step = (strikeEnd - strikeStart) > 200 ? 10 : (strikeEnd - strikeStart) > 100 ? 5 : 1;
    var profile = [];
    for (var s = strikeStart; s <= strikeEnd; s += step) {
      var dist = Math.abs(s - state.simPrice) / step;
      var gamma = Math.exp(-(dist * dist) / (2 * (SIM_SIGMA / 2) * (SIM_SIGMA / 2)));
      var net = gamma * state.simTilt * 1e9 * (state.simOI / 5);
      profile.push({ strike: s, net: net, call: net > 0 ? net : 0, put: net < 0 ? net : 0 });
    }
    return calculateBars(profile, state.simPrice, isAbsolute);
  }

  function renderSVG(containerId, isAbsolute) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var bars;
    if (state.mode === 'sim') {
      bars = calculateSimBars(isAbsolute);
    } else {
      var profile = state.heatmap ? state.heatmap.profile : [];
      var spot = state.heatmap ? state.heatmap.spotPrice : 0;
      bars = calculateBars(profile, spot, isAbsolute);
    }

    var spot = state.mode === 'sim' ? state.simPrice : (state.heatmap ? state.heatmap.spotPrice : 0);
    var gammaFlip = state.heatmap ? state.heatmap.gammaFlip : null;

    var priceY = 50 + state.panOffsetY;
    var zeroGammaY = null;
    if (gammaFlip && state.heatmap && state.heatmap.profile && state.heatmap.profile.length) {
      var strikes = state.heatmap.profile.map(function(s) { return s.strike; });
      var minS = Math.min.apply(null, strikes);
      var maxS = Math.max.apply(null, strikes);
      var range = maxS - minS;
      if (range > 0) {
        var spotPos = (spot - minS) / range;
        var flipPos = (gammaFlip - minS) / range;
        var cY = 100 - spotPos * 100 + state.panOffsetY;
        var baseFlipY = 100 - flipPos * 100;
        zeroGammaY = cY + (baseFlipY - cY) * state.yAxisScale;
      }
    }

    var wallMarkers = [];
    if (state.targets && state.targets.walls && state.heatmap && state.heatmap.profile && state.heatmap.profile.length) {
      var wStrikes = state.heatmap.profile.map(function(s) { return s.strike; });
      var wMinS = Math.min.apply(null, wStrikes);
      var wMaxS = Math.max.apply(null, wStrikes);
      var wRange = wMaxS - wMinS;
      if (wRange > 0) {
        var wSpotPos = (spot - wMinS) / wRange;
        var wCenterY = 100 - wSpotPos * 100 + state.panOffsetY;
        var allWalls = (state.targets.walls.callWalls || []).concat(state.targets.walls.putWalls || []);
        allWalls.forEach(function(w) {
          var wPos = (w.strike - wMinS) / wRange;
          var baseWY = 100 - wPos * 100;
          var wY = wCenterY + (baseWY - wCenterY) * state.yAxisScale;
          if (wY > 0 && wY < 100) {
            wallMarkers.push({ y: wY, strike: w.strike, gex: w['netGEX$'] || w.gex || 0 });
          }
        });
      }
    }

    var svg = [];
    svg.push('<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="gv-chart-svg">');

    svg.push('<g class="gv-grid" opacity="0.1">');
    [20,40,60,80].forEach(function(y) {
      svg.push('<line x1="0" y1="' + y + '" x2="100" y2="' + y + '" stroke="#94A3B8" stroke-width="0.15" stroke-dasharray="2,2"/>');
    });
    [25,75].forEach(function(x) {
      svg.push('<line x1="' + x + '" y1="0" x2="' + x + '" y2="100" stroke="#94A3B8" stroke-width="0.15" stroke-dasharray="2,2"/>');
    });
    svg.push('</g>');

    svg.push('<line x1="50" y1="0" x2="50" y2="100" stroke="#334155" stroke-width="0.2" stroke-dasharray="1,1"/>');

    bars.forEach(function(b) {
      svg.push('<rect x="' + b.x.toFixed(2) + '" y="' + b.y.toFixed(2) + '" width="' + b.w.toFixed(2) + '" height="' + b.h.toFixed(2) + '" rx="0.3" class="gv-bar ' + b.cls + '" opacity="' + b.opacity + '"/>');
    });

    wallMarkers.forEach(function(w) {
      svg.push('<line x1="0" y1="' + w.y.toFixed(2) + '" x2="100" y2="' + w.y.toFixed(2) + '" stroke="#94A3B8" stroke-width="0.15" stroke-dasharray="1,2" opacity="0.4"/>');
    });

    if (zeroGammaY !== null && zeroGammaY > 0 && zeroGammaY < 100) {
      svg.push('<line x1="0" y1="' + zeroGammaY.toFixed(2) + '" x2="100" y2="' + zeroGammaY.toFixed(2) + '" stroke="#A78BFA" stroke-width="0.3" stroke-dasharray="2,1"/>');
    }

    if (priceY > 0 && priceY < 100) {
      svg.push('<line x1="0" y1="' + priceY.toFixed(2) + '" x2="100" y2="' + priceY.toFixed(2) + '" stroke="#FFD700" stroke-width="0.4"/>');
    }

    svg.push('</svg>');

    var overlays = '';
    if (priceY > 5 && priceY < 95) {
      overlays += '<div class="gv-marker gv-price-marker" style="top:' + priceY + '%">SPOT $' + spot.toFixed(2) + '</div>';
    }
    if (zeroGammaY !== null && zeroGammaY > 5 && zeroGammaY < 95) {
      overlays += '<div class="gv-marker gv-zero-marker" style="top:' + zeroGammaY.toFixed(2) + '%">0\\u03B3 $' + (gammaFlip || 0).toFixed(2) + '</div>';
    }

    container.innerHTML = svg.join('') + overlays;
  }

  function renderCharts() {
    renderSVG('gv-chart-left', false);
    renderSVG('gv-chart-right', true);
  }

  function renderHeaderStats() {
    var spot = state.heatmap ? state.heatmap.spotPrice : 0;
    var s2 = (spot * spot / BASELINE_S2).toFixed(2);
    var gex = state.heatmap ? state.heatmap.totalNetGEX : 0;
    var el;
    el = document.getElementById('gv-spot-label');
    if (el) el.textContent = 'SPOT $' + spot.toFixed(2);
    el = document.getElementById('gv-s2-label');
    if (el) el.textContent = 'S\\u00b2 ' + s2 + 'x';
    el = document.getElementById('gv-gex-label');
    if (el) el.textContent = 'GEX ' + formatGex(gex);
  }

  function renderStatsPanel() {
    var intel = state.intel || {};
    var targets = state.targets || {};
    var walls = targets.walls || {};

    var regimeEl = document.getElementById('gv-stat-regime');
    var flipEl = document.getElementById('gv-stat-flip');
    var dangerEl = document.getElementById('gv-stat-danger');
    var squeezeEl = document.getElementById('gv-stat-squeeze');
    var volEl = document.getElementById('gv-stat-voltrigger');
    var stabilityEl = document.getElementById('gv-stat-stability');

    var regimeRaw = intel.regime || (state.heatmap ? state.heatmap.regime : null) || '\\u2014';
    var regime = (typeof regimeRaw === 'object' && regimeRaw !== null) ? (regimeRaw.label || '\\u2014') : String(regimeRaw);
    var isLong = regime.toLowerCase().indexOf('long') !== -1;
    if (regimeEl) {
      regimeEl.textContent = regime;
      regimeEl.style.color = isLong ? '#26A69A' : '#EF5350';
    }

    var regimeLeft = document.getElementById('gv-regime-left');
    var regimeRight = document.getElementById('gv-regime-right');
    if (regimeLeft) {
      regimeLeft.textContent = regime;
      regimeLeft.style.background = isLong ? 'rgba(38,166,154,0.15)' : 'rgba(239,83,80,0.15)';
      regimeLeft.style.color = isLong ? '#26A69A' : '#EF5350';
    }
    if (regimeRight) {
      regimeRight.textContent = regime;
      regimeRight.style.background = isLong ? 'rgba(38,166,154,0.15)' : 'rgba(239,83,80,0.15)';
      regimeRight.style.color = isLong ? '#26A69A' : '#EF5350';
    }

    var flipVal = (intel.overlays && intel.overlays.flipStrike) || (state.heatmap ? state.heatmap.gammaFlip : null) || 0;
    if (flipEl) {
      var spot = state.heatmap ? state.heatmap.spotPrice : 0;
      if (typeof flipVal === 'number' && flipVal > 0) {
        var arrow = spot > flipVal ? ' \\u2191' : ' \\u2193';
        flipEl.textContent = '$' + flipVal.toFixed(2) + arrow;
      } else {
        flipEl.textContent = '\\u2014';
      }
    }

    var danger = (typeof intel.dangerScore === 'number') ? intel.dangerScore * 100 : 0;
    if (dangerEl) {
      dangerEl.textContent = danger.toFixed(0);
      if (danger < 30) dangerEl.style.color = '#26A69A';
      else if (danger < 60) dangerEl.style.color = '#FFD700';
      else dangerEl.style.color = '#EF5350';
    }

    if (squeezeEl) squeezeEl.textContent = intel.squeezeState || '\\u2014';
    var volTrig = targets.volTrigger || (intel.volTrigger || null);
    if (volEl) volEl.textContent = (typeof volTrig === 'number') ? '$' + volTrig.toFixed(2) : '\\u2014';
    var wallStab = (intel.motion && intel.motion.wallStability) || null;
    if (stabilityEl) stabilityEl.textContent = (typeof wallStab === 'number') ? (wallStab * 100).toFixed(0) + '%' : '\\u2014';

    var callWallsEl = document.getElementById('gv-call-walls');
    var putWallsEl = document.getElementById('gv-put-walls');
    var callWalls = walls.callWalls || [];
    var putWalls = walls.putWalls || [];

    if (callWallsEl) {
      var cHtml = '';
      callWalls.slice(0, 3).forEach(function(w) {
        cHtml += '<div style="font-family:JetBrains Mono,monospace;font-size:0.75rem;color:#F8FAFC;">$' + w.strike + ' <span style="color:#94A3B8;">' + formatGex(w['netGEX$'] || w.gex || 0) + '</span></div>';
      });
      callWallsEl.innerHTML = cHtml || '\\u2014';
    }
    if (putWallsEl) {
      var pHtml = '';
      putWalls.slice(0, 3).forEach(function(w) {
        pHtml += '<div style="font-family:JetBrains Mono,monospace;font-size:0.75rem;color:#F8FAFC;">$' + w.strike + ' <span style="color:#94A3B8;">' + formatGex(w['netGEX$'] || w.gex || 0) + '</span></div>';
      });
      putWallsEl.innerHTML = pHtml || '\\u2014';
    }

    var persistEl = document.getElementById('gv-persistence');
    if (persistEl) {
      var persist = intel.persistence || 0;
      var pHtml = '<div class="gv-persistence-bar">';
      for (var i = 0; i < 10; i++) {
        pHtml += '<div class="gv-p-seg' + (i < persist ? ' active' : '') + '"></div>';
      }
      pHtml += '</div>';
      persistEl.innerHTML = pHtml;
    }

    var flipIndEl = document.getElementById('gv-flip-indicator');
    if (flipIndEl) {
      flipIndEl.innerHTML = '<div style="font-size:0.7rem;color:#94A3B8;"><span style="color:#EF5350;">Above: Short \\u03B3</span><br><span style="color:#26A69A;">Below: Long \\u03B3</span></div>';
    }
  }

  function renderAxisLabels() {
    var profile = state.heatmap ? state.heatmap.profile : [];
    var leftY = document.getElementById('gv-yaxis-left');
    var rightY = document.getElementById('gv-yaxis-right');
    var leftX = document.getElementById('gv-xaxis-left');
    var rightX = document.getElementById('gv-xaxis-right');

    if (profile && profile.length > 0) {
      var strikes = profile.map(function(s) { return s.strike; });
      var minS = Math.min.apply(null, strikes);
      var maxS = Math.max.apply(null, strikes);
      var labels = [];
      for (var i = 0; i < 5; i++) {
        var val = maxS - (i / 4) * (maxS - minS);
        labels.push('<span>' + val.toFixed(0) + '</span>');
      }
      var yHtml = labels.join('');
      if (leftY) leftY.innerHTML = yHtml;
      if (rightY) rightY.innerHTML = yHtml;
    }

    if (leftX) {
      leftX.innerHTML = '<span>-50</span><span>-25</span><span>0(\\u03B3)</span><span>+25</span><span>+50</span>';
    }
    if (rightX) {
      rightX.innerHTML = '<span>-$50B</span><span>-$25B</span><span>0(\\u03B3)</span><span>+$25B</span><span>+$50B</span>';
    }
  }

  function renderRegimeTimeline() {
    var bar = document.getElementById('gv-timeline-bar');
    var statsEl = document.getElementById('gv-timeline-stats');
    if (!bar || !state.timeline || !state.timeline.intervals || !state.timeline.intervals.length) {
      if (bar) bar.innerHTML = '<div style="color:#94A3B8;font-size:0.75rem;padding:4px;">No timeline data</div>';
      return;
    }

    var intervals = state.timeline.intervals;
    var segments = [];
    var current = { regime: intervals[0].regime, start: 0, count: 1 };

    for (var i = 1; i < intervals.length; i++) {
      if (intervals[i].regime === current.regime) {
        current.count++;
      } else {
        segments.push(current);
        current = { regime: intervals[i].regime, start: i, count: 1 };
      }
    }
    segments.push(current);

    var total = intervals.length;
    var longCount = 0;
    var shortCount = 0;
    var transitions = 0;

    var html = '';
    segments.forEach(function(seg, idx) {
      var left = (seg.start / total * 100).toFixed(2);
      var width = (seg.count / total * 100).toFixed(2);
      var isLong = seg.regime && seg.regime.toLowerCase().indexOf('long') !== -1;
      var cls = isLong ? 'gv-seg-long' : 'gv-seg-short';
      if (isLong) longCount += seg.count; else shortCount += seg.count;
      if (idx > 0) transitions++;

      html += '<div class="gv-seg ' + cls + '" style="left:' + left + '%;width:' + width + '%" data-seg="' + idx + '" title="' + seg.regime + ' (' + seg.count + ' intervals)"></div>';

      if (idx > 0) {
        html += '<div class="gv-seg-transition" style="left:' + left + '%"></div>';
      }
    });

    if (state.timelineIndex >= 0) {
      var pos = (state.timelineIndex / total * 100).toFixed(2);
      html += '<div class="gv-seg-cursor" style="left:' + pos + '%"></div>';
    }

    bar.innerHTML = html;

    // Wire segment click handlers
    var segEls = bar.querySelectorAll('.gv-seg');
    segEls.forEach(function(segEl) {
      segEl.addEventListener('click', function() {
        var segIdx = parseInt(segEl.getAttribute('data-seg'));
        var seg = segments[segIdx];
        if (!seg) return;
        var detail = document.getElementById('gv-timeline-detail');
        if (detail) {
          detail.style.display = 'block';
          detail.innerHTML = '<span style="color:#F8FAFC;font-family:JetBrains Mono,monospace;">' + seg.regime + '</span> &mdash; ' + seg.count + ' intervals starting at index ' + seg.start;
        }
      });
    });

    if (statsEl) {
      var longPct = (longCount / total * 100).toFixed(0);
      var shortPct = (shortCount / total * 100).toFixed(0);
      statsEl.innerHTML = '<span style="color:#26A69A;">+\\u03B3 ' + longPct + '%</span> <span style="color:#EF5350;">\\u2212\\u03B3 ' + shortPct + '%</span> <span style="color:#FFD700;">' + transitions + ' flips</span>';
    }
  }

  function load() {
    var h = headers();
    var opts = { credentials: 'include', headers: h };
    var t = state.ticker;
    Promise.all([
      fetch('/api/gex/heatmap/' + t, opts).then(function(r) { return r.json(); }),
      fetch('/api/gex/targets/' + t, opts).then(function(r) { return r.json(); }).catch(function() { return null; }),
      fetch('/api/gex/heatmap-intel/' + t, opts).then(function(r) { return r.json(); }).catch(function() { return null; }),
      fetch('/api/gex/timeline/' + t, opts).then(function(r) { return r.json(); }).catch(function() { return null; })
    ]).then(function(res) {
      state.heatmap = res[0];
      state.targets = res[1];
      state.intel = res[2];
      state.timeline = res[3];
      renderAll();
    }).catch(function(err) { console.error('[gex-visor] load error:', err); });
  }

  function startSSE() {
    if (state.sse) state.sse.close();
    var url = '/api/gex/heatmap/' + state.ticker + '/stream?interval=30';
    if (window.DASHBOARD_API_KEY) url += '&apiKey=' + encodeURIComponent(window.DASHBOARD_API_KEY);
    var es = new EventSource(url, { withCredentials: true });
    es.onmessage = function(e) {
      try {
        state.heatmap = JSON.parse(e.data);
        renderCharts();
        renderHeaderStats();
      } catch(err) {}
    };
    es.onerror = function() {};
    state.sse = es;
  }

  function renderAll() {
    renderCharts();
    renderHeaderStats();
    renderRegimeTimeline();
    renderStatsPanel();
    renderAxisLabels();
  }

  function setupInteractions() {
    ['gv-yaxis-left', 'gv-yaxis-right'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        state.yAxisScale = Math.max(0.2, Math.min(3.0, state.yAxisScale + delta));
        renderCharts(); renderAxisLabels();
      }, { passive: false });
      el.addEventListener('dblclick', function() {
        state.yAxisScale = 1.0; renderCharts(); renderAxisLabels();
      });
    });

    ['gv-xaxis-left', 'gv-xaxis-right'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        state.xAxisScale = Math.max(0.3, Math.min(3.0, state.xAxisScale + delta));
        renderCharts(); renderAxisLabels();
      }, { passive: false });
      el.addEventListener('dblclick', function() {
        state.xAxisScale = 1.0; renderCharts(); renderAxisLabels();
      });
    });

    ['gv-chart-left', 'gv-chart-right'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? 2 : -2;
        if (e.shiftKey) delta *= 5;
        state.panOffsetY += delta;
        renderCharts();
      }, { passive: false });
    });
  }

  function setupCrosshair() {
    ['gv-chart-left', 'gv-chart-right'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;

      el.addEventListener('mousemove', function(e) {
        var rect = el.getBoundingClientRect();
        var xPct = ((e.clientX - rect.left) / rect.width * 100);
        var yPct = ((e.clientY - rect.top) / rect.height * 100);

        var chartsEl = el.closest('.gv-charts');
        if (!chartsEl) return;
        var chartsRect = chartsEl.getBoundingClientRect();

        var ch = document.getElementById('gv-crosshair-h');
        var cv = document.getElementById('gv-crosshair-v');
        var tip = document.getElementById('gv-crosshair-tip');

        if (ch) { ch.style.display = 'block'; ch.style.top = (e.clientY - chartsRect.top) + 'px'; }
        if (cv) { cv.style.display = 'block'; cv.style.left = (e.clientX - chartsRect.left) + 'px'; }

        if (tip && state.heatmap && state.heatmap.profile && state.heatmap.profile.length) {
          var strikes = state.heatmap.profile.map(function(s) { return s.strike; });
          var minS = Math.min.apply(null, strikes);
          var maxS = Math.max.apply(null, strikes);
          var pricePct = 1.0 - (yPct / 100);
          var price = minS + pricePct * (maxS - minS);

          var gammaPct = (xPct / 100 - 0.5) * 2 * 25;
          var isAbs = id === 'gv-chart-right';
          var gammaLabel = isAbs ? gammaPct.toFixed(1) + 'B' : gammaPct.toFixed(1);

          tip.style.display = 'block';
          tip.style.left = (e.clientX - chartsRect.left + 12) + 'px';
          tip.style.top = (e.clientY - chartsRect.top - 24) + 'px';
          tip.textContent = '$' + price.toFixed(2) + '  |  ' + gammaLabel;
        }
      });

      el.addEventListener('mouseleave', function() {
        ['gv-crosshair-h', 'gv-crosshair-v', 'gv-crosshair-tip'].forEach(function(cid) {
          var cel = document.getElementById(cid);
          if (cel) cel.style.display = 'none';
        });
      });
    });
  }

  function handleKeyDown(e) {
    var page = document.getElementById('page-gex-visor');
    if (!page || !page.classList.contains('active')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
      case ' ':
        e.preventDefault();
        togglePlayback();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        stepTimeline(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        stepTimeline(1);
        break;
      case 'Home':
        e.preventDefault();
        jumpTimeline(0);
        break;
      case 'End':
        e.preventDefault();
        jumpTimeline(-1);
        break;
      case 'r': case 'R':
        resetView();
        break;
      case 'f': case 'F':
        toggleFullscreen();
        break;
      case '?':
        toggleHelp();
        break;
      case 'Escape':
        var help = document.getElementById('gv-help-overlay');
        if (help) help.style.display = 'none';
        break;
    }
  }

  function togglePlayback() {
    if (state.playing) {
      clearInterval(state.playTimer);
      state.playTimer = null;
      state.playing = false;
    } else {
      if (!state.timeline || !state.timeline.intervals || !state.timeline.intervals.length) return;
      state.playing = true;
      state.playTimer = setInterval(function() {
        stepTimeline(1);
        if (state.timelineIndex >= state.timeline.intervals.length - 1) {
          togglePlayback();
        }
      }, state.playSpeed);
    }
    updatePlayButton();
  }

  function stepTimeline(dir) {
    if (!state.timeline || !state.timeline.intervals) return;
    var max = state.timeline.intervals.length - 1;
    state.timelineIndex = Math.max(0, Math.min(max, state.timelineIndex + dir));
    applyTimelineFrame();
  }

  function jumpTimeline(idx) {
    if (!state.timeline || !state.timeline.intervals) return;
    state.timelineIndex = idx < 0 ? state.timeline.intervals.length - 1 : idx;
    applyTimelineFrame();
  }

  function applyTimelineFrame() {
    if (!state.timeline || !state.timeline.intervals) return;
    var frame = state.timeline.intervals[state.timelineIndex];
    if (!frame) return;
    var el = document.getElementById('gv-spot-label');
    if (el && frame.spot) el.textContent = 'SPOT $' + frame.spot.toFixed(2);
    renderRegimeTimeline();
  }

  function updatePlayButton() {
    var btn = document.getElementById('gv-pb-play');
    if (!btn) return;
    btn.innerHTML = state.playing
      ? '<i data-lucide="pause" style="width:14px;height:14px;"></i>'
      : '<i data-lucide="play" style="width:14px;height:14px;"></i>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function resetView() {
    state.yAxisScale = 1.0;
    state.xAxisScale = 1.0;
    state.panOffsetY = 0;
    renderCharts(); renderAxisLabels();
  }

  function toggleFullscreen() {
    var page = document.getElementById('page-gex-visor');
    if (!page) return;
    if (!document.fullscreenElement) {
      page.requestFullscreen().catch(function() {});
    } else {
      document.exitFullscreen();
    }
  }

  function toggleHelp() {
    var el = document.getElementById('gv-help-overlay');
    if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
  }

  function setupModeToggle() {
    var btns = document.querySelectorAll('#page-gex-visor .gv-mode-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.mode = btn.getAttribute('data-mode');
        var simControls = document.getElementById('gv-sim-controls');
        if (simControls) simControls.style.display = state.mode === 'sim' ? 'flex' : 'none';
        renderCharts();
      });
    });
  }

  function setupSimSliders() {
    var priceSlider = document.getElementById('gv-sim-price');
    var tiltSlider = document.getElementById('gv-sim-tilt');
    var oiSlider = document.getElementById('gv-sim-oi');

    if (priceSlider) priceSlider.addEventListener('input', function() {
      state.simPrice = parseFloat(this.value);
      var valEl = document.getElementById('gv-sim-price-val');
      if (valEl) valEl.textContent = state.simPrice;
      renderCharts();
    });
    if (tiltSlider) tiltSlider.addEventListener('input', function() {
      state.simTilt = parseFloat(this.value);
      var valEl = document.getElementById('gv-sim-tilt-val');
      if (valEl) valEl.textContent = state.simTilt.toFixed(2);
      renderCharts();
    });
    if (oiSlider) oiSlider.addEventListener('input', function() {
      state.simOI = parseFloat(this.value);
      var valEl = document.getElementById('gv-sim-oi-val');
      if (valEl) valEl.textContent = state.simOI.toFixed(1);
      renderCharts();
    });
  }

  function setupPlaybackButtons() {
    var handlers = {
      'gv-pb-start': function() { jumpTimeline(0); },
      'gv-pb-prev': function() { stepTimeline(-1); },
      'gv-pb-play': function() { togglePlayback(); },
      'gv-pb-next': function() { stepTimeline(1); },
      'gv-pb-end': function() { jumpTimeline(-1); },
      'gv-reset-btn': function() { resetView(); },
      'gv-fs-btn': function() { toggleFullscreen(); },
      'gv-help-btn': function() { toggleHelp(); },
      'gv-help-close-btn': function() { var el = document.getElementById('gv-help-overlay'); if (el) el.style.display = 'none'; }
    };
    Object.keys(handlers).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', handlers[id]);
    });
  }

  function init() {
    load();
    startSSE();
    setupInteractions();
    setupCrosshair();
    setupModeToggle();
    setupSimSliders();
    setupPlaybackButtons();
    state.keyHandler = handleKeyDown;
    document.addEventListener('keydown', state.keyHandler);

    var tickerEl = document.getElementById('gv-ticker');
    if (tickerEl) {
      tickerEl.value = state.ticker;
      tickerEl.addEventListener('change', function() {
        state.ticker = this.value;
        load();
        startSSE();
      });
    }

    var speedEl = document.getElementById('gv-speed');
    if (speedEl) speedEl.addEventListener('change', function() {
      state.playSpeed = parseInt(this.value);
      if (state.playing) { togglePlayback(); togglePlayback(); }
    });

    state.refreshInterval = setInterval(function() {
      var opts = { credentials: 'include', headers: headers() };
      fetch('/api/gex/heatmap-intel/' + state.ticker, opts)
        .then(function(r) { return r.json(); })
        .then(function(d) { state.intel = d; renderStatsPanel(); })
        .catch(function() {});
    }, 10000);

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function destroy() {
    if (state.sse) { state.sse.close(); state.sse = null; }
    if (state.playTimer) { clearInterval(state.playTimer); state.playTimer = null; }
    if (state.refreshInterval) { clearInterval(state.refreshInterval); state.refreshInterval = null; }
    if (state.keyHandler) { document.removeEventListener('keydown', state.keyHandler); state.keyHandler = null; }
    state.playing = false;
    state.heatmap = null;
    state.targets = null;
    state.intel = null;
    state.timeline = null;
    state.yAxisScale = 1.0;
    state.xAxisScale = 1.0;
    state.panOffsetY = 0;
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getGexVisorPageCSS, getGexVisorPageHTML, getGexVisorPageJS };
