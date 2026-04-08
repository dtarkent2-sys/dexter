function getLtScreenerPageCSS() {
  return `
#page-lt-screener .lt-filter-bar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px;
  background: var(--bg-surface); border-radius: 3px; margin-bottom: 16px;
}
#page-lt-screener select,
#page-lt-screener input[type="range"] {
  background: var(--bg); border: 1px solid var(--border); color: var(--text);
  padding: 6px 10px; border-radius: 3px; font-family: 'Inter', sans-serif; font-size: 13px;
}
#page-lt-screener select { min-width: 140px; }
#page-lt-screener .lt-range-label {
  display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text);
  font-family: 'Inter', sans-serif;
}
#page-lt-screener .lt-range-label span {
  font-family: 'JetBrains Mono', monospace; min-width: 24px; text-align: right;
}
#page-lt-screener .lt-status-text { font-size: 12px; color: #94A3B8; font-family: 'Inter', sans-serif; }
#page-lt-screener .btn-primary {
  background: var(--accent); color: #fff; border: none; border-radius: 3px;
  padding: 8px 16px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
}
#page-lt-screener .btn-primary:hover { opacity: 0.9; }
#page-lt-screener .lt-table-wrap { overflow-x: auto; }
#page-lt-screener #lt-table { width: 100%; border-collapse: collapse; }
#page-lt-screener #lt-table th {
  position: sticky; top: 0; background: var(--bg-surface); text-align: left;
  padding: 10px 12px; font-family: 'DM Sans', sans-serif; font-size: 12px;
  font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border); white-space: nowrap;
}
#page-lt-screener #lt-table th[data-sort] { cursor: pointer; user-select: none; }
#page-lt-screener #lt-table th[data-sort]:hover { color: var(--text); }
#page-lt-screener #lt-table td {
  padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 13px;
  border-bottom: 1px solid var(--border); color: var(--text);
}
#page-lt-screener #lt-table tr:hover { background: rgba(251,191,36,0.08); cursor: pointer; }
#page-lt-screener .col-composite { color: var(--accent) !important; }
#page-lt-screener .score-high { color: #22C55E; }
#page-lt-screener .score-mid { color: #F59E0B; }
#page-lt-screener .score-low { color: #EF4444; }
#page-lt-screener .lt-empty {
  text-align: center; color: #64748B; padding: 60px 20px;
  font-family: 'Inter', sans-serif; font-size: 14px;
}
#page-lt-screener .lt-detail-panel {
  position: fixed; right: 0; top: 0; bottom: 0; width: 420px;
  background: var(--bg-surface); border-left: 1px solid var(--border);
  z-index: 100; overflow-y: auto; padding: 24px;
  box-shadow: -4px 0 24px rgba(0,0,0,0.3); transition: transform 0.2s ease;
}
#page-lt-screener .lt-detail-close {
  position: absolute; top: 12px; right: 16px; background: none; border: none;
  color: var(--text); font-size: 28px; cursor: pointer; line-height: 1;
}
#page-lt-screener .lt-detail-meta { color: #94A3B8; font-size: 14px; margin-bottom: 16px; font-family: 'Inter', sans-serif; }
#page-lt-screener .lt-score-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  font-family: 'Inter', sans-serif; font-size: 13px;
}
#page-lt-screener .lt-score-row > span:first-child { min-width: 80px; color: #94A3B8; }
#page-lt-screener .lt-score-row > span:last-child { min-width: 30px; text-align: right; font-family: 'JetBrains Mono', monospace; }
#page-lt-screener .lt-score-bar {
  flex: 1; height: 8px; border-radius: 4px; background: var(--border);
}
#page-lt-screener .lt-score-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
#page-lt-screener .lt-verdict {
  display: inline-block; padding: 4px 14px; border-radius: 20px; font-weight: 600;
  font-size: 13px; font-family: 'Inter', sans-serif; margin-bottom: 16px;
}
#page-lt-screener .lt-verdict-strong { background: rgba(34,197,94,0.15); color: #22C55E; }
#page-lt-screener .lt-verdict-favorable { background: rgba(74,222,128,0.15); color: #4ADE80; }
#page-lt-screener .lt-verdict-neutral { background: rgba(245,158,11,0.15); color: #F59E0B; }
#page-lt-screener .lt-verdict-weak { background: rgba(249,115,22,0.15); color: #F97316; }
#page-lt-screener .lt-verdict-avoid { background: rgba(239,68,68,0.15); color: #EF4444; }
#page-lt-screener .lt-signal-pill {
  display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px;
  background: var(--bg); border: 1px solid var(--border); color: var(--text);
  font-family: 'Inter', sans-serif; margin: 3px 4px 3px 0;
}
#page-lt-screener .lt-red-flag {
  border-left: 3px solid #EF4444; padding: 8px 12px; margin: 6px 0;
  background: rgba(239,68,68,0.06); font-size: 13px; font-family: 'Inter', sans-serif;
  border-radius: 0 6px 6px 0; color: var(--text);
}
#page-lt-screener .lt-section { margin: 16px 0; }
#page-lt-screener .lt-section h4 {
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
  color: var(--text); margin: 0 0 8px 0;
}
#page-lt-screener .lt-pills { display: flex; flex-wrap: wrap; }
#page-lt-screener .lt-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
#page-lt-screener .lt-stat-card {
  background: var(--bg); padding: 12px; border-radius: 3px; border: 1px solid var(--border);
}
#page-lt-screener .lt-stat-label {
  font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;
  font-family: 'Inter', sans-serif; margin-bottom: 4px;
}
#page-lt-screener .lt-stat-value {
  font-size: 18px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text);
}
#page-lt-screener .lt-peers-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
#page-lt-screener .lt-peers-table th,
#page-lt-screener .lt-peers-table td {
  padding: 6px 10px; font-size: 12px; border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace; text-align: left;
}
#page-lt-screener .lt-peers-table th { color: #64748B; font-family: 'Inter', sans-serif; font-weight: 600; }
#page-lt-screener .lt-loading {
  display: flex; align-items: center; justify-content: center; padding: 40px;
}
#page-lt-screener .lt-loading::after {
  content: ''; width: 24px; height: 24px; border: 2px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: lt-spin 0.6s linear infinite;
}
@keyframes lt-spin { to { transform: rotate(360deg); } }
`;
}

function getLtScreenerPageHTML() {
  return `
<div class="page" id="page-lt-screener">
  <div class="lt-filter-bar">
    <select id="lt-preset">
      <option value="balanced">Balanced</option>
      <option value="quality_growth">Quality Growth</option>
      <option value="value_momentum">Value Momentum</option>
    </select>
    <select id="lt-sector"><option value="">All Sectors</option></select>
    <label class="lt-range-label">Min Score <input type="range" id="lt-min-score" min="0" max="100" value="0"><span id="lt-min-score-val">0</span></label>
    <button id="lt-refresh" class="btn-primary">Refresh</button>
    <span id="lt-status" class="lt-status-text"></span>
  </div>
  <div class="lt-table-wrap">
    <table id="lt-table">
      <thead><tr>
        <th>#</th><th>Symbol</th><th>Sector</th><th>Price</th>
        <th data-sort="score_value">Value</th>
        <th data-sort="score_growth">Growth</th>
        <th data-sort="score_quality">Quality</th>
        <th data-sort="score_momentum">Momentum</th>
        <th data-sort="score_risk">Risk</th>
        <th data-sort="composite" class="col-composite">Composite</th>
      </tr></thead>
      <tbody id="lt-tbody"></tbody>
    </table>
    <div id="lt-empty" class="lt-empty" style="display:none;">No factor data available yet. Data populates after nightly ETL.</div>
  </div>
  <div id="lt-detail" class="lt-detail-panel" style="display:none;">
    <button id="lt-detail-close" class="lt-detail-close">&times;</button>
    <div id="lt-detail-body"></div>
  </div>
</div>
`;
}

function getLtScreenerPageJS() {
  return `
(function() {
  var data = [];
  var sortCol = 'composite';
  var sortAsc = false;
  var detailOpen = false;

  function getPreset() {
    var el = document.getElementById('lt-preset');
    return el ? el.value : 'balanced';
  }

  function scoreClass(v) {
    if (v == null) return 'score-low';
    if (v >= 65) return 'score-high';
    if (v >= 40) return 'score-mid';
    return 'score-low';
  }

  function scoreColor(v) {
    if (v == null) return '#EF4444';
    if (v >= 65) return '#22C55E';
    if (v >= 40) return '#F59E0B';
    return '#EF4444';
  }

  function scoreCell(v) {
    return '<td class="' + scoreClass(v) + '">' + (v != null ? Math.round(v) : '\\u2014') + '</td>';
  }

  function formatMcap(v) {
    if (v == null) return 'N/A';
    if (v >= 1e12) return '$' + (v / 1e12).toFixed(1) + 'T';
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(0) + 'M';
    return '$' + v.toLocaleString();
  }

  function getVerdict(score) {
    if (score >= 80) return { text: 'Strong Buy Signal', cls: 'strong' };
    if (score >= 65) return { text: 'Favorable', cls: 'favorable' };
    if (score >= 40) return { text: 'Neutral', cls: 'neutral' };
    if (score >= 20) return { text: 'Weak', cls: 'weak' };
    return { text: 'Avoid', cls: 'avoid' };
  }

  function getCompositeKey() {
    return 'score_composite_' + getPreset();
  }

  function getComposite(row) {
    var key = getCompositeKey();
    return row[key] != null ? row[key] : row.composite;
  }

  function renderTable(results) {
    data = results;
    var tbody = document.getElementById('lt-tbody');
    var empty = document.getElementById('lt-empty');
    var table = document.getElementById('lt-table');
    if (!tbody) return;

    if (!data || data.length === 0) {
      if (empty) empty.style.display = '';
      if (table) table.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (table) table.style.display = '';

    // Sort
    var col = sortCol;
    data.sort(function(a, b) {
      var av, bv;
      if (col === 'composite') { av = getComposite(a); bv = getComposite(b); }
      else { av = a[col]; bv = b[col]; }
      if (av == null) av = -Infinity;
      if (bv == null) bv = -Infinity;
      return sortAsc ? av - bv : bv - av;
    });

    var html = '';
    data.forEach(function(row, i) {
      var comp = getComposite(row);
      html += '<tr onclick="SQ.ltScreener.openDetail(\\'' + row.symbol + '\\')">';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td style="font-weight:700">' + row.symbol + '</td>';
      html += '<td style="font-family:Inter,sans-serif;font-size:12px">' + (row.sector || '') + '</td>';
      html += '<td>$' + (row.price != null ? Number(row.price).toFixed(2) : '\\u2014') + '</td>';
      html += scoreCell(row.score_value);
      html += scoreCell(row.score_growth);
      html += scoreCell(row.score_quality);
      html += scoreCell(row.score_momentum);
      html += scoreCell(row.score_risk);
      html += '<td class="' + scoreClass(comp) + '" style="font-weight:700">' + (comp != null ? Math.round(comp) : '\\u2014') + '</td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;

    // Populate sector dropdown
    var sectorEl = document.getElementById('lt-sector');
    if (sectorEl) {
      var current = sectorEl.value;
      var sectors = {};
      data.forEach(function(r) { if (r.sector) sectors[r.sector] = true; });
      var opts = '<option value="">All Sectors</option>';
      Object.keys(sectors).sort().forEach(function(s) {
        opts += '<option value="' + s + '"' + (s === current ? ' selected' : '') + '>' + s + '</option>';
      });
      sectorEl.innerHTML = opts;
    }
  }

  function reload() {
    var preset = getPreset();
    var sector = document.getElementById('lt-sector') ? document.getElementById('lt-sector').value : '';
    var minScore = document.getElementById('lt-min-score') ? document.getElementById('lt-min-score').value : '0';
    var qs = 'preset=' + encodeURIComponent(preset);
    if (sector) qs += '&sector=' + encodeURIComponent(sector);
    if (parseInt(minScore) > 0) qs += '&min_score=' + encodeURIComponent(minScore);
    fetch('/api/lt-screener?' + qs, { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(d) { renderTable(d.results || []); })
      .catch(function(e) { console.error('LT screener fetch error', e); });
  }

  function openDetail(symbol) {
    detailOpen = true;
    var panel = document.getElementById('lt-detail');
    var body = document.getElementById('lt-detail-body');
    if (panel) panel.style.display = '';
    if (body) body.innerHTML = '<div class="lt-loading"></div>';

    fetch('/api/lt-screener/detail/' + encodeURIComponent(symbol), { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(d) { renderDetail(d); })
      .catch(function(e) {
        if (body) body.innerHTML = '<p style="color:#EF4444">Error loading detail.</p>';
      });
  }

  function renderDetail(d) {
    var body = document.getElementById('lt-detail-body');
    if (!body) return;
    var comp = getComposite(d) || d.composite || 0;
    var verdict = getVerdict(comp);

    var html = '<h2 style="margin:0 0 4px;font-family:DM Sans,sans-serif;color:var(--text)">' + d.symbol + '</h2>';
    html += '<div class="lt-detail-meta">$' + (d.price != null ? Number(d.price).toFixed(2) : '\\u2014') + ' \\u00B7 ' + formatMcap(d.market_cap) + '</div>';
    html += '<div class="lt-verdict lt-verdict-' + verdict.cls + '">' + verdict.text + '</div>';

    // Score bars
    var factors = [
      { label: 'Value', key: 'score_value' },
      { label: 'Growth', key: 'score_growth' },
      { label: 'Quality', key: 'score_quality' },
      { label: 'Momentum', key: 'score_momentum' },
      { label: 'Risk', key: 'score_risk' }
    ];
    factors.forEach(function(f) {
      var score = d[f.key];
      var pct = score != null ? Math.round(score) : 0;
      html += '<div class="lt-score-row"><span>' + f.label + '</span>';
      html += '<div class="lt-score-bar"><div class="lt-score-fill" style="width:' + pct + '%;background:' + scoreColor(score) + '"></div></div>';
      html += '<span>' + (score != null ? Math.round(score) : '\\u2014') + '</span></div>';
    });

    // Why It Ranks
    if (d.why_ranks && d.why_ranks.length) {
      html += '<div class="lt-section"><h4>Why It Ranks</h4><div class="lt-pills">';
      d.why_ranks.forEach(function(s) {
        html += '<span class="lt-signal-pill">' + s.signal + ': ' + s.percentile + 'th pct</span>';
      });
      html += '</div></div>';
    }

    // Red Flags
    if (d.red_flags && d.red_flags.length) {
      html += '<div class="lt-section"><h4>Red Flags</h4>';
      d.red_flags.forEach(function(f) {
        html += '<div class="lt-red-flag">\\u26A0 ' + f.flag + ': ' + f.value + '</div>';
      });
      html += '</div>';
    }

    // Peers
    if (d.peers && d.peers.length) {
      html += '<div class="lt-section"><h4>Peers</h4><table class="lt-peers-table"><thead><tr><th>Symbol</th><th>Composite</th></tr></thead><tbody>';
      d.peers.forEach(function(p) {
        html += '<tr><td>' + p.symbol + '</td><td class="' + scoreClass(p.composite) + '">' + Math.round(p.composite) + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    // Backtest
    html += '<div class="lt-section" style="margin-top:20px">';
    html += '<button class="btn-primary" onclick="SQ.ltScreener.runBacktest(\\'' + d.symbol + '\\')">Run Backtest</button>';
    html += '<div id="lt-backtest-result"></div>';
    html += '</div>';

    body.innerHTML = html;
  }

  function runBacktest(symbol) {
    var el = document.getElementById('lt-backtest-result');
    if (el) el.innerHTML = '<div class="lt-loading"></div>';

    fetch('/api/lt-screener/backtest', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset: getPreset(), top_n: 25 })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (!el) return;
      if (d.error) { el.innerHTML = '<p style="color:#EF4444">' + d.error + '</p>'; return; }
      var m = d.metrics || {};
      var monthly = d.monthly || [];

      var html = '<canvas id="lt-eq-canvas" style="width:100%;height:120px;margin-top:12px;"></canvas>';
      html += '<div class="lt-stat-grid" style="margin-top:12px">';
      html += '<div class="lt-stat-card"><div class="lt-stat-label">CAGR</div><div class="lt-stat-value">' + ((m.cagr || 0) * 100).toFixed(1) + '%</div></div>';
      html += '<div class="lt-stat-card"><div class="lt-stat-label">Sharpe</div><div class="lt-stat-value">' + (m.sharpe || 0).toFixed(2) + '</div></div>';
      html += '<div class="lt-stat-card"><div class="lt-stat-label">Max DD</div><div class="lt-stat-value">' + ((m.max_drawdown || 0) * 100).toFixed(1) + '%</div></div>';
      html += '<div class="lt-stat-card"><div class="lt-stat-label">Alpha</div><div class="lt-stat-value">' + ((m.alpha || 0) * 100).toFixed(1) + '%</div></div>';
      html += '</div>';
      el.innerHTML = html;

      // Draw equity curve
      var canvas = document.getElementById('lt-eq-canvas');
      if (canvas && monthly.length > 1) {
        var ctx = canvas.getContext('2d');
        var w = canvas.width = canvas.offsetWidth;
        var h = canvas.height = 120;
        ctx.clearRect(0, 0, w, h);
        var cum = [1];
        monthly.forEach(function(mo) { cum.push(cum[cum.length - 1] * (1 + mo['return'])); });
        var maxV = Math.max.apply(null, cum), minV = Math.min.apply(null, cum);
        var range = maxV - minV || 1;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.beginPath();
        cum.forEach(function(v, i) {
          var x = (i / (cum.length - 1)) * w;
          var y = h - ((v - minV) / range) * (h - 10) - 5;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        var baseY = h - ((1 - minV) / range) * (h - 10) - 5;
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();
        ctx.setLineDash([]);
      }
    })
    .catch(function(e) {
      if (el) el.innerHTML = '<p style="color:#EF4444">Backtest failed.</p>';
    });
  }

  function closeDetail() {
    detailOpen = false;
    var panel = document.getElementById('lt-detail');
    if (panel) panel.style.display = 'none';
  }

  function init() {
    fetch('/api/lt-screener?preset=' + encodeURIComponent(getPreset()), { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(d) { renderTable(d.results || []); })
      .catch(function(e) { console.error('LT screener init error', e); });

    fetch('/api/lt-screener/status', { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var el = document.getElementById('lt-status');
        if (el && d.count != null) el.textContent = d.count + ' stocks scored';
      })
      .catch(function() {});

    var presetEl = document.getElementById('lt-preset');
    var sectorEl = document.getElementById('lt-sector');
    var minEl = document.getElementById('lt-min-score');
    var refreshEl = document.getElementById('lt-refresh');
    var closeEl = document.getElementById('lt-detail-close');

    if (presetEl) presetEl.addEventListener('change', reload);
    if (sectorEl) sectorEl.addEventListener('change', reload);
    if (minEl) minEl.addEventListener('input', function() {
      var v = document.getElementById('lt-min-score-val');
      if (v) v.textContent = minEl.value;
      reload();
    });
    if (refreshEl) refreshEl.addEventListener('click', reload);
    if (closeEl) closeEl.addEventListener('click', closeDetail);

    // Sort headers
    var ths = document.querySelectorAll('#lt-table th[data-sort]');
    ths.forEach(function(th) {
      th.addEventListener('click', function() {
        var col = th.getAttribute('data-sort');
        if (sortCol === col) { sortAsc = !sortAsc; }
        else { sortCol = col; sortAsc = false; }
        renderTable(data);
      });
    });
  }

  function destroy() {
    closeDetail();
    data = [];
  }

  SQ.ltScreener = {
    init: init,
    destroy: destroy,
    openDetail: openDetail,
    runBacktest: runBacktest
  };
})();
`;
}

module.exports = { getLtScreenerPageCSS, getLtScreenerPageHTML, getLtScreenerPageJS };
