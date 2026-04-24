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

export const POPULAR_SEARCHES = [
  "Infosys", "ICICI Bank", "Larsen & Toubro",
  "Tata Motors", "Wipro", "Bharti Airtel",
];
