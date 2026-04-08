'use strict';

function getMobileOverrideCSS() {
  return `
/* ═══════════════════════════════════════════════════════════
   MOBILE OVERRIDES  —  max-width: 480px
   All rules here are additive overrides. Desktop unchanged.
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 480px) {

  /* ── Shell ──────────────────────────────────────────────── */
  .page { padding: 12px 10px; padding-top: 52px; }
  .page-header {
    flex-direction: column; align-items: flex-start;
    gap: 8px; padding: 12px 10px 8px;
  }
  .page-header h2 { font-size: 16px; }
  .page-header .subtitle { font-size: 11px; }

  /* Stat cards → single column */
  .cards { grid-template-columns: 1fr !important; }
  .card { padding: 12px; }
  .card .value { font-size: 18px; }

  /* ── Portfolio / Dashboard home ─────────────────────────── */
  #page-dashboard .dash-grid { grid-template-columns: 1fr !important; }
  #page-dashboard .bottom-panels { grid-template-columns: 1fr !important; }
  #page-dashboard .safety-row { grid-template-columns: repeat(2, 1fr) !important; }
  #page-dashboard .cockpit-bar { flex-wrap: wrap; gap: 6px; }
  #page-dashboard .pos-row-item {
    grid-template-columns: 80px 36px 56px 56px 68px 50px 50px !important;
    font-size: 10px;
  }
  #page-dashboard .order-row {
    grid-template-columns: 64px 1fr 40px 50px 60px 58px !important;
    font-size: 10px;
  }

  /* ── Trading ─────────────────────────────────────────────── */
  #page-trading .main { grid-template-columns: 1fr !important; }
  #page-trading .cockpit-bar { flex-wrap: wrap; gap: 6px; overflow-x: auto; }
  #page-trading .signal-row,
  #page-trading .journal-row { font-size: 10px; overflow-x: auto; }
  #page-trading .status-bar { flex-wrap: wrap; font-size: 10px; gap: 4px; }

  /* ── GEX pages — shared header controls ─────────────────── */
  .ticker-input { width: 80px !important; font-size: 12px; }
  .ticker-dropdown { min-width: unset !important; max-width: 160px; }
  .range-input { width: 60px !important; }
  .controls, .filter-row, .topbar-controls {
    flex-wrap: wrap !important; gap: 6px !important;
  }

  /* ── GEX Heatmap ────────────────────────────────────────── */
  #page-gex-heatmap .page-header { flex-direction: column; align-items: flex-start; }

  /* ── GEX LLM ────────────────────────────────────────────── */
  #page-gex-llm .gl-layout { grid-template-columns: 1fr !important; }
  #page-gex-llm #gl-ticker { width: 100% !important; max-width: 160px; }

  /* ── GEX Visor ──────────────────────────────────────────── */
  #page-gex-visor .gv-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
  #page-gex-visor .gv-walls-row { grid-template-columns: repeat(2, 1fr) !important; }
  #page-gex-visor .gv-charts { flex-direction: column !important; }
  #page-gex-visor .gv-help-content { max-width: 95vw !important; }

  /* ── GEX Analytics ──────────────────────────────────────── */
  #page-gex-analytics .controls { flex-wrap: wrap !important; }
  #page-gex-analytics .scan-table { font-size: 11px; }

  /* ── Intel ──────────────────────────────────────────────── */
  #page-intel .intel-grid { grid-template-columns: 1fr !important; }
  #page-intel .tech-grid { grid-template-columns: 1fr !important; }
  #page-intel .quote-stats { grid-template-columns: 1fr 1fr !important; }
  #page-intel .ticker-input { width: 140px !important; }

  /* ── Smart Money ────────────────────────────────────────── */
  #page-smartmoney .sm-grid { grid-template-columns: 1fr !important; }
  #page-smartmoney .whale-stats-grid { grid-template-columns: 1fr 1fr !important; }
  #page-smartmoney .ticker-input { width: 140px !important; }

  /* ── LT Screener — HARD BLOCKER ────────────────────────── */
  #page-lt-screener .lt-detail-panel {
    position: static !important;
    width: 100% !important;
    border-left: none !important;
    border-top: 1px solid var(--border);
    max-height: 60vh;
    overflow-y: auto;
  }
  #page-lt-screener .lt-stat-grid { grid-template-columns: 1fr 1fr !important; }
  #page-lt-screener .lt-controls { flex-wrap: wrap !important; gap: 6px; }
  #page-lt-screener .lt-controls select,
  #page-lt-screener .lt-controls input { width: auto !important; flex: 1; min-width: 80px; }

  /* ── Options Flow ───────────────────────────────────────── */
  #page-flow .sidebar-col { display: none !important; }
  #page-flow .main-col { width: 100% !important; }
  #page-flow .cards-row { grid-template-columns: repeat(2, 1fr) !important; }
  #page-flow .tape-row { font-size: 10px; }
  #page-flow .flow-controls { flex-wrap: wrap !important; gap: 6px; }

  /* ── Daily Briefing ─────────────────────────────────────── */
  #page-briefing .visual-cards { grid-template-columns: 1fr !important; }
  #page-briefing .playbook-cards { grid-template-columns: 1fr !important; }
  #page-briefing .regime-label { width: auto !important; }
  #page-briefing .gamma-info { width: auto !important; }
  #page-briefing .signal-map-table { font-size: 10px; }

  /* ── AI Agents ──────────────────────────────────────────── */
  #page-agents .stage { min-width: 80px !important; flex: 1; }
  #page-agents .reports-grid { grid-template-columns: 1fr !important; }
  /* debate card inline 2-col and risk card inline 3-col */
  #page-agents .card-body > div[style*="grid-template-columns"] {
    display: block !important;
  }
  #page-agents .card-body > div[style*="grid-template-columns"] > div {
    margin-bottom: 12px;
  }

  /* ── Strategies ─────────────────────────────────────────── */
  #page-strategies .strat-levels { grid-template-columns: repeat(2, 1fr) !important; }

  /* ── Screener ───────────────────────────────────────────── */
  #page-screener .heatmap-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
  }
  #page-screener .filter-bar { flex-direction: column; align-items: flex-start; }
  #page-screener .filter-bar input { width: 100% !important; max-width: 200px; }

  /* ── Global table safety net ─────────────────────────────── */
  .tbl-wrap,
  .screener-tbl-wrap,
  .sm-tbl-wrap,
  .alert-table-wrap,
  .gex-tbl-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }

  /* Ensure no table forces page-level horizontal scroll */
  .page { overflow-x: hidden; }
  .page > * { max-width: 100%; }

}
`;
}

module.exports = { getMobileOverrideCSS };
