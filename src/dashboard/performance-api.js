'use strict';

/**
 * Signal Performance API
 *
 * Endpoints:
 *   GET /api/performance/signals        — all signal type scorecards
 *   GET /api/performance/signal/:type   — scorecard for specific signal type
 *   GET /api/performance/ticker/:ticker — scorecard filtered by ticker
 *   GET /api/performance/latest         — most recently resolved performances
 *   GET /api/performance/leaderboard    — signal types ranked by quality
 *   GET /api/performance/report         — daily performance report
 */

function registerPerformanceRoutes(app) {
  let tracker = null;

  function getTracker() {
    if (!tracker) {
      try {
        tracker = require('../services/signal-performance-tracker');
      } catch {}
    }
    return tracker;
  }

  // ── GET /api/performance/signals ─────────────────────────
  app.get('/api/performance/signals', async (req, res) => {
    const t = getTracker();
    if (!t) return res.status(503).json({ error: 'Performance tracker not available' });

    try {
      const scorecards = await t.getAllScorecards();
      res.json({ count: scorecards.length, scorecards });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/performance/signal/:type ────────────────────
  app.get('/api/performance/signal/:type', async (req, res) => {
    const t = getTracker();
    if (!t) return res.status(503).json({ error: 'Performance tracker not available' });

    try {
      const scorecard = await t.getScorecard(req.params.type);
      if (!scorecard) return res.status(404).json({ error: `No data for signal type: ${req.params.type}` });
      res.json(scorecard);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/performance/ticker/:ticker ──────────────────
  app.get('/api/performance/ticker/:ticker', async (req, res) => {
    const t = getTracker();
    if (!t) return res.status(503).json({ error: 'Performance tracker not available' });

    try {
      const scorecards = await t.getTickerScorecard(req.params.ticker);
      res.json({ ticker: req.params.ticker.toUpperCase(), count: scorecards.length, scorecards });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/performance/latest ──────────────────────────
  app.get('/api/performance/latest', async (req, res) => {
    const t = getTracker();
    if (!t) return res.status(503).json({ error: 'Performance tracker not available' });

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    try {
      const latest = await t.getLatest(limit);
      res.json({ count: latest.length, performances: latest });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/performance/leaderboard ─────────────────────
  app.get('/api/performance/leaderboard', async (req, res) => {
    const t = getTracker();
    if (!t) return res.status(503).json({ error: 'Performance tracker not available' });

    try {
      const leaderboard = await t.getLeaderboard();
      res.json({ count: leaderboard.length, leaderboard });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/performance/report ──────────────────────────
  app.get('/api/performance/report', async (req, res) => {
    const t = getTracker();
    if (!t) return res.status(503).json({ error: 'Performance tracker not available' });

    const date = req.query.date || null;

    try {
      const report = await t.getDailyReport(date);
      if (!report) return res.status(404).json({ error: 'No report data' });
      res.json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { registerPerformanceRoutes };
