const express = require('express');
const http = require('http');
const log = require('../logger')('Dashboard');
const config = require('../config');
const stats = require('../services/stats');
const reactions = require('../services/reactions');
const ai = require('../services/ai');
const auditLog = require('../services/audit-log');
const circuitBreaker = require('../services/circuit-breaker');
const mood = require('../services/mood');
const dailyBriefing = require('../services/daily-briefing');
const schedule = require('node-schedule');

// Socket.IO — lazy-loaded to avoid breaking if not installed
let Server = null;
try { Server = require('socket.io').Server; } catch { Server = null; }

// Screener DB — schema init on startup
let screenerDB = null;
try { screenerDB = require('../screener/db'); } catch { screenerDB = null; }

// GEX Live Computations — squeeze, scan, charm, maxpain
let gexLiveComps = null;
try { gexLiveComps = require('../services/gex-live-computations'); } catch { gexLiveComps = null; }

// ── Shared GEX engine + result cache for instant dashboard responses ──
let _sharedGEXEngine = null;
const _gexResultCache = new Map(); // ticker → { result, ts }
const GEX_CACHE_TTL_MS = 120_000; // 2 min — fresh enough for dashboard

function getSharedGEXEngine() {
  if (!_sharedGEXEngine) {
    try {
      const GEXEngine = require('../services/gex-engine');
      const gamma = require('../services/gamma');
      _sharedGEXEngine = new GEXEngine(gamma);
    } catch {}
  }
  return _sharedGEXEngine;
}

async function getCachedGEXAnalysis(ticker) {
  const upper = ticker.toUpperCase();
  const cached = _gexResultCache.get(upper);
  if (cached && Date.now() - cached.ts < GEX_CACHE_TTL_MS) return cached.result;

  const engine = getSharedGEXEngine();
  if (!engine) return null;
  try {
    const result = await engine.analyze(upper);
    _gexResultCache.set(upper, { result, ts: Date.now() });
    // Persist for replay (fire-and-forget)
    try { require('../services/gex-snapshot-store').save(upper, result).catch(err => log.error('GEX snapshot save failed', err)); } catch {}
    return result;
  } catch { return null; }
}


function validateTicker(raw) {
  const ticker = raw.toUpperCase().replace(/[^A-Z0-9.]/g, '');
  if (ticker.length === 0 || ticker.length > 10) return null;
  return ticker;
}

async function getSpotPrice(ticker) {
  try {
    const tdLive = require('../services/thetadata-live');
    if (tdLive.enabled) {
      const price = tdLive.getSpotPrice(ticker);
      if (price) return price;
    }
  } catch {}
  try {
    let databentoLive = null;
    try { databentoLive = require('../services/databento-live'); } catch {}
    if (!databentoLive) try { databentoLive = require('../services/databento-redis'); } catch {}
    if (databentoLive && databentoLive.getSpotPrice) {
      const price = databentoLive.getSpotPrice(ticker);
      if (price) return price;
    }
  } catch {}
  try {
    const alpacaMod = require('../services/alpaca');
    if (alpacaMod.enabled) {
      const snap = await alpacaMod.getSnapshot(ticker);
      if (snap && snap.price) return snap.price;
    }
  } catch {}
  return null;
}

function isWeekendET() {
  const str = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const day = new Date(str).getDay();
  return day === 0 || day === 6;
}

// Finnhub — short interest for squeeze scoring
let finnhub = null;
try { finnhub = require('../services/finnhub'); } catch { finnhub = null; }

// ── Gamma Structure Orchestrator — lazy-init on first API call ───────────────
let _gammaStructureOrchestrator = null;

function getGammaStructureOrchestrator() {
  if (!_gammaStructureOrchestrator) {
    try {
      const GammaStructureOrchestrator = require('../services/gamma-structure-orchestrator');
      const gexEngine = getSharedGEXEngine();
      let snapbackEngine = null;
      try { snapbackEngine = require('../services/snapback-engine'); } catch {}
      let dealerPositioning = null;
      try { dealerPositioning = require('../services/dealer-positioning'); } catch {}
      let dbPool = null;
      try { dbPool = require('../screener/db').getPool(); } catch {}
      _gammaStructureOrchestrator = new GammaStructureOrchestrator({
        gexEngine, snapbackEngine, dealerPositioning, db: dbPool,
      });
      _gammaStructureOrchestrator.start().catch(err =>
        log.error('[GammaStructure] Start failed:', err.message)
      );
    } catch (err) {
      log.warn('[GammaStructure] Orchestrator init failed:', err.message);
    }
  }
  return _gammaStructureOrchestrator;
}

// Socket.IO instance — exported for use by other modules
let _io = null;
function getIO() { return _io; }

// S3 backup — lazy-loaded on first API hit so the heavy @aws-sdk/client-s3
// import never blocks the health server from starting.
let _s3Backup = null;
let _s3Loaded = false;
function getS3Backup() {
  if (!_s3Loaded) {
    _s3Loaded = true;
    try { _s3Backup = require('../services/s3-backup'); } catch { _s3Backup = null; }
  }
  return _s3Backup;
}

// Discord client ref — set after client is ready via setDiscordClient()
let discordClient = null;

// SPY alerts module — loaded defensively
let spyAlerts = null;
try {
  spyAlerts = require('../services/spy-alerts');
} catch {
  spyAlerts = null;
}

function setDiscordClient(client) {
  discordClient = client;
  log.info('Discord client registered for webhook handling');
}

function startDashboard() {
  const app = express();

  // Stripe webhook needs raw body — must be before express.json()
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripeService = require('../services/stripe');
    const approvedUsers = require('../services/approved-users');
    if (!stripeService.enabled) return res.status(400).json({ error: 'Stripe not configured' });

    let event;
    try {
      event = stripeService.constructWebhookEvent(req.body, req.headers['stripe-signature']);
    } catch (err) {
      log.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send('Webhook signature verification failed');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = (session.client_reference_id || session.customer_email || (session.customer_details && session.customer_details.email) || '').toLowerCase();
      if (email) {
        const plan = (session.metadata && session.metadata.plan) || 'core';
        const tier = (plan === 'pro' || plan === 'founders') ? 'pro' : 'core';
        // Auto-approve new users who paid
        if (!approvedUsers.isApproved(email)) {
          approvedUsers.approve(email, 'stripe');
        }
        approvedUsers.setTier(email, tier, {
          customerId: session.customer,
          subscriptionId: session.subscription,
          plan,
        });
        log.info(`Stripe user subscribed to ${tier}: ${email}`);
        // Auto-tweet Founders milestone
        if (plan === 'founders') {
          try {
            const twitter = require('../services/twitter');
            const all = approvedUsers.getAll();
            const founderCount = all.filter(u => u.stripePlan === 'founders' && u.status === 'approved').length;
            await twitter.foundersMilestone(founderCount, 50);
          } catch (err) {
            console.error('[STRIPE] Founders milestone tweet failed:', err.message);
          }
        }
        // Send welcome magic link
        const { sendMagicLink } = require('../services/magic-email');
        sendMagicLink(email).catch(err => {
          log.error(`Stripe failed to send welcome email to ${email}:`, err.message);
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const user = approvedUsers.getByStripeCustomerId(sub.customer);
      if (user) {
        approvedUsers.setTier(user.email, 'none');
        log.info(`Stripe subscription cancelled: ${user.email}`);
      }
    }

    res.json({ received: true });
  });

  // Parse JSON bodies (for TradingView webhook POSTs)
  app.use(express.json({ limit: '1mb' }));
  const path = require('path');
  app.use('/assets', express.static(path.join(__dirname, '../../assets'), { maxAge: '7d' }));

  // ── Discord OAuth (session + passport) ────────────────────────────────
  const { configureAuth, requireAuth } = require('./auth');
  configureAuth(app);

  // ── SharkQuant Landing Page (public) ──────────────────────────────────
  const { registerLandingRoutes } = require('./landing');
  const { registerLegalRoutes } = require('./legal');
  registerLandingRoutes(app);
  registerLegalRoutes(app);

  // ── Waitlist API (public) ─────────────────────────────────────────────
  const waitlistPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'waitlist.json')
    : path.join(__dirname, '../../data/waitlist.json');
  app.post('/api/waitlist', (req, res) => {
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required.' });
    }
    const fs = require('fs');
    let list = [];
    try { list = JSON.parse(fs.readFileSync(waitlistPath, 'utf8')); } catch {}
    if (list.some(e => e.email === email.toLowerCase())) {
      return res.json({ message: "You're already on the list!" });
    }
    list.push({ email: email.toLowerCase(), date: new Date().toISOString() });
    try {
      fs.mkdirSync(path.dirname(waitlistPath), { recursive: true });
      fs.writeFileSync(waitlistPath, JSON.stringify(list, null, 2));
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save. Try again.' });
    }
    log.info(`Waitlist new signup: ${email.toLowerCase()} (total: ${list.length})`);
    res.json({ message: "You're on the list. We'll be in touch.", count: list.length });
  });

  app.get('/api/waitlist/count', (_req, res) => {
    const fs = require('fs');
    let count = 0;
    try { count = JSON.parse(fs.readFileSync(waitlistPath, 'utf8')).length; } catch {}
    res.json({ count });
  });

  // ── Market Status (public) ─────────────────────────────────────────────
  app.get('/api/market/status', (_req, res) => {
    const now = new Date();
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = et.getDay(), h = et.getHours(), m = et.getMinutes();
    const mins = h * 60 + m;

    let status, message;
    if (day === 0 || day === 6) {
      status = 'closed'; message = 'Market closed \u2014 showing last session data';
    } else if (mins < 240) {
      status = 'closed'; message = 'Market closed \u2014 showing last session data';
    } else if (mins < 570) {
      status = 'premarket'; message = 'Pre-market \u2014 limited data available';
    } else if (mins < 960) {
      status = 'open'; message = 'Market open \u2014 live data';
    } else if (mins < 1200) {
      status = 'afterhours'; message = 'After hours \u2014 showing close data';
    } else {
      status = 'closed'; message = 'Market closed \u2014 showing last session data';
    }

    res.json({ status, message, timestamp: Date.now() });
  });

  // ── Auth gate: all dashboard pages require Discord login ──────────────
  app.use(['/dashboard', '/gex', '/flow', '/trading', '/agents', '/portfolio', '/positions', '/optimize', '/intel', '/smartmoney', '/screener'], requireAuth);

  // ── Admin config ──
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  const adminEmails = (process.env.ADMIN_EMAILS || 'dtarkent2@gmail.com').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  function isAdmin(user) {
    if (!user) return false;
    // Email login: check username (which is the email)
    if (user.authType === 'email' && adminEmails.includes(user.username.toLowerCase())) return true;
    // Discord login: check Discord ID
    if (adminIds.includes(user.id)) return true;
    return false;
  }

  // ── Tier + admin middleware: attach tier and isAdmin to every authenticated API request ──
  const approvedUsersForTier = require('../services/approved-users');
  app.use('/api', (req, res, next) => {
    if (!req.user) return next();
    const identifier = req.user.authType === 'email'
      ? req.user.username
      : req.user.id;
    req.tier = approvedUsersForTier.getTier(identifier);
    req.isAdmin = isAdmin(req.user);
    next();
  });

  // ── User info endpoint ──
  app.get('/api/me', requireAuth, (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar || null,
      authType: req.user.authType || 'discord',
      tier: req.tier || 'none',
      isAdmin: isAdmin(req.user),
    });
  });

  // ── Stripe Checkout redirect (public — no login required) ──
  app.get('/api/stripe/checkout', async (req, res) => {
    const stripeService = require('../services/stripe');
    if (!stripeService.enabled) return res.status(400).json({ error: 'Billing not configured' });
    const p = req.query.plan;
    const plan = p === 'pro' ? 'pro' : p === 'founders' ? 'founders' : 'core';
    // Pre-fill email if user is already logged in
    const email = (req.user && req.user.authType === 'email') ? req.user.username : null;
    try {
      const session = await stripeService.createCheckoutSession(plan, email);
      res.redirect(303, session.url);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Founders counter — public, no auth
  app.get('/api/founders/remaining', (req, res) => {
    try {
      const approvedUsers = require('../services/approved-users');
      const all = approvedUsers.getAll();
      const founders = all.filter(u => u.stripePlan === 'founders' && u.status === 'approved');
      const claimed = founders.length;
      const total = 50;
      const remaining = Math.max(0, total - claimed);
      res.json({ remaining, claimed, total });
    } catch (err) {
      console.error('[API] Founders remaining error:', err.message);
      res.json({ remaining: 50, claimed: 0, total: 50 });
    }
  });

  // Recent proof data — public, for landing page
  app.get('/api/proof/recent', async (req, res) => {
    try {
      const proofEngine = require('../services/proof-engine');
      const proofs = await proofEngine.getRecentProofs(5);
      res.json(proofs);
    } catch (err) {
      res.json([]);
    }
  });

  // Backtest equity curves — admin only (cached in memory after first generate)
  let _equityCurvesCache = null;
  let _equityCurvesStatus = 'idle'; // idle | running | done | error
  let _equityCurvesLog = [];

  app.get('/api/backtest/equity-curves', requireAuth, async (req, res) => {
    if (!req.user || !isAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
    if (_equityCurvesStatus === 'running') return res.json({ status: 'running', log: _equityCurvesLog });
    if (_equityCurvesCache) return res.json(_equityCurvesCache);
    res.json({ error: 'No equity curve data yet. Click "Generate" to run backtests.' });
  });

  // Generate equity curves on-demand — admin only (fire-and-forget, polls via GET)
  app.post('/api/backtest/equity-curves/generate', requireAuth, async (req, res) => {
    if (!req.user || !isAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
    if (_equityCurvesStatus === 'running') return res.json({ ok: true, status: 'running' });
    _equityCurvesStatus = 'running';
    _equityCurvesLog = [];
    res.json({ ok: true, status: 'running' });
    // Run backtests in background (no await — response already sent)
    (async () => {
    try {
      const { getPool } = require('../screener/db');
      const pool = getPool();
      const results = {};
      const log = _equityCurvesLog;

      // ── Helper: compute density from key_strikes ──
      function computeDensity(keyStrikes, spot, band) {
        if (!keyStrikes || !keyStrikes.length || !spot) return null;
        const bw = spot * band;
        let nearGex = 0, totalGex = 0;
        for (const s of keyStrikes) {
          const absGex = Math.abs(s.gex || 0);
          totalGex += absGex;
          if (Math.abs(s.strike - spot) <= bw) nearGex += absGex;
        }
        return totalGex > 0 ? nearGex / totalGex : null;
      }

      // ── Helper: run snapback on one day's bars (frozen methodology) ──
      function runSnapbackDay(dayBars, maxDensity, minFlipDist, minOvershoot, timeMin, timeMax, accel, spread) {
        const W = 10, TARGET = 0.001, STOP = 0.002, TIME_STOP = 10;
        const trades = [];
        if (dayBars.length < W + TIME_STOP + 2) return trades;
        let cooldown = 0;
        for (let i = W; i < dayBars.length - TIME_STOP - 1; i++) {
          if (cooldown > 0) { cooldown--; continue; }
          const bar = dayBars[i];
          if (bar.density >= maxDensity) continue;
          if (Math.abs(bar.flipDist || 0) < minFlipDist) continue;
          if (bar.hourET < timeMin || bar.hourET >= timeMax) continue;
          const refPrice = dayBars[i - W].spot;
          const move = (bar.spot - refPrice) / refPrice;
          if (Math.abs(move) < minOvershoot) continue;
          if (accel) {
            const midPrice = dayBars[Math.max(0, i - 5)].spot;
            if (Math.abs((bar.spot - midPrice) / midPrice) < Math.abs(move) * 0.6) continue;
          }
          const dir = move > 0 ? -1 : 1;
          const entryPrice = dayBars[i + 1].spot + spread * (-dir);
          let exitPrice = null, exitReason = 'time';
          for (let j = 2; j <= TIME_STOP && (i + j) < dayBars.length; j++) {
            const retrace = (dayBars[i + j].spot - entryPrice) / entryPrice * dir;
            if (retrace >= TARGET) { exitPrice = dayBars[i + j].spot; exitReason = 'target'; break; }
            if (retrace <= -STOP) { exitPrice = entryPrice * (1 - STOP * dir); exitReason = 'stop'; break; }
          }
          if (!exitPrice) exitPrice = dayBars[Math.min(i + 1 + TIME_STOP, dayBars.length - 1)].spot;
          exitPrice -= spread * dir;
          const pnl = (exitPrice - entryPrice) / entryPrice * dir;
          trades.push({ date: bar.date, pnl, result: exitReason, spot: entryPrice });
          cooldown = 10;
        }
        return trades;
      }

      for (const ticker of ['QQQ', 'SPY']) {
        // ── Snapback backtest (real methodology from backtest-snapback-v2.js) ──
        try {
          // Load trading days
          const { rows: dayRows } = await pool.query(`
            SELECT DISTINCT ts::date as day FROM gex_snapshots
            WHERE ticker = $1 AND source = 'intraday-opra' AND spot > 0
            ORDER BY day
          `, [ticker]);
          const tradingDays = dayRows.map(r => r.day.toISOString().slice(0, 10));
          log.push(`snapback_${ticker}: ${tradingDays.length} trading days`);

          if (tradingDays.length) {
            const band = ticker === 'QQQ' ? 0.0125 : 0.01;
            const allDensities = [];
            const allDayBars = new Map();

            // Batch by month to avoid massive single query with jsonb_array_elements
            const months = [...new Set(tradingDays.map(d => d.slice(0, 7)))].sort();
            let totalBars = 0;
            for (const month of months) {
              const monthStart = month + '-01';
              const nextMonth = new Date(monthStart + 'T00:00:00Z');
              nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
              const monthEnd = nextMonth.toISOString().slice(0, 10);
              const { rows: monthBars } = await pool.query(`
                SELECT ts, ts::date::text as date, spot::float as spot, gamma_flip::float as gamma_flip,
                  CASE WHEN key_strikes IS NOT NULL AND jsonb_array_length(key_strikes) > 0 AND spot > 0 THEN
                    (SELECT COALESCE(SUM(ABS((s->>'gex')::float)) FILTER (WHERE ABS((s->>'strike')::float - spot::float) <= spot::float * $3), 0)
                     / NULLIF(SUM(ABS((s->>'gex')::float)), 0)
                     FROM jsonb_array_elements(key_strikes) s)
                  ELSE NULL END as density
                FROM gex_snapshots
                WHERE ticker = $1 AND source = 'intraday-opra' AND spot > 0
                  AND ts >= $2::date AND ts < $4::date
                ORDER BY ts
              `, [ticker, monthStart, band, monthEnd]);
              totalBars += monthBars.length;
              for (const row of monthBars) {
                const spot = row.spot;
                if (!spot) continue;
                const dens = row.density != null ? Number(row.density) : null;
                if (dens === null) continue;
                const hourUTC = new Date(row.ts).getUTCHours();
                const mo = new Date(row.ts).getUTCMonth();
                const isDST = mo >= 2 && mo <= 10;
                const hourET = hourUTC - (isDST ? 4 : 5);
                const gf = row.gamma_flip || null;
                const flipDist = gf ? (spot - gf) / spot : null;
                allDensities.push(dens);
                if (!allDayBars.has(row.date)) allDayBars.set(row.date, []);
                allDayBars.get(row.date).push({ ts: row.ts, spot, density: dens, date: row.date, hourET, flipDist });
              }
            }
            log.push(`snapback_${ticker}: ${totalBars} total bars (${months.length} months)`);

            // OOS split: train densities only for unbiased percentiles
            const OOS_SPLIT = '2025-01-01';
            const trainDensities = [];
            for (const [day, bars] of allDayBars) {
              if (day < OOS_SPLIT) for (const b of bars) trainDensities.push(b.density);
            }
            const sortedTrain = [...trainDensities].sort((a, b) => a - b);
            const P30t = sortedTrain[Math.floor(sortedTrain.length * 0.30)] || 0;
            const P40t = sortedTrain[Math.floor(sortedTrain.length * 0.40)] || 0;
            const P50t = sortedTrain[Math.floor(sortedTrain.length * 0.50)] || 0;
            log.push(`snapback_${ticker}: trainDensities=${trainDensities.length}, P30=${P30t.toFixed(4)}, P40=${P40t.toFixed(4)}, P50=${P50t.toFixed(4)}`);

            // Full-data percentiles (for backward-compat full curve)
            const sorted = [...allDensities].sort((a, b) => a - b);
            const P30 = sorted[Math.floor(sorted.length * 0.30)] || 0;
            const P40 = sorted[Math.floor(sorted.length * 0.40)] || 0;
            const P50 = sorted[Math.floor(sorted.length * 0.50)] || 0;

            const activeDays = [...allDayBars.keys()].sort();
            const tierCfgs = {
              'A+': { maxDensity: P30, minFlipDist: 0.005, minOvershoot: 0.003, timeMin: 11, timeMax: 17, accel: false },
              'A':  { maxDensity: P40, minFlipDist: 0.0035, minOvershoot: 0.0025, timeMin: 11, timeMax: 17, accel: false },
              'B':  { maxDensity: P50, minFlipDist: 0.0025, minOvershoot: 0.002, timeMin: 11, timeMax: 17, accel: true },
            };

            // Run each tier with slippage sensitivity + OOS split
            for (const [tierName, cfg] of Object.entries(tierCfgs)) {
              // Full curve (all data, full-data percentiles)
              const allTrades = [];
              for (const [, bars] of allDayBars) {
                allTrades.push(...runSnapbackDay(bars, cfg.maxDensity, cfg.minFlipDist, cfg.minOvershoot, cfg.timeMin, cfg.timeMax, cfg.accel, 0.01));
              }
              if (allTrades.length) {
                const curve = _buildCurve(ticker, 'snapback_' + tierName.replace('+', 'plus'), allTrades, activeDays);
                curve.tier = tierName;
                curve.densityThreshold = Math.round((tierName === 'A+' ? P30 : tierName === 'A' ? P40 : P50) * 1000) / 1000;

                // ── Slippage sensitivity (post-hoc P&L adjustment) ──
                const slippageStats = {};
                for (const bps of [0, 1, 2, 3]) {
                  const adjTrades = bps === 0 ? allTrades : allTrades.map(t => ({ ...t, pnl: t.pnl - (bps * 2 / 10000) }));
                  const adj = _buildCurve(ticker, 'slip', adjTrades, activeDays);
                  slippageStats[bps] = { profitFactor: adj.profitFactor, winRate: adj.winRate, finalEquityBps: adj.finalEquityBps, maxDrawdown: adj.maxDrawdown };
                }
                curve.slippageStats = slippageStats;

                // ── OOS split (train percentiles applied to both halves) ──
                const trainP = tierName === 'A+' ? P30t : tierName === 'A' ? P40t : P50t;
                const trainTrades = [], testTrades = [], trainDays = [], testDays = [];
                for (const [day, bars] of allDayBars) {
                  const trades = runSnapbackDay(bars, trainP, cfg.minFlipDist, cfg.minOvershoot, cfg.timeMin, cfg.timeMax, cfg.accel, 0.01);
                  if (day < OOS_SPLIT) { trainTrades.push(...trades); trainDays.push(day); }
                  else { testTrades.push(...trades); testDays.push(day); }
                }
                curve.oosSplit = OOS_SPLIT;
                curve.trainStats = trainTrades.length ? _buildCurve(ticker, 'train', trainTrades, trainDays.sort()) : null;
                curve.testStats = testTrades.length ? _buildCurve(ticker, 'test', testTrades, testDays.sort()) : null;
                curve.trainDensityThreshold = Math.round(trainP * 1000) / 1000;

                results[`snapback_${tierName}_${ticker}`] = curve;
                const isPF = curve.trainStats ? curve.trainStats.profitFactor : '-';
                const oosPF = curve.testStats ? curve.testStats.profitFactor : '-';
                log.push(`snapback_${tierName}_${ticker}: ${allTrades.length} trades, PF ${curve.profitFactor}, IS PF ${isPF}, OOS PF ${oosPF}`);
              }
            }
          }
        } catch (e) { log.push(`snapback_${ticker} ERROR: ${e.message}`); console.error(`[EquityCurves] Snapback ${ticker}: ${e.message}`); }

        // ── Expansion engine: real calibrated stats from DB ──
        try {
          const { rows } = await pool.query(`
            WITH daily AS (
              SELECT DISTINCT ON (e.snapshot_ts::date)
                e.snapshot_ts::date::text as date,
                e.expansion_score, e.compression_score, e.market_regime as regime,
                e.prob_next_day_050, e.prob_next_day_100,
                e.compression_prob_lt_030,
                p.close
              FROM engine_snapshots e
              JOIN screener_price_history p ON p.ticker = e.ticker AND p.date = e.snapshot_ts::date
              WHERE e.ticker = $1
              ORDER BY e.snapshot_ts::date, e.snapshot_ts DESC
            )
            SELECT d.*, LEAD(d.close) OVER (ORDER BY d.date) as next_close
            FROM daily d ORDER BY d.date
          `, [ticker]);
          log.push(`expansion_${ticker}: ${rows.length} daily rows`);

          if (rows.length > 1) {
            const valid = rows.filter(r => r.next_close != null);
            const n = valid.length;
            const withReturn = valid.map(r => {
              const cl = parseFloat(r.close), nc = parseFloat(r.next_close);
              return {
                date: r.date,
                expScore: parseFloat(r.expansion_score) || 0,
                compScore: parseFloat(r.compression_score) || 0,
                regime: r.regime || 'UNKNOWN',
                prob050: parseFloat(r.prob_next_day_050) || 0,
                prob100: parseFloat(r.prob_next_day_100) || 0,
                compProb030: parseFloat(r.compression_prob_lt_030) || 0,
                absReturn: Math.abs((nc - cl) / cl),
                close: cl,
              };
            });

            // Decile analysis (matches calibrate-expansion.js)
            const sorted = [...withReturn].sort((a, b) => a.expScore - b.expScore);
            const deciles = [];
            for (let d = 0; d < 10; d++) {
              const slice = sorted.slice(Math.floor(d * n / 10), Math.floor((d + 1) * n / 10));
              if (!slice.length) continue;
              const avgMove = slice.reduce((s, r) => s + r.absReturn, 0) / slice.length;
              const hit050 = slice.filter(r => r.absReturn > 0.005).length / slice.length;
              const hit100 = slice.filter(r => r.absReturn > 0.01).length / slice.length;
              deciles.push({ decile: d + 1, avgMove: Math.round(avgMove * 10000) / 100, hit050: Math.round(hit050 * 1000) / 10, hit100: Math.round(hit100 * 1000) / 10, n: slice.length });
            }

            // Pearson correlation: expansion_score vs |next-day return|
            const meanScore = withReturn.reduce((s, r) => s + r.expScore, 0) / n;
            const meanReturn = withReturn.reduce((s, r) => s + r.absReturn, 0) / n;
            let num = 0, denA = 0, denB = 0;
            for (const r of withReturn) {
              num += (r.expScore - meanScore) * (r.absReturn - meanReturn);
              denA += (r.expScore - meanScore) ** 2;
              denB += (r.absReturn - meanReturn) ** 2;
            }
            const correlation = denA > 0 && denB > 0 ? num / Math.sqrt(denA * denB) : 0;

            // Cumulative |return| curve by date for charting
            let cumReturn = 0;
            const equityCurve = withReturn.map(r => {
              cumReturn += r.absReturn;
              return { date: r.date, equity: Math.round(cumReturn * 10000) / 10000 };
            });

            results[`expansion_${ticker}`] = {
              ticker, type: 'expansion_engine',
              totalDays: n,
              correlation: Math.round(correlation * 1000) / 1000,
              deciles,
              avgAbsReturn: Math.round(meanReturn * 10000) / 100,
              equityCurve,
              monthlyPnl: {},
              generatedAt: new Date().toISOString(),
            };
          }
        } catch (e) { log.push(`expansion_${ticker} ERROR: ${e.message}`); console.error(`[EquityCurves] Expansion ${ticker}: ${e.message}`); }

        // ── Regime accuracy (from already-classified market_regime + next-day returns) ──
        try {
          const { rows } = await pool.query(`
            WITH daily AS (
              SELECT DISTINCT ON (e.snapshot_ts::date)
                e.snapshot_ts::date::text as date, e.market_regime as regime, p.close
              FROM engine_snapshots e
              JOIN screener_price_history p ON p.ticker = e.ticker AND p.date = e.snapshot_ts::date
              WHERE e.ticker = $1
              ORDER BY e.snapshot_ts::date, e.snapshot_ts DESC
            )
            SELECT d.*, LEAD(d.close) OVER (ORDER BY d.date) as next_close
            FROM daily d ORDER BY d.date
          `, [ticker]);
          log.push(`regime_${ticker}: ${rows.length} daily rows`);

          if (rows.length > 1) {
            const valid = rows.filter(r => r.next_close != null);
            const regimeStats = {};
            for (const r of valid) {
              const regime = r.regime || 'UNKNOWN';
              const move = Math.abs((parseFloat(r.next_close) - parseFloat(r.close)) / parseFloat(r.close));
              if (!regimeStats[regime]) regimeStats[regime] = { count: 0, moves: [], correct: 0, pctLt030: 0, pctGt050: 0, pctGt100: 0, unscored: false };
              const s = regimeStats[regime];
              s.count++;
              s.moves.push(move);
              if (move < 0.003) s.pctLt030++;
              if (move > 0.005) s.pctGt050++;
              if (move > 0.01) s.pctGt100++;
              // Accuracy: did regime predict correctly?
              if (regime === 'EXPANSION' && move > 0.005) s.correct++;
              else if (regime === 'COMPRESSION' && move < 0.005) s.correct++;
              else if (regime === 'PINNED' && move < 0.003) s.correct++;
              else if (regime === 'TRANSITIONAL') { s.unscored = true; }
              else if (regime === 'DEALER_CONTROLLED' && move < 0.005) s.correct++;
            }
            for (const [, s] of Object.entries(regimeStats)) {
              s.pctLt030 = Math.round(s.pctLt030 / s.count * 1000) / 10;
              s.pctGt050 = Math.round(s.pctGt050 / s.count * 1000) / 10;
              s.pctGt100 = Math.round(s.pctGt100 / s.count * 1000) / 10;
            }
            results[`regime_${ticker}`] = { ticker, type: 'regime_accuracy', regimeStats, totalDays: valid.length };
          }
        } catch (e) { log.push(`regime_${ticker} ERROR: ${e.message}`); console.error(`[EquityCurves] Regime ${ticker}: ${e.message}`); }
      }

      // ── Robustness summary panel ──
      const robustness = {};
      for (const t of ['QQQ', 'SPY']) {
        robustness[t] = { tiers: {} };
        for (const tierName of ['A+', 'A', 'B']) {
          const c = results[`snapback_${tierName}_${t}`];
          if (!c) continue;
          robustness[t].tiers[tierName] = {
            fullPF: c.profitFactor, fullWinRate: c.winRate,
            inSamplePF: c.trainStats ? c.trainStats.profitFactor : null,
            outOfSamplePF: c.testStats ? c.testStats.profitFactor : null,
            inSampleTrades: c.trainStats ? c.trainStats.totalTrades : null,
            outOfSampleTrades: c.testStats ? c.testStats.totalTrades : null,
            slippagePF: c.slippageStats ? { 0: c.slippageStats[0].profitFactor, 1: c.slippageStats[1].profitFactor, 2: c.slippageStats[2].profitFactor, 3: c.slippageStats[3].profitFactor } : null,
          };
        }
        const rk = results[`regime_${t}`];
        if (rk && rk.regimeStats) {
          robustness[t].regimeCounts = {};
          for (const [regime, s] of Object.entries(rk.regimeStats)) robustness[t].regimeCounts[regime] = s.count;
        }
      }
      results._robustness = robustness;

      console.log(`[EquityCurves] Generate done: ${Object.keys(results).length} curves. ${log.join('; ')}`);
      _equityCurvesCache = results;
      _equityCurvesStatus = 'done';
    } catch (err) {
      console.error(`[EquityCurves] Generate failed: ${err.message}`);
      _equityCurvesLog.push('FATAL: ' + err.message);
      _equityCurvesStatus = 'error';
    }
    })();
  });

  function _buildCurve(ticker, type, trades, allDates) {
    const pnlByDate = {};
    for (const t of trades) pnlByDate[t.date] = (pnlByDate[t.date] || 0) + t.pnl;
    const equityCurve = [];
    let equity = 0, peak = 0, maxDD = 0;
    for (const d of allDates) {
      equity += pnlByDate[d] || 0;
      if (equity > peak) peak = equity;
      if (peak - equity > maxDD) maxDD = peak - equity;
      equityCurve.push({ date: d, equity: Math.round(equity * 10000) / 10000 });
    }
    const wins = trades.filter(t => t.pnl > 0).length;
    const grossWins = trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
    const grossLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
    const pf = grossLosses > 0 ? grossWins / grossLosses : Infinity;
    const winRate = trades.length > 0 ? wins / trades.length : 0;
    const monthlyPnl = {};
    for (const t of trades) { const m = t.date.slice(0, 7); monthlyPnl[m] = (monthlyPnl[m] || 0) + t.pnl; }
    return {
      ticker, type, totalTrades: trades.length, wins, losses: trades.length - wins,
      winRate: Math.round(winRate * 1000) / 10,
      profitFactor: Math.round(pf * 100) / 100,
      maxDrawdown: Math.round(maxDD * 10000),
      finalEquityBps: Math.round(equity * 10000),
      equityCurve, monthlyPnl, generatedAt: new Date().toISOString(),
    };
  }

  // ── Admin: set user tier manually ──
  app.post('/api/admin/set-tier', requireAuth, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });
    const { email, tier } = req.body || {};
    if (!email || !['none', 'core', 'pro'].includes(tier)) return res.status(400).json({ error: 'email and tier (none/core/pro) required' });
    const oldTier = approvedUsersForTier.getTier(email) || 'none';
    const result = approvedUsersForTier.setTier(email, tier);

    // Audit trail — log admin tier changes
    const adminIdentifier = req.user.authType === 'email' ? req.user.username : req.user.id;
    auditLog.log('admin', `Tier changed: ${email} ${oldTier} -> ${tier}`, {
      action: 'set-tier',
      adminId: adminIdentifier,
      targetUser: email,
      oldTier,
      newTier: tier,
    });

    res.json({ success: result });
  });

  app.get('/api/waitlist', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });
    const fs = require('fs');
    let list = [];
    try { list = JSON.parse(fs.readFileSync(waitlistPath, 'utf8')); } catch {}
    res.json({ count: list.length, entries: list });
  });

  // ── Admin: approve waitlist user (send magic link) ─────────────────
  app.post('/api/waitlist/approve', requireAuth, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const approvedUsers = require('../services/approved-users');
      approvedUsers.approve(email.toLowerCase(), req.user.id);

      const { sendMagicLink } = require('../services/magic-email');
      const sent = await sendMagicLink(email.toLowerCase());

      res.json({ success: true, emailSent: sent });
    } catch (err) {
      log.error('Waitlist approve failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ── Admin: revoke user access ──────────────────────────────────────
  app.post('/api/waitlist/revoke', requireAuth, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const approvedUsers = require('../services/approved-users');
      const revoked = approvedUsers.revoke(email.toLowerCase());
      res.json({ success: revoked });
    } catch (err) {
      log.error('Waitlist revoke failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ── Admin: get approved users list ─────────────────────────────────
  app.get('/api/approved-users', requireAuth, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });
    const approvedUsers = require('../services/approved-users');
    res.json({ users: approvedUsers.getAll() });
  });

  // ── Admin: Twitter follow trading users ─────────────────────────────
  app.post('/api/admin/twitter-follow', requireAuth, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });
      const twitter = require('../services/twitter');
      if (!twitter.isEnabled()) return res.status(400).json({ error: 'Twitter not configured' });
      const { minFollowers = 1000, maxToFollow = 50 } = req.body || {};
      res.json({ status: 'started', message: `Following users with ${minFollowers}+ followers (max ${maxToFollow})` });
      twitter.followTradingUsers({ minFollowers, maxToFollow }).then(result => {
        log.info('Twitter follow run result:', JSON.stringify(result));
      }).catch(err => log.error('Twitter follow failed:', err.message));
    } catch (err) {
      log.error('Twitter follow endpoint failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ── Admin: Twitter reply to mentions ────────────────────────────────
  app.post('/api/admin/twitter-reply', requireAuth, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });
      const twitter = require('../services/twitter');
      if (!twitter.isEnabled()) return res.status(400).json({ error: 'Twitter not configured' });
      const { maxReplies = 10 } = req.body || {};
      res.json({ status: 'started', message: `Replying to up to ${maxReplies} mentions` });
      twitter.replyToMentions({ maxReplies }).then(result => {
        log.info('Twitter reply run result:', JSON.stringify(result));
      }).catch(err => log.error('Twitter reply failed:', err.message));
    } catch (err) {
      log.error('Twitter reply endpoint failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ── Alert API ──────────────────────────────────────────────────────
  app.get('/api/alerts', requireAuth, async (req, res) => {
    try {
      const alertMgr = require('../services/alert-manager');
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
      const alerts = await alertMgr.getRecent(limit);
      res.json({ alerts });
    } catch (err) {
      log.error('Alerts fetch failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/alerts/read', requireAuth, (_req, res) => {
    res.json({ ok: true });
  });

  // ── SPA Redirects: standalone pages → unified dashboard ───────────────
  app.get('/gex', (req, res) => res.redirect('/dashboard#gex'));
  app.get('/flow', (req, res) => res.redirect('/dashboard#flow'));
  app.get('/trading', (req, res) => res.redirect('/dashboard#briefing'));
  app.get('/agents', (req, res) => res.redirect('/dashboard#agents'));
  app.get('/portfolio', (req, res) => res.redirect('/dashboard#briefing'));
  app.get('/positions', (req, res) => res.redirect('/dashboard#dashboard'));
  app.get('/intel', (req, res) => res.redirect('/dashboard#intel'));
  app.get('/screener', (req, res) => res.redirect('/dashboard#screener'));
  app.get('/smartmoney', (req, res) => res.redirect('/dashboard#smartmoney'));

  // ── GEX Gamma Heat Map interactive dashboard ──────────────────────────
  const { registerGEXHeatmapRoutes } = require('./gex-heatmap');
  registerGEXHeatmapRoutes(app);

  const { registerStrategiesRoutes, scoreStrategies } = require('./strategies');
  registerStrategiesRoutes(app);

  // ── Billy Command Center (full interactive dashboard) ─────────────────
  const { registerDashboardRoutes } = require('./app');
  registerDashboardRoutes(app);

  // ── AI Agent Analysis (TradingAgents pipeline dashboard) ────────────
  const { registerAgentsRoutes } = require('./agents');
  registerAgentsRoutes(app);

  // ── GEX-LLM Pattern Analysis ──────────────────────────────────────────
  const { registerGexLlmRoutes } = require('./gex-llm');
  registerGexLlmRoutes(app);

  // ── Stock Screener (PostgreSQL-backed) ─────────────────────────────────
  try {
    const { registerScreenerRoutes } = require('../screener/api');
    registerScreenerRoutes(app, requireAuth);
  } catch (e) { log.error('Screener failed to register routes:', e.message); }

  // (Portfolio routes removed — replaced by Daily Briefing)

  // ── Daily Briefing ──────────────────────────────────────────────────────
  app.get('/api/briefing', (req, res) => {
    const briefing = dailyBriefing.getLatestBriefing();
    if (!briefing) return res.json({ error: 'No briefing available yet' });
    res.json(briefing);
  });

  // Manual briefing trigger (admin session or API key)
  app.post('/api/briefing/generate', async (req, res) => {
    const { isAdmin } = require('../services/approved-users');
    const apiKey = process.env.DASHBOARD_API_KEY;
    const providedKey = req.headers['x-api-key'];
    const isAdminUser = req.user && isAdmin(req.user);
    const isValidKey = apiKey && providedKey === apiKey;
    if (!isAdminUser && !isValidKey) return res.status(403).json({ error: 'Admin only' });
    try {
      const briefing = await dailyBriefing.generateBriefing();
      if (_io) _io.emit('briefing:updated');
      res.json({ success: true, date: briefing.date, chars: briefing.commentary?.length || 0 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Post briefing to Discord (admin only)
  app.post('/api/briefing/post-discord', async (req, res) => {
    const { isAdmin } = require('../services/approved-users');
    const apiKey = process.env.DASHBOARD_API_KEY;
    const providedKey = req.headers['x-api-key'];
    const isAdminUser = req.user && isAdmin(req.user);
    const isValidKey = apiKey && providedKey === apiKey;
    if (!isAdminUser && !isValidKey) return res.status(403).json({ error: 'Admin only' });
    try {
      const briefing = dailyBriefing.getLatestBriefing();
      if (!briefing || !briefing.commentary) return res.status(404).json({ error: 'No briefing to post' });
      if (!discordClient) return res.status(503).json({ error: 'Discord client not ready' });
      const { persona } = require('../personality');
      const raw = briefing.rawData || {};
      const header = `**${persona.name}'s Pre-Market Briefing** — SPY $${raw.price || '?'} (${raw.changePct >= 0 ? '+' : ''}${raw.changePct || '?'}%)`;
      const regime = raw.regime ? `Regime: **${raw.regime}** | Flow: **${raw.flowDirection || 'N/A'}** | Danger: ${raw.dangerScore != null ? Math.round(raw.dangerScore * 100) + '/100' : 'N/A'}` : '';
      let picksStr = '';
      if (raw.bullishPicks?.length || raw.bearishPicks?.length) {
        const bulls = (raw.bullishPicks || []).slice(0, 3).map(p => `  CALL $${p.strike} (${p.confidence}%)`).join('\n');
        const bears = (raw.bearishPicks || []).slice(0, 3).map(p => `  PUT $${p.strike} (${p.confidence}%)`).join('\n');
        picksStr = `\n**Billy's Picks:**\nBullish:\n${bulls || '  None'}\nBearish:\n${bears || '  None'}`;
      }
      let commentaryText = briefing.commentary || '';
      const maxCommentary = 1400 - header.length - regime.length - picksStr.length;
      if (commentaryText.length > maxCommentary) {
        commentaryText = commentaryText.slice(0, maxCommentary).replace(/\s+\S*$/, '') + '...';
      }
      const message = [header, regime, '', commentaryText, picksStr, '', 'Not financial advice.'].filter(Boolean).join('\n');
      const tradingChannel = discordClient.channels.cache.find(c => c.name === config.tradingChannelName);
      if (!tradingChannel) return res.status(404).json({ error: 'Trading channel not found' });
      await tradingChannel.send(message);
      res.json({ success: true, channelName: config.tradingChannelName, chars: message.length });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Portfolio Optimizer ─────────────────────────────────────────────────
  const { registerOptimizeRoutes } = require('./optimize');
  registerOptimizeRoutes(app);

  // ── SharkQuant Signal Pipeline + API ──────────────────────────────────
  try {
    const { registerSignalsRoutes } = require('./signals-api');
    registerSignalsRoutes(app);
    const signalPipeline = require('../services/signal-pipeline');
    signalPipeline.init(_io).catch(e => log.error('Signal pipeline init failed:', e.message));
  } catch (e) { log.error('[SignalPipeline] Failed to register:', e.message); }

  // ── Signal Performance Tracker + API ────────────────────────────────
  try {
    const { registerPerformanceRoutes } = require('./performance-api');
    registerPerformanceRoutes(app);
    const perfTracker = require('../services/signal-performance-tracker');
    perfTracker.init().catch(e => log.error('Performance tracker init failed:', e.message));
  } catch (e) { log.error('[PerfTracker] Failed to register:', e.message); }

  // Also accept plain text (some TradingView configs send text/plain)
  app.use(express.text({ type: 'text/plain', limit: '1mb' }));

  // ── TradingView Webhook Endpoint ──────────────────────────────────────
  // URL to set in TradingView: https://your-app.up.railway.app/webhook/tradingview
  // Optional: add ?secret=YOUR_SECRET for authentication
  app.post('/webhook/tradingview', async (req, res) => {
    // Authenticate if WEBHOOK_SECRET is set
    if (config.webhookSecret) {
      const secret = req.query.secret || req.headers['x-webhook-secret'] || req.body?.secret;
      if (secret !== config.webhookSecret) {
        log.warn('Webhook: Unauthorized request (bad secret)');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Need Discord client and SPY channel
    if (!discordClient) {
      log.warn('Webhook: Discord client not ready yet');
      return res.status(503).json({ error: 'Bot not ready' });
    }

    if (!config.spyChannelId) {
      log.warn('Webhook: SPY_CHANNEL_ID not configured');
      return res.status(500).json({ error: 'SPY_CHANNEL_ID not set' });
    }

    const channel = discordClient.channels.cache.get(config.spyChannelId);
    if (!channel) {
      log.warn(`Webhook: Channel ${config.spyChannelId} not found in cache`);
      return res.status(500).json({ error: 'Channel not found' });
    }

    // Log the raw payload for debugging
    const body = req.body;
    log.info(`Webhook: TradingView alert received:`, typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200));

    if (!spyAlerts) {
      log.warn('Webhook: spy-alerts module not loaded');
      return res.status(500).json({ error: 'Alert handler not loaded' });
    }

    // Respond to TradingView immediately (it times out after ~3s)
    // Analysis + Discord posting happens in the background
    res.status(200).json({ ok: true, status: 'processing' });

    // Run the full pipeline: parse → fetch data → AI analysis → post to Discord
    spyAlerts.handleHttpAlert(channel, body).catch(err => {
      log.error(`Webhook: Alert pipeline failed:`, err.message);
    });
  });

  // ── Favicon ────────────────────
  app.get('/favicon.ico', (req, res) => res.redirect('/assets/images/logo.png?v=4'));
  app.get('/favicon.svg', (req, res) => res.redirect('/assets/images/logo.png?v=4'));

  // ── API Key Auth Middleware ─────────────────────────────────────────
  // Protects /api/* routes. Checks DASHBOARD_API_KEY env var against
  // x-api-key header or ?key= query param. Dashboard pages inject the key
  // into a fetch interceptor via common-styles.js so JS calls auto-auth.
  app.use('/api', (req, res, next) => {
    // Public auth endpoints — must be accessible before login
    if (req.path.startsWith('/auth/')) return next();
    if (req.path.startsWith('/stripe/checkout') || req.path.startsWith('/stripe/webhook')) return next();
    if (req.path === '/market/status') return next();
    const apiKey = process.env.DASHBOARD_API_KEY;
    if (!apiKey) return next(); // no key configured — skip auth
    // Allow API key auth (external clients)
    const provided = req.headers['x-api-key'] || req.query.key;
    if (provided === apiKey) return next();
    // Allow session auth (browser dashboard)
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  });

  // Health check endpoint (for Railway / monitoring)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: stats.getUptime() });
  });

  // P0 ingestion correctness counters — production observability for P0-A/B/C fixes
  app.get('/healthz', (req, res) => {
    const now = Date.now();
    let dbnStats = null;
    try {
      const dbn = require('../services/databento');
      const status = dbn.getStatus ? dbn.getStatus() : null;
      if (status) {
        // getStatus() spreads _stats at top level (no nested .stats)
        const s = status;
        dbnStats = {
          connected: s.state === 'streaming',
          lastMessageAgeMs: s.lastMessageAt ? now - new Date(s.lastMessageAt).getTime() : null,
          // P0-A: schema deduplication counters
          tradesIngested:           s.tradesReceived ?? 0,
          tradesDroppedWrongSchema: s.tradesDroppedWrongSchema ?? 0,
          quotesIngested:           s.quotesReceived ?? 0,
          // P0-B: spot price health
          spotNullCount:  s.spotNullCount ?? 0,
          spotLastAgeMs:  s.spotLastTs ? now - s.spotLastTs : null,
          // P0-C: definition buffer drops
          droppedMissingDefinition: s.droppedMissingDefinition ?? 0,
        };
      }
    } catch {}
    const obsMetrics = (() => {
      try { return require('../services/obs').getMetrics(); } catch { return null; }
    })();
    res.json({
      status: 'ok',
      ts: new Date().toISOString(),
      uptime: stats.getUptime(),
      databento: dbnStats,
      process: obsMetrics ? { rssMB: obsMetrics.memory?.rssMB, heapUsedMB: obsMetrics.memory?.heapUsedMB } : null,
    });
  });

  // Metrics endpoint — JSON snapshot of process/Redis/Ollama/ingestion stats
  app.get('/metrics', (req, res) => {
    try {
      const obs = require('../services/obs');
      res.json(obs.getMetrics());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  // Stats API endpoint
  app.get('/api/stats', (req, res) => {
    const summary = stats.getSummary();
    const reactionStats = reactions.getStats();
    res.json({
      ...summary,
      model: ai.getModel(),
      reactions: reactionStats,
    });
  });

  // Trading safety status — circuit breaker, mood, audit log summary, data sources
  app.get('/api/safety', (req, res) => {
    let databentoStatus = null;
    try { const db = require('../services/databento'); databentoStatus = db.getStatus(); } catch { /* skip */ }

    res.json({
      circuitBreaker: circuitBreaker.getStatus(),
      mood: mood.getSummary(),
      auditLog: auditLog.getStats(),
      databento: databentoStatus,
    });
  });

  // S3 backup status and management
  app.get('/api/backups', async (req, res) => {
    try {
      const s3 = getS3Backup();
      if (!s3) return res.json({ enabled: false, backups: [] });
      const status = s3.getStatus();
      const backups = status.enabled ? await s3.listBackups() : [];
      res.json({ ...status, backups: backups.slice(0, 20) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Options order flow (Databento OPRA tick-level trade data)
  // Prefers live streaming data when available, falls back to historical API
  app.get('/api/flow/:ticker', async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });

      // Helper: enrich flow response with HFT signal data
      function enrichWithSignal(flowObj, ticker) {
        try {
          const tdLive = require('../services/thetadata-live');
          if (tdLive.enabled && typeof tdLive.getSignal === 'function') {
            const sig = tdLive.getSignal(ticker);
            if (sig && !sig.error) Object.assign(flowObj, sig);
          }
        } catch { /* skip */ }
        return flowObj;
      }

      // Helper: build trades array from largeBlocks + sweeps for chart consumers
      function buildTradesArray(flowObj) {
        if (flowObj.trades && flowObj.trades.length) return;
        const trades = [];
        if (flowObj.largeBlocks) {
          for (const b of flowObj.largeBlocks) {
            trades.push({ timestamp: b.time, type: b.optionType || b.type, premium: Math.abs(b.premium || b.notional || 0), strike: b.strike });
          }
        }
        if (flowObj.sweeps) {
          for (const s of flowObj.sweeps) {
            trades.push({ timestamp: s.time, type: s.optionType || s.type, premium: Math.abs(s.totalPremium || s.premium || 0), strike: s.strike });
          }
        }
        if (trades.length) {
          trades.sort((a, b) => a.timestamp - b.timestamp);
          flowObj.trades = trades;
        }
      }

      // Tier 1: Theta Data Live flow
      let liveFlow = null;
      try {
        const tdLive = require('../services/thetadata-live');
        if (tdLive.enabled && typeof tdLive.getFlow === 'function') {
          liveFlow = tdLive.getFlow(ticker);
          if (liveFlow && liveFlow.tradeCount > 0) {
            buildTradesArray(liveFlow);
            return res.json(enrichWithSignal(liveFlow, ticker));
          }
        }
      } catch { /* fallback */ }

      // Tier 2: Databento flow
      let live = null;
      try { live = require('../services/databento-live'); } catch { /* */ }
      if (!live) try { live = require('../services/databento-redis'); } catch { /* */ }
      if (!live) try { live = require('../services/databento'); } catch { /* */ }

      if (live && typeof live.getFlow === 'function') {
        const liveFlow = live.getFlow(ticker);
        if (liveFlow && liveFlow.tradeCount > 0) {
          if (!liveFlow.trades && (liveFlow.largeBlocks || liveFlow.sweeps)) {
            const trades = [];
            if (liveFlow.largeBlocks) {
              for (const b of liveFlow.largeBlocks) {
                trades.push({ timestamp: b.time, type: b.optionType || b.type, premium: Math.abs(b.premium || b.notional || 0) });
              }
            }
            if (liveFlow.sweeps) {
              for (const s of liveFlow.sweeps) {
                trades.push({ timestamp: s.time, type: s.optionType || s.type, premium: Math.abs(s.premium || s.notional || 0) });
              }
            }
            trades.sort((a, b) => a.timestamp - b.timestamp);
            liveFlow.trades = trades;
          }
          return res.json(enrichWithSignal(liveFlow, ticker));
        }
      }

      // No flow data available
      res.json(enrichWithSignal({ ticker, trades: [], tradeCount: 0 }, ticker));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Intraday Bars API ────────────────────────────────────────────────
  app.get('/api/bars/:ticker', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const alpacaMod = require('../services/alpaca');
      if (!alpacaMod.enabled) return res.json([]);
      const timeframe = req.query.timeframe || '5Min';
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 78, 1), 200);
      const bars = await alpacaMod.getIntradayBars(ticker, { timeframe, limit });
      res.json(bars);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Market Metrics API ──────────────────────────────────────────────
  app.get('/api/metrics/:ticker', async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const { getMetrics } = require('../services/market-metrics');
      const metrics = await getMetrics(ticker);
      res.json(metrics);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // HFT signals — book skew, VWAP, aggression, composite conviction
  app.get('/api/signal/:ticker', (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });

      // Tier 1: Theta Data Live signal
      let signal = null;
      try {
        const tdLive = require('../services/thetadata-live');
        if (tdLive.enabled && typeof tdLive.getSignal === 'function') {
          signal = tdLive.getSignal(ticker);
        }
      } catch { /* fallback */ }

      // Tier 2: Databento signal
      if (!signal) {
        try {
          const live = require('../services/databento');
          signal = live.getSignal(ticker);
        } catch { /* */ }
      }

      res.json(signal || { error: 'No signal data yet (market may be closed)' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Institutional sweep orders (intermarket sweeps detected from live OPRA stream)
  app.get('/api/sweeps', (req, res) => {
    try {
      const live = require('../services/databento');
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      res.json({ sweeps: live.getSweeps(limit) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Recent audit log entries (JSON)
  app.get('/api/audit', (req, res) => {
    const count = Math.min(parseInt(req.query.count) || 50, 200);
    const category = req.query.cat || null;
    res.json({
      entries: auditLog.getRecent(count, category),
      stats: auditLog.getStats(),
    });
  });

  // ── New GEX API Routes (Squeeze, Scan, Charm, MaxPain) ──────────────

  // Squeeze score: combines short interest + call wall strength + GEX ramp
  app.get('/api/gex/squeeze/:ticker', async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (req.tier !== 'pro' && !['SPY', 'QQQ', 'IWM'].includes(ticker)) {
        return res.status(403).json({ error: 'upgrade_required', message: 'Pro subscription required for all tickers. Upgrade at /api/stripe/checkout?plan=pro' });
      }
      if (!gexLiveComps) return res.status(500).json({ error: 'GEX computations not available' });

      // Need heatmap data + short interest
      const { _fetchHeatmapDataExport } = require('./gex-heatmap');
      const [heatmapData, shortInterest] = await Promise.all([
        _fetchHeatmapDataExport(ticker, 20, null),
        finnhub && finnhub.enabled ? finnhub.getShortInterest(ticker) : Promise.resolve(null),
      ]);

      const squeeze = gexLiveComps.computeSqueezeScore(heatmapData, shortInterest);
      res.json(squeeze);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Dealer Hedge Pressure ───────────────────────────────────────────
  const dealerPressureEngine = require('../services/dealer-pressure-engine');
  const _pressureSessions = {}; // per-ticker in-memory session state

  app.get('/api/dealer-pressure/:ticker', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      // Any ticker with 0DTE options supported — chain availability depends on ThetaData

      // Get or create session
      const today = new Date().toISOString().slice(0, 10);
      if (!_pressureSessions[ticker] || _pressureSessions[ticker].sessionDate !== today) {
        _pressureSessions[ticker] = dealerPressureEngine.createSession(ticker);
      }
      const session = _pressureSessions[ticker];

      // Fetch chain (30s cache in thetadata.js) — 0DTE only
      const thetadata = require('../services/thetadata');
      const chain = await thetadata.getFullChainWithGreeks(ticker, '*', { maxDte: 0 });
      if (!chain || !chain.length) return res.json({ error: 'No chain data available', ticker });

      // Get spot price
      const spot = await getSpotPrice(ticker) || (chain[0] && chain[0].underlyingPrice) || null;
      if (!spot) return res.status(500).json({ error: 'Could not fetch spot price' });

      // Compute pressure
      const result = dealerPressureEngine.computeHedgePressure(
        chain, spot, session.prevSpot, session.prevIV, session
      );

      // Update session
      dealerPressureEngine.updateSession(session, chain, spot);

      res.json(result);
    } catch (err) {
      log.error('dealer-pressure error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Dealer Pressure AI Prediction ────────────────────────────────────
  const _dpPredictionCache = {};
  app.get('/api/dealer-pressure/:ticker/prediction', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });

      // Cache for 60s
      const cached = _dpPredictionCache[ticker];
      if (cached && Date.now() - cached.ts < 60000) return res.json(cached.data);

      // Fetch current pressure data
      const today = new Date().toISOString().slice(0, 10);
      if (!_pressureSessions[ticker] || _pressureSessions[ticker].sessionDate !== today) {
        _pressureSessions[ticker] = dealerPressureEngine.createSession(ticker);
      }
      const session = _pressureSessions[ticker];
      const thetadata = require('../services/thetadata');
      const chain = await thetadata.getFullChainWithGreeks(ticker, '*', { maxDte: 0 });
      if (!chain || !chain.length) return res.json({ prediction: 'No chain data available for prediction.' });
      const spot = await getSpotPrice(ticker) || (chain[0] && chain[0].underlyingPrice) || null;
      if (!spot) return res.json({ prediction: 'Waiting for spot price...' });

      const result = dealerPressureEngine.computeHedgePressure(chain, spot, session.prevSpot, session.prevIV, session);
      dealerPressureEngine.updateSession(session, chain, spot);

      const a = result.aggregate || {};
      const regime = result.regime ? result.regime.regime : 'unknown';
      const inst = result.instability || {};
      const conf = result.confidence || {};

      const context = `${ticker} at $${spot.toFixed(2)}. Net direction: ${a.netDirection || 'NEUTRAL'}. Total pressure: $${((a.totalPressure_usd || 0) / 1e6).toFixed(2)}M. Regime: ${regime}. Instability: ${(inst.instabilityScore || 0).toFixed(2)}. Confidence: ${(conf.confidence || 0).toFixed(0)}% (${conf.label || 'unknown'}). Top buy strikes: ${(a.topBuyStrikes || []).map(s => '$' + s).join(', ') || 'none'}. Top sell strikes: ${(a.topSellStrikes || []).map(s => '$' + s).join(', ') || 'none'}. Flip strike: ${a.flipStrike ? '$' + a.flipStrike : 'none'}. Gamma: ${a.gammaComponent_pct || 0}%, Charm: ${a.charmComponent_pct || 0}%, Vanna: ${a.vannaComponent_pct || 0}%.`;

      const billySystem = 'You are Billy, a sharp quantitative trading analyst for SharkQuant. Given 0DTE dealer pressure data, give a 1-2 sentence prediction about what dealers are likely to do in the next 30-60 minutes. Be specific about price levels when possible. No disclaimers, no "this is not financial advice". Speak with conviction. Use trader language.';

      let prediction;
      const config = require('../config');
      const llmChoice = (config.briefingLLM || process.env.BRIEFING_LLM || 'ollama').toLowerCase();

      if (llmChoice === 'claude') {
        const Anthropic = require('@anthropic-ai/sdk');
        const client = new Anthropic();
        const response = await client.messages.create({
          model: config.briefingClaudeModel || 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: billySystem,
          messages: [{ role: 'user', content: context }],
        });
        prediction = response.content[0]?.text || 'No prediction available.';
      } else {
        // Ollama (default)
        const { Ollama } = require('ollama');
        const ollamaOpts = { host: config.ollamaHost };
        const ollamaKey = config.ollamaApiKey2 || config.ollamaApiKey;
        if (ollamaKey) ollamaOpts.headers = { Authorization: `Bearer ${ollamaKey}` };
        const ollama = new Ollama(ollamaOpts);
        const chatRes = await ollama.chat({
          model: config.ollamaModel,
          stream: false,
          messages: [
            { role: 'system', content: billySystem },
            { role: 'user', content: context },
          ],
        });
        prediction = chatRes.message?.content || 'No prediction available.';
      }
      const data = { prediction, ticker, ts: Date.now() };
      _dpPredictionCache[ticker] = { data, ts: Date.now() };
      res.json(data);
    } catch (err) {
      log.error('dealer-pressure prediction error:', err.message);
      res.json({ prediction: 'Billy is thinking...', error: err.message });
    }
  });

  // Multi-ticker scan: aggregate GEX summaries
  app.get('/api/gex/scan', async (req, res) => {
    try {
      if (!gexLiveComps) return res.status(500).json({ error: 'GEX computations not available' });

      const tickersParam = req.query.tickers || 'SPY,QQQ,IWM,AAPL,TSLA,NVDA,AMZN,META';
      const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase()).filter(Boolean).slice(0, 15);

      const { _fetchHeatmapDataExport } = require('./gex-heatmap');
      const results = await Promise.allSettled(
        tickers.map(async (ticker) => {
          const data = await _fetchHeatmapDataExport(ticker, 15, null);
          return gexLiveComps.buildScanRow(data);
        })
      );

      const rows = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      // Sort by absolute net GEX (most extreme first)
      rows.sort((a, b) => Math.abs(b.netGEX) - Math.abs(a.netGEX));

      res.json({
        tickers: rows.map(r => r.ticker),
        count: rows.length,
        rows,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Charm analysis: detailed delta decay profile
  app.get('/api/gex/charm/:ticker', async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (req.tier !== 'pro' && !['SPY', 'QQQ', 'IWM'].includes(ticker)) {
        return res.status(403).json({ error: 'upgrade_required', message: 'Pro subscription required for all tickers. Upgrade at /api/stripe/checkout?plan=pro' });
      }
      if (!gexLiveComps) return res.status(500).json({ error: 'GEX computations not available' });

      const { _fetchHeatmapDataExport } = require('./gex-heatmap');
      const heatmapData = await _fetchHeatmapDataExport(ticker, 20, null);
      const charm = gexLiveComps.computeDetailedCharm(heatmapData);
      res.json(charm);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Max pain analysis: detailed per-expiry pain levels
  app.get('/api/gex/maxpain/:ticker', async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (req.tier !== 'pro' && !['SPY', 'QQQ', 'IWM'].includes(ticker)) {
        return res.status(403).json({ error: 'upgrade_required', message: 'Pro subscription required for all tickers. Upgrade at /api/stripe/checkout?plan=pro' });
      }
      if (!gexLiveComps) return res.status(500).json({ error: 'GEX computations not available' });

      const { _fetchHeatmapDataExport } = require('./gex-heatmap');
      const heatmapData = await _fetchHeatmapDataExport(ticker, 20, null);
      const maxPain = gexLiveComps.computeDetailedMaxPain(heatmapData);
      res.json(maxPain);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Short interest data (from Finnhub)
  app.get('/api/gex/shortinterest/:ticker', async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (req.tier !== 'pro' && !['SPY', 'QQQ', 'IWM'].includes(ticker)) {
        return res.status(403).json({ error: 'upgrade_required', message: 'Pro subscription required for all tickers. Upgrade at /api/stripe/checkout?plan=pro' });
      }
      if (!finnhub || !finnhub.enabled) {
        return res.json({ error: 'Finnhub not configured (set FINNHUB_API_KEY)', shortInterest: 0, shortInterestPct: 0 });
      }
      const data = await finnhub.getShortInterest(ticker);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Gamma Corridor API (Gamma Structure Engine) ─────────────────────────

  // GET /api/gamma/corridor/:ticker — latest full result
  app.get('/api/gamma/corridor/:ticker', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const orch = getGammaStructureOrchestrator();
      if (!orch) return res.status(503).json({ error: 'Gamma Structure Engine not available' });
      const data = orch.getLatest(ticker);
      if (!data) return res.status(404).json({ error: 'No data available yet — engine warming up' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/gamma/corridor/:ticker/stream — SSE stream for real-time corridor updates
  app.get('/api/gamma/corridor/:ticker/stream', requireAuth, (req, res) => {
    const ticker = validateTicker(req.params.ticker);
    if (!ticker) { res.status(400).end(); return; }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const orch = getGammaStructureOrchestrator();
    if (!orch) {
      res.write('event: error\ndata: {"error":"Gamma Structure Engine not available"}\n\n');
      res.end();
      return;
    }

    // Send latest cached state immediately so client has something on connect
    const latest = orch.getLatest(ticker);
    if (latest) res.write(`event: structure_full\ndata: ${JSON.stringify(latest)}\n\n`);

    const unsubscribe = orch.addListener((eventType, data) => {
      if (data && data.ticker === ticker) {
        res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    });

    // SSE keepalive ping every 30s to prevent proxy timeouts
    const ping = setInterval(() => res.write(': ping\n\n'), 30_000);

    req.on('close', () => {
      clearInterval(ping);
      unsubscribe();
    });
  });

  // GET /api/gamma/corridor/:ticker/history — historical snapshots and events for replay
  app.get('/api/gamma/corridor/:ticker/history', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const { from, to } = req.query;
      if (!from || !to) return res.status(400).json({ error: 'from and to query params required (ISO timestamps)' });
      let pool;
      try { pool = require('../screener/db').getPool(); } catch {
        return res.status(503).json({ error: 'Database not available' });
      }
      const [egexRows, eventRows] = await Promise.all([
        pool.query(
          'SELECT * FROM effective_gex_snapshots WHERE ticker = $1 AND ts BETWEEN $2 AND $3 ORDER BY ts',
          [ticker, from, to]
        ),
        pool.query(
          'SELECT * FROM gamma_structure_events WHERE ticker = $1 AND ts BETWEEN $2 AND $3 ORDER BY ts',
          [ticker, from, to]
        ),
      ]);
      res.json({ snapshots: egexRows.rows, events: eventRows.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Chart bars endpoint (historical backfill for live price chart) ──
  // Merges historical baseline with live streaming data so both 1m and 5m
  // always show a full chart with consistent, up-to-date prices.

  app.get('/api/chart/bars/:ticker', async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const tf = req.query.tf === '5m' ? '5m' : '1m';
      const limit = Math.min(parseInt(req.query.limit) || 390, 1000);

      // Try live Databento candles from Redis stream first (fast path)
      let live;
      try { live = require('../services/databento'); } catch { live = null; }
      if (live && live.getCandles) {
        const liveBars = live.getCandles(ticker, tf);
        if (liveBars.length > 0) {
          // If we have enough live bars, return them immediately.
          // If sparse, backfill with historical so the chart has full context.
          if (liveBars.length >= 10) {
            return res.json({ ticker, tf, bars: liveBars.slice(-limit), source: 'databento-live' });
          }
          // Sparse live data — try to backfill with historical bars
          let chartService;
          try { chartService = require('../services/chart'); } catch { chartService = null; }
          if (chartService) {
            try {
              const hist = await chartService.fetchBars(ticker, tf);
              const histBars = hist.map(b => ({
                t: new Date(b.date).getTime(),
                o: b.open, h: b.high, l: b.low, c: b.close, v: b.volume,
              }));
              const liveStart = liveBars[0].t;
              const older = histBars.filter(b => b.t < liveStart);
              const merged = [...older, ...liveBars];
              return res.json({ ticker, tf, bars: merged.slice(-limit), source: 'merged' });
            } catch { /* historical unavailable — use sparse live data as-is */ }
          }
          return res.json({ ticker, tf, bars: liveBars.slice(-limit), source: 'databento-live' });
        }
      }

      // No live data — Historical: Databento Historical API (primary) → Alpaca (fallback)
      let chartService;
      try { chartService = require('../services/chart'); } catch { chartService = null; }
      if (chartService) {
        const bars = await chartService.fetchBars(ticker, tf);
        const source = bars._source || 'databento';
        const normalized = bars.slice(-limit).map(b => ({
          t: new Date(b.date).getTime(),
          o: b.open, h: b.high, l: b.low, c: b.close, v: b.volume,
        }));
        return res.json({ ticker, tf, bars: normalized, source });
      }

      res.json({ ticker, tf, bars: [], source: 'none' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Exposure Engine Routes ─────────────────────────────────────────────

  let exposureEngine = null;
  try { exposureEngine = require('../services/exposure-engine'); } catch { exposureEngine = null; }

  const FREE_TICKERS = ['SPY', 'QQQ', 'IWM'];

  app.get('/api/exposure/:ticker', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (!FREE_TICKERS.includes(ticker) && req.tier !== 'pro') {
        return res.status(403).json({ error: 'Pro tier required for this ticker' });
      }
      if (!exposureEngine) return res.status(503).json({ error: 'Exposure engine not available' });

      // Try cached first
      let snapshot = exposureEngine.getCached(ticker);
      if (!snapshot) {
        // Compute from live chain data — Theta Data first, then Databento fallback
        try {
          let chain = null, spotPrice = null;

          // Tier 1: Theta Data Live
          try {
            const tdLive = require('../services/thetadata-live');
            if (tdLive.enabled && tdLive.hasDataFor(ticker)) {
              const exps = tdLive.getExpirations(ticker);
              spotPrice = tdLive.getSpotPrice(ticker);
              if (exps && exps.length > 0 && spotPrice) {
                const today = new Date().toISOString().slice(0, 10);
                const nearExps = exps.filter(d => d >= today).slice(0, 6);
                let allContracts = [];
                for (const exp of nearExps) {
                  const contracts = tdLive.getOptionsChain(ticker, exp, spotPrice);
                  if (contracts && contracts.length) allContracts = allContracts.concat(contracts);
                }
                if (allContracts.length > 0) chain = allContracts;
              }
            }
          } catch { /* Theta fallback */ }

          // Tier 2: Databento Live
          if (!chain) {
            let databentoLive = null;
            try { databentoLive = require('../services/databento-live'); } catch {}
            if (!databentoLive) try { databentoLive = require('../services/databento-redis'); } catch {}

            if (databentoLive && databentoLive.getExpirations && databentoLive.getOptionsChain) {
              const exps = databentoLive.getExpirations(ticker);
              if (!spotPrice) spotPrice = await getSpotPrice(ticker);
              if (exps && exps.length > 0 && spotPrice) {
                const today = new Date().toISOString().slice(0, 10);
                const nearExps = exps.filter(d => d >= today).slice(0, 6);
                let allContracts = [];
                for (const exp of nearExps) {
                  const contracts = databentoLive.getOptionsChain(ticker, exp, spotPrice);
                  if (contracts && contracts.length) allContracts = allContracts.concat(contracts);
                }
                if (allContracts.length > 0) chain = allContracts;
              }
            }
          }

          if (!spotPrice) spotPrice = await getSpotPrice(ticker);

          if (chain && chain.length > 0 && spotPrice) {
            snapshot = exposureEngine.compute(ticker, { chain, spot: spotPrice });
          }
        } catch (computeErr) {
          log.warn(`Exposure compute failed for ${ticker}: ${computeErr.message}`);
        }
      }
      res.json(snapshot || { ticker, error: 'No exposure data available' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/exposure/:ticker/trend', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (!exposureEngine) return res.status(503).json({ error: 'Exposure engine not available' });
      const cached = exposureEngine.getCached(ticker);
      res.json(cached && cached.trends ? cached.trends : { ticker, trends: null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Market State Routes (unified signals) ────────────────────────────

  const marketState = require('../services/market-state');
  const structureAlerts = require('../services/structure-alerts');

  app.get('/api/market-state/:ticker', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      let state = marketState.get(ticker);
      // On-demand build if no cached state exists
      if (!state) {
        try { state = await marketState.update(ticker); } catch (e) { /* silent */ }
      }
      if (!state) return res.json({ ticker, available: false });
      // Strip internal fields for non-admin
      const { _dealerIntel, _convexity, _metrics, ...publicState } = state;
      res.json({ ticker, available: true, state: publicState });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/market-state/:ticker/full', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const state = marketState.get(ticker);
      if (!state) return res.json({ ticker, available: false });
      res.json({ ticker, available: true, state });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/market-state/traces', requireAuth, (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      res.json({ traces: marketState.getTraces(limit) });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Compression pocket backtest log
  app.get('/api/market-state/compression-log', requireAuth, (req, res) => {
    try {
      const log = marketState.getCompressionLog();
      const ticker = req.query.ticker?.toUpperCase();
      const filtered = ticker ? log.filter(e => e.ticker === ticker) : log;
      res.json({ count: filtered.length, entries: filtered });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Session forecast endpoint
  app.get('/api/market-state/regime-shift-log', requireAuth, (req, res) => {
    try {
      const sf = require('../services/session-forecast');
      const log = sf.getRegimeShiftLog();
      const ticker = req.query.ticker?.toUpperCase();
      const filtered = ticker ? log.filter(e => e.ticker === ticker) : log;
      res.json({ count: filtered.length, entries: filtered.slice(-100) });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/market-state/session-snapshot/:ticker', requireAuth, (req, res) => {
    try {
      const ss = require('../services/session-snapshot');
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const date = req.query.date;
      const snapshot = date ? ss.getSessionByDate(ticker, date) : ss.getLastSession(ticker);
      res.json({ ticker, snapshot });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/market-state/forecast-log', requireAuth, (req, res) => {
    try {
      const sf = require('../services/session-forecast');
      const log = sf.getForecastLog();
      const ticker = req.query.ticker?.toUpperCase();
      const filtered = ticker ? log.filter(e => e.ticker === ticker) : log;
      res.json({ count: filtered.length, entries: filtered.slice(-100) });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/market-state/:ticker/forecast', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const state = marketState.get(ticker);
      if (!state) return res.json({ ticker, forecast: null, reason: 'no state' });
      res.json({ ticker, forecast: state.sessionForecast || null });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ── MarketStateEngine API routes ──
  app.get('/api/market-state/:ticker/engine', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const state = marketState.get(ticker);
      if (!state?.engine) return res.json({ ticker, engine: null, reason: 'no engine data' });
      res.json({ ticker, engine: state.engine });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/market-state/:ticker/replay', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const date = req.query.date || new Date().toISOString().slice(0, 10);
      const replay = require('../services/replay-engine');
      res.json({ ticker, date, replay: replay.replayDay(ticker, date) });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/market-state/:ticker/audit', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const date = req.query.date || new Date().toISOString().slice(0, 10);
      const replay = require('../services/replay-engine');
      res.json({ ticker, date, audit: replay.auditForecast(ticker, date) });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/system/health', requireAuth, (req, res) => {
    try {
      const tickers = ['SPY', 'QQQ', 'IWM', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'META', 'AMZN', 'GOOGL'];
      const results = {};
      for (const t of tickers) {
        const state = marketState.get(t);
        results[t] = state?.engine?.health || { status: 'UNKNOWN', reason: 'no engine data' };
      }
      res.json({ timestamp: Date.now(), tickers: results });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Backtest stats endpoint (public — used by landing page proof section)
  app.get('/api/backtest/stats', async (req, res) => {
    try {
      const { getPool } = require('../screener/db');
      const pool = getPool();
      if (!pool) return res.json({ error: 'no db' });

      const { rows } = await pool.query(`
        SELECT ticker,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE signal_correct) as signal_correct,
          COUNT(*) FILTER (WHERE mode_correct) as mode_correct,
          COUNT(*) FILTER (WHERE score_correct) as score_correct,
          ROUND(AVG(daily_range_pct)::numeric, 6) as avg_range,
          MIN(date) as earliest,
          MAX(date) as latest
        FROM backtest_results
        WHERE ticker IN ('SPY', 'QQQ')
        GROUP BY ticker
        ORDER BY ticker
      `);

      const bySignal = await pool.query(`
        SELECT ticker, shark_signal,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE signal_correct) as correct,
          ROUND(AVG(daily_return_pct)::numeric, 6) as avg_return
        FROM backtest_results
        WHERE ticker IN ('SPY', 'QQQ')
        GROUP BY ticker, shark_signal
        ORDER BY ticker, total DESC
      `);

      res.json({
        summary: rows,
        bySignal: bySignal.rows,
        generatedAt: new Date().toISOString(),
      });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Trade thesis endpoint (reads from MarketState only)
  const { generateThesis } = require('../services/trade-thesis');
  app.get('/api/trade-thesis/:ticker', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      const thesis = generateThesis(ticker);
      res.json({ ticker, thesis });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/structure-alerts', requireAuth, (req, res) => {
    try {
      const since = parseInt(req.query.since) || 0;
      const alerts = since ? structureAlerts.getAlertsSince(since) : structureAlerts.getAlerts(20);
      res.json({ alerts });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // SSE stream for real-time structure alerts
  app.get('/api/structure-alerts/stream', requireAuth, (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('data: {"type":"connected"}\n\n');

    const handler = (alert) => {
      res.write(`data: ${JSON.stringify(alert)}\n\n`);
    };
    structureAlerts.on('alert', handler);

    req.on('close', () => {
      structureAlerts.removeListener('alert', handler);
    });
  });

  // ── Regime Engine Routes ──────────────────────────────────────────────

  let regimeEngine = null;
  try { regimeEngine = require('../services/regime-engine'); } catch { regimeEngine = null; }

  app.get('/api/regime/:ticker', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (!FREE_TICKERS.includes(ticker) && req.tier !== 'pro') {
        return res.status(403).json({ error: 'Pro tier required for this ticker' });
      }
      if (!regimeEngine) return res.status(503).json({ error: 'Regime engine not available' });

      // Use shared cached GEX — avoid creating a new engine per request
      const gex = isWeekendET() ? null : await getCachedGEXAnalysis(ticker);

      // Get exposure
      let exposure = null;
      if (exposureEngine) {
        exposure = exposureEngine.getCached(ticker);
      }

      // Classify regime from all signals
      const verdict = regimeEngine.classify({ gex, exposure });
      res.json(verdict);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/regime/:ticker/strikes', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (!regimeEngine) return res.status(503).json({ error: 'Regime engine not available' });
      res.json(regimeEngine.getStrikeHistory(ticker));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Conviction Scanner Route ──────────────────────────────────────────

  let convictionScanner = null;
  try { convictionScanner = require('../services/conviction-scanner'); } catch { convictionScanner = null; }

  app.get('/api/scanner', requireAuth, (req, res) => {
    try {
      if (req.tier !== 'pro') {
        return res.status(403).json({ error: 'Pro tier required' });
      }
      if (!convictionScanner) return res.status(503).json({ error: 'Scanner not available' });
      res.json(convictionScanner.getLatest());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Trade Cards API (simplified retail-friendly trade ideas) ────────

  let _tradeCardTargetEngine = null;

  app.get('/api/trade-cards/:ticker', requireAuth, async (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (!FREE_TICKERS.includes(ticker) && req.tier !== 'pro') {
        return res.status(403).json({ error: 'Pro tier required for this ticker' });
      }

      // Get regime data
      let regime = null;
      if (regimeEngine) {
        try {
          const gex = isWeekendET() ? null : await getCachedGEXAnalysis(ticker);
          const exp = exposureEngine ? exposureEngine.getCached(ticker) : null;
          regime = regimeEngine.classify({ gex, exposure: exp });
        } catch { /* non-fatal */ }
      }

      // Get GEX targets + trade suggestions
      let targets = null;
      try {
        const gamma = require('../services/gamma');
        const GEXTargetEngine = require('../services/gex-targets');
        if (!_tradeCardTargetEngine) {
          const gexEng = getSharedGEXEngine();
          try { const dbn = require('../services/databento'); if (dbn.client) gexEng.setLiveClient(dbn.client); } catch {}
          _tradeCardTargetEngine = new GEXTargetEngine(gamma, gexEng);
        }
        targets = await _tradeCardTargetEngine.analyze(ticker);
      } catch { /* non-fatal */ }

      // Transform into simple trade cards
      const cards = _buildTradeCards(ticker, targets, regime);
      res.json(cards);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  function _buildTradeCards(ticker, targets, regime) {
    const suggestions = targets && targets.tradeSuggestions ? targets.tradeSuggestions : [];
    const spot = targets ? targets.spot : 0;
    const walls = targets ? targets.walls : null;
    const gammaFlip = targets ? targets.gammaFlip : null;
    const bullTargets = targets ? targets.bullishTargets || [] : [];
    const bearTargets = targets ? targets.bearishTargets || [] : [];

    // Determine market type from regime
    const regimeLabel = (regime && regime.regime) || (targets && targets.regime && targets.regime.label) || '';
    const regimeLower = regimeLabel.toLowerCase();
    let marketType = 'Unclear';
    if (regimeLower.includes('short') || regimeLower.includes('breakout')) {
      const bias = (regime && regime.bias) || '';
      if (bias.toLowerCase().includes('bear')) marketType = 'Trending Down';
      else if (bias.toLowerCase().includes('bull')) marketType = 'Trending Up';
      else marketType = 'Trending';
    } else if (regimeLower.includes('long') || regimeLower.includes('pin') || regimeLower.includes('stable')) {
      marketType = 'Range';
    } else if (regimeLower.includes('fragile') || regimeLower.includes('chop') || regimeLower.includes('neutral')) {
      marketType = 'Chop';
    }

    // Filter to tradeable signals only (conviction >= 6, action !== SKIP)
    const tradeable = suggestions.filter(s =>
      s.action !== 'SKIP' && (s.conviction >= 6 || s.confidence >= 50)
    );

    // If nothing tradeable, return no-trade
    if (tradeable.length === 0 || !spot) {
      let reason = 'The market is currently stuck between major support and resistance levels. This usually causes sideways movement. Waiting for a breakout provides a better opportunity.';
      if (marketType === 'Chop') {
        reason = 'Market conditions are choppy with no clear direction. Options positioning is mixed, making directional trades risky. Wait for a cleaner setup.';
      }
      return { noTrade: true, reason, marketType, ticker, spot };
    }

    // Build max 3 cards
    const rankLabels = ['Top Play', 'Alternative Setup', 'Backup Setup'];
    const cards = tradeable.slice(0, 3).map((sig, idx) => {
      const isPut = (sig.type || '').toUpperCase() === 'PUT';
      const strike = sig.strike;
      const distPct = Math.abs(strike - spot) / spot * 100;

      // Entry condition
      let entry;
      if (isPut) {
        const entryLevel = _findEntryLevel(spot, strike, walls, gammaFlip, 'bearish');
        entry = `If ${ticker} breaks below ${entryLevel.toFixed(2)}`;
      } else {
        const entryLevel = _findEntryLevel(spot, strike, walls, gammaFlip, 'bullish');
        entry = `If ${ticker} breaks above ${entryLevel.toFixed(2)}`;
      }

      // Targets from bullish/bearish target arrays
      const targetArr = isPut ? bearTargets : bullTargets;
      const firstTarget = targetArr.length > 0 ? targetArr[0].strike : strike;
      const mainTarget = targetArr.length > 1 ? targetArr[1].strike : strike;

      // Stop loss from opposing wall or gamma flip
      let stopLoss;
      if (isPut) {
        const callWall = walls && walls.callWalls && walls.callWalls[0] ? walls.callWalls[0].strike : null;
        const stopLevel = callWall && callWall > spot ? callWall : (gammaFlip && gammaFlip > spot ? gammaFlip : spot * 1.005);
        stopLoss = `Exit if ${ticker} moves back above ${Number(stopLevel).toFixed(2)}`;
      } else {
        const putWall = walls && walls.putWalls && walls.putWalls[0] ? walls.putWalls[0].strike : null;
        const stopLevel = putWall && putWall < spot ? putWall : (gammaFlip && gammaFlip < spot ? gammaFlip : spot * 0.995);
        stopLoss = `Exit if ${ticker} drops below ${Number(stopLevel).toFixed(2)}`;
      }

      // Confidence label
      let confidence = 'Medium';
      if (sig.conviction >= 8 || sig.confidence >= 75) confidence = 'High';
      else if (sig.conviction < 6 && sig.confidence < 50) confidence = 'Low';

      // Timeframe from distance
      let timeframe = '30-60 minutes';
      if (distPct < 0.5) timeframe = '15-30 minutes';
      else if (distPct > 1.5) timeframe = '1-3 hours';

      // Plain-English reasoning (strip jargon)
      const why = _simplifyReasoning(sig.reasoning || '', isPut, strike, ticker);

      return {
        rank: rankLabels[idx] || `Setup #${idx + 1}`,
        direction: isPut ? 'PUT' : 'CALL',
        ticker,
        entry,
        targets: { first: firstTarget, main: mainTarget },
        stopLoss,
        why,
        confidence,
        marketType,
        timeframe: `Expected move: ${timeframe}`,
      };
    });

    return { noTrade: false, ticker, spot, marketType, cards };
  }

  function _findEntryLevel(spot, strike, walls, gammaFlip, direction) {
    if (direction === 'bearish') {
      // Find nearest support level between spot and strike
      const candidates = [];
      if (walls && walls.putWalls) {
        walls.putWalls.forEach(w => { if (w.strike < spot && w.strike > strike) candidates.push(w.strike); });
      }
      if (gammaFlip && gammaFlip < spot) candidates.push(gammaFlip);
      // Use nearest support below spot, or midpoint
      if (candidates.length > 0) return Math.max(...candidates);
      return spot - (spot - strike) * 0.2;
    } else {
      const candidates = [];
      if (walls && walls.callWalls) {
        walls.callWalls.forEach(w => { if (w.strike > spot && w.strike < strike) candidates.push(w.strike); });
      }
      if (gammaFlip && gammaFlip > spot) candidates.push(gammaFlip);
      if (candidates.length > 0) return Math.min(...candidates);
      return spot + (strike - spot) * 0.2;
    }
  }

  function _simplifyReasoning(reasoning, isPut, strike, ticker) {
    if (!reasoning || reasoning.length < 5) {
      return isPut
        ? `Large options positioning at ${strike} is acting like a magnet and dealer hedging could push price downward if support breaks.`
        : `Large options positioning at ${strike} is acting like a magnet and dealer hedging could push price upward if resistance breaks.`;
    }
    // Strip common jargon terms
    let simple = reasoning
      .replace(/gamma\s*density/gi, 'options positioning')
      .replace(/short\s*gamma/gi, 'dealer hedging pressure')
      .replace(/long\s*gamma/gi, 'stable dealer positioning')
      .replace(/vanna/gi, 'volatility-driven flow')
      .replace(/charm/gi, 'time-based positioning')
      .replace(/volatility\s*surface/gi, 'options market structure')
      .replace(/GEX\s*magnet/gi, 'price magnet')
      .replace(/stacked\s*wall/gi, 'strong level')
      .replace(/\bGEX\b/gi, 'options exposure')
      .replace(/\bDEX\b/gi, 'dealer exposure')
      .replace(/\bVEX\b/gi, 'volatility exposure')
      .replace(/\bCEX\b/gi, 'correlation exposure')
      .replace(/\bHIRO\b/gi, 'hedging flow')
      .replace(/net\s*negative\s*gamma/gi, 'dealer hedging pressure')
      .replace(/net\s*positive\s*gamma/gi, 'stable dealer positioning')
      .replace(/OI\b/gi, 'open interest')
      .replace(/\bIV\b/g, 'implied volatility')
      .replace(/\bATM\b/g, 'at-the-money')
      .replace(/convexity/gi, 'market structure')
      .replace(/\[FRAGILE\]\s*/gi, 'Caution: ');
    return simple;
  }

  // Start the conviction scanner with its dependencies
  if (convictionScanner && typeof convictionScanner.start === 'function' && !convictionScanner._running) {
    try {
      const GEXEngine = require('../services/gex-engine');
      const gamma = require('../services/gamma');
      const gexEngineInstance = new GEXEngine(gamma);
      const { getMetrics } = require('../services/market-metrics');
      let getFlowFn = null;
      try {
        const dbn = require('../services/databento-live');
        getFlowFn = (ticker) => dbn.getFlow ? dbn.getFlow(ticker) : null;
      } catch { /* no flow */ }

      // GEX snapshot persistence — record every scan result for replay
      const snapshotStore = require('../services/gex-snapshot-store');

      // Wrap analyze into the getRegime/getExposure interface the scanner expects
      const scannerGexAdapter = {
        getRegime: async (ticker) => {
          try {
            const gex = await gexEngineInstance.analyze(ticker);
            // Persist snapshot for replay (fire-and-forget)
            if (gex) snapshotStore.save(ticker, gex).catch(err => log.error('Scanner GEX snapshot save failed', err));
            if (regimeEngine && gex) {
              const exp = exposureEngine ? exposureEngine.getCached(ticker) : null;
              return regimeEngine.classify({ gex, exposure: exp });
            }
            return gex ? { regime: gex.regime?.label, bias: gex.regime?.label, confidence: gex.regime?.confidence, keyLevels: gex.keyLevels, implication: gex.playbook } : null;
          } catch { return null; }
        },
        getExposure: (ticker) => {
          return exposureEngine ? exposureEngine.getCached(ticker) : null;
        },
      };

      // Build aiCall using faster trading Ollama model (not the slow 397B Billy model)
      const scannerAiCall = async (prompt) => {
        const llmMessages = [
          { role: 'system', content: 'You are a professional options strategist. Respond ONLY with valid JSON, no markdown wrapping.' },
          { role: 'user', content: prompt },
        ];
        const llmBody = { messages: llmMessages, max_tokens: 512, temperature: 0.4 };

        // Use trading Ollama (faster model) for scanner, fallback to main Ollama
        const ollamaHost = (config.tradingOllamaHost || config.ollamaHost || '').replace(/\/+$/, '');
        const ollamaKey = config.ollamaApiKey3 || config.tradingOllamaApiKey || config.ollamaApiKey;
        const ollamaModel = config.tradingOllamaModel || config.ollamaModel;

        if (ollamaHost && ollamaKey) {
          try {
            const baseUrl = ollamaHost.includes('/v1') ? ollamaHost : `${ollamaHost}/v1`;
            log.info(`Scanner AI calling ${ollamaModel}...`);
            const resp = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ollamaKey}` },
              body: JSON.stringify({ model: ollamaModel, ...llmBody }),
              signal: AbortSignal.timeout(60000),
            });
            const data = await resp.json();
            if (data.choices && data.choices[0]) {
              const result = (data.choices[0].message.content || '')
                .replace(/<think>[\s\S]*?<\/think>/gi, '')
                .replace(/<\|think\|>[\s\S]*?<\|\/think\|>/gi, '')
                .trim();
              log.info(`Scanner AI OK: ${result.length} chars`);
              return result;
            }
          } catch (err) {
            log.warn(`Scanner AI Ollama failed: ${err.message}`);
          }
        }
        return null;
      };

      // Expand watchlist beyond just SPY/QQQ
      convictionScanner.setWatchlist([
        'SPY', 'QQQ', 'IWM', 'DIA',         // Major ETFs
        'AAPL', 'MSFT', 'NVDA', 'AMZN',      // Mega-cap tech
        'TSLA', 'META', 'GOOGL', 'AMD',       // High-vol names
        'NFLX', 'COIN', 'MARA', 'SMCI',       // Momentum/volatile
      ]);

      convictionScanner.start({
        gexEngine: scannerGexAdapter,
        getMetrics,
        getFlow: getFlowFn,
        aiCall: scannerAiCall,
      });
      log.info('Conviction scanner started with AI enrichment');
    } catch (scannerErr) {
      log.warn(`Could not start conviction scanner: ${scannerErr.message}`);
    }
  }

  // Wire scanner updates to Socket.IO
  if (convictionScanner) {
    convictionScanner.on('update', (ideas) => {
      const io = getIO();
      if (io) io.emit('scanner:update', ideas);
    });
  }

  // ── IV History Route ──────────────────────────────────────────────────

  let ivHistory = null;
  try { ivHistory = require('../services/iv-history'); } catch { ivHistory = null; }

  // Initialize IV History with Postgres persistence + CBOE backfill
  if (ivHistory && ivHistory.initPostgres && process.env.DATABASE_URL) {
    ivHistory.initPostgres(process.env.DATABASE_URL).catch(function(err) {
      log.warn('IV History Postgres init failed: ' + err.message);
    });
  }

  app.get('/api/iv/:ticker', requireAuth, (req, res) => {
    try {
      const ticker = validateTicker(req.params.ticker);
      if (!ticker) return res.status(400).json({ error: 'Invalid ticker' });
      if (!ivHistory) return res.status(503).json({ error: 'IV history not available' });
      const snapshot = ivHistory.getSnapshot(ticker);
      res.json(snapshot || { ticker, current: null, rank: null, percentile: null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Start IV history recording loop (every 5 min, feed from DatabentoLive chain data)
  if (ivHistory) {
    function _recordIV() {
      try {
        for (const ticker of ['SPY', 'QQQ']) {
          let atmIV = null;

          // Tier 1: Theta Data Live
          try {
            const tdLive = require('../services/thetadata-live');
            if (tdLive.enabled && tdLive.hasDataFor(ticker)) {
              const exps = tdLive.getExpirations(ticker);
              const spot = tdLive.getSpotPrice(ticker);
              if (exps && exps.length && spot) {
                const today = new Date().toISOString().slice(0, 10);
                const nearExps = exps.filter(d => d >= today).slice(0, 3);
                let ivSum = 0, ivCount = 0;
                for (const exp of nearExps) {
                  const chain = tdLive.getOptionsChain(ticker, exp, spot);
                  if (!chain || !chain.length) continue;
                  let bestDist = Infinity, bestIV = null;
                  for (const c of chain) {
                    if (!c.impliedVolatility || c.impliedVolatility <= 0) continue;
                    const dist = Math.abs(c.strike - spot);
                    if (dist < bestDist) { bestDist = dist; bestIV = c.impliedVolatility; }
                  }
                  if (bestIV) { ivSum += bestIV; ivCount++; }
                }
                if (ivCount > 0) atmIV = ivSum / ivCount;
              }
            }
          } catch { /* fallback */ }

          // Tier 2: Databento Live
          if (atmIV == null) {
            let databentoLive = null;
            try { databentoLive = require('../services/databento-live'); } catch { /* */ }
            if (!databentoLive) try { databentoLive = require('../services/databento-redis'); } catch { /* */ }
            if (databentoLive && databentoLive.getOptionsChain && databentoLive.getExpirations) {
              const exps = databentoLive.getExpirations(ticker);
              const spot = databentoLive.getSpotPrice ? databentoLive.getSpotPrice(ticker) : null;
              if (exps && exps.length && spot) {
                const today = new Date().toISOString().slice(0, 10);
                const nearExps = exps.filter(d => d >= today).slice(0, 3);
                let ivSum = 0, ivCount = 0;
                for (const exp of nearExps) {
                  const chain = databentoLive.getOptionsChain(ticker, exp, spot);
                  if (!chain || !chain.length) continue;
                  let bestDist = Infinity, bestIV = null;
                  for (const c of chain) {
                    if (!c.impliedVolatility || c.impliedVolatility <= 0) continue;
                    const dist = Math.abs(c.strike - spot);
                    if (dist < bestDist) { bestDist = dist; bestIV = c.impliedVolatility; }
                  }
                  if (bestIV) { ivSum += bestIV; ivCount++; }
                }
                if (ivCount > 0) atmIV = ivSum / ivCount;
              }
            }
          }

          if (atmIV != null) ivHistory.record(ticker, { atmIV });
        }
      } catch { /* silent */ }
    }
    // Record immediately on startup, then every 5 minutes
    setTimeout(_recordIV, 5_000); // 5s delay for Databento to initialize
    setInterval(_recordIV, 5 * 60_000);
    log.info('IV history recording loop started (5 min interval)');
  }

  // ── Billy AI Chat Route ───────────────────────────────────────────────

  const gammaRetrieval = require('../services/gamma-retrieval');

  async function _billyAskHandler(req, res) {
    try {
      const { question, ticker: rawTicker, history } = req.body || {};
      if (!question) return res.status(400).json({ error: 'Question is required' });
      const stream = req.query.stream === '1';

      const ticker = (rawTicker || 'SPY').toUpperCase().replace(/[^A-Z0-9.]/g, '');

      // ── Knowledge base retrieval (always feed to LLM as context) ──
      const { chunks, questionType } = gammaRetrieval.retrieve(question);

      // ── Gather live market context (skip for pure education/platform) ──
      let regime = null;
      const needsLiveData = questionType === 'market' || questionType === 'hybrid';
      if (needsLiveData) {
        try {
          if (regimeEngine) {
            // Use shared cached GEX — avoids creating a new engine + full API chain per chat message
            const gex = isWeekendET() ? null : await getCachedGEXAnalysis(ticker);
            let exposure = null;
            if (exposureEngine) exposure = exposureEngine.getCached(ticker);
            regime = regimeEngine.classify({ gex, exposure });
          }
        } catch (_) {}
      }

      // ── Build system prompt ──
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });
      // Always fetch the ticker's price upfront
      let verifiedPrice = null;
      let priceLabel = '';
      try {
        const gex = isWeekendET() ? null : await getCachedGEXAnalysis(ticker);
        if (gex && gex.spot) {
          verifiedPrice = Number(gex.spot).toFixed(2);
          priceLabel = 'live';
        } else {
          const { getPool } = require('../screener/db');
          const dbPool = getPool();
          const { rows: priceRows } = await dbPool.query(
            `SELECT close, date FROM screener_price_history WHERE ticker = $1 ORDER BY date DESC LIMIT 1`,
            [ticker],
          );
          if (priceRows.length > 0) {
            verifiedPrice = Number(priceRows[0].close).toFixed(2);
            priceLabel = `last close ${priceRows[0].date.toISOString().slice(0, 10)}`;
          }
        }
      } catch (_) {}

      let systemPrompt = `You are Billy, SharkQuant's AI market analyst chatbot. You talk like a smart friend who trades — casual, direct, no fluff. Use short sentences. Drop in emojis occasionally. If someone asks a basic question, explain it simply like you're talking to a friend who just started trading. If they ask something advanced, match their level. Never sound like a textbook or Wikipedia article. Keep answers under 150 words — be punchy, not preachy. You can use slang like "bruh", "ngl", "lowkey" sparingly when it fits. You can use **bold** and bullet points in your responses for readability.
Today is ${dateStr}, current time: ${timeStr} ET.
Trading abbreviations: PT = price target, TP = take profit, SL = stop loss, DTE = days to expiration, OTM/ITM/ATM = out/in/at the money, EOD = end of day, AH = after hours, PM = pre-market.
`;
      if (verifiedPrice) {
        systemPrompt += `\n### VERIFIED PRICE DATA ###\n${ticker} = $${verifiedPrice} (${priceLabel})\nYou MUST use this exact price when discussing ${ticker}. Do NOT use any other price. Do NOT round it differently. Do NOT invent prices for pre-market, after-hours, or any other session. If the user asks about a price you do not have verified data for, say "I don't have that data right now" instead of guessing.\n### END VERIFIED PRICE DATA ###\n`;
      } else {
        systemPrompt += `\nYou do NOT have any verified price data right now. If asked about prices, say "I don't have verified price data right now — check your broker." Do NOT make up or guess any prices.\n`;
      }

      // Web search for real-time questions
      try {
        const qLower = question.toLowerCase();
        const needsSearch = /\b(today|now|current|latest|recent|news|price|stock|market|spy|qqq|what happened|breaking|close|open|pt|target|forecast|earnings|fed|fomc)\b/i.test(qLower);
        if (needsSearch && config.ollamaApiKey) {
          // Build a smarter search query — expand abbreviations and add context
          let searchQuery = question;
          if (/\bpt\b/i.test(question)) searchQuery = question.replace(/\bpt\b/gi, 'price target');
          if (/\b(spy|qqq|iwm|dia)\b/i.test(question) && !/price|close|target/i.test(question)) {
            searchQuery += ' stock price today ' + new Date().toISOString().slice(0, 10);
          }
          const searchResp = await fetch('https://ollama.com/api/web_search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.ollamaApiKey}` },
            body: JSON.stringify({ query: searchQuery, max_results: 3 }),
            signal: AbortSignal.timeout(5000),
          });
          if (searchResp.ok) {
            const searchData = await searchResp.json();
            const results = searchData?.results || searchData?.response || [];
            if (results.length > 0) {
              systemPrompt += `\nWEB SEARCH RESULTS:\n`;
              for (const r of results.slice(0, 3)) {
                systemPrompt += `- ${r.title || ''}: ${(r.snippet || r.content || '').slice(0, 200)}\n`;
              }
              systemPrompt += `Use these search results to give accurate, up-to-date answers. You DO have access to real-time data through web search — never say you don't have access to current data.\n`;
            }
          }
        }
      } catch (_) {}

      if (chunks.length > 0) {
        systemPrompt += `\nREFERENCE KNOWLEDGE:\n`;
        for (const c of chunks) systemPrompt += `[${c.topic}] ${c.content}\n\n`;
        systemPrompt += `Use the reference above as background info. DO NOT copy it verbatim — rephrase everything in your own casual voice. Be conversational, not a textbook.\n`;
      }

      if (needsLiveData) {
        let contextStr = `Ticker: ${ticker}\n`;
        if (verifiedPrice) contextStr += `Price: $${verifiedPrice} (${priceLabel})\n`;
        if (regime) {
          contextStr += `Regime: ${regime.regime || 'unknown'}\nBias: ${regime.bias || 'neutral'}\nImplication: ${regime.implication || 'N/A'}\n`;
          if (regime.keyLevels) contextStr += `Key Levels: ${JSON.stringify(regime.keyLevels)}\n`;
        }
        if (exposureEngine) {
          const exp = exposureEngine.getCached(ticker);
          if (exp) contextStr += `Net GEX: ${exp.gex ? exp.gex.net : 'N/A'}\nNet DEX: ${exp.dex ? exp.dex.net : 'N/A'}\nNet VEX: ${exp.vex ? exp.vex.net : 'N/A'}\n`;
        }
        systemPrompt += `\nLIVE MARKET DATA:\n${contextStr}`;
      }

      // ── Build messages with conversation history ──
      const llmMessages = [{ role: 'system', content: systemPrompt }];
      // Include up to 10 previous messages for conversation memory
      if (Array.isArray(history)) {
        for (const msg of history.slice(-10)) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            llmMessages.push({ role: msg.role, content: String(msg.content || '').slice(0, 500) });
          }
        }
      }
      llmMessages.push({ role: 'user', content: question });

      const llmBody = { messages: llmMessages, max_tokens: 1024, temperature: 0.7 };

      // ── Streaming mode ──
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        let streamed = false;
        let thinkingSent = false;
        const streamBody = { ...llmBody, stream: true };

        // Try Ollama
        const ollamaHost = (config.ollamaHost || '').replace(/\/+$/, '');
        const ollamaKey = config.ollamaApiKey;
        const ollamaModel = config.ollamaModel;
        if (ollamaHost && ollamaKey) {
          try {
            const baseUrl = ollamaHost.includes('/v1') ? ollamaHost : `${ollamaHost}/v1`;
            const resp = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ollamaKey}` },
              body: JSON.stringify({ model: ollamaModel, ...streamBody }),
              signal: AbortSignal.timeout(60000),
            });
            if (resp.ok && resp.body) {
              const reader = resp.body.getReader();
              const decoder = new TextDecoder();
              let buf = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() || '';
                for (const line of lines) {
                  if (!line.startsWith('data: ')) continue;
                  const payload = line.slice(6).trim();
                  if (payload === '[DONE]') continue;
                  try {
                    const chunk = JSON.parse(payload);
                    const delta = chunk.choices?.[0]?.delta;
                    const token = delta?.content;
                    if (token) {
                      const clean = token.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\|think\|>[\s\S]*?<\|\/think\|>/gi, '');
                      if (clean) {
                        if (thinkingSent) { res.write(`data: ${JSON.stringify({ token: '\n\n' })}\n\n`); thinkingSent = false; }
                        res.write(`data: ${JSON.stringify({ token: clean })}\n\n`); streamed = true;
                      }
                    } else if (delta?.reasoning && !thinkingSent) {
                      // Model is thinking — show indicator so user knows it's working
                      res.write(`data: ${JSON.stringify({ token: '_Thinking..._' })}\n\n`);
                      thinkingSent = true; streamed = true;
                    }
                  } catch (_) {}
                }
              }
              if (streamed) { res.write('data: [DONE]\n\n'); res.end(); return; }
            }
          } catch (err) { log.warn(`Billy stream Ollama failed: ${err.message}`); }
        }

        // Fallback — no streaming available
        res.write(`data: ${JSON.stringify({ token: "Yo, my brain's taking a nap rn 😴 Try again in a sec." })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // ── Non-streaming mode (fallback) ──
      let answer = null;

      const ollamaHost = (config.ollamaHost || '').replace(/\/+$/, '');
      const ollamaKey = config.ollamaApiKey;
      const ollamaModel = config.ollamaModel;
      if (ollamaHost && ollamaKey) {
        try {
          const baseUrl = ollamaHost.includes('/v1') ? ollamaHost : `${ollamaHost}/v1`;
          const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ollamaKey}` },
            body: JSON.stringify({ model: ollamaModel, ...llmBody }),
            signal: AbortSignal.timeout(30000),
          });
          const data = await resp.json();
          if (data.choices && data.choices[0]) {
            answer = (data.choices[0].message.content || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\|think\|>[\s\S]*?<\|\/think\|>/gi, '').trim();
          }
          if (answer) log.info(`Billy LLM: Ollama ${ollamaModel} OK (${answer.length} chars)`);
        } catch (err) { log.warn(`Billy LLM Ollama failed: ${err.message}`); }
      }

      if (!answer) answer = `Yo, my brain's taking a nap rn 😴 Try asking again in a sec — I'll be back.`;

      res.json({ answer, source: chunks.length > 0 ? 'knowledge-enhanced' : 'live-data', regime: regime ? regime.regime : null, bias: regime ? regime.bias : null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  app.post('/api/billy/ask', requireAuth, express.json(), _billyAskHandler);
  app.post('/api/gamma/ask', requireAuth, express.json(), _billyAskHandler);

  // ── Edge Engine Routes ────────────────────────────────────────────────

  let edgeEngine = null;
  try { edgeEngine = require('../services/edge-engine'); } catch { edgeEngine = null; }

  let eventAssetGraph = null;
  try { eventAssetGraph = require('../services/edge-engine/event-asset-graph'); } catch { eventAssetGraph = null; }

  // Transform edge_alerts DB rows to camelCase for dashboard
  function _transformAlert(r) {
    return {
      id: r.id,
      ts: r.ts,
      eventNode: r.event_node,
      category: r.event_category,
      alertType: r.alert_type,
      predictionProb: r.prediction_prob,
      predictionShock: r.prediction_shock,
      predictionConf: r.prediction_conf,
      basketIvReaction: r.basket_iv_reaction,
      assetsChecked: r.assets_checked,
      volLagScore: r.vol_lag_score,
      attributionConf: r.attribution_conf,
      finalScore: r.final_score,
      leader: r.leader,
      direction: r.direction,
      suggestedAssets: r.suggested_assets,
      suggestedExpression: r.suggested_expression,
      timeHorizon: r.time_horizon,
      ivOutcome: r.iv_1h_after || r.iv_4h_after || null,
      alertQuality: r.alert_quality,
    };
  }

  app.get('/api/edge/active', requireAuth, async (req, res) => {
    try {
      if (!edgeEngine) return res.status(503).json({ error: 'Edge engine not available' });
      const clusters = edgeEngine.getLatestClusters();
      res.json({
        clusters: clusters.map(c => ({
          eventNode: c.event_node,
          category: c.event_category,
          timeHorizon: c.time_horizon,
          signalType: c.signal_type,
          signalBadge: c.signal_badge,
          edgeScore: c.edge_score,
          allSignals: c.all_signals,
          contractsCount: c.contracts_count,
          contractsMoving: c.contracts_moving_count,
          directionalAgreement: c.directional_agreement,
          convergenceScore: c.convergence_score,
          weightedProbability: c.weighted_probability,
          weightedShock: c.weighted_shock,
          weightedConfidence: c.weighted_confidence,
          basketIvReaction: c.basket_iv_reaction,
          attributionConf: c.attribution_conf,
          leader: c.leader,
          direction: c.direction,
          suggestedAssets: c.suggested_assets,
          suggestedExpression: c.suggested_expression,
          leadContract: c.lead_contract,
          alsoMoving: c.also_moving,
          whaleDollarTotal: c.whale_dollar_total,
          mappedAssetsCount: c.mapped_assets ? c.mapped_assets.length : 0,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/edge/history', requireAuth, async (req, res) => {
    try {
      if (!edgeEngine) return res.status(503).json({ error: 'Edge engine not available' });
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const rows = await edgeEngine.getRecentAlerts(limit);
      res.json({ alerts: rows.map(_transformAlert) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Shared transform for event/feed rows
  function _transformEvent(r) {
    return {
      contractId: r.contract_id,
      eventNode: r.event_node,
      category: r.event_category,
      title: r.title,
      probability: r.probability,
      change1h: r.prob_1h_ago != null ? r.probability - r.prob_1h_ago : null,
      change24h: r.prob_24h_ago != null ? r.probability - r.prob_24h_ago : null,
      confidence: r.confidence,
      shockScore: r._shockScore || 0,
      platform: r.platform,
      volume24h: r.volume_24h,
      liquidity: r.liquidity,
      spread: r.spread,
      bid: r.bid,
      ask: r.ask,
      openInterest: r.open_interest,
      ts: r.ts,
    };
  }

  // Prediction Radar — classified, serious categories only
  app.get('/api/edge/radar', requireAuth, async (req, res) => {
    try {
      if (!edgeEngine) return res.status(503).json({ error: 'Edge engine not available' });
      const rows = await edgeEngine.getRadarEvents();
      res.json({ events: rows.map(_transformEvent) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Raw Market Feed — all tracked contracts
  app.get('/api/edge/feed', requireAuth, async (req, res) => {
    try {
      if (!edgeEngine) return res.status(503).json({ error: 'Edge engine not available' });
      const rows = await edgeEngine.getRawFeed();
      res.json({ events: rows.map(_transformEvent) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Legacy — redirect to radar
  app.get('/api/edge/events', requireAuth, async (req, res) => {
    try {
      if (!edgeEngine) return res.status(503).json({ error: 'Edge engine not available' });
      const rows = await edgeEngine.getRadarEvents();
      res.json({ events: rows.map(_transformEvent) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/edge/graph', requireAuth, (req, res) => {
    try {
      if (!eventAssetGraph) return res.status(503).json({ error: 'Event-asset graph not available' });
      res.json({ nodes: eventAssetGraph.getAllNodes(), graph: eventAssetGraph.toRows() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/edge/whales', requireAuth, async (req, res) => {
    try {
      if (!edgeEngine) return res.json({ signals: [] });
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const rows = await edgeEngine.getWhaleSignals(limit);
      const signals = rows.map(r => ({
        id: r.id,
        ts: r.ts,
        contractId: r.contract_id,
        platform: r.platform,
        eventNode: r.event_node,
        category: r.event_category,
        title: r.title,
        signalType: r.signal_type,
        wallet: r.wallet,
        username: r.username,
        pseudonym: r.pseudonym,
        side: r.side,
        outcome: r.outcome,
        size: r.size,
        dollarValue: r.dollar_value,
        price: r.price,
        tradeCount: r.trade_count,
        probability: r.probability,
        confidence: r.confidence,
        tradeTs: r.trade_ts,
      }));
      res.json({ signals });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Create HTTP server + Socket.IO ────────────────────────────────────

  const server = http.createServer(app);

  // Socket.IO for real-time GEX pushes (replaces SSE polling)
  if (Server) {
    _io = new Server(server, {
      cors: { origin: '*' },
      path: '/ws',
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 60000,    // 60s — generous for Railway's infrastructure
    });

    _io.on('connection', (socket) => {
      log.info(`Socket.IO client connected: ${socket.id}`);

      // Client subscribes to a ticker for live GEX updates
      socket.on('subscribe', (ticker) => {
        const upper = (ticker || 'SPY').toUpperCase().replace(/[^A-Z0-9.]/g, '');
        socket.join(`gex:${upper}`);
        log.info(`Socket.IO ${socket.id} subscribed to gex:${upper}`);

        // Send initial data immediately
        (async () => {
          try {
            const { _fetchHeatmapDataExport } = require('./gex-heatmap');
            const data = await _fetchHeatmapDataExport(upper, 20, null);
            socket.emit('gex:update', data);
          } catch (err) {
            socket.emit('gex:error', { error: err.message });
          }
        })();
      });

      socket.on('unsubscribe', (ticker) => {
        const upper = (ticker || 'SPY').toUpperCase();
        socket.leave(`gex:${upper}`);
      });

      // Chart subscriptions for live price chart
      socket.on('subscribe:chart', (opts) => {
        const ticker = ((opts && opts.ticker) || 'SPY').toUpperCase().replace(/[^A-Z0-9.]/g, '');
        const tf = (opts && opts.tf) || '1m';
        socket.join(`chart:${ticker}:${tf}`);
        log.info(`Socket.IO ${socket.id} subscribed to chart:${ticker}:${tf}`);
      });

      socket.on('unsubscribe:chart', (opts) => {
        const ticker = ((opts && opts.ticker) || 'SPY').toUpperCase();
        const tf = (opts && opts.tf) || '1m';
        socket.leave(`chart:${ticker}:${tf}`);
      });

      // Options Flow room subscriptions
      socket.on('subscribe:flow', (opts) => {
        const flowTicker = ((opts && opts.ticker) || 'SPY').toUpperCase().replace(/[^A-Z0-9.]/g, '');
        socket.join(`flow:${flowTicker}`);
        log.info(`Socket.IO ${socket.id} subscribed to flow:${flowTicker}`);

        // Send initial flow data immediately
        (async () => {
          try {
            // Tier 1: Theta Data Live flow
            const tdLive = require('../services/thetadata-live');
            if (tdLive.enabled && typeof tdLive.getFlow === 'function') {
              const flowData = tdLive.getFlow(flowTicker);
              if (flowData && flowData.tradeCount > 0) {
                socket.emit('flow:update', flowData);
                return;
              }
            }
          } catch (_) { /* fallback */ }
          try {
            // Tier 2: Databento fallback
            const live = require('../services/databento');
            const flowData = live.getFlow(flowTicker);
            if (flowData && flowData.tradeCount > 0) {
              socket.emit('flow:update', flowData);
            }
          } catch (_) { /* not available */ }
        })();
      });

      socket.on('unsubscribe:flow', (opts) => {
        const flowTicker = ((opts && opts.ticker) || 'SPY').toUpperCase();
        socket.leave(`flow:${flowTicker}`);
      });

      // Trading room subscriptions
      socket.on('subscribe:portfolio', () => {
        socket.join('portfolio');
        log.info(`Socket.IO ${socket.id} subscribed to portfolio`);
      });

      socket.on('unsubscribe:portfolio', () => {
        socket.leave('portfolio');
      });

      socket.on('subscribe:trading', () => {
        socket.join('trading');
        log.info(`Socket.IO ${socket.id} subscribed to trading`);
        // Send initial state immediately
        try {
          const engine = require('../services/options-engine');
          // Send real Alpaca positions enriched with manager data
          if (engine.getEnrichedPositions) {
            engine.getEnrichedPositions().then(positions => {
              socket.emit('trading:positions', positions);
            }).catch(err => log.error('Trading positions fetch failed', err));
          }
          if (engine._manager) {
            socket.emit('trading:pnl', { dailyPnL: engine._manager.dailyPnL, closedTrades: engine._manager.closedTrades.length });
          }
          if (engine._lastScanResults) {
            socket.emit('trading:signals', engine._lastScanResults);
          }
          // Cockpit state
          if (engine.getCockpitSettings) {
            socket.emit('trading:settings', engine.getCockpitSettings());
          }
          if (engine.getPendingTrades) {
            socket.emit('trading:pending_list', engine.getPendingTrades());
          }
          if (engine.getActivityLog) {
            socket.emit('trading:activity_log', engine.getActivityLog());
          }
        } catch (_) { /* engine not ready */ }
      });
      socket.on('unsubscribe:trading', () => {
        socket.leave('trading');
      });

      // ── Cockpit Control Events ──────────────────────────────────────
      socket.on('trading:set_mode', (data) => {
        try {
          const engine = require('../services/options-engine');
          const mode = data?.mode === 'manual' ? 'manual' : 'auto';
          engine._mode = mode;
          engine._emitLog('control', 'switch', 'Mode changed to ' + mode.toUpperCase());
          if (mode === 'auto') {
            for (const [, p] of engine._pendingTrades) clearTimeout(p.timer);
            engine._pendingTrades.clear();
            _io.to('trading').emit('trading:pending_list', []);
          }
          _io.to('trading').emit('trading:settings', engine.getCockpitSettings());
        } catch (err) { socket.emit('trading:error', { error: err.message }); }
      });

      socket.on('trading:set_scanning', (data) => {
        try {
          const engine = require('../services/options-engine');
          engine._scanning = !!data?.enabled;
          engine._emitLog('control', engine._scanning ? 'play' : 'pause', 'Scanning ' + (engine._scanning ? 'RESUMED' : 'PAUSED'));
          _io.to('trading').emit('trading:settings', engine.getCockpitSettings());
        } catch (err) { socket.emit('trading:error', { error: err.message }); }
      });

      socket.on('trading:set_conviction', (data) => {
        try {
          const policy = require('../services/policy');
          const val = Math.max(1, Math.min(10, parseInt(data?.value) || 5));
          policy.setConfigKey('options_min_conviction', String(val));
          const engine = require('../services/options-engine');
          engine._emitLog('control', 'dial', 'Conviction threshold set to ' + val);
          _io.to('trading').emit('trading:settings', engine.getCockpitSettings());
        } catch (err) { socket.emit('trading:error', { error: err.message }); }
      });

      socket.on('trading:set_underlyings', (data) => {
        try {
          const tickers = (data?.tickers || []).map(t => t.toUpperCase().trim()).filter(Boolean);
          if (tickers.length === 0) return;
          const policy = require('../services/policy');
          policy.setConfigKey('options_underlyings', tickers.join(','));
          const engine = require('../services/options-engine');
          engine._emitLog('control', 'list', 'Underlyings set to ' + tickers.join(', '));
          _io.to('trading').emit('trading:settings', engine.getCockpitSettings());
        } catch (err) { socket.emit('trading:error', { error: err.message }); }
      });

      socket.on('trading:approve', async (data) => {
        try {
          const engine = require('../services/options-engine');
          const result = await engine.approveTrade(data?.tradeId);
          socket.emit('trading:approve_result', { tradeId: data?.tradeId, ...result });
        } catch (err) { socket.emit('trading:error', { error: err.message }); }
      });

      socket.on('trading:reject', (data) => {
        try {
          const engine = require('../services/options-engine');
          engine.rejectTrade(data?.tradeId);
        } catch (err) { socket.emit('trading:error', { error: err.message }); }
      });

      socket.on('trading:reset_cb', () => {
        try {
          const circuitBreaker = require('../services/circuit-breaker');
          if (!circuitBreaker.isPaused()) {
            socket.emit('trading:error', { error: 'Circuit breaker is not tripped' });
            return;
          }
          circuitBreaker.manualReset();
          const engine = require('../services/options-engine');
          engine._emitLog('control', 'shield', 'Circuit breaker manually reset from War Room');
          _io.to('trading').emit('trading:settings', engine.getCockpitSettings());
        } catch (err) { socket.emit('trading:error', { error: err.message }); }
      });

      // Dealer Pressure live spot subscription
      socket.on('subscribe:dp', (opts) => {
        const dpTicker = ((opts && opts.ticker) || 'QQQ').toUpperCase().replace(/[^A-Z0-9.]/g, '');
        socket.join(`dp:${dpTicker}`);
        log.info(`Socket.IO ${socket.id} subscribed to dp:${dpTicker}`);
        (async () => {
          try {
            const spot = await getSpotPrice(dpTicker);
            if (spot) socket.emit('dp:spot', { ticker: dpTicker, spot, ts: Date.now() });
          } catch (_) {}
        })();
      });
      socket.on('unsubscribe:dp', (opts) => {
        const dpTicker = ((opts && opts.ticker) || 'QQQ').toUpperCase();
        socket.leave(`dp:${dpTicker}`);
      });

      socket.on('disconnect', () => {
        log.info(`Socket.IO client disconnected: ${socket.id}`);
      });
    });

    // Dealer Pressure live spot emitter — push spot prices every 3s to subscribed rooms
    const _dpSpotCache = {};
    setInterval(async () => {
      if (!_io) return;
      const rooms = _io.sockets.adapter.rooms;
      for (const [roomName] of rooms) {
        if (!roomName.startsWith('dp:')) continue;
        const ticker = roomName.slice(3);
        try {
          const spot = await getSpotPrice(ticker);
          if (spot && spot !== _dpSpotCache[ticker]) {
            _dpSpotCache[ticker] = spot;
            _io.to(roomName).emit('dp:spot', { ticker, spot, ts: Date.now() });
          }
        } catch (_) {}
      }
    }, 3000);

    // Wire Databento Live stream to push updates via Socket.IO
    _wireLiveToSocketIO(_io);

    // Forward regime & microstructure updates from options engine to trading room
    try {
      const optionsEngine = require('../services/options-engine');
      if (optionsEngine && optionsEngine.on) {
        optionsEngine.on('regime', (data) => {
          _io.to('trading').emit('trading:regime', data);
        });
        optionsEngine.on('microstructure', (data) => {
          _io.to('trading').emit('trading:microstructure', data);
        });
        optionsEngine.on('vix', (data) => {
          _io.to('trading').emit('trading:vix', data);
        });
      }
    } catch (_) { /* options engine not ready */ }

    // Start Alpaca portfolio polling with Socket.IO
    const alpacaSvc = require('../services/alpaca');
    alpacaSvc.startPolling(_io);

    log.info('Socket.IO initialized on /ws path');

    // ── Alert Manager ──────────────────────────────────────────────────
    const alertManager = require('../services/alert-manager');
    const { createRedisClient } = require('../runtime/redis-client');
    if (process.env.REDIS_URL) {
      createRedisClient(process.env.REDIS_URL).then(function(client) {
        alertManager.init({ io: _io, redis: client, discordClient: discordClient, alertChannelId: process.env.ALERT_CHANNEL_ID });
        require('../services/obs').setRedisClient(client);
        // IV history Postgres persistence (Redis removed — using Postgres now)
      }).catch(function(err) { log.warn('Alert Redis failed: ' + err.message); });
    } else {
      alertManager.init({ io: _io, redis: null, discordClient: discordClient, alertChannelId: process.env.ALERT_CHANNEL_ID });
    }

    // ── Alert Email Digest ─────────────────────────────────────────────
    const { startDigestCron } = require('../services/alert-digest');
    startDigestCron();
  }

  // ── Initialize Daily Briefing ───────────────────────────────────────
  const GEXEngine = require('../services/gex-engine');
  const gammaModule = require('../services/gamma');
  const priceFetcher = require('../tools/price-fetcher');
  // Additional quantitative services for briefing
  const convexityEngine = require('../services/convexity-engine');
  const regimeDetector = require('../services/regime-detector');
  const structuralEngines = require('../services/structural-engines');
  const gammaSqueeze = require('../services/gamma-squeeze');
  const tapeReader = require('../services/tape-reader');

  const GEXTargetEngine = require('../services/gex-targets');
  const sharedEngine = getSharedGEXEngine() || new GEXEngine(gammaModule);
  const gexTargetEngine = new GEXTargetEngine(gammaModule, sharedEngine);

  dailyBriefing.initialize({
    gexEngine: { analyze: (ticker) => getCachedGEXAnalysis(ticker) },
    priceFetcher: priceFetcher,
    gexTargetEngine,
    convexityEngine,
    regimeDetector,
    structuralEngines,
    gammaSqueeze,
    tapeReader,
    flowFn: async (ticker) => {
      // Try Databento live flow first
      try {
        const db = require('../services/databento');
        const liveFlow = db.getFlow(ticker);
        if (liveFlow && liveFlow.tradeCount > 0) {
          return {
            direction: liveFlow.flowDirection || liveFlow.netPremiumDirection || 'N/A',
            netFlow: liveFlow.netFlow || 0,
            bullishCount: liveFlow.callVolume || 0,
            bearishCount: liveFlow.putVolume || 0,
            trades: (liveFlow.largeBlocks || []).map(b => ({
              side: b.side || 'unknown', strike: b.strike, expiration: b.expiry || '',
              size: b.size || 0, premium: b.premium || 0, direction: b.direction || '',
              unusual: (b.premium || 0) > 50000,
            })),
          };
        }
      } catch { /* not available */ }

      // Fallback: Theta Data → Tradier options chain volume
      try {
        const thetadata = require('../services/thetadata');
        if (thetadata.enabled()) {
          const exps = await thetadata.getExpirations(ticker);
          const today = new Date().toISOString().slice(0, 10);
          const nearExp = (exps || []).filter(d => d >= today).slice(0, 2);
          let callVol = 0, putVol = 0, callOI = 0, putOI = 0;
          for (const exp of nearExp) {
            const contracts = await thetadata.getFullChainWithGreeks(ticker, exp);
            if (!contracts) continue;
            for (const c of contracts) {
              if (c.type === 'call') { callVol += c.volume || 0; callOI += c.openInterest || 0; }
              else { putVol += c.volume || 0; putOI += c.openInterest || 0; }
            }
          }
          const totalVol = callVol + putVol;
          if (totalVol > 0) {
            return {
              direction: callVol > putVol * 1.2 ? 'Bullish' : putVol > callVol * 1.2 ? 'Bearish' : 'Neutral',
              netFlow: callVol - putVol,
              bullishCount: callVol,
              bearishCount: putVol,
              callOI, putOI,
              pcRatio: callVol > 0 ? (putVol / callVol).toFixed(2) : 'N/A',
              source: 'thetadata-volume',
            };
          }
        }
      } catch { /* fallback to Tradier */ }
      try {
        const tradier = require('../services/tradier');
        if (!tradier.enabled) return null;
        const expirations = await tradier.getOptionExpirations(ticker);
        const today = new Date().toISOString().slice(0, 10);
        const nearExp = expirations.filter(d => d >= today).slice(0, 2);
        let callVol = 0, putVol = 0, callOI = 0, putOI = 0;
        for (const exp of nearExp) {
          const contracts = await tradier.getOptionsWithGreeks(ticker, exp);
          if (!contracts) continue;
          for (const c of contracts) {
            if (c.type === 'call') { callVol += c.volume || 0; callOI += c.openInterest || 0; }
            else { putVol += c.volume || 0; putOI += c.openInterest || 0; }
          }
        }
        const totalVol = callVol + putVol;
        if (totalVol === 0) return null;
        return {
          direction: callVol > putVol * 1.2 ? 'Bullish' : putVol > callVol * 1.2 ? 'Bearish' : 'Neutral',
          netFlow: callVol - putVol,
          bullishCount: callVol,
          bearishCount: putVol,
          callOI, putOI,
          pcRatio: callVol > 0 ? (putVol / callVol).toFixed(2) : 'N/A',
          source: 'tradier-volume',
        };
      } catch { /* not available */ }
      return null;
    },
    strategiesFn: async (ticker) => {
      try {
        const summary = await getCachedGEXAnalysis(ticker);
        if (!summary) return null;
        const strategies = scoreStrategies(summary);
        return { ticker, spot: summary.spot, regime: summary.regime, strategies };
      } catch { return null; }
    },
  });

  // ── Daily Briefing Cron (9:25 AM ET, weekdays) ──────────────────────
  schedule.scheduleJob({ rule: '25 9 * * 1-5', tz: 'America/New_York' }, async () => {
    try {
      await dailyBriefing.generateBriefing();
      if (_io) _io.emit('briefing:updated');
      log.info('DailyBriefing cron generated briefing successfully');
    } catch (e) { log.error('DailyBriefing cron error:', e.message); }
  });

  // ── Long-Term Factor Screener ETL (02:00 ET, weekdays) ─────────────
  try {
    require('../services/lt-etl').scheduleNightly();
  } catch (e) { log.error('LT-ETL failed to schedule:', e.message); }

  // ── Screener schema init ───────────────────────────────────────────
  if (screenerDB) {
    screenerDB.initSchema().catch(err => log.error('Screener schema init failed:', err.message));
  }

  // ── GEX snapshot capture (builds historical replay data) ──────────
  try {
    const gexBackfill = require('../services/gex-backfill');
    gexBackfill.start();
  } catch (err) {
    log.warn('GEX backfill start failed:', err.message);
  }

  // ── Edge Engine (prediction market + catalyst alerts) ─────────────
  try {
    const edgeEngine = require('../services/edge-engine');
    edgeEngine.start({ io: _io, discordClient });
    log.info('Edge Engine started');
  } catch (err) {
    log.warn(`Edge Engine start failed: ${err.message}`);
  }

  // ── Snapback Signal Engine (real-time tier-ladder signal generation) ──
  try {
    const snapbackEngine = require('../services/snapback-engine');
    snapbackEngine.start();
    log.info('Snapback Signal Engine started');
  } catch (err) {
    log.warn(`Snapback Signal Engine start failed: ${err.message}`);
  }

  // ── HTTP server timeout configuration ───────────────────────────────
  server.keepAliveTimeout = 65_000;   // slightly > common proxy 60s timeout
  server.headersTimeout = 70_000;     // must be > keepAliveTimeout
  server.requestTimeout = 120_000;    // 2 min max for any single request
  server.maxConnections = 500;        // prevent unbounded connection growth

  server.listen(config.port, () => {
    log.info(`Dashboard running at http://localhost:${config.port}`);
  });

  server.on('error', (err) => {
    log.error(`Failed to bind port ${config.port}:`, err.message);
  });

  return app;
}

/**
 * Wire Databento Live stream events to Socket.IO rooms.
 * Pushes real-time GEX updates every 5 seconds when data changes.
 */
function _wireLiveToSocketIO(io) {
  let live;
  try { live = require('../services/databento'); } catch { live = null; }

  const _dirty = new Set(); // tickers with pending changes

  // Wire Databento events if available
  if (live && live.client) {
    live.client.on('statistic', (stat) => {
      if (stat.statType === 9 && stat.underlying) _dirty.add(stat.underlying);
    });
    live.client.on('trade', (trade) => {
      if (trade.underlying) _dirty.add(trade.underlying);
    });
    live.client.on('quote', (quote) => {
      if (quote.underlying && !quote.strike) _dirty.add(quote.underlying);
    });
    live.client.on('tick', (data) => {
      if (data && data.ticker) _dirty.add(data.ticker);
    });
  }

  // Wire Theta Data Live events (primary OPRA stream)
  // Trades are batched per-ticker and flushed every 250ms to avoid DOM thrashing
  const _tradeBuf = new Map();  // ticker → trade[]
  let _tradeFlushTimer = null;

  const MIN_TRADE_PREMIUM = 1000; // $1K floor — skip dust trades server-side

  function flushTradeBuf() {
    for (const [root, trades] of _tradeBuf) {
      const flowRoom = `flow:${root}`;
      const sockets = io.sockets.adapter.rooms.get(flowRoom);
      if (sockets && sockets.size > 0) {
        const filtered = trades.filter(t => {
          // Raw Theta trades have price+size but no premium — compute it
          if (t.premium == null && t.price && t.size) t.premium = t.price * t.size * 100;
          return Math.abs(t.premium || 0) >= MIN_TRADE_PREMIUM;
        });
        if (filtered.length > 0) {
          io.to(flowRoom).emit('flow:trades', filtered);
        }
      }
    }
    _tradeBuf.clear();
    _tradeFlushTimer = null;
  }

  try {
    const tdLive = require('../services/thetadata-live');
    if (tdLive.client) {
      tdLive.client.on('trade', (trade) => {
        if (trade.root) {
          _dirty.add(trade.root);
          // Buffer trades for batched emission
          if (!_tradeBuf.has(trade.root)) _tradeBuf.set(trade.root, []);
          _tradeBuf.get(trade.root).push(trade);
          if (!_tradeFlushTimer) {
            _tradeFlushTimer = setTimeout(flushTradeBuf, 250);
          }
        }
      });
      tdLive.client.on('quote', (quote) => {
        if (quote.root) _dirty.add(quote.root);
      });
    }
  } catch (_) { /* thetadata-live not available */ }

  // Extended hours: mark subscribed tickers dirty every 30s so spot price
  // keeps updating even when Databento OPRA stream is offline (pre-market/after-hours)
  setInterval(() => {
    const rooms = io.sockets.adapter.rooms;
    for (const [roomName] of rooms) {
      if (roomName.startsWith('gex:')) {
        const ticker = roomName.slice(4);
        if (ticker && !_dirty.has(ticker)) _dirty.add(ticker);
      }
    }
  }, 30_000);

  // Push updates every 15 seconds for dirty tickers (reduced from 5s to ease event loop)
  setInterval(async () => {
    if (_dirty.size === 0) return;
    const tickers = [..._dirty];
    _dirty.clear();

    for (const ticker of tickers) {
      // GEX room updates
      const room = `gex:${ticker}`;
      const sockets = io.sockets.adapter.rooms.get(room);
      if (sockets && sockets.size > 0) {
        try {
          const { _fetchHeatmapDataExport } = require('./gex-heatmap');
          const data = await Promise.race([
            _fetchHeatmapDataExport(ticker, 20, null),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Socket push timeout')), 15_000)),
          ]);
          io.to(room).emit('gex:update', data);

          // Emit synthetic tick from GEX spot price (when DBEQ OHLCV unavailable)
          // This keeps charts updating in real-time using Databento OPRA-derived spot
          if (data && data.spotPrice) {
            const tickData = { ticker, t: Date.now(), p: data.spotPrice, v: 0 };
            io.to(`chart:${ticker}:tick`)
              .to(`chart:${ticker}:1m`)
              .to(`chart:${ticker}:5m`)
              .emit('chart:tick', tickData);
            // Also feed into candle builder so getCandles() returns data
            try {
              live.client._onEquityTrade({
                rawSymbol: ticker,
                price: data.spotPrice,
                size: 0,
                t: Date.now(),
              });
            } catch {}
            // Push to GEX spot subscribers
            io.to(`gex:${ticker}`).emit('gex:spot', { ticker, price: data.spotPrice, t: Date.now() });
          }

          // Also push chart levels to any chart subscribers for this ticker
          if (data && (data.callWall || data.putWall || data.gammaFlip || data.maxPain)) {
            const levels = {
              ticker,
              callWall: data.callWall ? data.callWall.strike : null,
              putWall: data.putWall ? data.putWall.strike : null,
              gammaFlip: data.gammaFlip || null,
              maxPain: data.maxPain ? data.maxPain.strike : null,
            };
            for (const tf of ['tick', '1m', '5m']) {
              io.to(`chart:${ticker}:${tf}`).emit('chart:levels', levels);
            }
          }
        } catch (err) {
          io.to(room).emit('gex:error', { error: err.message });
        }
      }

      // Flow room updates
      const flowRoom = `flow:${ticker}`;
      const flowSockets = io.sockets.adapter.rooms.get(flowRoom);
      if (flowSockets && flowSockets.size > 0) {
        try {
          // Tier 1: Theta Data Live flow
          let flowData = null;
          try {
            const tdLive = require('../services/thetadata-live');
            if (tdLive.enabled && typeof tdLive.getFlow === 'function') {
              flowData = tdLive.getFlow(ticker);
            }
          } catch (_) { /* fallback */ }
          // Tier 2: Databento fallback
          if (!flowData || !flowData.tradeCount) {
            flowData = live.getFlow(ticker);
          }
          if (flowData && flowData.tradeCount > 0) {
            io.to(flowRoom).emit('flow:update', flowData);
          }
        } catch (_) { /* flow not available */ }
      }
    }
  }, 15_000);

  // Heartbeat: mark tickers with active GEX subscribers as dirty every 30s
  // so Tradier-based updates push even when Databento has no data flowing
  setInterval(() => {
    for (const [room] of io.sockets.adapter.rooms) {
      if (room.startsWith('gex:')) {
        const ticker = room.slice(4);
        if (ticker && /^[A-Z]{1,5}$/.test(ticker)) _dirty.add(ticker);
      }
    }
  }, 30_000);

  // Forward sweep events to flow rooms in real-time
  live.client.on('sweep', (sweep) => {
    if (sweep && sweep.underlying) {
      io.to(`flow:${sweep.underlying}`).emit('flow:sweep', sweep);
    }
  });

  // Forward candle completions to chart rooms
  live.client.on('candle', (data) => {
    const room = `chart:${data.ticker}:${data.tf}`;
    io.to(room).emit('chart:bar', data);
  });

  // Forward tick prices to ALL chart rooms (tick + 1m + 5m)
  // so the in-progress candle stays current across all timeframes
  live.client.on('tick', (data) => {
    io.to(`chart:${data.ticker}:tick`)
      .to(`chart:${data.ticker}:1m`)
      .to(`chart:${data.ticker}:5m`)
      .emit('chart:tick', data);

    // Push live spot price to GEX subscribers
    const gexRoom = `gex:${data.ticker}`;
    const sockets = io.sockets.adapter.rooms.get(gexRoom);
    if (sockets && sockets.size > 0) {
      io.to(gexRoom).emit('gex:spot', { ticker: data.ticker, price: data.p, t: data.t });
    }
  });

  log.info('Databento Live -> Socket.IO bridge active');
}

module.exports = { startDashboard, setDiscordClient, getIO };
