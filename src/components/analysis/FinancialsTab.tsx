"use client";

import { useState } from "react";
import type { AnalysisResponse, FinancialRow } from "@/types";

interface Props {
  data: AnalysisResponse;
}

const FY_YEARS = ["FY24", "FY23", "FY22", "FY21", "FY20"] as const;

function formatNum(v: number | undefined, isPercent = false): string {
  if (v === undefined || v === null) return "—";
  if (isPercent) return `${v.toFixed(1)}%`;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toFixed(1);
}

function FinTable({ rows, label }: { rows: FinancialRow[]; label: string }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left py-3 pr-4 text-xs font-semibold text-text-secondary w-40">
                {label}
              </th>
              {FY_YEARS.map((y) => (
                <th key={y} className="text-right py-3 px-3 text-xs font-semibold text-text-secondary">
                  {y}
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
                <td className="py-3 pr-4 text-xs text-text-secondary whitespace-nowrap">{row.label}</td>
                {FY_YEARS.map((y) => {
                  const val = row[y.toLowerCase() as keyof FinancialRow] as number;
                  return (
                    <td key={y} className="py-3 px-3 text-right text-xs font-mono-num text-text-primary">
                      {formatNum(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-text-secondary mt-2">In ₹ Crores</p>
    </div>
  );
}

type StmtTab = "pnl" | "balanceSheet" | "cashFlow";

export default function FinancialsTab({ data }: Props) {
  const [stmtTab, setStmtTab] = useState<StmtTab>("pnl");
  const stmts = data.fundamental.financialStatements;

  const stmtTabs: { id: StmtTab; label: string }[] = [
    { id: "pnl", label: "Profit & Loss" },
    { id: "balanceSheet", label: "Balance Sheet" },
    { id: "cashFlow", label: "Cash Flow" },
  ];

  const selectedRows =
    stmtTab === "pnl"
      ? stmts.pnl
      : stmtTab === "balanceSheet"
      ? stmts.balanceSheet
      : stmts.cashFlow;

  return (
    <div className="space-y-6">
      {/* ── Financial Statements ─────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Financial Statements</h2>
          <button className="text-sm text-violet hover:underline">View all</button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0 mb-6 border-b border-border overflow-x-auto scrollbar-hide">
          {stmtTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setStmtTab(t.id)}
              className={`shrink-0 px-4 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                stmtTab === t.id
                  ? "tab-active text-violet"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <FinTable
          rows={selectedRows}
          label={stmtTab === "pnl" ? "Particulars" : stmtTab === "balanceSheet" ? "Particulars" : "Particulars"}
        />
      </div>

      {/* ── Peer Comparison ────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Peer Comparison</h2>
          <button className="text-sm text-violet hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Company", "PE", "ROE", "Net Margin", "Debt/Equity"].map((col) => (
                  <th
                    key={col}
                    className="py-3 px-3 text-xs font-semibold text-text-secondary text-left first:pl-0"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.peers.map((peer) => (
                <tr
                  key={peer.ticker}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    backgroundColor: peer.isSelected ? "rgba(124,92,255,0.05)" : "transparent",
                  }}
                >
                  <td className="py-3 pl-0 pr-3">
                    <span
                      className="text-sm font-medium"
                      style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}
                    >
                      {peer.ticker}
                    </span>
                    <p className="text-xs text-text-secondary">{peer.name}</p>
                  </td>
                  <td
                    className="py-3 px-3 text-sm font-mono-num"
                    style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}
                  >
                    {peer.pe.toFixed(1)}
                  </td>
                  <td
                    className="py-3 px-3 text-sm font-mono-num"
                    style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}
                  >
                    {peer.roe.toFixed(1)}%
                  </td>
                  <td
                    className="py-3 px-3 text-sm font-mono-num"
                    style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}
                  >
                    {peer.netMargin.toFixed(1)}%
                  </td>
                  <td
                    className="py-3 px-3 text-sm font-mono-num"
                    style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}
                  >
                    {peer.debtEquity.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
