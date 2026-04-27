// ─────────────────────────────────────────────────────────────────────────────
// config.ts — Single source of truth for backend URL.
// Change NEXT_PUBLIC_API_BASE_URL in .env.local to point to your real backend.
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const SITE_CONFIG = {
  name: "AlphaVibes",
  tagline: "Understand any stock in 60 seconds",
  taglineSecondary: "Insider level insights. Simplified for everyone.",
  company: "Accrion",
  defaultTheme: "dark" as const,
  rateLimitPerSession: 3,
};

export const TRENDING_STOCKS = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "WIPRO", "ICICIBANK"];

export const POPULAR_SEARCHES: { label: string; ticker: string }[] = [
  { label: "Infosys",          ticker: "INFY" },
  { label: "ICICI Bank",       ticker: "ICICIBANK" },
  { label: "Larsen & Toubro",  ticker: "LT" },
  { label: "Tata Motors",      ticker: "TATAMOTORS" },
  { label: "Wipro",            ticker: "WIPRO" },
  { label: "Bharti Airtel",    ticker: "BHARTIARTL" },
];
