import { readCache, writeCache, describeRequest } from '../../utils/cache.js';
import { logger } from '../../utils/logger.js';

const DATA_BASE_URL = 'https://data.alpaca.markets';

export interface AlpacaApiResponse {
  data: Record<string, unknown>;
  url: string;
}

/**
 * Returns true when Alpaca API credentials are configured.
 */
export function isAlpacaConfigured(): boolean {
  return !!(process.env.ALPACA_API_KEY && process.env.ALPACA_API_SECRET);
}

function getHeaders(): Record<string, string> {
  return {
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
  };
}

/**
 * Shared request execution for Alpaca endpoints.
 */
async function executeRequest(
  url: string,
  label: string,
): Promise<Record<string, unknown>> {
  if (!isAlpacaConfigured()) {
    logger.warn(`[Alpaca API] call without credentials: ${label}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { headers: getHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[Alpaca API] network error: ${label} — ${message}`);
    throw new Error(`[Alpaca API] request failed for ${label}: ${message}`);
  }

  if (!response.ok) {
    const detail = `${response.status} ${response.statusText}`;
    logger.error(`[Alpaca API] error: ${label} — ${detail}`);
    throw new Error(`[Alpaca API] request failed: ${detail}`);
  }

  const data = await response.json().catch(() => {
    const detail = `invalid JSON (${response.status} ${response.statusText})`;
    logger.error(`[Alpaca API] parse error: ${label} — ${detail}`);
    throw new Error(`[Alpaca API] request failed: ${detail}`);
  });

  return data as Record<string, unknown>;
}

export const alpacaApi = {
  async get(
    endpoint: string,
    params: Record<string, string | number | string[] | undefined>,
    options?: { cacheable?: boolean; ttlMs?: number },
  ): Promise<AlpacaApiResponse> {
    const label = describeRequest(endpoint, params);

    if (options?.cacheable) {
      const cached = readCache(`alpaca:${endpoint}`, params, options.ttlMs);
      if (cached) {
        return cached as AlpacaApiResponse;
      }
    }

    const url = new URL(`${DATA_BASE_URL}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, v));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const data = await executeRequest(url.toString(), label);

    if (options?.cacheable) {
      writeCache(`alpaca:${endpoint}`, params, data, url.toString());
    }

    return { data, url: url.toString() };
  },
};
