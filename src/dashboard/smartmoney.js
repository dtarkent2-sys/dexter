/**
 * Smart Money Dashboard — SPA-embeddable exports
 *
 * Exports:
 *   getSmartMoneyPageCSS()  → scoped CSS for the smartmoney page
 *   getSmartMoneyPageHTML() → HTML fragment for the smartmoney page
 *   getSmartMoneyPageJS()   → client-side JS for the smartmoney page
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * SPA-embeddable exports: getSmartMoneyPageCSS / getSmartMoneyPageHTML / getSmartMoneyPageJS
 * ────────────────────────────────────────────────────────────────────────── */

function getSmartMoneyPageCSS() {
  return `
/* ── Smart Money page scoped styles ── */
#page-smartmoney .page-header { padding: 20px 24px 12px; }
#page-smartmoney .page-header h2 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
#page-smartmoney .page-header .subtitle { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }

/* ── Search Bar ── */
#page-smartmoney .search-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 0 24px 8px;
}
#page-smartmoney .search-bar input {
  font-family: var(--font-mono); font-size: 14px; font-weight: 600;
  background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
  border-radius: 3px; padding: 8px 14px; outline: none; width: 200px;
  text-transform: uppercase;
}
#page-smartmoney .search-bar input:focus { border-color: var(--accent); }
#page-smartmoney .search-bar input::placeholder { color: var(--text-muted); text-transform: none; }
#page-smartmoney .search-bar button {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--accent);
  border-radius: 3px; padding: 8px 16px; cursor: pointer; transition: all 0.15s;
  text-transform: uppercase; letter-spacing: 0.02em;
}
#page-smartmoney .search-bar button:hover { background: var(--accent); color: var(--bg); }

/* ── Recent Chips ── */
#page-smartmoney .recent-chips {
  display: flex; align-items: center; gap: 6px;
  padding: 0 24px 12px; flex-wrap: wrap;
}
#page-smartmoney .recent-chips .chip-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; margin-right: 2px;
}
#page-smartmoney .recent-chip {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 10px; cursor: pointer; transition: all 0.15s;
}
#page-smartmoney .recent-chip:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-subtle); }

/* ── Grid Layout ── */
#page-smartmoney .sm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px 24px;
  overflow-y: auto; flex: 1;
}
#page-smartmoney .sm-grid .card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; display: flex; flex-direction: column; gap: 8px;
}
#page-smartmoney .sm-grid .card-title {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px;
}
#page-smartmoney .full-width { grid-column: 1 / -1; }

/* ── Dark Pool Volume Bars ── */
#page-smartmoney .dp-stat {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono); font-size: 12px; padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
#page-smartmoney .dp-stat-label { color: var(--text-muted); }
#page-smartmoney .dp-stat-value { color: var(--text); font-weight: 600; }
#page-smartmoney .dp-bar-wrap {
  width: 100%; height: 8px; background: var(--bg-surface-hover); border-radius: 4px;
  overflow: hidden; margin-top: 6px;
}
#page-smartmoney .dp-bar {
  height: 100%; border-radius: 4px; background: var(--accent);
  transition: width 0.5s ease;
}

/* ── Short Interest / Squeeze Score ── */
#page-smartmoney .si-stat {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono); font-size: 12px; padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
#page-smartmoney .si-stat-label { color: var(--text-muted); }
#page-smartmoney .si-stat-value { color: var(--text); font-weight: 600; }
#page-smartmoney .squeeze-wrap {
  margin-top: 8px;
}
#page-smartmoney .squeeze-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px;
}
#page-smartmoney .squeeze-bar-bg {
  width: 100%; height: 10px; background: var(--bg-surface-hover); border-radius: 5px;
  overflow: hidden; position: relative;
}
#page-smartmoney .squeeze-bar-fill {
  height: 100%; border-radius: 5px; transition: width 0.5s ease;
}
#page-smartmoney .squeeze-score-val {
  font-family: var(--font-mono); font-size: 16px; font-weight: 700;
  margin-top: 4px;
}

/* ── Setup / Not Configured Card ── */
#page-smartmoney .setup-card {
  background: var(--bg-surface); border: 1px dashed var(--border); border-radius: 3px;
  padding: 20px; text-align: center;
}
#page-smartmoney .setup-card .setup-title {
  font-family: var(--font-mono); font-size: 13px; font-weight: 600;
  color: var(--yellow); margin-bottom: 6px;
}
#page-smartmoney .setup-card .setup-desc {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  line-height: 1.5;
}

/* ── Tables ── */
#page-smartmoney .sm-tbl-wrap {
  overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--bg-surface-hover) transparent;
}
#page-smartmoney .sm-tbl {
  width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px;
}
#page-smartmoney .sm-tbl th {
  text-align: left; padding: 6px 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; font-size: 10px; font-weight: 600;
  border-bottom: 1px solid var(--border);
}
#page-smartmoney .sm-tbl td {
  padding: 6px 10px; color: var(--text); border-bottom: 1px solid var(--border);
}
#page-smartmoney .sm-tbl tr:hover td { background: var(--bg-surface); }

/* ── Buy / Sell color coding ── */
#page-smartmoney .trade-buy { color: var(--green); font-weight: 600; }
#page-smartmoney .trade-sell { color: var(--red); font-weight: 600; }

/* ── Filing Type Badges ── */
#page-smartmoney .filing-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 3px; text-transform: uppercase;
  letter-spacing: 0.5px; display: inline-block;
}
#page-smartmoney .filing-badge.f-10k { color: var(--accent); background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.2); }
#page-smartmoney .filing-badge.f-10q { color: var(--accent); background: rgba(139,126,200,0.1); border: 1px solid rgba(139,126,200,0.2); }
#page-smartmoney .filing-badge.f-8k { color: var(--yellow); background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); }
#page-smartmoney .filing-badge.f-4 { color: var(--green); background: rgba(78,201,160,0.1); border: 1px solid rgba(78,201,160,0.2); }
#page-smartmoney .filing-badge.f-sc13 { color: var(--red); background: rgba(224,122,132,0.1); border: 1px solid rgba(224,122,132,0.2); }
#page-smartmoney .filing-badge.f-other { color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border); }

/* ── Filing links ── */
#page-smartmoney .filing-link {
  color: var(--accent); text-decoration: none; font-size: 11px;
}
#page-smartmoney .filing-link:hover { text-decoration: underline; }

/* ── Whales stat cards ── */
#page-smartmoney .whale-stat {
  background: var(--bg-surface); border-radius: 3px; padding: 10px;
  display: flex; flex-direction: column; gap: 4px;
}
#page-smartmoney .whale-stat-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em;
}
#page-smartmoney .whale-stat-value {
  font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--text);
}
#page-smartmoney .whale-stats-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}

/* ── Empty / Loading States ── */
#page-smartmoney .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px; color: var(--text-muted);
  font-family: var(--font-mono); font-size: 12px; text-align: center; gap: 6px;
}
#page-smartmoney .empty-icon { font-size: 28px; opacity: 0.3; }
#page-smartmoney .panel-loading {
  display: flex; align-items: center; justify-content: center;
  padding: 30px; color: var(--accent); font-family: var(--font-mono); font-size: 12px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  #page-smartmoney .sm-grid { grid-template-columns: 1fr; }
  #page-smartmoney .full-width { grid-column: 1; }
}
@media (max-width: 600px) {
  #page-smartmoney .search-bar input { width: 140px; }
}
`;
}

function getSmartMoneyPageHTML() {
  return `<div class="page" id="page-smartmoney">
  <div class="page-header"><div><h2>SharkMoney&trade;</h2><div class="subtitle">Follow the institutional flow</div></div></div>

  <!-- Search Bar -->
  <div class="search-bar">
    <input type="text" id="smTickerInput" placeholder="Enter ticker..." maxlength="10" />
    <button id="smSearchBtn">Search</button>
  </div>
  <div class="recent-chips" id="smRecentChips">
    <span class="chip-label">Recent:</span>
  </div>

  <!-- Grid Layout -->
  <div class="sm-grid">

    <!-- Dark Pool -->
    <div class="card" id="smDarkPoolCard">
      <div class="card-title">Dark Pool Activity</div>
      <div id="smDarkPoolContent">
        <div class="empty-state" id="smDarkPoolEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>Search a ticker to see dark pool data</div>
        </div>
      </div>
    </div>

    <!-- Short Interest -->
    <div class="card" id="smShortCard">
      <div class="card-title">Short Interest</div>
      <div id="smShortContent">
        <div class="empty-state" id="smShortEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>Short interest data appears here</div>
        </div>
      </div>
    </div>

    <!-- FTDs -->
    <div class="card full-width" id="smFtdCard">
      <div class="card-title">Failures to Deliver (FTD)</div>
      <div id="smFtdContent">
        <div class="empty-state" id="smFtdEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>FTD data appears here</div>
        </div>
      </div>
    </div>

    <!-- Insider Trades -->
    <div class="card full-width" id="smInsiderCard">
      <div class="card-title">Insider Trades</div>
      <div id="smInsiderContent">
        <div class="empty-state" id="smInsiderEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>Insider trading activity appears here</div>
        </div>
      </div>
    </div>

    <!-- Congress Trades -->
    <div class="card full-width" id="smCongressCard">
      <div class="card-title">Congress Trades</div>
      <div id="smCongressContent">
        <div class="empty-state" id="smCongressEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>Congressional trading activity appears here</div>
        </div>
      </div>
    </div>

    <!-- SEC Filings -->
    <div class="card" id="smFilingsCard">
      <div class="card-title">SEC Filings</div>
      <div id="smFilingsContent">
        <div class="empty-state" id="smFilingsEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>SEC filings appear here</div>
        </div>
      </div>
    </div>

    <!-- Whales Intelligence -->
    <div class="card" id="smWhalesCard">
      <div class="card-title">Whales Intelligence</div>
      <div id="smWhalesContent">
        <div class="empty-state" id="smWhalesEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>Analyst &amp; financial intel appears here</div>
        </div>
      </div>
    </div>

  </div>
</div>`;
}

function getSmartMoneyPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.smartmoney = (function() {
  'use strict';

  // ── State ──
  var currentTicker = null;
  var abortController = null;

  // ── DOM refs ──
  var $input, $searchBtn, $recentChips;
  var $darkPoolContent, $shortContent, $ftdContent;
  var $insiderContent, $congressContent, $filingsContent, $whalesContent;

  function cacheDom() {
    $input = document.getElementById('smTickerInput');
    $searchBtn = document.getElementById('smSearchBtn');
    $recentChips = document.getElementById('smRecentChips');
    $darkPoolContent = document.getElementById('smDarkPoolContent');
    $shortContent = document.getElementById('smShortContent');
    $ftdContent = document.getElementById('smFtdContent');
    $insiderContent = document.getElementById('smInsiderContent');
    $congressContent = document.getElementById('smCongressContent');
    $filingsContent = document.getElementById('smFilingsContent');
    $whalesContent = document.getElementById('smWhalesContent');
  }

  // ── Formatting helpers ──
  function fmt(v, decimals) {
    if (v == null || isNaN(v)) return '--';
    return Number(v).toFixed(decimals != null ? decimals : 2);
  }

  function fmtBig(v) {
    if (v == null || isNaN(v)) return '--';
    var abs = Math.abs(v);
    if (abs >= 1e12) return (v / 1e12).toFixed(2) + 'T';
    if (abs >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return fmt(v, 0);
  }

  function fmtPct(v) {
    if (v == null || isNaN(v)) return '--';
    return Number(v).toFixed(2) + '%';
  }

  function fmtDate(d) {
    if (!d) return '--';
    try {
      var dt = new Date(d);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch(e) { return d; }
  }

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showLoading(el) {
    el.innerHTML = '<div class="panel-loading">Loading...</div>';
  }

  function showError(el, msg) {
    el.innerHTML = '<div class="empty-state"><div>' + escHtml(msg || 'Error loading data') + '</div></div>';
  }

  // ── Recent tickers ──
  function getRecents() {
    try { return JSON.parse(localStorage.getItem('smartmoney_recents') || '[]'); } catch(e) { return []; }
  }

  function addRecent(ticker) {
    var recents = getRecents().filter(function(t) { return t !== ticker; });
    recents.unshift(ticker);
    if (recents.length > 8) recents.length = 8;
    localStorage.setItem('smartmoney_recents', JSON.stringify(recents));
    localStorage.setItem('smartmoney_last_ticker', ticker);
    renderRecents();
  }

  function renderRecents() {
    if (!$recentChips) return;
    var recents = getRecents();
    var html = '<span class="chip-label">Recent:</span>';
    for (var i = 0; i < recents.length; i++) {
      html += '<span class="recent-chip" data-ticker="' + escHtml(recents[i]) + '">' + escHtml(recents[i]) + '</span>';
    }
    $recentChips.innerHTML = html;
    $recentChips.querySelectorAll('.recent-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var t = chip.dataset.ticker;
        if (t) { $input.value = t; loadTicker(t); }
      });
    });
  }

  // ── Load ticker ──
  function loadTicker(ticker) {
    ticker = ticker.trim().toUpperCase();
    if (!ticker) return;
    currentTicker = ticker;
    addRecent(ticker);
    $input.value = ticker;

    // Show loading on all panels
    showLoading($darkPoolContent);
    showLoading($shortContent);
    showLoading($ftdContent);
    showLoading($insiderContent);
    showLoading($congressContent);
    showLoading($filingsContent);
    showLoading($whalesContent);

    var enc = encodeURIComponent(ticker);

    // Batch 1: non-AInvest endpoints + whales (whales serializes AInvest calls internally)
    Promise.allSettled([
      fetch('/api/smartmoney/darkpool/' + enc).then(function(r) { return r.json(); }),
      fetch('/api/smartmoney/short/' + enc).then(function(r) { return r.json(); }),
      fetch('/api/smartmoney/ftd/' + enc).then(function(r) { return r.json(); }),
      fetch('/api/smartmoney/insider/' + enc).then(function(r) { return r.json(); }),
      fetch('/api/smartmoney/filings/' + enc).then(function(r) { return r.json(); }),
      fetch('/api/smartmoney/whales/' + enc).then(function(r) { return r.json(); })
    ]).then(function(results) {
      if (currentTicker !== ticker) return;

      var darkpool = results[0].status === 'fulfilled' ? results[0].value : null;
      var short_ = results[1].status === 'fulfilled' ? results[1].value : null;
      var ftd = results[2].status === 'fulfilled' ? results[2].value : null;
      var insider = results[3].status === 'fulfilled' ? results[3].value : null;
      var filings = results[4].status === 'fulfilled' ? results[4].value : null;
      var whales = results[5].status === 'fulfilled' ? results[5].value : null;

      renderDarkPool(darkpool);
      renderShort(short_);
      renderFTD(ftd);
      renderInsider(insider);
      renderFilings(filings);
      renderWhales(whales);

      // Batch 2: congress after whales completes (avoids AInvest rate limit collision)
      fetch('/api/smartmoney/congress/' + enc).then(function(r) { return r.json(); })
        .then(function(congress) { if (currentTicker === ticker) renderCongress(congress); })
        .catch(function() { renderCongress(null); });
    });
  }

  // ── Render: Dark Pool ──
  function renderDarkPool(data) {
    if (!data) { showError($darkPoolContent, 'Could not load dark pool data'); return; }
    if (data.error) { showError($darkPoolContent, data.error); return; }

    var dp = data.darkPool || {};
    var sv = data.shortVolume || {};
    var html = '';

    // Off-exchange (TRF) volume
    if (dp.totalVolume != null && dp.totalVolume > 0) {
      html += '<div class="dp-stat"><span class="dp-stat-label">' + escHtml(dp.label || 'Off-Exchange Volume') + '</span><span class="dp-stat-value">' + fmtBig(dp.totalVolume) + '</span></div>';
      if (dp.date) {
        html += '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-bottom:8px">' + escHtml(dp.date) + '</div>';
      }
    }

    // Short sale volume from dark pool response
    if (dp.shortVolume != null && dp.shortVolume > 0) {
      html += '<div class="dp-stat"><span class="dp-stat-label">Short Sale Volume</span><span class="dp-stat-value">' + fmtBig(dp.shortVolume) + '</span></div>';
    }
    if (dp.shortPercent != null && dp.shortPercent > 0) {
      var sp = dp.shortPercent;
      var spColor = sp > 50 ? 'var(--red)' : sp > 40 ? 'var(--yellow)' : 'var(--text)';
      html += '<div class="dp-stat"><span class="dp-stat-label">Short Volume %</span><span class="dp-stat-value" style="color:' + spColor + '">' + fmtPct(sp) + '</span></div>';
      html += '<div class="dp-bar-wrap"><div class="dp-bar" style="width:' + Math.min(sp, 100) + '%;background:' + spColor + '"></div></div>';
    }

    // Short volume daily trend
    if (sv && sv.days && sv.days.length > 0) {
      html += '<div style="margin-top:10px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);margin-bottom:4px">DAILY SHORT VOLUME TREND</div>';
      html += '<div class="sm-tbl-wrap"><table class="sm-tbl"><thead><tr><th>Date</th><th>Short Vol</th><th>Total Vol</th><th>Short %</th></tr></thead><tbody>';
      var limit = Math.min(sv.days.length, 7);
      for (var i = 0; i < limit; i++) {
        var d = sv.days[i];
        var pct = parseFloat(d.shortPct || 0);
        var pctColor = pct > 50 ? 'var(--red)' : pct > 40 ? 'var(--yellow)' : 'var(--text)';
        html += '<tr><td>' + escHtml(d.date) + '</td><td>' + fmtBig(d.shortVolume) + '</td><td>' + fmtBig(d.totalVolume) + '</td><td style="color:' + pctColor + '">' + fmtPct(pct) + '</td></tr>';
      }
      html += '</tbody></table></div>';
    }

    if (!html) { showError($darkPoolContent, 'No dark pool data available'); return; }
    $darkPoolContent.innerHTML = html;
  }

  // ── Render: Short Interest ──
  function renderShort(data) {
    if (!data) { showError($shortContent, 'Could not load short interest data'); return; }
    if (data.error) { showError($shortContent, data.error); return; }

    var html = '';

    if (data.shortInterest != null || data.shortPercent != null || data.shortPercentOfFloat != null) {
      var si = data.shortInterest || data.shortPercent || data.shortPercentOfFloat;
      html += '<div class="si-stat"><span class="si-stat-label">Short Interest %</span><span class="si-stat-value" style="color:' + (si > 20 ? 'var(--red)' : si > 10 ? 'var(--yellow)' : 'var(--text)') + '">' + fmtPct(si) + '</span></div>';
    }

    if (data.sharesShort != null) {
      html += '<div class="si-stat"><span class="si-stat-label">Shares Short</span><span class="si-stat-value">' + fmtBig(data.sharesShort) + '</span></div>';
    }

    // Show float data even when short interest isn't available
    if (data.floatShares != null && data.floatShares > 0) {
      html += '<div class="si-stat"><span class="si-stat-label">Float Shares</span><span class="si-stat-value">' + fmtBig(data.floatShares) + '</span></div>';
    }
    if (data.outstandingShares != null && data.outstandingShares > 0) {
      html += '<div class="si-stat"><span class="si-stat-label">Outstanding Shares</span><span class="si-stat-value">' + fmtBig(data.outstandingShares) + '</span></div>';
    }
    if (data.freeFloat != null && data.freeFloat > 0) {
      html += '<div class="si-stat"><span class="si-stat-label">Free Float %</span><span class="si-stat-value">' + fmtPct(data.freeFloat) + '</span></div>';
    }

    if (data.daysToCover != null || data.daysTocover != null) {
      var dtc = data.daysToCover || data.daysTocover;
      html += '<div class="si-stat"><span class="si-stat-label">Days to Cover</span><span class="si-stat-value">' + fmt(dtc, 1) + '</span></div>';
    }

    if (data.shortRatio != null) {
      html += '<div class="si-stat"><span class="si-stat-label">Short Ratio</span><span class="si-stat-value">' + fmt(data.shortRatio, 2) + '</span></div>';
    }

    // Squeeze score
    var squeeze = data.squeezeScore != null ? data.squeezeScore : null;
    if (squeeze != null) {
      var squeezeColor = squeeze >= 70 ? 'var(--red)' : squeeze >= 40 ? 'var(--yellow)' : 'var(--green)';
      html += '<div class="squeeze-wrap">'
        + '<div class="squeeze-label">Squeeze Score</div>'
        + '<div class="squeeze-bar-bg"><div class="squeeze-bar-fill" style="width:' + Math.min(squeeze, 100) + '%;background:' + squeezeColor + '"></div></div>'
        + '<div class="squeeze-score-val" style="color:' + squeezeColor + '">' + fmt(squeeze, 0) + ' / 100</div>'
        + '</div>';
    }

    if (!html) { showError($shortContent, 'No short interest data available'); return; }
    $shortContent.innerHTML = html;
  }

  // ── Render: FTDs ──
  function renderFTD(data) {
    if (!data) { showError($ftdContent, 'Could not load FTD data'); return; }
    if (data.error) { showError($ftdContent, data.error); return; }

    var ftds = data.ftd || data.ftds || [];
    if (!ftds.length) { showError($ftdContent, 'No FTD data available'); return; }

    // Sort by date descending
    ftds.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    var html = '<div class="sm-tbl-wrap"><table class="sm-tbl"><thead><tr>'
      + '<th>Date</th><th>Shares</th><th>Dollar Value</th>'
      + '</tr></thead><tbody>';

    var limit = Math.min(ftds.length, 30);
    for (var i = 0; i < limit; i++) {
      var f = ftds[i];
      var dollarVal = (f.price && f.quantity) ? f.price * f.quantity : (f.value || f.dollarValue || null);
      html += '<tr>'
        + '<td>' + fmtDate(f.date) + '</td>'
        + '<td>' + fmtBig(f.quantity || f.shares || f.failureToDeliver) + '</td>'
        + '<td>' + (dollarVal != null ? '$' + fmtBig(dollarVal) : '--') + '</td>'
        + '</tr>';
    }
    html += '</tbody></table></div>';
    $ftdContent.innerHTML = html;
  }

  // ── Render: Insider Trades ──
  function renderInsider(data) {
    if (!data) { showError($insiderContent, 'Could not load insider data'); return; }
    if (data.error) { showError($insiderContent, data.error); return; }

    var trades = data.insider || [];
    if (!trades.length) { showError($insiderContent, 'No insider trades found'); return; }

    var html = '<div class="sm-tbl-wrap"><table class="sm-tbl"><thead><tr>'
      + '<th>Name / Title</th><th>Type</th><th>Shares</th><th>Value</th><th>Date</th>'
      + '</tr></thead><tbody>';

    var limit = Math.min(trades.length, 30);
    for (var i = 0; i < limit; i++) {
      var t = trades[i];
      var typeStr = (t.type || t.trade_type || t.direction || '').toLowerCase();
      var isBuy = typeStr.indexOf('buy') !== -1 || typeStr.indexOf('purchase') !== -1;
      var typeClass = isBuy ? 'trade-buy' : 'trade-sell';
      var typeLabel = isBuy ? 'Buy' : 'Sell';
      var titleStr = t.title || t.position || t.typeOfOwner || '';
      var sharesVal = t.shares || t.securitiesTransacted || Math.abs(t.shares_chg || 0);
      html += '<tr>'
        + '<td>' + escHtml(t.name || t.reportingName || '--') + (titleStr ? '<br><span style="color:var(--text-muted);font-size:10px">' + escHtml(titleStr) + '</span>' : '') + '</td>'
        + '<td class="' + typeClass + '">' + typeLabel + '</td>'
        + '<td>' + fmtBig(sharesVal) + '</td>'
        + '<td>' + (t.value != null ? '$' + fmtBig(t.value) : t.price != null ? '$' + fmt(t.price) : '--') + '</td>'
        + '<td>' + fmtDate(t.date || t.trade_date || t.filingDate || t.filing_date || t.transactionDate) + '</td>'
        + '</tr>';
    }
    html += '</tbody></table></div>';
    if (data.source) {
      html += '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-top:6px">Source: ' + escHtml(data.source) + '</div>';
    }
    $insiderContent.innerHTML = html;
  }

  // ── Render: Congress Trades ──
  function renderCongress(data) {
    if (!data) { showError($congressContent, 'Could not load congress data'); return; }
    if (data.error) { showError($congressContent, data.error); return; }

    var trades = data.congress || [];
    if (!trades.length) {
      $congressContent.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px">'
        + '<div style="font-size:28px;margin-bottom:8px">🏛️</div>'
        + 'No recent congressional trades reported for <b>' + escHtml(currentTicker) + '</b>'
        + '<div style="margin-top:6px;font-size:11px">Congress members may not hold or trade this stock</div></div>';
      return;
    }

    var html = '<div class="sm-tbl-wrap"><table class="sm-tbl"><thead><tr>'
      + '<th>Member</th><th>Type</th><th>Amount Range</th><th>Date</th><th>Ticker</th>'
      + '</tr></thead><tbody>';

    var limit = Math.min(trades.length, 30);
    for (var i = 0; i < limit; i++) {
      var t = trades[i];
      var cType = (t.type || t.trade_type || '').toLowerCase();
      var isBuy = cType.indexOf('purchase') !== -1 || cType.indexOf('buy') !== -1;
      var typeClass = isBuy ? 'trade-buy' : 'trade-sell';
      var typeLabel = isBuy ? 'Buy' : 'Sell';
      var memberInfo = escHtml(t.member || t.name || t.representative || t.senator || '--');
      if (t.party || t.state) {
        memberInfo += '<br><span style="color:var(--text-muted);font-size:10px">' + escHtml((t.party || '') + (t.state ? ' — ' + t.state : '')) + '</span>';
      }
      html += '<tr>'
        + '<td>' + memberInfo + '</td>'
        + '<td class="' + typeClass + '">' + typeLabel + '</td>'
        + '<td>' + escHtml(t.amount || t.amountRange || t.size || '--') + '</td>'
        + '<td>' + fmtDate(t.date || t.trade_date || t.transactionDate || t.filing_date) + '</td>'
        + '<td style="color:var(--accent);font-weight:700">' + escHtml(t.ticker || t.asset || currentTicker) + '</td>'
        + '</tr>';
    }
    html += '</tbody></table></div>';
    if (data.source) {
      html += '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-top:6px">Source: ' + escHtml(data.source) + '</div>';
    }
    $congressContent.innerHTML = html;
  }

  // ── Render: SEC Filings ──
  function renderFilings(data) {
    if (!data) { showError($filingsContent, 'Could not load filings data'); return; }
    if (data.error) { showError($filingsContent, data.error); return; }

    var filings = data.filings || [];
    if (!filings.length) { showError($filingsContent, 'No SEC filings found'); return; }

    var html = '';
    var limit = Math.min(filings.length, 20);
    for (var i = 0; i < limit; i++) {
      var f = filings[i];
      var ftype = (f.form || f.type || f.formType || '').toUpperCase();
      var badgeClass = 'f-other';
      if (ftype.indexOf('10-K') !== -1) badgeClass = 'f-10k';
      else if (ftype.indexOf('10-Q') !== -1) badgeClass = 'f-10q';
      else if (ftype.indexOf('8-K') !== -1) badgeClass = 'f-8k';
      else if (ftype === '4' || ftype === 'FORM 4') badgeClass = 'f-4';
      else if (ftype.indexOf('SC 13') !== -1 || ftype.indexOf('SC13') !== -1) badgeClass = 'f-sc13';

      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">'
        + '<span class="filing-badge ' + badgeClass + '">' + escHtml(ftype || 'N/A') + '</span>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(f.description || f.title || ftype) + '</div>'
        + '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">' + fmtDate(f.date || f.filingDate || f.acceptedDate) + '</div>'
        + '</div>'
        + (f.url || f.link || f.finalLink ? '<a class="filing-link" href="' + escHtml(f.url || f.link || f.finalLink) + '" target="_blank" rel="noopener">View &#x2197;</a>' : '')
        + '</div>';
    }
    $filingsContent.innerHTML = html;
  }

  // ── Render: Whales Intelligence ──
  function renderWhales(data) {
    if (!data) { showError($whalesContent, 'Could not load whales intel'); return; }
    if (data.error) { showError($whalesContent, data.error); return; }

    var html = '<div class="whale-stats-grid">';
    var hasContent = false;

    // Analyst consensus
    var analysts = data.analysts || {};
    var rating = analysts.consensus || analysts.avgRating || analysts.rating;
    // Compute rating from buy/hold/sell if not provided
    if (!rating && (analysts.buy != null || analysts.sell != null)) {
      var total = (analysts.buy || 0) + (analysts.hold || 0) + (analysts.sell || 0);
      if (total > 0) {
        var buyPct = (analysts.buy || 0) / total;
        rating = buyPct > 0.6 ? 'Buy' : buyPct < 0.3 ? 'Sell' : 'Hold';
      }
    }
    var target = analysts.targetPrice || analysts.targetAvg;
    if (rating || target != null || analysts.totalAnalysts || analysts.buy != null) {
      hasContent = true;
      var ratingColor = (rating || '').toLowerCase().indexOf('buy') !== -1 ? 'var(--green)' : (rating || '').toLowerCase().indexOf('sell') !== -1 ? 'var(--red)' : 'var(--text)';
      html += '<div class="whale-stat">'
        + '<div class="whale-stat-label">Analyst Rating</div>'
        + '<div class="whale-stat-value" style="color:' + ratingColor + '">' + escHtml(rating || '--') + '</div>'
        + (target != null ? '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">Target: $' + fmt(target) + '</div>' : '')
        + (analysts.totalAnalysts ? '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">' + analysts.totalAnalysts + ' analysts</div>' : '')
        + '</div>';
      // Buy/Hold/Sell breakdown
      if (analysts.buy != null || analysts.hold != null || analysts.sell != null) {
        html += '<div class="whale-stat">'
          + '<div class="whale-stat-label">Breakdown</div>'
          + '<div style="font-family:var(--font-mono);font-size:12px">'
          + '<span style="color:var(--green)">Buy ' + (analysts.buy || 0) + '</span> · '
          + '<span style="color:var(--text-muted)">Hold ' + (analysts.hold || 0) + '</span> · '
          + '<span style="color:var(--red)">Sell ' + (analysts.sell || 0) + '</span>'
          + '</div></div>';
      }
    }

    // Earnings — handle both object and array
    var earnings = data.earnings;
    if (Array.isArray(earnings) && earnings.length > 0) earnings = earnings[0];
    if (earnings && typeof earnings === 'object') {
      var epsActual = earnings.actualEarningResult || earnings.epsActual || earnings.actual || earnings.eps;
      var epsEst = earnings.estimatedEarning || earnings.epsEstimate || earnings.epsForecast || earnings.estimate;
      if (epsActual != null) {
        hasContent = true;
        var beat = epsEst != null ? epsActual > epsEst : null;
        html += '<div class="whale-stat">'
          + '<div class="whale-stat-label">Recent Earnings</div>'
          + '<div class="whale-stat-value" style="color:' + (beat === true ? 'var(--green)' : beat === false ? 'var(--red)' : 'var(--text)') + '">$' + fmt(epsActual) + '</div>'
          + (epsEst != null ? '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">Est: $' + fmt(epsEst) + (beat === true ? ' (Beat)' : beat === false ? ' (Miss)' : '') + '</div>' : '')
          + (earnings.date || earnings.period ? '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">' + escHtml(earnings.periodName || earnings.period || earnings.date) + '</div>' : '')
          + '</div>';
      }
    }

    // Financials summary — handle both revenue-based and ratio-based
    var fin = data.financials || {};
    if (fin.revenue != null || fin.netIncome != null) {
      hasContent = true;
      html += '<div class="whale-stat">'
        + '<div class="whale-stat-label">Revenue</div>'
        + '<div class="whale-stat-value">$' + fmtBig(fin.revenue) + '</div>'
        + '</div>';
      if (fin.netIncome != null) {
        html += '<div class="whale-stat">'
          + '<div class="whale-stat-label">Net Income</div>'
          + '<div class="whale-stat-value" style="color:' + (fin.netIncome >= 0 ? 'var(--green)' : 'var(--red)') + '">$' + fmtBig(fin.netIncome) + '</div>'
          + '</div>';
      }
    } else if (fin.epsTTM != null || fin.peTTM != null || fin.peRatio != null || fin.grossMargin != null) {
      hasContent = true;
      if (fin.epsTTM != null) {
        html += '<div class="whale-stat"><div class="whale-stat-label">EPS (TTM)</div><div class="whale-stat-value">$' + fmt(fin.epsTTM) + '</div></div>';
      }
      var pe = fin.peTTM != null ? fin.peTTM : fin.peRatio;
      if (pe != null) {
        html += '<div class="whale-stat"><div class="whale-stat-label">P/E Ratio</div><div class="whale-stat-value">' + fmt(pe, 1) + '</div></div>';
      }
      if (fin.grossMargin != null) {
        html += '<div class="whale-stat"><div class="whale-stat-label">Gross Margin</div><div class="whale-stat-value">' + fmtPct(fin.grossMargin) + '</div></div>';
      }
      if (fin.dividendYield != null && fin.dividendYield > 0) {
        html += '<div class="whale-stat"><div class="whale-stat-label">Dividend Yield</div><div class="whale-stat-value">' + fmtPct(fin.dividendYield) + '</div></div>';
      }
    }

    html += '</div>';

    if (!hasContent) {
      showError($whalesContent, 'No whale intelligence available');
      return;
    }
    $whalesContent.innerHTML = html;
  }

  // ── Bind events ──
  function bindEvents() {
    $searchBtn.addEventListener('click', function() {
      var t = $input.value.trim().toUpperCase();
      if (t) loadTicker(t);
    });
    $input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var t = $input.value.trim().toUpperCase();
        if (t) loadTicker(t);
      }
    });
  }

  // ── init / destroy ──
  function init() {
    cacheDom();
    bindEvents();
    renderRecents();

    // Restore last ticker
    var last = localStorage.getItem('smartmoney_last_ticker');
    if (last) {
      $input.value = last;
      loadTicker(last);
    }
  }

  function destroy() {
    if (abortController) { abortController.abort(); abortController = null; }
    currentTicker = null;
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getSmartMoneyPageCSS, getSmartMoneyPageHTML, getSmartMoneyPageJS };
