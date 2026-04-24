"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Clock } from "lucide-react";
import { api } from "@/lib/api";
import type { ScreenerStock } from "@/types";
import { formatChange, changeColor, formatMarketCap } from "@/lib/utils";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

// Persona display names — maps the ID returned by the backend to a short label
const PERSONA_LABELS: Record<string, string> = {
  "warren-buffett":       "Buffett",
  "peter-lynch":          "Lynch",
  "rakesh-jhunjhunwala":  "Jhunjhunwala",
  "momentum-trader":      "Momentum",
};

function personaLabel(id: string): string {
  return PERSONA_LABELS[id] ?? id;
}

// Badge colour for the top persona chip
function personaBadgeStyle(id: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    "warren-buffett":       { bg: "rgba(34,197,94,0.1)",   color: "var(--success)" },
    "peter-lynch":          { bg: "rgba(34,211,168,0.1)",  color: "var(--teal-accent)" },
    "rakesh-jhunjhunwala":  { bg: "rgba(245,158,11,0.1)",  color: "var(--warning)" },
    "momentum-trader":      { bg: "rgba(124,92,255,0.1)",  color: "var(--violet)" },
  };
  const s = map[id] ?? { bg: "rgba(124,92,255,0.1)", color: "var(--violet)" };
  return {
    backgroundColor: s.bg,
    color: s.color,
    fontSize: 11,
    fontWeight: 500,
    padding: "2px 8px",
    borderRadius: 10,
    whiteSpace: "nowrap" as const,
  };
}

type SortableKey = "marketCap" | "price" | "changePercent" | "pe" | "roe" | "revenueGrowth" | "debtEquity" | "personaScore";

export default function ScreenerPage() {
  const router = useRouter();
  const [stocks,   setStocks]   = useState<ScreenerStock[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [dataNote, setDataNote] = useState<string>("Updated daily · EOD data");
  const [sortKey,  setSortKey]  = useState<SortableKey>("marketCap");
  const [sortDir,  setSortDir]  = useState<"asc" | "desc">("desc");

  useEffect(() => {
    api.screener().then((d) => {
      setStocks(d.results);
      // The backend now includes a dataNote field on any result
      if (d.results.length > 0 && d.results[0].dataNote) {
        setDataNote(d.results[0].dataNote);
      }
      setLoading(false);
    });
  }, []);

  const sorted = [...stocks].sort((a, b) => {
    const va = a[sortKey] as number;
    const vb = b[sortKey] as number;
    return sortDir === "desc" ? vb - va : va - vb;
  });

  const toggleSort = (key: SortableKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  // Only columns with real, honest data — RSI and Supertrend removed
  const cols: { key: SortableKey; label: string; sortable: boolean }[] = [
    { key: "marketCap",      label: "Mkt Cap",     sortable: true  },
    { key: "price",          label: "CMP",         sortable: true  },
    { key: "changePercent",  label: "1D %",        sortable: true  },
    { key: "pe",             label: "P/E",         sortable: true  },
    { key: "roe",            label: "ROE %",       sortable: true  },
    { key: "revenueGrowth",  label: "Rev Growth",  sortable: true  },
    { key: "debtEquity",     label: "D/E",         sortable: true  },
    { key: "personaScore",   label: "Persona Score", sortable: true },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-content mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Screener</h1>
            <p className="text-sm text-text-secondary mt-1">
              Nifty 50 · Pre-computed nightly
            </p>
          </div>
          {/* EOD data badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{
              backgroundColor: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "var(--success)",
              fontWeight: 500,
            }}
          >
            <Clock size={11} />
            {dataNote}
          </div>
        </div>

        {/* ── Disclaimer about removed columns ── */}
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 text-xs leading-relaxed"
          style={{ backgroundColor: "rgba(124,92,255,0.05)", border: "1px solid rgba(124,92,255,0.15)", color: "var(--text-secondary)" }}
        >
          <span style={{ color: "var(--violet)", fontWeight: 600, flexShrink: 0 }}>ℹ</span>
          RSI and Supertrend signals are coming soon — they require nightly OHLCV data for accuracy.
          The Top Persona column is computed from fundamental ratios (P/E, ROE, D/E, growth) and is updated every day.
        </div>

        {/* ── Table ── */}
        <div className="card overflow-x-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="py-3 text-left text-xs font-semibold text-text-secondary pl-0 w-8">#</th>
                  {/* Company column */}
                  <th className="py-3 px-3 text-left text-xs font-semibold text-text-secondary">Company</th>
                  {cols.map((col) => (
                    <th
                      key={col.key}
                      className="py-3 px-3 text-left text-xs font-semibold text-text-secondary cursor-pointer select-none"
                      onClick={() => col.sortable && toggleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <ArrowUpDown
                            size={11}
                            style={{ opacity: sortKey === col.key ? 1 : 0.4, color: sortKey === col.key ? "var(--violet)" : undefined }}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                  {/* Top Persona */}
                  <th className="py-3 px-3 text-left text-xs font-semibold text-text-secondary">
                    Top Persona
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-text-secondary">Action</th>
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
                      <p className="text-xs text-text-secondary truncate max-w-[120px]">{stock.sector}</p>
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
                      {stock.pe > 0 ? stock.pe.toFixed(1) : "—"}
                    </td>
                    <td className="py-3 px-3 text-sm font-mono-num text-text-primary">
                      {stock.roe.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-3 text-sm font-mono-num ${stock.revenueGrowth >= 0 ? "text-success" : "text-danger"}`}>
                      {stock.revenueGrowth >= 0 ? "+" : ""}{stock.revenueGrowth.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-sm font-mono-num text-text-primary">
                      {stock.debtEquity.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-sm font-mono-num text-text-primary">
                      {stock.personaScore}
                    </td>
                    <td className="py-3 px-3">
                      <span style={personaBadgeStyle(stock.topPersona)}>
                        {personaLabel(stock.topPersona)}
                      </span>
                    </td>
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
