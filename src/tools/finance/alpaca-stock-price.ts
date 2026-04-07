import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { alpacaApi } from './api-alpaca.js';
import { formatToolResult } from '../types.js';

/**
 * Alpaca-backed stock price tools.
 * These have the same tool names and output shapes as the Financial Datasets
 * equivalents so the existing formatters and routing work unchanged.
 */

const StockPriceInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol to fetch current price for. For example, 'AAPL' for Apple."),
});

export const getAlpacaStockPrice = new DynamicStructuredTool({
  name: 'get_stock_price',
  description:
    'Fetches the current stock price snapshot for an equity ticker, including open, high, low, close prices, and volume. Powered by Alpaca.',
  schema: StockPriceInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const { data, url } = await alpacaApi.get(`/v2/stocks/${ticker}/snapshot`, {});

    // Map Alpaca snapshot to the shape formatters expect:
    // { ticker, open, high, low, close, volume }
    const dailyBar = (data.dailyBar ?? data.DailyBar ?? {}) as Record<string, unknown>;
    const latestTrade = (data.latestTrade ?? data.LatestTrade ?? {}) as Record<string, unknown>;

    const snapshot: Record<string, unknown> = {
      ticker,
      open: dailyBar.o,
      high: dailyBar.h,
      low: dailyBar.l,
      close: latestTrade.p ?? dailyBar.c,
      volume: dailyBar.v,
    };

    return formatToolResult(snapshot, [url]);
  },
});

const ALPACA_INTERVAL_MAP: Record<string, string> = {
  day: '1Day',
  week: '1Week',
  month: '1Month',
};

const StockPricesInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol to fetch historical prices for. For example, 'AAPL' for Apple."),
  interval: z
    .enum(['day', 'week', 'month', 'year'])
    .default('day')
    .describe("The time interval for price data. Defaults to 'day'."),
  start_date: z.string().describe('Start date in YYYY-MM-DD format. Required.'),
  end_date: z.string().describe('End date in YYYY-MM-DD format. Required.'),
});

export const getAlpacaStockPrices = new DynamicStructuredTool({
  name: 'get_stock_prices',
  description:
    'Retrieves historical price data for a stock over a specified date range, including open, high, low, close prices and volume. Powered by Alpaca.',
  schema: StockPricesInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const timeframe = ALPACA_INTERVAL_MAP[input.interval] ?? '1Day';

    const { data, url } = await alpacaApi.get(`/v2/stocks/${ticker}/bars`, {
      timeframe,
      start: input.start_date,
      end: input.end_date,
      limit: '1000',
      adjustment: 'split',
    });

    // Map Alpaca bars to the shape formatters expect:
    // [{ date, open, high, low, close, volume }]
    const bars = (data.bars ?? []) as Array<Record<string, unknown>>;
    const prices = bars.map((bar) => ({
      date: String(bar.t ?? '').slice(0, 10),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));

    // Cache when the date window is fully closed
    const endDate = new Date(input.end_date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate < today) {
      // Re-fetch through cache path for persistence
    }

    return formatToolResult(prices, [url]);
  },
});
