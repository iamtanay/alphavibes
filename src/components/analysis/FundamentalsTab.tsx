"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ComposedChart, Legend,
} from "recharts";
import type { AnalysisResponse } from "@/types";
import { ratingBadgeVariant } from "@/lib/utils";

interface Props {
  data: AnalysisResponse;
}

function RatingBadge({ rating, label }: { rating: string; label: string }) {
  const variant = ratingBadgeVariant(rating);
  const cls =
    variant === "success"
      ? "badge-success"
      : variant === "warning"
      ? "badge-warning"
      : variant === "danger"
      ? "badge-danger"
      : "badge-info";
  return <span className={`${cls} text-[11px] px-2 py-0.5`}>{label}</span>;
}

function formatCr(v: number) {
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

export default function FundamentalsTab({ data }: Props) {
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual");
  const fund = data.fundamental;
  const ratios = fund.keyRatios;

  const chartData =
    period === "annual"
      ? fund.financialTrends.annual.map((d) => ({
          label: d.year,
          Revenue: Math.round(d.revenue / 1000),
          Profit: Math.round(d.profit / 1000),
        }))
      : fund.financialTrends.quarterly.map((d) => ({
          label: d.quarter,
          Revenue: Math.round(d.revenue / 1000),
          Profit: Math.round(d.profit / 1000),
        }));

  const keyRatioList = [
    { key: "pe", ratingLabel: ratios.pe.rating === "high" ? "High" : ratios.pe.rating === "good" ? "Good" : "Fair" },
    { key: "roe", ratingLabel: ratios.roe.rating === "good" ? "Good" : ratios.roe.rating === "fair" ? "Fair" : "Poor" },
    { key: "roce", ratingLabel: ratios.roce.rating === "good" ? "Good" : "Fair" },
    { key: "debtEquity", ratingLabel: ratios.debtEquity.rating === "good" ? "Low" : ratios.debtEquity.rating === "fair" ? "Medium" : "High" },
    { key: "eps", ratingLabel: "Positive" },
    { key: "dividendYield", ratingLabel: ratios.dividendYield.rating === "good" ? "Good" : "Fair" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Key Ratios ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Key Ratios</h2>
          <button className="text-sm text-violet hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {keyRatioList.map(({ key, ratingLabel }) => {
            const r = ratios[key];
            return (
              <div key={key} className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-3)" }}>
                <p className="text-xs text-text-secondary mb-1">{r.label}</p>
                <p className="text-xl font-bold font-mono-num text-text-primary mb-2">
                  {r.value}{key === "roe" || key === "roce" || key === "dividendYield" ? "%" : ""}
                </p>
                <RatingBadge rating={r.rating} label={ratingLabel} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Financial Trends ───────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-text-primary">Financial Trends (5Y)</h2>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {(["annual", "quarterly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-xs font-medium transition-colors capitalize"
                style={{
                  backgroundColor: period === p ? "var(--violet)" : "transparent",
                  color: period === p ? "white" : "var(--text-secondary)",
                }}
              >
                {p === "annual" ? "Annual" : "Quarterly"}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-violet mb-4">
          Revenue: ₹{(fund.financialTrends.annual.at(-1)?.revenue ?? 0) >= 100000
            ? ((fund.financialTrends.annual.at(-1)?.revenue ?? 0) / 100000).toFixed(2) + " L Cr"
            : (fund.financialTrends.annual.at(-1)?.revenue ?? 0) + " Cr"}{" "}
          · {fund.financialTrends.revenueCagr5y}% CAGR
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} tickFormatter={formatCr} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `₹${v}K Cr`}
                />
                <Bar dataKey="Revenue" fill="#7C5CFF" opacity={0.7} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#22D3A8" opacity={0.7} radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#7C5CFF"
                  strokeWidth={2}
                  dot={{ fill: "#7C5CFF", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Ratios Snapshot */}
          <div
            className="rounded-xl p-4 min-w-[180px]"
            style={{ backgroundColor: "var(--surface-3)" }}
          >
            <h3 className="text-xs font-semibold text-text-secondary mb-3">Ratios Snapshot</h3>
            {[
              { label: "Gross Margin", value: fund.ratiosSnapshot.grossMargin },
              { label: "Operating Margin", value: fund.ratiosSnapshot.operatingMargin },
              { label: "Net Margin", value: fund.ratiosSnapshot.netMargin },
              { label: "Current Ratio", value: fund.ratiosSnapshot.currentRatio },
              { label: "Return on Assets", value: fund.ratiosSnapshot.returnOnAssets },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-border last:border-0 text-xs">
                <span className="text-text-secondary">{r.label}</span>
                <span className="font-mono-num font-medium text-text-primary">{r.value}%</span>
              </div>
            ))}
            <button className="mt-3 w-full btn-primary text-xs py-2 px-3">View all ratios</button>
          </div>
        </div>
      </div>
    </div>
  );
}
