import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { alpacaApi } from './api-alpaca.js';
import { formatToolResult } from '../types.js';

/**
 * Alpaca-backed crypto price tools.
 * Same tool names and output shapes as the Financial Datasets equivalents.
 */

/**
 * Convert between ticker formats:
 *   Financial Datasets: "BTC-USD"
 *   Alpaca:             "BTC/USD"
 */
function toAlpacaTicker(ticker: string): string {
  return ticker.replace('-', '/');
}

const CryptoPriceSnapshotInputSchema = z.object({
  ticker: z
    .string()
    .describe(
      "The crypto ticker symbol. Use 'CRYPTO-USD' format (e.g., 'BTC-USD') or 'CRYPTO-CRYPTO' (e.g., 'BTC-ETH')."
    ),
});

export const getAlpacaCryptoPriceSnapshot = new DynamicStructuredTool({
  name: 'get_crypto_price_snapshot',
  description: `Fetches the most recent price snapshot for a cryptocurrency, including latest price, volume, and OHLC data. Ticker format: 'CRYPTO-USD' (e.g., 'BTC-USD'). Powered by Alpaca.`,
  schema: CryptoPriceSnapshotInputSchema,
  func: async (input) => {
    const alpacaTicker = toAlpacaTicker(input.ticker);
    const { data, url } = await alpacaApi.get('/v1beta3/crypto/us/snapshots', {
      symbols: alpacaTicker,
    });

    // Response: { snapshots: { "BTC/USD": { dailyBar: {...}, latestTrade: {...}, ... } } }
    const snapshots = (data.snapshots ?? {}) as Record<string, Record<string, unknown>>;
    const snap = snapshots[alpacaTicker] ?? Object.values(snapshots)[0] ?? {};
    const dailyBar = (snap.dailyBar ?? {}) as Record<string, unknown>;
    const latestTrade = (snap.latestTrade ?? {}) as Record<string, unknown>;

    const snapshot: Record<string, unknown> = {
      ticker: input.ticker,
      open: dailyBar.o,
      high: dailyBar.h,
      low: dailyBar.l,
      close: latestTrade.p ?? dailyBar.c,
      volume: dailyBar.v,
    };

    return formatToolResult(snapshot, [url]);
  },
});

const CryptoPricesInputSchema = z.object({
  ticker: z
    .string()
    .describe(
      "The crypto ticker symbol. Use 'CRYPTO-USD' format (e.g., 'BTC-USD')."
    ),
  interval: z
    .enum(['minute', 'day', 'week', 'month', 'year'])
    .default('day')
    .describe("The time interval for price data. Defaults to 'day'."),
  interval_multiplier: z
    .number()
    .default(1)
    .describe('Multiplier for the interval. Defaults to 1.'),
  start_date: z.string().describe('Start date in YYYY-MM-DD format. Required.'),
  end_date: z.string().describe('End date in YYYY-MM-DD format. Required.'),
});

const ALPACA_CRYPTO_INTERVAL_MAP: Record<string, string> = {
  minute: '1Min',
  day: '1Day',
  week: '1Week',
  month: '1Month',
};

export const getAlpacaCryptoPrices = new DynamicStructuredTool({
  name: 'get_crypto_prices',
  description: `Retrieves historical price data for a cryptocurrency over a specified date range, including OHLCV. Ticker format: 'CRYPTO-USD' (e.g., 'BTC-USD'). Powered by Alpaca.`,
  schema: CryptoPricesInputSchema,
  func: async (input) => {
    const alpacaTicker = toAlpacaTicker(input.ticker);
    const baseInterval = ALPACA_CRYPTO_INTERVAL_MAP[input.interval] ?? '1Day';
    // Apply multiplier: "5Min", "2Day", etc.
    const timeframe = input.interval_multiplier > 1
      ? `${input.interval_multiplier}${baseInterval.replace(/^\d+/, '')}`
      : baseInterval;

    const { data, url } = await alpacaApi.get(`/v1beta3/crypto/us/bars`, {
      symbols: alpacaTicker,
      timeframe,
      start: input.start_date,
      end: input.end_date,
      limit: '1000',
    });

    // Response: { bars: { "BTC/USD": [{t, o, h, l, c, v, ...}] } }
    const barsMap = (data.bars ?? {}) as Record<string, Array<Record<string, unknown>>>;
    const bars = barsMap[alpacaTicker] ?? Object.values(barsMap)[0] ?? [];
    const prices = bars.map((bar) => ({
      date: String(bar.t ?? '').slice(0, 10),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));

    return formatToolResult(prices, [url]);
  },
});
