import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
import { formatToolResult } from '../types.js';

const yahooFinance = new YahooFinance();

const YF_URL = 'https://finance.yahoo.com/quote';

const EarningsInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol. For example, 'AAPL' for Apple."),
});

export const getEarnings = new DynamicStructuredTool({
  name: 'get_earnings',
  description:
    'Fetches earnings data including quarterly EPS actuals vs estimates (beat/miss), revenue, and earnings surprises. Powered by Yahoo Finance.',
  schema: EarningsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ['earnings', 'earningsHistory', 'calendarEvents'],
    });

    const earnings = (result.earnings ?? {}) as Record<string, unknown>;
    const earningsChart = (earnings.earningsChart ?? {}) as Record<string, unknown>;
    const quarterly = (earningsChart.quarterly ?? []) as Array<Record<string, unknown>>;
    const history = (result.earningsHistory?.history ?? []) as Array<Record<string, unknown>>;
    const calendar = (result.calendarEvents ?? {}) as Record<string, unknown>;
    const calEarnings = (calendar.earnings ?? {}) as Record<string, unknown>;

    // Build latest earnings snapshot from history (most recent quarter)
    const latest = history.length > 0 ? history[0] : undefined;
    const snapshot: Record<string, unknown> = {};

    if (latest) {
      snapshot.eps = latest.epsActual;
      snapshot.eps_estimate = latest.epsEstimate;
      snapshot.eps_surprise = latest.epsDifference != null && latest.epsEstimate != null && Number(latest.epsEstimate) !== 0
        ? Number(latest.epsDifference) / Math.abs(Number(latest.epsEstimate))
        : latest.surprisePercent;
      snapshot.report_period = latest.quarter
        ? new Date(latest.quarter as string | number).toISOString().slice(0, 10)
        : undefined;
    }

    // Add quarterly chart data
    snapshot.quarterly_eps = quarterly.map((q) => ({
      date: q.date,
      actual: q.actual,
      estimate: q.estimate,
    }));

    // Next earnings date
    const earningsDates = (calEarnings.earningsDate ?? []) as Array<unknown>;
    if (earningsDates.length > 0) {
      snapshot.next_earnings_date = new Date(earningsDates[0] as string | number).toISOString().slice(0, 10);
    }

    snapshot.current_quarter_estimate = earningsChart.currentQuarterEstimate;

    return formatToolResult(snapshot, [`${YF_URL}/${ticker}`]);
  },
});
