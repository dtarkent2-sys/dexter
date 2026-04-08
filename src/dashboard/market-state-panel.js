'use strict';

/**
 * Market State Panel — Compact real-time signal summary
 *
 * Renders as a persistent strip on the GEX page (above the heatmap)
 * and optionally on other pages. Shows regime, PoLR, danger, pressure,
 * charm, walls + fragility, and expected move.
 *
 * Also provides:
 *   - Advanced expandable section (full MarketState JSON + DecisionTrace)
 *   - Debug toggle showing "signals used" badges
 *   - Structure alerts feed
 */

function getMarketStatePanelCSS() {
  return `
/* ── Market State Panel ── */
.ms-panel {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 12px 16px; margin: 8px 12px; font-family: var(--font-mono); font-size: 12px;
  max-height: 260px; overflow-y: auto; flex-shrink: 1;
}
.ms-panel-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
}
.ms-panel-title {
  font-family: var(--font-heading); font-size: 14px; font-weight: 700; color: var(--text);
  display: flex; align-items: center; gap: 8px;
}
.ms-panel-title .ms-live {
  width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
  animation: msPulse 2s ease-in-out infinite;
}
@keyframes msPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.ms-panel-actions { display: flex; gap: 6px; }
.ms-panel-btn {
  padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); cursor: pointer;
  font-family: var(--font-mono); font-size: 10px; transition: all 0.15s;
}
.ms-panel-btn:hover { border-color: var(--accent); color: var(--text); }
.ms-panel-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* Grid of signal cards */
.ms-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;
}
@media (max-width: 768px) { .ms-grid { grid-template-columns: repeat(2, 1fr); } }

.ms-card {
  background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 3px;
  padding: 8px 10px; position: relative;
}
.ms-card-label {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); margin-bottom: 4px;
}
.ms-card-value {
  font-size: 14px; font-weight: 700; color: var(--text);
}
.ms-card-sub {
  font-size: 10px; color: var(--text-secondary); margin-top: 2px;
}
.ms-card .ms-tag {
  position: absolute; top: 4px; right: 4px; padding: 1px 5px; border-radius: 3px;
  font-size: 8px; font-weight: 700; text-transform: uppercase;
}
.ms-tag.bullish { background: rgba(34,197,94,0.15); color: #22c55e; }
.ms-tag.bearish { background: rgba(239,68,68,0.15); color: #ef4444; }
.ms-tag.neutral { background: rgba(251,191,36,0.15); color: #fbbf24; }
.ms-tag.danger { background: rgba(239,68,68,0.2); color: #ef4444; }
.ms-tag.warning { background: rgba(234,179,8,0.15); color: #eab308; }
.ms-tag.safe { background: rgba(34,197,94,0.15); color: #22c55e; }

/* Regime badge colors */
.ms-regime-PIN { color: #fbbf24; }
.ms-regime-BREAKOUT { color: #22c55e; }
.ms-regime-FRAGILE { color: #ef4444; }
.ms-regime-NEUTRAL { color: var(--text-muted); }

/* Alerts strip */
.ms-alerts {
  margin-top: 10px; border-top: 1px solid var(--border); padding-top: 8px;
  max-height: 120px; overflow-y: auto;
}
.ms-alert {
  display: flex; align-items: flex-start; gap: 8px; padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 11px;
}
.ms-alert:last-child { border-bottom: none; }
.ms-alert-sev {
  width: 6px; height: 6px; border-radius: 50%; margin-top: 4px; flex-shrink: 0;
}
.ms-alert-sev.critical { background: #ef4444; }
.ms-alert-sev.high { background: #f97316; }
.ms-alert-sev.medium { background: #eab308; }
.ms-alert-sev.low { background: #fbbf24; }
.ms-alert-text { color: var(--text-secondary); line-height: 1.4; }
.ms-alert-text strong { color: var(--text); }
.ms-alert-time { color: var(--text-muted); font-size: 9px; white-space: nowrap; margin-left: auto; }

/* Advanced section */
.ms-advanced {
  margin-top: 10px; border-top: 1px solid var(--border); padding-top: 8px;
  display: none;
}
.ms-advanced.open { display: block; }
.ms-json {
  background: rgba(0,0,0,0.3); border-radius: 4px; padding: 8px;
  font-size: 10px; color: var(--text-muted); overflow-x: auto;
  max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
}

/* Debug badges */
.ms-debug-badges {
  display: none; flex-wrap: wrap; gap: 4px; margin-top: 8px;
}
.ms-debug-badges.visible { display: flex; }
.ms-debug-badge {
  padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 700;
}
.ms-debug-badge.used { background: rgba(34,197,94,0.15); color: #22c55e; }
.ms-debug-badge.unused { background: rgba(239,68,68,0.1); color: var(--text-muted); }
`;
}

function getMarketStatePanelHTML() {
  return `
<div class="ms-panel" id="msPanel" style="display:none;">
  <div class="ms-panel-header">
    <div class="ms-panel-title">
      <span class="ms-live"></span> MARKET STATE
    </div>
    <div class="ms-panel-actions">
      <button class="ms-panel-btn" id="msBtnDebug" onclick="SQ.msPanel.toggleDebug()">Debug</button>
      <button class="ms-panel-btn" id="msBtnAdvanced" onclick="SQ.msPanel.toggleAdvanced()">Advanced</button>
    </div>
  </div>
  <div class="ms-grid" id="msGrid"></div>
  <div class="ms-debug-badges" id="msDebugBadges"></div>
  <div class="ms-alerts" id="msAlerts"></div>
  <div class="ms-advanced" id="msAdvanced">
    <div class="ms-json" id="msJson"></div>
  </div>
</div>`;
}

function getMarketStatePanelJS() {
  return `
;(function() {
  var _state = null;
  var _alerts = [];
  var _traces = [];
  var _debugMode = false;
  var _advancedOpen = false;
  var _pollTimer = null;
  var _alertSSE = null;
  var _ticker = 'SPY';

  function fmt(n, d) { return n != null ? Number(n).toFixed(d || 0) : '—'; }

  function regimeColor(r) {
    return r === 'BREAKOUT' ? '#22c55e' : r === 'FRAGILE' ? '#ef4444' : r === 'PIN' ? '#fbbf24' : 'var(--text-muted)';
  }

  function dangerTag(score) {
    if (score > 70) return '<span class="ms-tag danger">HIGH</span>';
    if (score > 40) return '<span class="ms-tag warning">MED</span>';
    return '<span class="ms-tag safe">LOW</span>';
  }

  function polrTag(dir) {
    if (dir === 'up') return '<span class="ms-tag bullish">UP</span>';
    if (dir === 'down') return '<span class="ms-tag bearish">DOWN</span>';
    return '<span class="ms-tag neutral">NEUTRAL</span>';
  }

  function elastTag(he) {
    if (!he) return '';
    var mx = Math.max(he.upside || 0, he.downside || 0);
    if (mx >= 60) return '<span class="ms-tag danger">' + (he.dominant_direction || '?') + '</span>';
    if (mx >= 35) return '<span class="ms-tag warning">' + (he.dominant_direction || '?') + '</span>';
    return '<span class="ms-tag safe">' + (he.dominant_direction || '?') + '</span>';
  }

  function renderGrid() {
    var el = document.getElementById('msGrid');
    if (!el || !_state) return;

    var s = _state;
    var cw = s.structural.callWall;
    var pw = s.structural.putWall;
    var em = s.vol.expectedMove;
    var emStr = em && em.length ? fmt(em[0].lower, 1) + '–' + fmt(em[0].upper, 1) : '—';

    el.innerHTML = [
      card('Regime', '<span style="color:' + regimeColor(s.regime.type) + '">' + s.regime.type + '</span>',
        fmt(s.regime.confidence * 100) + '% conf'),
      card('PoLR', s.polr.direction.toUpperCase(), fmt(s.polr.probability * 100) + '% prob', polrTag(s.polr.direction)),
      card('Danger', fmt(s.risk.dangerScore), '', dangerTag(s.risk.dangerScore)),
      card('Pressure', fmt(s.pressure.pressureIndex), s.pressure.direction),
      card('Charm', s.timing.charm.lateDayEffect, 'Risk: ' + s.timing.charm.lateDayRisk),
      card('Call Wall', cw ? '$' + fmt(cw.strike, 0) : '—', cw ? cw.fragilityLabel : ''),
      card('Put Wall', pw ? '$' + fmt(pw.strike, 0) : '—', pw ? pw.fragilityLabel : ''),
      card('Exp. Move', emStr, ''),
      card('Stability', fmt(s.structural.stability), '/100'),
      card('Dominance', fmt(s.pressure.dominance), s.pressure.dominanceLabel),
      s.hedgingElasticity ? card('Elasticity',
        fmt(Math.max(s.hedgingElasticity.upside || 0, s.hedgingElasticity.downside || 0)),
        'U' + fmt(s.hedgingElasticity.upside || 0) + ' / D' + fmt(s.hedgingElasticity.downside || 0),
        elastTag(s.hedgingElasticity)) : '',
    ].join('');
  }

  function card(label, value, sub, tag) {
    return '<div class="ms-card"><div class="ms-card-label">' + label + '</div>' +
      '<div class="ms-card-value">' + value + '</div>' +
      (sub ? '<div class="ms-card-sub">' + sub + '</div>' : '') +
      (tag || '') + '</div>';
  }

  function renderAlerts() {
    var el = document.getElementById('msAlerts');
    if (!el) return;
    if (!_alerts.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:11px;">No structural alerts.</div>'; return; }
    el.innerHTML = _alerts.slice(-5).reverse().map(function(a) {
      var ago = Math.round((Date.now() - a.ts) / 60000);
      return '<div class="ms-alert">' +
        '<div class="ms-alert-sev ' + a.severity + '"></div>' +
        '<div class="ms-alert-text"><strong>' + a.what + '</strong><br>' + a.impact + '</div>' +
        '<div class="ms-alert-time">' + (ago < 1 ? 'now' : ago + 'm ago') + '</div></div>';
    }).join('');
  }

  function renderDebug() {
    var el = document.getElementById('msDebugBadges');
    if (!el || !_traces.length) return;
    var t = _traces[_traces.length - 1];
    if (!t || !t.signalsUsed) return;
    var html = '';
    for (var key in t.signalsUsed) {
      var used = t.signalsUsed[key];
      html += '<span class="ms-debug-badge ' + (used ? 'used' : 'unused') + '">' + key + '</span>';
    }
    html += '<span class="ms-debug-badge ' + (t.regimeUsed ? 'used' : 'unused') + '">regime:' + (t.regime || '?') + '</span>';
    el.innerHTML = html;
  }

  function renderAdvanced() {
    var el = document.getElementById('msJson');
    if (!el) return;
    var obj = { state: _state, lastTrace: _traces.length ? _traces[_traces.length - 1] : null };
    el.textContent = JSON.stringify(obj, null, 2);
  }

  async function poll() {
    try {
      var res = await fetch('/api/market-state/' + _ticker);
      var data = await res.json();
      if (data.available && data.state) {
        _state = data.state;
        renderGrid();
        if (_advancedOpen) renderAdvanced();
        document.getElementById('msPanel').style.display = '';
      }
    } catch(e) { /* silent */ }

    // Fetch alerts
    try {
      var aRes = await fetch('/api/structure-alerts');
      var aData = await aRes.json();
      if (aData.alerts) { _alerts = aData.alerts; renderAlerts(); }
    } catch(e) { /* silent */ }

    // Fetch traces if debug mode
    if (_debugMode) {
      try {
        var tRes = await fetch('/api/market-state/traces?limit=5');
        var tData = await tRes.json();
        if (tData.traces) { _traces = tData.traces; renderDebug(); }
      } catch(e) { /* silent */ }
    }
  }

  SQ.msPanel = {
    init: function(ticker) {
      _ticker = ticker || 'SPY';
      poll();
      _pollTimer = setInterval(poll, 15000); // 15s refresh

      // SSE for real-time alerts
      try {
        _alertSSE = new EventSource('/api/structure-alerts/stream');
        _alertSSE.onmessage = function(e) {
          try {
            var alert = JSON.parse(e.data);
            if (alert.type && alert.type !== 'connected') {
              _alerts.push(alert);
              if (_alerts.length > 20) _alerts.shift();
              renderAlerts();
            }
          } catch(e) { /* ignore */ }
        };
      } catch(e) { /* SSE not available */ }
    },
    destroy: function() {
      if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
      if (_alertSSE) { _alertSSE.close(); _alertSSE = null; }
    },
    toggleDebug: function() {
      _debugMode = !_debugMode;
      var el = document.getElementById('msDebugBadges');
      var btn = document.getElementById('msBtnDebug');
      if (el) el.classList.toggle('visible', _debugMode);
      if (btn) btn.classList.toggle('active', _debugMode);
      if (_debugMode) poll();
    },
    toggleAdvanced: function() {
      _advancedOpen = !_advancedOpen;
      var el = document.getElementById('msAdvanced');
      var btn = document.getElementById('msBtnAdvanced');
      if (el) el.classList.toggle('open', _advancedOpen);
      if (btn) btn.classList.toggle('active', _advancedOpen);
      if (_advancedOpen) renderAdvanced();
    },
    setTicker: function(t) { _ticker = t; poll(); },
  };
})();
`;
}

module.exports = { getMarketStatePanelCSS, getMarketStatePanelHTML, getMarketStatePanelJS };
