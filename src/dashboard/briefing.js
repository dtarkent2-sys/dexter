/**
 * Daily Briefing Page — SPA-embeddable exports
 *
 * Exports:
 *   getBriefingPageCSS()  → scoped CSS for the briefing page
 *   getBriefingPageHTML() → HTML fragment for the briefing page
 *   getBriefingPageJS()   → client-side JS for the briefing page
 */

function getBriefingPageCSS() {
  return `
/* ── Briefing page scoped styles ── */
#page-briefing {
  max-width: 1100px; margin: 0 auto; padding: 24px;
}
#page-briefing .briefing-header { margin-bottom: 20px; }
#page-briefing .briefing-date {
  font-family: var(--font-heading); font-size: 28px; font-weight: 700; color: var(--text);
}
#page-briefing .briefing-meta {
  font-size: 13px; color: var(--text-muted); margin-top: 6px;
  display: flex; align-items: center; gap: 10px;
}
#page-briefing .billy-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 2px 8px; font-family: var(--font-mono); font-size: 12px; color: var(--text);
}

/* ── Visual Cards Grid ── */
#page-briefing .visual-cards {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;
}
@media (max-width: 768px) {
  #page-briefing .visual-cards { grid-template-columns: 1fr; }
}
#page-briefing .vcard {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px;
  padding: 24px; position: relative; overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(251,191,36,0.06);
}
#page-briefing .vcard::before {
  content: ''; position: absolute; inset: -1px; border-radius: 17px; padding: 1px;
  background: linear-gradient(135deg, rgba(251,191,36,0.2), transparent 40%, transparent 60%, rgba(99,102,241,0.15));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none; z-index: 3;
}
#page-briefing .vcard .scan {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
  z-index: 2; animation: vcardScan 3s ease-in-out infinite; opacity: 0.5; pointer-events: none;
}
@keyframes vcardScan {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { top: calc(100% - 2px); opacity: 0; }
}
#page-briefing .vcard-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
}
#page-briefing .vcard-title {
  font-family: var(--font-mono); font-size: 15px; font-weight: 700;
  color: var(--text); display: flex; align-items: center; gap: 8px;
}
#page-briefing .vcard-live {
  width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
  animation: vcardPulse 2s ease-in-out infinite;
}
@keyframes vcardPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
#page-briefing .vcard-badge {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em;
}
#page-briefing .vcard-badge.bullish { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
#page-briefing .vcard-badge.bearish { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
#page-briefing .vcard-badge.neutral { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
#page-briefing .vcard-badge.fragile { background: rgba(234,179,8,0.12); color: #eab308; border: 1px solid rgba(234,179,8,0.2); }

/* Live SPY card */
#page-briefing .spy-price {
  font-family: var(--font-mono); font-size: 32px; font-weight: 700; color: var(--text);
}
#page-briefing .spy-change {
  font-family: var(--font-mono); font-size: 15px; font-weight: 600; margin-left: 10px;
}
#page-briefing .spy-levels {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px;
}
#page-briefing .spy-level {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 10px; background: var(--bg); border-radius: 5px;
  font-size: 12px;
}
#page-briefing .spy-level-label { color: var(--text-muted); }
#page-briefing .spy-level-val { font-family: var(--font-mono); font-weight: 600; color: var(--text); }
#page-briefing .spy-flow-bar {
  margin-top: 12px; height: 6px; border-radius: 3px; background: var(--bg);
  overflow: hidden;
}
#page-briefing .spy-flow-fill {
  height: 100%; border-radius: 3px; transition: width 0.6s ease;
}
#page-briefing .spy-flow-fill.green { background: linear-gradient(90deg, var(--accent), #22c55e) !important; }
#page-briefing .spy-flow-fill.red { background: linear-gradient(90deg, #ef4444, rgba(239,68,68,0.5)) !important; }

/* Regime Detector card */
#page-briefing .regime-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
#page-briefing .regime-label {
  font-size: 12px; color: var(--text-muted); width: 100px; flex-shrink: 0;
}
#page-briefing .regime-bar-bg {
  flex: 1; height: 20px; background: var(--bg); border-radius: 4px; overflow: hidden;
  position: relative;
}
#page-briefing .regime-bar-fill {
  height: 100%; border-radius: 4px; transition: width 0.6s ease;
}
#page-briefing .regime-bar-fill.active {
  font-weight: 700;
}
#page-briefing .regime-bar-val {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--text);
}
#page-briefing .regime-footer {
  display: flex; gap: 16px; margin-top: 12px; padding-top: 10px;
  border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted);
}
#page-briefing .regime-footer span { font-family: var(--font-mono); color: var(--text); font-weight: 600; }

/* SHARK Engine card */
#page-briefing .shark-model-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
#page-briefing .shark-model-label {
  font-size: 12px; color: var(--text-muted); width: 80px; flex-shrink: 0;
}
#page-briefing .shark-bar-bg {
  flex: 1; height: 18px; background: var(--bg); border-radius: 4px; overflow: hidden;
  position: relative;
}
#page-briefing .shark-bar-fill {
  height: 100%; border-radius: 4px; transition: width 0.6s ease;
}
#page-briefing .shark-trade-plan {
  border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px;
  font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); line-height: 2;
}
#page-briefing .shark-trade-plan .prob { font-weight: 600; }
#page-briefing .shark-trade-footer {
  border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px;
  font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);
}
#page-briefing .shark-bar-pct {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--text);
}
#page-briefing .shark-consensus {
  margin-top: 14px; padding: 10px 14px; border-radius: 3px;
  font-family: var(--font-mono); font-size: 13px; font-weight: 700;
  text-align: center; text-transform: uppercase; letter-spacing: 0.5px;
}
#page-briefing .shark-trade {
  margin-top: 10px; font-size: 12px; color: var(--text-muted); line-height: 1.5;
}
#page-briefing .shark-trade strong { color: var(--text); }

/* SPY Gamma Profile card */
#page-briefing .gamma-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
}
#page-briefing .gamma-info { width: 110px; flex-shrink: 0; }
#page-briefing .gamma-level-name {
  font-size: 12px; color: var(--text-muted);
}
#page-briefing .gamma-level-strike {
  font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--text);
}
#page-briefing .gamma-bar-bg {
  flex: 1; height: 22px; background: var(--bg); border-radius: 4px; overflow: hidden;
  position: relative;
}
#page-briefing .gamma-bar-fill {
  height: 100%; border-radius: 4px; transition: width 0.6s ease;
}
#page-briefing .gamma-bar-bg { height: 10px; }
#page-briefing .gamma-bar-fill { height: 100%; border-radius: 5px; }
#page-briefing .gamma-bar-val {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--text);
}
#page-briefing .gamma-footer {
  display: flex; gap: 16px; margin-top: 10px; padding-top: 10px;
  border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted);
}
#page-briefing .gamma-footer span { font-family: var(--font-mono); color: var(--text); font-weight: 600; }

/* Mini Heatmap card — full width */
#page-briefing .vcard-full {
  grid-column: 1 / -1;
}
#page-briefing .heatmap-grid {
  display: grid; gap: 2px;
  font-family: var(--font-mono); font-size: 11px;
}
#page-briefing .heatmap-header-row {
  display: contents;
}
#page-briefing .heatmap-cell {
  padding: 6px 4px; text-align: center; border-radius: 3px;
  color: #fff; font-weight: 600; font-size: 11px;
  min-height: 28px; display: flex; align-items: center; justify-content: center;
}
#page-briefing .heatmap-strike {
  padding: 6px 8px; text-align: right; color: var(--text);
  font-weight: 700; font-size: 12px;
  display: flex; align-items: center; justify-content: flex-end;
}
#page-briefing .heatmap-strike.flip { color: #eab308; }
#page-briefing .heatmap-exp-label {
  padding: 4px; text-align: center; color: var(--text-muted);
  font-size: 10px; font-weight: 600;
}
#page-briefing .heatmap-footer {
  display: flex; gap: 20px; margin-top: 10px; font-size: 12px; color: var(--text-muted);
}
#page-briefing .heatmap-footer span { font-family: var(--font-mono); color: var(--text); font-weight: 600; }
#page-briefing .heatmap-loading {
  text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;
}

/* ── Snapshot Grid ── */
#page-briefing .snapshot-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px; margin-bottom: 24px;
}
#page-briefing .snap-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; text-align: center;
}
#page-briefing .snap-label {
  font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;
  margin-bottom: 6px;
}
#page-briefing .snap-value {
  font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: var(--text);
}
#page-briefing .snap-sub {
  font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-top: 4px;
}
#page-briefing .snap-up { color: #22c55e; }
#page-briefing .snap-down { color: #ef4444; }

/* ── Briefing Body ── */
#page-briefing .briefing-body { line-height: 1.7; color: var(--text); max-width: 900px; }
#page-briefing .briefing-body h2 {
  font-family: var(--font-heading); font-size: 18px; font-weight: 700;
  color: var(--accent); border-bottom: 1px solid var(--border);
  padding-bottom: 6px; margin: 24px 0 12px;
}
#page-briefing .briefing-body p { margin: 12px 0; }
#page-briefing .briefing-body ul { margin: 8px 0; padding-left: 24px; }
#page-briefing .briefing-body li { margin: 4px 0; }

/* ── Playbook Cards ── */
#page-briefing .playbooks-section { margin-bottom: 24px; }
#page-briefing .playbooks-title {
  font-family: var(--font-heading); font-size: 16px; font-weight: 700;
  color: var(--text); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
}
#page-briefing .playbook-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;
}
#page-briefing .playbook-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; font-family: var(--font-mono); font-size: 12px; line-height: 1.6;
}
#page-briefing .playbook-card-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
#page-briefing .playbook-card-name {
  font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: 0.3px;
}
#page-briefing .playbook-card-var {
  font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase;
}
#page-briefing .playbook-card-var.elevated { background: rgba(239,68,68,0.12); color: #ef4444; }
#page-briefing .playbook-card-var.compressed { background: rgba(251,191,36,0.12); color: #fbbf24; }
#page-briefing .playbook-card-var.unknown { background: rgba(100,116,139,0.12); color: var(--text-muted); }
#page-briefing .playbook-row { color: var(--text-muted); margin-bottom: 4px; }
#page-briefing .playbook-row strong { color: var(--text); font-weight: 600; }
#page-briefing .playbook-status {
  display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
  margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;
}
#page-briefing .playbook-status.armed { background: rgba(234,179,8,0.15); color: #eab308; }
#page-briefing .playbook-status.triggered { background: rgba(34,197,94,0.15); color: #22c55e; }
#page-briefing .playbook-status.invalidated { background: rgba(239,68,68,0.15); color: #ef4444; }
#page-briefing .playbook-footer {
  display: flex; gap: 12px; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border);
  font-size: 11px; color: var(--text-muted);
}
#page-briefing .playbook-footer span { color: var(--text); font-weight: 600; }
#page-briefing .sq-score { font-family: var(--font-mono); font-size: 11px; }
#page-briefing .sq-score.green { color: #22c55e; }
#page-briefing .sq-score.yellow { color: #eab308; }
#page-briefing .sq-score.red { color: #ef4444; }

/* ── Integrity Box ── */
#page-briefing .integrity-box {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; margin-top: 24px; font-family: var(--font-mono); font-size: 12px;
  line-height: 1.7; color: var(--text-muted);
}
#page-briefing .integrity-box-title {
  font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
#page-briefing .integrity-row { margin-bottom: 2px; }
#page-briefing .integrity-row span { color: var(--text); font-weight: 600; }
#page-briefing .integrity-section { margin-top: 8px; }
#page-briefing .integrity-gate {
  display: flex; gap: 16px; flex-wrap: wrap; margin-top: 4px;
}

/* ── Institutional Layer ── */
#page-briefing .institutional-layer { margin-top: 20px; }
#page-briefing .institutional-layer summary {
  font-family: var(--font-heading); font-size: 14px; font-weight: 700;
  color: var(--text-muted); cursor: pointer; padding: 8px 0;
  list-style: none; display: flex; align-items: center; gap: 6px;
}
#page-briefing .institutional-layer summary::before {
  content: '\\25B6'; font-size: 10px; transition: transform 0.2s;
}
#page-briefing .institutional-layer[open] summary::before { transform: rotate(90deg); }
#page-briefing .institutional-content {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
  color: var(--text-muted); margin-top: 8px;
}
#page-briefing .institutional-content h4 {
  font-size: 12px; font-weight: 700; color: var(--text); margin: 12px 0 4px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
#page-briefing .institutional-content h4:first-child { margin-top: 0; }
#page-briefing .signal-map-table {
  width: 100%; border-collapse: collapse; margin: 4px 0;
}
#page-briefing .signal-map-table td {
  padding: 3px 8px; border-bottom: 1px solid var(--border);
}
#page-briefing .signal-map-table td:first-child { color: var(--text); font-weight: 600; }

/* ── Empty State ── */
#page-briefing .briefing-empty {
  text-align: center; padding: 80px 20px; color: var(--text-muted);
}
#page-briefing .briefing-empty h3 { font-family: var(--font-heading); font-weight: 600; }

`;
}

function getBriefingPageHTML() {
  return `
<div class="page" id="page-briefing">
  <div class="briefing-header">
    <div class="briefing-date" id="briefing-date">SharkBrief&trade;</div>
    <div class="briefing-meta">
      <span class="billy-badge"><i data-lucide="zap" style="width:14px;height:14px;"></i> Billy</span>
      <span id="briefing-time"></span>
    </div>
  </div>
  <div class="visual-cards" id="briefing-vcards"></div>
  <div class="snapshot-grid" id="briefing-snapshot"></div>
  <div id="briefing-picks"></div>
  <div class="briefing-body" id="briefing-body">
    <div class="briefing-empty"><h3>Loading briefing...</h3></div>
  </div>
  <div id="briefing-institutional"></div>
  <div id="briefing-integrity"></div>
</div>`;
}

function getBriefingPageJS() {
  return `
(function() {
  var loaded = false;

  function mdToHtml(md) {
    if (!md) return '';
    var lines = md.split('\\n');
    var html = '';
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.match(/^###\\s+/)) {
        if (inList) { html += '</ul>'; inList = false; }
        var h3 = line.replace(/^###\\s+/, '').replace(/\\*\\*(.+?)\\*\\*/g, '$1');
        html += '<h2>' + h3 + '</h2>';
        continue;
      }
      if (line.match(/^##\\s+/)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<h2>' + line.replace(/^##\\s+/, '') + '</h2>';
        continue;
      }
      if (line.match(/^---+$/)) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }
      if (line.match(/^\\d+\\.\\s+/)) {
        if (!inList) { html += '<ul>'; inList = true; }
        var numContent = line.replace(/^\\d+\\.\\s+/, '');
        numContent = numContent.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
        numContent = numContent.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
        html += '<li>' + numContent + '</li>';
        continue;
      }
      if (line.match(/^[-*]\\s+/)) {
        if (!inList) { html += '<ul>'; inList = true; }
        var content = line.replace(/^[-*]\\s+/, '');
        content = content.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
        content = content.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
        html += '<li>' + content + '</li>';
        continue;
      }
      if (line.trim() === '') {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }
      if (inList) { html += '</ul>'; inList = false; }
      var text = line.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
      text = text.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
      html += '<p>' + text + '</p>';
    }
    if (inList) html += '</ul>';
    return html;
  }

  function snapCard(label, value, sub, cls) {
    return '<div class="snap-card"><div class="snap-label">' + label + '</div>' +
      '<div class="snap-value ' + (cls || '') + '">' + value + '</div>' +
      (sub ? '<div class="snap-sub ' + (cls || '') + '">' + sub + '</div>' : '') + '</div>';
  }

  function fmtNum(n, dec) {
    if (n == null) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }

  function fmtGex(n) {
    if (n == null) return '—';
    var abs = Math.abs(n);
    if (abs >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (n / 1e3).toFixed(0) + 'K';
    return n.toFixed(0);
  }

  function biasClass(bias) {
    if (!bias) return 'neutral';
    var b = bias.toLowerCase();
    if (b === 'bullish' || b === 'long_gamma') return 'bullish';
    if (b === 'bearish' || b === 'short_gamma') return 'bearish';
    if (b === 'fragile') return 'fragile';
    return 'neutral';
  }

  function biasLabel(raw) {
    // Determine overall bias from flow + regime
    var flow = (raw.flowDirection || '').toLowerCase();
    var regime = (raw.regime || '').toLowerCase();
    if (flow === 'bullish') return 'BULLISH';
    if (flow === 'bearish') return 'BEARISH';
    if (regime === 'choppy' || regime === 'exhaustion') return 'FRAGILE';
    return 'NEUTRAL';
  }

  function scoreColor(v) { return v >= 0.7 ? 'green' : v >= 0.4 ? 'yellow' : 'red'; }

  function buildPlaybookCards(playbooks) {
    if (!playbooks || !playbooks.length) return '';
    var h = '<div class="playbooks-section">';
    h += '<div class="playbooks-title"><i data-lucide="book-open" style="width:16px;height:16px;"></i> Playbook Cards</div>';
    h += '<div class="playbook-cards">';
    playbooks.forEach(function(p) {
      var varCls = p.variance === 'elevated' ? 'elevated' : p.variance === 'compressed' ? 'compressed' : 'unknown';
      var statusCls = (p.status || '').toLowerCase();
      h += '<div class="playbook-card">';
      h += '<div class="playbook-card-header">';
      h += '<span class="playbook-card-name">' + p.name + '</span>';
      h += '<span class="playbook-card-var ' + varCls + '">' + p.variance + '</span>';
      h += '</div>';
      h += '<div class="playbook-row"><strong>TRIGGER:</strong> ' + (p.trigger || '—') + '</div>';
      h += '<div class="playbook-row"><strong>INVALID:</strong> ' + (p.invalidation || '—') + '</div>';
      h += '<div class="playbook-row"><strong>ENV:</strong> ' + (p.environment || '—') + '</div>';
      h += '<div class="playbook-row"><strong>SIZE:</strong> ' + (p.size || '—') + '</div>';
      h += '<div class="playbook-row"><strong>STRUCTURES:</strong> ' + (p.structures || '—') + '</div>';
      h += '<span class="playbook-status ' + statusCls + '">' + (p.status || 'ARMED') + '</span>';
      h += '<div class="playbook-footer">';
      h += '<div>RC <span class="sq-score ' + scoreColor(p.rc || 0) + '">' + (p.rc != null ? p.rc.toFixed(2) : '—') + '</span></div>';
      h += '<div>SQ <span class="sq-score ' + scoreColor(p.sq || 0) + '">' + (p.sq != null ? p.sq.toFixed(2) : '—') + '</span></div>';
      h += '<div>DQ <span class="sq-score ' + scoreColor(p.dq || 0) + '">' + (p.dq != null ? p.dq.toFixed(2) : '—') + '</span></div>';
      h += '<div>Source: ' + (p.source || '—') + '</div>';
      h += '</div>';
      h += '</div>';
    });
    h += '</div></div>';
    return h;
  }

  function buildIntegrityBox(integrity) {
    if (!integrity) return '';
    var h = '<div class="integrity-box">';
    h += '<div class="integrity-box-title">Integrity Check</div>';
    h += '<div class="integrity-row">Data Quality: <span>' + (integrity.dq != null ? integrity.dq.toFixed(2) : '—') + '</span> / 1.00</div>';
    if (integrity.dqLabels) {
      var l = integrity.dqLabels;
      h += '<div class="integrity-row">&nbsp;&nbsp;OI: <span>' + l.oi + '</span> &bull; Flow: <span>' + l.flow + '</span> &bull; Price: <span>' + l.price + '</span> &bull; Greeks: <span>' + l.greeks + '</span> &bull; Chain: <span>' + l.chain + '</span></div>';
    }
    if (integrity.degradations && integrity.degradations.length) {
      h += '<div class="integrity-section"><strong>Degradations:</strong></div>';
      integrity.degradations.forEach(function(d) { h += '<div class="integrity-row">&nbsp;&nbsp;' + d + '</div>'; });
    }
    if (integrity.gate) {
      var g = integrity.gate;
      h += '<div class="integrity-section"><strong>Publication Gate:</strong></div>';
      h += '<div class="integrity-gate">';
      h += '<div>Directional: <span style="color:' + (g.directional ? '#22c55e' : '#ef4444') + '">' + (g.directional ? 'ENABLED' : 'BLOCKED') + '</span></div>';
      h += '<div>Variance: <span style="color:' + (g.variance ? '#22c55e' : '#ef4444') + '">' + (g.variance ? 'ENABLED' : 'BLOCKED') + '</span></div>';
      h += '</div>';
    }
    if (integrity.priorThesis) {
      var pt = integrity.priorThesis;
      h += '<div class="integrity-section"><strong>Yesterday\\\'s Thesis:</strong> <span style="color:' + (pt.status === 'INTACT' ? '#22c55e' : '#ef4444') + '">' + pt.status + '</span>';
      if (pt.reasons && pt.reasons.length) {
        h += '<br>';
        pt.reasons.forEach(function(r) { h += '<div class="integrity-row">&nbsp;&nbsp;' + r + '</div>'; });
      }
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  function buildInstitutionalLayer(inst) {
    if (!inst) return '';
    var h = '<details class="institutional-layer">';
    h += '<summary>Institutional Addendum</summary>';
    h += '<div class="institutional-content">';
    // Assumptions
    if (inst.assumptions) {
      h += '<h4>Assumptions & Provenance</h4>';
      var a = inst.assumptions;
      h += '<div>OI: ' + (a.oiStatus || '—') + ' &bull; Flow: ' + (a.flowCoverage || '—') + ' &bull; Gamma: ' + (a.gammaMethod || '—') + ' &bull; Greeks: ' + (a.greeksSource || '—') + '</div>';
    }
    // Signal Map
    if (inst.signalMap && inst.signalMap.length) {
      h += '<h4>Signal Map</h4>';
      h += '<table class="signal-map-table">';
      inst.signalMap.forEach(function(s) {
        h += '<tr><td>' + s.signal + '</td><td>' + s.type + '</td><td>' + (s.detail || '') + '</td></tr>';
      });
      h += '</table>';
    }
    // Calibration
    if (inst.calibration) {
      h += '<h4>Calibration</h4>';
      var c = inst.calibration;
      h += '<div>Regime: ' + c.regime + ' &bull; Variance: ' + c.variance + ' &bull; Direction: ' + c.direction + '</div>';
    }
    // Falsification
    if (inst.falsification && inst.falsification.length) {
      h += '<h4>Falsification Conditions</h4>';
      inst.falsification.forEach(function(f) { h += '<div>&bull; ' + f + '</div>'; });
    }
    h += '</div></details>';
    return h;
  }

  // ── Visual Card Builders ──

  function buildLiveSPY(raw) {
    var price = raw.price;
    var chg = raw.changePct || 0;
    var chgCls = chg >= 0 ? 'snap-up' : 'snap-down';
    var bias = biasLabel(raw);
    var bc = biasClass(bias);

    var h = '<div class="vcard">';
    h += '<div class="scan"></div>';
    h += '<div class="vcard-header">';
    h += '<div class="vcard-title"><span class="vcard-live"></span> Live SPY</div>';
    h += '<span class="vcard-badge ' + bc + '">' + bias + '</span>';
    h += '</div>';

    // Price line
    h += '<div style="display:flex;align-items:baseline;margin-bottom:4px;">';
    h += '<span class="spy-price">$' + fmtNum(price, 2) + '</span>';
    h += '<span class="spy-change ' + chgCls + '">' + (chg >= 0 ? '+' : '') + fmtNum(chg, 2) + '%</span>';
    h += '</div>';

    // Key levels
    h += '<div class="spy-levels">';
    var callWall = raw.callWalls && raw.callWalls[0] ? '$' + fmtNum(raw.callWalls[0], 0) : '—';
    var putWall = raw.putWalls && raw.putWalls[0] ? '$' + fmtNum(raw.putWalls[0], 0) : '—';
    var flip = raw.gammaFlip ? '$' + fmtNum(raw.gammaFlip, 0) : '—';
    var expMove = raw.expectedMove != null ? '\\u00b1$' + fmtNum(raw.expectedMove, 2) : '—';

    h += '<div class="spy-level"><span class="spy-level-label">Call Wall</span><span class="spy-level-val" style="color:#22c55e">' + callWall + '</span></div>';
    h += '<div class="spy-level"><span class="spy-level-label">Put Wall</span><span class="spy-level-val" style="color:#ef4444">' + putWall + '</span></div>';
    h += '<div class="spy-level"><span class="spy-level-label">Gamma Flip</span><span class="spy-level-val" style="color:#eab308">' + flip + '</span></div>';
    h += '<div class="spy-level"><span class="spy-level-label">Exp Move</span><span class="spy-level-val">' + expMove + '</span></div>';
    h += '</div>';

    // Flow pressure bar
    var flowPct = 50;
    if (raw.flowDirection) {
      flowPct = raw.flowDirection.toLowerCase() === 'bullish' ? 70 : raw.flowDirection.toLowerCase() === 'bearish' ? 30 : 50;
    }
    var flowCls = flowPct > 50 ? 'green' : flowPct < 50 ? 'red' : '';
    var flowColor = flowPct > 50 ? '#22c55e' : flowPct < 50 ? '#ef4444' : '#fbbf24';
    h += '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:12px;">';
    h += '<span>Flow Pressure</span><span style="font-family:var(--font-mono);color:var(--text)">' + (raw.flowDirection || 'Neutral') + '</span></div>';
    h += '<div class="spy-flow-bar"><div class="spy-flow-fill ' + flowCls + '" style="width:' + flowPct + '%;background:' + flowColor + '"></div></div>';

    h += '</div>';
    return h;
  }

  function buildRegimeDetector(raw) {
    // Normalize score keys to lowercase (RegimeDetector returns UPPERCASE keys)
    var rawScores = raw.regimeScores || {};
    var scores = {};
    Object.keys(rawScores).forEach(function(k) { scores[k.toLowerCase()] = rawScores[k]; });
    var regimes = [
      { key: 'trending', label: 'Trending', color: '#22c55e' },
      { key: 'mean_reverting', label: 'Mean Rev', color: '#fbbf24' },
      { key: 'choppy', label: 'Choppy', color: '#eab308' },
      { key: 'squeeze', label: 'Squeeze', color: '#a855f7' },
      { key: 'exhaustion', label: 'Exhaustion', color: '#ef4444' }
    ];

    var activeRegime = (raw.regime || 'neutral').toLowerCase();
    var rcVal = raw.signalQuality ? raw.signalQuality.rc : (raw.regimeConfidence != null ? raw.regimeConfidence : null);
    var rcDisplay = rcVal != null ? (typeof rcVal === 'number' ? rcVal.toFixed(2) : rcVal) : null;

    var h = '<div class="vcard">';
    h += '<div class="scan"></div>';
    h += '<div class="vcard-header">';
    h += '<div class="vcard-title"><span class="vcard-live"></span> Regime Detector</div>';
    var regime = raw.regime || 'NEUTRAL';
    var bc = activeRegime === 'choppy' || activeRegime === 'exhaustion' ? 'fragile' :
             activeRegime === 'trending' ? 'bullish' : 'neutral';
    var badgeText = regime.toUpperCase() + (rcDisplay ? ' RC ' + rcDisplay : '');
    h += '<span class="vcard-badge ' + bc + '">' + badgeText + '</span>';
    h += '</div>';

    // Find max score to determine active regime
    var maxKey = '';
    var maxVal = 0;
    regimes.forEach(function(r) {
      var v = scores[r.key] != null ? scores[r.key] : 0;
      if (v > maxVal) { maxVal = v; maxKey = r.key; }
    });

    regimes.forEach(function(r) {
      var val = scores[r.key] != null ? Math.round(scores[r.key]) : 0;
      var isActive = r.key === maxKey || r.key === activeRegime;
      // Active regime gets gradient fill + highlighted label
      var barBg = isActive ? 'linear-gradient(90deg,rgba(' +
        (r.color === '#22c55e' ? '34,197,94' : r.color === '#fbbf24' ? '251,191,36' :
         r.color === '#eab308' ? '234,179,8' : r.color === '#a855f7' ? '168,85,247' : '239,68,68') +
        ',0.5),' + r.color + ')' : r.color;
      h += '<div class="regime-row">';
      h += '<div class="regime-label" style="' + (isActive ? 'color:' + r.color + ';font-weight:600' : '') + '">' + r.label + '</div>';
      h += '<div class="regime-bar-bg"><div class="regime-bar-fill" style="width:' + Math.min(val, 100) + '%;background:' + barBg + '"></div>';
      h += '<span class="regime-bar-val" style="' + (isActive ? 'color:' + r.color + ';font-weight:700' : '') + '">' + val + '</span></div>';
      h += '</div>';
    });

    // Footer with Bias
    var biasText = biasLabel(raw);
    var biasColor = biasText === 'BULLISH' ? '#22c55e' : biasText === 'BEARISH' ? '#ef4444' : biasText === 'FRAGILE' ? '#eab308' : '#fbbf24';
    h += '<div class="regime-footer">';
    h += '<div>Stability <span>' + (raw.regimeStability != null ? fmtNum(raw.regimeStability, 0) + '%' : '—') + '</span></div>';
    h += '<div>Flickering <span style="color:' + (raw.regimeFlickering ? '#ef4444' : '#22c55e') + '">' + (raw.regimeFlickering ? 'Yes' : 'No') + '</span></div>';
    h += '<div>Bias <span style="color:' + biasColor + '">' + biasText.toLowerCase() + '</span></div>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function buildSharkEngine(raw) {
    // Derive model scores from available data
    var dangerPct = raw.dangerScore != null ? Math.round(raw.dangerScore * 100) : 50;
    var flowConf = 50;
    if (raw.flowDirection) {
      flowConf = raw.flowDirection.toLowerCase() === 'bullish' ? 70 :
                 raw.flowDirection.toLowerCase() === 'bearish' ? 30 : 50;
    }
    var gexConf = raw.totalNetGEX != null ? (raw.totalNetGEX > 0 ? 65 : 35) : 50;

    var bias = biasLabel(raw);
    var bc = biasClass(bias);
    var conviction = dangerPct > 70 || dangerPct < 30 ? 'High' : 'Medium';

    // Model gradient colors based on bias
    var gradientColor = bc === 'bullish' ? 'rgba(34,197,94,0.5),#22c55e' :
                        bc === 'bearish' ? 'rgba(239,68,68,0.5),#ef4444' : 'rgba(251,191,36,0.5),#fbbf24';
    var solidColor = bc === 'bullish' ? '#22c55e' : bc === 'bearish' ? '#ef4444' : '#fbbf24';

    var models = [
      { label: 'Structural', pct: 100 - dangerPct, gradient: true },
      { label: 'Flow', pct: flowConf, gradient: true },
      { label: 'Volatility', pct: gexConf, gradient: false }
    ];

    var h = '<div class="vcard">';
    h += '<div class="scan"></div>';
    h += '<div class="vcard-header">';
    h += '<div class="vcard-title"><span class="vcard-live"></span> SHARK Engine</div>';
    h += '<span class="vcard-badge neutral" style="font-size:10px">MULTI-MODEL</span>';
    h += '</div>';

    models.forEach(function(m) {
      var barStyle = m.gradient ? 'linear-gradient(90deg,' + gradientColor + ')' : 'var(--text-muted)';
      h += '<div class="shark-model-row">';
      h += '<div class="shark-model-label">' + m.label + '</div>';
      h += '<div class="shark-bar-bg"><div class="shark-bar-fill conf-fill" style="width:' + m.pct + '%;background:' + barStyle + '"></div>';
      h += '<span class="shark-bar-pct" style="color:' + (m.gradient ? solidColor : 'var(--text-secondary)') + '">' + m.pct + '%</span></div>';
      h += '</div>';
    });

    // Consensus badge
    var consBg = bc === 'bullish' ? 'rgba(34,197,94,0.12)' :
                 bc === 'bearish' ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.12)';
    h += '<div style="text-align:center;margin:14px 0 12px">';
    h += '<span class="vcard-badge ' + bc + '" style="font-size:12px;padding:6px 18px;letter-spacing:0.03em">';
    h += bias + ' \\u2014 ' + conviction + ' Conviction</span></div>';

    // Probability breakdown
    var price = raw.price || 0;
    var callWall = raw.callWalls && raw.callWalls[0] ? raw.callWalls[0] : Math.round(price + 5);
    var putWall = raw.putWalls && raw.putWalls[0] ? raw.putWalls[0] : Math.round(price - 5);
    var stayPct = dangerPct < 40 ? 65 : dangerPct < 60 ? 55 : 45;
    var breakoutPct = bc === 'bullish' ? 30 : 20;
    var breakdownPct = 100 - stayPct - breakoutPct;
    h += '<div class="shark-trade-plan">';
    h += '<div><span class="prob" style="color:' + (bc === 'bearish' ? '#ef4444' : '#22c55e') + '">' + stayPct + '%</span> SPY stays $' + fmtNum(putWall, 0) + '\\u2013$' + fmtNum(callWall, 0) + '</div>';
    h += '<div><span class="prob" style="color:#eab308">' + breakoutPct + '%</span> breakout above $' + fmtNum(callWall, 0) + '</div>';
    h += '<div><span class="prob" style="color:#ef4444">' + breakdownPct + '%</span> breakdown below $' + fmtNum(putWall, 0) + '</div>';
    h += '</div>';

    // Trade plan + invalidation footer
    var planText = bc === 'bullish' ? 'Buy dips into $' + fmtNum(putWall, 0) :
                   bc === 'bearish' ? 'Sell rips into $' + fmtNum(callWall, 0) : 'Fade extremes';
    var invalText = bc === 'bullish' ? 'Hold below $' + fmtNum(putWall, 0) :
                    bc === 'bearish' ? 'Hold above $' + fmtNum(callWall, 0) : 'Break either wall';
    h += '<div class="shark-trade-footer">';
    h += 'Plan: <span style="color:var(--text)">' + planText + '</span>';
    h += ' \\u2022 Invalidation: <span style="color:#ef4444">' + invalText + '</span>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function buildGammaProfile(raw) {
    var callWall = raw.callWalls && raw.callWalls[0] ? raw.callWalls[0] : null;
    var putWall = raw.putWalls && raw.putWalls[0] ? raw.putWalls[0] : null;
    var flip = raw.gammaFlip || null;
    var netGex = raw.totalNetGEX || 0;

    // Build rows with gradient fills matching landing page
    var rows = [];
    if (callWall) rows.push({ name: 'Call Wall', strike: callWall, gex: Math.abs(netGex) * 0.4, gradient: 'linear-gradient(90deg,#22c55e,rgba(34,197,94,0.5))', pct: 75 });
    if (flip) rows.push({ name: 'Flip Level', strike: flip, gex: 0, gradient: '#eab308', pct: 10 });
    if (putWall) rows.push({ name: 'Put Wall', strike: putWall, gex: -Math.abs(netGex) * 0.5, gradient: 'linear-gradient(90deg,rgba(239,68,68,0.5),#ef4444)', pct: 90 });
    if (raw.dangerScore != null && raw.dangerScore > 0.3 && putWall) {
      var dz = putWall - (raw.expectedMove || 3);
      rows.push({ name: 'Danger Zone', strike: dz, gex: -Math.abs(netGex) * 0.3, gradient: 'linear-gradient(90deg,rgba(239,68,68,0.4),#ef4444)', pct: 65 });
    }

    var regime = (raw.regime || 'NEUTRAL').toUpperCase();
    var bc = regime === 'CHOPPY' || regime === 'EXHAUSTION' ? 'fragile' : 'neutral';

    var h = '<div class="vcard">';
    h += '<div class="scan"></div>';
    h += '<div class="vcard-header">';
    h += '<div class="vcard-title"><span class="vcard-live"></span> SPY Gamma Profile</div>';
    h += '<span class="vcard-badge ' + bc + '">' + regime + '</span>';
    h += '</div>';

    rows.forEach(function(r) {
      var nameColor = r.name === 'Call Wall' ? '#22c55e' : r.name === 'Flip Level' ? '#eab308' : '#ef4444';
      var gexColor = r.gex < 0 ? '#ef4444' : r.gex > 0 ? 'var(--text-secondary)' : 'var(--text-secondary)';
      h += '<div class="gamma-row">';
      h += '<div class="gamma-info"><div class="gamma-level-name" style="color:' + nameColor + ';font-size:10px">' + r.name + '</div>';
      h += '<div class="gamma-level-strike">$' + fmtNum(r.strike, 0) + '</div></div>';
      h += '<div class="gamma-bar-bg" style="height:10px;border-radius:5px"><div class="gamma-bar-fill" style="width:' + r.pct + '%;background:' + r.gradient + ';border-radius:5px"></div>';
      h += '<span class="gamma-bar-val" style="color:' + gexColor + (r.gex < 0 ? ';font-weight:600' : '') + '">' + (r.gex !== 0 ? fmtGex(r.gex) : '~0') + '</span></div>';
      h += '</div>';
    });

    // Footer: Spot, Danger (colored), Convexity
    var dangerVal = raw.dangerScore != null ? Math.round(raw.dangerScore * 100) : null;
    var dangerColor = dangerVal != null ? (dangerVal >= 60 ? '#ef4444' : dangerVal >= 30 ? '#eab308' : '#22c55e') : 'var(--text)';
    var convexity = raw.dangerScore != null ? (raw.dangerScore > 0.6 ? 'expanding' : raw.dangerScore > 0.3 ? 'stable' : 'contracting') : '—';
    var convColor = convexity === 'expanding' ? '#eab308' : convexity === 'contracting' ? '#22c55e' : 'var(--text)';

    h += '<div class="gamma-footer">';
    h += '<div>Spot <span>$' + fmtNum(raw.price, 2) + '</span></div>';
    if (dangerVal != null) h += '<div>Danger <span style="color:' + dangerColor + '">' + dangerVal + '/100</span></div>';
    h += '<div>Convexity <span style="color:' + convColor + '">' + convexity + '</span></div>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function buildMiniHeatmap(hmData, raw) {
    var h = '<div class="vcard vcard-full">';
    h += '<div class="scan"></div>';
    h += '<div class="vcard-header">';
    h += '<div class="vcard-title"><span class="vcard-live"></span> SPX Gamma Heatmap</div>';
    if (hmData && hmData.source) {
      h += '<span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">' + hmData.source + '</span>';
    }
    h += '</div>';

    if (!hmData || !hmData.grid || !hmData.grid.length) {
      // Fallback: show simple text-based representation from briefing data
      h += '<div class="heatmap-loading">Heatmap data loading...</div>';
      h += '</div>';
      return h;
    }

    var grid = hmData.grid;
    var strikes = hmData.strikes || [];
    var maxAbs = hmData.maxAbsGEX || 1;
    var flipStrike = hmData.gammaFlip || (raw && raw.gammaFlip) || null;

    // Show up to 7 strikes centered around spot
    var spotIdx = 0;
    var spot = hmData.spotPrice || (raw && raw.price) || 0;
    for (var si = 0; si < strikes.length; si++) {
      if (Math.abs(strikes[si] - spot) < Math.abs(strikes[spotIdx] - spot)) spotIdx = si;
    }
    var startIdx = Math.max(0, spotIdx - 3);
    var endIdx = Math.min(strikes.length, startIdx + 7);
    if (endIdx - startIdx < 7) startIdx = Math.max(0, endIdx - 7);

    var visStrikes = strikes.slice(startIdx, endIdx);
    // Get expirations from hmData.expirations (up to 5)
    var exps = (hmData.expirations || []).slice(0, 5);
    var numCols = exps.length + 1; // +1 for strike label column

    h += '<div class="heatmap-grid" style="grid-template-columns: 70px repeat(' + (numCols - 1) + ', 1fr);">';

    // Header row
    h += '<div class="heatmap-exp-label"></div>';
    exps.forEach(function(exp) {
      var label = exp.date || exp.expiration || '';
      if (label.length > 5) label = label.slice(5); // remove year prefix
      h += '<div class="heatmap-exp-label">' + label + '</div>';
    });

    // Strike rows — grid[i] = { strike, values: [{ net, ... }] }
    visStrikes.forEach(function(strike, rowIdx) {
      var isFlip = flipStrike && Math.abs(strike - flipStrike) < 1;
      h += '<div class="heatmap-strike' + (isFlip ? ' flip' : '') + '">' + strike + (isFlip ? '*' : '') + '</div>';

      var actualRow = startIdx + rowIdx;
      var rowData = grid[actualRow];
      var vals = rowData && rowData.values ? rowData.values : [];
      exps.forEach(function(exp, colIdx) {
        var netGex = 0;
        if (vals[colIdx]) {
          netGex = vals[colIdx].net || 0;
        }
        var intensity = Math.min(Math.abs(netGex) / maxAbs, 1);
        var bg;
        if (netGex > 0) {
          bg = 'rgba(34,197,94,' + (0.2 + intensity * 0.6) + ')';
        } else if (netGex < 0) {
          bg = 'rgba(239,68,68,' + (0.2 + intensity * 0.6) + ')';
        } else {
          bg = 'rgba(100,116,139,0.1)';
        }
        var cellVal = Math.abs(netGex) >= 1000 ? fmtGex(netGex) : (netGex !== 0 ? netGex.toFixed(0) : '—');
        h += '<div class="heatmap-cell" style="background:' + bg + '">' + cellVal + '</div>';
      });
    });

    h += '</div>'; // heatmap-grid

    // Footer with key levels
    h += '<div class="heatmap-footer">';
    if (hmData.callWall) h += '<div>Call Wall <span>$' + fmtNum(hmData.callWall.strike, 0) + '</span></div>';
    if (hmData.putWall) h += '<div>Put Wall <span>$' + fmtNum(hmData.putWall.strike, 0) + '</span></div>';
    if (flipStrike) h += '<div>Flip <span>$' + fmtNum(flipStrike, 0) + '</span></div>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function renderVisualCards(raw, hmData) {
    var el = document.getElementById('briefing-vcards');
    if (!el) return;

    // Build raw from heatmap data if no briefing raw available
    if ((!raw || raw.price == null) && hmData && hmData.spotPrice) {
      raw = {
        price: hmData.spotPrice,
        changePct: 0,
        callWalls: hmData.callWall ? [hmData.callWall.strike] : [],
        putWalls: hmData.putWall ? [hmData.putWall.strike] : [],
        gammaFlip: hmData.gammaFlip || null,
        totalNetGEX: hmData.totalNetGEX || 0,
        regime: (hmData.regime && hmData.regime.label) || 'NEUTRAL',
        regimeScores: hmData.regimeScores || {},
        regimeStability: hmData.stability || null,
        regimeFlickering: false,
        flowDirection: null,
        dangerScore: null,
        expectedMove: null,
        activeEngine: null
      };
    }
    if (!raw || raw.price == null) { el.innerHTML = ''; return; }

    var h = '';
    h += buildLiveSPY(raw);
    h += buildRegimeDetector(raw);
    h += buildSharkEngine(raw);
    h += buildGammaProfile(raw);
    h += buildMiniHeatmap(hmData, raw);
    el.innerHTML = h;
  }

  function showEmpty(msg) {
    document.getElementById('briefing-snapshot').innerHTML = '';
    // Don't clear vcards — they render independently from heatmap data
    document.getElementById('briefing-body').innerHTML =
      '<div class="briefing-empty"><h3>' + msg + '</h3><p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">Briefings are generated automatically at 9:25 AM ET each trading day.</p></div>';
  }

  function render(data, hmData) {
    // Date header
    if (data.generatedAt) {
      var d = new Date(data.generatedAt);
      document.getElementById('briefing-date').textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('briefing-time').textContent = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    var raw = data.rawData || {};

    // Visual cards
    renderVisualCards(raw, hmData);

    // Snapshot cards
    var cards = '';
    if (raw.price != null) {
      var chg = raw.changePct || 0;
      var cls = chg >= 0 ? 'snap-up' : 'snap-down';
      cards += snapCard('SPY', fmtNum(raw.price, 2), (chg >= 0 ? '+' : '') + fmtNum(chg, 2) + '%', cls);
    }
    if (raw.regime) {
      var rcVal = raw.signalQuality ? raw.signalQuality.rc : raw.regimeConfidence;
      var rSub = rcVal != null ? 'RC ' + (typeof rcVal === 'number' ? rcVal.toFixed(2) : rcVal) : '';
      if (raw.regimeFlickering) rSub += ' \\u26a0 flickering';
      cards += snapCard('Regime', raw.regime, rSub, '');
    }
    if (raw.expectedMove != null && !isNaN(Number(raw.expectedMove))) {
      cards += snapCard('Exp Move', '\\u00b1' + fmtNum(raw.expectedMove, 2), '', '');
    }
    if (raw.gammaFlip != null) {
      cards += snapCard('Gamma Flip', fmtNum(raw.gammaFlip, 2), '', '');
    }
    if (raw.totalNetGEX != null) {
      var gCls = raw.totalNetGEX >= 0 ? 'snap-up' : 'snap-down';
      var gVal = (Math.abs(raw.totalNetGEX) >= 1e6) ? (raw.totalNetGEX / 1e6).toFixed(2) + 'M' : (raw.totalNetGEX / 1e3).toFixed(0) + 'K';
      cards += snapCard('Net GEX', gVal, '', gCls);
    }
    if (raw.flowDirection) {
      var fCls = raw.flowDirection.toLowerCase() === 'bullish' ? 'snap-up' : raw.flowDirection.toLowerCase() === 'bearish' ? 'snap-down' : '';
      cards += snapCard('Flow', raw.flowDirection, raw.netFlow != null ? fmtNum(raw.netFlow, 0) : '', fCls);
    }
    if (raw.dangerScore != null) {
      var dVal = Math.round(raw.dangerScore * 100);
      var dCls = dVal >= 70 ? 'snap-down' : dVal >= 40 ? '' : 'snap-up';
      cards += snapCard('Danger', dVal + '/100', '', dCls);
    }
    if (raw.gexVelocity != null) {
      var vCls = raw.gexVelocity >= 0 ? 'snap-up' : 'snap-down';
      cards += snapCard('GEX \\u0394', (raw.gexVelocity >= 0 ? '+' : '') + fmtNum(raw.gexVelocity, 1) + '%', '', vCls);
    }
    if (raw.dataQuality != null) {
      var qCls = raw.dataQuality >= 75 ? 'snap-up' : raw.dataQuality >= 50 ? '' : 'snap-down';
      cards += snapCard('Data', raw.dataQuality + '/100', raw.sourcesAvailable + '/' + raw.sourcesTotal + ' src', qCls);
    }
    if (raw.regimeStability != null) {
      var sCls = raw.regimeStability >= 70 ? 'snap-up' : raw.regimeStability >= 40 ? '' : 'snap-down';
      cards += snapCard('Stability', fmtNum(raw.regimeStability, 0) + '%', '', sCls);
    }
    document.getElementById('briefing-snapshot').innerHTML = cards;

    // Playbook Cards (replaces Billy's Picks)
    var picksEl = document.getElementById('briefing-picks');
    picksEl.innerHTML = buildPlaybookCards(raw.playbooks || []);

    // Commentary
    var body = mdToHtml(data.commentary || '');
    document.getElementById('briefing-body').innerHTML = body;

    // Institutional Layer
    var instEl = document.getElementById('briefing-institutional');
    if (instEl) instEl.innerHTML = buildInstitutionalLayer(raw.institutional || null);

    // Integrity Box
    var intEl = document.getElementById('briefing-integrity');
    if (intEl) intEl.innerHTML = buildIntegrityBox(raw.integrity || null);

    // Re-init lucide icons
    if (window.lucide) lucide.createIcons();
  }

  async function fetchHeatmap() {
    try {
      var headers = {};
      if (window.DASHBOARD_API_KEY) headers['x-api-key'] = window.DASHBOARD_API_KEY;
      var res = await fetch('/api/gex/heatmap/SPY?range=10', { credentials: 'include', headers: headers });
      if (!res.ok) return null;
      return await res.json();
    } catch(e) {
      console.warn('[briefing] heatmap fetch failed:', e.message);
      return null;
    }
  }

  async function load() {
    try {
      var headers = {};
      if (window.DASHBOARD_API_KEY) headers['x-api-key'] = window.DASHBOARD_API_KEY;

      // Fetch briefing only — visual cards are handled by loadVisualCards() using intel
      var briefRes = await fetch('/api/briefing', { credentials: 'include', headers: headers });

      var data = null;
      var hasBriefing = false;
      if (briefRes.ok) {
        data = await briefRes.json();
        if (data && data.commentary && !data.error) hasBriefing = true;
      }

      if (hasBriefing) {
        // Render briefing text + snapshot cards, but NOT visual cards (intel handles those)
        if (data.generatedAt) {
          var d = new Date(data.generatedAt);
          document.getElementById('briefing-date').textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          document.getElementById('briefing-time').textContent = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        var raw = data.rawData || {};
        // Snapshot cards (text row below visual cards)
        var cards = '';
        if (raw.price != null) {
          var chg = raw.changePct || 0;
          var cls = chg >= 0 ? 'snap-up' : 'snap-down';
          cards += snapCard('SPY', fmtNum(raw.price, 2), (chg >= 0 ? '+' : '') + fmtNum(chg, 2) + '%', cls);
        }
        if (raw.regime) {
          var rSub = raw.regimeConfidence != null ? fmtNum(Math.round(raw.regimeConfidence * 100), 0) + '% conf' : '';
          if (raw.regimeFlickering) rSub += ' \\u26a0 flickering';
          cards += snapCard('Regime', raw.regime, rSub, '');
        }
        if (raw.expectedMove != null && !isNaN(Number(raw.expectedMove))) {
          cards += snapCard('Exp Move', '\\u00b1' + fmtNum(raw.expectedMove, 2), '', '');
        }
        if (raw.gammaFlip != null) cards += snapCard('Gamma Flip', fmtNum(raw.gammaFlip, 2), '', '');
        if (raw.totalNetGEX != null) {
          var gCls = raw.totalNetGEX >= 0 ? 'snap-up' : 'snap-down';
          var gVal = (Math.abs(raw.totalNetGEX) >= 1e6) ? (raw.totalNetGEX / 1e6).toFixed(2) + 'M' : (raw.totalNetGEX / 1e3).toFixed(0) + 'K';
          cards += snapCard('Net GEX', gVal, '', gCls);
        }
        if (raw.dangerScore != null) {
          var dVal = Math.round(raw.dangerScore * 100);
          var dCls = dVal >= 70 ? 'snap-down' : dVal >= 40 ? '' : 'snap-up';
          cards += snapCard('Danger', dVal + '/100', '', dCls);
        }
        document.getElementById('briefing-snapshot').innerHTML = cards;

        // Playbook Cards (replaces Billy's Picks)
        var picksEl = document.getElementById('briefing-picks');
        picksEl.innerHTML = buildPlaybookCards(raw.playbooks || []);

        // Commentary
        document.getElementById('briefing-body').innerHTML = mdToHtml(data.commentary || '');

        // Institutional Layer
        var instEl = document.getElementById('briefing-institutional');
        if (instEl) instEl.innerHTML = buildInstitutionalLayer(raw.institutional || null);

        // Integrity Box
        var intEl = document.getElementById('briefing-integrity');
        if (intEl) intEl.innerHTML = buildIntegrityBox(raw.integrity || null);

        if (window.lucide) lucide.createIcons();
        loaded = true;
      } else {
        showEmpty(data && data.error ? data.error : 'No briefing available yet');
      }
    } catch(e) {
      console.error('[briefing]', e);
      showEmpty('Could not load briefing');
    }
  }

  function onBriefingUpdated() { load(); loadVisualCards(); }

  // ── Live visual cards refresh — re-fetch heatmap every 60s for live data ──
  var liveRefreshInterval = null;
  function startLiveRefresh() {
    if (liveRefreshInterval) clearInterval(liveRefreshInterval);
    liveRefreshInterval = setInterval(function() {
      loadVisualCards();
    }, 60000);
  }
  function stopLiveRefresh() {
    if (liveRefreshInterval) { clearInterval(liveRefreshInterval); liveRefreshInterval = null; }
  }

  // ── Polling fallback — re-fetch briefing every 5 min in case socket event was missed ──
  var pollInterval = null;
  function startPoll() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(function() { load(); }, 5 * 60 * 1000);
  }
  function stopPoll() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  // Fetch live intel data from heatmap-intel endpoint (rich real-time data)
  async function fetchIntel() {
    try {
      var headers = {};
      if (window.DASHBOARD_API_KEY) headers['x-api-key'] = window.DASHBOARD_API_KEY;
      var res = await fetch('/api/gex/heatmap-intel/SPY', { credentials: 'include', headers: headers });
      if (!res.ok) return null;
      return await res.json();
    } catch(e) {
      console.warn('[briefing] intel fetch failed:', e.message);
      return null;
    }
  }

  // Map intel response to the raw format visual card builders expect
  function intelToRaw(intel) {
    if (!intel || !intel.spot) return null;
    var bias = intel.regime ? intel.regime.bias : null;
    var flowDir = null;
    if (bias === 'bullish') flowDir = 'Bullish';
    else if (bias === 'bearish') flowDir = 'Bearish';

    // Extract walls — intel overlays has single wall, but may also have details
    var callWalls = [];
    var putWalls = [];
    if (intel.overlays) {
      if (intel.overlays.callWall) callWalls.push(intel.overlays.callWall.strike);
      if (intel.overlays.putWall) putWalls.push(intel.overlays.putWall.strike);
    }

    return {
      price: intel.spot,
      changePct: 0,
      callWalls: callWalls,
      putWalls: putWalls,
      gammaFlip: intel.overlays ? intel.overlays.flipStrike : null,
      totalNetGEX: intel.totalNetGEXVol || 0,
      regime: intel.regime ? intel.regime.label : 'NEUTRAL',
      regimeConfidence: intel.regime ? intel.regime.confidence : null,
      regimeScores: intel.regimeScores || {},
      regimeStability: intel.stability || null,
      regimeFlickering: intel.flickering || false,
      flowDirection: flowDir,
      dangerScore: intel.dangerScore || null,
      expectedMove: null,
      activeEngine: intel.regime ? intel.regime.engine : null
    };
  }

  // Independent visual cards loader — fetches live intel for real-time data
  async function loadVisualCards() {
    try {
      // Fetch live intel + heatmap in parallel
      var [intel, hmData] = await Promise.all([fetchIntel(), fetchHeatmap()]);

      // Use live intel as primary source (real-time), fall back to heatmap
      var raw = intelToRaw(intel);
      if (!raw || raw.price == null) {
        if (hmData && hmData.spotPrice) {
          raw = {
            price: hmData.spotPrice,
            changePct: 0,
            callWalls: hmData.callWall ? [hmData.callWall.strike] : [],
            putWalls: hmData.putWall ? [hmData.putWall.strike] : [],
            gammaFlip: hmData.gammaFlip || null,
            totalNetGEX: hmData.totalNetGEX || 0,
            regime: (hmData.regime && hmData.regime.label) || 'NEUTRAL',
            regimeScores: hmData.regimeScores || {},
            regimeStability: hmData.stability || null,
            regimeFlickering: false,
            flowDirection: null,
            dangerScore: null,
            expectedMove: null,
            activeEngine: null
          };
        }
      }

      var el = document.getElementById('briefing-vcards');
      if (!el || !raw || raw.price == null) return;

      var h = '';
      h += buildLiveSPY(raw);
      h += buildRegimeDetector(raw);
      h += buildSharkEngine(raw);
      h += buildGammaProfile(raw);
      h += buildMiniHeatmap(hmData, raw);
      el.innerHTML = h;
    } catch(e) {
      console.warn('[briefing] visual cards failed:', e.message);
    }
  }

  // Animate confidence bars like landing page — nudge widths by ±2% every 2s
  var confDriftInterval = null;
  function startConfDrift() {
    if (confDriftInterval) clearInterval(confDriftInterval);
    confDriftInterval = setInterval(function() {
      var fills = document.querySelectorAll('#page-briefing .conf-fill');
      fills.forEach(function(f) {
        var w = parseFloat(f.style.width);
        if (isNaN(w)) return;
        var delta = (Math.random() - 0.5) * 4;
        f.style.width = Math.max(10, Math.min(95, w + delta)) + '%';
        f.style.transition = 'width 0.6s ease';
      });
    }, 2000);
  }

  SQ.briefing = {
    init: function() {
      load();
      loadVisualCards();
      startConfDrift();
      startLiveRefresh();
      startPoll();
      if (SQ.socket) {
        SQ.socket.on('briefing:updated', onBriefingUpdated);
        // Re-fetch on reconnect in case we missed events during disconnect
        SQ.socket.on('connect', function() { load(); loadVisualCards(); });
      }
    },
    destroy: function() {
      loaded = false;
      stopLiveRefresh();
      stopPoll();
      if (confDriftInterval) { clearInterval(confDriftInterval); confDriftInterval = null; }
      if (SQ.socket) {
        SQ.socket.off('briefing:updated', onBriefingUpdated);
      }
    }
  };
})();
`;
}

module.exports = { getBriefingPageCSS, getBriefingPageHTML, getBriefingPageJS };
