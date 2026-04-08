/**
 * Unified Dashboard — Merges Home + Positions + Portfolio into one page
 *
 * Serves:
 *   GET /api/portfolio/*     → JSON API endpoints
 *
 * SPA page: #dashboard (was #portfolio)
 */

const alpaca = require('../services/alpaca');

function registerPortfolioRoutes(app) {
  app.get('/api/portfolio/account', async (_req, res) => {
    try {
      const cached = alpaca.getCached();
      if (cached.account) return res.json(cached.account);
      const data = await alpaca.getAccount();
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: 'Alpaca unavailable', message: err.message });
    }
  });

  app.get('/api/portfolio/positions', async (_req, res) => {
    try {
      const cached = alpaca.getCached();
      if (cached.positions) return res.json(cached.positions);
      const data = await alpaca.getPositions();
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: 'Alpaca unavailable', message: err.message });
    }
  });

  app.get('/api/portfolio/orders', async (_req, res) => {
    try {
      const cached = alpaca.getCached();
      if (cached.orders) return res.json(cached.orders);
      const data = await alpaca.getOrders();
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: 'Alpaca unavailable', message: err.message });
    }
  });

  app.get('/api/portfolio/history', async (req, res) => {
    try {
      const period = req.query.period || '1M';
      const timeframe = req.query.timeframe || '1D';
      const data = await alpaca.getPortfolioHistory(period, timeframe);
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: 'Alpaca unavailable', message: err.message });
    }
  });

  app.get('/api/portfolio/lessons/:ticker', (req, res) => {
    try {
      const engine = require('../services/options-engine');
      const lessons = engine.getTradingLessons ? engine.getTradingLessons() : [];
      const matched = alpaca.filterLessonsForTicker(lessons, req.params.ticker);
      res.json(matched);
    } catch (err) {
      res.json([]);
    }
  });

  console.log('[Dashboard] Portfolio Tracker API routes registered');
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  SPA-embeddable exports — CSS / HTML / JS
 * ═══════════════════════════════════════════════════════════════════════════ */

function getPortfolioPageCSS() {
  return `
/* ── Unified Dashboard SPA Styles ─────────────────────────────── */
#page-dashboard .cockpit-bar {
  display: flex; align-items: center; gap: 16px;
  padding: 8px 20px; background: var(--bg-surface);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
  overflow-x: auto;
}
#page-dashboard .cockpit-item { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }
#page-dashboard .cockpit-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
#page-dashboard .cockpit-value { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--text); }
#page-dashboard .cockpit-sep { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }

#page-dashboard .safety-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  padding: 12px; padding-top: 0;
}
#page-dashboard .safety-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px;
}
#page-dashboard .safety-card .label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em; }
#page-dashboard .safety-card .value { font-family: var(--font-mono); font-size: 22px; font-weight: 700; margin-top: 4px; }
#page-dashboard .safety-card .sub { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 4px; }

#page-dashboard .dash-grid {
  display: grid; grid-template-columns: 1.5fr 1fr;
  gap: 12px; padding: 12px; min-height: 0;
}
#page-dashboard .col-left, #page-dashboard .col-right { display: flex; flex-direction: column; gap: 12px; min-height: 0; }

#page-dashboard .panel {
  background: var(--surface, var(--bg-surface)); border: 1px solid var(--border);
  border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;
}
#page-dashboard .panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.02em; flex-shrink: 0;
}
#page-dashboard .panel-head .count { color: var(--accent); margin-left: 6px; }
#page-dashboard .panel-body { padding: 0; flex: 1; overflow: auto; }

#page-dashboard .pos-row-item {
  display: grid; grid-template-columns: 100px 50px 72px 72px 80px 64px 64px;
  align-items: center; gap: 8px; padding: 8px 14px;
  font-family: var(--font-mono); font-size: 12px;
  border-bottom: 1px solid var(--border); cursor: pointer;
  transition: background 0.15s;
}
#page-dashboard .pos-row-item:hover { background: var(--bg-surface); }
#page-dashboard .pos-symbol { font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#page-dashboard .pos-qty { color: var(--text-muted); }
#page-dashboard .pos-type-tag {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 2px 6px;
  border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px;
}

#page-dashboard .lessons-panel {
  display: none; padding: 8px 14px 12px 14px; background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
}
#page-dashboard .lessons-panel.open { display: block; }
#page-dashboard .lesson-item {
  display: flex; align-items: center; gap: 10px; padding: 6px 0;
  border-bottom: 1px solid var(--border); font-size: 11px;
}
#page-dashboard .lesson-item:last-child { border-bottom: none; }
#page-dashboard .lesson-text { flex: 1; color: var(--text); font-family: var(--font-mono); font-size: 11px; }
#page-dashboard .lesson-strength { width: 60px; height: 5px; background: var(--bar-track, var(--bg-surface)); border-radius: 3px; overflow: hidden; flex-shrink: 0; }
#page-dashboard .lesson-strength-fill { height: 100%; border-radius: 3px; background: var(--accent); }
#page-dashboard .lesson-cat {
  font-family: var(--font-mono); font-size: 9px; font-weight: 600;
  padding: 2px 6px; border-radius: 3px; background: var(--accent-subtle); color: var(--accent);
  text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0;
}
#page-dashboard .lesson-confirmed { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); flex-shrink: 0; }

#page-dashboard .chart-wrap { position: relative; flex: 1; min-height: 340px; }
#page-dashboard .tf-btns { display: flex; gap: 4px; }
#page-dashboard .tf-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  padding: 3px 10px; border-radius: 4px; cursor: pointer;
  background: transparent; color: var(--text-muted);
  border: 1px solid var(--border); transition: all 0.15s;
}
#page-dashboard .tf-btn.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); }
#page-dashboard .tf-btn:hover:not(.active) { color: var(--text); }

#page-dashboard .bottom-panels {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  padding: 0 12px 12px 12px;
}

#page-dashboard .order-row {
  display: grid; grid-template-columns: 80px 1fr 50px 60px 72px 70px;
  align-items: center; gap: 8px; padding: 6px 14px;
  font-family: var(--font-mono); font-size: 11px;
  border-bottom: 1px solid var(--border);
}
#page-dashboard .order-side { font-weight: 700; }
#page-dashboard .order-status {
  font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 3px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
#page-dashboard .order-status.filled { background: rgba(34,197,94,0.12); color: var(--green); }
#page-dashboard .order-status.canceled, #page-dashboard .order-status.cancelled { background: rgba(239,68,68,0.12); color: var(--red); }
#page-dashboard .order-status.new, #page-dashboard .order-status.pending_new, #page-dashboard .order-status.accepted { background: var(--yellow-dim); color: var(--yellow); }
#page-dashboard .order-status.partially_filled { background: var(--accent-subtle); color: var(--accent); }
#page-dashboard .filter-input {
  font-family: var(--font-mono); font-size: 11px; color: var(--text);
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 3px 8px; width: 80px; outline: none;
}
#page-dashboard .filter-input:focus { border-color: var(--accent); }

#page-dashboard .error-banner {
  display: none; padding: 10px 20px; background: rgba(239,68,68,0.12);
  border-bottom: 1px solid var(--red);
  font-family: var(--font-mono); font-size: 12px; color: var(--red);
  text-align: center;
}
#page-dashboard .error-banner.visible { display: block; }

#page-dashboard .empty { color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; padding: 20px 0; text-align: center; }

@media (max-width: 960px) {
  #page-dashboard .dash-grid { grid-template-columns: 1fr; }
  #page-dashboard .bottom-panels { grid-template-columns: 1fr; }
  #page-dashboard .cockpit-bar { flex-wrap: wrap; }
  #page-dashboard .safety-row { grid-template-columns: 1fr; }
  #page-dashboard .pos-row-item { grid-template-columns: 80px 40px 60px 60px 70px 54px 54px; font-size: 11px; }
}
`;
}

function getPortfolioPageHTML() {
  return `<div class="page" id="page-dashboard">
  <div class="page-header">
    <div><h2>Dashboard</h2><div class="subtitle">Real-time overview</div></div>
    <button class="btn" onclick="SQ.dashboard.refresh()">Refresh</button>
  </div>

  <div class="error-banner" id="dashErrorBanner"></div>

  <!-- Cockpit Bar (6 stats) -->
  <div class="cockpit-bar">
    <div class="cockpit-item"><span class="cockpit-label">Equity</span><span class="cockpit-value" id="dashStatEquity">&mdash;</span></div>
    <div class="cockpit-sep"></div>
    <div class="cockpit-item"><span class="cockpit-label">Day P&amp;L</span><span class="cockpit-value" id="dashStatDayPnl">&mdash;</span></div>
    <div class="cockpit-sep"></div>
    <div class="cockpit-item"><span class="cockpit-label">Buying Power</span><span class="cockpit-value" id="dashStatBuyingPower">&mdash;</span></div>
    <div class="cockpit-sep"></div>
    <div class="cockpit-item"><span class="cockpit-label">Cash</span><span class="cockpit-value" id="dashStatCash">&mdash;</span></div>
    <div class="cockpit-sep"></div>
    <div class="cockpit-item"><span class="cockpit-label">Win Rate</span><span class="cockpit-value" id="dashStatWinRate">&mdash;</span></div>
    <div class="cockpit-sep"></div>
    <div class="cockpit-item"><span class="cockpit-label">SHARK</span><span class="cockpit-value" id="dashStatShark">&mdash;</span></div>
  </div>

  <!-- Risk & Safety Row -->
  <div style="padding: 12px 12px 0 12px;">
    <div class="safety-row" id="dashSafety" style="padding:0;">
      <div class="safety-card"><div class="label">Kill Switch</div><div class="value" id="dashKillSwitch">&mdash;</div></div>
      <div class="safety-card"><div class="label">Circuit Breaker</div><div class="value" id="dashCircuitBreaker">&mdash;</div><div class="sub" id="dashCBSub"></div></div>
      <div class="safety-card"><div class="label">Options Daily Loss</div><div class="value" id="dashOptLoss">&mdash;</div></div>
    </div>
  </div>

  <!-- Main Grid: Positions + Equity Chart -->
  <div class="dash-grid">
    <div class="col-left">
      <div class="panel" style="flex:1; min-height:300px;">
        <div class="panel-head">
          <span>POSITIONS <span class="count" id="dashPosCount">0</span></span>
        </div>
        <div class="panel-body" id="dashPositions">
          <div class="empty">Loading positions...</div>
        </div>
      </div>
    </div>

    <div class="col-right">
      <div class="panel" style="flex:1; min-height:400px;">
        <div class="panel-head">
          <span>EQUITY</span>
          <div class="tf-btns">
            <button class="tf-btn active" data-period="1D" data-tf="5Min">1D</button>
            <button class="tf-btn" data-period="1W" data-tf="1H">1W</button>
            <button class="tf-btn" data-period="1M" data-tf="1D">1M</button>
            <button class="tf-btn" data-period="3M" data-tf="1D">3M</button>
            <button class="tf-btn" data-period="all" data-tf="1W">ALL</button>
          </div>
        </div>
        <div class="panel-body" style="padding:0;">
          <div class="chart-wrap" id="dashEquityChart"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom: Recent Trades + Recent Orders side by side -->
  <div class="bottom-panels">
    <div class="panel" style="max-height:320px;">
      <div class="panel-head">
        <span>RECENT TRADES <span class="count" id="dashTradeCount">0</span></span>
      </div>
      <div class="panel-body" id="dashTradesBody" style="overflow-y:auto;">
        <div class="empty">Loading trades...</div>
      </div>
    </div>
    <div class="panel" style="max-height:320px;">
      <div class="panel-head">
        <span>RECENT ORDERS <span class="count" id="dashOrderCount">0</span></span>
        <input type="text" class="filter-input" id="dashOrderFilter" placeholder="Filter...">
      </div>
      <div class="panel-body" id="dashOrderBody" style="overflow-y:auto;">
        <div class="empty">Loading orders...</div>
      </div>
    </div>
  </div>
</div>`;
}

function getPortfolioPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.dashboard = (function() {
  // ── Helpers ──────────────────────────────────────────────
  var fmt = function(n) { return n == null ? '\\u2014' : Number(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); };
  var fmtPct = function(n) { return n == null ? '\\u2014' : (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%'; };
  var pnlColor = function(n) { return n >= 0 ? 'var(--green)' : 'var(--red)'; };
  var pnlSign = function(n) { return n >= 0 ? '+$' + fmt(n) : '-$' + fmt(Math.abs(n)); };

  function formatOptionsSymbol(sym) {
    if (!sym) return sym;
    try {
      var trimmed = sym.replace(/\\s+/g, '');
      var m = trimmed.match(/^([A-Z]+)(\\d{6})([CP])(\\d{8})$/);
      if (!m) return sym;
      var root = m[1], dateStr = m[2], type = m[3], priceStr = m[4];
      var mm = parseInt(dateStr.slice(2,4), 10);
      var dd = dateStr.slice(4,6);
      var strike = parseInt(priceStr, 10) / 1000;
      var strikeStr = strike % 1 === 0 ? '$' + strike : '$' + strike.toFixed(2);
      var typeName = type === 'C' ? 'Call' : 'Put';
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return root + ' ' + months[mm-1] + ' ' + dd + ' ' + strikeStr + ' ' + typeName;
    } catch(e) { return sym; }
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── State ────────────────────────────────────────────────
  var positions = [];
  var orders = [];
  var lessonsCache = {};
  var equityChart = null;
  var areaSeries = null;
  var socketSubscribed = false;

  // ── DOM refs helper ──────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  // ── Account ──────────────────────────────────────────────
  function updateAccount(acct) {
    if (!acct) return;
    var eq = parseFloat(acct.equity || acct.portfolio_value || 0);
    var prevEq = parseFloat(acct.last_equity || eq);
    var dayPnl = eq - prevEq;
    $('dashStatEquity').textContent = '$' + fmt(eq);
    var spnl = $('dashStatDayPnl');
    spnl.textContent = pnlSign(dayPnl);
    spnl.style.color = pnlColor(dayPnl);
    $('dashStatBuyingPower').textContent = '$' + fmt(parseFloat(acct.buying_power || 0));
    $('dashStatCash').textContent = '$' + fmt(parseFloat(acct.cash || 0));
  }

  // ── Safety / Overview ────────────────────────────────────
  function updateOverview(data, tradeStats) {
    if (!data) return;
    var pol = data.policy || {};
    var cb = data.circuitBreaker || {};
    var agent = data.agent || {};
    var opts = data.options || {};
    var bot = data.bot || {};

    // Update sidebar status
    var statusDot = document.getElementById('statusDot');
    var statusText = document.getElementById('statusText');
    if (statusDot) statusDot.className = 'status-indicator online';
    if (statusText) statusText.textContent = 'Online \\u2022 ' + (bot.uptime || '');

    // SHARK status
    var sharkEl = $('dashStatShark');
    sharkEl.textContent = agent.enabled ? 'ON' : 'OFF';
    sharkEl.style.color = agent.enabled ? 'var(--green)' : 'var(--red)';

    // Nav badges
    var sharkBadge = document.getElementById('navSharkBadge');
    if (sharkBadge) {
      sharkBadge.textContent = agent.enabled ? 'ON' : 'OFF';
      sharkBadge.className = 'nav-badge ' + (agent.enabled ? 'green' : 'red');
    }

    // Win Rate
    if (tradeStats) {
      var wrEl = $('dashStatWinRate');
      wrEl.textContent = tradeStats.winRate ? tradeStats.winRate + '%' : '\\u2014';
      wrEl.style.color = parseFloat(tradeStats.winRate) >= 50 ? 'var(--green)' : 'var(--red)';
      var navWr = document.getElementById('navWinRate');
      if (navWr) navWr.textContent = tradeStats.winRate ? tradeStats.winRate + '%' : '\\u2014';
    }

    // Kill Switch
    var ks = $('dashKillSwitch');
    ks.textContent = pol.killSwitch ? 'ACTIVE' : 'OFF';
    ks.className = 'value ' + (pol.killSwitch ? 'red' : 'green');
    ks.style.color = pol.killSwitch ? 'var(--red)' : 'var(--green)';

    // Circuit Breaker
    var cbEl = $('dashCircuitBreaker');
    cbEl.textContent = cb.isPaused ? 'PAUSED' : 'OK';
    cbEl.style.color = cb.isPaused ? 'var(--yellow)' : 'var(--green)';
    $('dashCBSub').textContent = 'Bad trades: ' + (cb.consecutiveBadTrades || 0) + '/3 | Trips: ' + (cb.totalTrips || 0);

    // Options daily loss
    var odl = $('dashOptLoss');
    odl.textContent = '$' + (opts.dailyLoss || 0).toFixed(0);
    odl.style.color = (opts.dailyLoss || 0) > 0 ? 'var(--red)' : 'var(--green)';

    // Nav positions badge
    var navPos = document.getElementById('navPositions');
    if (navPos) navPos.textContent = (agent.positionCount || 0) + (opts.activePositions || 0);
  }

  // ── Positions (merged equity + options) ──────────────────
  function renderPositions(equityPositions, optionsPositions) {
    positions = [...(equityPositions || []), ...(optionsPositions || [])];
    var body = $('dashPositions');
    $('dashPosCount').textContent = positions.length;
    if (!positions.length) { body.innerHTML = '<div class="empty">No open positions</div>'; return; }
    var html = '';
    positions.forEach(function(p, i) {
      var sym = p.symbol || '';
      var isOption = sym.length >= 16;
      var displaySym = isOption ? formatOptionsSymbol(sym) : sym;
      var qty = parseFloat(p.qty || p.quantity || 0);
      var avg = parseFloat(p.avg_entry_price || p.avgEntry || 0);
      var cur = parseFloat(p.current_price || 0);
      var upl = parseFloat(p.unrealized_pl || p.unrealizedPL || 0);
      var uplPct = parseFloat(p.unrealized_plpc || p.unrealized_pl_percent || 0);
      if (Math.abs(uplPct) < 1 && String(p.unrealized_plpc || p.unrealized_pl_percent || '').includes('.')) uplPct *= 100;
      var dayChg = parseFloat(p.change_today || 0) * 100;
      var color = upl >= 0 ? 'var(--green)' : 'var(--red)';
      html += '<div class="pos-row-item" data-idx="' + i + '" data-ticker="' + sym.replace(/[^a-zA-Z0-9]/g,'').slice(0,6).trim() + '" onclick="SQ.dashboard._toggleLesson(this,' + i + ')">';
      html += '<span class="pos-symbol" title="' + sym + '">' + displaySym + '</span>';
      html += '<span class="pos-qty">' + qty + '</span>';
      html += '<span>' + fmt(avg) + '</span>';
      html += '<span>' + fmt(cur) + '</span>';
      html += '<span style="color:' + color + ';font-weight:700">' + pnlSign(upl) + '</span>';
      html += '<span style="color:' + color + '">' + fmtPct(uplPct) + '</span>';
      html += '<span style="color:' + (dayChg>=0?'var(--green)':'var(--red)') + '">' + fmtPct(dayChg) + '</span>';
      html += '</div>';
      html += '<div class="lessons-panel" id="dashLessons-' + i + '"></div>';
    });
    body.innerHTML = html;
  }

  // ── Lesson Toggle ────────────────────────────────────────
  function _toggleLesson(row, idx) {
    var panel = $('dashLessons-' + idx);
    if (panel.classList.contains('open')) { panel.classList.remove('open'); return; }
    document.querySelectorAll('#page-dashboard .lessons-panel.open').forEach(function(el) { el.classList.remove('open'); });
    panel.classList.add('open');
    var ticker = row.getAttribute('data-ticker');
    if (lessonsCache[ticker]) { renderLessons(panel, lessonsCache[ticker]); return; }
    panel.innerHTML = '<div class="empty">Loading lessons...</div>';
    fetch('/api/portfolio/lessons/' + encodeURIComponent(ticker))
      .then(function(r) { return r.json(); })
      .then(function(data) { lessonsCache[ticker] = data; renderLessons(panel, data); })
      .catch(function() { panel.innerHTML = '<div class="empty">No lessons found</div>'; });
  }

  function renderLessons(panel, lessons) {
    if (!lessons || !lessons.length) { panel.innerHTML = '<div class="empty">No lessons for this ticker</div>'; return; }
    var html = '';
    lessons.forEach(function(l) {
      var str = Math.min(100, Math.max(0, (l.strength || 0) * 100));
      html += '<div class="lesson-item">';
      html += '<span class="lesson-text">' + (l.rule || l.text || '\\u2014') + '</span>';
      html += '<div class="lesson-strength"><div class="lesson-strength-fill" style="width:' + str + '%"></div></div>';
      html += '<span class="lesson-cat">' + (l.category || 'general') + '</span>';
      html += '<span class="lesson-confirmed">' + (l.confirmed || 0) + 'x</span>';
      html += '</div>';
    });
    panel.innerHTML = html;
  }

  // ── Recent Trades ────────────────────────────────────────
  function renderTrades(tradeData) {
    var trades = (tradeData.trades || []).slice().reverse().slice(0, 10);
    $('dashTradeCount').textContent = trades.length;
    var body = $('dashTradesBody');
    if (trades.length === 0) { body.innerHTML = '<div class="empty">No recent trades</div>'; return; }
    var html = '<table class="tbl"><thead><tr><th>Date</th><th>Ticker</th><th>Dir</th><th>P&L</th></tr></thead><tbody>';
    for (var i = 0; i < trades.length; i++) {
      var t = trades[i];
      var pnlCls = (t.pnl || 0) >= 0 ? 'pnl-pos' : 'pnl-neg';
      html += '<tr>';
      html += '<td class="mono">' + escHtml((t.date || t.entryTime || '').slice(0, 10)) + '</td>';
      html += '<td><strong>' + escHtml(t.underlying || '\\u2014') + '</strong></td>';
      html += '<td><span class="tag ' + (t.direction === 'call' ? 'tag-green' : 'tag-red') + '">' + escHtml((t.direction || '').toUpperCase()) + '</span></td>';
      html += '<td class="mono ' + pnlCls + '">$' + (t.pnl || 0).toFixed(2) + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    body.innerHTML = '<div class="tbl-wrap">' + html + '</div>';
  }

  // ── Orders ───────────────────────────────────────────────
  function renderOrders(data) {
    orders = data || [];
    applyOrderFilter();
  }
  function applyOrderFilter() {
    var filterEl = $('dashOrderFilter');
    var filter = (filterEl ? filterEl.value : '').toUpperCase();
    var filtered = filter ? orders.filter(function(o) { return (o.symbol||'').toUpperCase().includes(filter); }) : orders;
    var body = $('dashOrderBody');
    $('dashOrderCount').textContent = filtered.length;
    if (!filtered.length) { body.innerHTML = '<div class="empty">No orders</div>'; return; }
    var html = '';
    filtered.forEach(function(o) {
      var t = o.filled_at || o.submitted_at || o.created_at || '';
      var time = t ? new Date(t).toLocaleString('en-US', {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : '\\u2014';
      var side = (o.side||'').toUpperCase();
      var sideColor = side === 'BUY' ? 'var(--green)' : 'var(--red)';
      var status = (o.status||'').toLowerCase().replace(/ /g,'_');
      var price = o.filled_avg_price || o.limit_price || o.stop_price || '\\u2014';
      html += '<div class="order-row">';
      html += '<span style="color:var(--text-muted)">' + time + '</span>';
      var oSym = o.symbol||'';
      var oDisplay = oSym.length >= 15 ? formatOptionsSymbol(oSym) : oSym;
      html += '<span style="color:var(--text);font-weight:600" title="' + oSym + '">' + oDisplay + '</span>';
      html += '<span class="order-side" style="color:' + sideColor + '">' + side + '</span>';
      html += '<span style="color:var(--text-muted)">' + (o.qty||o.filled_qty||'') + '</span>';
      html += '<span>' + (price !== '\\u2014' ? fmt(parseFloat(price)) : '\\u2014') + '</span>';
      html += '<span class="order-status ' + status + '">' + (o.status||'').replace(/_/g,' ') + '</span>';
      html += '</div>';
    });
    body.innerHTML = html;
  }

  // ── Equity Chart ─────────────────────────────────────────
  function initChart() {
    var container = $('dashEquityChart');
    if (!container || typeof LightweightCharts === 'undefined') return;
    equityChart = LightweightCharts.createChart(container, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#5a5a65', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 },
      grid: { vertLines: { color: 'rgba(255,255,255,0.02)' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
      timeScale: { borderColor: 'rgba(255,255,255,0.04)', timeVisible: true },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.04)' },
      crosshair: { mode: 0 },
      handleScroll: true, handleScale: true,
    });
    areaSeries = equityChart.addSeries(LightweightCharts.AreaSeries, {
      topColor: 'rgba(59,130,246,0.25)', bottomColor: 'rgba(59,130,246,0.01)',
      lineColor: '#3B82F6', lineWidth: 2,
    });
    new ResizeObserver(function() { equityChart.applyOptions({ width: container.clientWidth, height: container.clientHeight }); }).observe(container);
  }

  function loadHistory(period, tf) {
    fetch('/api/portfolio/history?period=' + period + '&timeframe=' + tf)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) {
        if (!data || (!data.timestamp && !data.equity)) return;
        var ts = data.timestamp || [];
        var eq = data.equity || [];
        var points = ts.map(function(t, i) { return { time: t, value: eq[i] || 0 }; }).filter(function(p) { return p.value > 0; });
        if (points.length && areaSeries) {
          areaSeries.setData(points);
          equityChart.timeScale().fitContent();
        }
      })
      .catch(function() {});
  }

  // ── Error Banner ─────────────────────────────────────────
  function showError(msg) {
    var banner = $('dashErrorBanner');
    if (!banner) return;
    banner.textContent = msg;
    banner.classList.add('visible');
  }

  // ── Fetch all data ───────────────────────────────────────
  function fetchAll() {
    Promise.all([
      fetch('/api/portfolio/account').then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(function(e) { showError(e.message === '502' ? 'Alpaca unavailable \\u2014 check API keys' : 'Failed to load account'); return null; }),
      fetch('/api/portfolio/positions').then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
      fetch('/api/portfolio/orders').then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
      fetch('/api/overview').then(function(r) { return r.ok ? r.json() : {}; }).catch(function() { return {}; }),
      fetch('/api/trades?count=50').then(function(r) { return r.ok ? r.json() : { trades: [], stats: {} }; }).catch(function() { return { trades: [], stats: {} }; }),
      fetch('/api/agent').then(function(r) { return r.ok ? r.json() : {}; }).catch(function() { return {}; }),
      fetch('/api/options').then(function(r) { return r.ok ? r.json() : {}; }).catch(function() { return {}; }),
    ]).then(function(results) {
      var acct = results[0];
      var eqPositions = results[1];
      var orderData = results[2];
      var overview = results[3];
      var tradeData = results[4];
      var agentData = results[5];
      var optData = results[6];

      updateAccount(acct);

      // Merge equity + options positions
      var optPositions = optData.positions || [];
      renderPositions(eqPositions, optPositions);

      renderOrders(orderData);
      updateOverview(overview, tradeData.stats);
      renderTrades(tradeData);
    });
  }

  // ── Init / Destroy ───────────────────────────────────────
  function init() {
    initChart();

    // Timeframe buttons
    var page = $('page-dashboard');
    if (page) {
      page.querySelectorAll('.tf-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          page.querySelectorAll('.tf-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          loadHistory(btn.dataset.period, btn.dataset.tf);
        });
      });
    }

    // Order filter
    var filterEl = $('dashOrderFilter');
    if (filterEl) filterEl.addEventListener('input', applyOrderFilter);

    // Fetch all data
    fetchAll();

    // Load equity chart
    loadHistory('1D', '5Min');

    // Socket.IO via shared SQ.socket
    try {
      if (SQ.socket) {
        SQ.socket.emit('subscribe:portfolio');
        SQ.socket.on('portfolio:update', onPortfolioUpdate);
        socketSubscribed = true;
      }
    } catch(e) {}
  }

  function onPortfolioUpdate(data) {
    if (data.account) updateAccount(data.account);
    if (data.positions) {
      // Live updates only send equity positions; keep current options
      var currentOpt = positions.filter(function(p) { return (p.symbol || '').length >= 16; });
      var newEq = data.positions;
      renderPositions(newEq, currentOpt);
    }
  }

  function refresh() {
    fetchAll();
    if (typeof pulseRefresh === 'function') pulseRefresh();
  }

  function destroy() {
    try {
      if (SQ.socket && socketSubscribed) {
        SQ.socket.off('portfolio:update', onPortfolioUpdate);
        SQ.socket.emit('unsubscribe:portfolio');
        socketSubscribed = false;
      }
    } catch(e) {}

    if (equityChart) { try { equityChart.remove(); } catch(e) {} equityChart = null; areaSeries = null; }

    positions = [];
    orders = [];
    lessonsCache = {};
  }

  return { init: init, destroy: destroy, refresh: refresh, _toggleLesson: _toggleLesson };
})();
`;
}

module.exports = { registerPortfolioRoutes, getPortfolioPageCSS, getPortfolioPageHTML, getPortfolioPageJS };
