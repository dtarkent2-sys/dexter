import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { alpacaApi } from './api-alpaca.js';
import { formatToolResult } from '../types.js';
import { TTL_15M } from './utils.js';

/**
 * Alpaca-backed company news tool.
 * Same tool name and output shape as the Financial Datasets equivalent.
 */

const CompanyNewsInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol to fetch company news for. For example, 'AAPL' for Apple."),
  limit: z
    .number()
    .default(5)
    .describe('Maximum number of news articles to return (default: 5, max: 10).'),
});

export const getAlpacaCompanyNews = new DynamicStructuredTool({
  name: 'get_company_news',
  description:
    'Retrieves recent company news headlines for a stock ticker, including title, source, publication date, and URL. Powered by Alpaca.',
  schema: CompanyNewsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const limit = Math.min(input.limit, 10);

    const { data, url } = await alpacaApi.get('/v1beta1/news', {
      symbols: ticker,
      limit: String(limit),
      sort: 'desc',
    }, { cacheable: true, ttlMs: TTL_15M });

    // Alpaca response: { news: [{ headline, source, created_at, url, ... }] }
    const articles = (data.news ?? []) as Array<Record<string, unknown>>;
    const news = articles.map((a) => ({
      title: a.headline,
      source: a.source,
      date: String(a.created_at ?? '').slice(0, 10),
      url: a.url,
    }));

    return formatToolResult(news, [url]);
  },
});
