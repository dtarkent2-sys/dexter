'use strict';

/**
 * SharkQuant Signals API
 *
 * Endpoints:
 *   GET /api/market-state/:ticker  — current market state + forecast + strategy
 *   GET /api/signals/:ticker       — recent signals for a ticker
 *   GET /api/latest-signal/:ticker — most recent signal
 *   GET /api/alerts/recent         — recent alerts across all tickers
 */

function registerSignalsRoutes(app) {
  let pipeline = null;

  function getPipeline() {
    if (!pipeline) {
      try {
        pipeline = require('../services/signal-pipeline');
      } catch {
        // Pipeline not available
      }
    }
    return pipeline;
  }

  // NOTE: /api/market-state/:ticker is handled by server.js (market-state module)
  // Do NOT register a duplicate route here — it would shadow the real handler.

  // ── GET /api/signals/:ticker ───────────────────────────────
  app.get('/api/signals/:ticker', async (req, res) => {
    const pl = getPipeline();
    if (!pl) return res.status(503).json({ error: 'Signal pipeline not available' });

    const ticker = req.params.ticker.toUpperCase();
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    try {
      const signals = await pl.getSignals(ticker, limit);
      res.json({ ticker, count: signals.length, signals });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/latest-signal/:ticker ─────────────────────────
  app.get('/api/latest-signal/:ticker', async (req, res) => {
    const pl = getPipeline();
    if (!pl) return res.status(503).json({ error: 'Signal pipeline not available' });

    const ticker = req.params.ticker.toUpperCase();

    try {
      const signal = await pl.getLatestSignal(ticker);
      if (!signal) return res.status(404).json({ error: `No signals for ${ticker}` });
      res.json(signal);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/alerts/recent ─────────────────────────────────
  app.get('/api/alerts/recent', async (req, res) => {
    const pl = getPipeline();
    if (!pl) return res.status(503).json({ error: 'Signal pipeline not available' });

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    try {
      const alerts = await pl.getRecentAlerts(limit);
      res.json({ count: alerts.length, alerts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { registerSignalsRoutes };
