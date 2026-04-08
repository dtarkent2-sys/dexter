/**
 * Common CSS & HTML helpers shared across dashboard pages.
 *
 * Eliminates duplication of <head> elements, design tokens, resets,
 * scrollbar styles, topbar, nav-links, and brand across all dashboard
 * page modules (app, gex-heatmap, trading, flow, agents, portfolio, intel, smartmoney).
 */

// ── Shared <head> elements (meta tags, font imports, favicon) ───────────

/**
 * Returns the common <head> inner HTML used by every dashboard page.
 * Does NOT include <title> — caller must add that.
 * @param {object} [opts]
 * @param {boolean} [opts.socketIO]  - include Socket.IO CDN script
 * @param {boolean} [opts.chartJS]   - include Chart.js CDN scripts
 * @param {boolean} [opts.lwCharts]  - include Lightweight Charts CDN script
 * @param {string}  [opts.extra]     - extra tags to append (e.g. <meta>)
 */
function getCommonHead(opts = {}) {
  let html = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/png" href="/assets/images/logo.png?v=4">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"><\/script>`;

  if (opts.chartJS) {
    html += `\n<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"><\/script>`;
    html += `\n<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.1.0/dist/chartjs-plugin-annotation.min.js"><\/script>`;
  }
  if (opts.socketIO) {
    html += `\n<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"><\/script>`;
  }
  if (opts.lwCharts) {
    html += `\n<script src="https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js"><\/script>`;
  }
  if (opts.extra) {
    html += '\n' + opts.extra;
  }

  // Inject API key fetch interceptor so dashboard JS calls authenticate
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (apiKey) {
    html += `\n<script>
(function(){var k="${apiKey}",_f=window.fetch;window.fetch=function(u,o){
o=o||{};if(typeof u==='string'&&u.startsWith('/api/')){
o.headers=Object.assign({'x-api-key':k},o.headers||{});}
return _f.call(this,u,o);};})();
<\/script>`;
  }

  return html;
}

// ── Shared CSS reset + scrollbar + base utilities ───────────────────────

/**
 * Returns common CSS styles shared by all dashboard pages:
 *   - Universal reset (*, body base)
 *   - Scrollbar styling
 *   - fadeIn keyframe
 *
 * Does NOT include :root variables — each page defines its own tokens.
 * @returns {string}
 */
function getCommonStyles() {
  return `
/* ── Reset ─────────────────────────────────────────────── */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ── Scrollbar ─────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border, rgba(255,255,255,0.1)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted, #64748B); }
`;
}

// ── Shared design tokens (used by standalone pages like optimize) ──

/**
 * Returns the :root block with extended design tokens.
 * The SPA (app.js) defines its own :root with these tokens inline.
 * This function is used by standalone pages (e.g. optimize.js).
 * @returns {string}
 */
function getGoldTokens() {
  return `
:root {
  --bg: #0A0F1C;
  --bg-surface: rgba(15,23,42,0.85);
  --bg-surface-hover: rgba(30,41,59,0.9);
  --bg-elevated: rgba(20,30,50,0.95);
  --border: rgba(251,191,36,0.1);
  --border-subtle: rgba(251,191,36,0.05);
  --text: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --accent: #fbbf24;
  --accent-hover: #fcd34d;
  --accent-subtle: rgba(251,191,36,0.1);
  --cyan: #22d3ee;
  --cyan-dim: rgba(34,211,238,0.12);
  --green: #4ade80;
  --red: #f87171;
  --yellow: #fbbf24;
  --glass: rgba(15,23,42,0.75);
  --glass-border: rgba(251,191,36,0.12);
  --glass-border-cyan: rgba(34,211,238,0.12);
  --font-heading: 'Barlow Condensed', 'DM Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 4px;
  --radius-sm: 3px;
  --radius-xs: 2px;
  --transition: 150ms ease;
}
html.light {
  --bg: #f0f1f5;
  --bg-surface: rgba(255,255,255,0.85);
  --bg-surface-hover: rgba(241,245,249,0.9);
  --bg-elevated: rgba(255,255,255,0.95);
  --border: rgba(180,140,40,0.15);
  --border-subtle: rgba(180,140,40,0.08);
  --text: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --accent: #d97706;
  --accent-hover: #b45309;
  --accent-subtle: rgba(217,119,6,0.08);
  --cyan: #0891b2;
  --cyan-dim: rgba(8,145,178,0.08);
  --green: #16A34A;
  --red: #DC2626;
  --yellow: #CA8A04;
  --glass: rgba(255,255,255,0.75);
  --glass-border: rgba(217,119,6,0.12);
  --glass-border-cyan: rgba(8,145,178,0.12);
}
`;
}

/**
 * Returns the shared topbar + brand + nav-links CSS.
 * Used by standalone pages (e.g. optimize.js) that aren't part of the SPA.
 * @returns {string}
 */
function getGoldTopbarStyles() {
  return `
/* ── Top Bar — HUD ────────────────────────────────────── */
.topbar {
  display: flex; align-items: center; gap: 16px;
  padding: 8px 20px; background: rgba(10,15,28,0.95);
  border-bottom: 1px solid var(--glass-border); z-index: 10;
  flex-shrink: 0; backdrop-filter: blur(12px);
}
.brand { display: flex; align-items: center; gap: 8px; }
.brand-name { font-family: var(--font-heading); font-weight: 700; font-size: 18px; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; }
.brand-sep { width: 1px; height: 16px; background: var(--glass-border); }
.brand-sub { font-family: var(--font-mono); font-size: 9px; color: var(--accent); text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.5; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-dot.open { background: var(--green); box-shadow: 0 0 6px rgba(74,222,128,0.4); }
.status-dot.pre { background: var(--accent); }
.status-dot.closed { background: var(--red); }
.market-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.5px; }
.nav-links { display: flex; gap: 4px; margin-left: auto; }
.nav-links a {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-decoration: none; padding: 4px 10px; border-radius: 2px;
  border: 1px solid transparent; transition: all var(--transition); letter-spacing: 0.5px;
}
.nav-links a:hover { color: var(--text-secondary); border-color: var(--glass-border); }
.nav-links a.active { color: var(--accent); border-color: rgba(251,191,36,0.25); background: rgba(251,191,36,0.06); }

/* ── Mobile Topbar ─────────────────────────────────────── */
@media (max-width: 768px) {
  .topbar { flex-wrap: wrap; padding: 8px 12px; gap: 8px; }
  .brand-sep, .brand-sub { display: none; }
  .market-label { display: none; }
  .nav-links { width: 100%; overflow-x: auto; gap: 2px; -webkit-overflow-scrolling: touch; margin-left: 0; }
  .nav-links a { padding: 8px 12px; white-space: nowrap; }
}
`;
}

module.exports = { getCommonHead, getCommonStyles, getGoldTokens, getGoldTopbarStyles };
