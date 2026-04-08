const path = require('path');
const { execFile } = require('child_process');
const { getCommonHead, getCommonStyles, getGoldTokens, getGoldTopbarStyles } = require('./common-styles');
const alpaca = require('../services/alpaca');

function registerOptimizeRoutes(app) {

  // ── API: run optimizer ──────────────────────────────────────────────────
  app.get('/api/portfolio/optimize', async (req, res) => {
    try {
      const method = req.query.method || 'max_sharpe';
      const lookback = req.query.lookback || '126';
      const maxWeight = req.query.maxWeight || '0.15';

      const client = alpaca.getCached();
      const [positions, account] = await Promise.all([
        alpaca.getPositions(),
        alpaca.getAccount(),
      ]);

      if (!positions || positions.length === 0) {
        return res.json({ error: 'No positions found' });
      }

      const tickers = positions.map(p => p.symbol);
      const equity = parseFloat(account.equity || account.portfolio_value || 0);
      const currentWeights = {};
      positions.forEach(p => {
        currentWeights[p.symbol] = parseFloat(p.market_value) / equity;
      });

      const args = [
        path.join(__dirname, '../../ml/portfolio_optimizer_api.py'),
        '--tickers', tickers.join(','),
        '--method', method,
        '--lookback', String(lookback),
        '--max-weight', String(maxWeight),
        '--current-weights', JSON.stringify(currentWeights),
        '--equity', String(equity),
        '--data-dir', path.join(__dirname, '../../ml'),
      ];

      execFile('python', args, { cwd: path.join(__dirname, '../../ml'), timeout: 60000 }, (err, stdout, stderr) => {
        if (err) {
          console.error('Optimizer error:', err.message, stderr);
          return res.status(500).json({ error: err.message, stderr });
        }
        try {
          const result = JSON.parse(stdout);
          res.json(result);
        } catch (parseErr) {
          res.status(500).json({ error: 'Failed to parse optimizer output', stdout, stderr });
        }
      });
    } catch (err) {
      console.error('Optimize API error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Page: /optimize ─────────────────────────────────────────────────────
  app.get('/optimize', (_req, res) => {
    res.send(renderPage());
  });
}

function renderPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>BILLY | Portfolio Optimizer</title>
  ${getCommonHead({})}
  <style>
    ${getGoldTokens()}
    ${getCommonStyles()}
    ${getGoldTopbarStyles()}

    body {
      background: var(--bg); color: var(--text);
      font-family: var(--font-body); min-height: 100vh;
      display: flex; flex-direction: column;
    }

    .page-content { flex: 1; padding: 20px; overflow-y: auto; }

    .controls {
      display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
    }

    .tf-btn {
      font-family: var(--font-mono); font-size: 11px; padding: 6px 16px;
      border-radius: 4px; border: 1px solid var(--border); background: var(--bg-surface);
      color: var(--text-muted); cursor: pointer; transition: all 0.15s; text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .tf-btn:hover { color: var(--text); border-color: var(--border); }
    .tf-btn.active { color: var(--accent); border-color: var(--border); background: var(--accent-subtle); }

    .spinner {
      display: none; align-items: center; gap: 10px;
      font-family: var(--font-mono); font-size: 12px; color: var(--accent);
    }
    .spinner.show { display: flex; }
    .spinner-dot {
      width: 10px; height: 10px; border: 2px solid var(--accent); border-top-color: transparent;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .results { display: none; }
    .results.show { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .panel {
      background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 16px;
    }
    .panel-title {
      font-family: var(--font-heading); font-size: 13px; font-weight: 600;
      color: var(--accent); text-transform: uppercase; letter-spacing: 0.02em;
      margin-bottom: 12px;
    }

    canvas { width: 100%; border-radius: 4px; }

    table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; }
    th { color: var(--text-muted); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em; }
    td { padding: 6px 8px; border-bottom: 1px solid var(--border); color: var(--text); }
    .buy { color: var(--green); }
    .sell { color: var(--red); }

    .error-msg { color: var(--red); font-family: var(--font-mono); font-size: 12px; display: none; }
    .error-msg.show { display: block; }

    @media (max-width: 900px) {
      .results.show { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<!-- ── Top Bar ──────────────────────────────────────────── -->
<div class="topbar">
  <div class="brand">
    <span class="brand-name">BILLY</span>
    <span class="brand-sep"></span>
    <span class="brand-sub">Portfolio Optimizer</span>
  </div>
  <div class="nav-links">
    <a href="/dashboard">Command Center</a>
    <a href="/gex">GEX</a>
    <a href="/flow">Flow</a>
    <a href="/trading">War Room</a>
    <a href="/agents">Agents</a>
    <a href="/portfolio">Portfolio</a>
    <a href="/optimize" class="active">Optimize</a>
  </div>
</div>

<!-- ── Controls ─────────────────────────────────────────── -->
<div class="page-content">
  <div class="controls">
    <button class="tf-btn active" data-method="max_sharpe">Max Sharpe</button>
    <button class="tf-btn" data-method="min_variance">Min Variance</button>
    <button class="tf-btn" data-method="risk_parity">Risk Parity</button>
    <div class="spinner" id="spinner"><div class="spinner-dot"></div><span>Optimizing...</span></div>
  </div>

  <div class="error-msg" id="error"></div>

  <div class="results" id="results">
    <!-- Left column -->
    <div>
      <div class="panel">
        <div class="panel-title">Weights Comparison</div>
        <canvas id="weightsChart" height="300"></canvas>
      </div>
      <div class="panel" style="margin-top:20px">
        <div class="panel-title">Efficient Frontier</div>
        <canvas id="frontierChart" height="300"></canvas>
      </div>
    </div>
    <!-- Right column -->
    <div>
      <div class="panel">
        <div class="panel-title">Risk Comparison</div>
        <table id="riskTable">
          <thead><tr><th>Metric</th><th>Before</th><th>After</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="panel" style="margin-top:20px">
        <div class="panel-title">Suggested Trades</div>
        <table id="tradesTable">
          <thead><tr><th>Ticker</th><th>Action</th><th>$ Amount</th><th>Shares</th><th>Last Price</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  let currentMethod = 'max_sharpe';
  const buttons = document.querySelectorAll('.tf-btn');
  const spinner = document.getElementById('spinner');
  const results = document.getElementById('results');
  const errorEl = document.getElementById('error');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMethod = btn.dataset.method;
      fetchOptimize(currentMethod);
    });
  });

  async function fetchOptimize(method) {
    spinner.classList.add('show');
    results.classList.remove('show');
    errorEl.classList.remove('show');
    try {
      const resp = await fetch('/api/portfolio/optimize?method=' + method);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      renderResults(data);
      results.classList.add('show');
    } catch (err) {
      errorEl.textContent = 'Error: ' + err.message;
      errorEl.classList.add('show');
    } finally {
      spinner.classList.remove('show');
    }
  }

  function renderResults(data) {
    drawWeightsChart(data);
    drawFrontierChart(data);
    renderRiskTable(data);
    renderTradesTable(data);
  }

  // ── Weights bar chart ───────────────────────────────────
  function drawWeightsChart(data) {
    const canvas = document.getElementById('weightsChart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 32;
    const h = 300;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const current = data.current_weights || {};
    const target = data.target_weights || {};
    const tickers = Object.keys(target).sort((a,b) => (target[b]||0) - (target[a]||0));
    if (!tickers.length) return;

    const maxVal = Math.max(...tickers.map(t => Math.max(current[t]||0, target[t]||0)), 0.01);
    const barH = Math.min(18, (h - 40) / tickers.length / 2 - 2);
    const left = 60, right = 20;
    const chartW = w - left - right;

    tickers.forEach((t, i) => {
      const y = 20 + i * (barH * 2 + 6);
      // label
      ctx.fillStyle = '#94A3B8'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(t, left - 6, y + barH);
      // current
      const cw = ((current[t]||0) / maxVal) * chartW;
      ctx.fillStyle = 'rgba(148,163,184,0.3)'; ctx.fillRect(left, y, cw, barH);
      // target
      const tw = ((target[t]||0) / maxVal) * chartW;
      ctx.fillStyle = '#3B82F6'; ctx.fillRect(left, y + barH + 2, tw, barH);
    });
  }

  // ── Efficient frontier scatter ──────────────────────────
  function drawFrontierChart(data) {
    const canvas = document.getElementById('frontierChart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 32;
    const h = 300;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const frontier = data.frontier || [];
    const selected = data.selected_portfolio || {};
    if (!frontier.length) {
      ctx.fillStyle = '#94A3B8'; ctx.font = '11px JetBrains Mono';
      ctx.fillText('No frontier data available', 20, h/2);
      return;
    }

    const pad = { t: 20, r: 20, b: 40, l: 60 };
    const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
    const vols = frontier.map(p => p.volatility);
    const rets = frontier.map(p => p.return);
    const minV = Math.min(...vols) * 0.95, maxV = Math.max(...vols) * 1.05;
    const minR = Math.min(...rets) * 0.95, maxR = Math.max(...rets) * 1.05;
    const sx = v => pad.l + ((v - minV) / (maxV - minV || 1)) * cw;
    const sy = r => pad.t + ch - ((r - minR) / (maxR - minR || 1)) * ch;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yy = pad.t + (ch / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke();
    }

    // points
    frontier.forEach(p => {
      ctx.beginPath(); ctx.arc(sx(p.volatility), sy(p.return), 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59,130,246,0.3)'; ctx.fill();
    });

    // selected
    if (selected.volatility != null) {
      ctx.beginPath(); ctx.arc(sx(selected.volatility), sy(selected.return), 7, 0, Math.PI * 2);
      ctx.fillStyle = '#3B82F6'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }

    // axes labels
    ctx.fillStyle = '#94A3B8'; ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center'; ctx.fillText('Volatility', w / 2, h - 6);
    ctx.save(); ctx.translate(12, h / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('Return', 0, 0); ctx.restore();
  }

  // ── Risk table ──────────────────────────────────────────
  function renderRiskTable(data) {
    const tbody = document.querySelector('#riskTable tbody');
    const before = data.current_risk || {};
    const after = data.optimized_risk || {};
    const metrics = [
      ['Annual Return', 'annual_return', v => (v * 100).toFixed(2) + '%'],
      ['Annual Vol', 'annual_vol', v => (v * 100).toFixed(2) + '%'],
      ['Sharpe Ratio', 'sharpe', v => v.toFixed(3)],
      ['VaR 95%', 'var_95', v => (v * 100).toFixed(2) + '%'],
      ['Diversification', 'diversification_ratio', v => v.toFixed(3)],
    ];
    tbody.innerHTML = metrics.map(([label, key, fmt]) => {
      const bv = before[key] != null ? fmt(before[key]) : '--';
      const av = after[key] != null ? fmt(after[key]) : '--';
      return '<tr><td>' + label + '</td><td>' + bv + '</td><td>' + av + '</td></tr>';
    }).join('');
  }

  // ── Trades table ────────────────────────────────────────
  function renderTradesTable(data) {
    const tbody = document.querySelector('#tradesTable tbody');
    const trades = data.trades || [];
    if (!trades.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-muted)">No trades suggested</td></tr>';
      return;
    }
    tbody.innerHTML = trades.map(t => {
      const cls = t.action === 'BUY' ? 'buy' : 'sell';
      return '<tr><td>' + t.ticker + '</td><td class="' + cls + '">' + t.action +
        '</td><td>$' + Math.abs(t.amount||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) +
        '</td><td>' + (t.shares||0) +
        '</td><td>$' + (t.last_price||0).toFixed(2) + '</td></tr>';
    }).join('');
  }

  // auto-fetch on load
  fetchOptimize(currentMethod);
})();
<\/script>
</body>
</html>`;
}

module.exports = { registerOptimizeRoutes };
