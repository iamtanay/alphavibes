"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
} from "recharts";
import type { AnalysisResponse } from "@/types";

interface Props { data: AnalysisResponse; }

const COLORS = ["#7C5CFF", "#22D3A8", "#F59E0B", "#5A67FF"];

export default function ShareholdingTab({ data }: Props) {
  const sh = data.shareholding;

  const pieData = [
    { name: "Promoter", value: sh.promoter },
    { name: "FII", value: sh.fii },
    { name: "DII", value: sh.dii },
    { name: "Public", value: sh.public },
  ];

  return (
    <div className="space-y-6">
      {/* Current Shareholding */}
      <div className="card">
        <h2 className="text-base font-semibold text-text-primary mb-4">Current Shareholding Pattern</h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Pie */}
          <div style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-3 flex-1">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-text-secondary">{item.name}</span>
                </div>
                <span className="text-sm font-mono-num font-semibold text-text-primary">
                  {item.value.toFixed(1)}%
                </span>
              </div>
            ))}
            {sh.promoterPledge > 0 && (
              <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p className="text-xs text-danger">⚠ Promoter Pledge: {sh.promoterPledge.toFixed(1)}%</p>
              </div>
            )}
            {sh.promoterPledge === 0 && (
              <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-xs text-success">✓ No Promoter Pledge</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="card">
        <h2 className="text-base font-semibold text-text-primary mb-4">Shareholding Trend (Quarterly)</h2>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sh.trend} margin={{ left: -10, right: 10 }}>
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => `${v.toFixed(1)}%`}
              />
              <Bar dataKey="promoter" stackId="a" fill="#7C5CFF" name="Promoter" />
              <Bar dataKey="fii" stackId="a" fill="#22D3A8" name="FII" />
              <Bar dataKey="dii" stackId="a" fill="#F59E0B" name="DII" />
              <Bar dataKey="public" stackId="a" fill="#5A67FF" name="Public" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
