"use client";

import { useState } from "react";
import type { AnalysisResponse, FinancialRow } from "@/types";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

interface Props { data: AnalysisResponse; }

const FY_YEARS = ["FY24", "FY23", "FY22", "FY21", "FY20"] as const;

function ExplainBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl px-4 py-3 mt-4" style={{ backgroundColor: "rgba(124,92,255,0.06)", border: "1px solid rgba(124,92,255,0.18)" }}>
      <Info size={14} className="shrink-0 mt-0.5" style={{ color: "var(--violet)" }} />
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{children}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
      {children}
    </p>
  );
}

function formatNum(v: number | undefined): string {
  if (v === undefined || v === null) return "—";
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toFixed(1);
}

function GrowthChip({ curr, prev }: { curr: number | undefined; prev: number | undefined }) {
  if (!curr || !prev || prev === 0) return null;
  const pct = ((curr - prev) / Math.abs(prev)) * 100;
  const isPositive = pct >= 0;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium"
      style={{ color: isPositive ? "var(--success)" : "var(--danger)" }}>
      {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

const STMT_EXPLAINERS = {
  pnl: {
    title: "Profit & Loss Statement",
    what: "Shows what the company earned (revenue) and what it spent, resulting in a final profit or loss. Think of it as the company's income statement.",
    watch: "Look for consistent revenue growth and expanding profit margins over the years.",
  },
  balanceSheet: {
    title: "Balance Sheet",
    what: "A snapshot of what the company owns (assets) vs what it owes (liabilities). The difference is shareholder equity.",
    watch: "A growing equity base and manageable liabilities indicate financial stability.",
  },
  cashFlow: {
    title: "Cash Flow Statement",
    what: "Tracks actual cash entering and leaving the business. A company can show profit but still run out of cash — this statement reveals the real picture.",
    watch: "Positive operating cash flow is a sign of a healthy, self-sustaining business.",
  },
};

type StmtTab = "pnl" | "balanceSheet" | "cashFlow";

function FinTable({ rows, label }: { rows: FinancialRow[]; label: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th className="text-left py-3 pr-4 text-xs font-semibold w-44 sticky left-0" style={{ color: "var(--text-secondary)", backgroundColor: "var(--surface-2)" }}>{label}</th>
            {FY_YEARS.map((y) => (
              <th key={y} className="text-right py-3 px-3 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{y}</th>
            ))}
            <th className="text-right py-3 px-3 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>YoY</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} style={{ borderBottom: "1px solid var(--border)", backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
              <td className="py-3 pr-4 text-xs whitespace-nowrap sticky left-0" style={{ color: "var(--text-secondary)", backgroundColor: i % 2 === 0 ? "var(--surface-2)" : "var(--surface-3)" }}>{row.label}</td>
              {FY_YEARS.map((y) => {
                const val = row[y.toLowerCase() as keyof FinancialRow] as number;
                return (
                  <td key={y} className="py-3 px-3 text-right text-xs font-mono-num" style={{ color: "var(--text-primary)" }}>{formatNum(val)}</td>
                );
              })}
              <td className="py-3 px-3 text-right">
                <GrowthChip curr={row["fy24" as keyof FinancialRow] as number} prev={row["fy23" as keyof FinancialRow] as number} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] mt-2" style={{ color: "var(--text-secondary)" }}>All values in ₹ Crores</p>
    </div>
  );
}

export default function FinancialsTab({ data }: Props) {
  const [stmtTab, setStmtTab] = useState<StmtTab>("pnl");
  const stmts = data.fundamental.financialStatements;
  const meta = STMT_EXPLAINERS[stmtTab];

  const stmtTabs: { id: StmtTab; label: string }[] = [
    { id: "pnl", label: "P&L" },
    { id: "balanceSheet", label: "Balance Sheet" },
    { id: "cashFlow", label: "Cash Flow" },
  ];

  const selectedRows = stmtTab === "pnl" ? stmts.pnl : stmtTab === "balanceSheet" ? stmts.balanceSheet : stmts.cashFlow;

  return (
    <div className="space-y-6">

      {/* Financial Statements */}
      <div className="card">
        <SectionLabel>Financial Statements</SectionLabel>

        {/* Sub-tabs */}
        <div className="flex gap-0 mb-5 border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "var(--border)" }}>
          {stmtTabs.map((t) => (
            <button key={t.id} onClick={() => setStmtTab(t.id)}
              className={`shrink-0 px-4 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${stmtTab === t.id ? "tab-active text-violet" : "text-text-secondary hover:text-text-primary"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Statement explainer */}
        <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: "var(--surface-3)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{meta.title}</p>
          <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>{meta.what}</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--violet)" }}>💡 {meta.watch}</p>
        </div>

        <FinTable rows={selectedRows} label="Item" />

        <ExplainBox>
          The YoY column shows the change from FY23 to FY24. Green = growth, red = decline. Focus on the trend across years — one bad year is less concerning than a multi-year decline.
        </ExplainBox>
      </div>

      {/* Peer Comparison */}
      <div className="card">
        <SectionLabel>How Does It Stack Up? — Peer Comparison</SectionLabel>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
          Numbers alone mean little without context. Here&apos;s how this stock compares to its closest competitors.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Company", "P/E", "ROE", "Net Margin", "Debt/Equity"].map((col) => (
                  <th key={col} className="py-3 px-3 text-xs font-semibold text-left first:pl-0" style={{ color: "var(--text-secondary)" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.peers.map((peer) => (
                <tr key={peer.ticker} style={{ borderBottom: "1px solid var(--border)", backgroundColor: peer.isSelected ? "rgba(124,92,255,0.05)" : "transparent" }}>
                  <td className="py-3 pl-0 pr-3">
                    <p className="text-sm font-semibold" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>{peer.ticker}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{peer.name}</p>
                  </td>
                  {[peer.pe.toFixed(1) + "x", peer.roe.toFixed(1) + "%", peer.netMargin.toFixed(1) + "%", peer.debtEquity.toFixed(2)].map((v, i) => (
                    <td key={i} className="py-3 px-3 text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ExplainBox>Highlighted row = the stock you&apos;re analyzing. Compare P/E (lower = cheaper), ROE (higher = more efficient), Net Margin (higher = more profitable), and D/E (lower = less risky).</ExplainBox>
      </div>
    </div>
  );
}
