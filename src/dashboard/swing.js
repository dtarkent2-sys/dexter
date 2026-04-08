'use strict';

function getSwingPageCSS() {
  return `
/* ── SharkSwing Page ── */
#page-swing { padding: 20px; }
#page-swing .swing-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
}
#page-swing .swing-header h2 {
  font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--text); margin: 0;
}
#page-swing .swing-header .swing-sub {
  font-family: var(--font-body); font-size: 12px; color: var(--text-muted);
}
#page-swing .swing-controls {
  display: flex; align-items: center; gap: 8px; margin-left: auto;
}
#page-swing .swing-chip {
  padding: 5px 14px; border-radius: 3px; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); cursor: pointer;
  font-family: var(--font-mono); font-size: 11px; font-weight: 600; transition: all 0.15s;
}
#page-swing .swing-chip:hover { border-color: var(--accent); color: var(--text); }
#page-swing .swing-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
#page-swing .swing-ticker-select {
  padding: 5px 10px; border-radius: 3px; border: 1px solid var(--border);
  background: var(--bg-surface); color: var(--text); font-family: var(--font-mono); font-size: 12px;
}
#page-swing .swing-body {
  display: flex; gap: 20px; min-height: 400px;
}
#page-swing .swing-chart {
  flex: 1; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; overflow-y: auto; max-height: 600px;
}
#page-swing .swing-bar-row {
  display: flex; align-items: center; gap: 8px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
}
#page-swing .swing-bar-strike {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); width: 60px; text-align: right; flex-shrink: 0;
}
#page-swing .swing-bar-track {
  flex: 1; height: 18px; position: relative; border-radius: 3px; overflow: hidden;
  background: rgba(255,255,255,0.03);
}
#page-swing .swing-bar-fill {
  height: 100%; border-radius: 3px; transition: width 0.3s;
}
#page-swing .swing-bar-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); width: 30px; text-align: center; flex-shrink: 0;
}
#page-swing .swing-legend {
  display: flex; align-items: center; gap: 16px; margin-top: 12px; justify-content: center;
}
#page-swing .swing-legend-item {
  display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-muted);
  font-family: var(--font-mono);
}
#page-swing .swing-legend-swatch {
  width: 16px; height: 10px; border-radius: 2px;
}
#page-swing .swing-empty {
  display: flex; align-items: center; justify-content: center; height: 300px;
  color: var(--text-muted); font-size: 14px; font-family: var(--font-body);
}
#page-swing .swing-sidebar {
  width: 240px; flex-shrink: 0;
}
#page-swing .swing-info-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; margin-bottom: 12px;
}
#page-swing .swing-info-card h4 {
  font-family: var(--font-heading); font-size: 12px; color: var(--text-muted); margin: 0 0 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
#page-swing .swing-info-row {
  display: flex; justify-content: space-between; padding: 4px 0;
  font-family: var(--font-mono); font-size: 11px;
}
#page-swing .swing-info-row .label { color: var(--text-muted); }
#page-swing .swing-info-row .value { color: var(--text); font-weight: 600; }
@media (max-width: 768px) {
  #page-swing .swing-body { flex-direction: column; }
  #page-swing .swing-sidebar { width: 100%; }
  #page-swing .swing-controls { margin-left: 0; }
}
`;
}

function getSwingPageHTML() {
  return `
<div class="page" id="page-swing">
  <div class="swing-header">
    <div>
      <h2>SharkSwing&trade;</h2>
      <div class="swing-sub">Multi-day gamma persistence &mdash; brighter = more days a wall held</div>
    </div>
    <div class="swing-controls">
      <select class="swing-ticker-select" id="swingTicker">
        <option value="SPY">SPY</option>
        <option value="QQQ">QQQ</option>
        <option value="IWM">IWM</option>
        <option value="AAPL">AAPL</option>
        <option value="TSLA">TSLA</option>
        <option value="NVDA">NVDA</option>
        <option value="META">META</option>
        <option value="MSFT">MSFT</option>
        <option value="AMZN">AMZN</option>
        <option value="AMD">AMD</option>
      </select>
      <button class="swing-chip active" data-days="2" onclick="SQ.swing.setDays(2)">2D</button>
      <button class="swing-chip" data-days="3" onclick="SQ.swing.setDays(3)">3D</button>
      <button class="swing-chip" data-days="5" onclick="SQ.swing.setDays(5)">5D</button>
    </div>
  </div>
  <div class="swing-body">
    <div class="swing-chart" id="swingChart">
      <div class="swing-empty">Loading swing data&hellip;</div>
    </div>
    <div class="swing-sidebar" id="swingSidebar"></div>
  </div>
</div>`;
}

function getSwingPageJS() {
  return `
;(function() {
  var _ticker = 'SPY';
  var _days = 5;
  var _data = null;
  var _timer = null;

  function fmt(n) { return n != null ? Number(n).toFixed(0) : '—'; }
  function fmtB(n) {
    var a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (a >= 1e6) return (n / 1e6).toFixed(0) + 'M';
    if (a >= 1e3) return (n / 1e3).toFixed(0) + 'K';
    return fmt(n);
  }

  function persistenceColor(count, max) {
    var pct = max > 0 ? count / max : 0;
    // Gradient from faint amber to bright amber
    var r = Math.round(251 + (253 - 251) * pct);
    var g = Math.round(191 + (224 - 191) * pct);
    var b = Math.round(36 + (71 - 36) * pct);
    var opacity = 0.2 + 0.8 * pct;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity.toFixed(2) + ')';
  }

  async function load() {
    var chart = document.getElementById('swingChart');
    if (!chart) return;
    chart.innerHTML = '<div class="swing-empty">Loading swing data&hellip;</div>';

    try {
      var res = await fetch('/api/gex/swing/' + _ticker + '?days=' + _days);
      var json = await res.json();
      if (!json.available || !json.snapshots || !json.snapshots.length) {
        chart.innerHTML = '<div class="swing-empty">No swing data available yet. Data is captured daily at 4:15 PM ET.</div>';
        renderSidebar(null);
        return;
      }
      _data = json.snapshots;
      render();
    } catch (e) {
      chart.innerHTML = '<div class="swing-empty">Error loading swing data.</div>';
    }
  }

  function render() {
    if (!_data || !_data.length) return;
    var chart = document.getElementById('swingChart');
    if (!chart) return;

    // Build persistence map: strike -> { count, totalNetGEX, maxNetGEX }
    var persistence = {};
    _data.forEach(function(snap) {
      if (!snap.strikes) return;
      snap.strikes.forEach(function(s) {
        if (!persistence[s.strike]) {
          persistence[s.strike] = { count: 0, totalNetGEX: 0, maxAbsGEX: 0 };
        }
        var p = persistence[s.strike];
        if (Math.abs(s.netGEX) > 1e6) { // only count meaningful gamma
          p.count++;
        }
        p.totalNetGEX += s.netGEX;
        p.maxAbsGEX = Math.max(p.maxAbsGEX, Math.abs(s.netGEX));
      });
    });

    // Sort by strike descending
    var strikes = Object.keys(persistence).map(Number).sort(function(a, b) { return b - a; });

    // Find max persistence count and max GEX for bar scaling
    var maxCount = _data.length;
    var maxGEX = 0;
    strikes.forEach(function(s) { maxGEX = Math.max(maxGEX, persistence[s].maxAbsGEX); });

    // Filter to strikes with at least 1 day of meaningful gamma
    var relevant = strikes.filter(function(s) { return persistence[s].count > 0; });

    // Get latest spot
    var spot = _data[_data.length - 1].spot || 0;

    var html = '';
    relevant.forEach(function(strike) {
      var p = persistence[strike];
      var barWidth = maxGEX > 0 ? Math.max(2, (p.maxAbsGEX / maxGEX) * 100) : 0;
      var color = persistenceColor(p.count, maxCount);
      var isSpot = spot && Math.abs(strike - spot) < 1;
      var strikeStyle = isSpot ? 'color:var(--accent);font-weight:700;' : '';

      html += '<div class="swing-bar-row">' +
        '<div class="swing-bar-strike" style="' + strikeStyle + '">$' + fmt(strike) + '</div>' +
        '<div class="swing-bar-track">' +
        '<div class="swing-bar-fill" style="width:' + barWidth.toFixed(1) + '%;background:' + color + '" title="' + fmtB(p.maxAbsGEX) + ' GEX, ' + p.count + '/' + maxCount + ' days"></div>' +
        '</div>' +
        '<div class="swing-bar-label">' + p.count + '/' + maxCount + '</div>' +
        '</div>';
    });

    // Legend
    html += '<div class="swing-legend">';
    for (var i = 1; i <= maxCount; i++) {
      html += '<div class="swing-legend-item"><div class="swing-legend-swatch" style="background:' + persistenceColor(i, maxCount) + '"></div>' + i + 'd</div>';
    }
    html += '</div>';

    chart.innerHTML = html;
    renderSidebar({ spot: spot, persistence: persistence, strikes: relevant, maxCount: maxCount, days: _data.length });
  }

  function renderSidebar(info) {
    var el = document.getElementById('swingSidebar');
    if (!el) return;
    if (!info) { el.innerHTML = ''; return; }

    // Find strongest persistent levels
    var sorted = info.strikes.slice().sort(function(a, b) {
      return info.persistence[b].count - info.persistence[a].count ||
             info.persistence[b].maxAbsGEX - info.persistence[a].maxAbsGEX;
    });
    var top5 = sorted.slice(0, 5);

    var html = '<div class="swing-info-card"><h4>Swing Summary</h4>';
    html += '<div class="swing-info-row"><span class="label">Ticker</span><span class="value">' + _ticker + '</span></div>';
    html += '<div class="swing-info-row"><span class="label">Spot</span><span class="value">$' + fmt(info.spot) + '</span></div>';
    html += '<div class="swing-info-row"><span class="label">Days</span><span class="value">' + info.days + '</span></div>';
    html += '<div class="swing-info-row"><span class="label">Levels tracked</span><span class="value">' + info.strikes.length + '</span></div>';
    html += '</div>';

    html += '<div class="swing-info-card"><h4>Strongest Persistent Walls</h4>';
    top5.forEach(function(strike) {
      var p = info.persistence[strike];
      html += '<div class="swing-info-row"><span class="label">$' + fmt(strike) + '</span><span class="value">' + p.count + '/' + info.maxCount + 'd &middot; ' + fmtB(p.maxAbsGEX) + '</span></div>';
    });
    html += '</div>';

    el.innerHTML = html;
  }

  SQ.swing = {
    init: function() {
      _ticker = document.getElementById('swingTicker').value || 'SPY';
      document.getElementById('swingTicker').onchange = function() {
        _ticker = this.value;
        load();
      };
      load();
      _timer = setInterval(load, 60000);
    },
    destroy: function() {
      if (_timer) { clearInterval(_timer); _timer = null; }
    },
    setDays: function(d) {
      _days = d;
      document.querySelectorAll('#page-swing .swing-chip').forEach(function(c) {
        c.classList.toggle('active', parseInt(c.getAttribute('data-days')) === d);
      });
      load();
    },
  };
})();
`;
}

module.exports = { getSwingPageCSS, getSwingPageHTML, getSwingPageJS };
