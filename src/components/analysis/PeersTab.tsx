"use client";

import type { AnalysisResponse } from "@/types";

interface Props { data: AnalysisResponse; }

export default function PeersTab({ data }: Props) {
  const peers = data.peers;
  const cols = [
    { key: "ticker", label: "Company" },
    { key: "pe", label: "P/E", suffix: "x" },
    { key: "roe", label: "ROE", suffix: "%" },
    { key: "netMargin", label: "Net Margin", suffix: "%" },
    { key: "debtEquity", label: "Debt/Equity" },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-base font-semibold text-text-primary mb-4">Peer Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {cols.map((c) => (
                  <th key={c.key} className="py-3 px-3 text-left text-xs font-semibold text-text-secondary first:pl-0">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {peers.map((peer) => (
                <tr
                  key={peer.ticker}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    backgroundColor: peer.isSelected ? "rgba(124,92,255,0.06)" : "transparent",
                  }}
                >
                  <td className="py-3 pl-0 pr-3">
                    <p className="text-sm font-semibold" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>
                      {peer.ticker}
                    </p>
                    <p className="text-xs text-text-secondary">{peer.name}</p>
                  </td>
                  <td className="py-3 px-3 text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>
                    {peer.pe.toFixed(1)}x
                  </td>
                  <td className="py-3 px-3 text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>
                    {peer.roe.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>
                    {peer.netMargin.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>
                    {peer.debtEquity.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-text-primary mb-4">Sector Averages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg P/E", value: (peers.reduce((s, p) => s + p.pe, 0) / peers.length).toFixed(1) + "x" },
            { label: "Avg ROE", value: (peers.reduce((s, p) => s + p.roe, 0) / peers.length).toFixed(1) + "%" },
            { label: "Avg Net Margin", value: (peers.reduce((s, p) => s + p.netMargin, 0) / peers.length).toFixed(1) + "%" },
            { label: "Avg D/E", value: (peers.reduce((s, p) => s + p.debtEquity, 0) / peers.length).toFixed(2) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-3)" }}>
              <p className="text-xs text-text-secondary mb-1">{stat.label}</p>
              <p className="text-xl font-bold font-mono-num text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
