/**
 * GEX-LLM Pattern Analysis — Proxy routes to FastAPI backend
 *
 * Serves:
 *   POST /api/gex-llm/analyze          → Proxy to FastAPI backend
 *   GET  /api/gex-llm/analyze/:id/stream → Proxy SSE from FastAPI
 *   GET  /api/gex-llm/patterns          → Proxy pattern library
 */

const config = require('../config');

const GEX_LLM_API = config.gexLlmApiUrl;
const GEX_LLM_API_KEY = config.gexLlmApiKey;

function registerGexLlmRoutes(app) {

  // POST /api/gex-llm/analyze — proxy to FastAPI
  app.post('/api/gex-llm/analyze', async (req, res) => {
    if (req.tier !== 'pro') {
      return res.status(403).json({ error: 'upgrade_required', message: 'GEX Pattern Analysis requires a Pro subscription.' });
    }
    try {
      const resp = await fetch(`${GEX_LLM_API}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(GEX_LLM_API_KEY && { 'Authorization': `Bearer ${GEX_LLM_API_KEY}` }),
        },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) {
        const text = await resp.text();
        return res.status(resp.status).json({ error: text || 'Upstream error' });
      }
      res.json(await resp.json());
    } catch (e) {
      console.error('[GEX-LLM] Proxy POST error:', e.message);
      res.status(502).json({ error: 'GEX-LLM service unavailable' });
    }
  });

  // GET /api/gex-llm/analyze/:id/stream — proxy SSE
  app.get('/api/gex-llm/analyze/:id/stream', async (req, res) => {
    if (req.tier !== 'pro') {
      return res.status(403).json({ error: 'upgrade_required', message: 'GEX Pattern Analysis requires a Pro subscription.' });
    }
    try {
      const url = `${GEX_LLM_API}/analyze/${req.params.id}/stream${req.query.last_event ? `?last_event=${req.query.last_event}` : ''}`;
      const resp = await fetch(url, {
        headers: GEX_LLM_API_KEY ? { 'Authorization': `Bearer ${GEX_LLM_API_KEY}` } : {},
        signal: AbortSignal.timeout(120_000),  // 2 min for streaming analysis
      });
      if (!resp.ok) return res.status(resp.status).json({ error: 'Upstream error' });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let closed = false;
      req.on('close', () => { closed = true; reader.cancel().catch(() => {}); });
      try {
        while (!closed) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!res.writableEnded) res.write(decoder.decode(value, { stream: true }));
        }
      } catch (streamErr) {
        if (!closed) console.error('[GEX-LLM] SSE stream read error:', streamErr.message);
      }
      if (!res.writableEnded) res.end();
    } catch (e) {
      console.error('[GEX-LLM] SSE proxy error:', e.message);
      if (!res.headersSent) res.status(502).json({ error: 'GEX-LLM service unavailable' });
    }
  });

  // GET /api/gex-llm/patterns — proxy pattern library
  app.get('/api/gex-llm/patterns', async (req, res) => {
    if (req.tier !== 'pro') {
      return res.status(403).json({ error: 'upgrade_required', message: 'GEX Pattern Analysis requires a Pro subscription.' });
    }
    try {
      const resp = await fetch(`${GEX_LLM_API}/patterns`, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!resp.ok) return res.status(resp.status).json({ error: 'Upstream error' });
      res.json(await resp.json());
    } catch (e) {
      console.error('[GEX-LLM] Patterns proxy error:', e.message);
      res.status(502).json({ error: 'GEX-LLM service unavailable' });
    }
  });

  console.log('[Dashboard] GEX-LLM Pattern Analysis routes registered');
}

// ── SPA Embedding Exports ─────────────────────────────────────────────

function getGexLlmPageCSS() {
  return `
/* ── GEX-LLM Layout ─────────────────────────────────────── */
#page-gex-llm .gl-layout { display: grid; grid-template-columns: 2fr 3fr; gap: 16px; }
#page-gex-llm .gl-panel { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
#page-gex-llm .gl-panel-header {
  padding: 12px 16px; border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
  color: var(--text-muted); font-weight: 600;
}
#page-gex-llm .gl-panel-body { padding: 12px 16px; overflow-y: auto; max-height: calc(100vh - 200px); }

/* ── Pattern Library ─────────────────────────────────────── */
#page-gex-llm .gl-pattern-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 10px 12px; margin-bottom: 8px; cursor: default; transition: border-color 0.2s;
}
#page-gex-llm .gl-pattern-card:hover { border-color: var(--accent); }
#page-gex-llm .gl-pattern-name {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px;
}
#page-gex-llm .gl-pattern-flow {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); line-height: 1.5;
}
#page-gex-llm .gl-pattern-flow .arrow { color: var(--accent); margin: 0 4px; }
#page-gex-llm .gl-cat-badge {
  display: inline-block; padding: 1px 6px; border-radius: 4px; font-family: var(--font-mono);
  font-size: 9px; font-weight: 700; margin-left: 8px;
  background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--border);
}

/* ── Input Form ──────────────────────────────────────────── */
#page-gex-llm .gl-form { margin-bottom: 16px; }
#page-gex-llm .gl-form-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
#page-gex-llm .gl-form input[type="text"], #page-gex-llm .gl-form input[type="number"] {
  font-family: var(--font-mono); font-size: 12px; background: var(--bg-surface); color: var(--text);
  border: 1px solid var(--border); border-radius: 3px; padding: 6px 10px; outline: none; width: 120px;
}
#page-gex-llm .gl-form input:focus { border-color: var(--accent); }
#page-gex-llm .gl-form textarea {
  font-family: var(--font-mono); font-size: 11px; background: var(--bg-surface); color: var(--text);
  border: 1px solid var(--border); border-radius: 3px; padding: 8px 10px; outline: none;
  width: 100%; min-height: 80px; resize: vertical;
}
#page-gex-llm .gl-form textarea:focus { border-color: var(--accent); }
#page-gex-llm .gl-analyze-btn {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--border);
  border-radius: 3px; padding: 6px 16px; cursor: pointer; outline: none;
  transition: all 0.15s;
}
#page-gex-llm .gl-analyze-btn:hover:not(:disabled) { background: var(--accent-subtle); border-color: var(--accent); }
#page-gex-llm .gl-analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Pipeline Stages ─────────────────────────────────────── */
#page-gex-llm .gl-pipeline { display: flex; align-items: center; justify-content: center; gap: 0; padding: 16px 0; flex-wrap: wrap; }
#page-gex-llm .gl-stage {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 8px 14px; text-align: center; transition: all 0.3s; min-width: 100px;
}
#page-gex-llm .gl-stage-label {
  font-family: var(--font-mono); font-size: 9px; text-transform: uppercase;
  color: var(--text-muted);
}
#page-gex-llm .gl-stage.active { border-color: var(--accent); }
#page-gex-llm .gl-stage.active .gl-stage-label { color: var(--accent); }
#page-gex-llm .gl-stage.completed { border-color: var(--green); }
#page-gex-llm .gl-stage.completed .gl-stage-label { color: var(--green); }
#page-gex-llm .gl-stage.error { border-color: var(--red); }
#page-gex-llm .gl-arrow { color: var(--text-muted); font-family: var(--font-mono); font-size: 14px; padding: 0 6px; }
#page-gex-llm .gl-arrow.lit { color: var(--accent); }

/* ── Results ─────────────────────────────────────────────── */
#page-gex-llm .gl-results { display: none; }
#page-gex-llm .gl-results.visible { display: block; }
#page-gex-llm .gl-result-section {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 12px 14px; margin-bottom: 10px; animation: fadeIn 0.3s ease;
}
#page-gex-llm .gl-result-title {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 8px; font-weight: 600;
}
#page-gex-llm .gl-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; }
#page-gex-llm .gl-stat { text-align: center; }
#page-gex-llm .gl-stat-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
#page-gex-llm .gl-stat-value { font-family: var(--font-mono); font-size: 18px; font-weight: 700; margin-top: 2px; }

/* ── Regime Badge ────────────────────────────────────────── */
#page-gex-llm .gl-regime-badge {
  display: inline-block; padding: 3px 10px; border-radius: 3px; font-family: var(--font-mono);
  font-size: 11px; font-weight: 700;
}
#page-gex-llm .gl-regime-badge.positive { background: rgba(34,197,94,0.12); color: var(--green); border: 1px solid var(--border); }
#page-gex-llm .gl-regime-badge.negative { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid var(--border); }
#page-gex-llm .gl-regime-badge.neutral { background: var(--yellow-dim); color: var(--yellow); border: 1px solid var(--border); }

/* ── Confidence Bar ──────────────────────────────────────── */
#page-gex-llm .gl-conf-bar { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
#page-gex-llm .gl-conf-track { flex: 1; height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden; }
#page-gex-llm .gl-conf-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
#page-gex-llm .gl-conf-fill.high { background: var(--green); }
#page-gex-llm .gl-conf-fill.medium { background: var(--yellow); }
#page-gex-llm .gl-conf-fill.low { background: var(--red); }
#page-gex-llm .gl-conf-pct { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); min-width: 36px; text-align: right; }

/* ── Signal Badge ────────────────────────────────────────── */
#page-gex-llm .gl-signal-badge {
  display: inline-block; font-family: var(--font-mono); font-size: 20px; font-weight: 800;
  padding: 8px 24px; border-radius: 3px;
}
#page-gex-llm .gl-signal-badge.bullish { color: var(--green); background: rgba(34,197,94,0.12); border: 2px solid var(--border); }
#page-gex-llm .gl-signal-badge.bearish { color: var(--red); background: rgba(239,68,68,0.12); border: 2px solid var(--border); }
#page-gex-llm .gl-signal-badge.neutral { color: var(--yellow); background: var(--yellow-dim); border: 2px solid var(--border); }

/* ── Mechanics text ──────────────────────────────────────── */
#page-gex-llm .gl-mechanics-text {
  font-family: var(--font-body); font-size: 12px; color: var(--text-muted); line-height: 1.7;
  white-space: pre-wrap; max-height: 300px; overflow-y: auto;
}

/* ── Patterns detected ───────────────────────────────────── */
#page-gex-llm .gl-detected-pattern {
  display: flex; align-items: center; gap: 10px; padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
#page-gex-llm .gl-detected-pattern:last-child { border-bottom: none; }
#page-gex-llm .gl-dp-name { font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--text); min-width: 160px; }
#page-gex-llm .gl-dp-signal {
  font-family: var(--font-mono); font-size: 10px; padding: 2px 6px; border-radius: 4px;
  font-weight: 600; min-width: 60px; text-align: center;
}
#page-gex-llm .gl-dp-signal.bullish { background: rgba(34,197,94,0.12); color: var(--green); }
#page-gex-llm .gl-dp-signal.bearish { background: rgba(239,68,68,0.12); color: var(--red); }
#page-gex-llm .gl-dp-signal.neutral { background: var(--yellow-dim); color: var(--yellow); }

/* ── Error ───────────────────────────────────────────────── */
#page-gex-llm .gl-error { color: var(--red); font-family: var(--font-mono); font-size: 12px; padding: 12px; background: rgba(239,68,68,0.12); border-radius: 3px; border: 1px solid var(--border); }

/* ── Animations ──────────────────────────────────────────── */
#page-gex-llm .gl-stage.active { }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 900px) {
  #page-gex-llm .gl-layout { grid-template-columns: 1fr; }
  #page-gex-llm .gl-panel-body { max-height: 300px; }
}
`;
}

function getGexLlmPageHTML() {
  return `<div class="page" id="page-gex-llm">
<div class="page-header">
  <div>
    <h2>SharkSense&trade;</h2>
    <div class="subtitle">Powered by gex-llm-patterns</div>
  </div>
</div>

<div class="gl-layout">
  <!-- Pattern Library -->
  <div class="gl-panel">
    <div class="gl-panel-header">Pattern Library <span id="gl-pattern-count" style="color:var(--accent)"></span></div>
    <div class="gl-panel-body" id="gl-patterns">
      <div class="loading"><div class="spinner"></div> Loading patterns...</div>
    </div>
  </div>

  <!-- Analysis Panel -->
  <div class="gl-panel">
    <div class="gl-panel-header">Analysis</div>
    <div class="gl-panel-body" id="gl-analysis">

      <!-- Form -->
      <div class="gl-form">
        <div class="gl-form-row">
          <input type="text" id="gl-ticker" placeholder="TICKER" value="SPY" spellcheck="false" autocomplete="off" style="width:80px;text-transform:uppercase">
          <input type="number" id="gl-spot" placeholder="Spot Price" step="0.01">
          <button class="gl-analyze-btn" id="gl-load-heatmap" style="background:transparent;border-color:var(--border);color:var(--text-muted)">&#8635; LOAD FROM HEATMAP</button>
          <button class="gl-analyze-btn" id="gl-analyze-btn">&#9654; ANALYZE</button>
        </div>
        <textarea id="gl-options-data" placeholder='Options data (JSON array): [{"strike":590,"type":"call","oi":12000,"gamma":0.05}, ...]'></textarea>
      </div>

      <!-- Pipeline -->
      <div class="gl-pipeline" id="gl-pipeline">
        <div class="gl-stage" id="gl-s-started"><div class="gl-stage-label">Started</div></div>
        <div class="gl-arrow">&rarr;</div>
        <div class="gl-stage" id="gl-s-gex"><div class="gl-stage-label">GEX Calc</div></div>
        <div class="gl-arrow">&rarr;</div>
        <div class="gl-stage" id="gl-s-patterns"><div class="gl-stage-label">Patterns</div></div>
        <div class="gl-arrow">&rarr;</div>
        <div class="gl-stage" id="gl-s-mechanics"><div class="gl-stage-label">Mechanics</div></div>
        <div class="gl-arrow">&rarr;</div>
        <div class="gl-stage" id="gl-s-signal"><div class="gl-stage-label">Signal</div></div>
        <div class="gl-arrow">&rarr;</div>
        <div class="gl-stage" id="gl-s-complete"><div class="gl-stage-label">Complete</div></div>
      </div>

      <!-- Results -->
      <div class="gl-results" id="gl-results">
        <div id="gl-gex-summary"></div>
        <div id="gl-detected-patterns"></div>
        <div id="gl-mechanics"></div>
        <div id="gl-trading-signal"></div>
        <div id="gl-error"></div>
      </div>

    </div>
  </div>
</div>
</div>`;
}

function getGexLlmPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.gexLlm = (function() {
  var eventSource = null;
  var STAGES = ['started','gex','patterns','mechanics','signal','complete'];
  var currentStage = -1;

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmt(n) {
    if (n == null) return '—';
    var abs = Math.abs(n);
    if (abs >= 1e9) return (n < 0 ? '-' : '') + '$' + (abs / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (n < 0 ? '-' : '') + '$' + (abs / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (n < 0 ? '-' : '') + '$' + (abs / 1e3).toFixed(1) + 'K';
    return '$' + Number(n).toFixed(2);
  }

  function confClass(pct) {
    if (pct >= 70) return 'high';
    if (pct >= 40) return 'medium';
    return 'low';
  }

  function signalClass(s) {
    if (!s) return 'neutral';
    var l = s.toLowerCase();
    if (l.indexOf('bull') >= 0 || l === 'buy' || l === 'long') return 'bullish';
    if (l.indexOf('bear') >= 0 || l === 'sell' || l === 'short') return 'bearish';
    return 'neutral';
  }

  function regimeClass(r) {
    if (!r) return 'neutral';
    var l = r.toLowerCase();
    if (l.indexOf('positive') >= 0 || l.indexOf('call') >= 0) return 'positive';
    if (l.indexOf('negative') >= 0 || l.indexOf('put') >= 0) return 'negative';
    return 'neutral';
  }

  function resetPipeline() {
    currentStage = -1;
    STAGES.forEach(function(s) {
      var el = document.getElementById('gl-s-' + s);
      if (el) el.className = 'gl-stage';
    });
    document.querySelectorAll('#page-gex-llm .gl-arrow').forEach(function(a) { a.classList.remove('lit'); });
    document.getElementById('gl-results').className = 'gl-results';
    ['gl-gex-summary','gl-detected-patterns','gl-mechanics','gl-trading-signal','gl-error'].forEach(function(id) {
      document.getElementById(id).innerHTML = '';
    });
  }

  function advanceStage(name) {
    var idx = STAGES.indexOf(name);
    if (idx < 0) return;
    // Complete previous stages
    for (var i = 0; i <= idx; i++) {
      var el = document.getElementById('gl-s-' + STAGES[i]);
      if (el) {
        el.classList.remove('active');
        if (i < idx) el.classList.add('completed');
        else el.classList.add('active');
      }
    }
    // Light arrows
    var arrows = document.querySelectorAll('#page-gex-llm .gl-arrow');
    for (var j = 0; j < idx && j < arrows.length; j++) {
      arrows[j].classList.add('lit');
    }
    document.getElementById('gl-results').className = 'gl-results visible';
    currentStage = idx;
  }

  function loadPatterns() {
    var hdrs = {}; if (window.DASHBOARD_API_KEY) hdrs['x-api-key'] = window.DASHBOARD_API_KEY;
    fetch('/api/gex-llm/patterns', { credentials: 'include', headers: hdrs }).then(function(r) { return r.json(); }).then(function(data) {
      var patterns = data.patterns || [];
      var el = document.getElementById('gl-patterns');
      if (!patterns.length) { el.innerHTML = '<div class="empty">No patterns loaded</div>'; return; }
      document.getElementById('gl-pattern-count').textContent = '(' + patterns.length + ')';
      var html = '';
      for (var i = 0; i < patterns.length; i++) {
        var p = patterns[i];
        html += '<div class="gl-pattern-card">' +
          '<div class="gl-pattern-name">' + esc(p.name) +
          (p.category ? '<span class="gl-cat-badge">' + esc(p.category) + '</span>' : '') +
          '</div>' +
          '<div class="gl-pattern-flow">' +
          '<span style="color:var(--accent)">' + esc(p.who || '') + '</span>' +
          '<span class="arrow">&rarr;</span>' +
          '<span style="color:var(--text)">' + esc(p.whom || '') + '</span>' +
          '<span class="arrow">&rarr;</span>' +
          '<span style="color:var(--green)">' + esc(p.what || '') + '</span>' +
          '</div></div>';
      }
      el.innerHTML = html;
    }).catch(function(e) {
      document.getElementById('gl-patterns').innerHTML = '<div class="gl-error">' + esc(e.message) + '</div>';
    });
  }

  function analyze() {
    var ticker = document.getElementById('gl-ticker').value.trim().toUpperCase();
    var spot = parseFloat(document.getElementById('gl-spot').value);
    var optRaw = document.getElementById('gl-options-data').value.trim();
    if (!ticker) return;

    // spot_price and options are required by the backend
    if (isNaN(spot) || spot <= 0) {
      document.getElementById('gl-error').innerHTML = '<div class="gl-error">Spot price is required. Enter the current price for ' + esc(ticker) + '.</div>';
      document.getElementById('gl-results').className = 'gl-results visible';
      document.getElementById('gl-spot').focus();
      return;
    }
    var options;
    if (!optRaw) {
      document.getElementById('gl-error').innerHTML = '<div class="gl-error">Options data is required. Paste a JSON array of options: [{&quot;strike&quot;:590,&quot;type&quot;:&quot;call&quot;,&quot;oi&quot;:12000,&quot;gamma&quot;:0.05}, ...]</div>';
      document.getElementById('gl-results').className = 'gl-results visible';
      document.getElementById('gl-options-data').focus();
      return;
    }
    try { options = JSON.parse(optRaw); } catch(e) {
      document.getElementById('gl-error').innerHTML = '<div class="gl-error">Invalid JSON in options data: ' + esc(e.message) + '</div>';
      document.getElementById('gl-results').className = 'gl-results visible';
      return;
    }

    var body = { ticker: ticker, spot_price: spot, options: options };

    resetPipeline();
    var btn = document.getElementById('gl-analyze-btn');
    btn.disabled = true;
    btn.textContent = 'ANALYZING...';

    var aHdrs = { 'Content-Type': 'application/json' };
    if (window.DASHBOARD_API_KEY) aHdrs['x-api-key'] = window.DASHBOARD_API_KEY;
    fetch('/api/gex-llm/analyze', {
      method: 'POST',
      credentials: 'include',
      headers: aHdrs,
      body: JSON.stringify(body)
    }).then(function(r) {
      if (!r.ok) throw new Error('Failed to start analysis');
      return r.json();
    }).then(function(data) {
      var id = data.id;
      var lastEventId = 0;
      var reconnects = 0;

      function connectSSE() {
        var url = '/api/gex-llm/analyze/' + id + '/stream?last_event=' + lastEventId;
        eventSource = new EventSource(url);
        eventSource.onmessage = function(e) {
          reconnects = 0;
          if (e.lastEventId) lastEventId = parseInt(e.lastEventId) || lastEventId;
          try { handleEvent(JSON.parse(e.data)); } catch(err) { console.error('[GEX-LLM] SSE parse:', err); }
        };
        eventSource.onerror = function() {
          if (!eventSource) return;
          eventSource.close();
          if (reconnects < 10) {
            reconnects++;
            setTimeout(connectSSE, 2000);
          } else { done(); }
        };
      }
      connectSSE();
    }).catch(function(e) {
      document.getElementById('gl-error').innerHTML = '<div class="gl-error">' + esc(e.message) + '</div>';
      document.getElementById('gl-results').className = 'gl-results visible';
      done();
    });
  }

  function done() {
    if (eventSource) { eventSource.close(); eventSource = null; }
    var btn = document.getElementById('gl-analyze-btn');
    btn.disabled = false;
    btn.textContent = '\\u25b6 ANALYZE';
  }

  function handleEvent(d) {
    var type = d.type || d.event;
    if (!type) return;

    switch (type) {
      case 'started':
        advanceStage('started');
        break;

      case 'gex_calculated':
        advanceStage('gex');
        renderGexSummary(d);
        break;

      case 'patterns_detected':
        advanceStage('patterns');
        renderPatterns(d);
        break;

      case 'mechanics_analysis':
        advanceStage('mechanics');
        renderMechanics(d);
        break;

      case 'trading_signal':
        advanceStage('signal');
        renderSignal(d);
        break;

      case 'complete':
        advanceStage('complete');
        // Mark complete stage as completed not active
        var cel = document.getElementById('gl-s-complete');
        if (cel) { cel.classList.remove('active'); cel.classList.add('completed'); }
        // Light last arrow
        var arrows = document.querySelectorAll('#page-gex-llm .gl-arrow');
        if (arrows.length) arrows[arrows.length - 1].classList.add('lit');
        done();
        break;

      case 'error':
        var errStage = d.stage || '';
        document.getElementById('gl-error').innerHTML = '<div class="gl-error">Error' +
          (errStage ? ' at ' + esc(errStage) : '') + ': ' + esc(d.error || 'Unknown error') + '</div>';
        // Mark current stage as error
        if (currentStage >= 0) {
          var eEl = document.getElementById('gl-s-' + STAGES[currentStage]);
          if (eEl) { eEl.classList.remove('active'); eEl.classList.add('error'); }
        }
        done();
        break;
    }
  }

  function renderGexSummary(d) {
    var regime = d.regime || 'unknown';
    var html = '<div class="gl-result-section">' +
      '<div class="gl-result-title">GEX Summary</div>' +
      '<div class="gl-stats-grid">' +
      '<div class="gl-stat"><div class="gl-stat-label">Net GEX</div><div class="gl-stat-value" style="color:' + (d.net_gex >= 0 ? 'var(--green)' : 'var(--red)') + '">' + fmt(d.net_gex) + '</div></div>' +
      '<div class="gl-stat"><div class="gl-stat-label">Call GEX</div><div class="gl-stat-value" style="color:var(--green)">' + fmt(d.call_gex) + '</div></div>' +
      '<div class="gl-stat"><div class="gl-stat-label">Put GEX</div><div class="gl-stat-value" style="color:var(--red)">' + fmt(d.put_gex) + '</div></div>' +
      '<div class="gl-stat"><div class="gl-stat-label">Flip Point</div><div class="gl-stat-value" style="color:var(--accent)">' + (d.flip_point ? '$' + Number(d.flip_point).toFixed(1) : '—') + '</div></div>' +
      '</div>' +
      '<div style="margin-top:10px"><span class="gl-regime-badge ' + regimeClass(regime) + '">' + esc(regime.toUpperCase()) + '</span></div>' +
      (d.regime_description ? '<div style="font-family:var(--font-body);font-size:11px;color:var(--text-muted);margin-top:6px">' + esc(d.regime_description) + '</div>' : '') +
      (d.market_impact ? '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-top:4px">' + esc(d.market_impact) + '</div>' : '') +
      '</div>';
    document.getElementById('gl-gex-summary').innerHTML = html;
  }

  function renderPatterns(d) {
    var patterns = d.patterns || [];
    if (!patterns.length) return;
    var html = '<div class="gl-result-section"><div class="gl-result-title">Detected Patterns (' + patterns.length + ')</div>';
    for (var i = 0; i < patterns.length; i++) {
      var p = patterns[i];
      var conf = Math.round(p.confidence || 0);
      var sig = p.signal || 'neutral';
      html += '<div class="gl-detected-pattern">' +
        '<div class="gl-dp-name">' + esc(p.pattern || p.name) + '</div>' +
        '<div class="gl-dp-signal ' + signalClass(sig) + '">' + esc(sig.toUpperCase()) + '</div>' +
        '<div style="flex:1">' +
        '<div class="gl-conf-bar">' +
        '<div class="gl-conf-track"><div class="gl-conf-fill ' + confClass(conf) + '" style="width:' + conf + '%"></div></div>' +
        '<div class="gl-conf-pct">' + conf + '%</div>' +
        '</div></div></div>';
    }
    html += '</div>';
    document.getElementById('gl-detected-patterns').innerHTML = html;
  }

  function renderMechanics(d) {
    var text = d.analysis || '';
    if (!text) return;
    var html = '<div class="gl-result-section">' +
      '<div class="gl-result-title">Mechanics Analysis' + (d.model ? ' <span style="color:var(--text-muted);font-size:8px;font-weight:400">' + esc(d.model) + '</span>' : '') + '</div>' +
      '<div class="gl-mechanics-text">' + esc(text) + '</div></div>';
    document.getElementById('gl-mechanics').innerHTML = html;
  }

  function renderSignal(d) {
    var dir = d.direction || d.action || 'neutral';
    var conf = Math.round(d.confidence || 0);
    var html = '<div class="gl-result-section" style="text-align:center">' +
      '<div class="gl-result-title">Trading Signal</div>' +
      '<div class="gl-signal-badge ' + signalClass(dir) + '">' + esc(dir.toUpperCase()) + '</div>' +
      '<div style="max-width:300px;margin:12px auto 0">' +
      '<div class="gl-conf-bar">' +
      '<div class="gl-conf-track"><div class="gl-conf-fill ' + confClass(conf) + '" style="width:' + conf + '%"></div></div>' +
      '<div class="gl-conf-pct">' + conf + '%</div>' +
      '</div></div>';
    if (d.rationale) {
      html += '<div style="text-align:left;margin-top:10px;font-family:var(--font-body);font-size:12px;color:var(--text-muted);line-height:1.6">' + esc(d.rationale) + '</div>';
    }
    if (d.key_levels) {
      html += '<div style="margin-top:8px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">Key levels: ' + esc(JSON.stringify(d.key_levels)) + '</div>';
    }
    if (d.risk) {
      html += '<div style="margin-top:4px;font-family:var(--font-mono);font-size:11px;color:var(--yellow)">Risk: ' + esc(d.risk) + '</div>';
    }
    html += '</div>';
    document.getElementById('gl-trading-signal').innerHTML = html;
  }

  function loadFromHeatmap() {
    var ticker = document.getElementById('gl-ticker').value.trim().toUpperCase() || 'SPY';
    var btn = document.getElementById('gl-load-heatmap');
    btn.disabled = true;
    btn.textContent = 'LOADING...';
    var lHdrs = {}; if (window.DASHBOARD_API_KEY) lHdrs['x-api-key'] = window.DASHBOARD_API_KEY;
    fetch('/api/gex/heatmap/' + encodeURIComponent(ticker), { credentials: 'include', headers: lHdrs })
      .then(function(r) { if (!r.ok) throw new Error('Heatmap not available for ' + ticker); return r.json(); })
      .then(function(d) {
        if (d.spotPrice) document.getElementById('gl-spot').value = d.spotPrice;
        // Build options array from profile data with real gamma
        // GEX = OI * gamma * 100, so gamma = GEX / (OI * 100)
        var opts = [];
        var profile = d.profile || [];
        for (var i = 0; i < profile.length; i++) {
          var p = profile[i];
          if (p.call && p.call > 0 && p.callOI > 0) {
            var callGamma = p.call / (p.callOI * 100);
            opts.push({ strike: p.strike, type: 'call', oi: p.callOI, gamma: parseFloat(callGamma.toFixed(6)) });
          }
          if (p.put && p.put < 0 && p.putOI > 0) {
            var putGamma = Math.abs(p.put) / (p.putOI * 100);
            opts.push({ strike: p.strike, type: 'put', oi: p.putOI, gamma: parseFloat(putGamma.toFixed(6)) });
          }
        }
        if (!opts.length) {
          // Fallback: use net GEX per strike with estimated gamma
          for (var j = 0; j < profile.length; j++) {
            var s = profile[j];
            var t = s.net >= 0 ? 'call' : 'put';
            var estOI = Math.max(1, Math.round(Math.abs(s.net) / 100));
            var estGamma = Math.abs(s.net) / (estOI * 100);
            opts.push({ strike: s.strike, type: t, oi: estOI, gamma: parseFloat(estGamma.toFixed(6)) });
          }
        }
        document.getElementById('gl-options-data').value = JSON.stringify(opts, null, 2);
        document.getElementById('gl-ticker').value = ticker;
        document.getElementById('gl-error').innerHTML = '';
      })
      .catch(function(e) {
        document.getElementById('gl-error').innerHTML = '<div class="gl-error">' + esc(e.message) + '</div>';
        document.getElementById('gl-results').className = 'gl-results visible';
      })
      .finally(function() { btn.disabled = false; btn.textContent = '\\u21bb LOAD FROM HEATMAP'; });
  }

  function init() {
    resetPipeline();
    loadPatterns();
    document.getElementById('gl-ticker').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') analyze();
    });
    document.getElementById('gl-analyze-btn').addEventListener('click', analyze);
    document.getElementById('gl-load-heatmap').addEventListener('click', loadFromHeatmap);
  }

  function destroy() {
    if (eventSource) { eventSource.close(); eventSource = null; }
    currentStage = -1;
  }

  return { init: init, destroy: destroy };
})();
SQ['gex-llm'] = SQ.gexLlm;
`;
}

module.exports = { registerGexLlmRoutes, getGexLlmPageCSS, getGexLlmPageHTML, getGexLlmPageJS };
