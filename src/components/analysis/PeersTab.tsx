"use client";

import type { AnalysisResponse, PeerStock } from "@/types";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

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

const METRIC_META = {
  pe:         { label: "P/E Ratio",     suffix: "x",  tooltip: "Lower = cheaper relative to earnings. Industry-specific — tech trades higher than utilities.",   higherBetter: false },
  roe:        { label: "ROE",           suffix: "%",  tooltip: "Return on Equity. How efficiently the company uses investor money. Higher is better.",             higherBetter: true  },
  netMargin:  { label: "Net Margin",    suffix: "%",  tooltip: "Final profit as % of revenue. Higher = more profitable business model.",                          higherBetter: true  },
  debtEquity: { label: "Debt / Equity", suffix: "",   tooltip: "Lower = safer financial structure. Above 2 can be risky depending on the sector.",                higherBetter: false },
};

function MetricBar({ value, max, higherBetter, isSelected }: { value: number; max: number; higherBetter: boolean; isSelected: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  const isGood = higherBetter ? pct >= 50 : pct <= 50;
  const barColor = isSelected ? "var(--violet)" : isGood ? "var(--success)" : "var(--warning)";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor, opacity: 0.8 }} />
      </div>
    </div>
  );
}

export default function PeersTab({ data }: Props) {
  const peers = data.peers;
  const selected = peers.find((p) => p.isSelected);
  const avgPE = peers.reduce((s, p) => s + p.pe, 0) / peers.length;
  const avgROE = peers.reduce((s, p) => s + p.roe, 0) / peers.length;
  const avgNetMargin = peers.reduce((s, p) => s + p.netMargin, 0) / peers.length;
  const avgDE = peers.reduce((s, p) => s + p.debtEquity, 0) / peers.length;

  const maxPE = Math.max(...peers.map((p) => p.pe));
  const maxROE = Math.max(...peers.map((p) => p.roe));
  const maxNM = Math.max(...peers.map((p) => p.netMargin));
  const maxDE = Math.max(...peers.map((p) => p.debtEquity));

  const comparedTo = (val: number, avg: number, higherBetter: boolean) => {
    const diff = val - avg;
    const isGood = higherBetter ? diff >= 0 : diff <= 0;
    const sign = diff >= 0 ? "+" : "";
    return { label: `${sign}${diff.toFixed(1)} vs avg`, isGood };
  };

  return (
    <div className="space-y-6">

      {/* Selected stock vs sector */}
      {selected && (
        <div className="card">
          <SectionLabel>How {selected.ticker} Compares to Peers</SectionLabel>
          <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
            Here&apos;s how {selected.name} stacks up against the sector average across key metrics.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "pe",         val: selected.pe,         avg: avgPE,         max: maxPE,  meta: METRIC_META.pe },
              { key: "roe",        val: selected.roe,        avg: avgROE,        max: maxROE, meta: METRIC_META.roe },
              { key: "netMargin",  val: selected.netMargin,  avg: avgNetMargin,  max: maxNM,  meta: METRIC_META.netMargin },
              { key: "debtEquity", val: selected.debtEquity, avg: avgDE,         max: maxDE,  meta: METRIC_META.debtEquity },
            ].map(({ key, val, avg, max, meta }) => {
              const cmp = comparedTo(val, avg, meta.higherBetter);
              return (
                <div key={key} className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-3)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{meta.label}</p>
                  <p className="text-2xl font-bold font-mono-num mb-1" style={{ color: "var(--text-primary)" }}>
                    {val.toFixed(1)}{meta.suffix}
                  </p>
                  <MetricBar value={val} max={max} higherBetter={meta.higherBetter} isSelected={true} />
                  <p className="text-[11px] mt-2 font-medium" style={{ color: cmp.isGood ? "var(--success)" : "var(--warning)" }}>
                    {cmp.label}
                  </p>
                  <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{meta.tooltip}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full comparison table */}
      <div className="card">
        <SectionLabel>Full Peer Table</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="py-3 text-left text-xs font-semibold pl-0 pr-4" style={{ color: "var(--text-secondary)" }}>Company</th>
                {Object.values(METRIC_META).map((m) => (
                  <th key={m.label} className="py-3 px-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {peers.map((peer) => (
                <tr key={peer.ticker} style={{ borderBottom: "1px solid var(--border)", backgroundColor: peer.isSelected ? "rgba(124,92,255,0.05)" : "transparent" }}>
                  <td className="py-3 pl-0 pr-4">
                    <p className="text-sm font-semibold" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>{peer.ticker}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{peer.name}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>{peer.pe.toFixed(1)}x</p>
                    <MetricBar value={peer.pe} max={maxPE} higherBetter={false} isSelected={peer.isSelected} />
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>{peer.roe.toFixed(1)}%</p>
                    <MetricBar value={peer.roe} max={maxROE} higherBetter={true} isSelected={peer.isSelected} />
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>{peer.netMargin.toFixed(1)}%</p>
                    <MetricBar value={peer.netMargin} max={maxNM} higherBetter={true} isSelected={peer.isSelected} />
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-sm font-mono-num" style={{ color: peer.isSelected ? "var(--violet)" : "var(--text-primary)" }}>{peer.debtEquity.toFixed(2)}</p>
                    <MetricBar value={peer.debtEquity} max={maxDE} higherBetter={false} isSelected={peer.isSelected} />
                  </td>
                </tr>
              ))}
              {/* Average row */}
              <tr style={{ backgroundColor: "rgba(124,92,255,0.04)" }}>
                <td className="py-3 pl-0 pr-4">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Sector Avg</p>
                </td>
                {[avgPE.toFixed(1) + "x", avgROE.toFixed(1) + "%", avgNetMargin.toFixed(1) + "%", avgDE.toFixed(2)].map((v, i) => (
                  <td key={i} className="py-3 px-3 text-sm font-mono-num font-semibold" style={{ color: "var(--text-secondary)" }}>{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <ExplainBox>
          The highlighted row is the stock you&apos;re analyzing. The mini bars show where each company stands relative to the group — longer bar = higher value. The bottom row shows the sector average so you can see where everyone stands.
        </ExplainBox>
      </div>
    </div>
  );
}
