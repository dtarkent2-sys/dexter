import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
import { formatToolResult } from '../types.js';

const yahooFinance = new YahooFinance();

const YF_URL = 'https://finance.yahoo.com/quote';

const AnalystEstimatesInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol. For example, 'AAPL' for Apple."),
  period: z
    .enum(['annual', 'quarterly'])
    .default('annual')
    .describe("'annual' or 'quarterly'."),
});

export const getAnalystEstimates = new DynamicStructuredTool({
  name: 'get_analyst_estimates',
  description: `Retrieves analyst estimates including EPS and revenue forecasts, price targets, and recommendation consensus. Powered by Yahoo Finance.`,
  schema: AnalystEstimatesInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ['earningsTrend', 'financialData'],
    });

    const trends = (result.earningsTrend?.trend ?? []) as Array<Record<string, unknown>>;
    const fd = (result.financialData ?? {}) as Record<string, unknown>;

    // Filter by period: "+1q"/"+2q" for quarterly, "+1y"/"+5y" for annual
    const periodFilter = input.period === 'quarterly' ? 'q' : 'y';
    const filtered = trends.filter((t) => {
      const p = String(t.period ?? '');
      return p.includes(periodFilter);
    });

    // Map to shape the formatAnalystEstimates formatter expects
    const estimates = filtered.map((t) => {
      const ee = (t.earningsEstimate ?? {}) as Record<string, unknown>;
      const re = (t.revenueEstimate ?? {}) as Record<string, unknown>;
      return {
        report_period: t.endDate,
        estimated_eps_avg: ee.avg,
        estimated_eps_low: ee.low,
        estimated_eps_high: ee.high,
        estimated_revenue_avg: re.avg,
        estimated_revenue_low: re.low,
        estimated_revenue_high: re.high,
        number_of_analysts: ee.numberOfAnalysts ?? re.numberOfAnalysts,
        eps_growth: ee.growth,
      };
    });

    // Append price target info from financialData
    const priceTargets: Record<string, unknown> = {
      target_mean: fd.targetMeanPrice,
      target_median: fd.targetMedianPrice,
      target_high: fd.targetHighPrice,
      target_low: fd.targetLowPrice,
      recommendation: fd.recommendationKey,
      num_analysts: fd.numberOfAnalystOpinions,
    };

    return formatToolResult(
      { estimates, price_targets: priceTargets },
      [`${YF_URL}/${ticker}/analysis`],
    );
  },
});
