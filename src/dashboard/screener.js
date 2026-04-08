/**
 * Stock Screener Dashboard — SPA-embeddable exports
 *
 * Two-tab layout: Scanners (signal-based) and Screener (filter-based)
 *
 * Exports:
 *   getScreenerPageCSS()  → scoped CSS for the screener page
 *   getScreenerPageHTML() → HTML fragment for the screener page
 *   getScreenerPageJS()   → client-side JS for the screener page
 */

function getScreenerPageCSS() {
  return `
/* ── Screener page scoped styles ── */
#page-screener { display: none; flex-direction: column; height: 100%; }
#page-screener.active { display: flex; }

/* ── Header ── */
#page-screener .page-header {
  padding: 20px 24px 12px; display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 8px;
}
#page-screener .page-header h2 {
  font-family: var(--font-heading); font-size: 20px; font-weight: 700;
  color: var(--text); margin: 0;
}
#page-screener .pipeline-status {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
}
#page-screener .pipeline-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--green);
  display: inline-block;
}
#page-screener .pipeline-dot.stale { background: var(--red); }

/* ── Tab Bar ── */
#page-screener .screener-tabs {
  display: flex; gap: 4px; padding: 0 24px 12px;
}
#page-screener .screener-tab {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 7px 18px; cursor: pointer; transition: all 0.15s;
}
#page-screener .screener-tab:hover { color: var(--text); }
#page-screener .screener-tab.active {
  color: var(--accent); border-color: var(--accent); background: var(--accent-subtle);
}

/* ── Scanner Controls ── */
#page-screener .scanner-controls {
  display: flex; align-items: center; gap: 10px; padding: 0 24px 12px; flex-wrap: wrap;
}
#page-screener .scanner-controls select,
#page-screener .scanner-controls button {
  font-family: var(--font-mono); font-size: 12px; border-radius: 4px; padding: 6px 12px;
  outline: none; transition: all 0.15s;
}
#page-screener .scanner-controls select {
  background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
  min-width: 260px; cursor: pointer;
}
#page-screener .scanner-controls select:focus { border-color: var(--accent); }
#page-screener .scanner-desc {
  font-family: var(--font-body); font-size: 11px; color: var(--text-muted);
  flex: 1; min-width: 200px;
}
#page-screener .btn-run {
  background: var(--accent); color: #fff; border: none; font-weight: 600;
  cursor: pointer; padding: 7px 20px;
}
#page-screener .btn-run:hover { opacity: 0.9; }
#page-screener .btn-run:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Screener Filter Controls ── */
#page-screener .filter-controls {
  padding: 0 24px 12px; display: flex; flex-direction: column; gap: 8px;
}
#page-screener .filter-rows { display: flex; flex-direction: column; gap: 6px; }
#page-screener .filter-row {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
#page-screener .filter-row select,
#page-screener .filter-row input {
  font-family: var(--font-mono); font-size: 12px;
  background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
  border-radius: 4px; padding: 5px 8px; outline: none;
}
#page-screener .filter-row select:focus,
#page-screener .filter-row input:focus { border-color: var(--accent); }
#page-screener .filter-row select { min-width: 140px; }
#page-screener .filter-row input { width: 100px; }
#page-screener .filter-row .val2 { display: none; }
#page-screener .filter-row.between .val2 { display: inline-block; }
#page-screener .filter-row .between-label {
  display: none; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
}
#page-screener .filter-row.between .between-label { display: inline; }
#page-screener .btn-remove-filter {
  background: none; border: 1px solid var(--border); color: var(--text-muted);
  border-radius: 4px; width: 26px; height: 26px; cursor: pointer;
  font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
#page-screener .btn-remove-filter:hover { color: var(--red); border-color: var(--red); }
#page-screener .filter-actions {
  display: flex; gap: 8px; align-items: center;
}
#page-screener .btn-add-filter {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 6px 14px; cursor: pointer; transition: all 0.15s;
}
#page-screener .btn-add-filter:hover { color: var(--text); border-color: var(--text-muted); }
#page-screener .btn-search {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--accent); color: #fff; border: none;
  border-radius: 4px; padding: 7px 20px; cursor: pointer;
}
#page-screener .btn-search:hover { opacity: 0.9; }
#page-screener .btn-search:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Content Area ── */
#page-screener .screener-content { flex: 1; overflow: auto; padding: 0 24px 24px; }

/* ── Table ── */
#page-screener .screener-tbl-wrap { overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--bg-surface) transparent; }
#page-screener .screener-tbl {
  width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px;
}
#page-screener .screener-tbl th {
  text-align: left; padding: 8px 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; font-size: 10px; font-weight: 600;
  border-bottom: 2px solid var(--border); cursor: pointer; user-select: none;
  white-space: nowrap; position: sticky; top: 0; background: var(--bg);
}
#page-screener .screener-tbl th:hover { color: var(--accent); }
#page-screener .screener-tbl th .sort-arrow { font-size: 9px; margin-left: 3px; }
#page-screener .screener-tbl td {
  padding: 7px 10px; color: var(--text); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
#page-screener .screener-tbl tbody tr { transition: background 0.1s; }
#page-screener .screener-tbl tbody tr:hover td { background: var(--bg-surface); }
#page-screener .screener-tbl .pos { color: var(--green); }
#page-screener .screener-tbl .neg { color: var(--red); }
#page-screener .screener-tbl .ticker-cell {
  color: var(--accent); font-weight: 700; cursor: pointer;
}
#page-screener .screener-tbl .ticker-cell:hover { text-decoration: underline; }
#page-screener .screener-tbl .rank-cell { color: var(--text-muted); font-size: 10px; }
#page-screener .screener-tbl .name-cell {
  color: var(--text-muted); font-family: var(--font-body); font-size: 11px;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis;
}
#page-screener .screener-tbl .signal-cell {
  font-family: var(--font-body); font-size: 11px; font-weight: 600;
  max-width: 200px; overflow: hidden; text-overflow: ellipsis;
}

/* ── Empty / Loading ── */
#page-screener .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; color: var(--text-muted);
  font-family: var(--font-mono); font-size: 12px; text-align: center; gap: 6px;
}
#page-screener .loading-spinner {
  display: flex; align-items: center; justify-content: center;
  padding: 40px; color: var(--accent); font-family: var(--font-mono); font-size: 12px;
  gap: 8px;
}
#page-screener .loading-spinner::before {
  content: ''; width: 16px; height: 16px; border: 2px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: scrSpin 0.8s linear infinite;
}
@keyframes scrSpin { to { transform: rotate(360deg); } }

/* ── Company Detail Panel ── */
#page-screener .company-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 1000; display: none;
  justify-content: flex-end;
}
#page-screener .company-overlay.open { display: flex; }
#page-screener .company-panel {
  width: 420px; max-width: 90vw; background: var(--bg); height: 100%;
  overflow-y: auto; border-left: 1px solid var(--border);
  padding: 24px; box-sizing: border-box;
  animation: scrSlideIn 0.2s ease-out;
}
@keyframes scrSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
#page-screener .company-panel .cp-close {
  float: right; background: none; border: none; color: var(--text-muted);
  font-size: 20px; cursor: pointer; padding: 0; line-height: 1;
}
#page-screener .company-panel .cp-close:hover { color: var(--text); }
#page-screener .company-panel .cp-ticker {
  font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--accent);
  margin-bottom: 2px;
}
#page-screener .company-panel .cp-name {
  font-family: var(--font-body); font-size: 14px; color: var(--text); margin-bottom: 16px;
}
#page-screener .company-panel .cp-section {
  margin-bottom: 16px;
}
#page-screener .company-panel .cp-section-title {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;
}
#page-screener .company-panel .cp-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
#page-screener .company-panel .cp-stat {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 8px 10px;
}
#page-screener .company-panel .cp-stat-label {
  font-family: var(--font-mono); font-size: 9px; text-transform: uppercase;
  color: var(--text-muted); letter-spacing: 0.02em;
}
#page-screener .company-panel .cp-stat-value {
  font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text);
  margin-top: 2px;
}
#page-screener .company-panel .cp-description {
  font-family: var(--font-body); font-size: 12px; color: var(--text-muted);
  line-height: 1.5; max-height: 100px; overflow-y: auto;
}
#page-screener .company-panel .cp-holders-tbl,
#page-screener .company-panel .cp-insiders-tbl {
  width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 10px;
}
#page-screener .company-panel .cp-holders-tbl th,
#page-screener .company-panel .cp-insiders-tbl th {
  text-align: left; padding: 4px 6px; color: var(--text-muted); font-size: 9px;
  text-transform: uppercase; border-bottom: 1px solid var(--border);
}
#page-screener .company-panel .cp-holders-tbl td,
#page-screener .company-panel .cp-insiders-tbl td {
  padding: 4px 6px; color: var(--text); border-bottom: 1px solid var(--border);
}

/* ── Footer Stats ── */
#page-screener .screener-footer {
  padding: 8px 24px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 16px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  #page-screener .scanner-controls { flex-direction: column; align-items: flex-start; }
  #page-screener .scanner-controls select { min-width: 100%; }
  #page-screener .filter-row { flex-wrap: wrap; }
  #page-screener .company-panel { width: 100%; }
}
`;
}

function getScreenerPageHTML() {
  return `<div class="page" id="page-screener">
  <div class="page-header">
    <h2>SharkScan&trade;</h2>
    <div class="pipeline-status">
      <span class="pipeline-dot" id="scrPipelineDot"></span>
      <span id="scrPipelineTime">--</span>
    </div>
  </div>

  <!-- Tab Bar -->
  <div class="screener-tabs" id="scrTabBar">
    <button class="screener-tab active" data-tab="scanners">Scanners</button>
    <button class="screener-tab" data-tab="screener">Screener</button>
  </div>

  <!-- Scanner Controls -->
  <div class="scanner-controls" id="scrScannerControls">
    <select id="scrScannerSelect"><option value="">Loading scanners...</option></select>
    <button class="btn-run" id="scrRunBtn" disabled>Run Scanner</button>
    <div class="scanner-desc" id="scrScannerDesc"></div>
  </div>

  <!-- Screener Filter Controls (hidden by default) -->
  <div class="filter-controls" id="scrFilterControls" style="display:none;">
    <div class="filter-rows" id="scrFilterRows"></div>
    <div class="filter-actions">
      <button class="btn-add-filter" id="scrAddFilter">+ Add Filter</button>
      <button class="btn-search" id="scrSearchBtn">Search</button>
    </div>
  </div>

  <!-- Content -->
  <div class="screener-content" id="scrContent">
    <div class="empty-state">Select a scanner and click Run, or switch to the Screener tab to build custom filters.</div>
  </div>

  <!-- Company Detail Slide-out -->
  <div class="company-overlay" id="scrCompanyOverlay">
    <div class="company-panel" id="scrCompanyPanel">
      <button class="cp-close" id="scrCompanyClose">&times;</button>
      <div id="scrCompanyBody"><div class="loading-spinner">Loading company data...</div></div>
    </div>
  </div>

  <!-- Footer -->
  <div class="screener-footer">
    <span id="scrResultCount">--</span>
    <span id="scrTierInfo"></span>
  </div>
</div>`;
}

function getScreenerPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.screener = (function() {
  'use strict';

  /* ── State ── */
  var activeTab = 'scanners';
  var scanners = [];
  var filterDefs = [];
  var filterRows = [];
  var filterIdCounter = 0;
  var scanResults = [];
  var screenResults = [];
  var sortCol = '';
  var sortAsc = false;
  var activeScannerKey = '';

  /* ── Helpers ── */
  function fmt(v, d) { return v == null || isNaN(v) ? '--' : Number(v).toFixed(d != null ? d : 2); }
  function fmtBig(v) {
    if (v == null || isNaN(v)) return '--';
    var a = Math.abs(v);
    if (a >= 1e12) return (v/1e12).toFixed(2)+'T';
    if (a >= 1e9) return (v/1e9).toFixed(2)+'B';
    if (a >= 1e6) return (v/1e6).toFixed(1)+'M';
    if (a >= 1e3) return (v/1e3).toFixed(0)+'K';
    return fmt(v, 0);
  }
  function fmtPct(v) {
    if (v == null || isNaN(v)) return '--';
    return (v >= 0 ? '+' : '') + Number(v).toFixed(2) + '%';
  }
  function esc(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
  function $(id) { return document.getElementById(id); }

  function apiGet(url) {
    return fetch(url, { credentials: 'same-origin' })
      .then(function(r) { return r.json(); })
      .catch(function(e) { console.error('[screener] GET', url, e); return { error: e.message }; });
  }
  function apiPost(url, body) {
    return fetch(url, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(r) { return r.json(); })
      .catch(function(e) { console.error('[screener] POST', url, e); return { error: e.message }; });
  }

  /* ── Tab Switching ── */
  function switchTab(tab) {
    activeTab = tab;
    var tabs = $('scrTabBar').querySelectorAll('.screener-tab');
    tabs.forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
    $('scrScannerControls').style.display = tab === 'scanners' ? 'flex' : 'none';
    $('scrFilterControls').style.display = tab === 'screener' ? 'flex' : 'none';
    $('scrContent').innerHTML = '<div class="empty-state">' +
      (tab === 'scanners'
        ? 'Select a scanner and click Run to find signals.'
        : 'Add filters and click Search to screen stocks.') +
      '</div>';
    $('scrResultCount').textContent = '--';
  }

  /* ══════════════════════════════════
     SCANNERS TAB
     ══════════════════════════════════ */

  function loadScanners() {
    apiGet('/api/screener/scanners').then(function(data) {
      if (data.error) {
        $('scrScannerSelect').innerHTML = '<option value="">Failed to load scanners</option>';
        return;
      }
      scanners = data.scanners || data || [];
      var sel = $('scrScannerSelect');
      sel.innerHTML = '<option value="">-- Select a Scanner --</option>';
      scanners.forEach(function(s) {
        var opt = document.createElement('option');
        opt.value = s.key;
        opt.textContent = s.name || s.key;
        sel.appendChild(opt);
      });
      $('scrRunBtn').disabled = true;
    });
  }

  function onScannerChange() {
    var key = $('scrScannerSelect').value;
    $('scrRunBtn').disabled = !key;
    var scanner = scanners.find(function(s) { return s.key === key; });
    $('scrScannerDesc').textContent = scanner ? (scanner.description || '') : '';
  }

  function runScanner() {
    var key = $('scrScannerSelect').value;
    if (!key) return;
    activeScannerKey = key;
    sortCol = '';
    sortAsc = false;
    $('scrRunBtn').disabled = true;
    $('scrRunBtn').textContent = 'Running...';
    $('scrContent').innerHTML = '<div class="loading-spinner">Scanning...</div>';

    apiGet('/api/screener/scan/' + encodeURIComponent(key) + '?limit=100').then(function(data) {
      $('scrRunBtn').disabled = false;
      $('scrRunBtn').textContent = 'Run Scanner';
      updatePipelineStatus();
      if (data.error) {
        $('scrContent').innerHTML = '<div class="empty-state">Error: ' + esc(data.error) + '</div>';
        return;
      }
      scanResults = data.results || data.stocks || [];
      renderScanResults();
    });
  }

  function renderScanResults() {
    var content = $('scrContent');
    if (!scanResults || scanResults.length === 0) {
      content.innerHTML = '<div class="empty-state">No results found for this scanner.</div>';
      $('scrResultCount').textContent = '0 results';
      return;
    }

    var rows = sortCol ? sortData(scanResults) : scanResults;
    $('scrResultCount').textContent = rows.length + ' result' + (rows.length !== 1 ? 's' : '');

    /* Detect extra columns from first result */
    var baseCols = ['symbol','ticker','signal','price','name','companyName','change','changesPercentage','volume','marketCap'];
    var extraCols = [];
    var sample = rows[0];
    Object.keys(sample).forEach(function(k) {
      if (baseCols.indexOf(k) === -1 && k.charAt(0) !== '_') extraCols.push(k);
    });

    var cols = [
      { key: '#', label: '#', sortable: false },
      { key: 'symbol', label: 'Ticker' },
      { key: 'signal', label: 'Signal' }
    ];
    /* Insert up to 4 scanner-specific leading cols */
    extraCols.slice(0, 4).forEach(function(k) {
      cols.push({ key: k, label: k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim() });
    });
    cols.push({ key: 'price', label: 'Price' });

    var html = '<div class="screener-tbl-wrap"><table class="screener-tbl"><thead><tr>';
    cols.forEach(function(c) {
      var arrow = '';
      if (c.key === sortCol) arrow = '<span class="sort-arrow">' + (sortAsc ? '\\u25B2' : '\\u25BC') + '</span>';
      var sa = c.sortable !== false ? ' data-sort="' + c.key + '"' : '';
      html += '<th' + sa + '>' + esc(c.label) + arrow + '</th>';
    });
    html += '</tr></thead><tbody>';

    rows.forEach(function(r, i) {
      var ticker = r.symbol || r.ticker || '';
      var price = r.price;
      html += '<tr>';
      html += '<td class="rank-cell">' + (i + 1) + '</td>';
      html += '<td class="ticker-cell" data-ticker="' + esc(ticker) + '">' + esc(ticker) + '</td>';
      html += '<td class="signal-cell">' + esc(r.signal || '--') + '</td>';
      extraCols.slice(0, 4).forEach(function(k) {
        var v = r[k];
        if (typeof v === 'number') {
          var cls = v > 0 ? 'pos' : (v < 0 ? 'neg' : '');
          html += '<td class="' + cls + '">' + fmt(v) + '</td>';
        } else {
          html += '<td>' + esc(v != null ? String(v) : '--') + '</td>';
        }
      });
      html += '<td>' + (price != null ? '$' + fmt(price) : '--') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    content.innerHTML = html;
    bindTableEvents(content, 'scan');
  }

  /* ══════════════════════════════════
     SCREENER TAB
     ══════════════════════════════════ */

  function loadFilterDefs() {
    apiGet('/api/screener/filters').then(function(data) {
      if (data.error) { filterDefs = []; return; }
      filterDefs = data.filters || data || [];
    });
  }

  function addFilterRow() {
    var id = ++filterIdCounter;
    filterRows.push(id);
    renderFilterRows();
  }

  function removeFilterRow(id) {
    filterRows = filterRows.filter(function(r) { return r !== id; });
    renderFilterRows();
  }

  function renderFilterRows() {
    var container = $('scrFilterRows');
    if (!container) return;
    if (filterRows.length === 0) {
      container.innerHTML = '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">No filters added. Click "+ Add Filter" to begin.</div>';
      return;
    }

    /* Group filter defs by category */
    var categories = [];
    var catMap = {};
    filterDefs.forEach(function(f) {
      var cat = f.category || 'General';
      if (!catMap[cat]) { catMap[cat] = []; categories.push(cat); }
      catMap[cat].push(f);
    });

    container.innerHTML = '';
    filterRows.forEach(function(id) {
      var row = document.createElement('div');
      row.className = 'filter-row';
      row.dataset.id = id;

      /* Category select */
      var catSel = '<select class="fr-category" data-id="' + id + '">';
      catSel += '<option value="">Category</option>';
      categories.forEach(function(c) { catSel += '<option value="' + esc(c) + '">' + esc(c) + '</option>'; });
      catSel += '</select>';

      /* Filter select (populated on category change) */
      var fSel = '<select class="fr-filter" data-id="' + id + '"><option value="">Filter</option></select>';

      /* Operator select */
      var opSel = '<select class="fr-op" data-id="' + id + '">';
      opSel += '<option value=">">></option><option value="<"><</option>';
      opSel += '<option value="=">=</option><option value="between">between</option>';
      opSel += '</select>';

      /* Value inputs */
      var val1 = '<input class="fr-val1" data-id="' + id + '" type="text" placeholder="Value" />';
      var btwLabel = '<span class="between-label">and</span>';
      var val2 = '<input class="fr-val2 val2" data-id="' + id + '" type="text" placeholder="Max" />';

      /* Remove button */
      var removeBtn = '<button class="btn-remove-filter" data-id="' + id + '">&times;</button>';

      row.innerHTML = catSel + fSel + opSel + val1 + btwLabel + val2 + removeBtn;
      container.appendChild(row);
    });

    /* Bind category change */
    container.querySelectorAll('.fr-category').forEach(function(sel) {
      sel.addEventListener('change', function() {
        var id = sel.dataset.id;
        var cat = sel.value;
        var fSel = container.querySelector('.fr-filter[data-id="' + id + '"]');
        fSel.innerHTML = '<option value="">Filter</option>';
        if (cat && catMap[cat]) {
          catMap[cat].forEach(function(f) {
            var opt = document.createElement('option');
            opt.value = f.key;
            opt.textContent = f.name || f.key;
            fSel.appendChild(opt);
          });
        }
      });
    });

    /* Bind operator change (show/hide val2) */
    container.querySelectorAll('.fr-op').forEach(function(sel) {
      sel.addEventListener('change', function() {
        var row = sel.closest('.filter-row');
        row.classList.toggle('between', sel.value === 'between');
      });
    });

    /* Bind remove buttons */
    container.querySelectorAll('.btn-remove-filter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        removeFilterRow(parseInt(btn.dataset.id));
      });
    });
  }

  function runScreener() {
    var container = $('scrFilterRows');
    if (!container) return;

    var filters = [];
    container.querySelectorAll('.filter-row').forEach(function(row) {
      var fKey = row.querySelector('.fr-filter').value;
      var op = row.querySelector('.fr-op').value;
      var val1 = row.querySelector('.fr-val1').value.trim();
      var val2 = row.querySelector('.fr-val2').value.trim();
      if (!fKey || !val1) return;
      var entry = { key: fKey, op: op, value: op === 'between' ? [val1, val2] : val1 };
      filters.push(entry);
    });

    if (filters.length === 0) {
      $('scrContent').innerHTML = '<div class="empty-state">Add at least one filter with a value to search.</div>';
      return;
    }

    sortCol = '';
    sortAsc = false;
    $('scrSearchBtn').disabled = true;
    $('scrSearchBtn').textContent = 'Searching...';
    $('scrContent').innerHTML = '<div class="loading-spinner">Screening stocks...</div>';

    apiPost('/api/screener/filter', { filters: filters, limit: 100 }).then(function(data) {
      $('scrSearchBtn').disabled = false;
      $('scrSearchBtn').textContent = 'Search';
      updatePipelineStatus();
      if (data.error) {
        $('scrContent').innerHTML = '<div class="empty-state">Error: ' + esc(data.error) + '</div>';
        return;
      }
      screenResults = data.results || data.stocks || [];
      renderScreenResults();
    });
  }

  function renderScreenResults() {
    var content = $('scrContent');
    if (!screenResults || screenResults.length === 0) {
      content.innerHTML = '<div class="empty-state">No stocks matched your filters.</div>';
      $('scrResultCount').textContent = '0 results';
      return;
    }

    var rows = sortCol ? sortData(screenResults) : screenResults;
    $('scrResultCount').textContent = rows.length + ' result' + (rows.length !== 1 ? 's' : '');

    var cols = [
      { key: '#', label: '#', sortable: false },
      { key: 'symbol', label: 'Ticker' },
      { key: 'name', label: 'Name' },
      { key: 'sector', label: 'Sector' },
      { key: 'price', label: 'Price' },
      { key: 'marketCap', label: 'Mkt Cap' },
      { key: 'pe', label: 'P/E' }
    ];

    /* Detect extra tech filter columns */
    var skipKeys = ['symbol','ticker','name','companyName','sector','industry','price','marketCap','pe','peRatio','_id'];
    var sample = rows[0] || {};
    Object.keys(sample).forEach(function(k) {
      if (skipKeys.indexOf(k) === -1 && k.charAt(0) !== '_') {
        cols.push({ key: k, label: k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim() });
      }
    });

    var html = '<div class="screener-tbl-wrap"><table class="screener-tbl"><thead><tr>';
    cols.forEach(function(c) {
      var arrow = '';
      if (c.key === sortCol) arrow = '<span class="sort-arrow">' + (sortAsc ? '\\u25B2' : '\\u25BC') + '</span>';
      var sa = c.sortable !== false ? ' data-sort="' + c.key + '"' : '';
      html += '<th' + sa + '>' + esc(c.label) + arrow + '</th>';
    });
    html += '</tr></thead><tbody>';

    rows.forEach(function(r, i) {
      var ticker = r.symbol || r.ticker || '';
      html += '<tr>';
      html += '<td class="rank-cell">' + (i + 1) + '</td>';
      html += '<td class="ticker-cell" data-ticker="' + esc(ticker) + '">' + esc(ticker) + '</td>';
      html += '<td class="name-cell">' + esc(r.name || r.companyName || '') + '</td>';
      html += '<td class="name-cell">' + esc(r.sector || '--') + '</td>';
      html += '<td>' + (r.price != null ? '$' + fmt(r.price) : '--') + '</td>';
      html += '<td>' + fmtBig(r.marketCap) + '</td>';
      html += '<td>' + fmt(r.pe || r.peRatio, 1) + '</td>';

      /* Extra columns */
      var extraStartIdx = 7;
      for (var ci = extraStartIdx; ci < cols.length; ci++) {
        var v = r[cols[ci].key];
        if (typeof v === 'number') {
          var cls = v > 0 ? 'pos' : (v < 0 ? 'neg' : '');
          html += '<td class="' + cls + '">' + fmt(v) + '</td>';
        } else {
          html += '<td>' + esc(v != null ? String(v) : '--') + '</td>';
        }
      }
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    content.innerHTML = html;
    bindTableEvents(content, 'screen');
  }

  /* ══════════════════════════════════
     SHARED TABLE LOGIC
     ══════════════════════════════════ */

  function sortData(data) {
    var col = sortCol;
    var asc = sortAsc;
    return data.slice().sort(function(a, b) {
      var av = a[col], bv = b[col];
      if (av == null) av = -Infinity;
      if (bv == null) bv = -Infinity;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
  }

  function bindTableEvents(content, mode) {
    /* Sort headers */
    content.querySelectorAll('th[data-sort]').forEach(function(th) {
      th.addEventListener('click', function() {
        var col = th.dataset.sort;
        if (sortCol === col) { sortAsc = !sortAsc; }
        else { sortCol = col; sortAsc = (col === 'symbol' || col === 'name' || col === 'sector'); }
        if (mode === 'scan') renderScanResults();
        else renderScreenResults();
      });
    });

    /* Ticker clicks → company detail */
    content.querySelectorAll('.ticker-cell').forEach(function(el) {
      el.addEventListener('click', function() {
        var ticker = el.dataset.ticker;
        if (ticker) showCompanyDetail(ticker);
      });
    });
  }

  /* ══════════════════════════════════
     COMPANY DETAIL PANEL
     ══════════════════════════════════ */

  function showCompanyDetail(ticker) {
    var overlay = $('scrCompanyOverlay');
    var body = $('scrCompanyBody');
    overlay.classList.add('open');
    body.innerHTML = '<div class="loading-spinner">Loading ' + esc(ticker) + '...</div>';

    apiGet('/api/screener/company/' + encodeURIComponent(ticker)).then(function(data) {
      if (data.error) {
        body.innerHTML = '<div class="empty-state">Error loading company: ' + esc(data.error) + '</div>';
        return;
      }
      renderCompanyPanel(data);
    });
  }

  function renderCompanyPanel(d) {
    var body = $('scrCompanyBody');
    var ticker = d.symbol || d.ticker || '--';
    var html = '';

    html += '<div class="cp-ticker">' + esc(ticker) + '</div>';
    html += '<div class="cp-name">' + esc(d.name || d.companyName || '') + '</div>';

    /* Key stats */
    html += '<div class="cp-section"><div class="cp-section-title">Key Statistics</div><div class="cp-grid">';
    var stats = [
      ['Sector', d.sector || '--'],
      ['Industry', d.industry || '--'],
      ['Mkt Cap', fmtBig(d.marketCap)],
      ['Price', d.price != null ? '$' + fmt(d.price) : '--'],
      ['P/E', fmt(d.pe || d.peRatio, 1)],
      ['EPS', d.eps != null ? '$' + fmt(d.eps) : '--'],
      ['52W High', d.yearHigh != null ? '$' + fmt(d.yearHigh) : '--'],
      ['52W Low', d.yearLow != null ? '$' + fmt(d.yearLow) : '--'],
      ['Avg Vol', fmtBig(d.avgVolume || d.volAvg)],
      ['Div Yield', d.dividendYield != null ? fmt(d.dividendYield * 100, 1) + '%' : '--']
    ];
    stats.forEach(function(s) {
      html += '<div class="cp-stat"><div class="cp-stat-label">' + esc(s[0]) + '</div><div class="cp-stat-value">' + esc(s[1]) + '</div></div>';
    });
    html += '</div></div>';

    /* Description */
    if (d.description) {
      html += '<div class="cp-section"><div class="cp-section-title">Description</div>';
      html += '<div class="cp-description">' + esc(d.description) + '</div></div>';
    }

    /* Top Holders */
    if (d.holders && d.holders.length > 0) {
      html += '<div class="cp-section"><div class="cp-section-title">Top Holders</div>';
      html += '<table class="cp-holders-tbl"><thead><tr><th>Holder</th><th>Shares</th><th>%</th></tr></thead><tbody>';
      d.holders.slice(0, 5).forEach(function(h) {
        html += '<tr><td>' + esc(h.holder || h.name || '--') + '</td>'
          + '<td>' + fmtBig(h.shares) + '</td>'
          + '<td>' + fmt(h.weight || h.percentage, 1) + '%</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    /* Recent Insiders */
    if (d.insiders && d.insiders.length > 0) {
      html += '<div class="cp-section"><div class="cp-section-title">Recent Insider Activity</div>';
      html += '<table class="cp-insiders-tbl"><thead><tr><th>Name</th><th>Type</th><th>Shares</th><th>Date</th></tr></thead><tbody>';
      d.insiders.slice(0, 5).forEach(function(ins) {
        html += '<tr><td>' + esc(ins.name || ins.reportingName || '--') + '</td>'
          + '<td>' + esc(ins.transactionType || ins.type || '--') + '</td>'
          + '<td>' + fmtBig(ins.securitiesTransacted || ins.shares) + '</td>'
          + '<td>' + esc(ins.filingDate || ins.date || '--') + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    body.innerHTML = html;
  }

  function closeCompanyPanel() {
    $('scrCompanyOverlay').classList.remove('open');
  }

  /* ══════════════════════════════════
     PIPELINE STATUS
     ══════════════════════════════════ */

  function updatePipelineStatus() {
    var now = new Date();
    $('scrPipelineTime').textContent = 'Updated ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    $('scrPipelineDot').classList.remove('stale');
  }

  /* ══════════════════════════════════
     TIER INFO
     ══════════════════════════════════ */

  function updateTierInfo() {
    var tier = (window.SQ && window.SQ.userTier) || 'none';
    var el = $('scrTierInfo');
    if (el) {
      var label = tier === 'pro' ? 'PRO' : tier === 'core' ? 'CORE' : 'FREE';
      el.textContent = 'Tier: ' + label;
    }
  }

  /* ══════════════════════════════════
     INIT / DESTROY
     ══════════════════════════════════ */

  function bindGlobalEvents() {
    /* Tab switching */
    $('scrTabBar').querySelectorAll('.screener-tab').forEach(function(tab) {
      tab.addEventListener('click', function() { switchTab(tab.dataset.tab); });
    });

    /* Scanner controls */
    $('scrScannerSelect').addEventListener('change', onScannerChange);
    $('scrRunBtn').addEventListener('click', runScanner);

    /* Screener controls */
    $('scrAddFilter').addEventListener('click', addFilterRow);
    $('scrSearchBtn').addEventListener('click', runScreener);

    /* Company panel close */
    $('scrCompanyClose').addEventListener('click', closeCompanyPanel);
    $('scrCompanyOverlay').addEventListener('click', function(e) {
      if (e.target === $('scrCompanyOverlay')) closeCompanyPanel();
    });
  }

  function init() {
    bindGlobalEvents();
    loadScanners();
    loadFilterDefs();
    updateTierInfo();
  }

  function destroy() {
    scanners = [];
    filterDefs = [];
    filterRows = [];
    filterIdCounter = 0;
    scanResults = [];
    screenResults = [];
    sortCol = '';
    sortAsc = false;
    activeScannerKey = '';
    activeTab = 'scanners';
    closeCompanyPanel();
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getScreenerPageCSS, getScreenerPageHTML, getScreenerPageJS };
