"use client";

import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import type { AnalysisResponse } from "@/types";
import { ratingBadgeVariant } from "@/lib/utils";
import { Info, HelpCircle } from "lucide-react";

interface Props { data: AnalysisResponse; }

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

function RatingBadge({ rating, label }: { rating: string; label: string }) {
  const variant = ratingBadgeVariant(rating);
  const cls = variant === "success" ? "badge-success" : variant === "warning" ? "badge-warning" : variant === "danger" ? "badge-danger" : "badge-info";
  return <span className={`${cls} text-[10px] px-2 py-0.5`}>{label}</span>;
}

function formatCr(v: number) {
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

const RATIO_META: Record<string, { what: string; good: string }> = {
  pe:           { what: "Price-to-Earnings: how much you pay for ₹1 of profit.", good: "Lower = cheaper. But low P/E can also mean low growth expectations." },
  roe:          { what: "Return on Equity: how efficiently the company uses shareholder money.", good: "Above 15% is generally considered healthy." },
  roce:         { what: "Return on Capital Employed: efficiency of total capital — equity + debt.", good: "Higher ROCE indicates better use of all capital, not just equity." },
  debtEquity:   { what: "Debt-to-Equity: how much debt the company has vs shareholder equity.", good: "Below 1 is generally safe. Above 2 may signal overleveraging." },
  eps:          { what: "Earnings Per Share: how much profit is attributed to each share.", good: "Rising EPS over time signals healthy profit growth." },
  dividendYield:{ what: "Dividend Yield: annual dividend as % of current share price.", good: "Indicates how much income you earn just from holding the stock." },
};

export default function FundamentalsTab({ data }: Props) {
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual");
  const [expandedRatio, setExpandedRatio] = useState<string | null>(null);
  const fund = data.fundamental;
  const ratios = fund.keyRatios;

  const chartData =
    period === "annual"
      ? fund.financialTrends.annual.map((d) => ({ label: d.year, Revenue: Math.round(d.revenue / 1000), Profit: Math.round(d.profit / 1000) }))
      : fund.financialTrends.quarterly.map((d) => ({ label: d.quarter, Revenue: Math.round(d.revenue / 1000), Profit: Math.round(d.profit / 1000) }));

  const keyRatioList = [
    { key: "pe",           ratingLabel: ratios.pe.rating === "high" ? "High" : ratios.pe.rating === "good" ? "Good" : "Fair" },
    { key: "roe",          ratingLabel: ratios.roe.rating === "good" ? "Good" : ratios.roe.rating === "fair" ? "Fair" : "Poor" },
    { key: "roce",         ratingLabel: ratios.roce.rating === "good" ? "Good" : "Fair" },
    { key: "debtEquity",   ratingLabel: ratios.debtEquity.rating === "good" ? "Low" : ratios.debtEquity.rating === "fair" ? "Medium" : "High" },
    { key: "eps",          ratingLabel: "Positive" },
    { key: "dividendYield",ratingLabel: ratios.dividendYield.rating === "good" ? "Good" : "Fair" },
  ] as const;

  return (
    <div className="space-y-6">

      {/* Key Ratios */}
      <div className="card">
        <SectionLabel>Key Ratios</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {keyRatioList.map(({ key, ratingLabel }) => {
            const r = ratios[key];
            const isExpanded = expandedRatio === key;
            const meta = RATIO_META[key];
            return (
              <div key={key}
                className="rounded-xl p-4 cursor-pointer transition-all"
                style={{ backgroundColor: "var(--surface-3)", border: isExpanded ? "1px solid rgba(124,92,255,0.4)" : "1px solid transparent" }}
                onClick={() => setExpandedRatio(isExpanded ? null : key)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{r.label}</p>
                      <HelpCircle size={11} style={{ color: "var(--text-secondary)", opacity: 0.6 }} />
                    </div>
                    <p className="text-2xl font-bold font-mono-num mb-2" style={{ color: "var(--text-primary)" }}>
                      {r.value}{key === "roe" || key === "roce" || key === "dividendYield" ? "%" : ""}
                    </p>
                    <RatingBadge rating={r.rating} label={ratingLabel} />
                  </div>
                  {r.benchmark && (
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Benchmark</p>
                      <p className="text-xs font-mono-num font-medium" style={{ color: "var(--text-secondary)" }}>{r.benchmark}</p>
                    </div>
                  )}
                </div>
                {isExpanded && meta && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs leading-relaxed mb-1" style={{ color: "var(--text-primary)" }}>{meta.what}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{meta.good}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <ExplainBox>
          Tap any ratio to learn what it means and how to interpret it. Ratios are most useful when compared against the industry average or historical values — a single number rarely tells the whole story.
        </ExplainBox>
      </div>

      {/* Financial Trends */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>Revenue &amp; Profit Trends</SectionLabel>
          <div className="flex rounded-lg overflow-hidden mb-4" style={{ border: "1px solid var(--border)" }}>
            {(["annual", "quarterly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-xs font-medium transition-colors capitalize"
                style={{ backgroundColor: period === p ? "var(--violet)" : "transparent", color: period === p ? "white" : "var(--text-secondary)" }}>
                {p === "annual" ? "Annual" : "Quarterly"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#7C5CFF", opacity: 0.8 }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22D3A8", opacity: 0.8 }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Profit</span>
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--violet)" }}>
            {fund.financialTrends.revenueCagr5y}% Revenue CAGR (5Y)
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} tickFormatter={formatCr} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => `₹${Number(v ?? 0)}K Cr`}
                />
                <Bar dataKey="Revenue" fill="#7C5CFF" opacity={0.7} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#22D3A8" opacity={0.7} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Revenue" stroke="#7C5CFF" strokeWidth={2} dot={{ fill: "#7C5CFF", r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-4 min-w-[180px]" style={{ backgroundColor: "var(--surface-3)" }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Margin Snapshot</p>
            {[
              { label: "Gross Margin",    value: fund.ratiosSnapshot.grossMargin,    tip: "Revenue minus cost of goods" },
              { label: "Operating Margin",value: fund.ratiosSnapshot.operatingMargin, tip: "After all operating costs" },
              { label: "Net Margin",      value: fund.ratiosSnapshot.netMargin,       tip: "Final take-home profit %" },
              { label: "Current Ratio",   value: fund.ratiosSnapshot.currentRatio,    tip: "Can it pay short-term debts?" },
              { label: "Return on Assets",value: fund.ratiosSnapshot.returnOnAssets,  tip: "Profit per rupee of assets" },
            ].map((r) => (
              <div key={r.label} className="py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                  <span className="font-mono-num font-medium" style={{ color: "var(--text-primary)" }}>{r.value}%</span>
                </div>
                <p className="text-[10px]" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{r.tip}</p>
              </div>
            ))}
          </div>
        </div>

        <ExplainBox>
          Revenue is what the company earns before any expenses. Profit is what&apos;s left after. A company that grows revenue but shrinks profit is a warning sign — margins matter as much as topline growth.
        </ExplainBox>
      </div>
    </div>
  );
}
