'use strict';

function getTrinityPageCSS() {
  return `
/* ── SharkTrinity Page ── */
#page-trinity { padding: 20px; }
#page-trinity .trinity-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
#page-trinity .trinity-header h2 {
  font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--text); margin: 0;
}
#page-trinity .trinity-sub {
  font-family: var(--font-body); font-size: 12px; color: var(--text-muted);
}
#page-trinity .trinity-toggles {
  display: flex; align-items: center; gap: 12px;
}
#page-trinity .trinity-toggle {
  display: flex; align-items: center; gap: 6px; cursor: pointer;
  font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);
}
#page-trinity .trinity-toggle input { accent-color: var(--accent); }
#page-trinity .trinity-toggle .swatch {
  width: 12px; height: 3px; border-radius: 2px;
}
#page-trinity .trinity-body {
  display: flex; gap: 20px; min-height: 500px;
}
#page-trinity .trinity-chart-wrap {
  flex: 1; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; position: relative; overflow: hidden;
}
#page-trinity .trinity-svg { width: 100%; height: 460px; }
#page-trinity .trinity-sidebar {
  width: 220px; flex-shrink: 0;
}
#page-trinity .trinity-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 16px; margin-bottom: 12px;
}
#page-trinity .trinity-card h4 {
  font-family: var(--font-heading); font-size: 12px; color: var(--text-muted); margin: 0 0 10px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
#page-trinity .trinity-card-row {
  display: flex; justify-content: space-between; align-items: center; padding: 4px 0;
  font-family: var(--font-mono); font-size: 11px;
}
#page-trinity .trinity-card-row .label { color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
#page-trinity .trinity-card-row .value { color: var(--text); font-weight: 600; }
#page-trinity .trinity-empty {
  display: flex; align-items: center; justify-content: center; height: 400px;
  color: var(--text-muted); font-size: 14px;
}
#page-trinity .trinity-convergence-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;
  font-family: var(--font-mono); background: rgba(139,92,246,0.15); color: #8B5CF6;
}
@media (max-width: 768px) {
  #page-trinity .trinity-body { flex-direction: column; }
  #page-trinity .trinity-sidebar { width: 100%; }
}
`;
}

function getTrinityPageHTML() {
  return `
<div class="page" id="page-trinity">
  <div class="trinity-header">
    <div>
      <h2>SharkTrinity&trade;</h2>
      <div class="trinity-sub">Combined dealer exposure overlay &mdash; SPY + QQQ + IWM gamma profiles</div>
    </div>
    <div class="trinity-toggles">
      <label class="trinity-toggle">
        <input type="checkbox" id="trinityToggleSPY" checked onchange="SQ.trinity.refresh()">
        <span class="swatch" style="background:#fbbf24"></span> SPY
      </label>
      <label class="trinity-toggle">
        <input type="checkbox" id="trinityToggleQQQ" checked onchange="SQ.trinity.refresh()">
        <span class="swatch" style="background:#22C55E"></span> QQQ
      </label>
      <label class="trinity-toggle">
        <input type="checkbox" id="trinityToggleIWM" checked onchange="SQ.trinity.refresh()">
        <span class="swatch" style="background:#F97316"></span> IWM
      </label>
    </div>
  </div>
  <div class="trinity-body">
    <div class="trinity-chart-wrap">
      <svg class="trinity-svg" id="trinitySvg"></svg>
    </div>
    <div class="trinity-sidebar" id="trinitySidebar"></div>
  </div>
</div>`;
}

function getTrinityPageJS() {
  return `
;(function() {
  var _data = null;
  var _timer = null;
  var COLORS = { SPY: '#fbbf24', QQQ: '#22C55E', IWM: '#F97316' };

  function fmt(n) { return n != null ? Number(n).toFixed(0) : '—'; }
  function fmtB(n) {
    var a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (a >= 1e6) return (n / 1e6).toFixed(0) + 'M';
    return fmt(n);
  }

  function isVisible(ticker) {
    var el = document.getElementById('trinityToggle' + ticker);
    return el ? el.checked : true;
  }

  async function load() {
    try {
      var res = await fetch('/api/gex/trinity');
      var json = await res.json();
      if (!json.available || !json.profiles || !json.profiles.length) {
        document.getElementById('trinitySvg').innerHTML = '';
        document.querySelector('#page-trinity .trinity-chart-wrap').innerHTML = '<div class="trinity-empty">No trinity data available. Market may be closed.</div>';
        return;
      }
      _data = json.profiles;
      render();
      renderSidebar();
    } catch (e) {
      document.querySelector('#page-trinity .trinity-chart-wrap').innerHTML = '<div class="trinity-empty">Error loading trinity data.</div>';
    }
  }

  function render() {
    var svg = document.getElementById('trinitySvg');
    if (!svg || !_data) return;

    var W = svg.clientWidth || 700;
    var H = svg.clientHeight || 460;
    var pad = { top: 20, right: 20, bottom: 40, left: 60 };
    var chartW = W - pad.left - pad.right;
    var chartH = H - pad.top - pad.bottom;

    // Filter visible profiles and normalize to % from spot range [-5, +5]
    var visible = _data.filter(function(p) { return isVisible(p.ticker); });
    if (!visible.length) { svg.innerHTML = ''; return; }

    var minPct = -5, maxPct = 5;

    // Find max absolute GEX across all visible profiles for Y scaling
    var maxGEX = 0;
    visible.forEach(function(p) {
      p.strikes.forEach(function(s) {
        if (s.pctFromSpot >= minPct && s.pctFromSpot <= maxPct) {
          maxGEX = Math.max(maxGEX, Math.abs(s.netGEX));
        }
      });
    });
    if (maxGEX === 0) maxGEX = 1;

    function xScale(pct) { return pad.left + ((pct - minPct) / (maxPct - minPct)) * chartW; }
    function yScale(gex) { return pad.top + chartH / 2 - (gex / maxGEX) * (chartH / 2) * 0.9; }

    var html = '';

    // Grid lines
    html += '<line x1="' + pad.left + '" y1="' + (pad.top + chartH / 2) + '" x2="' + (pad.left + chartW) + '" y2="' + (pad.top + chartH / 2) + '" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>';
    // Zero line label
    html += '<text x="' + (pad.left - 8) + '" y="' + (pad.top + chartH / 2 + 4) + '" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="end" font-family="JetBrains Mono,monospace">0</text>';

    // X axis labels (% from spot)
    for (var pct = -5; pct <= 5; pct++) {
      var x = xScale(pct);
      html += '<line x1="' + x + '" y1="' + pad.top + '" x2="' + x + '" y2="' + (pad.top + chartH) + '" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
      html += '<text x="' + x + '" y="' + (H - 8) + '" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="middle" font-family="JetBrains Mono,monospace">' + (pct > 0 ? '+' : '') + pct + '%</text>';
    }

    // Y axis labels
    var yTicks = [maxGEX * 0.5, maxGEX, -maxGEX * 0.5, -maxGEX];
    yTicks.forEach(function(v) {
      var y = yScale(v);
      html += '<text x="' + (pad.left - 8) + '" y="' + (y + 3) + '" fill="rgba(255,255,255,0.2)" font-size="8" text-anchor="end" font-family="JetBrains Mono,monospace">' + fmtB(v) + '</text>';
    });

    // X axis title
    html += '<text x="' + (pad.left + chartW / 2) + '" y="' + (H - 0) + '" fill="rgba(255,255,255,0.3)" font-size="10" text-anchor="middle" font-family="Inter,sans-serif">% from Spot</text>';

    // Find convergence zones (where 2+ tickers have significant gamma at same % level)
    if (visible.length >= 2) {
      var buckets = {};
      visible.forEach(function(p) {
        p.strikes.forEach(function(s) {
          if (s.pctFromSpot < minPct || s.pctFromSpot > maxPct) return;
          var bucket = Math.round(s.pctFromSpot * 2) / 2; // 0.5% buckets
          if (!buckets[bucket]) buckets[bucket] = { tickers: new Set(), totalGEX: 0 };
          if (Math.abs(s.netGEX) > maxGEX * 0.1) {
            buckets[bucket].tickers.add(p.ticker);
            buckets[bucket].totalGEX += Math.abs(s.netGEX);
          }
        });
      });
      // Highlight convergence zones
      Object.keys(buckets).forEach(function(b) {
        var bucket = buckets[b];
        if (bucket.tickers.size >= 2) {
          var bPct = parseFloat(b);
          var x1 = xScale(bPct - 0.25);
          var x2 = xScale(bPct + 0.25);
          html += '<rect x="' + x1 + '" y="' + pad.top + '" width="' + (x2 - x1) + '" height="' + chartH + '" fill="rgba(139,92,246,0.08)" rx="2"/>';
        }
      });
    }

    // Draw profile lines
    visible.forEach(function(p) {
      var color = COLORS[p.ticker] || '#888';
      // Sort by pctFromSpot and filter to range
      var pts = p.strikes
        .filter(function(s) { return s.pctFromSpot >= minPct && s.pctFromSpot <= maxPct; })
        .sort(function(a, b) { return a.pctFromSpot - b.pctFromSpot; });

      if (pts.length < 2) return;

      // Build path
      var d = 'M';
      pts.forEach(function(s, i) {
        d += (i > 0 ? 'L' : '') + xScale(s.pctFromSpot).toFixed(1) + ',' + yScale(s.netGEX).toFixed(1);
      });
      html += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" opacity="0.85"/>';

      // Area fill
      var areaD = d + 'L' + xScale(pts[pts.length - 1].pctFromSpot).toFixed(1) + ',' + (pad.top + chartH / 2) + 'L' + xScale(pts[0].pctFromSpot).toFixed(1) + ',' + (pad.top + chartH / 2) + 'Z';
      html += '<path d="' + areaD + '" fill="' + color + '" opacity="0.06"/>';
    });

    // Spot markers (at 0%)
    visible.forEach(function(p) {
      var color = COLORS[p.ticker] || '#888';
      var x = xScale(0);
      html += '<circle cx="' + x + '" cy="' + (pad.top + chartH + 12) + '" r="3" fill="' + color + '"/>';
    });

    svg.innerHTML = html;
  }

  function renderSidebar() {
    var el = document.getElementById('trinitySidebar');
    if (!el || !_data) return;

    var html = '<div class="trinity-card"><h4>Spot Prices</h4>';
    _data.forEach(function(p) {
      var color = COLORS[p.ticker] || '#888';
      html += '<div class="trinity-card-row"><span class="label"><span class="swatch" style="display:inline-block;width:8px;height:3px;border-radius:1px;background:' + color + '"></span> ' + p.ticker + '</span><span class="value">$' + (p.spot ? p.spot.toFixed(2) : '—') + '</span></div>';
    });
    html += '</div>';

    // Top gamma walls per ticker
    _data.forEach(function(p) {
      if (!isVisible(p.ticker)) return;
      var color = COLORS[p.ticker] || '#888';
      var sorted = p.strikes.slice().sort(function(a, b) { return Math.abs(b.netGEX) - Math.abs(a.netGEX); });
      var top3 = sorted.slice(0, 3);

      html += '<div class="trinity-card"><h4 style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:3px;border-radius:1px;background:' + color + '"></span> ' + p.ticker + ' Top Walls</h4>';
      top3.forEach(function(s) {
        var tag = s.netGEX > 0 ? '<span style="color:#22c55e;font-size:9px;">CALL</span>' : '<span style="color:#ef4444;font-size:9px;">PUT</span>';
        html += '<div class="trinity-card-row"><span class="label">$' + fmt(s.strike) + ' ' + tag + '</span><span class="value">' + fmtB(s.netGEX) + '</span></div>';
      });
      html += '</div>';
    });

    // Convergence zones
    if (_data.length >= 2) {
      var visible = _data.filter(function(p) { return isVisible(p.ticker); });
      if (visible.length >= 2) {
        var buckets = {};
        visible.forEach(function(p) {
          p.strikes.forEach(function(s) {
            if (s.pctFromSpot < -5 || s.pctFromSpot > 5) return;
            var bucket = Math.round(s.pctFromSpot * 2) / 2;
            if (!buckets[bucket]) buckets[bucket] = { tickers: [], totalGEX: 0 };
            if (Math.abs(s.netGEX) > 0) {
              var found = false;
              buckets[bucket].tickers.forEach(function(t) { if (t === p.ticker) found = true; });
              if (!found) buckets[bucket].tickers.push(p.ticker);
              buckets[bucket].totalGEX += Math.abs(s.netGEX);
            }
          });
        });

        var convergences = Object.keys(buckets)
          .filter(function(b) { return buckets[b].tickers.length >= 2; })
          .sort(function(a, b) { return buckets[b].totalGEX - buckets[a].totalGEX; })
          .slice(0, 5);

        if (convergences.length) {
          html += '<div class="trinity-card"><h4>Convergence Zones</h4>';
          convergences.forEach(function(b) {
            var bk = buckets[b];
            html += '<div class="trinity-card-row"><span class="label"><span class="trinity-convergence-badge">' + (parseFloat(b) > 0 ? '+' : '') + b + '%</span></span><span class="value">' + bk.tickers.join('+') + '</span></div>';
          });
          html += '</div>';
        }
      }
    }

    el.innerHTML = html;
  }

  SQ.trinity = {
    init: function() {
      load();
      _timer = setInterval(load, 60000);
    },
    destroy: function() {
      if (_timer) { clearInterval(_timer); _timer = null; }
    },
    refresh: function() {
      if (_data) { render(); renderSidebar(); }
    },
  };
})();
`;
}

module.exports = { getTrinityPageCSS, getTrinityPageHTML, getTrinityPageJS };
