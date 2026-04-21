// types/index.ts — TypeScript types matching the AlphaVibes API response schema

export interface Quote {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  industry: string;
  week52High: number;
  week52Low: number;
  timestamp: string;
  isDelayed: boolean;
}

export interface IndicatorValue {
  value: number | string;
  signal: "bullish" | "bearish" | "neutral" | "caution";
  label: string;
  tooltip?: string;
}

export interface TechnicalSummary {
  trend: IndicatorValue;
  rsi: IndicatorValue;
  macd: IndicatorValue;
  volume: IndicatorValue;
}

export interface MovingAverages {
  ma20: number;
  ma50: number;
  ma200: number;
}

export interface Strategy {
  name: string;
  signal: "bullish" | "bearish" | "neutral" | "caution";
  description: string;
  thumbnail: string;
}

export interface Pattern {
  name: string;
  type: string;
  reliability: "High" | "Medium" | "Low";
  description: string;
}

export interface Technical {
  overallSignal: string;
  summary: TechnicalSummary;
  movingAverages: MovingAverages;
  indicators: Record<string, IndicatorValue>;
  strategies: Strategy[];
  patterns: Pattern[];
}

export interface RatioValue {
  value: number;
  benchmark: string;
  rating: "good" | "fair" | "high" | "poor";
  label: string;
  tooltip?: string;
}

export interface QuickSummary {
  overallHealth: { score: number; label: string };
  revenueGrowth: { value: number; signal: string };
  profitGrowth: { value: number; signal: string };
  debt: { value: string; signal: string };
  valuation: { value: string; signal: string };
  keyInsight: string;
}

export interface FinancialRow {
  label: string;
  fy24: number;
  fy23: number;
  fy22: number;
  fy21: number;
  fy20: number;
}

export interface Fundamental {
  overallHealth: { score: number; label: string };
  keyRatios: {
    pe: RatioValue;
    roe: RatioValue;
    roce: RatioValue;
    debtEquity: RatioValue;
    eps: RatioValue;
    dividendYield: RatioValue;
  };
  quickSummary: QuickSummary;
  ratiosSnapshot: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    currentRatio: number;
    returnOnAssets: number;
  };
  financialTrends: {
    annual: Array<{ year: string; revenue: number; profit: number }>;
    quarterly: Array<{ quarter: string; revenue: number; profit: number }>;
    revenueCagr5y: number;
  };
  financialStatements: {
    pnl: FinancialRow[];
    balanceSheet: FinancialRow[];
    cashFlow: FinancialRow[];
  };
}

export interface PersonaCriteria {
  label: string;
  value: string;
  pass: boolean;
}

export interface Persona {
  id: string;
  name: string;
  photoUrl: string | null;
  icon?: string;
  score: number;
  verdict: string;
  verdictColor: "success" | "info" | "warning" | "danger";
  summary: string;
  criteria: PersonaCriteria[];
}

export interface ShareholdingData {
  promoter: number;
  fii: number;
  dii: number;
  public: number;
  promoterPledge: number;
  trend: Array<{ quarter: string; promoter: number; fii: number; dii: number; public: number }>;
}

export interface PeerStock {
  ticker: string;
  name: string;
  pe: number;
  roe: number;
  netMargin: number;
  debtEquity: number;
  isSelected: boolean;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResponse {
  ticker: string;
  quote: Quote;
  technical: Technical;
  fundamental: Fundamental;
  personas: Persona[];
  shareholding: ShareholdingData;
  peers: PeerStock[];
  chartData: { daily: Candle[]; intraday: Candle[] };
}

export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
}

export interface MarketOverview {
  indices: Array<{ name: string; value: number; change: number; changePercent: number }>;
  trending: Array<{ ticker: string; name: string; changePercent: number }>;
  topGainers: Array<{ ticker: string; name: string; price: number; changePercent: number }>;
  topLosers: Array<{ ticker: string; name: string; price: number; changePercent: number }>;
  popularSearches: string[];
}

export interface ScreenerStock {
  ticker: string;
  name: string;
  sector: string;
  marketCap: number;
  price: number;
  changePercent: number;
  pe: number;
  roe: number;
  revenueGrowth: number;
  debtEquity: number;
  rsi: number;
  supertrend: string;
  topPersona: string;
  personaScore: number;
}

export type Theme = "dark" | "light";
export type TabId = "overview" | "fundamentals" | "technicals" | "financials" | "peers" | "shareholding";
