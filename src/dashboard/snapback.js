'use strict';

/**
 * Snapback Signal Ladder — Dashboard Page
 *
 * Real-time display of the Snapback Signal Engine output.
 * Shows live tier classification, signal history, and daily summary.
 */

function getSnapbackPageCSS() {
  return `
#page-snapback { padding: 20px; }
#page-snapback .signal-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
#page-snapback .signal-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px;
  transition: border-color 0.2s;
}
#page-snapback .signal-card.active { border-color: var(--accent); }
#page-snapback .signal-card.tier-a-plus { border-left: 4px solid #22c55e; }
#page-snapback .signal-card.tier-a { border-left: 4px solid #fbbf24; }
#page-snapback .signal-card.tier-b { border-left: 4px solid #f59e0b; }
#page-snapback .signal-card .tier-label {
  font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; margin-bottom: 4px;
}
#page-snapback .signal-card .tier-desc { color: var(--text-muted); font-size: 13px; margin-bottom: 12px; }
#page-snapback .signal-card .tier-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
#page-snapback .signal-card .stat-item { }
#page-snapback .signal-card .stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
#page-snapback .signal-card .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; }

#page-snapback .live-panel { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
#page-snapback .live-signal-box {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px;
}
#page-snapback .live-signal-box h3 { margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
#page-snapback .signal-badge {
  display: inline-block; padding: 6px 16px; border-radius: 3px; font-family: 'JetBrains Mono', monospace;
  font-size: 18px; font-weight: 700; margin-right: 8px;
}
#page-snapback .signal-badge.call { background: rgba(34,197,94,0.15); color: #22c55e; }
#page-snapback .signal-badge.put { background: rgba(239,68,68,0.15); color: #ef4444; }
#page-snapback .signal-badge.none { background: rgba(148,163,184,0.1); color: var(--text-muted); }
#page-snapback .factor-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 16px; }
#page-snapback .factor-item { text-align: center; }
#page-snapback .factor-item .f-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
#page-snapback .factor-item .f-value { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; }
#page-snapback .factor-item .f-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 4px; }
#page-snapback .factor-item .f-bar-fill { height: 100%; border-radius: 2px; background: var(--accent); transition: width 0.3s; }

#page-snapback .engine-status {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px;
}
#page-snapback .engine-status h3 { margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
#page-snapback .status-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border); }
#page-snapback .status-row:last-child { border: none; }
#page-snapback .status-key { color: var(--text-muted); font-size: 13px; }
#page-snapback .status-val { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
#page-snapback .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
#page-snapback .status-dot.on { background: #22c55e; }
#page-snapback .status-dot.off { background: #ef4444; }

#page-snapback .signal-table-wrap {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px;
}
#page-snapback .signal-table-wrap h3 { margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
#page-snapback .signal-table { width: 100%; border-collapse: collapse; font-size: 13px; }
#page-snapback .signal-table th {
  text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border);
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 500;
}
#page-snapback .signal-table td {
  padding: 8px 12px; border-bottom: 1px solid var(--border); font-family: 'JetBrains Mono', monospace;
}
#page-snapback .signal-table tr:hover { background: var(--bg-surface-hover); }
#page-snapback .tier-pill {
  display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
}
#page-snapback .tier-pill.t-aplus { background: rgba(34,197,94,0.15); color: #22c55e; }
#page-snapback .tier-pill.t-a { background: rgba(251,191,36,0.15); color: #fbbf24; }
#page-snapback .tier-pill.t-b { background: rgba(245,158,11,0.15); color: #f59e0b; }
#page-snapback .conf-bar { display: inline-block; width: 50px; height: 6px; background: var(--border); border-radius: 3px; vertical-align: middle; margin-left: 6px; }
#page-snapback .conf-bar-fill { height: 100%; border-radius: 3px; }

#page-snapback .ticker-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
#page-snapback .ticker-tab {
  padding: 6px 16px; border-radius: 3px; border: 1px solid var(--border); background: transparent;
  color: var(--text-muted); cursor: pointer; font-size: 13px; font-family: 'JetBrains Mono', monospace;
}
#page-snapback .ticker-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* ── Regime Meter ── */
#page-snapback .regime-meter {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 20px; margin-bottom: 20px; position: relative; overflow: hidden;
}
#page-snapback .regime-meter::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--border); transition: background 0.5s;
}
#page-snapback .regime-meter.regime-premium::before { background: #22c55e; }
#page-snapback .regime-meter.regime-active::before { background: #eab308; }
#page-snapback .regime-meter.regime-quiet::before { background: #f97316; }
#page-snapback .regime-meter.regime-standdown::before { background: #ef4444; }

#page-snapback .regime-meter-top {
  display: flex; align-items: center; gap: 16px; margin-bottom: 16px;
}
#page-snapback .regime-dot {
  width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
  background: var(--text-muted); transition: background 0.5s;
  animation: regime-pulse 2s ease-in-out infinite;
}
#page-snapback .regime-dot.green { background: #22c55e; }
#page-snapback .regime-dot.yellow { background: #eab308; }
#page-snapback .regime-dot.orange { background: #f97316; }
#page-snapback .regime-dot.red { background: #ef4444; }
@keyframes regime-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

#page-snapback .regime-label {
  font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase;
}
#page-snapback .regime-label.green { color: #22c55e; }
#page-snapback .regime-label.yellow { color: #eab308; }
#page-snapback .regime-label.orange { color: #f97316; }
#page-snapback .regime-label.red { color: #ef4444; }

#page-snapback .regime-conf {
  font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700;
  margin-left: auto; color: var(--text);
}
#page-snapback .regime-conf-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); margin-top: -2px;
}

#page-snapback .regime-desc {
  font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;
}

#page-snapback .regime-factors {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;
}
#page-snapback .regime-factor {
  background: rgba(15,23,42,0.5); border: 1px solid var(--border); border-radius: 3px;
  padding: 12px; text-align: center;
}
#page-snapback .regime-factor-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); margin-bottom: 4px;
}
#page-snapback .regime-factor-value {
  font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600;
}
#page-snapback .regime-factor-score {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; margin-top: 2px;
}
#page-snapback .regime-factor-score.positive { color: #22c55e; }
#page-snapback .regime-factor-score.neutral { color: #eab308; }
#page-snapback .regime-factor-score.negative { color: #ef4444; }

#page-snapback .regime-loading {
  text-align: center; padding: 16px; color: var(--text-muted); font-size: 13px;
}

@media (max-width: 768px) {
  #page-snapback .signal-grid { grid-template-columns: 1fr; }
  #page-snapback .live-panel { grid-template-columns: 1fr; }
  #page-snapback .factor-grid { grid-template-columns: repeat(3, 1fr); }
  #page-snapback .regime-factors { grid-template-columns: 1fr; }
  #page-snapback .regime-meter-top { flex-wrap: wrap; }
}
`;
}

function getSnapbackPageHTML() {
  return `
  <div class="page" id="page-snapback">
    <div class="page-header">
      <div><h2>Snapback Signals</h2><div class="subtitle">Real-time gamma-density microstructure signals</div></div>
    </div>

    <div class="ticker-tabs" id="snapback-ticker-tabs">
      <button class="ticker-tab active" data-ticker="QQQ">QQQ</button>
      <button class="ticker-tab" data-ticker="SPY">SPY</button>
    </div>

    <!-- Regime Meter -->
    <div class="regime-meter" id="snapback-regime-meter">
      <div class="regime-loading" id="snap-regime-loading">Scanning market conditions...</div>
      <div id="snap-regime-content" style="display:none;">
        <div class="regime-meter-top">
          <div class="regime-dot" id="snap-regime-dot"></div>
          <div>
            <div class="regime-label" id="snap-regime-label">--</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;" id="snap-regime-subtitle"></div>
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div class="regime-conf" id="snap-regime-conf">--</div>
            <div class="regime-conf-label">Confidence</div>
          </div>
        </div>
        <div class="regime-desc" id="snap-regime-desc"></div>
        <div class="regime-factors">
          <div class="regime-factor">
            <div class="regime-factor-label">Liquidity Fragility</div>
            <div class="regime-factor-value" id="snap-rf-density">--</div>
            <div class="regime-factor-score" id="snap-rf-density-score"></div>
          </div>
          <div class="regime-factor">
            <div class="regime-factor-label">Volatility</div>
            <div class="regime-factor-value" id="snap-rf-vol">--</div>
            <div class="regime-factor-score" id="snap-rf-vol-score"></div>
          </div>
          <div class="regime-factor">
            <div class="regime-factor-label">Structural Conflict</div>
            <div class="regime-factor-value" id="snap-rf-wall">--</div>
            <div class="regime-factor-score" id="snap-rf-wall-score"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tier Cards -->
    <div class="signal-grid" id="snapback-tier-cards">
      <div class="signal-card tier-a-plus" id="snapback-card-aplus">
        <div class="tier-label" style="color:#22c55e;">A+</div>
        <div class="tier-desc">Elite — PF 1.46, Sharpe 2.55</div>
        <div class="tier-stats">
          <div class="stat-item"><div class="stat-label">Today</div><div class="stat-value" id="snap-aplus-today">0</div></div>
          <div class="stat-item"><div class="stat-label">Avg/Mo</div><div class="stat-value">~33</div></div>
          <div class="stat-item"><div class="stat-label">Density</div><div class="stat-value">&lt; P30</div></div>
          <div class="stat-item"><div class="stat-label">Min Overshoot</div><div class="stat-value">0.30%</div></div>
        </div>
      </div>
      <div class="signal-card tier-a" id="snapback-card-a">
        <div class="tier-label" style="color:#fbbf24;">A</div>
        <div class="tier-desc">Strong — PF 1.22</div>
        <div class="tier-stats">
          <div class="stat-item"><div class="stat-label">Today</div><div class="stat-value" id="snap-a-today">0</div></div>
          <div class="stat-item"><div class="stat-label">Avg/Mo</div><div class="stat-value">~57</div></div>
          <div class="stat-item"><div class="stat-label">Density</div><div class="stat-value">&lt; P40</div></div>
          <div class="stat-item"><div class="stat-label">Min Overshoot</div><div class="stat-value">0.25%</div></div>
        </div>
      </div>
      <div class="signal-card tier-b" id="snapback-card-b">
        <div class="tier-label" style="color:#f59e0b;">B</div>
        <div class="tier-desc">Moderate — PF 1.26 (accel required)</div>
        <div class="tier-stats">
          <div class="stat-item"><div class="stat-label">Today</div><div class="stat-value" id="snap-b-today">0</div></div>
          <div class="stat-item"><div class="stat-label">Avg/Mo</div><div class="stat-value">~67</div></div>
          <div class="stat-item"><div class="stat-label">Density</div><div class="stat-value">&lt; P50</div></div>
          <div class="stat-item"><div class="stat-label">Min Overshoot</div><div class="stat-value">0.20%</div></div>
        </div>
      </div>
    </div>

    <!-- Live Signal + Engine Status -->
    <div class="live-panel">
      <div class="live-signal-box">
        <h3>Live Signal</h3>
        <div id="snapback-live-signal">
          <div style="margin-bottom:12px;">
            <span class="signal-badge none" id="snap-live-badge">NO SIGNAL</span>
            <span id="snap-live-tier" style="font-size:20px;font-weight:700;"></span>
            <span id="snap-live-conf" style="margin-left:12px;color:var(--text-muted);font-size:13px;"></span>
          </div>
          <div class="factor-grid" id="snap-factor-grid">
            <div class="factor-item">
              <div class="f-label">Density</div>
              <div class="f-value" id="snap-f-density">--</div>
              <div class="f-bar"><div class="f-bar-fill" id="snap-fb-density" style="width:0%;"></div></div>
            </div>
            <div class="factor-item">
              <div class="f-label">Flip Dist</div>
              <div class="f-value" id="snap-f-flip">--</div>
              <div class="f-bar"><div class="f-bar-fill" id="snap-fb-flip" style="width:0%;"></div></div>
            </div>
            <div class="factor-item">
              <div class="f-label">Overshoot</div>
              <div class="f-value" id="snap-f-overshoot">--</div>
              <div class="f-bar"><div class="f-bar-fill" id="snap-fb-overshoot" style="width:0%;"></div></div>
            </div>
            <div class="factor-item">
              <div class="f-label">Velocity</div>
              <div class="f-value" id="snap-f-velocity">--</div>
              <div class="f-bar"><div class="f-bar-fill" id="snap-fb-velocity" style="width:0%;"></div></div>
            </div>
            <div class="factor-item">
              <div class="f-label">Spot</div>
              <div class="f-value" id="snap-f-spot">--</div>
              <div class="f-bar"><div class="f-bar-fill" id="snap-fb-spot" style="width:0%;background:#94a3b8;"></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="engine-status">
        <h3>Engine Status</h3>
        <div id="snapback-engine-info">
          <div class="status-row"><span class="status-key">Status</span><span class="status-val" id="snap-eng-status">--</span></div>
          <div class="status-row"><span class="status-key">Scans</span><span class="status-val" id="snap-eng-scans">0</span></div>
          <div class="status-row"><span class="status-key">Signals Today</span><span class="status-val" id="snap-eng-signals">0</span></div>
          <div class="status-row"><span class="status-key">QQQ Bars</span><span class="status-val" id="snap-eng-bars-qqq">0</span></div>
          <div class="status-row"><span class="status-key">SPY Bars</span><span class="status-val" id="snap-eng-bars-spy">0</span></div>
          <div class="status-row"><span class="status-key">QQQ P30</span><span class="status-val" id="snap-eng-p30-qqq">--</span></div>
          <div class="status-row"><span class="status-key">SPY P30</span><span class="status-val" id="snap-eng-p30-spy">--</span></div>
          <div class="status-row"><span class="status-key">Last Scan</span><span class="status-val" id="snap-eng-lastscan">--</span></div>
        </div>
      </div>
    </div>

    <!-- Signal History Table -->
    <div class="signal-table-wrap">
      <h3>Signal Log</h3>
      <table class="signal-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Ticker</th>
            <th>Tier</th>
            <th>Signal</th>
            <th>Overshoot</th>
            <th>Density</th>
            <th>Flip Dist</th>
            <th>Velocity</th>
            <th>Confidence</th>
            <th>Spot</th>
          </tr>
        </thead>
        <tbody id="snapback-signal-tbody"></tbody>
      </table>
      <div id="snapback-no-signals" style="text-align:center;padding:24px;color:var(--text-muted);display:none;">
        No signals recorded yet. Engine scans every 60s during market hours (11:30-16:30 ET).
      </div>
    </div>
  </div>`;
}

function getSnapbackPageJS() {
  return `
(function() {
  var _ticker = 'QQQ';
  var _pollTimer = null;
  var _sse = null;

  SQ.snapback = {
    init: function() {
      // Ticker tabs
      document.querySelectorAll('#snapback-ticker-tabs .ticker-tab').forEach(function(btn) {
        btn.onclick = function() {
          document.querySelectorAll('#snapback-ticker-tabs .ticker-tab').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          _ticker = btn.dataset.ticker;
          _refresh();
        };
      });
      _refresh();
      _pollTimer = setInterval(_refresh, 15000);
      _connectSSE();
    },
    destroy: function() {
      if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
      if (_sse) { _sse.close(); _sse = null; }
    }
  };

  function _connectSSE() {
    try {
      _sse = new EventSource('/api/snapback/stream');
      _sse.onmessage = function(e) {
        try {
          var sig = JSON.parse(e.data);
          if (sig.ticker === _ticker && sig.snapback_tier) {
            _updateLiveSignal(sig);
          }
        } catch {}
      };
      _sse.onerror = function() {
        if (_sse) _sse.close();
        _sse = null;
        setTimeout(_connectSSE, 10000);
      };
    } catch {}
  }

  async function _refresh() {
    try {
      var [latest, status, history, summary, regime] = await Promise.all([
        api('/api/snapback/latest?ticker=' + _ticker),
        api('/api/snapback/status'),
        api('/api/snapback/history?ticker=' + _ticker + '&limit=50'),
        api('/api/snapback/summary?ticker=' + _ticker),
        api('/api/snapback/regime?ticker=' + _ticker),
      ]);

      if (latest && !latest.error) _updateLiveSignal(latest);
      if (status && !status.error) _updateEngineStatus(status);
      if (history && history.signals) _updateTable(history.signals);
      if (summary && !summary.error) _updateSummary(summary);
      if (regime && !regime.error) _updateRegime(regime);
    } catch {}
  }

  function _updateLiveSignal(sig) {
    var badge = document.getElementById('snap-live-badge');
    var tierEl = document.getElementById('snap-live-tier');
    var confEl = document.getElementById('snap-live-conf');

    if (sig.snapback_tier) {
      badge.className = 'signal-badge ' + (sig.snapback_signal === 'CALL' ? 'call' : 'put');
      badge.textContent = sig.snapback_signal;
      tierEl.textContent = 'Tier ' + sig.snapback_tier;
      tierEl.style.color = sig.snapback_tier === 'A+' ? '#22c55e' : sig.snapback_tier === 'A' ? '#fbbf24' : '#f59e0b';
      confEl.textContent = 'Confidence: ' + Math.round(sig.confidence_score);
    } else {
      badge.className = 'signal-badge none';
      badge.textContent = 'NO SIGNAL';
      tierEl.textContent = '';
      confEl.textContent = sig.spot ? ('Spot: $' + Number(sig.spot).toFixed(2)) : '';
    }

    // Factors
    _setFactor('density', sig.density != null ? sig.density.toFixed(3) : '--', sig.density ? Math.min(sig.density * 100, 100) : 0);
    _setFactor('flip', sig.distance_from_flip != null ? (Math.abs(sig.distance_from_flip) * 100).toFixed(2) + '%' : '--', sig.distance_from_flip ? Math.min(Math.abs(sig.distance_from_flip) * 10000, 100) : 0);
    _setFactor('overshoot', sig.overshoot_pct != null ? (sig.overshoot_pct * 100).toFixed(2) + '%' : '--', sig.overshoot_pct ? Math.min(sig.overshoot_pct * 10000, 100) : 0);
    _setFactor('velocity', sig.velocity != null ? sig.velocity.toFixed(2) : '--', sig.velocity ? Math.min(sig.velocity * 100, 100) : 0);
    _setFactor('spot', sig.spot != null ? '$' + Number(sig.spot).toFixed(2) : '--', 50);
  }

  function _setFactor(name, text, pct) {
    var el = document.getElementById('snap-f-' + name);
    var bar = document.getElementById('snap-fb-' + name);
    if (el) el.textContent = text;
    if (bar) bar.style.width = Math.min(pct, 100) + '%';
  }

  function _updateEngineStatus(status) {
    var runEl = document.getElementById('snap-eng-status');
    runEl.innerHTML = status.running
      ? '<span class="status-dot on"></span>Running'
      : '<span class="status-dot off"></span>Stopped';
    document.getElementById('snap-eng-scans').textContent = status.stats ? status.stats.scansRun : 0;
    document.getElementById('snap-eng-signals').textContent = status.stats ? status.stats.signalsEmitted : 0;
    document.getElementById('snap-eng-bars-qqq').textContent = status.barBufferSizes ? (status.barBufferSizes.QQQ || 0) : 0;
    document.getElementById('snap-eng-bars-spy').textContent = status.barBufferSizes ? (status.barBufferSizes.SPY || 0) : 0;

    var th = status.thresholds || {};
    document.getElementById('snap-eng-p30-qqq').textContent = th.QQQ ? th.QQQ.P30.toFixed(3) : '--';
    document.getElementById('snap-eng-p30-spy').textContent = th.SPY ? th.SPY.P30.toFixed(3) : '--';
    document.getElementById('snap-eng-lastscan').textContent = status.stats && status.stats.lastScanAt
      ? new Date(status.stats.lastScanAt).toLocaleTimeString() : '--';
  }

  function _updateSummary(sum) {
    document.getElementById('snap-aplus-today').textContent = sum.tier_a_plus || 0;
    document.getElementById('snap-a-today').textContent = sum.tier_a || 0;
    document.getElementById('snap-b-today').textContent = sum.tier_b || 0;

    // Highlight active tier card
    ['aplus', 'a', 'b'].forEach(function(t) {
      var card = document.getElementById('snapback-card-' + (t === 'aplus' ? 'aplus' : t));
      if (card) card.classList.remove('active');
    });
  }

  function _updateTable(signals) {
    var tbody = document.getElementById('snapback-signal-tbody');
    var noSig = document.getElementById('snapback-no-signals');
    if (!signals || !signals.length) {
      tbody.innerHTML = '';
      noSig.style.display = 'block';
      return;
    }
    noSig.style.display = 'none';

    var html = '';
    for (var i = 0; i < signals.length; i++) {
      var s = signals[i];
      var tierClass = s.snapback_tier === 'A+' ? 't-aplus' : s.snapback_tier === 'A' ? 't-a' : 't-b';
      var confColor = s.confidence_score >= 70 ? '#22c55e' : s.confidence_score >= 50 ? '#fbbf24' : '#f59e0b';
      var confPct = Math.min(s.confidence_score, 100);
      var ts = new Date(s.timestamp || s.ts);
      html += '<tr>';
      html += '<td>' + ts.toLocaleTimeString() + '</td>';
      html += '<td>' + (s.ticker || _ticker) + '</td>';
      html += '<td><span class="tier-pill ' + tierClass + '">' + s.snapback_tier + '</span></td>';
      html += '<td style="color:' + (s.snapback_signal === 'CALL' ? '#22c55e' : '#ef4444') + ';font-weight:600;">' + s.snapback_signal + '</td>';
      html += '<td>' + (s.overshoot_pct * 100).toFixed(2) + '%</td>';
      html += '<td>' + Number(s.density).toFixed(3) + '</td>';
      html += '<td>' + (Math.abs(s.distance_from_flip) * 100).toFixed(2) + '%</td>';
      html += '<td>' + Number(s.velocity).toFixed(2) + '</td>';
      html += '<td>' + Math.round(s.confidence_score) + '<span class="conf-bar"><span class="conf-bar-fill" style="width:' + confPct + '%;background:' + confColor + ';"></span></span></td>';
      html += '<td>$' + Number(s.spot).toFixed(2) + '</td>';
      html += '</tr>';
    }
    tbody.innerHTML = html;
  }

  // ── Regime Meter ──────────────────────────────────────────────────

  var REGIME_COPY = {
    PREMIUM: {
      subtitle: 'Premium Snapback Conditions',
      desc: 'Elevated volatility with fragile liquidity structure. These conditions produce the cleanest snapback trades. Expect the most signals from SharkSnap.'
    },
    ACTIVE: {
      subtitle: 'Active Conditions',
      desc: 'Normal volatility with moderate structural stability. Overshoots still occur but reversions may be smaller. Signals may appear less frequently.'
    },
    QUIET: {
      subtitle: 'Quiet Structure',
      desc: 'Liquidity is stable and volatility is muted. Overshoots are less common and moves lack follow-through. This does not mean the system is broken.'
    },
    STANDDOWN: {
      subtitle: 'Stand-Down Conditions',
      desc: 'Directional repricing or structural conflict. Overshoots may be real breakouts, not snapback setups. SharkSnap may remain silent until structure stabilizes.'
    }
  };

  var DENSITY_LABELS = { thin: 'HIGH', moderate: 'MODERATE', dense: 'LOW', unknown: '--' };
  var VOL_LABELS = { elevated: 'ELEVATED', normal: 'NORMAL', muted: 'MUTED' };
  var WALL_LABELS = { clear: 'NONE', 'near wall': 'NEAR WALL', unknown: '--' };

  function _scoreClass(score) {
    if (score >= 2) return 'positive';
    if (score >= 1) return 'neutral';
    return 'negative';
  }

  function _updateRegime(r) {
    if (!r || !r.regime) return;

    var loading = document.getElementById('snap-regime-loading');
    var content = document.getElementById('snap-regime-content');
    var meter = document.getElementById('snapback-regime-meter');
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    // Remove old regime classes
    meter.className = 'regime-meter regime-' + r.regime.toLowerCase();

    // Dot + label
    var dot = document.getElementById('snap-regime-dot');
    var label = document.getElementById('snap-regime-label');
    dot.className = 'regime-dot ' + r.color;
    label.className = 'regime-label ' + r.color;
    label.textContent = r.regime;

    // Subtitle + description
    var copy = REGIME_COPY[r.regime] || REGIME_COPY.ACTIVE;
    document.getElementById('snap-regime-subtitle').textContent = copy.subtitle;
    document.getElementById('snap-regime-desc').textContent = copy.desc;

    // Confidence
    document.getElementById('snap-regime-conf').textContent = r.confidence + '%';

    // Factors
    var dEl = document.getElementById('snap-rf-density');
    var dScore = document.getElementById('snap-rf-density-score');
    dEl.textContent = DENSITY_LABELS[r.density.label] || r.density.label;
    dScore.textContent = (r.density.score > 0 ? '+' : '') + r.density.score;
    dScore.className = 'regime-factor-score ' + _scoreClass(r.density.score);

    var vEl = document.getElementById('snap-rf-vol');
    var vScore = document.getElementById('snap-rf-vol-score');
    vEl.textContent = VOL_LABELS[r.volatility.label] || r.volatility.label;
    vScore.textContent = (r.volatility.score > 0 ? '+' : '') + r.volatility.score;
    vScore.className = 'regime-factor-score ' + _scoreClass(r.volatility.score);

    var wEl = document.getElementById('snap-rf-wall');
    var wScore = document.getElementById('snap-rf-wall-score');
    wEl.textContent = WALL_LABELS[r.wall.label] || r.wall.label;
    wScore.textContent = (r.wall.score > 0 ? '+' : '') + r.wall.score;
    wScore.className = 'regime-factor-score ' + _scoreClass(r.wall.score);
  }
})();
`;
}

module.exports = { getSnapbackPageCSS, getSnapbackPageHTML, getSnapbackPageJS };
