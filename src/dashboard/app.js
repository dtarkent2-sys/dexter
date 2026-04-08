/**
 * Billy Command Center — Full Interactive Dashboard
 *
 * Single-page app with sidebar navigation covering all of Billy's capabilities.
 * Pages: Home, Performance, GEX Heatmap, Positions, SHARK, Alerts
 *
 * All data loaded via /api/* endpoints, auto-refreshes via polling.
 * Dark theme matching Discord aesthetic.
 */

const fs = require('fs');
const path = require('path');
const { getCommonHead, getCommonStyles } = require('./common-styles');
const { getFlowPageCSS, getFlowPageHTML, getFlowPageJS } = require('./flow');
const { getBriefingPageCSS, getBriefingPageHTML, getBriefingPageJS } = require('./briefing');
const { getAgentsPageCSS, getAgentsPageHTML, getAgentsPageJS } = require('./agents');
const { getGexCombinedPageCSS, getGexCombinedPageHTML, getGexCombinedPageJS } = require('./gex-combined');
const { getGexAnalyticsPageCSS, getGexAnalyticsPageHTML, getGexAnalyticsPageJS } = require('./gex-analytics');
const { getPriceChartPageCSS, getPriceChartPageHTML, getPriceChartPageJS } = require('./price-chart');
const { getIntelPageCSS, getIntelPageHTML, getIntelPageJS } = require('./intel');
const { getSmartMoneyPageCSS, getSmartMoneyPageHTML, getSmartMoneyPageJS } = require('./smartmoney');
const { getScreenerPageCSS, getScreenerPageHTML, getScreenerPageJS } = require('./screener');
const { getGexLlmPageCSS, getGexLlmPageHTML, getGexLlmPageJS } = require('./gex-llm');
const { getAlertsCSS, getAlertsHTML, getAlertsJS } = require('./alerts-ui');
const { getAlertsPageCSS, getAlertsPageHTML, getAlertsPageJS } = require('./alerts-page');
const { getStrategiesPageCSS, getStrategiesPageHTML, getStrategiesPageJS } = require('./strategies');
const { getLtScreenerPageCSS, getLtScreenerPageHTML, getLtScreenerPageJS } = require('./lt-screener');
const { getGexVisorPageCSS, getGexVisorPageHTML, getGexVisorPageJS } = require('./gex-visor');
const { getPageCSS: getCommandCenterCSS, getPageHTML: getCommandCenterHTML, getPageJS: getCommandCenterJS } = require('./command-center');
const { getPageCSS: getZeroDteCSS, getPageHTML: getZeroDteHTML, getPageJS: getZeroDteJS } = require('./zero-dte');
const { getLearnPageCSS, getLearnPageHTML, getLearnPageJS } = require('./learn');
const { getMarketStatePanelCSS, getMarketStatePanelHTML, getMarketStatePanelJS } = require('./market-state-panel');
const { getSwingPageCSS, getSwingPageHTML, getSwingPageJS } = require('./swing');
const { getTrinityPageCSS, getTrinityPageHTML, getTrinityPageJS } = require('./trinity');
const { getEdgeBoardPageCSS, getEdgeBoardPageHTML, getEdgeBoardPageJS } = require('./edge-board');
const { getSnapbackPageCSS, getSnapbackPageHTML, getSnapbackPageJS } = require('./snapback');
const { getPageCSS: getCorridorCSS, getPageHTML: getCorridorHTML, getPageJS: getCorridorJS } = require('./gamma-corridor');
const { getMobileOverrideCSS } = require('./mobile-overrides');
const ltQuery = require('../services/lt-query');
const stats = require('../services/stats');
const reactions = require('../services/reactions');
const ai = require('../services/ai');
const auditLog = require('../services/audit-log');
const circuitBreaker = require('../services/circuit-breaker');
const mood = require('../services/mood');
const policy = require('../services/policy');

// Lazy-loaded services (avoid startup cost)
let _shark = null, _optionsEngine = null;
function getShark() { if (!_shark) try { _shark = require('../services/mahoraga'); } catch { _shark = null; } return _shark; }
function getOptionsEngine() { if (!_optionsEngine) try { _optionsEngine = require('../services/options-engine'); } catch { _optionsEngine = null; } return _optionsEngine; }

let _market = null, _technicals = null, _claudeAnalysis = null, _yahoo = null, _tradingLlm = null;
function getMarket() { if (!_market) try { _market = require('../data/market'); } catch { _market = null; } return _market; }
function getTechnicals() { if (!_technicals) try { _technicals = require('../services/technicals'); } catch { _technicals = null; } return _technicals; }
function getClaudeAnalysis() { if (!_claudeAnalysis) try { _claudeAnalysis = require('../services/claude-analysis'); } catch { _claudeAnalysis = null; } return _claudeAnalysis; }
function getYahoo() { if (!_yahoo) try { _yahoo = require('../services/yahoo'); } catch { _yahoo = null; } return _yahoo; }
function getTradingLlm() { if (!_tradingLlm) try { _tradingLlm = require('../services/trading-llm'); } catch { _tradingLlm = null; } return _tradingLlm; }

let _snapbackEngine = null;
function getSnapbackEngine() { if (!_snapbackEngine) try { _snapbackEngine = require('../services/snapback-engine'); } catch { _snapbackEngine = null; } return _snapbackEngine; }

let _snapbackTrader = null;
function getSnapbackTrader() { if (!_snapbackTrader) try { _snapbackTrader = require('../services/snapback-trader'); } catch { _snapbackTrader = null; } return _snapbackTrader; }

let _finra = null, _shortData = null, _secEdgar = null, _finnhub = null;
function getFinra() { if (!_finra) try { _finra = require('../services/finra'); } catch { _finra = null; } return _finra; }
function getShortData() { if (!_shortData) try { _shortData = require('../services/short-data'); } catch { _shortData = null; } return _shortData; }
function getSecEdgar() { if (!_secEdgar) try { _secEdgar = require('../services/sec-edgar'); } catch { _secEdgar = null; } return _secEdgar; }
function getFinnhub() { if (!_finnhub) try { _finnhub = require('../services/finnhub'); } catch { _finnhub = null; } return _finnhub; }

/**
 * Register all dashboard routes on the Express app.
 * @param {import('express').Express} app
 */
function registerDashboardRoutes(app) {

  // ── API: Agent Status ─────────────────────────────────────────────────
  app.get('/api/agent', async (req, res) => {
    try {
      const shark = getShark();
      if (!shark) return res.json({ error: 'SHARK not loaded' });
      const status = await shark.getStatus();
      res.json(status);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Agent Config Update ──────────────────────────────────────────
  app.post('/api/agent/config', (req, res) => {
    try {
      const shark = getShark();
      if (!shark) return res.json({ error: 'SHARK not loaded' });
      const updates = req.body;
      if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'Invalid body' });
      shark.updateConfig(updates);
      res.json({ ok: true, config: shark.getConfig() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Agent Logs ───────────────────────────────────────────────────
  app.get('/api/agent/logs', (req, res) => {
    try {
      const shark = getShark();
      if (!shark) return res.json({ logs: [] });
      const count = Math.min(parseInt(req.query.count) || 50, 200);
      const logs = shark.getLogs().slice(-count);
      res.json({ logs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Options Status ───────────────────────────────────────────────
  app.get('/api/options', async (req, res) => {
    try {
      const engine = getOptionsEngine();
      if (!engine) return res.json({ error: 'Options engine not loaded' });
      const status = await engine.getStatus();
      res.json(status);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Trade Journal ────────────────────────────────────────────────
  app.get('/api/trades', (req, res) => {
    try {
      const engine = getOptionsEngine();
      if (!engine) return res.json({ trades: [], stats: {} });
      const count = Math.min(parseInt(req.query.count) || 100, 500);
      const journal = engine.getTradeJournal(count);

      // Compute stats
      const wins = journal.filter(t => t.won).length;
      const losses = journal.length - wins;
      const totalPnl = journal.reduce((s, t) => s + (t.pnl || 0), 0);
      const avgWin = wins > 0 ? journal.filter(t => t.won).reduce((s, t) => s + (t.pnl || 0), 0) / wins : 0;
      const avgLoss = losses > 0 ? journal.filter(t => !t.won).reduce((s, t) => s + (t.pnl || 0), 0) / losses : 0;
      const maxWin = journal.reduce((m, t) => Math.max(m, t.pnl || 0), 0);
      const maxLoss = journal.reduce((m, t) => Math.min(m, t.pnl || 0), 0);
      const avgHold = journal.length > 0 ? journal.reduce((s, t) => s + (t.holdMinutes || 0), 0) / journal.length : 0;

      // By underlying
      const byUnderlying = {};
      for (const t of journal) {
        const u = t.underlying || 'unknown';
        if (!byUnderlying[u]) byUnderlying[u] = { wins: 0, losses: 0, pnl: 0 };
        if (t.won) byUnderlying[u].wins++; else byUnderlying[u].losses++;
        byUnderlying[u].pnl += t.pnl || 0;
      }

      // By direction
      const byDirection = { call: { wins: 0, losses: 0, pnl: 0 }, put: { wins: 0, losses: 0, pnl: 0 } };
      for (const t of journal) {
        const d = t.direction || 'call';
        if (!byDirection[d]) byDirection[d] = { wins: 0, losses: 0, pnl: 0 };
        if (t.won) byDirection[d].wins++; else byDirection[d].losses++;
        byDirection[d].pnl += t.pnl || 0;
      }

      // By conviction level
      const byConviction = {};
      for (const t of journal) {
        const c = t.conviction || 0;
        if (!byConviction[c]) byConviction[c] = { wins: 0, losses: 0, pnl: 0 };
        if (t.won) byConviction[c].wins++; else byConviction[c].losses++;
        byConviction[c].pnl += t.pnl || 0;
      }

      // Loss pattern analysis
      const lossPatterns = {};
      for (const t of journal.filter(t => !t.won)) {
        const pm = t.postMortem || [];
        for (const line of pm) {
          // Extract key patterns
          if (/vwap/i.test(line)) lossPatterns.vwapConflict = (lossPatterns.vwapConflict || 0) + 1;
          if (/volume/i.test(line)) lossPatterns.lowVolume = (lossPatterns.lowVolume || 0) + 1;
          if (/chop/i.test(line)) lossPatterns.choppy = (lossPatterns.choppy || 0) + 1;
          if (/theta|decay/i.test(line)) lossPatterns.thetaDecay = (lossPatterns.thetaDecay || 0) + 1;
          if (/momentum.*fad/i.test(line)) lossPatterns.momentumFade = (lossPatterns.momentumFade || 0) + 1;
          if (/spread|wide/i.test(line)) lossPatterns.wideSpread = (lossPatterns.wideSpread || 0) + 1;
        }
      }

      // Daily P&L series (for chart)
      const dailyPnl = {};
      for (const t of journal) {
        const day = (t.date || t.entryTime || '').slice(0, 10);
        if (!day) continue;
        if (!dailyPnl[day]) dailyPnl[day] = { pnl: 0, wins: 0, losses: 0 };
        dailyPnl[day].pnl += t.pnl || 0;
        if (t.won) dailyPnl[day].wins++; else dailyPnl[day].losses++;
      }

      res.json({
        trades: journal,
        stats: {
          total: journal.length,
          wins, losses,
          winRate: journal.length > 0 ? (wins / journal.length * 100).toFixed(1) : '0',
          totalPnl: totalPnl.toFixed(2),
          avgWin: avgWin.toFixed(2),
          avgLoss: avgLoss.toFixed(2),
          maxWin: maxWin.toFixed(2),
          maxLoss: maxLoss.toFixed(2),
          avgHoldMinutes: avgHold.toFixed(1),
          profitFactor: Math.abs(avgLoss) > 0 ? (avgWin / Math.abs(avgLoss)).toFixed(2) : 'N/A',
        },
        byUnderlying,
        byDirection,
        byConviction,
        lossPatterns,
        dailyPnl,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Today's Losers (for loss analysis) ───────────────────────────
  app.get('/api/trades/losers', (req, res) => {
    try {
      const engine = getOptionsEngine();
      if (!engine) return res.json({ losers: [] });
      res.json({ losers: engine.getTodayLosers() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Overview (combines key data for home page) ───────────────────
  app.get('/api/overview', async (req, res) => {
    try {
      const summary = stats.getSummary();
      const reactionStats = reactions.getStats();
      const moodSummary = mood.getSummary();
      const cbStatus = circuitBreaker.getStatus();
      const auditStats = auditLog.getStats();
      const policyConfig = policy.getConfig();

      let agentStatus = null;
      const shark = getShark();
      if (shark) {
        try { agentStatus = await shark.getStatus(); } catch { /* skip */ }
      }

      let optionsStatus = null;
      const engine = getOptionsEngine();
      if (engine) {
        try { optionsStatus = await engine.getStatus(); } catch { /* skip */ }
      }

      // Data sources status
      let databento = null;
      try { const db = require('../services/databento'); databento = db.enabled ? db.getStatus() : null; } catch { /* skip */ }
      let tradier = null;
      try { const t = require('../services/tradier'); tradier = t.enabled ? { enabled: true } : null; } catch { /* skip */ }

      res.json({
        bot: { ...summary, model: ai.getModel(), reactions: reactionStats },
        mood: moodSummary,
        circuitBreaker: cbStatus,
        audit: auditStats,
        policy: {
          killSwitch: policy.killSwitch,
          dailyPnL: policy.dailyPnL,
          dailyStartEquity: policy.dailyStartEquity,
        },
        agent: agentStatus ? {
          enabled: agentStatus.agent_enabled,
          paper: agentStatus.paper,
          positionCount: agentStatus.positions?.length || 0,
          equity: agentStatus.account?.equity,
          buyingPower: agentStatus.account?.buying_power,
        } : null,
        options: optionsStatus ? {
          enabled: optionsStatus.enabled,
          activePositions: optionsStatus.activePositions,
          dailyLoss: optionsStatus.dailyLoss,
          discipline: optionsStatus.discipline,
        } : null,
        dataSources: {
          databento,
          tradier,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Algo Trading Signals ────────────────────────────────────────
  app.get('/api/algo/signals/:ticker', (req, res) => {
    try {
      let algoTrading;
      try { algoTrading = require('../services/algo-trading'); } catch { return res.json({ error: 'Algo trading module not available' }); }
      const ticker = (req.params.ticker || 'SPY').toUpperCase();
      const signals = algoTrading.getSignals(ticker);
      res.json(signals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Algo Trading Pairs ────────────────────────────────────────
  app.get('/api/algo/pairs', (req, res) => {
    try {
      let algoTrading;
      try { algoTrading = require('../services/algo-trading'); } catch { return res.json({ pairs: [] }); }
      res.json({ pairs: algoTrading.getPairsStatus() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Algo Trading Add Pair ────────────────────────────────────
  app.post('/api/algo/pairs', (req, res) => {
    try {
      let algoTrading;
      try { algoTrading = require('../services/algo-trading'); } catch { return res.json({ error: 'Algo trading module not available' }); }
      const { tickerY, tickerX, lookback, entryZ, exitZ } = req.body || {};
      if (!tickerY || !tickerX) return res.status(400).json({ error: 'tickerY and tickerX required' });
      algoTrading.addPair(tickerY, tickerX, { lookback, entryZ, exitZ });
      res.json({ ok: true, pair: `${tickerY.toUpperCase()}/${tickerX.toUpperCase()}` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Algo Trading P&L ─────────────────────────────────────────
  app.get('/api/algo/pnl', (req, res) => {
    try {
      let algoTrading;
      try { algoTrading = require('../services/algo-trading'); } catch { return res.json({ error: 'Algo trading module not available' }); }
      const pnl = algoTrading.getPnl();
      const signals = algoTrading.getRecentSignals(50);
      res.json({ pnl, recentSignals: signals });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Algo Trading VWAP ────────────────────────────────────────
  app.get('/api/algo/vwap/:ticker', (req, res) => {
    try {
      let algoTrading;
      try { algoTrading = require('../services/algo-trading'); } catch { return res.json({ error: 'Algo trading module not available' }); }
      const ticker = (req.params.ticker || 'SPY').toUpperCase();
      const vwap = algoTrading.engine.vwapTwap.getVwap(ticker);
      const barVwap = algoTrading.engine.vwapTwap.getBarVwap(ticker);
      const volumeProfile = algoTrading.engine.vwapTwap.getVolumeProfile(ticker);
      res.json({ ticker, vwap, barVwap, volumeProfile });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Algo Trading ML Model Info ───────────────────────────────
  app.get('/api/algo/ml/:ticker', (req, res) => {
    try {
      let algoTrading;
      try { algoTrading = require('../services/algo-trading'); } catch { return res.json({ error: 'Algo trading module not available' }); }
      const ticker = (req.params.ticker || 'SPY').toUpperCase();
      const prediction = algoTrading.engine.ml.getPrediction(ticker);
      const modelInfo = algoTrading.engine.ml.getModelInfo(ticker);
      res.json({ ticker, prediction, model: modelInfo });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Main Dashboard SPA ────────────────────────────────────────────────
  app.get('/dashboard', (_req, res) => {
    res.send(_dashboardHTML());
  });

  // ── API: 0DTE Trading ──────────────────────────────────────────────

  app.get('/api/trading/state', async (req, res) => {
    try {
      const engine = getOptionsEngine();
      if (!engine) return res.json({ error: 'Engine not available' });
      const positions = await engine.getEnrichedPositions();
      const managerState = engine._manager ? engine._manager.getState() : {};
      res.json({
        positions,
        dailyPnL: managerState.dailyPnL || 0,
        wins: (managerState.closedTrades || []).filter(t => t.pnl > 0).length,
        losses: (managerState.closedTrades || []).filter(t => t.pnl <= 0).length,
        closedTrades: managerState.closedTrades || [],
        config: managerState.config || {},
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/trading/signals', (req, res) => {
    try {
      const engine = getOptionsEngine();
      if (!engine || !engine._scanner) return res.json({ signals: [] });
      res.json({ signals: engine._lastScanResults || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/trading/config', (req, res) => {
    try {
      const engine = getOptionsEngine();
      if (!engine || !engine._manager) return res.status(400).json({ error: 'Manager not available' });
      engine._manager.updateConfig(req.body);
      res.json({ ok: true, config: engine._manager.config });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/trading/kill', async (req, res) => {
    try {
      const engine = getOptionsEngine();
      if (!engine || !engine._manager) return res.status(400).json({ error: 'Manager not available' });
      const state = engine._manager.getState();
      const closed = [];
      for (const pos of state.positions) {
        try {
          const alpacaMod = require('../services/alpaca');
          await alpacaMod.closeOptionsPosition(pos.symbol);
          engine._manager.recordClose(pos.symbol, pos.maxPrice || pos.entryPrice, 'KILL_SWITCH');
          engine._activeTrades.delete(pos.symbol);
          closed.push(pos.symbol);
        } catch (err) {
          closed.push(`${pos.symbol} (failed: ${err.message})`);
        }
      }
      engine._persistTrades();
      res.json({ ok: true, closed });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Snapback Signal Engine ──────────────────────────────────────

  app.get('/api/snapback/status', (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ error: 'Snapback engine not loaded' });
      res.json(engine.getStatus());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/latest', (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ error: 'Snapback engine not loaded' });
      const ticker = (req.query.ticker || 'QQQ').toUpperCase();
      res.json(engine.getLatest(ticker));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/latest/all', (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ error: 'Snapback engine not loaded' });
      res.json(engine.getAllLatest());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/history', (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ signals: [] });
      const ticker = (req.query.ticker || 'QQQ').toUpperCase();
      const limit = Math.min(Number(req.query.limit) || 50, 200);
      res.json({ signals: engine.getHistory(ticker, limit) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/signals', async (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ signals: [] });
      const ticker = (req.query.ticker || 'QQQ').toUpperCase();
      const date = req.query.date || null;
      const tier = req.query.tier || null;
      const limit = Math.min(Number(req.query.limit) || 100, 500);
      const signals = await engine.getSignals(ticker, { date, limit, tier });
      res.json({ signals });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/summary', async (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ error: 'Snapback engine not loaded' });
      const ticker = (req.query.ticker || 'QQQ').toUpperCase();
      const date = req.query.date || null;
      const summary = await engine.getDailySummary(ticker, date);
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // SSE stream for real-time signals
  app.get('/api/snapback/stream', (req, res) => {
    const engine = getSnapbackEngine();
    if (!engine) return res.status(400).json({ error: 'Snapback engine not loaded' });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write('data: {"connected":true}\n\n');

    const remove = engine.addListener(signal => {
      res.write(`data: ${JSON.stringify(signal)}\n\n`);
    });

    req.on('close', remove);
  });

  app.post('/api/snapback/recalibrate', async (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.status(400).json({ error: 'Not loaded' });
      const thresholds = await engine.recalibrate();
      res.json({ ok: true, thresholds });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: SharkSnap Regime Meter ───────────────────────────────────
  app.get('/api/snapback/regime', (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ error: 'Snapback engine not loaded' });
      const ticker = (req.query.ticker || 'QQQ').toUpperCase();
      const regime = engine.getRegime(ticker);
      if (!regime) return res.json({ regime: null, message: 'No data yet — engine scanning' });
      res.json(regime);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/regime/all', (req, res) => {
    try {
      const engine = getSnapbackEngine();
      if (!engine) return res.json({ error: 'Snapback engine not loaded' });
      res.json(engine.getAllRegimes());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: SharkSnap Validated Trader ─────────────────────────────────

  app.get('/api/snapback/trader/status', (req, res) => {
    try {
      const trader = getSnapbackTrader();
      if (!trader) return res.json({ error: 'Snapback trader not loaded' });
      res.json(trader.getStatus());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/trader/journal', (req, res) => {
    try {
      const trader = getSnapbackTrader();
      if (!trader) return res.json({ journal: [] });
      const ticker = req.query.ticker ? req.query.ticker.toUpperCase() : null;
      const limit = Math.min(Number(req.query.limit) || 50, 200);
      res.json({ journal: trader.getJournal(ticker, limit) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/snapback/trader/trace', async (req, res) => {
    try {
      const trader = getSnapbackTrader();
      if (!trader) return res.json({ trace: [] });
      const ticker = req.query.ticker ? req.query.ticker.toUpperCase() : null;
      const source = req.query.source || 'memory';
      const limit = Math.min(Number(req.query.limit) || 100, 500);
      if (source === 'db') {
        const rows = await trader.getTraceFromDB(ticker, limit);
        res.json({ trace: rows });
      } else {
        res.json({ trace: trader.getTraceLog(ticker, limit) });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/snapback/trader/start', async (req, res) => {
    try {
      const trader = getSnapbackTrader();
      if (!trader) return res.status(400).json({ error: 'Not loaded' });
      await trader.start();
      res.json({ ok: true, status: trader.getStatus() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/snapback/trader/stop', async (req, res) => {
    try {
      const trader = getSnapbackTrader();
      if (!trader) return res.status(400).json({ error: 'Not loaded' });
      await trader.stop();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Market Intel ──────────────────────────────────────────────

  app.get('/api/intel/price/:ticker', async (req, res) => {
    try {
      const market = getMarket();
      if (!market) return res.json({ error: 'Market module not available' });
      const ticker = req.params.ticker.toUpperCase();
      const data = await market.getMarketContext(ticker);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/intel/technicals/:ticker', async (req, res) => {
    try {
      const technicals = getTechnicals();
      if (!technicals) return res.json({ error: 'Technicals module not available' });
      const ticker = req.params.ticker.toUpperCase();
      const result = await technicals.analyze(ticker);
      const t = result.technicals || {};
      // Flatten for frontend consumption
      const flat = {
        price: t.price,
        rsi14: t.rsi_14,
        sma20: t.sma_20,
        sma50: t.sma_50,
        sma200: t.sma_200,
        macd: t.macd?.macd ?? null,
        macdSignal: t.macd?.signal ?? null,
        macdHistogram: t.macd?.histogram ?? null,
        bollingerUpper: t.bollinger?.upper ?? null,
        bollingerMiddle: t.bollinger?.middle ?? null,
        bollingerLower: t.bollinger?.lower ?? null,
        atr14: t.atr_14,
        relativeVolume: t.relative_volume,
        signals: result.signals || [],
      };
      res.json(flat);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/intel/news/:ticker', async (req, res) => {
    try {
      let alpaca;
      try { alpaca = require('../services/alpaca'); } catch { return res.json({ error: 'Alpaca module not available' }); }
      const ticker = req.params.ticker.toUpperCase();
      const count = Math.min(parseInt(req.query.count) || 10, 30);
      const news = await alpaca.getNews(ticker, count);
      res.json({ news });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/intel/analyze', async (req, res) => {
    if (req.tier !== 'pro') {
      return res.status(403).json({ error: 'upgrade_required', message: 'AI analysis requires a Pro subscription.' });
    }
    try {
      const market = getMarket();
      const llm = getTradingLlm();
      if (!market || !llm) return res.json({ error: 'Required modules not available' });
      const { ticker, mode } = req.body || {};
      if (!ticker) return res.status(400).json({ error: 'ticker required' });
      const symbol = ticker.toUpperCase();
      const context = await market.getMarketContext(symbol);
      const dataBlock = Object.entries(context)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `## ${k.toUpperCase()}\n${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`)
        .join('\n\n');

      let systemPrompt, maxTokens;
      if (mode === 'research') {
        systemPrompt = 'You are a research analyst synthesizing multiple data sources into a comprehensive report.\n\nRULES:\n- Use ONLY the data provided. Never fabricate information.\n- Structure: Key Findings → Detailed Analysis → Risks → Opportunities → Conclusion\n- Cross-reference data points: Does the technical picture align with fundamentals? Does flow confirm the thesis?\n- Provide actionable conclusions with specific levels and timeframes\n- Be concise but thorough — this report should be decision-ready';
        maxTokens = 2048;
      } else {
        systemPrompt = 'You are an elite institutional equity analyst producing a research report.\n\nRULES:\n- Use ONLY the market data provided. Never fabricate prices, dates, or statistics.\n- Structure your analysis: Executive Summary → Technical Setup → Fundamental Picture → Options/Flow Context → Risk Factors → Actionable Levels\n- Be direct and opinionated — give clear directional bias with conviction level (1-10)\n- Every claim must reference data from the provided context\n- Include specific price levels for support/resistance/targets';
        maxTokens = 2048;
      }

      const prompt = `${systemPrompt}\n\nAnalyze ${symbol}:\n\n${dataBlock}`;
      const text = await llm.complete(prompt, { maxTokens });
      res.json({ text });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/intel/screen', async (req, res) => {
    try {
      const yahoo = getYahoo();
      if (!yahoo) return res.json({ error: 'Yahoo module not available' });
      const stocks = await yahoo.screenByGainers();
      res.json({ stocks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: Screener (legacy FMP routes — replaced by PostgreSQL screener in src/screener/api.js) ──

  // ── API: Smart Money ──────────────────────────────────────────────

  app.get('/api/smartmoney/darkpool/:ticker', async (req, res) => {
    try {
      const finra = getFinra();
      if (!finra || !finra.enabled) return res.json({ error: 'FINRA API credentials not configured. Set FINRA_CLIENT_ID and FINRA_CLIENT_SECRET.' });
      const ticker = req.params.ticker.toUpperCase();
      const [dpResult, svResult] = await Promise.allSettled([
        finra.getDarkPoolVolume(ticker),
        finra.getShortVolume(ticker),
      ]);
      const dp = dpResult.status === 'fulfilled' ? dpResult.value : null;
      const sv = svResult.status === 'fulfilled' ? svResult.value : null;
      if (!dp && !sv) {
        const errMsg = dpResult.status === 'rejected' ? dpResult.reason?.message : '';
        if (errMsg.includes('auth failed') || errMsg.includes('Invalid')) {
          return res.json({ error: 'FINRA authentication failed — credentials may be invalid or expired' });
        }
        return res.json({ error: 'No dark pool data returned from FINRA' });
      }
      res.json({ darkPool: dp, shortVolume: sv });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/smartmoney/short/:ticker', async (req, res) => {
    try {
      const shortData = getShortData();
      if (!shortData || !shortData.enabled) return res.json({ error: 'Short data module not available' });
      const ticker = req.params.ticker.toUpperCase();
      const data = await shortData.getShortInterest(ticker);
      // Normalize field names for frontend: shortInterestPct → shortInterest
      if (data && data.shortInterestPct != null && data.shortInterest == null) {
        data.shortInterest = data.shortInterestPct;
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/smartmoney/ftd/:ticker', async (req, res) => {
    try {
      const sec = getSecEdgar();
      if (!sec) return res.json({ error: 'SEC Edgar module not available' });
      const ticker = req.params.ticker.toUpperCase();
      const data = await sec.getFTD(ticker);
      res.json({ ftd: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/smartmoney/insider/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const finnhub = getFinnhub();
      if (finnhub && finnhub.enabled) {
        try {
          const data = await finnhub.getInsiderTrades(ticker);
          if (Array.isArray(data) && data.length > 0) {
            return res.json({ insider: data, source: 'finnhub' });
          }
        } catch (e) {
          console.warn(`[SmartMoney] Finnhub insider also failed for ${ticker}: ${e.message}`);
        }
      }
      res.json({ insider: [], error: 'No insider data available' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Congress cache — file-backed so it persists across restarts
  const CONGRESS_CACHE_MS = 4 * 60 * 60 * 1000; // 4 hours fresh
  const CONGRESS_CACHE_FILE = path.join(__dirname, '..', '..', 'data', 'congress-cache.json');
  const _congressMem = new Map();

  function loadCongressCache() {
    try {
      if (fs.existsSync(CONGRESS_CACHE_FILE)) {
        const raw = JSON.parse(fs.readFileSync(CONGRESS_CACHE_FILE, 'utf8'));
        for (const [k, v] of Object.entries(raw)) _congressMem.set(k, v);
      }
    } catch (_) { /* ignore corrupt cache */ }
  }
  function saveCongressCache() {
    try {
      const dir = path.dirname(CONGRESS_CACHE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const obj = {};
      for (const [k, v] of _congressMem) obj[k] = v;
      fs.writeFileSync(CONGRESS_CACHE_FILE, JSON.stringify(obj));
    } catch (_) { /* best effort */ }
  }
  loadCongressCache();

  app.get('/api/smartmoney/congress/:ticker?', async (req, res) => {
    try {
      const ticker = (req.params.ticker || req.query.ticker || '').toUpperCase();
      if (!ticker) return res.json({ congress: [], error: 'Ticker required' });
      const cached = _congressMem.get(ticker);
      if (cached && Date.now() - cached.ts < CONGRESS_CACHE_MS) {
        return res.json({ congress: cached.data, source: 'finnhub', cached: true });
      }

      const finnhubC = getFinnhub();
      if (finnhubC && finnhubC.enabled) {
        try {
          const data = await finnhubC.getCongressTrades(ticker);
          if (Array.isArray(data) && data.length > 0) {
            _congressMem.set(ticker, { data, ts: Date.now() });
            saveCongressCache();
            return res.json({ congress: data, source: 'finnhub' });
          }
        } catch (e) {
          console.warn(`[SmartMoney] Finnhub congress failed: ${e.message}`);
          if (cached) {
            return res.json({ congress: cached.data, source: 'finnhub', cached: true, stale: true });
          }
        }
      }
      // Last resort: serve any stale cache
      if (cached) {
        return res.json({ congress: cached.data, source: 'finnhub', cached: true, stale: true });
      }
      res.json({ congress: [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Prefetch congress data 30s after startup for common tickers
  setTimeout(async () => {
    const tickers = ['SPY', 'QQQ', 'AAPL', 'NVDA', 'TSLA', 'MSFT'];
    const finnhubP = getFinnhub();
    if (!finnhubP || !finnhubP.enabled) return;
    for (const tkr of tickers) {
      if (_congressMem.has(tkr)) continue;
      try {
        const data = await finnhubP.getCongressTrades(tkr);
        if (Array.isArray(data) && data.length > 0) {
          _congressMem.set(tkr, { data, ts: Date.now() });
          console.log(`[SmartMoney] Prefetched ${data.length} congress trades for ${tkr}`);
        }
        await new Promise(r => setTimeout(r, 3000)); // 3s gap between calls
      } catch (e) {
        console.warn(`[SmartMoney] Congress prefetch ${tkr} failed: ${e.message}`);
        break; // stop on rate limit
      }
    }
    saveCongressCache();
  }, 30000);

  app.get('/api/smartmoney/filings/:ticker', async (req, res) => {
    try {
      const sec = getSecEdgar();
      if (!sec) return res.json({ error: 'SEC Edgar module not available' });
      const ticker = req.params.ticker.toUpperCase();
      const type = req.query.type || undefined;
      const data = await sec.getFilings(ticker, type);
      // Unwrap: getFilings returns {ticker, companyName, filings: [...]}
      res.json({ filings: data.filings || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/smartmoney/whales/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const result = {};

      const fh = getFinnhub();
      if (fh && fh.enabled) {
        const [analysts, financials, earnings, insider] = await Promise.allSettled([
          fh.getAnalystConsensus(ticker),
          fh.getFinancials(ticker),
          fh.getEarnings(ticker, 2),
          fh.getInsiderTrades(ticker),
        ]);
        result.analysts = analysts.status === 'fulfilled' ? analysts.value : null;
        result.financials = financials.status === 'fulfilled' ? financials.value : null;
        result.earnings = earnings.status === 'fulfilled' ? earnings.value : null;
        result.insider = insider.status === 'fulfilled' ? insider.value : null;
      }
      // News via Alpaca
      try {
        const alpaca = require('../services/alpaca');
        result.news = await alpaca.getNews({ symbols: [ticker], limit: 3 });
      } catch { result.news = null; }

      if (!Object.values(result).some(v => v != null)) {
        return res.json({ error: 'No whale intelligence providers configured' });
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── API: LT Factor Screener ──────────────────────────────────────────
  app.get('/api/lt-screener', async (req, res) => {
    if (req.tier !== 'pro') return res.status(403).json({ error: 'Pro subscription required' });
    try {
      const filters = {
        sort_by: `score_composite_${req.query.preset || 'balanced'}`,
        sector: req.query.sector || undefined,
        min_score: req.query.min_score ? Number(req.query.min_score) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 50,
      };
      const data = await ltQuery.getScreenerData(filters);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/lt-screener/status', async (req, res) => {
    try {
      const data = await ltQuery.getETLStatus();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/lt-screener/detail/:symbol', async (req, res) => {
    if (req.tier !== 'pro') return res.status(403).json({ error: 'Pro subscription required' });
    try {
      const data = await ltQuery.getTickerDetail(req.params.symbol);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/lt-screener/backtest', async (req, res) => {
    if (req.tier !== 'pro') return res.status(403).json({ error: 'Pro subscription required' });
    try {
      const config = {
        preset: req.body.preset || 'balanced',
        top_n: req.body.top_n || 25,
        start_date: req.body.start_date || '2021-01-01',
        slippage_bps: req.body.slippage_bps || 10,
        commission_bps: req.body.commission_bps || 5,
      };
      const data = await ltQuery.runBacktest(config);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/lt-screener/trigger-etl', async (req, res) => {
    const adminEmails = (process.env.ADMIN_EMAILS || 'dtarkent2@gmail.com').split(',').map(e => e.trim().toLowerCase());
    const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').filter(Boolean);
    const u = req.user;
    const isAdmin = u && (adminIds.includes(u.id) || (u.authType === 'email' && adminEmails.includes((u.username || '').toLowerCase())));
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' });
    try {
      const ltETL = require('../services/lt-etl');
      if (req.query.reset === 'true') await ltETL.resetDB();
      res.json({ ok: true, message: req.query.reset === 'true' ? 'DB reset + ETL triggered' : 'ETL triggered' });
      ltETL.runNightly().catch(err => console.error('[LT-ETL] Manual trigger failed:', err.message));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  console.log('[Dashboard] Command Center routes registered: /dashboard, /api/agent, /api/options, /api/trades, /api/overview, /api/algo/*, /api/trading/*, /api/intel/*, /api/smartmoney/*, /api/lt-screener/*');
}

// ── Dashboard HTML ────────────────────────────────────────────────────────

function _dashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${getCommonHead({ socketIO: true, chartJS: true, lwCharts: true })}
<title>SharkQuant™ — Command Center</title>
<style>
:root {
  --bg: #0A0F1C;
  --bg-surface: rgba(15,23,42,0.85);
  --bg-surface-hover: rgba(30,41,59,0.9);
  --bg-elevated: rgba(20,30,50,0.95);
  --border: rgba(251,191,36,0.1);
  --border-subtle: rgba(251,191,36,0.05);
  --text: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --accent: #fbbf24;
  --accent-hover: #fcd34d;
  --accent-subtle: rgba(251,191,36,0.1);
  --cyan: #22d3ee;
  --cyan-dim: rgba(34,211,238,0.12);
  --green: #4ade80;
  --red: #f87171;
  --yellow: #fbbf24;
  --glass: rgba(15,23,42,0.75);
  --glass-border: rgba(251,191,36,0.12);
  --glass-border-cyan: rgba(34,211,238,0.12);
  --font-heading: 'Barlow Condensed', 'DM Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 4px;
  --radius-sm: 3px;
  --radius-xs: 2px;
  --transition: 150ms ease;
}
html.light {
  --bg: #f0f1f5;
  --bg-surface: rgba(255,255,255,0.85);
  --bg-surface-hover: rgba(241,245,249,0.9);
  --bg-elevated: rgba(255,255,255,0.95);
  --border: rgba(180,140,40,0.15);
  --border-subtle: rgba(180,140,40,0.08);
  --text: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --accent: #d97706;
  --accent-hover: #b45309;
  --accent-subtle: rgba(217,119,6,0.08);
  --cyan: #0891b2;
  --cyan-dim: rgba(8,145,178,0.08);
  --green: #16A34A;
  --red: #DC2626;
  --yellow: #CA8A04;
  --glass: rgba(255,255,255,0.75);
  --glass-border: rgba(217,119,6,0.12);
  --glass-border-cyan: rgba(8,145,178,0.12);
}
${getCommonStyles()}
body {
  font-family: var(--font-body); background: var(--bg); color: var(--text);
  display: flex; height: 100vh; overflow: hidden;
  background-image: radial-gradient(ellipse at 30% 20%, rgba(251,191,36,0.03) 0%, transparent 60%),
                    radial-gradient(ellipse at 70% 80%, rgba(34,211,238,0.02) 0%, transparent 60%);
}
html.light body { background-image: none; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.skip-link { position: absolute; top: -100%; left: 16px; z-index: 9999; padding: 8px 16px; background: var(--accent); color: #fff; font-size: 13px; border-radius: 6px; text-decoration: none; transition: top 0.2s; }
.skip-link:focus { top: 16px; }

/* ── Sidebar — HUD Glass ── */
.sidebar {
  width: 220px; background: rgba(10,15,28,0.95); backdrop-filter: blur(16px);
  border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; flex-shrink: 0;
  max-height: 100vh; overflow-y: auto;
}
.sidebar-brand { padding: 20px 16px 16px; border-bottom: 1px solid var(--glass-border); }
.sidebar-brand h1 { font-family: var(--font-heading); font-size: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.sidebar-brand h1 span { color: var(--accent); }
.sidebar-brand .subtitle { font-family: var(--font-mono); font-size: 9px; color: var(--accent); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; opacity: 0.6; }
.nav { flex: 1; padding: 8px; overflow-y: auto; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 3px;
  cursor: pointer; font-size: 12px; font-weight: 500; color: var(--text-muted);
  transition: all var(--transition); margin-bottom: 1px; border: none; background: none;
  width: 100%; text-align: left; border-left: 2px solid transparent;
  font-family: var(--font-mono); letter-spacing: 0.3px;
}
.nav-item:hover { background: rgba(251,191,36,0.05); color: var(--text-secondary); }
.nav-item.active {
  background: rgba(251,191,36,0.08); color: var(--accent); font-weight: 600;
  border-left-color: var(--accent);
}
.nav-item .icon { font-size: 14px; width: 20px; text-align: center; opacity: 0.5; }
.nav-item.active .icon { opacity: 1; color: var(--accent); }
.nav-section { font-family: var(--font-mono); font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(251,191,36,0.35); padding: 16px 12px 4px; }
.nav-badge { margin-left: auto; font-family: var(--font-mono); font-size: 9px; padding: 2px 6px; border-radius: 2px; font-weight: 600; }
.nav-badge.green { background: rgba(74,222,128,0.12); color: var(--green); }
.nav-badge.red { background: rgba(248,113,113,0.12); color: var(--red); }
.nav-badge.yellow { background: rgba(251,191,36,0.12); color: var(--accent); }

.sidebar-footer { padding: 12px 16px; border-top: 1px solid var(--glass-border); font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px; }
.sidebar-footer .status-row { display: flex; align-items: center; }
.sidebar-footer .clock { font-size: 11px; color: var(--accent); font-weight: 500; letter-spacing: 0.5px; }
.status-indicator { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; }
.status-indicator.online { background: var(--green); box-shadow: 0 0 6px rgba(74,222,128,0.4); }
.status-indicator.offline { background: var(--red); }

/* ── Refresh pulse ── */
.refresh-pulse { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: 8px; opacity: 0; }
.refresh-pulse.active { animation: fadeIn 0.6s ease-out; }

/* ── Main Content ── */
.main { flex: 1; overflow-y: auto; scroll-behavior: smooth; }
.page { display: none; opacity: 0; transition: opacity 0.2s ease; padding: 24px 28px; }
.page.active { display: block; opacity: 1; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h2 { font-family: var(--font-heading); font-size: 24px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.page-header .subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--accent); margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; opacity: 0.6; }

/* ── Cards — Glass HUD ── */
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-bottom: 20px; }
.card {
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 14px 16px;
  position: relative; overflow: hidden; transition: border-color var(--transition), box-shadow var(--transition);
  backdrop-filter: blur(8px);
}
.card:hover {
  border-color: rgba(251,191,36,0.25); box-shadow: 0 0 12px rgba(251,191,36,0.06);
}
html.light .card:hover { border-color: rgba(217,119,6,0.3); box-shadow: 0 0 12px rgba(217,119,6,0.06); }
.card .label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
.card .value { font-family: var(--font-mono); font-size: 24px; font-weight: 700; margin-top: 6px; letter-spacing: -0.025em; }
.card .sub { font-family: var(--font-mono); font-size: 10px; color: var(--text-secondary); margin-top: 4px; }
.card .value.green { color: var(--green); }
.card .value.red { color: var(--red); }
.card .value.accent { color: var(--accent); }
.card .value.yellow { color: var(--accent); }
.card .value.cyan { color: var(--cyan); }
.card-wide { grid-column: 1 / -1; }

/* ── Table — HUD Glass ── */
.tbl-wrap { overflow-x: auto; border: 1px solid var(--glass-border); border-radius: var(--radius); margin-bottom: 20px; background: var(--glass); backdrop-filter: blur(8px); }
.tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
.tbl th {
  background: rgba(251,191,36,0.04); padding: 10px 14px; text-align: left; font-family: var(--font-mono);
  font-weight: 600; color: var(--accent); text-transform: uppercase; font-size: 9px;
  letter-spacing: 1px; border-bottom: 1px solid var(--glass-border); position: sticky; top: 0;
}
html.light .tbl th { background: rgba(217,119,6,0.04); color: var(--accent); }
.tbl td { padding: 9px 14px; border-bottom: 1px solid rgba(251,191,36,0.05); }
html.light .tbl td { border-bottom-color: rgba(217,119,6,0.08); }
.tbl tr { transition: background 0.15s; }
.tbl tr:nth-child(even) { background: rgba(251,191,36,0.02); }
html.light .tbl tr:nth-child(even) { background: rgba(217,119,6,0.02); }
.tbl tr:hover { background: rgba(251,191,36,0.06); }
html.light .tbl tr:hover { background: rgba(217,119,6,0.06); }
.tbl .pnl-pos { color: var(--green); font-weight: 600; }
.tbl .pnl-neg { color: var(--red); font-weight: 600; }
.mono { font-family: var(--font-mono); }

/* ── Section ── */
.section { margin-bottom: 24px; }
.section-title { font-family: var(--font-heading); font-size: 15px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: var(--accent); letter-spacing: 1.5px; text-transform: uppercase; }
.section-title .icon { font-size: 15px; opacity: 0.6; }

/* ── Tags — HUD ── */
.tag { display: inline-block; padding: 2px 8px; border-radius: 2px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.5px; }
.tag-green { background: rgba(74,222,128,0.12); color: var(--green); }
.tag-red { background: rgba(248,113,113,0.12); color: var(--red); }
.tag-yellow { background: rgba(251,191,36,0.12); color: var(--accent); }
.tag-accent { background: var(--accent-subtle); color: var(--accent); }

/* ── Bars — HUD ── */
.bar-group { margin-bottom: 12px; }
.bar-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
.bar-track { height: 4px; background: rgba(251,191,36,0.06); border-radius: 2px; overflow: hidden; }
html.light .bar-track { background: rgba(217,119,6,0.06); }
.bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.bar-fill.green { background: var(--green); }
.bar-fill.red { background: var(--red); }
.bar-fill.accent { background: var(--accent); }

/* ── Log — HUD ── */
.log { font-family: var(--font-mono); font-size: 11px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 12px; max-height: 400px; overflow-y: auto; backdrop-filter: blur(8px); }
.log-entry { padding: 3px 0; border-bottom: 1px solid rgba(251,191,36,0.04); }
.log-time { color: var(--text-muted); }
.log-trade { color: var(--accent); }
.log-warning { color: var(--accent); }
.log-error { color: var(--red); }
.log-info { color: var(--text-secondary); }

/* ── Split Layout ── */
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 900px) { .split { grid-template-columns: 1fr; } }

/* ── Loading ── */
.loading { display: flex; align-items: center; justify-content: center; padding: 40px; color: var(--text-secondary); gap: 8px; }
.spinner { width: 16px; height: 16px; border: 2px solid var(--glass-border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty State ── */
.empty { text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.5px; }

/* ── Btn — HUD ── */
.btn {
  background: var(--glass); border: 1px solid var(--glass-border); color: var(--text-secondary);
  padding: 6px 14px; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-mono);
  font-size: 11px; font-weight: 500; transition: all var(--transition); letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
}
.btn:hover { background: rgba(251,191,36,0.08); color: var(--accent); border-color: rgba(251,191,36,0.3); }
html.light .btn:hover { background: rgba(217,119,6,0.08); color: var(--accent); border-color: rgba(217,119,6,0.3); }
.btn-sm { padding: 4px 10px; font-size: 10px; }
.btn-accent { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.25); color: var(--accent); }
.btn-green { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.25); color: var(--green); }
.btn-red { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.25); color: var(--red); }
.theme-toggle { background: none; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 6px 8px; color: var(--text-muted); cursor: pointer; transition: all var(--transition); }
.theme-toggle:hover { color: var(--accent); border-color: rgba(251,191,36,0.3); }

/* scrollbar styles provided by getCommonStyles() */

/* ── Mobile Hamburger — HUD ── */
.sidebar-toggle {
  display: none; position: fixed; top: 12px; left: 12px; z-index: 95;
  background: var(--glass); border: 1px solid var(--glass-border); color: var(--accent);
  font-size: 20px; width: 38px; height: 38px; border-radius: 3px; cursor: pointer;
  align-items: center; justify-content: center; line-height: 1; backdrop-filter: blur(12px);
}
.sidebar-overlay {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 90;
}

/* ── Mobile Layout ── */
@media (max-width: 768px) {
  body { overflow: auto; height: auto; }
  .sidebar-toggle { display: flex; }
  .sidebar {
    position: fixed; left: -270px; top: 0; bottom: 0; z-index: 100;
    width: 260px; transition: left 0.3s ease;
  }
  .sidebar.open { left: 0; }
  .sidebar.open ~ .sidebar-overlay { display: block; }
  .main { width: 100%; }
  .page { padding: 16px 12px; padding-top: 56px; }
  .page-header h2 { font-size: 18px; }
  .cards { grid-template-columns: repeat(2, 1fr); }
  .card .value { font-size: 20px; }
}
@media (max-width: 480px) {
  .cards { grid-template-columns: 1fr; }
}
${getFlowPageCSS()}
${getBriefingPageCSS()}
${getAgentsPageCSS()}
${getGexCombinedPageCSS()}
${getGexAnalyticsPageCSS()}
${getPriceChartPageCSS()}
${getIntelPageCSS()}
${getSmartMoneyPageCSS()}
${getScreenerPageCSS()}
${getStrategiesPageCSS()}
${getLtScreenerPageCSS()}
${getGexLlmPageCSS()}
${getGexVisorPageCSS()}
${getCommandCenterCSS()}
${getZeroDteCSS()}
${getLearnPageCSS()}
${getMarketStatePanelCSS()}
${getSwingPageCSS()}
${getTrinityPageCSS()}
${getEdgeBoardPageCSS()}
${getSnapbackPageCSS()}
${getCorridorCSS()}
/* ── Upgrade Modal — HUD ── */
.upgrade-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.upgrade-modal {
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: 4px;
  padding: 32px; max-width: 400px; width: 90%; text-align: center; backdrop-filter: blur(16px);
}
.upgrade-modal h3 { font-family: var(--font-heading); font-size: 20px; color: var(--accent); margin-bottom: 8px; letter-spacing: 2px; text-transform: uppercase; }
.upgrade-modal p { font-family: var(--font-body); font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5; }
.upgrade-modal .upgrade-cta {
  display: inline-block; padding: 10px 24px; background: rgba(251,191,36,0.15); color: var(--accent);
  border: 1px solid rgba(251,191,36,0.3); border-radius: 3px; font-weight: 700; font-size: 14px;
  text-decoration: none; font-family: var(--font-heading); letter-spacing: 1px; text-transform: uppercase;
  transition: all 0.15s;
}
.upgrade-modal .upgrade-cta:hover { background: rgba(251,191,36,0.25); }
html.light .upgrade-modal .upgrade-cta { background: rgba(217,119,6,0.1); color: var(--accent); border-color: rgba(217,119,6,0.3); }
.upgrade-modal .upgrade-dismiss {
  display: block; margin-top: 12px; color: var(--text-muted); font-size: 12px;
  cursor: pointer; font-family: var(--font-mono); background: none; border: none;
}
.upgrade-btn {
  display: block; margin: 8px 12px; padding: 8px 12px; text-align: center;
  background: rgba(251,191,36,0.12); color: var(--accent); border: 1px solid rgba(251,191,36,0.2);
  border-radius: 3px; font-weight: 700; font-size: 12px; font-family: var(--font-heading);
  text-decoration: none; transition: all 0.15s; letter-spacing: 1px; text-transform: uppercase;
}
.upgrade-btn:hover { background: rgba(251,191,36,0.2); }

/* ── Skeleton Loader ── */
@keyframes skeletonShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.skeleton {
  background: linear-gradient(90deg, rgba(251,191,36,0.03) 25%, rgba(251,191,36,0.08) 50%, rgba(251,191,36,0.03) 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
  color: transparent !important;
}

/* ── Confluence Widget — HUD ── */
.confluence-widget {
  margin: 8px 12px; padding: 10px 12px;
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: 3px;
  cursor: pointer; transition: border-color 0.15s; backdrop-filter: blur(8px);
}
.confluence-widget:hover { border-color: rgba(251,191,36,0.25); }
.confluence-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.confluence-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.confluence-dot.bullish { background: var(--green); box-shadow: 0 0 6px rgba(74,222,128,0.3); }
.confluence-dot.bearish { background: var(--red); box-shadow: 0 0 6px rgba(248,113,113,0.3); }
.confluence-dot.neutral { background: var(--accent); box-shadow: 0 0 6px rgba(251,191,36,0.3); }
.confluence-dir { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: var(--text); }
.confluence-score { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin-left: auto; }
.confluence-signals { display: flex; gap: 8px; }
.confluence-sig { display: flex; align-items: center; gap: 3px; font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); }
.confluence-sig-dot { width: 6px; height: 6px; border-radius: 50%; }
.confluence-sig-dot.bullish { background: var(--green); }
.confluence-sig-dot.bearish { background: var(--red); }
.confluence-sig-dot.neutral { background: var(--glass-border); }
/* Market Status Banner — HUD */
.market-status-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 20px; font-family: var(--font-mono); font-size: 11px;
  color: var(--text-muted); background: rgba(10,15,28,0.9);
  border-bottom: 1px solid var(--glass-border); border-left: 2px solid var(--glass-border);
  flex-shrink: 0; letter-spacing: 0.3px; backdrop-filter: blur(8px);
}
.market-status-bar.open { border-left-color: var(--green); }
.market-status-bar.premarket { border-left-color: var(--accent); }
.market-status-bar.closed, .market-status-bar.afterhours { border-left-color: var(--text-muted); }
.market-status-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: var(--text-muted);
}
.market-status-dot.open { background: var(--green, #22c55e); animation: msd-pulse 2s infinite; }
.market-status-dot.premarket { background: var(--yellow, #eab308); }
.market-status-dot.closed, .market-status-dot.afterhours { background: var(--text-muted); }
@keyframes msd-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.market-status-time { margin-left: auto; font-size: 10px; }

/* Data Freshness Timestamp */
.data-ts {
  font: 10px var(--font-mono);
  color: var(--text-muted);
  text-align: right;
  padding: 2px 0;
}
.data-ts.stale { color: var(--yellow, #eab308); }

/* ── Gamma Floating Chat — HUD ── */
.gamma-fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  width: 52px; height: 52px; border-radius: 4px; border: 1px solid var(--glass-border); cursor: pointer;
  background: var(--glass); backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(251,191,36,0.15);
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.gamma-fab:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(251,191,36,0.25); border-color: rgba(251,191,36,0.3); }
.gamma-fab.open { transform: scale(0.9); }
.gamma-fab svg { width: 26px; height: 26px; fill: var(--accent); }
.gamma-fab .gamma-close { display: none; font-size: 22px; color: var(--accent); line-height: 1; }
.gamma-fab.open svg { display: none; }
.gamma-fab.open .gamma-close { display: block; }

.gamma-chat {
  position: fixed; bottom: 88px; right: 24px; z-index: 9998;
  width: 380px; max-height: 500px; border-radius: 4px;
  background: var(--glass); border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4); backdrop-filter: blur(16px);
  display: none; flex-direction: column; overflow: hidden;
}
.gamma-chat.open { display: flex; }

.gamma-chat-header {
  padding: 14px 18px; border-bottom: 1px solid var(--glass-border);
  display: flex; align-items: center; gap: 10px;
  background: rgba(251,191,36,0.03);
}
.gamma-chat-avatar {
  width: 34px; height: 34px; border-radius: 3px;
  background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.gamma-chat-avatar svg { width: 18px; height: 18px; fill: var(--accent); }
.gamma-chat-name {
  font-family: var(--font-heading, 'DM Sans', sans-serif);
  font-size: 15px; font-weight: 700; color: var(--text);
}
.gamma-chat-status {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; color: var(--green, #22c55e); text-transform: uppercase;
}

.gamma-chat-messages {
  flex: 1; overflow-y: auto; padding: 16px; display: flex;
  flex-direction: column; gap: 10px; min-height: 200px; max-height: 340px;
}
.gamma-welcome {
  color: var(--text-muted); font-size: 13px; line-height: 1.5;
  padding: 20px 8px; text-align: center;
}
.gamma-welcome p { margin: 0 0 14px; }
.gamma-suggestions {
  display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
}
.gamma-chip {
  padding: 5px 10px; border-radius: 3px; border: 1px solid var(--glass-border);
  background: rgba(251,191,36,0.04); color: var(--text-secondary); font-size: 11px; cursor: pointer;
  font-family: var(--font-mono); letter-spacing: 0.3px;
  transition: border-color 0.15s, color 0.15s;
}
.gamma-chip:hover { border-color: rgba(251,191,36,0.3); color: var(--accent); }

.gamma-bubble {
  max-width: 85%; padding: 10px 14px; border-radius: 4px;
  font-size: 13px; line-height: 1.55; word-wrap: break-word;
  font-family: var(--font-body);
  animation: gammaFadeIn 0.2s ease;
}
@keyframes gammaFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

.gamma-bubble.user {
  align-self: flex-end; background: rgba(251,191,36,0.12); color: var(--text);
  border: 1px solid rgba(251,191,36,0.2);
}
.gamma-bubble.gamma {
  align-self: flex-start; background: rgba(34,211,238,0.06); color: var(--text);
  border: 1px solid var(--glass-border-cyan);
}
.gamma-bubble.thinking {
  align-self: flex-start; background: rgba(34,211,238,0.04); color: var(--text-muted);
  border: 1px solid var(--glass-border-cyan);
}
.gamma-bubble.thinking .gamma-dots { display: inline-flex; gap: 4px; }
.gamma-bubble.thinking .gamma-dots span {
  width: 5px; height: 5px; border-radius: 50%; background: var(--cyan);
  animation: gammaDotBounce 1.4s ease-in-out infinite;
}
.gamma-bubble.thinking .gamma-dots span:nth-child(2) { animation-delay: 0.2s; }
.gamma-bubble.thinking .gamma-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes gammaDotBounce {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-4px); }
}
/* Markdown in gamma bubbles */
.gamma-bubble.gamma strong, .gamma-bubble.gamma b { color: var(--accent); font-weight: 700; }
.gamma-bubble.gamma em, .gamma-bubble.gamma i { font-style: italic; color: var(--text-muted); }
.gamma-bubble.gamma code {
  background: rgba(251,191,36,0.08); padding: 1px 4px; border-radius: 2px;
  font-family: var(--font-mono); font-size: 12px; color: var(--accent);
}
.gamma-bubble.gamma ul, .gamma-bubble.gamma ol { margin: 4px 0; padding-left: 18px; }
.gamma-bubble.gamma li { margin: 2px 0; }
.gamma-bubble.gamma p { margin: 4px 0; }
.gamma-bubble.gamma p:first-child { margin-top: 0; }
.gamma-bubble.gamma p:last-child { margin-bottom: 0; }
/* Streaming cursor */
.gamma-cursor {
  display: inline-block; width: 2px; height: 14px; background: var(--accent);
  margin-left: 2px; vertical-align: text-bottom;
  animation: gammaCursorBlink 0.8s step-end infinite;
}
@keyframes gammaCursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.gamma-chat-input {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid var(--glass-border); background: rgba(10,15,28,0.9);
}
.gamma-chat-input input {
  flex: 1; padding: 8px 14px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border);
  border-radius: 3px; color: var(--text); font-size: 13px;
  font-family: var(--font-body);
  outline: none; transition: border-color 0.2s;
}
.gamma-chat-input input:focus { border-color: rgba(251,191,36,0.3); box-shadow: 0 0 8px rgba(251,191,36,0.1); }
.gamma-chat-input input::placeholder { color: var(--text-muted); }
.gamma-chat-input button {
  width: 36px; height: 36px; border-radius: 3px; border: 1px solid rgba(251,191,36,0.2); cursor: pointer;
  background: rgba(251,191,36,0.1); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.gamma-chat-input button:hover { background: rgba(251,191,36,0.2); }
.gamma-chat-input button:disabled { opacity: 0.3; cursor: not-allowed; }
.gamma-chat-input button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; }

@media (max-width: 768px) {
  .gamma-chat { width: calc(100vw - 32px); right: 16px; bottom: 80px; max-height: 60vh; }
  .gamma-fab { bottom: 16px; right: 16px; width: 46px; height: 46px; }
}

${getAlertsCSS()}
${getAlertsPageCSS()}
${getMobileOverrideCSS()}
</style>
</head>
<body>

<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Mobile Toggle -->
<button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Toggle menu">&#9776;</button>

<!-- Sidebar -->
<div class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <a href="https://sharkquant.ai"><img src="/assets/images/logo.png?v=4" alt="SharkQuant" style="width:64px;height:64px;margin-bottom:8px;cursor:pointer;"></a>
    <a href="https://sharkquant.ai" style="text-decoration:none;color:inherit;"><h1><span>SHARKQUANT&trade;</span></h1></a>
    <div class="subtitle">Trading Terminal</div>
    <div class="alert-bell" onclick="SQ.alerts.togglePanel()" title="Alerts">
      <i data-lucide="bell" style="width:20px;height:20px;color:var(--text-muted);"></i>
      <span class="alert-bell-badge" id="alert-bell-badge"></span>
    </div>
  </div>
  <div class="nav">
    <button class="nav-item active" data-page="command" onclick="nav('command')">
      <span class="icon"><i data-lucide="layout-dashboard" style="width:18px;height:18px;"></i></span> SharkCommand&trade;
    </button>
    <div class="nav-section">Overview</div>
    <button class="nav-item" data-page="briefing" onclick="nav('briefing')">
      <span class="icon"><i data-lucide="newspaper" style="width:18px;height:18px;"></i></span> SharkBrief&trade;
    </button>
    <button class="nav-item" data-page="alerts" onclick="nav('alerts')">
      <span class="icon"><i data-lucide="bell-ring" style="width:18px;height:18px;"></i></span> SharkAlerts&trade;
      <span class="nav-badge" id="navAlertBadge">0</span>
    </button>

    <div class="nav-section">Analysis</div>
    <button class="nav-item" data-page="gex" onclick="nav('gex')">
      <span class="icon"><i data-lucide="grid-3x3" style="width:18px;height:18px;"></i></span> SharkGrid&trade;
    </button>
    <button class="nav-item" data-page="gex-analytics" onclick="nav('gex-analytics')">
      <span class="icon"><i data-lucide="bar-chart-3" style="width:18px;height:18px;"></i></span> SharkAnalytics&trade;
    </button>
    <button class="nav-item" data-page="gex-visor" onclick="nav('gex-visor')">
      <span class="icon"><i data-lucide="eye" style="width:18px;height:18px;"></i></span> SharkVisor&trade;
    </button>
    <button class="nav-item" data-page="0dte" onclick="nav('0dte')">
      <span class="icon"><i data-lucide="timer" style="width:18px;height:18px;"></i></span> Shark0DTE&trade;
    </button>
    <button class="nav-item" data-page="snapback" onclick="nav('snapback')">
      <span class="icon"><i data-lucide="activity" style="width:18px;height:18px;"></i></span> SharkSnap&trade;
    </button>
    <button class="nav-item" data-page="corridor" onclick="nav('corridor')">
      <span class="icon"><i data-lucide="align-center-vertical" style="width:18px;height:18px;"></i></span> SharkCorridor&trade;
    </button>
    <button class="nav-item" data-page="pricechart" onclick="nav('pricechart')">
      <span class="icon"><i data-lucide="trending-up" style="width:18px;height:18px;"></i></span> SharkChart&trade;
    </button>
    <button class="nav-item" data-page="flow" onclick="nav('flow')">
      <span class="icon"><i data-lucide="activity" style="width:18px;height:18px;"></i></span> SharkFlow&trade;
    </button>
    <button class="nav-item" data-page="agents" onclick="nav('agents')">
      <span class="icon"><i data-lucide="brain" style="width:18px;height:18px;"></i></span> SharkMind&trade;
    </button>
    <button class="nav-item" data-page="gex-llm" onclick="nav('gex-llm')">
      <span class="icon"><i data-lucide="scan" style="width:18px;height:18px;"></i></span> SharkSense&trade;
    </button>
    <button class="nav-item" data-page="swing" onclick="nav('swing')">
      <span class="icon"><i data-lucide="calendar-range" style="width:18px;height:18px;"></i></span> SharkSwing&trade;
    </button>
    <button class="nav-item" data-page="trinity" onclick="nav('trinity')">
      <span class="icon"><i data-lucide="layers" style="width:18px;height:18px;"></i></span> SharkTrinity&trade;
    </button>
    <button class="nav-item" data-page="lt-screener" onclick="nav('lt-screener')">
      <span class="icon"><i data-lucide="filter" style="width:18px;height:18px;"></i></span> SharkScreen&trade;
    </button>
    <button class="nav-item" data-page="edge" onclick="nav('edge')">
      <span class="icon"><i data-lucide="zap" style="width:18px;height:18px;"></i></span> SharkEdge&trade;
    </button>

    <div class="nav-section">Research</div>
    <button class="nav-item" data-page="screener" onclick="nav('screener')">
      <span class="icon"><i data-lucide="search" style="width:18px;height:18px;"></i></span> SharkScan&trade;
    </button>
    <button class="nav-item" data-page="strategies" onclick="nav('strategies')">
      <span class="icon"><i data-lucide="book-open" style="width:18px;height:18px;"></i></span> SharkPlaybook&trade;
    </button>
    <button class="nav-item" data-page="intel" onclick="nav('intel')">
      <span class="icon"><i data-lucide="radar" style="width:18px;height:18px;"></i></span> SharkIntel&trade;
    </button>
    <button class="nav-item" data-page="smartmoney" onclick="nav('smartmoney')">
      <span class="icon"><i data-lucide="landmark" style="width:18px;height:18px;"></i></span> SharkMoney&trade;
    </button>
    <div class="nav-section">Education</div>
    <button class="nav-item" data-page="learn" onclick="nav('learn')">
      <span class="icon"><i data-lucide="graduation-cap" style="width:18px;height:18px;"></i></span> SharkLearn&trade;
    </button>
    <div class="nav-section">Admin</div>
    <button class="nav-item" data-page="admin" onclick="nav('admin')">
      <span class="icon"><i data-lucide="shield-check" style="width:18px;height:18px;"></i></span> Admin
    </button>
  </div>
    <div class="confluence-widget" onclick="nav('gex')" title="Market Confluence — SPY">
      <div class="confluence-top">
        <div class="confluence-dot neutral" id="confDot"></div>
        <div class="confluence-dir" id="confDir">&mdash;</div>
        <div class="confluence-score" id="confScore"></div>
      </div>
      <div class="confluence-signals">
        <div class="confluence-sig"><div class="confluence-sig-dot neutral" id="confSigGex"></div>GEX</div>
        <div class="confluence-sig"><div class="confluence-sig-dot neutral" id="confSigFlow"></div>Flow</div>
        <div class="confluence-sig"><div class="confluence-sig-dot neutral" id="confSigIv"></div>IV</div>
      </div>
    </div>
  <div class="sidebar-footer">
    <div class="status-row">
      <span class="status-indicator online" id="statusDot"></span>
      <span id="statusText">Connecting...</span>
      <span class="refresh-pulse" id="refreshPulse"></span>
      <button onclick="toggleTheme()" class="theme-toggle" title="Toggle theme" style="margin-left:auto;">
        <i data-lucide="moon" style="width:16px;height:16px;"></i>
      </button>
    </div>
    <div class="clock" id="liveClock"></div>
  </div>
</div>

<!-- Sidebar Overlay -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

<!-- Main Content -->
<div class="main" id="main-content">

  <!-- Market Status Banner -->
  <div class="market-status-bar" id="marketStatusBar">
    <span class="market-status-dot" id="marketStatusDot"></span>
    <span id="marketStatusText">Checking market status...</span>
    <span class="market-status-time" id="marketStatusTime"></span>
  </div>

  <!-- DAILY BRIEFING PAGE -->
  ${getBriefingPageHTML()}

  <!-- FLOW PAGE -->
  ${getFlowPageHTML()}

  <!-- AGENTS PAGE -->
  ${getAgentsPageHTML()}

  <!-- GEX PAGE -->
  ${getGexCombinedPageHTML()}
  <!-- GEX ANALYTICS PAGE -->
  ${getGexAnalyticsPageHTML()}
  ${getPriceChartPageHTML()}

  <!-- SCREENER PAGE -->
  ${getScreenerPageHTML()}
  ${getStrategiesPageHTML()}
  ${getLtScreenerPageHTML()}

  <!-- MARKET INTEL PAGE -->
  ${getIntelPageHTML()}

  <!-- GEX-LLM PAGE -->
  ${getGexLlmPageHTML()}

  <!-- SMART MONEY PAGE -->
  ${getSmartMoneyPageHTML()}

  <!-- ALERTS PAGE -->
  ${getAlertsPageHTML()}
  ${getGexVisorPageHTML()}

  <!-- COMMAND CENTER PAGE -->
  ${getCommandCenterHTML()}

  <!-- ZERO DTE PAGE -->
  ${getZeroDteHTML()}

  <!-- LEARN PAGE -->
  ${getLearnPageHTML()}

  <!-- SWING PAGE -->
  ${getSwingPageHTML()}

  <!-- TRINITY PAGE -->
  ${getTrinityPageHTML()}

  <!-- SNAPBACK SIGNALS PAGE -->
  ${getSnapbackPageHTML()}

  <!-- GAMMA CORRIDOR PAGE -->
  ${getCorridorHTML()}

  <!-- EDGE BOARD PAGE -->
  ${getEdgeBoardPageHTML()}

  <!-- ADMIN PAGE -->
  <div class="page" id="page-admin">
    <div class="page-header">
      <div><h2>Admin</h2><div class="subtitle">Users &amp; analytics</div></div>
    </div>
    <div style="padding:0 20px;">
      <div id="admin-tabs" style="display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:20px;">
        <button onclick="SQ.admin.showTab('users')" class="admin-tab active" data-tab="users" style="padding:10px 20px;background:none;border:none;border-bottom:2px solid var(--accent);margin-bottom:-2px;color:var(--text);font-family:var(--font-heading);font-size:14px;font-weight:600;cursor:pointer;">Users</button>
        <button onclick="SQ.admin.showTab('curves')" class="admin-tab" data-tab="curves" style="padding:10px 20px;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;color:var(--text-muted);font-family:var(--font-heading);font-size:14px;font-weight:600;cursor:pointer;">Equity Curves</button>
      </div>
      <div id="admin-content">
        <p style="color:var(--text-muted);">Loading...</p>
      </div>
    </div>
  </div>

</div>

<script>
// ── State ──
let currentPage = 'dashboard';
let refreshTimer = null;

// Shared Socket.IO connection
window.SQ = window.SQ || {};
SQ.socket = typeof io !== 'undefined' ? io({ path: '/ws', transports: ['websocket', 'polling'], reconnection: true, reconnectionDelay: 2000 }) : null;
if (SQ.socket) {
  SQ.socket.on('connect', function() {
    var dot = document.getElementById('statusDot');
    if (dot) { dot.className = 'status-indicator online'; dot.style.background = '#4ade80'; }
    var st = document.getElementById('statusText');
    if (st) { st.textContent = 'Connected'; st.style.color = '#22c55e'; }
  });
  SQ.socket.on('disconnect', function() {
    var dot = document.getElementById('statusDot');
    if (dot) { dot.className = 'status-indicator offline'; dot.style.background = '#eab308'; }
    var st = document.getElementById('statusText');
    if (st) { st.textContent = 'Reconnecting...'; st.style.color = '#eab308'; }
  });
}
if (SQ.alerts) SQ.alerts.init();

// Fetch user tier
SQ.userTier = 'loading';
SQ.isAdmin = false;
fetch('/api/me').then(function(r) { return r.json(); }).then(function(data) {
  console.log('[SQ] /api/me:', data);
  SQ.userTier = data.tier || 'none';
  SQ.isAdmin = !!data.isAdmin;
  console.log('[SQ] isAdmin:', SQ.isAdmin, 'tier:', SQ.userTier);
  applyTierUI();
}).catch(function(err) { console.error('[SQ] /api/me failed:', err); SQ.userTier = 'none'; applyTierUI(); });

function applyTierUI() {
  // Show/hide admin nav
  var adminNav = document.querySelector('[data-page="admin"]');
  if (adminNav) adminNav.style.display = SQ.isAdmin ? '' : 'none';
  // Also hide the Admin section label
  if (adminNav && adminNav.previousElementSibling && adminNav.previousElementSibling.classList.contains('nav-section')) {
    adminNav.previousElementSibling.style.display = SQ.isAdmin ? '' : 'none';
  }

  // Lock AI features for non-pro users
  if (SQ.userTier !== 'pro') {
    document.querySelectorAll('[data-page="agents"],[data-page="gex-llm"]').forEach(function(btn) {
      btn.setAttribute('data-locked', 'true');
      if (!btn.querySelector('[data-lucide="lock"]')) {
        var lock = document.createElement('i');
        lock.setAttribute('data-lucide', 'lock');
        lock.style.cssText = 'width:14px;height:14px;opacity:0.5;margin-left:4px';
        btn.appendChild(lock);
      }
    });
  }
  // Show upgrade button for non-pro users
  var footer = document.querySelector('.sidebar-footer');
  if (SQ.userTier === 'none') {
    // No subscription — show subscribe button
    if (footer && !document.getElementById('upgradeBtn')) {
      var btn = document.createElement('a');
      btn.id = 'upgradeBtn';
      btn.href = '/api/stripe/checkout?plan=core';
      btn.className = 'upgrade-btn';
      btn.textContent = 'Subscribe — $29.99/mo';
      footer.insertBefore(btn, footer.firstChild);
    }
  } else if (SQ.userTier === 'core') {
    // Core user — show upgrade to pro
    if (footer && !document.getElementById('upgradeBtn')) {
      var btn = document.createElement('a');
      btn.id = 'upgradeBtn';
      btn.href = '/api/stripe/checkout?plan=pro';
      btn.className = 'upgrade-btn';
      btn.textContent = 'Upgrade to Pro';
      footer.insertBefore(btn, footer.firstChild);
    }
  } else {
    // Pro user — remove upgrade button
    var existing = document.getElementById('upgradeBtn');
    if (existing) existing.remove();
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showUpgradeModal(msg, plan) {
  var existing = document.querySelector('.upgrade-modal-overlay');
  if (existing) existing.remove();
  var p = plan || 'pro';
  var overlay = document.createElement('div');
  overlay.className = 'upgrade-modal-overlay';
  overlay.innerHTML = '<div class="upgrade-modal" style="position:relative">'
    + '<button onclick="this.closest(&quot;.upgrade-modal-overlay&quot;).remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;color:var(--text-muted);font-size:20px;cursor:pointer;width:auto;padding:0;margin:0" aria-label="Close">&times;</button>'
    + '<h3>' + (p === 'core' ? 'Subscription Required' : 'Pro Feature') + '</h3>'
    + '<p>' + (msg || 'This feature requires a Pro subscription.') + '</p>'
    + '<a href="/api/stripe/checkout?plan=' + p + '" class="upgrade-cta">' + (p === 'core' ? 'Subscribe — $29.99/mo' : 'Upgrade to Pro — $49.99/mo') + '</a>'
    + '<button class="upgrade-dismiss" onclick="this.closest(&quot;.upgrade-modal-overlay&quot;).remove()">Maybe later</button>'
    + '</div>';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  function onEsc(e) { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); } }
  document.addEventListener('keydown', onEsc);
  document.body.appendChild(overlay);
}
// ── Confluence Widget ──
(function() {
  function fetchConfluence() {
    fetch('/api/metrics/SPY').then(function(r) { return r.json(); }).then(function(m) {
      if (!m || m.error || !m.confluence) return;
      var c = m.confluence;
      var cls = c.direction === 'BULLISH' ? 'bullish' : c.direction === 'BEARISH' ? 'bearish' : 'neutral';
      document.getElementById('confDot').className = 'confluence-dot ' + cls;
      var dirText = c.direction === 'BULLISH' ? 'Long \u03B3' : c.direction === 'BEARISH' ? 'Short \u03B3' : 'Trans.';
      document.getElementById('confDir').textContent = dirText;
      document.getElementById('confDir').style.color = cls === 'bullish' ? 'var(--green)' : cls === 'bearish' ? 'var(--red)' : 'var(--yellow)';
      document.getElementById('confScore').textContent = c.score.toFixed(2);
      ['gex', 'flow', 'iv'].forEach(function(k) {
        var sig = c.signals[k] || 'neutral';
        document.getElementById('confSig' + k.charAt(0).toUpperCase() + k.slice(1)).className = 'confluence-sig-dot ' + sig;
      });
    }).catch(function() {});
  }
  fetchConfluence();
  setInterval(fetchConfluence, 30000);
})();

// ── Market Status ──
SQ.marketStatus = 'unknown';
(function() {
  function updateMarketStatus() {
    fetch('/api/market/status').then(function(r) { return r.json(); }).then(function(d) {
      SQ.marketStatus = d.status;
      var bar = document.getElementById('marketStatusBar');
      if (bar) bar.className = 'market-status-bar ' + d.status;
      var dot = document.getElementById('marketStatusDot');
      if (dot) dot.className = 'market-status-dot ' + d.status;
      var txt = document.getElementById('marketStatusText');
      if (txt) txt.textContent = d.message;
    }).catch(function() {});
  }
  updateMarketStatus();
  setInterval(updateMarketStatus, 30000);
})();

// ── Live Clock ──
function updateClock() {
  const now = new Date();
  const el = document.getElementById('liveClock');
  if (el) el.textContent = now.toLocaleTimeString('en-US', { hour12: false }) + ' ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
updateClock();
setInterval(updateClock, 1000);

// ── Refresh Pulse ──
function pulseRefresh() {
  const el = document.getElementById('refreshPulse');
  if (!el) return;
  el.classList.remove('active');
  void el.offsetWidth;
  el.classList.add('active');
}

// ── Sidebar Toggle (mobile) ──
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Navigation ──
function nav(page) {
  // Redirect old heatmap hash to combined GEX page
  if (page === 'heatmap') page = 'gex';
  // Gate locked pages (skip gate while tier is still loading)
  if (SQ.userTier !== 'loading') {
    if (SQ.userTier === 'none') {
      showUpgradeModal('A subscription is required to access SharkQuant\u2122.', 'core');
      return;
    }
  }
  if (SQ.userTier !== 'pro' && SQ.userTier !== 'loading') {
    var proOnly = ['agents', 'gex-llm', 'lt-screener', 'gex-visor', 'swing', 'trinity', 'snapback'];
    if (proOnly.indexOf(page) !== -1) {
      showUpgradeModal('AI Agents and GEX Patterns require a Pro subscription.');
      return;
    }
  }

  // Destroy current page module
  if (SQ[currentPage] && SQ[currentPage].destroy) SQ[currentPage].destroy();

  currentPage = page;
  document.getElementById('sidebar').classList.remove('open');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  var pageEl = document.getElementById('page-' + page);
  var navEl = document.querySelector('[data-page="' + page + '"]');
  if (pageEl) pageEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  // Init new page module or load built-in page
  if (SQ[page] && SQ[page].init) {
    SQ[page].init();
  } else {
    loadPage(page);
  }

  // Re-render Lucide icons for new page content
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Update hash
  history.pushState(null, '', '#' + page);
}

function loadPage(page) {
}

// ── Session Persistence ──
SQ.persistSession = function(key, data) {
  try {
    localStorage.setItem('sq_session_' + key, JSON.stringify({
      data: data, timestamp: Date.now()
    }));
  } catch(e) {}
};
SQ.getLastSession = function(key) {
  try {
    var raw = localStorage.getItem('sq_session_' + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) { return null; }
};

// ── API Helper ──
async function api(path) {
  try {
    const r = await fetch(path);
    return await r.json();
  } catch (err) {
    return { error: err.message };
  }
}

// ── Centralized Fetch ──
SQ.fetch = async function(url, opts) {
  try {
    var r = await fetch(url, opts);
    if (!r.ok) {
      var msg = 'Request failed (' + r.status + ')';
      try { var d = await r.json(); msg = d.error || msg; } catch(e) {}
      SQ.toast(msg, 'error');
      return null;
    }
    return r;
  } catch(err) {
    SQ.toast('Network error: ' + err.message, 'error');
    return null;
  }
};
SQ.toast = function(msg, type) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;padding:12px 20px;border-radius:8px;font-size:13px;font-family:var(--font-body);color:#fff;background:' + (type === 'error' ? 'var(--red)' : 'var(--accent)') + ';box-shadow:0 4px 20px rgba(0,0,0,0.3);opacity:0;transition:opacity .3s';
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.style.opacity = '1'; });
  setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 300); }, 4000);
};


// ── Helpers ──
function card(label, value, colorClass, sub) {
  return '<div class="card"><div class="label">' + label + '</div><div class="value ' + (colorClass || '') + '">' + value + '</div>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>';
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function refreshAll() { loadPage(currentPage); pulseRefresh(); }

// ── Theme Toggle ──
function toggleTheme() {
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  localStorage.setItem('sq-theme', isLight ? 'light' : 'dark');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
if (localStorage.getItem('sq-theme') === 'light') {
  document.documentElement.classList.add('light');
}

// ── Init ──
// Dashboard page uses SQ.dashboard module — init via nav()
if (typeof lucide !== 'undefined') lucide.createIcons();
setTimeout(function() { nav('command'); }, 50);
refreshTimer = setInterval(() => { pulseRefresh(); }, 30000);

// Hash routing
window.addEventListener('popstate', function() {
  var hash = location.hash.slice(1);
  if (['home','positions','portfolio','dashboard','shark','trading'].indexOf(hash) !== -1) hash = 'command';
  if (hash) nav(hash);
});

// Check initial hash (support legacy #home and #positions → #dashboard)
(function() {
  var hash = location.hash.slice(1);
  if (['home','positions','portfolio','dashboard','shark','trading'].indexOf(hash) !== -1) hash = 'command';
  if (hash && hash !== 'command') {
    setTimeout(function() { nav(hash); }, 100);
  }
})();
</script>

<script>
${getFlowPageJS()}
/* visual-cards-v2 */ ${getBriefingPageJS()}
${getAgentsPageJS()}
${getGexCombinedPageJS()}
${getGexAnalyticsPageJS()}
${getPriceChartPageJS()}
${getIntelPageJS()}
${getScreenerPageJS()}
${getStrategiesPageJS()}
${getLtScreenerPageJS()}
${getGexLlmPageJS()}
${getSmartMoneyPageJS()}
${getAlertsPageJS()}
${getGexVisorPageJS()}
${getCommandCenterJS()}
${getZeroDteJS()}
${getLearnPageJS()}
${getMarketStatePanelJS()}
${getSwingPageJS()}
${getTrinityPageJS()}
${getEdgeBoardPageJS()}
${getSnapbackPageJS()}
${getCorridorJS()}

// ── ADMIN USERS PAGE ──
;(function() {
  var _tab = 'users';
  var _curvesCache = null;

  SQ.admin = {
    async init() {
      this._updateTabStyles();
      if (_tab === 'users') await this._initUsers();
      else if (_tab === 'curves') await this._initCurves();
    },

    showTab: function(tab) {
      _tab = tab;
      this._updateTabStyles();
      if (tab === 'users') this._initUsers();
      else if (tab === 'curves') this._initCurves();
    },

    _updateTabStyles: function() {
      var tabs = document.querySelectorAll('#admin-tabs .admin-tab');
      tabs.forEach(function(btn) {
        var isActive = btn.getAttribute('data-tab') === _tab;
        btn.style.borderBottomColor = isActive ? 'var(--accent)' : 'transparent';
        btn.style.color = isActive ? 'var(--text)' : 'var(--text-muted)';
      });
    },

    // ── Users Tab ──────────────────────────────────────────────────
    async _initUsers() {
      var el = document.getElementById('admin-content');
      el.innerHTML = '<p style="color:var(--text-muted);">Loading...</p>';

      var users = [], waitlist = [];
      try {
        var [aRes, wRes] = await Promise.all([
          fetch('/api/approved-users'),
          fetch('/api/waitlist')
        ]);
        if (!aRes.ok) {
          if (aRes.status === 403) el.innerHTML = '<p style="color:var(--red);">Admin access required.</p>';
          else if (aRes.status === 401) el.innerHTML = '<p style="color:var(--red);">Session expired. Please log in again.</p>';
          else el.innerHTML = '<p style="color:var(--red);">Error loading users (HTTP ' + aRes.status + ').</p>';
          return;
        }
        var aData = await aRes.json();
        var wData = wRes.ok ? await wRes.json() : { entries: [] };
        users = aData.users || [];
        waitlist = wData.entries || [];
      } catch(err) { el.innerHTML = '<p style="color:var(--red);">Failed to load.</p>'; return; }

      var total = users.length;
      var active = users.filter(function(u) { return u.status === 'approved'; }).length;
      var pro = users.filter(function(u) { return u.tier === 'pro'; }).length;
      var core = users.filter(function(u) { return u.tier === 'core'; }).length;
      var pending = waitlist.length;

      var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;">';
      html += SQ.admin._statCard('Total Users', total, 'var(--text)');
      html += SQ.admin._statCard('Active', active, 'var(--green)');
      html += SQ.admin._statCard('Pro', pro, 'var(--accent)');
      html += SQ.admin._statCard('Core', core, 'var(--text-secondary)');
      html += SQ.admin._statCard('Waitlist', pending, 'var(--yellow)');
      html += '</div>';

      html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:24px;">';
      html += '<input id="admin-add-email" type="email" placeholder="email@example.com" style="flex:1;max-width:320px;padding:8px 12px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:6px;font-family:var(--font-mono);font-size:0.85rem;" />';
      html += '<select id="admin-add-tier" style="padding:8px 12px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:6px;font-size:0.85rem;cursor:pointer;"><option value="core">core</option><option value="pro">pro</option></select>';
      html += '<button onclick="SQ.admin.addUser()" style="padding:8px 16px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600;white-space:nowrap;">+ Add User</button>';
      html += '</div>';

      html += '<h3 style="color:var(--text);font-family:var(--font-heading);font-size:16px;margin-bottom:12px;">Subscribers</h3>';
      if (users.length === 0) {
        html += '<p style="color:var(--text-muted);">No subscribers yet.</p>';
      } else {
        html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
        html += '<thead><tr>';
        ['Email','Tier','Status','Stripe','Last Login','Actions'].forEach(function(h) {
          html += '<th style="text-align:left;padding:10px 12px;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';

        users.sort(function(a,b) { return (b.approvedAt||'').localeCompare(a.approvedAt||''); });
        users.forEach(function(u) {
          var tierColor = u.tier === 'pro' ? 'var(--accent)' : u.tier === 'core' ? 'var(--green)' : 'var(--text-muted)';
          var statusColor = u.status === 'approved' ? 'var(--green)' : u.status === 'revoked' ? 'var(--red)' : 'var(--text-muted)';
          var lastLogin = u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() + ' ' + new Date(u.lastLogin).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'Never';
          var hasStripe = u.stripeCustomerId ? 'Yes' : 'No';

          html += '<tr style="border-bottom:1px solid var(--border);">';
          html += '<td style="padding:10px 12px;font-family:var(--font-mono);font-size:0.8rem;">' + u.email + '</td>';
          html += '<td style="padding:10px 12px;"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;background:' + tierColor + '20;color:' + tierColor + ';">' + (u.tier || 'none') + '</span></td>';
          html += '<td style="padding:10px 12px;color:' + statusColor + ';font-weight:500;">' + u.status + '</td>';
          html += '<td style="padding:10px 12px;color:var(--text-muted);">' + hasStripe + '</td>';
          html += '<td style="padding:10px 12px;color:var(--text-muted);font-family:var(--font-mono);font-size:0.8rem;">' + lastLogin + '</td>';
          html += '<td style="padding:10px 12px;">';

          html += '<select onchange="SQ.admin.setTier(\\'' + u.email + '\\', this.value)" style="padding:4px 8px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:4px;font-size:0.8rem;cursor:pointer;margin-right:6px;">';
          ['none','core','pro'].forEach(function(t) {
            html += '<option value="' + t + '"' + ((u.tier||'none') === t ? ' selected' : '') + '>' + t + '</option>';
          });
          html += '</select>';

          if (u.status === 'approved') {
            html += '<button onclick="SQ.admin.revoke(\\'' + u.email + '\\')" style="padding:4px 10px;background:var(--border);color:var(--text-muted);border:none;border-radius:4px;cursor:pointer;font-size:0.75rem;">Revoke</button>';
          } else {
            html += '<button onclick="SQ.admin.approve(\\'' + u.email + '\\')" style="padding:4px 10px;background:var(--accent);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem;">Approve</button>';
          }
          html += '</td></tr>';
        });
        html += '</tbody></table></div>';
      }

      if (waitlist.length > 0) {
        html += '<h3 style="color:var(--text);font-family:var(--font-heading);font-size:16px;margin:24px 0 12px;">Waitlist</h3>';
        html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
        html += '<thead><tr>';
        ['Email','Date','Action'].forEach(function(h) {
          html += '<th style="text-align:left;padding:10px 12px;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';

        var approvedEmails = {};
        users.forEach(function(u) { approvedEmails[u.email] = true; });
        waitlist.forEach(function(e) {
          var already = approvedEmails[e.email];
          html += '<tr style="border-bottom:1px solid var(--border);">';
          html += '<td style="padding:10px 12px;font-family:var(--font-mono);font-size:0.8rem;">' + e.email + '</td>';
          html += '<td style="padding:10px 12px;color:var(--text-muted);font-family:var(--font-mono);font-size:0.8rem;">' + new Date(e.date).toLocaleDateString() + '</td>';
          html += '<td style="padding:10px 12px;">';
          if (already) {
            html += '<span style="color:var(--green);font-size:0.8rem;">Already approved</span>';
          } else {
            html += '<button onclick="SQ.admin.approve(\\'' + e.email + '\\')" style="padding:4px 10px;background:var(--accent);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem;">Approve</button>';
          }
          html += '</td></tr>';
        });
        html += '</tbody></table></div>';
      }

      el.innerHTML = html;
    },

    // ── Equity Curves Tab ──────────────────────────────────────────
    async _initCurves() {
      var el = document.getElementById('admin-content');
      el.innerHTML = '<p style="color:var(--text-muted);">Loading equity curves...</p>';

      if (!_curvesCache) {
        try {
          var res = await fetch('/api/backtest/equity-curves');
          if (!res.ok) {
            el.innerHTML = '<p style="color:var(--red);">Failed to load curves (HTTP ' + res.status + ').</p>';
            return;
          }
          _curvesCache = await res.json();
        } catch(err) {
          el.innerHTML = '<p style="color:var(--red);">Error: ' + err.message + '</p>';
          return;
        }
      }

      var data = _curvesCache;
      if (data.error) {
        el.innerHTML = '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center;">'
          + '<p style="color:var(--text-muted);font-size:14px;margin-bottom:16px;">' + data.error + '</p>'
          + '<button onclick="SQ.admin._generateCurves()" id="ec-gen-btn" style="padding:10px 24px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">Generate Equity Curves</button>'
          + '</div>';
        return;
      }

      // Separate equity curves from regime accuracy
      var curveKeys = Object.keys(data).filter(function(k) { return data[k].equityCurve; });
      var regimeKeys = Object.keys(data).filter(function(k) { return data[k].regimeStats; });

      var html = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:20px;">'
        + '<button onclick="SQ.admin._refreshCurves()" style="padding:6px 14px;background:var(--bg-surface);color:var(--text-muted);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:0.8rem;">Refresh</button>'
        + '<button onclick="SQ.admin._generateCurves()" id="ec-gen-btn" style="padding:6px 14px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">Generate</button>'
        + (curveKeys.length ? '<span style="color:var(--text-muted);font-size:0.8rem;">' + curveKeys.length + ' curves loaded</span>' : '')
        + '</div>';

      // Render each equity curve
      curveKeys.forEach(function(key, idx) {
        var curve = data[key];
        var label = curve.ticker + ' ' + curve.type.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
        var colors = ['#3B82F6', '#22C55E', '#EAB308', '#A855F7'];
        var color = colors[idx % colors.length];

        html += '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px;">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">';
        html += '<h3 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--text);margin:0;">' + label + '</h3>';
        html += '<div style="display:flex;gap:16px;flex-wrap:wrap;">';

        // Adaptive stats based on data type
        if (curve.tier) {
          // Snapback tier backtest
          html += SQ.admin._curveStat('Tier', curve.tier, curve.tier === 'A+' ? '#22C55E' : curve.tier === 'A' ? '#3B82F6' : '#EAB308');
          html += SQ.admin._curveStat('Trades', curve.totalTrades);
          html += SQ.admin._curveStat('Win', curve.winRate + '%', curve.winRate >= 50 ? '#22C55E' : '#EAB308');
          html += SQ.admin._curveStat('PF', curve.profitFactor, curve.profitFactor >= 1.2 ? '#22C55E' : '#EAB308');
          html += SQ.admin._curveStat('Max DD', curve.maxDrawdown + 'bp', '#EF4444');
          html += SQ.admin._curveStat('Final', (curve.finalEquityBps >= 0 ? '+' : '') + curve.finalEquityBps + 'bp', curve.finalEquityBps >= 0 ? '#22C55E' : '#EF4444');
          if (curve.densityThreshold) html += SQ.admin._curveStat('Density P', curve.densityThreshold);
          if (curve.trainStats && curve.testStats) {
            html += SQ.admin._curveStat('IS PF', curve.trainStats.profitFactor, curve.trainStats.profitFactor >= 1.2 ? '#22C55E' : '#EAB308');
            html += SQ.admin._curveStat('OOS PF', curve.testStats.profitFactor, curve.testStats.profitFactor >= 1.0 ? '#22C55E' : '#EF4444');
            html += SQ.admin._curveStat('OOS Win', curve.testStats.winRate + '%', curve.testStats.winRate >= 50 ? '#22C55E' : '#EF4444');
          }
        } else if (curve.correlation !== undefined) {
          // Expansion engine view
          html += SQ.admin._curveStat('Days', curve.totalDays);
          html += SQ.admin._curveStat('r', curve.correlation, curve.correlation > 0.2 ? '#22C55E' : '#EAB308');
          html += SQ.admin._curveStat('Avg |Move|', curve.avgAbsReturn + 'bp');
        } else if (curve.totalTrades) {
          // Trade-based curve (fallback)
          html += SQ.admin._curveStat('Trades', curve.totalTrades);
          html += SQ.admin._curveStat('Win Rate', curve.winRate + '%', curve.winRate >= 50 ? '#22C55E' : '#EAB308');
          html += SQ.admin._curveStat('PF', curve.profitFactor, curve.profitFactor >= 1.2 ? '#22C55E' : '#EAB308');
          html += SQ.admin._curveStat('Max DD', curve.maxDrawdown + 'bp', '#EF4444');
          html += SQ.admin._curveStat('Final', (curve.finalEquityBps >= 0 ? '+' : '') + curve.finalEquityBps + 'bp', curve.finalEquityBps >= 0 ? '#22C55E' : '#EF4444');
        }
        html += '</div></div>';

        // Snapback note
        if (curve.note) {
          html += '<p style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);margin-bottom:12px;">' + curve.note + '</p>';
        }
        // Date range
        if (curve.dateRange) {
          html += '<p style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);margin-bottom:12px;">Range: ' + curve.dateRange + '</p>';
        }

        // Slippage sensitivity table
        if (curve.slippageStats) {
          html += '<div style="margin-bottom:14px;">';
          html += '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Slippage Sensitivity (round-trip bps)</div>';
          html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">';
          html += '<thead><tr>';
          ['Slippage','PF','Win%','Final (bp)','Max DD (bp)'].forEach(function(h) {
            html += '<th style="text-align:right;padding:6px 10px;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.04em;">' + h + '</th>';
          });
          html += '</tr></thead><tbody>';
          [0, 1, 2, 3].forEach(function(bps) {
            var s = curve.slippageStats[bps];
            if (!s) return;
            var label = bps === 0 ? 'Base' : '+' + bps + 'bp';
            var pfColor = s.profitFactor >= 1.2 ? '#22C55E' : s.profitFactor >= 1.0 ? '#EAB308' : '#EF4444';
            html += '<tr style="border-bottom:1px solid var(--border);">';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);font-weight:600;">' + label + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);font-weight:700;color:' + pfColor + ';">' + s.profitFactor + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);">' + s.winRate + '%</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);color:' + (s.finalEquityBps >= 0 ? '#22C55E' : '#EF4444') + ';">' + (s.finalEquityBps >= 0 ? '+' : '') + s.finalEquityBps + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);color:#EF4444;">' + s.maxDrawdown + '</td>';
            html += '</tr>';
          });
          html += '</tbody></table></div></div>';
        }

        // Canvas for equity curve chart
        html += '<canvas id="ec-canvas-' + idx + '" width="900" height="260" style="width:100%;height:260px;border-radius:8px;background:var(--bg);"></canvas>';

        // Monthly P&L heatmap
        if (curve.monthlyPnl && Object.keys(curve.monthlyPnl).length > 0) {
          html += '<div style="margin-top:14px;">';
          html += '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Monthly P&L (bps)</div>';
          html += '<div style="display:flex;flex-wrap:wrap;gap:4px;">';
          var months = Object.keys(curve.monthlyPnl).sort();
          months.forEach(function(m) {
            var bps = Math.round(curve.monthlyPnl[m] * 10000);
            var bg = bps > 0 ? 'rgba(34,197,94,' + Math.min(Math.abs(bps) / 200, 1) * 0.6 + ')' : 'rgba(239,68,68,' + Math.min(Math.abs(bps) / 200, 1) * 0.6 + ')';
            html += '<div title="' + m + ': ' + (bps >= 0 ? '+' : '') + bps + 'bp" style="width:40px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:3px;background:' + bg + ';font-family:var(--font-mono);font-size:9px;color:var(--text);cursor:default;">' + (bps >= 0 ? '+' : '') + bps + '</div>';
          });
          html += '</div></div>';
        }

        // Decile table for expansion engine
        if (curve.deciles && curve.deciles.length) {
          html += '<div style="margin-top:14px;">';
          html += '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Expansion Score Deciles</div>';
          html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">';
          html += '<thead><tr>';
          ['Decile','N','Avg |Move| bp','P(>0.5%)','P(>1.0%)'].forEach(function(h) {
            html += '<th style="text-align:right;padding:6px 10px;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;">' + h + '</th>';
          });
          html += '</tr></thead><tbody>';
          curve.deciles.forEach(function(d) {
            var moveColor = d.avgMove > 60 ? '#22C55E' : d.avgMove > 40 ? '#EAB308' : 'var(--text-muted)';
            html += '<tr style="border-bottom:1px solid var(--border);">';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);">D' + d.decile + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;color:var(--text-muted);">' + d.n + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);font-weight:600;color:' + moveColor + ';">' + d.avgMove + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);">' + d.hit050 + '%</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);">' + d.hit100 + '%</td>';
            html += '</tr>';
          });
          html += '</tbody></table></div></div>';
        }

        html += '</div>';
      });

      // Regime accuracy section
      regimeKeys.forEach(function(key) {
        var rd = data[key];
        html += '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px;">';
        html += '<h3 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--text);margin:0 0 14px;">' + rd.ticker + ' Regime Accuracy (' + (rd.totalDays || '?') + ' days)</h3>';
        html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
        html += '<thead><tr>';
        ['Regime','Count','%','Avg Move','<0.3%','>0.5%','>1.0%','Accuracy'].forEach(function(h) {
          html += '<th style="text-align:right;padding:8px 10px;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        var totalCount = Object.values(rd.regimeStats).reduce(function(s, r) { return s + r.count; }, 0);
        Object.keys(rd.regimeStats).sort().forEach(function(regime) {
          var s = rd.regimeStats[regime];
          var avgMove = s.moves.length ? (s.moves.reduce(function(a,b){return a+b;},0) / s.moves.length * 100).toFixed(2) : '0';
          var pctDays = totalCount > 0 ? Math.round(s.count / totalCount * 1000) / 10 : 0;
          var acc = s.count > 0 ? Math.round(s.correct / s.count * 100) : 0;
          var accColor = acc >= 60 ? '#22C55E' : acc >= 40 ? '#EAB308' : '#EF4444';
          var accDisplay, accStyle;
          if (s.unscored) {
            accDisplay = 'N/A';
            accStyle = 'color:var(--text-muted);font-style:italic;';
          } else if (s.count < 20) {
            accDisplay = acc + '% <span style="font-size:0.65rem;color:var(--text-muted);">(n=' + s.count + ')</span>';
            accStyle = 'color:var(--text-muted);';
          } else {
            accDisplay = acc + '%';
            accStyle = 'color:' + accColor + ';';
          }
          var countStyle = s.count < 20 ? 'color:#EAB308;font-weight:700;' : '';
          html += '<tr style="border-bottom:1px solid var(--border);">';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;font-weight:600;text-align:right;">' + regime + '</td>';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;text-align:right;' + countStyle + '">' + s.count + '</td>';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;text-align:right;color:var(--text-muted);">' + pctDays + '%</td>';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;text-align:right;">' + avgMove + '%</td>';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;text-align:right;">' + (s.pctLt030 || 0) + '%</td>';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;text-align:right;">' + (s.pctGt050 || 0) + '%</td>';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;text-align:right;">' + (s.pctGt100 || 0) + '%</td>';
          html += '<td style="padding:8px 10px;font-family:var(--font-mono);font-size:0.8rem;font-weight:600;text-align:right;' + accStyle + '">' + accDisplay + '</td>';
          html += '</tr>';
        });
        html += '</tbody></table></div></div>';
      });

      // ── Robustness Summary Panel ──
      if (data._robustness) {
        var rob = data._robustness;
        html += '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px;">';
        html += '<h3 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--text);margin:0 0 14px;">Robustness Summary</h3>';
        ['QQQ', 'SPY'].forEach(function(rticker) {
          if (!rob[rticker] || !rob[rticker].tiers) return;
          html += '<div style="margin-bottom:16px;">';
          html += '<div style="font-family:var(--font-mono);font-size:12px;color:var(--accent);font-weight:700;margin-bottom:8px;">' + rticker + '</div>';
          html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;margin-bottom:12px;">';
          html += '<thead><tr>';
          ['Tier','Full PF','IS PF','OOS PF','PF @0bp','PF @1bp','PF @2bp','PF @3bp'].forEach(function(h) {
            html += '<th style="text-align:right;padding:6px 10px;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.04em;">' + h + '</th>';
          });
          html += '</tr></thead><tbody>';
          ['A+', 'A', 'B'].forEach(function(tier) {
            var t = rob[rticker].tiers[tier];
            if (!t) return;
            var pfCol = function(v) { return v === null ? 'var(--text-muted)' : v >= 1.2 ? '#22C55E' : v >= 1.0 ? '#EAB308' : '#EF4444'; };
            var fmt = function(v) { return v === null ? 'N/A' : v; };
            html += '<tr style="border-bottom:1px solid var(--border);">';
            html += '<td style="padding:6px 10px;text-align:right;font-weight:700;font-family:var(--font-mono);">' + tier + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);color:' + pfCol(t.fullPF) + ';">' + fmt(t.fullPF) + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);color:' + pfCol(t.inSamplePF) + ';">' + fmt(t.inSamplePF) + '</td>';
            html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);font-weight:700;color:' + pfCol(t.outOfSamplePF) + ';">' + fmt(t.outOfSamplePF) + '</td>';
            if (t.slippagePF) {
              [0,1,2,3].forEach(function(b) {
                html += '<td style="padding:6px 10px;text-align:right;font-family:var(--font-mono);color:' + pfCol(t.slippagePF[b]) + ';">' + fmt(t.slippagePF[b]) + '</td>';
              });
            } else {
              html += '<td colspan="4" style="padding:6px 10px;text-align:center;color:var(--text-muted);">N/A</td>';
            }
            html += '</tr>';
          });
          html += '</tbody></table></div>';
          // Regime sample counts
          if (rob[rticker].regimeCounts) {
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
            Object.keys(rob[rticker].regimeCounts).sort().forEach(function(rName) {
              var rCount = rob[rticker].regimeCounts[rName];
              var cColor = rCount < 20 ? '#EAB308' : 'var(--text)';
              html += '<div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 12px;">'
                + '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;">' + rName + '</span> '
                + '<span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:' + cColor + ';">' + rCount + '</span></div>';
            });
            html += '</div>';
          }
          html += '</div>';
        });
        html += '</div>';
      }

      if (curveKeys.length === 0 && regimeKeys.length === 0) {
        html += '<p style="color:var(--text-muted);">No curve data found.</p>';
      }

      el.innerHTML = html;

      // Draw charts after DOM update
      curveKeys.forEach(function(key, idx) {
        var curve = data[key];
        if (curve.equityCurve && curve.equityCurve.length > 1) {
          var colors = ['#3B82F6', '#22C55E', '#EAB308', '#A855F7'];
          SQ.admin._drawEquityChart('ec-canvas-' + idx, curve.equityCurve, colors[idx % colors.length], curve.oosSplit || null);
        }
      });
    },

    _drawEquityChart: function(canvasId, points, color, splitDate) {
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;
      var dpr = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      var W = rect.width, H = rect.height;
      var pad = { top: 20, right: 20, bottom: 36, left: 60 };
      var cW = W - pad.left - pad.right;
      var cH = H - pad.top - pad.bottom;

      var vals = points.map(function(p) { return p.equity; });
      var minV = Math.min.apply(null, vals);
      var maxV = Math.max.apply(null, vals);
      if (minV === maxV) { minV -= 0.001; maxV += 0.001; }
      var range = maxV - minV;
      minV -= range * 0.05;
      maxV += range * 0.05;

      // Grid lines
      ctx.strokeStyle = 'rgba(100,116,139,0.15)';
      ctx.lineWidth = 1;
      var gridN = 5;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'right';
      for (var g = 0; g <= gridN; g++) {
        var gy = pad.top + (cH / gridN) * g;
        ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
        var gv = maxV - (maxV - minV) * (g / gridN);
        ctx.fillText((gv * 10000).toFixed(0) + 'bp', pad.left - 8, gy + 4);
      }

      // Date labels
      ctx.textAlign = 'center';
      var labelN = Math.min(6, points.length);
      for (var l = 0; l < labelN; l++) {
        var li = Math.round(l * (points.length - 1) / (labelN - 1));
        var lx = pad.left + (li / (points.length - 1)) * cW;
        ctx.fillText(points[li].date.slice(0, 7), lx, H - pad.bottom + 18);
      }

      // Zero line
      if (minV < 0 && maxV > 0) {
        var zy = pad.top + ((maxV - 0) / (maxV - minV)) * cH;
        ctx.strokeStyle = 'rgba(148,163,184,0.3)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(pad.left, zy); ctx.lineTo(W - pad.right, zy); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Area fill
      ctx.beginPath();
      var baseY = pad.top + ((maxV - 0) / (maxV - minV)) * cH;
      if (baseY < pad.top) baseY = pad.top + cH;
      if (baseY > pad.top + cH) baseY = pad.top + cH;
      ctx.moveTo(pad.left, baseY);
      for (var i = 0; i < points.length; i++) {
        var x = pad.left + (i / (points.length - 1)) * cW;
        var y = pad.top + ((maxV - points[i].equity) / (maxV - minV)) * cH;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(pad.left + cW, baseY);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
      grad.addColorStop(0, color + '30');
      grad.addColorStop(1, color + '05');
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      for (var i = 0; i < points.length; i++) {
        var x = pad.left + (i / (points.length - 1)) * cW;
        var y = pad.top + ((maxV - points[i].equity) / (maxV - minV)) * cH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // End dot
      var lastX = pad.left + cW;
      var lastY = pad.top + ((maxV - points[points.length - 1].equity) / (maxV - minV)) * cH;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // OOS split vertical divider
      if (splitDate && points.length > 2) {
        var splitIdx = -1;
        for (var si = 0; si < points.length; si++) {
          if (points[si].date >= splitDate) { splitIdx = si; break; }
        }
        if (splitIdx > 0 && splitIdx < points.length - 1) {
          var sx = pad.left + (splitIdx / (points.length - 1)) * cW;
          ctx.save();
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(sx, pad.top);
          ctx.lineTo(sx, pad.top + cH);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = '#94A3B8';
          ctx.textAlign = 'right';
          ctx.fillText('IN-SAMPLE', sx - 6, pad.top + 14);
          ctx.textAlign = 'left';
          ctx.fillText('OUT-OF-SAMPLE', sx + 6, pad.top + 14);
          ctx.restore();
        }
      }
    },

    _curveStat: function(label, value, color) {
      return '<div style="text-align:center;">'
        + '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">' + label + '</div>'
        + '<div style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:' + (color || 'var(--text)') + ';">' + value + '</div>'
        + '</div>';
    },

    _refreshCurves: function() {
      _curvesCache = null;
      this._initCurves();
    },

    _generateCurves: async function() {
      var btn = document.getElementById('ec-gen-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Running backtests...'; }
      try {
        var res = await fetch('/api/backtest/equity-curves/generate', { method: 'POST' });
        var data = await res.json();
        if (data.ok) {
          // Poll for completion
          this._pollCurves();
        } else {
          alert('Generation failed: ' + (data.error || 'Unknown error'));
          if (btn) { btn.disabled = false; btn.textContent = 'Generate'; }
        }
      } catch(err) {
        alert('Error: ' + err.message);
        if (btn) { btn.disabled = false; btn.textContent = 'Generate'; }
      }
    },

    _pollCurves: function() {
      var self = this;
      var el = document.getElementById('admin-content');
      var pollId = setInterval(async function() {
        try {
          var res = await fetch('/api/backtest/equity-curves');
          var data = await res.json();
          if (data.status === 'running') {
            // Show progress
            var logHtml = data.log && data.log.length ? data.log.slice(-8).map(function(l) {
              return '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);padding:2px 0;">' + l + '</div>';
            }).join('') : '';
            if (el) el.innerHTML = '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center;">'
              + '<div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:12px;">Running backtests...</div>'
              + '<div style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">Processing 500K+ bars across 39 months. This takes a few minutes.</div>'
              + '<div style="text-align:left;max-width:600px;margin:0 auto;">' + logHtml + '</div>'
              + '</div>';
          } else if (data.error) {
            clearInterval(pollId);
            var btn = document.getElementById('ec-gen-btn');
            if (btn) { btn.disabled = false; btn.textContent = 'Generate'; }
            if (el) el.innerHTML = '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center;">'
              + '<p style="color:var(--red);font-size:14px;">' + data.error + '</p>'
              + '<button onclick="SQ.admin._generateCurves()" id="ec-gen-btn" style="margin-top:16px;padding:10px 24px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">Retry</button>'
              + '</div>';
          } else {
            // Done — has curve data
            clearInterval(pollId);
            _curvesCache = null;
            self._initCurves();
          }
        } catch(e) { /* keep polling */ }
      }, 5000);
    },

    _statCard: function(label, value, color) {
      return '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;padding:16px 20px;">'
        + '<div style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">' + label + '</div>'
        + '<div style="font-family:var(--font-mono);font-size:24px;font-weight:600;color:' + color + ';">' + value + '</div>'
        + '</div>';
    },
    async setTier(email, tier) {
      await fetch('/api/admin/set-tier', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email,tier:tier}) });
      this._initUsers();
    },
    async addUser() {
      var email = document.getElementById('admin-add-email').value.trim().toLowerCase();
      if (!email || !email.includes('@')) return alert('Enter a valid email');
      var tier = document.getElementById('admin-add-tier').value;
      await fetch('/api/waitlist/approve', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email}) });
      await fetch('/api/admin/set-tier', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email,tier:tier}) });
      this._initUsers();
    },
    async approve(email) {
      await fetch('/api/waitlist/approve', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email}) });
      this._initUsers();
    },
    async revoke(email) {
      await fetch('/api/waitlist/revoke', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email}) });
      this._initUsers();
    },
    destroy() { _tab = 'users'; }
  };
})();
${getAlertsJS()}
</script>
<!-- Gamma Floating Chat -->
<button class="gamma-fab" id="gammaFab" onclick="SQ.gamma.toggle()" title="Chat with Billy">
  <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  <span class="gamma-close">&times;</span>
</button>
<div class="gamma-chat" id="gammaChat">
  <div class="gamma-chat-header">
    <div class="gamma-chat-avatar">
      <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    </div>
    <div>
      <div class="gamma-chat-name">Billy</div>
      <div class="gamma-chat-status">Online &bull; Powered by SharkQuant&trade;</div>
    </div>
  </div>
  <div class="gamma-chat-messages" id="gammaMessages">
    <div class="gamma-welcome" id="gammaWelcome">
      <p>Hey! I'm Billy, your market analyst. Ask me anything about GEX, options, or the platform.</p>
      <div class="gamma-suggestions">
        <button class="gamma-chip" onclick="SQ.gamma.ask(this.textContent)">What is GEX?</button>
        <button class="gamma-chip" onclick="SQ.gamma.ask(this.textContent)">Explain the current regime</button>
        <button class="gamma-chip" onclick="SQ.gamma.ask(this.textContent)">How do I read the heatmap?</button>
        <button class="gamma-chip" onclick="SQ.gamma.ask(this.textContent)">What is the gamma flip?</button>
      </div>
    </div>
  </div>
  <div class="gamma-chat-input">
    <input type="text" id="gammaInput" placeholder="Ask Billy anything..." autocomplete="off" />
    <button id="gammaSend" onclick="SQ.gamma.send()">
      <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
  </div>
</div>
<script>
(function() {
  var _history = []; // conversation memory
  var _streaming = false;

  function mdToHtml(text) {
    // Simple markdown: bold, italic, inline code, bullet lists, line breaks
    return (text || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/\x60(.+?)\x60/g, '<code>$1</code>')
      .replace(/^[-•] (.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>')
      .replace(/\\n\\n/g, '</p><p>')
      .replace(/\\n/g, '<br>')
      .replace(/^/, '<p>').replace(/$/, '</p>')
      .replace(/<p><\\/p>/g, '')
      .replace(/<p>(<ul>)/g, '$1')
      .replace(/(<\\/ul>)<\\/p>/g, '$1');
  }

  SQ.gamma = {
    toggle: function() {
      var fab = document.getElementById('gammaFab');
      var chat = document.getElementById('gammaChat');
      var isOpen = chat.classList.contains('open');
      if (isOpen) { chat.classList.remove('open'); fab.classList.remove('open'); }
      else { chat.classList.add('open'); fab.classList.add('open'); var inp = document.getElementById('gammaInput'); if (inp) setTimeout(function(){ inp.focus(); }, 100); }
    },
    ask: function(text) {
      var welcome = document.getElementById('gammaWelcome');
      if (welcome) welcome.remove();
      var input = document.getElementById('gammaInput');
      if (input) input.value = text;
      SQ.gamma.send();
    },
    send: function() {
      if (_streaming) return;
      var input = document.getElementById('gammaInput');
      var btn = document.getElementById('gammaSend');
      var question = (input.value || '').trim();
      if (!question) return;

      var welcome = document.getElementById('gammaWelcome');
      if (welcome) welcome.remove();

      SQ.gamma._addBubble('user', question);
      _history.push({ role: 'user', content: question });
      input.value = '';
      btn.disabled = true;
      _streaming = true;

      // Show typing dots
      var thinking = SQ.gamma._addBubble('thinking', '');
      thinking.innerHTML = '<div class="gamma-dots"><span></span><span></span><span></span></div>';

      var ticker = 'SPY';
      if (typeof SQ.gex !== 'undefined' && SQ.gex._ticker) ticker = SQ.gex._ticker;

      var hdrs = { 'Content-Type': 'application/json' };
      if (window.DASHBOARD_API_KEY) hdrs['x-api-key'] = window.DASHBOARD_API_KEY;

      // Stream response via SSE
      fetch('/api/billy/ask?stream=1', {
        method: 'POST', headers: hdrs, credentials: 'include',
        body: JSON.stringify({ question: question, ticker: ticker, history: _history.slice(-10) })
      }).then(function(resp) {
        if (!resp.ok) throw new Error('Request failed');
        // Replace thinking with streaming bubble
        if (thinking && thinking.parentNode) thinking.parentNode.removeChild(thinking);
        var bubble = SQ.gamma._addBubble('gamma', '');
        bubble.innerHTML = '<span class="gamma-cursor"></span>';
        var fullText = '';
        var reader = resp.body.getReader();
        var decoder = new TextDecoder();
        var buf = '';
        var container = document.getElementById('gammaMessages');

        function pump() {
          return reader.read().then(function(result) {
            if (result.done) {
              // Done — finalize
              bubble.innerHTML = mdToHtml(fullText);
              _history.push({ role: 'assistant', content: fullText });
              // Keep history reasonable
              if (_history.length > 20) _history = _history.slice(-20);
              _streaming = false; btn.disabled = false; input.focus();
              return;
            }
            buf += decoder.decode(result.value, { stream: true });
            var lines = buf.split('\\n');
            buf = lines.pop() || '';
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i].trim();
              if (line === 'data: [DONE]') continue;
              if (!line.startsWith('data: ')) continue;
              try {
                var d = JSON.parse(line.slice(6));
                if (d.token) {
                  fullText += d.token;
                  bubble.innerHTML = mdToHtml(fullText) + '<span class="gamma-cursor"></span>';
                  if (container) container.scrollTop = container.scrollHeight;
                }
              } catch(_) {}
            }
            return pump();
          });
        }
        return pump();
      }).catch(function(err) {
        if (thinking && thinking.parentNode) thinking.parentNode.removeChild(thinking);
        SQ.gamma._addBubble('gamma', typeof err === 'string' ? err : (err.message || 'Something went wrong'));
        _streaming = false; btn.disabled = false; input.focus();
      });
    },
    _addBubble: function(type, text) {
      var container = document.getElementById('gammaMessages');
      if (!container) return null;
      var bubble = document.createElement('div');
      bubble.className = 'gamma-bubble ' + type;
      if (type === 'user') bubble.textContent = text;
      else bubble.innerHTML = text ? mdToHtml(text) : '';
      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
      return bubble;
    }
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'gammaInput') SQ.gamma.send();
  });
})();
</script>
${getAlertsHTML()}
</body>
</html>`;
}

module.exports = { registerDashboardRoutes };
