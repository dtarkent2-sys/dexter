/**
 * GEX Analytics Page Module
 * 
 * Extracted analytics tabs from GEX Intel page.
 * Tabs: Profile, Greeks, Skew, Term Structure, OI & Volume, Timeline, Surface, Scan, Analysis, Trade Desk
 * 
 * Exports: getGexAnalyticsPageCSS, getGexAnalyticsPageHTML, getGexAnalyticsPageJS
 */

// Part 1: CSS
function getGexAnalyticsPageCSS() {
  return `
/* ── GEX Analytics page scoped styles ── */
#page-gex-analytics .ticker-input {
  background: var(--bg-surface); border: 1px solid var(--border); color: var(--text);
  padding: 7px 14px; border-radius: 3px; font-family: var(--font-mono); font-size: 13px;
  width: 90px; text-transform: uppercase; font-weight: 600; transition: border-color 0.25s;
}
#page-gex-analytics .ticker-input:focus { outline: none; border-color: var(--accent); }
#page-gex-analytics .ticker-dropdown {
  display: none; position: absolute; top: 100%; left: 0; z-index: 200;
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  margin-top: 4px; min-width: 180px; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  max-height: 260px; overflow-y: auto;
}
#page-gex-analytics .ticker-dropdown.show { display: block; }
#page-gex-analytics .ticker-option {
  padding: 8px 14px; cursor: pointer; font-family: var(--font-mono); font-size: 11px;
  display: flex; justify-content: space-between; align-items: center; transition: background 0.15s;
}
#page-gex-analytics .ticker-option:hover { background: var(--accent-subtle); }
#page-gex-analytics .ticker-option .ticker-sym { font-weight: 600; color: var(--text); }
#page-gex-analytics .ticker-option .ticker-desc { font-size: 9px; color: var(--text-muted); }
#page-gex-analytics .btn {
  background: transparent; border: 1px solid var(--border); color: var(--text-muted);
  padding: 6px 14px; border-radius: 3px; cursor: pointer; font-family: var(--font-mono);
  font-size: 10px; font-weight: 500; transition: all 0.25s;
}
#page-gex-analytics .btn:hover { color: var(--text); border-color: var(--border); }
#page-gex-analytics .btn.active { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 700; }
#page-gex-analytics .controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
#page-gex-analytics .control-group { display: flex; align-items: center; gap: 5px; }
#page-gex-analytics .control-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
#page-gex-analytics .range-input { width: 70px; accent-color: var(--accent); }
#page-gex-analytics .range-val { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); min-width: 28px; text-align: center; }
#page-gex-analytics .separator { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }
#page-gex-analytics .spot-badge {
  color: var(--text); padding: 5px 14px; border-radius: 3px; font-family: var(--font-mono);
  font-size: 13px; font-weight: 600; white-space: nowrap; background: var(--bg-surface);
  border: 1px solid var(--border);
}
#page-gex-analytics .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 5px; }
#page-gex-analytics .status-dot.live { background: var(--green); }
#page-gex-analytics .status-dot.off { background: var(--text-muted); }

/* ── Tab Bar ── */
#page-gex-analytics .tab-bar {
  display: flex; background: var(--bg-surface); border-bottom: 1px solid var(--border);
  padding: 0 16px; flex-shrink: 0;
}
#page-gex-analytics .tab {
  padding: 10px 20px; background: transparent; border: none; border-bottom: 2px solid transparent;
  color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
#page-gex-analytics .tab:hover { color: var(--text); background: var(--border-subtle); }
#page-gex-analytics .tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }

/* ── Detail Zone ── */
#page-gex-analytics .detail-zone { flex: 1; overflow: hidden; position: relative; min-height: 200px; }
#page-gex-analytics .detail-panel {
  display: none; position: absolute; inset: 0; overflow-y: auto;
  padding: 0; opacity: 0; transition: opacity 0.2s ease; flex-direction: column;
}
#page-gex-analytics .detail-panel.active { display: flex; opacity: 1; }

/* ── Greeks Panel ── */
#page-gex-analytics .greeks-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg-surface); flex-shrink: 0;
}
#page-gex-analytics .greeks-toggle { display: flex; gap: 2px; background: var(--bg-surface); border-radius: 3px; padding: 2px; }
#page-gex-analytics .greeks-btn {
  padding: 5px 14px; border-radius: 4px; border: none; background: transparent;
  color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
#page-gex-analytics .greeks-btn.active { background: var(--accent); color: var(--bg); font-weight: 700; }

/* ── Analysis Panel ── */
#page-gex-analytics .analysis-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-surface);
  font-family: var(--font-body); font-size: 11px; font-weight: 600; color: var(--text-muted); flex-shrink: 0;
}
#page-gex-analytics .analysis-content { flex: 1; padding: 16px; overflow-y: auto; }

/* ── Scan Panel ── */
#page-gex-analytics .scan-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg-surface);
  font-family: var(--font-body); font-size: 11px; font-weight: 600; color: var(--text-muted); flex-shrink: 0;
}
#page-gex-analytics #gaScanContent { flex: 1; padding: 12px 16px; overflow-y: auto; }

/* ── Profile Panel ── */
#page-gex-analytics .profile-panel { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: var(--bg); }
#page-gex-analytics .profile-title {
  padding: 12px 20px; font-family: var(--font-body); font-size: 11px; font-weight: 600;
  border-bottom: 1px solid var(--border); background: var(--bg-surface);
  color: var(--text-muted); letter-spacing: 0;
}

/* ── Overview Cards ── */
#page-gex-analytics .overview-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
@media (max-width: 900px) { #page-gex-analytics .overview-cards { grid-template-columns: repeat(2, 1fr); } }
#page-gex-analytics .overview-card {
  background: var(--bg-surface); padding: 20px 24px; border-radius: 10px;
  border: 1px solid var(--border); transition: all 0.3s;
}
#page-gex-analytics .overview-card:hover { background: var(--bg-surface-hover); border-color: var(--border); }
#page-gex-analytics .overview-card .card-label { font-family: var(--font-body); font-size: 11px; font-weight: 500; color: var(--text-muted); margin-bottom: 8px; }
#page-gex-analytics .overview-card .card-value { font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -1px; }
#page-gex-analytics .overview-card .card-sub { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 6px; }
#page-gex-analytics .intensity-gauge { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
#page-gex-analytics .intensity-gauge canvas { max-width: 120px; }
#page-gex-analytics .intensity-pct { font-family: var(--font-mono); font-size: 28px; font-weight: 700; margin-top: -20px; }
#page-gex-analytics .intensity-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: 2px; }
#page-gex-analytics .intensity-range { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: 4px; }
#page-gex-analytics .overview-regime { display: inline-flex; align-items: center; gap: 12px; padding: 10px 0; margin-bottom: 20px; }
#page-gex-analytics .overview-regime .regime-dot { width: 8px; height: 8px; border-radius: 50%; }
#page-gex-analytics .overview-regime .regime-label { font-family: var(--font-heading); font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
#page-gex-analytics .overview-regime .regime-conf { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

/* ── Scan Filters ── */
#page-gex-analytics .scan-filters { display: flex; gap: 4px; padding: 6px 0 8px; }
#page-gex-analytics .scan-filter { font-family: var(--font-mono); font-size: 10px; padding: 3px 10px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-muted); border-radius: 4px; cursor: pointer; transition: all 0.15s; }
#page-gex-analytics .scan-filter.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
#page-gex-analytics .scan-filter:hover:not(.active) { border-color: var(--border); }

/* ── Tooltip ── */
#page-gex-analytics .tooltip {
  position: fixed; z-index: 100; background: var(--bg-surface);
  border: 1px solid var(--border); border-radius: 3px; padding: 14px 18px;
  font-size: 12px; pointer-events: none; opacity: 0; transition: opacity 0.15s;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6); max-width: 240px;
}
#page-gex-analytics .tooltip.show { opacity: 1; }
#page-gex-analytics .tooltip .tt-title { font-family: var(--font-body); font-weight: 600; margin-bottom: 10px; color: var(--text); font-size: 13px; }
#page-gex-analytics .tooltip .tt-row { display: flex; justify-content: space-between; gap: 20px; margin: 4px 0; }
#page-gex-analytics .tooltip .tt-label { font-family: var(--font-body); font-size: 11px; color: var(--text-muted); font-weight: 400; }
#page-gex-analytics .tooltip .tt-val { font-family: var(--font-mono); font-weight: 600; font-size: 11px; }
#page-gex-analytics .tt-pos { color: var(--green); }
#page-gex-analytics .tt-neg { color: var(--red); }

/* ── Key Levels Badges ── */
#page-gex-analytics .key-levels { display: flex; gap: 8px; font-family: var(--font-mono); font-size: 10px; font-weight: 500; }
#page-gex-analytics .kl-badge { padding: 4px 10px; border-radius: 4px; white-space: nowrap; border: 1px solid transparent; }
#page-gex-analytics .kl-call { background: var(--accent-subtle); color: var(--green); border-color: rgba(78,201,160,0.12); }
#page-gex-analytics .kl-put { background: rgba(239,68,68,0.12); color: var(--red); border-color: rgba(192,88,98,0.12); }
#page-gex-analytics .kl-flip { background: var(--warn-dim); color: var(--yellow); border-color: rgba(184,149,64,0.12); }

/* ── Info Tips ── */
#page-gex-analytics .info-tip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 14px; height: 14px; border-radius: 50%; font-size: 9px; font-weight: 600;
  background: var(--border); color: var(--text-muted); cursor: help;
  margin-left: 6px; vertical-align: middle; position: relative;
}
#page-gex-analytics .info-tip:hover { background: var(--accent-subtle); color: var(--accent); }
#page-gex-analytics .info-tip-popup {
  display: none; position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  background: var(--bg-surface-hover); border: 1px solid var(--border); border-radius: 3px;
  padding: 12px 16px; width: 260px; font-family: var(--font-body); font-size: 11px;
  color: var(--text); line-height: 1.5; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  z-index: 200; font-weight: 400; white-space: normal; pointer-events: none;
}
#page-gex-analytics .info-tip:hover .info-tip-popup { display: block; }
#page-gex-analytics .info-tip-popup strong { color: var(--accent); font-weight: 600; }

/* ── Regime Badge ── */
#page-gex-analytics .regime-badge {
  padding: 4px 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px;
  font-weight: 600; white-space: nowrap; border: 1px solid transparent;
}

/* ── Skew Chip ── */
#page-gex-analytics .skew-chip { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border: 1px solid var(--border-subtle); border-radius: 4px; background: transparent; color: var(--text-muted); cursor: pointer; }
#page-gex-analytics .skew-chip.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }

/* ── Term Structure & OI Cards ── */
#page-gex-analytics .term-card,
#page-gex-analytics .oi-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 3px; padding: 10px 14px; flex: 1; text-align: center;
}
#page-gex-analytics .term-card-label,
#page-gex-analytics .oi-card-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  text-transform: uppercase; margin-bottom: 4px;
}
#page-gex-analytics .term-card-value,
#page-gex-analytics .oi-card-value {
  font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text);
}
/* ── Skew Summary Cards ── */
#page-gex-analytics .skew-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 3px; padding: 10px 14px; flex: 1; text-align: center;
}
#page-gex-analytics .skew-card-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  text-transform: uppercase; margin-bottom: 4px;
}
#page-gex-analytics .skew-card-value {
  font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text);
}

/* ── Targets Panel ── */
#page-gex-analytics .tgt-section { margin-bottom: 20px; }
#page-gex-analytics .tgt-section-hdr {
  font-family: var(--font-body); font-size: 11px; font-weight: 600;
  padding: 10px 12px 6px; margin-bottom: 4px;
  display: flex; justify-content: space-between; align-items: center;
  color: var(--text-muted); border-bottom: 1px solid var(--border);
}
#page-gex-analytics .tgt-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; border-radius: 4px; font-size: 11px; transition: background 0.2s; }
#page-gex-analytics .tgt-row:hover { background: var(--border-subtle); }
#page-gex-analytics .tgt-strike { font-family: var(--font-mono); font-weight: 600; color: var(--text); min-width: 55px; font-size: 12px; }
#page-gex-analytics .tgt-dist { font-family: var(--font-mono); color: var(--text-muted); font-size: 10px; margin-left: 4px; }
#page-gex-analytics .tgt-tags { display: flex; gap: 4px; margin-left: 8px; }
#page-gex-analytics .tgt-tag { font-family: var(--font-mono); font-size: 8px; font-weight: 600; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; }
#page-gex-analytics .tgt-bar-wrap { flex: 1; max-width: 80px; height: 4px; background: var(--bg-surface); border-radius: 2px; margin: 0 10px; overflow: hidden; }
#page-gex-analytics .tgt-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
#page-gex-analytics .tgt-pct { font-family: var(--font-mono); font-weight: 600; min-width: 34px; text-align: right; font-size: 11px; }
#page-gex-analytics .tgt-signal { padding: 14px 16px; border-radius: 3px; margin-bottom: 8px; border-left: 2px solid; transition: background 0.2s; }
#page-gex-analytics .tgt-signal:hover { background: var(--border-subtle); }
#page-gex-analytics .tgt-signal-title { font-family: var(--font-heading); font-weight: 600; font-size: 12px; }
#page-gex-analytics .tgt-signal-detail { font-family: var(--font-body); font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: 400; }
#page-gex-analytics .tgt-signal-conf { font-family: var(--font-mono); font-weight: 700; font-size: 15px; float: right; margin-top: -2px; }

/* ── Trade Desk ── */
#page-gex-analytics .trade-desk {
  margin: 0 14px 6px; border-radius: 3px; overflow: hidden;
  border: 1px solid var(--border); background: var(--bg-surface);
}
#page-gex-analytics .trade-desk-collapse-btn {
  width: 100%; background: none; border: none; padding: 6px 16px;
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  cursor: pointer; text-align: right; border-top: 1px solid var(--border-subtle); transition: color 0.2s;
}
#page-gex-analytics .trade-desk-collapse-btn:hover { color: var(--accent); }
#page-gex-analytics .hero-pick { padding: 16px; border-bottom: 1px solid var(--border-subtle); }
#page-gex-analytics .hero-pick.call-pick { border-left: 3px solid var(--green); }
#page-gex-analytics .hero-pick.put-pick { border-left: 3px solid var(--red); }
#page-gex-analytics .hero-direction { font-family: var(--font-body); font-size: 18px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
#page-gex-analytics .hero-direction.call { color: var(--green); }
#page-gex-analytics .hero-direction.put { color: var(--red); }
#page-gex-analytics .hero-expiry { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-bottom: 10px; }
#page-gex-analytics .hero-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
@media(max-width:640px) { #page-gex-analytics .hero-metrics { grid-template-columns: repeat(2, 1fr); } }
#page-gex-analytics .hero-metric { background: var(--border-subtle); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 8px; text-align: center; }
#page-gex-analytics .hero-metric-label { font-family: var(--font-mono); font-size: 8px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
#page-gex-analytics .hero-metric-value { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--text); }
#page-gex-analytics .hero-confidence { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 8px; }
#page-gex-analytics .hero-conf-badge { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 3px; }
#page-gex-analytics .hero-conf-badge.grade-a { background: rgba(34,197,94,0.15); color: var(--green); }
#page-gex-analytics .hero-conf-badge.grade-b { background: rgba(245,158,11,0.15); color: var(--yellow); }
#page-gex-analytics .hero-conf-badge.grade-c { background: rgba(239,68,68,0.15); color: var(--red); }
#page-gex-analytics .hero-conf-pct { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
#page-gex-analytics .hero-reasoning { font-family: var(--font-body); font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 10px; font-style: italic; }
#page-gex-analytics .hero-actions { display: flex; gap: 8px; flex-wrap: wrap; }
#page-gex-analytics .hero-btn { font-family: var(--font-mono); font-size: 10px; padding: 6px 14px; border-radius: 4px; cursor: pointer; border: 1px solid; transition: all 0.2s; font-weight: 600; background: none; }
#page-gex-analytics .hero-btn:hover { transform: translateY(-1px); }
#page-gex-analytics .hero-btn-customize { border-color: var(--accent); color: var(--accent); }
#page-gex-analytics .hero-btn-customize:hover { background: var(--accent-subtle); }
#page-gex-analytics .hero-btn-alts { border-color: var(--border); color: var(--text-muted); }
#page-gex-analytics .hero-btn-alts:hover { background: var(--border-subtle); }
#page-gex-analytics .trade-alts { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
#page-gex-analytics .trade-alts.open { max-height: 600px; }
#page-gex-analytics .alt-pick { padding: 10px 16px; border-bottom: 1px solid var(--border-subtle); display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; cursor: pointer; transition: background 0.15s; }
#page-gex-analytics .alt-pick:hover { background: var(--border-subtle); }
#page-gex-analytics .alt-direction { font-family: var(--font-body); font-size: 13px; font-weight: 700; min-width: 180px; }
#page-gex-analytics .alt-direction.call { color: var(--green); }
#page-gex-analytics .alt-direction.put { color: var(--red); }
#page-gex-analytics .alt-meta { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); display: flex; gap: 12px; flex-wrap: wrap; }
#page-gex-analytics .alt-actions { display: flex; gap: 6px; }
#page-gex-analytics .alt-swap-btn { font-family: var(--font-mono); font-size: 9px; padding: 3px 8px; border-radius: 3px; cursor: pointer; border: 1px solid var(--border); color: var(--text-muted); background: none; transition: all 0.15s; }
#page-gex-analytics .alt-swap-btn:hover { border-color: var(--accent); color: var(--accent); }
#page-gex-analytics .trade-builder { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; background: rgba(0,0,0,0.3); border-top: 1px solid var(--border-subtle); }
#page-gex-analytics .trade-builder.open { max-height: 1200px; }
#page-gex-analytics .builder-section { padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); }
#page-gex-analytics .builder-label { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
#page-gex-analytics .builder-pills { display: flex; gap: 4px; flex-wrap: wrap; }
#page-gex-analytics .builder-pill { font-family: var(--font-mono); font-size: 11px; padding: 6px 14px; border-radius: 4px; cursor: pointer; border: 1px solid var(--border-subtle); color: var(--text-muted); background: none; transition: all 0.15s; }
#page-gex-analytics .builder-pill:hover { border-color: var(--border); }
#page-gex-analytics .builder-pill.active-call { background: rgba(34,197,94,0.15); border-color: var(--green); color: var(--green); }
#page-gex-analytics .builder-pill.active-put { background: rgba(239,68,68,0.15); border-color: var(--red); color: var(--red); }
#page-gex-analytics .builder-pill.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
#page-gex-analytics .builder-strikes { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px; }
#page-gex-analytics .builder-strikes::-webkit-scrollbar { height: 3px; }
#page-gex-analytics .builder-strikes::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
#page-gex-analytics .builder-greeks { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
@media(max-width:640px) { #page-gex-analytics .builder-greeks { grid-template-columns: repeat(3, 1fr); } }
#page-gex-analytics .builder-greek { background: var(--border-subtle); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 6px 8px; text-align: center; }
#page-gex-analytics .builder-greek-label { font-family: var(--font-mono); font-size: 8px; color: var(--text-muted); text-transform: uppercase; }
#page-gex-analytics .builder-greek-val { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--text); }
#page-gex-analytics .builder-risk { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@media(max-width:640px) { #page-gex-analytics .builder-risk { grid-template-columns: 1fr; } }
#page-gex-analytics .builder-input-group { display: flex; flex-direction: column; gap: 3px; }
#page-gex-analytics .builder-input-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
#page-gex-analytics .builder-input { font-family: var(--font-mono); font-size: 12px; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-subtle); background: rgba(0,0,0,0.3); color: var(--text); width: 100%; box-sizing: border-box; }
#page-gex-analytics .builder-input:focus { outline: none; border-color: var(--accent); }
#page-gex-analytics .builder-pnl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
@media(max-width:640px) { #page-gex-analytics .builder-pnl { grid-template-columns: 1fr; } }
#page-gex-analytics .pnl-scenario { background: var(--border-subtle); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 8px; text-align: center; }
#page-gex-analytics .pnl-scenario-label { font-family: var(--font-mono); font-size: 8px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
#page-gex-analytics .pnl-scenario-val { font-family: var(--font-mono); font-size: 14px; font-weight: 700; }
#page-gex-analytics .pnl-pos { color: var(--green); }
#page-gex-analytics .pnl-neg { color: var(--red); }
#page-gex-analytics .pnl-neutral { color: var(--text-muted); }
#page-gex-analytics .trade-desk-disclaimer { padding: 6px 16px; font-family: var(--font-mono); font-size: 8px; color: var(--text-muted); text-align: center; font-style: italic; border-top: 1px solid var(--border-subtle); }

/* ── Squeeze Gauge ── */
#page-gex-analytics .squeeze-gauge { width: 200px; height: 200px; position: relative; margin: 0 auto; }
#page-gex-analytics .squeeze-ring { width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(from 180deg, var(--red) 0%, var(--yellow) 50%, var(--green) 100%); -webkit-mask: radial-gradient(transparent 65%, black 66%); mask: radial-gradient(transparent 65%, black 66%); opacity: 0.3; }
#page-gex-analytics .squeeze-value { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
#page-gex-analytics .squeeze-number { font-family: var(--font-mono); font-size: 48px; font-weight: 800; letter-spacing: -2px; }
#page-gex-analytics .squeeze-label { font-family: var(--font-heading); font-size: 13px; font-weight: 600; margin-top: 4px; }

/* ── Scan Table ── */
#page-gex-analytics .scan-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; }
#page-gex-analytics .scan-table th { padding: 10px 12px; text-align: left; font-size: 9px; color: var(--text-muted); font-weight: 500; border-bottom: 1px solid var(--border); background: var(--bg); position: sticky; top: 0; z-index: 1; }
#page-gex-analytics .scan-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); transition: background 0.15s; }
#page-gex-analytics .scan-table tr:hover td { background: var(--border-subtle); }
#page-gex-analytics .scan-table .scan-ticker { font-weight: 700; color: var(--text); cursor: pointer; }
#page-gex-analytics .scan-table .scan-ticker:hover { color: var(--accent); text-decoration: underline; }

/* ── Loading / Error ── */
#page-gex-analytics .loading { display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 14px; }
#page-gex-analytics .loading .spinner { width: 20px; height: 20px; border: 1.5px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: ga-spin 0.8s linear infinite; }
@keyframes ga-spin { to { transform: rotate(360deg); } }
#page-gex-analytics .error-msg { color: var(--red); background: rgba(239,68,68,0.12); padding: 14px 24px; border-radius: 3px; margin: 20px; font-family: var(--font-body); font-size: 12px; border: 1px solid rgba(192,88,98,0.15); }

/* ── Footer ── */
#page-gex-analytics .ga-footer { padding: 6px 24px; font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); background: var(--bg-surface); border-top: 1px solid var(--border); display: flex; justify-content: space-between; flex-shrink: 0; }

/* ── Spot Price Flash ── */
@keyframes ga-priceFlash { 0% { background: var(--accent-subtle); } 100% { background: transparent; } }
#page-gex-analytics .spot-badge.flash { animation: ga-priceFlash 0.6s ease-out; }

/* ── Responsive ── */
@media (max-width: 768px) {
  #page-gex-analytics .tab-bar { overflow-x: auto; padding: 0 8px; }
  #page-gex-analytics .tab { padding: 10px 16px; font-size: 11px; white-space: nowrap; }
  #page-gex-analytics .separator { display: none; }
  #page-gex-analytics .controls { width: 100%; }
  #page-gex-analytics .key-levels { font-size: 8px; gap: 4px; }
  #page-gex-analytics .kl-badge { padding: 2px 6px; font-size: 8px; }
  #page-gex-analytics .trade-desk { margin: 0 8px 4px; }
  #page-gex-analytics .detail-zone { min-height: 50vh; }
}

/* ── Page layout ── */
#page-gex-analytics.active { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
#page-gex-analytics .ga-controls-bar {
  display: flex; align-items: center; gap: 12px; padding: 10px 24px;
  background: var(--bg-surface); border-bottom: 1px solid var(--border); flex-wrap: wrap; flex-shrink: 0;
}
`;
}


function getGexAnalyticsPageHTML() {
  return `<div class="page" id="page-gex-analytics">
  <div class="page-header">
    <div><h2>SharkAnalytics&trade;</h2><div class="subtitle">Gamma exposure analytics &amp; trade desk</div></div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <div style="position:relative">
        <input type="text" class="ticker-input" id="gaTickerInput" value="SPY" placeholder="SPY" maxlength="6" autocomplete="off" />
        <div class="ticker-dropdown" id="gaTickerDropdown"></div>
      </div>
      <button class="btn" id="gaLoadBtn">Load</button>
      <div class="separator"></div>
      <div class="control-group">
        <span class="control-label">Range</span>
        <input type="range" class="range-input" id="gaRangeSlider" min="5" max="40" value="20" />
        <span class="range-val" id="gaRangeVal">&plusmn;20</span>
      </div>
      <div style="margin-left:auto;display:flex;align-items:center;gap:12px">
        <span class="spot-badge" id="gaSpotBadge">&mdash;</span>
        <span class="key-levels" id="gaKeyLevels"></span>
        <span class="regime-badge" id="gaRegimeBadge"></span>
        <span class="status-dot live" id="gaLiveDot" style="margin-left:4px" title="Live updates every 5s"></span>
      </div>
    </div>
  </div>

  <!-- Tab Bar -->
  <div class="tab-bar" id="gaTabBar">
    <button id="gaActionExpandBtn" style="display:none;background:var(--accent);color:#000;border:none;border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:600;margin-right:6px">Trade Desk</button>
    <button class="tab active" data-tab="profile">Profile</button>
    <button class="tab" data-tab="greeks">Greeks</button>
    <button class="tab" data-tab="analysis">Analysis</button>
    <button class="tab" data-tab="scan">Scan</button>
    <button class="tab" data-tab="skew">Skew</button>
    <button class="tab" data-tab="term">Term Structure</button>
    <button class="tab" data-tab="oi">OI & Volume</button>
    <button class="tab" data-tab="timeline">Timeline</button>
    <button class="tab" data-tab="surface">Surface</button>
  </div>

  <!-- Detail Zone -->
  <div class="detail-zone" id="gaDetailZone">
    <!-- Profile panel -->
    <div class="detail-panel active" id="gaProfilePanel">
      <div class="profile-title" style="display:flex;justify-content:space-between;align-items:center">
        <span>GEX Profile <span class="info-tip" data-tip="gex">?</span></span>
        <span id="gaProfileNetGex" style="font-family:var(--font-mono);font-size:10px"></span>
      </div>
      <div style="flex:1;padding:8px 4px;overflow-y:auto;position:relative">
        <canvas id="gaProfileCanvas"></canvas>
      </div>
    </div>

    <!-- Greeks panel -->
    <div class="detail-panel" id="gaGreeksPanel">
      <div class="greeks-header">
        <div class="greeks-toggle">
          <button class="greeks-btn active" data-greek="vanna">Vanna</button>
          <button class="greeks-btn" data-greek="charm">Charm</button>
        </div>
        <span id="gaGreekNetLabel" style="font-family:var(--font-mono);font-size:10px"></span>
      </div>
      <div style="flex:1;padding:8px 4px;overflow-y:auto;position:relative">
        <canvas id="gaVannaCanvas"></canvas>
        <canvas id="gaCharmCanvas" style="display:none"></canvas>
      </div>
    </div>

    <!-- Analysis panel -->
    <div class="detail-panel" id="gaAnalysisPanel">
      <div class="analysis-header">
        <span>Analysis</span>
        <span id="gaAnalysisRegime" style="font-size:10px;font-weight:600"></span>
      </div>
      <div class="analysis-content" id="gaAnalysisContent"></div>
    </div>

    <!-- Scan panel -->
    <div class="detail-panel" id="gaScanPanel">
      <div class="scan-header">
        <span>Multi-Ticker GEX Scan</span>
        <div style="display:flex;gap:6px;align-items:center">
          <input class="ticker-input" id="gaScanInput" style="width:200px" placeholder="SPY,QQQ,AAPL,..." />
          <button class="btn" id="gaScanBtn">Scan</button>
        </div>
      </div>
      <div class="scan-filters" id="gaScanFilters">
        <button class="scan-filter active" data-filter="ALL">All</button>
        <button class="scan-filter" data-filter="BULL_IMBALANCE">Up Bias</button>
        <button class="scan-filter" data-filter="BEAR_IMBALANCE">Down Bias</button>
        <button class="scan-filter" data-filter="GAMMA_BOX">Range</button>
        <button class="scan-filter" data-filter="NO_CONTROL">Volatile</button>
      </div>
      <div id="gaScanContent"></div>
    </div>

    <!-- Skew panel -->
    <div class="detail-panel" id="gaSkewPanel">
      <div style="padding:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-family:var(--font-body);font-size:12px;font-weight:600;color:var(--text)">IV Skew</span>
          <div id="gaSkewChips" style="display:flex;gap:4px;margin-left:auto"></div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:12px;" id="gaSkewCards"></div>
        <div style="height:350px;position:relative;">
          <canvas id="gaSkewCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Term Structure panel -->
    <div class="detail-panel" id="gaTermPanel">
      <div style="padding:16px;">
        <div style="display:flex;gap:12px;margin-bottom:12px;" id="gaTermCards"></div>
        <div style="height:350px;position:relative;">
          <canvas id="gaTermCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- OI & Volume panel -->
    <div class="detail-panel" id="gaOIPanel">
      <div style="padding:16px;">
        <div style="display:flex;gap:12px;margin-bottom:12px;" id="gaOICards"></div>
        <div style="height:300px;position:relative;margin-bottom:16px;">
          <canvas id="gaOICanvas"></canvas>
        </div>
        <div style="height:250px;position:relative;">
          <canvas id="gaVolCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Timeline panel -->
    <div class="detail-panel" id="gaTimelinePanel">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px">
        <span style="font-family:var(--font-body);font-size:12px;font-weight:600;color:var(--text)">GEX Timeline</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)" id="gaTimelineInfo"></span>
      </div>
      <div style="flex:1;position:relative;padding:4px;min-height:300px">
        <canvas id="gaTimelineCanvas"></canvas>
      </div>
    </div>

    <!-- Surface panel -->
    <div class="detail-panel" id="gaSurfacePanel">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px">
        <span style="font-family:var(--font-body);font-size:12px;font-weight:600;color:var(--text)">Gamma Surface</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">Drag to rotate</span>
      </div>
      <div style="flex:1;position:relative;padding:4px;min-height:350px">
        <canvas id="gaSurfaceCanvas"></canvas>
      </div>
    </div>

    <!-- Loading indicator -->
    <div class="loading" id="gaLoadingIndicator" style="display:none">
      <div class="spinner"></div>
      <div style="color:var(--text-muted);font-size:12px;font-family:var(--font-body)">Enter a ticker to begin</div>
    </div>
  </div>

  <!-- Trade Desk -->
  <div class="trade-desk" id="gaTradeDesk" style="display:none">
    <div class="hero-pick" id="gaTradeDeskHero"></div>
    <div class="trade-alts" id="gaTradeDeskAlts"></div>
    <div class="trade-builder" id="gaTradeDeskBuilder"></div>
    <div class="trade-desk-disclaimer">Not financial advice. Decision support tool only.</div>
    <button class="trade-desk-collapse-btn" id="gaTradeDeskCollapseBtn">Collapse Trade Desk</button>
  </div>

  <!-- Footer -->
  <div class="ga-footer">
    <span id="gaFooterLeft">GEX = OI &times; Gamma &times; 100</span>
    <span id="gaFooterRight">&mdash;</span>
  </div>

</div>`;
}


function getGexAnalyticsPageJS() {
  return `
window.SQ = window.SQ || {};
SQ['gex-analytics'] = SQ.gexAnalytics = (function() {
  'use strict';

  // ── State ──
  var state = {
    ticker: 'SPY',
    data: null,
    selectedExps: [],
    allExps: [],
    tab: 'profile',
    activeGreek: 'vanna',
    range: 20,
    targetData: null,
    squeezeData: null,
    scanData: null,
    scanFilter: 'ALL',
    skewData: null,
    skewVisible: [],
    termData: null,
    oiData: null,
    timelineData: null,
    surfaceAngle: 0.6,
    surfaceDragBound: false,
  };

  var _profileChart = null;
  var _vannaChart = null;
  var _charmChart = null;
  var _skewChart = null;
  var _termChart = null;
  var _oiChart = null;
  var _volChart = null;

  var socketHandlers = {};
  var intervals = [];
  var tipInterval = null;
  var _docClickHandler = null;

  // ── DOM refs ──
  var $ = {};

  function esc(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Ticker Dropdown ──
  var POPULAR_TICKERS = [
    { sym: 'SPY', desc: 'S&P 500 ETF' },
    { sym: 'QQQ', desc: 'Nasdaq 100 ETF' },
    { sym: 'IWM', desc: 'Russell 2000 ETF' },
    { sym: 'DIA', desc: 'Dow Jones ETF' },
    { sym: 'NVDA', desc: 'NVIDIA' },
    { sym: 'AAPL', desc: 'Apple' },
    { sym: 'TSLA', desc: 'Tesla' },
    { sym: 'AMZN', desc: 'Amazon' },
    { sym: 'META', desc: 'Meta Platforms' },
    { sym: 'MSFT', desc: 'Microsoft' },
    { sym: 'AMD', desc: 'AMD' },
    { sym: 'GOOGL', desc: 'Alphabet' },
  ];

  function showTickerDropdown() {
    var dd = $.tickerDropdown;
    var input = $.tickerInput;
    if (!dd || !input) return;
    var filter = input.value.trim().toUpperCase();
    var items = filter ? POPULAR_TICKERS.filter(function(t) { return t.sym.indexOf(filter) >= 0 || t.desc.toUpperCase().indexOf(filter) >= 0; }) : POPULAR_TICKERS;
    if (items.length === 0) { dd.classList.remove('show'); return; }
    dd.innerHTML = items.map(function(t) {
      return '<div class="ticker-option" data-sym="' + t.sym + '">'
        + '<span class="ticker-sym">' + t.sym + '</span>'
        + '<span class="ticker-desc">' + t.desc + '</span></div>';
    }).join('');
    dd.classList.add('show');
  }

  function selectTicker(sym) {
    $.tickerInput.value = sym;
    $.tickerDropdown.classList.remove('show');
    loadTicker();
  }

  // ── Info Tooltips ──
  var TIP_TEXT = {
    gex: '<strong>Gamma Exposure (GEX)</strong> measures how much dealers must hedge per $1 move. Positive = dealers dampen moves (buy dips, sell rips). Negative = dealers amplify moves (chase direction).',
    vanna: '<strong>Vanna</strong> is dDelta/dIV. When IV drops, vanna magnets pull price upward (dealers buy). When IV rises, downward pull.',
    charm: '<strong>Charm</strong> is dDelta/dTime (overnight delta decay). Shows how dealer hedging shifts with time passage.',
  };

  function attachTipPopups() {
    var page = document.getElementById('page-gex-analytics');
    if (!page) return;
    page.querySelectorAll('.info-tip[data-tip]:not(.tip-ready)').forEach(function(el) {
      el.classList.add('tip-ready');
      var key = el.getAttribute('data-tip');
      if (TIP_TEXT[key]) {
        var popup = document.createElement('div');
        popup.className = 'info-tip-popup';
        popup.innerHTML = TIP_TEXT[key];
        el.appendChild(popup);
      }
    });
  }

  // ── Format helpers ──
  function fmtGEXShort(val) {
    if (!val || val === 0) return '0';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '+';
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(0) + 'K';
    return sign + abs.toFixed(0);
  }

  function fmtGEX(val) {
    if (!val || val === 0) return '';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '';
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(0) + 'K';
    if (abs >= 1) return sign + abs.toFixed(0);
    return '';
  }

  function fmtGEXFull(val) {
    if (!val || val === 0) return '0';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '';
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(1) + 'K';
    return sign + abs.toFixed(0);
  }


  // ── Load Ticker ──
  async function loadTicker() {
    var input = $.tickerInput;
    if (!input) return;
    var ticker = input.value.trim().toUpperCase().replace(/[^A-Z0-9.]/g, '');
    if (!ticker) return;

    if (window.SQ && SQ.userTier !== 'pro' && ticker !== 'SPY' && ticker !== 'QQQ') {
      if (typeof showUpgradeModal === 'function') showUpgradeModal('Free tier is limited to SPY and QQQ. Upgrade to Pro for all tickers.');
      return;
    }

    input.value = ticker;
    var oldTicker = state.ticker;
    state.ticker = ticker;
    state.targetData = null;
    state.squeezeData = null;

    if (SQ.socket && SQ.socket.connected) {
      SQ.socket.emit('subscribe', ticker);
    }

    showLoading('Fetching gamma data...');

    try {
      var url = '/api/gex/heatmap/' + ticker + '?range=' + state.range;
      var res = await fetch(url);
      var data = await res.json();

      if (data.error) throw new Error(data.error);

      state.data = data;
      state.allExps = data.expirations.map(function(e, i) { return i; });
      state.selectedExps = state.allExps.slice();

      hideLoading();
      renderAll();
      updateSpotBadge();
      updateFooter();

      loadTargets();
      if (state.tab === 'analysis') loadSqueeze();

    } catch (err) {
      showError(err.message);
    }
  }

  // ── Rendering ──
  function renderAll() {
    if (!state.data) return;
    if (state.tab === 'profile') renderProfile();
    if (state.tab === 'greeks') {
      if (state.activeGreek === 'vanna') renderVannaChart();
      else renderCharmChart();
    }
    if (state.tab === 'analysis') renderAnalysis();
    if (state.tab === 'scan' && state.scanData) renderScan();
    updateRegimeBadge();
    renderTradeDesk();
  }

  function renderProfile() {
    if (!state.data) return;
    var canvas = document.getElementById('gaProfileCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    var data = state.data, selectedExps = state.selectedExps;

    var profile = data.strikes.map(function(strike, si) {
      var callGex = 0, putGex = 0;
      for (var k = 0; k < selectedExps.length; k++) {
        var idx = selectedExps[k];
        var v = data.grid[si].values[idx];
        if (v) { callGex += v.call; putGex += v.put; }
      }
      return { strike: strike, call: callGex, put: putGex, net: callGex + putGex };
    });

    var sorted = profile.slice().reverse();
    var totalNet = sorted.reduce(function(s, p) { return s + p.net; }, 0);
    var netEl = document.getElementById('gaProfileNetGex');
    if (netEl) {
      netEl.textContent = 'Net ' + fmtGEXFull(totalNet);
      netEl.style.color = totalNet >= 0 ? 'var(--green)' : 'var(--red)';
    }

    var cwStrike = data.callWall ? data.callWall.strike : null;
    var pwStrike = data.putWall ? data.putWall.strike : null;
    var flipStrike = data.gammaFlip;

    var spotStrike = sorted.reduce(function(best, p) {
      return Math.abs(p.strike - data.spotPrice) < Math.abs(best - data.spotPrice) ? p.strike : best;
    }, sorted[0] ? sorted[0].strike : 0);

    var bgColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent-subtle)';
      return p.net >= 0 ? 'rgba(78,201,160,0.55)' : 'rgba(192,88,98,0.55)';
    });
    var borderColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent)';
      return p.net >= 0 ? 'rgba(78,201,160,0.8)' : 'rgba(192,88,98,0.8)';
    });

    if (_profileChart) { _profileChart.destroy(); _profileChart = null; }

    var annotations = {};
    if (cwStrike) {
      var idx = sorted.findIndex(function(p) { return p.strike === cwStrike; });
      if (idx >= 0) annotations.callWall = {
        type: 'line', xMin: idx, xMax: idx, borderColor: 'rgba(78,201,160,0.5)', borderWidth: 1, borderDash: [4,3],
        label: { display: true, content: 'Call Wall', position: 'start', font: { size: 9, family: 'Inter' }, color: 'rgba(78,201,160,0.7)', backgroundColor: 'transparent' }
      };
    }
    if (pwStrike) {
      var idx2 = sorted.findIndex(function(p) { return p.strike === pwStrike; });
      if (idx2 >= 0) annotations.putWall = {
        type: 'line', xMin: idx2, xMax: idx2, borderColor: 'rgba(192,88,98,0.5)', borderWidth: 1, borderDash: [4,3],
        label: { display: true, content: 'Put Wall', position: 'start', font: { size: 9, family: 'Inter' }, color: 'rgba(192,88,98,0.7)', backgroundColor: 'transparent' }
      };
    }
    if (flipStrike) {
      var idx3 = sorted.findIndex(function(p, i) { return i > 0 && sorted[i-1].strike <= flipStrike && p.strike >= flipStrike; });
      if (idx3 >= 0) annotations.flip = {
        type: 'line', xMin: idx3 - 0.5, xMax: idx3 - 0.5, borderColor: 'rgba(184,149,64,0.6)', borderWidth: 1.5, borderDash: [6,3],
        label: { display: true, content: 'Flip $' + flipStrike, position: 'end', font: { size: 9, family: 'Inter' }, color: 'rgba(184,149,64,0.8)', backgroundColor: 'transparent' }
      };
    }
    if (data.maxPain) {
      var idx4 = sorted.findIndex(function(p) { return p.strike === data.maxPain.strike; });
      if (idx4 >= 0) annotations.maxPain = {
        type: 'line', xMin: idx4, xMax: idx4, borderColor: 'rgba(107,114,128,0.4)', borderWidth: 1, borderDash: [3,3],
        label: { display: true, content: 'Max Pain $' + data.maxPain.strike, position: 'center', font: { size: 9, family: 'Inter' }, color: 'rgba(107,114,128,0.6)', backgroundColor: 'transparent' }
      };
    }

    _profileChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sorted.map(function(p) { return '$' + p.strike; }),
        datasets: [{ data: sorted.map(function(p) { return p.net; }), backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2, barPercentage: 0.85 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14,14,17,0.95)', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1,
            titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'JetBrains Mono', size: 11 }, padding: 12,
            callbacks: {
              title: function(items) { return items[0].label; },
              label: function(item) { var p = sorted[item.dataIndex]; return ['Net: ' + fmtGEXFull(p.net), 'Call: ' + fmtGEXFull(p.call), 'Put: ' + fmtGEXFull(p.put)]; },
            },
          },
          annotation: { annotations: annotations },
        },
        scales: {
          x: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 25,
            callback: function(val, idx) { var s = sorted[idx] ? sorted[idx].strike : 0; if (s === spotStrike) return '* $' + s; return '$' + s; } }, border: { color: 'var(--border-subtle)' } },
          y: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, callback: function(val) { return fmtGEX(val); } }, border: { display: false } },
        },
        animation: { duration: 400, easing: 'easeOutQuart' },
      },
    });
  }

  function renderVannaChart() {
    if (!state.data || !state.data.vannaProfile) return;
    var canvas = document.getElementById('gaVannaCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    var vp = state.data.vannaProfile;
    var sorted = vp.slice().reverse();
    var hasData = sorted.some(function(p) { return p.net !== 0; });
    var netEl = document.getElementById('gaGreekNetLabel');
    if (netEl && state.data.totalNetVanna != null) {
      netEl.textContent = 'Net ' + fmtGEXFull(state.data.totalNetVanna);
      netEl.style.color = state.data.totalNetVanna >= 0 ? 'var(--green)' : 'var(--red)';
    }
    if (!hasData) { if (netEl) netEl.textContent = 'No vanna data'; return; }
    var spotStrike = sorted.reduce(function(best, p) { return Math.abs(p.strike - state.data.spotPrice) < Math.abs(best - state.data.spotPrice) ? p.strike : best; }, sorted[0] ? sorted[0].strike : 0);
    var bgColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent-subtle)';
      return p.net >= 0 ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.55)';
    });
    if (_vannaChart) { _vannaChart.destroy(); _vannaChart = null; }
    _vannaChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: sorted.map(function(p) { return '$' + p.strike; }), datasets: [{ data: sorted.map(function(p) { return p.net; }), backgroundColor: bgColors, borderColor: bgColors.map(function(c) { return typeof c === 'string' ? c : c; }), borderWidth: 1, borderRadius: 2, barPercentage: 0.85 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(14,14,17,0.95)', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1, titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'JetBrains Mono', size: 11 }, padding: 12, callbacks: { title: function(items) { return items[0].label; }, label: function(item) { var p = sorted[item.dataIndex]; return ['Net Vanna: ' + fmtGEXFull(p.net), 'Call: ' + fmtGEXFull(p.call), 'Put: ' + fmtGEXFull(p.put)]; } } } }, scales: { x: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 25 }, border: { color: 'var(--border-subtle)' } }, y: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, callback: function(val) { return fmtGEX(val); } }, border: { display: false } } }, animation: { duration: 400, easing: 'easeOutQuart' } },
    });
  }

  function renderCharmChart() {
    if (!state.data || !state.data.charmProfile) return;
    var canvas = document.getElementById('gaCharmCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    var cp = state.data.charmProfile;
    var sorted = cp.slice().reverse();
    var hasData = sorted.some(function(p) { return p.net !== 0; });
    var netEl = document.getElementById('gaGreekNetLabel');
    if (netEl && state.data.totalNetCharm != null) {
      netEl.textContent = 'Net ' + fmtGEXFull(state.data.totalNetCharm);
      netEl.style.color = state.data.totalNetCharm >= 0 ? 'var(--green)' : 'var(--red)';
    }
    if (!hasData) { if (netEl) netEl.textContent = 'No charm data'; return; }
    var spotStrike = sorted.reduce(function(best, p) { return Math.abs(p.strike - state.data.spotPrice) < Math.abs(best - state.data.spotPrice) ? p.strike : best; }, sorted[0] ? sorted[0].strike : 0);
    var bgColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent-subtle)';
      return p.net >= 0 ? 'rgba(107,127,163,0.55)' : 'rgba(192,88,98,0.55)';
    });
    if (_charmChart) { _charmChart.destroy(); _charmChart = null; }
    _charmChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: sorted.map(function(p) { return '$' + p.strike; }), datasets: [{ data: sorted.map(function(p) { return p.net; }), backgroundColor: bgColors, borderWidth: 1, borderRadius: 2, barPercentage: 0.85 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(14,14,17,0.95)', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1, titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'JetBrains Mono', size: 11 }, padding: 12, callbacks: { title: function(items) { return items[0].label; }, label: function(item) { var p = sorted[item.dataIndex]; return ['Net Charm: ' + fmtGEXFull(p.net), 'Call: ' + fmtGEXFull(p.call), 'Put: ' + fmtGEXFull(p.put)]; } } } }, scales: { x: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 25 }, border: { color: 'var(--border-subtle)' } }, y: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, callback: function(val) { return fmtGEX(val); } }, border: { display: false } } }, animation: { duration: 400, easing: 'easeOutQuart' } },
    });
  }


  // ── Timeline ──
  function loadTimeline() {
    fetch('/api/gex/timeline/' + state.ticker + '?hours=6')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        state.timelineData = d;
        var info = document.getElementById('gaTimelineInfo');
        if (info) info.textContent = d.intervals.length + ' intervals';
        renderTimeline();
      });
  }

  function renderTimeline() {
    var canvas = document.getElementById('gaTimelineCanvas');
    if (!canvas || !state.timelineData || !state.timelineData.intervals.length) return;
    var data = state.timelineData;
    var wrap = canvas.parentElement;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = wrap.clientWidth, H = wrap.clientHeight;
    var PAD = { top: 30, right: 20, bottom: 40, left: 60 };
    ctx.clearRect(0, 0, W, H);

    var intervals = data.intervals;
    var times = intervals.map(function(d) { return d.time; });
    var minT = times[0], maxT = times[times.length - 1];
    var allPrices = [];
    intervals.forEach(function(d) {
      allPrices.push(d.spot);
      if (d.callWall) allPrices.push(d.callWall);
      if (d.putWall) allPrices.push(d.putWall);
      if (d.gammaFlip) allPrices.push(d.gammaFlip);
    });
    var minP = Math.min.apply(null, allPrices), maxP = Math.max.apply(null, allPrices);
    var pPad = (maxP - minP) * 0.05 || 1;
    minP -= pPad; maxP += pPad;
    var xScale = function(t) { return PAD.left + (t - minT) / (maxT - minT || 1) * (W - PAD.left - PAD.right); };
    var yScale = function(p) { return PAD.top + (1 - (p - minP) / (maxP - minP)) * (H - PAD.top - PAD.bottom); };

    // Background GEX coloring
    var colW = (W - PAD.left - PAD.right) / Math.max(1, intervals.length - 1);
    intervals.forEach(function(d) {
      var x = xScale(d.time) - colW / 2;
      var alpha = Math.min(0.3, Math.abs(d.netGEX) / 1e9 * 0.3);
      ctx.fillStyle = d.netGEX >= 0 ? 'rgba(34,197,94,' + alpha + ')' : 'rgba(239,68,68,' + alpha + ')';
      ctx.fillRect(x, PAD.top, colW, H - PAD.top - PAD.bottom);
    });

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (var g = 0; g < 5; g++) {
      var gy = PAD.top + g * (H - PAD.top - PAD.bottom) / 4;
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(W - PAD.right, gy); ctx.stroke();
      ctx.fillStyle = '#666'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right';
      ctx.fillText('$' + (maxP - g * (maxP - minP) / 4).toFixed(0), PAD.left - 6, gy + 3);
    }

    function drawLine(field, color, dash) {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash);
      var started = false;
      intervals.forEach(function(d) {
        if (d[field] == null) return;
        var x = xScale(d.time), y = yScale(d[field]);
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      });
      ctx.stroke(); ctx.setLineDash([]);
    }
    drawLine('callWall', '#22c55e', [4, 4]);
    drawLine('putWall', '#ef4444', [4, 4]);
    drawLine('gammaFlip', '#eab308', [3, 3]);
    drawLine('spot', '#fbbf24', []);

    // Legend
    var legendY = H - 12, lx = PAD.left;
    [{ l: 'Spot', c: '#fbbf24', d: false }, { l: 'Call Wall', c: '#22c55e', d: true }, { l: 'Put Wall', c: '#ef4444', d: true }, { l: 'Flip', c: '#eab308', d: true }].forEach(function(item) {
      ctx.strokeStyle = item.c; ctx.lineWidth = 2; ctx.setLineDash(item.d ? [4, 3] : []);
      ctx.beginPath(); ctx.moveTo(lx, legendY); ctx.lineTo(lx + 16, legendY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#888'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
      ctx.fillText(item.l, lx + 20, legendY + 3); lx += ctx.measureText(item.l).width + 36;
    });

    // Time labels
    ctx.fillStyle = '#666'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
    var tStep = Math.max(1, Math.floor(intervals.length / 8));
    for (var ti = 0; ti < intervals.length; ti += tStep) {
      var dt = new Date(intervals[ti].time);
      ctx.fillText(dt.getHours() + ':' + (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes(), xScale(intervals[ti].time), H - PAD.bottom + 14);
    }

    // NOW marker
    var now = Date.now();
    if (now >= minT && now <= maxT + 300000) {
      var nx = xScale(Math.min(now, maxT));
      ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(nx, PAD.top); ctx.lineTo(nx, H - PAD.bottom); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(251,191,36,0.8)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText('NOW', nx, PAD.top - 4);
    }
  }

  // ── Skew ──
  function loadSkew() {
    fetch('/api/gex/skew/' + state.ticker)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        state.skewData = d;
        state.skewVisible = d.skew.map(function(_, i) { return i < 2; });
        renderSkewChips();
        renderSkew();
      });
  }

  function renderSkewChips() {
    var el = document.getElementById('gaSkewChips');
    if (!el || !state.skewData) return;
    el.innerHTML = '';
    state.skewData.skew.forEach(function(exp, i) {
      var chip = document.createElement('button');
      chip.className = 'skew-chip' + (state.skewVisible[i] ? ' active' : '');
      chip.textContent = exp.expiration;
      chip.onclick = function() {
        state.skewVisible[i] = !state.skewVisible[i];
        chip.classList.toggle('active');
        renderSkew();
      };
      el.appendChild(chip);
    });
  }

  function renderSkew() {
    var canvas = document.getElementById('gaSkewCanvas');
    if (!canvas || !state.skewData || !state.skewData.skew.length) return;
    if (_skewChart) { _skewChart.destroy(); _skewChart = null; }

    var colors = ['#fbbf24', '#22c55e', '#f97316', '#a78bfa'];
    var spot = state.skewData.spot || 0;
    var datasets = [];

    // Collect all strike labels from visible expirations
    var allStrikeSet = {};
    state.skewData.skew.forEach(function(exp, i) {
      if (!state.skewVisible[i]) return;
      exp.strikes.forEach(function(s) { allStrikeSet[s.strike] = true; });
    });
    var allStrikes = Object.keys(allStrikeSet).map(Number).sort(function(a, b) { return a - b; });
    var labels = allStrikes.map(function(s) { return '$' + s; });

    state.skewData.skew.forEach(function(exp, i) {
      if (!state.skewVisible[i]) return;
      var color = colors[i % colors.length];
      var strikeMap = {};
      exp.strikes.forEach(function(s) { strikeMap[s.strike] = s; });

      datasets.push({
        label: exp.expiration + ' Call',
        data: allStrikes.map(function(s) { var d = strikeMap[s]; return d && d.callIV > 0 ? +(d.callIV * 100).toFixed(2) : null; }),
        borderColor: color, borderWidth: 2, pointRadius: 2, tension: 0.3, spanGaps: true,
      });
      datasets.push({
        label: exp.expiration + ' Put',
        data: allStrikes.map(function(s) { var d = strikeMap[s]; return d && d.putIV > 0 ? +(d.putIV * 100).toFixed(2) : null; }),
        borderColor: color, borderWidth: 1.5, borderDash: [4, 2], pointRadius: 2, tension: 0.3, spanGaps: true,
      });
    });

    // Spot annotation
    var spotIdx = -1;
    var minDist = Infinity;
    allStrikes.forEach(function(s, idx) {
      var d = Math.abs(s - spot);
      if (d < minDist) { minDist = d; spotIdx = idx; }
    });

    var annotations = {};
    if (spotIdx >= 0) {
      annotations.spotLine = { type: 'line', xMin: spotIdx, xMax: spotIdx, borderColor: 'rgba(251,191,36,0.5)', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'SPOT', position: 'start', font: { family: 'JetBrains Mono', size: 9 }, color: 'rgba(251,191,36,0.8)', backgroundColor: 'transparent' } };
    }

    _skewChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: 'var(--text-muted)', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 12, padding: 8 } },
          annotation: { annotations: annotations },
          tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + (ctx.parsed.y != null ? ctx.parsed.y.toFixed(1) + '%' : 'N/A'); } } },
        },
        scales: {
          x: { ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 }, callback: function(v) { return v.toFixed(0) + '%'; } }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Implied Volatility', color: '#666', font: { family: 'Inter', size: 11 } } },
        },
      },
    });

    // Summary cards
    var cards = document.getElementById('gaSkewCards');
    if (cards && state.skewData.skew.length > 0) {
      var firstExp = state.skewData.skew[0];
      var atmStrike = null, minD = Infinity;
      firstExp.strikes.forEach(function(s) { var d = Math.abs(s.strike - spot); if (d < minD) { minD = d; atmStrike = s; } });
      var atmIV = atmStrike ? (((atmStrike.callIV || 0) + (atmStrike.putIV || 0)) / 2 * 100).toFixed(1) : '--';
      var skew25d = '--';
      var pct25 = spot * 0.75, pct75 = spot * 1.25;
      var otmPut = null, otmCall = null;
      firstExp.strikes.forEach(function(s) {
        if (!otmPut || Math.abs(s.strike - pct25) < Math.abs(otmPut.strike - pct25)) otmPut = s;
        if (!otmCall || Math.abs(s.strike - pct75) < Math.abs(otmCall.strike - pct75)) otmCall = s;
      });
      if (otmPut && otmCall && otmPut.putIV > 0 && otmCall.callIV > 0) {
        skew25d = ((otmPut.putIV - otmCall.callIV) * 100).toFixed(1);
      }
      cards.innerHTML = '<div class="skew-card"><div class="skew-card-label">ATM IV</div><div class="skew-card-value">' + atmIV + '%</div></div>' +
        '<div class="skew-card"><div class="skew-card-label">25\u0394 Skew</div><div class="skew-card-value">' + skew25d + (skew25d !== '--' ? '%' : '') + '</div></div>' +
        '<div class="skew-card"><div class="skew-card-label">Expirations</div><div class="skew-card-value">' + state.skewData.skew.length + '</div></div>';
    }
  }


  // ── Term Structure ──
  function loadTermStructure() {
    fetch('/api/gex/term-structure/' + state.ticker, { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        state.termData = d;
        renderTermStructure();
      });
  }

  function renderTermStructure() {
    if (!state.termData || !state.termData.termStructure || !state.termData.termStructure.length) return;
    var ts = state.termData.termStructure;
    var ctx = document.getElementById('gaTermCanvas');
    if (!ctx) return;
    if (_termChart) { _termChart.destroy(); _termChart = null; }

    _termChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ts.map(function(t) { return t.dte + 'd'; }),
        datasets: [
          { label: 'ATM IV', data: ts.map(function(t) { return t.atmIV; }),
            borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)', fill: true,
            borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#fbbf24', tension: 0.3 },
          { label: 'Call IV', data: ts.map(function(t) { return t.callIV; }),
            borderColor: 'rgba(34,197,94,0.6)', borderWidth: 1.5, pointRadius: 3,
            borderDash: [4, 2], tension: 0.3 },
          { label: 'Put IV', data: ts.map(function(t) { return t.putIV; }),
            borderColor: 'rgba(239,68,68,0.6)', borderWidth: 1.5, pointRadius: 3,
            borderDash: [4, 2], tension: 0.3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: 'var(--text-muted)', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 12, padding: 8 } },
          tooltip: { callbacks: { label: function(c) { return c.dataset.label + ': ' + (c.parsed.y != null ? c.parsed.y.toFixed(1) + '%' : 'N/A'); } } },
        },
        scales: {
          x: { ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Days to Expiration', color: '#666', font: { family: 'Inter', size: 11 } } },
          y: { ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 }, callback: function(v) { return v.toFixed(0) + '%'; } }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Implied Volatility', color: '#666', font: { family: 'Inter', size: 11 } } },
        },
      },
    });

    var cards = document.getElementById('gaTermCards');
    if (cards) {
      var front = ts[0], back = ts[ts.length - 1];
      var shape = front.atmIV < back.atmIV ? 'Contango' : 'Backwardation';
      var shapeColor = shape === 'Contango' ? 'var(--green)' : 'var(--red)';
      cards.innerHTML = '<div class="term-card"><div class="term-card-label">Front IV (' + front.dte + 'd)</div><div class="term-card-value">' + front.atmIV.toFixed(1) + '%</div></div>' +
        '<div class="term-card"><div class="term-card-label">Back IV (' + back.dte + 'd)</div><div class="term-card-value">' + back.atmIV.toFixed(1) + '%</div></div>' +
        '<div class="term-card"><div class="term-card-label">Shape</div><div class="term-card-value" style="color:' + shapeColor + '">' + shape + '</div></div>';
    }
  }

  // ── OI & Volume ──
  function loadOIVolume() {
    fetch('/api/gex/oi-volume/' + state.ticker, { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        state.oiData = d;
        renderOIChart();
        renderVolumeChart();
      });
  }

  function renderOIChart() {
    if (!state.oiData || !state.oiData.strikes || !state.oiData.strikes.length) return;
    var canvas = document.getElementById('gaOICanvas');
    if (!canvas) return;
    if (_oiChart) { _oiChart.destroy(); _oiChart = null; }

    var strikes = state.oiData.strikes;
    var labels = strikes.map(function(s) { return '$' + s.strike; });

    var annotations = {};
    if (state.oiData.maxPain) {
      var mpIdx = -1;
      strikes.forEach(function(s, i) { if (s.strike === state.oiData.maxPain) mpIdx = i; });
      if (mpIdx >= 0) {
        annotations.maxPain = { type: 'line', xMin: mpIdx, xMax: mpIdx, borderColor: 'rgba(250,204,21,0.7)', borderWidth: 2, borderDash: [4, 3], label: { display: true, content: 'Max Pain $' + state.oiData.maxPain, position: 'start', font: { family: 'JetBrains Mono', size: 9 }, color: 'rgba(250,204,21,0.9)', backgroundColor: 'transparent' } };
      }
    }

    _oiChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Call OI', data: strikes.map(function(s) { return s.callOI; }),
            backgroundColor: 'rgba(34,197,94,0.6)', borderColor: 'rgba(34,197,94,0.8)', borderWidth: 1 },
          { label: 'Put OI', data: strikes.map(function(s) { return -s.putOI; }),
            backgroundColor: 'rgba(239,68,68,0.6)', borderColor: 'rgba(239,68,68,0.8)', borderWidth: 1 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: 'var(--text-muted)', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 12, padding: 8 } },
          annotation: { annotations: annotations },
          title: { display: true, text: 'Open Interest by Strike', color: '#666', font: { family: 'Inter', size: 12 } },
          tooltip: { callbacks: { label: function(c) { return c.dataset.label + ': ' + Math.abs(c.parsed.y).toLocaleString(); } } },
        },
        scales: {
          x: { stacked: true, ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 15, maxRotation: 45 }, grid: { display: false } },
          y: { stacked: true, ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 }, callback: function(v) { var a = Math.abs(v); return a >= 1000 ? (a / 1000).toFixed(0) + 'K' : a; } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });

    // Summary cards
    var cards = document.getElementById('gaOICards');
    if (cards) {
      var d = state.oiData;
      var fmtK = function(v) { return v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v; };
      cards.innerHTML = '<div class="oi-card"><div class="oi-card-label">Total Call OI</div><div class="oi-card-value" style="color:var(--green)">' + fmtK(d.totalCallOI) + '</div></div>' +
        '<div class="oi-card"><div class="oi-card-label">Total Put OI</div><div class="oi-card-value" style="color:var(--red)">' + fmtK(d.totalPutOI) + '</div></div>' +
        '<div class="oi-card"><div class="oi-card-label">P/C Ratio</div><div class="oi-card-value">' + (d.pcRatio != null ? d.pcRatio.toFixed(3) : '--') + '</div></div>' +
        '<div class="oi-card"><div class="oi-card-label">Max Pain</div><div class="oi-card-value">' + (d.maxPain ? '$' + d.maxPain : '--') + '</div></div>';
    }
  }

  function renderVolumeChart() {
    if (!state.oiData || !state.oiData.strikes || !state.oiData.strikes.length) return;
    var canvas = document.getElementById('gaVolCanvas');
    if (!canvas) return;
    if (_volChart) { _volChart.destroy(); _volChart = null; }

    var strikes = state.oiData.strikes;
    var labels = strikes.map(function(s) { return '$' + s.strike; });

    _volChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Call Volume', data: strikes.map(function(s) { return s.callVol; }),
            backgroundColor: 'rgba(34,197,94,0.5)', borderColor: 'rgba(34,197,94,0.7)', borderWidth: 1 },
          { label: 'Put Volume', data: strikes.map(function(s) { return -s.putVol; }),
            backgroundColor: 'rgba(239,68,68,0.5)', borderColor: 'rgba(239,68,68,0.7)', borderWidth: 1 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: 'var(--text-muted)', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 12, padding: 8 } },
          title: { display: true, text: 'Volume by Strike', color: '#666', font: { family: 'Inter', size: 12 } },
          tooltip: { callbacks: { label: function(c) { return c.dataset.label + ': ' + Math.abs(c.parsed.y).toLocaleString(); } } },
        },
        scales: {
          x: { stacked: true, ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 15, maxRotation: 45 }, grid: { display: false } },
          y: { stacked: true, ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 }, callback: function(v) { var a = Math.abs(v); return a >= 1000 ? (a / 1000).toFixed(0) + 'K' : a; } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });
  }

  // ── 3D Surface ──
  function renderSurface() {
    var canvas = document.getElementById('gaSurfaceCanvas');
    if (!canvas || !state.data) return;
    var wrap = canvas.parentElement;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = wrap.clientWidth, H = wrap.clientHeight;
    ctx.clearRect(0, 0, W, H);

    var exps = state.data.expirations || [];
    var rawGrid = state.data.grid || [];
    if (!exps.length || !rawGrid.length) {
      ctx.fillStyle = '#666'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
      ctx.fillText('No expiration data', W / 2, H / 2);
      return;
    }

    var strikes = rawGrid.map(function(g) { return g.strike; });
    var grid = [];
    var maxAbsGEX = 0;
    exps.forEach(function(e, ei) {
      var row = [];
      rawGrid.forEach(function(g) {
        var v = (g.values && g.values[ei]) ? (g.values[ei].net || 0) : 0;
        row.push(v);
        maxAbsGEX = Math.max(maxAbsGEX, Math.abs(v));
      });
      grid.push(row);
    });
    if (maxAbsGEX === 0) maxAbsGEX = 1;

    var angle = state.surfaceAngle || 0.6;
    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    var scaleX = (W - 120) / (strikes.length + exps.length);
    var scaleZ = scaleX * 0.6;
    var scaleY = H * 0.25;
    var cx = W / 2, cy = H * 0.65;

    function project(xi, zi, yi) {
      var px = (xi - strikes.length / 2) * scaleX * cosA - (zi - exps.length / 2) * scaleZ * sinA;
      var py = -(yi * scaleY) - (xi - strikes.length / 2) * scaleX * sinA * 0.3 - (zi - exps.length / 2) * scaleZ * cosA * 0.3;
      return { x: cx + px, y: cy + py };
    }

    var expOrder = sinA >= 0 ? Array.from({length: exps.length}, function(_, i) { return i; }) : Array.from({length: exps.length}, function(_, i) { return exps.length - 1 - i; });
    var strikeOrder = cosA >= 0 ? Array.from({length: strikes.length}, function(_, i) { return i; }) : Array.from({length: strikes.length}, function(_, i) { return strikes.length - 1 - i; });

    expOrder.forEach(function(zi) {
      strikeOrder.forEach(function(xi) {
        var v = grid[zi][xi];
        var h = v / maxAbsGEX;
        var p0 = project(xi, zi, 0);
        var p1 = project(xi, zi, h);
        var p2 = project(xi + 1, zi, h);
        var p3 = project(xi + 1, zi, 0);

        var alpha = Math.min(0.8, Math.abs(h) * 0.8 + 0.1);
        ctx.fillStyle = v >= 0 ? 'rgba(34,197,94,' + alpha + ')' : 'rgba(239,68,68,' + alpha + ')';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath(); ctx.fill();

        var p4 = project(xi, zi + 1, h);
        var p5 = project(xi + 1, zi + 1, h);
        ctx.fillStyle = v >= 0 ? 'rgba(34,197,94,' + (alpha * 0.7) + ')' : 'rgba(239,68,68,' + (alpha * 0.7) + ')';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p5.x, p5.y); ctx.lineTo(p4.x, p4.y);
        ctx.closePath(); ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath(); ctx.stroke();
      });
    });

    // Spot price plane
    var spotPrice = state.data.spotPrice || state.data.spot;
    if (spotPrice) {
      var closestIdx = 0, closestDist = Infinity;
      strikes.forEach(function(s, i) {
        var d = Math.abs(s - spotPrice);
        if (d < closestDist) { closestDist = d; closestIdx = i; }
      });
      ctx.fillStyle = 'rgba(251,191,36,0.12)';
      ctx.strokeStyle = 'rgba(251,191,36,0.4)'; ctx.lineWidth = 1;
      var pBot0 = project(closestIdx, 0, 0);
      var pBot1 = project(closestIdx, exps.length, 0);
      var pTop0 = project(closestIdx, 0, 0.5);
      var pTop1 = project(closestIdx, exps.length, 0.5);
      ctx.beginPath();
      ctx.moveTo(pBot0.x, pBot0.y); ctx.lineTo(pTop0.x, pTop0.y);
      ctx.lineTo(pTop1.x, pTop1.y); ctx.lineTo(pBot1.x, pBot1.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(251,191,36,0.8)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText('Spot $' + spotPrice.toFixed(0), pTop0.x, pTop0.y - 6);
    }

    // Labels
    ctx.fillStyle = '#666'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
    var sStep = Math.max(1, Math.floor(strikes.length / 6));
    for (var si = 0; si < strikes.length; si += sStep) {
      var sp = project(si, -0.5, 0);
      ctx.fillText('$' + strikes[si], sp.x, sp.y + 12);
    }
    exps.forEach(function(e, i) {
      var ep = project(-1, i + 0.5, 0);
      var expLabel = (e.date || e.expiration || e.expiry || '').slice(5);
      ctx.fillStyle = '#666'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
      ctx.fillText(expLabel, ep.x - 4, ep.y);
    });
    ctx.fillStyle = '#888'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('Strike \\u2192', W - 80, H - 15);
    ctx.fillText('\\u2190 Expiry', 10, H - 15);
  }

  function bindSurfaceDrag() {
    if (state.surfaceDragBound) return;
    var canvas = document.getElementById('gaSurfaceCanvas');
    if (!canvas) return;
    state.surfaceDragBound = true;
    var dragging = false, lastX = 0;
    canvas.addEventListener('mousedown', function(e) { dragging = true; lastX = e.clientX; });
    state._surfaceMove = function(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      state.surfaceAngle = (state.surfaceAngle || 0.6) + dx * 0.005;
      lastX = e.clientX;
      renderSurface();
    };
    state._surfaceUp = function() { dragging = false; };
    window.addEventListener('mousemove', state._surfaceMove);
    window.addEventListener('mouseup', state._surfaceUp);
  }


  // ── Analysis ──
  function drawIntensityGauge(pct) {
    var canvas = document.getElementById('gaIntensityGauge');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H - 5, r = Math.min(W, H) - 10;
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0, false);
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.stroke();
    var angle = Math.PI + (pct / 100) * Math.PI;
    var grad = ctx.createLinearGradient(0, cy, W, cy);
    grad.addColorStop(0, '#22c55e'); grad.addColorStop(0.5, '#eab308'); grad.addColorStop(1, '#ef4444');
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, angle, false);
    ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = grad; ctx.stroke();
    var nx = cx + r * Math.cos(angle), ny = cy + r * Math.sin(angle);
    ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }

  function renderAnalysis() {
    var el = document.getElementById('gaAnalysisContent');
    if (!el) return;
    var d = state.data, t = state.targetData, sq = state.squeezeData;
    var html = '';
    if (t && t.regime) {
      var rc = t.regime.label === 'Long Gamma' ? 'var(--green)' : t.regime.label === 'Short Gamma' ? 'var(--red)' : 'var(--yellow)';
      html += '<div class="overview-regime"><span class="regime-dot" style="background:' + rc + '"></span><span class="regime-label" style="color:' + rc + '">' + t.regime.label + '</span><span class="regime-conf">' + Math.round(t.regime.confidence * 100) + '%</span></div>';
    }
    if (d) {
      var cs = d.callWall ? '$' + d.callWall.strike : '\\u2014';
      var ps = d.putWall ? '$' + d.putWall.strike : '\\u2014';
      var fl = d.gammaFlip ? '$' + (typeof d.gammaFlip === 'number' ? d.gammaFlip.toFixed(1) : d.gammaFlip) : '\\u2014';
      var mp = d.maxPain ? '$' + d.maxPain.strike : '\\u2014';
      var ng = d.totalNetGEX || 0;
      var nc = ng >= 0 ? 'var(--green)' : 'var(--red)';
      html += '<div class="overview-cards" style="grid-template-columns:repeat(6,1fr);margin-bottom:20px">'
        + _analysisCard('Net GEX', fmtGEXShort(ng), nc, ng >= 0 ? 'Long gamma' : 'Short gamma')
        + _analysisCard('Call Wall', cs, 'var(--green)', '')
        + _analysisCard('Put Wall', ps, 'var(--red)', '')
        + _analysisCard('Gamma Flip', fl, 'var(--yellow)', '')
        + _analysisCard('Max Pain', mp, '#6b7280', '')
        + (function() {
          var intensity = state.data && state.data.intensity;
          var iPct = intensity ? intensity.percentile : 0;
          var iColor = iPct >= 70 ? 'var(--red)' : iPct >= 30 ? 'var(--yellow)' : 'var(--green)';
          var iLabel = iPct >= 70 ? 'Elevated' : iPct >= 30 ? 'Normal' : 'Suppressed';
          return '<div class="overview-card"><div class="card-label">GEX Intensity</div>'
            + '<div class="intensity-gauge"><canvas id="gaIntensityGauge" width="120" height="70"></canvas>'
            + '<div class="intensity-pct" style="color:' + iColor + '">' + iPct + '<span style="font-size:14px">%</span></div>'
            + '<div class="intensity-label">' + iLabel + '</div>'
            + (intensity ? '<div class="intensity-range">30d range</div>' : '')
            + '</div></div>';
        })()
        + '</div>';
    }
    if (sq && sq.score != null) {
      var sqc = sq.score > 60 ? 'var(--green)' : sq.score > 35 ? 'var(--yellow)' : 'var(--text-muted)';
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Squeeze Score</span><span style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:' + sqc + '">' + sq.score + '/100 \\u2014 ' + (sq.label || '') + '</span></div></div>';
    }
    if (d && d.imbalance) {
      var imb = d.imbalance;
      var imbColor = imb.imbalanceType === 'CALL_HEAVY' || imb.imbalanceType === 'BULLISH_TILT' ? 'var(--green)' : imb.imbalanceType === 'PUT_HEAVY' || imb.imbalanceType === 'BEARISH_TILT' ? 'var(--red)' : 'var(--text-muted)';
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Imbalance Classification</span><span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:' + imbColor + '">' + (imb.setupLabel || imb.imbalanceType || 'N/A') + ' &mdash; ' + imb.confidence + '%</span></div>';
      html += '<div style="padding:8px 12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      html += '<div style="font-family:var(--font-mono);font-size:11px"><span style="color:var(--text-muted)">Above GEX:</span> <span style="color:var(--green)">' + fmtGEXShort(imb.aboveGEX) + '</span></div>';
      html += '<div style="font-family:var(--font-mono);font-size:11px"><span style="color:var(--text-muted)">Below GEX:</span> <span style="color:var(--red)">' + fmtGEXShort(imb.belowGEX) + '</span></div>';
      html += '</div>';
      if (imb.reasons && imb.reasons.length > 0) {
        html += '<div style="padding:4px 12px 10px;font-size:11px;color:var(--text-muted);line-height:1.5">';
        imb.reasons.forEach(function(r) { html += '<div>&bull; ' + r + '</div>'; });
        html += '</div>';
      }
      if (imb.levels) {
        var lv = imb.levels;
        html += '<div style="padding:4px 12px 10px;display:flex;flex-wrap:wrap;gap:6px">';
        if (lv.magnetLevel) html += '<span style="display:inline-block;padding:3px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;background:var(--accent-subtle);color:var(--accent);border:1px solid var(--border)">Magnet $' + lv.magnetLevel + '</span>';
        if (lv.supportLevels) lv.supportLevels.forEach(function(s) { html += '<span style="display:inline-block;padding:3px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;background:var(--accent-subtle);color:var(--green);border:1px solid rgba(78,201,160,0.2)">Support $' + s + '</span>'; });
        if (lv.resistanceLevels) lv.resistanceLevels.forEach(function(r) { html += '<span style="display:inline-block;padding:3px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(192,88,98,0.2)">Resistance $' + r + '</span>'; });
        html += '</div>';
      }
      html += '</div>';
    }
    if (d && d.hedgePressure) {
      var hp = d.hedgePressure;
      var pr = hp.pressure || {};
      var prColor = pr.label === 'HIGH' ? 'var(--red)' : pr.label === 'BUILDING' ? 'var(--yellow)' : 'var(--green)';
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Hedge Pressure</span><span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:' + prColor + '">' + (pr.score || 0) + '/100 &mdash; ' + (pr.label || 'N/A') + '</span></div>';
      html += '<div style="padding:8px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-family:var(--font-mono);font-size:11px">';
      if (hp.flipRisk != null) html += '<div><span style="color:var(--text-muted)">Flip Risk:</span> <span style="color:' + (hp.flipRisk >= 60 ? 'var(--red)' : 'var(--text)') + '">' + hp.flipRisk + '</span></div>';
      if (hp.hedgeSensitivity != null) html += '<div><span style="color:var(--text-muted)">Sensitivity:</span> <span style="color:var(--text)">' + hp.hedgeSensitivity.toFixed(1) + '</span></div>';
      if (hp.rebalanceUrgency) html += '<div><span style="color:var(--text-muted)">Urgency:</span> <span style="color:' + (hp.rebalanceUrgency === 'HIGH' ? 'var(--red)' : hp.rebalanceUrgency === 'MODERATE' ? 'var(--yellow)' : 'var(--text)') + '">' + hp.rebalanceUrgency + '</span></div>';
      html += '</div></div>';
    }
    if (t && t.expectedMove) {
      var em = t.expectedMove;
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Expected Move</span><span style="font-family:var(--font-mono);font-size:12px;color:var(--text)">' + (em.rangePct ? '\\u00b1' + em.rangePct.toFixed(1) + '%' : '') + '</span></div>';
      if (em.lower && em.upper) { html += '<div style="padding:8px 10px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">$' + em.lower.toFixed(2) + ' \\u2014 $' + em.upper.toFixed(2) + '</div>'; }
      html += '</div>';
    }
    if (t && t.tradeSuggestions && t.tradeSuggestions.length > 0) {
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Trade Suggestions</span></div>';
      t.tradeSuggestions.forEach(function(sig) {
        var sc = sig.type === 'call' || sig.action === 'BUY_CALL' ? 'var(--green)' : 'var(--red)';
        html += '<div class="tgt-signal" style="border-color:' + sc + '"><div class="tgt-signal-conf" style="color:' + sc + '">' + (sig.confidence || sig.grade || '') + '</div><div class="tgt-signal-title" style="color:' + sc + '">$' + sig.strike + ' ' + (sig.type || sig.action || '') + (sig.expiry ? ' (' + sig.expiry + ')' : '') + '</div><div class="tgt-signal-detail">' + (sig.reasoning || '') + '</div></div>';
      });
      html += '</div>';
    }
    if (t && t.aiCommentary && t.aiCommentary.summary) {
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>AI Commentary</span></div><div style="padding:12px;font-family:var(--font-body);font-size:12px;color:var(--text);line-height:1.6">' + t.aiCommentary.summary + '</div></div>';
    }
    if (t && t.bullishTargets && t.bullishTargets.length > 0) html += _targetList('Bullish Targets', t.bullishTargets, 'var(--green)');
    if (t && t.bearishTargets && t.bearishTargets.length > 0) html += _targetList('Bearish Targets', t.bearishTargets, 'var(--red)');
    if (!html) html = '<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:12px">Loading analysis...</div>';
    el.innerHTML = html;
    drawIntensityGauge(state.data && state.data.intensity ? state.data.intensity.percentile : 0);
    var regEl = document.getElementById('gaAnalysisRegime');
    if (regEl && t && t.regime) {
      regEl.style.color = t.regime.label === 'Long Gamma' ? 'var(--green)' : t.regime.label === 'Short Gamma' ? 'var(--red)' : 'var(--yellow)';
      regEl.textContent = t.regime.label;
    }
  }

  function _analysisCard(label, value, color, sub) {
    return '<div class="overview-card"><div class="card-label">' + label + '</div><div class="card-value" style="color:' + color + ';font-size:18px">' + value + '</div>' + (sub ? '<div class="card-sub">' + sub + '</div>' : '') + '</div>';
  }

  function _targetList(title, targets, color) {
    var html = '<div class="tgt-section"><div class="tgt-section-hdr"><span>' + title + '</span></div>';
    targets.slice(0, 5).forEach(function(t) {
      var tags = '';
      if (t.isGEXMagnet) tags += '<span class="tgt-tag" style="background:var(--accent-subtle);color:var(--accent)">GEX</span>';
      if (t.isVannaMagnet) tags += '<span class="tgt-tag" style="background:rgba(107,114,128,0.1);color:#9ca3af">Vanna</span>';
      html += '<div class="tgt-row"><span class="tgt-strike" style="color:' + color + '">$' + t.strike + '</span><span class="tgt-dist">' + (t.distance > 0 ? '+' : '') + (typeof t.distance === 'number' ? t.distance.toFixed(1) : t.distance) + '%</span><div class="tgt-tags">' + tags + '</div><div class="tgt-bar-wrap"><div class="tgt-bar-fill" style="width:' + Math.round((t.confidence || 0) * 100) + '%;background:' + color + '"></div></div><span class="tgt-pct" style="color:' + color + '">' + Math.round((t.confidence || 0) * 100) + '%</span></div>';
    });
    return html + '</div>';
  }


  // ── Scan ──
  async function runScan() {
    var input = document.getElementById('gaScanInput');
    var el = document.getElementById('gaScanContent');
    if (!input || !el) return;
    var tickersInput = input.value.trim();
    if (!tickersInput) return;
    el.innerHTML = '<div style="text-align:center;padding:40px"><div class="spinner"></div><div style="color:var(--text-muted);font-size:12px;margin-top:12px">Scanning...</div></div>';
    try {
      var res = await fetch('/api/gex/scan?tickers=' + encodeURIComponent(tickersInput));
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      state.scanData = data;
      renderScan();
    } catch (err) {
      el.innerHTML = '<div style="color:var(--red);font-size:12px;padding:20px;text-align:center">Failed: ' + err.message + '</div>';
    }
  }

  function renderScan() {
    var el = document.getElementById('gaScanContent');
    var d = state.scanData;
    if (!el || !d || !d.rows || d.rows.length === 0) {
      if (el) el.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:40px 0;text-align:center">No scan data</div>';
      return;
    }
    var rows = d.rows;
    if (state.scanFilter !== 'ALL') {
      rows = rows.filter(function(r) { return r.imbalanceType === state.scanFilter; });
    }
    rows = rows.slice().sort(function(a, b) {
      var pa = a.pressureScore || 0, pb = b.pressureScore || 0;
      if (pb !== pa) return pb - pa;
      return (b.imbalanceConfidence || 0) - (a.imbalanceConfidence || 0);
    });

    var scanModeMap = { GAMMA_BOX: 'RANGE', BULL_IMBALANCE: 'UP', BEAR_IMBALANCE: 'DOWN', NO_CONTROL: 'VOLATILE' };
    var scanPlayMap = { GAMMA_BOX: "Fade edges", BULL_IMBALANCE: 'Buy dips', BEAR_IMBALANCE: 'Sell rips', NO_CONTROL: 'Trade break' };
    var imbColorMap = { BULL_IMBALANCE: 'var(--green)', BEAR_IMBALANCE: 'var(--red)', GAMMA_BOX: 'var(--yellow)', NO_CONTROL: '#a78bfa' };
    var pressureColorMap = { LOW: 'var(--green)', BUILDING: 'var(--yellow)', HIGH: 'var(--red)' };

    var html = '<div style="overflow-x:auto"><table class="scan-table"><thead><tr>'
      + '<th>Symbol</th><th>Mode</th><th>Do This</th><th>S/R</th>'
      + '<th>Pressure</th><th>Structure</th>'
      + '</tr></thead><tbody>';
    rows.forEach(function(r) {
      var imbColor = imbColorMap[r.imbalanceType] || 'var(--text-muted)';
      var mode = scanModeMap[r.imbalanceType] || '-';
      var play = scanPlayMap[r.imbalanceType] || '-';
      var pLabel = r.pressureLabel || 'LOW';
      var pColor = pressureColorMap[pLabel] || 'var(--text-muted)';
      var sLabel = r.structureState || 'NEUTRAL';
      var sColor = sLabel === 'FRAGILIZING' ? 'var(--red)' : sLabel === 'STABILIZING' ? 'var(--green)' : 'var(--text-muted)';
      var keyLines = '';
      if (r.callWall) keyLines += 'R $' + r.callWall;
      if (r.putWall) keyLines += (keyLines ? ' / ' : '') + 'S $' + r.putWall;
      html += '<tr>';
      html += '<td><span class="scan-ticker" data-ticker="' + r.ticker + '">' + r.ticker + '</span> <span style="color:var(--text-muted);font-size:9px">$' + (r.spotPrice || 0).toFixed(0) + '</span></td>';
      html += '<td style="color:' + imbColor + ';font-weight:700">' + mode + '</td>';
      html += '<td style="font-size:10px;white-space:nowrap">' + play + '</td>';
      html += '<td style="font-size:9px;color:var(--text-muted);white-space:nowrap">' + (keyLines || '-') + '</td>';
      html += '<td style="color:' + pColor + ';font-weight:600">' + pLabel + '</td>';
      html += '<td style="color:' + sColor + '">' + sLabel + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    if (rows.length === 0) html = '<div style="color:var(--text-muted);font-size:12px;padding:20px 0;text-align:center">No tickers match filter</div>';
    el.innerHTML = html;
  }

  // ── Targets ──
  async function loadTargets() {
    if (!state.ticker) return;
    try {
      var res = await fetch('/api/gex/targets/' + state.ticker);
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      state.targetData = data;
      updateRegimeBadge();
      if (state.tab === 'analysis') renderAnalysis();
      renderTradeDesk();
    } catch (err) {}
  }

  async function loadSqueeze() {
    if (!state.ticker) return;
    try {
      var res = await fetch('/api/gex/squeeze/' + state.ticker);
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      state.squeezeData = data;
      if (state.tab === 'analysis') renderAnalysis();
    } catch(e) {}
  }

  // ── Tab Switching ──
  function setTab(tab) {
    state.tab = tab;
    var page = document.getElementById('page-gex-analytics');
    if (!page) return;
    page.querySelectorAll('.tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
    page.querySelectorAll('.detail-panel').forEach(function(p) { p.classList.remove('active'); });
    var panelMap = { profile: 'gaProfilePanel', greeks: 'gaGreeksPanel', analysis: 'gaAnalysisPanel', scan: 'gaScanPanel', skew: 'gaSkewPanel', term: 'gaTermPanel', oi: 'gaOIPanel', timeline: 'gaTimelinePanel', surface: 'gaSurfacePanel' };
    if (panelMap[tab]) { var el = document.getElementById(panelMap[tab]); if (el) el.classList.add('active'); }
    if (tab === 'profile' && state.data) renderProfile();
    if (tab === 'greeks' && state.data) { if (state.activeGreek === 'vanna') renderVannaChart(); else renderCharmChart(); }
    if (tab === 'analysis') { if (!state.targetData && state.ticker) loadTargets(); if (!state.squeezeData && state.ticker) loadSqueeze(); renderAnalysis(); }
    if (tab === 'scan' && state.scanData) renderScan();
    if (tab === 'skew') loadSkew();
    if (tab === 'term') loadTermStructure();
    if (tab === 'oi') loadOIVolume();
    if (tab === 'timeline') loadTimeline();
    if (tab === 'surface') { bindSurfaceDrag(); renderSurface(); }
  }

  function setGreek(greek) {
    state.activeGreek = greek;
    var page = document.getElementById('page-gex-analytics');
    if (!page) return;
    page.querySelectorAll('.greeks-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.greek === greek); });
    document.getElementById('gaVannaCanvas').style.display = greek === 'vanna' ? '' : 'none';
    document.getElementById('gaCharmCanvas').style.display = greek === 'charm' ? '' : 'none';
    if (greek === 'vanna') renderVannaChart(); else renderCharmChart();
  }

  // ── Range ──
  function updateRange(val) {
    state.range = parseInt(val);
    var el = document.getElementById('gaRangeVal');
    if (el) el.textContent = '\\u00b1' + val;
  }

  // ── UI Helpers ──
  function updateSpotBadge() {
    if (!state.data) return;
    var badge = document.getElementById('gaSpotBadge');
    if (badge) {
      badge.textContent = state.data.ticker + ' $' + state.data.spotPrice.toFixed(2);
      badge.classList.remove('flash'); void badge.offsetWidth; badge.classList.add('flash');
    }
    var kl = document.getElementById('gaKeyLevels');
    if (kl) {
      var html = '';
      if (state.data.callWall) html += '<span class="kl-badge kl-call">Call Wall $' + state.data.callWall.strike + '</span>';
      if (state.data.putWall) html += '<span class="kl-badge kl-put">Put Wall $' + state.data.putWall.strike + '</span>';
      if (state.data.gammaFlip) html += '<span class="kl-badge kl-flip">Flip $' + state.data.gammaFlip + '</span>';
      kl.innerHTML = html;
    }
  }

  function updateRegimeBadge() {
    var el = document.getElementById('gaRegimeBadge');
    if (!el) return;
    var t = state.targetData;
    if (!t || !t.regime) { el.innerHTML = ''; el.style.background = ''; return; }
    var color = t.regime.label === 'Long Gamma' ? 'var(--green)' : t.regime.label === 'Short Gamma' ? 'var(--red)' : 'var(--yellow)';
    el.style.background = t.regime.label === 'Long Gamma' ? 'var(--accent-subtle)' : t.regime.label === 'Short Gamma' ? 'rgba(239,68,68,0.12)' : 'var(--warn-dim)';
    el.style.color = color;
    el.textContent = t.regime.label + ' ' + Math.round(t.regime.confidence * 100) + '%';
  }

  function updateFooter() {
    if (!state.data) return;
    var src = state.data.source || 'Yahoo';
    var fl = document.getElementById('gaFooterLeft');
    var fr = document.getElementById('gaFooterRight');
    if (fl) fl.textContent = 'GEX = OI \\u00d7 Gamma \\u00d7 100 | Data: ' + src + (src === 'Tradier' ? ' (ORATS real greeks)' : src === 'Public.com' ? ' (real greeks)' : src.includes('LIVE') ? ' (OPRA live)' : ' (Black-Scholes est.)');
    if (fr) fr.textContent = 'Updated: ' + new Date(state.data.timestamp).toLocaleTimeString() + ' | ' + state.data.expirations.length + ' expirations | ' + state.data.strikes.length + ' strikes';
  }

  function showLoading(msg) {
    var el = document.getElementById('gaLoadingIndicator');
    if (!el) return;
    el.innerHTML = '<div class="spinner"></div><div style="color:var(--text-muted);font-size:12px;font-family:var(--font-body)">' + (msg || 'Loading...') + '</div>';
    el.style.display = 'flex';
  }

  function hideLoading() {
    var el = document.getElementById('gaLoadingIndicator');
    if (el) el.style.display = 'none';
  }

  function showError(msg) {
    var el = document.getElementById('gaLoadingIndicator');
    if (!el) return;
    el.innerHTML = '<div class="error-msg">' + msg + '</div>';
    el.style.display = 'flex';
  }


  // ── Trade Desk ──
  var _tradeDeskCollapsed = false;
  var _tradeDeskAltsOpen = false;
  var _tradeDeskBuilderOpen = false;
  var _tradeDeskBuilderIdx = 0;
  var _tradeDeskParams = [];

  // Black-Scholes helpers
  function _normalCDF(x) {
    var a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
    var sign = x < 0 ? -1 : 1; x = Math.abs(x) / Math.SQRT2;
    var t = 1 / (1 + p * x);
    var y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return 0.5 * (1 + sign * y);
  }
  function _bsD1(S, K, T, r, sigma) { if (T <= 0) T = 1/365; return (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T)); }
  function _bsPrice(S, K, T, r, sigma, isCall) {
    if (T <= 0) T = 1/365; var d1 = _bsD1(S, K, T, r, sigma); var d2 = d1 - sigma * Math.sqrt(T);
    if (isCall) return S * _normalCDF(d1) - K * Math.exp(-r*T) * _normalCDF(d2);
    return K * Math.exp(-r*T) * _normalCDF(-d2) - S * _normalCDF(-d1);
  }
  function _bsDelta(S, K, T, r, sigma, isCall) { if (T <= 0) T = 1/365; var d1 = _bsD1(S, K, T, r, sigma); return isCall ? _normalCDF(d1) : _normalCDF(d1) - 1; }
  function _bsGammaFn(S, K, T, r, sigma) { if (T <= 0) T = 1/365; var d1 = _bsD1(S, K, T, r, sigma); return Math.exp(-d1*d1/2) / (Math.sqrt(2*Math.PI) * S * sigma * Math.sqrt(T)); }
  function _bsTheta(S, K, T, r, sigma, isCall) {
    if (T <= 0) T = 1/365; var d1 = _bsD1(S, K, T, r, sigma); var d2 = d1 - sigma * Math.sqrt(T);
    var pdf = Math.exp(-d1*d1/2) / Math.sqrt(2*Math.PI);
    var common = -(S * pdf * sigma) / (2 * Math.sqrt(T));
    if (isCall) return (common - r * K * Math.exp(-r*T) * _normalCDF(d2)) / 365;
    return (common + r * K * Math.exp(-r*T) * _normalCDF(-d2)) / 365;
  }
  function _bsVega(S, K, T, r, sigma) { if (T <= 0) T = 1/365; var d1 = _bsD1(S, K, T, r, sigma); return S * Math.sqrt(T) * Math.exp(-d1*d1/2) / Math.sqrt(2*Math.PI) / 100; }

  function computeTradeParams(suggestion, data) {
    if (!suggestion || !data) return null;
    var spot = data.spotPrice || 0; if (spot <= 0) return null;
    var strike = suggestion.strike, type = suggestion.type, isCall = type === 'CALL';
    var expiry = suggestion.expiry, dte = 1;
    if (expiry) { var exp = new Date(expiry + 'T16:00:00'); dte = Math.max(1, Math.ceil((exp - new Date()) / 86400000)); }
    var T = dte / 365;
    var ivPct = 0.20;
    if (state.targetData && state.targetData.expectedMove && state.targetData.expectedMove.avgIV) ivPct = state.targetData.expectedMove.avgIV / 100;
    var r = 0.045;
    var entry = _bsPrice(spot, strike, T, r, ivPct, isCall);
    if (!entry || entry <= 0.01) return null;
    entry = Math.round(entry * 100) / 100;
    var delta = Math.abs(_bsDelta(spot, strike, T, r, ivPct, isCall));
    var gamma = _bsGammaFn(spot, strike, T, r, ivPct);
    var theta = _bsTheta(spot, strike, T, r, ivPct, isCall);
    var vega = _bsVega(spot, strike, T, r, ivPct);
    var stopPremium = Math.round(entry * 0.6 * 100) / 100;
    var targetUnderlying = null, targetPremium = null;
    if (isCall) { if (data.callWall && data.callWall.strike > spot) targetUnderlying = data.callWall.strike; }
    else { if (data.putWall && data.putWall.strike < spot) targetUnderlying = data.putWall.strike; }
    if (targetUnderlying !== null) { targetPremium = _bsPrice(targetUnderlying, strike, Math.max(T - 1/365, 1/365), r, ivPct, isCall); targetPremium = Math.round(targetPremium * 100) / 100; }
    var rr = null;
    if (targetPremium && targetPremium > entry) { var reward = targetPremium - entry; var risk = entry - stopPremium; rr = risk > 0 ? Math.round((reward / risk) * 10) / 10 : null; }
    return { strike: strike, type: type, direction: suggestion.direction, expiry: expiry, dte: dte, entry: entry,
      stopPremium: stopPremium, targetPremium: targetPremium, targetUnderlying: targetUnderlying,
      rr: rr, delta: delta, gamma: gamma, theta: theta, iv: ivPct, vega: vega,
      confidence: suggestion.confidence || 0, grade: suggestion.grade || '', reasoning: suggestion.reasoning || '' };
  }

  function renderHeroPick(params) {
    var el = document.getElementById('gaTradeDeskHero');
    if (!el || !params) { if (el) el.innerHTML = ''; return; }
    var isCall = params.type === 'CALL';
    el.className = 'hero-pick ' + (isCall ? 'call-pick' : 'put-pick');
    var gradeClass = 'grade-c';
    if (params.grade && params.grade.startsWith('A')) gradeClass = 'grade-a';
    else if (params.grade === 'B') gradeClass = 'grade-b';
    var fp = function(v) { return v != null ? '$' + v.toFixed(2) : 'N/A'; };
    var rrLabel = params.rr != null ? params.rr.toFixed(1) + ':1' : 'N/A';
    el.innerHTML =
      '<div class="hero-direction ' + (isCall ? 'call' : 'put') + '">BUY ' + (state.ticker || 'SPY') + ' $' + params.strike + ' ' + params.type + '</div>' +
      '<div class="hero-expiry">' + (params.expiry || 'N/A') + ' ' + (params.dte ? '(' + params.dte + 'DTE)' : '') + '</div>' +
      '<div class="hero-metrics">' +
        '<div class="hero-metric"><div class="hero-metric-label">Entry</div><div class="hero-metric-value">' + fp(params.entry) + '</div></div>' +
        '<div class="hero-metric"><div class="hero-metric-label">Stop</div><div class="hero-metric-value">' + fp(params.stopPremium) + '</div></div>' +
        '<div class="hero-metric"><div class="hero-metric-label">Target</div><div class="hero-metric-value">' + fp(params.targetPremium) + '</div></div>' +
        '<div class="hero-metric"><div class="hero-metric-label">R:R</div><div class="hero-metric-value">' + rrLabel + '</div></div>' +
      '</div>' +
      '<div class="hero-confidence">' +
        (params.grade ? '<span class="hero-conf-badge ' + gradeClass + '">' + params.grade + '</span>' : '') +
        '<span class="hero-conf-pct">' + params.confidence + '% confidence</span>' +
      '</div>' +
      (params.reasoning ? '<div class="hero-reasoning">"' + params.reasoning + '"</div>' : '') +
      '<div class="hero-actions">' +
        '<button class="hero-btn hero-btn-customize" id="gaCustomizeBtn">Customize</button>' +
        '<button class="hero-btn hero-btn-alts" id="gaAltsBtn">Show Alternatives</button>' +
      '</div>';
  }

  function renderAlternatives(allParams) {
    var el = document.getElementById('gaTradeDeskAlts');
    if (!el) return;
    var alts = allParams.slice(1, 4);
    if (alts.length === 0) { el.innerHTML = ''; return; }
    var html = '';
    alts.forEach(function(p, idx) {
      var isCall = p.type === 'CALL';
      var fp = function(v) { return v != null ? '$' + v.toFixed(2) : 'N/A'; };
      html +=
        '<div class="alt-pick" data-alt-idx="' + (idx + 1) + '">' +
          '<div class="alt-direction ' + (isCall ? 'call' : 'put') + '">' + (state.ticker || 'SPY') + ' $' + p.strike + ' ' + p.type + '</div>' +
          '<div class="alt-meta"><span>Entry ' + fp(p.entry) + '</span><span>R:R ' + (p.rr != null ? p.rr.toFixed(1) + ':1' : 'N/A') + '</span><span>' + p.confidence + '%</span>' + (p.grade ? '<span>' + p.grade + '</span>' : '') + '</div>' +
          '<div class="alt-actions"><button class="alt-swap-btn" data-alt-idx="' + (idx + 1) + '">Use This</button></div>' +
        '</div>';
    });
    el.innerHTML = html;
  }

  function renderTradeBuilder(params) {
    var el = document.getElementById('gaTradeDeskBuilder');
    if (!el || !params) return;
    var isCall = params.type === 'CALL';
    var spot = (state.data && state.data.spotPrice) || 0;
    var strikePills = '', strikeRange = [];
    if (state.data && state.data.profile) state.data.profile.forEach(function(p) { strikeRange.push(p.strike); });
    if (strikeRange.length === 0 && state.data && state.data.strikes) strikeRange = state.data.strikes.slice();
    var centerIdx = strikeRange.indexOf(params.strike);
    if (centerIdx === -1) centerIdx = Math.floor(strikeRange.length / 2);
    var nearStrikes = strikeRange.slice(Math.max(0, centerIdx - 10), centerIdx + 11);
    nearStrikes.forEach(function(s) {
      var cls = s === params.strike ? (isCall ? ' active-call' : ' active-put') : '';
      strikePills += '<button class="builder-pill' + cls + '" data-builder-strike="' + s + '">$' + s + '</button>';
    });
    var accountSize = 10000, riskPct = 2;
    try { var saved = localStorage.getItem('sq_account_size'); if (saved) accountSize = parseFloat(saved) || 10000; var savedRisk = localStorage.getItem('sq_risk_pct'); if (savedRisk) riskPct = parseFloat(savedRisk) || 2; } catch(e) {}
    var maxLoss = accountSize * (riskPct / 100);
    var contractCount = params.entry > 0 ? Math.max(1, Math.floor(maxLoss / (params.entry * 100))) : 1;
    var totalCost = params.entry * 100 * contractCount;
    var pnlTarget = params.targetPremium ? ((params.targetPremium - params.entry) * 100 * contractCount) : null;
    var pnlStop = params.stopPremium ? ((params.stopPremium - params.entry) * 100 * contractCount) : null;
    var pnlExpiry = null;
    if (spot > 0 && params.strike > 0) { var intrinsic = isCall ? Math.max(0, spot - params.strike) : Math.max(0, params.strike - spot); pnlExpiry = (intrinsic - params.entry) * 100 * contractCount; }
    var fmtPnl = function(v) { if (v == null) return '<span class="pnl-neutral">N/A</span>'; var sign = v >= 0 ? '+' : ''; var cls = v >= 0 ? 'pnl-pos' : 'pnl-neg'; return '<span class="' + cls + '">' + sign + '$' + v.toFixed(0) + '</span>'; };
    el.innerHTML =
      '<div class="builder-section"><div class="builder-label">Direction</div><div class="builder-pills"><button class="builder-pill' + (isCall ? ' active-call' : '') + '" data-builder-dir="CALL">CALL</button><button class="builder-pill' + (!isCall ? ' active-put' : '') + '" data-builder-dir="PUT">PUT</button></div></div>' +
      '<div class="builder-section"><div class="builder-label">Strike</div><div class="builder-strikes builder-pills">' + strikePills + '</div></div>' +
      '<div class="builder-section"><div class="builder-label">Greeks</div><div class="builder-greeks">' +
        '<div class="builder-greek"><div class="builder-greek-label">Delta</div><div class="builder-greek-val">' + (params.delta ? params.delta.toFixed(3) : 'N/A') + '</div></div>' +
        '<div class="builder-greek"><div class="builder-greek-label">Gamma</div><div class="builder-greek-val">' + (params.gamma ? params.gamma.toFixed(4) : 'N/A') + '</div></div>' +
        '<div class="builder-greek"><div class="builder-greek-label">Theta</div><div class="builder-greek-val">' + (params.theta ? params.theta.toFixed(3) : 'N/A') + '</div></div>' +
        '<div class="builder-greek"><div class="builder-greek-label">IV</div><div class="builder-greek-val">' + (params.iv ? (params.iv * 100).toFixed(1) + '%' : 'N/A') + '</div></div>' +
        '<div class="builder-greek"><div class="builder-greek-label">Vega</div><div class="builder-greek-val">' + (params.vega ? params.vega.toFixed(3) : 'N/A') + '</div></div>' +
      '</div></div>' +
      '<div class="builder-section"><div class="builder-label">Position Sizing</div><div class="builder-risk">' +
        '<div class="builder-input-group"><span class="builder-input-label">Account Size</span><input class="builder-input" type="number" id="gaAcctSize" value="' + accountSize + '"></div>' +
        '<div class="builder-input-group"><span class="builder-input-label">Risk %</span><input class="builder-input" type="number" id="gaRiskPct" value="' + riskPct + '" step="0.5" min="0.5" max="10"></div>' +
        '<div class="builder-input-group"><span class="builder-input-label">Max Loss</span><div class="builder-input" style="background:none;border-color:transparent;cursor:default">$' + maxLoss.toFixed(0) + '</div></div>' +
        '<div class="builder-input-group"><span class="builder-input-label">Contracts</span><div class="builder-input" style="background:none;border-color:transparent;cursor:default">' + contractCount + ' ($' + totalCost.toFixed(0) + ')</div></div>' +
      '</div></div>' +
      '<div class="builder-section"><div class="builder-label">P&L Scenarios (' + contractCount + ' contract' + (contractCount > 1 ? 's' : '') + ')</div><div class="builder-pnl">' +
        '<div class="pnl-scenario"><div class="pnl-scenario-label">At Target</div><div class="pnl-scenario-val">' + fmtPnl(pnlTarget) + '</div></div>' +
        '<div class="pnl-scenario"><div class="pnl-scenario-label">At Stop</div><div class="pnl-scenario-val">' + fmtPnl(pnlStop) + '</div></div>' +
        '<div class="pnl-scenario"><div class="pnl-scenario-label">At Expiry (spot)</div><div class="pnl-scenario-val">' + fmtPnl(pnlExpiry) + '</div></div>' +
      '</div></div>';
  }

  function renderTradeDesk() {
    var desk = document.getElementById('gaTradeDesk');
    if (!desk) return;
    var expandBtn = document.getElementById('gaActionExpandBtn');
    var d = state.data, t = state.targetData;
    try { _tradeDeskCollapsed = localStorage.getItem('sq_ga_trade_desk_collapsed') === '1'; } catch(e) {}
    if (!d || !t || !t.tradeSuggestions || t.tradeSuggestions.length === 0 || _tradeDeskCollapsed) {
      desk.style.display = 'none';
      if (expandBtn && _tradeDeskCollapsed && t && t.tradeSuggestions && t.tradeSuggestions.length > 0) expandBtn.style.display = '';
      return;
    }
    if (expandBtn) expandBtn.style.display = 'none';
    desk.style.display = '';
    _tradeDeskParams = t.tradeSuggestions.map(function(s) { return computeTradeParams(s, d); }).filter(function(p) { return p !== null; });
    if (_tradeDeskParams.length === 0) { desk.style.display = 'none'; return; }
    _tradeDeskParams.sort(function(a, b) { return b.confidence - a.confidence; });
    renderHeroPick(_tradeDeskParams[0]);
    renderAlternatives(_tradeDeskParams);
    var altsEl = document.getElementById('gaTradeDeskAlts');
    if (altsEl) { if (_tradeDeskAltsOpen) altsEl.classList.add('open'); else altsEl.classList.remove('open'); }
    var builderEl = document.getElementById('gaTradeDeskBuilder');
    if (builderEl) { if (_tradeDeskBuilderOpen) { builderEl.classList.add('open'); renderTradeBuilder(_tradeDeskParams[_tradeDeskBuilderIdx] || _tradeDeskParams[0]); } else { builderEl.classList.remove('open'); } }
  }

  function initTradeDeskEvents() {
    var collapseBtn = document.getElementById('gaTradeDeskCollapseBtn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function() {
        _tradeDeskCollapsed = true;
        try { localStorage.setItem('sq_ga_trade_desk_collapsed', '1'); } catch(e) {}
        var desk = document.getElementById('gaTradeDesk'); if (desk) desk.style.display = 'none';
        var expandBtn = document.getElementById('gaActionExpandBtn'); if (expandBtn) expandBtn.style.display = '';
      });
    }
    var expandBtn = document.getElementById('gaActionExpandBtn');
    if (expandBtn) {
      expandBtn.addEventListener('click', function() {
        _tradeDeskCollapsed = false;
        try { localStorage.removeItem('sq_ga_trade_desk_collapsed'); } catch(e) {}
        expandBtn.style.display = 'none'; renderTradeDesk();
      });
    }
    var desk = document.getElementById('gaTradeDesk');
    if (desk) {
      desk.addEventListener('click', function(e) {
        if (e.target.id === 'gaAltsBtn') { _tradeDeskAltsOpen = !_tradeDeskAltsOpen; var altsEl = document.getElementById('gaTradeDeskAlts'); if (altsEl) altsEl.classList.toggle('open'); e.target.textContent = _tradeDeskAltsOpen ? 'Hide Alternatives' : 'Show Alternatives'; return; }
        if (e.target.id === 'gaCustomizeBtn') { _tradeDeskBuilderOpen = !_tradeDeskBuilderOpen; _tradeDeskBuilderIdx = 0; var builderEl = document.getElementById('gaTradeDeskBuilder'); if (builderEl) { builderEl.classList.toggle('open'); if (_tradeDeskBuilderOpen) renderTradeBuilder(_tradeDeskParams[0]); } return; }
        var swapBtn = e.target.closest('.alt-swap-btn:not([data-builder-idx])');
        if (swapBtn && swapBtn.dataset.altIdx) { var idx = parseInt(swapBtn.dataset.altIdx, 10); if (_tradeDeskParams[idx]) { var picked = _tradeDeskParams.splice(idx, 1)[0]; _tradeDeskParams.unshift(picked); renderHeroPick(_tradeDeskParams[0]); renderAlternatives(_tradeDeskParams); if (_tradeDeskBuilderOpen) { _tradeDeskBuilderIdx = 0; renderTradeBuilder(_tradeDeskParams[0]); } } return; }
        var dirBtn = e.target.closest('[data-builder-dir]');
        if (dirBtn) { var newDir = dirBtn.dataset.builderDir; var p = _tradeDeskParams[_tradeDeskBuilderIdx]; if (p && state.targetData && state.targetData.tradeSuggestions[_tradeDeskBuilderIdx]) { var orig = Object.assign({}, state.targetData.tradeSuggestions[_tradeDeskBuilderIdx], { type: newDir, direction: newDir === 'CALL' ? 'bullish' : 'bearish' }); var newParams = computeTradeParams(orig, state.data); if (newParams) { _tradeDeskParams[_tradeDeskBuilderIdx] = newParams; renderTradeBuilder(newParams); } } return; }
        var strikeBtn = e.target.closest('[data-builder-strike]');
        if (strikeBtn) { var newStrike = parseFloat(strikeBtn.dataset.builderStrike); var p = _tradeDeskParams[_tradeDeskBuilderIdx]; if (p && state.targetData) { var orig = Object.assign({}, state.targetData.tradeSuggestions[_tradeDeskBuilderIdx] || {}, { strike: newStrike, type: p.type, direction: p.direction }); var newParams = computeTradeParams(orig, state.data); if (newParams) { _tradeDeskParams[_tradeDeskBuilderIdx] = newParams; renderTradeBuilder(newParams); } } return; }
      });
      desk.addEventListener('input', function(e) {
        if (e.target.id === 'gaAcctSize') { try { localStorage.setItem('sq_account_size', (parseFloat(e.target.value) || 10000).toString()); } catch(ex) {} renderTradeBuilder(_tradeDeskParams[_tradeDeskBuilderIdx] || _tradeDeskParams[0]); }
        if (e.target.id === 'gaRiskPct') { try { localStorage.setItem('sq_risk_pct', (parseFloat(e.target.value) || 2).toString()); } catch(ex) {} renderTradeBuilder(_tradeDeskParams[_tradeDeskBuilderIdx] || _tradeDeskParams[0]); }
      });
    }
  }


  function handleGexUpdate(data) {
    if (!data || data.error) return;
    state.data = data;
    state.allExps = data.expirations.map(function(_, i) { return i; });
    state.selectedExps = state.allExps.slice();
    renderAll(); updateSpotBadge(); updateFooter();
  }

  // ── Init / Destroy ──
  function init() {
    $.tickerInput = document.getElementById('gaTickerInput');
    $.tickerDropdown = document.getElementById('gaTickerDropdown');
    $.loadBtn = document.getElementById('gaLoadBtn');
    $.loadingIndicator = document.getElementById('gaLoadingIndicator');

    if ($.tickerInput) {
      $.tickerInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { $.tickerDropdown.classList.remove('show'); loadTicker(); } });
      $.tickerInput.addEventListener('input', showTickerDropdown);
      $.tickerInput.addEventListener('focus', showTickerDropdown);
    }

    if ($.tickerDropdown) {
      $.tickerDropdown.addEventListener('mousedown', function(e) {
        var opt = e.target.closest('.ticker-option');
        if (opt) selectTicker(opt.dataset.sym);
      });
    }

    if ($.loadBtn) $.loadBtn.addEventListener('click', loadTicker);

    _docClickHandler = function(e) {
      if (!e.target.closest('#gaTickerDropdown') && !e.target.closest('#gaTickerInput')) {
        if ($.tickerDropdown) $.tickerDropdown.classList.remove('show');
      }
    };
    document.addEventListener('click', _docClickHandler);

    var rangeSlider = document.getElementById('gaRangeSlider');
    if (rangeSlider) {
      rangeSlider.addEventListener('input', function() { updateRange(this.value); });
      rangeSlider.addEventListener('change', function() { loadTicker(); });
    }

    var page = document.getElementById('page-gex-analytics');
    if (page) {
      page.addEventListener('click', function(e) {
        var target = e.target;
        if (target.classList.contains('tab') && target.dataset.tab) { setTab(target.dataset.tab); return; }
        if (target.classList.contains('greeks-btn') && target.dataset.greek) { setGreek(target.dataset.greek); return; }
        if (target.classList.contains('scan-filter') && target.dataset.filter) {
          state.scanFilter = target.dataset.filter;
          document.querySelectorAll('#page-gex-analytics .scan-filter').forEach(function(b) { b.classList.toggle('active', b.dataset.filter === state.scanFilter); });
          renderScan();
          return;
        }
        if (target.classList.contains('scan-ticker') && target.dataset.ticker) {
          $.tickerInput.value = target.dataset.ticker;
          loadTicker();
          setTab('profile');
          return;
        }
      });
    }

    var scanBtn = document.getElementById('gaScanBtn');
    if (scanBtn) scanBtn.addEventListener('click', runScan);

    if (SQ.socket) {
      socketHandlers = {
        'gex:update': handleGexUpdate,
        'gex:error': function(err) { console.warn('[GA WS] Error:', err.error); },
        'gex:spot': function(msg) {
          if (!state.data || msg.ticker !== state.ticker) return;
          state.data.spotPrice = msg.price;
          var badge = document.getElementById('gaSpotBadge');
          if (badge) {
            badge.textContent = state.data.ticker + ' $' + msg.price.toFixed(2);
            badge.classList.remove('flash'); void badge.offsetWidth; badge.classList.add('flash');
          }
        },
      };
      Object.keys(socketHandlers).forEach(function(evt) { SQ.socket.on(evt, socketHandlers[evt]); });
      if (SQ.socket.connected && state.ticker) SQ.socket.emit('subscribe', state.ticker);
      socketHandlers['connect'] = function() { if (state.ticker) SQ.socket.emit('subscribe', state.ticker); };
      SQ.socket.on('connect', socketHandlers['connect']);
    }

    tipInterval = setInterval(attachTipPopups, 1000);
    attachTipPopups();

    var params = new URLSearchParams(window.location.search);
    var qTicker = params.get('ticker');
    var qTab = params.get('view') || params.get('tab');
    if (qTicker) $.tickerInput.value = qTicker.toUpperCase();
    var tabMap = { profile: 'profile', vanna: 'greeks', charm: 'greeks', scan: 'scan', skew: 'skew', timeline: 'timeline', surface: 'surface', targets: 'analysis', trade: 'trade' };
    if (qTab && tabMap[qTab]) {
      state.tab = tabMap[qTab];
      if (qTab === 'charm') state.activeGreek = 'charm';
    }
    setTab(state.tab);
    initTradeDeskEvents();
    loadTicker();
  }

  function destroy() {
    if (SQ.socket) {
      SQ.socket.emit('unsubscribe', state.ticker);
      Object.keys(socketHandlers).forEach(function(evt) { SQ.socket.off(evt, socketHandlers[evt]); });
      socketHandlers = {};
    }
    if (_docClickHandler) { document.removeEventListener('click', _docClickHandler); _docClickHandler = null; }
    if (state._surfaceMove) { window.removeEventListener('mousemove', state._surfaceMove); window.removeEventListener('mouseup', state._surfaceUp); state.surfaceDragBound = false; }
    if (tipInterval) { clearInterval(tipInterval); tipInterval = null; }
    if (_profileChart) { _profileChart.destroy(); _profileChart = null; }
    if (_vannaChart) { _vannaChart.destroy(); _vannaChart = null; }
    if (_charmChart) { _charmChart.destroy(); _charmChart = null; }
    if (_skewChart) { _skewChart.destroy(); _skewChart = null; }
    if (_termChart) { _termChart.destroy(); _termChart = null; }
    if (_oiChart) { _oiChart.destroy(); _oiChart = null; }
    if (_volChart) { _volChart.destroy(); _volChart = null; }
    state.data = null; state.targetData = null; state.squeezeData = null;
    state.scanData = null; state.termData = null; state.oiData = null;
    state.selectedExps = []; state.allExps = [];
    state.ticker = 'SPY'; state.tab = 'profile';
    $ = {};
  }

  return { init: init, destroy: destroy };
})();
SQ['gex-analytics'] = SQ.gexAnalytics;
`;
}

module.exports = { getGexAnalyticsPageCSS, getGexAnalyticsPageHTML, getGexAnalyticsPageJS };
