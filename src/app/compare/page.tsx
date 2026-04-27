"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalysisResponse } from "@/types";
import { formatChange, changeColor, formatMarketCap } from "@/lib/utils";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function ComparePage() {
  const [tickers, setTickers] = useState<string[]>(["RELIANCE", "TCS"]);
  const [input, setInput] = useState("");
  const [data, setData] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComparison = async (tickerList: string[]) => {
    if (tickerList.length < 2) return;
    setLoading(true);
    try {
      const result = await api.compare(tickerList);
      setData(result.stocks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addTicker = () => {
    const t = input.trim().toUpperCase();
    if (t && !tickers.includes(t) && tickers.length < 3) {
      const next = [...tickers, t];
      setTickers(next);
      loadComparison(next);
    }
    setInput("");
  };

  const removeTicker = (t: string) => {
    const next = tickers.filter((x) => x !== t);
    setTickers(next);
    setData((d) => d.filter((s) => s.ticker !== t));
  };

  const handleCompare = () => loadComparison(tickers);

  const rows = [
    { label: "Price", getValue: (d: AnalysisResponse) => `₹${d.quote.price.toLocaleString("en-IN")}` },
    { label: "Change", getValue: (d: AnalysisResponse) => formatChange(d.quote.changePercent), colorFn: (d: AnalysisResponse) => changeColor(d.quote.changePercent) },
    { label: "Market Cap", getValue: (d: AnalysisResponse) => formatMarketCap(d.quote.marketCap) },
    { label: "P/E", getValue: (d: AnalysisResponse) => d.fundamental.keyRatios.pe.value.toFixed(1) },
    { label: "ROE", getValue: (d: AnalysisResponse) => `${d.fundamental.keyRatios.roe.value.toFixed(1)}%` },
    { label: "ROCE", getValue: (d: AnalysisResponse) => `${d.fundamental.keyRatios.roce.value.toFixed(1)}%` },
    { label: "Debt/Equity", getValue: (d: AnalysisResponse) => d.fundamental.keyRatios.debtEquity.value.toFixed(2) },
    { label: "EPS (TTM)", getValue: (d: AnalysisResponse) => `₹${d.fundamental.keyRatios.eps.value}` },
    { label: "RSI (14)", getValue: (d: AnalysisResponse) => String(d.technical.summary.rsi.value) },
    { label: "Trend", getValue: (d: AnalysisResponse) => String(d.technical.summary.trend.value) },
    { label: "Overall Signal", getValue: (d: AnalysisResponse) => d.technical.overallSignal.charAt(0).toUpperCase() + d.technical.overallSignal.slice(1) },
    { label: "Overall Health", getValue: (d: AnalysisResponse) => `${d.fundamental.quickSummary.overallHealth.label} (${d.fundamental.quickSummary.overallHealth.score}/100)` },
  ];

  return (
    <AuthGuard message="Sign in to compare stocks side by side with key metrics and signals.">
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-content mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
        <h1 className="text-xl font-bold text-text-primary mb-6">Compare Stocks</h1>

        {/* Ticker input */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {tickers.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--violet)" }}
              >
                <span className="text-sm font-semibold text-violet">{t}</span>
                <button onClick={() => removeTicker(t)} className="text-text-secondary hover:text-danger transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
            {tickers.length < 3 && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTicker()}
                  placeholder="Add ticker…"
                  className="bg-transparent text-sm text-text-primary placeholder-text-secondary outline-none border-b border-border pb-1 w-24"
                />
                <button onClick={addTicker} className="p-1.5 rounded-lg bg-surface-3 text-violet hover:bg-violet hover:text-white transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            )}
            <button onClick={handleCompare} className="btn-primary text-sm py-2 px-4 ml-auto">
              Compare
            </button>
          </div>
        </div>

        {/* Comparison table */}
        {loading && (
          <div className="card skeleton h-64" />
        )}
        {!loading && data.length >= 2 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="py-3 pr-4 text-left text-xs font-semibold text-text-secondary w-36">Metric</th>
                  {data.map((d) => (
                    <th key={d.ticker} className="py-3 px-4 text-left text-xs font-semibold text-violet">
                      {d.ticker}
                      <p className="text-[10px] text-text-secondary font-normal truncate max-w-[120px]">{d.quote.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.label}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-3)",
                    }}
                  >
                    <td className="py-3 pr-4 text-xs text-text-secondary">{row.label}</td>
                    {data.map((d) => (
                      <td
                        key={d.ticker}
                        className={`py-3 px-4 text-sm font-mono-num ${row.colorFn ? row.colorFn(d) : "text-text-primary"}`}
                      >
                        {row.getValue(d)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="card text-center py-16">
            <p className="text-text-secondary mb-4">Add 2–3 tickers and click Compare to see them side by side.</p>
          </div>
        )}
      </main>
      <BottomTabBar />
    </div>
    </AuthGuard>
  );
}
