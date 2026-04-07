import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
import { formatToolResult } from '../types.js';

const yahooFinance = new YahooFinance();

/**
 * Yahoo Finance-backed key ratios / financial metrics tools.
 * Output shape matches what the existing formatters expect.
 */

const YF_URL = 'https://finance.yahoo.com/quote';

const KeyRatiosInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol. For example, 'AAPL' for Apple."),
});

export const getKeyRatios = new DynamicStructuredTool({
  name: 'get_key_ratios',
  description:
    'Fetches the latest financial metrics snapshot: valuation (P/E, P/B, P/S, EV/EBITDA, PEG), profitability (margins, ROE, ROA), leverage (debt/equity), per-share metrics (EPS), and growth rates. Powered by Yahoo Finance.',
  schema: KeyRatiosInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail'],
    });

    const fd = (result.financialData ?? {}) as Record<string, unknown>;
    const ks = (result.defaultKeyStatistics ?? {}) as Record<string, unknown>;
    const sd = (result.summaryDetail ?? {}) as Record<string, unknown>;

    // Map to the shape the formatKeyRatios formatter expects
    const snapshot: Record<string, unknown> = {
      ticker,
      market_cap: sd.marketCap,
      pe_ratio: sd.trailingPE ?? sd.forwardPE,
      forward_pe: sd.forwardPE,
      price_to_book: ks.priceToBook,
      price_to_sales: sd.priceToSalesTrailing12Months,
      ev_to_ebitda: ks.enterpriseToEbitda,
      ev_to_revenue: ks.enterpriseToRevenue,
      peg_ratio: ks.pegRatio,
      enterprise_value: ks.enterpriseValue,
      eps: ks.trailingEps,
      forward_eps: ks.forwardEps,
      dividend_yield: sd.dividendYield,
      beta: sd.beta ?? ks.beta,
      // Profitability
      gross_margin: fd.grossMargins,
      operating_margin: fd.operatingMargins,
      net_margin: fd.profitMargins,
      roe: fd.returnOnEquity,
      roa: fd.returnOnAssets,
      roic: undefined, // not directly available
      // Growth
      revenue_growth_rate: fd.revenueGrowth,
      earnings_growth_rate: fd.earningsGrowth,
      // Leverage
      debt_to_equity: fd.debtToEquity != null ? Number(fd.debtToEquity) / 100 : undefined,
      current_ratio: fd.currentRatio,
      quick_ratio: fd.quickRatio,
      // Additional
      free_cash_flow: fd.freeCashflow,
      operating_cash_flow: fd.operatingCashflow,
      total_cash: fd.totalCash,
      total_debt: fd.totalDebt,
      shares_outstanding: ks.sharesOutstanding,
      fifty_two_week_high: sd.fiftyTwoWeekHigh,
      fifty_two_week_low: sd.fiftyTwoWeekLow,
    };

    return formatToolResult(snapshot, [`${YF_URL}/${ticker}/key-statistics`]);
  },
});

const HistoricalKeyRatiosInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol. For example, 'AAPL' for Apple."),
  period: z
    .enum(['annual', 'quarterly', 'ttm'])
    .default('ttm')
    .describe("The reporting period. 'annual', 'quarterly', or 'ttm'."),
  limit: z
    .number()
    .default(4)
    .describe('The number of past periods to retrieve.'),
});

export const getHistoricalKeyRatios = new DynamicStructuredTool({
  name: 'get_historical_key_ratios',
  description: `Retrieves historical key ratios for trend analysis (P/E, EPS, revenue growth, margins, ROE over time). Powered by Yahoo Finance.`,
  schema: HistoricalKeyRatiosInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();

    // Use earnings + income history to build a time series
    const yfPeriod = input.period === 'quarterly' || input.period === 'ttm' ? 'quarterly' : 'annual';
    const incomeMod = yfPeriod === 'quarterly'
      ? 'incomeStatementHistoryQuarterly' as const
      : 'incomeStatementHistory' as const;

    const result = await yahooFinance.quoteSummary(ticker, {
      modules: [incomeMod, 'defaultKeyStatistics', 'summaryDetail'],
    });

    const statements = (result[incomeMod]?.incomeStatementHistory ?? []) as unknown as Array<Record<string, unknown>>;
    const ks = (result.defaultKeyStatistics ?? {}) as Record<string, unknown>;

    // Build historical rows from income statements
    const rows = statements.slice(0, input.limit).map((row) => {
      const revenue = Number(row.totalRevenue ?? 0);
      const opIncome = Number(row.operatingIncome ?? 0);
      const netIncome = Number(row.netIncome ?? 0);
      const eps = row.dilutedEPS ?? row.basicEPS;

      return {
        report_period: row.endDate ? new Date(row.endDate as string | number).toISOString().slice(0, 10) : undefined,
        pe_ratio: eps && Number(eps) > 0 ? (ks.priceToBook ? undefined : undefined) : undefined,
        eps,
        revenue,
        operating_income: opIncome,
        net_income: netIncome,
        operating_margin: revenue > 0 ? opIncome / revenue : undefined,
        net_margin: revenue > 0 ? netIncome / revenue : undefined,
      };
    });

    return formatToolResult(rows, [`${YF_URL}/${ticker}/financials`]);
  },
});
