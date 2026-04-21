"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResponse } from "@/types";
import { signalColor } from "@/lib/utils";

interface Props {
  data: AnalysisResponse;
}

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "All"] as const;

function SignalPill({ signal, label }: { signal: string; label: string }) {
  const cls =
    signal === "bullish"
      ? "signal-pill-bullish"
      : signal === "bearish"
      ? "signal-pill-bearish"
      : "signal-pill-neutral";
  return <span className={cls}>{label}</span>;
}

function TechSummaryTile({
  label,
  value,
  signal,
  sub,
}: {
  label: string;
  value: string | number;
  signal: string;
  sub?: string;
}) {
  return (
    <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: "var(--surface-3)" }}>
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className={`text-base font-bold font-mono-num ${signalColor(signal)}`}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
    </div>
  );
}

// Lightweight chart rendered client-side only
function CandlestickChart({ data, timeframe }: { data: AnalysisResponse; timeframe: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      if (!containerRef.current) return;
      try {
        const { createChart } = await import("lightweight-charts");
        const container = containerRef.current;

        const chart = createChart(container, {
          width: container.clientWidth,
          height: 280,
          layout: {
            background: { color: "transparent" },
            textColor: "#9CA3AF",
          },
          grid: {
            vertLines: { color: "#2A2F3A" },
            horzLines: { color: "#2A2F3A" },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: "#2A2F3A",
          },
          timeScale: {
            borderColor: "#2A2F3A",
            timeVisible: true,
          },
        });

        chartRef.current = chart;

        // Filter candles by timeframe
        const allCandles = data.chartData.daily;
        let candles = allCandles;
        const cutoffs: Record<string, number> = {
          "1D": 1, "1W": 5, "1M": 22, "3M": 66, "6M": 132, "1Y": 252, "5Y": 1260,
        };
        if (timeframe !== "All" && cutoffs[timeframe]) {
          candles = allCandles.slice(-cutoffs[timeframe]);
        }

        const candleSeries = chart.addCandlestickSeries({
          upColor: "#22C55E",
          downColor: "#EF4444",
          borderUpColor: "#22C55E",
          borderDownColor: "#EF4444",
          wickUpColor: "#22C55E",
          wickDownColor: "#EF4444",
        });

        candleSeries.setData(
          candles.map((c) => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
        );

        // MA lines
        const ma20 = chart.addLineSeries({ color: "#F59E0B", lineWidth: 1.5 });
        const ma50 = chart.addLineSeries({ color: "#7C5CFF", lineWidth: 1.5 });
        const ma200 = chart.addLineSeries({ color: "#22D3A8", lineWidth: 1.5 });

        const calcMA = (arr: typeof candles, period: number) => {
          return arr.slice(period - 1).map((_, i) => ({
            time: arr[i + period - 1].time,
            value: arr.slice(i, i + period).reduce((s, c) => s + c.close, 0) / period,
          }));
        };

        if (candles.length >= 20) ma20.setData(calcMA(candles, 20));
        if (candles.length >= 50) ma50.setData(calcMA(candles, 50));
        if (candles.length >= 200) ma200.setData(calcMA(candles, 200));

        chart.timeScale().fitContent();
        setChartReady(true);

        const handleResize = () => {
          if (container) chart.applyOptions({ width: container.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        cleanup = () => {
          window.removeEventListener("resize", handleResize);
          chart.remove();
        };
      } catch (e) {
        console.error("Chart init error:", e);
      }
    };

    init();
    return () => cleanup?.();
  }, [data, timeframe]);

  return (
    <div ref={containerRef} className="w-full" style={{ minHeight: 280 }}>
      {!chartReady && (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 rounded-full border-2 border-violet border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function TechnicalsTab({ data }: Props) {
  const [timeframe, setTimeframe] = useState<string>("1Y");
  const tech = data.technical;
  const summary = tech.summary;

  return (
    <div className="space-y-6">
      {/* ── Technical Summary Bar ───────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Technical Summary</h2>
          <SignalPill signal={tech.overallSignal} label={tech.overallSignal === "bullish" ? "Bullish" : tech.overallSignal === "bearish" ? "Bearish" : "Neutral"} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TechSummaryTile
            label="Trend"
            value={String(summary.trend.value)}
            signal={summary.trend.signal}
            sub="Uptrend ↑"
          />
          <TechSummaryTile
            label="RSI (14)"
            value={String(summary.rsi.value)}
            signal={summary.rsi.signal}
            sub={String(summary.rsi.label)}
          />
          <TechSummaryTile
            label="MACD"
            value={String(summary.macd.value)}
            signal={summary.macd.signal}
          />
          <TechSummaryTile
            label="Volume"
            value={String(summary.volume.value)}
            signal={summary.volume.signal}
          />
        </div>

        {/* MA chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: `MA 20: ${tech.movingAverages.ma20.toLocaleString("en-IN")}`, color: "#F59E0B" },
            { label: `MA 50: ${tech.movingAverages.ma50.toLocaleString("en-IN")}`, color: "#7C5CFF" },
            { label: `MA 200: ${tech.movingAverages.ma200.toLocaleString("en-IN")}`, color: "#22D3A8" },
          ].map((m) => (
            <span
              key={m.label}
              className="text-xs px-3 py-1 rounded-full font-mono-num"
              style={{ backgroundColor: "var(--surface-3)", color: m.color, border: `1px solid ${m.color}33` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Candlestick Chart ────────────────────────────────────────── */}
      <div className="card">
        {/* Timeframe tabs */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: timeframe === tf ? "var(--violet)" : "var(--surface-3)",
                color: timeframe === tf ? "white" : "var(--text-secondary)",
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        <CandlestickChart data={data} timeframe={timeframe} />
      </div>

      {/* ── Strategies ───────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Top Signals &amp; Strategies</h2>
          <button className="text-sm text-violet hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tech.strategies.map((s) => (
            <div key={s.name} className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-3)" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">{s.name}</h3>
                <SignalPill
                  signal={s.signal}
                  label={s.signal.charAt(0).toUpperCase() + s.signal.slice(1)}
                />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── All Indicators ────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="text-base font-semibold text-text-primary mb-4">All Indicators</h2>
        <div className="space-y-1">
          {Object.entries(tech.indicators).map(([key, ind]) => (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-3 transition-colors"
            >
              <div>
                <span className="text-sm text-text-primary">{ind.label}</span>
                {ind.tooltip && (
                  <span className="ml-2 text-xs text-text-secondary hidden md:inline">
                    — {ind.tooltip.slice(0, 60)}...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono-num text-text-secondary">
                  {typeof ind.value === "number" ? ind.value.toLocaleString() : ind.value}
                </span>
                <SignalPill
                  signal={ind.signal}
                  label={ind.label}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
