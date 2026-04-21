// lib/api.ts — All API calls use API_BASE_URL from config.
// Change the URL in config/index.ts (or .env.local) to point to your real backend.

import { API_BASE_URL } from "@/config";
import type {
  AnalysisResponse,
  Quote,
  SearchResult,
  MarketOverview,
  ScreenerStock,
} from "@/types";

async function fetchAPI<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 0 }, // Always fresh in dev; add cache in prod
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json();
}

export const api = {
  /** Price + metadata only — lightweight, no rate limit */
  quote: (ticker: string): Promise<Quote> =>
    fetchAPI(`/api/quote/${ticker}`),

  /** Full stock analysis — rate limited to 3/session in prod */
  analyse: (ticker: string): Promise<AnalysisResponse> =>
    fetchAPI(`/api/analyse/${ticker}`),

  /** Ticker autocomplete search */
  search: (q: string): Promise<{ results: SearchResult[]; query: string }> =>
    fetchAPI(`/api/search?q=${encodeURIComponent(q)}`),

  /** Market overview — Nifty 50, Sensex, gainers/losers */
  marketOverview: (): Promise<MarketOverview> =>
    fetchAPI("/api/market/overview"),

  /** Pre-computed screener results */
  screener: (params?: Record<string, string>): Promise<{ results: ScreenerStock[]; total: number }> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/screener${qs}`);
  },

  /** Side-by-side comparison of 2–3 tickers */
  compare: (tickers: string[]): Promise<{ stocks: AnalysisResponse[] }> =>
    fetchAPI(`/api/compare?tickers=${tickers.join(",")}`),

  /** Session rate-limit status */
  sessionCheck: (): Promise<{ used: number; remaining: number; nextResetAt: string | null }> =>
    fetch(`${API_BASE_URL}/api/session/check`, { method: "POST" }).then((r) => r.json()),
};
