/**
 * AI Agent Analysis — TradingAgents Pipeline Dashboard
 *
 * Serves:
 *   POST /api/agents/analyze          → Proxy to FastAPI backend
 *   GET  /api/agents/analyze/:id/stream → Proxy SSE from FastAPI
 *
 * Architecture:
 *   - registerAgentsRoutes(app) registers API proxy routes
 *   - SPA exports: getAgentsPageCSS, getAgentsPageHTML, getAgentsPageJS
 *   - Terminal Noir design system with cyan accent
 *   - Vanilla JS, zero frameworks, native fetch + EventSource for SSE
 */

const AGENTS_API = process.env.AGENTS_API_URL || 'http://localhost:8000';
const AGENTS_API_KEY = process.env.AGENTS_API_KEY || '';

// ── Route Registration ─────────────────────────────────────────────────

function registerAgentsRoutes(app) {

  // POST /api/agents/analyze — proxy to FastAPI
  app.post('/api/agents/analyze', async (req, res) => {
    if (req.tier !== 'pro') {
      return res.status(403).json({ error: 'upgrade_required', message: 'AI Agents requires a Pro subscription.' });
    }
    try {
      const resp = await fetch(`${AGENTS_API}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(AGENTS_API_KEY && { 'Authorization': `Bearer ${AGENTS_API_KEY}` }),
        },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(60_000),
      });
      if (!resp.ok) {
        const text = await resp.text();
        return res.status(resp.status).json({ error: text || 'Upstream error' });
      }
      const data = await resp.json();
      res.json(data);
    } catch (e) {
      console.error('[Agents] Proxy POST error:', e.message);
      res.status(502).json({ error: 'Agent service unavailable' });
    }
  });

  // GET /api/agents/analyze/:id/stream — proxy SSE from FastAPI
  app.get('/api/agents/analyze/:id/stream', async (req, res) => {
    if (req.tier !== 'pro') {
      return res.status(403).json({ error: 'upgrade_required', message: 'AI Agents requires a Pro subscription.' });
    }
    try {
      const resp = await fetch(`${AGENTS_API}/analyze/${req.params.id}/stream${req.query.last_event ? `?last_event=${req.query.last_event}` : ''}`, {
        headers: AGENTS_API_KEY ? { 'Authorization': `Bearer ${AGENTS_API_KEY}` } : {},
        signal: AbortSignal.timeout(300_000),  // 5 min for full agent analysis
      });
      if (!resp.ok) {
        return res.status(resp.status).json({ error: 'Upstream error' });
      }
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
        if (!closed) console.error('[Agents] SSE stream read error:', streamErr.message);
      }
      if (!res.writableEnded) res.end();
    } catch (e) {
      console.error('[Agents] SSE proxy error:', e.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Agent service unavailable' });
      }
    }
  });

  console.log('[Dashboard] AI Agents API routes registered');
}

// ── SPA Embedding Exports ─────────────────────────────────────────────

function getAgentsPageCSS() {
  return `
/* ── Pipeline ──────────────────────────────────────────────── */
#page-agents .pipeline { display: flex; align-items: center; justify-content: center; gap: 0; padding: 24px 20px; }
#page-agents .stage {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 12px 16px; min-width: 120px; text-align: center; transition: all 0.3s;
  position: relative;
}
#page-agents .stage.active { border-color: var(--accent); }
#page-agents .stage.completed { border-color: var(--green); }
#page-agents .stage-title {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 8px;
}
#page-agents .agent-dots { display: flex; gap: 6px; justify-content: center; }
#page-agents .dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted);
  transition: all 0.3s;
}
#page-agents .dot.active { background: var(--accent); animation: pulse 1.5s infinite; }
#page-agents .dot.done { background: var(--green); }
#page-agents .arrow { color: var(--text-muted); font-family: var(--font-mono); font-size: 16px; padding: 0 8px; }
#page-agents .arrow.lit { color: var(--accent); }

/* ── Reports Grid ──────────────────────────────────────────── */
#page-agents .reports-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  padding: 0 20px 20px; max-width: 1400px; margin: 0 auto;
}
#page-agents .report-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  overflow: hidden; animation: fadeIn 0.3s ease;
}
#page-agents .report-card .card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; cursor: pointer; user-select: none;
}
#page-agents .report-card .card-header:hover { background: var(--bg-surface); }
#page-agents .report-card .agent-name {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--text);
}
#page-agents .report-card .chevron {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  transition: transform 0.2s;
}
#page-agents .report-card.expanded .chevron { transform: rotate(180deg); }
#page-agents .report-card .card-body {
  padding: 0 14px 14px; font-family: var(--font-body); font-size: 12px;
  color: var(--text-muted); line-height: 1.6; max-height: 0; overflow: hidden;
  transition: max-height 0.3s ease;
}
#page-agents .report-card.expanded .card-body { max-height: 400px; overflow-y: auto; }
#page-agents .report-card.full-width { grid-column: 1 / -1; }

/* ── Decision Card ─────────────────────────────────────────── */
#page-agents .decision-card {
  margin: 0 20px 20px; padding: 24px; background: var(--bg-surface); border-radius: 4px;
  text-align: center; border: 1px solid var(--border); animation: fadeIn 0.5s ease;
  display: none; max-width: 1400px; margin-left: auto; margin-right: auto;
}
#page-agents .signal-badge {
  display: inline-block; font-family: var(--font-body); font-size: 36px;
  font-weight: 800; padding: 12px 40px; border-radius: 3px;
}
#page-agents .signal-badge.buy {
  color: var(--green); background: rgba(34,197,94,0.12);
  border: 2px solid var(--border);
}
#page-agents .signal-badge.sell {
  color: var(--red); background: rgba(239,68,68,0.12);
  border: 2px solid var(--border);
}
#page-agents .signal-badge.hold {
  color: var(--yellow); background: var(--yellow-dim);
  border: 2px solid var(--border);
}

/* ── Stats Bar ─────────────────────────────────────────────── */
#page-agents .stats-bar {
  background: var(--bg-surface); border-top: 1px solid var(--border);
  padding: 8px 20px; font-family: var(--font-mono); font-size: 11px;
  color: var(--text-muted); text-align: center;
}

/* ── Page Header Controls ──────────────────────────────────── */
#page-agents .topbar-controls { display: flex; align-items: center; gap: 8px; }
#page-agents .topbar-controls input[type="text"] {
  font-family: var(--font-mono); font-size: 13px; font-weight: 600;
  background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
  border-radius: 3px; padding: 6px 10px; width: 100px; outline: none;
  text-transform: uppercase;
}
#page-agents .topbar-controls input[type="text"]:focus { border-color: var(--accent); }
#page-agents .topbar-controls input[type="date"] {
  font-family: var(--font-mono); font-size: 12px;
  background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
  border-radius: 3px; padding: 6px 10px; outline: none;
  color-scheme: dark;
}
#page-agents .topbar-controls input[type="date"]:focus { border-color: var(--accent); }
#page-agents .analyze-btn {
  font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--border);
  border-radius: 3px; padding: 6px 16px; cursor: pointer; outline: none;
  transition: all 0.15s;
}
#page-agents .analyze-btn:hover:not(:disabled) { background: var(--accent-subtle); border-color: var(--accent); }
#page-agents .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Animations ────────────────────────────────────────────── */
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 768px) {
  #page-agents .pipeline { flex-wrap: wrap; gap: 8px; }
  #page-agents .reports-grid { grid-template-columns: 1fr; }
}
`;
}

function getAgentsPageHTML() {
  return `<div class="page" id="page-agents">
<div class="page-header">
  <div>
    <h2>SharkMind&trade;</h2>
    <div class="subtitle">Multi-agent trading analysis pipeline</div>
  </div>
  <div class="topbar-controls">
    <input type="text" id="ticker" placeholder="TICKER" spellcheck="false" autocomplete="off">
    <input type="date" id="date-input">
    <button class="analyze-btn" id="analyze-btn">&#9654; ANALYZE</button>
  </div>
</div>

<!-- ── Pipeline Visualization ─────────────────────────────── -->
<div class="pipeline">
  <div class="stage" id="stage-analysts">
    <div class="stage-title">Analysts</div>
    <div class="agent-dots">
      <div class="dot" id="dot-market-analyst" title="Market Analyst"></div>
      <div class="dot" id="dot-social-analyst" title="Social Analyst"></div>
      <div class="dot" id="dot-news-analyst" title="News Analyst"></div>
      <div class="dot" id="dot-fundamentals-analyst" title="Fundamentals Analyst"></div>
    </div>
  </div>
  <div class="arrow" id="arrow-0">&rarr;</div>
  <div class="stage" id="stage-research">
    <div class="stage-title">Research</div>
    <div class="agent-dots">
      <div class="dot" id="dot-bull-researcher" title="Bull Researcher"></div>
      <div class="dot" id="dot-bear-researcher" title="Bear Researcher"></div>
      <div class="dot" id="dot-research-manager" title="Research Manager"></div>
    </div>
  </div>
  <div class="arrow" id="arrow-1">&rarr;</div>
  <div class="stage" id="stage-trading">
    <div class="stage-title">Trading</div>
    <div class="agent-dots">
      <div class="dot" id="dot-trader" title="Trader"></div>
    </div>
  </div>
  <div class="arrow" id="arrow-2">&rarr;</div>
  <div class="stage" id="stage-risk">
    <div class="stage-title">Risk</div>
    <div class="agent-dots">
      <div class="dot" id="dot-aggressive-analyst" title="Aggressive Analyst"></div>
      <div class="dot" id="dot-conservative-analyst" title="Conservative Analyst"></div>
      <div class="dot" id="dot-neutral-analyst" title="Neutral Analyst"></div>
    </div>
  </div>
  <div class="arrow" id="arrow-3">&rarr;</div>
  <div class="stage" id="stage-decision">
    <div class="stage-title">Decision</div>
    <div class="agent-dots">
      <div class="dot" id="dot-portfolio-manager" title="Portfolio Manager"></div>
    </div>
  </div>
</div>

<!-- ── Reports Grid ───────────────────────────────────────── -->
<div class="reports-grid" id="reports-grid"></div>

<!-- ── Decision Card ──────────────────────────────────────── -->
<div class="decision-card" id="decision"></div>

<!-- ── Stats Bar ──────────────────────────────────────────── -->
<div class="stats-bar">
  <span id="stats-text">Ready</span>
</div>
</div>`;
}

function getAgentsPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.agents = (function() {
  var AGENTS = {
    analysts: ['Market Analyst','Social Analyst','News Analyst','Fundamentals Analyst'],
    research: ['Bull Researcher','Bear Researcher','Research Manager'],
    trading: ['Trader'],
    risk: ['Aggressive Analyst','Conservative Analyst','Neutral Analyst'],
    decision: ['Portfolio Manager']
  };
  var STAGE_ORDER = ['analysts','research','trading','risk','decision'];
  var eventSource = null;
  var startTime = null;
  var timerInterval = null;
  var agentStatuses = {};
  var lastStats = null;

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function resetUI() {
    document.querySelectorAll('#page-agents .dot').forEach(function(d) { d.className = 'dot'; });
    document.querySelectorAll('#page-agents .stage').forEach(function(s) { s.classList.remove('active','completed'); });
    document.querySelectorAll('#page-agents .arrow').forEach(function(a) { a.classList.remove('lit'); });
    document.getElementById('reports-grid').innerHTML = '';
    document.getElementById('decision').style.display = 'none';
    document.getElementById('stats-text').textContent = 'Ready';
    agentStatuses = {};
    lastStats = null;
  }

  function analyze() {
    var ticker = document.getElementById('ticker').value.trim().toUpperCase();
    var dateVal = document.getElementById('date-input').value || new Date().toISOString().slice(0,10);
    if (!ticker) return;

    resetUI();
    var btn = document.getElementById('analyze-btn');
    btn.disabled = true;
    btn.textContent = 'ANALYZING...';
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    fetch('/api/agents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: ticker, date: dateVal })
    }).then(function(resp) {
      if (!resp.ok) throw new Error('Failed to start analysis');
      return resp.json();
    }).then(function(data) {
      var id = data.id;
      var lastEventId = 0;
      var reconnectAttempts = 0;
      var maxReconnects = 10;

      function connectSSE() {
        var url = '/api/agents/analyze/' + id + '/stream?last_event=' + lastEventId;
        eventSource = new EventSource(url);
        eventSource.onmessage = function(e) {
          reconnectAttempts = 0;
          if (e.lastEventId) lastEventId = parseInt(e.lastEventId) || lastEventId;
          try { handleEvent(JSON.parse(e.data)); } catch(err) { console.error('SSE parse error:', err); }
        };
        eventSource.onerror = function() {
          if (!eventSource) return;
          eventSource.close();
          if (reconnectAttempts < maxReconnects) {
            reconnectAttempts++;
            console.log('[Agents] SSE dropped, reconnecting (' + reconnectAttempts + '/' + maxReconnects + ')...');
            setTimeout(connectSSE, 2000);
          } else {
            btn.disabled = false;
            btn.textContent = '\\u25b6 ANALYZE';
            clearInterval(timerInterval);
          }
        };
      }
      connectSSE();
    }).catch(function(e) {
      console.error('Analysis start error:', e);
      btn.disabled = false;
      btn.textContent = '\\u25b6 ANALYZE';
      clearInterval(timerInterval);
      showError(e.message || 'Failed to connect to agent service');
    });
  }

  function analysisComplete() {
    if (eventSource) { eventSource.close(); eventSource = null; }
    var btn = document.getElementById('analyze-btn');
    btn.disabled = false;
    btn.textContent = '\\u25b6 ANALYZE';
    clearInterval(timerInterval);
  }

  function handleEvent(data) {
    switch (data.type) {
      case 'agent_update': updateAgent(data); break;
      case 'report': addReport(data); break;
      case 'debate': addDebate(data); break;
      case 'trader': addTrader(data); break;
      case 'risk': addRisk(data); break;
      case 'decision': showDecision(data); analysisComplete(); break;
      case 'error': showError(data.message); analysisComplete(); break;
    }
    if (data.stats) updateStats(data.stats);
  }

  function updateAgent(data) {
    agentStatuses[data.agent] = data.status;
    var dotId = data.agent.toLowerCase().replace(/\\s+/g, '-');
    var dot = document.getElementById('dot-' + dotId);
    if (dot) {
      dot.className = 'dot';
      if (data.status === 'in_progress') dot.classList.add('active');
      if (data.status === 'completed') dot.classList.add('done');
    }
    updateStages();
  }

  function updateStages() {
    for (var i = 0; i < STAGE_ORDER.length; i++) {
      var stage = STAGE_ORDER[i];
      var agents = AGENTS[stage];
      var el = document.getElementById('stage-' + stage);
      if (!el) continue;
      var allDone = true, anyActive = false;
      for (var j = 0; j < agents.length; j++) {
        var s = agentStatuses[agents[j]] || 'pending';
        if (s !== 'completed') allDone = false;
        if (s === 'in_progress') anyActive = true;
      }
      el.classList.remove('active', 'completed');
      if (allDone) el.classList.add('completed');
      else if (anyActive) el.classList.add('active');
    }
    for (var k = 0; k < STAGE_ORDER.length - 1; k++) {
      var arrow = document.getElementById('arrow-' + k);
      var stageEl = document.getElementById('stage-' + STAGE_ORDER[k]);
      if (arrow && stageEl && stageEl.classList.contains('completed')) {
        arrow.classList.add('lit');
      }
    }
  }

  function addReport(data) {
    var grid = document.getElementById('reports-grid');
    var card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = '<div class="card-header" onclick="this.parentElement.classList.toggle(\\'expanded\\')">' +
      '<span class="agent-name">\\u2705 ' + escapeHtml(data.agent) + '</span>' +
      '<span class="chevron">\\u25bc</span></div>' +
      '<div class="card-body"><pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:12px;color:var(--text-muted)">' +
      escapeHtml((data.report || '').slice(0, 4000)) + '</pre></div>';
    grid.appendChild(card);
  }

  function addDebate(data) {
    var grid = document.getElementById('reports-grid');
    var card = document.createElement('div');
    card.className = 'report-card full-width';
    card.innerHTML = '<div class="card-header" onclick="this.parentElement.classList.toggle(\\'expanded\\')">' +
      '<span class="agent-name">\\u2705 Research Debate</span>' +
      '<span class="chevron">\\u25bc</span></div>' +
      '<div class="card-body">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      '<div style="border-left:3px solid var(--green);padding-left:12px">' +
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--green);margin-bottom:8px">BULL CASE</div>' +
      '<pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:12px;color:var(--text-muted)">' + escapeHtml((data.bull || '').slice(0, 3000)) + '</pre></div>' +
      '<div style="border-left:3px solid var(--red);padding-left:12px">' +
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--red);margin-bottom:8px">BEAR CASE</div>' +
      '<pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:12px;color:var(--text-muted)">' + escapeHtml((data.bear || '').slice(0, 3000)) + '</pre></div></div>' +
      '<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">' +
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--accent);margin-bottom:8px">RESEARCH MANAGER DECISION</div>' +
      '<pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:12px;color:var(--text-muted)">' + escapeHtml((data.judge || '').slice(0, 3000)) + '</pre></div></div>';
    grid.appendChild(card);
  }

  function addTrader(data) {
    var grid = document.getElementById('reports-grid');
    var card = document.createElement('div');
    card.className = 'report-card full-width';
    card.innerHTML = '<div class="card-header" onclick="this.parentElement.classList.toggle(\\'expanded\\')">' +
      '<span class="agent-name">\\u2705 Trader Plan</span>' +
      '<span class="chevron">\\u25bc</span></div>' +
      '<div class="card-body"><pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:12px;color:var(--text-muted)">' +
      escapeHtml((data.plan || '').slice(0, 4000)) + '</pre></div>';
    grid.appendChild(card);
  }

  function addRisk(data) {
    var grid = document.getElementById('reports-grid');
    var card = document.createElement('div');
    card.className = 'report-card full-width';
    var inner = '<div class="card-header" onclick="this.parentElement.classList.toggle(\\'expanded\\')">' +
      '<span class="agent-name">\\u2705 Risk Assessment</span>' +
      '<span class="chevron">\\u25bc</span></div>' +
      '<div class="card-body"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
    if (data.aggressive) {
      inner += '<div style="border-left:3px solid var(--green);padding-left:12px">' +
        '<div style="font-family:var(--font-mono);font-size:11px;color:var(--green);margin-bottom:8px">AGGRESSIVE</div>' +
        '<pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:11px;color:var(--text-muted)">' + escapeHtml(data.aggressive.slice(0, 2000)) + '</pre></div>';
    }
    if (data.conservative) {
      inner += '<div style="border-left:3px solid var(--red);padding-left:12px">' +
        '<div style="font-family:var(--font-mono);font-size:11px;color:var(--red);margin-bottom:8px">CONSERVATIVE</div>' +
        '<pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:11px;color:var(--text-muted)">' + escapeHtml(data.conservative.slice(0, 2000)) + '</pre></div>';
    }
    if (data.neutral) {
      inner += '<div style="border-left:3px solid var(--yellow);padding-left:12px">' +
        '<div style="font-family:var(--font-mono);font-size:11px;color:var(--yellow);margin-bottom:8px">NEUTRAL</div>' +
        '<pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:11px;color:var(--text-muted)">' + escapeHtml(data.neutral.slice(0, 2000)) + '</pre></div>';
    }
    inner += '</div>' +
      '<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">' +
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--accent);margin-bottom:8px">PORTFOLIO MANAGER DECISION</div>' +
      '<pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:12px;color:var(--text-muted)">' + escapeHtml((data.judge || '').slice(0, 3000)) + '</pre></div></div>';
    card.innerHTML = inner;
    grid.appendChild(card);
  }

  function showDecision(data) {
    var el = document.getElementById('decision');
    el.style.display = 'block';
    el.style.margin = '0 20px 20px';
    el.style.maxWidth = '1400px';
    el.style.marginLeft = 'auto';
    el.style.marginRight = 'auto';
    var sig = (data.signal || 'HOLD').toUpperCase();
    var cls = sig === 'BUY' ? 'buy' : sig === 'SELL' ? 'sell' : 'hold';
    el.innerHTML = '<div class="signal-badge ' + cls + '">' + escapeHtml(sig) + '</div>' +
      '<div style="margin-top:16px;text-align:left">' +
      '<div style="cursor:pointer;padding:10px 0" onclick="var b=document.getElementById(\\'decision-body\\');b.style.display=b.style.display===\\'none\\'?\\'block\\':\\'none\\'">' +
      '<span style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted)">\\u25bc Full Analysis</span></div>' +
      '<div id="decision-body" style="display:none"><pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:12px;color:var(--text-muted);line-height:1.6;max-height:500px;overflow-y:auto">' +
      escapeHtml(data.decision_text || '') + '</pre></div></div>';

    if (eventSource) eventSource.close();
    document.getElementById('analyze-btn').disabled = false;
    document.getElementById('analyze-btn').textContent = '\\u25b6 ANALYZE';
    clearInterval(timerInterval);
  }

  function showError(msg) {
    var grid = document.getElementById('reports-grid');
    var card = document.createElement('div');
    card.className = 'report-card full-width';
    card.style.borderColor = 'var(--red)';
    card.innerHTML = '<div class="card-header"><span class="agent-name" style="color:var(--red)">\\u274c Error</span></div>' +
      '<div class="card-body" style="display:block;max-height:none;padding:0 14px 14px;color:var(--red)">' + escapeHtml(msg || 'Unknown error') + '</div>';
    grid.appendChild(card);
    if (eventSource) eventSource.close();
    document.getElementById('analyze-btn').disabled = false;
    document.getElementById('analyze-btn').textContent = '\\u25b6 ANALYZE';
    clearInterval(timerInterval);
  }

  function updateStats(s) {
    lastStats = s;
    renderStatsBar();
  }

  function renderStatsBar() {
    var elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    var mm = Math.floor(elapsed / 60);
    var ss = Math.floor(elapsed % 60);
    var timeStr = '\\u23f1 ' + String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
    if (lastStats) {
      document.getElementById('stats-text').textContent =
        'Agents: ' + lastStats.agents_done + '/' + lastStats.agents_total +
        ' | LLM: ' + lastStats.llm_calls +
        ' | Tools: ' + lastStats.tool_calls +
        ' | Tokens: ' + (lastStats.tokens_in || 0).toLocaleString() + '\\u2191 ' + (lastStats.tokens_out || 0).toLocaleString() + '\\u2193' +
        ' | Reports: ' + lastStats.reports_done + '/' + lastStats.reports_total +
        ' | ' + timeStr;
    } else {
      document.getElementById('stats-text').textContent = timeStr;
    }
  }

  function updateTimer() {
    if (!startTime) return;
    renderStatsBar();
  }

  function init() {
    resetUI();
    document.getElementById('date-input').valueAsDate = new Date();
    document.getElementById('ticker').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') analyze();
    });
    document.getElementById('analyze-btn').addEventListener('click', function() {
      analyze();
    });
  }

  function destroy() {
    if (eventSource) { eventSource.close(); eventSource = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    startTime = null;
    agentStatuses = {};
    lastStats = null;
  }

  return { init: init, destroy: destroy };
})();
`;
}

module.exports = { registerAgentsRoutes, getAgentsPageCSS, getAgentsPageHTML, getAgentsPageJS };
