"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResponse } from "@/types";
import { signalColor } from "@/lib/utils";
import { Info, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";

interface Props { data: AnalysisResponse; }

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "All"] as const;

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

function SignalPill({ signal, label }: { signal: string; label: string }) {
  const cls = signal === "bullish" ? "signal-pill-bullish" : signal === "bearish" ? "signal-pill-bearish" : "signal-pill-neutral";
  return <span className={cls}>{label}</span>;
}

function SignalIcon({ signal }: { signal: string }) {
  if (signal === "bullish") return <TrendingUp size={13} style={{ color: "var(--success)" }} />;
  if (signal === "bearish") return <TrendingDown size={13} style={{ color: "var(--danger)" }} />;
  return <Minus size={13} style={{ color: "var(--warning)" }} />;
}

const INDICATOR_EXPLAINERS: Record<string, string> = {
  rsi:         "Momentum oscillator (0-100). Above 70 = overbought (may drop). Below 30 = oversold (may rise).",
  macd:        "Trend-following indicator. When MACD line crosses above signal line = bullish. Below = bearish.",
  bollinger:   "Price envelope. Price near upper band = stretched high. Near lower band = stretched low.",
  stochastic:  "Compares closing price to price range. Like RSI, above 80 = overbought, below 20 = oversold.",
  cci:         "Commodity Channel Index. Measures deviation from average price. Extreme values signal reversals.",
  adx:         "Average Directional Index. Measures trend strength — not direction. Above 25 = strong trend.",
  supertrend:  "Trend-following indicator. Green = uptrend, Red = downtrend. Simple and widely followed.",
  atr:         "Average True Range. Measures volatility. Higher = bigger price swings.",
};

function CandlestickChart({ data, timeframe }: { data: AnalysisResponse; timeframe: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const init = async () => {
      if (!containerRef.current) return;
      try {
        const {
          createChart,
          CandlestickSeries,
          LineSeries,
        } = await import("lightweight-charts");
        type LineWidth = 1 | 2 | 3 | 4;

        const container = containerRef.current;
        const chart = createChart(container, {
          width: container.clientWidth, height: 300,
          layout: { background: { color: "transparent" }, textColor: "#9CA3AF" },
          grid: { vertLines: { color: "#2A2F3A" }, horzLines: { color: "#2A2F3A" } },
          crosshair: { mode: 1 },
          rightPriceScale: { borderColor: "#2A2F3A" },
          timeScale: { borderColor: "#2A2F3A", timeVisible: true },
        });
        chartRef.current = chart;

        const allCandles = data.chartData.daily;
        const cutoffs: Record<string, number> = {
          "1D": 1, "1W": 5, "1M": 22, "3M": 66,
          "6M": 132, "1Y": 252, "5Y": 1260,
        };
        const candles = timeframe !== "All" && cutoffs[timeframe]
          ? allCandles.slice(-cutoffs[timeframe])
          : allCandles;

        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#22C55E", downColor: "#EF4444",
          borderUpColor: "#22C55E", borderDownColor: "#EF4444",
          wickUpColor: "#22C55E", wickDownColor: "#EF4444",
        });
        candleSeries.setData(
          candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }))
        );

        const calcMA = (arr: typeof candles, period: number) =>
          arr.slice(period - 1).map((_, i) => ({
            time: arr[i + period - 1].time,
            value: arr.slice(i, i + period).reduce((s, c) => s + c.close, 0) / period,
          }));

        if (candles.length >= 20)
          chart.addSeries(LineSeries, { color: "#F59E0B", lineWidth: 2 as LineWidth }).setData(calcMA(candles, 20));
        if (candles.length >= 50)
          chart.addSeries(LineSeries, { color: "#7C5CFF", lineWidth: 2 as LineWidth }).setData(calcMA(candles, 50));
        if (candles.length >= 200)
          chart.addSeries(LineSeries, { color: "#22D3A8", lineWidth: 2 as LineWidth }).setData(calcMA(candles, 200));

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
      } catch (e) { console.error("Chart init error:", e); }
    };
    init();
    return () => cleanup?.();
  }, [data, timeframe]);

  return (
    <div ref={containerRef} className="w-full" style={{ minHeight: 300 }}>
      {!chartReady && (
        <div className="flex items-center justify-center h-72">
          <div className="w-6 h-6 rounded-full border-2 border-violet border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function TechnicalsTab({ data }: Props) {
  const [timeframe, setTimeframe] = useState<string>("1Y");
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const tech = data.technical;
  const summary = tech.summary;

  const overallBg = tech.overallSignal === "bullish" ? "rgba(34,197,94,0.06)" : tech.overallSignal === "bearish" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)";
  const overallBorder = tech.overallSignal === "bullish" ? "rgba(34,197,94,0.2)" : tech.overallSignal === "bearish" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)";
  const overallLabel = tech.overallSignal === "bullish" ? "Bullish" : tech.overallSignal === "bearish" ? "Bearish" : "Neutral";
  const overallExplain = tech.overallSignal === "bullish"
    ? "Most technical indicators are pointing upward. This doesn't guarantee price will rise, but the trend looks favorable."
    : tech.overallSignal === "bearish"
    ? "Most indicators suggest downward pressure. Caution is warranted, though short-term reversals are always possible."
    : "Indicators are mixed. No clear trend established — watch for a breakout in either direction.";

  return (
    <div className="space-y-6">

      {/* Overall Signal Banner */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: overallBg, border: `1px solid ${overallBorder}` }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>Overall Technical Signal</p>
            <div className="flex items-center gap-2 mb-2">
              <SignalIcon signal={tech.overallSignal} />
              <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{overallLabel}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{overallExplain}</p>
          </div>
          <SignalPill signal={tech.overallSignal} label={overallLabel} />
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="card">
        <SectionLabel>Key Indicators</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Trend", ind: summary.trend, explain: "Overall price direction — is the stock moving up or down?" },
            { label: "RSI (14)", ind: summary.rsi, explain: "Momentum strength. Above 70 = overbought, below 30 = oversold." },
            { label: "MACD", ind: summary.macd, explain: "Trend signal. Positive = upward momentum." },
            { label: "Volume", ind: summary.volume, explain: "Is the buying/selling backed by strong participation?" },
          ].map(({ label, ind, explain }) => (
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-3)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
              <p className={`text-base font-bold font-mono-num mb-1 ${signalColor(ind.signal)}`}>{String(ind.value)}</p>
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{explain}</p>
            </div>
          ))}
        </div>

        {/* Moving Average chips */}
        <div className="flex flex-wrap gap-2 mb-1">
          {[
            { label: `MA 20`, value: tech.movingAverages.ma20, color: "#F59E0B", tip: "Short-term" },
            { label: `MA 50`, value: tech.movingAverages.ma50, color: "#7C5CFF", tip: "Medium-term" },
            { label: `MA 200`, value: tech.movingAverages.ma200, color: "#22D3A8", tip: "Long-term" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "var(--surface-3)", border: `1px solid ${m.color}33` }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{m.tip}</span>
              <span className="text-xs font-mono-num font-medium" style={{ color: m.color }}>{m.value.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <ExplainBox>Moving averages smooth out price noise. When price is above MA 200, the long-term trend is up. When MA 20 crosses above MA 50, that&apos;s called a &quot;golden cross&quot; — a bullish signal.</ExplainBox>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide">
          {TIMEFRAMES.map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: timeframe === tf ? "var(--violet)" : "var(--surface-3)", color: timeframe === tf ? "white" : "var(--text-secondary)" }}>
              {tf}
            </button>
          ))}
        </div>
        <CandlestickChart data={data} timeframe={timeframe} />
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          {[
            { color: "#F59E0B", label: "MA 20 (Short)" },
            { color: "#7C5CFF", label: "MA 50 (Medium)" },
            { color: "#22D3A8", label: "MA 200 (Long)" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-5 h-0.5" style={{ backgroundColor: l.color }} />
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategies */}
      <div className="card">
        <SectionLabel>Trading Strategies</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tech.strategies.map((s) => (
            <div key={s.name} className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-3)" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{s.name}</h3>
                <SignalPill signal={s.signal} label={s.signal.charAt(0).toUpperCase() + s.signal.slice(1)} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.description}</p>
            </div>
          ))}
        </div>
        <ExplainBox>Each strategy uses a different combination of indicators. A bullish signal from multiple strategies simultaneously is a stronger signal than just one.</ExplainBox>
      </div>

      {/* All Indicators */}
      <div className="card">
        <SectionLabel>All Indicators</SectionLabel>
        <div className="space-y-1">
          {Object.entries(tech.indicators).map(([key, ind]) => {
            const isExpanded = expandedIndicator === key;
            const explainer = INDICATOR_EXPLAINERS[key.toLowerCase()] || ind.tooltip;
            return (
              <div key={key}
                className="rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: isExpanded ? "var(--surface-3)" : "transparent" }}
                onClick={() => setExpandedIndicator(isExpanded ? null : key)}
              >
                <div className="flex items-center justify-between py-3 px-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{ind.label}</span>
                    {explainer && <Info size={12} style={{ color: "var(--text-secondary)", opacity: 0.5, flexShrink: 0 }} />}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-mono-num" style={{ color: "var(--text-secondary)" }}>
                      {typeof ind.value === "number" ? ind.value.toLocaleString() : ind.value}
                    </span>
                    <SignalPill signal={ind.signal} label={ind.signal.charAt(0).toUpperCase() + ind.signal.slice(1)} />
                    {isExpanded ? <ChevronUp size={13} style={{ color: "var(--text-secondary)" }} /> : <ChevronDown size={13} style={{ color: "var(--text-secondary)" }} />}
                  </div>
                </div>
                {isExpanded && explainer && (
                  <div className="px-3 pb-3">
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{explainer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}