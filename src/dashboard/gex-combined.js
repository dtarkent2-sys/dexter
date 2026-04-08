/**
 * Combined GEX Page — Heatmap + Intelligence Layers
 *
 * Merges the div-based heatmap grid (from heatmap.js) with the
 * verdict/dealer/convexity intelligence layers (from gex-heatmap.js)
 * into collapsible strips above the heatmap.
 *
 * Exports:
 *   getGexCombinedPageCSS()  → scoped CSS
 *   getGexCombinedPageHTML() → HTML fragment
 *   getGexCombinedPageJS()   → client-side JS (SQ.gex IIFE)
 */

function getGexCombinedPageCSS() {
  return `
/* ── GEX Combined page scoped ── */
#page-gex {
  padding: 0; flex-direction: column; height: 100%; overflow-y: auto; overflow-x: hidden;
}
#page-gex.active {
  display: flex;
  background: linear-gradient(180deg, var(--bg) 0%, rgba(15,23,42,0.97) 100%);
  transition: background 0.5s ease, border-color 0.5s ease;
}

/* ── Decision Bar ── */
#page-gex .gex-decision-bar {
  display: flex; align-items: center; gap: 0; padding: 10px 16px;
  border-bottom: 2px solid var(--border); background: var(--bg-surface);
  flex-shrink: 0; font-family: var(--font-mono); font-size: 13px;
  overflow-x: auto; white-space: nowrap;
  transition: border-color 0.5s ease;
}
#page-gex .gex-decision-bar .gex-db-item {
  display: flex; align-items: center; gap: 6px; padding: 0 14px;
  border-right: 1px solid var(--border); color: var(--text-muted);
}
#page-gex .gex-decision-bar .gex-db-item:last-child { border-right: none; }
#page-gex .gex-db-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
#page-gex .gex-db-value { font-weight: 700; color: var(--text); font-size: 14px; }
#page-gex .gex-regime-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 18px; border-radius: 3px; font-weight: 700; font-size: 15px;
  text-transform: uppercase; letter-spacing: 1px;
  background: rgba(251,191,36,0.15); color: var(--accent);
}
#page-gex .gex-regime-badge.gex-regime-fragile-badge { background: rgba(239,68,68,0.2); color: #ef4444; }
#page-gex .gex-regime-badge.gex-regime-breakout-badge { background: rgba(34,197,94,0.2); color: #22c55e; }
#page-gex .gex-regime-badge.gex-regime-pin-badge { background: rgba(251,191,36,0.2); color: #fbbf24; }
#page-gex .gex-status-trade { color: #22c55e; }
#page-gex .gex-status-wait { color: #f59e0b; }
#page-gex .gex-risk-high { color: #ef4444; }
#page-gex .gex-risk-med { color: #f59e0b; }
#page-gex .gex-risk-low { color: #22c55e; }
#page-gex .gex-live-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: #22c55e; animation: gex-pulse 1.5s ease-in-out infinite;
}
#page-gex .gex-live-dot.disconnected { background: #ef4444; animation: none; }
#page-gex .gex-intel-age {
  font-size: 10px; color: var(--text-muted); opacity: 0.7;
  font-family: var(--font-mono); margin-left: 2px;
}
#page-gex .gex-intel-age.stale { color: #f59e0b; }
@keyframes gex-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Regime classes on container ── */
#page-gex.regime-fragile .gex-decision-bar { border-bottom-color: #ef4444; }
#page-gex.regime-breakout .gex-decision-bar { border-bottom-color: #22c55e; }
#page-gex.regime-pin .gex-decision-bar { border-bottom-color: #fbbf24; }
#page-gex.regime-neutral .gex-decision-bar { border-bottom-color: var(--border); }

/* ── Collapsible Strips ── */
#page-gex .gex-strip {
  display: flex; align-items: center; gap: 8px; padding: 6px 16px;
  border-bottom: 1px solid var(--border); background: var(--bg-surface);
  cursor: pointer; font-family: var(--font-mono); font-size: 12px;
  flex-shrink: 0; user-select: none;
}
#page-gex .gex-strip:hover { background: rgba(251,191,36,0.05); }
#page-gex .gex-strip-chevron { transition: transform 0.2s; width: 14px; height: 14px; color: var(--text-muted); }
#page-gex .gex-strip.expanded .gex-strip-chevron { transform: rotate(90deg); }
#page-gex .gex-strip-label { font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
#page-gex .gex-strip-stats { display: flex; align-items: center; gap: 12px; margin-left: auto; font-size: 11px; color: var(--text); overflow: hidden; white-space: nowrap; }
#page-gex .gex-strip-stats .ss-label { color: var(--text-muted); font-size: 9px; text-transform: uppercase; }
#page-gex .gex-strip-stats .ss-val { font-weight: 600; }
#page-gex .gex-strip-body {
  display: none; padding: 12px 16px; border-bottom: 1px solid var(--border);
  background: var(--bg-surface); flex-shrink: 0;
}
#page-gex .gex-strip.expanded + .gex-strip-body { display: block; }

/* ── Verdict strip body ── */
#page-gex .verdict-card {
  padding: 12px 0; font-family: var(--font-body); font-size: 12px;
}
#page-gex .verdict-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
#page-gex .verdict-mode { font-family: var(--font-heading); font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
#page-gex .verdict-pills { display: flex; gap: 6px; margin-left: auto; align-items: center; flex-wrap: wrap; }
#page-gex .verdict-pill { font-family: var(--font-mono); font-size: 9px; padding: 2px 8px; border-radius: 3px; font-weight: 600; }
#page-gex .pill-low { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
#page-gex .pill-building { background: rgba(234,179,8,0.1); color: var(--yellow); border: 1px solid rgba(234,179,8,0.2); }
#page-gex .pill-high { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
#page-gex .pill-stabilizing { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
#page-gex .pill-fragilizing { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
#page-gex .pill-neutral { background: var(--border-subtle); color: var(--text-muted); border: 1px solid var(--border-subtle); }
#page-gex .verdict-action { font-size: 13px; color: var(--text); margin-bottom: 6px; font-weight: 500; }
#page-gex .verdict-levels { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
#page-gex .verdict-invalidation { font-size: 10px; color: var(--text-muted); margin-bottom: 4px; font-style: italic; }
#page-gex .verdict-pressure { font-family: var(--font-mono); font-size: 10px; margin-bottom: 6px; color: var(--text-muted); }
#page-gex .verdict-pressure b { color: var(--text); font-weight: 600; }
#page-gex .verdict-toggles { display: flex; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border-subtle); }
#page-gex .verdict-adv-toggle {
  font-family: var(--font-mono); font-size: 9px; padding: 3px 10px;
  border: 1px solid var(--border); background: transparent; color: var(--text-muted);
  border-radius: 3px; cursor: pointer; transition: all 0.15s;
}
#page-gex .verdict-adv-toggle.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
#page-gex .verdict-advanced { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle); }
#page-gex .verdict-adv-type { font-family: var(--font-body); font-size: 12px; font-weight: 600; }
#page-gex .verdict-adv-row { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 4px 0; font-size: 10px; color: var(--text-muted); }
#page-gex .verdict-adv-item { font-family: var(--font-mono); }
#page-gex .verdict-adv-walls { display: flex; gap: 8px; margin: 4px 0; font-size: 10px; }
#page-gex .imb-gex-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
#page-gex .imb-gex-label { color: var(--text-muted); font-size: 10px; }
#page-gex .imb-gex-val { font-family: var(--font-mono); font-size: 11px; font-weight: 600; }
#page-gex .imb-reasons { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 4px 0; }
#page-gex .imb-reasons .imb-reason { font-size: 10px; color: var(--text-muted); }
#page-gex .imb-reasons .imb-reason::before { content: '\\2022 '; color: var(--text-muted); }
#page-gex .imb-level-chip { font-family: var(--font-mono); font-size: 9px; padding: 2px 6px; border-radius: 3px; border: 1px solid; }
#page-gex .imb-level-chip.support { color: var(--green); border-color: var(--accent-subtle); background: rgba(0,232,123,0.05); }
#page-gex .imb-level-chip.resistance { color: var(--red); border-color: rgba(239,68,68,0.12); background: rgba(255,59,92,0.05); }
#page-gex .imb-level-chip.magnet { color: var(--accent); border-color: var(--border); background: var(--accent-subtle); }

/* ── Verdict extras ── */
#page-gex .verdict-regime-reasons { margin-top: 6px; }
#page-gex .verdict-regime-reasons .imb-reason { font-size: 10px; color: var(--text-muted); }
#page-gex .verdict-regime-reasons .imb-reason::before { content: '\\2022 '; color: var(--text-muted); }
#page-gex .verdict-stability { font-family: var(--font-mono); font-size: 10px; margin-top: 4px; }
#page-gex .verdict-gex-totals { font-family: var(--font-mono); font-size: 10px; margin-top: 4px; color: var(--text-muted); }
#page-gex .bias-arrow { font-weight: 800; font-size: 12px; }

/* ── Positioning / Volatility strip bodies ── */
#page-gex .convexity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
#page-gex .cx-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px; padding: 12px; }
#page-gex .cx-card-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px; font-family: var(--font-body); }
#page-gex .cx-card-value { font-size: 1.1rem; font-family: var(--font-mono); font-weight: 600; }
#page-gex .cx-card-sub { font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px; }
#page-gex .cx-badge-uncal { display: inline-block; background: var(--yellow); color: #000; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; letter-spacing: 0.02em; }

/* ── Macro Events ── */
#page-gex .macro-events { margin-top: 8px; }
#page-gex .macro-event-row { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; }
#page-gex .macro-event-row.high-risk { background: rgba(239,68,68,0.1); }
#page-gex .macro-event-name { font-weight: 600; min-width: 120px; }
#page-gex .macro-event-forecast { color: var(--text-muted); }
#page-gex .macro-event-countdown { font-weight: 700; margin-left: auto; }
#page-gex .macro-countdown-urgent { color: #ef4444; }
#page-gex .macro-countdown-warning { color: #f59e0b; }
#page-gex .macro-countdown-safe { color: var(--text-muted); }
#page-gex .macro-event-released { color: #22c55e; font-weight: 700; }
#page-gex .macro-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; margin-left: 8px; }
#page-gex .macro-badge.urgent { background: rgba(239,68,68,0.2); color: #ef4444; }
#page-gex .macro-badge.warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
#page-gex .gex-regime-eventrisk-badge { color: #f59e0b; background: rgba(245,158,11,0.2); }
#page-gex.regime-eventrisk .gex-decision-bar { border-bottom-color: #f59e0b; }

/* ── Timing Strip ── */
#page-gex .timing-state-badge {
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
  border-radius: 4px; font-family: var(--font-mono); font-size: 12px;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
}
#page-gex .timing-state-WAIT { background: rgba(100,116,139,0.2); color: #94a3b8; }
#page-gex .timing-state-WATCH { background: rgba(251,191,36,0.15); color: #60a5fa; }
#page-gex .timing-state-SETUP { background: rgba(245,158,11,0.2); color: #f59e0b; }
#page-gex .timing-state-TRIGGERED { background: rgba(34,197,94,0.2); color: #22c55e; }
#page-gex .timing-state-LATE { background: rgba(239,68,68,0.15); color: #f87171; }
#page-gex .timing-state-AVOID { background: rgba(239,68,68,0.25); color: #ef4444; }
#page-gex .timing-score { font-family: var(--font-mono); font-weight: 700; font-size: 13px; }
#page-gex .timing-dir { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
#page-gex .timing-content { font-family: var(--font-mono); font-size: 12px; }
#page-gex .timing-section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; margin: 8px 0 4px; }
#page-gex .timing-section-label:first-child { margin-top: 0; }
#page-gex .timing-entry-window {
  display: flex; align-items: center; gap: 8px; padding: 4px 8px;
  border-radius: 4px; background: rgba(251,191,36,0.08); margin-bottom: 4px;
}
#page-gex .timing-entry-type { font-weight: 700; font-size: 10px; text-transform: uppercase; min-width: 60px; color: var(--accent); }
#page-gex .timing-entry-label { flex: 1; }
#page-gex .timing-entry-zone { font-weight: 600; white-space: nowrap; }
#page-gex .timing-entry-inval { color: #ef4444; font-size: 11px; }
#page-gex .timing-why-item { padding: 2px 0; color: var(--text); }
#page-gex .timing-why-item::before { content: '\\2022 '; color: var(--accent); }
#page-gex .timing-warning { padding: 3px 8px; border-radius: 4px; background: rgba(245,158,11,0.1); color: #f59e0b; margin-bottom: 3px; font-size: 11px; }
#page-gex .timing-components { display: flex; gap: 8px; flex-wrap: wrap; }
#page-gex .timing-comp-bar { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-muted); }
#page-gex .timing-comp-fill { height: 4px; border-radius: 2px; background: var(--accent); min-width: 2px; }
@media (max-width: 768px) {
  #page-gex .timing-entry-window { flex-wrap: wrap; }
  #page-gex .timing-components { gap: 4px; }
}

/* ── What Matters Strip ── */
#page-gex .gex-matters-strip {
  display: flex; align-items: center; gap: 0; padding: 6px 16px;
  background: var(--bg-surface); border-bottom: 1px solid var(--border);
  flex-shrink: 0; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);
  overflow-x: auto; white-space: nowrap;
}
#page-gex .gex-chip {
  padding: 0 12px; border-right: 1px solid var(--border);
}
#page-gex .gex-chip:last-child { border-right: none; }
#page-gex .gex-chip-label { color: var(--text-muted); }
#page-gex .gex-chip-value { color: var(--text); font-weight: 600; }

/* ── Ticker Selector ── */
#page-gex .gex-ticker-group { display: flex; align-items: center; gap: 4px; padding-right: 12px; border-right: 1px solid var(--border); margin-right: 4px; position: relative; }
#page-gex .gex-ticker-input {
  background: var(--bg); border: 1px solid var(--border); color: var(--text);
  padding: 4px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px;
  width: 64px; text-transform: uppercase; font-weight: 600; transition: border-color 0.2s;
}
#page-gex .gex-ticker-input:focus { outline: none; border-color: var(--accent); }
#page-gex .gex-ticker-dd {
  display: none; position: absolute; top: 100%; left: 0; z-index: 300;
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  margin-top: 4px; min-width: 160px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  max-height: 220px; overflow-y: auto;
}
#page-gex .gex-ticker-dd.show { display: block; }
#page-gex .gex-ticker-opt {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 10px; cursor: pointer; font-size: 11px; font-family: var(--font-mono);
}
#page-gex .gex-ticker-opt:hover { background: rgba(251,191,36,0.15); }
#page-gex .gex-ticker-opt .sym { font-weight: 600; color: var(--text); }
#page-gex .gex-ticker-opt .desc { font-size: 9px; color: var(--text-muted); }
#page-gex .gex-ticker-load {
  padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;
  font-weight: 600; font-family: var(--font-mono); background: var(--accent-subtle, rgba(251,191,36,0.15));
  color: var(--accent); border: 1px solid var(--accent); transition: all 0.2s;
}
#page-gex .gex-ticker-load:hover { background: var(--accent); color: #fff; }

/* ── Palette Toolbar ── */
#page-gex .gex-toolbar {
  display: flex; align-items: center; gap: 10px; padding: 6px 16px;
  border-bottom: 1px solid var(--border); flex-shrink: 0;
  font-size: 11px; color: var(--text-muted);
}
#page-gex .gex-pal-btn {
  width: 20px; height: 20px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; transition: border-color 0.2s;
}
#page-gex .gex-pal-btn.active { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(251,191,36,0.3); }
#page-gex .gex-mode-group { display: flex; gap: 2px; margin-left: 16px; border-left: 1px solid var(--border); padding-left: 12px; }
#page-gex .gex-mode-btn {
  padding: 3px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;
  font-weight: 600; font-family: var(--font-mono); text-transform: uppercase;
  background: transparent; color: var(--text-muted); border: 1px solid transparent;
  transition: all 0.2s;
}
#page-gex .gex-mode-btn:hover { color: var(--text); }
#page-gex .gex-mode-btn.active { background: rgba(251,191,36,0.15); color: var(--accent); border-color: var(--accent); }
#page-gex .gex-pal-singularity { background: linear-gradient(135deg, rgb(6,182,212), rgb(219,39,119)); }
#page-gex .gex-pal-redgreen { background: linear-gradient(135deg, rgb(34,197,94), rgb(220,38,38)); }
#page-gex .gex-pal-protanopia { background: linear-gradient(135deg, rgb(59,130,246), rgb(245,158,11)); }
#page-gex .gex-pal-tritanopia { background: linear-gradient(135deg, rgb(20,184,166), rgb(244,63,94)); }

/* ── Replay controls ── */
#page-gex .gex-replay-group { display: flex; align-items: center; gap: 6px; margin-left: 16px; border-left: 1px solid var(--border); padding-left: 12px; }
#page-gex .replay-date-input {
  background: var(--bg); border: 1px solid var(--border); border-radius: 4px;
  color: var(--text); font-family: var(--font-mono); font-size: 11px;
  padding: 3px 6px; width: 120px;
}
#page-gex .replay-date-input::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
#page-gex .replay-btn {
  padding: 3px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;
  font-weight: 600; font-family: var(--font-mono); text-transform: uppercase;
  background: transparent; color: var(--text-muted); border: 1px solid var(--border);
  transition: all 0.2s;
}
#page-gex .replay-btn:hover { border-color: var(--accent); color: var(--accent); }
#page-gex .replay-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
#page-gex .replay-slider { cursor: pointer; accent-color: var(--accent); width: 100px; }
#page-gex .replay-time { font-family: var(--font-mono); font-size: 11px; color: var(--accent); min-width: 32px; }

/* ── Range slider in toolbar ── */
#page-gex .gex-range-group { display: flex; align-items: center; gap: 4px; margin-left: 16px; border-left: 1px solid var(--border); padding-left: 12px; }
#page-gex .gex-range-label { font-size: 9px; text-transform: uppercase; color: var(--text-muted); }
#page-gex .gex-range-input { width: 70px; accent-color: var(--accent); }
#page-gex .gex-range-val { font-size: 11px; color: var(--text-muted); min-width: 28px; text-align: center; }

/* ── Expiration chips in toolbar ── */
#page-gex .gex-exp-chips { display: flex; align-items: center; gap: 4px; margin-left: 16px; border-left: 1px solid var(--border); padding-left: 12px; overflow-x: auto; }
#page-gex .gex-exp-chip {
  padding: 3px 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px;
  font-weight: 500; cursor: pointer; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); transition: all 0.2s;
  white-space: nowrap; user-select: none;
}
#page-gex .gex-exp-chip.active { background: rgba(251,191,36,0.12); color: var(--accent); border-color: var(--accent); }

/* ── Grid ── */
#page-gex .gex-grid-wrap {
  flex: 1; overflow: auto; position: relative; padding: 0; min-height: 250px;
}
#page-gex .gex-grid {
  display: grid; width: max-content; min-width: 100%;
}
#page-gex .gex-cell {
  padding: 8px 10px; text-align: right; font-family: var(--font-mono);
  font-size: 12px; border: 1px solid rgba(30,41,59,0.6);
  transition: background 0.3s ease;
  cursor: pointer; color: #F8FAFC; font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  min-height: 34px; line-height: 18px; position: relative;
}
#page-gex .gex-cell-header {
  position: sticky; top: 0; z-index: 4;
  background: var(--bg-surface); font-weight: 700; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.3px; color: var(--text-muted);
  border-bottom: 2px solid var(--border); padding: 10px 10px;
}
#page-gex .gex-cell-strike {
  position: sticky; left: 0; z-index: 3;
  background: var(--bg-surface); font-weight: 600; text-align: left;
  border-right: 2px solid var(--border); color: var(--text);
}
#page-gex .gex-cell-corner {
  position: sticky; top: 0; left: 0; z-index: 5;
  background: var(--bg-surface); border-right: 2px solid var(--border);
  border-bottom: 2px solid var(--border);
}
#page-gex .gex-cell-net {
  font-weight: 800; border-top: 2px solid var(--border);
  background: rgba(15,23,42,0.8);
}
#page-gex .gex-dominant-header {
  color: #60a5fa; font-weight: 800;
  background: rgba(251,191,36,0.15); border-bottom: 3px solid #fbbf24;
}
#page-gex .gex-structural { border-left: 3px solid var(--accent); }
#page-gex .gex-spot-row {
  border-left: 3px solid #fbbf24 !important;
  box-shadow: inset 4px 0 16px rgba(251,191,36,0.35), -2px 0 10px rgba(251,191,36,0.2);
  animation: spotPulse 2s ease-in-out infinite;
}
@keyframes spotPulse {
  0%, 100% { box-shadow: inset 4px 0 16px rgba(251,191,36,0.35), -2px 0 10px rgba(251,191,36,0.2); }
  50% { box-shadow: inset 4px 0 20px rgba(251,191,36,0.5), -2px 0 14px rgba(251,191,36,0.3); }
}
#page-gex .gex-cell.gex-isolated { border: 2px solid #eab308; }

/* ── Grid Overlay Badges ── */
#page-gex .gex-overlay-badge {
  position: absolute; top: 1px; right: 2px; font-size: 9px; font-weight: 800;
  letter-spacing: 0.3px; text-transform: uppercase; line-height: 1;
  padding: 2px 4px; border-radius: 3px; pointer-events: none;
  font-family: var(--font-mono);
}
#page-gex .gex-ov-call-wall {
  border-left: 3px solid #22c55e !important;
  box-shadow: inset 4px 0 12px rgba(34,197,94,0.3), -2px 0 8px rgba(34,197,94,0.15);
}
#page-gex .gex-ov-call-wall .gex-overlay-badge { background: rgba(34,197,94,0.85); color: #fff; }
#page-gex .gex-ov-put-wall {
  border-left: 3px solid #ef4444 !important;
  box-shadow: inset 4px 0 12px rgba(239,68,68,0.3), -2px 0 8px rgba(239,68,68,0.15);
}
#page-gex .gex-ov-put-wall .gex-overlay-badge { background: rgba(239,68,68,0.85); color: #fff; }
#page-gex .gex-ov-flip {
  border-left: 3px solid #a855f7 !important;
  box-shadow: inset 4px 0 12px rgba(168,85,247,0.3), -2px 0 8px rgba(168,85,247,0.15);
}
#page-gex .gex-ov-flip .gex-overlay-badge { background: rgba(168,85,247,0.85); color: #fff; }
#page-gex .gex-ov-magnet {
  border-left: 3px solid #f59e0b !important;
  box-shadow: inset 4px 0 12px rgba(245,158,11,0.25), -2px 0 8px rgba(245,158,11,0.1);
}
#page-gex .gex-ov-magnet .gex-overlay-badge { background: rgba(245,158,11,0.85); color: #000; }
#page-gex .gex-ov-danger {
  border-left: 3px solid #f43f5e !important;
  box-shadow: inset 4px 0 12px rgba(244,63,94,0.3), -2px 0 8px rgba(244,63,94,0.15);
}
#page-gex .gex-ov-danger .gex-overlay-badge { background: rgba(244,63,94,0.85); color: #fff; }
#page-gex .gex-ov-risk {
  border-left: 3px solid #fb923c !important;
  box-shadow: inset 4px 0 12px rgba(251,146,60,0.25), -2px 0 8px rgba(251,146,60,0.1);
}
#page-gex .gex-ov-risk .gex-overlay-badge { background: rgba(251,146,60,0.85); color: #000; }
/* Phase 4: PoLR corridor — bold prediction path */
#page-gex .gex-ov-polr-up {
  background: rgba(34,197,94,0.12) !important;
  border-left: 3px solid rgba(34,197,94,0.7) !important;
  box-shadow: inset 4px 0 16px rgba(34,197,94,0.15);
}
#page-gex .gex-ov-polr-down {
  background: rgba(239,68,68,0.12) !important;
  border-left: 3px solid rgba(239,68,68,0.7) !important;
  box-shadow: inset 4px 0 16px rgba(239,68,68,0.15);
}
#page-gex .gex-strike-tag.polr-up { background: rgba(34,197,94,0.25); color: #22c55e; }
#page-gex .gex-strike-tag.polr-down { background: rgba(239,68,68,0.25); color: #ef4444; }
/* Target strike — pulsing highlight */
#page-gex .gex-polr-target {
  border-left: 4px solid #fbbf24 !important;
  box-shadow: inset 6px 0 20px rgba(251,191,36,0.25), 0 0 8px rgba(251,191,36,0.15) !important;
  animation: polrTargetPulse 2s ease-in-out infinite;
}
@keyframes polrTargetPulse {
  0%,100% { box-shadow: inset 6px 0 20px rgba(251,191,36,0.25), 0 0 8px rgba(251,191,36,0.15); }
  50% { box-shadow: inset 6px 0 24px rgba(251,191,36,0.4), 0 0 12px rgba(251,191,36,0.25); }
}
#page-gex .gex-strike-tag.target { background: rgba(251,191,36,0.3); color: #fbbf24; font-size: 10px; }

/* ── Prediction Bar ── */
#page-gex .gex-prediction-bar {
  display: flex; align-items: center; gap: 12px; padding: 10px 16px;
  border-bottom: 2px solid var(--border); flex-shrink: 0;
  font-family: var(--font-mono); font-size: 13px;
  background: linear-gradient(90deg, var(--bg-surface) 0%, rgba(15,23,42,0.95) 100%);
}
#page-gex .gex-prediction-bar .pred-arrow {
  font-size: 22px; line-height: 1;
}
#page-gex .gex-prediction-bar .pred-arrow.up { color: #22c55e; }
#page-gex .gex-prediction-bar .pred-arrow.down { color: #ef4444; }
#page-gex .gex-prediction-bar .pred-arrow.neutral { color: var(--text-muted); }
#page-gex .gex-prediction-bar .pred-text {
  font-size: 14px; font-weight: 700; color: var(--text);
}
#page-gex .gex-prediction-bar .pred-detail {
  font-size: 11px; color: var(--text-muted); margin-left: auto;
}
#page-gex .gex-prediction-bar .pred-prob {
  font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
}
#page-gex .gex-prediction-bar .pred-prob.high { background: rgba(34,197,94,0.2); color: #22c55e; }
#page-gex .gex-prediction-bar .pred-prob.med { background: rgba(234,179,8,0.2); color: #eab308; }
#page-gex .gex-prediction-bar .pred-prob.low { background: rgba(100,116,139,0.2); color: #94a3b8; }
#page-gex .gex-prediction-bar .pred-qual { font-size: 10px; padding: 2px 6px; border-radius: 3px; margin-left: 6px; }
#page-gex .gex-prediction-bar .pred-qual.qual-high { background: rgba(34,197,94,0.1); color: #22c55e; }
#page-gex .gex-prediction-bar .pred-qual.qual-med { background: rgba(234,179,8,0.1); color: #eab308; }
#page-gex .gex-prediction-bar .pred-qual.qual-low { background: rgba(239,68,68,0.1); color: #ef4444; }
#page-gex .gex-prediction-bar .pred-warn { font-size: 10px; color: #ef4444; margin-left: 6px; font-style: italic; }
/* Phase 4: Battle zones */
#page-gex .gex-ov-battle {
  box-shadow: inset 0 0 8px rgba(234,179,8,0.15);
  border-bottom: 1px dashed rgba(234,179,8,0.3) !important;
}
#page-gex .gex-strike-tag.bz { background: rgba(234,179,8,0.2); color: #eab308; }
/* Phase 4: Acceleration zones (liquidity pockets) */
#page-gex .gex-ov-accel {
  background: rgba(168,85,247,0.06) !important;
  border-left: 2px dashed rgba(168,85,247,0.4) !important;
}
#page-gex .gex-strike-tag.az { background: rgba(168,85,247,0.2); color: #a855f7; }
/* Phase 4: Fragility tags */
#page-gex .gex-strike-tag.frag-fortress { background: rgba(34,197,94,0.2); color: #22c55e; }
#page-gex .gex-strike-tag.frag-stable { background: rgba(251,191,36,0.2); color: #fbbf24; }
#page-gex .gex-strike-tag.frag-weak { background: rgba(234,179,8,0.2); color: #eab308; }
#page-gex .gex-strike-tag.frag-fragile { background: rgba(239,68,68,0.2); color: #ef4444; }
/* Phase 4: Compression Pocket zone */
#page-gex .gex-ov-compression {
  background: repeating-linear-gradient(45deg, rgba(251,146,60,0.04), rgba(251,146,60,0.04) 4px, transparent 4px, transparent 8px) !important;
  border-left: 3px solid rgba(251,146,60,0.6) !important;
  box-shadow: inset 4px 0 12px rgba(251,146,60,0.15);
}
#page-gex .gex-strike-tag.compress { background: rgba(251,146,60,0.25); color: #fb923c; font-size: 9px; }
#page-gex .gex-prediction-bar .pred-compress {
  font-size: 10px; padding: 2px 6px; border-radius: 3px; margin-left: 6px;
  background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.3);
}
#page-gex .gex-strike-tag.hinge { background: rgba(6,182,212,0.25); color: #22d3ee; }
#page-gex .gex-strike-tag.void { background: rgba(99,102,241,0.15); color: #818cf8; }
/* Strike column overlay labels */
#page-gex .gex-cell-strike .gex-strike-tags { display: flex; gap: 3px; margin-top: 2px; flex-wrap: wrap; }
#page-gex .gex-strike-tag {
  font-size: 9px; font-weight: 800; letter-spacing: 0.3px;
  padding: 2px 5px; border-radius: 3px; text-transform: uppercase;
  font-family: var(--font-mono); line-height: 1.2;
}
#page-gex .gex-strike-tag.cw { background: rgba(251,191,36,0.25); color: #60a5fa; }
#page-gex .gex-strike-tag.pw { background: rgba(239,68,68,0.25); color: #f87171; }
#page-gex .gex-strike-tag.fl { background: rgba(245,158,11,0.25); color: #fbbf24; }
#page-gex .gex-strike-tag.mg { background: rgba(168,85,247,0.25); color: #c084fc; }
#page-gex .gex-strike-tag.dz { background: rgba(244,63,94,0.25); color: #fb7185; }
#page-gex .gex-strike-tag.rs { background: rgba(251,146,60,0.25); color: #fdba74; }

/* ── Session Forecast panel ── */
#page-gex .forecast-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px; padding: 4px 0;
}
#page-gex .fc-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 3px; padding: 10px 12px; font-family: var(--font-mono);
}
#page-gex .fc-card-label {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); margin-bottom: 6px;
}
#page-gex .fc-card-value { font-size: 16px; font-weight: 700; color: var(--text); }
#page-gex .fc-card-sub { font-size: 10px; color: var(--text-muted); margin-top: 3px; }
#page-gex .fc-card.fc-shift-active { border-color: rgba(239,68,68,0.5); }
#page-gex .fc-card.fc-shift-watch { border-color: rgba(251,146,60,0.4); }
#page-gex .fc-card.fc-shift-stable { border-color: var(--border); }
#page-gex .fc-prob { font-family: var(--font-mono); font-size: 11px; font-weight: 600; }
#page-gex .fc-prob.bullish { color: #22c55e; }
#page-gex .fc-prob.bearish { color: #ef4444; }
#page-gex .fc-prob.neutral { color: var(--text-muted); }
#page-gex .fc-targets { font-size: 10px; color: var(--text-muted); margin-top: 4px; }
#page-gex .fc-targets span { margin-right: 8px; }
#page-gex .fc-reasons { font-size: 9px; color: var(--text-muted); margin-top: 4px; line-height: 1.4; }
#page-gex .fc-touch-list { list-style: none; padding: 0; margin: 4px 0 0; }
#page-gex .fc-touch-list li { font-size: 10px; display: flex; justify-content: space-between; padding: 1px 0; }
#page-gex .fc-touch-bar { height: 4px; border-radius: 2px; background: rgba(251,191,36,0.2); margin-top: 2px; }
#page-gex .fc-touch-fill { height: 100%; border-radius: 2px; background: #fbbf24; }

/* ── Dual-line cell (GEX + Notional) ── */
#page-gex .gex-cell .gex-cell-gex { display: block; }
#page-gex .gex-cell .gex-cell-notional { display: block; font-size: 9px; opacity: 0.6; font-weight: 400; margin-top: 1px; }

/* ── Tooltip ── */
#page-gex .gex-tooltip {
  position: absolute; z-index: 100; display: none;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 3px; padding: 14px 18px; font-size: 12px;
  font-family: var(--font-mono); color: var(--text);
  box-shadow: 0 16px 48px rgba(0,0,0,0.6); pointer-events: none;
  max-width: 280px; line-height: 1.4;
}
#page-gex .gex-tt-title { font-weight: 700; margin-bottom: 8px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 6px; }
#page-gex .gex-tt-row { display: flex; justify-content: space-between; gap: 16px; margin: 3px 0; }
#page-gex .gex-tt-label { font-size: 11px; color: var(--text-muted); }
#page-gex .gex-tt-val { font-weight: 600; font-size: 11px; text-align: right; }
#page-gex .gex-tt-pos { color: #22c55e; }
#page-gex .gex-tt-neg { color: #ef4444; }
#page-gex .gex-tt-divider { border-top: 1px solid var(--border); margin: 6px 0; }
#page-gex .gex-tt-zone { margin-top: 6px; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; }
#page-gex .gex-tt-zone.accel { background: rgba(239,68,68,0.15); color: #ef4444; }
#page-gex .gex-tt-zone.stable { background: rgba(34,197,94,0.15); color: #22c55e; }
#page-gex .gex-tt-zone.wall { background: rgba(251,191,36,0.15); color: #fbbf24; }
#page-gex .gex-tt-zone.flip { background: rgba(245,158,11,0.15); color: #f59e0b; }
#page-gex .gex-tt-zone.magnet { background: rgba(168,85,247,0.15); color: #a855f7; }

/* ── Profile View ── */
#page-gex .gex-profile {
  flex-shrink: 0; padding: 0 16px; border-top: 1px solid var(--border);
  background: var(--bg-surface);
  max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
}
#page-gex .gex-profile.expanded { max-height: 300px; padding: 12px 16px; overflow-y: auto; }
#page-gex .gex-profile-title {
  font-family: var(--font-heading); font-size: 13px; font-weight: 700;
  color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;
  letter-spacing: 0.5px; cursor: pointer; user-select: none;
}
#page-gex .gex-profile-title:hover { color: var(--text); }
#page-gex .gex-profile-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 3px;
  font-family: var(--font-mono); font-size: 11px;
}
#page-gex .gex-profile-label { width: 60px; text-align: right; color: var(--text-muted); flex-shrink: 0; }
#page-gex .gex-profile-bar-wrap {
  flex: 1; height: 14px; background: rgba(51,65,85,0.2); border-radius: 2px;
  position: relative; overflow: hidden;
}
#page-gex .gex-profile-bar { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
#page-gex .gex-profile-val { width: 70px; text-align: right; color: var(--text); flex-shrink: 0; }

/* ── Motion Strip ── */
#page-gex .gex-motion-strip {
  display: flex; align-items: center; gap: 0; padding: 5px 16px;
  background: rgba(15,23,42,0.6); border-bottom: 1px solid var(--border);
  flex-shrink: 0; font-family: var(--font-mono); font-size: 11px;
  overflow-x: auto; white-space: nowrap;
}
#page-gex .gex-motion-item {
  display: flex; align-items: center; gap: 4px; padding: 0 12px;
  border-right: 1px solid rgba(51,65,85,0.4);
}
#page-gex .gex-motion-item:last-child { border-right: none; }
#page-gex .gex-motion-label {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); opacity: 0.7;
}
#page-gex .gex-motion-value { font-weight: 600; color: var(--text); font-size: 11px; }
#page-gex .gex-motion-value.positive { color: #22c55e; }
#page-gex .gex-motion-value.negative { color: #ef4444; }
#page-gex .gex-motion-value.neutral { color: var(--text-muted); }
#page-gex .gex-motion-value.warn { color: #f59e0b; }

/* ── Loading ── */
#page-gex .gex-loading {
  display: flex; align-items: center; justify-content: center;
  flex: 1; font-family: var(--font-mono); font-size: 14px; color: var(--text-muted);
}

/* ── OI Bars (call/put mini bars in strike column) ── */
#page-gex .gex-oi-bars {
  display: flex; gap: 2px; margin-top: 3px; height: 4px; width: 100%;
}
#page-gex .gex-oi-bar-call {
  height: 4px; background: #22c55e; border-radius: 1px; min-width: 1px;
}
#page-gex .gex-oi-bar-put {
  height: 4px; background: #ef4444; border-radius: 1px; min-width: 1px;
}

/* ── MAX PAIN badge ── */
#page-gex .gex-strike-maxpain {
  display: inline-block; font-size: 7px; font-weight: 800; letter-spacing: 0.3px;
  padding: 1px 5px; border-radius: 2px; background: rgba(245,158,11,0.25);
  color: #f59e0b; font-family: var(--font-mono); line-height: 1.2;
  text-transform: uppercase; margin-left: 3px;
}

/* ── Highest OI badge ── */
#page-gex .gex-strike-hoi {
  display: inline-block; font-size: 7px; font-weight: 800; letter-spacing: 0.3px;
  padding: 1px 5px; border-radius: 2px; background: rgba(99,102,241,0.25);
  color: #818cf8; font-family: var(--font-mono); line-height: 1.2;
  text-transform: uppercase; margin-left: 3px;
}

/* ── 0DTE header label ── */
#page-gex .gex-0dte-header {
  display: inline-block; font-size: 8px; font-weight: 800; letter-spacing: 0.3px;
  padding: 1px 5px; border-radius: 2px; background: rgba(251,146,60,0.3);
  color: #fb923c; font-family: var(--font-mono); margin-left: 4px;
}

/* ── High-OI cell outline (top 25%) ── */
#page-gex .gex-cell-hoi {
  outline: 1px solid rgba(99,102,241,0.5); outline-offset: -1px;
}

/* ── Legend bar ── */
#page-gex .gex-legend {
  display: flex; align-items: center; gap: 16px; padding: 6px 16px;
  border-bottom: 1px solid var(--border); background: var(--bg-surface);
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  flex-shrink: 0; overflow-x: auto; white-space: nowrap;
}
#page-gex .gex-legend-scale {
  display: flex; align-items: center; gap: 6px;
}
#page-gex .gex-legend-gradient {
  width: 120px; height: 10px; border-radius: 2px;
}
#page-gex .gex-legend-oi-item {
  display: flex; align-items: center; gap: 4px;
}
#page-gex .gex-legend-oi-swatch {
  width: 16px; height: 4px; border-radius: 1px;
}
#page-gex .gex-legend-summary {
  margin-left: auto; display: flex; gap: 12px; font-weight: 600; color: var(--text);
}

/* ── OI Summary Bar ── */
#page-gex .gex-oi-summary {
  display: flex; align-items: center; gap: 0; padding: 0;
  border-bottom: 1px solid var(--border); background: var(--bg-surface);
  font-family: var(--font-mono); font-size: 12px; flex-shrink: 0;
  overflow-x: auto; white-space: nowrap;
}
#page-gex .gex-oi-summary .oi-stat {
  display: flex; flex-direction: column; align-items: center; padding: 6px 14px;
  border-right: 1px solid var(--border);
}
#page-gex .gex-oi-summary .oi-stat:last-child { border-right: none; }
#page-gex .gex-oi-summary .oi-stat-label {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); font-weight: 500;
}
#page-gex .gex-oi-summary .oi-stat-val {
  font-size: 13px; font-weight: 700; color: var(--text);
}
#page-gex .gex-oi-summary .oi-stat-val.call-color { color: #22c55e; }
#page-gex .gex-oi-summary .oi-stat-val.put-color { color: #ef4444; }
#page-gex .gex-oi-summary .oi-stat-val.accent-color { color: var(--accent); }

/* ── Ticker Price Scroll Strip ── */
#page-gex .gex-ticker-strip {
  display: flex; align-items: center; gap: 0; padding: 0;
  border-bottom: 1px solid var(--border); background: var(--bg);
  font-family: var(--font-mono); font-size: 12px; flex-shrink: 0;
  overflow-x: auto; white-space: nowrap;
}
#page-gex .gex-ticker-strip .ticker-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 16px;
  border-right: 1px solid var(--border); cursor: pointer;
  transition: background 0.15s;
}
#page-gex .gex-ticker-strip .ticker-item:hover { background: rgba(251,191,36,0.08); }
#page-gex .gex-ticker-strip .ticker-item.active {
  background: rgba(251,191,36,0.12); border-bottom: 2px solid var(--accent);
}
#page-gex .gex-ticker-strip .ticker-sym { font-weight: 700; color: var(--text); }
#page-gex .gex-ticker-strip .ticker-price { color: var(--text-muted); }
#page-gex .gex-ticker-strip .ticker-chg { font-weight: 600; font-size: 11px; }
#page-gex .gex-ticker-strip .ticker-chg.up { color: #22c55e; }
#page-gex .gex-ticker-strip .ticker-chg.down { color: #ef4444; }

/* ── Volume Histogram ── */
#page-gex .gex-vol-histogram {
  display: flex; align-items: flex-end; height: 40px; padding: 0 0 0 80px;
  border-bottom: 1px solid var(--border); background: var(--bg);
  flex-shrink: 0; gap: 0; overflow: hidden;
}
#page-gex .gex-vol-histogram .vol-bar-wrap {
  flex: 1; display: flex; flex-direction: column; align-items: stretch;
  height: 100%; justify-content: flex-end; gap: 0;
}
#page-gex .gex-vol-histogram .vol-bar-call {
  background: rgba(34,197,94,0.6); min-height: 0;
}
#page-gex .gex-vol-histogram .vol-bar-put {
  background: rgba(239,68,68,0.6); min-height: 0;
}
#page-gex .gex-vol-histogram-label {
  width: 80px; font-size: 9px; color: var(--text-muted); font-family: var(--font-mono);
  text-transform: uppercase; letter-spacing: 0.3px; padding: 0 8px;
  display: flex; align-items: center; position: absolute; left: 0; height: 40px;
}

/* ── Inline OI/Vol Pills ── */
#page-gex .gex-pill {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 8px; font-weight: 700; padding: 1px 5px; border-radius: 3px;
  font-family: var(--font-mono); line-height: 1.3; margin-left: 2px;
}
#page-gex .gex-pill-call { background: rgba(34,197,94,0.25); color: #22c55e; }
#page-gex .gex-pill-put { background: rgba(168,85,247,0.25); color: #c084fc; }
#page-gex .gex-pill-prem { background: rgba(251,191,36,0.25); color: #fbbf24; }
#page-gex .gex-pill-icon { font-size: 9px; }

/* ── Cell Magnitude Bars ── */
#page-gex .gex-cell .gex-mag-bar {
  position: absolute; bottom: 0; left: 0; height: 3px; border-radius: 0 1px 0 0;
  opacity: 0.7; pointer-events: none;
}
#page-gex .gex-cell .gex-mag-bar.pos { background: #22c55e; }
#page-gex .gex-cell .gex-mag-bar.neg { background: #ef4444; }

/* ── Enhanced spot price badge ── */
#page-gex .gex-spot-price-badge {
  display: inline-block; font-size: 9px; font-weight: 700;
  padding: 1px 6px; border-radius: 3px; background: rgba(251,191,36,0.2);
  color: #fbbf24; font-family: var(--font-mono); margin-left: 4px;
}

/* ── Clean View (default) — hide advanced sections ── */
#page-gex:not(.pro-view) .gex-strip[data-strip] { display: none; }
#page-gex:not(.pro-view) .gex-strip-body { display: none; }
#page-gex:not(.pro-view) .gex-matters-strip { display: none; }
#page-gex:not(.pro-view) .gex-motion-strip { display: none; }
#page-gex:not(.pro-view) .gex-oi-summary { display: none; }
#page-gex:not(.pro-view) .gex-vol-histogram { display: none; }
#page-gex:not(.pro-view) .gex-ticker-strip { display: none; }
#page-gex:not(.pro-view) .gex-db-pro { display: none; }

/* Pro View toggle button */
#page-gex .gex-pro-toggle {
  padding: 3px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;
  font-weight: 600; font-family: var(--font-mono); text-transform: uppercase;
  background: transparent; color: var(--text-muted); border: 1px solid var(--border);
  transition: all 0.2s; margin-left: auto; letter-spacing: 0.3px;
}
#page-gex .gex-pro-toggle:hover { color: var(--text); border-color: var(--accent); }
#page-gex .gex-pro-toggle.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* ── Responsive ── */
@media (max-width: 768px) {
  #page-gex .gex-strip-stats { font-size: 9px; gap: 8px; }
  #page-gex .metric-stats { grid-template-columns: 1fr; }
  #page-gex .convexity-grid { grid-template-columns: repeat(2, 1fr); }
  #page-gex .gex-legend { font-size: 9px; gap: 10px; padding: 4px 12px; }
  #page-gex .gex-oi-summary .oi-stat { padding: 4px 8px; }
  #page-gex .gex-oi-summary .oi-stat-val { font-size: 11px; }
  #page-gex .gex-vol-histogram { height: 30px; padding-left: 60px; }
  #page-gex .gex-ticker-strip .ticker-item { padding: 4px 10px; font-size: 11px; }
}
`;
}

function getGexCombinedPageHTML() {
  return [
'<div id="page-gex" class="page">',
'  <div class="gex-decision-bar" id="gex-decision-bar"></div>',
'  <div class="gex-prediction-bar" id="gex-prediction-bar" style="display:none"></div>',
require('./market-state-panel').getMarketStatePanelHTML(),
'  <div class="gex-strip" id="gex-verdict-strip" data-strip="verdict">',
'    <i data-lucide="chevron-right" class="gex-strip-chevron"></i>',
'    <span class="gex-strip-label">Verdict</span>',
'    <div class="gex-strip-stats" id="gex-verdict-summary"></div>',
'  </div>',
'  <div class="gex-strip-body" id="gex-verdict-body">',
'    <div class="verdict-card">',
'      <div class="verdict-top">',
'        <span class="verdict-mode" id="gexVerdictMode"></span>',
'        <div class="verdict-pills" id="gexVerdictPills"></div>',
'      </div>',
'      <div class="verdict-action" id="gexVerdictAction"></div>',
'      <div class="verdict-levels" id="gexVerdictLevels"></div>',
'      <div class="verdict-invalidation" id="gexVerdictInvalidation"></div>',
'      <div class="verdict-pressure" id="gexVerdictPressure"></div>',
'      <div id="gexVerdictRegimeReasons"></div>',
'      <div id="gexVerdictStability"></div>',
'      <div id="gexVerdictGexTotals"></div>',
'      <div class="verdict-toggles">',
'        <button class="verdict-adv-toggle" id="gexAdvToggle">Advanced (Gamma)</button>',
'      </div>',
'      <div class="verdict-advanced" id="gexVerdictAdvanced" style="display:none">',
'        <div><span class="verdict-adv-type" id="gexAdvType"></span></div>',
'        <div class="imb-gex-row">',
'          <span class="imb-gex-label">Above GEX</span><span class="imb-gex-val" id="gexImbAbove"></span>',
'          <span class="imb-gex-label" style="margin-left:16px">Below GEX</span><span class="imb-gex-val" id="gexImbBelow"></span>',
'        </div>',
'        <div class="verdict-adv-row" id="gexAdvDetails"></div>',
'        <div class="verdict-adv-walls" id="gexAdvWalls"></div>',
'        <div class="imb-reasons" id="gexImbReasons"></div>',
'      </div>',
'    </div>',
'  </div>',
'  <div class="gex-strip" id="gex-positioning-strip" data-strip="positioning">',
'    <i data-lucide="chevron-right" class="gex-strip-chevron"></i>',
'    <span class="gex-strip-label">Positioning</span>',
'    <div class="gex-strip-stats" id="gex-positioning-summary"></div>',
'  </div>',
'  <div class="gex-strip-body" id="gex-positioning-body">',
'    <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">L2 &mdash; Convexity Engine</div>',
'    <div class="convexity-grid">',
'      <div class="cx-card"><div class="cx-card-label">GEX Velocity (5m)</div><div class="cx-card-value" id="cxVelocity5m">&mdash;</div><div class="cx-card-sub" id="cxAccel5m">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Flip Drift</div><div class="cx-card-value" id="cxFlipDrift">&mdash;</div><div class="cx-card-sub" id="cxFlipCurrent">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Density &plusmn;50bp</div><div class="cx-card-value" id="cxDensity50">&mdash;</div><div class="cx-card-sub" id="cxConcentration">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Local Curvature</div><div class="cx-card-value" id="cxCurvature">&mdash;</div><div class="cx-card-sub" id="cxSlope">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Vanna (VEX &plusmn;50bp)</div><div class="cx-card-value" id="cxVEX">&mdash;</div><div class="cx-card-sub">$/1 vol pt</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Charm (&plusmn;50bp)</div><div class="cx-card-value" id="cxCharm">&mdash;</div><div class="cx-card-sub" id="cxCharmTime">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Expected Move (1&sigma;)</div><div class="cx-card-value" id="cxExpMove">&mdash;</div><div class="cx-card-sub" id="cxExpBands">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">VRP</div><div class="cx-card-value" id="cxVRP">&mdash;</div><div class="cx-card-sub" id="cxVRPRegime">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">0DTE Ratio</div><div class="cx-card-value" id="cxODTE">&mdash;</div><div class="cx-card-sub" id="cxODTERegime">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Danger Score</div><div class="cx-card-value" id="cxDanger">&mdash;</div><div class="cx-card-sub" id="cxDangerComponents">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Wall Stability (Call)</div><div class="cx-card-value" id="cxWallCall">&mdash;</div><div class="cx-card-sub" id="cxWallCallPersist">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Wall Stability (Put)</div><div class="cx-card-value" id="cxWallPut">&mdash;</div><div class="cx-card-sub" id="cxWallPutPersist">&nbsp;</div></div>',
'    </div>',
'    <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:12px 0 8px">L3 &mdash; Flow Pressure</div>',
'    <div class="convexity-grid">',
'      <div class="cx-card"><div class="cx-card-label">Call Flow</div><div class="cx-card-value" id="flowCallValue">&mdash;</div><div class="cx-card-sub">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Put Flow</div><div class="cx-card-value" id="flowPutValue">&mdash;</div><div class="cx-card-sub">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Net Flow</div><div class="cx-card-value" id="flowNetValue">&mdash;</div><div class="cx-card-sub">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">C/P Ratio</div><div class="cx-card-value" id="flowRatioValue">&mdash;</div><div class="cx-card-sub">&nbsp;</div></div>',
'      <div class="cx-card"><div class="cx-card-label">Imbalance Type</div><div class="cx-card-value" id="flowImbalanceType">&mdash;</div><div class="cx-card-sub">&nbsp;</div></div>',
'    </div>',
'  </div>',
'  <div class="gex-strip" id="gex-volatility-strip" data-strip="volatility">',
'    <i data-lucide="chevron-right" class="gex-strip-chevron"></i>',
'    <span class="gex-strip-label">Volatility</span>',
'    <div class="gex-strip-stats" id="gex-volatility-summary"></div>',
'  </div>',
'  <div class="gex-strip-body" id="gex-volatility-body">',
'    <div class="convexity-grid">',
'      <div class="cx-card">',
'        <div class="cx-card-label">GEX Ratio</div>',
'        <div class="cx-card-value" id="gexRatioValue">&mdash;</div>',
'        <div class="cx-card-sub" id="gexRatioSub">Loading...</div>',
'      </div>',
'      <div class="cx-card">',
'        <div class="cx-card-label">Net GEX</div>',
'        <div class="cx-card-value" id="netGexValue">&mdash;</div>',
'        <div class="cx-card-sub" id="netGexSub">&nbsp;</div>',
'      </div>',
'      <div class="cx-card">',
'        <div class="cx-card-label">IV Ratio</div>',
'        <div class="cx-card-value" id="ivRatioValue">&mdash;</div>',
'        <div class="cx-card-sub" id="ivRatioSub">Loading...</div>',
'      </div>',
'      <div class="cx-card">',
'        <div class="cx-card-label">Call IV</div>',
'        <div class="cx-card-value" id="volCallIV">&mdash;</div>',
'        <div class="cx-card-sub">&nbsp;</div>',
'      </div>',
'      <div class="cx-card">',
'        <div class="cx-card-label">Put IV</div>',
'        <div class="cx-card-value" id="volPutIV">&mdash;</div>',
'        <div class="cx-card-sub">&nbsp;</div>',
'      </div>',
'      <div class="cx-card">',
'        <div class="cx-card-label">Expected Move (1&sigma;)</div>',
'        <div class="cx-card-value" id="volExpMove">&mdash;</div>',
'        <div class="cx-card-sub" id="volExpBands">&nbsp;</div>',
'      </div>',
'      <div class="cx-card">',
'        <div class="cx-card-label">VRP</div>',
'        <div class="cx-card-value" id="volVRP">&mdash;</div>',
'        <div class="cx-card-sub" id="volVRPRegime">&nbsp;</div>',
'      </div>',
'    </div>',
'    <div class="macro-events" id="gex-macro-events"></div>',
'  </div>',
'  <div class="gex-strip" id="gex-timing-strip" data-strip="timing">',
'    <i data-lucide="chevron-right" class="gex-strip-chevron"></i>',
'    <span class="gex-strip-label">Timing</span>',
'    <div class="gex-strip-stats" id="gex-timing-summary"></div>',
'  </div>',
'  <div class="gex-strip-body" id="gex-timing-body">',
'    <div class="timing-content" id="gex-timing-detail"></div>',
'  </div>',
'  <div class="gex-strip" id="gex-forecast-strip" data-strip="forecast">',
'    <i data-lucide="chevron-right" class="gex-strip-chevron"></i>',
'    <span class="gex-strip-label">Session Forecast</span>',
'    <div class="gex-strip-stats" id="gex-forecast-summary"></div>',
'  </div>',
'  <div class="gex-strip-body" id="gex-forecast-body">',
'    <div class="forecast-grid" id="gex-forecast-detail"></div>',
'  </div>',
'  <div class="gex-matters-strip" id="gex-matters-strip"></div>',
'  <div class="gex-motion-strip" id="gex-motion-strip"></div>',
'  <div class="gex-toolbar" id="gex-toolbar"></div>',
'  <div class="gex-toolbar" id="gex-replay-bar" style="border-bottom:none;padding-top:0;">',
'    <div class="gex-replay-group">',
'      <span style="font-size:9px;text-transform:uppercase;color:var(--text-muted)">Replay</span>',
'      <input type="date" id="gexReplayDate" class="replay-date-input" title="Select date to replay" />',
'      <button class="replay-btn" id="gexReplayBtn" title="Replay historical GEX">REPLAY</button>',
'      <button class="replay-btn" id="gexReplayPlayPause" style="display:none" title="Play / Pause">&#9654;</button>',
'      <input type="range" id="gexReplaySlider" class="replay-slider" min="0" max="100" value="0" style="display:none" />',
'      <span id="gexReplayTime" class="replay-time" style="display:none">--:--</span>',
'      <button class="replay-btn" id="gexReplayStop" style="display:none" title="Stop replay">&times;</button>',
'    </div>',
'  </div>',
'  <div class="gex-ticker-strip" id="gex-ticker-strip"></div>',
'  <div class="gex-oi-summary" id="gex-oi-summary"></div>',
'  <div class="gex-legend" id="gex-legend"></div>',
'  <div class="gex-vol-histogram" id="gex-vol-histogram" style="position:relative"></div>',
'  <div class="gex-grid-wrap" id="gex-grid-wrap">',
'    <div class="gex-grid" id="gex-grid"></div>',
'    <div class="gex-tooltip" id="gex-tooltip"></div>',
'  </div>',
'  <div class="gex-profile" id="gex-profile"></div>',
'  <div class="gex-loading" id="gex-loading">Loading heatmap\u2026</div>',
'</div>'
  ].join('\n');
}

function getGexCombinedPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.gex = (function() {
  'use strict';

  var PALETTES = {
    redgreen: { posR:34,posG:197,posB:94,posDarkR:10,posDarkG:60,posDarkB:25, negR:239,negG:68,negB:68,negDarkR:60,negDarkG:15,negDarkB:15 },
    singularity: { posR:6,posG:212,posB:235,posDarkR:8,posDarkG:55,posDarkB:65, negR:236,negG:72,negB:153,negDarkR:60,negDarkG:15,negDarkB:35 },
    protanopia: { posR:96,posG:165,posB:250,posDarkR:15,posDarkG:35,posDarkB:65, negR:251,negG:191,negB:36,negDarkR:65,negDarkG:45,negDarkB:8 },
    tritanopia: { posR:45,posG:212,posB:191,posDarkR:10,posDarkG:55,posDarkB:48, negR:251,negG:113,negB:133,negDarkR:65,negDarkG:18,negDarkB:25 }
  };

  var MODE_MAP = {
    GAMMA_BOX: { mode:'RANGE', color:'var(--yellow)', action:"Fade the edges. Don't chase breakouts.", invalidation:'break and hold outside the box' },
    BULL_IMBALANCE: { mode:'UP', color:'var(--green)', action:'Buy dips into support. Breakouts can run.', invalidation:'support' },
    BEAR_IMBALANCE: { mode:'DOWN', color:'var(--red)', action:'Sell rips into resistance. Breakdowns can run.', invalidation:'resistance' },
    NO_CONTROL: { mode:'VOLATILE', color:'#a78bfa', action:"Don't fade. Trade the break + follow-through.", invalidation:null },
    UNKNOWN: { mode:'NO SIGNAL', color:'var(--text-muted)', action:'Insufficient data.', invalidation:null },
  };
  var STRUCT_TYPE_MAP = { GAMMA_BOX:'Gamma Box', BULL_IMBALANCE:'Bull Imbalance', BEAR_IMBALANCE:'Bear Imbalance', NO_CONTROL:'No Control' };

  var state = {
    ticker: 'SPY',
    gridData: null,
    intel: null,
    metrics: null,
    ms: null,
    sseConnected: false,
    isolatedStrike: null,
    palette: localStorage.getItem('gex-palette') || 'redgreen',
    displayMode: localStorage.getItem('gex-display') || 'gex',
    gexMetric: localStorage.getItem('gex-metric') || 'pct',
    range: 20,
    sse: null,
    intelInterval: null,
    motionSSE: null,
    metricsInterval: null,
    lastSSETime: 0,
    sseMsgCount: 0,
    lastIntelTime: 0,
    intelAgeTimer: null,
    stalenessTimer: null,
    // Regime hysteresis
    confirmedRegime: null,
    pendingRegime: null,
    pendingRegimeCount: 0,
    lastRegimeChangeTime: 0,
    regimeFlipLog: [],
    smoothedConfidence: null,
    // Internal
    _netByStrike: null,
    _maxStrikeAbs: 0,
    _strikes: null,
    _totalCallOI: 0,
    _totalPutOI: 0,
    _highestCallVol: {},
    _highestPutVol: {},
    tickerPriceInterval: null,
    proView: localStorage.getItem('gex-pro-view') === 'true',
    // Replay
    replay: false,
    replayDate: null,
    replaySlices: [],
    replayIndex: 0,
    replayPlaying: false,
    replayTimer: null,
    replayBaseContracts: null,
    replayCumVol: {},
    replaySpot: 0,
    replayEventSource: null,
  };

  function headers() {
    var h = { 'Content-Type': 'application/json' };
    if (window.DASHBOARD_API_KEY) h['x-api-key'] = window.DASHBOARD_API_KEY;
    return h;
  }

  /* ── Palette color ── */
  function gexColor(val, maxPos, maxNeg) {
    var ref = (val >= 0) ? maxPos : maxNeg;
    if (!ref || ref === 0) return 'rgb(22,28,45)';
    var ratio = Math.min(Math.abs(val) / ref, 1);
    if (ratio < 0.01) return 'rgb(22,28,45)';
    var pal = PALETTES[state.palette] || PALETTES.redgreen;
    var t = Math.pow(ratio, 0.45);
    var r, g, b;
    if (val >= 0) {
      r = Math.round(pal.posDarkR + (pal.posR - pal.posDarkR) * t);
      g = Math.round(pal.posDarkG + (pal.posG - pal.posDarkG) * t);
      b = Math.round(pal.posDarkB + (pal.posB - pal.posDarkB) * t);
    } else {
      r = Math.round(pal.negDarkR + (pal.negR - pal.negDarkR) * t);
      g = Math.round(pal.negDarkG + (pal.negG - pal.negDarkG) * t);
      b = Math.round(pal.negDarkB + (pal.negB - pal.negDarkB) * t);
    }
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function fmt(v) {
    if (v == null) return '-';
    var abs = Math.abs(v);
    if (abs >= 1e9) return (v/1e9).toFixed(1)+'B';
    if (abs >= 1e6) return (v/1e6).toFixed(1)+'M';
    if (abs >= 1e3) return (v/1e3).toFixed(1)+'K';
    return v.toFixed(0);
  }
  function fmtDollar(v) {
    if (v == null || v === 0) return '-';
    var abs = Math.abs(v);
    if (abs >= 1e12) return '\\$'+(v/1e12).toFixed(1)+'T';
    if (abs >= 1e9) return '\\$'+(v/1e9).toFixed(1)+'B';
    if (abs >= 1e6) return '\\$'+(v/1e6).toFixed(1)+'M';
    if (abs >= 1e3) return '\\$'+(v/1e3).toFixed(0)+'K';
    return '\\$'+v.toFixed(0);
  }
  function fmtFull(v) {
    if (v == null) return '-';
    var abs = Math.abs(v);
    if (abs >= 1e9) return (v/1e9).toFixed(2)+'B';
    if (abs >= 1e6) return (v/1e6).toFixed(2)+'M';
    if (abs >= 1e3) return (v/1e3).toFixed(1)+'K';
    return v.toFixed(0);
  }
  function fmtGEXShort(val) {
    if (!val || val === 0) return '0';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '+';
    if (abs >= 1e6) return sign+(abs/1e6).toFixed(1)+'M';
    if (abs >= 1e3) return sign+(abs/1e3).toFixed(0)+'K';
    return sign+abs.toFixed(0);
  }
  function fmtM(v) {
    if (v == null) return '\\u2014';
    var abs = Math.abs(v);
    if (abs >= 1e9) return (v/1e9).toFixed(2)+'B';
    if (abs >= 1e6) return (v/1e6).toFixed(1)+'M';
    if (abs >= 1e3) return (v/1e3).toFixed(1)+'K';
    return v.toFixed(1);
  }

  /* ── Decision Bar ── */
  function renderDecisionBar(intel) {
    var el = document.getElementById('gex-decision-bar');
    if (!el) return;
    if (!intel || !intel.regime) {
      var tv = state.ticker || 'SPY';
      el.innerHTML = '<div class="gex-ticker-group"><input type="text" class="gex-ticker-input" id="gexCombinedTicker" value="' + tv + '" placeholder="SPY" maxlength="6" autocomplete="off" /><button class="gex-ticker-load" id="gexCombinedLoad">GO</button><div class="gex-ticker-dd" id="gexCombinedDD"></div></div><div class="gex-db-item"><span class="gex-db-value">Awaiting data\\u2026</span></div><button class="gex-pro-toggle' + (state.proView ? ' active' : '') + '" id="gexProToggle">Pro View</button>';
      return;
    }
    var r = intel.regime || {};
    var regime = r.name || r.regime || 'neutral';
    // Override regime if macro risk is high
    if (intel.macro && intel.macro.riskScore > 0.5) regime = 'EVENT_RISK';
    var confidence = r.confidence != null ? (r.confidence * 100).toFixed(0) : '--';
    var danger = r.dangerScore != null ? r.dangerScore : 0;
    var isTrading = (r.confidence > 0.6 && danger < 0.7);
    var statusClass = isTrading ? 'gex-status-trade' : 'gex-status-wait';
    var statusText = isTrading ? 'TRADE' : 'WAIT';
    var riskClass = danger > 0.7 ? 'gex-risk-high' : (danger > 0.4 ? 'gex-risk-med' : 'gex-risk-low');
    var riskText = danger > 0.7 ? 'HIGH' : (danger > 0.4 ? 'MED' : 'LOW');
    var invalidation = r.invalidation || r.flipStrike || '--';
    var playbook = r.playbook || '--';
    var spot = intel.spot || (state.gridData && state.gridData.spot) || '--';
    var liveClass = state.sseConnected ? '' : ' disconnected';

    var page = document.getElementById('page-gex');
    if (page) {
      page.className = page.className.replace(/regime-\\S+/g, '').trim();
      page.classList.add('regime-' + regime.toLowerCase().replace(/[^a-z]/g, ''));
    }

    var tickerVal = state.ticker || 'SPY';
    el.innerHTML =
      '<div class="gex-ticker-group"><input type="text" class="gex-ticker-input" id="gexCombinedTicker" value="' + tickerVal + '" placeholder="SPY" maxlength="6" autocomplete="off" /><button class="gex-ticker-load" id="gexCombinedLoad">GO</button><div class="gex-ticker-dd" id="gexCombinedDD"></div></div>' +
      '<div class="gex-db-item"><span class="gex-db-label">SPOT</span><span class="gex-db-value">' + spot + '</span></div>' +
      '<div class="gex-db-item"><span class="gex-regime-badge gex-regime-' + regime.toLowerCase().replace(/[^a-z]/g, '') + '-badge">' + regime + ' <span class="gex-live-dot' + liveClass + '"></span></span></div>' +
      '<div class="gex-db-item"><span class="gex-db-label">STATUS</span><span class="gex-db-value ' + statusClass + '">' + statusText + '</span></div>' +
      '<div class="gex-db-item"><span class="gex-db-label">RISK</span><span class="gex-db-value ' + riskClass + '">' + riskText + '</span></div>' +
      '<div class="gex-db-item gex-db-pro"><span class="gex-db-label">RC</span><span class="gex-db-value">' + confidence + '%</span></div>' +
      '<div class="gex-db-item gex-db-pro"><span class="gex-db-label">INVAL</span><span class="gex-db-value">' + invalidation + '</span></div>' +
      '<div class="gex-db-item gex-db-pro"><span class="gex-db-label">PLAY</span><span class="gex-db-value">' + playbook + '</span></div>' +
      (intel.macro && intel.macro.highestEvent && !intel.macro.highestEvent.released && intel.macro.highestEvent.msUntil < 14400000 ?
        '<div class="gex-db-item"><span class="gex-db-label">EVENT</span><span class="gex-db-value ' + (intel.macro.highestEvent.msUntil < 3600000 ? 'macro-countdown-urgent' : 'macro-countdown-warning') + '">' + intel.macro.highestEvent.event + ' ' + intel.macro.highestEvent.countdown + '</span></div>' : '') +
      (function() {
        var gc = intel.gexChange;
        var deltaPct = gc && gc.gexDeltaPct != null ? gc.gexDeltaPct : null;
        var deltaStr = deltaPct != null ? (deltaPct > 0 ? '\u25B2 +' : deltaPct < 0 ? '\u25BC ' : '') + deltaPct.toFixed(1) + '%' : '--';
        var deltaClass = deltaPct != null ? (deltaPct > 0 ? 'bullish' : deltaPct < 0 ? 'bearish' : 'neutral') : 'neutral';
        var gexVol = intel.totalNetGEXVol || 0;
        var gexVolStr = gexVol !== 0 ? (gexVol > 0 ? '+' : '') + '$' + (Math.abs(gexVol) >= 1e9 ? (gexVol / 1e9).toFixed(1) + 'B' : Math.abs(gexVol) >= 1e6 ? (gexVol / 1e6).toFixed(1) + 'M' : (gexVol / 1e3).toFixed(0) + 'K') : '--';
        var gexVolClass = gexVol > 0 ? 'bullish' : gexVol < 0 ? 'bearish' : 'neutral';
        var ar = intel.activityRatio || 0;
        var arStr = ar > 0 ? ar.toFixed(2) : '--';
        var arClass = ar > 1.5 ? 'macro-countdown-warning' : 'neutral';
        return '<div class="gex-db-item gex-db-pro"><span class="gex-db-label">GEX \u0394</span><span class="gex-db-value ' + deltaClass + '">' + deltaStr + '</span></div>' +
          '<div class="gex-db-item gex-db-pro"><span class="gex-db-label">GEX Vol</span><span class="gex-db-value ' + gexVolClass + '">' + gexVolStr + '</span></div>' +
          '<div class="gex-db-item gex-db-pro"><span class="gex-db-label">Act.</span><span class="gex-db-value ' + arClass + '">' + arStr + '</span></div>';
      })() +
      (function() {
        var dp = intel.dealerPositioning;
        if (dp && dp.netDealerDelta !== 0) {
          var arrow = dp.netDealerDelta > 0 ? '\u2191' : '\u2193';
          var color = dp.netDealerDelta > 0 ? '#22c55e' : '#ef4444';
          var abs = Math.abs(dp.netDealerDelta);
          var formatted = abs >= 1e6 ? (dp.netDealerDelta/1e6).toFixed(1) + 'M' : abs >= 1e3 ? (dp.netDealerDelta/1e3).toFixed(0) + 'K' : dp.netDealerDelta.toString();
          return '<div class="gex-db-item gex-db-pro"><span class="gex-db-label">Dealer \u0394</span><span class="gex-db-value" style="color:' + color + '">' + arrow + ' ' + formatted + '</span></div>';
        }
        return '';
      })() +
      '<div class="gex-db-item"><span id="gex-intel-age" class="gex-intel-age"></span></div>' +
      '<button class="gex-pro-toggle' + (state.proView ? ' active' : '') + '" id="gexProToggle">Pro View</button>';
  }

  /* ── Prediction Bar ── */
  function renderPredictionBar() {
    var el = document.getElementById('gex-prediction-bar');
    if (!el) return;
    var ms = state.ms;
    if (!ms || !ms.polr) { el.style.display = 'none'; return; }
    var polr = ms.polr;
    var dir = polr.direction;
    var conf = polr.confidence || {};
    var probPct = Math.round((conf.overall || polr.probability || 0.5) * 100);
    var spot = ms.spot || 0;

    // Multi-target display from POLR v2
    var primary = polr.primaryTarget;
    var near = polr.nearTermTarget;
    var ext = polr.extensionTarget;
    var bkdn = polr.breakdownTarget;

    var arrow = dir === 'up' ? '\u2B06' : dir === 'down' ? '\u2B07' : '\u2194';
    var arrowCls = dir === 'up' ? 'up' : dir === 'down' ? 'down' : 'neutral';
    var probCls = probPct >= 65 ? 'high' : probPct >= 52 ? 'med' : 'low';
    var qualLabel = conf.dataQuality || 'medium';
    var qualCls = qualLabel === 'high' ? 'qual-high' : qualLabel === 'low' ? 'qual-low' : 'qual-med';

    // Build targets line
    var targets = [];
    if (primary) targets.push('Primary: $' + primary.strike.toFixed(0) + ' (' + primary.label + ') ' + Math.round(primary.probability * 100) + '%');
    if (near) targets.push('Near: $' + near.strike.toFixed(0) + ' (' + near.label + ') ' + Math.round(near.probability * 100) + '%');
    if (ext) targets.push('Ext: $' + ext.strike.toFixed(0) + ' ' + Math.round((ext.chainedProbability || 0) * 100) + '%');

    var text;
    if (dir === 'neutral') {
      text = 'Sideways \u2014 low conviction';
      if (primary) text += ' | Range $' + (bkdn ? bkdn.strike.toFixed(0) : '?') + '-$' + primary.strike.toFixed(0);
    } else {
      text = targets.join('  |  ');
    }

    var qualHtml = '<span class="pred-qual ' + qualCls + '">Data: ' + qualLabel.charAt(0).toUpperCase() + qualLabel.slice(1) + '</span>';
    if (qualLabel === 'low') qualHtml += '<span class="pred-warn">Treat as directional bias only</span>';

    // Compression Pocket indicator
    var cpHtml = '';
    var cp = polr.compressionPocket;
    if (cp && cp.detected) {
      var cpStatus = cp.breakoutConfirmed ? 'BREAKOUT ' + (cp.breakoutDirection||'').toUpperCase() :
                     cp.falseBreak ? 'FALSE BREAK' : 'ACTIVE';
      cpHtml = '<span class="pred-compress">' + cpStatus +
        ' $' + cp.zone[0] + '-$' + cp.zone[1] +
        ' | Grad: ' + (cp.gammaGradientScore || '?') +
        ' | Whipsaw ' + cp.whipsawRisk + '%' +
        ' | Bias: ' + cp.breakoutBias + '</span>';
    }

    // Regime Shift indicator
    var rsHtml = '';
    var rs = state.ms && state.ms.sessionForecast && state.ms.sessionForecast.regimeShift;
    if (rs && rs.state !== 'STABLE') {
      var rsColor = rs.state === 'ACTIVE_SHIFT' ? (rs.direction === 'bullish' ? '#22c55e' : '#ef4444') : '#fb923c';
      rsHtml = '<span style="font-size:10px;padding:2px 6px;border-radius:3px;margin-left:6px;' +
        'background:' + rsColor + '22;color:' + rsColor + ';border:1px solid ' + rsColor + '44">' +
        rs.state.replace('_', ' ') + (rs.direction ? ' ' + rs.direction.toUpperCase() : '') +
        (rs.confidence ? ' ' + rs.confidence + '%' : '') + '</span>';
    }

    el.innerHTML = '<span class="pred-arrow ' + arrowCls + '">' + arrow + '</span>' +
      '<span class="pred-text">' + text + '</span>' +
      '<span class="pred-prob ' + probCls + '">' + probPct + '% ' + dir.toUpperCase() + '</span>' +
      qualHtml + cpHtml + rsHtml;
    el.style.display = '';
  }

  /* ── What Matters Strip ── */
  function renderMattersStrip(intel) {
    var el = document.getElementById('gex-matters-strip');
    if (!el) return;
    if (!intel) { el.innerHTML = ''; return; }
    var dom = intel.dominantExpiry || {};
    var cluster = intel.cluster || {};
    var accel = intel.accelerationZone || {};
    var conv = intel.convexity || '';
    var chips = [];
    if (dom.expiry && dom.expiry !== '--') chips.push('<span class="gex-chip"><span class="gex-chip-label">Dominant: </span><span class="gex-chip-value">' + dom.expiry + ' (' + ((dom.weight||0)*100).toFixed(0) + '%)</span></span>');
    if (cluster.range && cluster.range !== '--') chips.push('<span class="gex-chip"><span class="gex-chip-label">Cluster: </span><span class="gex-chip-value">' + cluster.range + '</span></span>');
    if (accel.range && accel.range !== '--') chips.push('<span class="gex-chip"><span class="gex-chip-label">Accel Zone: </span><span class="gex-chip-value">' + accel.range + '</span></span>');
    if (conv && conv !== '--') chips.push('<span class="gex-chip"><span class="gex-chip-label">Convexity: </span><span class="gex-chip-value">' + conv + '</span></span>');
    el.innerHTML = chips.join('');
  }

  /* ── Palette Toolbar ── */
  function renderToolbar() {
    var el = document.getElementById('gex-toolbar');
    if (!el) return;
    var names = ['singularity','redgreen','protanopia','tritanopia'];
    var html = '<span style="margin-right:6px;">Palette:</span>';
    for (var i = 0; i < names.length; i++) {
      var active = (state.palette === names[i]) ? ' active' : '';
      html += '<div class="gex-pal-btn gex-pal-' + names[i] + active + '" data-pal="' + names[i] + '" title="' + names[i] + '"></div>';
    }
    var metrics = [
      {key:'pct',label:'$/1%',tip:'OI \\u00D7 \\u03B3 \\u00D7 100 \\u00D7 S\\u00B2 \\u00D7 0.01 — Industry standard dollar gamma per 1% move'},
      {key:'dollar',label:'$/$1',tip:'OI \\u00D7 \\u03B3 \\u00D7 100 \\u00D7 S — Dollar gamma per $1 move'},
      {key:'shares',label:'Shares/$1',tip:'OI \\u00D7 \\u03B3 \\u00D7 100 — Hedge shares per $1 move'}
    ];
    html += '<div class="gex-mode-group"><span style="margin-right:4px;">Metric:</span>';
    for (var m = 0; m < metrics.length; m++) {
      var mActive = (state.gexMetric === metrics[m].key) ? ' active' : '';
      html += '<div class="gex-mode-btn' + mActive + '" data-metric="' + metrics[m].key + '" title="' + metrics[m].tip + '">' + metrics[m].label + '</div>';
    }
    html += '</div>';
    // Range slider
    html += '<div class="gex-range-group"><span class="gex-range-label">Range</span><input type="range" class="gex-range-input" id="gex-range-slider" min="5" max="40" value="' + state.range + '" /><span class="gex-range-val" id="gex-range-val">\\u00B1' + state.range + '</span></div>';
    el.innerHTML = html;
  }

  /* ── Overlay map from intel + MarketState ── */
  function buildOverlayMap(intel, ms) {
    var map = {};
    function ensure(s) { if (!map[s]) map[s] = {}; return map[s]; }

    /* Intel-based overlays (existing) */
    if (intel && intel.overlays) {
      var ov = intel.overlays;
      if (ov.callWall && ov.callWall.strike) ensure(ov.callWall.strike).callWall = true;
      if (ov.putWall && ov.putWall.strike) ensure(ov.putWall.strike).putWall = true;
      if (ov.flipStrike != null) { ensure(Math.round(ov.flipStrike)).flip = true; ensure(ov.flipStrike).flip = true; }
      if (ov.magnetCluster) { for (var i = 0; i < ov.magnetCluster.length; i++) { if (ov.magnetCluster[i].strike != null) ensure(ov.magnetCluster[i].strike).magnet = true; } }
      if (ov.dangerZones) { for (var j = 0; j < ov.dangerZones.length; j++) { var dz = ov.dangerZones[j]; var ds = (typeof dz === 'number') ? dz : dz.strike; if (ds != null) ensure(ds).danger = true; } }
      if (ov.riskStrikes) { for (var k = 0; k < ov.riskStrikes.length; k++) { if (ov.riskStrikes[k] != null) ensure(ov.riskStrikes[k]).risk = true; } }
    }

    /* MarketState-based overlays (Phase 4) */
    if (ms) {
      var struct = ms.structural || {};
      var polr = ms.polr || {};
      var vol = ms.vol || {};

      /* A) PoLR corridor — mark strikes in upPath/downPath */
      function markPath(path, dir) {
        if (!path || !path.length) return;
        for (var p = 0; p < path.length; p++) {
          var seg = path[p];
          var fromS = Math.round(seg.from); var toS = Math.round(seg.to);
          var lo = Math.min(fromS, toS); var hi = Math.max(fromS, toS);
          for (var s = lo; s <= hi; s++) {
            var e = ensure(s);
            e.polr = true;
            e.polrDir = dir;
            e.polrType = seg.type; // wall, pocket, flip, void
          }
        }
        // Mark the primary target (first obstacle, not distant wall)
        var firstSeg = path[0];
        if (firstSeg) {
          var targetStrike = dir === 'up' ? Math.round(Math.max(firstSeg.from, firstSeg.to)) : Math.round(Math.min(firstSeg.from, firstSeg.to));
          ensure(targetStrike).polrTarget = true;
          ensure(targetStrike).polrTargetDir = dir;
        }
      }
      if (polr.direction === 'up' || polr.direction === 'neutral') markPath(polr.upPath, 'up');
      if (polr.direction === 'down' || polr.direction === 'neutral') markPath(polr.downPath, 'down');

      /* B) Battle zones — strikes near spot with high OI within ±expectedMove */
      var em = vol.expectedMove;
      if (em && em.length && ms.spot) {
        var lower = em[0].lower; var upper = em[0].upper;
        if (lower != null && upper != null) {
          for (var bz = Math.round(lower); bz <= Math.round(upper); bz++) {
            ensure(bz).battleZone = true;
          }
        }
      }

      /* C) Acceleration zones — liquidity pockets */
      var pockets = struct.liquidityPockets || [];
      for (var lp = 0; lp < pockets.length; lp++) {
        var pk = pockets[lp];
        if (pk.from != null && pk.to != null) {
          for (var az = Math.round(pk.from); az <= Math.round(pk.to); az++) {
            ensure(az).accelZone = true;
          }
        }
      }

      /* D) Compression Pocket zone */
      var cp = polr.compressionPocket;
      if (cp && cp.detected && cp.zone) {
        for (var cpz = Math.round(cp.zone[0]); cpz <= Math.round(cp.zone[1]); cpz++) {
          ensure(cpz).compression = true;
        }
      }

      /* E) Fragility tags on call/put walls */
      var cw = struct.callWall; var pw = struct.putWall;
      if (cw && cw.strike) {
        var ce = ensure(cw.strike);
        ce.fragilityLabel = cw.fragilityLabel || '';
        ce.fragilityVal = cw.fragility ? cw.fragility.fragility : null;
      }
      if (pw && pw.strike) {
        var pe = ensure(pw.strike);
        pe.fragilityLabel = pw.fragilityLabel || '';
        pe.fragilityVal = pw.fragility ? pw.fragility.fragility : null;
      }
    }

    return map;
  }

  /* ── Helpers for annotations ── */
  function todayStr() {
    var d = new Date(); var mm = String(d.getMonth()+1).padStart(2,'0');
    var dd = String(d.getDate()).padStart(2,'0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function renderLegend() {
    var el = document.getElementById('gex-legend');
    if (!el) return;
    var pal = PALETTES[state.palette] || PALETTES.redgreen;
    var negColor = 'rgb('+pal.negR+','+pal.negG+','+pal.negB+')';
    var posColor = 'rgb('+pal.posR+','+pal.posG+','+pal.posB+')';
    var h = '<div class="gex-legend-scale"><span>Neg GEX</span>';
    h += '<div class="gex-legend-gradient" style="background:linear-gradient(90deg,'+negColor+',rgb(22,28,45),'+posColor+')"></div>';
    h += '<span>Pos GEX</span></div>';
    h += '<div class="gex-legend-oi-item"><div class="gex-legend-oi-swatch" style="background:#22c55e"></div><span>Call OI</span></div>';
    h += '<div class="gex-legend-oi-item"><div class="gex-legend-oi-swatch" style="background:#ef4444"></div><span>Put OI</span></div>';
    h += '<div class="gex-legend-oi-item"><div class="gex-legend-oi-swatch" style="background:rgba(34,197,94,0.85);border-radius:3px;width:auto;height:auto;padding:1px 4px;font-size:8px;font-weight:700;color:#fff">\u2B06 Ceiling</div></div>';
    h += '<div class="gex-legend-oi-item"><div class="gex-legend-oi-swatch" style="background:rgba(239,68,68,0.85);border-radius:3px;width:auto;height:auto;padding:1px 4px;font-size:8px;font-weight:700;color:#fff">\u2B07 Floor</div></div>';
    h += '<div class="gex-legend-oi-item"><div class="gex-legend-oi-swatch" style="background:rgba(168,85,247,0.85);border-radius:3px;width:auto;height:auto;padding:1px 4px;font-size:8px;font-weight:700;color:#fff">\u26A1 Flip</div></div>';
    h += '<div class="gex-legend-summary">';
    h += '<span>Call OI: ' + fmtK(state._totalCallOI) + '</span>';
    h += '<span>Put OI: ' + fmtK(state._totalPutOI) + '</span>';
    var ratio = state._totalPutOI > 0 ? (state._totalCallOI / state._totalPutOI).toFixed(2) : '--';
    h += '<span>P/C: ' + ratio + '</span>';
    h += '</div>';
    el.innerHTML = h;
  }

  /* Pick the right GEX value from a cell based on selected metric */
  function cellVal(cell) {
    if (!cell) return 0;
    if (state.gexMetric === 'shares') return cell.netShares || cell.net || 0;
    if (state.gexMetric === 'dollar') return cell.netDollar || cell.net || 0;
    return cell.net || 0; // pct (default) — net is already dollar/1%
  }
  function cellCallVal(cell) {
    if (!cell) return 0;
    if (state.gexMetric === 'shares') return cell.callShares || cell.call || 0;
    if (state.gexMetric === 'dollar') return cell.callDollar || cell.call || 0;
    return cell.call || 0;
  }
  function cellPutVal(cell) {
    if (!cell) return 0;
    if (state.gexMetric === 'shares') return cell.putShares || cell.put || 0;
    if (state.gexMetric === 'dollar') return cell.putDollar || cell.put || 0;
    return cell.put || 0;
  }
  function fmtMetric(v) {
    if (state.gexMetric === 'shares') return fmt(v);
    return fmtDollar(v);
  }

  function fmtK(n) {
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return String(n);
  }

  /* ── OI Summary Bar ── */
  function renderOISummary() {
    var el = document.getElementById('gex-oi-summary');
    if (!el) return;
    var totalOI = state._totalCallOI + state._totalPutOI;
    var pcRatio = state._totalPutOI > 0 ? (state._totalCallOI / state._totalPutOI).toFixed(2) : '--';
    var hcv = state._highestCallVol || {}; var hpv = state._highestPutVol || {};
    var h = '';
    h += '<div class="oi-stat"><span class="oi-stat-label">Total OI</span><span class="oi-stat-val accent-color">' + fmtK(totalOI) + '</span></div>';
    h += '<div class="oi-stat"><span class="oi-stat-label">Call OI</span><span class="oi-stat-val call-color">' + fmtK(state._totalCallOI) + '</span></div>';
    h += '<div class="oi-stat"><span class="oi-stat-label">Put OI</span><span class="oi-stat-val put-color">' + fmtK(state._totalPutOI) + '</span></div>';
    h += '<div class="oi-stat"><span class="oi-stat-label">P/C Ratio</span><span class="oi-stat-val">' + pcRatio + '</span></div>';
    if (hcv.strike) h += '<div class="oi-stat"><span class="oi-stat-label">Highest Call Vol</span><span class="oi-stat-val call-color">' + fmtK(hcv.vol) + ' @ ' + hcv.strike + '</span></div>';
    if (hpv.strike) h += '<div class="oi-stat"><span class="oi-stat-label">Highest Put Vol</span><span class="oi-stat-val put-color">' + fmtK(hpv.vol) + ' @ ' + hpv.strike + '</span></div>';
    el.innerHTML = h;
  }

  /* ── Ticker Price Scroll Strip ── */
  var TICKER_LIST = ['SPY','QQQ','IWM','DIA','AAPL','TSLA','NVDA','MSFT','AMZN','META'];
  var tickerPriceCache = {};

  function renderTickerStrip() {
    var el = document.getElementById('gex-ticker-strip');
    if (!el) return;
    var h = '';
    for (var i = 0; i < TICKER_LIST.length; i++) {
      var tk = TICKER_LIST[i];
      var cached = tickerPriceCache[tk] || {};
      var price = cached.price ? '$' + cached.price.toFixed(2) : '--';
      var chg = cached.change || 0; var chgPct = cached.changePct || 0;
      var chgCls = chg >= 0 ? 'up' : 'down';
      var chgStr = cached.price ? (chg >= 0 ? '\\u2191' : '\\u2193') + ' ' + Math.abs(chg).toFixed(2) + ' (' + Math.abs(chgPct).toFixed(2) + '%)' : '';
      var activeCls = (tk === state.ticker) ? ' active' : '';
      h += '<div class="ticker-item' + activeCls + '" data-ticker="' + tk + '">';
      h += '<span class="ticker-sym">' + tk + '</span>';
      h += '<span class="ticker-price">' + price + '</span>';
      if (chgStr) h += '<span class="ticker-chg ' + chgCls + '">' + chgStr + '</span>';
      h += '</div>';
    }
    el.innerHTML = h;
    /* Click handlers */
    var items = el.querySelectorAll('.ticker-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', function() {
        var tk2 = this.getAttribute('data-ticker');
        if (tk2 !== state.ticker) { switchTicker(tk2); }
      });
    }
  }

  function fetchTickerPrices() {
    /* Fetch spot prices for all tickers in the strip */
    for (var i = 0; i < TICKER_LIST.length; i++) {
      (function(tk) {
        fetch('/api/gex/heatmap/' + tk + '?range=5', { headers: headers() })
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(d) {
            if (d && (d.spot || d.spotPrice)) {
              var spot = parseFloat(d.spot || d.spotPrice);
              var prev = tickerPriceCache[tk] || {};
              var oldPrice = prev.price || spot;
              tickerPriceCache[tk] = {
                price: spot,
                change: spot - oldPrice,
                changePct: oldPrice > 0 ? ((spot - oldPrice) / oldPrice) * 100 : 0
              };
            }
          }).catch(function() {});
      })(TICKER_LIST[i]);
    }
  }

  /* ── Volume Histogram ── */
  function renderVolumeHistogram(data) {
    var el = document.getElementById('gex-vol-histogram');
    if (!el || !data) return;
    var expiries = data.expiries || []; var matrix = data.matrix || {};
    var strikes = data.strikes || [];
    if (!expiries.length) { el.innerHTML = ''; return; }
    /* Aggregate volume per expiry (first expiry = 0DTE focus) */
    var callVolByExp = {}; var putVolByExp = {}; var maxVol = 0;
    for (var e = 0; e < expiries.length; e++) {
      var cv = 0; var pv = 0;
      for (var s = 0; s < strikes.length; s++) {
        var row = matrix[strikes[s]] || {}; var cell = row[expiries[e]];
        if (cell) { cv += (cell.callVol || cell.callOI || 0); pv += (cell.putVol || cell.putOI || 0); }
      }
      callVolByExp[expiries[e]] = cv; putVolByExp[expiries[e]] = pv;
      if (cv + pv > maxVol) maxVol = cv + pv;
    }
    var h = '<span class="gex-vol-histogram-label">Volume</span>';
    for (var e2 = 0; e2 < expiries.length; e2++) {
      var cv2 = callVolByExp[expiries[e2]]; var pv2 = putVolByExp[expiries[e2]];
      var total = cv2 + pv2;
      var callH = maxVol > 0 ? (cv2 / maxVol * 36) : 0;
      var putH = maxVol > 0 ? (pv2 / maxVol * 36) : 0;
      h += '<div class="vol-bar-wrap">';
      h += '<div class="vol-bar-call" style="height:' + callH.toFixed(1) + 'px"></div>';
      h += '<div class="vol-bar-put" style="height:' + putH.toFixed(1) + 'px"></div>';
      h += '</div>';
    }
    el.innerHTML = h;
  }

  /* ── Grid rendering ── */
  function renderGrid(data, intel) {
    var el = document.getElementById('gex-grid');
    var loading = document.getElementById('gex-loading');
    if (!el || !data) return;
    var strikes = data.strikes || [];
    var expiries = data.expiries || [];
    var matrix = data.matrix || {};
    var netByExpiry = data.netByExpiry || {};
    if (!strikes.length || !expiries.length) { if (loading) loading.style.display = 'flex'; return; }
    if (loading) loading.style.display = 'none';

    var maxPos = 0, maxNeg = 0;
    for (var si = 0; si < strikes.length; si++) {
      var row = matrix[strikes[si]] || {};
      for (var ei = 0; ei < expiries.length; ei++) {
        var c = row[expiries[ei]]; var v = c ? c.net : 0;
        if (v > 0 && v > maxPos) maxPos = v;
        if (v < 0 && Math.abs(v) > maxNeg) maxNeg = Math.abs(v);
      }
    }

    var netByStrike = {}; var maxStrikeAbs = 0;
    var metricByStrike = {}; var maxMetricAbs = 0;
    for (var si2 = 0; si2 < strikes.length; si2++) {
      var sum = 0; var msum = 0; var row2 = matrix[strikes[si2]] || {};
      for (var ei2 = 0; ei2 < expiries.length; ei2++) {
        var c2 = row2[expiries[ei2]];
        sum += (c2 ? c2.net : 0);
        msum += cellVal(c2);
      }
      netByStrike[strikes[si2]] = sum;
      metricByStrike[strikes[si2]] = msum;
      if (Math.abs(sum) > maxStrikeAbs) maxStrikeAbs = Math.abs(sum);
      if (Math.abs(msum) > maxMetricAbs) maxMetricAbs = Math.abs(msum);
    }

    var sorted = strikes.slice().sort(function(a, b) { return Math.abs(netByStrike[b]) - Math.abs(netByStrike[a]); });
    var top3 = {}; for (var t = 0; t < Math.min(3, sorted.length); t++) top3[sorted[t]] = true;
    var domExpiry = (intel && intel.dominantExpiry) ? intel.dominantExpiry.expiry : null;
    var spotPrice = data.spot || data.spotPrice || (intel && intel.spot) || null;
    var spotStrike = null;
    if (spotPrice != null) {
      var minDiff = Infinity;
      for (var sp = 0; sp < strikes.length; sp++) {
        var diff = Math.abs(parseFloat(strikes[sp]) - parseFloat(spotPrice));
        if (diff < minDiff) { minDiff = diff; spotStrike = strikes[sp]; }
      }
    }

    /* ── OI aggregation pre-pass ── */
    var oiByStrike = {}; var totalCallOI = 0; var totalPutOI = 0;
    var maxCellOI = 0; var today = todayStr(); var zeroExpiry = null;
    var highCallVol = { strike: null, vol: 0 }; var highPutVol = { strike: null, vol: 0 };
    var volByStrike = {};
    for (var oi1 = 0; oi1 < strikes.length; oi1++) {
      var sk = strikes[oi1]; var rw = matrix[sk] || {}; var skCallOI = 0; var skPutOI = 0;
      var skCallVol = 0; var skPutVol = 0;
      for (var oi2 = 0; oi2 < expiries.length; oi2++) {
        var cc = rw[expiries[oi2]];
        if (cc) {
          skCallOI += (cc.callOI || 0); skPutOI += (cc.putOI || 0);
          skCallVol += (cc.callVol || 0); skPutVol += (cc.putVol || 0);
          var cellTotalOI = (cc.callOI||0) + (cc.putOI||0);
          if (cellTotalOI > maxCellOI) maxCellOI = cellTotalOI;
        }
        if (expiries[oi2] === today) zeroExpiry = today;
      }
      oiByStrike[sk] = { call: skCallOI, put: skPutOI, total: skCallOI + skPutOI };
      volByStrike[sk] = { call: skCallVol, put: skPutVol };
      if (skCallVol > highCallVol.vol) { highCallVol = { strike: sk, vol: skCallVol }; }
      if (skPutVol > highPutVol.vol) { highPutVol = { strike: sk, vol: skPutVol }; }
      totalCallOI += skCallOI; totalPutOI += skPutOI;
    }
    state._totalCallOI = totalCallOI; state._totalPutOI = totalPutOI;
    state._highestCallVol = highCallVol; state._highestPutVol = highPutVol;
    /* Pill thresholds — top 10% */
    var allCallOIs = []; var allPutOIs = [];
    for (var pk in oiByStrike) { allCallOIs.push(oiByStrike[pk].call); allPutOIs.push(oiByStrike[pk].put); }
    allCallOIs.sort(function(a,b){return b-a;}); allPutOIs.sort(function(a,b){return b-a;});
    var pillCallThresh = allCallOIs[Math.floor(allCallOIs.length*0.1)] || Infinity;
    var pillPutThresh = allPutOIs[Math.floor(allPutOIs.length*0.1)] || Infinity;
    var cellOIThreshold = maxCellOI * 0.75;

    /* Highest OI strike */
    var highestOIStrike = null; var highestOIVal = 0;
    for (var hk in oiByStrike) {
      if (oiByStrike[hk].total > highestOIVal) { highestOIVal = oiByStrike[hk].total; highestOIStrike = hk; }
    }

    /* Max Pain approximation (strike with minimum net abs GEX — closest to zero) */
    var maxPainStrike = null; var minAbsNet = Infinity;
    for (var mp in netByStrike) {
      var absN = Math.abs(netByStrike[mp]);
      if (absN < minAbsNet) { minAbsNet = absN; maxPainStrike = mp; }
    }

    var maxOIBar = 0;
    for (var ob in oiByStrike) {
      if (oiByStrike[ob].call > maxOIBar) maxOIBar = oiByStrike[ob].call;
      if (oiByStrike[ob].put > maxOIBar) maxOIBar = oiByStrike[ob].put;
    }

    var ovMap = buildOverlayMap(intel, state.ms);
    el.style.gridTemplateColumns = '80px repeat(' + expiries.length + ', minmax(70px, 1fr))';

    var html = '<div class="gex-cell gex-cell-header gex-cell-corner">Strike</div>';
    for (var h2 = 0; h2 < expiries.length; h2++) {
      var domClass = (expiries[h2] === domExpiry) ? ' gex-dominant-header' : '';
      var zdteLabel = (expiries[h2] === zeroExpiry) ? '<span class="gex-0dte-header">0DTE</span>' : '';
      html += '<div class="gex-cell gex-cell-header' + domClass + '">' + expiries[h2] + zdteLabel + '</div>';
    }

    for (var r2 = 0; r2 < strikes.length; r2++) {
      var strike = strikes[r2];
      var structClass = top3[strike] ? ' gex-structural' : '';
      var spotRowClass = (strike === spotStrike) ? ' gex-spot-row' : '';
      var isoClass = (state.isolatedStrike === strike) ? ' gex-isolated' : '';
      /* Enhanced spot label with price badge */
      var spotLabel = '' + strike;
      if (strike === spotStrike && spotPrice != null) {
        spotLabel = strike + '<span class="gex-spot-price-badge">$' + parseFloat(spotPrice).toFixed(2) + '</span>';
      }
      /* Annotation badges */
      var annBadges = '';
      if (strike === maxPainStrike) annBadges += '<span class="gex-strike-maxpain">MAX PAIN</span>';
      if (strike === highestOIStrike) annBadges += '<span class="gex-strike-hoi">HOI</span>';
      /* Inline OI/Vol pills on high-activity strikes */
      var skOI = oiByStrike[strike] || { call:0, put:0 };
      if (skOI.call >= pillCallThresh) annBadges += '<span class="gex-pill gex-pill-call">' + fmtK(skOI.call) + '</span>';
      if (skOI.put >= pillPutThresh) annBadges += '<span class="gex-pill gex-pill-put">' + fmtK(skOI.put) + '</span>';
      var skVol = volByStrike[strike] || { call:0, put:0 };
      if (skVol.call > 0 && strike === highCallVol.strike) annBadges += '<span class="gex-pill gex-pill-prem"><span class="gex-pill-icon">\\u2605</span>' + fmtK(skVol.call) + '</span>';
      if (skVol.put > 0 && strike === highPutVol.strike) annBadges += '<span class="gex-pill gex-pill-prem"><span class="gex-pill-icon">$</span>' + fmtK(skVol.put) + '</span>';
      /* OI bars */
      var strikeOI = oiByStrike[strike] || { call:0, put:0 };
      var callBarW = maxOIBar > 0 ? (strikeOI.call / maxOIBar * 100).toFixed(1) : 0;
      var putBarW = maxOIBar > 0 ? (strikeOI.put / maxOIBar * 100).toFixed(1) : 0;
      var oiBarsHTML = '<div class="gex-oi-bars"><div class="gex-oi-bar-call" style="width:'+callBarW+'%"></div><div class="gex-oi-bar-put" style="width:'+putBarW+'%"></div></div>';

      var sOv = ovMap[parseFloat(strike)] || {};
      var strikeTags = '';
      if (sOv.callWall) strikeTags += '<span class="gex-strike-tag cw">\u2B06 CEILING</span>';
      if (sOv.putWall) strikeTags += '<span class="gex-strike-tag pw">\u2B07 FLOOR</span>';
      if (sOv.flip) strikeTags += '<span class="gex-strike-tag fl">\u26A1 FLIP</span>';
      if (sOv.magnet) strikeTags += '<span class="gex-strike-tag mg">\uD83E\uDDF2 MAGNET</span>';
      if (sOv.danger) strikeTags += '<span class="gex-strike-tag dz">\u26A0 DANGER</span>';
      if (sOv.risk) strikeTags += '<span class="gex-strike-tag rs">\u26A0 RISK</span>';
      /* Phase 4 tags */
      if (sOv.polrTarget) strikeTags += '<span class="gex-strike-tag target">\uD83C\uDFAF TARGET</span>';
      else if (sOv.polr) strikeTags += '<span class="gex-strike-tag polr-' + sOv.polrDir + '">' + (sOv.polrDir === 'up' ? '\u2B06 LIKELY PATH' : '\u2B07 LIKELY PATH') + '</span>';
      if (sOv.battleZone) strikeTags += '<span class="gex-strike-tag bz">\u2694 BATTLE ZONE</span>';
      if (sOv.accelZone) strikeTags += '<span class="gex-strike-tag az">\uD83D\uDE80 FAST MOVE</span>';
      if (sOv.compression) strikeTags += '<span class="gex-strike-tag compress">\uD83D\uDCA5 COMPRESS</span>';
      if (sOv.fragilityLabel) {
        var flCls = sOv.fragilityLabel === 'Fortress' ? 'frag-fortress' : sOv.fragilityLabel === 'Stable' ? 'frag-stable' : sOv.fragilityLabel === 'Weak' ? 'frag-weak' : sOv.fragilityLabel === 'Fragile' ? 'frag-fragile' : '';
        var flLabel = sOv.fragilityLabel === 'Fortress' ? '\uD83D\uDEE1 STRONG' : sOv.fragilityLabel === 'Stable' ? '\u2705 HOLDING' : sOv.fragilityLabel === 'Weak' ? '\u26A0 SHAKY' : '\uD83D\uDCA5 BREAKING';
        if (flCls) strikeTags += '<span class="gex-strike-tag ' + flCls + '">' + flLabel + '</span>';
      }
      var strikeOvClass = '';
      if (sOv.callWall) strikeOvClass = ' gex-ov-call-wall';
      else if (sOv.putWall) strikeOvClass = ' gex-ov-put-wall';
      else if (sOv.flip) strikeOvClass = ' gex-ov-flip';
      else if (sOv.magnet) strikeOvClass = ' gex-ov-magnet';
      else if (sOv.danger) strikeOvClass = ' gex-ov-danger';
      else if (sOv.risk) strikeOvClass = ' gex-ov-risk';
      else if (sOv.compression) strikeOvClass = ' gex-ov-compression';
      else if (sOv.accelZone) strikeOvClass = ' gex-ov-accel';
      else if (sOv.polr) strikeOvClass = ' gex-ov-polr-' + sOv.polrDir;
      if (sOv.polrTarget) strikeOvClass += ' gex-polr-target';
      var strikeContent = spotLabel + annBadges + (strikeTags ? '<div class="gex-strike-tags">' + strikeTags + '</div>' : '') + oiBarsHTML;
      html += '<div class="gex-cell gex-cell-strike' + structClass + spotRowClass + isoClass + strikeOvClass + '" data-strike="' + strike + '">' + strikeContent + '</div>';

      var rowData = matrix[strike] || {};
      for (var c3 = 0; c3 < expiries.length; c3++) {
        var cell = rowData[expiries[c3]];
        var val = cellVal(cell);
        var colorVal = cell ? cell.net : 0; // always use dollar/1% for heatmap coloring
        var bg = gexColor(colorVal, maxPos, maxNeg);
        var cellIsoClass = (state.isolatedStrike === strike) ? ' gex-isolated' : '';
        var totalOI = cell ? (cell.callOI||0)+(cell.putOI||0) : 0;
        var hoiClass = (totalOI >= cellOIThreshold && cellOIThreshold > 0) ? ' gex-cell-hoi' : '';
        var ovClass = '', ovBadge = '';
        if (sOv.callWall) { ovClass=' gex-ov-call-wall'; ovBadge='<span class="gex-overlay-badge">\u2B06 CEIL</span>'; }
        else if (sOv.putWall) { ovClass=' gex-ov-put-wall'; ovBadge='<span class="gex-overlay-badge">\u2B07 FLOOR</span>'; }
        else if (sOv.flip) { ovClass=' gex-ov-flip'; ovBadge='<span class="gex-overlay-badge">\u26A1 FLIP</span>'; }
        else if (sOv.magnet) { ovClass=' gex-ov-magnet'; ovBadge='<span class="gex-overlay-badge">\uD83E\uDDF2 PIN</span>'; }
        else if (sOv.danger) { ovClass=' gex-ov-danger'; ovBadge='<span class="gex-overlay-badge">\u26A0 DANGER</span>'; }
        else if (sOv.risk) { ovClass=' gex-ov-risk'; ovBadge='<span class="gex-overlay-badge">\u26A0 RISK</span>'; }
        else if (sOv.compression) { ovClass=' gex-ov-compression'; }
        else if (sOv.accelZone) { ovClass=' gex-ov-accel'; }
        else if (sOv.polr) { ovClass=' gex-ov-polr-' + sOv.polrDir; }
        if (sOv.battleZone && !ovClass) { ovClass=' gex-ov-battle'; }
        if (sOv.polrTarget) ovClass += ' gex-polr-target';
        var cellContent = fmtMetric(val);
        /* Magnitude bar */
        var magRef = val >= 0 ? maxPos : maxNeg;
        var magW = magRef > 0 ? (Math.abs(val) / magRef * 100).toFixed(1) : 0;
        var magCls = val >= 0 ? 'pos' : 'neg';
        var magBar = (val !== 0) ? '<div class="gex-mag-bar ' + magCls + '" style="width:' + magW + '%"></div>' : '';
        html += '<div class="gex-cell' + spotRowClass + cellIsoClass + ovClass + hoiClass + '" data-strike="' + strike + '" data-expiry="' + expiries[c3] + '" data-val="' + val + '" style="background:' + bg + '">' + cellContent + ovBadge + magBar + '</div>';
      }
    }

    html += '<div class="gex-cell gex-cell-strike gex-cell-net">NET</div>';
    for (var n = 0; n < expiries.length; n++) {
      var nv = netByExpiry[expiries[n]] || 0;
      var nbg = gexColor(nv, maxPos, maxNeg);
      html += '<div class="gex-cell gex-cell-net" style="background:' + (nv === 0 ? 'rgba(15,23,42,0.8)' : nbg) + '">' + fmtMetric(nv) + '</div>';
    }
    el.innerHTML = html;
    state._netByStrike = netByStrike; state._maxStrikeAbs = maxStrikeAbs; state._strikes = strikes;
    state._metricByStrike = metricByStrike; state._maxMetricAbs = maxMetricAbs;
  }

  /* ── Profile ── */
  function renderProfile() {
    var el = document.getElementById('gex-profile');
    if (!el || !state._strikes) return;
    var strikes = state._strikes;
    var metricByStrike = state._metricByStrike || state._netByStrike;
    var maxAbs = state._maxMetricAbs || state._maxStrikeAbs;
    if (!maxAbs) { el.innerHTML = ''; return; }
    var pal = PALETTES[state.palette] || PALETTES.singularity;
    var html = '<div class="gex-profile-title" id="gex-profile-toggle">Net GEX Profile by Strike \\u25BC</div>';
    for (var i = 0; i < strikes.length; i++) {
      var s = strikes[i]; var v = metricByStrike[s] || 0;
      var pct = maxAbs ? Math.abs(v)/maxAbs*100 : 0;
      var t2 = Math.pow(Math.min(Math.abs(v)/maxAbs, 1), 0.6);
      var r2,g2,b2;
      if (v >= 0) { r2=Math.round(pal.posDarkR+(pal.posR-pal.posDarkR)*t2); g2=Math.round(pal.posDarkG+(pal.posG-pal.posDarkG)*t2); b2=Math.round(pal.posDarkB+(pal.posB-pal.posDarkB)*t2); }
      else { r2=Math.round(pal.negDarkR+(pal.negR-pal.negDarkR)*t2); g2=Math.round(pal.negDarkG+(pal.negG-pal.negDarkG)*t2); b2=Math.round(pal.negDarkB+(pal.negB-pal.negDarkB)*t2); }
      html += '<div class="gex-profile-row"><span class="gex-profile-label">' + s + '</span><div class="gex-profile-bar-wrap"><div class="gex-profile-bar" style="width:' + pct.toFixed(1) + '%;background:rgb(' + r2 + ',' + g2 + ',' + b2 + ')"></div></div><span class="gex-profile-val">' + fmtMetric(v) + '</span></div>';
    }
    el.innerHTML = html;
    var toggle = document.getElementById('gex-profile-toggle');
    if (toggle) { toggle.addEventListener('click', function() { el.classList.toggle('expanded'); toggle.textContent = el.classList.contains('expanded') ? 'Net GEX Profile by Strike \\u25B2' : 'Net GEX Profile by Strike \\u25BC'; }); }
  }

  function renderAll() { renderDecisionBar(state.intel); renderMattersStrip(state.intel); renderToolbar(); renderTickerStrip(); renderGrid(state.gridData, state.intel); renderProfile(); renderLegend(); renderOISummary(); renderVolumeHistogram(state.gridData); }

  /* ── Tooltip ── */
  function getStrikeZones(strike) {
    var zones = [];
    if (!state.intel || !state.intel.overlays) return zones;
    var ov = state.intel.overlays; var s = parseFloat(strike);
    if (ov.callWall && ov.callWall.strike === s) zones.push({label:'\u2B06 CEILING \u2014 Price struggles to break above here',cls:'wall'});
    if (ov.putWall && ov.putWall.strike === s) zones.push({label:'\u2B07 FLOOR \u2014 Price bounces here',cls:'wall'});
    if (ov.flipStrike != null && Math.abs(s - ov.flipStrike) < 1) zones.push({label:'\u26A1 FLIP ZONE \u2014 Behavior changes above/below',cls:'flip'});
    if (ov.magnetCluster) { for (var i = 0; i < ov.magnetCluster.length; i++) { if (ov.magnetCluster[i].strike === s) { zones.push({label:'\uD83E\uDDF2 MAGNET \u2014 Price gets pulled here',cls:'magnet'}); break; } } }
    if (ov.dangerZones) { for (var j = 0; j < ov.dangerZones.length; j++) { var dz = ov.dangerZones[j]; if ((typeof dz === 'number' ? dz : dz.strike) === s) { zones.push({label:'\uD83D\uDE80 FAST MOVE ZONE \u2014 Price can move fast here',cls:'accel'}); break; } } }
    if (ov.riskStrikes) { for (var k = 0; k < ov.riskStrikes.length; k++) { if (ov.riskStrikes[k] === s) { zones.push({label:'\u26A0 RISK \u2014 Volatile area',cls:'accel'}); break; } } }
    return zones;
  }

  function setupTooltip() {
    var grid = document.getElementById('gex-grid'); var tip = document.getElementById('gex-tooltip');
    if (!grid || !tip) return;
    grid.addEventListener('mouseover', function(e) {
      var cell = e.target.closest('.gex-cell[data-val]');
      if (!cell) { tip.style.display = 'none'; return; }
      var strike = cell.getAttribute('data-strike'); var expiry = cell.getAttribute('data-expiry');
      var netVal = parseFloat(cell.getAttribute('data-val')) || 0;
      var cellData = null;
      if (state.gridData && state.gridData.matrix && state.gridData.matrix[strike]) cellData = state.gridData.matrix[strike][expiry];
      var callGEX = cellData ? cellData.call : 0; var putGEX = cellData ? cellData.put : 0;
      var callOI = cellData ? cellData.callOI : 0; var putOI = cellData ? cellData.putOI : 0;
      var spotPrice = (state.gridData && state.gridData.spotPrice) || (state.intel && state.intel.spot) || 0;
      var hedgeFlow = spotPrice ? netVal * spotPrice * 0.01 : 0;
      var totalOI = (callOI||0)+(putOI||0); var notionalVal = totalOI * 100 * parseFloat(strike);
      var distPct = spotPrice ? ((parseFloat(strike) - spotPrice) / spotPrice * 100).toFixed(2) : '?';
      var zoneText = netVal >= 0 ? '\u2705 Sticky \u2014 price slows down here' : '\uD83D\uDE80 Slippery \u2014 price moves fast here';
      var zoneCls = netVal >= 0 ? 'stable' : 'accel';
      var zones = getStrikeZones(strike);
      var html = '<div class="gex-tt-title">\\$' + strike + ' \\u2014 ' + expiry + '</div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Net GEX</span><span class="gex-tt-val ' + (netVal >= 0 ? 'gex-tt-pos' : 'gex-tt-neg') + '">' + fmtFull(netVal) + '</span></div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Call GEX</span><span class="gex-tt-val gex-tt-pos">' + fmtFull(callGEX) + '</span></div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Put GEX</span><span class="gex-tt-val gex-tt-neg">' + fmtFull(putGEX) + '</span></div>' +
        '<div class="gex-tt-divider"></div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Call OI</span><span class="gex-tt-val">' + (callOI||0).toLocaleString() + '</span></div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Put OI</span><span class="gex-tt-val">' + (putOI||0).toLocaleString() + '</span></div>' +
        '<div class="gex-tt-divider"></div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Hedge Flow/\\$1</span><span class="gex-tt-val">' + fmtFull(hedgeFlow) + '</span></div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Notional</span><span class="gex-tt-val">' + fmtDollar(notionalVal) + '</span></div>' +
        '<div class="gex-tt-row"><span class="gex-tt-label">Dist to Spot</span><span class="gex-tt-val">' + distPct + '%</span></div>' +
        '<div class="gex-tt-zone ' + zoneCls + '">' + zoneText + '</div>';
      for (var z = 0; z < zones.length; z++) html += '<div class="gex-tt-zone ' + zones[z].cls + '">' + zones[z].label + '</div>';
      tip.innerHTML = html; tip.style.display = 'block';
    });
    grid.addEventListener('mousemove', function(e) {
      var wrap = document.getElementById('gex-grid-wrap'); if (!wrap) return;
      var rect = wrap.getBoundingClientRect();
      var x = e.clientX - rect.left + 14; var y = e.clientY - rect.top + 14;
      if (x + 290 > rect.width) x = e.clientX - rect.left - 300;
      if (y + 320 > rect.height) y = e.clientY - rect.top - 320;
      if (y < 10) y = 10; if (x < 10) x = 10;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    });
    grid.addEventListener('mouseleave', function() { tip.style.display = 'none'; });
  }

  function setupIsolation() {
    var grid = document.getElementById('gex-grid'); if (!grid) return;
    grid.addEventListener('click', function(e) {
      var cell = e.target.closest('.gex-cell[data-strike]'); if (!cell) return;
      var strike = cell.getAttribute('data-strike');
      state.isolatedStrike = (state.isolatedStrike === strike) ? null : strike;
      renderGrid(state.gridData, state.intel);
    });
  }

  function setupPalette() {
    var toolbar = document.getElementById('gex-toolbar'); if (!toolbar) return;
    toolbar.addEventListener('click', function(e) {
      var btn = e.target.closest('.gex-pal-btn');
      if (btn) { var pal = btn.getAttribute('data-pal'); if (pal && PALETTES[pal]) { state.palette = pal; localStorage.setItem('gex-palette', pal); renderAll(); } return; }
      var modeBtn = e.target.closest('.gex-mode-btn');
      if (modeBtn) {
        var metric = modeBtn.getAttribute('data-metric');
        if (metric) { state.gexMetric = metric; localStorage.setItem('gex-metric', metric); renderAll(); }
      }
    });
    toolbar.addEventListener('input', function(e) {
      if (e.target.id === 'gex-range-slider') {
        state.range = parseInt(e.target.value);
        var valEl = document.getElementById('gex-range-val');
        if (valEl) valEl.textContent = '\\u00B1' + state.range;
      }
    });
    toolbar.addEventListener('change', function(e) {
      if (e.target.id === 'gex-range-slider') { load(); startSSE(); }
    });
  }

  /* ── Collapsible strip toggle ── */
  function setupStrips() {
    document.querySelectorAll('#page-gex .gex-strip').forEach(function(strip) {
      strip.addEventListener('click', function(e) {
        if (e.target.closest('.verdict-adv-toggle')) return;
        strip.classList.toggle('expanded');
        var key = 'gex-strip-' + strip.dataset.strip;
        localStorage.setItem(key, strip.classList.contains('expanded') ? '1' : '0');
      });
    });
    ['verdict','positioning','volatility','timing'].forEach(function(name) {
      if (localStorage.getItem('gex-strip-' + name) === '1') {
        var el = document.getElementById('gex-' + name + '-strip');
        if (el) el.classList.add('expanded');
      }
    });
  }

  /* ── Verdict strip summary + body updates ── */
  function updateVerdictStrip(intel) {
    // A) Summary line
    var summary = document.getElementById('gex-verdict-summary');
    if (!summary) return;
    if (!intel || !intel.regime) { summary.innerHTML = '<span class="ss-val" style="color:var(--text-muted)">Awaiting data</span>'; return; }
    var r = intel.regime || {};
    var regime = r.name || 'neutral';
    var playbook = r.playbook || '--';
    var confidence = r.confidence != null ? (r.confidence * 100).toFixed(0) + '%' : '--';
    var regimeColor = regime === 'FRAGILE' ? 'var(--red)' : regime === 'BREAKOUT' ? 'var(--green)' : regime === 'PIN' ? 'var(--accent)' : 'var(--text-muted)';
    var bias = intel.bias || 'neutral';
    var biasArrow = bias === 'bullish' ? '\\u2191' : bias === 'bearish' ? '\\u2193' : '\\u2194';
    var biasColor = bias === 'bullish' ? 'var(--green)' : bias === 'bearish' ? 'var(--red)' : 'var(--text-muted)';
    var d = state.gridData || {};
    var cwStr = d.callWall ? '\\$' + d.callWall.strike : '--';
    var pwStr = d.putWall ? '\\$' + d.putWall.strike : '--';
    var flipStr = d.gammaFlip ? '\\$' + d.gammaFlip : '--';
    var netGexStr = d.totalNetGEX != null ? (d.totalNetGEX >= 0 ? '+' : '') + fmtM(d.totalNetGEX) : '--';
    summary.innerHTML = '<span class="ss-val" style="color:' + regimeColor + ';font-weight:800">' + regime + '</span>' +
      '<span class="ss-val">' + confidence + '</span>' +
      '<span class="ss-val bias-arrow" style="color:' + biasColor + '">' + biasArrow + bias.toUpperCase() + '</span>' +
      '<span class="ss-label">CW</span><span class="ss-val">' + cwStr + '</span>' +
      '<span class="ss-label">PW</span><span class="ss-val">' + pwStr + '</span>' +
      '<span class="ss-label">Flip</span><span class="ss-val">' + flipStr + '</span>' +
      '<span class="ss-label">Net</span><span class="ss-val">' + netGexStr + '</span>';

    // B) Verdict body — needs gridData with imbalance
    var d = state.gridData;
    if (!d || !d.imbalance) return;
    var imb = d.imbalance;
    var m = MODE_MAP[imb.imbalanceType] || MODE_MAP.UNKNOWN;

    var modeEl = document.getElementById('gexVerdictMode');
    if (modeEl) { modeEl.textContent = m.mode; modeEl.style.color = m.color; }

    var pillsEl = document.getElementById('gexVerdictPills');
    if (pillsEl) {
      var hp = (d.hedgePressure && d.hedgePressure.pressure) || { label: 'LOW', score: 0 };
      var pClass = hp.label === 'HIGH' ? 'pill-high' : hp.label === 'BUILDING' ? 'pill-building' : 'pill-low';
      pillsEl.innerHTML = '<span class="verdict-pill ' + pClass + '">Pressure: ' + hp.label + '</span>';
    }

    var actionEl = document.getElementById('gexVerdictAction');
    if (actionEl) actionEl.textContent = m.action;

    var levelsEl = document.getElementById('gexVerdictLevels');
    if (levelsEl && imb.levels) {
      var html = '';
      if (imb.levels.supportLevels && imb.levels.supportLevels[0] != null) html += '<span class="imb-level-chip support">Support $' + imb.levels.supportLevels[0] + '</span>';
      if (imb.levels.resistanceLevels && imb.levels.resistanceLevels[0] != null) html += '<span class="imb-level-chip resistance">Resistance $' + imb.levels.resistanceLevels[0] + '</span>';
      if (imb.levels.magnetLevel != null) html += '<span class="imb-level-chip magnet">Magnet $' + imb.levels.magnetLevel + '</span>';
      levelsEl.innerHTML = html;
    }

    var invEl = document.getElementById('gexVerdictInvalidation');
    if (invEl) {
      if (m.invalidation === 'support' && imb.levels && imb.levels.supportLevels && imb.levels.supportLevels[0]) {
        invEl.textContent = 'Invalidation: lose and hold below $' + imb.levels.supportLevels[0] + '.';
      } else if (m.invalidation === 'resistance' && imb.levels && imb.levels.resistanceLevels && imb.levels.resistanceLevels[0]) {
        invEl.textContent = 'Invalidation: reclaim and hold above $' + imb.levels.resistanceLevels[0] + '.';
      } else if (m.invalidation === 'break and hold outside the box') {
        invEl.textContent = 'Invalidation: break and hold outside the box.';
      } else {
        invEl.textContent = '';
      }
    }

    var pressureEl = document.getElementById('gexVerdictPressure');
    if (pressureEl && d.hedgePressure) {
      var hp2 = d.hedgePressure.pressure || { score: 0, label: 'LOW' };
      var flipDist = (d.gammaFlip && d.spotPrice) ? '$' + Math.abs(d.spotPrice - d.gammaFlip).toFixed(2) : 'N/A';
      pressureEl.innerHTML = 'Pressure: <b>' + hp2.label + '</b> (' + hp2.score + ')' +
        ' &middot; Dist to flip: <b>' + flipDist + '</b>';
    }

    // Advanced panel
    var advTypeEl = document.getElementById('gexAdvType');
    if (advTypeEl) {
      var typeLabel = STRUCT_TYPE_MAP[imb.imbalanceType] || 'Unknown';
      advTypeEl.textContent = typeLabel + ' (Confidence: ' + imb.confidence + ')';
      advTypeEl.style.color = m.color;
    }

    var aboveEl = document.getElementById('gexImbAbove');
    var belowEl = document.getElementById('gexImbBelow');
    if (aboveEl) { aboveEl.textContent = fmt(imb.aboveGEX); aboveEl.style.color = (imb.aboveGEX >= 0) ? 'var(--green)' : 'var(--red)'; }
    if (belowEl) { belowEl.textContent = fmt(imb.belowGEX); belowEl.style.color = (imb.belowGEX >= 0) ? 'var(--green)' : 'var(--red)'; }

    var advEl = document.getElementById('gexAdvDetails');
    if (advEl) {
      var items = [];
      if (d.gammaFlip) items.push('<span class="verdict-adv-item">Gamma Flip: $' + d.gammaFlip + '</span>');
      if (d.totalNetGEX != null) items.push('<span class="verdict-adv-item">Net GEX: ' + fmt(d.totalNetGEX) + '</span>');
      advEl.innerHTML = items.join('');
    }

    var wallsEl = document.getElementById('gexAdvWalls');
    if (wallsEl) {
      var wh = '';
      if (d.callWall) wh += '<span style="color:var(--green)">Call Wall: $' + d.callWall.strike + ' (' + fmt(d.callWall.gex) + ')</span>';
      if (d.putWall) wh += '<span style="color:var(--red);margin-left:12px">Put Wall: $' + d.putWall.strike + ' (' + fmt(d.putWall.gex) + ')</span>';
      wallsEl.innerHTML = wh;
    }

    var reasonsEl = document.getElementById('gexImbReasons');
    if (reasonsEl && imb.reasons) {
      reasonsEl.innerHTML = imb.reasons.map(function(r) { return '<span class="imb-reason">' + r + '</span>'; }).join('');
    }

    // Regime reasons (L5)
    var regReasonsEl = document.getElementById('gexVerdictRegimeReasons');
    if (regReasonsEl && intel.reasons && intel.reasons.length) {
      regReasonsEl.innerHTML = '<div class="verdict-regime-reasons"><span style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Why: </span>' +
        intel.reasons.map(function(r2) { return '<span class="imb-reason">' + r2 + '</span>'; }).join('') + '</div>';
    } else if (regReasonsEl) { regReasonsEl.innerHTML = ''; }

    // Stability
    var stabEl = document.getElementById('gexVerdictStability');
    if (stabEl) {
      if (intel.stability != null || intel.flickering) {
        var stabText = intel.flickering ? 'FLICKERING' : (intel.stability > 0.7 ? 'STABLE' : intel.stability > 0.4 ? 'MODERATE' : 'UNSTABLE');
        var stabColor = intel.flickering ? 'var(--red)' : (intel.stability > 0.7 ? 'var(--green)' : 'var(--text-muted)');
        stabEl.innerHTML = '<div class="verdict-stability">Stability: <span style="color:' + stabColor + ';font-weight:600">' + stabText + '</span>' + (intel.stability != null ? ' (' + (intel.stability * 100).toFixed(0) + '%)' : '') + '</div>';
      } else { stabEl.innerHTML = ''; }
    }

    // Call GEX vs Put GEX totals
    var totalsEl = document.getElementById('gexVerdictGexTotals');
    if (totalsEl && d) {
      var tcg = d.totalCallGEX; var tpg = d.totalPutGEX;
      if (tcg != null || tpg != null) {
        totalsEl.innerHTML = '<div class="verdict-gex-totals">Call GEX: <span style="color:var(--green);font-weight:600">' + fmtM(tcg) + '</span> &middot; Put GEX: <span style="color:var(--red);font-weight:600">' + fmtM(tpg) + '</span></div>';
      } else { totalsEl.innerHTML = ''; }
    }
  }

  /* ── Positioning strip summary (L2 + L3) ── */
  function updatePositioningSummary() {
    var summary = document.getElementById('gex-positioning-summary');
    if (!summary) return;
    var vel = document.getElementById('cxVelocity5m');
    var drift = document.getElementById('cxFlipDrift');
    var dens = document.getElementById('cxDensity50');
    var danger = document.getElementById('cxDanger');
    var flowRatio = document.getElementById('flowRatioValue');
    var odte = document.getElementById('cxODTE');
    summary.innerHTML = '<span class="ss-label">Vel</span><span class="ss-val">' + (vel ? vel.textContent : '\\u2014') + '</span>' +
      '<span class="ss-label">Drift</span><span class="ss-val">' + (drift ? drift.textContent : '\\u2014') + '</span>' +
      '<span class="ss-label">Dens</span><span class="ss-val">' + (dens ? dens.textContent : '\\u2014') + '</span>' +
      '<span class="ss-label">Danger</span><span class="ss-val">' + (danger ? danger.textContent : '\\u2014') + '</span>' +
      '<span class="ss-label">Flow</span><span class="ss-val">' + (flowRatio ? flowRatio.textContent : '\\u2014') + '</span>' +
      '<span class="ss-label">0DTE</span><span class="ss-val">' + (odte ? odte.textContent : '\\u2014') + '</span>';
  }

  /* ── Volatility strip summary (L4) ── */
  function updateVolatilitySummary() {
    var summary = document.getElementById('gex-volatility-summary');
    if (!summary) return;
    var ivRatio = document.getElementById('ivRatioValue');
    var ivSub = document.getElementById('ivRatioSub');
    var expMove = document.getElementById('volExpMove');
    var vrpRegime = document.getElementById('volVRPRegime');
    summary.innerHTML = '<span class="ss-label">IV Ratio</span><span class="ss-val">' + (ivRatio ? ivRatio.textContent : '\\u2014') + '</span>' +
      '<span class="ss-label">Net IV</span><span class="ss-val">' + (ivSub ? ivSub.textContent.replace('Net IV: ','') : '\\u2014') + '</span>' +
      '<span class="ss-label">ExpMove</span><span class="ss-val">' + (expMove ? expMove.textContent : '\\u2014') + '</span>' +
      '<span class="ss-label">VRP</span><span class="ss-val">' + (vrpRegime ? vrpRegime.textContent : '\\u2014') + '</span>';
    // Macro badge
    var macro = state.intel && state.intel.macro;
    if (macro && macro.highestEvent && !macro.highestEvent.released && macro.highestEvent.msUntil < 14400000) {
      var bc = macro.highestEvent.msUntil < 3600000 ? 'urgent' : 'warning';
      summary.innerHTML += '<span class="macro-badge ' + bc + '">' + macro.highestEvent.event + ' ' + macro.highestEvent.countdown + '</span>';
    }
  }

  /* ── Macro Events Rendering ── */
  function renderMacroEvents(macro) {
    var el = document.getElementById('gex-macro-events');
    if (!el || !macro || !macro.events || macro.events.length === 0) { if (el) el.innerHTML = ''; return; }
    var html = '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);font-weight:600;margin-bottom:4px;">Macro Events</div>';
    macro.events.forEach(function(ev) {
      if (ev.riskScore < 0.01 && !ev.released) return;
      // Hide expired events that have no actual data (nothing to show)
      if (ev.released && ev.actual == null && ev.countdown === 'DONE') return;
      // Filter out individual FOMC member speeches (too noisy, keep Powell only)
      var evName = ev.event || '';
      if (evName.indexOf('Speaks') !== -1 && evName.indexOf('Powell') === -1 && evName.indexOf('Chair') === -1) return;
      var rowClass = ev.riskScore > 0.5 ? ' high-risk' : '';
      var cdClass = ev.msUntil < 3600000 ? 'macro-countdown-urgent' : (ev.msUntil < 14400000 ? 'macro-countdown-warning' : 'macro-countdown-safe');
      html += '<div class="macro-event-row' + rowClass + '">';
      html += '<span class="macro-event-name">' + ev.event + '</span>';
      if (ev.released && ev.actual != null && ev.forecast != null) {
        var diff = ev.actual - ev.forecast;
        var bm = diff > 0 ? 'Beat +' + diff.toFixed(1) : (diff < 0 ? 'Miss ' + diff.toFixed(1) : 'Inline');
        html += '<span class="macro-event-released">' + bm + '</span>';
        html += '<span class="macro-event-forecast">Act: ' + ev.actual + ' vs Est: ' + ev.forecast + '</span>';
      } else if (ev.fredActual != null) {
        // FRED data available — show actual value + change from prior
        var fredChg = ev.fredChange != null ? ' (' + (ev.fredChange > 0 ? '+' : '') + ev.fredChange.toFixed(2) + ')' : '';
        var fredColor = ev.fredChange > 0 ? 'var(--red)' : ev.fredChange < 0 ? 'var(--green)' : 'var(--text-muted)';
        html += '<span style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:' + fredColor + ';">' + ev.fredActual.toFixed(2) + fredChg + '</span>';
        html += '<span class="macro-event-forecast">FRED ' + (ev.fredDate || '') + '</span>';
        html += '<span class="macro-event-countdown ' + cdClass + '">' + ev.countdown + '</span>';
      } else {
        html += '<span class="macro-event-forecast">Est: ' + (ev.forecast || '\\u2014') + ' / Prev: ' + (ev.previous || '\\u2014') + '</span>';
        html += '<span class="macro-event-countdown ' + cdClass + '">' + ev.countdown + '</span>';
      }
      html += '</div>';
    });

    // Treasury / FRED data
    if (macro.treasury && macro.treasury.series && macro.treasury.series.length > 0) {
      html += '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);font-weight:600;margin:10px 0 4px;">Treasury & Rates</div>';
      var yc = macro.treasury.yieldCurve;
      if (yc) {
        var ycColor = yc.status === 'INVERTED' ? 'var(--red)' : yc.status === 'FLAT' ? '#f59e0b' : 'var(--green)';
        html += '<div class="macro-event-row"><span class="macro-event-name">Yield Curve</span><span style="color:' + ycColor + ';font-weight:700;font-family:var(--font-mono);font-size:12px;">' + yc.status + ' (' + yc.spread + '%)</span></div>';
      }
      macro.treasury.series.forEach(function(s) {
        if (s.seriesId === 'T10Y2Y' || s.seriesId === 'CPIAUCSL') return;
        var arrow = s.direction === 'up' ? '\\u25B2' : s.direction === 'down' ? '\\u25BC' : '\\u25B6';
        var arrowColor = s.direction === 'up' ? 'var(--red)' : s.direction === 'down' ? 'var(--green)' : 'var(--text-muted)';
        var val = s.seriesId === 'RRPONTSYD' ? '$' + s.value.toFixed(s.decimals) + 'B' : s.value.toFixed(s.decimals) + s.unit;
        var chg = s.change !== 0 ? ' (' + (s.change > 0 ? '+' : '') + s.change.toFixed(s.decimals) + ')' : '';
        html += '<div class="macro-event-row">';
        html += '<span class="macro-event-name">' + s.name + '</span>';
        html += '<span style="font-family:var(--font-mono);font-size:12px;font-weight:600;">' + val + chg + ' <span style="color:' + arrowColor + ';">' + arrow + '</span></span>';
        html += '</div>';
      });
      if (macro.treasury.cpiYoY != null) {
        var cpiColor = macro.treasury.cpiYoY > 3 ? 'var(--red)' : macro.treasury.cpiYoY > 2 ? '#f59e0b' : 'var(--green)';
        html += '<div class="macro-event-row"><span class="macro-event-name">CPI YoY</span><span style="color:' + cpiColor + ';font-weight:700;font-family:var(--font-mono);font-size:12px;">' + macro.treasury.cpiYoY.toFixed(1) + '%</span></div>';
      }
    }

    // Latest FRED Release Data summary
    if (macro.releases && Object.keys(macro.releases).length > 0) {
      html += '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);font-weight:600;margin:10px 0 4px;">Latest Economic Data (FRED)</div>';
      var priorityOrder = ['CPI', 'Core CPI', 'Nonfarm Payrolls', 'Unemployment Rate', 'GDP', 'PPI', 'PCE Price Index', 'Core PCE Price Index', 'Retail Sales', 'Initial Jobless Claims', 'ISM Manufacturing PMI', 'Michigan Consumer Sentiment', 'JOLTS Job Openings'];
      var shown = 0;
      priorityOrder.forEach(function(name) {
        if (shown >= 8) return;
        var r = macro.releases[name];
        if (!r) return;
        var chg = r.change != null ? ' (' + (r.change > 0 ? '+' : '') + r.change.toFixed(2) + ')' : '';
        var chgColor = r.change > 0 ? 'var(--red)' : r.change < 0 ? 'var(--green)' : 'var(--text-muted)';
        html += '<div class="macro-event-row">';
        html += '<span class="macro-event-name">' + name + '</span>';
        html += '<span style="font-family:var(--font-mono);font-size:12px;font-weight:600;">' + r.value.toFixed(2) + '<span style="color:' + chgColor + ';">' + chg + '</span></span>';
        html += '<span class="macro-event-forecast" style="margin-left:auto;">' + r.date + '</span>';
        html += '</div>';
        shown++;
      });
    }

    el.innerHTML = html;
  }

  /* ── Timing Strip ── */
  function renderTimingStrip(timing) {
    var summary = document.getElementById('gex-timing-summary');
    var detail = document.getElementById('gex-timing-detail');
    if (!summary) return;
    if (!timing) {
      summary.innerHTML = '<span class="ss-label">Timing</span><span class="ss-val">\u2014</span>';
      if (detail) detail.innerHTML = '';
      return;
    }

    // Summary line
    var stateClass = 'timing-state-' + timing.state;
    summary.innerHTML =
      '<span class="timing-state-badge ' + stateClass + '">' + timing.state + '</span>' +
      '<span class="ss-label">Score</span><span class="timing-score">' + timing.score + '</span>' +
      '<span class="timing-dir">' + (timing.direction || '') + '</span>' +
      (timing.entryWindows && timing.entryWindows.length > 0 ?
        '<span class="ss-label">Entry</span><span class="ss-val">$' + timing.entryWindows[0].entryZoneLow.toFixed(0) + '\u2013' + timing.entryWindows[0].entryZoneHigh.toFixed(0) + '</span>' : '');

    // Detail body
    if (!detail) return;
    var html = '';

    // Warnings first
    if (timing.warnings && timing.warnings.length > 0) {
      timing.warnings.forEach(function(w) { html += '<div class="timing-warning">' + w + '</div>'; });
    }

    // Entry windows
    if (timing.entryWindows && timing.entryWindows.length > 0) {
      html += '<div class="timing-section-label">Entry Windows</div>';
      timing.entryWindows.forEach(function(ew) {
        html += '<div class="timing-entry-window">' +
          '<span class="timing-entry-type">' + ew.type.replace(/_/g, ' ') + '</span>' +
          '<span class="timing-entry-label">' + ew.label + '</span>' +
          '<span class="timing-entry-zone">$' + ew.entryZoneLow.toFixed(2) + ' \u2013 $' + ew.entryZoneHigh.toFixed(2) + '</span>' +
          '<span class="timing-entry-inval">Kill: $' + ew.invalidation.toFixed(2) + '</span>' +
          '</div>';
        if (ew.condition) html += '<div style="font-size:10px;color:var(--text-muted);padding:0 8px 4px">' + ew.condition + '</div>';
      });
    }

    // Why now
    if (timing.whyNow && timing.whyNow.length > 0) {
      html += '<div class="timing-section-label">Why Now</div>';
      timing.whyNow.forEach(function(r) { html += '<div class="timing-why-item">' + r + '</div>'; });
    }

    // Score breakdown
    if (timing.components) {
      html += '<div class="timing-section-label">Score Breakdown</div><div class="timing-components">';
      var comps = [
        ['Gamma', timing.components.gamma],
        ['Wall', timing.components.wall],
        ['Flow', timing.components.flow],
        ['Vol', timing.components.vol],
        ['Price', timing.components.price],
        ['Time', timing.components.time],
      ];
      comps.forEach(function(c) {
        var pct = Math.round((c[1].score || 0) * 100);
        html += '<div class="timing-comp-bar"><span>' + c[0] + '</span><div style="width:40px;height:4px;background:var(--border);border-radius:2px"><div class="timing-comp-fill" style="width:' + pct + '%"></div></div><span>' + (c[1].weighted || 0) + '</span></div>';
      });
      html += '</div>';
    }

    detail.innerHTML = html;
  }

  /* ── Session Forecast Strip ── */
  function renderForecastStrip(forecast) {
    var summary = document.getElementById('gex-forecast-summary');
    var detail = document.getElementById('gex-forecast-detail');
    if (!summary) return;
    if (!forecast) {
      summary.innerHTML = '<span class="ss-label">Forecast</span><span class="ss-val">\u2014</span>';
      if (detail) detail.innerHTML = '<div style="color:var(--text-muted);font-size:11px;padding:8px">Awaiting data\u2026</div>';
      return;
    }

    // Summary line: Shark Score + Signal + Mode
    var ss = forecast.sharkScore || {};
    var dt = forecast.dayType;
    var rs = forecast.regimeShift;
    var th = forecast.thesis || {};
    var scoreColor = (ss.score || 0) >= 70 ? '#f59e0b' : (ss.score || 0) >= 50 ? '#fbbf24' : 'var(--text-muted)';
    var shortText = th.short || '\u2014';
    summary.innerHTML =
      '<span class="ss-val" style="color:' + scoreColor + ';font-weight:700;font-size:14px;font-family:JetBrains Mono,monospace">' + shortText + '</span>' +
      '<span class="ss-label" style="margin-left:12px">Mode</span><span class="ss-val">' + (dt ? dt.type.toUpperCase() : '\u2014') + '</span>';

    if (!detail) return;
    var html = '';

    // === TOP ROW: SHARK SIGNAL + SHARK SCORE ===
    html += '<div class="fc-card" style="grid-column:1/-1;border-color:' + scoreColor + ';background:rgba(251,191,36,0.04)">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">';

    // Left: Shark Signal (thesis)
    html += '<div style="flex:1;min-width:200px">';
    html += '<div class="fc-card-label" style="color:' + scoreColor + '">SHARK SIGNAL</div>';
    html += '<div class="fc-card-value" style="font-size:14px;line-height:1.5">' + (th.thesis || '\u2014') + '</div>';
    if (th.supports && th.supports.length > 0) {
      html += '<div class="fc-reasons" style="margin-top:6px;color:#22c55e">';
      th.supports.slice(0, 3).forEach(function(s) { html += '\u2713 ' + s + '<br>'; });
      html += '</div>';
    }
    if (th.risks && th.risks.length > 0) {
      html += '<div class="fc-reasons" style="margin-top:4px;color:#ef4444">';
      th.risks.slice(0, 3).forEach(function(r) { html += '\u26A0 ' + r + '<br>'; });
      html += '</div>';
    }
    html += '</div>';

    // Right: Shark Score gauge
    html += '<div style="text-align:center;min-width:90px">';
    html += '<div class="fc-card-label" style="color:' + scoreColor + '">SHARK SCORE</div>';
    html += '<div style="font-size:36px;font-weight:800;color:' + scoreColor + ';font-family:JetBrains Mono,monospace;line-height:1">' + (ss.score || 0) + '</div>';
    html += '<div style="font-size:10px;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:1px">' + (ss.label || 'dead') + '</div>';
    html += '</div>';

    html += '</div></div>';

    // === ROW 2: MODE + TRIGGERS + TARGETS ===
    // Mode card
    if (dt) {
      html += '<div class="fc-card">';
      html += '<div class="fc-card-label">MODE</div>';
      html += '<div class="fc-card-value" style="font-size:15px">' + dt.type.toUpperCase().replace(/_/g, ' ') + '</div>';
      html += '<div class="fc-card-sub" style="font-size:11px;color:var(--text-muted)">' + (dt.strategy || '') + '</div>';
      html += '</div>';
    }

    // Triggers card
    if (forecast.breakoutQuality) {
      var bq = forecast.breakoutQuality;
      html += '<div class="fc-card">';
      html += '<div class="fc-card-label">TRIGGERS</div>';
      if (bq.up) {
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">';
        html += '<span style="color:#22c55e;font-weight:600">\u2191 $' + bq.up.level + '</span>';
        html += '<span style="font-size:11px;color:var(--text-muted)">' + bq.up.quality + (bq.up.squeeze ? ' | sqz:' + bq.up.squeeze.squeezeRisk : '') + '</span>';
        html += '</div>';
      }
      if (bq.down) {
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">';
        html += '<span style="color:#ef4444;font-weight:600">\u2193 $' + bq.down.level + '</span>';
        html += '<span style="font-size:11px;color:var(--text-muted)">' + bq.down.quality + (bq.down.squeeze ? ' | sqz:' + bq.down.squeeze.squeezeRisk : '') + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Targets card
    html += '<div class="fc-card">';
    html += '<div class="fc-card-label">TARGETS</div>';
    var tgts = [];
    if (forecast.breakoutQuality?.up) tgts.push({ strike: forecast.breakoutQuality.up.level, dir: 'up', label: 'primary' });
    if (forecast.breakoutQuality?.down) tgts.push({ strike: forecast.breakoutQuality.down.level, dir: 'down', label: 'downside' });
    if (forecast.powerHour?.closingMagnet) tgts.push({ strike: forecast.powerHour.closingMagnet, dir: 'pin', label: 'close pin' });
    if (tgts.length > 0) {
      html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:4px">';
      tgts.forEach(function(t) {
        var tColor = t.dir === 'up' ? '#22c55e' : t.dir === 'down' ? '#ef4444' : '#f59e0b';
        html += '<span style="font-family:JetBrains Mono,monospace;color:' + tColor + ';font-weight:600">$' + t.strike + '</span>';
      });
      html += '</div>';
    } else {
      html += '<div class="fc-card-sub">No clear targets</div>';
    }
    html += '</div>';

    // === ROW 3: OPEN + INTRADAY + POWER HOUR ===
    // Open forecast (Open Auction State Model)
    if (forecast.opening) {
      var op = forecast.opening;
      var opClass = op.direction === 'bullish' ? 'bullish' : op.direction === 'bearish' ? 'bearish' : 'neutral';
      var opLabel = (op.openState || 'MIXED').replace(/_/g, ' ');
      html += '<div class="fc-card">';
      html += '<div class="fc-card-label">OPEN FORECAST</div>';
      html += '<div class="fc-card-value"><span class="fc-prob ' + opClass + '">' + opLabel + '</span></div>';
      html += '<div class="fc-card-sub">' + (op.confidence || 0) + '% confidence</div>';
      if (op.firstTarget) html += '<div class="fc-card-sub">Target: $' + op.firstTarget + '</div>';
      if (op.bullTrigger || op.bearTrigger) {
        html += '<div style="display:flex;gap:12px;margin-top:4px;font-size:11px">';
        if (op.bullTrigger) html += '<span style="color:#22c55e">\u2191 $' + op.bullTrigger + '</span>';
        if (op.bearTrigger) html += '<span style="color:#ef4444">\u2193 $' + op.bearTrigger + '</span>';
        html += '</div>';
      }
      if (op.reasons && op.reasons.length > 0) {
        html += '<div class="fc-reasons" style="margin-top:4px;font-size:10px">' + op.reasons[0] + '</div>';
      }
      if (op._unavailable) {
        html += '<div class="fc-reasons" style="color:#f59e0b;font-size:10px">Data unavailable — waiting for session snapshot</div>';
      }
      html += '</div>';
    }

    // Regime shift (compact)
    if (rs && rs.state !== 'STABLE') {
      var shiftDir = rs.direction ? (rs.direction === 'bullish' ? 'bullish' : 'bearish') : 'neutral';
      var shiftClass = rs.state === 'ACTIVE_SHIFT' ? 'fc-shift-active' : 'fc-shift-watch';
      html += '<div class="fc-card ' + shiftClass + '">';
      html += '<div class="fc-card-label">SHIFT</div>';
      html += '<div class="fc-card-value"><span class="fc-prob ' + shiftDir + '">' + rs.state.replace('_', ' ') + '</span></div>';
      if (rs.triggerLevel) html += '<div class="fc-card-sub">Trigger: $' + rs.triggerLevel + '</div>';
      html += '</div>';
    }

    // Power Hour
    if (forecast.powerHour) {
      var ph = forecast.powerHour;
      var phClass = ph.bias === 'up' ? 'bullish' : ph.bias === 'down' ? 'bearish' : 'neutral';
      html += '<div class="fc-card">';
      html += '<div class="fc-card-label">POWER HOUR</div>';
      html += '<div class="fc-card-value"><span class="fc-prob ' + phClass + '">' + ph.closeType.toUpperCase() + '</span></div>';
      if (ph.pinCandidates && ph.pinCandidates.length > 0) {
        html += '<div class="fc-card-sub">Pin: $' + ph.pinCandidates[0].strike + ' (' + ph.pinCandidates[0].probability + '%)</div>';
      }
      html += '</div>';
    }

    // Touch probabilities (compact)
    if (forecast.touchProbabilities && forecast.touchProbabilities.length > 0) {
      html += '<div class="fc-card" style="grid-column:1/-1">';
      html += '<div class="fc-card-label">TOUCH TARGETS</div>';
      html += '<ul class="fc-touch-list">';
      forecast.touchProbabilities.slice(0, 5).forEach(function(tp) {
        var dir = tp.direction === 'up' ? '\u2191' : '\u2193';
        var tColor = tp.direction === 'up' ? '#22c55e' : '#ef4444';
        html += '<li><span style="color:' + tColor + '">' + dir + ' $' + tp.strike + '</span><span>' + tp.touchProbability + '%</span></li>';
        html += '<div class="fc-touch-bar"><div class="fc-touch-fill" style="width:' + tp.touchProbability + '%;background:' + tColor + '"></div></div>';
      });
      html += '</ul>';
      html += '</div>';
    }

    detail.innerHTML = html;
  }

  /* ── Motion Strip ── */
  function renderMotionStrip(motion) {
    var el = document.getElementById('gex-motion-strip'); if (!el) return;
    if (!motion || !motion.timestamp) { el.innerHTML = '<div class="gex-motion-item"><span class="gex-motion-value neutral">Motion: awaiting data\\u2026</span></div>'; return; }
    var gv = motion.gexVelocity||0; var gvClass = gv>0?'positive':gv<0?'negative':'neutral';
    var gvFmt = (gv>=0?'+':'') + (Math.abs(gv)>=1e6?(gv/1e6).toFixed(1)+'M':Math.abs(gv)>=1e3?(gv/1e3).toFixed(0)+'K':gv.toFixed(0));
    var fd = motion.flipDrift||0; var fdClass = fd>0?'positive':fd<0?'negative':'neutral'; var fdFmt = (fd>=0?'+':'')+fd.toFixed(2);
    var ws = motion.wallStability||0; var wsClass = ws>0.7?'positive':ws<0.3?'negative':'warn'; var wsFmt = (ws*100).toFixed(0)+'%';
    var ps = motion.pressureScore||0; var psClass = ps>60?'negative':ps>30?'warn':'positive'; var psFmt = ps+'/100';
    var ga = motion.gexAcceleration||0; var gaClass = ga>0?'positive':ga<0?'negative':'neutral';
    var gaFmt = (ga>=0?'+':'') + (Math.abs(ga)>=1e6?(ga/1e6).toFixed(1)+'M':Math.abs(ga)>=1e3?(ga/1e3).toFixed(0)+'K':ga.toFixed(0));
    var flipLabel = motion.flipCurrent ? '\\$'+motion.flipCurrent.toFixed(0) : '--';
    var age = Math.round((Date.now() - motion.timestamp)/1000);
    var ageFmt = age < 60 ? age+'s ago' : Math.round(age/60)+'m ago';
    el.innerHTML =
      '<div class="gex-motion-item"><span class="gex-motion-label">G\\u0394 vel</span><span class="gex-motion-value '+gvClass+'">'+gvFmt+'/m</span></div>' +
      '<div class="gex-motion-item"><span class="gex-motion-label">G\\u0394 acc</span><span class="gex-motion-value '+gaClass+'">'+gaFmt+'/m\\u00B2</span></div>' +
      '<div class="gex-motion-item"><span class="gex-motion-label">Flip</span><span class="gex-motion-value neutral">'+flipLabel+'</span></div>' +
      '<div class="gex-motion-item"><span class="gex-motion-label">Flip drift</span><span class="gex-motion-value '+fdClass+'">'+fdFmt+'</span></div>' +
      '<div class="gex-motion-item"><span class="gex-motion-label">Wall stab</span><span class="gex-motion-value '+wsClass+'">'+wsFmt+'</span></div>' +
      '<div class="gex-motion-item"><span class="gex-motion-label">Pressure</span><span class="gex-motion-value '+psClass+'">'+psFmt+'</span></div>' +
      '<div class="gex-motion-item"><span class="gex-motion-label">\\u23F1</span><span class="gex-motion-value neutral">'+ageFmt+'</span></div>';
  }

  /* ── Normalize API data ── */
  function normalizeGrid(raw) {
    if (!raw || !raw.grid) return null;
    var strikes = []; var expiries = (raw.expirations||[]).map(function(e){return e.date;});
    var matrix = {}; var netByExpiry = {};
    (raw.expirations||[]).forEach(function(e){netByExpiry[e.date]=e.totalGEX||0;});
    (raw.grid||[]).forEach(function(row){
      strikes.push(row.strike); matrix[row.strike] = {};
      (row.values||[]).forEach(function(v,i){ if(expiries[i]) matrix[row.strike][expiries[i]]={net:v.net||0,call:v.call||0,put:v.put||0,callOI:v.callOI||0,putOI:v.putOI||0,netShares:v.netShares||0,callShares:v.callShares||0,putShares:v.putShares||0,netDollar:v.netDollar||0,callDollar:v.callDollar||0,putDollar:v.putDollar||0}; });
    });
    return {strikes:strikes,expiries:expiries,matrix:matrix,netByExpiry:netByExpiry,maxAbsGEX:raw.maxAbsGEX||0,spotPrice:raw.spotPrice,spot:raw.spotPrice,
      imbalance:raw.imbalance||null, hedgePressure:raw.hedgePressure||null,
      gammaFlip:raw.gammaFlip, callWall:raw.callWall, putWall:raw.putWall,
      totalNetGEX:raw.totalNetGEX, totalCallGEX:raw.totalCallGEX, totalPutGEX:raw.totalPutGEX,
      intensity:raw.intensity, maxPain:raw.maxPain};
  }
  function normalizeIntel(raw) {
    if (!raw) return null;
    var r = raw.regime || {};
    return { spot:raw.spot, regime:{name:r.label,confidence:r.confidence,playbook:r.playbook,dangerScore:raw.dangerScore,flipStrike:raw.overlays?raw.overlays.flipStrike:null,invalidation:raw.overlays?(raw.overlays.flipStrike||(raw.overlays.callWall?raw.overlays.callWall.strike:null)):null}, dominantExpiry:raw.dominantExpiry?{expiry:raw.dominantExpiry.date,weight:raw.dominantExpiry.share}:{}, convexity:raw.convexityDirection||'--', highlights:raw.highlights, overlays:raw.overlays, dangerScore:raw.dangerScore, squeezeState:raw.squeezeState,
      bias: r.bias || null,
      reasons: r.reasons || [],
      stability: raw.stability,
      flickering: raw.flickering,
      engine: r.engine || null,
      macro: raw.macro || null,
      timing: raw.timing || null,
      gexChange: raw.gexChange || null,
      totalNetGEXVol: raw.totalNetGEXVol || 0,
      activityRatio: raw.activityRatio || 0,
      odteMetrics: raw.odteMetrics || null,
      sensitivitySurface: raw.sensitivitySurface || null,
      regimeNormalization: raw.regimeNormalization || null,
      dealerPositioning: raw.dealerPositioning || null,
      hedgeAccuracy: raw.hedgeAccuracy || null
    };
  }

  /* ── Regime Hysteresis ── */
  function applyRegimeHysteresis(intel) {
    if (!intel || !intel.regime) return intel;
    var proposed = intel.regime.name; var conf = intel.regime.confidence || 0; var now = Date.now();
    if (state.smoothedConfidence == null) state.smoothedConfidence = conf;
    else state.smoothedConfidence = 0.2 * conf + 0.8 * state.smoothedConfidence;
    intel.regime.confidence = state.smoothedConfidence;
    if (!state.confirmedRegime) { state.confirmedRegime = proposed; state.lastRegimeChangeTime = now; return intel; }
    if (proposed === state.confirmedRegime) { state.pendingRegime = null; state.pendingRegimeCount = 0; return intel; }
    var cooldownMs = 30000; var timeSince = now - state.lastRegimeChangeTime;
    if (timeSince < cooldownMs && state.smoothedConfidence < 0.80) { intel.regime.name = state.confirmedRegime; return intel; }
    if (state.smoothedConfidence >= 0.70) { commitRegimeChange(proposed, now); return intel; }
    if (proposed === state.pendingRegime) { state.pendingRegimeCount++; if (state.pendingRegimeCount >= 2) { commitRegimeChange(proposed, now); return intel; } }
    else { state.pendingRegime = proposed; state.pendingRegimeCount = 1; }
    intel.regime.name = state.confirmedRegime;
    return intel;
  }
  function commitRegimeChange(regime, now) {
    state.confirmedRegime = regime; state.lastRegimeChangeTime = now; state.pendingRegime = null; state.pendingRegimeCount = 0;
    state.regimeFlipLog.push(now); var cutoff = now - 120000;
    state.regimeFlipLog = state.regimeFlipLog.filter(function(t){return t > cutoff;});
  }

  /* ── Intel ── */
  function updateIntelAge() {
    var el = document.getElementById('gex-intel-age'); if (!el || !state.lastIntelTime) return;
    var sec = Math.round((Date.now() - state.lastIntelTime) / 1000);
    var txt = sec < 60 ? sec+'s ago' : Math.floor(sec/60)+'m '+sec%60+'s ago';
    el.textContent = 'Intel: ' + txt; el.className = 'gex-intel-age' + (sec > 15 ? ' stale' : '');
  }
  function refreshIntel() {
    fetch('/api/gex/heatmap-intel/' + state.ticker, { credentials:'include', headers:headers() })
      .then(function(r){return r.json();}).then(function(d){
        var raw = normalizeIntel(d); state.intel = applyRegimeHysteresis(raw); state.lastIntelTime = Date.now();
        renderDecisionBar(state.intel); renderMattersStrip(state.intel); updateVerdictStrip(state.intel);
        renderMacroEvents(state.intel ? state.intel.macro : null);
        renderTimingStrip(state.intel ? state.intel.timing : null);
      }).catch(function(){});
    refreshMarketState();
  }
  function maybeRefreshIntel() {
    var now = Date.now(); if (now - state.lastIntelTime >= 10000 || state.sseMsgCount >= 20) { state.sseMsgCount = 0; refreshIntel(); }
  }

  /* ── Metrics (Dealer + Convexity) ── */
  function fetchMetrics() {
    fetch('/api/metrics/' + state.ticker).then(function(r){return r.json();}).then(function(m){
      if (!m || m.error) return;
      state.metrics = m;
      var gexDir = m.gex.ratio > 0.55 ? 'bullish' : m.gex.ratio < 0.45 ? 'bearish' : 'neutral';
      var el;
      el = document.getElementById('gexRatioValue'); if (el) el.textContent = m.gex.ratio.toFixed(2);
      el = document.getElementById('gexRatioSub'); if (el) el.textContent = m.gex.regime.replace(/_/g, ' ');
      el = document.getElementById('gexRatioIcon'); if (el) el.className = 'metric-card-icon ' + gexDir;

      var netGex = m.gex.netGEX;
      var nFmt = Math.abs(netGex)>=1e6?(netGex/1e6).toFixed(2)+'M':Math.abs(netGex)>=1e3?(Math.abs(netGex)/1e3).toFixed(1)+'K':String(Math.round(Math.abs(netGex)));
      el = document.getElementById('netGexValue'); if (el) { el.textContent = (netGex>=0?'+':'-')+nFmt; el.style.color = netGex>=0?'var(--green)':'var(--red)'; }
      el = document.getElementById('netGexIcon'); if (el) el.className = 'metric-card-icon ' + (netGex>0?'bullish':netGex<0?'bearish':'neutral');

      var ivDir = m.iv.ratio > 0.55 ? 'bullish' : m.iv.ratio < 0.45 ? 'bearish' : 'neutral';
      el = document.getElementById('ivRatioValue'); if (el) el.textContent = m.iv.ratio.toFixed(2);
      el = document.getElementById('ivRatioSub'); if (el) el.textContent = 'Net IV: ' + (m.iv.netIV>=0?'+':'') + m.iv.netIV.toFixed(1) + '%';

      // Volatility detail cards
      el = document.getElementById('volCallIV'); if (el) el.textContent = m.iv.callIV != null ? m.iv.callIV.toFixed(1) + '%' : '\\u2014';
      el = document.getElementById('volPutIV'); if (el) el.textContent = m.iv.putIV != null ? m.iv.putIV.toFixed(1) + '%' : '\\u2014';

      // Flow data (Layer 3)
      if (m.flow) {
        el = document.getElementById('flowRatioValue'); if (el) el.textContent = (m.flow.ratio || 0).toFixed(2);
        el = document.getElementById('flowNetValue'); if (el) {
          var nf = m.flow.netFlow || 0;
          el.textContent = (nf >= 0 ? '+' : '') + fmtDollar(nf);
          el.style.color = nf >= 0 ? 'var(--green)' : 'var(--red)';
        }
        el = document.getElementById('flowCallValue'); if (el) el.textContent = fmtDollar(m.flow.callFlow || 0);
        el = document.getElementById('flowPutValue'); if (el) el.textContent = fmtDollar(m.flow.putFlow || 0);
      }
      // Imbalance type from grid data
      if (state.gridData && state.gridData.imbalance) {
        el = document.getElementById('flowImbalanceType'); if (el) el.textContent = state.gridData.imbalance.imbalanceType || '\\u2014';
      }

      if (m.convexity) {
        var l2 = m.convexity.layer2 || {}; var l3 = m.convexity.layer3 || {};
        var vel = l2.gex_velocity || {}; var v5 = vel.v_5m;
        el = document.getElementById('cxVelocity5m'); if (el) { el.textContent = v5 != null ? '\\$'+fmtM(v5)+'/min' : '\\u2014'; el.style.color = v5>0?'var(--green)':v5<0?'var(--red)':''; }
        el = document.getElementById('cxAccel5m'); if (el) el.textContent = vel.a_5m != null ? 'Accel: \\$'+fmtM(vel.a_5m)+'/min\\u00B2' : 'Collecting data...';
        var fd = l2.flip_drift || {};
        el = document.getElementById('cxFlipDrift'); if (el) el.textContent = fd.flip_v_5m != null ? (fd.flip_v_5m>=0?'+':'')+fd.flip_v_5m.toFixed(2)+'\\$/min' : '\\u2014';
        el = document.getElementById('cxFlipCurrent'); if (el) el.textContent = fd.flip_current != null ? 'Flip: \\$'+fd.flip_current.toFixed(0) : '';
        var dens = l2.density || {};
        el = document.getElementById('cxDensity50'); if (el) el.textContent = dens.density_50bp != null ? '\\$'+fmtM(dens.density_50bp) : '\\u2014';
        el = document.getElementById('cxConcentration'); if (el) el.textContent = dens.concentration_ratio != null ? 'Concentration: '+(dens.concentration_ratio*100).toFixed(1)+'%' : '';
        var curv = l2.curvature || {};
        el = document.getElementById('cxCurvature'); if (el) el.textContent = curv.curvature != null ? fmtM(curv.curvature) : '\\u2014';
        el = document.getElementById('cxSlope'); if (el) el.textContent = curv.slope != null ? 'Slope: '+fmtM(curv.slope) : '';
        var vx = l3.vex || {};
        el = document.getElementById('cxVEX'); if (el) el.textContent = vx.vex_near_50bp != null ? '\\$'+fmtM(vx.vex_near_50bp) : '\\u2014';
        var ch = l3.charm || {};
        el = document.getElementById('cxCharm'); if (el) el.textContent = ch.cex_near_50bp != null ? '\\$'+fmtM(ch.cex_near_50bp)+'/min' : '\\u2014';
        el = document.getElementById('cxCharmTime'); if (el) el.textContent = ch.minutes_remaining != null ? ch.minutes_remaining+'min left (wt: '+(ch.time_weight||0).toFixed(1)+'x)' : '';
        var em = l3.expected_move || {};
        el = document.getElementById('cxExpMove'); if (el) el.textContent = em.sigma_points != null ? '\\u00B1\\$'+em.sigma_points.toFixed(2) : '\\u2014';
        el = document.getElementById('cxExpBands'); if (el) el.textContent = em.band_1sigma_lower && em.band_1sigma_upper ? '\\$'+em.band_1sigma_lower+' \\u2014 \\$'+em.band_1sigma_upper : '';
        var vr = l3.vrp || {};
        el = document.getElementById('cxVRP'); if (el) el.textContent = vr.vrp_ratio != null ? vr.vrp_ratio.toFixed(2)+'x' : '\\u2014';
        el = document.getElementById('cxVRPRegime'); if (el) el.textContent = vr.regime || '';
        var od = l3.odte || {};
        el = document.getElementById('cxODTE'); if (el) el.textContent = od.odte_ratio != null ? (od.odte_ratio*100).toFixed(1)+'%' : '\\u2014';
        el = document.getElementById('cxODTERegime'); if (el) el.textContent = od.regime || '';
        var dg = l3.danger || {};
        el = document.getElementById('cxDanger'); if (el) { el.textContent = dg.danger_normalized != null ? (dg.danger_normalized*100).toFixed(1)+'%' : '\\u2014'; el.style.color = dg.danger_normalized>0.7?'var(--red)':dg.danger_normalized>0.4?'var(--yellow)':'var(--green)'; }
        el = document.getElementById('cxDangerComponents'); if (el) el.textContent = dg.components ? 'Urgency: '+(dg.components.time_urgency||0).toFixed(1)+'x' : '';
        var ws = l2.wall_stability || {};
        var wc = ws.call_wall || {};
        el = document.getElementById('cxWallCall'); if (el) el.textContent = wc.stability != null ? (wc.stability*100).toFixed(0)+'%' : '\\u2014';
        el = document.getElementById('cxWallCallPersist'); if (el) el.textContent = wc.strike ? '\\$'+wc.strike+' persist: '+((wc.persistence||0)*100).toFixed(0)+'%' : '';
        var wp = ws.put_wall || {};
        el = document.getElementById('cxWallPut'); if (el) el.textContent = wp.stability != null ? (wp.stability*100).toFixed(0)+'%' : '\\u2014';
        el = document.getElementById('cxWallPutPersist'); if (el) el.textContent = wp.strike ? '\\$'+wp.strike+' persist: '+((wp.persistence||0)*100).toFixed(0)+'%' : '';

        // Volatility strip expected move + VRP
        el = document.getElementById('volExpMove'); if (el) el.textContent = em.sigma_points != null ? '\\u00B1\\$'+em.sigma_points.toFixed(2) : '\\u2014';
        el = document.getElementById('volExpBands'); if (el) el.textContent = em.band_1sigma_lower && em.band_1sigma_upper ? '\\$'+em.band_1sigma_lower+' \\u2014 \\$'+em.band_1sigma_upper : '';
        el = document.getElementById('volVRP'); if (el) el.textContent = vr.vrp_ratio != null ? vr.vrp_ratio.toFixed(2)+'x' : '\\u2014';
        el = document.getElementById('volVRPRegime'); if (el) el.textContent = vr.regime || '';

        updatePositioningSummary();
        updateVolatilitySummary();
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }).catch(function(){});
  }

  /* ── Advanced toggle in verdict body ── */
  function setupAdvToggle() {
    var page = document.getElementById('page-gex'); if (!page) return;
    page.addEventListener('click', function(e) {
      if (e.target.id === 'gexAdvToggle') {
        var adv = document.getElementById('gexVerdictAdvanced');
        if (adv) { var show = adv.style.display === 'none'; adv.style.display = show ? '' : 'none'; e.target.classList.toggle('active', show); }
        e.stopPropagation();
      }
    });
  }

  /* ── MarketState fetch ── */
  function refreshMarketState() {
    fetch('/api/market-state/' + state.ticker, {credentials:'include',headers:headers()})
      .then(function(r){return r.json();}).then(function(d){
        if (d.available && d.state) { state.ms = d.state; renderPredictionBar(); renderForecastStrip(d.state.sessionForecast || null); }
      }).catch(function(){});
  }

  /* ── Data loading ── */
  function load() {
    var h = headers(); var opts = {credentials:'include',headers:h};
    Promise.all([
      fetch('/api/gex/heatmap/'+state.ticker+'?range='+state.range, opts).then(function(r){return r.json();}),
      fetch('/api/gex/heatmap-intel/'+state.ticker, opts).then(function(r){return r.json();}).catch(function(){return null;}),
      fetch('/api/market-state/'+state.ticker, opts).then(function(r){return r.json();}).catch(function(){return null;})
    ]).then(function(results){
      state.gridData = normalizeGrid(results[0]);
      var raw = normalizeIntel(results[1]); state.intel = applyRegimeHysteresis(raw); state.lastIntelTime = Date.now();
      if (results[2] && results[2].available && results[2].state) state.ms = results[2].state;
      renderAll(); renderPredictionBar(); updateVerdictStrip(state.intel); renderMacroEvents(state.intel ? state.intel.macro : null);
      renderTimingStrip(state.intel ? state.intel.timing : null);
      renderForecastStrip(state.ms ? state.ms.sessionForecast : null);
    }).catch(function(err){ console.error('[gex] load error:', err); });
  }

  function startSSE() {
    if (state.sse) state.sse.close();
    var url = '/api/gex/heatmap/'+state.ticker+'/stream?range='+state.range+'&interval=30';
    if (window.DASHBOARD_API_KEY) url += '&apiKey=' + encodeURIComponent(window.DASHBOARD_API_KEY);
    var es = new EventSource(url, {withCredentials:true});
    es.onmessage = function(e) {
      try {
        var d = JSON.parse(e.data); state.gridData = normalizeGrid(d);
        state.sseConnected = true; state.lastSSETime = Date.now(); state.sseMsgCount++;
        renderGrid(state.gridData, state.intel); renderProfile(); renderLegend(); renderOISummary(); renderVolumeHistogram(state.gridData); renderDecisionBar(state.intel); updateVerdictStrip(state.intel);
        maybeRefreshIntel();
      } catch(err) { console.error('[gex] SSE parse error:', err); }
    };
    es.onopen = function() { state.sseConnected = true; renderDecisionBar(state.intel); };
    es.onerror = function() { state.sseConnected = false; renderDecisionBar(state.intel); };
    state.sse = es;
  }

  function startMotionSSE() {
    if (state.motionSSE) state.motionSSE.close();
    var url = '/api/gex/heatmap-intel/'+state.ticker+'/motion-stream';
    if (window.DASHBOARD_API_KEY) url += '?apiKey=' + encodeURIComponent(window.DASHBOARD_API_KEY);
    var es = new EventSource(url, {withCredentials:true});
    es.onmessage = function(e) { try { renderMotionStrip(JSON.parse(e.data)); } catch(err) {} };
    es.onerror = function() { renderMotionStrip(null); };
    state.motionSSE = es;
  }

  /* ── Ticker Selector ── */
  var TICKERS = [
    {sym:'SPY',desc:'S&P 500'},{sym:'QQQ',desc:'Nasdaq 100'},{sym:'IWM',desc:'Russell 2000'},
    {sym:'DIA',desc:'Dow Jones'},{sym:'NVDA',desc:'NVIDIA'},{sym:'AAPL',desc:'Apple'},
    {sym:'TSLA',desc:'Tesla'},{sym:'AMZN',desc:'Amazon'},{sym:'META',desc:'Meta'},
    {sym:'MSFT',desc:'Microsoft'},{sym:'AMD',desc:'AMD'},{sym:'GOOGL',desc:'Alphabet'}
  ];
  var FREE_SYMS = ['SPY','QQQ','IWM'];

  function showTickerDD() {
    var dd = document.getElementById('gexCombinedDD');
    var inp = document.getElementById('gexCombinedTicker');
    if (!dd || !inp) return;
    var f = inp.value.trim().toUpperCase();
    var items = f ? TICKERS.filter(function(t){ return t.sym.indexOf(f)>=0 || t.desc.toUpperCase().indexOf(f)>=0; }) : TICKERS;
    if (!items.length) { dd.classList.remove('show'); return; }
    dd.innerHTML = items.map(function(t){
      return '<div class="gex-ticker-opt" data-sym="'+t.sym+'"><span class="sym">'+t.sym+'</span><span class="desc">'+t.desc+'</span></div>';
    }).join('');
    dd.classList.add('show');
  }

  function switchTicker(sym) {
    sym = sym.trim().toUpperCase().replace(/[^A-Z0-9.]/g,'');
    if (!sym) return;
    if (window.SQ && SQ.userTier !== 'pro' && FREE_SYMS.indexOf(sym) < 0) {
      if (typeof showUpgradeModal === 'function') showUpgradeModal('Core tier is limited to SPY, QQQ, and IWM. Upgrade to Pro for all tickers.');
      return;
    }
    var dd = document.getElementById('gexCombinedDD');
    if (dd) dd.classList.remove('show');
    var inp = document.getElementById('gexCombinedTicker');
    if (inp) inp.value = sym;
    state.ticker = sym;
    state.gridData = null; state.intel = null; state.metrics = null; state.ms = null;
    state.confirmedRegime = null; state.smoothedConfidence = null; state.regimeFlipLog = [];
    // Tear down existing connections
    if (state.sse) { state.sse.close(); state.sse = null; }
    if (state.motionSSE) { state.motionSSE.close(); state.motionSSE = null; }
    state.sseConnected = false;
    // Reload
    load(); startSSE(); startMotionSSE(); fetchMetrics(); renderTickerStrip();
  }

  function setupTickerSelector() {
    var bar = document.getElementById('gex-decision-bar');
    if (!bar) return;
    // Use event delegation since elements are recreated on every renderDecisionBar
    bar.addEventListener('input', function(e) {
      if (e.target.id === 'gexCombinedTicker') showTickerDD();
    });
    bar.addEventListener('focusin', function(e) {
      if (e.target.id === 'gexCombinedTicker') showTickerDD();
    });
    bar.addEventListener('keydown', function(e) {
      if (e.target.id === 'gexCombinedTicker' && e.key === 'Enter') {
        var dd = document.getElementById('gexCombinedDD');
        if (dd) dd.classList.remove('show');
        switchTicker(e.target.value);
      }
    });
    bar.addEventListener('click', function(e) {
      if (e.target.id === 'gexCombinedLoad' || e.target.closest('#gexCombinedLoad')) {
        var inp = document.getElementById('gexCombinedTicker');
        if (inp) switchTicker(inp.value);
      }
    });
    bar.addEventListener('mousedown', function(e) {
      var opt = e.target.closest('.gex-ticker-opt');
      if (opt) switchTicker(opt.dataset.sym);
    });
    document.addEventListener('click', function(e) {
      var dd = document.getElementById('gexCombinedDD');
      if (dd && !e.target.closest('#gexCombinedDD') && !e.target.closest('#gexCombinedTicker')) dd.classList.remove('show');
    });
  }

  /* ── Replay System ── */
  function _startReplay() {
    var dateInput = document.getElementById('gexReplayDate');
    var date = dateInput ? dateInput.value : '';
    if (!date) { alert('Select a date to replay'); return; }
    var today = new Date().toISOString().slice(0, 10);
    if (date >= today) { alert('Date must be in the past'); return; }

    state.replay = true;
    state.replayDate = date;
    state.replaySlices = [];
    state.replayIndex = 0;
    state.replayPlaying = false;
    state.replayBaseContracts = null;
    state.replayCumVol = {};
    state.replaySpot = 0;

    // Pause live SSE while replaying
    if (state.sse) { state.sse.close(); state.sse = null; }

    var playPause = document.getElementById('gexReplayPlayPause');
    var slider = document.getElementById('gexReplaySlider');
    var timeLabel = document.getElementById('gexReplayTime');
    var stopBtn = document.getElementById('gexReplayStop');
    var replayBtn = document.getElementById('gexReplayBtn');
    if (playPause) playPause.style.display = '';
    if (slider) { slider.style.display = ''; slider.value = 0; slider.max = 0; }
    if (timeLabel) { timeLabel.style.display = ''; timeLabel.textContent = 'Loading...'; }
    if (stopBtn) stopBtn.style.display = '';
    if (replayBtn) { replayBtn.textContent = 'LOADING...'; replayBtn.disabled = true; }

    var liveDot = document.querySelector('#page-gex .status-dot, #gex-decision-bar .gex-intel-age');

    var ticker = state.ticker;
    var range = state.range;
    var h = headers();
    var url = '/api/gex/heatmap/' + ticker + '/replay?date=' + date + '&range=' + range;
    if (window.DASHBOARD_API_KEY) url += '&apiKey=' + encodeURIComponent(window.DASHBOARD_API_KEY);
    var es = new EventSource(url, {withCredentials:true});
    state.replayEventSource = es;

    es.addEventListener('init', function(e) {
      var data = JSON.parse(e.data);
      if (data.error) { alert('Replay error: ' + data.error); _stopReplay(); return; }
      state.gridData = normalizeGrid(data);
      state.replayBaseContracts = data.contracts || [];
      state.replaySpot = data.spotPrice || 0;
      state.replayCumVol = {};
      renderAll();
      if (replayBtn) { replayBtn.textContent = 'REPLAY'; replayBtn.disabled = false; }
      if (timeLabel) timeLabel.textContent = '09:30';
    });

    es.addEventListener('slice', function(e) {
      var slice = JSON.parse(e.data);
      state.replaySlices.push(slice);
      if (slider) slider.max = state.replaySlices.length - 1;
    });

    es.addEventListener('done', function() {
      es.close();
      state.replayEventSource = null;
      if (timeLabel) timeLabel.textContent = '09:30 (' + state.replaySlices.length + ' frames)';
    });

    es.addEventListener('error', function(e) {
      var data;
      try { data = JSON.parse(e.data); } catch(ex) { data = { error: 'Connection failed' }; }
      alert('Replay error: ' + (data.error || 'Connection failed'));
      _stopReplay();
    });

    es.onerror = function() {
      if (state.replay && state.replaySlices.length === 0) {
        if (replayBtn) { replayBtn.textContent = 'REPLAY'; replayBtn.disabled = false; }
        if (timeLabel) timeLabel.textContent = 'Error';
      }
    };
  }

  function _stopReplay() {
    state.replay = false;
    state.replayPlaying = false;
    state.replayCumVol = {};
    state.replaySpot = 0;
    if (state.replayTimer) { clearInterval(state.replayTimer); state.replayTimer = null; }
    if (state.replayEventSource) { state.replayEventSource.close(); state.replayEventSource = null; }

    var playPause = document.getElementById('gexReplayPlayPause');
    var slider = document.getElementById('gexReplaySlider');
    var timeLabel = document.getElementById('gexReplayTime');
    var stopBtn = document.getElementById('gexReplayStop');
    var replayBtn = document.getElementById('gexReplayBtn');
    if (playPause) playPause.style.display = 'none';
    if (slider) slider.style.display = 'none';
    if (timeLabel) timeLabel.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
    if (replayBtn) { replayBtn.textContent = 'REPLAY'; replayBtn.disabled = false; }

    // Resume live data
    load();
    startSSE();
  }

  function _toggleReplayPlay() {
    if (state.replaySlices.length === 0) return;
    state.replayPlaying = !state.replayPlaying;

    var playPause = document.getElementById('gexReplayPlayPause');
    if (playPause) playPause.innerHTML = state.replayPlaying ? '&#10074;&#10074;' : '&#9654;';
    if (playPause) playPause.className = state.replayPlaying ? 'replay-btn active' : 'replay-btn';

    if (state.replayPlaying) {
      state.replayTimer = setInterval(function() {
        if (state.replayIndex >= state.replaySlices.length - 1) {
          state.replayPlaying = false;
          if (playPause) { playPause.innerHTML = '&#9654;'; playPause.className = 'replay-btn'; }
          clearInterval(state.replayTimer);
          state.replayTimer = null;
          return;
        }
        state.replayIndex++;
        _applyReplaySlice(state.replayIndex);
        var slider = document.getElementById('gexReplaySlider');
        if (slider) slider.value = state.replayIndex;
      }, 500);
    } else {
      if (state.replayTimer) { clearInterval(state.replayTimer); state.replayTimer = null; }
    }
  }

  function _seekReplay(index) {
    state.replayIndex = Math.max(0, Math.min(index, state.replaySlices.length - 1));
    _applyReplaySlice(state.replayIndex);
  }

  function _applyReplaySlice(index) {
    if (!state.gridData || !state.replayBaseContracts || state.replayBaseContracts.length === 0) return;
    var slice = state.replaySlices[index];
    if (!slice) return;

    var timeLabel = document.getElementById('gexReplayTime');
    if (timeLabel) timeLabel.textContent = slice.time || '--:--';

    // Merge volume updates into cumulative state
    if (slice.updates) {
      for (var sym in slice.updates) {
        state.replayCumVol[sym] = slice.updates[sym].volume || 0;
      }
    }

    // Use spot from slice or fallback
    var spotPrice = slice.spot || state.replaySpot;
    if (spotPrice) state.replaySpot = spotPrice;
    else spotPrice = state.gridData.spotPrice;

    // Recalculate GEX with Black-Scholes gamma at current spot
    _recalcCombinedReplayGEX(spotPrice);
    renderAll();
  }

  function _recalcCombinedReplayGEX(spotPrice) {
    var contracts = state.replayBaseContracts;
    var cumVol = state.replayCumVol;
    var d = state.gridData;
    if (!contracts || !d || !d.matrix || !d.strikes) return;

    d.spotPrice = spotPrice;
    d.spot = spotPrice;
    var IV = 0.25;
    var today = state.replayDate;

    var strikeSet = {};
    for (var si = 0; si < d.strikes.length; si++) strikeSet[d.strikes[si]] = true;
    var expSet = {};
    for (var ei = 0; ei < d.expiries.length; ei++) expSet[d.expiries[ei]] = true;

    // Zero out matrix
    for (var s = 0; s < d.strikes.length; s++) {
      var strike = d.strikes[s];
      if (!d.matrix[strike]) d.matrix[strike] = {};
      for (var e = 0; e < d.expiries.length; e++) {
        var exp = d.expiries[e];
        d.matrix[strike][exp] = { net: 0, call: 0, put: 0, callOI: 0, putOI: 0, callVol: 0, putVol: 0 };
      }
    }

    function bsGamma(spot, strike, T, sigma) {
      if (T <= 0 || sigma <= 0 || spot <= 0) return 0;
      var d1 = (Math.log(spot / strike) + (0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
      var nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
      return nd1 / (spot * sigma * Math.sqrt(T));
    }

    for (var i = 0; i < contracts.length; i++) {
      var con = contracts[i];
      if (!strikeSet[con.strike] || !expSet[con.expirationDate]) continue;

      var daysToExp = Math.max(1, Math.round((new Date(con.expirationDate) - new Date(today)) / (24 * 60 * 60 * 1000)));
      var T = daysToExp / 365;
      var effectiveOI = con.openInterest + (cumVol[con.symbol] || 0);
      var g = bsGamma(spotPrice, con.strike, T, IV);
      var shares = effectiveOI * g * 100;
      var pct = shares * spotPrice * spotPrice * 0.01;
      var vol = cumVol[con.symbol] || 0;

      var cell = d.matrix[con.strike][con.expirationDate];
      if (con.optionType === 'call') {
        cell.call += pct; cell.callOI += con.openInterest; cell.callVol += vol;
      } else {
        cell.put -= pct; cell.putOI += con.openInterest; cell.putVol += vol;
      }
      cell.net = cell.call + cell.put;
    }

    // Update maxAbsGEX and netByExpiry
    var maxAbs = 0;
    d.netByExpiry = {};
    for (var e2 = 0; e2 < d.expiries.length; e2++) {
      var expDate = d.expiries[e2];
      var expNet = 0;
      for (var s2 = 0; s2 < d.strikes.length; s2++) {
        var cell2 = d.matrix[d.strikes[s2]][expDate];
        if (cell2 && Math.abs(cell2.net) > maxAbs) maxAbs = Math.abs(cell2.net);
        if (cell2) expNet += cell2.net;
      }
      d.netByExpiry[expDate] = expNet;
    }
    d.maxAbsGEX = maxAbs;

    // Recalculate key levels from strike-level aggregates
    var profileByStrike = [];
    for (var s3 = 0; s3 < d.strikes.length; s3++) {
      var sk = d.strikes[s3];
      var tNet = 0, tCall = 0, tPut = 0;
      for (var e3 = 0; e3 < d.expiries.length; e3++) {
        var c3 = d.matrix[sk][d.expiries[e3]];
        if (c3) { tNet += c3.net; tCall += c3.call; tPut += c3.put; }
      }
      profileByStrike.push({ strike: sk, net: tNet, call: tCall, put: tPut });
    }

    var ascending = profileByStrike.slice().sort(function(a, b) { return a.strike - b.strike; });
    var posStrikes = ascending.filter(function(x) { return x.net > 0; });
    d.callWall = null;
    if (posStrikes.length > 0) {
      var best = posStrikes[0];
      for (var j = 1; j < posStrikes.length; j++) { if (posStrikes[j].net > best.net) best = posStrikes[j]; }
      d.callWall = { strike: best.strike, gex: best.net };
    }
    var negStrikes = ascending.filter(function(x) { return x.net < 0; });
    d.putWall = null;
    if (negStrikes.length > 0) {
      var worst = negStrikes[0];
      for (var j2 = 1; j2 < negStrikes.length; j2++) { if (negStrikes[j2].net < worst.net) worst = negStrikes[j2]; }
      d.putWall = { strike: worst.strike, gex: worst.net };
    }
    d.gammaFlip = null;
    var cum = 0;
    for (var k = 0; k < ascending.length; k++) {
      var prev = cum;
      cum += ascending[k].net;
      if (k > 0 && prev !== 0 && Math.sign(prev) !== Math.sign(cum)) {
        var ratio = Math.abs(prev) / (Math.abs(prev) + Math.abs(ascending[k].net));
        d.gammaFlip = Math.round((ascending[k - 1].strike + ratio * (ascending[k].strike - ascending[k - 1].strike)) * 100) / 100;
        break;
      }
    }
    d.totalNetGEX = ascending.reduce(function(s, x) { return s + x.net; }, 0);
  }

  function _initReplayControls() {
    var replayBtn = document.getElementById('gexReplayBtn');
    var playPauseBtn = document.getElementById('gexReplayPlayPause');
    var stopBtn = document.getElementById('gexReplayStop');
    var slider = document.getElementById('gexReplaySlider');
    var dateInput = document.getElementById('gexReplayDate');

    if (dateInput) {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (yesterday.getDay() === 0) yesterday.setDate(yesterday.getDate() - 2);
      if (yesterday.getDay() === 6) yesterday.setDate(yesterday.getDate() - 1);
      dateInput.value = yesterday.toISOString().slice(0, 10);
      dateInput.max = yesterday.toISOString().slice(0, 10);
    }

    if (replayBtn) replayBtn.addEventListener('click', function() {
      if (state.replay) _stopReplay();
      else _startReplay();
    });
    if (playPauseBtn) playPauseBtn.addEventListener('click', _toggleReplayPlay);
    if (stopBtn) stopBtn.addEventListener('click', _stopReplay);
    if (slider) slider.addEventListener('input', function() {
      _seekReplay(parseInt(this.value));
    });
  }

  /* ── Pro View toggle ── */
  function setupProView() {
    var page = document.getElementById('page-gex');
    if (page && state.proView) page.classList.add('pro-view');
    var bar = document.getElementById('gex-decision-bar');
    if (bar) {
      bar.addEventListener('click', function(e) {
        if (e.target.id === 'gexProToggle' || e.target.closest('#gexProToggle')) {
          state.proView = !state.proView;
          localStorage.setItem('gex-pro-view', state.proView);
          var pg = document.getElementById('page-gex');
          if (pg) pg.classList.toggle('pro-view', state.proView);
          var btn = document.getElementById('gexProToggle');
          if (btn) btn.classList.toggle('active', state.proView);
        }
      });
    }
  }

  /* ── Lifecycle ── */
  function init() {
    setupTickerSelector();
    setupProView();
    setupStrips();
    setupAdvToggle();
    load();
    startSSE();
    startMotionSSE();
    renderMotionStrip(null);
    fetchMetrics();
    state.metricsInterval = setInterval(fetchMetrics, 30000);
    state.intelInterval = setInterval(refreshIntel, 10000);
    state.intelAgeTimer = setInterval(updateIntelAge, 1000);
    state.stalenessTimer = setInterval(function() {
      if (state.lastSSETime && (Date.now() - state.lastSSETime) / 1000 > 35) {
        console.warn('[gex] SSE stale');
      }
    }, 2000);
    setupTooltip();
    setupIsolation();
    setupPalette();
    _initReplayControls();
    fetchTickerPrices(); renderTickerStrip();
    state.tickerPriceInterval = setInterval(function() { fetchTickerPrices(); setTimeout(renderTickerStrip, 2000); }, 30000);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    // Init Market State panel
    if (SQ.msPanel) SQ.msPanel.init(state.ticker || 'SPY');
  }

  function destroy() {
    if (SQ.msPanel) SQ.msPanel.destroy();
    if (state.sse) { state.sse.close(); state.sse = null; }
    if (state.motionSSE) { state.motionSSE.close(); state.motionSSE = null; }
    if (state.intelInterval) { clearInterval(state.intelInterval); state.intelInterval = null; }
    if (state.intelAgeTimer) { clearInterval(state.intelAgeTimer); state.intelAgeTimer = null; }
    if (state.stalenessTimer) { clearInterval(state.stalenessTimer); state.stalenessTimer = null; }
    if (state.metricsInterval) { clearInterval(state.metricsInterval); state.metricsInterval = null; }
    if (state.tickerPriceInterval) { clearInterval(state.tickerPriceInterval); state.tickerPriceInterval = null; }
    if (state.replayTimer) { clearInterval(state.replayTimer); state.replayTimer = null; }
    if (state.replayEventSource) { state.replayEventSource.close(); state.replayEventSource = null; }
    state.replay = false;
    state.replayPlaying = false;
    state.replaySlices = [];
    state.replayBaseContracts = null;
    state.sseConnected = false;
    state.isolatedStrike = null;
    state.confirmedRegime = null;
    state.smoothedConfidence = null;
    state.regimeFlipLog = [];
    state.gridData = null;
    state.intel = null;
    state.metrics = null;
    state.ms = null;
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getGexCombinedPageCSS, getGexCombinedPageHTML, getGexCombinedPageJS };
