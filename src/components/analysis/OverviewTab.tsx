"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, TrendingUp, TrendingDown, Minus, Info, Sparkles } from "lucide-react";
import type { AnalysisResponse, Persona } from "@/types";
import { signalColor } from "@/lib/utils";

interface Props {
  data: AnalysisResponse;
  ticker: string;
}

function PersonaAvatar({ persona }: { persona: Persona }) {
  const initials = persona.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  if (persona.photoUrl) {
    return (
      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ border: "2px solid var(--border)" }}>
        <img src={persona.photoUrl} alt={persona.name} className="w-full h-full object-cover"
          onError={(e) => {
            const el = e.currentTarget; el.style.display = "none";
            const p = el.parentElement;
            if (p) { p.style.display="flex"; p.style.alignItems="center"; p.style.justifyContent="center"; p.innerHTML=`<span style="font-size:14px;font-weight:700;color:var(--violet)">${initials}</span>`; }
          }}
        />
      </div>
    );
  }
  return (
    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.2), rgba(157,108,255,0.1))", border: "2px solid rgba(124,92,255,0.3)" }}>
      <span className="text-sm font-bold" style={{ color: "var(--violet)" }}>{initials}</span>
    </div>
  );
}

function PersonaCard({ persona, ticker }: { persona: Persona; ticker: string }) {
  const router = useRouter();
  const badgeClass = persona.verdictColor === "success" ? "badge-success" : persona.verdictColor === "info" ? "badge-info" : persona.verdictColor === "warning" ? "badge-warning" : "badge-danger";
  const scoreColor = persona.score >= 70 ? "var(--success)" : persona.score >= 45 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="shrink-0 w-40 md:w-44 flex flex-col items-center text-center gap-3 py-5 px-4 cursor-pointer rounded-2xl"
      style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", transition: "all 0.18s ease" }}
      onClick={() => router.push(`/analyse/${ticker}/persona/${persona.id}`)}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor="rgba(124,92,255,0.5)"; el.style.boxShadow="0 0 0 1px rgba(124,92,255,0.15), 0 8px 32px rgba(124,92,255,0.12)"; el.style.transform="translateY(-2px)"; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor="var(--border)"; el.style.boxShadow="none"; el.style.transform="translateY(0)"; }}
    >
      <PersonaAvatar persona={persona} />
      <div>
        <p className="text-xs font-semibold leading-snug mb-1.5" style={{ color: "var(--text-primary)" }}>{persona.name}</p>
        <span className={`${badgeClass} text-[10px] px-2 py-0.5`}>{persona.verdict}</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="26" cy="26" r="20" fill="none" stroke={scoreColor} strokeWidth="4"
            strokeDasharray={`${(persona.score / 100) * 125.6} 125.6`} strokeLinecap="round"
            transform="rotate(-90 26 26)" style={{ transition: "stroke-dasharray 0.8s ease" }} />
          <text x="26" y="30" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">{persona.score}</text>
        </svg>
        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>/ 100</p>
      </div>
      <button className="text-[11px] flex items-center gap-0.5" style={{ color: "var(--violet)" }}>
        Deep dive <ChevronRight size={11} />
      </button>
    </div>
  );
}

function ExplainBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl px-4 py-3 mt-4" style={{ backgroundColor: "rgba(124,92,255,0.06)", border: "1px solid rgba(124,92,255,0.18)" }}>
      <Info size={14} className="shrink-0 mt-0.5" style={{ color: "var(--violet)" }} />
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{children}</p>
    </div>
  );
}

function MetricRow({ label, value, signal, explain }: { label: string; value: string; signal: string; explain: string }) {
  const isBullish = signal === "bullish" || signal === "good";
  const isBearish = signal === "bearish" || signal === "poor";
  return (
    <div className="flex items-start justify-between py-3.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <div className="flex-1 pr-4">
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{explain}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <span className={`text-sm font-semibold font-mono-num ${signalColor(signal)}`}>{value}</span>
        {isBullish && <TrendingUp size={13} style={{ color: "var(--success)" }} />}
        {isBearish && <TrendingDown size={13} style={{ color: "var(--danger)" }} />}
        {!isBullish && !isBearish && <Minus size={13} style={{ color: "var(--warning)" }} />}
      </div>
    </div>
  );
}

function QuickSummarySection({ data }: { data: AnalysisResponse }) {
  const qs = data.fundamental.quickSummary;
  const score = qs.overallHealth.score;
  const circumf = 2 * Math.PI * 36;
  const strokeDash = (score / 100) * circumf;
  const healthColor = score >= 70 ? "var(--success)" : score >= 45 ? "var(--warning)" : "var(--danger)";
  const healthSentiment = score >= 70 ? "This company's financials are in good shape." : score >= 45 ? "This company's financials are average — neither exceptional nor alarming." : "This company has some financial weaknesses worth investigating.";

  const metrics = [
    { label: "Revenue Growth", value: `${qs.revenueGrowth.value}%`, signal: qs.revenueGrowth.signal, explain: "Is the company earning more over time? Consistent growth is a positive sign." },
    { label: "Profit Growth", value: `${qs.profitGrowth.value}%`, signal: qs.profitGrowth.signal, explain: "Revenue isn't everything — is the company actually keeping more as profit?" },
    { label: "Debt Level", value: qs.debt.value, signal: qs.debt.signal, explain: "How much the company owes. High debt increases financial risk, especially during slowdowns." },
    { label: "Valuation", value: qs.valuation.value, signal: qs.valuation.signal, explain: "Is the stock priced fairly vs what the company earns? Overvalued = less room for gains." },
  ];

  return (
    <div className="card mt-5">
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Financial Health at a Glance</h2>
      <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>A simplified snapshot of how this company is doing — no finance degree needed.</p>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2 shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
            <circle cx="44" cy="44" r="36" fill="none" stroke={healthColor} strokeWidth="8"
              strokeDasharray={`${strokeDash} ${circumf}`} strokeLinecap="round"
              transform="rotate(-90 44 44)" style={{ transition: "stroke-dasharray 0.9s ease" }} />
            <text x="44" y="48" textAnchor="middle" fill="var(--text-primary)" fontSize="13" fontWeight="700">{qs.overallHealth.label}</text>
          </svg>
          <div className="text-center">
            <p className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>Overall Health</p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: healthColor }}>{score}/100</p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {metrics.map((m) => <MetricRow key={m.label} {...m} />)}
        </div>
      </div>
      <div className="mt-5 rounded-xl p-4 flex gap-3" style={{ backgroundColor: "rgba(34,211,168,0.05)", border: "1px solid rgba(34,211,168,0.18)" }}>
        <Sparkles size={15} className="shrink-0 mt-0.5" style={{ color: "var(--teal-accent)" }} />
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--teal-accent)" }}>Key Insight</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{qs.keyInsight}</p>
        </div>
      </div>
      <ExplainBox>{healthSentiment} This score combines revenue growth, profitability, debt, and valuation — it&apos;s a starting point, not the full story.</ExplainBox>
    </div>
  );
}

export default function OverviewTab({ data, ticker }: Props) {
  return (
    <div className="animate-fadeIn">
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Investor Perspectives</h2>
        <p className="text-xs mt-0.5 mb-4" style={{ color: "var(--text-secondary)" }}>
          Would legendary investors buy this stock? Each card applies a different investment philosophy to the same data.
        </p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {data.personas.map((p) => <PersonaCard key={p.id} persona={p} ticker={ticker} />)}
        </div>
        <ExplainBox>
          Scores reflect how well this stock fits each investor&apos;s strategy — not a buy/sell recommendation. Higher = stronger match. Tap any card for a full breakdown of their criteria.
        </ExplainBox>
      </div>
      <QuickSummarySection data={data} />
    </div>
  );
}
