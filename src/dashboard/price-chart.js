/**
 * Price Chart — Standalone page module
 *
 * TradingView price chart with GEX level overlays and GEX profile sidebar canvas.
 * Regime/verdict/timing panels live in gex-heatmap.js.
 *
 * SPA exports: getPriceChartPageCSS, getPriceChartPageHTML, getPriceChartPageJS
 */

function getPriceChartPageCSS() {
  return `
/* ── Price Chart page scoped styles ── */
#page-pricechart .ticker-input {
  background: var(--bg-surface); border: 1px solid var(--border); color: var(--text);
  padding: 7px 14px; border-radius: 3px; font-family: var(--font-mono); font-size: 13px;
  width: 90px; text-transform: uppercase; font-weight: 600;
  transition: border-color 0.25s;
}
#page-pricechart .ticker-input:focus { outline: none; border-color: var(--accent); }
#page-pricechart .ticker-dropdown {
  display: none; position: absolute; top: 100%; left: 0; z-index: 200;
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  margin-top: 4px; min-width: 180px;
  max-height: 260px; overflow-y: auto;
}
#page-pricechart .ticker-dropdown.show { display: block; }
#page-pricechart .ticker-option {
  padding: 8px 14px; cursor: pointer; font-family: var(--font-mono); font-size: 11px;
  display: flex; justify-content: space-between; align-items: center; transition: background 0.15s;
}
#page-pricechart .ticker-option:hover { background: var(--accent-subtle); }
#page-pricechart .ticker-option .ticker-sym { font-weight: 600; color: var(--text); }
#page-pricechart .ticker-option .ticker-desc { font-size: 9px; color: var(--text-muted); }
#page-pricechart .btn {
  background: transparent; border: 1px solid var(--border); color: var(--text-muted);
  padding: 6px 14px; border-radius: 3px; cursor: pointer; font-family: var(--font-mono);
  font-size: 10px; font-weight: 500; transition: all 0.25s; letter-spacing: 0.3px;
}
#page-pricechart .btn:hover { color: var(--text); border-color: var(--border); }
#page-pricechart .btn.active { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 700; }

/* ── Chart Zone ── */
#page-pricechart .chart-zone {
  flex: 1; min-height: 200px; display: flex;
  position: relative;
}
#page-pricechart .chart-zone .price-chart-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
#page-pricechart .chart-zone .price-chart-body { flex: 1; position: relative; }

/* ── Price Chart Controls ── */
#page-pricechart .price-chart-wrap {
  width: 100%; overflow: hidden; background: var(--bg-surface);
}
#page-pricechart .price-chart-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 16px; border-bottom: 1px solid var(--border);
}
#page-pricechart .price-chart-title { display: flex; align-items: center; }
#page-pricechart .price-chart-controls { display: flex; align-items: center; gap: 6px; }
#page-pricechart .chart-tf-group, #page-pricechart .chart-mode-group {
  display: flex; gap: 2px; background: var(--bg-surface); border-radius: 5px; padding: 2px;
}
#page-pricechart .chart-tf-btn, #page-pricechart .chart-mode-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  padding: 3px 10px; border: none; border-radius: 4px; cursor: pointer;
  background: transparent; color: var(--text-muted); transition: all 0.15s;
}
#page-pricechart .chart-tf-btn:hover, #page-pricechart .chart-mode-btn:hover { color: var(--text); }
#page-pricechart .chart-tf-btn.active, #page-pricechart .chart-mode-btn.active {
  background: var(--bg); color: var(--text);
}
#page-pricechart .chart-ind-group {
  display: flex; gap: 2px; background: var(--bg-surface); border-radius: 5px; padding: 2px;
}
#page-pricechart .chart-ind-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  padding: 3px 10px; border: none; border-radius: 4px; cursor: pointer;
  background: transparent; color: var(--text-muted); transition: all 0.15s;
}
#page-pricechart .chart-ind-btn:hover { color: var(--text); }
#page-pricechart .chart-ind-btn.active {
  background: var(--bg); color: var(--text);
}
#page-pricechart .price-chart-body {
  position: relative; flex: 1; padding: 0;
}
#page-pricechart .price-chart-body canvas {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}

/* ── Spot Badge ── */
#page-pricechart .spot-badge {
  color: var(--text); padding: 5px 14px;
  border-radius: 3px; font-family: var(--font-mono); font-size: 13px; font-weight: 600;
  white-space: nowrap; background: var(--bg-surface); border: 1px solid var(--border);
}
@keyframes pc-priceFlash { 0% { background: var(--accent-subtle); } 100% { background: transparent; } }
#page-pricechart .spot-badge.flash { animation: pc-priceFlash 0.6s ease-out; }

/* ── Key Levels Badges ── */
#page-pricechart .key-levels { display: flex; gap: 8px; font-family: var(--font-mono); font-size: 10px; font-weight: 500; }
#page-pricechart .kl-badge { padding: 4px 10px; border-radius: 4px; white-space: nowrap; border: 1px solid transparent; animation: pc-slideIn 0.3s ease-out backwards; }
#page-pricechart .kl-badge:nth-child(2) { animation-delay: 0.05s; }
#page-pricechart .kl-badge:nth-child(3) { animation-delay: 0.1s; }
@keyframes pc-slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
#page-pricechart .kl-call { background: var(--accent-subtle); color: var(--green); border-color: rgba(78,201,160,0.12); }
#page-pricechart .kl-put { background: rgba(239,68,68,0.12); color: var(--red); border-color: rgba(192,88,98,0.12); }
#page-pricechart .kl-flip { background: var(--warn-dim); color: var(--yellow); border-color: rgba(184,149,64,0.12); }

/* ── Footer ── */
#page-pricechart .pc-footer { padding: 6px 24px; font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); background: var(--bg-surface); border-top: 1px solid var(--border); display: flex; justify-content: space-between; letter-spacing: 0.2px; flex-shrink: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  #page-pricechart .key-levels { display: none; }
  #page-pricechart .chart-zone { min-height: 150px; }
}

/* ── Page layout ── */
#page-pricechart.active { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
`;
}

function getPriceChartPageHTML() {
  return `<div class="page" id="page-pricechart">
  <div class="page-header" style="flex-shrink:0">
    <div><h2>SharkChart&trade;</h2><div class="subtitle">Price action with GEX overlays</div></div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <div style="position:relative">
        <input type="text" class="ticker-input" id="pcTickerInput" value="SPY" placeholder="SPY" maxlength="6" autocomplete="off" />
        <div class="ticker-dropdown" id="pcTickerDropdown"></div>
      </div>
      <button class="btn" id="pcLoadBtn">Load</button>
      <div style="margin-left:auto;display:flex;align-items:center;gap:12px">
        <span class="spot-badge" id="pcSpotBadge">&mdash;</span>
        <span class="key-levels" id="pcKeyLevels"></span>
      </div>
    </div>
  </div>

  <!-- Chart Zone -->
  <div class="chart-zone" id="pcChartZone">
    <div class="price-chart-wrap" id="pcPriceChartWrap">
      <div class="price-chart-header">
        <div class="price-chart-title">
          <span style="font-family:var(--font-body);font-size:11px;font-weight:600;color:var(--text-muted)">PRICE</span>
          <span id="pcChartLastPrice" style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text);margin-left:8px">&mdash;</span>
          <span id="pcChartPriceChange" style="font-family:var(--font-mono);font-size:11px;margin-left:6px">&mdash;</span>
        </div>
        <div class="price-chart-controls">
          <div class="chart-tf-group">
            <button class="chart-tf-btn" data-tf="tick">Tick</button>
            <button class="chart-tf-btn active" data-tf="1m">1m</button>
            <button class="chart-tf-btn" data-tf="5m">5m</button>
          </div>
          <div class="chart-mode-group">
            <button class="chart-mode-btn active" data-mode="candle">Candle</button>
            <button class="chart-mode-btn" data-mode="line">Line</button>
          </div>
          <div class="chart-ind-group">
            <button class="chart-ind-btn" data-ind="vwap">VWAP</button>
            <button class="chart-ind-btn" data-ind="rsi">RSI</button>
            <button class="chart-ind-btn" data-ind="macd">MACD</button>
          </div>
        </div>
      </div>
      <div class="price-chart-body" style="display:flex;">
        <div id="pcTvChartContainer" style="flex:1;min-width:0;"></div>
        <canvas id="pcProfileCanvas" width="140" style="flex:0 0 140px;height:100%;"></canvas>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="pc-footer">
    <span id="pcFooterLeft">GEX overlays from /api/gex/targets</span>
    <span id="pcFooterRight">&mdash;</span>
  </div>
</div>`;
}

function getPriceChartPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.pricechart = (function() {
  'use strict';

  // ── State ──
  var state = {
    ticker: 'SPY',
    targetData: null,
    gexData: null,
  };

  var chart = {
    tf: '1m',
    mode: 'candle',
    bars: [],
    ticks: [],
    levels: null,
    gexProfile: null,
    targetLevels: null,
    loaded: false,
    indicators: { vwap: false, rsi: false, macd: false },
    tv: null,
    tvCandle: null,
    tvVolume: null,
    tvVwap: null,
    tvRsi: null,
    tvMacdHist: null,
    tvMacdLine: null,
    tvMacdSignal: null,
    tvArea: null,
    priceLines: [],
    rsiPane: null,
    macdPane: null,
    spotPriceLine: null,
  };

  var socketHandlers = {};
  var _docClickHandler = null;
  // ── DOM refs ──
  var $ = {};

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

  // ── Format helpers ──
  function fmtGEXShort(val) {
    if (!val || val === 0) return '$0';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '+';
    if (abs >= 1e9) return sign + '$' + (abs/1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return sign + '$' + (abs/1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return sign + '$' + (abs/1e3).toFixed(0) + 'K';
    return sign + '$' + abs.toFixed(0);
  }

  function msToSec(ms) { return Math.floor(ms / 1000); }

  // ── Load Ticker ──
  async function loadTicker() {
    var input = $.tickerInput;
    if (!input) return;
    var ticker = input.value.trim().toUpperCase().replace(/[^A-Z0-9.]/g, '');
    if (!ticker) return;
    input.value = ticker;
    var oldTicker = state.ticker;
    state.ticker = ticker;
    state.targetData = null;
    state.gexData = null;

    // Reload chart for new ticker
    chart.bars = []; chart.ticks = []; chart.levels = null; chart.gexProfile = null; chart.targetLevels = null;
    if (SQ.socket && SQ.socket.connected) {
      if (oldTicker) SQ.socket.emit('unsubscribe:chart', { ticker: oldTicker, tf: chart.tf });
      SQ.socket.emit('subscribe:chart', { ticker: ticker, tf: chart.tf });
    }
    loadChartBars();
    loadTargets();
  }

  // ── Fetch targets ──
  async function loadTargets() {
    try {
      var res = await fetch('/api/gex/targets/' + state.ticker);
      var data = await res.json();
      if (data.error) return;
      state.targetData = data;
      chart.targetLevels = data;
      updateKeyLevels();
      applyGEXLevels();
      applySpotPrice();
      updateSpotBadge();
      updateFooter();
    } catch(e) {}
  }

  function updateChartGEXData() {
    if (state.gexData && state.gexData.profile && state.gexData.profile.length > 0) chart.gexProfile = state.gexData.profile;
    if (state.targetData) chart.targetLevels = state.targetData;
    applyGEXLevels(); applySpotPrice(); drawGEXProfile();
  }

  // ── Chart Init ──
  function initPriceChart() {
    var container = document.getElementById('pcTvChartContainer');
    if (!container) return;
    if (typeof LightweightCharts === 'undefined') {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--red);font-family:var(--font-mono);font-size:12px;text-align:center;padding:20px;">CRITICAL ERROR: LightweightCharts library not loaded.<br>Please check your internet connection or clear cache.</div>';
      return;
    }
    try {
      chart.tv = LightweightCharts.createChart(container, {
        autoSize: true,
        layout: { background: { color: 'transparent' }, textColor: '#5a5a65', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 },
        grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal, vertLine: { color: 'rgba(251,191,36,0.3)', labelBackgroundColor: '#0e0e11' }, horzLine: { color: 'rgba(251,191,36,0.3)', labelBackgroundColor: '#0e0e11' } },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true, secondsVisible: false },
      });
      chart.tvCandle = chart.tv.addSeries(LightweightCharts.CandlestickSeries, { upColor: '#22C55E', downColor: '#EF4444', borderVisible: false, wickUpColor: '#22C55E', wickDownColor: '#EF4444' });
      chart.tvVolume = chart.tv.addSeries(LightweightCharts.HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'volume', lastValueVisible: false });
      chart.tvVolume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      loadChartBars();
    } catch (e) {
      console.error('Chart Init Error:', e);
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--red);font-family:var(--font-mono);font-size:12px;text-align:center;padding:20px;">Chart Initialization Failed: ' + e.message + '</div>';
    }
  }

  async function loadChartBars() {
    try {
      var tf = chart.tf === 'tick' ? '1m' : chart.tf;
      var limit = chart.tf === '5m' ? 200 : 390;
      var res = await fetch('/api/chart/bars/' + state.ticker + '?tf=' + tf + '&limit=' + limit);
      var data = await res.json();
      if (data.bars && data.bars.length > 0) { chart.bars = data.bars; chart.loaded = true; updateChartPrice(); renderChartData(); }
    } catch(e) {}
  }

  function setChartTF(tf) {
    var oldTf = chart.tf;
    chart.tf = tf;
    var page = document.getElementById('page-pricechart');
    if (page) page.querySelectorAll('.chart-tf-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tf === tf); });
    if (SQ.socket && SQ.socket.connected) {
      SQ.socket.emit('unsubscribe:chart', { ticker: state.ticker, tf: oldTf });
      SQ.socket.emit('subscribe:chart', { ticker: state.ticker, tf: tf });
    }
    chart.bars = []; renderChartData();
    if (tf !== 'tick') loadChartBars();
  }

  function setChartMode(mode) {
    chart.mode = mode;
    var page = document.getElementById('page-pricechart');
    if (page) page.querySelectorAll('.chart-mode-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.mode === mode); });
    switchSeriesMode();
  }

  function toggleIndicator(ind) {
    chart.indicators[ind] = !chart.indicators[ind];
    var page = document.getElementById('page-pricechart');
    if (page) page.querySelectorAll('.chart-ind-btn').forEach(function(b) { b.classList.toggle('active', chart.indicators[b.dataset.ind]); });
    rebuildIndicatorPanes();
  }

  function renderChartData() {
    if (!chart.tv || !chart.tvCandle) return;
    var data;
    if (chart.tf === 'tick') data = chart.ticks.map(function(t) { return { t: t.t, o: t.p, h: t.p, l: t.p, c: t.p, v: t.v || 0 }; });
    else data = chart.bars;
    if (!data || data.length === 0) return;
    var tvBars = data.map(function(b) { return { time: msToSec(b.t), open: b.o, high: b.h, low: b.l, close: b.c }; });
    if (chart.mode === 'candle' && chart.tf !== 'tick') {
      if (!chart.tvCandle) return;
      chart.tvCandle.setData(tvBars);
      if (chart.tvArea) { chart.tv.removeSeries(chart.tvArea); chart.tvArea = null; }
    } else {
      switchSeriesMode();
      var lineData = data.map(function(b) { return { time: msToSec(b.t), value: b.c }; });
      if (chart.tvArea) chart.tvArea.setData(lineData);
    }
    if (chart.tvVolume) {
      var volData = data.map(function(b) { return { time: msToSec(b.t), value: b.v || 0, color: b.c >= b.o ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }; });
      chart.tvVolume.setData(volData);
    }
    rebuildIndicatorPanes(); applyGEXLevels(); applySpotPrice(); drawGEXProfile();
  }

  function switchSeriesMode() {
    if (!chart.tv) return;
    if (chart.mode === 'line' || chart.tf === 'tick') {
      if (chart.tvCandle) chart.tvCandle.applyOptions({ visible: false });
      if (!chart.tvArea) {
        chart.tvArea = chart.tv.addSeries(LightweightCharts.AreaSeries, { lineColor: '#fbbf24', topColor: 'rgba(251,191,36,0.08)', bottomColor: 'rgba(251,191,36,0)', lineWidth: 1.5, crosshairMarkerVisible: true });
      }
      var data = chart.tf === 'tick' ? chart.ticks.map(function(t) { return { t: t.t, c: t.p }; }) : chart.bars;
      if (data && data.length > 0) chart.tvArea.setData(data.map(function(b) { return { time: msToSec(b.t), value: b.c }; }));
    } else {
      if (chart.tvCandle) chart.tvCandle.applyOptions({ visible: true });
      if (chart.tvArea) { chart.tv.removeSeries(chart.tvArea); chart.tvArea = null; }
    }
  }

  function clearPriceLines() {
    var series = chart.tvCandle || chart.tvArea;
    if (!series) return;
    for (var i = 0; i < chart.priceLines.length; i++) { try { series.removePriceLine(chart.priceLines[i]); } catch(e) {} }
    chart.priceLines = [];
  }

  function applyGEXLevels() {
    if (!chart.tvCandle) return;
    clearPriceLines();
    var series = chart.tvCandle;
    var tgt = chart.targetLevels;
    if (chart.levels) {
      if (chart.levels.callWall) chart.priceLines.push(series.createPriceLine({ price: chart.levels.callWall, color: '#22C55E', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: 'Call Wall' }));
      if (chart.levels.putWall) chart.priceLines.push(series.createPriceLine({ price: chart.levels.putWall, color: '#EF4444', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: 'Put Wall' }));
      if (chart.levels.gammaFlip) chart.priceLines.push(series.createPriceLine({ price: chart.levels.gammaFlip, color: '#F59E0B', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: true, title: 'Gamma Flip' }));
      if (chart.levels.maxPain) chart.priceLines.push(series.createPriceLine({ price: chart.levels.maxPain, color: '#6b7280', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: true, title: 'Max Pain' }));
    }
    if (tgt) {
      if (tgt.walls) {
        var cw = tgt.walls.callWalls || [], pw = tgt.walls.putWalls || [];
        if (cw.length > 0 && !(chart.levels && chart.levels.callWall)) chart.priceLines.push(series.createPriceLine({ price: cw[0].strike, color: '#22C55E', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: 'Call Wall' }));
        if (pw.length > 0 && !(chart.levels && chart.levels.putWall)) chart.priceLines.push(series.createPriceLine({ price: pw[0].strike, color: '#EF4444', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: 'Put Wall' }));
      }
      if (tgt.gammaFlip && !(chart.levels && chart.levels.gammaFlip)) chart.priceLines.push(series.createPriceLine({ price: tgt.gammaFlip, color: '#F59E0B', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: true, title: 'Flip' }));
      if (tgt.volTrigger) chart.priceLines.push(series.createPriceLine({ price: tgt.volTrigger, color: '#22d3ee', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dotted, axisLabelVisible: true, title: 'Vol Trigger' }));
    }
  }

  function applySpotPrice() {
    if (!chart.tvCandle) return;
    if (chart.spotPriceLine) { try { chart.tvCandle.removePriceLine(chart.spotPriceLine); } catch(e) {} chart.spotPriceLine = null; }
    var tgt = chart.targetLevels;
    var spotPrice = (tgt && tgt.spot) || (state.gexData && state.gexData.spotPrice);
    if (spotPrice) {
      chart.spotPriceLine = chart.tvCandle.createPriceLine({ price: spotPrice, color: 'var(--accent)', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: true, title: 'Spot' });
    }
  }

  function drawGEXProfile() {
    var canvas = document.getElementById('pcProfileCanvas');
    if (!canvas || !chart.gexProfile || chart.gexProfile.length === 0 || !chart.tvCandle) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = 'transparent'; ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h); ctx.stroke();
    ctx.fillStyle = '#5a5a65'; ctx.font = '8px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillText('GEX PROFILE', w / 2, 12);
    var profile = chart.gexProfile;
    var maxAbsGEX = 0;
    for (var i = 0; i < profile.length; i++) { var absN = Math.abs(profile[i].net); if (absN > maxAbsGEX) maxAbsGEX = absN; }
    if (maxAbsGEX === 0) maxAbsGEX = 1;
    var centerX = w / 2, halfBar = (w / 2) - 8;
    for (var p = 0; p < profile.length; p++) {
      var strike = profile[p].strike, netGEX = profile[p].net;
      var barY = chart.tvCandle.priceToCoordinate(strike);
      if (barY === null || barY < 14 || barY > h) continue;
      var barLen = (Math.abs(netGEX) / maxAbsGEX) * halfBar;
      var barH = Math.max(1, Math.min(4, h / profile.length * 0.6));
      if (netGEX >= 0) { ctx.fillStyle = 'rgba(34,197,94,0.55)'; ctx.fillRect(centerX, barY - barH/2, barLen, barH); }
      else { ctx.fillStyle = 'rgba(239,68,68,0.55)'; ctx.fillRect(centerX - barLen, barY - barH/2, barLen, barH); }
    }
    ctx.strokeStyle = '#333'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(centerX, 14); ctx.lineTo(centerX, h); ctx.stroke();
  }

  function updateChartPrice() {
    var el = document.getElementById('pcChartLastPrice');
    var chg = document.getElementById('pcChartPriceChange');
    if (!el) return;
    var bars = chart.bars;
    if (bars.length === 0) { el.textContent = '\\u2014'; if (chg) chg.textContent = ''; return; }
    var last = bars[bars.length - 1], first = bars[0];
    el.textContent = '$' + last.c.toFixed(2);
    var diff = last.c - first.o;
    var pct = (diff / first.o * 100).toFixed(2);
    var sign = diff >= 0 ? '+' : '';
    if (chg) { chg.textContent = sign + diff.toFixed(2) + ' (' + sign + pct + '%)'; chg.style.color = diff >= 0 ? '#22C55E' : '#EF4444'; }
  }

  // ── Indicator Calculations ──
  function calcVWAP(data) {
    if (!data || data.length === 0) return [];
    var result = [], cumTPV = 0, cumV = 0, prevDay = null;
    for (var i = 0; i < data.length; i++) {
      var d = new Date(data[i].t);
      var day = d.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
      if (day !== prevDay) { cumTPV = 0; cumV = 0; prevDay = day; }
      var tp = (data[i].h + data[i].l + data[i].c) / 3;
      var v = data[i].v || 0;
      if (v === 0) result.push(cumV > 0 ? cumTPV / cumV : data[i].c);
      else { cumTPV += tp * v; cumV += v; result.push(cumTPV / cumV); }
    }
    return result;
  }

  function calcRSI(data, period) {
    period = period || 14;
    if (!data || data.length < period + 1) return [];
    var result = [], gains = [], losses = [];
    for (var i = 1; i <= period; i++) { var delta = data[i].c - data[i-1].c; gains.push(delta > 0 ? delta : 0); losses.push(delta < 0 ? -delta : 0); }
    var avgGain = gains.reduce(function(a,b){return a+b;},0) / period;
    var avgLoss = losses.reduce(function(a,b){return a+b;},0) / period;
    for (var j = 0; j < period; j++) result.push(null);
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
    for (var k = period + 1; k < data.length; k++) {
      var d = data[k].c - data[k-1].c;
      avgGain = (avgGain * (period-1) + (d > 0 ? d : 0)) / period;
      avgLoss = (avgLoss * (period-1) + (d < 0 ? -d : 0)) / period;
      result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
    }
    return result;
  }

  function calcMACD(data, fast, slow, sig) {
    fast = fast || 12; slow = slow || 26; sig = sig || 9;
    if (!data || data.length < slow) return { macd: [], signal: [], histogram: [] };
    var closes = data.map(function(d) { return d.c; });
    var macdLine = [], signalLine = [], histogram = [];
    var slowSMA = 0; for (var i = 0; i < slow; i++) slowSMA += closes[i]; slowSMA /= slow;
    var fastSMA = 0; for (var j = 0; j < fast; j++) fastSMA += closes[j]; fastSMA /= fast;
    var emaFast = fastSMA, emaSlow = slowSMA;
    var kFast = 2/(fast+1), kSlow = 2/(slow+1), kSig = 2/(sig+1);
    for (var m = 0; m < data.length; m++) {
      if (m < slow - 1) { macdLine.push(null); }
      else if (m === slow - 1) {
        emaFast = 0; for (var fi = 0; fi < fast; fi++) emaFast += closes[fi]; emaFast /= fast;
        for (var fi2 = fast; fi2 <= m; fi2++) emaFast = closes[fi2] * kFast + emaFast * (1 - kFast);
        macdLine.push(emaFast - emaSlow);
      } else { emaFast = closes[m] * kFast + emaFast * (1 - kFast); emaSlow = closes[m] * kSlow + emaSlow * (1 - kSlow); macdLine.push(emaFast - emaSlow); }
    }
    var sigStart = -1, macdVals = [];
    for (var s = 0; s < macdLine.length; s++) { if (macdLine[s] !== null) { macdVals.push({ idx: s, val: macdLine[s] }); if (macdVals.length === sig && sigStart < 0) sigStart = s; } }
    var emaSig = 0;
    if (macdVals.length >= sig) { for (var sv = 0; sv < sig; sv++) emaSig += macdVals[sv].val; emaSig /= sig; }
    for (var sl = 0; sl < data.length; sl++) {
      if (sl < sigStart) { signalLine.push(null); histogram.push(null); }
      else if (sl === sigStart) { signalLine.push(emaSig); histogram.push(macdLine[sl] - emaSig); }
      else if (macdLine[sl] !== null) { emaSig = macdLine[sl] * kSig + emaSig * (1 - kSig); signalLine.push(emaSig); histogram.push(macdLine[sl] - emaSig); }
      else { signalLine.push(null); histogram.push(null); }
    }
    return { macd: macdLine, signal: signalLine, histogram: histogram };
  }

  function rebuildIndicatorPanes() {
    if (!chart.tv) return;
    var data;
    if (chart.tf === 'tick') data = chart.ticks.map(function(t) { return { t: t.t, o: t.p, h: t.p, l: t.p, c: t.p, v: t.v || 0 }; });
    else data = chart.bars;
    if (!data || data.length === 0) return;

    if (chart.indicators.vwap) {
      var vwapVals = calcVWAP(data);
      if (!chart.tvVwap) chart.tvVwap = chart.tv.addSeries(LightweightCharts.LineSeries, { color: '#60A5FA', lineWidth: 1.5, priceScaleId: '', lastValueVisible: false });
      var vwapData = [];
      for (var vi = 0; vi < vwapVals.length; vi++) vwapData.push({ time: msToSec(data[vi].t), value: vwapVals[vi] });
      chart.tvVwap.setData(vwapData);
    } else if (chart.tvVwap) { chart.tv.removeSeries(chart.tvVwap); chart.tvVwap = null; }

    if (chart.indicators.rsi) {
      var rsiVals = calcRSI(data, 14);
      if (!chart.rsiPane) {
        chart.rsiPane = chart.tv.addPane();
        chart.tvRsi = chart.tv.addSeries(LightweightCharts.LineSeries, { color: '#fbbf24', lineWidth: 1.5, lastValueVisible: true, title: 'RSI(14)' }, chart.rsiPane.paneIndex());
        chart.tv.panes()[0].setStretchFactor(3); chart.rsiPane.setStretchFactor(1);
      }
      var rsiData = [];
      for (var ri = 0; ri < rsiVals.length; ri++) { if (rsiVals[ri] !== null) rsiData.push({ time: msToSec(data[ri].t), value: rsiVals[ri] }); }
      chart.tvRsi.setData(rsiData);
    } else if (chart.tvRsi) {
      if (chart.rsiPane) { chart.tv.removePane(chart.rsiPane.paneIndex()); chart.rsiPane = null; }
      chart.tvRsi = null; chart.tv.panes()[0].setStretchFactor(3);
    }

    if (chart.indicators.macd) {
      var macdCalc = calcMACD(data, 12, 26, 9);
      if (!chart.macdPane) {
        chart.macdPane = chart.tv.addPane();
        var mpIdx = chart.macdPane.paneIndex();
        chart.tvMacdHist = chart.tv.addSeries(LightweightCharts.HistogramSeries, { lastValueVisible: false, priceFormat: { type: 'price', precision: 2, minMove: 0.01 }, title: 'MACD' }, mpIdx);
        chart.tvMacdLine = chart.tv.addSeries(LightweightCharts.LineSeries, { color: '#fbbf24', lineWidth: 1.5, lastValueVisible: false }, mpIdx);
        chart.tvMacdSignal = chart.tv.addSeries(LightweightCharts.LineSeries, { color: '#f59e0b', lineWidth: 1, lastValueVisible: false }, mpIdx);
        chart.macdPane.setStretchFactor(1);
      }
      var histData = [], macdLineData = [], sigData = [];
      for (var mi = 0; mi < macdCalc.histogram.length; mi++) {
        var t = msToSec(data[mi].t);
        if (macdCalc.histogram[mi] !== null) histData.push({ time: t, value: macdCalc.histogram[mi], color: macdCalc.histogram[mi] >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)' });
        if (macdCalc.macd[mi] !== null) macdLineData.push({ time: t, value: macdCalc.macd[mi] });
        if (macdCalc.signal[mi] !== null) sigData.push({ time: t, value: macdCalc.signal[mi] });
      }
      chart.tvMacdHist.setData(histData); chart.tvMacdLine.setData(macdLineData); chart.tvMacdSignal.setData(sigData);
    } else if (chart.tvMacdHist) {
      if (chart.macdPane) { chart.tv.removePane(chart.macdPane.paneIndex()); chart.macdPane = null; }
      chart.tvMacdHist = null; chart.tvMacdLine = null; chart.tvMacdSignal = null;
    }
  }

  // ── Key Levels ──
  function updateKeyLevels() {
    var el = document.getElementById('pcKeyLevels');
    if (!el) return;
    var t = state.targetData;
    if (!t) { el.innerHTML = ''; return; }
    var html = '';
    if (t.walls) {
      var cw = t.walls.callWalls || [];
      var pw = t.walls.putWalls || [];
      if (cw.length > 0) html += '<span class="kl-badge kl-call">CW $' + cw[0].strike + '</span>';
      if (pw.length > 0) html += '<span class="kl-badge kl-put">PW $' + pw[0].strike + '</span>';
    }
    if (t.gammaFlip) html += '<span class="kl-badge kl-flip">Flip $' + (typeof t.gammaFlip === 'number' ? t.gammaFlip.toFixed(1) : t.gammaFlip) + '</span>';
    el.innerHTML = html;
  }

  // ── Spot Badge ──
  function updateSpotBadge() {
    var el = document.getElementById('pcSpotBadge');
    if (!el) return;
    var spot = (state.targetData && state.targetData.spot) || (state.gexData && state.gexData.spotPrice);
    if (!spot) { el.textContent = '\\u2014'; return; }
    el.textContent = '$' + spot.toFixed(2);
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  // ── Footer ──
  function updateFooter() {
    var el = document.getElementById('pcFooterRight');
    if (!el) return;
    el.textContent = state.ticker + ' \\u2022 ' + new Date().toLocaleTimeString();
  }

  // ── Socket.IO event handlers ──
  function handleChartBar(data) {
    if (!data || data.ticker !== state.ticker) return;
    if (data.tf !== chart.tf) return;
    var last = chart.bars[chart.bars.length - 1];
    if (last && last.t === data.t) { last.o = data.o; last.h = data.h; last.l = data.l; last.c = data.c; last.v = data.v; }
    else { chart.bars.push({ t: data.t, o: data.o, h: data.h, l: data.l, c: data.c, v: data.v }); if (chart.bars.length > 500) chart.bars.shift(); }
    updateChartPrice();
    if (chart.tvCandle) chart.tvCandle.update({ time: msToSec(data.t), open: data.o, high: data.h, low: data.l, close: data.c });
    if (chart.tvVolume) chart.tvVolume.update({ time: msToSec(data.t), value: data.v || 0, color: data.c >= data.o ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' });
  }

  function handleChartTick(data) {
    if (!data || data.ticker !== state.ticker) return;
    chart.ticks.push({ t: data.t, p: data.p, v: data.v || 0 });
    if (chart.ticks.length > 2000) chart.ticks.shift();
    var el = document.getElementById('pcChartLastPrice');
    if (el && typeof data.p === 'number') el.textContent = '$' + data.p.toFixed(2);
    if (chart.tf !== 'tick' && chart.bars.length > 0 && typeof data.p === 'number') {
      var lastBar = chart.bars[chart.bars.length - 1];
      lastBar.c = data.p;
      if (data.p > lastBar.h) lastBar.h = data.p;
      if (data.p < lastBar.l) lastBar.l = data.p;
      if (chart.tvCandle) chart.tvCandle.update({ time: msToSec(lastBar.t), open: lastBar.o, high: lastBar.h, low: lastBar.l, close: lastBar.c });
    }
    if (chart.tf === 'tick' && chart.tvArea) chart.tvArea.update({ time: msToSec(data.t), value: data.p });
  }

  function handleChartLevels(data) {
    if (!data || data.ticker !== state.ticker) return;
    chart.levels = data;
    applyGEXLevels();
  }

  // ── Init / Destroy ──
  function init() {
    $.tickerInput = document.getElementById('pcTickerInput');
    $.tickerDropdown = document.getElementById('pcTickerDropdown');
    $.loadBtn = document.getElementById('pcLoadBtn');

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
      if (!e.target.closest('#pcTickerDropdown') && !e.target.closest('#pcTickerInput')) {
        if ($.tickerDropdown) $.tickerDropdown.classList.remove('show');
      }
    };
    document.addEventListener('click', _docClickHandler);

    // Delegated event listeners
    var page = document.getElementById('page-pricechart');
    if (page) {
      page.addEventListener('click', function(e) {
        var target = e.target;
        if (target.classList.contains('chart-tf-btn') && target.dataset.tf) { setChartTF(target.dataset.tf); return; }
        if (target.classList.contains('chart-mode-btn') && target.dataset.mode) { setChartMode(target.dataset.mode); return; }
        if (target.classList.contains('chart-ind-btn') && target.dataset.ind) { toggleIndicator(target.dataset.ind); return; }
      });
    }

    // Init price chart
    initPriceChart();

    // Subscribe socket events
    if (SQ.socket) {
      socketHandlers = {
        'chart:bar': handleChartBar,
        'chart:tick': handleChartTick,
        'chart:levels': handleChartLevels,
      };
      Object.keys(socketHandlers).forEach(function(evt) { SQ.socket.on(evt, socketHandlers[evt]); });

      if (SQ.socket.connected && state.ticker) {
        SQ.socket.emit('subscribe:chart', { ticker: state.ticker, tf: chart.tf });
      }
    }

    // Load data
    loadTicker();
  }

  function destroy() {
    if (SQ.socket) {
      SQ.socket.emit('unsubscribe:chart', { ticker: state.ticker, tf: chart.tf });
      Object.keys(socketHandlers).forEach(function(evt) { SQ.socket.off(evt, socketHandlers[evt]); });
      socketHandlers = {};
    }

    if (_docClickHandler) { document.removeEventListener('click', _docClickHandler); _docClickHandler = null; }

    // Destroy TradingView chart
    if (chart.tv) { try { chart.tv.remove(); } catch(e) {} chart.tv = null; }
    chart.tvCandle = null; chart.tvVolume = null; chart.tvVwap = null;
    chart.tvRsi = null; chart.tvMacdHist = null; chart.tvMacdLine = null;
    chart.tvMacdSignal = null; chart.tvArea = null;
    chart.rsiPane = null; chart.macdPane = null;
    chart.priceLines = [];
    chart.spotPriceLine = null;

    // Reset state
    state.targetData = null; state.gexData = null;
    state.ticker = 'SPY';
    chart.bars = []; chart.ticks = []; chart.levels = null;
    chart.gexProfile = null; chart.targetLevels = null; chart.loaded = false;

    $ = {};
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { getPriceChartPageCSS, getPriceChartPageHTML, getPriceChartPageJS };
