/*
 * Visual Hierarchy Rules:
 * - Tile fill = gamma structure (green = +GEX, red = -GEX)
 * - Badge = wall designation (CALL WALL, PUT WALL)
 * - Horizontal line = spot
 * - White glow = user selection
 * - No border color represents structural signal
 */

/**
 * GEX Gamma Heat Map — API Routes + SPA Exports
 *
 * API routes (registered via registerGEXHeatmapRoutes):
 *   GET  /api/gex/heatmap/:ticker        → JSON heatmap data
 *   GET  /api/gex/heatmap/:ticker/stream  → SSE real-time updates
 *   GET  /api/gex/expirations/:ticker    → Available expiration dates
 *   GET  /api/gex/targets/:ticker        → GEX target levels
 *
 * SPA exports: getGexPageCSS, getGexPageHTML, getGexPageJS
 */

const gamma = require('../services/gamma');
const alpaca = require('../services/alpaca');
const tradier = require('../services/tradier');
const publicService = require('../services/public');
const priceFetcher = require('../tools/price-fetcher');
const { bsGamma: _bsGamma, estimateIV: _estimateIV } = require('../lib/black-scholes');
const { getMacroRisk, getMacroRiskWithTreasury } = require('../services/macro-events');
const { computeTiming } = require('../services/timing-engine');
const { computeSignalQuality } = require('../services/signal-quality');

const FREE_TICKERS = ['SPY', 'QQQ', 'IWM'];

function requireProTicker(req, res, ticker) {
  if (req.tier === 'pro') return false;
  if (FREE_TICKERS.includes(ticker.toUpperCase())) return false;
  res.status(403).json({ error: 'upgrade_required', message: 'Pro subscription required for ' + ticker + '. Core tier: SPY, QQQ, and IWM only.' });
  return true;
}

// Lazy-loaded engine instances for the targets API
let _gexEngineInstance = null;
let _targetEngine = null;

// Active SSE connections per ticker for cleanup
const _sseClients = new Map(); // ticker → Set<res>

// ── Live GEX Cache ─────────────────────────────────────────────────────
// When Databento Live is streaming, we maintain a shadow heatmap cache
// that updates in real-time as OI/trades come in from the TCP stream.
// The cached greeks from the last full fetch are used to recalculate GEX.

const _liveGexCache = new Map(); // ticker → { data, contracts, spotPrice, lastFullFetch, lastLiveUpdate }
const _liveStreamIntervals = []; // Track all intervals from _wireLiveStream for cleanup

// Motion metrics state
let _flipDriftEMA = {};
let _lastMotionLog = {};
let _liveWired = false;

// ── Live GEX Cache TTL ────────────────────────────────────────────────
const _LIVE_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const _LIVE_CACHE_SWEEP_MS = 30 * 60 * 1000;    // sweep every 30 minutes

function _evictStaleLiveCache() {
  const cutoff = Date.now() - _LIVE_CACHE_TTL_MS;
  let evicted = 0;
  for (const [ticker, cache] of _liveGexCache) {
    const ts = cache.lastLiveUpdate || cache.lastFullFetch || 0;
    if (ts < cutoff) {
      _liveGexCache.delete(ticker);
      evicted++;
    }
  }
  if (evicted > 0) {
    console.log(`[GEXHeatmap] Evicted ${evicted} stale cache entries (${_liveGexCache.size} remaining)`);
  }
}

// Clear cache on market close detection
function _clearCacheIfMarketClosed() {
  try {
    const { isMarketHours } = require('../services/schema-validator');
    const status = isMarketHours();
    if (status && !status.inSession && _liveGexCache.size > 0) {
      console.log(`[GEXHeatmap] Market closed — clearing ${_liveGexCache.size} live cache entries`);
      _liveGexCache.clear();
    }
  } catch { /* schema-validator not available */ }
}

// Start periodic cache sweep (runs regardless of SSE connections)
const _cacheSweepTimer = setInterval(() => {
  _evictStaleLiveCache();
  _clearCacheIfMarketClosed();
}, _LIVE_CACHE_SWEEP_MS);
_cacheSweepTimer.unref();

/**
 * Wire the Databento Live stream into the GEX heatmap cache.
 * Called once when the first SSE client connects.
 */
function _wireLiveStream() {
  if (_liveWired) return;
  let live;
  try { live = require('../services/databento'); } catch { return; }
  if (!live.client.enabled) return;

  _liveWired = true;
  console.log('[GEXHeatmap] Wiring live Databento stream for real-time GEX updates');

  // On trade: update volume counters
  live.client.on('trade', function _gexHeatmapOnTrade(trade) {
    if (!trade.underlying || !trade.strike || !trade.optionType || !trade.expirationDate) return;
    const ticker = trade.underlying;
    const cache = _liveGexCache.get(ticker);
    if (!cache || !cache.contracts) return;

    // Find matching contract and increment volume
    const key = `${trade.strike}_${trade.optionType}_${trade.expirationDate}`;
    const contract = cache.contracts.get(key);
    if (contract) {
      contract.volume = (contract.volume || 0) + (trade.size || 1);
      cache.dirty = true;
      cache.lastLiveUpdate = Date.now();
    }
  });

  // On OI stat: update open interest and recalculate GEX
  live.client.on('statistic', (stat) => {
    if (stat.statType !== 9) return; // 9 = OPEN_INTEREST
    if (!stat.underlying || !stat.strike || !stat.optionType) return;

    const ticker = stat.underlying;
    const cache = _liveGexCache.get(ticker);
    if (!cache || !cache.contracts) return;

    // stat.quantity is BigInt from DBN i64 field — convert to Number for OI
    const oi = Number(stat.quantity);
    if (oi <= 0) return;

    const key = `${stat.strike}_${stat.optionType}_${stat.expirationDate}`;
    const contract = cache.contracts.get(key);
    if (contract) {
      contract.openInterest = oi;
      cache.dirty = true;
      cache.lastLiveUpdate = Date.now();
    }
  });

  // On quote: update option mid-prices from Databento real-time quotes
  // OPRA only delivers option quotes (not equity), so we use them to keep
  // cached contract prices fresh (hybrid mode: Tradier greeks + Databento prices)
  live.client.on('quote', (quote) => {
    if (!quote.underlying || !quote.level) return;
    const ticker = quote.underlying;
    const cache = _liveGexCache.get(ticker);
    if (!cache || !cache.contracts) return;

    if (quote.strike && quote.optionType && quote.expirationDate) {
      // Option quote — update the cached contract's bid/ask
      const key = `${quote.strike}_${quote.optionType}_${quote.expirationDate}`;
      const contract = cache.contracts.get(key);
      if (contract && quote.level.bidPx > 0 && quote.level.askPx > 0) {
        contract.bid = quote.level.bidPx;
        contract.ask = quote.level.askPx;
        contract.midPrice = (quote.level.bidPx + quote.level.askPx) / 2;
        cache.dirty = true;
        cache.lastLiveUpdate = Date.now();
      }
    }
  });

  // Refresh spot prices every 10 seconds from Theta Data/Alpaca/Tradier
  const _spotRefreshInterval = setInterval(async () => {
    for (const [ticker, cache] of _liveGexCache) {
      try {
        let price = null;
        // Tier 1: Theta Data Pro
        try {
          const thetadata = require('../services/thetadata');
          if (thetadata.enabled()) {
            const tp = await thetadata.getSpotPrice(ticker);
            if (tp) price = tp;
          }
        } catch {}
        // Tier 2: Alpaca
        if (!price && alpaca.enabled) {
          try { price = (await alpaca.getSnapshot(ticker)).price; } catch {}
        }
        if (!price) {
          try { const dl = require('../services/databento-live'); price = dl.getSpotPrice(ticker) || null; } catch {}
        }
        if (!price && tradier.enabled) {
          try { price = (await tradier.getQuote(ticker)).price; } catch {}
        }
        if (price && price !== cache._liveSpotPrice) {
          cache._liveSpotPrice = price;
          cache.dirty = true;
        }
      } catch {}
    }
  }, 10000);
  _liveStreamIntervals.push(_spotRefreshInterval);

  // Push live updates to SSE clients every 5 seconds
  const _ssePushInterval = setInterval(() => {
    for (const [ticker, cache] of _liveGexCache) {
      if (!cache.dirty) continue;
      cache.dirty = false;

      const clients = _sseClients.get(ticker);
      if (!clients || clients.size === 0) continue;

      // Rebuild heatmap from cached contracts with updated OI
      try {
        const data = _rebuildHeatmapFromCache(cache);
        if (!data) continue;
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        for (const res of clients) {
          try { if (!res.writableEnded) res.write(payload); } catch { /* client gone */ }
        }
      } catch (err) {
        console.warn(`[GEXHeatmap] Live rebuild failed for ${ticker}: ${err.message}`);
      }
    }
  }, 5000);
  _liveStreamIntervals.push(_ssePushInterval);
}

/**
 * Rebuild the heatmap data structure from cached contracts.
 * Uses cached gamma values with updated OI to recalculate GEX.
 */
function _rebuildHeatmapFromCache(cache) {
  if (!cache.data || !cache.contracts || !cache.spotPrice) return null;

  const spotPrice = cache._liveSpotPrice || cache.spotPrice;
  const oldData = cache.data;

  // Recalculate GEX per strike per expiration
  const expirationResults = [];
  const allStrikes = new Set();

  for (const exp of oldData.expirations) {
    const strikeGEX = {};
    let totalGEX = 0;

    for (const [key, c] of cache.contracts) {
      // Key format: strike_type_date (e.g. "605_call_2026-02-13")
      if (c.expiration !== exp.date) continue;
      if (!c.gamma || !c.openInterest) continue;

      const shares = c.openInterest * c.gamma * 100;
      const dollar = shares * spotPrice;
      const pct = shares * spotPrice * spotPrice * 0.01;
      const strike = c.strike;
      const entry = strikeGEX[strike] || {
        net: 0, call: 0, put: 0, callOI: 0, putOI: 0,
        netShares: 0, callShares: 0, putShares: 0,
        netDollar: 0, callDollar: 0, putDollar: 0,
      };

      if (c.type === 'call') {
        entry.call += pct; entry.callOI += c.openInterest;
        entry.callShares += shares; entry.callDollar += dollar;
      } else {
        entry.put -= pct; entry.putOI += c.openInterest;
        entry.putShares -= shares; entry.putDollar -= dollar;
      }
      entry.net = entry.call + entry.put;
      entry.netShares = entry.callShares + entry.putShares;
      entry.netDollar = entry.callDollar + entry.putDollar;
      strikeGEX[strike] = entry;
      allStrikes.add(strike);
    }

    totalGEX = Object.values(strikeGEX).reduce((s, e) => s + e.net, 0);
    expirationResults.push({ date: exp.date, strikeGEX, totalGEX });
  }

  if (expirationResults.length === 0) return null;

  // Reuse the same strike range from cached data
  const selectedStrikes = [...oldData.strikes].reverse(); // un-reverse to ascending
  const grid = [];
  let maxAbsGEX = 0;

  for (const strike of selectedStrikes) {
    const row = { strike, values: [] };
    for (const exp of expirationResults) {
      const data = exp.strikeGEX[strike] || { net: 0, call: 0, put: 0, callOI: 0, putOI: 0 };
      row.values.push(data);
      if (Math.abs(data.net) > maxAbsGEX) maxAbsGEX = Math.abs(data.net);
    }
    grid.push(row);
  }

  const profile = selectedStrikes.map(strike => {
    let totalNet = 0, totalCall = 0, totalPut = 0, totalCallOI = 0, totalPutOI = 0, totalCallVol = 0, totalPutVol = 0;
    for (const exp of expirationResults) {
      const d = exp.strikeGEX[strike];
      if (d) { totalNet += d.net; totalCall += d.call; totalPut += d.put; totalCallOI += (d.callOI || 0); totalPutOI += (d.putOI || 0); totalCallVol += (d.callVol || 0); totalPutVol += (d.putVol || 0); }
    }
    return { strike, net: totalNet, call: totalCall, put: totalPut, callOI: totalCallOI, putOI: totalPutOI, callVol: totalCallVol, putVol: totalPutVol };
  });

  // Compute key levels
  let callWall = null, putWall = null, gammaFlip = null;
  const posStrikes = profile.filter(p => p.net > 0);
  if (posStrikes.length > 0) callWall = posStrikes.reduce((best, p) => p.net > best.net ? p : best);
  const negStrikes = profile.filter(p => p.net < 0);
  if (negStrikes.length > 0) putWall = negStrikes.reduce((best, p) => p.net < best.net ? p : best);

  let cumulative = 0;
  for (let i = 0; i < profile.length; i++) {
    const prev = cumulative;
    cumulative += profile[i].net;
    if (i > 0 && prev !== 0 && Math.sign(prev) !== Math.sign(cumulative)) {
      const ratio = Math.abs(prev) / (Math.abs(prev) + Math.abs(profile[i].net));
      gammaFlip = Math.round((profile[i - 1].strike + ratio * (profile[i].strike - profile[i - 1].strike)) * 100) / 100;
      break;
    }
  }

  // Reverse for display (highest strike on top)
  selectedStrikes.reverse();
  grid.reverse();
  profile.reverse();

  return {
    ticker: oldData.ticker,
    spotPrice,
    source: oldData.source + ' (LIVE)',
    dataSource: oldData.dataSource || oldData.source,
    dataQuality: oldData.dataQuality || 'delayed',
    lastUpdated: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    expirations: expirationResults.map(e => ({ date: e.date, totalGEX: e.totalGEX })),
    availableExpirations: oldData.availableExpirations,
    strikes: selectedStrikes,
    grid, profile, maxAbsGEX,
    callWall: callWall ? { strike: callWall.strike, gex: callWall.net } : null,
    putWall: putWall ? { strike: putWall.strike, gex: putWall.net } : null,
    gammaFlip,
  };
}

/**
 * Populate the live GEX cache for a ticker after a full data fetch.
 * Stores all contracts with their gamma values for incremental updates.
 * When no real greeks are available, estimates gamma via Black-Scholes.
 */
function _populateLiveCache(ticker, data, source) {
  let live;
  try { live = require('../services/databento'); } catch { return; }
  if (!live.client.connected) return;

  // Build contract map — either from live stream or from the last full fetch
  const contractMap = new Map();
  const spotPrice = data.spotPrice;

  const buildFromLive = () => {
    for (const exp of data.expirations) {
      const T = Math.max((new Date(exp.date).getTime() - Date.now()) / (365.25 * 86400000), 1 / 365);
      const contracts = live.getOptionsChain(ticker, exp.date, spotPrice);
      for (const c of contracts) {
        if (!c.strike || !c.openInterest) continue;
        let g = c.gamma;
        if (!g || g === 0) {
          const mid = c.lastPrice || (c.bid > 0 && c.ask > 0 ? (c.bid + c.ask) / 2 : 0);
          const iv = _estimateIV(mid, spotPrice, c.strike, T, c.type === 'call');
          g = _bsGamma(spotPrice, c.strike, iv, T);
        }
        if (!g) continue;
        const key = `${c.strike}_${c.type}_${exp.date}`;
        contractMap.set(key, {
          strike: c.strike, type: c.type, expiration: exp.date,
          gamma: g, openInterest: c.openInterest, volume: c.volume || 0,
        });
      }
    }
  };

  const buildFromApi = async () => {
    try {
      for (const exp of data.expirations) {
        const T = Math.max((new Date(exp.date).getTime() - Date.now()) / (365.25 * 86400000), 1 / 365);
        let contracts;
        if (source.startsWith('ThetaData')) {
          const thetadata = require('../services/thetadata');
          contracts = await thetadata.getFullChainWithGreeks(ticker, exp.date);
        } else if (source.startsWith('Tradier')) {
          contracts = await tradier.getOptionsWithGreeks(ticker, exp.date);
        } else if (source.startsWith('Public')) {
          contracts = await publicService.getOptionsWithGreeks(ticker, exp.date);
        }
        if (!contracts) continue;

        for (const c of contracts) {
          if (!c.strike || !c.openInterest) continue;
          let g = c.gamma;
          if (!g || g === 0) {
            const mid = c.lastPrice || (c.bid > 0 && c.ask > 0 ? (c.bid + c.ask) / 2 : 0);
            const iv = _estimateIV(mid, spotPrice, c.strike, T, c.type === 'call');
            g = _bsGamma(spotPrice, c.strike, iv, T);
          }
          if (!g) continue;
          const key = `${c.strike}_${c.type}_${exp.date}`;
          contractMap.set(key, {
            strike: c.strike, type: c.type, expiration: exp.date,
            gamma: g, openInterest: c.openInterest, volume: c.volume || 0,
          });
        }
      }
    } catch (err) {
      console.warn(`[GEXHeatmap] Live cache populate failed: ${err.message}`);
      return;
    }
  };

  const finalize = () => {
    if (contractMap.size === 0) return;
    _liveGexCache.set(ticker, {
      data, contracts: contractMap, spotPrice,
      lastFullFetch: Date.now(), lastLiveUpdate: null, dirty: false,
    });
    console.log(`[GEXHeatmap] Live cache populated: ${ticker} (${contractMap.size} contracts, source=${source})`);
  };

  if (source === 'DatabentoLive') {
    buildFromLive();
    finalize();
  } else if (source !== 'Yahoo') {
    buildFromApi().then(finalize);
  }
}

/**
 * Build a heatmap data object from historical replay contracts (Databento).
 * Uses Black-Scholes gamma estimation since historical data has no greeks.
 * @param {{ ticker: string, date: string, contracts: Array, expirations: string[] }} init
 * @param {number} strikeRange
 * @returns {Object} heatmap data in the same shape as _fetchHeatmapData
 */
function _buildReplayGEX(init, strikeRange) {
  const { ticker, date, contracts, expirations } = init;
  if (!contracts || contracts.length === 0) return { ticker, date, error: 'No contracts' };

  // Estimate spot from median ATM strike (contracts near 0.50 delta)
  const strikes = [...new Set(contracts.map(c => c.strike))].sort((a, b) => a - b);
  // Rough spot: median of all strikes weighted by OI
  let spotEstimate = 0;
  let totalOIWeight = 0;
  for (const c of contracts) {
    if (c.openInterest > 0) {
      spotEstimate += c.strike * c.openInterest;
      totalOIWeight += c.openInterest;
    }
  }
  spotEstimate = totalOIWeight > 0 ? spotEstimate / totalOIWeight : strikes[Math.floor(strikes.length / 2)];
  // Round to nearest strike
  const spotPrice = Math.round(spotEstimate * 100) / 100;

  // Filter strikes around spot
  const half = strikeRange || 20;
  const nearStrikes = strikes.filter(s => Math.abs(s - spotPrice) <= half * (strikes[1] - strikes[0] || 1));
  const selectedStrikes = nearStrikes.length > 0 ? nearStrikes : strikes.slice(Math.max(0, Math.floor(strikes.length / 2) - half), Math.floor(strikes.length / 2) + half);

  // Simple Black-Scholes gamma for each contract
  function bsGamma(spot, strike, T, sigma) {
    if (T <= 0 || sigma <= 0 || spot <= 0) return 0;
    const d1 = (Math.log(spot / strike) + (0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
    return nd1 / (spot * sigma * Math.sqrt(T));
  }

  const IV_ESTIMATE = 0.25; // reasonable default IV
  const expirationResults = [];
  const strikeSet = new Set(selectedStrikes);

  for (const expDate of expirations) {
    const expContracts = contracts.filter(c => c.expirationDate === expDate);
    if (expContracts.length === 0) continue;

    const daysToExp = Math.max(1, Math.round((new Date(expDate) - new Date(date)) / (24 * 60 * 60 * 1000)));
    const T = daysToExp / 365;
    const strikeGEX = {};
    let totalGEX = 0;

    for (const c of expContracts) {
      if (!strikeSet.has(c.strike)) continue;
      const g = bsGamma(spotPrice, c.strike, T, IV_ESTIMATE);
      const shares = c.openInterest * g * 100;
      const pct = shares * spotPrice * spotPrice * 0.01;

      const entry = strikeGEX[c.strike] || {
        net: 0, call: 0, put: 0, callOI: 0, putOI: 0,
        callVol: 0, putVol: 0,
      };

      if (c.optionType === 'call') {
        entry.call += pct;
        entry.callOI += c.openInterest;
        entry.callVol += c.volume || 0;
      } else {
        entry.put -= pct;
        entry.putOI += c.openInterest;
        entry.putVol += c.volume || 0;
      }
      entry.net = entry.call + entry.put;
      strikeGEX[c.strike] = entry;
    }

    totalGEX = Object.values(strikeGEX).reduce((s, e) => s + e.net, 0);
    expirationResults.push({ date: expDate, strikeGEX, totalGEX });
  }

  // Build grid + profile
  const sortedStrikes = [...selectedStrikes].sort((a, b) => b - a); // high to low for display
  const grid = [];
  let maxAbsGEX = 0;

  for (const strike of sortedStrikes) {
    const row = { strike, values: [] };
    for (const exp of expirationResults) {
      const data = exp.strikeGEX[strike] || { net: 0, call: 0, put: 0, callOI: 0, putOI: 0 };
      row.values.push(data);
      if (Math.abs(data.net) > maxAbsGEX) maxAbsGEX = Math.abs(data.net);
    }
    grid.push(row);
  }

  const profile = sortedStrikes.map(strike => {
    let totalNet = 0, totalCall = 0, totalPut = 0, totalCallOI = 0, totalPutOI = 0;
    for (const exp of expirationResults) {
      const d = exp.strikeGEX[strike];
      if (d) { totalNet += d.net; totalCall += d.call; totalPut += d.put; totalCallOI += d.callOI || 0; totalPutOI += d.putOI || 0; }
    }
    return { strike, net: totalNet, call: totalCall, put: totalPut, callOI: totalCallOI, putOI: totalPutOI };
  });

  // Key levels
  let callWall = null, putWall = null, gammaFlip = null;
  const ascending = [...profile].reverse();
  const posStrikes = ascending.filter(p => p.net > 0);
  if (posStrikes.length > 0) callWall = posStrikes.reduce((best, p) => p.net > best.net ? p : best);
  const negStrikes = ascending.filter(p => p.net < 0);
  if (negStrikes.length > 0) putWall = negStrikes.reduce((best, p) => p.net < best.net ? p : best);

  let cumulative = 0;
  for (let i = 0; i < ascending.length; i++) {
    const prev = cumulative;
    cumulative += ascending[i].net;
    if (i > 0 && prev !== 0 && Math.sign(prev) !== Math.sign(cumulative)) {
      const ratio = Math.abs(prev) / (Math.abs(prev) + Math.abs(ascending[i].net));
      gammaFlip = Math.round((ascending[i - 1].strike + ratio * (ascending[i].strike - ascending[i - 1].strike)) * 100) / 100;
      break;
    }
  }

  return {
    ticker,
    spotPrice,
    source: 'Databento Replay',
    timestamp: date + 'T09:30:00Z',
    date,
    replay: true,
    expirations: expirationResults.map(e => ({ date: e.date, totalGEX: e.totalGEX })),
    availableExpirations: expirations,
    strikes: sortedStrikes,
    grid, profile, maxAbsGEX,
    callWall: callWall ? { strike: callWall.strike, gex: callWall.net } : null,
    putWall: putWall ? { strike: putWall.strike, gex: putWall.net } : null,
    gammaFlip,
    totalNetGEX: expirationResults.reduce((s, e) => s + e.totalGEX, 0),
  };
}

/**
 * Register all GEX heatmap routes on the Express app.
 * @param {import('express').Express} app
 */
function registerGEXHeatmapRoutes(app) {

  // ── JSON data endpoint ──────────────────────────────────────────────

  app.get('/api/gex/expirations/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const exps = await gamma.fetchAvailableExpirations(ticker);
      res.json({ ticker, expirations: exps.map(e => e.date) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/gex/heatmap/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const range = Math.min(Math.max(parseInt(req.query.range) || 20, 5), 50);
      const expirations = req.query.expirations
        ? req.query.expirations.split(',').map(s => s.trim())
        : null; // null = auto-pick nearest

      const data = await _fetchHeatmapData(ticker, range, expirations);
      // Attach GEX intensity percentile
      const GEXEngine = require('../services/gex-engine');
      data.intensity = GEXEngine.getGEXPercentile(ticker, data.totalNetGEX || 0);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Dynamics endpoint ──────────────────────────────────────────────
  app.get('/api/gex/dynamics/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const squeezeEngine = require('../services/gamma-squeeze');
      const { computeDynamics, buildChartSeries } = require('../lib/dynamics');
      const history = squeezeEngine.getTimeSeries(ticker, 60 * 60 * 1000);

      // Get current heatmap data from cache or fetch
      const cached = _liveGexCache.get(ticker);
      let current = cached?.data || null;
      if (!current) {
        try { current = await _fetchHeatmapData(ticker, 20, null); } catch (_) {}
      }

      const dynamics = computeDynamics(history, current);
      const chartSeries = buildChartSeries(history);
      res.json({ ticker, dynamics, chartSeries, snapshotCount: history.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── SSE real-time stream ────────────────────────────────────────────
  // When Databento Live is streaming, live OI/trade updates are pushed
  // every 5s via the _wireLiveStream() interval. The full API re-fetch
  // happens on a longer interval to refresh greeks/spot baseline.

  app.get('/api/gex/heatmap/:ticker/stream', (req, res) => {
    const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
    if (requireProTicker(req, res, ticker)) return;
    const range = Math.min(Math.max(parseInt(req.query.range) || 20, 5), 50);
    const intervalSec = Math.min(Math.max(parseInt(req.query.interval) || 60, 15), 300);
    const expirations = req.query.expirations
      ? req.query.expirations.split(',').map(s => s.trim())
      : null;

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Track this client
    if (!_sseClients.has(ticker)) _sseClients.set(ticker, new Set());
    _sseClients.get(ticker).add(res);

    // Wire the live stream on first SSE connection
    _wireLiveStream();

    // Send initial data immediately (full fetch to populate greeks cache)
    _fetchAndPush(res, ticker, range, expirations);

    // Full API re-fetch on longer interval (refreshes greeks baseline)
    // Live updates between full fetches are pushed by _wireLiveStream's 5s interval
    const timer = setInterval(() => {
      _fetchAndPush(res, ticker, range, expirations);
    }, intervalSec * 1000);

    // SSE heartbeat every 30s to keep connection alive through proxies
    const heartbeat = setInterval(() => {
      try { if (!res.writableEnded) res.write(':heartbeat\n\n'); } catch {}
    }, 30_000);

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(timer);
      clearInterval(heartbeat);
      const clients = _sseClients.get(ticker);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) {
          _sseClients.delete(ticker);
          _liveGexCache.delete(ticker); // Free memory when no one's watching
        }
      }
    });
  });

  // ── GEX Replay (historical heatmap playback via Databento Historical) ──
  app.get('/api/gex/heatmap/:ticker/replay', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const date = (req.query.date || '').replace(/[^0-9-]/g, '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date param required (YYYY-MM-DD)' });
      }
      // Don't allow future dates
      if (date >= new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({ error: 'Date must be in the past' });
      }

      // ── Try stored snapshots first (instant, no external API) ──
      const _snapshotStore = require('../services/gex-snapshot-store');
      const hasStored = await _snapshotStore.hasData(ticker, date);
      if (hasStored) {
        const snapshots = await _snapshotStore.getSnapshots(ticker, date);
        if (snapshots.length > 0) {
          // SSE headers
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
          });

          // Send init with first snapshot's key_strikes as baseline
          const first = snapshots[0];
          const initData = {
            ticker,
            date,
            source: 'stored',
            spot: parseFloat(first.spot),
            gammaFlip: first.gamma_flip ? parseFloat(first.gamma_flip) : null,
            callWall: first.call_wall ? parseFloat(first.call_wall) : null,
            putWall: first.put_wall ? parseFloat(first.put_wall) : null,
            totalGex: first.total_gex ? parseFloat(first.total_gex) : null,
            regime: first.regime,
            keyStrikes: first.key_strikes || [],
            totalSnapshots: snapshots.length,
          };
          res.write(`event: init\ndata: ${JSON.stringify(initData)}\n\n`);

          // Send each snapshot as a time slice
          for (const snap of snapshots) {
            const slice = {
              type: 'slice',
              ts: snap.ts,
              spot: parseFloat(snap.spot),
              gammaFlip: snap.gamma_flip ? parseFloat(snap.gamma_flip) : null,
              callWall: snap.call_wall ? parseFloat(snap.call_wall) : null,
              putWall: snap.put_wall ? parseFloat(snap.put_wall) : null,
              totalGex: snap.total_gex ? parseFloat(snap.total_gex) : null,
              regime: snap.regime,
              confidence: snap.confidence ? parseFloat(snap.confidence) : null,
              keyStrikes: snap.key_strikes || [],
            };
            res.write(`event: slice\ndata: ${JSON.stringify(slice)}\n\n`);
          }

          res.write(`event: done\ndata: {}\n\n`);
          res.end();
          return;
        }
      }

      // ── Fall back to Databento replay ──
      if (!process.env.DATABENTO_API_KEY) {
        return res.status(503).json({ error: 'No stored data for this date and Databento API key not configured' });
      }

      // SSE headers for streaming time slices
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      const { spawn } = require('child_process');
      const replayScript = require('path').resolve(__dirname, '../../ml/databento-replay.py');
      const child = spawn('python3', [replayScript, ticker, date], {
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const { createInterface } = require('readline');
      const rl = createInterface({ input: child.stdout });

      rl.on('line', (line) => {
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'init') {
            // Build GEX from the baseline OI using Black-Scholes gamma
            const gexData = _buildReplayGEX(parsed, parseInt(req.query.range) || 20);
            // Include raw contracts so client can recalculate GEX per slice
            gexData.contracts = parsed.contracts || [];
            res.write(`event: init\ndata: ${JSON.stringify(gexData)}\n\n`);
          } else if (parsed.type === 'slice') {
            res.write(`event: slice\ndata: ${JSON.stringify(parsed)}\n\n`);
          } else if (parsed.type === 'done') {
            res.write(`event: done\ndata: {}\n\n`);
          } else if (parsed.type === 'error') {
            res.write(`event: error\ndata: ${JSON.stringify(parsed)}\n\n`);
          }
        } catch (e) {
          // non-JSON line, skip
        }
      });

      child.stderr.on('data', (buf) => {
        console.log(`[GEXReplay] ${buf.toString().trim()}`);
      });

      child.on('close', (code) => {
        if (code !== 0) {
          try { res.write(`event: error\ndata: ${JSON.stringify({ error: 'Replay script exited with code ' + code })}\n\n`); } catch {}
        }
        try { res.end(); } catch {}
      });

      req.on('close', () => {
        try { child.kill('SIGTERM'); } catch {}
      });

    } catch (err) {
      console.error('[GEXReplay] Error:', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
      else try { res.end(); } catch {}
    }
  });

  // ── GEX Targets API (feeds the dashboard targets panel) ────────────
  app.get('/api/gex/targets/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const GEXEngine = require('../services/gex-engine');
      const GEXTargetEngine = require('../services/gex-targets');

      if (!_targetEngine) {
        _gexEngineInstance = _gexEngineInstance || new GEXEngine(gamma);
        try { const dbn = require('../services/databento'); if (dbn.client) _gexEngineInstance.setLiveClient(dbn.client); } catch {}
        _targetEngine = new GEXTargetEngine(gamma, _gexEngineInstance);
      }

      const result = await _targetEngine.analyze(ticker);
      res.json({
        ticker: result.ticker,
        spot: result.spot,
        regime: result.regime,
        gammaFlip: result.gammaFlip,
        walls: result.walls,
        aggregation: result.aggregation,
        playbook: result.playbook,
        volTrigger: result.volTrigger,
        expectedMove: result.expectedMove,
        keyGammaStrike: result.keyGammaStrike,
        bullishTargets: result.bullishTargets,
        bearishTargets: result.bearishTargets,
        tradeSuggestions: result.tradeSuggestions,
        aiCommentary: result.aiCommentary,
        gexMagnets: result.gexMagnets,
        vannaMagnets: result.vannaMagnets,
        source: result.source,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/gex/skew/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const data = await _fetchHeatmapData(ticker, 30, null);
      if (!data || !data.ivByStrike) return res.json({ ticker, spot: data?.spot || 0, skew: [] });

      // Group IV data by expiration
      const byExp = {};
      for (const [key, iv] of Object.entries(data.ivByStrike)) {
        const [strike, exp] = key.split('|');
        if (!byExp[exp]) byExp[exp] = [];
        byExp[exp].push({ strike: parseFloat(strike), callIV: iv.callIV, putIV: iv.putIV });
      }
      const skew = Object.entries(byExp).slice(0, 4).map(([expiration, strikes]) => ({
        expiration,
        strikes: strikes.sort((a, b) => a.strike - b.strike),
      }));

      res.json({ ticker, spot: data.spotPrice, skew });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Term Structure endpoint ──────────────────────────────────────────
  app.get('/api/gex/term-structure/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const data = await _fetchHeatmapData(ticker, 30, null);
      if (!data || !data.ivByStrike) return res.json({ ticker, spot: 0, termStructure: [] });

      const spot = data.spotPrice;
      const byExp = {};
      for (const [key, iv] of Object.entries(data.ivByStrike)) {
        const [strikeStr, exp] = key.split('|');
        const strike = parseFloat(strikeStr);
        if (!byExp[exp]) byExp[exp] = [];
        byExp[exp].push({ strike, callIV: iv.callIV, putIV: iv.putIV });
      }

      const now = new Date();
      const termStructure = Object.entries(byExp)
        .map(([exp, strikes]) => {
          strikes.sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot));
          const atm = strikes[0];
          if (!atm) return null;
          const atmIV = ((atm.callIV || 0) + (atm.putIV || 0)) / 2;
          const dte = Math.max(0, Math.round((new Date(exp) - now) / 86400000));
          return { expiration: exp, dte, atmIV: +(atmIV * 100).toFixed(2), callIV: +(atm.callIV * 100).toFixed(2), putIV: +(atm.putIV * 100).toFixed(2) };
        })
        .filter(Boolean)
        .sort((a, b) => a.dte - b.dte);

      res.json({ ticker, spot, termStructure });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── OI/Volume snapshot endpoint ─────────────────────────────────────
  app.get('/api/gex/oi-volume/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const data = await _fetchHeatmapData(ticker, 20, null);
      if (!data || !data.profile) return res.json({ ticker, spot: 0, strikes: [] });

      const strikes = data.profile.map(s => ({
        strike: s.strike,
        callOI: s.callOI || 0,
        putOI: s.putOI || 0,
        callVol: s.callVol || 0,
        putVol: s.putVol || 0,
        netOI: (s.callOI || 0) - (s.putOI || 0),
      }));

      let totalCallOI = 0, totalPutOI = 0, totalCallVol = 0, totalPutVol = 0;
      strikes.forEach(s => {
        totalCallOI += s.callOI; totalPutOI += s.putOI;
        totalCallVol += s.callVol; totalPutVol += s.putVol;
      });

      res.json({
        ticker, spot: data.spotPrice,
        maxPain: data.maxPain?.strike || null,
        totalCallOI, totalPutOI, totalCallVol, totalPutVol,
        pcRatio: totalCallOI > 0 ? +(totalPutOI / totalCallOI).toFixed(3) : null,
        strikes,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/gex/timeline/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const squeezeEngine = require('../services/gamma-squeeze');
      const maxAge = parseInt(req.query.hours || '6') * 3600000;
      const series = squeezeEngine.getTimeSeries(ticker, maxAge);
      if (!series || series.length === 0) return res.json({ ticker, intervals: [] });

      const bucketMs = 5 * 60 * 1000;
      const buckets = new Map();
      for (const snap of series) {
        const bucketTime = Math.floor(snap.timestamp / bucketMs) * bucketMs;
        if (!buckets.has(bucketTime) || snap.timestamp > buckets.get(bucketTime).timestamp) {
          buckets.set(bucketTime, snap);
        }
      }
      const intervals = Array.from(buckets.entries())
        .sort(([a], [b]) => a - b)
        .map(([time, snap]) => ({
          time, spot: snap.spot, netGEX: snap.netGEX, regime: snap.regime,
          callWall: snap.callWall, putWall: snap.putWall, gammaFlip: snap.gammaFlip,
        }));
      res.json({ ticker, intervals });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Heatmap Intel endpoint ───────────────────────────────────────────
  app.get('/api/gex/heatmap-intel/:ticker', async (req, res) => {
    const ticker = (req.params.ticker || 'SPY').toUpperCase();
    if (requireProTicker(req, res, ticker)) return;

    try {
      // Alpaca first for real-time price, then priceFetcher cascade
      let spotPrice = null;
      if (alpaca.enabled) {
        try { spotPrice = (await alpaca.getSnapshot(ticker)).price; } catch {}
      }
      if (!spotPrice) {
        const spot = await priceFetcher.getCurrentPrice(ticker);
        spotPrice = spot?.price || spot;
      }

      // GEX analysis for walls/flip/regime
      if (!_gexEngineInstance) {
        const GEXEngine = require('../services/gex-engine');
        const gammaModule = require('../services/gamma');
        _gexEngineInstance = new GEXEngine(gammaModule);
        try { const dbn = require('../services/databento'); if (dbn.client) _gexEngineInstance.setLiveClient(dbn.client); } catch {}
      }
      const gex = await _gexEngineInstance.analyze(ticker);

      // Convexity metrics
      const ce = require('../services/convexity-engine');
      const byStrike = gex.aggregation?.byStrike || [];
      const density = ce.convexityDensity(byStrike, spotPrice);
      const curvature = ce.localCurvature(byStrike, spotPrice);
      const dangerScore = ce.gammaDangerScore(density.density_50bp, density.concentration_ratio, 390, 1);

      // Regime detector — feed real technicals so scores aren't all-zero
      const { RegimeDetector } = require('../services/regime-detector');
      const technicals = require('../services/technicals');
      const rd = new RegimeDetector();
      let techData = {};
      try { techData = await technicals.analyze(ticker) || {}; } catch {}
      const regimeResult = rd.classify(ticker, techData, {
        regime: gex.regime?.label,
        regimeConfidence: gex.regime?.confidence,
        totalNetGEX: gex.aggregation?.totalNetGEX,
        gammaFlip: gex.gammaFlip,
      }, {});

      // Structural engines + arbiter
      const { evaluateStructuralRegime } = require('../services/structural-engines');
      const { arbitrate } = require('../services/regime-arbiter');
      // Build a minimal convexity state for structural engines
      const convState = {
        layer1: {
          net_gex: gex.aggregation?.totalNetGEX,
          flip: gex.gammaFlip,
          call_wall: gex.walls?.callWalls?.[0]?.strike,
          put_wall: gex.walls?.putWalls?.[0]?.strike,
          regime: gex.regime?.label?.includes('Long') ? 'long_gamma' : 'short_gamma',
          regime_confidence: gex.regime?.confidence,
        },
        layer2: {
          density,
          curvature,
          gex_velocity: null,
          flip_drift: null,
          wall_stability: null,
        },
        layer3: {
          danger: dangerScore,
          vex: null,
          charm: null,
        },
      };
      const structural = evaluateStructuralRegime(convState, spotPrice);
      let arbiter = arbitrate(structural.allResults);

      // Fallback to basic GEX regime when no structural engines fire
      if (arbiter.confidence === 0 && gex.regime) {
        const isLong = gex.regime.label?.includes('Long');
        arbiter = {
          regime: isLong ? 'PIN' : 'FRAGILE',
          confidence: gex.regime.confidence || 0.5,
          bias: isLong ? 'neutral' : 'bearish',
          playbook: isLong ? 'mean_revert' : 'risk_off',
          engine: 'gex_fallback',
          reasons: ['from basic GEX regime: ' + (gex.regime.label || 'unknown')],
        };
      }

      // Gamma squeeze state
      let squeezeState = 'normal';
      try {
        const gs = require('../services/gamma-squeeze');
        const sq = gs.getSqueezeStatus(ticker);
        squeezeState = sq?.squeezeState || 'normal';
      } catch {}

      // Build highlights (max 3, priority-ranked)
      const highlights = [];
      const dn = dangerScore?.danger_normalized ?? 0;

      if (arbiter.regime === 'FRAGILE' && dn > 0.4) {
        highlights.push({ label: 'Danger ' + Math.round(dn * 100) + '/100', detail: 'High acceleration risk — reduce size', severity: 'danger' });
      }

      // Dominant expiry
      const dom = gex.aggregation?.byExpiry?.sort((a, b) => Math.abs(b['netGEX$'] || b.absShare || 0) - Math.abs(a['netGEX$'] || a.absShare || 0))?.[0];
      if (dom) {
        highlights.push({ label: dom.expiry + ' dominant', detail: Math.round((dom.absShare || 0) * 100) + '% of GEX', severity: 'info' });
      }

      // Highest magnitude strike near spot
      const nearStrikes = byStrike.filter(s => Math.abs(s.strike - spotPrice) / spotPrice < 0.02);
      const topStrike = nearStrikes.sort((a, b) => Math.abs(b['netGEX$']) - Math.abs(a['netGEX$']))[0];
      if (topStrike) {
        const dir = topStrike['netGEX$'] > 0 ? 'anchor' : 'acceleration';
        var gexLabel = Math.abs(topStrike['netGEX$']) >= 1e3 ? (topStrike['netGEX$'] / 1e3).toFixed(1) + 'K' : topStrike['netGEX$'].toFixed(0);
        highlights.push({ label: '$' + topStrike.strike, detail: gexLabel + ' — ' + dir + ' zone', severity: topStrike['netGEX$'] < 0 ? 'warning' : 'info' });
      }

      // Flip proximity
      if (highlights.length < 3 && gex.gammaFlip && Math.abs(spotPrice - gex.gammaFlip) / spotPrice < 0.005) {
        highlights.push({ label: 'Near flip $' + gex.gammaFlip, detail: 'Spot within 0.5% of gamma flip', severity: 'warning' });
      }

      // Squeeze
      if (highlights.length < 3 && squeezeState !== 'normal') {
        highlights.push({ label: 'Squeeze: ' + squeezeState, detail: 'Gamma squeeze active', severity: 'danger' });
      }

      // Danger (if not already added and still room)
      if (highlights.length < 3 && arbiter.regime !== 'FRAGILE' && dn > 0.5) {
        highlights.push({ label: 'Danger ' + Math.round(dn * 100) + '/100', detail: 'Elevated danger score', severity: 'warning' });
      }

      // Build regime-conditional overlays
      const overlays = {
        flipStrike: gex.gammaFlip || null,
        callWall: gex.walls?.callWalls?.[0] ? { strike: gex.walls.callWalls[0].strike, gex: gex.walls.callWalls[0]['netGEX$'] } : null,
        putWall: gex.walls?.putWalls?.[0] ? { strike: gex.walls.putWalls[0].strike, gex: gex.walls.putWalls[0]['netGEX$'] } : null,
      };

      if (arbiter.regime === 'FRAGILE') {
        // Show danger zones (strikes with highest negative GEX near spot)
        overlays.dangerZones = nearStrikes.filter(s => s['netGEX$'] < -288000).map(s => s.strike).slice(0, 5);
        overlays.riskStrikes = byStrike.filter(s => s['netGEX$'] < -576000 && Math.abs(s.strike - spotPrice) / spotPrice < 0.03).map(s => s.strike).slice(0, 3);
      } else if (arbiter.regime === 'BREAKOUT') {
        // Show slope direction arrows at strikes with steep GEX gradient
        const arrows = [];
        const sorted = byStrike.filter(s => Math.abs(s.strike - spotPrice) / spotPrice < 0.03).sort((a, b) => a.strike - b.strike);
        for (let i = 1; i < sorted.length; i++) {
          const diff = sorted[i]['netGEX$'] - sorted[i - 1]['netGEX$'];
          if (Math.abs(diff) > 80) {
            arrows.push({ strike: sorted[i].strike, direction: diff > 0 ? 'up' : 'down' });
          }
        }
        overlays.slopeArrows = arrows.slice(0, 5);
      } else if (arbiter.regime === 'PIN') {
        // Show magnet cluster
        const absStrikes = byStrike.map(s => ({ strike: s.strike, absGex: Math.abs(s['callGEX$'] || 0) + Math.abs(s['putGEX$'] || 0) }))
          .sort((a, b) => b.absGex - a.absGex).slice(0, 3);
        overlays.magnetCluster = absStrikes.map(s => s.strike);
        if (gex.absGammaStrike) overlays.gravityWell = gex.absGammaStrike.strike;
      }

      // ── Motion metrics (instrumentation only — not fed into regime) ──
      let smoothedGexVelocity = 0, gexAccel = 0, smoothedFlipDrift = 0, flipCurrent = null;
      let normalizedWallStability = 0, callStab = 0, putStab = 0, wallStabSnap = {};
      let pressureScore = 0;
      try {
        const { getTrackers } = require('../services/market-metrics');
        const mmTrackers = getTrackers(ticker);
        const gexVelSnap = mmTrackers.gexVelocity.snapshot();
        const flipDriftSnap = mmTrackers.flipDrift.snapshot();
        wallStabSnap = mmTrackers.wallStability.snapshot();

        smoothedGexVelocity = gexVelSnap.v_5m || 0;
        gexAccel = gexVelSnap.a_5m || 0;

        const rawFlipDrift = flipDriftSnap.flip_v_5m || 0;
        if (!_flipDriftEMA[ticker]) _flipDriftEMA[ticker] = 0;
        _flipDriftEMA[ticker] = 0.3 * rawFlipDrift + 0.7 * _flipDriftEMA[ticker];
        smoothedFlipDrift = Math.round(_flipDriftEMA[ticker] * 100) / 100;
        flipCurrent = flipDriftSnap.flip_current;

        callStab = wallStabSnap.call_wall?.stability || 0;
        putStab = wallStabSnap.put_wall?.stability || 0;
        normalizedWallStability = Math.round(((callStab + putStab) / 2) * 1000) / 1000;

        // Pressure score from dynamics
        try {
          const squeezeEngine = require('../services/gamma-squeeze');
          const { computeDynamics } = require('../lib/dynamics');
          const history = squeezeEngine.getTimeSeries(ticker, 60 * 60 * 1000);
          if (history.length >= 2) {
            const cached = _liveGexCache ? _liveGexCache.get(ticker) : null;
            const current = cached?.data || null;
            if (current) {
              const dyn = computeDynamics(history, current);
              pressureScore = dyn.pressureScore || 0;
            }
          }
        } catch {}
      } catch (motionErr) {
        // Motion metrics are instrumentation-only; silently degrade
      }

      const motionObj = {
        gexVelocity: smoothedGexVelocity,
        gexAcceleration: gexAccel,
        flipDrift: smoothedFlipDrift,
        flipCurrent: flipCurrent,
        wallStability: normalizedWallStability,
        wallDetail: {
          call: { persistence: wallStabSnap.call_wall?.persistence || 0, stability: callStab },
          put: { persistence: wallStabSnap.put_wall?.persistence || 0, stability: putStab },
        },
        pressureScore,
        timestamp: Date.now(),
      };

      // Log motion snapshot every 60s per ticker
      const _now = Date.now();
      if (!_lastMotionLog[ticker] || _now - _lastMotionLog[ticker] >= 60000) {
        _lastMotionLog[ticker] = _now;
        console.log('[MotionLog]', ticker, JSON.stringify({
          t: new Date().toISOString().slice(11, 19),
          gv: smoothedGexVelocity,
          fd: smoothedFlipDrift,
          ws: normalizedWallStability,
          ps: pressureScore,
        }));
      }

      // Macro event risk + FRED treasury data
      const macro = await getMacroRiskWithTreasury();
      const rawConfidence = arbiter.confidence;
      const adjustedConfidence = macro.riskScore > 0
        ? rawConfidence * (1 - macro.riskScore * 0.7)
        : rawConfidence;

      // ── Timing Engine ──
      let timing = null;
      try {
        const databento = require('../services/databento');
        const candles = databento.getCandles ? databento.getCandles(ticker, '1m') : [];
        const flowData = databento.getFlow ? databento.getFlow(ticker) : {};
        const signal = databento.getSignal ? databento.getSignal(ticker) : {};
        const priceData = await priceFetcher.getCurrentPrice(ticker);
        const prevClose = priceData?.previousClose || null;
        const vwap = signal?.vwap || flowData?.vwap || null;

        // ET minute of day
        const etNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const etMinuteOfDay = etNow.getHours() * 60 + etNow.getMinutes();

        // Metrics for L3/L4
        const mm = require('../services/market-metrics');
        let metricsData = {};
        try { metricsData = await mm.getMetrics(ticker); } catch {}

        timing = computeTiming({
          ticker,
          spotPrice,
          gex: metricsData.gex || { ratio: convState.layer1.regime === 'long_gamma' ? 0.6 : 0.35, netGEX: gex.aggregation?.totalNetGEX, regime: convState.layer1.regime },
          regime: { label: arbiter.regime, confidence: adjustedConfidence, bias: arbiter.bias, playbook: arbiter.playbook },
          motion: motionObj,
          flow: {
            netFlow: flowData?.netPremium || metricsData.flow?.netFlow || 0,
            sweepCount: flowData?.sweepCount || 0,
            aggressionRatio: flowData?.aggressionRatio || signal?.aggressionRatio || null,
            pcVolumeRatio: flowData?.pcVolumeRatio || null,
          },
          convexityL3: metricsData.convexity?.layer3 || {},
          overlays,
          vwap,
          previousClose: prevClose,
          candles,
          etMinuteOfDay,
          macro,
          dangerScore: dn,
        });
      } catch (timingErr) {
        console.error('[TimingEngine]', timingErr.message);
      }

      res.json({
        ticker,
        spot: spotPrice,
        timestamp: new Date().toISOString(),
        motion: motionObj,
        regime: {
          label: arbiter.regime,
          confidence: adjustedConfidence,
          rawConfidence,
          bias: arbiter.bias,
          playbook: arbiter.playbook,
          engine: arbiter.engine,
          reasons: arbiter.reasons,
        },
        regimeScores: regimeResult.scores || {},
        stability: regimeResult.stability ?? null,
        flickering: regimeResult.flickering ?? false,
        highlights: highlights.slice(0, 3),
        overlays,
        convexityDirection: (curvature?.slope ?? 0) > 0 ? 'expanding' : (curvature?.slope ?? 0) < 0 ? 'contracting' : 'neutral',
        dangerScore: dn,
        dominantExpiry: dom ? { date: dom.expiry, share: dom.absShare } : null,
        squeezeState,
        macro,
        timing,
        gexChange: gex.gexChange || null,
        totalNetGEXVol: gex.aggregation ? gex.aggregation.totalNetGEXVol || 0 : 0,
        activityRatio: gex.aggregation ? gex.aggregation.activityRatio || 0 : 0,
        odteMetrics: gex.odteMetrics || null,
        dealerPositioning: gex.dealerPositioning || null,
        hedgeAccuracy: gex.hedgeAccuracy || null,
        sensitivitySurface: gex.sensitivitySurface ? {
          base: gex.sensitivitySurface.base,
          bumps: gex.sensitivitySurface.bumps,
          chainSize: gex.sensitivitySurface.chainSize,
        } : null,
        regimeNormalization: gex.regime ? gex.regime.normalization || null : null,
        signalQuality: (() => {
          try {
            const flowSource = 'sandbox'; // default for now
            const sqMeta = {
              regimeStability: regimeResult.stability ?? null,
              flowSource,
              hasPrice: !!spotPrice,
              greeksSource: 'vendor',
              hasChain: true,
              chainCoverage: 0.85,
            };
            return computeSignalQuality(gex, null, sqMeta);
          } catch { return null; }
        })(),
      });
    } catch (err) {
      console.error('[HeatmapIntel]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Motion metrics SSE stream for Intel heatmap ──────────────────
  const _motionSSEClients = new Map();

  app.get('/api/gex/heatmap-intel/:ticker/motion-stream', (req, res) => {
    const ticker = (req.params.ticker || 'SPY').toUpperCase();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    if (!_motionSSEClients.has(ticker)) _motionSSEClients.set(ticker, new Set());
    _motionSSEClients.get(ticker).add(res);

    const pushMotion = () => {
      try {
        const { getTrackers: gt } = require('../services/market-metrics');
        const mmTrackers = gt(ticker);
        const gexVelSnap = mmTrackers.gexVelocity.snapshot();
        const flipDriftSnap = mmTrackers.flipDrift.snapshot();
        const wallStabSnap = mmTrackers.wallStability.snapshot();

        const rawFlipDrift = flipDriftSnap.flip_v_5m || 0;
        if (!_flipDriftEMA[ticker]) _flipDriftEMA[ticker] = 0;
        _flipDriftEMA[ticker] = 0.3 * rawFlipDrift + 0.7 * _flipDriftEMA[ticker];

        const callStab = wallStabSnap.call_wall?.stability || 0;
        const putStab = wallStabSnap.put_wall?.stability || 0;

        let pressureScore = 0;
        try {
          const squeezeEngine = require('../services/gamma-squeeze');
          const { computeDynamics } = require('../lib/dynamics');
          const history = squeezeEngine.getTimeSeries(ticker, 60 * 60 * 1000);
          if (history.length >= 2) {
            const cached = _liveGexCache ? _liveGexCache.get(ticker) : null;
            const current = cached?.data || null;
            if (current) {
              const dyn = computeDynamics(history, current);
              pressureScore = dyn.pressureScore || 0;
            }
          }
        } catch {}

        const motion = {
          gexVelocity: gexVelSnap.v_5m || 0,
          gexAcceleration: gexVelSnap.a_5m || 0,
          flipDrift: Math.round(_flipDriftEMA[ticker] * 100) / 100,
          flipCurrent: flipDriftSnap.flip_current,
          wallStability: Math.round(((callStab + putStab) / 2) * 1000) / 1000,
          wallDetail: {
            call: { persistence: wallStabSnap.call_wall?.persistence || 0, stability: callStab },
            put: { persistence: wallStabSnap.put_wall?.persistence || 0, stability: putStab },
          },
          pressureScore,
          timestamp: Date.now(),
        };

        res.write('data: ' + JSON.stringify(motion) + '\n\n');
      } catch (err) {
        // Silently skip on error
      }
    };

    pushMotion();
    const timer = setInterval(pushMotion, 5000);

    // SSE heartbeat every 30s to keep connection alive through proxies
    const heartbeat = setInterval(() => {
      try { if (!res.writableEnded) res.write(':heartbeat\n\n'); } catch {}
    }, 30_000);

    req.on('close', () => {
      clearInterval(timer);
      clearInterval(heartbeat);
      const clients = _motionSSEClients.get(ticker);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) _motionSSEClients.delete(ticker);
      }
    });
  });

  // ── Swing (multi-day persistence) endpoint ──
  app.get('/api/gex/swing/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const days = Math.min(Math.max(parseInt(req.query.days) || 5, 2), 10);
      const { getSnapshots } = require('../services/swing-snapshot');
      const snapshots = await getSnapshots(ticker, days);
      if (!snapshots.length) return res.json({ available: false, snapshots: [] });
      res.json({ available: true, snapshots });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Trinity (combined exposure overlay) endpoint ──
  app.get('/api/gex/trinity', async (req, res) => {
    try {
      const tickers = ['SPY', 'QQQ', 'IWM'];
      const profiles = [];
      for (const ticker of tickers) {
        try {
          const data = await _fetchHeatmapData(ticker, 30, null);
          if (!data || !data.profile) continue;
          const spot = data.spotPrice || 0;
          profiles.push({
            ticker,
            spot,
            strikes: data.profile.map(row => ({
              strike: row.strike,
              pctFromSpot: spot ? ((row.strike - spot) / spot) * 100 : 0,
              netGEX: row.net || 0,
              callGEX: row.call || 0,
              putGEX: row.put || 0,
            })),
          });
        } catch (e) { /* skip ticker on error */ }
      }
      res.json({ available: profiles.length > 0, profiles });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Stored Snapshot Endpoints (for replay from DB) ────────────────
  const snapshotStore = require('../services/gex-snapshot-store');

  // List dates with snapshot data for a ticker
  app.get('/api/gex/snapshots/:ticker/dates', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const limit = Math.min(parseInt(req.query.limit) || 60, 120);
      const dates = await snapshotStore.getDates(ticker, limit);
      res.json({ ticker, dates });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all snapshots for a ticker on a specific date
  app.get('/api/gex/snapshots/:ticker/:date', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '');
      if (requireProTicker(req, res, ticker)) return;
      const date = (req.params.date || '').replace(/[^0-9-]/g, '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
      }
      const snapshots = await snapshotStore.getSnapshots(ticker, date);
      res.json({
        ticker,
        date,
        count: snapshots.length,
        snapshots: snapshots.map(s => ({
          ts: s.ts,
          spot: parseFloat(s.spot),
          gammaFlip: s.gamma_flip ? parseFloat(s.gamma_flip) : null,
          callWall: s.call_wall ? parseFloat(s.call_wall) : null,
          putWall: s.put_wall ? parseFloat(s.put_wall) : null,
          totalGex: s.total_gex ? parseFloat(s.total_gex) : null,
          regime: s.regime,
          confidence: s.confidence ? parseFloat(s.confidence) : null,
          source: s.source,
          keyStrikes: s.key_strikes,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  console.log('[Dashboard] GEX Heatmap API routes registered: /api/gex/heatmap/:ticker, /api/gex/targets/:ticker, /api/gex/skew/:ticker, /api/gex/term-structure/:ticker, /api/gex/oi-volume/:ticker, /api/gex/timeline/:ticker, /api/gex/swing/:ticker, /api/gex/trinity, /api/gex/snapshots/:ticker');
}

// ── Data fetching ─────────────────────────────────────────────────────

async function _fetchHeatmapData(ticker, strikeRange, requestedExps) {
  // 1. Get spot price (source-independent — OPRA is options-only, always need equity quote)
  // Theta Data Pro first — real-time derived quotes.
  // Alpaca next — provides real-time quotes even in paper mode.
  // Tradier sandbox returns delayed/stale data (prev close).
  let spotPrice = null;
  try {
    const thetadata = require('../services/thetadata');
    if (thetadata.enabled()) {
      const tp = await thetadata.getSpotPrice(ticker);
      if (tp) spotPrice = tp;
    }
  } catch { /* fallback */ }
  if (!spotPrice && alpaca.enabled) {
    try {
      const snap = await alpaca.getSnapshot(ticker);
      spotPrice = snap.price;
    } catch { /* fallback */ }
  }
  if (!spotPrice && live) {
    spotPrice = live.getSpotPrice(ticker) || null;
  }
  if (!spotPrice && tradier.enabled) {
    try {
      const q = await tradier.getQuote(ticker);
      spotPrice = q.price;
    } catch { /* fallback */ }
  }
  if (!spotPrice) {
    const pf = await priceFetcher.getCurrentPrice(ticker);
    if (!pf.error) spotPrice = pf.price;
  }
  // Last resort: extract spot from Yahoo options API quote (always available, no API key)
  if (!spotPrice) {
    try {
      const yahooResult = await gamma._yahooFetch(ticker);
      const q = yahooResult?.quote;
      if (q && q.regularMarketPrice) spotPrice = q.regularMarketPrice;
    } catch { /* skip */ }
  }
  if (!spotPrice) throw new Error(`Cannot determine spot price for ${ticker}`);

  // 2. Build source priority list — try each in order with fallback
  // If a source has expirations but produces no usable chain data (e.g. OI=0), fall back to next
  let live;
  try { live = require('../services/databento-live'); } catch { live = null; }

  const sourcesToTry = [];
  // Theta Data Pro first: real greeks (all 3 orders), IV, OI from OPRA.
  // Tradier next: ORATS greeks + OI in one call.
  // Databento is primary for live price feed, flow, and trade detection.
  try {
    const thetadata = require('../services/thetadata');
    if (thetadata.enabled()) sourcesToTry.push('ThetaData');
  } catch {}
  if (live && live.hasDataFor(ticker)) sourcesToTry.push('DatabentoLive');
  if (tradier.enabled) sourcesToTry.push('Tradier');
  if (publicService.enabled) sourcesToTry.push('Public.com');
  sourcesToTry.push('Yahoo');
  if (sourcesToTry.length === 1) {
    console.warn('[GEXHeatmap] No premium sources configured — using Yahoo only. Set TRADIER_API_KEY for real greeks (free sandbox).');
  }

  let source = null;
  let expirationResults = [];
  let allStrikes = new Set();
  const ivByStrike = {};
  let futureExpDates = [];
  let bestFallback = null; // Track best data if no source meets MIN_STRIKES

  for (const trySource of sourcesToTry) {
    // ── Get available expirations for this source ──
    let allExpDates = null;
    let yahooExps = null;

    try {
      if (trySource === 'ThetaData') {
        const thetadata = require('../services/thetadata');
        const dates = await thetadata.getExpirations(ticker);
        if (dates && dates.length > 0) allExpDates = dates;
      } else if (trySource === 'DatabentoLive') {
        const dates = live.getExpirations(ticker);
        if (dates.length > 0) allExpDates = dates;
      } else if (trySource === 'Tradier') {
        const dates = await tradier.getOptionExpirations(ticker);
        if (dates.length > 0) allExpDates = dates;
      } else if (trySource === 'Public.com') {
        const dates = await publicService.getOptionExpirations(ticker);
        if (dates && dates.length > 0) allExpDates = dates;
      } else {
        yahooExps = await gamma.fetchAvailableExpirations(ticker);
        if (yahooExps.length > 0) allExpDates = yahooExps.map(e => e.date);
      }
    } catch (err) {
      console.warn(`[GEXHeatmap] ${trySource} expirations failed: ${err.message}`);
      continue;
    }

    if (!allExpDates || allExpDates.length === 0) continue;

    const today = new Date().toISOString().slice(0, 10);
    futureExpDates = allExpDates.filter(d => d >= today).sort();

    let targetExpDates;
    if (requestedExps && requestedExps.length > 0) {
      targetExpDates = allExpDates.filter(d => requestedExps.includes(d));
    } else {
      targetExpDates = futureExpDates.slice(0, 6);
    }
    if (targetExpDates.length === 0) continue;

    // ── Fetch chains and compute GEX per strike per expiration ──
    expirationResults = [];
    allStrikes = new Set();

    if (trySource === 'Yahoo') {
      // ── Yahoo: fetch all expirations in parallel for speed ──
      const fetchResults = await Promise.allSettled(targetExpDates.map(async (expDate) => {
        const expObj = yahooExps?.find(e => e.date === expDate);
        if (!expObj) return null;
        const result = await gamma._yahooFetch(ticker, expObj.epoch);
        const options = result.options?.[0];
        if (!options) return null;

        const chain = [];
        for (const c of (options.calls || [])) {
          chain.push({
            strike: c.strike, expiration: expDate, expirationEpoch: expObj.epoch,
            type: 'call', openInterest: c.openInterest || 0, impliedVolatility: c.impliedVolatility || 0,
          });
        }
        for (const p of (options.puts || [])) {
          chain.push({
            strike: p.strike, expiration: expDate, expirationEpoch: expObj.epoch,
            type: 'put', openInterest: p.openInterest || 0, impliedVolatility: p.impliedVolatility || 0,
          });
        }

        const detailed = gamma.calculateDetailedGEX(chain, spotPrice, ticker);
        const strikeGEXMap = {};
        const strikes = [];
        for (const s of detailed.strikes) {
          strikeGEXMap[s.strike] = {
            net: s['netGEX$'], call: s['callGEX$'], put: s['putGEX$'],
            callOI: s.callOI, putOI: s.putOI,
            callVol: s.callVol || 0, putVol: s.putVol || 0,
            netShares: s.netShares || 0, callShares: s.callShares || 0, putShares: s.putShares || 0,
            netDollar: s.netDollar || 0, callDollar: s.callDollar || 0, putDollar: s.putDollar || 0,
          };
          strikes.push(s.strike);
        }
        const ivMap = {};
        for (const item of chain) {
          const key = `${item.strike}|${expDate}`;
          if (!ivMap[key]) ivMap[key] = { callIV: 0, putIV: 0 };
          if (item.type === 'call') ivMap[key].callIV = item.impliedVolatility;
          else ivMap[key].putIV = item.impliedVolatility;
        }
        return { date: expDate, strikeGEX: strikeGEXMap, totalGEX: detailed['totalNetGEX$'], strikes, ivMap };
      }));

      for (const r of fetchResults) {
        if (r.status === 'fulfilled' && r.value && Object.keys(r.value.strikeGEX).length > 0) {
          expirationResults.push({ date: r.value.date, strikeGEX: r.value.strikeGEX, totalGEX: r.value.totalGEX });
          for (const s of r.value.strikes) allStrikes.add(s);
          if (r.value.ivMap) Object.assign(ivByStrike, r.value.ivMap);
        } else if (r.status === 'rejected') {
          console.warn(`[GEXHeatmap] Yahoo exp failed: ${r.reason?.message}`);
        }
      }
    } else {
      // ── Non-Yahoo sources: sequential (DatabentoLive is in-memory = fast) ──
      if (trySource === 'DatabentoLive') {
        await live.seedOI(ticker); // Seed OI from Tradier if needed
      }
      for (const expDate of targetExpDates) {
        try {
          let contracts;
          if (trySource === 'ThetaData') {
            const thetadata = require('../services/thetadata');
            contracts = await thetadata.getFullChainWithGreeks(ticker, expDate);
          } else if (trySource === 'DatabentoLive') {
            contracts = live.getOptionsChain(ticker, expDate, spotPrice);
          } else if (trySource === 'Tradier') {
            contracts = await tradier.getOptionsWithGreeks(ticker, expDate);
          } else {
            contracts = await publicService.getOptionsWithGreeks(ticker, expDate);
          }
          if (!contracts || contracts.length === 0) continue;

          const T = Math.max((new Date(expDate).getTime() - Date.now()) / (365.25 * 86400000), 1 / 365);

          const strikeMap = new Map();
          const vannaMap = new Map();
          const charmMap = new Map();
          for (const c of contracts) {
            if (!c.strike) continue;
            if (!c.openInterest && !c.gamma) continue; // Need at least OI or computed gamma

            let contractGamma = c.gamma;
            if (!contractGamma || contractGamma === 0) {
              const mid = c.lastPrice || (c.bid > 0 && c.ask > 0 ? (c.bid + c.ask) / 2 : 0);
              const iv = _estimateIV(mid, spotPrice, c.strike, T, c.type === 'call');
              contractGamma = _bsGamma(spotPrice, c.strike, iv, T);
            }
            if (!contractGamma) continue;

            // Capture IV for skew
            const ivKey = `${c.strike}|${expDate}`;
            if (!ivByStrike[ivKey]) ivByStrike[ivKey] = { callIV: 0, putIV: 0 };
            const civ = c.impliedVolatility || c.iv || 0;
            if (c.type === 'call') ivByStrike[ivKey].callIV = civ;
            else ivByStrike[ivKey].putIV = civ;

            const shares = c.openInterest * contractGamma * 100;
            const dollar = shares * spotPrice;
            const pct = shares * spotPrice * spotPrice * 0.01;
            const vol = c.volume || 0;
            const entry = strikeMap.get(c.strike) || {
              net: 0, call: 0, put: 0, callOI: 0, putOI: 0, callVol: 0, putVol: 0,
              netShares: 0, callShares: 0, putShares: 0,
              netDollar: 0, callDollar: 0, putDollar: 0,
            };
            if (c.type === 'call') {
              entry.call += pct; entry.callOI += c.openInterest; entry.callVol += vol;
              entry.callShares += shares; entry.callDollar += dollar;
            } else {
              entry.put -= pct; entry.putOI += c.openInterest; entry.putVol += vol;
              entry.putShares -= shares; entry.putDollar -= dollar;
            }
            entry.net = entry.call + entry.put;
            entry.netShares = entry.callShares + entry.putShares;
            entry.netDollar = entry.callDollar + entry.putDollar;
            strikeMap.set(c.strike, entry);

            // Vanna: dDelta/dIV — approximate from vega if available
            if (c.vega && c.delta != null) {
              const vanna = (c.vega / spotPrice) * c.openInterest * 100;
              const ve = vannaMap.get(c.strike) || { net: 0, call: 0, put: 0 };
              if (c.type === 'call') {
                ve.call += vanna;
              } else {
                ve.put -= vanna;
              }
              ve.net = ve.call + ve.put;
              vannaMap.set(c.strike, ve);
            }

            // Charm: dDelta/dTime — approximate as theta-weighted delta decay
            // Charm ≈ -theta * sign(delta) per contract, scaled by OI
            // For dealers (short options), charm tells how delta shifts overnight
            if (c.theta && c.delta != null && T > 0) {
              const charmVal = -(c.theta / T) * Math.abs(c.delta) * c.openInterest * 100;
              const ce = charmMap.get(c.strike) || { net: 0, call: 0, put: 0 };
              if (c.type === 'call') {
                ce.call += charmVal;
              } else {
                ce.put -= charmVal;
              }
              ce.net = ce.call + ce.put;
              charmMap.set(c.strike, ce);
            }
          }

          const strikeGEXMap = {};
          const strikeVannaMap = {};
          const strikeCharmMap = {};
          let totalGEX = 0;
          let totalVanna = 0;
          let totalCharm = 0;
          for (const [strike, data] of strikeMap) {
            strikeGEXMap[strike] = data;
            allStrikes.add(strike);
            totalGEX += data.net;
          }
          for (const [strike, data] of vannaMap) {
            strikeVannaMap[strike] = data;
            totalVanna += data.net;
          }
          for (const [strike, data] of charmMap) {
            strikeCharmMap[strike] = data;
            totalCharm += data.net;
          }

          if (Object.keys(strikeGEXMap).length > 0) {
            expirationResults.push({ date: expDate, strikeGEX: strikeGEXMap, strikeVanna: strikeVannaMap, strikeCharm: strikeCharmMap, totalGEX, totalVanna, totalCharm });
          }
        } catch (err) {
          console.warn(`[GEXHeatmap API] Skipping ${expDate}: ${err.message}`);
          if (err.name === 'TimeoutError' || err.message.includes('timeout')) break;
        }
      }
    }

    // Require a minimum number of strikes to consider a source usable —
    // DatabentoLive often has sparse OI early in the session which produces
    // a nearly-empty heatmap. Fall back to a richer source instead.
    const MIN_STRIKES = 10;
    if (expirationResults.length > 0 && allStrikes.size >= MIN_STRIKES) {
      source = trySource;
      console.log(`[GEXHeatmap] Using ${trySource} for ${ticker} (${expirationResults.length} expirations, ${allStrikes.size} strikes)`);
      break; // Success — use this source
    }

    // Track best fallback in case no source meets MIN_STRIKES
    if (expirationResults.length > 0 && allStrikes.size > 0 &&
        (!bestFallback || allStrikes.size > bestFallback.allStrikes.size)) {
      bestFallback = { source: trySource, expirationResults: [...expirationResults], allStrikes: new Set(allStrikes), futureExpDates: [...futureExpDates] };
    }

    console.warn(`[GEXHeatmap] ${trySource} had expirations but insufficient data (${expirationResults.length} exps, ${allStrikes.size} strikes), falling back...`);
  }

  // If no source met MIN_STRIKES but we have some data, use the best available
  if (!source && bestFallback) {
    source = bestFallback.source;
    expirationResults = bestFallback.expirationResults;
    allStrikes = bestFallback.allStrikes;
    futureExpDates = bestFallback.futureExpDates;
    console.warn(`[GEXHeatmap] No source met MIN_STRIKES, using best fallback: ${source} (${expirationResults.length} exps, ${allStrikes.size} strikes)`);
  }

  if (expirationResults.length === 0) throw new Error(`No options data for ${ticker}`);

  // 4. Select strikes around spot
  const sortedStrikes = [...allStrikes].sort((a, b) => a - b);
  const spotIdx = sortedStrikes.reduce((best, s, i) =>
    Math.abs(s - spotPrice) < Math.abs(sortedStrikes[best] - spotPrice) ? i : best, 0);

  const startIdx = Math.max(0, spotIdx - strikeRange);
  const endIdx = Math.min(sortedStrikes.length, spotIdx + strikeRange + 1);
  const selectedStrikes = sortedStrikes.slice(startIdx, endIdx);

  // 5. Build grid
  const grid = [];
  let maxAbsGEX = 0;

  for (const strike of selectedStrikes) {
    const row = { strike, values: [] };
    for (const exp of expirationResults) {
      const data = exp.strikeGEX[strike] || { net: 0, call: 0, put: 0, callOI: 0, putOI: 0 };
      row.values.push(data);
      if (Math.abs(data.net) > maxAbsGEX) maxAbsGEX = Math.abs(data.net);
    }
    grid.push(row);
  }

  // 6. Build aggregated profiles (net GEX + vanna per strike across all expirations)
  const profile = selectedStrikes.map(strike => {
    let totalNet = 0, totalCall = 0, totalPut = 0, totalCallOI = 0, totalPutOI = 0, totalCallVol = 0, totalPutVol = 0;
    for (const exp of expirationResults) {
      const d = exp.strikeGEX[strike];
      if (d) { totalNet += d.net; totalCall += d.call; totalPut += d.put; totalCallOI += (d.callOI || 0); totalPutOI += (d.putOI || 0); totalCallVol += (d.callVol || 0); totalPutVol += (d.putVol || 0); }
    }
    return { strike, net: totalNet, call: totalCall, put: totalPut, callOI: totalCallOI, putOI: totalPutOI, callVol: totalCallVol, putVol: totalPutVol };
  });

  const vannaProfile = selectedStrikes.map(strike => {
    let net = 0, call = 0, put = 0;
    for (const exp of expirationResults) {
      const d = exp.strikeVanna?.[strike];
      if (d) { net += d.net; call += d.call; put += d.put; }
    }
    return { strike, net, call, put };
  });

  const charmProfile = selectedStrikes.map(strike => {
    let net = 0, call = 0, put = 0;
    for (const exp of expirationResults) {
      const d = exp.strikeCharm?.[strike];
      if (d) { net += d.net; call += d.call; put += d.put; }
    }
    return { strike, net, call, put };
  });

  // 7. Compute key levels: call wall, put wall, gamma flip (from friend's algo)
  let callWall = null, putWall = null, gammaFlip = null;
  if (profile.length > 0) {
    // Call wall = strike with highest positive net GEX
    const posStrikes = profile.filter(p => p.net > 0);
    if (posStrikes.length > 0) {
      callWall = posStrikes.reduce((best, p) => p.net > best.net ? p : best);
    }
    // Put wall = strike with most negative net GEX
    const negStrikes = profile.filter(p => p.net < 0);
    if (negStrikes.length > 0) {
      putWall = negStrikes.reduce((best, p) => p.net < best.net ? p : best);
    }
    // Gamma flip = where cumulative GEX crosses zero (interpolated)
    let cumulative = 0;
    for (let i = 0; i < profile.length; i++) {
      const prev = cumulative;
      cumulative += profile[i].net;
      if (i > 0 && prev !== 0 && Math.sign(prev) !== Math.sign(cumulative)) {
        const ratio = Math.abs(prev) / (Math.abs(prev) + Math.abs(profile[i].net));
        gammaFlip = profile[i - 1].strike + ratio * (profile[i].strike - profile[i - 1].strike);
        gammaFlip = Math.round(gammaFlip * 100) / 100;
        break;
      }
    }
  }

  // 8. Compute max pain per expiration
  //    Max pain = strike where total $ loss for all option holders is minimized
  const maxPainByExp = [];
  for (const exp of expirationResults) {
    const strikes = Object.keys(exp.strikeGEX).map(Number).sort((a, b) => a - b);
    if (strikes.length < 3) continue;
    let minLoss = Infinity, painStrike = null;
    for (const candidate of strikes) {
      let totalLoss = 0;
      for (const s of strikes) {
        const d = exp.strikeGEX[s];
        if (!d) continue;
        if (candidate > s) totalLoss += (candidate - s) * (d.callOI || 0) * 100;
        if (candidate < s) totalLoss += (s - candidate) * (d.putOI || 0) * 100;
      }
      if (totalLoss < minLoss) { minLoss = totalLoss; painStrike = candidate; }
    }
    if (painStrike != null) maxPainByExp.push({ date: exp.date, strike: painStrike, totalLoss: minLoss });
  }
  // Overall max pain from nearest expiration
  const maxPain = maxPainByExp.length > 0 ? maxPainByExp[0] : null;

  // 9. Compute net totals
  const totalNetGEX = profile.reduce((s, p) => s + p.net, 0);
  const totalCallGEX = profile.reduce((s, p) => s + p.call, 0);
  const totalPutGEX = profile.reduce((s, p) => s + p.put, 0);
  const totalNetVanna = vannaProfile.reduce((s, p) => s + p.net, 0);
  const totalNetCharm = charmProfile.reduce((s, p) => s + p.net, 0);

  // Reverse so highest strike is on top (trader convention: calls on top, puts on bottom)
  selectedStrikes.reverse();
  grid.reverse();
  profile.reverse();
  vannaProfile.reverse();
  charmProfile.reverse();

  // Normalize source display name
  const displaySource = source === 'DatabentoLive' ? 'Databento' : source;

  // Determine data quality based on source
  const dataQualityMap = {
    'ThetaData': 'realtime',
    'DatabentoLive': 'delayed',
    'Databento': 'delayed',
    'Tradier': 'delayed',
    'Public.com': 'delayed',
    'Yahoo': 'degraded',
  };
  const dataQuality = dataQualityMap[source] || 'degraded';

  // Imbalance analysis
  const { analyzeImbalance } = require('../lib/imbalance');
  const heatmapResult = {
    ticker,
    spotPrice,
    source: displaySource,
    dataSource: source,
    dataQuality,
    lastUpdated: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    expirations: expirationResults.map(e => ({ date: e.date, totalGEX: e.totalGEX })),
    availableExpirations: futureExpDates,
    strikes: selectedStrikes,
    grid,
    profile,
    maxAbsGEX,
    callWall: callWall ? { strike: callWall.strike, gex: callWall.net } : null,
    putWall: putWall ? { strike: putWall.strike, gex: putWall.net } : null,
    gammaFlip,
    maxPain,
    maxPainByExp,
    totalNetGEX,
    totalCallGEX,
    totalPutGEX,
    vannaProfile,
    totalNetVanna,
    charmProfile,
    totalNetCharm,
    ivByStrike,
  };
  heatmapResult.imbalance = analyzeImbalance(heatmapResult);
  const { analyzeHedgePressure } = require('../lib/hedge-pressure');
  heatmapResult.hedgePressure = analyzeHedgePressure(heatmapResult, heatmapResult.imbalance.confidence);
  return heatmapResult;
}

async function _fetchAndPush(res, ticker, range, expirations) {
  try {
    // Race the fetch against a 30s timeout to prevent hanging
    const data = await Promise.race([
      _fetchHeatmapData(ticker, range, expirations),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Heatmap fetch timeout (30s)')), 30_000)),
    ]);
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);

    // Populate live GEX cache so real-time updates can update OI incrementally
    _populateLiveCache(ticker, data, data.source);
  } catch (err) {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SPA-embeddable exports: getGexPageCSS / getGexPageHTML / getGexPageJS
// ═══════════════════════════════════════════════════════════════════════

function getGexPageCSS() {
  return `
/* ── GEX page scoped styles ── */
#page-gex .ticker-input {
  background: var(--bg-surface); border: 1px solid var(--border); color: var(--text);
  padding: 7px 14px; border-radius: 6px; font-family: var(--font-mono); font-size: 13px;
  width: 90px; text-transform: uppercase; font-weight: 600;
  transition: border-color 0.25s;
}
#page-gex .ticker-input:focus { outline: none; border-color: var(--accent); }
#page-gex .replay-date-input {
  background: var(--bg-surface); border: 1px solid var(--border); color: var(--text);
  padding: 5px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px;
  cursor: pointer;
}
#page-gex .replay-date-input::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
#page-gex .replay-btn {
  padding: 5px 10px; font-size: 12px; min-width: auto;
  background: var(--bg-surface); border: 1px solid var(--border); color: var(--text);
  border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
#page-gex .replay-btn:hover { border-color: var(--accent); color: var(--accent); }
#page-gex .replay-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
#page-gex .replay-slider { cursor: pointer; accent-color: var(--accent); }
#page-gex .replay-time {
  font-family: var(--font-mono); font-size: 12px; color: var(--accent);
  font-weight: 600; min-width: 40px;
}
#page-gex .replay-badge {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;
  background: rgba(239, 68, 68, 0.15); color: #ef4444; border-radius: 4px;
  font-size: 11px; font-weight: 600; font-family: var(--font-mono);
}
#page-gex .ticker-dropdown {
  display: none; position: absolute; top: 100%; left: 0; z-index: 200;
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px;
  margin-top: 4px; min-width: 180px; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  max-height: 260px; overflow-y: auto;
}
#page-gex .ticker-dropdown.show { display: block; }
#page-gex .ticker-option {
  padding: 8px 14px; cursor: pointer; font-family: var(--font-mono); font-size: 11px;
  display: flex; justify-content: space-between; align-items: center; transition: background 0.15s;
}
#page-gex .ticker-option:hover { background: var(--accent-subtle); }
#page-gex .ticker-option .ticker-sym { font-weight: 600; color: var(--text); }
#page-gex .ticker-option .ticker-desc { font-size: 9px; color: var(--text-muted); }
#page-gex .btn {
  background: transparent; border: 1px solid var(--border); color: var(--text-muted);
  padding: 6px 14px; border-radius: 6px; cursor: pointer; font-family: var(--font-mono);
  font-size: 10px; font-weight: 500; transition: all 0.25s;
}
#page-gex .btn:hover { color: var(--text); border-color: var(--border); }
#page-gex .btn.active { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 700; }
#page-gex .btn.live { border-color: rgba(78,201,160,0.2); color: var(--green); }
#page-gex .btn.live.active { background: var(--green); color: var(--bg); border-color: var(--green); }

#page-gex .controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
#page-gex .control-group { display: flex; align-items: center; gap: 5px; }
#page-gex .control-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
#page-gex .range-input { width: 70px; accent-color: var(--accent); }
#page-gex .range-val { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); min-width: 28px; text-align: center; }
#page-gex .separator { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }

#page-gex .spot-badge {
  color: var(--text); padding: 5px 14px;
  border-radius: 6px; font-family: var(--font-mono); font-size: 13px; font-weight: 600;
  white-space: nowrap; background: var(--bg-surface); border: 1px solid var(--border);
}
#page-gex .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 5px; }
#page-gex .status-dot.live { background: var(--green); }
#page-gex .status-dot.off { background: var(--text-muted); }

/* ── Tab Bar ── */
#page-gex .tab-bar {
  display: flex; background: var(--bg-surface); border-bottom: 1px solid var(--border);
  padding: 0 16px; flex-shrink: 0;
}
#page-gex .tab {
  padding: 10px 20px; background: transparent; border: none; border-bottom: 2px solid transparent;
  color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
#page-gex .tab:hover { color: var(--text); background: var(--border-subtle); }
#page-gex .tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }

/* ── Detail Zone ── */
#page-gex .detail-zone {
  flex: 1; overflow: hidden; position: relative; min-height: 200px;
}
#page-gex .detail-panel {
  display: none; position: absolute; inset: 0; overflow-y: auto;
  padding: 0; opacity: 0; transition: opacity 0.2s ease; flex-direction: column;
}
#page-gex .detail-panel.active { display: flex; opacity: 1; }

/* ── Heatmap Panel ── */
#page-gex .heatmap-controls {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: var(--bg); border-bottom: 1px solid var(--border); overflow-x: auto;
  flex-shrink: 0;
}
#page-gex .heatmap-canvas-wrap { flex: 1; position: relative; overflow: hidden; }
#page-gex #gexHeatmapCanvas { width: 100%; height: 100%; display: block; }

/* ── Greeks Panel ── */
#page-gex .greeks-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg-surface);
  flex-shrink: 0;
}
#page-gex .greeks-toggle { display: flex; gap: 2px; background: var(--bg-surface); border-radius: 6px; padding: 2px; }
#page-gex .greeks-btn {
  padding: 5px 14px; border-radius: 4px; border: none; background: transparent;
  color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
#page-gex .greeks-btn.active { background: var(--accent); color: var(--bg); font-weight: 700; }

/* ── Analysis Panel ── */
#page-gex .analysis-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-surface);
  font-family: var(--font-body); font-size: 11px; font-weight: 600; color: var(--text-muted);
  flex-shrink: 0;
}
#page-gex .analysis-content { flex: 1; padding: 16px; overflow-y: auto; }

/* ── Scan Panel ── */
#page-gex .scan-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg-surface);
  font-family: var(--font-body); font-size: 11px; font-weight: 600; color: var(--text-muted);
  flex-shrink: 0;
}
#page-gex #gexScanContent { flex: 1; padding: 12px 16px; overflow-y: auto; }

/* ── Overview Panel ── */
#page-gex .overview-panel { display: none; flex: 1; padding: 24px 32px; overflow-y: auto; animation: gex-fadeIn 0.4s ease; }
#page-gex .overview-panel.show { display: block; }
@keyframes gex-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
#page-gex .overview-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
@media (max-width: 900px) { #page-gex .overview-cards { grid-template-columns: repeat(2, 1fr); } }
#page-gex .overview-card {
  background: var(--bg-surface); padding: 20px 24px; border-radius: 10px;
  border: 1px solid var(--border); transition: all 0.3s;
}
#page-gex .overview-card:hover { background: var(--bg-surface-hover); border-color: var(--border); }
#page-gex .overview-card .card-label { font-family: var(--font-body); font-size: 11px; font-weight: 500; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0; text-transform: none; }
#page-gex .overview-card .card-value { font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -1px; }
#page-gex .overview-card .card-sub { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 6px; }
#page-gex .intensity-gauge { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
#page-gex .intensity-gauge canvas { max-width: 120px; }
#page-gex .intensity-pct { font-family: var(--font-mono); font-size: 28px; font-weight: 700; margin-top: -20px; }
#page-gex .intensity-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: 2px; }
#page-gex .intensity-range { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: 4px; }
#page-gex .overview-regime { display: inline-flex; align-items: center; gap: 12px; padding: 10px 0; margin-bottom: 20px; }
#page-gex .overview-regime .regime-dot { width: 8px; height: 8px; border-radius: 50%; }
#page-gex .overview-regime .regime-label { font-family: var(--font-heading); font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
#page-gex .overview-regime .regime-conf { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
#page-gex .overview-signal { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
#page-gex .overview-signal .signal-label { font-family: var(--font-body); font-size: 11px; font-weight: 500; color: var(--text-muted); margin-bottom: 8px; }
#page-gex .overview-signal .signal-value { font-family: var(--font-mono); font-size: 14px; font-weight: 600; }
#page-gex .overview-depth { margin-bottom: 24px; }
#page-gex .overview-depth .depth-bar-wrap { background: rgba(239,68,68,0.12); border-radius: 6px; height: 20px; position: relative; overflow: hidden; }
#page-gex .overview-depth .depth-bar-bid { background: var(--accent-subtle); height: 100%; border-radius: 6px 0 0 6px; position: absolute; left: 0; top: 0; transition: width 0.5s; border-right: 1px solid var(--green); }
#page-gex .overview-depth .depth-labels { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; font-weight: 500; margin-top: 6px; }
#page-gex .overview-hint { color: var(--text-muted); font-family: var(--font-body); font-size: 12px; margin-top: 28px; text-align: center; font-weight: 400; }

/* ── Expiration Chips ── */
#page-gex .exp-chip {
  padding: 5px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px;
  font-weight: 500; cursor: pointer; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); transition: all 0.2s;
  white-space: nowrap; user-select: none;
}
#page-gex .exp-chip.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--border); }
#page-gex .exp-chip:hover:not(.active) { border-color: var(--text-muted); color: var(--text-muted); }
#page-gex .exp-label { font-family: var(--font-body); font-size: 11px; color: var(--text-muted); margin-right: 8px; font-weight: 500; }
#page-gex .heatmap-view-btn { font-family: var(--font-mono); font-size: 10px; padding: 3px 10px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); border-radius: 4px; cursor: pointer; transition: all 0.15s; }
#page-gex .heatmap-view-btn.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
#page-gex .heatmap-view-btn:hover:not(.active) { border-color: var(--border); color: var(--text-muted); }
#page-gex .treemap-legend { display: flex; align-items: center; gap: 14px; padding: 6px 14px; font-family: var(--font-body); font-size: 10px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); flex-wrap: wrap; }
#page-gex .legend-item { display: flex; align-items: center; gap: 4px; }
#page-gex .legend-swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
#page-gex .legend-badge { font-size: 8px; border: 1.5px solid; border-radius: 2px; padding: 0 2px; }
#page-gex .legend-note { color: var(--text-muted); font-style: italic; margin-left: auto; }
#page-gex .legend-levels { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
#page-gex .legend-levels .ll { font-family: var(--font-mono); font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 2px; }
#page-gex .legend-levels .ll-cw { background: rgba(59,130,246,0.15); color: #60a5fa; }
#page-gex .legend-levels .ll-pw { background: rgba(249,115,22,0.15); color: #fb923c; }
#page-gex .legend-levels .ll-flip { background: rgba(250,204,21,0.12); color: #facc15; }
#page-gex .legend-levels .ll-mag { background: var(--border-subtle); color: #a0a0a0; }
#page-gex .tt-zone { font-size: 10px; color: var(--text-muted); margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--border-subtle); font-style: italic; }

/* ── Scan Filters ── */
#page-gex .scan-filters { display: flex; gap: 4px; padding: 6px 0 8px; }
#page-gex .scan-filter { font-family: var(--font-mono); font-size: 10px; padding: 3px 10px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-muted); border-radius: 4px; cursor: pointer; transition: all 0.15s; }
#page-gex .scan-filter.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
#page-gex .scan-filter:hover:not(.active) { border-color: var(--border); }

/* ── Tooltip ── */
#page-gex .tooltip {
  position: fixed; z-index: 100; background: var(--bg-surface);
  border: 1px solid var(--border); border-radius: 8px; padding: 14px 18px;
  font-size: 12px; pointer-events: none; opacity: 0; transition: opacity 0.15s;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6); max-width: 240px;
}
#page-gex .tooltip.show { opacity: 1; }
#page-gex .tooltip .tt-title { font-family: var(--font-body); font-weight: 600; margin-bottom: 10px; color: var(--text); font-size: 13px; }
#page-gex .tooltip .tt-row { display: flex; justify-content: space-between; gap: 20px; margin: 4px 0; }
#page-gex .tooltip .tt-label { font-family: var(--font-body); font-size: 11px; color: var(--text-muted); font-weight: 400; }
#page-gex .tooltip .tt-val { font-family: var(--font-mono); font-weight: 600; font-size: 11px; }
#page-gex .tt-pos { color: var(--green); }
#page-gex .tt-neg { color: var(--red); }

/* ── Profile Panel ── */
#page-gex .profile-panel { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: var(--bg); }
#page-gex .profile-title {
  padding: 12px 20px; font-family: var(--font-body); font-size: 11px; font-weight: 600;
  border-bottom: 1px solid var(--border); background: var(--bg-surface);
  color: var(--text-muted); letter-spacing: 0;
}
#page-gex .profile-bars { flex: 1; padding: 6px 0; overflow-y: auto; }
#page-gex .profile-row { display: flex; align-items: center; height: 30px; padding: 0 16px; font-size: 11px; transition: background 0.2s; position: relative; }
#page-gex .profile-row:hover { background: var(--border-subtle); }
#page-gex .profile-row.spot { background: var(--accent-subtle); }
#page-gex .profile-strike { width: 52px; text-align: right; font-family: var(--font-mono); color: var(--text-muted); font-weight: 500; flex-shrink: 0; font-size: 10px; }
#page-gex .profile-bar-wrap { flex: 1; display: flex; align-items: center; margin: 0 10px; height: 20px; position: relative; }
#page-gex .profile-bar { height: 12px; border-radius: 2px; min-width: 1px; transition: width 0.5s ease; }
#page-gex .profile-bar.positive { background: var(--green); opacity: 0.7; margin-left: auto; border-radius: 2px 0 0 2px; }
#page-gex .profile-bar.negative { background: var(--red); opacity: 0.7; margin-right: auto; border-radius: 0 2px 2px 0; }
#page-gex .profile-center { position: absolute; left: 50%; width: 1px; height: 100%; background: var(--border); }
#page-gex .profile-val { width: 62px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
#page-gex .profile-row.wall-call { border-right: 2px solid var(--green); }
#page-gex .profile-row.wall-put { border-right: 2px solid var(--red); }
#page-gex .profile-row.flip-row { border-right: 2px solid var(--yellow); }
#page-gex .profile-agg-line { position: absolute; top: 0; width: 1px; height: 100%; background: var(--yellow); z-index: 2; pointer-events: none; }

/* ── Targets Panel ── */
#page-gex .tgt-section { margin-bottom: 20px; }
#page-gex .tgt-section-hdr {
  font-family: var(--font-body); font-size: 11px; font-weight: 600;
  padding: 10px 12px 6px; margin-bottom: 4px;
  display: flex; justify-content: space-between; align-items: center;
  color: var(--text-muted); border-bottom: 1px solid var(--border); letter-spacing: 0;
  text-transform: none;
}
#page-gex .tgt-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; border-radius: 4px; font-size: 11px; transition: background 0.2s; }
#page-gex .tgt-row:hover { background: var(--border-subtle); }
#page-gex .tgt-strike { font-family: var(--font-mono); font-weight: 600; color: var(--text); min-width: 55px; font-size: 12px; }
#page-gex .tgt-dist { font-family: var(--font-mono); color: var(--text-muted); font-size: 10px; margin-left: 4px; }
#page-gex .tgt-tags { display: flex; gap: 4px; margin-left: 8px; }
#page-gex .tgt-tag { font-family: var(--font-mono); font-size: 8px; font-weight: 600; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; }
#page-gex .tgt-bar-wrap { flex: 1; max-width: 80px; height: 4px; background: var(--bg-surface); border-radius: 2px; margin: 0 10px; overflow: hidden; }
#page-gex .tgt-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
#page-gex .tgt-pct { font-family: var(--font-mono); font-weight: 600; min-width: 34px; text-align: right; font-size: 11px; }
#page-gex .tgt-signal { padding: 14px 16px; border-radius: 6px; margin-bottom: 8px; border-left: 2px solid; transition: background 0.2s; }
#page-gex .tgt-signal:hover { background: var(--border-subtle); }
#page-gex .tgt-signal-title { font-family: var(--font-heading); font-weight: 600; font-size: 12px; }
#page-gex .tgt-signal-detail { font-family: var(--font-body); font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: 400; }
#page-gex .tgt-signal-conf { font-family: var(--font-mono); font-weight: 700; font-size: 15px; float: right; margin-top: -2px; }

/* ── Loading / Error ── */
#page-gex .loading { display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 14px; }
#page-gex .loading .spinner { width: 20px; height: 20px; border: 1.5px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: gex-spin 0.8s linear infinite; }
@keyframes gex-spin { to { transform: rotate(360deg); } }
#page-gex .error-msg { color: var(--red); background: rgba(239,68,68,0.12); padding: 14px 24px; border-radius: 6px; margin: 20px; font-family: var(--font-body); font-size: 12px; border: 1px solid rgba(192,88,98,0.15); }

/* ── Key Levels Badges ── */
#page-gex .key-levels { display: flex; gap: 8px; font-family: var(--font-mono); font-size: 10px; font-weight: 500; }
#page-gex .kl-badge { padding: 4px 10px; border-radius: 4px; white-space: nowrap; border: 1px solid transparent; }
#page-gex .kl-call { background: var(--accent-subtle); color: var(--green); border-color: rgba(78,201,160,0.12); }
#page-gex .kl-put { background: rgba(239,68,68,0.12); color: var(--red); border-color: rgba(192,88,98,0.12); }
#page-gex .kl-flip { background: var(--warn-dim); color: var(--yellow); border-color: rgba(184,149,64,0.12); }

/* ── Profile Annotations ── */
#page-gex .profile-annotation { position: absolute; right: 6px; font-family: var(--font-mono); font-size: 8px; font-weight: 600; padding: 1px 6px; border-radius: 3px; }

/* ── Info Tips ── */
#page-gex .info-tip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 14px; height: 14px; border-radius: 50%; font-size: 9px; font-weight: 600;
  background: var(--border); color: var(--text-muted); cursor: help;
  margin-left: 6px; vertical-align: middle; position: relative;
}
#page-gex .info-tip:hover { background: var(--accent-subtle); color: var(--accent); }
#page-gex .info-tip-popup {
  display: none; position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  background: var(--bg-surface-hover); border: 1px solid var(--border); border-radius: 8px;
  padding: 12px 16px; width: 260px; font-family: var(--font-body); font-size: 11px;
  color: var(--text); line-height: 1.5; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  z-index: 200; font-weight: 400; white-space: normal; pointer-events: none;
}
#page-gex .info-tip:hover .info-tip-popup { display: block; }
#page-gex .info-tip-popup strong { color: var(--accent); font-weight: 600; }

/* ── Regime Badge ── */
#page-gex .regime-badge {
  padding: 4px 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px;
  font-weight: 600; white-space: nowrap; border: 1px solid transparent;
}

/* ── Regime State Bar ── */
#page-gex .regime-bar {
  margin: 0 24px 8px; padding: 14px 20px; border-radius: 10px;
  font-family: var(--font-heading); font-size: 16px; font-weight: 700;
  text-align: center; text-transform: uppercase;
  border: 1px solid var(--border);
  transition: all 0.4s ease, box-shadow 0.4s ease;
}
#page-gex .regime-bar .regime-label { opacity: 1; }
#page-gex .regime-bar .regime-sub { font-size: 13px; font-weight: 400; font-family: var(--font-body); text-transform: none; margin-top: 2px; opacity: 0.8; }
#page-gex .regime-stable { background: rgba(34,197,94,0.06); border-color: rgba(34,197,94,0.20); color: #22c55e; }
#page-gex .regime-building { background: rgba(234,179,8,0.06); border-color: rgba(234,179,8,0.20); color: #eab308; }
#page-gex .regime-fragile { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.18); color: #ef4444; }
#page-gex .regime-acceleration { background: rgba(239,68,68,0.10); border-color: rgba(239,68,68,0.30); color: #f87171; }
#page-gex .regime-expansion { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.40); color: #fca5a5; }

/* Soul shift — verdict card tints */
#page-gex .soul-stable .verdict-card { border-color: rgba(34,197,94,0.12); }
#page-gex .soul-building .verdict-card { border-color: rgba(234,179,8,0.12); }
#page-gex .soul-fragile .verdict-card { border-color: rgba(239,68,68,0.10); background: rgba(239,68,68,0.015); }
#page-gex .soul-acceleration .verdict-card { border-color: rgba(239,68,68,0.18); background: rgba(239,68,68,0.025); }
#page-gex .soul-expansion .verdict-card { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.035); }
#page-gex .metric-hot { color: var(--red) !important; display: inline-block; transition: all 0.4s ease; }
#page-gex .metric-warm { color: var(--yellow) !important; display: inline-block; transition: all 0.4s ease; }
#page-gex .metric-cool { color: var(--green) !important; display: inline-block; transition: all 0.4s ease; }

/* Regime Action Panel */
#page-gex .regime-action-panel {
  margin: 0 14px 2px; padding: 10px 16px; border-radius: 6px;
  background: var(--bg-surface); border: 1px solid var(--border);
  font-family: var(--font-body); font-size: 11px; color: var(--text-muted);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 4px 16px;
  transition: border-color 0.4s, background 0.4s;
}
#page-gex .regime-action-panel .ra-item { line-height: 1.5; }
#page-gex .regime-action-panel .ra-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
#page-gex .regime-action-panel .ra-val { color: var(--text); font-weight: 500; }
#page-gex .regime-action-panel .ra-avoid { color: var(--red); }
#page-gex .soul-stable .regime-action-panel { border-color: rgba(34,197,94,0.08); }
#page-gex .soul-building .regime-action-panel { border-color: rgba(234,179,8,0.08); }
#page-gex .soul-fragile .regime-action-panel { border-color: rgba(239,68,68,0.06); }
#page-gex .soul-acceleration .regime-action-panel { border-color: rgba(239,68,68,0.12); }
#page-gex .soul-expansion .regime-action-panel { border-color: rgba(239,68,68,0.16); }
/* ── Trade Desk ── */
#page-gex .trade-desk {
  margin: 0 14px 6px; border-radius: 8px; overflow: hidden;
  border: 1px solid var(--border); background: var(--bg-surface);
}
#page-gex .trade-desk-collapse-btn {
  width: 100%; background: none; border: none; padding: 6px 16px;
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  cursor: pointer; text-align: right;  border-top: 1px solid var(--border-subtle); transition: color 0.2s;
}
#page-gex .trade-desk-collapse-btn:hover { color: var(--accent); }
/* Hero Pick Card */
#page-gex .hero-pick {
  padding: 16px; border-bottom: 1px solid var(--border-subtle);
}
#page-gex .hero-pick.call-pick { border-left: 3px solid var(--green); }
#page-gex .hero-pick.put-pick { border-left: 3px solid var(--red); }
#page-gex .hero-direction {
  font-family: var(--font-body); font-size: 18px; font-weight: 800;
  letter-spacing: -0.5px; margin-bottom: 4px;
}
#page-gex .hero-direction.call { color: var(--green); }
#page-gex .hero-direction.put { color: var(--red); }
#page-gex .hero-expiry {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  margin-bottom: 10px;
}
#page-gex .hero-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  margin-bottom: 10px;
}
@media(max-width:640px) { #page-gex .hero-metrics { grid-template-columns: repeat(2, 1fr); } }
#page-gex .hero-metric {
  background: var(--border-subtle); border: 1px solid var(--border-subtle);
  border-radius: 4px; padding: 8px; text-align: center;
}
#page-gex .hero-metric-label {
  font-family: var(--font-mono); font-size: 8px; color: var(--text-muted);
  text-transform: uppercase; margin-bottom: 2px;
}
#page-gex .hero-metric-value {
  font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--text);
}
#page-gex .hero-confidence {
  display: inline-flex; align-items: center; gap: 6px; margin-bottom: 8px;
}
#page-gex .hero-conf-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 3px;
}
#page-gex .hero-conf-badge.grade-a { background: rgba(34,197,94,0.15); color: var(--green); }
#page-gex .hero-conf-badge.grade-b { background: rgba(245,158,11,0.15); color: var(--yellow); }
#page-gex .hero-conf-badge.grade-c { background: rgba(239,68,68,0.15); color: var(--red); }
#page-gex .hero-conf-pct {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
}
#page-gex .hero-reasoning {
  font-family: var(--font-body); font-size: 11px; color: var(--text-muted);
  line-height: 1.5; margin-bottom: 10px; font-style: italic;
}
#page-gex .hero-actions { display: flex; gap: 8px; flex-wrap: wrap; }
#page-gex .hero-btn {
  font-family: var(--font-mono); font-size: 10px; padding: 6px 14px;
  border-radius: 4px; cursor: pointer; border: 1px solid; transition: all 0.2s;
  font-weight: 600; background: none;
}
#page-gex .hero-btn:hover { transform: translateY(-1px); }
#page-gex .hero-btn-customize {
  border-color: var(--accent); color: var(--accent);
}
#page-gex .hero-btn-customize:hover { background: var(--accent-subtle); }
#page-gex .hero-btn-alts {
  border-color: var(--border); color: var(--text-muted);
}
#page-gex .hero-btn-alts:hover { background: var(--border-subtle); }
/* Alternatives List */
#page-gex .trade-alts {
  max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
}
#page-gex .trade-alts.open { max-height: 600px; }
#page-gex .alt-pick {
  padding: 10px 16px; border-bottom: 1px solid var(--border-subtle);
  display: grid; grid-template-columns: auto 1fr auto; gap: 10px;
  align-items: center; cursor: pointer; transition: background 0.15s;
}
#page-gex .alt-pick:hover { background: var(--border-subtle); }
#page-gex .alt-direction {
  font-family: var(--font-body); font-size: 13px; font-weight: 700;
  min-width: 180px;
}
#page-gex .alt-direction.call { color: var(--green); }
#page-gex .alt-direction.put { color: var(--red); }
#page-gex .alt-meta {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  display: flex; gap: 12px; flex-wrap: wrap;
}
#page-gex .alt-actions { display: flex; gap: 6px; }
#page-gex .alt-swap-btn {
  font-family: var(--font-mono); font-size: 9px; padding: 3px 8px;
  border-radius: 3px; cursor: pointer; border: 1px solid var(--border);
  color: var(--text-muted); background: none; transition: all 0.15s;
}
#page-gex .alt-swap-btn:hover { border-color: var(--accent); color: var(--accent); }
/* Trade Builder */
#page-gex .trade-builder {
  max-height: 0; overflow: hidden; transition: max-height 0.4s ease;
  background: rgba(0,0,0,0.3); border-top: 1px solid var(--border-subtle);
}
#page-gex .trade-builder.open { max-height: 1200px; }
#page-gex .builder-section {
  padding: 12px 16px; border-bottom: 1px solid var(--border-subtle);
}
#page-gex .builder-label {
  font-family: var(--font-mono); font-size: 9px; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 8px;
}
#page-gex .builder-pills { display: flex; gap: 4px; flex-wrap: wrap; }
#page-gex .builder-pill {
  font-family: var(--font-mono); font-size: 11px; padding: 6px 14px;
  border-radius: 4px; cursor: pointer; border: 1px solid var(--border-subtle);
  color: var(--text-muted); background: none; transition: all 0.15s;
}
#page-gex .builder-pill:hover { border-color: var(--border); }
#page-gex .builder-pill.active-call { background: rgba(34,197,94,0.15); border-color: var(--green); color: var(--green); }
#page-gex .builder-pill.active-put { background: rgba(239,68,68,0.15); border-color: var(--red); color: var(--red); }
#page-gex .builder-pill.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
#page-gex .builder-strikes { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px; }
#page-gex .builder-strikes::-webkit-scrollbar { height: 3px; }
#page-gex .builder-strikes::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
#page-gex .builder-greeks {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;
}
@media(max-width:640px) { #page-gex .builder-greeks { grid-template-columns: repeat(3, 1fr); } }
#page-gex .builder-greek {
  background: var(--border-subtle); border: 1px solid var(--border-subtle);
  border-radius: 4px; padding: 6px 8px; text-align: center;
}
#page-gex .builder-greek-label {
  font-family: var(--font-mono); font-size: 8px; color: var(--text-muted);
  text-transform: uppercase;}
#page-gex .builder-greek-val {
  font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--text);
}
#page-gex .builder-risk {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
}
@media(max-width:640px) { #page-gex .builder-risk { grid-template-columns: 1fr; } }
#page-gex .builder-input-group { display: flex; flex-direction: column; gap: 3px; }
#page-gex .builder-input-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
  text-transform: uppercase;}
#page-gex .builder-input {
  font-family: var(--font-mono); font-size: 12px; padding: 6px 10px;
  border-radius: 4px; border: 1px solid var(--border-subtle);
  background: rgba(0,0,0,0.3); color: var(--text); width: 100%; box-sizing: border-box;
}
#page-gex .builder-input:focus { outline: none; border-color: var(--accent); }
#page-gex .builder-pnl {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
}
@media(max-width:640px) { #page-gex .builder-pnl { grid-template-columns: 1fr; } }
#page-gex .pnl-scenario {
  background: var(--border-subtle); border: 1px solid var(--border-subtle);
  border-radius: 4px; padding: 8px; text-align: center;
}
#page-gex .pnl-scenario-label {
  font-family: var(--font-mono); font-size: 8px; color: var(--text-muted);
  text-transform: uppercase; margin-bottom: 2px;
}
#page-gex .pnl-scenario-val {
  font-family: var(--font-mono); font-size: 14px; font-weight: 700;
}
#page-gex .pnl-pos { color: var(--green); }
#page-gex .pnl-neg { color: var(--red); }
#page-gex .pnl-neutral { color: var(--text-muted); }
#page-gex .trade-desk-disclaimer {
  padding: 6px 16px; font-family: var(--font-mono); font-size: 8px;
  color: var(--text-muted); text-align: center; font-style: italic;
  border-top: 1px solid var(--border-subtle);
}

/* ── Verdict Bar ── */
#page-gex .verdict-card {
  margin: 0 14px 4px; padding: 12px 16px; border-radius: 8px;
  background: var(--bg-surface); border: 1px solid var(--border);
  font-family: var(--font-body); font-size: 12px;
  transition: border-color 0.6s, background 0.6s;
}
#page-gex .verdict-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
#page-gex .verdict-mode { font-family: var(--font-heading); font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
#page-gex .verdict-pills { display: flex; gap: 6px; margin-left: auto; align-items: center; flex-wrap: wrap; }
#page-gex .verdict-pill { font-family: var(--font-mono); font-size: 9px; padding: 2px 8px; border-radius: 3px; font-weight: 600; }
#page-gex .pill-low { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
#page-gex .pill-building { background: rgba(234,179,8,0.1); color: var(--yellow); border: 1px solid rgba(234,179,8,0.2); }
#page-gex .pill-high { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
#page-gex .pill-stabilizing { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
#page-gex .pill-fragilizing { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
#page-gex .pill-neutral { background: var(--border-subtle); color: var(--text-muted); border: 1px solid var(--border-subtle); }
#page-gex .verdict-action { font-size: 13px; color: var(--text); margin-bottom: 6px; font-weight: 500; }
#page-gex .verdict-levels { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
#page-gex .verdict-invalidation { font-size: 10px; color: var(--text-muted); margin-bottom: 4px; font-style: italic; }
#page-gex .verdict-pressure { font-family: var(--font-mono); font-size: 10px; margin-bottom: 6px; color: var(--text-muted); }
#page-gex .verdict-pressure b { color: var(--text); font-weight: 600; }
#page-gex .verdict-toggles { display: flex; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border-subtle); }
#page-gex .verdict-adv-toggle {
  font-family: var(--font-mono); font-size: 9px; padding: 3px 10px;
  border: 1px solid var(--border); background: transparent; color: var(--text-muted);
  border-radius: 3px; cursor: pointer; transition: all 0.15s;
}
#page-gex .verdict-adv-toggle.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
#page-gex .verdict-adv-toggle:hover { border-color: var(--border); }
#page-gex .verdict-advanced { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle); }
#page-gex .verdict-adv-header { margin-bottom: 6px; }
#page-gex .verdict-adv-type { font-family: var(--font-body); font-size: 12px; font-weight: 600; }
#page-gex .verdict-adv-row { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 4px 0; font-size: 10px; color: var(--text-muted); }
#page-gex .verdict-adv-item { font-family: var(--font-mono); }
#page-gex .verdict-adv-walls { display: flex; gap: 8px; margin: 4px 0; font-size: 10px; }
#page-gex .imb-gex-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
#page-gex .imb-gex-label { color: var(--text-muted); font-size: 10px; }
#page-gex .imb-gex-val { font-family: var(--font-mono); font-size: 11px; font-weight: 600; }
#page-gex .imb-reasons { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 4px 0; }
#page-gex .imb-reasons .imb-reason { font-size: 10px; color: var(--text-muted); }
#page-gex .imb-reasons .imb-reason::before { content: '\\2022 '; color: var(--text-muted); }
#page-gex .soul-acceleration .verdict-adv-item, #page-gex .soul-expansion .verdict-adv-item { color: var(--red); transition: color 0.4s; }
#page-gex .imb-level-chip { font-family: var(--font-mono); font-size: 9px; padding: 2px 6px; border-radius: 3px; border: 1px solid; }
#page-gex .imb-level-chip.support { color: var(--green); border-color: var(--accent-subtle); background: rgba(0,232,123,0.05); }
#page-gex .imb-level-chip.resistance { color: var(--red); border-color: rgba(239,68,68,0.12); background: rgba(255,59,92,0.05); }
#page-gex .imb-level-chip.magnet { color: var(--accent); border-color: var(--border); background: var(--accent-subtle); }

/* Timing (0DTE) panel */
#page-gex .verdict-timing { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle); }
#page-gex .timing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; margin-bottom: 8px; }
#page-gex .timing-item { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
#page-gex .timing-item b { color: var(--text); font-weight: 600; }
#page-gex .timing-item .arrow-up { color: var(--green); }
#page-gex .timing-item .arrow-down { color: var(--red); }
#page-gex .timing-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
#page-gex .timing-chart-wrap { background: rgba(0,0,0,0.2); border-radius: 4px; padding: 6px; }
#page-gex .timing-chart-label { font-size: 9px; color: var(--text-muted); margin-bottom: 4px; font-family: var(--font-mono); }
#page-gex .expansion-badge { display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 4px; background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.3); font-weight: 700; cursor: help; }

/* Regime transition smoothing */
#page-gex { transition: background 0.4s ease; }

/* ── Footer ── */
#page-gex .gex-footer { padding: 6px 24px; font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); background: var(--bg-surface); border-top: 1px solid var(--border); display: flex; justify-content: space-between; flex-shrink: 0; }

/* ── Spot Price Flash ── */
@keyframes gex-priceFlash { 0% { background: var(--accent-subtle); } 100% { background: transparent; } }
#page-gex .spot-badge.flash { animation: gex-priceFlash 0.6s ease-out; }

/* ── Squeeze Gauge ── */
#page-gex .squeeze-gauge {
  width: 200px; height: 200px; position: relative; margin: 0 auto;
}
#page-gex .squeeze-ring {
  width: 100%; height: 100%; border-radius: 50%;
  background: conic-gradient(from 180deg, var(--red) 0%, var(--yellow) 50%, var(--green) 100%);
  -webkit-mask: radial-gradient(transparent 65%, black 66%);
  mask: radial-gradient(transparent 65%, black 66%);
  opacity: 0.3;
}
#page-gex .squeeze-value {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
#page-gex .squeeze-number { font-family: var(--font-mono); font-size: 48px; font-weight: 800; letter-spacing: -2px; }
#page-gex .squeeze-label { font-family: var(--font-heading); font-size: 13px; font-weight: 600; margin-top: 4px; }

/* ── Scan Table ── */
#page-gex .scan-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; }
#page-gex .scan-table th {
  padding: 10px 12px; text-align: left; font-size: 9px; color: var(--text-muted);
  font-weight: 500; border-bottom: 1px solid var(--border);
  background: var(--bg); position: sticky; top: 0; z-index: 1;
}
#page-gex .scan-table td {
  padding: 10px 12px; border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
#page-gex .scan-table tr:hover td { background: var(--border-subtle); }
#page-gex .scan-table .scan-ticker { font-weight: 700; color: var(--text); cursor: pointer; }
#page-gex .scan-table .scan-ticker:hover { color: var(--accent); text-decoration: underline; }

/* ── Responsive ── */
@media (max-width: 768px) {
  #page-gex .tab-bar { overflow-x: auto; padding: 0 8px; }
  #page-gex .tab { padding: 10px 16px; font-size: 11px; white-space: nowrap; }
  #page-gex .separator { display: none; }
  #page-gex .controls { width: 100%; }
  #page-gex .key-levels { font-size: 8px; gap: 4px; }
  #page-gex .kl-badge { padding: 2px 6px; font-size: 8px; }
  #page-gex .regime-bar { padding: 6px 10px; font-size: 10px; }
  #page-gex .verdict-card { margin: 0 8px 4px; }
  #page-gex .trade-desk { margin: 0 8px 4px; }
  #page-gex .overview-cards { grid-template-columns: repeat(2, 1fr) !important; }
  #page-gex .detail-zone { min-height: 50vh; }
  #page-gex .heatmap-controls { padding: 6px 10px; gap: 4px; }
  #page-gex .exp-chip { padding: 6px 12px; font-size: 11px; }
}

/* ── GEX page layout ── */
#page-gex.active { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
#page-gex .gex-controls-bar {
  display: flex; align-items: center; gap: 12px; padding: 10px 24px;
  background: var(--bg-surface); border-bottom: 1px solid var(--border); flex-wrap: wrap; flex-shrink: 0;
}

/* ── Metric Stat Cards ── */
#page-gex .metric-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  padding: 0 24px 16px;
}
@media (max-width: 768px) { #page-gex .metric-stats { grid-template-columns: 1fr; } }
#page-gex .metric-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 14px 16px; display: flex; align-items: center; gap: 12px;
}
#page-gex .metric-card-icon {
  width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
}
#page-gex .metric-card-icon.bullish { background: rgba(34,197,94,0.1); color: var(--green); }
#page-gex .metric-card-icon.bearish { background: rgba(239,68,68,0.1); color: var(--red); }
#page-gex .metric-card-icon.neutral { background: rgba(234,179,8,0.1); color: var(--yellow); }
#page-gex .metric-card-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; }
#page-gex .metric-card-value { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--text); }
#page-gex .metric-card-sub { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-top: 1px; }

/* ── Convexity Engine ── */
#page-gex .convexity-section { padding: 0 24px; margin-bottom: 20px; }
#page-gex .convexity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
#page-gex .cx-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
#page-gex .cx-card-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px; font-family: var(--font-body); }
#page-gex .cx-card-value { font-size: 1.1rem; font-family: var(--font-mono); font-weight: 600; }
#page-gex .cx-card-sub { font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px; }
#page-gex .cx-badge-uncal { display: inline-block; background: var(--yellow); color: #000; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; letter-spacing: 0.02em; }
#page-gex .cx-section-title { font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }


/* Dealer Positioning Engine collapse */
#page-gex .dealer-engine-section {
  padding: 0 24px;
}
#page-gex .dealer-engine-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 16px;
  color: var(--text-muted);
  font-size: 12px;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
#page-gex .dealer-engine-toggle:hover {
  color: var(--text);
  border-color: var(--accent);
}
#page-gex .dealer-engine-toggle[aria-expanded="true"] #gexDealerChevron {
  transform: rotate(90deg);
}
#page-gex .dealer-engine-body {
  padding-top: 12px;
}
#page-gex .dealer-engine-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  margin-left: auto;
}
#page-gex .skew-chip { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border: 1px solid var(--border-subtle); border-radius: 4px; background: transparent; color: var(--text-muted); cursor: pointer; }
#page-gex .skew-chip.active { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
`;
}
function getGexPageHTML() {
  return `<div class="page" id="page-gex">
  <div class="page-header">
    <div><h2>SharkGrid&trade;</h2><div class="subtitle">Gamma exposure analysis</div></div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <div style="position:relative">
        <input type="text" class="ticker-input" id="gexTickerInput" value="SPY" placeholder="SPY" maxlength="6" autocomplete="off" />
        <div class="ticker-dropdown" id="gexTickerDropdown"></div>
      </div>
      <button class="btn" id="gexLoadBtn">Load</button>
      <div class="separator"></div>
      <div class="control-group" id="gexReplayGroup" style="display:flex;align-items:center;gap:6px;">
        <input type="date" id="gexReplayDate" class="replay-date-input" title="Select date to replay" />
        <button class="btn replay-btn" id="gexReplayBtn" title="Replay historical GEX">Replay</button>
        <button class="btn replay-btn" id="gexReplayPlayPause" style="display:none" title="Play / Pause">&#9654;</button>
        <input type="range" id="gexReplaySlider" class="replay-slider" min="0" max="100" value="0" style="display:none;width:120px;" />
        <span id="gexReplayTime" class="replay-time" style="display:none">--:--</span>
        <button class="btn replay-btn" id="gexReplayStop" style="display:none" title="Stop replay">&times;</button>
      </div>
      <div class="separator"></div>
      <div class="control-group">
        <span class="control-label">Range</span>
        <input type="range" class="range-input" id="gexRangeSlider" min="5" max="40" value="20" />
        <span class="range-val" id="gexRangeVal">&plusmn;20</span>
      </div>
      <div style="margin-left:auto;display:flex;align-items:center;gap:12px">
        <span class="spot-badge" id="gexSpotBadge">&mdash;</span>
        <span class="key-levels" id="gexKeyLevels"></span>
        <span class="regime-badge" id="gexRegimeBadge"></span>
        <span class="status-dot live" id="gexLiveDot" style="margin-left:4px" title="Live updates every 5s"></span>
      </div>
    </div>
  </div>

  <!-- Interactive GEX Filters -->
  <div class="gex-filters" style="display:flex;gap:8px;padding:8px 16px;border-bottom:1px solid var(--border);align-items:center;flex-wrap:wrap;">
    <label style="font-size:12px;color:var(--text-muted);">Expiry:</label>
    <select id="gexExpiryFilter" style="background:var(--bg-surface);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:4px;font-size:12px;">
      <option value="all">All</option>
    </select>

    <div style="width:1px;height:20px;background:var(--border);margin:0 4px;"></div>

    <label style="font-size:12px;color:var(--text-muted);">Type:</label>
    <div id="gexTypeToggle" style="display:flex;gap:2px;">
      <button class="gex-filter-btn active" data-value="all" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border);cursor:pointer;font-size:12px;background:var(--accent);color:white;">All</button>
      <button class="gex-filter-btn" data-value="call" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border);cursor:pointer;font-size:12px;background:var(--bg-surface);color:var(--text);">Calls</button>
      <button class="gex-filter-btn" data-value="put" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border);cursor:pointer;font-size:12px;background:var(--bg-surface);color:var(--text);">Puts</button>
    </div>

    <div style="width:1px;height:20px;background:var(--border);margin:0 4px;"></div>

    <label style="font-size:12px;color:var(--text-muted);">Source:</label>
    <div id="gexSourceToggle" style="display:flex;gap:2px;">
      <button class="gex-filter-btn active" data-value="oi" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border);cursor:pointer;font-size:12px;background:var(--accent);color:white;">OI</button>
      <button class="gex-filter-btn" data-value="volume" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border);cursor:pointer;font-size:12px;background:var(--bg-surface);color:var(--text);">Volume</button>
    </div>

    <div style="width:1px;height:20px;background:var(--border);margin:0 4px;"></div>

    <label style="font-size:12px;color:var(--text-muted);">Strikes:</label>
    <input type="range" id="gexStrikeRangeFilter" min="10" max="100" value="50" style="width:80px;cursor:pointer;" />
    <span id="gexStrikeRangeLabel" style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">&plusmn;50</span>

    <div style="width:1px;height:20px;background:var(--border);margin:0 4px;"></div>

    <button id="gexFilterRefresh" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border);cursor:pointer;font-size:12px;background:var(--bg-surface);color:var(--text);" title="Refresh with current filters">&#8635; Refresh</button>
  </div>

  <!-- Regime State Bar (always visible) -->
  <div class="regime-bar regime-stable" id="gexRegimeBar">
    <div class="regime-label" id="gexRegimeLabel">Awaiting data...</div>
    <div class="regime-sub" id="gexRegimeSub"></div>
  </div>

  <!-- Regime Action Panel -->
  <div class="regime-action-panel" id="gexRegimeAction" style="display:none"></div>

  <!-- Verdict Card -->
  <div class="verdict-card" id="gexVerdictCard" style="display:none">
    <div class="verdict-top">
      <span class="verdict-mode" id="gexVerdictMode"></span>
      <div class="verdict-pills" id="gexVerdictPills"></div>
    </div>
    <div class="verdict-action" id="gexVerdictAction"></div>
    <div class="verdict-levels" id="gexVerdictLevels"></div>
    <div class="verdict-invalidation" id="gexVerdictInvalidation"></div>
    <div class="verdict-pressure" id="gexVerdictPressure" title="Pressure = distance to flip + below-GEX dominance + acceleration zones."></div>

    <!-- Toggle buttons -->
    <div class="verdict-toggles">
      <button class="verdict-adv-toggle" id="gexAdvToggle">Advanced (Gamma)</button>
      <button class="verdict-adv-toggle" id="gexTimingToggle">Timing (0DTE)</button>
    </div>

    <!-- Advanced (Gamma) panel -->
    <div class="verdict-advanced" id="gexVerdictAdvanced" style="display:none">
      <div class="verdict-adv-header">
        <span class="verdict-adv-type" id="gexAdvType"></span>
      </div>
      <div class="imb-gex-row">
        <span class="imb-gex-label">Above GEX</span><span class="imb-gex-val" id="gexImbAbove"></span>
        <span class="imb-gex-label" style="margin-left:16px">Below GEX</span><span class="imb-gex-val" id="gexImbBelow"></span>
      </div>
      <div class="verdict-adv-row" id="gexAdvDetails"></div>
      <div class="verdict-adv-walls" id="gexAdvWalls"></div>
      <div class="imb-reasons" id="gexImbReasons"></div>
    </div>

    <!-- Timing (0DTE) panel -->
    <div class="verdict-timing" id="gexVerdictTiming" style="display:none">
      <div class="timing-grid" id="gexTimingGrid"></div>
      <div class="timing-charts" id="gexTimingCharts">
        <div class="timing-chart-wrap"><div class="timing-chart-label">Spot vs Flip (60m)</div><canvas id="gexTimingChart1" height="80"></canvas></div>
        <div class="timing-chart-wrap"><div class="timing-chart-label">Pressure (60m)</div><canvas id="gexTimingChart2" height="80"></canvas></div>
      </div>
    </div>
  </div>

  <!-- Tab Bar -->
  <div class="tab-bar" id="gexTabBar">
    <button id="gexActionExpandBtn" style="display:none;background:var(--accent);color:#000;border:none;border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:600;margin-right:6px">Trade Desk</button>
    <button class="tab active" data-tab="heatmap">Heatmap</button>
    <button class="tab" data-tab="profile">Profile</button>
    <button class="tab" data-tab="greeks">Greeks</button>
    <button class="tab" data-tab="analysis">Analysis</button>
    <button class="tab" data-tab="scan">Scan</button>
    <button class="tab" data-tab="skew">Skew</button>
    <button class="tab" data-tab="timeline">Timeline</button>
    <button class="tab" data-tab="surface">Surface</button>
  </div>

  <!-- Detail Zone -->
  <div class="detail-zone" id="gexDetailZone">
    <!-- Heatmap panel -->
    <div class="detail-panel active" id="gexHeatmapPanel">
      <div class="heatmap-controls" id="gexHeatmapControls">
        <span class="exp-label">Expirations</span>
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px">
          <button class="heatmap-view-btn" id="gexViewTreemap" data-view="treemap" title="Treemap view">Treemap</button>
          <button class="heatmap-view-btn active" id="gexViewGrid" data-view="grid" title="Grid view">Grid</button>
          <button class="heatmap-view-btn" id="gexPopoutBtn" title="Pop out heatmap"><i data-lucide="maximize-2" style="width:14px;height:14px;"></i></button>
        </div>
      </div>
      <div class="heatmap-canvas-wrap" id="gexHeatmapCanvasWrap">
        <canvas id="gexHeatmapCanvas"></canvas>
      </div>
      <div class="treemap-legend" id="gexTreemapLegend">
        <span class="legend-item"><span class="legend-swatch" style="background:rgba(34,197,94,0.7)"></span>+\u0393 Stable</span>
        <span class="legend-item"><span class="legend-swatch" style="background:rgba(239,68,68,0.7)"></span>-\u0393 Accel</span>
        <span class="legend-item"><span class="legend-swatch" style="background:rgba(59,130,246,0.85);width:30px;height:10px;border-radius:2px;font-size:6px;color:#fff;text-align:center;line-height:10px">CW</span>Call Wall</span>
        <span class="legend-item"><span class="legend-swatch" style="background:rgba(249,115,22,0.85);width:30px;height:10px;border-radius:2px;font-size:6px;color:#fff;text-align:center;line-height:10px">PW</span>Put Wall</span>
        <span class="legend-item"><span style="display:inline-block;width:10px;height:10px;border:1.5px solid rgba(255,255,255,0.4);border-radius:2px"></span>Magnet</span>
        <span class="legend-item"><span style="display:inline-block;width:16px;border-top:1.5px dashed rgba(168,85,247,0.6)"></span>Pin/Flip</span>
        <span class="legend-item"><span style="display:inline-block;width:16px;border-top:1px dashed rgba(59,130,246,0.6)"></span>Spot</span>
        <span class="legend-item"><span style="display:inline-block;width:14px;height:8px;background:rgba(250,204,21,0.15);border:1px dashed rgba(250,204,21,0.3);border-radius:1px"></span>\u0393 Box</span>
        <span class="legend-sep" style="width:1px;height:10px;background:var(--border-subtle);margin:0 2px"></span>
        <span class="legend-levels" id="gexLegendLevels"></span>
      </div>
      <div class="loading" id="gexLoadingIndicator" style="display:none">
        <div class="spinner"></div>
        <div style="color:var(--text-muted);font-size:12px;font-family:var(--font-body)">Enter a ticker to begin</div>
      </div>
    </div>

    <!-- Profile panel -->
    <div class="detail-panel" id="gexProfilePanel">
      <div class="profile-title" style="display:flex;justify-content:space-between;align-items:center">
        <span>GEX Profile <span class="info-tip" data-tip="gex">?</span></span>
        <span id="gexProfileNetGex" style="font-family:var(--font-mono);font-size:10px"></span>
      </div>
      <div style="flex:1;padding:8px 4px;overflow-y:auto;position:relative">
        <canvas id="gexProfileCanvas"></canvas>
      </div>
    </div>

    <!-- Greeks panel -->
    <div class="detail-panel" id="gexGreeksPanel">
      <div class="greeks-header">
        <div class="greeks-toggle">
          <button class="greeks-btn active" data-greek="vanna">Vanna</button>
          <button class="greeks-btn" data-greek="charm">Charm</button>
        </div>
        <span id="gexGreekNetLabel" style="font-family:var(--font-mono);font-size:10px"></span>
      </div>
      <div style="flex:1;padding:8px 4px;overflow-y:auto;position:relative">
        <canvas id="gexVannaCanvas"></canvas>
        <canvas id="gexCharmCanvas" style="display:none"></canvas>
      </div>
    </div>

    <!-- Analysis panel -->
    <div class="detail-panel" id="gexAnalysisPanel">
      <div class="analysis-header">
        <span>Analysis</span>
        <span id="gexAnalysisRegime" style="font-size:10px;font-weight:600"></span>
      </div>
      <div class="analysis-content" id="gexAnalysisContent"></div>
    </div>

    <!-- Scan panel -->
    <div class="detail-panel" id="gexScanPanel">
      <div class="scan-header">
        <span>Multi-Ticker GEX Scan</span>
        <div style="display:flex;gap:6px;align-items:center">
          <input class="ticker-input" id="gexScanInput" style="width:200px" placeholder="SPY,QQQ,AAPL,..." />
          <button class="btn" id="gexScanBtn">Scan</button>
        </div>
      </div>
      <div class="scan-filters" id="gexScanFilters">
        <button class="scan-filter active" data-filter="ALL">All</button>
        <button class="scan-filter" data-filter="BULL_IMBALANCE">Up Bias</button>
        <button class="scan-filter" data-filter="BEAR_IMBALANCE">Down Bias</button>
        <button class="scan-filter" data-filter="GAMMA_BOX">Range</button>
        <button class="scan-filter" data-filter="NO_CONTROL">Volatile</button>
      </div>
      <div id="gexScanContent"></div>
    </div>

    <div class="detail-panel" id="gexSkewPanel">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px">
        <span style="font-family:var(--font-body);font-size:12px;font-weight:600;color:var(--text)">IV Skew</span>
        <div id="gexSkewChips" style="display:flex;gap:4px;margin-left:auto"></div>
      </div>
      <div style="flex:1;position:relative;padding:4px;min-height:300px">
        <canvas id="gexSkewCanvas"></canvas>
      </div>
    </div>
    <div class="detail-panel" id="gexTimelinePanel">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px">
        <span style="font-family:var(--font-body);font-size:12px;font-weight:600;color:var(--text)">GEX Timeline</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)" id="gexTimelineInfo"></span>
      </div>
      <div style="flex:1;position:relative;padding:4px;min-height:300px">
        <canvas id="gexTimelineCanvas"></canvas>
      </div>
    </div>
    <div class="detail-panel" id="gexSurfacePanel">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px">
        <span style="font-family:var(--font-body);font-size:12px;font-weight:600;color:var(--text)">Gamma Surface</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">Drag to rotate</span>
      </div>
      <div style="flex:1;position:relative;padding:4px;min-height:350px">
        <canvas id="gexSurfaceCanvas"></canvas>
      </div>
    </div>
  </div>

  <!-- Trade Desk -->
  <div class="trade-desk" id="tradeDesk" style="display:none">
    <div class="hero-pick" id="tradeDeskHero"></div>
    <div class="trade-alts" id="tradeDeskAlts"></div>
    <div class="trade-builder" id="tradeDeskBuilder"></div>
    <div class="trade-desk-disclaimer">Not financial advice. Decision support tool only.</div>
    <button class="trade-desk-collapse-btn" id="tradeDeskCollapseBtn">Collapse Trade Desk</button>
  </div>

  <!-- Dealer Positioning Engine (collapsed by default) -->
  <div class="dealer-engine-section" id="gexDealerEngine">
    <button class="dealer-engine-toggle" id="gexDealerEngineToggle" aria-expanded="false">
      <i data-lucide="chevron-right" style="width:14px;height:14px;" id="gexDealerChevron"></i>
      Dealer Positioning Engine
      <span class="dealer-engine-badge" id="gexDealerEngineBadge"></span>
    </button>
    <div class="dealer-engine-body" id="gexDealerEngineBody" style="display:none">
      <!-- Metric Stat Cards -->
      <div class="metric-stats">
        <div class="metric-card">
          <div class="metric-card-icon neutral" id="gexRatioIcon"><i data-lucide="gauge" style="width:18px;height:18px;"></i></div>
          <div>
            <div class="metric-card-label">GEX Ratio</div>
            <div class="metric-card-value" id="gexRatioValue">&mdash;</div>
            <div class="metric-card-sub" id="gexRatioSub">Loading...</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-card-icon neutral" id="netGexIcon"><i data-lucide="bar-chart-2" style="width:18px;height:18px;"></i></div>
          <div>
            <div class="metric-card-label">Net GEX</div>
            <div class="metric-card-value" id="netGexValue">&mdash;</div>
            <div class="metric-card-sub" id="netGexSub">&nbsp;</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-card-icon neutral" id="ivRatioIcon"><i data-lucide="activity" style="width:18px;height:18px;"></i></div>
          <div>
            <div class="metric-card-label">IV Ratio</div>
            <div class="metric-card-value" id="ivRatioValue">&mdash;</div>
            <div class="metric-card-sub" id="ivRatioSub">Loading...</div>
          </div>
        </div>
      </div>

      <!-- Convexity Engine — Layer 2+3 Raw Metrics -->
      <div class="convexity-section">
        <div class="cx-section-title">
          <i data-lucide="layers" style="width:16px;height:16px;"></i>
          Convexity Engine
          <span class="cx-badge-uncal" id="cxRegimeBadge">CALIBRATING</span>
        </div>
        <div class="convexity-grid">
          <div class="cx-card">
            <div class="cx-card-label">GEX Velocity (5m)</div>
            <div class="cx-card-value" id="cxVelocity5m">&mdash;</div>
            <div class="cx-card-sub" id="cxAccel5m">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Flip Drift</div>
            <div class="cx-card-value" id="cxFlipDrift">&mdash;</div>
            <div class="cx-card-sub" id="cxFlipCurrent">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Density &plusmn;50bp</div>
            <div class="cx-card-value" id="cxDensity50">&mdash;</div>
            <div class="cx-card-sub" id="cxConcentration">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Local Curvature</div>
            <div class="cx-card-value" id="cxCurvature">&mdash;</div>
            <div class="cx-card-sub" id="cxSlope">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Vanna (VEX &plusmn;50bp)</div>
            <div class="cx-card-value" id="cxVEX">&mdash;</div>
            <div class="cx-card-sub">$/1 vol pt</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Charm (&plusmn;50bp)</div>
            <div class="cx-card-value" id="cxCharm">&mdash;</div>
            <div class="cx-card-sub" id="cxCharmTime">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Expected Move (1&sigma;)</div>
            <div class="cx-card-value" id="cxExpMove">&mdash;</div>
            <div class="cx-card-sub" id="cxExpBands">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">VRP</div>
            <div class="cx-card-value" id="cxVRP">&mdash;</div>
            <div class="cx-card-sub" id="cxVRPRegime">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">0DTE Ratio</div>
            <div class="cx-card-value" id="cxODTE">&mdash;</div>
            <div class="cx-card-sub" id="cxODTERegime">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Danger Score</div>
            <div class="cx-card-value" id="cxDanger">&mdash;</div>
            <div class="cx-card-sub" id="cxDangerComponents">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Wall Stability (Call)</div>
            <div class="cx-card-value" id="cxWallCall">&mdash;</div>
            <div class="cx-card-sub" id="cxWallCallPersist">&nbsp;</div>
          </div>
          <div class="cx-card">
            <div class="cx-card-label">Wall Stability (Put)</div>
            <div class="cx-card-value" id="cxWallPut">&mdash;</div>
            <div class="cx-card-sub" id="cxWallPutPersist">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Tooltip -->
  <div class="tooltip" id="gexTooltip"></div>

  <!-- Footer -->
  <div class="gex-footer">
    <span id="gexFooterLeft">GEX = OI &times; Gamma &times; 100</span>
    <span id="gexFooterRight">&mdash;</span>
  </div>

</div>`;
}
function getGexPageJS() {
  return `
window.SQ = window.SQ || {};
SQ.gex = (function() {
  'use strict';

  // ── State ──
  var state = {
    ticker: 'SPY',
    data: null,
    selectedExps: [],
    allExps: [],
    tab: 'heatmap',
    heatmapView: 'grid',
    activeGreek: 'vanna',
    range: 20,
    refreshTimer: null,
    targetData: null,
    squeezeData: null,
    scanData: null,
    scanFilter: 'ALL',
    dynamics: null,
    dynamicsChart: null,
    skewData: null,
    skewVisible: [],
    timelineData: null,
    surfaceAngle: 0.6,
    surfaceDragBound: false,
    // Replay state
    replay: false,
    replayDate: null,
    replaySlices: [],
    replayIndex: 0,
    replayPlaying: false,
    replayTimer: null,
    replayBaseContracts: null,
    replayCumVol: {},
    replaySpot: 0,
    replayEventSource: null,
  };

  // ── Interactive Filters ──
  var _filters = {
    type: 'all',       // 'all' | 'call' | 'put'
    source: 'oi',      // 'oi' | 'volume'
    expiry: 'all',     // 'all' | specific expiry string
    strikeRange: 50    // 10..100
  };

  function _applyFilters() {
    console.log('[GEX Filters] Applying:', JSON.stringify(_filters));
    // Stub: actual filtering logic will integrate with renderAll/drawHeatmap pipeline
    // For now, trigger a re-render so downstream code can read _filters
    renderAll();
  }

  // ── Replay System ──

  function _startReplay() {
    var dateInput = document.getElementById('gexReplayDate');
    var date = dateInput ? dateInput.value : '';
    if (!date) { alert('Select a date to replay'); return; }

    var today = new Date().toISOString().slice(0, 10);
    if (date >= today) { alert('Date must be in the past'); return; }

    state.replay = true;
    state.replayDate = date;
    state.replaySlices = [];
    state.replayIndex = 0;
    state.replayPlaying = false;
    state.replayBaseContracts = null;
    state.replayCumVol = {};
    state.replaySpot = 0;

    // Show replay controls
    var playPause = document.getElementById('gexReplayPlayPause');
    var slider = document.getElementById('gexReplaySlider');
    var timeLabel = document.getElementById('gexReplayTime');
    var stopBtn = document.getElementById('gexReplayStop');
    var replayBtn = document.getElementById('gexReplayBtn');
    if (playPause) playPause.style.display = '';
    if (slider) { slider.style.display = ''; slider.value = 0; slider.max = 0; }
    if (timeLabel) { timeLabel.style.display = ''; timeLabel.textContent = 'Loading...'; }
    if (stopBtn) stopBtn.style.display = '';
    if (replayBtn) { replayBtn.textContent = 'Loading...'; replayBtn.disabled = true; }

    // Update regime bar to show replay mode
    var regimeLabel = document.getElementById('gexRegimeLabel');
    if (regimeLabel) regimeLabel.textContent = 'Replay: ' + date + ' - Loading...';
    var liveDot = document.getElementById('gexLiveDot');
    if (liveDot) { liveDot.className = 'status-dot'; liveDot.title = 'Replay mode'; }

    // Start SSE connection to replay endpoint
    var ticker = state.ticker;
    var range = state.range;
    var url = '/api/gex/heatmap/' + ticker + '/replay?date=' + date + '&range=' + range;
    var es = new EventSource(url);
    state.replayEventSource = es;

    es.addEventListener('init', function(e) {
      var data = JSON.parse(e.data);
      if (data.error) {
        alert('Replay error: ' + data.error);
        _stopReplay();
        return;
      }
      state.data = data;
      state.replayBaseContracts = data.contracts || [];
      state.replaySpot = data.spotPrice || 0;
      state.replayCumVol = {};
      renderAll();
      if (replayBtn) { replayBtn.textContent = 'Replay'; replayBtn.disabled = false; }
      if (regimeLabel) regimeLabel.textContent = 'Replay: ' + date + ' 09:30 ET';
      if (timeLabel) timeLabel.textContent = '09:30';
    });

    es.addEventListener('slice', function(e) {
      var slice = JSON.parse(e.data);
      state.replaySlices.push(slice);
      if (slider) slider.max = state.replaySlices.length - 1;
    });

    es.addEventListener('done', function() {
      es.close();
      state.replayEventSource = null;
      if (state.replaySlices.length > 0 && timeLabel) {
        timeLabel.textContent = '09:30 (' + state.replaySlices.length + ' frames)';
      }
      if (regimeLabel) regimeLabel.textContent = 'Replay: ' + date + ' - Ready (' + state.replaySlices.length + ' frames)';
    });

    es.addEventListener('error', function(e) {
      var data;
      try { data = JSON.parse(e.data); } catch { data = { error: 'Connection failed' }; }
      alert('Replay error: ' + (data.error || 'Connection failed'));
      _stopReplay();
    });

    es.onerror = function() {
      if (state.replay && state.replaySlices.length === 0) {
        if (replayBtn) { replayBtn.textContent = 'Replay'; replayBtn.disabled = false; }
        if (timeLabel) timeLabel.textContent = 'Error';
      }
    };
  }

  function _stopReplay() {
    state.replay = false;
    state.replayPlaying = false;
    state.replayCumVol = {};
    state.replaySpot = 0;
    if (state.replayTimer) { clearInterval(state.replayTimer); state.replayTimer = null; }
    if (state.replayEventSource) { state.replayEventSource.close(); state.replayEventSource = null; }

    // Hide replay controls
    var playPause = document.getElementById('gexReplayPlayPause');
    var slider = document.getElementById('gexReplaySlider');
    var timeLabel = document.getElementById('gexReplayTime');
    var stopBtn = document.getElementById('gexReplayStop');
    var replayBtn = document.getElementById('gexReplayBtn');
    if (playPause) playPause.style.display = 'none';
    if (slider) slider.style.display = 'none';
    if (timeLabel) timeLabel.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
    if (replayBtn) { replayBtn.textContent = 'Replay'; replayBtn.disabled = false; }

    var liveDot = document.getElementById('gexLiveDot');
    if (liveDot) { liveDot.className = 'status-dot live'; liveDot.title = 'Live updates every 5s'; }

    // Reload live data
    loadTicker();
  }

  function _toggleReplayPlay() {
    if (state.replaySlices.length === 0) return;
    state.replayPlaying = !state.replayPlaying;

    var playPause = document.getElementById('gexReplayPlayPause');
    if (playPause) playPause.innerHTML = state.replayPlaying ? '&#10074;&#10074;' : '&#9654;';
    if (playPause) playPause.className = state.replayPlaying ? 'btn replay-btn active' : 'btn replay-btn';

    if (state.replayPlaying) {
      state.replayTimer = setInterval(function() {
        if (state.replayIndex >= state.replaySlices.length - 1) {
          state.replayPlaying = false;
          if (playPause) { playPause.innerHTML = '&#9654;'; playPause.className = 'btn replay-btn'; }
          clearInterval(state.replayTimer);
          state.replayTimer = null;
          return;
        }
        state.replayIndex++;
        _applyReplaySlice(state.replayIndex);
        var slider = document.getElementById('gexReplaySlider');
        if (slider) slider.value = state.replayIndex;
      }, 500); // 500ms per frame = 2x speed (5-min slices at 2fps)
    } else {
      if (state.replayTimer) { clearInterval(state.replayTimer); state.replayTimer = null; }
    }
  }

  function _seekReplay(index) {
    state.replayIndex = Math.max(0, Math.min(index, state.replaySlices.length - 1));
    _applyReplaySlice(state.replayIndex);
  }

  function _applyReplaySlice(index) {
    if (!state.data || !state.replayBaseContracts || state.replayBaseContracts.length === 0) return;
    var slice = state.replaySlices[index];
    if (!slice) return;

    var timeLabel = document.getElementById('gexReplayTime');
    if (timeLabel) timeLabel.textContent = slice.time || '--:--';

    var regimeLabel = document.getElementById('gexRegimeLabel');
    if (regimeLabel) regimeLabel.textContent = 'Replay: ' + state.replayDate + ' ' + (slice.time || '') + ' ET';

    // Merge this slice's volume updates into cumulative state
    if (slice.updates) {
      for (var sym in slice.updates) {
        state.replayCumVol[sym] = slice.updates[sym].volume || 0;
      }
    }

    // Estimate spot price from volume-weighted strike of this slice's updates
    // (uses the slice's spot if provided by Python, otherwise estimates from option activity)
    var spotPrice = slice.spot || state.replaySpot;
    if (!spotPrice && slice.updates) {
      var wSum = 0, wCount = 0;
      for (var s in slice.updates) {
        var con = null;
        for (var ci = 0; ci < state.replayBaseContracts.length; ci++) {
          if (state.replayBaseContracts[ci].symbol === s) { con = state.replayBaseContracts[ci]; break; }
        }
        if (con) {
          var v = slice.updates[s].volume || 0;
          wSum += con.strike * v;
          wCount += v;
        }
      }
      if (wCount > 0) spotPrice = wSum / wCount;
    }
    if (spotPrice) state.replaySpot = spotPrice;
    else spotPrice = state.data.spotPrice;

    // Recalculate GEX grid using Black-Scholes gamma at current spot
    _recalcReplayGEX(spotPrice);

    // Trigger re-render with updated data
    renderAll();
  }

  function _recalcReplayGEX(spotPrice) {
    var contracts = state.replayBaseContracts;
    var cumVol = state.replayCumVol;
    var d = state.data;
    if (!contracts || !d || !d.grid || !d.strikes) return;

    d.spotPrice = spotPrice;
    var IV = 0.25;
    var today = state.replayDate;

    // Build lookup maps for strikes and expirations
    var strikeIdx = {};
    for (var si = 0; si < d.strikes.length; si++) strikeIdx[d.strikes[si]] = si;
    var expDates = d.expirations.map(function(e) { return e.date; });
    var expIdx = {};
    for (var ei = 0; ei < expDates.length; ei++) expIdx[expDates[ei]] = ei;

    // Zero out grid
    for (var r = 0; r < d.grid.length; r++) {
      for (var c = 0; c < d.grid[r].values.length; c++) {
        var cell = d.grid[r].values[c];
        cell.net = 0; cell.call = 0; cell.put = 0;
        cell.callOI = 0; cell.putOI = 0;
        cell.callVol = 0; cell.putVol = 0;
      }
    }

    // Black-Scholes gamma
    function bsGamma(spot, strike, T, sigma) {
      if (T <= 0 || sigma <= 0 || spot <= 0) return 0;
      var d1 = (Math.log(spot / strike) + (0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
      var nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
      return nd1 / (spot * sigma * Math.sqrt(T));
    }

    // Recalculate each contract's GEX contribution
    for (var i = 0; i < contracts.length; i++) {
      var con = contracts[i];
      var sIdx = strikeIdx[con.strike];
      if (sIdx === undefined) continue;
      var eIdx = expIdx[con.expirationDate];
      if (eIdx === undefined) continue;

      var daysToExp = Math.max(1, Math.round((new Date(con.expirationDate) - new Date(today)) / (24 * 60 * 60 * 1000)));
      var T = daysToExp / 365;
      var effectiveOI = con.openInterest + (cumVol[con.symbol] || 0);
      var g = bsGamma(spotPrice, con.strike, T, IV);
      var shares = effectiveOI * g * 100;
      var pct = shares * spotPrice * spotPrice * 0.01;
      var vol = cumVol[con.symbol] || 0;

      var cell = d.grid[sIdx].values[eIdx];
      if (con.optionType === 'call') {
        cell.call += pct; cell.callOI += con.openInterest; cell.callVol += vol;
      } else {
        cell.put -= pct; cell.putOI += con.openInterest; cell.putVol += vol;
      }
      cell.net = cell.call + cell.put;
    }

    // Update maxAbsGEX
    var maxAbs = 0;
    for (var r2 = 0; r2 < d.grid.length; r2++) {
      for (var c2 = 0; c2 < d.grid[r2].values.length; c2++) {
        if (Math.abs(d.grid[r2].values[c2].net) > maxAbs) maxAbs = Math.abs(d.grid[r2].values[c2].net);
      }
    }
    d.maxAbsGEX = maxAbs;

    // Rebuild profile from grid
    for (var p = 0; p < d.profile.length; p++) {
      var strike = d.profile[p].strike;
      var sIdx2 = strikeIdx[strike];
      if (sIdx2 === undefined) continue;
      var row = d.grid[sIdx2];
      var tNet = 0, tCall = 0, tPut = 0, tCallOI = 0, tPutOI = 0, tCallVol = 0, tPutVol = 0;
      for (var e = 0; e < row.values.length; e++) {
        var v = row.values[e];
        tNet += v.net; tCall += v.call; tPut += v.put;
        tCallOI += v.callOI || 0; tPutOI += v.putOI || 0;
        tCallVol += v.callVol || 0; tPutVol += v.putVol || 0;
      }
      d.profile[p].net = tNet; d.profile[p].call = tCall; d.profile[p].put = tPut;
      d.profile[p].callOI = tCallOI; d.profile[p].putOI = tPutOI;
      d.profile[p].callVol = tCallVol; d.profile[p].putVol = tPutVol;
    }

    // Recalculate key levels
    var ascending = d.profile.slice().reverse();
    var posStrikes = ascending.filter(function(x) { return x.net > 0; });
    d.callWall = null;
    if (posStrikes.length > 0) {
      var best = posStrikes[0];
      for (var j = 1; j < posStrikes.length; j++) { if (posStrikes[j].net > best.net) best = posStrikes[j]; }
      d.callWall = { strike: best.strike, gex: best.net };
    }
    var negStrikes = ascending.filter(function(x) { return x.net < 0; });
    d.putWall = null;
    if (negStrikes.length > 0) {
      var worst = negStrikes[0];
      for (var j2 = 1; j2 < negStrikes.length; j2++) { if (negStrikes[j2].net < worst.net) worst = negStrikes[j2]; }
      d.putWall = { strike: worst.strike, gex: worst.net };
    }
    d.gammaFlip = null;
    var cum = 0;
    for (var k = 0; k < ascending.length; k++) {
      var prev = cum;
      cum += ascending[k].net;
      if (k > 0 && prev !== 0 && Math.sign(prev) !== Math.sign(cum)) {
        var ratio = Math.abs(prev) / (Math.abs(prev) + Math.abs(ascending[k].net));
        d.gammaFlip = Math.round((ascending[k - 1].strike + ratio * (ascending[k].strike - ascending[k - 1].strike)) * 100) / 100;
        break;
      }
    }
    d.totalNetGEX = ascending.reduce(function(s, x) { return s + x.net; }, 0);
  }

  function _initReplayControls() {
    var replayBtn = document.getElementById('gexReplayBtn');
    var playPauseBtn = document.getElementById('gexReplayPlayPause');
    var stopBtn = document.getElementById('gexReplayStop');
    var slider = document.getElementById('gexReplaySlider');
    var dateInput = document.getElementById('gexReplayDate');

    // Set default date to yesterday
    if (dateInput) {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // Skip weekends
      if (yesterday.getDay() === 0) yesterday.setDate(yesterday.getDate() - 2);
      if (yesterday.getDay() === 6) yesterday.setDate(yesterday.getDate() - 1);
      dateInput.value = yesterday.toISOString().slice(0, 10);
      dateInput.max = yesterday.toISOString().slice(0, 10);
    }

    if (replayBtn) replayBtn.addEventListener('click', function() {
      if (state.replay) _stopReplay();
      else _startReplay();
    });
    if (playPauseBtn) playPauseBtn.addEventListener('click', _toggleReplayPlay);
    if (stopBtn) stopBtn.addEventListener('click', _stopReplay);
    if (slider) slider.addEventListener('input', function() {
      _seekReplay(parseInt(this.value));
    });
  }

  function _initFilterToolbar() {
    // Expiry dropdown
    var expirySelect = document.getElementById('gexExpiryFilter');
    if (expirySelect) {
      expirySelect.addEventListener('change', function() {
        _filters.expiry = this.value;
        _applyFilters();
      });
    }

    // Type toggle (All / Calls / Puts)
    var typeToggle = document.getElementById('gexTypeToggle');
    if (typeToggle) {
      typeToggle.addEventListener('click', function(e) {
        var btn = e.target.closest('.gex-filter-btn');
        if (!btn) return;
        typeToggle.querySelectorAll('.gex-filter-btn').forEach(function(b) {
          b.style.background = 'var(--bg-surface)';
          b.style.color = 'var(--text)';
          b.classList.remove('active');
        });
        btn.style.background = 'var(--accent)';
        btn.style.color = 'white';
        btn.classList.add('active');
        _filters.type = btn.dataset.value;
        _applyFilters();
      });
    }

    // Source toggle (OI / Volume)
    var sourceToggle = document.getElementById('gexSourceToggle');
    if (sourceToggle) {
      sourceToggle.addEventListener('click', function(e) {
        var btn = e.target.closest('.gex-filter-btn');
        if (!btn) return;
        sourceToggle.querySelectorAll('.gex-filter-btn').forEach(function(b) {
          b.style.background = 'var(--bg-surface)';
          b.style.color = 'var(--text)';
          b.classList.remove('active');
        });
        btn.style.background = 'var(--accent)';
        btn.style.color = 'white';
        btn.classList.add('active');
        _filters.source = btn.dataset.value;
        _applyFilters();
      });
    }

    // Strike range slider
    var rangeSlider = document.getElementById('gexStrikeRangeFilter');
    var rangeLabel = document.getElementById('gexStrikeRangeLabel');
    if (rangeSlider) {
      rangeSlider.addEventListener('input', function() {
        _filters.strikeRange = parseInt(this.value, 10);
        if (rangeLabel) rangeLabel.textContent = '\u00B1' + this.value;
      });
      rangeSlider.addEventListener('change', function() {
        _applyFilters();
      });
    }

    // Refresh button
    var refreshBtn = document.getElementById('gexFilterRefresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        _applyFilters();
      });
    }
  }

  function _populateExpiryFilter() {
    var expirySelect = document.getElementById('gexExpiryFilter');
    if (!expirySelect || !state.data) return;
    var html = '<option value="all">All</option>';
    (state.data.expirations || []).forEach(function(exp) {
      html += '<option value="' + exp + '">' + exp + '</option>';
    });
    expirySelect.innerHTML = html;
    expirySelect.value = _filters.expiry;
  }

  var popoutWin = null;

  var heatmap = {
    canvas: null, ctx: null, dpr: window.devicePixelRatio || 1,
    scrollX: 0, scrollY: 0, cellW: 90, cellH: 28,
    headerH: 32, strikeColW: 72, hoverCell: null,
    treemapNodes: null, hoverTreemapIdx: -1,
  };


  var _profileChart = null;
  var _vannaChart = null;
  var _charmChart = null;
  var _overviewProfileChart = null;
  var _maxpainChart = null;

  var _timingCharts = { chart1: null, chart2: null };

  var socketHandlers = {};
  var intervals = [];
  var tipInterval = null;
  var _docClickHandler = null;
  var resizeObserver = null;
  var _metricsInterval = null;

  // ── DOM refs ──
  var $ = {};

  function esc(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Ticker Dropdown ──
  var POPULAR_TICKERS = [
    { sym: 'SPY', desc: 'S&P 500 ETF' },
    { sym: 'QQQ', desc: 'Nasdaq 100 ETF' },
    { sym: 'IWM', desc: 'Russell 2000 ETF' },
    { sym: 'DIA', desc: 'Dow Jones ETF' },
    { sym: 'NVDA', desc: 'NVIDIA' },
    { sym: 'AAPL', desc: 'Apple' },
    { sym: 'TSLA', desc: 'Tesla' },
    { sym: 'AMZN', desc: 'Amazon' },
    { sym: 'META', desc: 'Meta Platforms' },
    { sym: 'MSFT', desc: 'Microsoft' },
    { sym: 'AMD', desc: 'AMD' },
    { sym: 'GOOGL', desc: 'Alphabet' },
  ];

  function showTickerDropdown() {
    var dd = $.tickerDropdown;
    var input = $.tickerInput;
    if (!dd || !input) return;
    var filter = input.value.trim().toUpperCase();
    var items = filter ? POPULAR_TICKERS.filter(function(t) { return t.sym.indexOf(filter) >= 0 || t.desc.toUpperCase().indexOf(filter) >= 0; }) : POPULAR_TICKERS;
    if (items.length === 0) { dd.classList.remove('show'); return; }
    dd.innerHTML = items.map(function(t) {
      return '<div class="ticker-option" data-sym="' + t.sym + '">'
        + '<span class="ticker-sym">' + t.sym + '</span>'
        + '<span class="ticker-desc">' + t.desc + '</span></div>';
    }).join('');
    dd.classList.add('show');
  }

  function selectTicker(sym) {
    $.tickerInput.value = sym;
    $.tickerDropdown.classList.remove('show');
    loadTicker();
  }

  // ── Info Tooltips ──
  var TIP_TEXT = {
    gex: '<strong>Gamma Exposure (GEX)</strong> measures how much dealers must hedge per $1 move. Positive = dealers dampen moves (buy dips, sell rips). Negative = dealers amplify moves (chase direction).',
    vanna: '<strong>Vanna</strong> is dDelta/dIV. When IV drops, vanna magnets pull price upward (dealers buy). When IV rises, downward pull. Clustered vanna = strong gravity.',
    charm: '<strong>Charm</strong> is dDelta/dTime (overnight delta decay). Shows how dealer hedging shifts with time passage, especially critical for 0DTE and overnight risk.',
    flip: '<strong>Gamma Flip</strong> is where net GEX crosses zero. Above = long gamma (vol suppression). Below = short gamma (vol expansion). Key regime boundary.',
    maxpain: '<strong>Max Pain</strong> is the strike where total option holder losses are maximized at expiry. Often acts as a pinning magnet, especially near expiration.',
    squeeze: '<strong>Squeeze</strong> setup scores combine positive call wall strength with GEX ramp potential. High scores = breakout fuel if key levels breach.',
  };

  function attachTipPopups() {
    var page = document.getElementById('page-gex');
    if (!page) return;
    page.querySelectorAll('.info-tip[data-tip]:not(.tip-ready)').forEach(function(el) {
      el.classList.add('tip-ready');
      var key = el.getAttribute('data-tip');
      if (TIP_TEXT[key]) {
        var popup = document.createElement('div');
        popup.className = 'info-tip-popup';
        popup.innerHTML = TIP_TEXT[key];
        el.appendChild(popup);
      }
    });
  }

  // ── Format helpers ──
  function fmtGEXShort(val) {
    if (!val || val === 0) return '0';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '+';
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(0) + 'K';
    return sign + abs.toFixed(0);
  }

  function fmtGEX(val) {
    if (!val || val === 0) return '';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '';
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(0) + 'K';
    if (abs >= 1) return sign + abs.toFixed(0);
    return '';
  }

  function fmtGEXFull(val) {
    if (!val || val === 0) return '0';
    var abs = Math.abs(val);
    var sign = val < 0 ? '-' : '';
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(1) + 'K';
    return sign + abs.toFixed(0);
  }

  function percentile(arr, p) {
    if (arr.length === 0) return 0;
    var sorted = arr.slice().sort(function(a, b) { return a - b; });
    var idx = (p / 100) * (sorted.length - 1);
    var lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  function getTopByRelevance(nodes, spotPrice, count) {
    if (!nodes.length || !spotPrice) return { positive: [], negative: [] };
    var scored = nodes.map(function(n, i) {
      var dist = Math.abs(n.strike - spotPrice);
      var proxWeight = 1 + (2 / (1 + dist));
      return { idx: i, score: n.absGEX * proxWeight, net: n.net };
    });
    var pos = scored.filter(function(s) { return s.net >= 0; })
      .sort(function(a, b) { return b.score - a.score; }).slice(0, count);
    var neg = scored.filter(function(s) { return s.net < 0; })
      .sort(function(a, b) { return b.score - a.score; }).slice(0, count);
    var set = {};
    pos.concat(neg).forEach(function(s) { set[s.idx] = s.net >= 0 ? 'pos' : 'neg'; });
    return { positive: pos, negative: neg, indexSet: set };
  }

  // Gamma slope: smoothed central difference, ±radius around spot only
  function computeSlopeZones(grid, strikes, spotPrice, strikeStep, selectedExps, radius) {
    if (strikes.length < 3 || !spotPrice) return [];
    var spotIdx = 0, minDist = Infinity;
    for (var i = 0; i < strikes.length; i++) {
      var dd = Math.abs(strikes[i] - spotPrice);
      if (dd < minDist) { minDist = dd; spotIdx = i; }
    }
    var lo = Math.max(1, spotIdx - radius), hi = Math.min(strikes.length - 2, spotIdx + radius);
    // Aggregate net GEX per strike
    var netByStrike = [];
    for (var s = 0; s < grid.length; s++) {
      var total = 0;
      for (var k = 0; k < selectedExps.length; k++) {
        var v = grid[s].values[selectedExps[k]];
        if (v) total += v.net;
      }
      netByStrike.push(total);
    }
    // Central difference slope
    var rawSlope = [];
    for (var j = 0; j < strikes.length; j++) {
      if (j === 0 || j === strikes.length - 1) { rawSlope.push(0); continue; }
      rawSlope.push((netByStrike[j + 1] - netByStrike[j - 1]) / (2 * strikeStep));
    }
    // 3-point rolling average
    var smooth = [];
    for (var m = 0; m < rawSlope.length; m++) {
      if (m === 0 || m === rawSlope.length - 1) { smooth.push(rawSlope[m]); continue; }
      smooth.push((rawSlope[m - 1] + rawSlope[m] + rawSlope[m + 1]) / 3);
    }
    // Find max |slope| in window for normalization
    var maxSlope = 0;
    for (var n = lo; n <= hi; n++) {
      if (Math.abs(smooth[n]) > maxSlope) maxSlope = Math.abs(smooth[n]);
    }
    if (maxSlope === 0) return [];
    var zones = [];
    for (var z = lo; z <= hi; z++) {
      var norm = smooth[z] / maxSlope; // -1 to 1
      if (Math.abs(norm) < 0.25) continue; // threshold: skip weak slopes
      zones.push({ row: z, slope: norm });
    }
    return zones;
  }

  // ── Load Ticker ──
  async function loadTicker() {
    var input = $.tickerInput;
    if (!input) return;
    var ticker = input.value.trim().toUpperCase().replace(/[^A-Z0-9.]/g, '');
    if (!ticker) return;

    if (window.SQ && SQ.userTier !== 'pro' && ticker !== 'SPY' && ticker !== 'QQQ' && ticker !== 'IWM') {
      if (typeof showUpgradeModal === 'function') showUpgradeModal('Core tier is limited to SPY, QQQ, and IWM. Upgrade to Pro for all tickers.');
      return;
    }

    input.value = ticker;
    var oldTicker = state.ticker;
    state.ticker = ticker;
    state.targetData = null;
    state.squeezeData = null;


    if (SQ.socket && SQ.socket.connected) {
      SQ.socket.emit('subscribe', ticker);
    }

    showLoading('Fetching gamma data...');

    try {
      var url = '/api/gex/heatmap/' + ticker + '?range=' + state.range;
      var res = await fetch(url);
      var data = await res.json();

      if (data.error) throw new Error(data.error);

      state.data = data;
      state.allExps = data.expirations.map(function(e, i) { return i; });
      state.selectedExps = state.allExps.slice();

      renderExpChips();
      _populateExpiryFilter();
      renderAll();
      updateSpotBadge();
      updateFooter();

      if (state.tab === 'analysis') { loadTargets(); loadSqueeze(); }
      else { loadTargets(); } // Eagerly load targets for ACTION panel candidates
      // Real-time updates arrive via Socket.IO every 5s automatically

    } catch (err) {
      showError(err.message);
    }
  }

  // ── Rendering ──
  function renderAll() {
    if (!state.data) return;
    if (state.tab === 'heatmap') renderHeatmap();
    if (state.tab === 'profile') renderProfile();
    if (state.tab === 'greeks') {
      if (state.activeGreek === 'vanna') renderVannaChart();
      else renderCharmChart();
    }
    if (state.tab === 'analysis') renderAnalysis();
    if (state.tab === 'scan' && state.scanData) renderScan();
    updateRegimeBadge();
    updateVerdictCard();
    renderTradeDesk();
  }

  function renderHeatmap() {
    if (!heatmap.canvas) initHeatmapCanvas();
    var loading = $.loadingIndicator;
    if (!state.data) { if (loading) loading.style.display = 'flex'; return; }
    if (loading) loading.style.display = 'none';
    heatmap.scrollX = 0; heatmap.scrollY = 0;
    drawHeatmap();
  }

  function renderProfile() {
    if (!state.data) return;
    var canvas = document.getElementById('gexProfileCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    var data = state.data, selectedExps = state.selectedExps;

    var profile = data.strikes.map(function(strike, si) {
      var callGex = 0, putGex = 0;
      for (var k = 0; k < selectedExps.length; k++) {
        var idx = selectedExps[k];
        var v = data.grid[si].values[idx];
        if (v) { callGex += v.call; putGex += v.put; }
      }
      return { strike: strike, call: callGex, put: putGex, net: callGex + putGex };
    });

    var sorted = profile.slice().reverse();
    var totalNet = sorted.reduce(function(s, p) { return s + p.net; }, 0);
    var netEl = document.getElementById('gexProfileNetGex');
    if (netEl) {
      netEl.textContent = 'Net ' + fmtGEXFull(totalNet);
      netEl.style.color = totalNet >= 0 ? 'var(--green)' : 'var(--red)';
    }

    var cwStrike = data.callWall ? data.callWall.strike : null;
    var pwStrike = data.putWall ? data.putWall.strike : null;
    var flipStrike = data.gammaFlip;

    var spotStrike = sorted.reduce(function(best, p) {
      return Math.abs(p.strike - data.spotPrice) < Math.abs(best - data.spotPrice) ? p.strike : best;
    }, sorted[0] ? sorted[0].strike : 0);

    var bgColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent-subtle)';
      return p.net >= 0 ? 'rgba(78,201,160,0.55)' : 'rgba(192,88,98,0.55)';
    });
    var borderColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent)';
      return p.net >= 0 ? 'rgba(78,201,160,0.8)' : 'rgba(192,88,98,0.8)';
    });

    if (_profileChart) { _profileChart.destroy(); _profileChart = null; }

    var annotations = {};
    if (cwStrike) {
      var idx = sorted.findIndex(function(p) { return p.strike === cwStrike; });
      if (idx >= 0) annotations.callWall = {
        type: 'line', xMin: idx, xMax: idx, borderColor: 'rgba(78,201,160,0.5)', borderWidth: 1, borderDash: [4,3],
        label: { display: true, content: 'Call Wall', position: 'start', font: { size: 9, family: 'Inter' }, color: 'rgba(78,201,160,0.7)', backgroundColor: 'transparent' }
      };
    }
    if (pwStrike) {
      var idx2 = sorted.findIndex(function(p) { return p.strike === pwStrike; });
      if (idx2 >= 0) annotations.putWall = {
        type: 'line', xMin: idx2, xMax: idx2, borderColor: 'rgba(192,88,98,0.5)', borderWidth: 1, borderDash: [4,3],
        label: { display: true, content: 'Put Wall', position: 'start', font: { size: 9, family: 'Inter' }, color: 'rgba(192,88,98,0.7)', backgroundColor: 'transparent' }
      };
    }
    if (flipStrike) {
      var idx3 = sorted.findIndex(function(p, i) { return i > 0 && sorted[i-1].strike <= flipStrike && p.strike >= flipStrike; });
      if (idx3 >= 0) annotations.flip = {
        type: 'line', xMin: idx3 - 0.5, xMax: idx3 - 0.5, borderColor: 'rgba(184,149,64,0.6)', borderWidth: 1.5, borderDash: [6,3],
        label: { display: true, content: 'Flip $' + flipStrike, position: 'end', font: { size: 9, family: 'Inter' }, color: 'rgba(184,149,64,0.8)', backgroundColor: 'transparent' }
      };
    }
    if (data.maxPain) {
      var idx4 = sorted.findIndex(function(p) { return p.strike === data.maxPain.strike; });
      if (idx4 >= 0) annotations.maxPain = {
        type: 'line', xMin: idx4, xMax: idx4, borderColor: 'rgba(107,114,128,0.4)', borderWidth: 1, borderDash: [3,3],
        label: { display: true, content: 'Max Pain $' + data.maxPain.strike, position: 'center', font: { size: 9, family: 'Inter' }, color: 'rgba(107,114,128,0.6)', backgroundColor: 'transparent' }
      };
    }

    _profileChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sorted.map(function(p) { return '$' + p.strike; }),
        datasets: [{ data: sorted.map(function(p) { return p.net; }), backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2, barPercentage: 0.85 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14,14,17,0.95)', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1,
            titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'JetBrains Mono', size: 11 }, padding: 12,
            callbacks: {
              title: function(items) { return items[0].label; },
              label: function(item) { var p = sorted[item.dataIndex]; return ['Net: ' + fmtGEXFull(p.net), 'Call: ' + fmtGEXFull(p.call), 'Put: ' + fmtGEXFull(p.put)]; },
            },
          },
          annotation: { annotations: annotations },
        },
        scales: {
          x: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 25,
            callback: function(val, idx) { var s = sorted[idx] ? sorted[idx].strike : 0; if (s === spotStrike) return '* $' + s; return '$' + s; } }, border: { color: 'var(--border-subtle)' } },
          y: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, callback: function(val) { return fmtGEX(val); } }, border: { display: false } },
        },
        animation: { duration: 400, easing: 'easeOutQuart' },
      },
    });
  }

  function renderVannaChart() {
    if (!state.data || !state.data.vannaProfile) return;
    var canvas = document.getElementById('gexVannaCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    var vp = state.data.vannaProfile;
    var sorted = vp.slice().reverse();
    var hasData = sorted.some(function(p) { return p.net !== 0; });
    var netEl = document.getElementById('gexGreekNetLabel');
    if (netEl && state.data.totalNetVanna != null) {
      netEl.textContent = 'Net ' + fmtGEXFull(state.data.totalNetVanna);
      netEl.style.color = state.data.totalNetVanna >= 0 ? 'var(--green)' : 'var(--red)';
    }
    if (!hasData) { if (netEl) netEl.textContent = 'No vanna data'; return; }
    var spotStrike = sorted.reduce(function(best, p) { return Math.abs(p.strike - state.data.spotPrice) < Math.abs(best - state.data.spotPrice) ? p.strike : best; }, sorted[0] ? sorted[0].strike : 0);
    var bgColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent-subtle)';
      return p.net >= 0 ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.55)';
    });
    if (_vannaChart) { _vannaChart.destroy(); _vannaChart = null; }
    _vannaChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: sorted.map(function(p) { return '$' + p.strike; }), datasets: [{ data: sorted.map(function(p) { return p.net; }), backgroundColor: bgColors, borderColor: bgColors.map(function(c) { return typeof c === 'string' ? c : c; }), borderWidth: 1, borderRadius: 2, barPercentage: 0.85 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(14,14,17,0.95)', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1, titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'JetBrains Mono', size: 11 }, padding: 12, callbacks: { title: function(items) { return items[0].label; }, label: function(item) { var p = sorted[item.dataIndex]; return ['Net Vanna: ' + fmtGEXFull(p.net), 'Call: ' + fmtGEXFull(p.call), 'Put: ' + fmtGEXFull(p.put)]; } } } }, scales: { x: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 25 }, border: { color: 'var(--border-subtle)' } }, y: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, callback: function(val) { return fmtGEX(val); } }, border: { display: false } } }, animation: { duration: 400, easing: 'easeOutQuart' } },
    });
  }

  function renderCharmChart() {
    if (!state.data || !state.data.charmProfile) return;
    var canvas = document.getElementById('gexCharmCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    var cp = state.data.charmProfile;
    var sorted = cp.slice().reverse();
    var hasData = sorted.some(function(p) { return p.net !== 0; });
    var netEl = document.getElementById('gexGreekNetLabel');
    if (netEl && state.data.totalNetCharm != null) {
      netEl.textContent = 'Net ' + fmtGEXFull(state.data.totalNetCharm);
      netEl.style.color = state.data.totalNetCharm >= 0 ? 'var(--green)' : 'var(--red)';
    }
    if (!hasData) { if (netEl) netEl.textContent = 'No charm data'; return; }
    var spotStrike = sorted.reduce(function(best, p) { return Math.abs(p.strike - state.data.spotPrice) < Math.abs(best - state.data.spotPrice) ? p.strike : best; }, sorted[0] ? sorted[0].strike : 0);
    var bgColors = sorted.map(function(p) {
      if (p.strike === spotStrike) return 'var(--accent-subtle)';
      return p.net >= 0 ? 'rgba(107,127,163,0.55)' : 'rgba(192,88,98,0.55)';
    });
    if (_charmChart) { _charmChart.destroy(); _charmChart = null; }
    _charmChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: sorted.map(function(p) { return '$' + p.strike; }), datasets: [{ data: sorted.map(function(p) { return p.net; }), backgroundColor: bgColors, borderWidth: 1, borderRadius: 2, barPercentage: 0.85 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(14,14,17,0.95)', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1, titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'JetBrains Mono', size: 11 }, padding: 12, callbacks: { title: function(items) { return items[0].label; }, label: function(item) { var p = sorted[item.dataIndex]; return ['Net Charm: ' + fmtGEXFull(p.net), 'Call: ' + fmtGEXFull(p.call), 'Put: ' + fmtGEXFull(p.put)]; } } } }, scales: { x: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 25 }, border: { color: 'var(--border-subtle)' } }, y: { grid: { color: 'var(--border-subtle)', drawTicks: false }, ticks: { color: '#5a5a65', font: { family: 'JetBrains Mono', size: 9 }, callback: function(val) { return fmtGEX(val); } }, border: { display: false } } }, animation: { duration: 400, easing: 'easeOutQuart' } },
    });
  }

  // ── Expiration Chips ──
  function renderExpChips() {
    var bar = document.getElementById('gexHeatmapControls');
    if (!state.data || !bar) return;
    var today = new Date();
    var frontWeekLimit = new Date(today.getTime() + 5 * 86400000);
    var frontWeekIdxs = [];
    state.data.expirations.forEach(function(exp, i) { if (new Date(exp.date) <= frontWeekLimit) frontWeekIdxs.push(i); });
    var is0DTE = state.selectedExps.length <= frontWeekIdxs.length && frontWeekIdxs.length > 0 && state.selectedExps.every(function(i) { return frontWeekIdxs.indexOf(i) >= 0; });
    var html = '<span class="exp-label">Expirations:</span>';
    html += '<span class="exp-chip' + (state.selectedExps.length === state.allExps.length ? ' active' : '') + '" data-action="toggleAll">ALL</span>';
    if (frontWeekIdxs.length > 0 && frontWeekIdxs.length < state.allExps.length) {
      html += '<span class="exp-chip' + (is0DTE ? ' active' : '') + '" data-action="toggle0DTE" style="' + (is0DTE ? '' : 'border-color:rgba(192,88,98,0.2);color:var(--red)') + '">0DTE/Week</span>';
    }
    for (var i = 0; i < state.data.expirations.length; i++) {
      var exp = state.data.expirations[i];
      var active = state.selectedExps.indexOf(i) >= 0;
      var gexLabel = fmtGEX(exp.totalGEX);
      var gexColor = exp.totalGEX >= 0 ? 'var(--green)' : 'var(--red)';
      html += '<span class="exp-chip' + (active ? ' active' : '') + '" data-action="toggleExp" data-idx="' + i + '">' + exp.date + ' <span style="color:' + gexColor + ';margin-left:4px">' + gexLabel + '</span></span>';
    }
    html += '<div style="margin-left:auto;display:flex;align-items:center;gap:4px">';
    html += '<button class="heatmap-view-btn' + (state.heatmapView === 'treemap' ? ' active' : '') + '" id="gexViewTreemap" data-view="treemap" title="Treemap view">Treemap</button>';
    html += '<button class="heatmap-view-btn' + (state.heatmapView === 'grid' ? ' active' : '') + '" id="gexViewGrid" data-view="grid" title="Grid view">Grid</button>';
    html += '<button class="heatmap-view-btn" id="gexPopoutBtn" title="Pop out heatmap"><i data-lucide="maximize-2" style="width:14px;height:14px;"></i></button>';
    html += '</div>';
    bar.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [bar] });
  }

  function loadTimeline() {
    fetch('/api/gex/timeline/' + state.ticker + '?hours=6')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        state.timelineData = d;
        var info = document.getElementById('gexTimelineInfo');
        if (info) info.textContent = d.intervals.length + ' intervals';
        renderTimeline();
      });
  }

  function renderTimeline() {
    var canvas = document.getElementById('gexTimelineCanvas');
    if (!canvas || !state.timelineData || !state.timelineData.intervals.length) return;
    var data = state.timelineData;
    var wrap = canvas.parentElement;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = wrap.clientWidth, H = wrap.clientHeight;
    var PAD = { top: 30, right: 20, bottom: 40, left: 60 };
    ctx.clearRect(0, 0, W, H);

    var intervals = data.intervals;
    var times = intervals.map(function(d) { return d.time; });
    var minT = times[0], maxT = times[times.length - 1];
    var allPrices = [];
    intervals.forEach(function(d) {
      allPrices.push(d.spot);
      if (d.callWall) allPrices.push(d.callWall);
      if (d.putWall) allPrices.push(d.putWall);
      if (d.gammaFlip) allPrices.push(d.gammaFlip);
    });
    var minP = Math.min.apply(null, allPrices), maxP = Math.max.apply(null, allPrices);
    var pPad = (maxP - minP) * 0.05 || 1;
    minP -= pPad; maxP += pPad;
    var xScale = function(t) { return PAD.left + (t - minT) / (maxT - minT || 1) * (W - PAD.left - PAD.right); };
    var yScale = function(p) { return PAD.top + (1 - (p - minP) / (maxP - minP)) * (H - PAD.top - PAD.bottom); };

    // Background GEX coloring
    var colW = (W - PAD.left - PAD.right) / Math.max(1, intervals.length - 1);
    intervals.forEach(function(d) {
      var x = xScale(d.time) - colW / 2;
      var alpha = Math.min(0.3, Math.abs(d.netGEX) / 1e9 * 0.3);
      ctx.fillStyle = d.netGEX >= 0 ? 'rgba(34,197,94,' + alpha + ')' : 'rgba(239,68,68,' + alpha + ')';
      ctx.fillRect(x, PAD.top, colW, H - PAD.top - PAD.bottom);
    });

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (var g = 0; g < 5; g++) {
      var gy = PAD.top + g * (H - PAD.top - PAD.bottom) / 4;
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(W - PAD.right, gy); ctx.stroke();
      ctx.fillStyle = '#666'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right';
      ctx.fillText('$' + (maxP - g * (maxP - minP) / 4).toFixed(0), PAD.left - 6, gy + 3);
    }

    // Level lines helper
    function drawLine(field, color, dash) {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash);
      var started = false;
      intervals.forEach(function(d) {
        if (d[field] == null) return;
        var x = xScale(d.time), y = yScale(d[field]);
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      });
      ctx.stroke(); ctx.setLineDash([]);
    }
    drawLine('callWall', '#22c55e', [4, 4]);
    drawLine('putWall', '#ef4444', [4, 4]);
    drawLine('gammaFlip', '#eab308', [3, 3]);
    drawLine('spot', '#3B82F6', []);

    // Legend
    var legendY = H - 12, lx = PAD.left;
    [{ l: 'Spot', c: '#3B82F6', d: false }, { l: 'Call Wall', c: '#22c55e', d: true }, { l: 'Put Wall', c: '#ef4444', d: true }, { l: 'Flip', c: '#eab308', d: true }].forEach(function(item) {
      ctx.strokeStyle = item.c; ctx.lineWidth = 2; ctx.setLineDash(item.d ? [4, 3] : []);
      ctx.beginPath(); ctx.moveTo(lx, legendY); ctx.lineTo(lx + 16, legendY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#888'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
      ctx.fillText(item.l, lx + 20, legendY + 3); lx += ctx.measureText(item.l).width + 36;
    });

    // Time labels
    ctx.fillStyle = '#666'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
    var tStep = Math.max(1, Math.floor(intervals.length / 8));
    for (var ti = 0; ti < intervals.length; ti += tStep) {
      var dt = new Date(intervals[ti].time);
      ctx.fillText(dt.getHours() + ':' + (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes(), xScale(intervals[ti].time), H - PAD.bottom + 14);
    }

    // NOW marker
    var now = Date.now();
    if (now >= minT && now <= maxT + 300000) {
      var nx = xScale(Math.min(now, maxT));
      ctx.strokeStyle = 'rgba(59,130,246,0.6)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(nx, PAD.top); ctx.lineTo(nx, H - PAD.bottom); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(59,130,246,0.8)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText('NOW', nx, PAD.top - 4);
    }
  }

  function loadSkew() {
    fetch('/api/gex/skew/' + state.ticker)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        state.skewData = d;
        state.skewVisible = d.skew.map(function(_, i) { return i < 2; });
        renderSkewChips();
        renderSkew();
      });
  }

  function renderSkewChips() {
    var el = document.getElementById('gexSkewChips');
    if (!el || !state.skewData) return;
    el.innerHTML = '';
    state.skewData.skew.forEach(function(exp, i) {
      var chip = document.createElement('button');
      chip.className = 'skew-chip' + (state.skewVisible[i] ? ' active' : '');
      chip.textContent = exp.expiration;
      chip.onclick = function() {
        state.skewVisible[i] = !state.skewVisible[i];
        chip.classList.toggle('active');
        renderSkew();
      };
      el.appendChild(chip);
    });
  }

  function renderSkew() {
    var canvas = document.getElementById('gexSkewCanvas');
    if (!canvas || !state.skewData || !state.skewData.skew.length) return;
    var wrap = canvas.parentElement;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = wrap.clientWidth, H = wrap.clientHeight;
    var PAD = { top: 20, right: 20, bottom: 30, left: 50 };

    ctx.clearRect(0, 0, W, H);

    var colors = ['#3B82F6', '#22c55e', '#f97316', '#a78bfa'];
    var allStrikes = [], allIVs = [];
    var spot = state.skewData.spot || 0;

    state.skewData.skew.forEach(function(exp, i) {
      if (!state.skewVisible[i]) return;
      exp.strikes.forEach(function(s) {
        allStrikes.push(s.strike);
        if (s.callIV > 0) allIVs.push(s.callIV);
        if (s.putIV > 0) allIVs.push(s.putIV);
      });
    });

    if (allStrikes.length === 0 || allIVs.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No IV data available', W / 2, H / 2);
      return;
    }

    var minS = Math.min.apply(null, allStrikes), maxS = Math.max.apply(null, allStrikes);
    var minIV = Math.min.apply(null, allIVs) * 0.9, maxIV = Math.max.apply(null, allIVs) * 1.1;
    var xScale = function(s) { return PAD.left + (s - minS) / (maxS - minS) * (W - PAD.left - PAD.right); };
    var yScale = function(iv) { return PAD.top + (1 - (iv - minIV) / (maxIV - minIV)) * (H - PAD.top - PAD.bottom); };

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (var g = 0; g < 5; g++) {
      var gy = PAD.top + g * (H - PAD.top - PAD.bottom) / 4;
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(W - PAD.right, gy); ctx.stroke();
      var ivLabel = maxIV - g * (maxIV - minIV) / 4;
      ctx.fillStyle = '#666';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText((ivLabel * 100).toFixed(0) + '%', PAD.left - 6, gy + 3);
    }

    // Spot line
    if (spot >= minS && spot <= maxS) {
      var sx = xScale(spot);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(59,130,246,0.5)';
      ctx.beginPath(); ctx.moveTo(sx, PAD.top); ctx.lineTo(sx, H - PAD.bottom); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(59,130,246,0.7)';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('SPOT', sx, PAD.top - 4);
    }

    // Draw IV curves per expiration
    state.skewData.skew.forEach(function(exp, i) {
      if (!state.skewVisible[i]) return;
      var color = colors[i % colors.length];
      // Call IV
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
      var started = false;
      exp.strikes.forEach(function(s) {
        if (s.callIV <= 0) return;
        var x = xScale(s.strike), y = yScale(s.callIV);
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      });
      ctx.stroke();
      // Put IV (dashed)
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      started = false;
      exp.strikes.forEach(function(s) {
        if (s.putIV <= 0) return;
        var x = xScale(s.strike), y = yScale(s.putIV);
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      });
      ctx.stroke(); ctx.setLineDash([]);
    });

    // Strike labels
    ctx.fillStyle = '#666';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    var sorted = allStrikes.slice().sort(function(a, b) { return a - b; });
    var unique = sorted.filter(function(v, i, a) { return i === 0 || v !== a[i-1]; });
    var step = Math.max(1, Math.floor(unique.length / 8));
    for (var j = 0; j < unique.length; j += step) {
      ctx.fillText('$' + unique[j], xScale(unique[j]), H - PAD.bottom + 14);
    }
  }

  function renderSurface() {
    var canvas = document.getElementById('gexSurfaceCanvas');
    if (!canvas || !state.data) return;
    var wrap = canvas.parentElement;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = wrap.clientWidth, H = wrap.clientHeight;

    ctx.clearRect(0, 0, W, H);

    // Build grid: X = strike index, Z = expiration index, Y = netGEX
    var exps = state.data.expirations || [];
    var rawGrid = state.data.grid || [];
    console.log('[Surface] exps:', exps.length, 'rawGrid:', rawGrid.length, 'W:', W, 'H:', H);
    if (!exps.length || !rawGrid.length) {
      ctx.fillStyle = '#666'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
      ctx.fillText('No expiration data', W / 2, H / 2);
      return;
    }

    // grid is [{ strike, values: [{ net }] }] where values[i] = expirations[i]
    var strikes = rawGrid.map(function(g) { return g.strike; });

    // Build GEX grid: [expIdx][strikeIdx] = netGEX value
    var grid = [];
    var maxAbsGEX = 0;
    exps.forEach(function(e, ei) {
      var row = [];
      rawGrid.forEach(function(g) {
        var v = (g.values && g.values[ei]) ? (g.values[ei].net || 0) : 0;
        row.push(v);
        maxAbsGEX = Math.max(maxAbsGEX, Math.abs(v));
      });
      grid.push(row);
    });

    if (maxAbsGEX === 0) maxAbsGEX = 1;
    console.log('[Surface] strikes:', strikes.length, 'grid rows:', grid.length, 'maxAbsGEX:', maxAbsGEX);

    // Isometric projection params
    var angle = state.surfaceAngle || 0.6;
    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    var scaleX = (W - 120) / (strikes.length + exps.length);
    var scaleZ = scaleX * 0.6;
    var scaleY = H * 0.25;
    var cx = W / 2, cy = H * 0.65;

    function project(xi, zi, yi) {
      var px = (xi - strikes.length / 2) * scaleX * cosA - (zi - exps.length / 2) * scaleZ * sinA;
      var py = -(yi * scaleY) - (xi - strikes.length / 2) * scaleX * sinA * 0.3 - (zi - exps.length / 2) * scaleZ * cosA * 0.3;
      return { x: cx + px, y: cy + py };
    }

    // Draw from back to front for proper occlusion
    var expOrder = sinA >= 0 ? Array.from({length: exps.length}, function(_, i) { return i; }) : Array.from({length: exps.length}, function(_, i) { return exps.length - 1 - i; });
    var strikeOrder = cosA >= 0 ? Array.from({length: strikes.length}, function(_, i) { return i; }) : Array.from({length: strikes.length}, function(_, i) { return strikes.length - 1 - i; });

    var drawCount = 0;
    expOrder.forEach(function(zi) {
      strikeOrder.forEach(function(xi) {
        var v = grid[zi][xi];
        var h = v / maxAbsGEX;
        var p0 = project(xi, zi, 0);
        if (drawCount === 0) console.log('[Surface] first cell: zi=' + zi + ' xi=' + xi + ' v=' + v + ' h=' + h + ' p0=', p0.x.toFixed(1), p0.y.toFixed(1));
        drawCount++;
        var p1 = project(xi, zi, h);
        var p2 = project(xi + 1, zi, h);
        var p3 = project(xi + 1, zi, 0);

        // Side face (strike direction)
        var alpha = Math.min(0.8, Math.abs(h) * 0.8 + 0.1);
        ctx.fillStyle = v >= 0
          ? 'rgba(34,197,94,' + alpha + ')'
          : 'rgba(239,68,68,' + alpha + ')';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath(); ctx.fill();

        // Top face
        var p4 = project(xi, zi + 1, h);
        var p5 = project(xi + 1, zi + 1, h);
        ctx.fillStyle = v >= 0
          ? 'rgba(34,197,94,' + (alpha * 0.7) + ')'
          : 'rgba(239,68,68,' + (alpha * 0.7) + ')';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p5.x, p5.y); ctx.lineTo(p4.x, p4.y);
        ctx.closePath(); ctx.fill();

        // Wireframe
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath(); ctx.stroke();
      });
    });

    // Spot price plane marker
    var spotPrice = state.data.spotPrice || state.data.spot;
    if (spotPrice) {
      var closestIdx = 0, closestDist = Infinity;
      strikes.forEach(function(s, i) {
        var d = Math.abs(s - spotPrice);
        if (d < closestDist) { closestDist = d; closestIdx = i; }
      });
      ctx.fillStyle = 'rgba(59,130,246,0.12)';
      ctx.strokeStyle = 'rgba(59,130,246,0.4)';
      ctx.lineWidth = 1;
      var pBot0 = project(closestIdx, 0, 0);
      var pBot1 = project(closestIdx, exps.length, 0);
      var pTop0 = project(closestIdx, 0, 0.5);
      var pTop1 = project(closestIdx, exps.length, 0.5);
      ctx.beginPath();
      ctx.moveTo(pBot0.x, pBot0.y); ctx.lineTo(pTop0.x, pTop0.y);
      ctx.lineTo(pTop1.x, pTop1.y); ctx.lineTo(pBot1.x, pBot1.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(59,130,246,0.8)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText('Spot $' + spotPrice.toFixed(0), pTop0.x, pTop0.y - 6);
    }

    // Axis labels — Strike labels (X)
    ctx.fillStyle = '#666'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
    var sStep = Math.max(1, Math.floor(strikes.length / 6));
    for (var si = 0; si < strikes.length; si += sStep) {
      var sp = project(si, -0.5, 0);
      ctx.fillText('$' + strikes[si], sp.x, sp.y + 12);
    }
    // Expiration labels (Z)
    exps.forEach(function(e, i) {
      var ep = project(-1, i + 0.5, 0);
      var expLabel = (e.date || e.expiration || e.expiry || '').slice(5); // MM-DD
      ctx.fillStyle = '#666'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
      ctx.fillText(expLabel, ep.x - 4, ep.y);
    });

    // Direction labels
    ctx.fillStyle = '#888'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('Strike \u2192', W - 80, H - 15);
    ctx.fillText('\u2190 Expiry', 10, H - 15);
  }

  function bindSurfaceDrag() {
    if (state.surfaceDragBound) return;
    var canvas = document.getElementById('gexSurfaceCanvas');
    if (!canvas) return;
    state.surfaceDragBound = true;
    var dragging = false, lastX = 0;
    canvas.addEventListener('mousedown', function(e) { dragging = true; lastX = e.clientX; });
    state._surfaceMove = function(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      state.surfaceAngle = (state.surfaceAngle || 0.6) + dx * 0.005;
      lastX = e.clientX;
      renderSurface();
    };
    state._surfaceUp = function() { dragging = false; };
    window.addEventListener('mousemove', state._surfaceMove);
    window.addEventListener('mouseup', state._surfaceUp);
  }

  function toggleExp(idx) {
    var pos = state.selectedExps.indexOf(idx);
    if (pos >= 0) { if (state.selectedExps.length <= 1) return; state.selectedExps.splice(pos, 1); }
    else { state.selectedExps.push(idx); state.selectedExps.sort(function(a,b){return a-b;}); }
    renderExpChips(); renderAll();
  }

  function toggleAllExps() {
    if (state.selectedExps.length === state.allExps.length) state.selectedExps = [0];
    else state.selectedExps = state.allExps.slice();
    renderExpChips(); renderAll();
  }

  function toggle0DTE() {
    if (!state.data) return;
    var today = new Date();
    var limit = new Date(today.getTime() + 5 * 86400000);
    var frontIdxs = [];
    state.data.expirations.forEach(function(exp, i) { if (new Date(exp.date) <= limit) frontIdxs.push(i); });
    if (frontIdxs.length === 0) return;
    var is0DTE = state.selectedExps.length <= frontIdxs.length && state.selectedExps.every(function(i) { return frontIdxs.indexOf(i) >= 0; });
    if (is0DTE) state.selectedExps = state.allExps.slice();
    else state.selectedExps = frontIdxs;
    renderExpChips(); renderAll();
  }

  // ── Tab Switching ──
  function setTab(tab) {
    state.tab = tab;
    var page = document.getElementById('page-gex');
    if (!page) return;
    page.querySelectorAll('.tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
    page.querySelectorAll('.detail-panel').forEach(function(p) { p.classList.remove('active'); });
    var panelMap = { heatmap: 'gexHeatmapPanel', profile: 'gexProfilePanel', greeks: 'gexGreeksPanel', analysis: 'gexAnalysisPanel', scan: 'gexScanPanel', skew: 'gexSkewPanel', timeline: 'gexTimelinePanel', surface: 'gexSurfacePanel' };
    if (panelMap[tab]) { var el = document.getElementById(panelMap[tab]); if (el) el.classList.add('active'); }
    if (tab === 'heatmap' && state.data) renderHeatmap();
    if (tab === 'heatmap') {
      setTimeout(function() { if (heatmap.canvas) { var wrap = document.getElementById('gexHeatmapCanvasWrap'); if (wrap) { var rect = wrap.getBoundingClientRect(); if (rect.width > 0) { heatmap.canvas.width = rect.width * heatmap.dpr; heatmap.canvas.height = rect.height * heatmap.dpr; heatmap.ctx.setTransform(heatmap.dpr, 0, 0, heatmap.dpr, 0, 0); drawHeatmap(); } } } }, 50);
    }
    if (tab === 'profile' && state.data) renderProfile();
    if (tab === 'greeks' && state.data) { if (state.activeGreek === 'vanna') renderVannaChart(); else renderCharmChart(); }
    if (tab === 'analysis') { if (!state.targetData && state.ticker) loadTargets(); if (!state.squeezeData && state.ticker) loadSqueeze(); renderAnalysis(); }
    if (tab === 'scan' && state.scanData) renderScan();
    if (tab === 'skew') loadSkew();
    if (tab === 'timeline') loadTimeline();
    if (tab === 'surface') { bindSurfaceDrag(); renderSurface(); }
  }

  function setGreek(greek) {
    state.activeGreek = greek;
    var page = document.getElementById('page-gex');
    if (!page) return;
    page.querySelectorAll('.greeks-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.greek === greek); });
    document.getElementById('gexVannaCanvas').style.display = greek === 'vanna' ? '' : 'none';
    document.getElementById('gexCharmCanvas').style.display = greek === 'charm' ? '' : 'none';
    if (greek === 'vanna') renderVannaChart(); else renderCharmChart();
  }



  function drawIntensityGauge(pct) {
    var canvas = document.getElementById('gexIntensityGauge');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H - 5, r = Math.min(W, H) - 10;
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.stroke();
    var angle = Math.PI + (pct / 100) * Math.PI;
    var grad = ctx.createLinearGradient(0, cy, W, cy);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.3, '#22c55e');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(0.7, '#eab308');
    grad.addColorStop(1, '#ef4444');
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, angle, false);
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = grad;
    ctx.stroke();
    var nx = cx + r * Math.cos(angle);
    var ny = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(nx, ny, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  // ── Analysis ──
  function renderAnalysis() {
    var el = document.getElementById('gexAnalysisContent');
    if (!el) return;
    var d = state.data, t = state.targetData, sq = state.squeezeData;
    var html = '';
    if (t && t.regime) {
      var rc = t.regime.label === 'Long Gamma' ? 'var(--green)' : t.regime.label === 'Short Gamma' ? 'var(--red)' : 'var(--yellow)';
      html += '<div class="overview-regime"><span class="regime-dot" style="background:' + rc + '"></span><span class="regime-label" style="color:' + rc + '">' + t.regime.label + '</span><span class="regime-conf">' + Math.round(t.regime.confidence * 100) + '%</span></div>';
    }
    if (d) {
      var cs = d.callWall ? '$' + d.callWall.strike : '\\u2014';
      var ps = d.putWall ? '$' + d.putWall.strike : '\\u2014';
      var fl = d.gammaFlip ? '$' + (typeof d.gammaFlip === 'number' ? d.gammaFlip.toFixed(1) : d.gammaFlip) : '\\u2014';
      var mp = d.maxPain ? '$' + d.maxPain.strike : '\\u2014';
      var ng = d.totalNetGEX || 0;
      var nc = ng >= 0 ? 'var(--green)' : 'var(--red)';
      html += '<div class="overview-cards" style="grid-template-columns:repeat(6,1fr);margin-bottom:20px">'
        + _analysisCard('Net GEX', fmtGEXShort(ng), nc, ng >= 0 ? 'Long gamma' : 'Short gamma')
        + _analysisCard('Call Wall', cs, 'var(--green)', '')
        + _analysisCard('Put Wall', ps, 'var(--red)', '')
        + _analysisCard('Gamma Flip', fl, 'var(--yellow)', '')
        + _analysisCard('Max Pain', mp, '#6b7280', '')
        + (function() {
          var intensity = state.data && state.data.intensity;
          var iPct = intensity ? intensity.percentile : 0;
          var iColor = iPct >= 70 ? 'var(--red)' : iPct >= 30 ? 'var(--yellow)' : 'var(--green)';
          var iLabel = iPct >= 70 ? 'Elevated' : iPct >= 30 ? 'Normal' : 'Suppressed';
          return '<div class="overview-card"><div class="card-label">GEX Intensity</div>'
            + '<div class="intensity-gauge"><canvas id="gexIntensityGauge" width="120" height="70"></canvas>'
            + '<div class="intensity-pct" style="color:' + iColor + '">' + iPct + '<span style="font-size:14px">%</span></div>'
            + '<div class="intensity-label">' + iLabel + '</div>'
            + (intensity ? '<div class="intensity-range">30d range</div>' : '')
            + '</div></div>';
        })()
        + '</div>';
    }
    if (sq && sq.score != null) {
      var sqc = sq.score > 60 ? 'var(--green)' : sq.score > 35 ? 'var(--yellow)' : 'var(--text-muted)';
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Squeeze Score</span><span style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:' + sqc + '">' + sq.score + '/100 \\u2014 ' + (sq.label || '') + '</span></div></div>';
    }
    // ── Imbalance Classification ──
    if (d && d.imbalance) {
      var imb = d.imbalance;
      var imbColor = imb.imbalanceType === 'CALL_HEAVY' || imb.imbalanceType === 'BULLISH_TILT' ? 'var(--green)' : imb.imbalanceType === 'PUT_HEAVY' || imb.imbalanceType === 'BEARISH_TILT' ? 'var(--red)' : 'var(--text-muted)';
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Imbalance Classification</span><span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:' + imbColor + '">' + (imb.setupLabel || imb.imbalanceType || 'N/A') + ' &mdash; ' + imb.confidence + '%</span></div>';
      html += '<div style="padding:8px 12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      html += '<div style="font-family:var(--font-mono);font-size:11px"><span style="color:var(--text-muted)">Above GEX:</span> <span style="color:var(--green)">' + fmtGEXShort(imb.aboveGEX) + '</span></div>';
      html += '<div style="font-family:var(--font-mono);font-size:11px"><span style="color:var(--text-muted)">Below GEX:</span> <span style="color:var(--red)">' + fmtGEXShort(imb.belowGEX) + '</span></div>';
      html += '</div>';
      if (imb.reasons && imb.reasons.length > 0) {
        html += '<div style="padding:4px 12px 10px;font-size:11px;color:var(--text-muted);line-height:1.5">';
        imb.reasons.forEach(function(r) { html += '<div>&bull; ' + r + '</div>'; });
        html += '</div>';
      }
      if (imb.levels) {
        var lv = imb.levels;
        html += '<div style="padding:4px 12px 10px;display:flex;flex-wrap:wrap;gap:6px">';
        if (lv.magnetLevel) html += '<span style="display:inline-block;padding:3px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;background:var(--accent-subtle);color:var(--accent);border:1px solid var(--border)">Magnet $' + lv.magnetLevel + '</span>';
        if (lv.supportLevels) lv.supportLevels.forEach(function(s) { html += '<span style="display:inline-block;padding:3px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;background:var(--accent-subtle);color:var(--green);border:1px solid rgba(78,201,160,0.2)">Support $' + s + '</span>'; });
        if (lv.resistanceLevels) lv.resistanceLevels.forEach(function(r) { html += '<span style="display:inline-block;padding:3px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(192,88,98,0.2)">Resistance $' + r + '</span>'; });
        html += '</div>';
      }
      html += '</div>';
    }

    // ── Hedge Pressure ──
    if (d && d.hedgePressure) {
      var hp = d.hedgePressure;
      var pr = hp.pressure || {};
      var prColor = pr.label === 'HIGH' ? 'var(--red)' : pr.label === 'BUILDING' ? 'var(--yellow)' : 'var(--green)';
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Hedge Pressure</span><span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:' + prColor + '">' + (pr.score || 0) + '/100 &mdash; ' + (pr.label || 'N/A') + '</span></div>';
      html += '<div style="padding:8px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-family:var(--font-mono);font-size:11px">';
      if (hp.flipRisk != null) html += '<div><span style="color:var(--text-muted)">Flip Risk:</span> <span style="color:' + (hp.flipRisk >= 60 ? 'var(--red)' : 'var(--text)') + '">' + hp.flipRisk + '</span></div>';
      if (hp.hedgeSensitivity != null) html += '<div><span style="color:var(--text-muted)">Sensitivity:</span> <span style="color:var(--text)">' + hp.hedgeSensitivity.toFixed(1) + '</span></div>';
      if (hp.rebalanceUrgency) html += '<div><span style="color:var(--text-muted)">Urgency:</span> <span style="color:' + (hp.rebalanceUrgency === 'HIGH' ? 'var(--red)' : hp.rebalanceUrgency === 'MODERATE' ? 'var(--yellow)' : 'var(--text)') + '">' + hp.rebalanceUrgency + '</span></div>';
      html += '</div></div>';
    }

    // ── Dynamics / Structure State ──
    if (state.dynamics) {
      var dy = state.dynamics;
      var stColor = dy.structureState === 'FRAGILIZING' ? 'var(--red)' : dy.structureState === 'STABILIZING' ? 'var(--green)' : 'var(--text-muted)';
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Dynamics</span><span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:' + stColor + '">' + dy.structureState + '</span></div>';
      html += '<div style="padding:8px 12px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-family:var(--font-mono);font-size:11px">';
      html += '<div><span style="color:var(--text-muted)">Pressure:</span> <span style="color:' + (dy.pressureScore >= 60 ? 'var(--red)' : dy.pressureScore >= 30 ? 'var(--yellow)' : 'var(--green)') + '">' + dy.pressureScore + '</span></div>';
      html += '<div><span style="color:var(--text-muted)">Structure:</span> <span style="color:var(--text)">' + dy.structureScore + '</span></div>';
      html += '<div><span style="color:var(--text-muted)">Trend:</span> <span style="color:' + (dy.pressureTrend_5m === 'RISING' ? 'var(--red)' : dy.pressureTrend_5m === 'FALLING' ? 'var(--green)' : 'var(--text-muted)') + '">' + dy.pressureTrend_5m + '</span></div>';
      html += '<div><span style="color:var(--text-muted)">&Delta;GEX 15m:</span> <span style="color:' + (dy.deltaGEX_norm_15m < 0 ? 'var(--red)' : 'var(--green)') + '">' + (dy.deltaGEX_norm_15m > 0 ? '+' : '') + dy.deltaGEX_norm_15m + '</span></div>';
      html += '</div>';
      if (dy.expansionRisk) {
        html += '<div style="padding:6px 12px 10px"><span style="display:inline-block;padding:4px 10px;border-radius:4px;background:rgba(255,59,92,0.15);color:var(--red);font-family:var(--font-mono);font-size:11px;font-weight:600;border:1px solid rgba(255,59,92,0.3)">&#9888; EXPANSION RISK: ' + dy.expansionReason + '</span></div>';
      }
      if (dy.flipDistancePct != null) {
        html += '<div style="padding:4px 12px 10px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">Flip distance: ' + (dy.flipDistancePct * 100).toFixed(2) + '% | Flip drift 15m: ' + (dy.flipDrift_15m > 0 ? '+' : '') + dy.flipDrift_15m.toFixed(2) + '</div>';
      }
      html += '</div>';
    }

    if (t && t.expectedMove) {
      var em = t.expectedMove;
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Expected Move</span><span style="font-family:var(--font-mono);font-size:12px;color:var(--text)">' + (em.rangePct ? '\\u00b1' + em.rangePct.toFixed(1) + '%' : '') + '</span></div>';
      if (em.lower && em.upper) { html += '<div style="padding:8px 10px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">$' + em.lower.toFixed(2) + ' \\u2014 $' + em.upper.toFixed(2) + '</div>'; }
      html += '</div>';
    }
    if (t && t.tradeSuggestions && t.tradeSuggestions.length > 0) {
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>Trade Suggestions</span></div>';
      t.tradeSuggestions.forEach(function(sig) {
        var sc = sig.type === 'call' || sig.action === 'BUY_CALL' ? 'var(--green)' : 'var(--red)';
        html += '<div class="tgt-signal" style="border-color:' + sc + '"><div class="tgt-signal-conf" style="color:' + sc + '">' + (sig.confidence || sig.grade || '') + '</div><div class="tgt-signal-title" style="color:' + sc + '">$' + sig.strike + ' ' + (sig.type || sig.action || '') + (sig.expiry ? ' (' + sig.expiry + ')' : '') + '</div><div class="tgt-signal-detail">' + (sig.reasoning || '') + '</div></div>';
      });
      html += '</div>';
    }
    if (t && t.aiCommentary && t.aiCommentary.summary) {
      html += '<div class="tgt-section"><div class="tgt-section-hdr"><span>AI Commentary</span></div><div style="padding:12px;font-family:var(--font-body);font-size:12px;color:var(--text);line-height:1.6">' + t.aiCommentary.summary + '</div></div>';
    }
    if (t && t.bullishTargets && t.bullishTargets.length > 0) html += _targetList('Bullish Targets', t.bullishTargets, 'var(--green)');
    if (t && t.bearishTargets && t.bearishTargets.length > 0) html += _targetList('Bearish Targets', t.bearishTargets, 'var(--red)');
    if (!html) html = '<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:12px">Loading analysis...</div>';
    el.innerHTML = html;
    var intensityData = state.data && state.data.intensity;
    drawIntensityGauge(intensityData ? intensityData.percentile : 0);
    var regEl = document.getElementById('gexAnalysisRegime');
    if (regEl && t && t.regime) {
      regEl.style.color = t.regime.label === 'Long Gamma' ? 'var(--green)' : t.regime.label === 'Short Gamma' ? 'var(--red)' : 'var(--yellow)';
      regEl.textContent = t.regime.label;
    }
  }

  function _analysisCard(label, value, color, sub) {
    return '<div class="overview-card"><div class="card-label">' + label + '</div><div class="card-value" style="color:' + color + ';font-size:18px">' + value + '</div>' + (sub ? '<div class="card-sub">' + sub + '</div>' : '') + '</div>';
  }

  function _targetList(title, targets, color) {
    var html = '<div class="tgt-section"><div class="tgt-section-hdr"><span>' + title + '</span></div>';
    targets.slice(0, 5).forEach(function(t) {
      var tags = '';
      if (t.isGEXMagnet) tags += '<span class="tgt-tag" style="background:var(--accent-subtle);color:var(--accent)">GEX</span>';
      if (t.isVannaMagnet) tags += '<span class="tgt-tag" style="background:rgba(107,114,128,0.1);color:#9ca3af">Vanna</span>';
      html += '<div class="tgt-row"><span class="tgt-strike" style="color:' + color + '">$' + t.strike + '</span><span class="tgt-dist">' + (t.distance > 0 ? '+' : '') + (typeof t.distance === 'number' ? t.distance.toFixed(1) : t.distance) + '%</span><div class="tgt-tags">' + tags + '</div><div class="tgt-bar-wrap"><div class="tgt-bar-fill" style="width:' + Math.round((t.confidence || 0) * 100) + '%;background:' + color + '"></div></div><span class="tgt-pct" style="color:' + color + '">' + Math.round((t.confidence || 0) * 100) + '%</span></div>';
    });
    return html + '</div>';
  }

  // ── Range ──
  function updateRange(val) {
    state.range = parseInt(val);
    var el = document.getElementById('gexRangeVal');
    if (el) el.textContent = '\\u00b1' + val;
  }

  // ── Real-time updates handled entirely by Socket.IO (5s server broadcast) ──
  // No manual refresh or SSE needed — Socket.IO gex:update events arrive every 5s

  // ── Tooltip ──
  function hideTip() {
    var tt = document.getElementById('gexTooltip');
    if (tt) tt.classList.remove('show');
  }

  // ── UI Helpers ──
  function updateSpotBadge() {
    if (!state.data) return;
    var badge = document.getElementById('gexSpotBadge');
    if (badge) {
      badge.textContent = state.data.ticker + ' $' + state.data.spotPrice.toFixed(2);
      badge.classList.remove('flash'); void badge.offsetWidth; badge.classList.add('flash');
    }
    var kl = document.getElementById('gexKeyLevels');
    if (kl) {
      var html = '';
      if (state.data.callWall) html += '<span class="kl-badge kl-call">Call Wall $' + state.data.callWall.strike + '</span>';
      if (state.data.putWall) html += '<span class="kl-badge kl-put">Put Wall $' + state.data.putWall.strike + '</span>';
      if (state.data.gammaFlip) html += '<span class="kl-badge kl-flip">Flip $' + state.data.gammaFlip + '</span>';
      kl.innerHTML = html;
    }
    // Mirror key levels into legend bar (always visible near heatmap)
    var ll = document.getElementById('gexLegendLevels');
    if (ll) {
      var lh = '';
      if (state.data.callWall) lh += '<span class="ll ll-cw">CW $' + state.data.callWall.strike + '</span>';
      if (state.data.putWall) lh += '<span class="ll ll-pw">PW $' + state.data.putWall.strike + '</span>';
      if (state.data.gammaFlip) lh += '<span class="ll ll-flip">Flip $' + state.data.gammaFlip + '</span>';
      var mag = state.data.imbalance && state.data.imbalance.levels ? state.data.imbalance.levels.magnetLevel : null;
      if (mag) lh += '<span class="ll ll-mag">Mag $' + mag + '</span>';
      ll.innerHTML = lh;
    }
  }

  function updateFooter() {
    if (!state.data) return;
    var src = state.data.source || 'Yahoo';
    var fl = document.getElementById('gexFooterLeft');
    var fr = document.getElementById('gexFooterRight');
    if (fl) fl.textContent = 'GEX = OI \\u00d7 Gamma \\u00d7 100 | Data: ' + src + (src === 'Tradier' ? ' (ORATS real greeks)' : src === 'Public.com' ? ' (real greeks)' : src.includes('LIVE') ? ' (OPRA live)' : ' (Black-Scholes est.)');
    if (fr) fr.textContent = 'Updated: ' + new Date(state.data.timestamp).toLocaleTimeString() + ' | ' + state.data.expirations.length + ' expirations | ' + state.data.strikes.length + ' strikes';
  }

  function showLoading(msg) {
    var el = document.getElementById('gexLoadingIndicator');
    if (!el) return;
    el.innerHTML = '<div class="spinner"></div><div style="color:var(--text-muted);font-size:12px;font-family:var(--font-body)">' + (msg || 'Loading...') + '</div>';
    el.style.display = 'flex';
  }

  function showError(msg) {
    var el = document.getElementById('gexLoadingIndicator');
    if (!el) return;
    el.innerHTML = '<div class="error-msg">' + msg + '</div>';
    el.style.display = 'flex';
  }

  // ── Targets ──
  async function loadTargets() {
    if (!state.ticker) return;
    var el = document.getElementById('gexAnalysisContent');
    if (el) el.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:40px 0;text-align:center"><div class="spinner"></div>Loading targets...</div>';
    try {
      var res = await fetch('/api/gex/targets/' + state.ticker);
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      state.targetData = data;
      updateRegimeBadge();
      renderAnalysis();
    } catch (err) {
      if (el) el.innerHTML = '<div style="color:#f44;font-size:12px;padding:20px 0;text-align:center">Failed: ' + err.message + '</div>';
    }
  }

  async function loadSqueeze() {
    if (!state.ticker) return;
    try {
      var res = await fetch('/api/gex/squeeze/' + state.ticker);
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      state.squeezeData = data;
      renderAnalysis();
    } catch(e) {}
  }

  // ── Scan ──
  async function runScan() {
    var input = document.getElementById('gexScanInput');
    var el = document.getElementById('gexScanContent');
    if (!input || !el) return;
    var tickersInput = input.value.trim();
    if (!tickersInput) return;
    el.innerHTML = '<div style="text-align:center;padding:40px"><div class="spinner"></div><div style="color:var(--text-muted);font-size:12px;margin-top:12px">Scanning...</div></div>';
    try {
      var res = await fetch('/api/gex/scan?tickers=' + encodeURIComponent(tickersInput));
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      state.scanData = data;
      renderScan();
    } catch (err) {
      el.innerHTML = '<div style="color:var(--red);font-size:12px;padding:20px;text-align:center">Failed: ' + err.message + '</div>';
    }
  }

  function renderScan() {
    var el = document.getElementById('gexScanContent');
    var d = state.scanData;
    if (!el || !d || !d.rows || d.rows.length === 0) {
      if (el) el.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:40px 0;text-align:center">No scan data</div>';
      return;
    }
    var rows = d.rows;
    if (state.scanFilter !== 'ALL') {
      rows = rows.filter(function(r) { return r.imbalanceType === state.scanFilter; });
    }
    // Sort: pressureScore desc, then confidence desc
    rows = rows.slice().sort(function(a, b) {
      var pa = a.pressureScore || 0, pb = b.pressureScore || 0;
      if (pb !== pa) return pb - pa;
      return (b.imbalanceConfidence || 0) - (a.imbalanceConfidence || 0);
    });

    var scanModeMap = { GAMMA_BOX: 'RANGE', BULL_IMBALANCE: 'UP', BEAR_IMBALANCE: 'DOWN', NO_CONTROL: 'VOLATILE' };
    var scanPlayMap = { GAMMA_BOX: "Fade edges", BULL_IMBALANCE: 'Buy dips', BEAR_IMBALANCE: 'Sell rips', NO_CONTROL: 'Trade break' };
    var imbColorMap = { BULL_IMBALANCE: 'var(--green)', BEAR_IMBALANCE: 'var(--red)', GAMMA_BOX: 'var(--yellow)', NO_CONTROL: '#a78bfa' };
    var pressureColorMap = { LOW: 'var(--green)', BUILDING: 'var(--yellow)', HIGH: 'var(--red)' };

    var html = '<div style="overflow-x:auto"><table class="scan-table"><thead><tr>'
      + '<th>Symbol</th><th>Mode</th><th>Do This</th><th>S/R</th>'
      + '<th>Pressure</th><th>Structure</th>'
      + '</tr></thead><tbody>';
    rows.forEach(function(r) {
      var imbColor = imbColorMap[r.imbalanceType] || 'var(--text-muted)';
      var mode = scanModeMap[r.imbalanceType] || '-';
      var play = scanPlayMap[r.imbalanceType] || '-';
      var pLabel = r.pressureLabel || 'LOW';
      var pColor = pressureColorMap[pLabel] || 'var(--text-muted)';
      var sLabel = r.structureState || 'NEUTRAL';
      var sColor = sLabel === 'FRAGILIZING' ? 'var(--red)' : sLabel === 'STABILIZING' ? 'var(--green)' : 'var(--text-muted)';
      var keyLines = '';
      if (r.callWall) keyLines += 'R $' + r.callWall;
      if (r.putWall) keyLines += (keyLines ? ' / ' : '') + 'S $' + r.putWall;
      html += '<tr>';
      html += '<td><span class="scan-ticker" data-ticker="' + r.ticker + '">' + r.ticker + '</span> <span style="color:var(--text-muted);font-size:9px">$' + (r.spotPrice || 0).toFixed(0) + '</span></td>';
      html += '<td style="color:' + imbColor + ';font-weight:700">' + mode + '</td>';
      html += '<td style="font-size:10px;white-space:nowrap">' + play + '</td>';
      html += '<td style="font-size:9px;color:var(--text-muted);white-space:nowrap">' + (keyLines || '-') + '</td>';
      html += '<td style="color:' + pColor + ';font-weight:600">' + pLabel + '</td>';
      html += '<td style="color:' + sColor + '">' + sLabel + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    if (rows.length === 0) html = '<div style="color:var(--text-muted);font-size:12px;padding:20px 0;text-align:center">No tickers match filter</div>';
    el.innerHTML = html;
  }

  function initHeatmapCanvas() {
    var wrap = document.getElementById('gexHeatmapCanvasWrap');
    if (!wrap) return;
    var canvas = document.getElementById('gexHeatmapCanvas');
    if (!canvas) return;
    heatmap.canvas = canvas;
    heatmap.ctx = canvas.getContext('2d');

    function resize() {
      var rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * heatmap.dpr;
      canvas.height = rect.height * heatmap.dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      heatmap.ctx.setTransform(heatmap.dpr, 0, 0, heatmap.dpr, 0, 0);
      if (state.data) drawHeatmap();
    }
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    canvas.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;

      if (state.heatmapView === 'treemap') {
        // Treemap hover
        var hitIdx = -1;
        if (heatmap.treemapNodes) {
          for (var ti = 0; ti < heatmap.treemapNodes.length; ti++) {
            var tl = heatmap.treemapNodes[ti].layout;
            if (mx >= tl.x && mx <= tl.x + tl.w && my >= tl.y && my <= tl.y + tl.h) { hitIdx = ti; break; }
          }
        }
        if (hitIdx < 0) { heatmap.hoverTreemapIdx = -1; hideTip(); drawHeatmap(); return; }
        if (heatmap.hoverTreemapIdx === hitIdx) {
          // just reposition tooltip
        } else {
          heatmap.hoverTreemapIdx = hitIdx;
          drawHeatmap();
        }
        var tn = heatmap.treemapNodes[hitIdx];
        var tt = document.getElementById('gexTooltip');
        if (!tt) return;
        var distToSpot = state.data.spotPrice ? ((tn.strike - state.data.spotPrice) / state.data.spotPrice * 100).toFixed(1) : '?';
        var zoneText = tn.net >= 0
          ? 'Stabilizing (tends to slow moves)'
          : 'Acceleration (can speed moves)';
        var roleText = '';
        if (tn.strike > state.data.spotPrice) roleText = 'Resistance';
        else if (tn.strike < state.data.spotPrice) roleText = 'Support';
        tt.innerHTML = '<div class="tt-title">$' + tn.strike + '</div>'
          + '<div class="tt-row"><span class="tt-label">Net GEX</span><span class="tt-val ' + (tn.net >= 0 ? 'tt-pos' : 'tt-neg') + '">' + fmtGEXFull(tn.net) + '</span></div>'
          + (roleText ? '<div class="tt-row"><span class="tt-label">Role</span><span class="tt-val">' + roleText + '</span></div>' : '')
          + '<div class="tt-row"><span class="tt-label">Dist to Spot</span><span class="tt-val">' + distToSpot + '%</span></div>'
          + (state.data.spotPrice ? '<div class="tt-row"><span class="tt-label">Hedge Flow/\\u00241</span><span class="tt-val">' + fmtGEXFull(tn.net * state.data.spotPrice * 0.01) + '</span></div>' : '')
          + '<div class="tt-zone">' + zoneText + '</div>';
        tt.classList.add('show');
        var left = e.clientX + 14, top = e.clientY - 10;
        if (left + 260 > window.innerWidth) left = e.clientX - 270;
        if (top + 150 > window.innerHeight) top = window.innerHeight - 160;
        tt.style.left = left + 'px'; tt.style.top = Math.max(0, top) + 'px';
        return;
      }

      // Grid hover (original)
      var col = Math.floor((mx - heatmap.strikeColW + heatmap.scrollX) / heatmap.cellW);
      var row = Math.floor((my - heatmap.headerH + heatmap.scrollY) / heatmap.cellH);
      if (mx < heatmap.strikeColW || my < heatmap.headerH || col < 0 || row < 0 || !state.data || row >= state.data.grid.length || col >= state.selectedExps.length) {
        heatmap.hoverCell = null; hideTip(); drawHeatmap(); return;
      }
      heatmap.hoverCell = { row: row, col: col };
      drawHeatmap();
      var tt2 = document.getElementById('gexTooltip');
      if (!tt2) return;
      var rowData = state.data.grid[row];
      var expIdx = state.selectedExps[col];
      var v = rowData ? rowData.values[expIdx] : null;
      var exp = state.data.expirations[expIdx];
      if (!v || !exp) { hideTip(); return; }
      tt2.innerHTML = '<div class="tt-title">$' + rowData.strike + ' \\u2014 ' + exp.date + '</div>'
        + '<div class="tt-row"><span class="tt-label">Net GEX</span><span class="tt-val ' + (v.net >= 0 ? 'tt-pos' : 'tt-neg') + '">' + fmtGEXFull(v.net) + '</span></div>'
        + '<div class="tt-row"><span class="tt-label">Call GEX</span><span class="tt-val tt-pos">' + fmtGEXFull(v.call) + '</span></div>'
        + '<div class="tt-row"><span class="tt-label">Put GEX</span><span class="tt-val tt-neg">' + fmtGEXFull(v.put) + '</span></div>'
        + '<div class="tt-row"><span class="tt-label">Call OI</span><span class="tt-val">' + (v.callOI || 0).toLocaleString() + '</span></div>'
        + '<div class="tt-row"><span class="tt-label">Put OI</span><span class="tt-val">' + (v.putOI || 0).toLocaleString() + '</span></div>'
        + (state.data.spotPrice ? '<div class="tt-row"><span class="tt-label">Hedge Flow/\\u00241</span><span class="tt-val">' + fmtGEXFull(v.net * state.data.spotPrice * 0.01) + '</span></div>' : '');
      tt2.classList.add('show');
      var left = e.clientX + 14, top = e.clientY - 10;
      if (left + 260 > window.innerWidth) left = e.clientX - 270;
      if (top + 150 > window.innerHeight) top = window.innerHeight - 160;
      tt2.style.left = left + 'px'; tt2.style.top = Math.max(0, top) + 'px';
    });
    canvas.addEventListener('mouseleave', function() { heatmap.hoverCell = null; heatmap.hoverTreemapIdx = -1; hideTip(); drawHeatmap(); });
    canvas.addEventListener('wheel', function(e) { e.preventDefault(); heatmap.scrollX += e.deltaX || 0; heatmap.scrollY += e.deltaY || 0; clampHeatmapScroll(); drawHeatmap(); }, { passive: false });

    var touchState = { id: null, x: 0, y: 0 };
    canvas.addEventListener('touchstart', function(e) { if (e.touches.length === 1) { var t = e.touches[0]; touchState.id = t.identifier; touchState.x = t.clientX; touchState.y = t.clientY; } }, { passive: true });
    canvas.addEventListener('touchmove', function(e) { if (e.touches.length !== 1) return; var t = e.touches[0]; if (t.identifier !== touchState.id) return; e.preventDefault(); heatmap.scrollX -= (t.clientX - touchState.x); heatmap.scrollY -= (t.clientY - touchState.y); touchState.x = t.clientX; touchState.y = t.clientY; clampHeatmapScroll(); drawHeatmap(); }, { passive: false });
  }

  function clampHeatmapScroll() {
    if (!state.data || !heatmap.canvas) return;
    var W = heatmap.canvas.width / heatmap.dpr, H = heatmap.canvas.height / heatmap.dpr;
    var cW = heatmap.strikeColW + state.selectedExps.length * heatmap.cellW;
    var cH = heatmap.headerH + state.data.grid.length * heatmap.cellH;
    heatmap.scrollX = Math.max(0, Math.min(heatmap.scrollX, Math.max(0, cW - W + heatmap.strikeColW)));
    heatmap.scrollY = Math.max(0, Math.min(heatmap.scrollY, Math.max(0, cH - H + heatmap.headerH)));
  }

  function drawHeatmap() {
    if (state.heatmapView === 'treemap') drawTreemap();
    else drawGridHeatmap();
    var legend = document.getElementById('gexTreemapLegend');
    if (legend) legend.style.display = 'flex';
    syncPopout();
  }

  function openPopout() {
    if (popoutWin && !popoutWin.closed) { popoutWin.focus(); return; }
    var dataUrl = heatmap.canvas ? heatmap.canvas.toDataURL() : '';
    popoutWin = window.open('', '_blank', 'width=1200,height=800');
    if (!popoutWin) return;
    popoutWin.document.write('<!DOCTYPE html><html><head><title>GEX Heatmap — ' + state.ticker + '</title>' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0F172A;display:flex;flex-direction:column;height:100vh;overflow:hidden}' +
      '#popout-header{padding:10px 16px;color:#F8FAFC;font-family:Inter,sans-serif;font-size:14px;display:flex;align-items:center;gap:8px}' +
      '#popout-ticker{font-weight:600;font-size:16px}#popout-img{flex:1;min-height:0;width:100%;object-fit:contain;padding:8px}</style></head>' +
      '<body><div id="popout-header"><span id="popout-ticker">GEX Heatmap — ' + state.ticker + '</span></div>' +
      '<img id="popout-img" src="' + dataUrl + '"/></body></html>');
    popoutWin.document.close();
  }

  function syncPopout() {
    if (!popoutWin || popoutWin.closed) { popoutWin = null; return; }
    try {
      var img = popoutWin.document.getElementById('popout-img');
      if (img && heatmap.canvas) img.src = heatmap.canvas.toDataURL();
      var label = popoutWin.document.getElementById('popout-ticker');
      if (label) label.textContent = 'GEX Heatmap — ' + state.ticker;
    } catch(e) { /* cross-origin or closed */ }
  }

  // ── Squarified Treemap Layout ──
  function squarify(nodes, rect) {
    if (nodes.length === 0) return [];
    var total = nodes.reduce(function(s, n) { return s + n.absGEX; }, 0);
    if (total <= 0) return [];
    var sorted = nodes.slice().sort(function(a, b) { return b.absGEX - a.absGEX; });
    var results = [];
    layoutStrip(sorted, rect, total, results);
    return results;
  }

  function layoutStrip(items, rect, totalArea, results) {
    if (items.length === 0) return;
    if (items.length === 1) {
      items[0].layout = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
      results.push(items[0]);
      return;
    }
    var rectArea = rect.w * rect.h;
    var short = Math.min(rect.w, rect.h);
    var strip = [items[0]];
    var stripSum = items[0].absGEX;
    var bestAR = worstAR(strip, stripSum, totalArea, rectArea, short);
    for (var i = 1; i < items.length; i++) {
      var newSum = stripSum + items[i].absGEX;
      var newStrip = strip.concat(items[i]);
      var newAR = worstAR(newStrip, newSum, totalArea, rectArea, short);
      if (newAR <= bestAR) {
        strip = newStrip; stripSum = newSum; bestAR = newAR;
      } else break;
    }
    // lay out strip
    var fraction = stripSum / totalArea;
    var isHoriz = rect.w >= rect.h;
    var stripLen = isHoriz ? rect.w * fraction : rect.h * fraction;
    var pos = isHoriz ? rect.x : rect.y;
    var crossPos = isHoriz ? rect.y : rect.x;
    var crossLen = isHoriz ? rect.h : rect.w;
    for (var j = 0; j < strip.length; j++) {
      var itemFrac = strip[j].absGEX / stripSum;
      var itemLen = crossLen * itemFrac;
      if (isHoriz) {
        strip[j].layout = { x: rect.x, y: crossPos, w: stripLen, h: itemLen };
      } else {
        strip[j].layout = { x: crossPos, y: rect.y, w: itemLen, h: stripLen };
      }
      results.push(strip[j]);
      crossPos += itemLen;
    }
    // remaining
    var remaining = items.slice(strip.length);
    var newRect;
    if (isHoriz) {
      newRect = { x: rect.x + stripLen, y: rect.y, w: rect.w - stripLen, h: rect.h };
    } else {
      newRect = { x: rect.x, y: rect.y + stripLen, w: rect.w, h: rect.h - stripLen };
    }
    layoutStrip(remaining, newRect, totalArea - stripSum, results);
  }

  function worstAR(strip, stripSum, totalArea, rectArea, short) {
    var worst = 0;
    var stripPx = (stripSum / totalArea) * rectArea;
    var stripW = stripPx / short;
    for (var i = 0; i < strip.length; i++) {
      var itemPx = (strip[i].absGEX / stripSum) * stripPx;
      var itemH = itemPx / stripW;
      var ar = Math.max(stripW / itemH, itemH / stripW);
      if (ar > worst) worst = ar;
    }
    return worst;
  }

  // ── Treemap / Grid Visual Hierarchy ──
  // Fill     = gamma structure (green = +GEX dealer long gamma, red = -GEX dealer short gamma)
  // Opacity  = |netGEX| percentile within symbol (p95 clipped, power 0.40)
  // Badges   = walls (CALL WALL blue corner tag, PUT WALL orange corner tag)
  // Line     = spot price (white core + cyan glow, anchoring reference)
  // Glow     = magnet strike (thin white ring) + top-3 relevance (embossed green/red)
  // Band     = gamma box (translucent stripe if GAMMA_BOX)
  // Slope    = gamma slope zones (grid only, ±7 strikes of spot, 6% opacity background)
  // Hover    = cyan border (tooltip trigger only)

  function drawTreemap() {
    var ctx = heatmap.ctx, canvas = heatmap.canvas;
    if (!ctx || !canvas || !state.data) return;
    var d = state.data;
    var W = canvas.width / heatmap.dpr, H = canvas.height / heatmap.dpr;

    // Build profile aggregated across selected expirations
    var spotPrice = d.spotPrice || 0;
    var strikeStep = d.strikes.length > 1 ? d.strikes[1] - d.strikes[0] : 1;
    var nodes = [];
    for (var si = 0; si < d.grid.length; si++) {
      var callGex = 0, putGex = 0, callOI = 0, putOI = 0;
      for (var k = 0; k < state.selectedExps.length; k++) {
        var idx = state.selectedExps[k];
        var v = d.grid[si].values[idx];
        if (v) { callGex += v.call; putGex += v.put; callOI += (v.callOI || 0); putOI += (v.putOI || 0); }
      }
      var net = callGex + putGex;
      var absGEX = Math.abs(net);
      nodes.push({
        strike: d.strikes[si],
        net: net,
        call: callGex,
        put: putGex,
        callOI: callOI,
        putOI: putOI,
        absGEX: absGEX,
        isCallWall: d.callWall && d.strikes[si] === d.callWall.strike,
        isPutWall: d.putWall && d.strikes[si] === d.putWall.strike,
        isSpot: Math.abs(d.strikes[si] - spotPrice) <= strikeStep * 0.5,
        isMagnet: d.imbalance && d.imbalance.levels && d.imbalance.levels.magnetLevel === d.strikes[si],
      });
    }

    // Percentile-clipped power scaling
    var maxAbsGEX = nodes.reduce(function(m, n) { return Math.max(m, n.absGEX); }, 0);
    if (maxAbsGEX <= 0) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#09090b'; ctx.fillRect(0, 0, W, H); return; }
    var absValues = nodes.map(function(n) { return n.absGEX; }).filter(function(v) { return v > 0; });
    var p95 = absValues.length > 0 ? percentile(absValues, 95) : maxAbsGEX;
    if (p95 <= 0) p95 = maxAbsGEX;
    var threshold = maxAbsGEX * 0.01;
    nodes = nodes.filter(function(n) { return n.absGEX >= threshold; });
    var top3 = getTopByRelevance(nodes, spotPrice, 3);

    var PAD = 8;
    var laid = squarify(nodes, { x: PAD, y: PAD, w: W - PAD * 2, h: H - PAD * 2 });
    heatmap.treemapNodes = laid;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, W, H);

    // Color modifiers (regime removed — default stable)
    var regimeKey = 'STABLE';

    for (var i = 0; i < laid.length; i++) {
      var node = laid[i];
      var l = node.layout;
      var intensity = Math.min(1, Math.pow(Math.min(node.absGEX / p95, 1), 0.40));
      var alpha = 0.55 + intensity * 0.45;
      var gap = 1.5;

      // Regime-aware alpha/intensity adjustments
      var greenMod = 1.0, redMod = 1.0;
      if (regimeKey === 'STABLE') {
        greenMod = 1.15;  // Green boxes brighter
        redMod = 0.8;     // Red boxes muted
      } else if (regimeKey === 'FRAGILE') {
        redMod = 1.2;     // Red boxes more saturated
        greenMod = 0.9;
      } else if (regimeKey === 'ACCELERATION') {
        redMod = 1.3;     // Red dominant
        greenMod = 0.75;  // Green dimmed
      } else if (regimeKey === 'EXPANSION') {
        redMod = 1.4;     // Strong red
        greenMod = 0.7;
      }

      // Fill — hue-shifted green: dark→saturated→yellow-green by intensity (perceptually balanced)
      if (node.net >= 0) {
        var gDim = 0.92;
        var gA = Math.min(1, alpha * greenMod);
        var gR = Math.round((18 + intensity * 85) * gDim), gG = Math.round((95 + intensity * 135) * gDim), gB = Math.round((38 + intensity * 18 - intensity * intensity * 25) * gDim);
        ctx.fillStyle = 'rgba(' + gR + ',' + gG + ',' + gB + ',' + gA + ')';
      } else {
        var rA = Math.min(1, alpha * redMod);
        var rR = Math.round(170 + intensity * 85), rG = Math.round(45 + intensity * 40), rB = Math.round(45 + intensity * 40);
        ctx.fillStyle = 'rgba(' + rR + ',' + rG + ',' + rB + ',' + rA + ')';
      }
      ctx.fillRect(l.x + gap, l.y + gap, l.w - gap * 2, l.h - gap * 2);

      // Magnet glow: thin neutral white ring (only signal allowed on borders)
      if (node.isMagnet) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(255,255,255,0.25)';
        ctx.shadowBlur = 6;
        ctx.strokeRect(l.x + gap + 1, l.y + gap + 1, l.w - gap * 2 - 2, l.h - gap * 2 - 2);
        ctx.restore();
      }

      // Regime-aware wall/flip emphasis
      if (regimeKey === 'STABLE' && (node.isCallWall || node.isPutWall)) {
        // Reinforced walls in stable regime — subtle outer glow
        ctx.save();
        ctx.strokeStyle = node.isCallWall ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
        ctx.lineWidth = 1;
        ctx.shadowColor = node.isCallWall ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
        ctx.shadowBlur = 8;
        ctx.strokeRect(l.x + gap, l.y + gap, l.w - gap * 2, l.h - gap * 2);
        ctx.restore();
      }
      if ((regimeKey === 'FRAGILE' || regimeKey === 'ACCELERATION' || regimeKey === 'EXPANSION') && node.isPutWall) {
        // Emphasized put wall in fragile/acceleration regimes
        ctx.save();
        ctx.strokeStyle = 'rgba(239,68,68,0.35)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(239,68,68,0.20)';
        ctx.shadowBlur = 10;
        ctx.strokeRect(l.x + gap, l.y + gap, l.w - gap * 2, l.h - gap * 2);
        ctx.restore();
      }
      if ((regimeKey === 'FRAGILE' || regimeKey === 'ACCELERATION') && node.isSpot) {
        // Flip/spot highlight in fragile regimes
        ctx.save();
        ctx.strokeStyle = 'rgba(245,158,11,0.30)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(245,158,11,0.15)';
        ctx.shadowBlur = 6;
        ctx.strokeRect(l.x + gap, l.y + gap, l.w - gap * 2, l.h - gap * 2);
        ctx.restore();
      }

      // Text content
      var bw = l.w - gap * 2, bh = l.h - gap * 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var cx = l.x + l.w / 2, cy = l.y + l.h / 2;

      if (bw > 60 && bh > 40) {
        // Large block: strike + GEX value + gamma zone
        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold ' + Math.min(16, Math.max(11, bw / 8)) + 'px JetBrains Mono';
        ctx.fillText('$' + node.strike, cx, cy - (bh > 60 ? 14 : 4));
        ctx.font = Math.min(12, Math.max(9, bw / 10)) + 'px JetBrains Mono';
        ctx.fillStyle = '#b0b0b0';
        ctx.fillText(fmtGEX(node.net), cx, cy + (bh > 60 ? 2 : 10));
        if (bh > 60) {
          ctx.font = 'bold 7px JetBrains Mono';
          ctx.fillStyle = node.net >= 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
          ctx.fillText(node.net >= 0 ? '+\u0393 STABLE' : '-\u0393 ACCEL', cx, cy + 16);
        }
      } else if (bw > 35 && bh > 22) {
        // Medium block: strike + abbreviated GEX
        ctx.fillStyle = '#d0d0d0';
        ctx.font = Math.min(11, Math.max(8, bw / 6)) + 'px JetBrains Mono';
        ctx.fillText('$' + node.strike, cx, cy - 4);
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = '#888';
        ctx.fillText(fmtGEX(node.net), cx, cy + 8);
      } else if (bw > 20 && bh > 14) {
        // Small block: just strike
        ctx.fillStyle = '#999';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('$' + node.strike, cx, cy);
      }

      // Wall badges: small corner tags (not borders)
      if (node.isCallWall && bw > 50 && bh > 24) {
        ctx.save();
        ctx.font = 'bold 7px JetBrains Mono';
        var tw = ctx.measureText('CALL WALL').width + 6;
        ctx.fillStyle = 'rgba(59,130,246,0.85)';
        ctx.fillRect(l.x + gap + 2, l.y + gap + 2, tw, 12);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('CALL WALL', l.x + gap + 5, l.y + gap + 4);
        ctx.restore();
      }
      if (node.isPutWall && bw > 50 && bh > 24) {
        ctx.save();
        ctx.font = 'bold 7px JetBrains Mono';
        var tw2 = ctx.measureText('PUT WALL').width + 6;
        ctx.fillStyle = 'rgba(249,115,22,0.85)';
        ctx.fillRect(l.x + gap + 2, l.y + gap + 2, tw2, 12);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('PUT WALL', l.x + gap + 5, l.y + gap + 4);
        ctx.restore();
      }

      // Top-3 relevance glow — double stroke for embossed look
      if (top3.indexSet && top3.indexSet[i]) {
        ctx.save();
        var isPos = top3.indexSet[i] === 'pos';
        // Outer glow
        ctx.strokeStyle = isPos ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)';
        ctx.lineWidth = 3;
        ctx.shadowColor = isPos ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
        ctx.shadowBlur = 12;
        ctx.strokeRect(l.x + gap, l.y + gap, l.w - gap * 2, l.h - gap * 2);
        // Inner crisp border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isPos ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(l.x + gap + 1.5, l.y + gap + 1.5, l.w - gap * 2 - 3, l.h - gap * 2 - 3);
        ctx.restore();
      }

      // Hover highlight (tooltip trigger only)
      if (heatmap.hoverTreemapIdx === i) {
        ctx.save();
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.strokeRect(l.x + gap, l.y + gap, l.w - gap * 2, l.h - gap * 2);
        ctx.restore();
      }
    }

    // Spot line: thin cyan horizontal line across the treemap
    // In treemap layout, spot doesn't map to a y-position. Instead, mark the spot tile.
    for (var si2 = 0; si2 < laid.length; si2++) {
      if (laid[si2].isSpot) {
        var sl = laid[si2].layout;
        ctx.save();
        ctx.shadowColor = 'rgba(59,130,246,0.5)';
        ctx.shadowBlur = 8;
        ctx.setLineDash([3, 2]);
        var spotY = sl.y + sl.h / 2;
        ctx.strokeStyle = 'rgba(59,130,246,0.9)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(PAD, spotY); ctx.lineTo(W - PAD, spotY); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.5; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(PAD, spotY); ctx.lineTo(W - PAD, spotY); ctx.stroke();
        // Small "SPOT" label
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.font = 'bold 8px JetBrains Mono';
        ctx.fillStyle = 'rgba(59,130,246,0.9)';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText('SPOT', W - PAD - 4, spotY - 1);
        ctx.restore();
        break;
      }
    }

    // Gamma Box band: translucent band between nearest support and resistance (if GAMMA_BOX)
    if (d.imbalance && d.imbalance.imbalanceType === 'GAMMA_BOX' && d.imbalance.levels) {
      var supLevels = d.imbalance.levels.supportLevels;
      var resLevels = d.imbalance.levels.resistanceLevels;
      if (supLevels.length > 0 && resLevels.length > 0) {
        // Find the treemap nodes for nearest support and resistance
        var supNode = null, resNode = null;
        for (var bi = 0; bi < laid.length; bi++) {
          if (laid[bi].strike === supLevels[0]) supNode = laid[bi];
          if (laid[bi].strike === resLevels[0]) resNode = laid[bi];
        }
        if (supNode && resNode) {
          var bandTop = Math.min(supNode.layout.y, resNode.layout.y);
          var bandBot = Math.max(supNode.layout.y + supNode.layout.h, resNode.layout.y + resNode.layout.h);
          ctx.save();
          ctx.fillStyle = 'rgba(250,204,21,0.06)';
          ctx.fillRect(PAD, bandTop, W - PAD * 2, bandBot - bandTop);
          ctx.strokeStyle = 'rgba(250,204,21,0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(PAD, bandTop, W - PAD * 2, bandBot - bandTop);
          ctx.setLineDash([]);
          ctx.font = 'bold 8px JetBrains Mono';
          ctx.fillStyle = 'rgba(250,204,21,0.4)';
          ctx.textAlign = 'right'; ctx.textBaseline = 'top';
          ctx.fillText('GAMMA BOX', W - PAD - 4, bandTop + 3);
          ctx.restore();
        }
      }
    }
  }

  function drawGridHeatmap() {
    var ctx = heatmap.ctx, canvas = heatmap.canvas;
    if (!ctx || !canvas || !state.data) return;
    var d = state.data;
    var exps = state.selectedExps.map(function(i) { return d.expirations[i]; }).filter(Boolean);
    if (exps.length === 0) return;
    // Find nearest expiration (0DTE or closest)
    var now = Date.now();
    var nearestExpIdx = 0, nearestDist = Infinity;
    for (var ne = 0; ne < exps.length; ne++) {
      var ed = new Date(exps[ne].date).getTime() - now;
      if (ed >= 0 && ed < nearestDist) { nearestDist = ed; nearestExpIdx = ne; }
    }

    var W = canvas.width / heatmap.dpr, H = canvas.height / heatmap.dpr;
    var cw = heatmap.cellW, ch = heatmap.cellH, hdrH = heatmap.headerH, sColW = heatmap.strikeColW;

    var maxAbs = 0;
    var gridAbsValues = [];
    for (var r = 0; r < d.grid.length; r++) {
      for (var ci = 0; ci < state.selectedExps.length; ci++) {
        var v = d.grid[r].values[state.selectedExps[ci]];
        if (v && Math.abs(v.net) > 0) {
          gridAbsValues.push(Math.abs(v.net));
          if (Math.abs(v.net) > maxAbs) maxAbs = Math.abs(v.net);
        }
      }
    }
    if (maxAbs === 0) maxAbs = 1;
    var gridP95 = gridAbsValues.length > 0 ? percentile(gridAbsValues, 95) : maxAbs;
    if (gridP95 <= 0) gridP95 = maxAbs;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, W, H);

    // Gamma slope zones — faint background bands near spot
    var sStep = d.strikes.length > 1 ? Math.abs(d.strikes[1] - d.strikes[0]) : 1;
    var slopeZones = computeSlopeZones(d.grid, d.strikes, d.spotPrice, sStep, state.selectedExps, 5);
    if (slopeZones.length > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
      for (var sz = 0; sz < slopeZones.length; sz++) {
        var zy = hdrH + slopeZones[sz].row * ch - heatmap.scrollY;
        if (zy + ch < hdrH || zy > H) continue;
        var sNorm = slopeZones[sz].slope;
        var sAlpha = Math.min(0.05, Math.abs(sNorm) * 0.05);
        ctx.fillStyle = sNorm > 0 ? 'rgba(34,197,94,' + sAlpha + ')' : 'rgba(239,68,68,' + sAlpha + ')';
        ctx.fillRect(sColW, zy, W - sColW, ch);
      }
      ctx.restore();
    }

    // Nearest expiration column tint
    var neColX = sColW + nearestExpIdx * cw - heatmap.scrollX;
    if (neColX + cw > sColW && neColX < W) {
      ctx.save();
      ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
      ctx.fillStyle = 'rgba(59,130,246,0.03)';
      ctx.fillRect(neColX, hdrH, cw, H - hdrH);
      ctx.restore();
    }

    // Header row
    ctx.save();
    ctx.beginPath(); ctx.rect(sColW, 0, W - sColW, hdrH); ctx.clip();
    ctx.font = '9px JetBrains Mono';
    ctx.textAlign = 'center';
    for (var hi = 0; hi < exps.length; hi++) {
      var hx = sColW + hi * cw - heatmap.scrollX + cw / 2;
      if (hi === nearestExpIdx) {
        ctx.fillStyle = '#3B82F6';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(exps[hi].date, hx, hdrH - 10);
        ctx.font = '9px JetBrains Mono';
      } else {
        ctx.fillStyle = '#5a5a65';
        ctx.fillText(exps[hi].date, hx, hdrH - 10);
      }
    }
    ctx.restore();

    // Expiration header magnitude bars
    var colNets = [], maxColAbs = 0;
    for (var ci2 = 0; ci2 < exps.length; ci2++) {
      var colNet = 0;
      for (var ri2 = 0; ri2 < d.grid.length; ri2++) {
        var cv = d.grid[ri2].values[state.selectedExps[ci2]];
        if (cv) colNet += cv.net;
      }
      colNets.push(colNet);
      if (Math.abs(colNet) > maxColAbs) maxColAbs = Math.abs(colNet);
    }
    if (maxColAbs > 0) {
      var barH = 3, barY = hdrH - 4, domIdx = 0;
      for (var bi = 0; bi < colNets.length; bi++) {
        if (Math.abs(colNets[bi]) > Math.abs(colNets[domIdx])) domIdx = bi;
      }
      ctx.save();
      ctx.beginPath(); ctx.rect(sColW, 0, W - sColW, hdrH); ctx.clip();
      for (var bi2 = 0; bi2 < colNets.length; bi2++) {
        var bx = sColW + bi2 * cw - heatmap.scrollX;
        var ratio = Math.abs(colNets[bi2]) / maxColAbs;
        var bw = (cw - 4) * ratio;
        ctx.fillStyle = colNets[bi2] >= 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
        ctx.fillRect(bx + (cw - bw) / 2, barY, bw, barH);
        if (bi2 === domIdx) {
          ctx.strokeStyle = '#3B82F6'; ctx.lineWidth = 0.5;
          ctx.strokeRect(bx + 1, barY - 1, cw - 2, barH + 2);
        }
      }
      ctx.restore();
    }

    // Grid cells
    ctx.save();
    ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
    for (var row = 0; row < d.grid.length; row++) {
      var y = hdrH + row * ch - heatmap.scrollY;
      if (y + ch < hdrH || y > H) continue;
      for (var col = 0; col < state.selectedExps.length; col++) {
        var x = sColW + col * cw - heatmap.scrollX;
        if (x + cw < sColW || x > W) continue;
        var val = d.grid[row].values[state.selectedExps[col]];
        if (!val) continue;
        var intensity = Math.min(1, Math.pow(Math.min(Math.abs(val.net) / gridP95, 1), 0.40));
        if (val.net >= 0) {
          var gDim2 = 0.92;
          var g = Math.round((95 + intensity * 135) * gDim2);
          ctx.fillStyle = 'rgba(' + Math.round((18 + intensity * 85) * gDim2) + ',' + g + ',' + Math.round((38 + intensity * 18 - intensity * intensity * 25) * gDim2) + ',' + (0.45 + intensity * 0.55) + ')';
        } else {
          var rr = Math.round(160 + intensity * 85);
          ctx.fillStyle = 'rgba(' + rr + ',' + Math.round(40 + intensity * 40) + ',' + Math.round(45 + intensity * 40) + ',' + (0.45 + intensity * 0.55) + ')';
        }
        ctx.fillRect(x, y, cw - 1, ch - 1);

        // Value text
        if (cw > 50 && ch > 16) {
          ctx.fillStyle = intensity > 0.5 ? '#e0e0e0' : '#5a5a65';
          ctx.font = '9px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(fmtGEX(val.net), x + cw / 2, y + ch / 2 + 3);
        }

        // Hover highlight
        if (heatmap.hoverCell && heatmap.hoverCell.row === row && heatmap.hoverCell.col === col) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cw - 1, ch - 1);
        }
      }
    }
    ctx.restore();

    // Magnet glow on grid cells
    var magnetStrike = d.imbalance && d.imbalance.levels ? d.imbalance.levels.magnetLevel : null;
    if (magnetStrike != null) {
      for (var mr = 0; mr < d.grid.length; mr++) {
        if (d.grid[mr].strike !== magnetStrike) continue;
        var my = hdrH + mr * ch - heatmap.scrollY;
        if (my + ch < hdrH || my > H) continue;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = 8;
        for (var mc = 0; mc < state.selectedExps.length; mc++) {
          var mx2 = sColW + mc * cw - heatmap.scrollX;
          if (mx2 + cw < sColW || mx2 > W) continue;
          ctx.strokeRect(mx2 + 1, my + 1, cw - 3, ch - 3);
        }
        ctx.restore();
        break;
      }
    }

    // Call Wall row highlight
    var callWallStrike = d.callWall ? d.callWall.strike : null;
    if (callWallStrike != null) {
      for (var cwr = 0; cwr < d.grid.length; cwr++) {
        if (d.grid[cwr].strike !== callWallStrike) continue;
        var cwy = hdrH + cwr * ch - heatmap.scrollY;
        if (cwy + ch < hdrH || cwy > H) continue;
        ctx.save();
        // Full-width row tint
        ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
        ctx.fillStyle = 'rgba(59,130,246,0.08)';
        ctx.fillRect(sColW, cwy, W - sColW, ch);
        // Bright solid line at top edge
        ctx.strokeStyle = 'rgba(96,165,250,0.9)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(59,130,246,0.6)';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(sColW, cwy + 0.5); ctx.lineTo(W, cwy + 0.5); ctx.stroke();
        // White core
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(sColW, cwy + 0.5); ctx.lineTo(W, cwy + 0.5); ctx.stroke();
        // Label tag
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = 'rgba(96,165,250,0.95)';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(59,130,246,0.4)'; ctx.shadowBlur = 4;
        ctx.fillText('CALL WALL', W - 8, cwy + 10);
        ctx.shadowBlur = 0;
        ctx.restore();
        break;
      }
    }

    // Put Wall row highlight
    var putWallStrike = d.putWall ? d.putWall.strike : null;
    if (putWallStrike != null) {
      for (var pwr = 0; pwr < d.grid.length; pwr++) {
        if (d.grid[pwr].strike !== putWallStrike) continue;
        var pwy = hdrH + pwr * ch - heatmap.scrollY;
        if (pwy + ch < hdrH || pwy > H) continue;
        ctx.save();
        ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
        ctx.fillStyle = 'rgba(249,115,22,0.08)';
        ctx.fillRect(sColW, pwy, W - sColW, ch);
        ctx.strokeStyle = 'rgba(251,146,60,0.9)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(249,115,22,0.6)';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(sColW, pwy + ch - 0.5); ctx.lineTo(W, pwy + ch - 0.5); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(sColW, pwy + ch - 0.5); ctx.lineTo(W, pwy + ch - 0.5); ctx.stroke();
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = 'rgba(251,146,60,0.95)';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(249,115,22,0.4)'; ctx.shadowBlur = 4;
        ctx.fillText('PUT WALL', W - 8, pwy + ch - 4);
        ctx.shadowBlur = 0;
        ctx.restore();
        break;
      }
    }

    // Gamma Flip (Pin) row highlight
    var gammaFlipStrike = d.gammaFlip || null;
    if (gammaFlipStrike != null) {
      for (var gfr = 0; gfr < d.grid.length; gfr++) {
        var gfStep = d.strikes.length > 1 ? Math.abs(d.strikes[1] - d.strikes[0]) : 1;
        if (Math.abs(d.grid[gfr].strike - gammaFlipStrike) > gfStep * 0.5) continue;
        var gfy = hdrH + gfr * ch - heatmap.scrollY;
        if (gfy + ch < hdrH || gfy > H) continue;
        ctx.save();
        ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
        ctx.fillStyle = 'rgba(168,85,247,0.06)';
        ctx.fillRect(sColW, gfy, W - sColW, ch);
        ctx.strokeStyle = 'rgba(192,132,252,0.9)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(168,85,247,0.6)';
        ctx.shadowBlur = 10;
        ctx.setLineDash([5, 3]);
        ctx.beginPath(); ctx.moveTo(sColW, gfy + ch / 2); ctx.lineTo(W, gfy + ch / 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.5; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(sColW, gfy + ch / 2); ctx.lineTo(W, gfy + ch / 2); ctx.stroke();
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = 'rgba(192,132,252,0.95)';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(168,85,247,0.4)'; ctx.shadowBlur = 4;
        ctx.fillText('FLIP / PIN', W - 8, gfy + ch / 2 - 5);
        ctx.shadowBlur = 0;
        ctx.restore();
        break;
      }
    }

    // Magnet glow — upgrade to brighter
    if (magnetStrike != null) {
      for (var mr2 = 0; mr2 < d.grid.length; mr2++) {
        if (d.grid[mr2].strike !== magnetStrike) continue;
        var my2 = hdrH + mr2 * ch - heatmap.scrollY;
        if (my2 + ch < hdrH || my2 > H) continue;
        ctx.save();
        ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
        ctx.fillStyle = 'var(--border-subtle)';
        ctx.fillRect(sColW, my2, W - sColW, ch);
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = 6;
        ctx.fillText('MAGNET', W - 8, my2 + ch / 2 + 3);
        ctx.shadowBlur = 0;
        ctx.restore();
        break;
      }
    }

    // Gamma Box band (breakout zone)
    if (d.imbalance && d.imbalance.imbalanceType === 'GAMMA_BOX' && d.imbalance.levels) {
      var boxSupport = d.imbalance.levels.supportLevels && d.imbalance.levels.supportLevels[0] ? d.imbalance.levels.supportLevels[0].strike : null;
      var boxResist = d.imbalance.levels.resistanceLevels && d.imbalance.levels.resistanceLevels[0] ? d.imbalance.levels.resistanceLevels[0].strike : null;
      if (boxSupport != null && boxResist != null) {
        var boxTopRow = -1, boxBotRow = -1;
        for (var gbr = 0; gbr < d.grid.length; gbr++) {
          var gbStep2 = d.strikes.length > 1 ? Math.abs(d.strikes[1] - d.strikes[0]) : 1;
          if (Math.abs(d.grid[gbr].strike - boxResist) <= gbStep2 * 0.5) boxTopRow = gbr;
          if (Math.abs(d.grid[gbr].strike - boxSupport) <= gbStep2 * 0.5) boxBotRow = gbr;
        }
        if (boxTopRow >= 0 && boxBotRow >= 0) {
          var gbY1 = hdrH + boxTopRow * ch - heatmap.scrollY;
          var gbY2 = hdrH + (boxBotRow + 1) * ch - heatmap.scrollY;
          ctx.save();
          ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
          ctx.fillStyle = 'rgba(250,204,21,0.10)';
          ctx.fillRect(sColW, gbY1, W - sColW, gbY2 - gbY1);
          ctx.strokeStyle = 'rgba(250,204,21,0.45)';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = 'rgba(250,204,21,0.3)';
          ctx.shadowBlur = 6;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(sColW + 1, gbY1, W - sColW - 2, gbY2 - gbY1);
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.fillStyle = 'rgba(250,204,21,0.85)';
          ctx.textAlign = 'right';
          ctx.shadowColor = 'rgba(250,204,21,0.3)'; ctx.shadowBlur = 4;
          ctx.fillText('GAMMA BOX', W - 8, gbY1 + 12);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    // Acceleration zone (red tint when regime is ACCELERATION or EXPANSION)
    var regime = 'STABLE';
    if (d.imbalance && d.hedgePressure) {
      var _hp = d.hedgePressure.pressure || { score: 0 };
      var _flipDist = 999, _belowRatio = 0, _pressScore = _hp.score || 0;
      if (d.gammaFlip && d.spotPrice > 0) _flipDist = Math.abs(d.spotPrice - d.gammaFlip) / d.spotPrice;
      if (d.imbalance.aboveGEX != null && d.imbalance.belowGEX != null) {
        var _aAbs = Math.abs(d.imbalance.aboveGEX), _bAbs = Math.abs(d.imbalance.belowGEX);
        _belowRatio = (_aAbs + _bAbs) > 0 ? _bAbs / (_aAbs + _bAbs) : 0;
      }
      var _velNorm = state.dynamics ? Math.abs(state.dynamics.deltaGEX_norm_15m || 0) : 0;
      if (_velNorm > REGIME_THRESHOLDS.velSpike && _flipDist < REGIME_THRESHOLDS.flipNearPct) regime = 'EXPANSION';
      else if (_velNorm > REGIME_THRESHOLDS.velSpike || (_pressScore >= REGIME_THRESHOLDS.pressureHigh && _flipDist < REGIME_THRESHOLDS.flipFarPct)) regime = 'ACCELERATION';
      else if (_flipDist < REGIME_THRESHOLDS.flipNearPct || (_belowRatio > REGIME_THRESHOLDS.belowRatio && _pressScore >= REGIME_THRESHOLDS.pressureMod)) regime = 'FRAGILE';
      else if (_pressScore >= REGIME_THRESHOLDS.pressureMod || (_velNorm > REGIME_THRESHOLDS.velQuiet)) regime = 'BUILDING';
    }
    if (regime === 'ACCELERATION' || regime === 'EXPANSION') {
      if (putWallStrike != null) {
        for (var azr = 0; azr < d.grid.length; azr++) {
          if (d.grid[azr].strike !== putWallStrike) continue;
          var azSpotRow = -1;
          for (var asr = 0; asr < d.grid.length; asr++) {
            var azStep = d.strikes.length > 1 ? Math.abs(d.strikes[1] - d.strikes[0]) : 1;
            if (Math.abs(d.grid[asr].strike - d.spotPrice) <= azStep * 0.5) { azSpotRow = asr; break; }
          }
          if (azSpotRow >= 0 && azr > azSpotRow) {
            var azY1 = hdrH + azSpotRow * ch - heatmap.scrollY;
            var azY2 = hdrH + (azr + 1) * ch - heatmap.scrollY;
            ctx.save();
            ctx.beginPath(); ctx.rect(sColW, hdrH, W - sColW, H - hdrH); ctx.clip();
            var azAlpha = regime === 'EXPANSION' ? 0.10 : 0.07;
            ctx.fillStyle = 'rgba(239,68,68,' + azAlpha + ')';
            ctx.fillRect(sColW, azY1, W - sColW, azY2 - azY1);
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.fillStyle = 'rgba(239,68,68,0.75)';
            ctx.textAlign = 'right';
            ctx.shadowColor = 'rgba(239,68,68,0.3)'; ctx.shadowBlur = 4;
            ctx.fillText(regime === 'EXPANSION' ? 'EXPANSION' : 'ACCEL ZONE', W - 8, azY1 + 12);
            ctx.shadowBlur = 0;
            ctx.restore();
          }
          break;
        }
      }
    }

    ctx.restore();

    // Strike column with level badges
    ctx.save();
    ctx.beginPath(); ctx.rect(0, hdrH, sColW, H - hdrH); ctx.clip();
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'right';
    for (var row2 = 0; row2 < d.grid.length; row2++) {
      var y2 = hdrH + row2 * ch - heatmap.scrollY;
      if (y2 + ch < hdrH || y2 > H) continue;
      var rowStrike = d.grid[row2].strike;

      // Badge for call wall
      if (callWallStrike != null && rowStrike === callWallStrike) {
        ctx.fillStyle = 'rgba(59,130,246,0.85)';
        ctx.fillRect(1, y2 + 1, 3, ch - 2);
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('$' + rowStrike, sColW - 8, y2 + ch / 2 + 3);
        ctx.font = '10px JetBrains Mono';
        continue;
      }
      // Badge for put wall
      if (putWallStrike != null && rowStrike === putWallStrike) {
        ctx.fillStyle = 'rgba(249,115,22,0.85)';
        ctx.fillRect(1, y2 + 1, 3, ch - 2);
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('$' + rowStrike, sColW - 8, y2 + ch / 2 + 3);
        ctx.font = '10px JetBrains Mono';
        continue;
      }
      // Badge for gamma flip / pin
      if (gammaFlipStrike != null && Math.abs(rowStrike - gammaFlipStrike) <= (d.strikes.length > 1 ? Math.abs(d.strikes[1] - d.strikes[0]) * 0.5 : 0.5)) {
        ctx.fillStyle = 'rgba(168,85,247,0.85)';
        ctx.fillRect(1, y2 + 1, 3, ch - 2);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('$' + rowStrike, sColW - 8, y2 + ch / 2 + 3);
        ctx.font = '10px JetBrains Mono';
        continue;
      }
      // Badge for magnet
      if (magnetStrike != null && rowStrike === magnetStrike) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(1, y2 + 1, 3, ch - 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('$' + rowStrike, sColW - 8, y2 + ch / 2 + 3);
        ctx.font = '10px JetBrains Mono';
        continue;
      }

      ctx.fillStyle = '#5a5a65';
      ctx.fillText('$' + rowStrike, sColW - 8, y2 + ch / 2 + 3);
    }
    ctx.restore();

    // Header background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, sColW, hdrH);

    // Grid lines
    ctx.strokeStyle = 'var(--border-subtle)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(sColW, 0); ctx.lineTo(sColW, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, hdrH); ctx.lineTo(W, hdrH); ctx.stroke();

    // Spot line: thin cyan horizontal line across entire grid width
    var strikeStep2 = d.strikes.length > 1 ? Math.abs(d.strikes[1] - d.strikes[0]) : 1;
    for (var sr = 0; sr < d.grid.length; sr++) {
      if (Math.abs(d.grid[sr].strike - d.spotPrice) <= strikeStep2 * 0.5) {
        var spotY2 = hdrH + sr * ch - heatmap.scrollY + ch / 2;
        if (spotY2 >= hdrH && spotY2 <= H) {
          ctx.save();
          ctx.shadowColor = 'rgba(59,130,246,0.5)';
          ctx.shadowBlur = 8;
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = 'rgba(59,130,246,0.9)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, spotY2); ctx.lineTo(W, spotY2); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.5; ctx.shadowBlur = 0;
          ctx.beginPath(); ctx.moveTo(0, spotY2); ctx.lineTo(W, spotY2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
          ctx.font = 'bold 8px JetBrains Mono';
          ctx.fillStyle = 'rgba(59,130,246,0.9)';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText('SPOT $' + d.spotPrice.toFixed(2), 4, spotY2 - 6);
          ctx.restore();
        }
        break;
      }
    }
  }

  // ── Regime / Verdict / Timing ──
  var MODE_MAP = {
    GAMMA_BOX: { mode: 'RANGE', color: 'var(--yellow)', action: "Fade the edges. Don't chase breakouts.", invalidation: 'break and hold outside the box' },
    BULL_IMBALANCE: { mode: 'UP', color: 'var(--green)', action: 'Buy dips into support. Breakouts can run.', invalidation: 'support' },
    BEAR_IMBALANCE: { mode: 'DOWN', color: 'var(--red)', action: 'Sell rips into resistance. Breakdowns can run.', invalidation: 'resistance' },
    NO_CONTROL: { mode: 'VOLATILE', color: '#a78bfa', action: "Don't fade. Trade the break + follow-through.", invalidation: null },
    UNKNOWN: { mode: 'NO SIGNAL', color: 'var(--text-muted)', action: 'Insufficient data.', invalidation: null },
  };
  var STRUCT_TYPE_MAP = { GAMMA_BOX: 'Gamma Box', BULL_IMBALANCE: 'Bull Imbalance', BEAR_IMBALANCE: 'Bear Imbalance', NO_CONTROL: 'No Control' };

  var REGIME_THRESHOLDS = {
    velQuiet: 0.05, velSpike: 0.25, flipNearPct: 0.005, flipFarPct: 0.015,
    pressureHigh: 55, pressureMod: 30, belowRatio: 0.6,
  };

  var REGIME_ACTIONS = {
    STABLE: { expect: 'Mean reversion, choppy range', trade: 'Fade resistance, buy support', avoid: 'Breakout chasing', risk: 'Smaller size, tighter stops', sizing: 'Half-size or less' },
    BUILDING: { expect: 'Range tightening, breakout setup forming', trade: 'Prepare directional entries near edges', avoid: 'Premature breakout entries', risk: 'Normal size, wait for confirmation', sizing: 'Standard, scale in on trigger' },
    FRAGILE: { expect: 'Support may fail, downside acceleration possible', trade: 'Put spreads, short-biased scalps', avoid: 'Buying dips blind', risk: 'Wider stops, protect capital', sizing: 'Reduced \\u2014 respect the fragility' },
    ACCELERATION: { expect: 'Volatility expansion, fast directional move', trade: 'Momentum continuation, ride the trend', avoid: 'Countertrend fading', risk: 'Wider stops, let runners run', sizing: 'Normal but trail aggressively' },
    EXPANSION: { expect: 'Extended move, dealers chasing', trade: 'Hold existing, add on pullbacks', avoid: 'New mean-reversion entries', risk: 'Widest stops, expect overshoot', sizing: 'Reduced new entries, manage existing' },
  };

  // ── Trade Desk Logic ──────────────────────────────────────────────

  // ── Trade Desk state ──
  var _tradeDeskCollapsed = false;
  var _tradeDeskAltsOpen = false;
  var _tradeDeskBuilderOpen = false;
  var _tradeDeskBuilderIdx = 0;
  var _tradeDeskParams = [];

  // Black-Scholes helpers (inline for browser — mirrors src/lib/black-scholes.js)
  var _bsCache = {};
  function _normalCDF(x) {
    var a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
    var sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.SQRT2;
    var t = 1 / (1 + p * x);
    var y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return 0.5 * (1 + sign * y);
  }
  function _bsD1(S, K, T, r, sigma) {
    if (T <= 0) T = 1/365;
    return (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T));
  }
  function _bsPrice(S, K, T, r, sigma, isCall) {
    if (T <= 0) T = 1/365;
    var d1 = _bsD1(S, K, T, r, sigma);
    var d2 = d1 - sigma * Math.sqrt(T);
    if (isCall) return S * _normalCDF(d1) - K * Math.exp(-r*T) * _normalCDF(d2);
    return K * Math.exp(-r*T) * _normalCDF(-d2) - S * _normalCDF(-d1);
  }
  function _bsDelta(S, K, T, r, sigma, isCall) {
    if (T <= 0) T = 1/365;
    var d1 = _bsD1(S, K, T, r, sigma);
    return isCall ? _normalCDF(d1) : _normalCDF(d1) - 1;
  }
  function _bsGamma(S, K, T, r, sigma) {
    if (T <= 0) T = 1/365;
    var d1 = _bsD1(S, K, T, r, sigma);
    return Math.exp(-d1*d1/2) / (Math.sqrt(2*Math.PI) * S * sigma * Math.sqrt(T));
  }
  function _bsTheta(S, K, T, r, sigma, isCall) {
    if (T <= 0) T = 1/365;
    var d1 = _bsD1(S, K, T, r, sigma);
    var d2 = d1 - sigma * Math.sqrt(T);
    var pdf = Math.exp(-d1*d1/2) / Math.sqrt(2*Math.PI);
    var common = -(S * pdf * sigma) / (2 * Math.sqrt(T));
    if (isCall) return (common - r * K * Math.exp(-r*T) * _normalCDF(d2)) / 365;
    return (common + r * K * Math.exp(-r*T) * _normalCDF(-d2)) / 365;
  }
  function _bsVega(S, K, T, r, sigma) {
    if (T <= 0) T = 1/365;
    var d1 = _bsD1(S, K, T, r, sigma);
    return S * Math.sqrt(T) * Math.exp(-d1*d1/2) / Math.sqrt(2*Math.PI) / 100;
  }

  function computeTradeParams(suggestion, data) {
    if (!suggestion || !data) return null;
    var spot = data.spotPrice || 0;
    if (spot <= 0) return null;
    var strike = suggestion.strike;
    var type = suggestion.type;
    var isCall = type === 'CALL';
    var expiry = suggestion.expiry;

    // Compute DTE
    var dte = 1;
    if (expiry) {
      var exp = new Date(expiry + 'T16:00:00');
      var now = new Date();
      dte = Math.max(1, Math.ceil((exp - now) / 86400000));
    }
    var T = dte / 365;

    // IV: use targets API expectedMove avgIV, or fallback 0.20
    var ivPct = 0.20;
    if (state.targetData && state.targetData.expectedMove && state.targetData.expectedMove.avgIV) {
      ivPct = state.targetData.expectedMove.avgIV / 100;
    }
    var r = 0.045; // risk-free rate approximation

    // Estimate option price and Greeks via Black-Scholes
    var entry = _bsPrice(spot, strike, T, r, ivPct, isCall);
    if (!entry || entry <= 0.01) return null;
    entry = Math.round(entry * 100) / 100;

    var delta = Math.abs(_bsDelta(spot, strike, T, r, ivPct, isCall));
    var gamma = _bsGamma(spot, strike, T, r, ivPct);
    var theta = _bsTheta(spot, strike, T, r, ivPct, isCall);
    var vega = _bsVega(spot, strike, T, r, ivPct);
    var iv = ivPct;

    // Stop: 40% premium loss (keep 60%)
    var stopPremium = Math.round(entry * 0.6 * 100) / 100;
    var stopUnderlying = null;
    if (delta > 0.01) {
      var premiumDiff = entry - stopPremium;
      var underlyingMove = premiumDiff / delta;
      stopUnderlying = isCall ? spot - underlyingMove : spot + underlyingMove;
    }

    // Target: next wall in trade direction
    var targetUnderlying = null;
    var targetPremium = null;
    if (isCall) {
      if (data.callWall && data.callWall.strike > spot) targetUnderlying = data.callWall.strike;
    } else {
      if (data.putWall && data.putWall.strike < spot) targetUnderlying = data.putWall.strike;
    }
    if (targetUnderlying !== null) {
      // Re-price option at target underlying
      targetPremium = _bsPrice(targetUnderlying, strike, Math.max(T - 1/365, 1/365), r, ivPct, isCall);
      targetPremium = Math.round(targetPremium * 100) / 100;
    }

    // R:R
    var rr = null;
    if (targetPremium && targetPremium > entry) {
      var reward = targetPremium - entry;
      var risk = entry - stopPremium;
      rr = risk > 0 ? Math.round((reward / risk) * 10) / 10 : null;
    }

    return {
      strike: strike, type: type, direction: suggestion.direction,
      expiry: expiry, dte: dte, entry: entry,
      stopPremium: stopPremium, stopUnderlying: stopUnderlying,
      targetPremium: targetPremium, targetUnderlying: targetUnderlying,
      rr: rr, delta: delta, gamma: gamma, theta: theta, iv: iv, vega: vega,
      confidence: suggestion.confidence || 0, grade: suggestion.grade || '',
      reasoning: suggestion.reasoning || '', conviction: suggestion.conviction || 0,
      aiScored: suggestion.aiScored || false
    };
  }

  function renderHeroPick(params) {
    var el = document.getElementById('tradeDeskHero');
    if (!el || !params) { if (el) el.innerHTML = ''; return; }
    var isCall = params.type === 'CALL';
    el.className = 'hero-pick ' + (isCall ? 'call-pick' : 'put-pick');
    var gradeClass = 'grade-c';
    if (params.grade && params.grade.startsWith('A')) gradeClass = 'grade-a';
    else if (params.grade === 'B') gradeClass = 'grade-b';
    var expiryLabel = params.expiry || 'N/A';
    var dteLabel = params.dte ? '(' + params.dte + 'DTE)' : '';
    var fp = function(v) { return v != null ? '$' + v.toFixed(2) : 'N/A'; };
    var rrLabel = params.rr != null ? params.rr.toFixed(1) + ':1' : 'N/A';

    el.innerHTML =
      '<div class="hero-direction ' + (isCall ? 'call' : 'put') + '">BUY ' + (state.ticker || 'SPY') + ' $' + params.strike + ' ' + params.type + '</div>' +
      '<div class="hero-expiry">' + expiryLabel + ' ' + dteLabel + '</div>' +
      '<div class="hero-metrics">' +
        '<div class="hero-metric"><div class="hero-metric-label">Entry</div><div class="hero-metric-value">' + fp(params.entry) + '</div></div>' +
        '<div class="hero-metric"><div class="hero-metric-label">Stop</div><div class="hero-metric-value">' + fp(params.stopPremium) + '</div></div>' +
        '<div class="hero-metric"><div class="hero-metric-label">Target</div><div class="hero-metric-value">' + fp(params.targetPremium) + '</div></div>' +
        '<div class="hero-metric"><div class="hero-metric-label">R:R</div><div class="hero-metric-value">' + rrLabel + '</div></div>' +
      '</div>' +
      '<div class="hero-confidence">' +
        (params.grade ? '<span class="hero-conf-badge ' + gradeClass + '">' + params.grade + '</span>' : '') +
        '<span class="hero-conf-pct">' + params.confidence + '% confidence</span>' +
      '</div>' +
      (params.reasoning ? '<div class="hero-reasoning">"' + params.reasoning + '"</div>' : '') +
      '<div class="hero-actions">' +
        '<button class="hero-btn hero-btn-customize" id="tradeDeskCustomizeBtn">Customize</button>' +
        '<button class="hero-btn hero-btn-alts" id="tradeDeskAltsBtn">Show Alternatives</button>' +
      '</div>';
  }

  function renderAlternatives(allParams) {
    var el = document.getElementById('tradeDeskAlts');
    if (!el) return;
    var alts = allParams.slice(1, 4);
    if (alts.length === 0) { el.innerHTML = ''; return; }
    var html = '';
    alts.forEach(function(p, idx) {
      var isCall = p.type === 'CALL';
      var fp = function(v) { return v != null ? '$' + v.toFixed(2) : 'N/A'; };
      html +=
        '<div class="alt-pick" data-alt-idx="' + (idx + 1) + '">' +
          '<div class="alt-direction ' + (isCall ? 'call' : 'put') + '">' + (state.ticker || 'SPY') + ' $' + p.strike + ' ' + p.type + '</div>' +
          '<div class="alt-meta">' +
            '<span>Entry ' + fp(p.entry) + '</span>' +
            '<span>R:R ' + (p.rr != null ? p.rr.toFixed(1) + ':1' : 'N/A') + '</span>' +
            '<span>' + p.confidence + '%</span>' +
            (p.grade ? '<span>' + p.grade + '</span>' : '') +
          '</div>' +
          '<div class="alt-actions">' +
            '<button class="alt-swap-btn" data-alt-idx="' + (idx + 1) + '">Use This</button>' +
            '<button class="alt-swap-btn hero-btn-customize" data-builder-idx="' + (idx + 1) + '">Customize</button>' +
          '</div>' +
        '</div>';
    });
    el.innerHTML = html;
  }

  function renderTradeBuilder(params) {
    var el = document.getElementById('tradeDeskBuilder');
    if (!el || !params) return;
    var isCall = params.type === 'CALL';
    var spot = (state.data && state.data.spotPrice) || 0;

    var strikePills = '';
    var strikeRange = [];
    if (state.data && state.data.profile) {
      state.data.profile.forEach(function(p) { strikeRange.push(p.strike); });
    }
    var centerIdx = strikeRange.indexOf(params.strike);
    if (centerIdx === -1) centerIdx = Math.floor(strikeRange.length / 2);
    var nearStrikes = strikeRange.slice(Math.max(0, centerIdx - 10), centerIdx + 11);
    nearStrikes.forEach(function(s) {
      var cls = s === params.strike ? (isCall ? ' active-call' : ' active-put') : '';
      strikePills += '<button class="builder-pill' + cls + '" data-builder-strike="' + s + '">$' + s + '</button>';
    });

    var accountSize = 10000, riskPct = 2;
    try {
      var saved = localStorage.getItem('sq_account_size');
      if (saved) accountSize = parseFloat(saved) || 10000;
      var savedRisk = localStorage.getItem('sq_risk_pct');
      if (savedRisk) riskPct = parseFloat(savedRisk) || 2;
    } catch(e) {}

    var maxLoss = accountSize * (riskPct / 100);
    var contractCount = params.entry > 0 ? Math.max(1, Math.floor(maxLoss / (params.entry * 100))) : 1;
    var totalCost = params.entry * 100 * contractCount;

    var pnlTarget = params.targetPremium ? ((params.targetPremium - params.entry) * 100 * contractCount) : null;
    var pnlStop = params.stopPremium ? ((params.stopPremium - params.entry) * 100 * contractCount) : null;
    var pnlExpiry = null;
    if (spot > 0 && params.strike > 0) {
      var intrinsic = isCall ? Math.max(0, spot - params.strike) : Math.max(0, params.strike - spot);
      pnlExpiry = (intrinsic - params.entry) * 100 * contractCount;
    }

    var fmtPnl = function(v) {
      if (v == null) return '<span class="pnl-neutral">N/A</span>';
      var sign = v >= 0 ? '+' : '';
      var cls = v >= 0 ? 'pnl-pos' : 'pnl-neg';
      return '<span class="' + cls + '">' + sign + '$' + v.toFixed(0) + '</span>';
    };

    el.innerHTML =
      '<div class="builder-section">' +
        '<div class="builder-label">Direction</div>' +
        '<div class="builder-pills">' +
          '<button class="builder-pill' + (isCall ? ' active-call' : '') + '" data-builder-dir="CALL">CALL</button>' +
          '<button class="builder-pill' + (!isCall ? ' active-put' : '') + '" data-builder-dir="PUT">PUT</button>' +
        '</div>' +
      '</div>' +
      '<div class="builder-section">' +
        '<div class="builder-label">Strike</div>' +
        '<div class="builder-strikes builder-pills">' + strikePills + '</div>' +
      '</div>' +
      '<div class="builder-section">' +
        '<div class="builder-label">Greeks</div>' +
        '<div class="builder-greeks">' +
          '<div class="builder-greek"><div class="builder-greek-label">Delta</div><div class="builder-greek-val">' + (params.delta ? params.delta.toFixed(3) : 'N/A') + '</div></div>' +
          '<div class="builder-greek"><div class="builder-greek-label">Gamma</div><div class="builder-greek-val">' + (params.gamma ? params.gamma.toFixed(4) : 'N/A') + '</div></div>' +
          '<div class="builder-greek"><div class="builder-greek-label">Theta</div><div class="builder-greek-val">' + (params.theta ? params.theta.toFixed(3) : 'N/A') + '</div></div>' +
          '<div class="builder-greek"><div class="builder-greek-label">IV</div><div class="builder-greek-val">' + (params.iv ? (params.iv * 100).toFixed(1) + '%' : 'N/A') + '</div></div>' +
          '<div class="builder-greek"><div class="builder-greek-label">Vega</div><div class="builder-greek-val">' + (params.vega ? params.vega.toFixed(3) : 'N/A') + '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="builder-section">' +
        '<div class="builder-label">Position Sizing</div>' +
        '<div class="builder-risk">' +
          '<div class="builder-input-group"><span class="builder-input-label">Account Size</span><input class="builder-input" type="number" id="builderAcctSize" value="' + accountSize + '"></div>' +
          '<div class="builder-input-group"><span class="builder-input-label">Risk %</span><input class="builder-input" type="number" id="builderRiskPct" value="' + riskPct + '" step="0.5" min="0.5" max="10"></div>' +
          '<div class="builder-input-group"><span class="builder-input-label">Max Loss</span><div class="builder-input" style="background:none;border-color:transparent;cursor:default">$' + maxLoss.toFixed(0) + '</div></div>' +
          '<div class="builder-input-group"><span class="builder-input-label">Contracts</span><div class="builder-input" style="background:none;border-color:transparent;cursor:default">' + contractCount + ' ($' + totalCost.toFixed(0) + ')</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="builder-section">' +
        '<div class="builder-label">P&L Scenarios (' + contractCount + ' contract' + (contractCount > 1 ? 's' : '') + ')</div>' +
        '<div class="builder-pnl">' +
          '<div class="pnl-scenario"><div class="pnl-scenario-label">At Target</div><div class="pnl-scenario-val">' + fmtPnl(pnlTarget) + '</div></div>' +
          '<div class="pnl-scenario"><div class="pnl-scenario-label">At Stop</div><div class="pnl-scenario-val">' + fmtPnl(pnlStop) + '</div></div>' +
          '<div class="pnl-scenario"><div class="pnl-scenario-label">At Expiry (spot)</div><div class="pnl-scenario-val">' + fmtPnl(pnlExpiry) + '</div></div>' +
        '</div>' +
      '</div>';
  }

  function renderTradeDesk() {
    var desk = document.getElementById('tradeDesk');
    if (!desk) return;
    var expandBtn = document.getElementById('gexActionExpandBtn');
    var d = state.data;
    var t = state.targetData;

    try { _tradeDeskCollapsed = localStorage.getItem('sq_trade_desk_collapsed') === '1'; } catch(e) {}

    if (!d || !t || !t.tradeSuggestions || t.tradeSuggestions.length === 0 || _tradeDeskCollapsed) {
      desk.style.display = 'none';
      if (expandBtn && _tradeDeskCollapsed && t && t.tradeSuggestions && t.tradeSuggestions.length > 0) expandBtn.style.display = '';
      return;
    }
    if (expandBtn) expandBtn.style.display = 'none';
    desk.style.display = '';

    _tradeDeskParams = t.tradeSuggestions
      .map(function(s) { return computeTradeParams(s, d); })
      .filter(function(p) { return p !== null; });

    if (_tradeDeskParams.length === 0) { desk.style.display = 'none'; return; }

    _tradeDeskParams.sort(function(a, b) { return b.confidence - a.confidence; });

    renderHeroPick(_tradeDeskParams[0]);
    renderAlternatives(_tradeDeskParams);

    var altsEl = document.getElementById('tradeDeskAlts');
    if (altsEl) {
      if (_tradeDeskAltsOpen) altsEl.classList.add('open');
      else altsEl.classList.remove('open');
    }

    var builderEl = document.getElementById('tradeDeskBuilder');
    if (builderEl) {
      if (_tradeDeskBuilderOpen) {
        builderEl.classList.add('open');
        renderTradeBuilder(_tradeDeskParams[_tradeDeskBuilderIdx] || _tradeDeskParams[0]);
      } else {
        builderEl.classList.remove('open');
      }
    }
  }

  function initTradeDeskEvents() {
    var collapseBtn = document.getElementById('tradeDeskCollapseBtn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function() {
        _tradeDeskCollapsed = true;
        try { localStorage.setItem('sq_trade_desk_collapsed', '1'); } catch(e) {}
        var desk = document.getElementById('tradeDesk');
        if (desk) desk.style.display = 'none';
        var expandBtn = document.getElementById('gexActionExpandBtn');
        if (expandBtn) expandBtn.style.display = '';
      });
    }

    var expandBtn = document.getElementById('gexActionExpandBtn');
    if (expandBtn) {
      expandBtn.addEventListener('click', function() {
        _tradeDeskCollapsed = false;
        try { localStorage.removeItem('sq_trade_desk_collapsed'); } catch(e) {}
        expandBtn.style.display = 'none';
        renderTradeDesk();
      });
    }

    var desk = document.getElementById('tradeDesk');
    if (desk) {
      desk.addEventListener('click', function(e) {
        if (e.target.id === 'tradeDeskAltsBtn') {
          _tradeDeskAltsOpen = !_tradeDeskAltsOpen;
          var altsEl = document.getElementById('tradeDeskAlts');
          if (altsEl) altsEl.classList.toggle('open');
          e.target.textContent = _tradeDeskAltsOpen ? 'Hide Alternatives' : 'Show Alternatives';
          return;
        }
        if (e.target.id === 'tradeDeskCustomizeBtn') {
          _tradeDeskBuilderOpen = !_tradeDeskBuilderOpen;
          _tradeDeskBuilderIdx = 0;
          var builderEl = document.getElementById('tradeDeskBuilder');
          if (builderEl) {
            builderEl.classList.toggle('open');
            if (_tradeDeskBuilderOpen) renderTradeBuilder(_tradeDeskParams[0]);
          }
          return;
        }
        var swapBtn = e.target.closest('.alt-swap-btn:not([data-builder-idx])');
        if (swapBtn && swapBtn.dataset.altIdx) {
          var idx = parseInt(swapBtn.dataset.altIdx, 10);
          if (_tradeDeskParams[idx]) {
            var picked = _tradeDeskParams.splice(idx, 1)[0];
            _tradeDeskParams.unshift(picked);
            renderHeroPick(_tradeDeskParams[0]);
            renderAlternatives(_tradeDeskParams);
            if (_tradeDeskBuilderOpen) {
              _tradeDeskBuilderIdx = 0;
              renderTradeBuilder(_tradeDeskParams[0]);
            }
          }
          return;
        }
        var custBtn = e.target.closest('[data-builder-idx]');
        if (custBtn) {
          var bIdx = parseInt(custBtn.dataset.builderIdx, 10);
          _tradeDeskBuilderIdx = bIdx;
          _tradeDeskBuilderOpen = true;
          var builderEl = document.getElementById('tradeDeskBuilder');
          if (builderEl) {
            builderEl.classList.add('open');
            renderTradeBuilder(_tradeDeskParams[bIdx] || _tradeDeskParams[0]);
          }
          return;
        }
        var dirBtn = e.target.closest('[data-builder-dir]');
        if (dirBtn) {
          var newDir = dirBtn.dataset.builderDir;
          var p = _tradeDeskParams[_tradeDeskBuilderIdx];
          if (p && state.targetData && state.targetData.tradeSuggestions[_tradeDeskBuilderIdx]) {
            var orig = Object.assign({}, state.targetData.tradeSuggestions[_tradeDeskBuilderIdx], { type: newDir, direction: newDir === 'CALL' ? 'bullish' : 'bearish' });
            var newParams = computeTradeParams(orig, state.data);
            if (newParams) {
              _tradeDeskParams[_tradeDeskBuilderIdx] = newParams;
              renderTradeBuilder(newParams);
            }
          }
          return;
        }
        var strikeBtn = e.target.closest('[data-builder-strike]');
        if (strikeBtn) {
          var newStrike = parseFloat(strikeBtn.dataset.builderStrike);
          var p = _tradeDeskParams[_tradeDeskBuilderIdx];
          if (p && state.targetData) {
            var orig = Object.assign({}, state.targetData.tradeSuggestions[_tradeDeskBuilderIdx] || {}, { strike: newStrike, type: p.type, direction: p.direction });
            var newParams = computeTradeParams(orig, state.data);
            if (newParams) {
              _tradeDeskParams[_tradeDeskBuilderIdx] = newParams;
              renderTradeBuilder(newParams);
            }
          }
          return;
        }
      });

      desk.addEventListener('input', function(e) {
        if (e.target.id === 'builderAcctSize') {
          var val = parseFloat(e.target.value) || 10000;
          try { localStorage.setItem('sq_account_size', val.toString()); } catch(ex) {}
          renderTradeBuilder(_tradeDeskParams[_tradeDeskBuilderIdx] || _tradeDeskParams[0]);
        }
        if (e.target.id === 'builderRiskPct') {
          var val = parseFloat(e.target.value) || 2;
          try { localStorage.setItem('sq_risk_pct', val.toString()); } catch(ex) {}
          renderTradeBuilder(_tradeDeskParams[_tradeDeskBuilderIdx] || _tradeDeskParams[0]);
        }
      });
    }
  }

  function updateRegimeBadge() {
    var el = document.getElementById('gexRegimeBadge');
    if (!el) return;
    var t = state.targetData;
    if (!t || !t.regime) { el.innerHTML = ''; el.style.background = ''; return; }
    var color = t.regime.label === 'Long Gamma' ? 'var(--green)' : t.regime.label === 'Short Gamma' ? 'var(--red)' : 'var(--yellow)';
    el.style.background = t.regime.label === 'Long Gamma' ? 'var(--accent-subtle)' : t.regime.label === 'Short Gamma' ? 'rgba(239,68,68,0.12)' : 'var(--warn-dim)';
    el.style.color = color;
    el.textContent = t.regime.label + ' ' + Math.round(t.regime.confidence * 100) + '%';
  }

  function applyRegimeState() {
    var page = document.getElementById('page-gex');
    var bar = document.getElementById('gexRegimeBar');
    var label = document.getElementById('gexRegimeLabel');
    var sub = document.getElementById('gexRegimeSub');
    if (!page || !bar) return;
    var d = state.data;
    if (!d || !d.imbalance) { label.textContent = 'Awaiting data...'; sub.textContent = ''; bar.className = 'regime-bar regime-stable'; return; }

    var dy = state.dynamics;
    var imb = d.imbalance;
    var hp = d.hedgePressure?.pressure || { label: 'LOW', score: 0 };

    var regimeKey = 'STABLE';
    var flipDist = 999, belowRatio = 0, pressScore = hp.score || 0;
    if (d.gammaFlip && d.spotPrice && d.spotPrice > 0) flipDist = Math.abs(d.spotPrice - d.gammaFlip) / d.spotPrice;
    if (imb.aboveGEX != null && imb.belowGEX != null) {
      var aAbs = Math.abs(imb.aboveGEX), bAbs = Math.abs(imb.belowGEX);
      belowRatio = (aAbs + bAbs) > 0 ? bAbs / (aAbs + bAbs) : 0;
    }

    var velNorm = dy ? Math.abs(dy.deltaGEX_norm_15m || 0) : 0;
    if (velNorm > REGIME_THRESHOLDS.velSpike && flipDist < REGIME_THRESHOLDS.flipNearPct) regimeKey = 'EXPANSION';
    else if (velNorm > REGIME_THRESHOLDS.velSpike || (pressScore >= REGIME_THRESHOLDS.pressureHigh && flipDist < REGIME_THRESHOLDS.flipFarPct)) regimeKey = 'ACCELERATION';
    else if (flipDist < REGIME_THRESHOLDS.flipNearPct || (belowRatio > REGIME_THRESHOLDS.belowRatio && pressScore >= REGIME_THRESHOLDS.pressureMod)) regimeKey = 'FRAGILE';
    else if (pressScore >= REGIME_THRESHOLDS.pressureMod || (velNorm > REGIME_THRESHOLDS.velQuiet)) regimeKey = 'BUILDING';

    var regLabels = { STABLE: 'STABLE RANGE', BUILDING: 'BUILDING', FRAGILE: 'FRAGILE', ACCELERATION: 'ACCELERATION', EXPANSION: 'EXPANSION' };
    var subTexts = { STABLE: 'Dealers absorb. Fade extremes.', BUILDING: 'Pressure accumulating. Watch edges.', FRAGILE: 'Support weakening. Protect downside.', ACCELERATION: 'Momentum expanding. Trade with trend.', EXPANSION: 'Dealers chasing. Extended move.' };

    bar.style.display = '';
    bar.className = 'regime-bar regime-' + regimeKey.toLowerCase();
    if (label) label.textContent = 'STATE: ' + regLabels[regimeKey];
    if (sub) sub.textContent = subTexts[regimeKey];

    // Soul class on page container
    page.className = page.className.replace(/soul-\\w+/g, '').trim() + ' soul-' + regimeKey.toLowerCase();

    renderRegimeAction(regimeKey);
    applyMetricEmphasis(regimeKey);
  }

  function renderRegimeAction(regimeKey) {
    var panel = document.getElementById('gexRegimeAction');
    if (!panel) return;
    var a = REGIME_ACTIONS[regimeKey];
    if (!a) { panel.style.display = 'none'; return; }
    panel.style.display = '';
    panel.innerHTML =
      '<div class="ra-item"><div class="ra-label">Expect</div><div class="ra-val">' + a.expect + '</div></div>' +
      '<div class="ra-item"><div class="ra-label">Trade</div><div class="ra-val">' + a.trade + '</div></div>' +
      '<div class="ra-item"><div class="ra-label">Avoid</div><div class="ra-val ra-avoid">' + a.avoid + '</div></div>' +
      '<div class="ra-item"><div class="ra-label">Risk</div><div class="ra-val">' + a.risk + '</div></div>' +
      '<div class="ra-item"><div class="ra-label">Sizing</div><div class="ra-val">' + a.sizing + '</div></div>';
  }

  function applyMetricEmphasis(regime) {
    var card = document.getElementById('gexVerdictCard');
    if (!card) return;
    card.querySelectorAll('.metric-hot,.metric-warm,.metric-cool').forEach(function(el) {
      el.classList.remove('metric-hot', 'metric-warm', 'metric-cool');
    });
  }

  function updateVerdictCard() {
    var card = document.getElementById('gexVerdictCard');
    if (!card) return;
    var d = state.data;
    if (!d || !d.imbalance) { card.style.display = 'none'; return; }
    var imb = d.imbalance;
    card.style.display = '';
    applyRegimeState();

    var m = MODE_MAP[imb.imbalanceType] || MODE_MAP.UNKNOWN;

    var modeEl = document.getElementById('gexVerdictMode');
    if (modeEl) { modeEl.textContent = m.mode; modeEl.style.color = m.color; }

    var pillsEl = document.getElementById('gexVerdictPills');
    if (pillsEl) {
      var hp = d.hedgePressure?.pressure || { label: 'LOW', score: 0 };
      var pClass = hp.label === 'HIGH' ? 'pill-high' : hp.label === 'BUILDING' ? 'pill-building' : 'pill-low';
      var dynState = state.dynamics?.structureState || 'NEUTRAL';
      var sClass = dynState === 'FRAGILIZING' ? 'pill-fragilizing' : dynState === 'STABILIZING' ? 'pill-stabilizing' : 'pill-neutral';
      pillsEl.innerHTML = '<span class="verdict-pill ' + pClass + '">Pressure: ' + hp.label + '</span>'
        + '<span class="verdict-pill ' + sClass + '">Structure: ' + dynState + '</span>';
    }

    var actionEl = document.getElementById('gexVerdictAction');
    if (actionEl) actionEl.textContent = m.action;

    var levelsEl = document.getElementById('gexVerdictLevels');
    if (levelsEl && imb.levels) {
      var html = '';
      if (imb.levels.supportLevels && imb.levels.supportLevels[0] != null) html += '<span class="imb-level-chip support">Support $' + imb.levels.supportLevels[0] + '</span>';
      if (imb.levels.resistanceLevels && imb.levels.resistanceLevels[0] != null) html += '<span class="imb-level-chip resistance">Resistance $' + imb.levels.resistanceLevels[0] + '</span>';
      if (imb.levels.magnetLevel != null) html += '<span class="imb-level-chip magnet">Magnet $' + imb.levels.magnetLevel + '</span>';
      levelsEl.innerHTML = html;
    }

    var invEl = document.getElementById('gexVerdictInvalidation');
    if (invEl) {
      if (m.invalidation === 'support' && imb.levels?.supportLevels?.[0]) {
        invEl.textContent = 'Invalidation: lose and hold below $' + imb.levels.supportLevels[0] + '.';
      } else if (m.invalidation === 'resistance' && imb.levels?.resistanceLevels?.[0]) {
        invEl.textContent = 'Invalidation: reclaim and hold above $' + imb.levels.resistanceLevels[0] + '.';
      } else if (m.invalidation === 'break and hold outside the box') {
        invEl.textContent = 'Invalidation: break and hold outside the box.';
      } else if (m.invalidation === null) {
        invEl.textContent = 'Invalidation: none \\u2014 wait for break + retest.';
      } else {
        invEl.textContent = '';
      }
    }

    var pressureEl = document.getElementById('gexVerdictPressure');
    if (pressureEl && d.hedgePressure) {
      var hp2 = d.hedgePressure.pressure || { score: 0, label: 'LOW' };
      var flipDist = (d.gammaFlip && d.spotPrice) ? '$' + Math.abs(d.spotPrice - d.gammaFlip).toFixed(2) : 'N/A';
      var belowImb = imb.belowGEX != null ? fmtGEXShort(imb.belowGEX) : 'N/A';
      pressureEl.innerHTML = 'Pressure: <b>' + hp2.label + '</b> (' + hp2.score + ')'
        + ' &middot; Dist to flip: <b>' + flipDist + '</b>'
        + ' &middot; Below: <b>' + belowImb + '</b>';
    }

    var advTypeEl = document.getElementById('gexAdvType');
    if (advTypeEl) {
      var typeLabel = STRUCT_TYPE_MAP[imb.imbalanceType] || 'Unknown';
      advTypeEl.textContent = typeLabel + ' (Confidence: ' + imb.confidence + ')';
      advTypeEl.style.color = m.color;
    }

    var aboveEl = document.getElementById('gexImbAbove');
    var belowEl = document.getElementById('gexImbBelow');
    if (aboveEl) { aboveEl.textContent = fmtGEXShort(imb.aboveGEX); aboveEl.style.color = imb.aboveGEX >= 0 ? 'var(--green)' : 'var(--red)'; }
    if (belowEl) { belowEl.textContent = fmtGEXShort(imb.belowGEX); belowEl.style.color = imb.belowGEX >= 0 ? 'var(--green)' : 'var(--red)'; }

    var advEl = document.getElementById('gexAdvDetails');
    if (advEl && d) {
      var items = [];
      if (d.gammaFlip) items.push('<span class="verdict-adv-item">Gamma Flip: $' + d.gammaFlip + '</span>');
      if (d.totalNetGEX != null) {
        var shortPct = d.totalNetGEX < 0 ? 100 : Math.round(Math.abs(Math.min(0, d.totalNetGEX)) / (Math.abs(d.totalCallGEX || 0) + Math.abs(d.totalPutGEX || 0) + 1) * 100);
        items.push('<span class="verdict-adv-item">Short Gamma: ' + shortPct + '%</span>');
      }
      items.push('<span class="verdict-adv-item">Net GEX: ' + fmtGEXShort(d.totalNetGEX || 0) + '</span>');
      advEl.innerHTML = items.join('');
    }

    var wallsEl = document.getElementById('gexAdvWalls');
    if (wallsEl && d) {
      var wh = '';
      if (d.callWall) wh += '<span style="color:var(--green)">Call Wall: $' + d.callWall.strike + ' (' + fmtGEXShort(d.callWall.gex) + ')</span>';
      if (d.putWall) wh += '<span style="color:var(--red);margin-left:12px">Put Wall: $' + d.putWall.strike + ' (' + fmtGEXShort(d.putWall.gex) + ')</span>';
      wallsEl.innerHTML = wh;
    }

    var reasonsEl = document.getElementById('gexImbReasons');
    if (reasonsEl && imb.reasons) {
      reasonsEl.innerHTML = imb.reasons.map(function(r) { return '<span class="imb-reason">' + r + '</span>'; }).join('');
    }

    if (state.ticker) fetchDynamics(state.ticker);
  }

  function fetchDynamics(ticker) {
    fetch('/api/gex/dynamics/' + encodeURIComponent(ticker))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) return;
        state.dynamics = data.dynamics;
        state.dynamicsChart = data.chartSeries;
        renderTimingPanel();
        applyRegimeState();
        var pillsEl = document.getElementById('gexVerdictPills');
        if (pillsEl && state.dynamics) {
          var hp = { label: state.dynamics.pressureLabel, score: state.dynamics.pressureScore };
          var pClass = hp.label === 'HIGH' ? 'pill-high' : hp.label === 'BUILDING' ? 'pill-building' : 'pill-low';
          var dynState = state.dynamics.structureState;
          var sClass = dynState === 'FRAGILIZING' ? 'pill-fragilizing' : dynState === 'STABILIZING' ? 'pill-stabilizing' : 'pill-neutral';
          pillsEl.innerHTML = '<span class="verdict-pill ' + pClass + '">Pressure: ' + hp.label + '</span>'
            + '<span class="verdict-pill ' + sClass + '">Structure: ' + dynState + '</span>';
        }
      })
      .catch(function() {});
  }

  function renderTimingPanel() {
    var grid = document.getElementById('gexTimingGrid');
    if (!grid || !state.dynamics) return;
    var dy = state.dynamics;
    var arrow = function(v) { return v > 0 ? '<span class="arrow-up">\\u2191</span>' : v < 0 ? '<span class="arrow-down">\\u2193</span>' : ''; };
    var items = [];
    items.push('<div class="timing-item">Flip Drift 5m: <b>' + (dy.flipDrift_5m >= 0 ? '+' : '') + dy.flipDrift_5m.toFixed(2) + '</b> ' + arrow(dy.flipDrift_5m) + '</div>');
    items.push('<div class="timing-item">Flip Drift 15m: <b>' + (dy.flipDrift_15m >= 0 ? '+' : '') + dy.flipDrift_15m.toFixed(2) + '</b> ' + arrow(dy.flipDrift_15m) + '</div>');
    items.push('<div class="timing-item">GEX Velocity 15m: <b>' + fmtGEXShort(dy.gexVelocity_15m) + '</b> ' + arrow(dy.gexVelocity_15m) + '</div>');
    items.push('<div class="timing-item">Pressure: <b>' + dy.pressureScore + '</b> (' + dy.pressureLabel + ')</div>');
    var trendColor = dy.pressureTrend_5m === 'RISING' ? 'var(--red)' : dy.pressureTrend_5m === 'FALLING' ? 'var(--green)' : 'var(--text-muted)';
    items.push('<div class="timing-item">Trend: <b style="color:' + trendColor + '">' + dy.pressureTrend_5m + '</b></div>');
    var structColor = dy.structureState === 'FRAGILIZING' ? 'var(--red)' : dy.structureState === 'STABILIZING' ? 'var(--green)' : 'var(--text-muted)';
    items.push('<div class="timing-item">Structure: <b style="color:' + structColor + '">' + dy.structureState + '</b> (' + dy.structureScore + ')</div>');
    if (dy.expansionRisk) {
      items.push('<div class="timing-item"><span class="expansion-badge" title="' + (dy.expansionReason || '').replace(/"/g, '&quot;') + '">\\u26A1 Expansion Risk</span></div>');
    }
    grid.innerHTML = items.join('');
    renderTimingCharts();
  }

  function renderTimingCharts() {
    if (!state.dynamicsChart || state.dynamicsChart.length < 2) return;
    var series = state.dynamicsChart;

    var c1 = document.getElementById('gexTimingChart1');
    if (c1 && typeof Chart !== 'undefined') {
      if (_timingCharts.chart1) _timingCharts.chart1.destroy();
      var labels = series.map(function(s) { return new Date(s.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); });
      _timingCharts.chart1 = new Chart(c1.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            { label: 'Spot', data: series.map(function(s) { return s.spot; }), borderColor: '#3B82F6', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3 },
            { label: 'Flip', data: series.map(function(s) { return s.gammaFlip; }), borderColor: '#eab308', borderWidth: 1.5, pointRadius: 0, fill: false, borderDash: [4, 2], tension: 0.3 },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#888', font: { size: 8 } } } }, scales: { x: { display: false }, y: { ticks: { color: '#666', font: { size: 8 } }, grid: { color: 'var(--border-subtle)' } } } },
      });
    }

    var c2 = document.getElementById('gexTimingChart2');
    if (c2 && typeof Chart !== 'undefined') {
      if (_timingCharts.chart2) _timingCharts.chart2.destroy();
      var labels2 = series.map(function(s) { return new Date(s.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); });
      _timingCharts.chart2 = new Chart(c2.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels2,
          datasets: [{
            label: 'Net GEX',
            data: series.map(function(s) { return s.netGEX || 0; }),
            borderColor: function(ctx) { var v = ctx.raw; return v >= 0 ? '#22c55e' : '#ef4444'; },
            segment: { borderColor: function(ctx) { return (ctx.p1.parsed.y || 0) >= 0 ? '#22c55e' : '#ef4444'; } },
            borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3,
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#888', font: { size: 8 } } } }, scales: { x: { display: false }, y: { ticks: { color: '#666', font: { size: 8 } }, grid: { color: 'var(--border-subtle)' } } } },
      });
    }
  }

  // ── Socket.IO event handlers ──
  function handleGexUpdate(data) {
    if (!data || data.error) return;
    var oldDates = state.selectedExps.map(function(i) { return state.data && state.data.expirations[i] ? state.data.expirations[i].date : null; }).filter(Boolean);
    state.data = data;
    state.allExps = data.expirations.map(function(_, i) { return i; });
    if (oldDates.length > 0) state.selectedExps = data.expirations.map(function(e, i) { return oldDates.indexOf(e.date) >= 0 ? i : -1; }).filter(function(i) { return i >= 0; });
    if (state.selectedExps.length === 0) state.selectedExps = state.allExps.slice();
    renderExpChips(); renderAll(); updateSpotBadge(); updateFooter();
  }


  // ── Init / Destroy ──
  function init() {
    // Cache DOM refs
    $.tickerInput = document.getElementById('gexTickerInput');
    $.tickerDropdown = document.getElementById('gexTickerDropdown');
    $.loadBtn = document.getElementById('gexLoadBtn');
    $.loadingIndicator = document.getElementById('gexLoadingIndicator');

    // Initialize interactive filter toolbar
    _initFilterToolbar();

    // Initialize replay controls
    _initReplayControls();

    // Dealer Positioning Engine collapse toggle
    var dealerToggle = document.getElementById('gexDealerEngineToggle');
    var dealerBody = document.getElementById('gexDealerEngineBody');
    if (dealerToggle && dealerBody) {
      dealerToggle.addEventListener('click', function() {
        var open = dealerBody.style.display !== 'none';
        dealerBody.style.display = open ? 'none' : 'block';
        dealerToggle.setAttribute('aria-expanded', !open);
      });
    }

    // Event listeners
    if ($.tickerInput) {
      $.tickerInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { $.tickerDropdown.classList.remove('show'); loadTicker(); } });
      $.tickerInput.addEventListener('input', showTickerDropdown);
      $.tickerInput.addEventListener('focus', showTickerDropdown);
    }

    // Ticker dropdown delegation
    if ($.tickerDropdown) {
      $.tickerDropdown.addEventListener('mousedown', function(e) {
        var opt = e.target.closest('.ticker-option');
        if (opt) selectTicker(opt.dataset.sym);
      });
    }

    if ($.loadBtn) $.loadBtn.addEventListener('click', loadTicker);

    // Close dropdown on outside click
    _docClickHandler = function(e) {
      if (!e.target.closest('#gexTickerDropdown') && !e.target.closest('#gexTickerInput')) {
        if ($.tickerDropdown) $.tickerDropdown.classList.remove('show');
      }
    };
    document.addEventListener('click', _docClickHandler);

    // Range slider
    var rangeSlider = document.getElementById('gexRangeSlider');
    if (rangeSlider) {
      rangeSlider.addEventListener('input', function() { updateRange(this.value); });
      rangeSlider.addEventListener('change', function() { loadTicker(); });
    }

    // Interval buttons (delegation on page)
    var page = document.getElementById('page-gex');
    if (page) {
      page.addEventListener('click', function(e) {
        var target = e.target;
        // Interval buttons
        // Tab buttons
        if (target.classList.contains('tab') && target.dataset.tab) { setTab(target.dataset.tab); return; }
        // Heatmap view toggle (Treemap / Grid)
        if (target.classList.contains('heatmap-view-btn') && target.dataset.view) {
          state.heatmapView = target.dataset.view;
          document.querySelectorAll('#page-gex .heatmap-view-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.view === state.heatmapView); });
          heatmap.hoverCell = null; heatmap.hoverTreemapIdx = -1; hideTip();
          drawHeatmap();
          return;
        }
        // Pop-out heatmap
        if (target.closest('#gexPopoutBtn')) {
          openPopout();
          return;
        }
        // Greeks buttons
        if (target.classList.contains('greeks-btn') && target.dataset.greek) { setGreek(target.dataset.greek); return; }
        // Expiration chips
        if (target.closest('.exp-chip')) {
          var chip = target.closest('.exp-chip');
          if (chip.dataset.action === 'toggleAll') toggleAllExps();
          else if (chip.dataset.action === 'toggle0DTE') toggle0DTE();
          else if (chip.dataset.action === 'toggleExp') toggleExp(parseInt(chip.dataset.idx));
          return;
        }
        // Scan filter pills
        if (target.classList.contains('scan-filter') && target.dataset.filter) {
          state.scanFilter = target.dataset.filter;
          document.querySelectorAll('#page-gex .scan-filter').forEach(function(b) { b.classList.toggle('active', b.dataset.filter === state.scanFilter); });
          renderScan();
          return;
        }
        // Advanced toggle
        if (target.id === 'gexAdvToggle') {
          var adv = document.getElementById('gexVerdictAdvanced');
          if (adv) { var show = adv.style.display === 'none'; adv.style.display = show ? '' : 'none'; target.classList.toggle('active', show); }
          return;
        }
        // Timing toggle
        if (target.id === 'gexTimingToggle') {
          var timing = document.getElementById('gexVerdictTiming');
          if (timing) {
            var show = timing.style.display === 'none';
            timing.style.display = show ? '' : 'none';
            target.classList.toggle('active', show);
            if (show && state.ticker) fetchDynamics(state.ticker);
          }
          return;
        }
        // Scan ticker click
        if (target.classList.contains('scan-ticker') && target.dataset.ticker) {
          $.tickerInput.value = target.dataset.ticker;
          loadTicker();
          setTab('heatmap');
          return;
        }
      });
    }

    // Scan button
    var scanBtn = document.getElementById('gexScanBtn');
    if (scanBtn) scanBtn.addEventListener('click', runScan);

    // Subscribe socket events
    if (SQ.socket) {
      socketHandlers = {
        'gex:update': handleGexUpdate,
        'gex:error': function(err) { console.warn('[GEX WS] Error:', err.error); },
        'gex:spot': function(msg) {
          if (!state.data || msg.ticker !== state.ticker) return;
          state.data.spotPrice = msg.price;
          var badge = document.getElementById('gexSpotBadge');
          if (badge) {
            badge.textContent = state.data.ticker + ' $' + msg.price.toFixed(2);
            badge.classList.remove('flash'); void badge.offsetWidth; badge.classList.add('flash');
          }
        },
      };
      Object.keys(socketHandlers).forEach(function(evt) { SQ.socket.on(evt, socketHandlers[evt]); });

      if (SQ.socket.connected && state.ticker) {
        SQ.socket.emit('subscribe', state.ticker);
      }
      // Re-subscribe after reconnection
      socketHandlers['connect'] = function() {
        if (state.ticker) SQ.socket.emit('subscribe', state.ticker);
      };
      SQ.socket.on('connect', socketHandlers['connect']);
    }

    // Info tip interval
    tipInterval = setInterval(attachTipPopups, 1000);
    attachTipPopups();

    // Auto-init
    var params = new URLSearchParams(window.location.search);
    var qTicker = params.get('ticker');
    var qTab = params.get('view') || params.get('tab');
    if (qTicker) $.tickerInput.value = qTicker.toUpperCase();
    var tabMap = { overview: 'heatmap', heatmap: 'heatmap', profile: 'profile', vanna: 'greeks', charm: 'greeks', maxpain: 'analysis', squeeze: 'analysis', scan: 'scan', skew: 'skew', timeline: 'timeline', surface: 'surface', targets: 'analysis', levels: 'heatmap' };
    if (qTab && tabMap[qTab]) {
      state.tab = tabMap[qTab];
      if (qTab === 'charm') state.activeGreek = 'charm';
    }
    setTab(state.tab);
    initTradeDeskEvents();
    loadTicker();
    fetchMetrics();
    _metricsInterval = setInterval(fetchMetrics, 30000);
  }

  function destroy() {
    // Unsubscribe socket events
    if (SQ.socket) {
      SQ.socket.emit('unsubscribe', state.ticker);
      Object.keys(socketHandlers).forEach(function(evt) { SQ.socket.off(evt, socketHandlers[evt]); });
      socketHandlers = {};
    }

    // Stop SSE
    // Remove document-level event listeners
    if (_docClickHandler) { document.removeEventListener('click', _docClickHandler); _docClickHandler = null; }
    if (state._surfaceMove) { window.removeEventListener('mousemove', state._surfaceMove); window.removeEventListener('mouseup', state._surfaceUp); state.surfaceDragBound = false; }

    // Stop replay if active
    if (state.replayTimer) { clearInterval(state.replayTimer); state.replayTimer = null; }
    if (state.replayEventSource) { state.replayEventSource.close(); state.replayEventSource = null; }
    state.replay = false;

    // Clear intervals
    if (tipInterval) { clearInterval(tipInterval); tipInterval = null; }
    if (_metricsInterval) { clearInterval(_metricsInterval); _metricsInterval = null; }

    // Destroy timing charts
    if (_timingCharts.chart1) { _timingCharts.chart1.destroy(); _timingCharts.chart1 = null; }
    if (_timingCharts.chart2) { _timingCharts.chart2.destroy(); _timingCharts.chart2 = null; }

    // Destroy Chart.js instances
    if (_profileChart) { _profileChart.destroy(); _profileChart = null; }
    if (_vannaChart) { _vannaChart.destroy(); _vannaChart = null; }
    if (_charmChart) { _charmChart.destroy(); _charmChart = null; }
    if (_overviewProfileChart) { _overviewProfileChart.destroy(); _overviewProfileChart = null; }
    if (_maxpainChart) { _maxpainChart.destroy(); _maxpainChart = null; }

    // Disconnect resize observer
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }

    // Close pop-out window
    if (popoutWin && !popoutWin.closed) { popoutWin.close(); }
    popoutWin = null;

    // Reset heatmap
    heatmap.canvas = null; heatmap.ctx = null;
    heatmap.scrollX = 0; heatmap.scrollY = 0; heatmap.hoverCell = null;

    // Reset state
    state.data = null; state.targetData = null; state.squeezeData = null;
    state.scanData = null; state.selectedExps = []; state.allExps = [];
    state.dynamics = null; state.dynamicsChart = null;
    state.ticker = 'SPY'; state.tab = 'heatmap';

    $ = {};
  }

  function fetchMetrics() {
    var ticker = (document.getElementById('gexTickerInput') || {}).value || 'SPY';
    fetch('/api/metrics/' + ticker).then(function(r) { return r.json(); }).then(function(m) {
      if (!m || m.error) return;
      var gexDir = m.gex.ratio > 0.55 ? 'bullish' : m.gex.ratio < 0.45 ? 'bearish' : 'neutral';
      document.getElementById('gexRatioValue').textContent = m.gex.ratio.toFixed(2);
      document.getElementById('gexRatioSub').textContent = m.gex.regime.replace(/_/g, ' ');
      document.getElementById('gexRatioIcon').className = 'metric-card-icon ' + gexDir;

      var netGex = m.gex.netGEX;
      var fmt = Math.abs(netGex) >= 1e6 ? (netGex / 1e6).toFixed(2) + 'M' : Math.abs(netGex) >= 1e3 ? (Math.abs(netGex) / 1e3).toFixed(1) + 'K' : String(Math.round(Math.abs(netGex)));
      document.getElementById('netGexValue').textContent = (netGex >= 0 ? '+' : '-') + fmt;
      document.getElementById('netGexValue').style.color = netGex >= 0 ? 'var(--green)' : 'var(--red)';
      document.getElementById('netGexIcon').className = 'metric-card-icon ' + (netGex > 0 ? 'bullish' : netGex < 0 ? 'bearish' : 'neutral');

      var ivDir = m.iv.ratio > 0.55 ? 'bullish' : m.iv.ratio < 0.45 ? 'bearish' : 'neutral';
      document.getElementById('ivRatioValue').textContent = m.iv.ratio.toFixed(2);
      document.getElementById('ivRatioSub').textContent = 'Net IV: ' + (m.iv.netIV >= 0 ? '+' : '') + m.iv.netIV.toFixed(1) + '%';
      document.getElementById('ivRatioIcon').className = 'metric-card-icon ' + ivDir;

      // ── Convexity Engine cards ──
      if (m.convexity) {
        var l2 = m.convexity.layer2 || {};
        var l3 = m.convexity.layer3 || {};

        var fmtM = function(v) {
          if (v == null) return '\u2014';
          var abs = Math.abs(v);
          if (abs >= 1e9) return (v / 1e9).toFixed(2) + 'B';
          if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M';
          if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K';
          return v.toFixed(1);
        };

        // Velocity
        var vel = l2.gex_velocity || {};
        var v5 = vel.v_5m;
        document.getElementById('cxVelocity5m').textContent = v5 != null ? '$' + fmtM(v5) + '/min' : '\u2014';
        document.getElementById('cxVelocity5m').style.color = v5 > 0 ? 'var(--green)' : v5 < 0 ? 'var(--red)' : '';
        document.getElementById('cxAccel5m').textContent = vel.a_5m != null ? 'Accel: $' + fmtM(vel.a_5m) + '/min\u00B2' : 'Collecting data...';

        // Flip drift
        var fd = l2.flip_drift || {};
        document.getElementById('cxFlipDrift').textContent = fd.flip_v_5m != null ? (fd.flip_v_5m >= 0 ? '+' : '') + fd.flip_v_5m.toFixed(2) + '$/min' : '\u2014';
        document.getElementById('cxFlipCurrent').textContent = fd.flip_current != null ? 'Flip: $' + fd.flip_current.toFixed(0) : '';

        // Density
        var dens = l2.density || {};
        document.getElementById('cxDensity50').textContent = dens.density_50bp != null ? '$' + fmtM(dens.density_50bp) : '\u2014';
        document.getElementById('cxConcentration').textContent = dens.concentration_ratio != null ? 'Concentration: ' + (dens.concentration_ratio * 100).toFixed(1) + '%' : '';

        // Curvature
        var curv = l2.curvature || {};
        document.getElementById('cxCurvature').textContent = curv.curvature != null ? fmtM(curv.curvature) : '\u2014';
        document.getElementById('cxSlope').textContent = curv.slope != null ? 'Slope: ' + fmtM(curv.slope) : '';

        // VEX
        var vx = l3.vex || {};
        document.getElementById('cxVEX').textContent = vx.vex_near_50bp != null ? '$' + fmtM(vx.vex_near_50bp) : '\u2014';

        // Charm
        var ch = l3.charm || {};
        document.getElementById('cxCharm').textContent = ch.cex_near_50bp != null ? '$' + fmtM(ch.cex_near_50bp) + '/min' : '\u2014';
        document.getElementById('cxCharmTime').textContent = ch.minutes_remaining != null ? ch.minutes_remaining + 'min left (wt: ' + (ch.time_weight || 0).toFixed(1) + 'x)' : '';

        // Expected move
        var em = l3.expected_move || {};
        document.getElementById('cxExpMove').textContent = em.sigma_points != null ? '\u00B1$' + em.sigma_points.toFixed(2) : '\u2014';
        document.getElementById('cxExpBands').textContent = em.band_1sigma_lower && em.band_1sigma_upper ? '$' + em.band_1sigma_lower + ' \u2014 $' + em.band_1sigma_upper : '';

        // VRP
        var vr = l3.vrp || {};
        document.getElementById('cxVRP').textContent = vr.vrp_ratio != null ? vr.vrp_ratio.toFixed(2) + 'x' : '\u2014';
        document.getElementById('cxVRPRegime').textContent = vr.regime || '';

        // 0DTE
        var od = l3.odte || {};
        document.getElementById('cxODTE').textContent = od.odte_ratio != null ? (od.odte_ratio * 100).toFixed(1) + '%' : '\u2014';
        document.getElementById('cxODTERegime').textContent = od.regime || '';

        // Danger
        var dg = l3.danger || {};
        document.getElementById('cxDanger').textContent = dg.danger_normalized != null ? (dg.danger_normalized * 100).toFixed(1) + '%' : '\u2014';
        var dgColor = dg.danger_normalized > 0.7 ? 'var(--red)' : dg.danger_normalized > 0.4 ? 'var(--yellow)' : 'var(--green)';
        document.getElementById('cxDanger').style.color = dgColor;
        document.getElementById('cxDangerComponents').textContent = dg.components ? 'Urgency: ' + (dg.components.time_urgency || 0).toFixed(1) + 'x' : '';

        // Wall stability
        var ws = l2.wall_stability || {};
        var wc = ws.call_wall || {};
        document.getElementById('cxWallCall').textContent = wc.stability != null ? (wc.stability * 100).toFixed(0) + '%' : '\u2014';
        document.getElementById('cxWallCallPersist').textContent = wc.strike ? '$' + wc.strike + ' persist: ' + ((wc.persistence || 0) * 100).toFixed(0) + '%' : '';
        var wp = ws.put_wall || {};
        document.getElementById('cxWallPut').textContent = wp.stability != null ? (wp.stability * 100).toFixed(0) + '%' : '\u2014';
        document.getElementById('cxWallPutPersist').textContent = wp.strike ? '$' + wp.strike + ' persist: ' + ((wp.persistence || 0) * 100).toFixed(0) + '%' : '';

        // Layer 4 regime badge
        var l4 = m.convexity.layer4 || {};
        var badge = document.getElementById('cxRegimeBadge');
        if (badge && l4.regime_label) {
          badge.textContent = l4.regime_label.replace(/_/g, ' ');
          var colors = { DANGER_ZONE: 'var(--red)', SHORT_GAMMA: 'var(--red)', SHORT_GAMMA_IV_CHEAP: 'var(--red)', LONG_GAMMA: 'var(--green)', LONG_GAMMA_IV_RICH: 'var(--green)', PINNING: 'var(--yellow)', NEUTRAL: 'var(--text-muted)' };
          badge.style.background = colors[l4.regime_label] || 'var(--yellow)';
          badge.style.color = l4.regime_label === 'NEUTRAL' ? 'var(--text)' : '#000';
        }
        if (badge && l4.strategy_template) {
          badge.title = 'Strategy: ' + l4.strategy_template.replace(/_/g, ' ') + ' (conf: ' + ((l4.confidence || 0) * 100).toFixed(0) + '%)';
        }
        // Update collapsed dealer engine badge
        var dealerBadge = document.getElementById('gexDealerEngineBadge');
        if (dealerBadge && l4.regime_label) {
          dealerBadge.textContent = l4.regime_label.replace(/_/g, ' ');
        }
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }).catch(function() {});
  }

  return { init: init, destroy: destroy };
})();
`;
}


module.exports = { registerGEXHeatmapRoutes, _fetchHeatmapDataExport: _fetchHeatmapData };
