/**
 * Strategy Playbook — Regime-ranked trading strategies
 */

const GEXEngine = require('../services/gex-engine');
const gamma = require('../services/gamma');

const STRATEGIES = [
  { id: 'gamma-wall-fade', name: 'Gamma Wall Fade', description: 'Mean-revert at call/put walls. Sell at call wall, buy at put wall.', regimeMatch: 'Long Gamma', icon: 'repeat' },
  { id: 'iron-condor', name: 'Iron Condor', description: 'Sell premium inside gamma walls. Wings at call wall + put wall strikes.', regimeMatch: 'Long Gamma', icon: 'minus' },
  { id: 'momentum-breakout', name: 'Momentum Breakout', description: 'Go with breakout direction. Trail stop at gamma flip.', regimeMatch: 'Short Gamma', icon: 'trending-up' },
  { id: 'gamma-scalp', name: 'Gamma Scalp', description: 'Scalp both directions near gamma flip. Small size, tight stops.', regimeMatch: 'Mixed', icon: 'scissors' },
  { id: '0dte-squeeze', name: '0DTE Squeeze', description: 'Ride the squeeze direction with 0DTE options for leverage.', regimeMatch: 'Short Gamma', icon: 'zap' },
  { id: 'vol-expansion', name: 'Volatility Expansion', description: 'Buy straddles/strangles. Profit from dealer amplification.', regimeMatch: 'Short Gamma', icon: 'maximize-2' },
];

function scoreStrategies(summary) {
  const { regime, walls, gammaFlip, spot, aggregation } = summary;
  const netGEX = aggregation?.totalNetGEX || 0;
  const intensity = GEXEngine.getGEXPercentile(summary.ticker, netGEX);
  const iPct = intensity ? intensity.percentile : 50;
  const callWall = walls?.callWalls?.[0];
  const putWall = walls?.putWalls?.[0];
  const flipDist = gammaFlip ? Math.abs((spot - gammaFlip) / spot * 100) : null;

  return STRATEGIES.map(strat => {
    let fitness = 0, entry = null, target = null, stop = null, reasoning = '';

    switch (strat.id) {
      case 'gamma-wall-fade':
        if (regime.label === 'Long Gamma') fitness += 50;
        if (iPct >= 60) fitness += 20;
        if (callWall && putWall) fitness += 20;
        if (regime.confidence > 0.7) fitness += 10;
        if (callWall) entry = callWall.strike;
        if (putWall) stop = putWall.strike;
        if (gammaFlip) target = gammaFlip;
        reasoning = fitness >= 60 ? 'Dealers suppressing volatility — fade moves at walls' : 'Regime not ideal for mean-reversion';
        break;
      case 'iron-condor':
        if (regime.label === 'Long Gamma') fitness += 40;
        if (iPct >= 30 && iPct <= 70) fitness += 25;
        if (callWall && putWall) { fitness += 25; entry = spot; target = callWall.strike; stop = putWall.strike; }
        if (regime.confidence > 0.6) fitness += 10;
        reasoning = fitness >= 60 ? 'Stable regime with defined walls — sell premium' : 'Walls not well-defined or regime unstable';
        break;
      case 'momentum-breakout':
        if (regime.label === 'Short Gamma') fitness += 50;
        if (iPct >= 70) fitness += 20;
        if (gammaFlip) { fitness += 15; entry = gammaFlip; target = callWall ? callWall.strike : spot * 1.02; stop = gammaFlip * 0.997; }
        if (regime.confidence > 0.6) fitness += 15;
        reasoning = fitness >= 60 ? 'Dealers amplifying moves — go with momentum' : 'Not enough short gamma pressure for breakout';
        break;
      case 'gamma-scalp':
        if (flipDist !== null && flipDist < 0.5) fitness += 50;
        else if (flipDist !== null && flipDist < 1.0) fitness += 30;
        if (regime.label === 'Mixed') fitness += 20;
        if (gammaFlip) { entry = gammaFlip; target = gammaFlip * 1.003; stop = gammaFlip * 0.997; }
        fitness += 10;
        reasoning = flipDist !== null && flipDist < 1.0 ? 'Spot near gamma flip — scalp the chop' : 'Spot too far from flip for effective scalping';
        break;
      case '0dte-squeeze':
        if (regime.label === 'Short Gamma') fitness += 30;
        if (netGEX < 0) fitness += 20;
        if (iPct >= 60) fitness += 20;
        if (callWall) { entry = spot; target = callWall.strike; stop = spot * 0.995; }
        fitness += 10;
        reasoning = fitness >= 60 ? 'Short gamma + high intensity = squeeze potential' : 'Squeeze conditions not met';
        break;
      case 'vol-expansion':
        if (regime.label === 'Short Gamma') fitness += 40;
        if (iPct >= 70) fitness += 25;
        if (netGEX < 0) fitness += 20;
        entry = spot; target = callWall ? callWall.strike : spot * 1.03; stop = spot * 0.99;
        if (regime.confidence > 0.7) fitness += 15;
        reasoning = fitness >= 60 ? 'Negative gamma = dealers amplify moves — buy volatility' : 'Not enough negative gamma for vol expansion';
        break;
    }

    return { ...strat, fitness: Math.min(100, Math.max(0, fitness)), entry: entry ? +entry.toFixed(2) : null, target: target ? +target.toFixed(2) : null, stop: stop ? +stop.toFixed(2) : null, reasoning };
  }).sort((a, b) => b.fitness - a.fitness);
}

function registerStrategiesRoutes(app) {
  app.get('/api/strategies/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      const engine = new GEXEngine(gamma);
      const summary = await engine.analyze(ticker);
      const strategies = scoreStrategies(summary);
      res.json({ ticker, spot: summary.spot, regime: summary.regime, strategies });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

function getStrategiesPageCSS() {
  return `
#page-strategies { padding: 20px 24px; }
#page-strategies .page-header { margin-bottom: 20px; }
#page-strategies .page-header h2 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
#page-strategies .page-header .subtitle { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
#page-strategies .strat-controls { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
#page-strategies .strat-ticker { font-family: var(--font-mono); font-size: 13px; padding: 6px 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px; color: var(--text); width: 100px; }
#page-strategies .strat-ticker:focus { outline: none; border-color: var(--accent); }
#page-strategies .regime-badge { font-family: var(--font-mono); font-size: 11px; padding: 4px 12px; border-radius: 4px; font-weight: 600; }
#page-strategies .strat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 768px) { #page-strategies .strat-grid { grid-template-columns: 1fr; } }
#page-strategies .strat-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px; transition: border-color 0.2s; }
#page-strategies .strat-card:first-child { border-color: var(--accent); }
#page-strategies .strat-card-hdr { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
#page-strategies .strat-card-icon { width: 36px; height: 36px; border-radius: 3px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface-hover); }
#page-strategies .strat-card-name { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text); }
#page-strategies .strat-card-regime { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); }
#page-strategies .strat-fitness { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
#page-strategies .strat-fitness-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
#page-strategies .strat-fitness-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
#page-strategies .strat-fitness-pct { font-family: var(--font-mono); font-size: 14px; font-weight: 700; min-width: 40px; text-align: right; }
#page-strategies .strat-desc { font-family: var(--font-body); font-size: 12px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5; }
#page-strategies .strat-reasoning { font-family: var(--font-body); font-size: 11px; color: var(--text); font-style: italic; margin-bottom: 12px; padding: 8px 12px; background: rgba(251,191,36,0.06); border-radius: 3px; border-left: 3px solid var(--accent); }
#page-strategies .strat-levels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
#page-strategies .strat-level { text-align: center; }
#page-strategies .strat-level-label { font-family: var(--font-body); font-size: 9px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
#page-strategies .strat-level-value { font-family: var(--font-mono); font-size: 13px; font-weight: 600; }
#page-strategies .strat-loading { text-align: center; color: var(--text-muted); padding: 60px; font-size: 13px; }
#page-strategies .strat-best-badge { display: inline-block; font-family: var(--font-mono); font-size: 9px; padding: 2px 8px; background: var(--accent); color: var(--bg); border-radius: 3px; font-weight: 700; margin-left: 8px; }
`;
}

function getStrategiesPageHTML() {
  return `
<div class="page" id="page-strategies">
  <div class="page-header"><h2>SharkPlaybook&trade;</h2><div class="subtitle">Billy's regime-ranked trading strategies</div></div>
  <div class="strat-controls">
    <input class="strat-ticker" id="stratTickerInput" placeholder="SPY" value="SPY" />
    <button id="stratLoadBtn" style="background:var(--accent);color:var(--bg);border:none;padding:6px 16px;border-radius:3px;font-weight:600;cursor:pointer">Analyze</button>
    <span class="regime-badge" id="stratRegimeBadge"></span>
    <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)" id="stratSpotLabel"></span>
  </div>
  <div class="strat-grid" id="stratGrid"><div class="strat-loading">Enter a ticker and click Analyze</div></div>
</div>`;
}

function getStrategiesPageJS() {
  return `
window.SQ = window.SQ || {};
(function() {
  var ticker = 'SPY';
  function load() {
    var grid = document.getElementById('stratGrid');
    grid.innerHTML = '<div class="strat-loading">Analyzing...</div>';
    fetch('/api/strategies/' + ticker)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.error) { grid.innerHTML = '<div class="strat-loading">' + d.error + '</div>'; return; }
        var badge = document.getElementById('stratRegimeBadge');
        var rc = d.regime.label === 'Long Gamma' ? 'var(--green)' : d.regime.label === 'Short Gamma' ? 'var(--red)' : 'var(--yellow)';
        badge.textContent = d.regime.label + ' (' + Math.round(d.regime.confidence * 100) + '%)';
        badge.style.background = 'rgba(' + (d.regime.label === 'Long Gamma' ? '34,197,94' : d.regime.label === 'Short Gamma' ? '239,68,68' : '234,179,8') + ',0.15)';
        badge.style.color = rc;
        document.getElementById('stratSpotLabel').textContent = 'Spot $' + d.spot.toFixed(2);
        var html = '';
        d.strategies.forEach(function(s, i) {
          var fc = s.fitness >= 70 ? 'var(--green)' : s.fitness >= 40 ? 'var(--yellow)' : 'var(--text-muted)';
          html += '<div class="strat-card">';
          html += '<div class="strat-card-hdr"><div class="strat-card-icon"><i data-lucide="' + s.icon + '" style="width:18px;height:18px;color:' + fc + '"></i></div>';
          html += '<div><div class="strat-card-name">' + s.name + (i === 0 ? '<span class="strat-best-badge">BEST FIT</span>' : '') + '</div>';
          html += '<div class="strat-card-regime">' + s.regimeMatch + '</div></div></div>';
          html += '<div class="strat-fitness"><div class="strat-fitness-bar"><div class="strat-fitness-fill" style="width:' + s.fitness + '%;background:' + fc + '"></div></div>';
          html += '<div class="strat-fitness-pct" style="color:' + fc + '">' + s.fitness + '</div></div>';
          html += '<div class="strat-desc">' + s.description + '</div>';
          html += '<div class="strat-reasoning">' + s.reasoning + '</div>';
          if (s.entry || s.target || s.stop) {
            html += '<div class="strat-levels">';
            html += '<div class="strat-level"><div class="strat-level-label">Entry</div><div class="strat-level-value" style="color:var(--accent)">' + (s.entry ? '$' + s.entry : '\\u2014') + '</div></div>';
            html += '<div class="strat-level"><div class="strat-level-label">Target</div><div class="strat-level-value" style="color:var(--green)">' + (s.target ? '$' + s.target : '\\u2014') + '</div></div>';
            html += '<div class="strat-level"><div class="strat-level-label">Stop</div><div class="strat-level-value" style="color:var(--red)">' + (s.stop ? '$' + s.stop : '\\u2014') + '</div></div>';
            html += '</div>';
          }
          html += '</div>';
        });
        grid.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      })
      .catch(function(err) { grid.innerHTML = '<div class="strat-loading">Error: ' + err.message + '</div>'; });
  }
  SQ.strategies = {
    init: function() {
      document.getElementById('stratLoadBtn').onclick = function() { ticker = (document.getElementById('stratTickerInput').value || 'SPY').toUpperCase(); load(); };
      document.getElementById('stratTickerInput').addEventListener('keydown', function(e) { if (e.key === 'Enter') { ticker = (this.value || 'SPY').toUpperCase(); load(); } });
    },
    destroy: function() {}
  };
})();
`;
}

module.exports = { getStrategiesPageCSS, getStrategiesPageHTML, getStrategiesPageJS, registerStrategiesRoutes, scoreStrategies };
