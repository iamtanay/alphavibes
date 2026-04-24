"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import type { AnalysisResponse } from "@/types";
import { Info, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

interface Props { data: AnalysisResponse; }

const COLORS = ["#7C5CFF", "#22D3A8", "#F59E0B", "#5A67FF"];

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

const HOLDER_META: Record<string, { label: string; what: string; goodHigh: boolean }> = {
  Promoter: { label: "Promoter", what: "Company founders or controlling shareholders. High stake = aligned interest. Very high (>75%) = less free float.", goodHigh: true },
  FII:      { label: "FII", what: "Foreign Institutional Investors — global funds, hedge funds, pension funds. FII buying = international confidence.", goodHigh: true },
  DII:      { label: "DII", what: "Domestic Institutional Investors — Indian mutual funds, LIC, insurance companies. DII buying = local confidence.", goodHigh: true },
  Public:   { label: "Retail / Public", what: "Individual retail investors like you. Higher public share = more liquidity.", goodHigh: false },
};

export default function ShareholdingTab({ data }: Props) {
  const sh = data.shareholding;

  const pieData = [
    { name: "Promoter", value: sh.promoter },
    { name: "FII", value: sh.fii },
    { name: "DII", value: sh.dii },
    { name: "Public", value: sh.public },
  ];

  // Calculate QoQ change from latest two quarters
  const trend = sh.trend;
  const latest = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  const promoterChange = latest && prev ? latest.promoter - prev.promoter : null;
  const fiiChange = latest && prev ? latest.fii - prev.fii : null;
  const diiChange = latest && prev ? latest.dii - prev.dii : null;

  return (
    <div className="space-y-6">

      {/* Current Shareholding */}
      <div className="card">
        <SectionLabel>Who Owns This Company?</SectionLabel>
        <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
          Every listed company&apos;s ownership is publicly disclosed every quarter. Here&apos;s the current breakdown.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Donut */}
          <div className="flex-shrink-0" style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(
                    value: number | string | readonly (number | string)[] | undefined
                  ) => {
                    if (typeof value === "number") return `${value.toFixed(1)}%`;
                    if (Array.isArray(value)) return value.join(", ");
                    return value ?? "";
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with explanations */}
          <div className="flex-1 space-y-3">
            {pieData.map((item, i) => {
              const meta = HOLDER_META[item.name];
              const change = item.name === "Promoter" ? promoterChange : item.name === "FII" ? fiiChange : item.name === "DII" ? diiChange : null;
              return (
                <div key={item.name} className="rounded-xl p-3" style={{ backgroundColor: "var(--surface-3)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {change !== null && (
                        <span className="text-xs font-medium flex items-center gap-0.5"
                          style={{ color: change >= 0 ? "var(--success)" : "var(--danger)" }}>
                          {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                        </span>
                      )}
                      <span className="text-base font-bold font-mono-num" style={{ color: "var(--text-primary)" }}>
                        {item.value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{meta.what}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pledge Alert */}
        {sh.promoterPledge > 0 ? (
          <div className="mt-4 rounded-xl p-4 flex gap-3"
            style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--danger)" }}>Promoter Pledge: {sh.promoterPledge.toFixed(1)}%</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Pledged shares mean the promoter has used their own shares as collateral for loans. If the stock falls, lenders may sell these shares — causing further price drops. High pledging is a red flag.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl p-4 flex gap-3"
            style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle size={15} className="shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--success)" }}>No Promoter Pledge</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                The promoters haven&apos;t pledged any shares as loan collateral. This is a positive indicator — it means there&apos;s no forced-selling risk from promoter loans.
              </p>
            </div>
          </div>
        )}

        <ExplainBox>
          The QoQ change (%) shows how each group&apos;s holding changed this quarter. Increasing FII/DII stake = institutions are buying, which is often a positive signal. Declining promoter stake may warrant investigation.
        </ExplainBox>
      </div>

      {/* Trend Chart */}
      <div className="card">
        <SectionLabel>Shareholding Trend — Last {trend.length} Quarters</SectionLabel>
        <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
          Watch how ownership has shifted over time — sustained FII/DII accumulation often precedes rallies.
        </p>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sh.trend} margin={{ left: -10, right: 10 }}>
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-secondary)" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(
                  value: number | string | readonly (number | string)[] | undefined
                ) => {
                  if (typeof value === "number") return `${value.toFixed(1)}%`;
                  if (Array.isArray(value)) return value.join(", ");
                  return value ?? "";
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
              <Bar dataKey="promoter" stackId="a" fill="#7C5CFF" name="Promoter" />
              <Bar dataKey="fii" stackId="a" fill="#22D3A8" name="FII" />
              <Bar dataKey="dii" stackId="a" fill="#F59E0B" name="DII" />
              <Bar dataKey="public" stackId="a" fill="#5A67FF" name="Public" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ExplainBox>
          Each bar represents one quarter. A rising teal (FII) or amber (DII) segment means institutional investors are increasing their position — often a vote of confidence in the company&apos;s future.
        </ExplainBox>
      </div>
    </div>
  );
}
