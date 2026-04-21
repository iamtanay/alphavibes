"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, TrendingUp, TrendingDown, CheckCircle, XCircle } from "lucide-react";
import type { AnalysisResponse, Persona } from "@/types";
import { signalColor } from "@/lib/utils";

interface Props {
  data: AnalysisResponse;
  ticker: string;
}

/* ── Initials avatar fallback ─────────────────────────────────────────────── */
function PersonaAvatar({ persona }: { persona: Persona }) {
  const initials = persona.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  if (persona.photoUrl) {
    return (
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 persona-avatar-ring"
        style={{ border: "2px solid var(--border)" }}>
        <img
          src={persona.photoUrl}
          alt={persona.name}
          className="w-full h-full object-cover grayscale"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent) {
              parent.style.display = "flex";
              parent.style.alignItems = "center";
              parent.style.justifyContent = "center";
              parent.innerHTML = `<span style="font-size:14px;font-weight:700;color:var(--violet)">${initials}</span>`;
            }
          }}
        />
      </div>
    );
  }

  const emoji =
    persona.icon === "zap" ? "⚡"
    : persona.icon === "trending-up" ? "📈"
    : null;

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: "linear-gradient(135deg, rgba(124,92,255,0.2), rgba(157,108,255,0.15))",
        border: "2px solid rgba(124,92,255,0.3)",
      }}
    >
      {emoji
        ? <span className="text-xl">{emoji}</span>
        : <span className="text-sm font-bold" style={{ color: "var(--violet)" }}>{initials}</span>
      }
    </div>
  );
}

/* ── Persona Card ─────────────────────────────────────────────────────────── */
function PersonaCard({ persona, ticker }: { persona: Persona; ticker: string }) {
  const router = useRouter();
  const badgeClass =
    persona.verdictColor === "success" ? "badge-success"
    : persona.verdictColor === "info"    ? "badge-info"
    : persona.verdictColor === "warning" ? "badge-warning"
    : "badge-danger";

  return (
    <div
      className="shrink-0 w-36 md:w-40 card flex flex-col items-center text-center gap-2 py-4 px-3 cursor-pointer transition-all"
      style={{ padding: "16px 12px" }}
      onClick={() => router.push(`/analyse/${ticker}/persona/${persona.id}`)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,92,255,0.5)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 0 1px rgba(124,92,255,0.2), 0 8px 24px rgba(124,92,255,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <PersonaAvatar persona={persona} />
      <p className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
        {persona.name}
      </p>
      <span className={`${badgeClass} text-[11px] px-2 py-0.5`}>{persona.verdict}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xl font-bold font-mono-num" style={{ color: "var(--text-primary)" }}>
          {persona.score}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>/100</span>
      </div>
      <button className="text-xs flex items-center gap-0.5 hover:underline" style={{ color: "var(--violet)" }}>
        View details <ChevronRight size={12} />
      </button>
    </div>
  );
}

/* ── Quick Summary ────────────────────────────────────────────────────────── */
function QuickSummarySection({ data }: { data: AnalysisResponse }) {
  const qs = data.fundamental.quickSummary;

  const metrics = [
    { label: "Revenue Growth", value: `${qs.revenueGrowth.value}%`, signal: qs.revenueGrowth.signal },
    { label: "Profit Growth",  value: `${qs.profitGrowth.value}%`,  signal: qs.profitGrowth.signal },
    { label: "Debt",           value: qs.debt.value,                 signal: qs.debt.signal },
    { label: "Valuation",      value: qs.valuation.value,            signal: qs.valuation.signal },
  ];

  const score      = qs.overallHealth.score;
  const circumf    = 2 * Math.PI * 40; // ~251
  const strokeDash = (score / 100) * circumf;

  const healthColor =
    score >= 70 ? "var(--success)" : score >= 45 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="card mt-5">
      <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Quick Summary
      </h2>
      <div className="flex flex-col md:flex-row gap-6">

        {/* Donut */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke={healthColor}
              strokeWidth="8"
              strokeDasharray={`${strokeDash} ${circumf}`}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
            <text
              x="48" y="52"
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize="13"
              fontWeight="700"
            >
              {qs.overallHealth.label}
            </text>
          </svg>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Overall Health</p>
        </div>

        {/* Metrics grid */}
        <div className="flex-1">
          {metrics.map((m) => {
            const isBullish = m.signal === "bullish";
            const isBearish = m.signal === "bearish";
            const isNeutral = !isBullish && !isBearish;
            return (
              <div
                key={m.label}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{m.label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold font-mono-num ${signalColor(m.signal)}`}
                  >
                    {m.value}
                  </span>
                  {isBullish && <TrendingUp size={14} style={{ color: "var(--success)" }} />}
                  {isBearish && <XCircle size={14} style={{ color: "var(--danger)" }} />}
                  {isNeutral && m.signal === "good" && (
                    <CheckCircle size={14} style={{ color: "var(--success)" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Key insight — desktop */}
        <div
          className="hidden md:block rounded-xl p-4 shrink-0 max-w-[190px]"
          style={{
            backgroundColor: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Key Insight
          </p>
          <p className="text-xs leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
            {qs.keyInsight}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Overview Tab ─────────────────────────────────────────────────────────── */
export default function OverviewTab({ data, ticker }: Props) {
  return (
    <div className="animate-fadeIn">
      {/* Investor Personas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Investor Personas
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              How famous investors would view this stock
            </p>
          </div>
          <button
            className="text-sm flex items-center gap-1 hover:underline"
            style={{ color: "var(--violet)" }}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {data.personas.map((p) => (
            <PersonaCard key={p.id} persona={p} ticker={ticker} />
          ))}
        </div>
      </div>

      {/* Quick Summary */}
      <QuickSummarySection data={data} />

      {/* Mobile key insight */}
      <div
        className="md:hidden card mt-4"
        style={{
          backgroundColor: "rgba(34,197,94,0.05)",
          borderColor: "rgba(34,197,94,0.2)",
        }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
          Key Insight
        </p>
        <p className="text-xs leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
          {data.fundamental.quickSummary.keyInsight}
        </p>
      </div>
    </div>
  );
}
