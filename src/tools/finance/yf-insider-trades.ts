import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
import { formatToolResult } from '../types.js';

const yahooFinance = new YahooFinance();

const YF_URL = 'https://finance.yahoo.com/quote';

const InsiderTradesInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol. For example, 'AAPL' for Apple."),
  limit: z
    .number()
    .default(10)
    .describe('Maximum number of insider trades to return (default: 10).'),
});

export const getInsiderTrades = new DynamicStructuredTool({
  name: 'get_insider_trades',
  description: `Retrieves insider trading transactions (purchases/sales by executives and directors). Powered by Yahoo Finance.`,
  schema: InsiderTradesInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ['insiderTransactions'],
    });

    const transactions = (result.insiderTransactions?.transactions ?? []) as Array<Record<string, unknown>>;

    // Map to shape the formatInsiderTrades formatter expects
    const trades = transactions.slice(0, input.limit).map((t) => ({
      full_name: t.filerName,
      officer_title: t.filerRelation,
      transaction_type: t.transactionText ?? (Number(t.shares ?? 0) > 0 ? 'Purchase' : 'Sale'),
      shares: t.shares != null ? Math.abs(Number(t.shares)) : undefined,
      price_per_share: undefined, // YF doesn't provide per-share price in this module
      value: t.value,
      filing_date: t.startDate
        ? new Date(t.startDate as string | number).toISOString().slice(0, 10)
        : undefined,
    }));

    return formatToolResult(trades, [`${YF_URL}/${ticker}/insider-transactions`]);
  },
});
