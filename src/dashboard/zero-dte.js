'use strict';

function getPageCSS() {
  return `
/* ── 0DTE Dealer Pressure — Full-Bleed Gravity HUD ── */
#page-0dte { flex-direction: column; height: 100%; overflow: hidden; font-family: var(--font-body); }
#page-0dte.active { display: flex; }

@media (prefers-reduced-motion: reduce) {
  #page-0dte * { animation: none !important; transition-duration: 0s !important; }
}

/* ── Keyframes ── */
@keyframes dp-breathe {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes dp-scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(200vh); }
}
@keyframes dp-crosshair-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
@keyframes dp-flash-in {
  0% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes dp-bar-fill { from { width: 0; } }
@keyframes dp-glow-pulse {
  0%, 100% { box-shadow: 0 0 8px var(--dp-glow-color, rgba(251,191,36,0.2)); }
  50% { box-shadow: 0 0 20px var(--dp-glow-color, rgba(251,191,36,0.4)); }
}
@keyframes dp-dot-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes dp-price-tick {
  0% { color: #fbbf24; }
  100% { color: inherit; }
}

/* ── HUD Color System — amber/cyan, NOT green/red ── */
#page-0dte {
  --dp-amber: #fbbf24;
  --dp-amber-dim: rgba(251,191,36,0.15);
  --dp-cyan: #22d3ee;
  --dp-cyan-dim: rgba(34,211,238,0.15);
  --dp-buy: #4ade80;
  --dp-sell: #f87171;
  --dp-buy-rgb: 74,222,128;
  --dp-sell-rgb: 248,113,113;
  --dp-glass: rgba(15,23,42,0.75);
  --dp-glass-border: rgba(251,191,36,0.12);
}

/* ── Command Bar (top) ── */
#page-0dte .dp-cmd {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 16px; flex-shrink: 0;
  background: rgba(15,23,42,0.95);
  border-bottom: 1px solid rgba(251,191,36,0.08);
}
#page-0dte .dp-cmd-ticker {
  font-family: 'JetBrains Mono', var(--font-mono); font-size: 15px; font-weight: 700;
  width: 60px; padding: 4px 6px; border-radius: 2px;
  border: 1px solid rgba(251,191,36,0.2); background: rgba(0,0,0,0.4);
  color: var(--dp-amber); text-transform: uppercase; text-align: center;
  outline: none; min-height: 32px;
}
#page-0dte .dp-cmd-ticker:focus { border-color: var(--dp-amber); box-shadow: 0 0 8px rgba(251,191,36,0.2); }
#page-0dte .dp-cmd-go {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 6px 10px; border-radius: 2px; border: 1px solid rgba(251,191,36,0.3);
  background: rgba(251,191,36,0.1); color: var(--dp-amber); cursor: pointer;
  min-height: 32px; letter-spacing: 1px; transition: all 0.15s;
}
#page-0dte .dp-cmd-go:hover { background: rgba(251,191,36,0.2); }
#page-0dte .dp-cmd-spot {
  font-family: 'JetBrains Mono', var(--font-mono); font-size: 20px; font-weight: 700;
  color: #f8fafc; letter-spacing: 0.5px; margin-left: 4px;
  transition: color 0.3s;
}
#page-0dte .dp-cmd-spot.tick { animation: dp-price-tick 0.5s ease; }
#page-0dte .dp-cmd-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
  animation: dp-dot-blink 2s ease-in-out infinite; flex-shrink: 0;
}
#page-0dte .dp-cmd-clock {
  font-family: var(--font-mono); font-size: 13px; font-weight: 700;
  color: var(--dp-amber); letter-spacing: 1px; margin-left: auto;
}
#page-0dte .dp-cmd-clock.urgent { color: #ef4444; }
#page-0dte .dp-cmd-conf {
  font-family: var(--font-mono); font-size: 10px; color: rgba(251,191,36,0.5);
  letter-spacing: 0.5px;
}

/* ── Flash / Banner strip ── */
#page-0dte .dp-alerts {
  background: rgba(0,0,0,0.6); flex-shrink: 0;
}
#page-0dte .dp-alert {
  padding: 5px 16px; font-family: var(--font-mono); font-size: 11px;
  font-weight: 600; display: flex; align-items: center; gap: 6px;
  animation: dp-flash-in 0.3s ease;
}
#page-0dte .dp-alert.flip { color: var(--dp-cyan); border-left: 2px solid var(--dp-cyan); }
#page-0dte .dp-alert.regime { color: var(--dp-amber); border-left: 2px solid var(--dp-amber); }
#page-0dte .dp-alert.warn { color: #eab308; border-left: 2px solid #eab308; }
#page-0dte .dp-alert.err { color: #ef4444; border-left: 2px solid #ef4444; }

/* ── THE MAP — full bleed, the page IS this ── */
#page-0dte .dp-map {
  flex: 1; overflow: hidden; position: relative;
  background: radial-gradient(ellipse at 50% 40%, rgba(15,23,42,1) 0%, rgba(2,6,23,1) 100%);
}

/* Scan line effect */
#page-0dte .dp-map::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.06) 20%, rgba(251,191,36,0.12) 50%, rgba(251,191,36,0.06) 80%, transparent 100%);
  animation: dp-scan 8s linear infinite; pointer-events: none; z-index: 5;
}

/* ── HUD Overlays — floating glass panels ── */
#page-0dte .dp-hud {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none; z-index: 10;
}
#page-0dte .dp-hud > * { pointer-events: auto; }

/* Verdict overlay — top left */
#page-0dte .dp-verdict {
  position: absolute; top: 12px; left: 16px;
  max-width: 400px;
}
#page-0dte .dp-verdict-signal {
  font-family: 'Barlow Condensed', var(--font-heading); font-size: 48px; font-weight: 800;
  line-height: 0.85; letter-spacing: 4px; text-transform: uppercase;
}
#page-0dte .dp-verdict-signal.buy { color: var(--dp-buy); text-shadow: 0 0 30px rgba(var(--dp-buy-rgb),0.3); }
#page-0dte .dp-verdict-signal.sell { color: var(--dp-sell); text-shadow: 0 0 30px rgba(var(--dp-sell-rgb),0.3); }
#page-0dte .dp-verdict-signal.neutral { color: rgba(248,250,252,0.4); }
#page-0dte .dp-verdict-flow {
  font-family: var(--font-mono); font-size: 13px; font-weight: 600;
  margin-top: 4px; color: rgba(248,250,252,0.7);
}
#page-0dte .dp-verdict-regime {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  margin-top: 2px; letter-spacing: 1px; text-transform: uppercase;
}
#page-0dte .dp-verdict-regime.squeeze { color: #f97316; }
#page-0dte .dp-verdict-regime.cascade { color: #ef4444; }
#page-0dte .dp-verdict-regime.decayDrift { color: rgba(248,250,252,0.3); }
#page-0dte .dp-verdict-regime.stabilizing { color: var(--dp-buy); }
#page-0dte .dp-verdict-regime.unstable { color: #eab308; }

/* Billy AI overlay — bottom left */
#page-0dte .dp-billy {
  position: absolute; bottom: 12px; left: 16px;
  max-width: 380px; padding: 10px 14px;
  background: var(--dp-glass); border: 1px solid var(--dp-glass-border);
  border-radius: 3px; backdrop-filter: blur(12px);
}
#page-0dte .dp-billy-head {
  display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
}
#page-0dte .dp-billy-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--dp-cyan);
  animation: dp-dot-blink 1.5s ease-in-out infinite;
}
#page-0dte .dp-billy-label {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  color: var(--dp-cyan); text-transform: uppercase; letter-spacing: 1.5px;
}
#page-0dte .dp-billy-text {
  font-family: var(--font-body); font-size: 13px; color: rgba(248,250,252,0.85);
  line-height: 1.45;
}
#page-0dte .dp-billy-loading {
  font-family: var(--font-mono); font-size: 10px; color: rgba(248,250,252,0.3);
  animation: dp-breathe 1.5s ease-in-out infinite;
}

/* Metrics overlay — top right */
#page-0dte .dp-metrics {
  position: absolute; top: 12px; right: 16px;
  display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
}
#page-0dte .dp-metric {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  background: var(--dp-glass); border: 1px solid var(--dp-glass-border);
  border-radius: 2px; backdrop-filter: blur(8px);
  font-family: var(--font-mono); font-size: 11px;
}
#page-0dte .dp-metric-label { color: rgba(248,250,252,0.4); font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
#page-0dte .dp-metric-val { font-weight: 700; }
#page-0dte .dp-metric-val.buy { color: var(--dp-buy); }
#page-0dte .dp-metric-val.sell { color: var(--dp-sell); }
#page-0dte .dp-metric-val.high { color: #ef4444; }
#page-0dte .dp-metric-val.moderate { color: #eab308; }
#page-0dte .dp-metric-val.low { color: var(--dp-buy); }
#page-0dte .dp-metric-bar {
  width: 40px; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;
}
#page-0dte .dp-metric-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
#page-0dte .dp-metric-bar-fill.gamma { background: #fbbf24; }
#page-0dte .dp-metric-bar-fill.charm { background: #f97316; }
#page-0dte .dp-metric-bar-fill.vanna { background: #a855f7; }

/* ── Gravity Grid (the actual strike visualization) ── */
#page-0dte .dp-gravity {
  position: absolute; top: 0; bottom: 0; left: 0; right: 0;
  overflow-y: auto; overflow-x: hidden;
  padding: 80px 60px 80px 60px; /* space for overlays */
}

/* Gravity zone labels */
#page-0dte .dp-zone-label-inline {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 0 2px;
  color: rgba(251,191,36,0.3);
}
#page-0dte .dp-zone-label-inline.buy { color: rgba(var(--dp-buy-rgb),0.3); }
#page-0dte .dp-zone-label-inline.sell { color: rgba(var(--dp-sell-rgb),0.3); }

/* Strike rows */
#page-0dte .dp-row {
  display: flex; align-items: center; gap: 6px; padding: 3px 0;
  border-bottom: 1px solid rgba(255,255,255,0.015);
  cursor: pointer; transition: background 0.15s ease;
  position: relative;
}
#page-0dte .dp-row:hover { background: rgba(251,191,36,0.03); }

/* Key level annotations */
#page-0dte .dp-row.lv-sup {
  border-left: 2px solid rgba(var(--dp-buy-rgb),0.5);
  background: rgba(var(--dp-buy-rgb),0.03);
}
#page-0dte .dp-row.lv-res {
  border-left: 2px solid rgba(var(--dp-sell-rgb),0.5);
  background: rgba(var(--dp-sell-rgb),0.03);
}
#page-0dte .dp-row.lv-flip {
  border-left: 2px solid rgba(251,191,36,0.5);
  background: rgba(251,191,36,0.03);
}
#page-0dte .dp-tag {
  font-family: var(--font-mono); font-size: 7px; font-weight: 800;
  letter-spacing: 0.5px; padding: 1px 3px; border-radius: 1px; flex-shrink: 0;
}
#page-0dte .dp-tag.sup { color: var(--dp-buy); background: rgba(var(--dp-buy-rgb),0.12); }
#page-0dte .dp-tag.res { color: var(--dp-sell); background: rgba(var(--dp-sell-rgb),0.12); }
#page-0dte .dp-tag.flip { color: var(--dp-amber); background: var(--dp-amber-dim); }

#page-0dte .dp-strike {
  font-family: 'JetBrains Mono', var(--font-mono); font-size: 12px;
  color: rgba(248,250,252,0.5); width: 52px; text-align: right; flex-shrink: 0;
}
#page-0dte .dp-strike.spot { color: var(--dp-amber); font-weight: 700; }

#page-0dte .dp-bar-wrap {
  flex: 1; display: flex; align-items: center; height: 20px; position: relative;
}
#page-0dte .dp-bar-mid {
  position: absolute; left: 50%; width: 1px; height: 100%;
  background: rgba(251,191,36,0.06);
}
#page-0dte .dp-bar {
  position: absolute; top: 1px; height: 18px;
  transition: width 0.4s ease; min-width: 1px; border-radius: 1px;
}
#page-0dte .dp-bar.sell-bar { right: 50%; background: rgba(var(--dp-sell-rgb),var(--bar-o,0.4)); border-radius: 1px 0 0 1px; }
#page-0dte .dp-bar.buy-bar { left: 50%; background: rgba(var(--dp-buy-rgb),var(--bar-o,0.4)); border-radius: 0 1px 1px 0; }
#page-0dte .dp-bar.hot { filter: brightness(1.3); }

#page-0dte .dp-psi {
  font-family: var(--font-mono); font-size: 9px; color: rgba(248,250,252,0.3);
  width: 55px; flex-shrink: 0; text-align: left;
}
#page-0dte .dp-warn-pip {
  width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent;
  border-bottom: 5px solid var(--dp-amber); flex-shrink: 0;
}

/* SPOT crosshair row */
#page-0dte .dp-spot-row {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 0; margin: 4px 0; position: relative;
}
#page-0dte .dp-spot-row::before {
  content: ''; position: absolute; left: 0; right: 0; top: 50%;
  height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.3) 10%, rgba(251,191,36,0.3) 90%, transparent);
}
#page-0dte .dp-spot-row::after {
  content: ''; position: absolute; left: 0; right: 0; top: 50%;
  height: 1px; background: rgba(251,191,36,0.1);
  animation: dp-crosshair-pulse 2s ease-in-out infinite;
}
#page-0dte .dp-spot-label {
  font-family: 'JetBrains Mono', var(--font-mono); font-size: 14px; font-weight: 800;
  color: var(--dp-amber); position: relative; z-index: 2;
  text-shadow: 0 0 10px rgba(251,191,36,0.4);
  padding: 2px 10px; background: rgba(2,6,23,0.8);
  border: 1px solid rgba(251,191,36,0.2); border-radius: 2px;
}

/* Drill-down panel */
#page-0dte .dp-drill {
  padding: 4px 12px 4px 58px; font-family: var(--font-mono); font-size: 10px;
  background: rgba(251,191,36,0.02); border-bottom: 1px solid rgba(251,191,36,0.04);
  animation: dp-flash-in 0.15s ease;
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px 12px;
}
#page-0dte .dp-drill-k { color: rgba(248,250,252,0.3); }
#page-0dte .dp-drill-v { text-align: right; }
#page-0dte .dp-drill-v.pos { color: var(--dp-buy); }
#page-0dte .dp-drill-v.neg { color: var(--dp-sell); }
#page-0dte .dp-drill-v.warn { color: var(--dp-amber); }
#page-0dte .dp-drill-cert {
  height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px;
  overflow: hidden; margin-top: 2px;
}
#page-0dte .dp-drill-cert-fill { height: 100%; border-radius: 2px; background: var(--dp-cyan); }

/* Pressure gauge — bottom right */
#page-0dte .dp-gauge {
  position: absolute; bottom: 12px; right: 16px;
  display: flex; flex-direction: column; gap: 4px; align-items: flex-end;
}
#page-0dte .dp-gauge-row {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 10px;
}
#page-0dte .dp-gauge-label { color: rgba(248,250,252,0.3); width: 30px; text-align: right; }
#page-0dte .dp-gauge-track {
  width: 60px; height: 4px; background: rgba(255,255,255,0.04);
  border-radius: 2px; overflow: hidden;
}
#page-0dte .dp-gauge-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
#page-0dte .dp-gauge-fill.buy { background: linear-gradient(90deg, rgba(var(--dp-buy-rgb),0.3), rgba(var(--dp-buy-rgb),0.8)); }
#page-0dte .dp-gauge-fill.sell { background: linear-gradient(90deg, rgba(var(--dp-sell-rgb),0.3), rgba(var(--dp-sell-rgb),0.8)); }
#page-0dte .dp-gauge-val {
  font-weight: 700; width: 55px; text-align: right; color: rgba(248,250,252,0.5);
}

/* Loading state */
#page-0dte .dp-loading-msg {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: var(--font-mono); font-size: 12px; color: rgba(251,191,36,0.4);
  animation: dp-breathe 1.5s ease-in-out infinite;
}

/* ── Mobile: stacked flow layout, no overlays ── */
@media (max-width: 768px) {
  /* Map becomes a flex column — no position:relative needed */
  #page-0dte .dp-map {
    display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden;
  }
  #page-0dte .dp-map::after { display: none; } /* kill scanline on mobile */

  /* HUD becomes inline flow, not absolute overlay */
  #page-0dte .dp-hud {
    position: static !important; display: flex !important;
    flex-direction: column; pointer-events: auto;
    order: 1; flex-shrink: 0;
  }
  #page-0dte .dp-hud > * { pointer-events: auto; }

  /* Verdict — inline at top */
  #page-0dte .dp-verdict {
    position: static; max-width: none;
    padding: 12px 16px; order: 1;
    border-bottom: 1px solid rgba(251,191,36,0.06);
  }
  #page-0dte .dp-verdict-signal { font-size: 32px; letter-spacing: 2px; }
  #page-0dte .dp-verdict-flow { font-size: 12px; }
  #page-0dte .dp-verdict-regime { font-size: 10px; }

  /* Metrics row — horizontal strip below verdict */
  #page-0dte .dp-metrics {
    position: static; flex-direction: row; align-items: center;
    gap: 4px; order: 2; padding: 6px 16px; flex-wrap: wrap;
    justify-content: flex-start;
    border-bottom: 1px solid rgba(251,191,36,0.06);
  }
  #page-0dte .dp-metric { padding: 2px 6px; font-size: 10px; }

  /* Gravity grid — scrollable main content */
  #page-0dte .dp-gravity {
    position: static !important;
    padding: 8px 10px !important;
    overflow-y: visible; order: 3;
    flex: none;
  }

  /* Billy AI — below gravity */
  #page-0dte .dp-billy {
    position: static; max-width: none;
    margin: 0 12px; order: 4;
    border-radius: 3px;
  }
  #page-0dte .dp-billy-text { font-size: 12px; }

  /* Pressure gauge — below Billy */
  #page-0dte .dp-gauge {
    position: static; align-items: stretch;
    padding: 8px 16px; order: 5;
    flex-direction: column; gap: 4px;
  }
  #page-0dte .dp-gauge-row { justify-content: flex-start; }
  #page-0dte .dp-gauge-track { width: 80px; }

  /* Command bar wrapping */
  #page-0dte .dp-cmd { flex-wrap: wrap; gap: 6px; padding: 6px 10px; }
  #page-0dte .dp-cmd-spot { font-size: 16px; }
  #page-0dte .dp-cmd-ticker { width: 50px; font-size: 13px; padding: 3px 4px; min-height: 28px; }
  #page-0dte .dp-cmd-go { padding: 4px 8px; font-size: 10px; min-height: 28px; }
  #page-0dte .dp-cmd-clock { font-size: 11px; }

  /* Gravity grid elements */
  #page-0dte .dp-spot-label { font-size: 12px; padding: 2px 6px; }
  #page-0dte .dp-strike { font-size: 11px; width: 44px; }
  #page-0dte .dp-psi { font-size: 8px; width: 42px; }
  #page-0dte .dp-tag { font-size: 6px; padding: 1px 2px; }
  #page-0dte .dp-drill { padding: 4px 8px 4px 50px; font-size: 9px; grid-template-columns: 1fr 1fr; }

  /* Loading centered */
  #page-0dte .dp-loading-msg { position: static; transform: none; text-align: center; padding: 40px 0; }
}
`;
}

function getPageHTML() {
  return `
<div id="page-0dte" class="page">

<!-- Command Bar -->
<div class="dp-cmd">
  <input class="dp-cmd-ticker" id="dp-ticker" value="QQQ" maxlength="5" spellcheck="false" aria-label="Ticker symbol">
  <button class="dp-cmd-go" id="dp-go">GO</button>
  <span class="dp-cmd-dot" id="dp-dot"></span>
  <span class="dp-cmd-spot" id="dp-spot">--</span>
  <span class="dp-cmd-conf" id="dp-conf"></span>
  <span class="dp-cmd-clock" id="dp-clock">--:--:--</span>
</div>

<!-- Alerts -->
<div class="dp-alerts" id="dp-alerts"></div>

<!-- THE MAP — everything lives here -->
<div class="dp-map" id="dp-map">
  <div class="dp-loading-msg" id="dp-loading">LOADING DEALER PRESSURE...</div>

  <!-- Gravity Grid (strikes) -->
  <div class="dp-gravity" id="dp-gravity" style="display:none"></div>

  <!-- HUD Overlays -->
  <div class="dp-hud" id="dp-hud" style="display:none">
    <!-- Verdict — top left -->
    <div class="dp-verdict" id="dp-verdict">
      <div class="dp-verdict-signal" id="dp-v-signal">--</div>
      <div class="dp-verdict-flow" id="dp-v-flow">--</div>
      <div class="dp-verdict-regime" id="dp-v-regime">--</div>
    </div>

    <!-- Billy AI — bottom left -->
    <div class="dp-billy" id="dp-billy">
      <div class="dp-billy-head">
        <div class="dp-billy-dot"></div>
        <span class="dp-billy-label">Billy</span>
      </div>
      <div id="dp-billy-text" class="dp-billy-loading">analyzing...</div>
    </div>

    <!-- Metrics — top right -->
    <div class="dp-metrics" id="dp-metrics"></div>

    <!-- Pressure gauge — bottom right -->
    <div class="dp-gauge" id="dp-gauge"></div>
  </div>
</div>

</div>
`;
}

function getPageJS() {
  return `
(function() {
  'use strict';
  var ticker = 'QQQ';
  var fetchInterval = null;
  var clockInterval = null;
  var aiInterval = null;
  var REFRESH_MS = 10000;
  var prevData = null;
  var keyLevels = { buy: [], sell: [], flip: null };
  var expandedStrike = null;
  var liveSpot = null;
  var pressureHistory = [];

  function fmtUSD(val) {
    var abs = Math.abs(val);
    if (abs >= 1e9) return (val < 0 ? '-' : '+') + '$' + (abs / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return (val < 0 ? '-' : '+') + '$' + (abs / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (val < 0 ? '-' : '+') + '$' + (abs / 1e3).toFixed(0) + 'K';
    return (val < 0 ? '-' : '+') + '$' + abs.toFixed(0);
  }
  function fmtK(val) {
    var abs = Math.abs(val);
    if (abs >= 1e6) return (val < 0 ? '-' : '') + (abs / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (val < 0 ? '-' : '') + (abs / 1e3).toFixed(0) + 'K';
    return val.toFixed(0);
  }
  function fmtStrike(s) { return Number(s).toFixed(0); }

  var REGIME_DISPLAY = {
    squeeze: 'DEALER SQUEEZE',
    cascade: 'HEDGE CASCADE',
    decayDrift: 'DECAY DRIFT',
    stabilizing: 'STABILIZING',
    unstable: 'UNSTABLE',
  };

  function getBiasPhrase(dir, regime, total) {
    var size = Math.abs(total);
    var adv = size > 5e6 ? 'aggressively' : size > 1e6 ? 'steadily' : 'lightly';
    if (dir === 'NEUTRAL') return 'Neutral dealer flow';
    var verb = dir === 'BUY' ? 'buying' : 'selling';
    return 'Dealers ' + adv + ' ' + verb + ' ' + fmtUSD(Math.abs(total)).replace(/^[+-]/, '');
  }

  // ── Clock ──
  function startClock() {
    function tick() {
      var el = document.getElementById('dp-clock');
      if (!el) return;
      var et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      var close = new Date(et); close.setHours(16, 0, 0, 0);
      var diff = close - et;
      if (diff <= 0) { el.textContent = 'CLOSED'; el.classList.add('urgent'); return; }
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      el.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      if (diff < 900000) el.classList.add('urgent'); else el.classList.remove('urgent');
    }
    tick();
    clockInterval = setInterval(tick, 1000);
  }

  // ── Flash Events ──
  var changeLog = [];
  function checkFlash(data) {
    if (!prevData) return [];
    var evts = [];
    var pd = prevData.aggregate || {};
    var cd = data.aggregate || {};
    if (pd.netDirection && cd.netDirection && pd.netDirection !== cd.netDirection)
      evts.push({ cls: 'flip', text: 'FLIP ' + pd.netDirection + ' \\u2192 ' + cd.netDirection });
    var pr = prevData.regime ? prevData.regime.regime : '';
    var cr = data.regime ? data.regime.regime : '';
    if (pr && cr && pr !== cr)
      evts.push({ cls: 'regime', text: 'REGIME \\u2192 ' + (REGIME_DISPLAY[cr] || cr) });
    return evts;
  }
  function showAlerts(data) {
    var area = document.getElementById('dp-alerts');
    if (!area) return;
    var html = '';
    var flashes = checkFlash(data);
    flashes.forEach(function(f) { html += '<div class="dp-alert ' + f.cls + '">\\u26A1 ' + f.text + '</div>'; });
    if (data.confidence && data.confidence.label === 'LOW')
      html += '<div class="dp-alert warn">LOW CONFIDENCE</div>';
    if (data.confidence && data.confidence.label === 'INSUFFICIENT')
      html += '<div class="dp-alert err">INSUFFICIENT DATA</div>';
    if (data.error)
      html += '<div class="dp-alert err">' + data.error + '</div>';
    area.innerHTML = html;
    if (flashes.length) setTimeout(function() {
      flashes.forEach(function() { if (area.firstChild) area.removeChild(area.firstChild); });
    }, 8000);
  }

  // ── Render strike row ──
  function renderRow(s, spotStrike, maxP, gOpacity) {
    var p = s.netPressure_usd;
    var wp = Math.abs(p) * (s.impactWeight || 1);
    var widthPct = Math.min(wp / maxP * 48, 48);
    var cert = s.sign ? s.sign.signCertainty : 0.5;
    var isBuy = p > 0;
    var barO = Math.max(0.15, cert * gOpacity).toFixed(2);

    var keyClass = '';
    var tag = '';
    var sn = Number(s.strike);
    if (keyLevels.flip && sn === Number(keyLevels.flip)) { keyClass = ' lv-flip'; tag = '<span class="dp-tag flip">FLIP</span>'; }
    else if (keyLevels.buy.indexOf(sn) !== -1) { keyClass = ' lv-sup'; tag = '<span class="dp-tag sup">SUP</span>'; }
    else if (keyLevels.sell.indexOf(sn) !== -1) { keyClass = ' lv-res'; tag = '<span class="dp-tag res">RES</span>'; }

    var isSpot = s.strike === spotStrike;
    var hot = wp > maxP * 0.5;
    var warn = s.instability && s.instability.speed > 0.7;

    var h = '<div class="dp-row' + keyClass + '" data-strike="' + s.strike + '">';
    h += '<span class="dp-strike' + (isSpot ? ' spot' : '') + '">' + fmtStrike(s.strike) + '</span>';
    if (tag) h += tag;
    h += '<div class="dp-bar-wrap"><div class="dp-bar-mid"></div>';
    h += '<div class="dp-bar ' + (isBuy ? 'buy-bar' : 'sell-bar') + (hot ? ' hot' : '') + '" style="width:' + widthPct + '%;--bar-o:' + barO + '"></div></div>';
    if (warn) h += '<div class="dp-warn-pip" title="High acceleration"></div>';
    h += '<span class="dp-psi">' + fmtK(p) + '</span>';
    h += '</div>';

    if (expandedStrike === s.strike) {
      h += drillHTML(s);
    }
    return h;
  }

  function drillHTML(s) {
    var c = s.components || {};
    var sign = s.sign || {};
    var inst = s.instability || {};
    var gf = c.gamma_flow_usd || 0;
    var cf = c.charm_flow_usd || 0;
    var vf = c.vanna_flow_usd || 0;
    var cert = ((sign.signCertainty || 0) * 100).toFixed(0);
    var h = '<div class="dp-drill">';
    h += '<span class="dp-drill-k">\\u0393</span><span class="dp-drill-v ' + (gf > 0 ? 'pos' : 'neg') + '">' + fmtUSD(gf) + '</span>';
    h += '<span class="dp-drill-k">\\u0398</span><span class="dp-drill-v ' + (cf > 0 ? 'pos' : 'neg') + '">' + fmtUSD(cf) + '</span>';
    h += '<span class="dp-drill-k">\\u03BD</span><span class="dp-drill-v ' + (vf > 0 ? 'pos' : 'neg') + '">' + fmtUSD(vf) + '</span>';
    h += '<span class="dp-drill-k">cert</span><span class="dp-drill-v"><div class="dp-drill-cert"><div class="dp-drill-cert-fill" style="width:' + cert + '%"></div></div></span>';
    if (inst.speed !== undefined) {
      var lvl = inst.speed > 0.7 ? 'warn' : inst.speed > 0.3 ? '' : 'pos';
      h += '<span class="dp-drill-k">accel</span><span class="dp-drill-v ' + lvl + '">' + (inst.speed * 100).toFixed(0) + '%</span>';
    }
    h += '</div>';
    return h;
  }

  // ── Render Gravity Grid ──
  function renderGravity(data) {
    var el = document.getElementById('dp-gravity');
    if (!el) return;

    var all = data.strikes || [];
    if (!all.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(251,191,36,0.3);font-size:12px">No strike data</div>'; el.style.display = ''; return; }

    var spot = data.spot || 0;
    var near = all.filter(function(s) { return Math.abs(s.strike - spot) / spot < 0.03; });
    var top5 = all.slice().sort(function(a, b) { return (b.impactWeight || 0) - (a.impactWeight || 0); }).slice(0, 5);
    var set = {};
    near.forEach(function(s) { set[s.strike] = s; });
    top5.forEach(function(s) { set[s.strike] = s; });
    var strikes = Object.values(set).sort(function(a, b) { return a.strike - b.strike; });
    if (strikes.length > 30) strikes = strikes.slice(0, 30);

    var maxP = 1;
    for (var i = 0; i < strikes.length; i++) {
      var v = Math.abs(strikes[i].netPressure_usd) * (strikes[i].impactWeight || 1);
      if (v > maxP) maxP = v;
    }

    var gOp = Math.max(0.3, data.confidence ? data.confidence.confidence : 1);
    var spotStrike = null, minD = Infinity;
    for (var i = 0; i < strikes.length; i++) {
      var d = Math.abs(strikes[i].strike - spot);
      if (d < minD) { minD = d; spotStrike = strikes[i].strike; }
    }

    var above = strikes.filter(function(s) { return s.strike > spot; });
    var below = strikes.filter(function(s) { return s.strike <= spot; });

    var aP = above.reduce(function(sum, s) { return sum + (s.netPressure_usd || 0); }, 0);
    var bP = below.reduce(function(sum, s) { return sum + (s.netPressure_usd || 0); }, 0);

    var html = '';

    if (above.length) {
      var aLabel = aP < 0 ? 'SELL GRAVITY \\u2191' : 'BUY GRAVITY \\u2191';
      var aCls = aP < 0 ? 'sell' : 'buy';
      html += '<div class="dp-zone-label-inline ' + aCls + '">' + aLabel + '</div>';
      for (var i = above.length - 1; i >= 0; i--) {
        html += renderRow(above[i], spotStrike, maxP, gOp);
      }
    }

    html += '<div class="dp-spot-row"><span class="dp-spot-label" id="dp-spot-xhair">SPOT ' + spot.toFixed(2) + '</span></div>';

    if (below.length) {
      for (var i = below.length - 1; i >= 0; i--) {
        html += renderRow(below[i], spotStrike, maxP, gOp);
      }
      var bLabel = bP > 0 ? 'BUY GRAVITY \\u2193' : 'SELL GRAVITY \\u2193';
      var bCls = bP > 0 ? 'buy' : 'sell';
      html += '<div class="dp-zone-label-inline ' + bCls + '">' + bLabel + '</div>';
    }

    el.innerHTML = html;
    el.style.display = '';
    setupClicks();
  }

  // ── Render HUD overlays ──
  function renderHUD(data) {
    var hud = document.getElementById('dp-hud');
    if (hud) hud.style.display = '';

    var a = data.aggregate || {};
    var regime = data.regime ? data.regime.regime : 'unstable';
    var dir = a.netDirection || 'NEUTRAL';
    var total = a.totalPressure_usd || 0;

    // Verdict
    var sig = document.getElementById('dp-v-signal');
    if (sig) {
      sig.textContent = dir === 'NEUTRAL' ? 'NEUTRAL' : dir;
      sig.className = 'dp-verdict-signal ' + dir.toLowerCase();
    }
    var flow = document.getElementById('dp-v-flow');
    if (flow) flow.textContent = getBiasPhrase(dir, regime, total);
    var reg = document.getElementById('dp-v-regime');
    if (reg) {
      reg.textContent = REGIME_DISPLAY[regime] || regime;
      reg.className = 'dp-verdict-regime ' + regime;
    }

    // Spot
    var spotEl = document.getElementById('dp-spot');
    if (spotEl) {
      spotEl.textContent = '$' + (data.spot || 0).toFixed(2);
      spotEl.classList.add('tick');
      setTimeout(function() { spotEl.classList.remove('tick'); }, 500);
    }
    var confEl = document.getElementById('dp-conf');
    if (confEl && data.confidence) confEl.textContent = (data.confidence.confidence * 100).toFixed(0) + '% ' + data.confidence.label;

    // Metrics — drivers + instability
    var metricsEl = document.getElementById('dp-metrics');
    if (metricsEl) {
      var g = a.gammaComponent_pct || 0;
      var c = a.charmComponent_pct || 0;
      var v = a.vannaComponent_pct || 0;
      var inst = data.instability || {};
      var instScore = inst.instabilityScore || 0;
      var instLvl = instScore >= 0.7 ? 'high' : instScore >= 0.4 ? 'moderate' : 'low';

      var mh = '';
      mh += '<div class="dp-metric"><span class="dp-metric-label">\\u0393</span><div class="dp-metric-bar"><div class="dp-metric-bar-fill gamma" style="width:' + g + '%"></div></div><span class="dp-metric-val" style="color:#fbbf24">' + g + '%</span></div>';
      mh += '<div class="dp-metric"><span class="dp-metric-label">\\u0398</span><div class="dp-metric-bar"><div class="dp-metric-bar-fill charm" style="width:' + c + '%"></div></div><span class="dp-metric-val" style="color:#f97316">' + c + '%</span></div>';
      mh += '<div class="dp-metric"><span class="dp-metric-label">\\u03BD</span><div class="dp-metric-bar"><div class="dp-metric-bar-fill vanna" style="width:' + v + '%"></div></div><span class="dp-metric-val" style="color:#a855f7">' + v + '%</span></div>';
      mh += '<div class="dp-metric"><span class="dp-metric-label">INSTAB</span><span class="dp-metric-val ' + instLvl + '">' + instLvl.toUpperCase() + '</span></div>';
      metricsEl.innerHTML = mh;
    }

    // Pressure gauge
    var gaugeEl = document.getElementById('dp-gauge');
    if (gaugeEl) {
      var buyP = Math.abs(a.buyPressure_usd || (total > 0 ? total : 0));
      var sellP = Math.abs(a.sellPressure_usd || (total < 0 ? total : 0));
      var maxP = Math.max(buyP, sellP, 1);
      var gh = '';
      gh += '<div class="dp-gauge-row"><span class="dp-gauge-label" style="color:var(--dp-buy)">BUY</span><div class="dp-gauge-track"><div class="dp-gauge-fill buy" style="width:' + (buyP / maxP * 100).toFixed(1) + '%"></div></div><span class="dp-gauge-val">' + fmtUSD(buyP) + '</span></div>';
      gh += '<div class="dp-gauge-row"><span class="dp-gauge-label" style="color:var(--dp-sell)">SELL</span><div class="dp-gauge-track"><div class="dp-gauge-fill sell" style="width:' + (sellP / maxP * 100).toFixed(1) + '%"></div></div><span class="dp-gauge-val">' + fmtUSD(-sellP) + '</span></div>';
      gaugeEl.innerHTML = gh;
    }
  }

  // ── Main Render ──
  function render(data) {
    var loading = document.getElementById('dp-loading');
    if (loading) loading.style.display = 'none';

    var a = data.aggregate || {};
    keyLevels.buy = (a.topBuyStrikes || []).map(Number);
    keyLevels.sell = (a.topSellStrikes || []).map(Number);
    keyLevels.flip = a.flipStrike ? Number(a.flipStrike) : null;

    showAlerts(data);
    renderGravity(data);
    renderHUD(data);

    prevData = data;
  }

  // ── Click to drill down ──
  function setupClicks() {
    var el = document.getElementById('dp-gravity');
    if (!el) return;
    var rows = el.querySelectorAll('.dp-row');
    for (var i = 0; i < rows.length; i++) {
      (function(row) {
        row.addEventListener('click', function() {
          var st = Number(row.getAttribute('data-strike'));
          if (!st) return;
          expandedStrike = (expandedStrike === st) ? null : st;
          if (prevData) { renderGravity(prevData); }
        });
      })(rows[i]);
    }
  }

  // ── Billy AI ──
  function fetchAI() {
    var el = document.getElementById('dp-billy-text');
    if (!el) return;
    fetch('/api/dealer-pressure/' + ticker + '/prediction')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.prediction) { el.textContent = d.prediction; el.className = 'dp-billy-text'; }
      })
      .catch(function() { el.textContent = 'analyzing...'; el.className = 'dp-billy-loading'; });
  }

  // ── Live Spot ──
  function subSpot() {
    if (!SQ.socket) return;
    SQ.socket.emit('subscribe:dp', { ticker: ticker });
    SQ.socket.on('dp:spot', function(d) {
      if (d.ticker !== ticker) return;
      if (d.spot === liveSpot) return;
      liveSpot = d.spot;
      var el = document.getElementById('dp-spot');
      if (el) { el.textContent = '$' + d.spot.toFixed(2); el.classList.add('tick'); setTimeout(function() { el.classList.remove('tick'); }, 500); }
      var xh = document.getElementById('dp-spot-xhair');
      if (xh) xh.textContent = 'SPOT ' + d.spot.toFixed(2);
    });
  }
  function unsubSpot() {
    if (!SQ.socket) return;
    SQ.socket.emit('unsubscribe:dp', { ticker: ticker });
    SQ.socket.off('dp:spot');
  }

  // ── Fetch ──
  function fetchData() {
    fetch('/api/dealer-pressure/' + ticker)
      .then(function(r) { return r.json(); })
      .then(function(d) { if (d.error && !d.strikes) { showAlerts(d); return; } render(d); })
      .catch(function(e) { showAlerts({ error: 'Fetch failed: ' + e.message }); });
  }

  // ── Ticker switch ──
  function switchTicker(t) {
    t = t.toUpperCase().replace(/[^A-Z]/g, '');
    if (!t || t === ticker) return;
    unsubSpot();
    ticker = t;
    prevData = null; expandedStrike = null; liveSpot = null;
    keyLevels = { buy: [], sell: [], flip: null };
    var input = document.getElementById('dp-ticker'); if (input) input.value = ticker;
    var loading = document.getElementById('dp-loading'); if (loading) { loading.style.display = ''; loading.textContent = 'LOADING ' + ticker + '...'; }
    var gravity = document.getElementById('dp-gravity'); if (gravity) gravity.style.display = 'none';
    var hud = document.getElementById('dp-hud'); if (hud) hud.style.display = 'none';
    var alerts = document.getElementById('dp-alerts'); if (alerts) alerts.innerHTML = '';
    var billy = document.getElementById('dp-billy-text'); if (billy) { billy.textContent = 'analyzing ' + ticker + '...'; billy.className = 'dp-billy-loading'; }
    fetchData();
    fetchAI();
    subSpot();
  }

  // ── Lifecycle ──
  SQ['0dte'] = {
    init: function() {
      prevData = null; expandedStrike = null; liveSpot = null;
      keyLevels = { buy: [], sell: [], flip: null };
      if (!document.getElementById('dp-font-barlow')) {
        var link = document.createElement('link');
        link.id = 'dp-font-barlow'; link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&display=swap';
        document.head.appendChild(link);
      }
      startClock();
      var btn = document.getElementById('dp-go');
      var input = document.getElementById('dp-ticker');
      if (btn) btn.addEventListener('click', function() { if (input) switchTicker(input.value); });
      if (input) input.addEventListener('keydown', function(e) { if (e.key === 'Enter') switchTicker(input.value); });
      fetchData();
      fetchInterval = setInterval(fetchData, REFRESH_MS);
      fetchAI();
      aiInterval = setInterval(fetchAI, 60000);
      subSpot();
    },
    destroy: function() {
      if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
      if (fetchInterval) { clearInterval(fetchInterval); fetchInterval = null; }
      if (aiInterval) { clearInterval(aiInterval); aiInterval = null; }
      unsubSpot();
      prevData = null; expandedStrike = null; liveSpot = null;
    },
  };
})();
`;
}

module.exports = { getPageCSS, getPageHTML, getPageJS };
