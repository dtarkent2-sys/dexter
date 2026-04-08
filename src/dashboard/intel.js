/**
 * Market Intel Dashboard — SPA-embeddable exports
 *
 * Exports:
 *   getIntelPageCSS()  → scoped CSS for the intel page
 *   getIntelPageHTML() → HTML fragment for the intel page
 *   getIntelPageJS()   → client-side JS for the intel page
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * SPA-embeddable exports: getIntelPageCSS / getIntelPageHTML / getIntelPageJS
 * ────────────────────────────────────────────────────────────────────────── */

function getIntelPageCSS() {
  return `
/* ── Intel page scoped styles ── */
#page-intel .page-header { padding: 20px 24px 12px; }
#page-intel .page-header h2 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
#page-intel .page-header .subtitle { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }

/* ── Search Bar ── */
#page-intel .search-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 0 24px 8px;
}
#page-intel .search-bar input {
  font-family: var(--font-mono); font-size: 14px; font-weight: 600;
  background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
  border-radius: 3px; padding: 8px 14px; outline: none; width: 200px;
  text-transform: uppercase;
}
#page-intel .search-bar input:focus { border-color: var(--accent); }
#page-intel .search-bar input::placeholder { color: var(--text-muted); text-transform: none; }
#page-intel .search-bar button {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--accent);
  border-radius: 3px; padding: 8px 16px; cursor: pointer; transition: all 0.15s;
  text-transform: uppercase; letter-spacing: 0.02em;
}
#page-intel .search-bar button:hover { background: var(--accent); color: var(--bg); }

/* ── Recent Chips ── */
#page-intel .recent-chips {
  display: flex; align-items: center; gap: 6px;
  padding: 0 24px 12px; flex-wrap: wrap;
}
#page-intel .recent-chips .chip-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; margin-right: 2px;
}
#page-intel .recent-chip {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 10px; cursor: pointer; transition: all 0.15s;
}
#page-intel .recent-chip:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-subtle); }

/* ── Grid Layout ── */
#page-intel .intel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px 24px;
  overflow-y: auto; flex: 1;
}
#page-intel .intel-grid .card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; display: flex; flex-direction: column; gap: 8px;
}
#page-intel .intel-grid .card-title {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px;
}
#page-intel .full-width { grid-column: 1 / -1; }

/* ── Price Quote ── */
#page-intel .quote-name {
  font-family: var(--font-body); font-size: 16px; font-weight: 700; color: var(--text);
}
#page-intel .quote-price {
  font-family: var(--font-mono); font-size: 28px; font-weight: 700; color: var(--text);
}
#page-intel .quote-change {
  font-family: var(--font-mono); font-size: 14px; font-weight: 600;
}
#page-intel .quote-change.up { color: var(--green); }
#page-intel .quote-change.down { color: var(--red); }
#page-intel .quote-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-top: 4px;
}
#page-intel .quote-stat {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono); font-size: 11px;
  padding: 3px 0; border-bottom: 1px solid var(--border);
}
#page-intel .quote-stat-label { color: var(--text-muted); }
#page-intel .quote-stat-value { color: var(--text); font-weight: 600; }

/* ── Technicals ── */
#page-intel .tech-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
#page-intel .tech-item {
  background: var(--bg-surface); border-radius: 3px; padding: 10px;
  display: flex; flex-direction: column; gap: 4px;
}
#page-intel .tech-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em;
}
#page-intel .tech-value {
  font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--text);
}
#page-intel .tech-signal {
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.5px;
}
#page-intel .tech-signal.bullish { color: var(--green); }
#page-intel .tech-signal.bearish { color: var(--red); }
#page-intel .tech-signal.neutral { color: var(--text-muted); }

/* ── RSI Gauge ── */
#page-intel .rsi-gauge {
  width: 100%; height: 6px; background: var(--bg-surface-hover); border-radius: 3px;
  position: relative; margin-top: 4px;
}
#page-intel .rsi-gauge .rsi-fill {
  height: 100%; border-radius: 3px; transition: width 0.5s;
}
#page-intel .rsi-gauge .rsi-marker {
  position: absolute; top: -3px; width: 3px; height: 12px;
  background: var(--text); border-radius: 1px; transition: left 0.5s;
}

/* ── Chart Container ── */
#page-intel .chart-wrap { height: 400px; position: relative; }
#page-intel .chart-container { width: 100%; height: 100%; }
#page-intel .tf-tabs {
  display: flex; gap: 4px; margin-bottom: 8px;
}
#page-intel .tf-tab {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 4px 10px; cursor: pointer; transition: all 0.15s;
}
#page-intel .tf-tab:hover { color: var(--text); border-color: var(--border); }
#page-intel .tf-tab.active { color: var(--accent); border-color: var(--accent); background: var(--accent-subtle); }

/* ── News Cards ── */
#page-intel .news-list {
  display: flex; flex-direction: column; gap: 8px;
  max-height: 400px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--bg-surface-hover) transparent;
}
#page-intel .news-item {
  padding: 10px; background: var(--bg-surface); border-radius: 3px;
  border: 1px solid var(--border); cursor: pointer; transition: all 0.15s;
  text-decoration: none; display: block;
}
#page-intel .news-item:hover { border-color: var(--accent); background: var(--bg-surface-hover); }
#page-intel .news-headline {
  font-family: var(--font-body); font-size: 12px; color: var(--text);
  line-height: 1.4; margin-bottom: 4px;
}
#page-intel .news-meta {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  display: flex; gap: 8px;
}

/* ── AI Analysis ── */
#page-intel .ai-modes {
  display: flex; gap: 6px; margin-bottom: 10px;
}
#page-intel .ai-mode-btn {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 6px 14px; cursor: pointer; transition: all 0.15s;
}
#page-intel .ai-mode-btn:hover { color: var(--text); border-color: var(--border); }
#page-intel .ai-mode-btn.active { color: var(--accent); border-color: var(--accent); background: var(--accent-subtle); }
#page-intel .ai-mode-btn:disabled { opacity: 0.5; cursor: not-allowed; }
#page-intel .ai-output {
  font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);
  line-height: 1.6; background: var(--bg-surface); border-radius: 3px;
  padding: 14px; max-height: 350px; overflow-y: auto;
  white-space: pre-wrap; word-wrap: break-word;
  scrollbar-width: thin; scrollbar-color: var(--bg-surface-hover) transparent;
}
#page-intel .ai-output .ai-loading {
  color: var(--accent); animation: flow-pulse 1.5s infinite;
}

/* ── Screener Table ── */
#page-intel .screener-wrap {
  overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--bg-surface-hover) transparent;
}
#page-intel .screener-tbl {
  width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px;
}
#page-intel .screener-tbl th {
  text-align: left; padding: 6px 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; font-size: 10px; font-weight: 600;
  border-bottom: 1px solid var(--border);
}
#page-intel .screener-tbl td {
  padding: 6px 10px; color: var(--text); border-bottom: 1px solid var(--border);
}
#page-intel .screener-tbl tr:hover td { background: var(--bg-surface); }
#page-intel .screener-tbl .pos { color: var(--green); }
#page-intel .screener-tbl .neg { color: var(--red); }
#page-intel .screener-tbl .ticker-link {
  color: var(--accent); font-weight: 700; cursor: pointer;
}
#page-intel .screener-tbl .ticker-link:hover { text-decoration: underline; }

/* ── Empty / Loading States ── */
#page-intel .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px; color: var(--text-muted);
  font-family: var(--font-mono); font-size: 12px; text-align: center; gap: 6px;
}
#page-intel .empty-icon { font-size: 28px; opacity: 0.3; }
#page-intel .panel-loading {
  display: flex; align-items: center; justify-content: center;
  padding: 30px; color: var(--accent); font-family: var(--font-mono); font-size: 12px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  #page-intel .intel-grid { grid-template-columns: 1fr; }
  #page-intel .full-width { grid-column: 1; }
}
@media (max-width: 600px) {
  #page-intel .search-bar input { width: 140px; }
  #page-intel .chart-wrap { height: 280px; }
}
`;
}

function getIntelPageHTML() {
  return `<div class="page" id="page-intel">
  <div class="page-header"><div><h2>SharkIntel&trade;</h2><div class="subtitle">Research any ticker</div></div></div>

  <!-- Search Bar -->
  <div class="search-bar">
    <input type="text" id="intelTickerInput" placeholder="Enter ticker..." maxlength="10" />
    <button id="intelSearchBtn">Search</button>
  </div>
  <div class="recent-chips" id="intelRecentChips">
    <span class="chip-label">Recent:</span>
  </div>

  <!-- Grid Layout -->
  <div class="intel-grid">

    <!-- Price Quote -->
    <div class="card" id="intelPriceCard">
      <div class="card-title">Price Quote</div>
      <div class="empty-state" id="intelPriceEmpty">
        <div class="empty-icon">&#x25C9;</div>
        <div>Search a ticker to see quote data</div>
      </div>
      <div id="intelPriceContent" style="display:none">
        <div class="quote-name" id="intelQuoteName">--</div>
        <div style="display:flex;align-items:baseline;gap:10px">
          <div class="quote-price" id="intelQuotePrice">--</div>
          <div class="quote-change" id="intelQuoteChange">--</div>
        </div>
        <div class="quote-stats" id="intelQuoteStats"></div>
      </div>
    </div>

    <!-- Technicals -->
    <div class="card" id="intelTechCard">
      <div class="card-title">Technicals</div>
      <div class="empty-state" id="intelTechEmpty">
        <div class="empty-icon">&#x25C9;</div>
        <div>Technical indicators appear here</div>
      </div>
      <div id="intelTechContent" style="display:none">
        <div class="tech-grid" id="intelTechGrid"></div>
      </div>
    </div>

    <!-- Chart -->
    <div class="card full-width" id="intelChartCard">
      <div class="card-title">Chart</div>
      <div class="tf-tabs" id="intelTfTabs">
        <button class="tf-tab active" data-tf="1D">1D</button>
        <button class="tf-tab" data-tf="5D">5D</button>
        <button class="tf-tab" data-tf="1M">1M</button>
        <button class="tf-tab" data-tf="3M">3M</button>
        <button class="tf-tab" data-tf="1Y">1Y</button>
      </div>
      <div class="chart-wrap">
        <div class="chart-container" id="intelChartContainer">
          <div class="empty-state" id="intelChartEmpty">
            <div class="empty-icon">&#x25C9;</div>
            <div>Chart loads when you search a ticker</div>
          </div>
        </div>
      </div>
    </div>

    <!-- News -->
    <div class="card" id="intelNewsCard">
      <div class="card-title">News</div>
      <div class="news-list" id="intelNewsList">
        <div class="empty-state" id="intelNewsEmpty">
          <div class="empty-icon">&#x25C9;</div>
          <div>Latest headlines appear here</div>
        </div>
      </div>
    </div>

    <!-- AI Analysis -->
    <div class="card" id="intelAiCard">
      <div class="card-title">AI Analysis</div>
      <div class="ai-modes" id="intelAiModes">
        <button class="ai-mode-btn" data-mode="analyze" disabled>Analyze</button>
      </div>
      <div class="ai-output" id="intelAiOutput">Search a ticker, then select an analysis mode.</div>
    </div>

    <!-- Screener -->
    <div class="card full-width" id="intelScreenerCard">
      <div class="card-title">Top Movers</div>
      <div class="screener-wrap">
        <div id="intelScreenerContent">
          <div class="empty-state" id="intelScreenerEmpty">
            <div class="empty-icon">&#x25C9;</div>
            <div>Loading top movers...</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>`;
}

function getIntelPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.intel = (function() {
  'use strict';

  // ── State ──
  var currentTicker = null;
  var chart = null;
  var chartSeries = null;
  var volumeSeries = null;
  var abortController = null;
  var resizeObserver = null;
  var activeTf = '1D';

  // ── DOM refs ──
  var $input, $searchBtn, $recentChips;
  var $priceEmpty, $priceContent, $quoteName, $quotePrice, $quoteChange, $quoteStats;
  var $techEmpty, $techContent, $techGrid;
  var $chartContainer, $chartEmpty;
  var $newsList, $newsEmpty;
  var $aiOutput, $aiModes;
  var $screenerContent, $screenerEmpty;

  function cacheDom() {
    $input = document.getElementById('intelTickerInput');
    $searchBtn = document.getElementById('intelSearchBtn');
    $recentChips = document.getElementById('intelRecentChips');
    $priceEmpty = document.getElementById('intelPriceEmpty');
    $priceContent = document.getElementById('intelPriceContent');
    $quoteName = document.getElementById('intelQuoteName');
    $quotePrice = document.getElementById('intelQuotePrice');
    $quoteChange = document.getElementById('intelQuoteChange');
    $quoteStats = document.getElementById('intelQuoteStats');
    $techEmpty = document.getElementById('intelTechEmpty');
    $techContent = document.getElementById('intelTechContent');
    $techGrid = document.getElementById('intelTechGrid');
    $chartContainer = document.getElementById('intelChartContainer');
    $chartEmpty = document.getElementById('intelChartEmpty');
    $newsList = document.getElementById('intelNewsList');
    $newsEmpty = document.getElementById('intelNewsEmpty');
    $aiOutput = document.getElementById('intelAiOutput');
    $aiModes = document.getElementById('intelAiModes');
    $screenerContent = document.getElementById('intelScreenerContent');
    $screenerEmpty = document.getElementById('intelScreenerEmpty');
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
    var sign = v >= 0 ? '+' : '';
    return sign + Number(v).toFixed(2) + '%';
  }

  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Recent tickers ──
  function getRecents() {
    try { return JSON.parse(localStorage.getItem('intel_recents') || '[]'); } catch(e) { return []; }
  }

  function addRecent(ticker) {
    var recents = getRecents().filter(function(t) { return t !== ticker; });
    recents.unshift(ticker);
    if (recents.length > 8) recents.length = 8;
    localStorage.setItem('intel_recents', JSON.stringify(recents));
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
    // Bind click handlers
    $recentChips.querySelectorAll('.recent-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var t = chip.dataset.ticker;
        if (t) { $input.value = t; loadTicker(t); }
      });
    });
  }

  // ── Show loading state on a panel ──
  function showLoading(el) {
    el.innerHTML = '<div class="panel-loading">Loading...</div>';
  }

  // ── Load ticker (main entry point) ──
  function loadTicker(ticker) {
    ticker = ticker.trim().toUpperCase();
    if (!ticker) return;
    currentTicker = ticker;
    addRecent(ticker);
    $input.value = ticker;

    // Enable AI buttons
    $aiModes.querySelectorAll('.ai-mode-btn').forEach(function(btn) { btn.disabled = false; });
    $aiOutput.textContent = 'Select an analysis mode above.';

    // Show loading on panels
    $priceEmpty.style.display = 'none';
    $priceContent.style.display = 'block';
    $quoteName.textContent = ticker;
    $quotePrice.textContent = '...';
    $quoteChange.textContent = '';
    $quoteStats.innerHTML = '';

    $techEmpty.style.display = 'none';
    $techContent.style.display = 'block';
    showLoading($techGrid);

    $newsEmpty.style.display = 'none';
    showLoading($newsList);

    // Fetch all in parallel
    fetchPrice(ticker);
    fetchTechnicals(ticker);
    fetchNews(ticker);
    renderChart(ticker, activeTf);
  }

  // ── Price Quote ──
  function fetchPrice(ticker) {
    fetch('/api/intel/price/' + encodeURIComponent(ticker))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (currentTicker !== ticker) return;
        if (data.error) { $quotePrice.textContent = 'Error'; return; }
        renderPrice(data);
      })
      .catch(function(e) {
        console.warn('[Intel] price fetch error:', e.message);
        $quotePrice.textContent = 'Error';
      });
  }

  function renderPrice(data) {
    var q = data.quote || {};
    var s = data.snapshot || {};
    var name = s.name || s.companyName || q.name || currentTicker;
    var price = q.price || s.price;
    var changePct = q.changePercent || q.changesPercentage || s.changesPercentage;

    $quoteName.textContent = name;
    $quotePrice.textContent = price != null ? '$' + fmt(price) : '--';

    if (changePct != null) {
      $quoteChange.textContent = fmtPct(changePct);
      $quoteChange.className = 'quote-change ' + (changePct >= 0 ? 'up' : 'down');
    } else {
      $quoteChange.textContent = '--';
      $quoteChange.className = 'quote-change';
    }

    // Stats grid
    var stats = [
      ['Volume', fmtBig(q.volume || s.volume)],
      ['Mkt Cap', fmtBig(q.mktCap || s.marketCap || s.mktCap)],
      ['P/E', fmt(q.pe || s.pe, 1)],
      ['EPS', fmt(s.eps, 2)],
      ['52W High', price != null && s.fiftyTwoWeekHigh != null ? '$' + fmt(s.fiftyTwoWeekHigh) : '--'],
      ['52W Low', price != null && s.fiftyTwoWeekLow != null ? '$' + fmt(s.fiftyTwoWeekLow) : '--'],
      ['RSI (14)', fmt(q.rsi14, 1)],
      ['SMA 50', q.sma50 != null ? '$' + fmt(q.sma50) : '--'],
      ['SMA 200', q.sma200 != null ? '$' + fmt(q.sma200) : '--'],
      ['Avg Vol', fmtBig(s.avgVolume || q.avgVolume)]
    ];

    var html = '';
    for (var i = 0; i < stats.length; i++) {
      html += '<div class="quote-stat"><span class="quote-stat-label">' + stats[i][0] + '</span><span class="quote-stat-value">' + stats[i][1] + '</span></div>';
    }
    $quoteStats.innerHTML = html;
  }

  // ── Technicals ──
  function fetchTechnicals(ticker) {
    fetch('/api/intel/technicals/' + encodeURIComponent(ticker))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (currentTicker !== ticker) return;
        if (data.error) { $techGrid.innerHTML = '<div class="empty-state"><div>Could not load technicals</div></div>'; return; }
        renderTechnicals(data);
      })
      .catch(function(e) {
        console.warn('[Intel] technicals fetch error:', e.message);
        $techGrid.innerHTML = '<div class="empty-state"><div>Error loading technicals</div></div>';
      });
  }

  function renderTechnicals(data) {
    var items = [];

    // RSI
    var rsi = data.rsi14 || data.rsi;
    if (rsi != null) {
      var rsiSignal = rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral';
      var rsiLabel = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
      items.push({
        label: 'RSI (14)', value: fmt(rsi, 1), signal: rsiLabel, signalClass: rsiSignal,
        extra: '<div class="rsi-gauge"><div class="rsi-fill" style="width:' + Math.min(rsi, 100) + '%;background:' + (rsi > 70 ? 'var(--red)' : rsi < 30 ? 'var(--green)' : 'var(--accent)') + '"></div><div class="rsi-marker" style="left:' + Math.min(rsi, 100) + '%"></div></div>'
      });
    }

    // MACD
    if (data.macd != null || data.macdSignal != null) {
      var macdVal = data.macd || data.macdLine;
      var macdSig = data.macdSignal;
      var macdBullish = macdVal != null && macdSig != null ? macdVal > macdSig : null;
      items.push({
        label: 'MACD', value: fmt(macdVal, 3),
        signal: macdBullish === true ? 'Bullish Cross' : macdBullish === false ? 'Bearish Cross' : 'N/A',
        signalClass: macdBullish === true ? 'bullish' : macdBullish === false ? 'bearish' : 'neutral',
        extra: '<div style="font-size:10px;color:var(--text-muted)">Signal: ' + fmt(macdSig, 3) + '</div>'
      });
    }

    // Bollinger
    if (data.bollingerUpper != null || data.upperBand != null) {
      var upper = data.bollingerUpper || data.upperBand;
      var lower = data.bollingerLower || data.lowerBand;
      var mid = data.bollingerMiddle || data.middleBand;
      items.push({
        label: 'Bollinger', value: '$' + fmt(mid),
        signal: 'Upper: $' + fmt(upper),
        signalClass: 'neutral',
        extra: '<div style="font-size:10px;color:var(--text-muted)">Lower: $' + fmt(lower) + '</div>'
      });
    }

    // SMA 20
    if (data.sma20 != null) {
      items.push({ label: 'SMA 20', value: '$' + fmt(data.sma20), signal: '', signalClass: 'neutral', extra: '' });
    }

    // SMA 50
    if (data.sma50 != null) {
      var above50 = data.price != null ? data.price > data.sma50 : null;
      items.push({
        label: 'SMA 50', value: '$' + fmt(data.sma50),
        signal: above50 === true ? 'Above' : above50 === false ? 'Below' : '',
        signalClass: above50 === true ? 'bullish' : above50 === false ? 'bearish' : 'neutral',
        extra: ''
      });
    }

    // SMA 200
    if (data.sma200 != null) {
      var above200 = data.price != null ? data.price > data.sma200 : null;
      items.push({
        label: 'SMA 200', value: '$' + fmt(data.sma200),
        signal: above200 === true ? 'Above' : above200 === false ? 'Below' : '',
        signalClass: above200 === true ? 'bullish' : above200 === false ? 'bearish' : 'neutral',
        extra: ''
      });
    }

    if (items.length === 0) {
      $techGrid.innerHTML = '<div class="empty-state"><div>No technical data available</div></div>';
      return;
    }

    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      html += '<div class="tech-item">'
        + '<div class="tech-label">' + it.label + '</div>'
        + '<div class="tech-value">' + it.value + '</div>'
        + (it.signal ? '<div class="tech-signal ' + it.signalClass + '">' + it.signal + '</div>' : '')
        + (it.extra || '')
        + '</div>';
    }
    $techGrid.innerHTML = html;
  }

  // ── Chart ──
  function renderChart(ticker, tf) {
    if (!ticker) return;
    if (!$chartContainer) return;

    // Destroy previous chart
    if (chart) { chart.remove(); chart = null; chartSeries = null; volumeSeries = null; }
    $chartEmpty.style.display = 'none';
    $chartContainer.style.height = '100%';

    if (typeof LightweightCharts === 'undefined') {
      $chartContainer.innerHTML = '<div class="empty-state"><div>Chart library not loaded</div></div>';
      return;
    }

    chart = LightweightCharts.createChart($chartContainer, {
      width: $chartContainer.clientWidth,
      height: $chartContainer.clientHeight,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#8a8f98' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: tf === '1D', secondsVisible: false }
    });

    chartSeries = chart.addCandlestickSeries({
      upColor: '#22C55E', downColor: '#EF4444',
      borderUpColor: '#22C55E', borderDownColor: '#EF4444',
      wickUpColor: '#22C55E', wickDownColor: '#EF4444'
    });

    volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.85, bottom: 0 }
    });

    fetch('/api/chart/bars/' + encodeURIComponent(ticker) + '?tf=' + encodeURIComponent(tf))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (currentTicker !== ticker) return;
        if (!data.bars || data.bars.length === 0) {
          $chartContainer.innerHTML = '<div class="empty-state"><div>No chart data available</div></div>';
          if (chart) { chart.remove(); chart = null; }
          return;
        }

        var candles = [];
        var vols = [];
        for (var i = 0; i < data.bars.length; i++) {
          var b = data.bars[i];
          var time = b.t || b.time || b.date;
          if (typeof time === 'number' && time > 1e12) time = Math.floor(time / 1000);
          candles.push({ time: time, open: b.o, high: b.h, low: b.l, close: b.c });
          vols.push({ time: time, value: b.v, color: b.c >= b.o ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' });
        }

        chartSeries.setData(candles);
        volumeSeries.setData(vols);
        chart.timeScale().fitContent();
      })
      .catch(function(e) {
        console.warn('[Intel] chart fetch error:', e.message);
      });

    // Handle resize
    if (resizeObserver) resizeObserver.disconnect();
    resizeObserver = new ResizeObserver(function() {
      if (chart && $chartContainer) {
        chart.applyOptions({ width: $chartContainer.clientWidth });
      }
    });
    resizeObserver.observe($chartContainer);
  }

  // ── News ──
  function fetchNews(ticker) {
    fetch('/api/intel/news/' + encodeURIComponent(ticker) + '?count=10')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (currentTicker !== ticker) return;
        if (data.error || !data.news || data.news.length === 0) {
          $newsList.innerHTML = '<div class="empty-state"><div>No recent news found</div></div>';
          return;
        }
        renderNews(data);
      })
      .catch(function(e) {
        console.warn('[Intel] news fetch error:', e.message);
        $newsList.innerHTML = '<div class="empty-state"><div>Error loading news</div></div>';
      });
  }

  function renderNews(data) {
    var news = data.news;
    var html = '';
    for (var i = 0; i < news.length; i++) {
      var n = news[i];
      var url = n.url || '#';
      var source = n.source || 'Unknown';
      var dt = n.datetime || n.publishedDate || '';
      var timeStr = '';
      if (dt) {
        try { var d = new Date(dt); timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); } catch(e) { timeStr = dt; }
      }
      html += '<a class="news-item" href="' + escHtml(url) + '" target="_blank" rel="noopener">'
        + '<div class="news-headline">' + escHtml(n.headline || n.title || 'Untitled') + '</div>'
        + '<div class="news-meta"><span>' + escHtml(source) + '</span><span>' + escHtml(timeStr) + '</span></div>'
        + '</a>';
    }
    $newsList.innerHTML = html;
  }

  // ── AI Analysis ──
  function startAnalysis(ticker, mode) {
    if (!ticker) return;
    if (window.SQ && SQ.userTier !== 'pro') {
      if (typeof showUpgradeModal === 'function') showUpgradeModal('AI Analysis requires a Pro subscription.');
      return;
    }
    if (abortController) { abortController.abort(); }
    abortController = new AbortController();

    // Update button states
    $aiModes.querySelectorAll('.ai-mode-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.mode === mode);
      btn.disabled = true;
    });

    $aiOutput.innerHTML = '<span class="ai-loading">Analyzing ' + escHtml(ticker) + ' (' + mode + ')...</span>';

    fetch('/api/intel/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: ticker, mode: mode }),
      signal: abortController.signal
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (currentTicker !== ticker) return;
        // Re-enable buttons
        $aiModes.querySelectorAll('.ai-mode-btn').forEach(function(btn) { btn.disabled = false; });

        if (data.error) {
          $aiOutput.textContent = 'Error: ' + data.error;
          return;
        }
        // Render text (basic markdown: **bold**, *italic*, newlines)
        var text = data.text || 'No analysis returned.';
        var rendered = escHtml(text)
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong style="color:var(--text)">$1</strong>')
          .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
          .replace(/\\n/g, '<br>');
        $aiOutput.innerHTML = rendered;
      })
      .catch(function(e) {
        if (e.name === 'AbortError') return;
        console.warn('[Intel] analysis error:', e.message);
        $aiOutput.textContent = 'Error running analysis.';
        $aiModes.querySelectorAll('.ai-mode-btn').forEach(function(btn) { btn.disabled = false; });
      });
  }

  // ── Screener ──
  function fetchScreener() {
    fetch('/api/intel/screen')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error || !data.stocks || data.stocks.length === 0) {
          $screenerContent.innerHTML = '<div class="empty-state"><div>No screener data available</div></div>';
          return;
        }
        renderScreener(data);
      })
      .catch(function(e) {
        console.warn('[Intel] screener fetch error:', e.message);
        $screenerContent.innerHTML = '<div class="empty-state"><div>Error loading screener</div></div>';
      });
  }

  function renderScreener(data) {
    var stocks = data.stocks.slice(0, 20);
    var html = '<table class="screener-tbl"><thead><tr>'
      + '<th>Symbol</th><th>Price</th><th>Change %</th><th>Volume</th><th>Mkt Cap</th>'
      + '</tr></thead><tbody>';
    for (var i = 0; i < stocks.length; i++) {
      var s = stocks[i];
      var chg = s.changesPercentage || s.changePercent || 0;
      var chgClass = chg >= 0 ? 'pos' : 'neg';
      html += '<tr>'
        + '<td><span class="ticker-link" data-ticker="' + escHtml(s.symbol || s.ticker) + '">' + escHtml(s.symbol || s.ticker) + '</span></td>'
        + '<td>$' + fmt(s.price) + '</td>'
        + '<td class="' + chgClass + '">' + fmtPct(chg) + '</td>'
        + '<td>' + fmtBig(s.volume) + '</td>'
        + '<td>' + fmtBig(s.marketCap || s.mktCap) + '</td>'
        + '</tr>';
    }
    html += '</tbody></table>';
    $screenerContent.innerHTML = html;

    // Bind ticker links
    $screenerContent.querySelectorAll('.ticker-link').forEach(function(el) {
      el.addEventListener('click', function() {
        var t = el.dataset.ticker;
        if (t) { $input.value = t; loadTicker(t); }
      });
    });
  }

  // ── Bind events ──
  function bindEvents() {
    // Search
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

    // Timeframe tabs
    document.getElementById('intelTfTabs').querySelectorAll('.tf-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.getElementById('intelTfTabs').querySelectorAll('.tf-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        activeTf = tab.dataset.tf;
        if (currentTicker) renderChart(currentTicker, activeTf);
      });
    });

    // AI mode buttons
    $aiModes.querySelectorAll('.ai-mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (currentTicker && !btn.disabled) startAnalysis(currentTicker, btn.dataset.mode);
      });
    });
  }

  // ── init / destroy ──
  function init() {
    cacheDom();
    bindEvents();
    renderRecents();
    fetchScreener();

    // Disable AI for free users
    if (window.SQ && SQ.userTier !== 'pro') {
      $aiModes.querySelectorAll('.ai-mode-btn').forEach(function(btn) {
        btn.disabled = true;
        btn.title = 'Pro feature';
      });
      $aiOutput.textContent = 'AI Analysis is a Pro feature. Upgrade to unlock.';
    }

    // Restore last ticker
    var recents = getRecents();
    if (recents.length > 0) {
      var last = recents[0];
      $input.value = last;
      loadTicker(last);
    }
  }

  function destroy() {
    if (abortController) { abortController.abort(); abortController = null; }
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
    if (chart) { chart.remove(); chart = null; chartSeries = null; volumeSeries = null; }
    currentTicker = null;
    activeTf = '1D';
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getIntelPageCSS, getIntelPageHTML, getIntelPageJS };
