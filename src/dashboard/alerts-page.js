/**
 * Alerts Page — SPA-embeddable exports
 *
 * Full alert history with stats cards, filtering, and real-time updates.
 *
 * Exports:
 *   getAlertsPageCSS()  → scoped CSS
 *   getAlertsPageHTML() → HTML fragment
 *   getAlertsPageJS()   → client-side JS on SQ.alertsPage namespace
 */

function getAlertsPageCSS() {
  return `
/* ── Alerts page scoped styles ── */
#page-alerts .page-header { padding: 20px 24px 12px; }
#page-alerts .page-header h2 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
#page-alerts .page-header .subtitle { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }

/* ── Stats Cards ── */
#page-alerts .alert-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  padding: 0 24px 16px;
}
@media (max-width: 900px) { #page-alerts .alert-stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { #page-alerts .alert-stats { grid-template-columns: 1fr; } }
#page-alerts .alert-stat-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 16px; display: flex; align-items: center; gap: 12px;
}
#page-alerts .alert-stat-icon {
  width: 36px; height: 36px; border-radius: 3px; display: flex; align-items: center; justify-content: center;
  background: var(--accent-subtle, rgba(251,191,36,0.1));
}
#page-alerts .alert-stat-icon.red { background: rgba(239,68,68,0.1); color: var(--red); }
#page-alerts .alert-stat-icon.blue { color: var(--accent); }
#page-alerts .alert-stat-icon.green { background: rgba(34,197,94,0.1); color: var(--green); }
#page-alerts .alert-stat-icon.yellow { background: rgba(234,179,8,0.1); color: var(--yellow); }
#page-alerts .alert-stat-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; }
#page-alerts .alert-stat-value { font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; color: var(--text); }
#page-alerts .alert-stat-value.red { color: var(--red); }

/* ── Filter Bar ── */
#page-alerts .alert-filters {
  display: flex; align-items: center; gap: 12px; padding: 0 24px 16px; flex-wrap: wrap;
}
#page-alerts .alert-filters select {
  font-family: var(--font-mono); font-size: 12px;
  background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
  border-radius: 3px; padding: 6px 10px; outline: none; cursor: pointer;
}
#page-alerts .alert-filters select:focus { border-color: var(--accent); }
#page-alerts .filter-group { display: flex; gap: 4px; }
#page-alerts .filter-btn {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 4px; padding: 5px 10px; cursor: pointer; transition: all 0.15s;
}
#page-alerts .filter-btn:hover { border-color: var(--accent); color: var(--accent); }
#page-alerts .filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* ── Alert Table ── */
#page-alerts .alert-table-wrap { padding: 0 24px 24px; overflow-x: auto; }
#page-alerts .alert-table {
  width: 100%; border-collapse: collapse; font-size: 0.85rem;
}
#page-alerts .alert-table th {
  text-align: left; padding: 8px 12px; font-family: var(--font-mono); font-size: 0.7rem;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em;
  border-bottom: 1px solid var(--border); white-space: nowrap;
}
#page-alerts .alert-table td {
  padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle;
}
#page-alerts .alert-table tr { cursor: pointer; transition: background 0.15s; }
#page-alerts .alert-table tbody tr:hover { background: rgba(251,191,36,0.05); }
#page-alerts .alert-table tr.sev-high { border-left: 3px solid var(--red); }
#page-alerts .alert-table tr.sev-medium { border-left: 3px solid var(--yellow); }
#page-alerts .alert-table tr.sev-low { border-left: 3px solid var(--accent); }
#page-alerts .alert-table .td-ticker { font-family: var(--font-mono); font-weight: 700; }
#page-alerts .alert-table .td-strike { font-family: var(--font-mono); }
#page-alerts .alert-table .td-time { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }
#page-alerts .sev-badge {
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  padding: 2px 8px; border-radius: 4px; display: inline-block;
}
#page-alerts .sev-badge.high { background: rgba(239,68,68,0.15); color: var(--red); }
#page-alerts .sev-badge.medium { background: rgba(234,179,8,0.15); color: var(--yellow); }
#page-alerts .sev-badge.low { background: rgba(251,191,36,0.15); color: var(--accent); }
#page-alerts .dir-arrow { font-size: 0.9rem; }
#page-alerts .dir-arrow.above { color: var(--green); }
#page-alerts .dir-arrow.below { color: var(--red); }
#page-alerts .alert-empty-table { color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 40px 0; }
#page-alerts .alert-table tr.flash { animation: alertFlash 1s ease; }
@keyframes alertFlash { 0% { background: rgba(251,191,36,0.15); } 100% { background: transparent; } }
  `;
}

function getAlertsPageHTML() {
  return `
  <div class="page" id="page-alerts">
    <div class="page-header">
      <div><h2>SharkAlerts&trade;</h2><div class="subtitle">GEX level break history</div></div>
    </div>

    <!-- Stats Cards -->
    <div class="alert-stats">
      <div class="alert-stat-card">
        <div class="alert-stat-icon blue"><i data-lucide="bell" style="width:18px;height:18px;"></i></div>
        <div><div class="alert-stat-label">Today's Alerts</div><div class="alert-stat-value" id="alertStatToday">0</div></div>
      </div>
      <div class="alert-stat-card">
        <div class="alert-stat-icon red"><i data-lucide="alert-triangle" style="width:18px;height:18px;"></i></div>
        <div><div class="alert-stat-label">High Severity</div><div class="alert-stat-value red" id="alertStatHigh">0</div></div>
      </div>
      <div class="alert-stat-card">
        <div class="alert-stat-icon green"><i data-lucide="target" style="width:18px;height:18px;"></i></div>
        <div><div class="alert-stat-label">Most Active</div><div class="alert-stat-value" id="alertStatActive">&mdash;</div></div>
      </div>
      <div class="alert-stat-card">
        <div class="alert-stat-icon yellow"><i data-lucide="clock" style="width:18px;height:18px;"></i></div>
        <div><div class="alert-stat-label">Last Alert</div><div class="alert-stat-value" id="alertStatLast">&mdash;</div></div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="alert-filters">
      <select id="alertFilterTicker"><option value="">All Tickers</option></select>
      <div class="filter-group" id="alertFilterSeverity">
        <button class="filter-btn active" data-sev="high">High</button>
        <button class="filter-btn active" data-sev="medium">Medium</button>
        <button class="filter-btn active" data-sev="low">Low</button>
      </div>
      <div class="filter-group" id="alertFilterDate">
        <button class="filter-btn active" data-range="today">Today</button>
        <button class="filter-btn" data-range="24h">24h</button>
        <button class="filter-btn" data-range="7d">7d</button>
        <button class="filter-btn" data-range="all">All</button>
      </div>
    </div>

    <!-- Table -->
    <div class="alert-table-wrap">
      <table class="alert-table">
        <thead><tr>
          <th>Time</th><th>Ticker</th><th>Level</th><th>Dir</th><th>Severity</th><th>Message</th>
        </tr></thead>
        <tbody id="alertTableBody">
          <tr><td colspan="6" class="alert-empty-table">Loading alerts...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function getAlertsPageJS() {
  return `
;(function() {
  var allAlerts = [];
  var filters = { ticker: '', severity: { high: true, medium: true, low: true }, range: 'today' };

  SQ.alertsPage = {
    init: function() {
      fetch('/api/alerts?limit=200').then(function(r) { return r.json(); }).then(function(data) {
        allAlerts = data.alerts || [];
        SQ.alertsPage._populateTickers();
        SQ.alertsPage._render();
      }).catch(function() {});

      // Severity toggle buttons
      document.querySelectorAll('#alertFilterSeverity .filter-btn').forEach(function(btn) {
        btn.onclick = function() {
          btn.classList.toggle('active');
          filters.severity[btn.dataset.sev] = btn.classList.contains('active');
          SQ.alertsPage._render();
        };
      });

      // Date range buttons (single select)
      document.querySelectorAll('#alertFilterDate .filter-btn').forEach(function(btn) {
        btn.onclick = function() {
          document.querySelectorAll('#alertFilterDate .filter-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          filters.range = btn.dataset.range;
          SQ.alertsPage._render();
        };
      });

      // Ticker dropdown
      document.getElementById('alertFilterTicker').onchange = function() {
        filters.ticker = this.value;
        SQ.alertsPage._render();
      };

      // Real-time updates
      if (SQ.socket) {
        SQ.socket.on('alert:gex', SQ.alertsPage._onNewAlert);
      }

      // Render Lucide icons
      if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    _onNewAlert: function(alert) {
      allAlerts.unshift(alert);
      if (allAlerts.length > 200) allAlerts.pop();
      SQ.alertsPage._populateTickers();
      SQ.alertsPage._render();
      // Flash the first row
      var first = document.querySelector('#alertTableBody tr');
      if (first) { first.classList.add('flash'); setTimeout(function() { first.classList.remove('flash'); }, 1000); }
    },

    _populateTickers: function() {
      var sel = document.getElementById('alertFilterTicker');
      var current = sel.value;
      var tickers = [];
      allAlerts.forEach(function(a) { if (a.ticker && tickers.indexOf(a.ticker) === -1) tickers.push(a.ticker); });
      tickers.sort();
      sel.innerHTML = '<option value="">All Tickers</option>' + tickers.map(function(t) {
        return '<option value="' + t + '"' + (t === current ? ' selected' : '') + '>' + t + '</option>';
      }).join('');
    },

    _filterAlerts: function() {
      var now = Date.now();
      return allAlerts.filter(function(a) {
        if (filters.ticker && a.ticker !== filters.ticker) return false;
        var sev = a.severity || 'high';
        if (!filters.severity[sev]) return false;
        if (filters.range !== 'all') {
          var ts = new Date(a.timestamp).getTime();
          if (filters.range === 'today') {
            var todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
            var alertDay = new Date(a.timestamp).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
            if (alertDay !== todayStr) return false;
          } else if (filters.range === '24h') {
            if (now - ts > 24 * 60 * 60 * 1000) return false;
          } else if (filters.range === '7d') {
            if (now - ts > 7 * 24 * 60 * 60 * 1000) return false;
          }
        }
        return true;
      });
    },

    _render: function() {
      var filtered = SQ.alertsPage._filterAlerts();
      SQ.alertsPage._renderStats(filtered);
      SQ.alertsPage._renderTable(filtered);
    },

    _renderStats: function(filtered) {
      // Today count
      var todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
      var todayAlerts = allAlerts.filter(function(a) {
        return new Date(a.timestamp).toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) === todayStr;
      });
      document.getElementById('alertStatToday').textContent = String(todayAlerts.length);

      // High severity count
      var highCount = filtered.filter(function(a) { return a.severity === 'high'; }).length;
      document.getElementById('alertStatHigh').textContent = String(highCount);

      // Most active ticker
      var tickerCounts = {};
      filtered.forEach(function(a) { tickerCounts[a.ticker] = (tickerCounts[a.ticker] || 0) + 1; });
      var topTicker = Object.keys(tickerCounts).sort(function(a, b) { return tickerCounts[b] - tickerCounts[a]; })[0];
      document.getElementById('alertStatActive').textContent = topTicker ? topTicker + ' (' + tickerCounts[topTicker] + ')' : '\\u2014';

      // Last alert
      if (filtered.length) {
        var last = new Date(filtered[0].timestamp);
        var diff = Math.round((Date.now() - last.getTime()) / 60000);
        var text = diff < 1 ? 'Just now' : diff < 60 ? diff + 'm ago' : Math.round(diff / 60) + 'h ago';
        document.getElementById('alertStatLast').textContent = text;
      } else {
        document.getElementById('alertStatLast').textContent = '\\u2014';
      }
    },

    _renderTable: function(filtered) {
      var tbody = document.getElementById('alertTableBody');
      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="alert-empty-table">No alerts matching filters</td></tr>';
        return;
      }
      var html = '';
      filtered.forEach(function(a) {
        var sev = a.severity || 'high';
        var time = new Date(a.timestamp);
        var timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });
        var dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
        var arrow = a.direction === 'above' ? '&#x25B2;' : '&#x25BC;';
        var dirClass = a.direction === 'above' ? 'above' : 'below';
        html += '<tr class="sev-' + sev + '" onclick="nav(&#39;gex&#39;)" title="' + time.toLocaleString() + '">';
        html += '<td class="td-time">' + dateStr + ' ' + timeStr + '</td>';
        html += '<td class="td-ticker">' + (a.ticker || '\\u2014') + '</td>';
        html += '<td class="td-strike">$' + (a.strike || '\\u2014') + '</td>';
        html += '<td><span class="dir-arrow ' + dirClass + '">' + arrow + '</span> ' + (a.direction || '') + '</td>';
        html += '<td><span class="sev-badge ' + sev + '">' + sev + '</span></td>';
        html += '<td>' + (a.message || '') + '</td>';
        html += '</tr>';
      });
      tbody.innerHTML = html;
    },

    destroy: function() {
      if (SQ.socket) {
        SQ.socket.off('alert:gex', SQ.alertsPage._onNewAlert);
      }
    }
  };
})();
  `;
}

module.exports = { getAlertsPageCSS, getAlertsPageHTML, getAlertsPageJS };
