"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { api } from "@/lib/api";
import type { ScreenerStock } from "@/types";
import { formatChange, changeColor, formatMarketCap } from "@/lib/utils";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function ScreenerPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof ScreenerStock>("marketCap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    api.screener().then((d) => { setStocks(d.results); setLoading(false); });
  }, []);

  const sorted = [...stocks].sort((a, b) => {
    const va = a[sortKey] as number;
    const vb = b[sortKey] as number;
    return sortDir === "desc" ? vb - va : va - vb;
  });

  const toggleSort = (key: keyof ScreenerStock) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const cols: { key: keyof ScreenerStock; label: string; sortable?: boolean }[] = [
    { key: "name", label: "Company" },
    { key: "marketCap", label: "Mkt Cap", sortable: true },
    { key: "price", label: "CMP", sortable: true },
    { key: "changePercent", label: "1D %", sortable: true },
    { key: "pe", label: "P/E", sortable: true },
    { key: "roe", label: "ROE", sortable: true },
    { key: "rsi", label: "RSI", sortable: true },
    { key: "supertrend", label: "Supertrend" },
    { key: "topPersona", label: "Top Persona" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-content mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Screener</h1>
            <p className="text-sm text-text-secondary mt-1">
              {stocks.length} stocks from Nifty 500 · Pre-computed nightly
            </p>
          </div>
        </div>

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="py-3 text-left text-xs font-semibold text-text-secondary pl-0 w-8">#</th>
                  {cols.map((col) => (
                    <th
                      key={String(col.key)}
                      className="py-3 px-3 text-left text-xs font-semibold text-text-secondary cursor-pointer select-none"
                      onClick={() => col.sortable && toggleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && <ArrowUpDown size={11} className="opacity-50" />}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-left text-xs font-semibold text-text-secondary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((stock, i) => (
                  <tr
                    key={stock.ticker}
                    className="hover:bg-surface-3 transition-colors cursor-pointer"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onClick={() => router.push(`/analyse/${stock.ticker}`)}
                  >
                    <td className="py-3 pl-0 pr-3 text-xs text-text-secondary">{i + 1}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-text-primary">{stock.ticker}</p>
                      <p className="text-xs text-text-secondary">{stock.sector}</p>
                    </td>
                    <td className="py-3 px-3 text-xs font-mono-num text-text-secondary">
                      {formatMarketCap(stock.marketCap)}
                    </td>
                    <td className="py-3 px-3 text-sm font-mono-num text-text-primary">
                      ₹{stock.price.toLocaleString("en-IN")}
                    </td>
                    <td className={`py-3 px-3 text-sm font-mono-num ${changeColor(stock.changePercent)}`}>
                      {formatChange(stock.changePercent)}
                    </td>
                    <td className="py-3 px-3 text-sm font-mono-num text-text-primary">
                      {stock.pe.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-sm font-mono-num text-text-primary">
                      {stock.roe.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-sm font-mono-num text-text-primary">
                      {stock.rsi.toFixed(1)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={
                          stock.supertrend === "Bullish"
                            ? "signal-pill-bullish"
                            : stock.supertrend === "Bearish"
                            ? "signal-pill-bearish"
                            : "signal-pill-neutral"
                        }
                      >
                        {stock.supertrend}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-text-secondary">{stock.topPersona}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/analyse/${stock.ticker}`);
                        }}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Analyse
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
