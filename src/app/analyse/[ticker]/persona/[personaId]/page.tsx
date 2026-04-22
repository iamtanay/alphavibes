"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, Quote } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalysisResponse, Persona } from "@/types";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

/* ── Persona philosophy meta ─────────────────────────────────────────────── */
const PERSONA_PHILOSOPHY: Record<string, {
  tagline: string;
  philosophy: string;
  keyPrinciples: string[];
  decisionLogic: string;
  quote: string;
}> = {
  "warren-buffett": {
    tagline: "The Oracle of Omaha",
    philosophy: "Buffett looks for durable competitive moats — businesses so good they can raise prices without losing customers. He wants to own a slice of a wonderful business at a fair price, not a fair business at a wonderful price. If he can't understand how a company makes money in 10 minutes, it's a pass.",
    keyPrinciples: [
      "Consistent earnings power over 10+ years",
      "Return on equity above 15% with minimal debt",
      "Strong brand or cost advantage (the 'moat')",
      "Management that thinks like owners, not employees",
    ],
    decisionLogic: "When Buffett looks at this stock, he's asking: 'Would I be comfortable holding this for 20 years if the market closed tomorrow?' Every criterion below is a proxy for that single question.",
    quote: "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.",
  },
  "benjamin-graham": {
    tagline: "Father of Value Investing",
    philosophy: "Graham treats every stock purchase like buying a stake in a private business — with cold, unemotional math. He demands a margin of safety: the price must be so low that even if his estimates are wrong, he still profits. He never chases growth; he hunts for neglected value.",
    keyPrinciples: [
      "P/E below 15 and P/B below 1.5 (the Graham Number)",
      "Debt-to-equity under 1 — financial fortress required",
      "10 years of continuous positive earnings",
      "Current ratio above 2 — the company can survive a downturn",
    ],
    decisionLogic: "Graham applies a strict quantitative filter before he'll even read an annual report. This stock must pass his arithmetic test first. Here's how it scored on his exact checklist.",
    quote: "The intelligent investor is a realist who sells to optimists and buys from pessimists.",
  },
  "peter-lynch": {
    tagline: "Invest in What You Know",
    philosophy: "Lynch believes the average investor has an edge over Wall Street — they see great businesses in everyday life before analysts do. He looks for 'ten-baggers': stocks that can grow 10x. He classifies every stock into six types (stalwart, fast grower, asset play…) and only buys when the story is clear.",
    keyPrinciples: [
      "PEG ratio below 1 — growth must be cheap relative to its price",
      "Revenue growth above 15% signals a true fast grower",
      "Simple, understandable business model",
      "Management investing their own money (skin in the game)",
    ],
    decisionLogic: "Lynch asks: 'Can I explain this business to a 12-year-old?' If yes, he digs into the growth story. He's checking if this stock could be a ten-bagger — and whether the growth is priced in yet.",
    quote: "Know what you own, and know why you own it.",
  },
  "rakesh-jhunjhunwala": {
    tagline: "India's Warren Buffett",
    philosophy: "Jhunjhunwala combined deep conviction with India's unique structural growth story. He'd hold great Indian franchises for decades, ignoring short-term noise. He bought when everyone was fearful, and he sought businesses that would ride India's massive demographic and consumption wave.",
    keyPrinciples: [
      "India-centric growth thesis — domestic demand beneficiary",
      "Management integrity is non-negotiable",
      "High return on capital employed (ROCE > 20%)",
      "Willing to hold through 2–3 down cycles for a 10x outcome",
    ],
    decisionLogic: "RJ would ask: 'Is this an Indian franchise that will be 5x bigger when India's GDP doubles?' He evaluated management character as heavily as numbers — because in India, the promoter IS the moat.",
    quote: "I buy on the way down, and I buy on the way up. Be bullish on India.",
  },
  "momentum-trader": {
    tagline: "Ride the Wave, Don't Fight It",
    philosophy: "The momentum trader doesn't care about intrinsic value — price action is truth. A stock moving up on rising volume has institutional buying behind it. They follow the trend until the trend breaks, using technical signals as an objective entry and exit system.",
    keyPrinciples: [
      "Price above 50-day and 200-day moving averages",
      "RSI between 50–70 — strong but not overheated",
      "Volume confirmation of every significant move",
      "Relative strength vs Nifty 500 in the top quartile",
    ],
    decisionLogic: "For a momentum trader, charts are the scoreboard. They're reading this stock's tape to see if big money is accumulating or distributing. Each criterion below tells part of that institutional story.",
    quote: "The trend is your friend until the bend at the end.",
  },
  "growth-investor": {
    tagline: "Pay Up for Excellence",
    philosophy: "Growth investors believe a truly exceptional business is worth a premium. They're not buying today's earnings — they're buying future earnings, and they'll pay a high P/E today if the growth justifies it. A 50x stock is worth more than a 2x stock, even at a 'expensive' valuation.",
    keyPrinciples: [
      "Revenue and earnings growing 20%+ year-over-year",
      "Expanding operating margins — scale is kicking in",
      "Large total addressable market (TAM) — room to grow",
      "Product with high switching costs or network effects",
    ],
    decisionLogic: "The growth investor is underwriting a 5-year vision. Each metric below is a checkpoint: is this business compounding fast enough to justify owning it at any price? The score reflects conviction in that trajectory.",
    quote: "Don't be afraid to pay a little extra for a great business.",
  },
};

/* ── Score ring component ────────────────────────────────────────────────── */
function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const ringColor =
    color === "success" ? "#22C55E"
    : color === "info" ? "#22D3A8"
    : color === "warning" ? "#F59E0B"
    : "#EF4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 92, height: 92 }}>
      <svg width="92" height="92" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="46" cy="46" r={radius} fill="none" stroke="var(--surface-3)" strokeWidth="5" />
        <circle
          cx="46" cy="46" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono-num" style={{ color: "var(--text-primary)", lineHeight: 1 }}>{score}</span>
        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>/100</span>
      </div>
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────── */
function PersonaAvatar({ persona, size = 64 }: { persona: Persona; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = persona.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("");
  const emoji = persona.icon === "zap" ? "⚡" : persona.icon === "trending-up" ? "📈" : null;

  if (!imgError && persona.photoUrl) {
    return (
      <div className="rounded-full overflow-hidden shrink-0" style={{ width: size, height: size, border: "2px solid var(--border)" }}>
        <img src={persona.photoUrl} alt={persona.name} className="w-full h-full object-cover grayscale" onError={() => setImgError(true)} />
      </div>
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, rgba(124,92,255,0.2), rgba(157,108,255,0.15))",
        border: "2px solid rgba(124,92,255,0.35)",
      }}
    >
      {emoji
        ? <span style={{ fontSize: size * 0.4 }}>{emoji}</span>
        : <span className="font-bold" style={{ fontSize: size * 0.28, color: "var(--violet)" }}>{initials}</span>
      }
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function PersonaDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const ticker    = (params.ticker as string).toUpperCase();
  const personaId = params.personaId as string;

  const [data,    setData]    = useState<AnalysisResponse | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    api.analyse(ticker).then((d) => {
      setData(d);
      setPersona(d.personas.find((p: Persona) => p.id === personaId) ?? null);
    });
    setTimeout(() => setMounted(true), 50);
  }, [ticker, personaId]);

  if (!persona || !data) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--violet)", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  const meta = PERSONA_PHILOSOPHY[personaId];

  const badgeClass =
    persona.verdictColor === "success" ? "badge-success"
    : persona.verdictColor === "info"    ? "badge-info"
    : persona.verdictColor === "warning" ? "badge-warning"
    : "badge-danger";

  const verdictBg =
    persona.verdictColor === "success" ? "rgba(34,197,94,0.06)"
    : persona.verdictColor === "info"    ? "rgba(34,211,168,0.06)"
    : persona.verdictColor === "warning" ? "rgba(245,158,11,0.06)"
    : "rgba(239,68,68,0.06)";

  const verdictBorder =
    persona.verdictColor === "success" ? "rgba(34,197,94,0.22)"
    : persona.verdictColor === "info"    ? "rgba(34,211,168,0.22)"
    : persona.verdictColor === "warning" ? "rgba(245,158,11,0.22)"
    : "rgba(239,68,68,0.22)";

  const otherPersonas = data.personas.filter((p: Persona) => p.id !== personaId).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main
        className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >

        {/* ── Back ── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <ArrowLeft size={16} />
          {ticker} · Investor Personas
        </button>

        {/* ── Hero card ── */}
        <div
          className="rounded-2xl p-6 mb-5 relative overflow-hidden"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div
            className="absolute top-0 right-0 pointer-events-none"
            style={{ width: 200, height: 200, background: "radial-gradient(circle at 70% 30%, rgba(124,92,255,0.08) 0%, transparent 70%)" }}
          />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex-1">
              {meta && (
                <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--violet)" }}>
                  {meta.tagline}
                </p>
              )}
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {persona.name}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Investment Philosophy</p>
            </div>
            <PersonaAvatar persona={persona} size={64} />
          </div>

          <div className="flex items-start gap-5 mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <ScoreRing score={persona.score} color={persona.verdictColor} />
            <div className="flex-1 min-w-0">
              <span className={badgeClass}>{persona.verdict}</span>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {persona.summary}
              </p>
            </div>
          </div>
        </div>

        {/* ── Philosophy ── */}
        {meta && (
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            {/* Signature quote */}
            <div
              className="rounded-xl p-4 mb-5"
              style={{ backgroundColor: "rgba(124,92,255,0.06)", border: "1px solid rgba(124,92,255,0.15)" }}
            >
              <Quote size={16} className="mb-2" style={{ color: "var(--violet)", opacity: 0.6 }} />
              <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {meta.quote}
              </p>
              <p className="text-xs mt-2 font-semibold" style={{ color: "var(--violet)" }}>— {persona.name}</p>
            </div>

            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              How {persona.name.split(" ")[0]} thinks
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              {meta.philosophy}
            </p>

            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
              Core Principles
            </h3>
            <div className="space-y-2.5">
              {meta.keyPrinciples.map((principle, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(124,92,255,0.15)", border: "1px solid rgba(124,92,255,0.25)" }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: "var(--violet)" }}>{i + 1}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{principle}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Why this way for this ticker ── */}
        {meta && (
          <div
            className="rounded-xl px-4 py-3.5 mb-5"
            style={{ backgroundColor: "rgba(124,92,255,0.05)", border: "1px solid rgba(124,92,255,0.12)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--violet)" }}>
              Why {persona.name.split(" ")[0]} evaluates {ticker} this way
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {meta.decisionLogic}
            </p>
          </div>
        )}

        {/* ── Scorecard ── */}
        <div
          className="rounded-2xl mb-5 overflow-hidden"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Scorecard</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Each criterion checked against {persona.name.split(" ")[0]}&apos;s exact standards
            </p>
          </div>
          <div>
            {persona.criteria.map((c: { label: string; value: string; pass: boolean }, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: i < persona.criteria.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{c.label}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono-num" style={{ color: "var(--text-secondary)" }}>{c.value}</span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: c.pass ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)" }}
                  >
                    {c.pass
                      ? <CheckCircle size={14} style={{ color: "var(--success)" }} />
                      : <XCircle size={14} style={{ color: "var(--danger)" }} />
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--surface-3)" }}>
            {(() => {
              const passed = persona.criteria.filter((c: { pass: boolean }) => c.pass).length;
              const total  = persona.criteria.length;
              const pct    = Math.round((passed / total) * 100);
              return (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)",
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono-num shrink-0" style={{ color: "var(--text-secondary)" }}>
                    {passed}/{total} passed
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Other personas ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Other Investors on {ticker}
            </h2>
          </div>
          <div>
            {otherPersonas.map((p: Persona, i: number) => {
              const pInitials = p.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("");
              const pMeta = PERSONA_PHILOSOPHY[p.id];
              const pBadge =
                p.verdictColor === "success" ? "badge-success"
                : p.verdictColor === "info"    ? "badge-info"
                : p.verdictColor === "warning" ? "badge-warning"
                : "badge-danger";

              return (
                <button
                  key={p.id}
                  onClick={() => router.push(`/analyse/${ticker}/persona/${p.id}`)}
                  className="w-full flex items-center justify-between py-3 px-5 transition-colors"
                  style={{ borderBottom: i < otherPersonas.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.2), rgba(157,108,255,0.1))", border: "1px solid rgba(124,92,255,0.25)", color: "var(--violet)" }}
                    >
                      {p.icon === "zap" ? "⚡" : p.icon === "trending-up" ? "📈" : pInitials}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                      {pMeta && (
                        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{pMeta.tagline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`${pBadge} text-[11px] px-2 py-0`}>{p.verdict}</span>
                    <span className="text-sm font-bold font-mono-num" style={{ color: "var(--text-primary)" }}>{p.score}</span>
                    <ChevronRight size={14} style={{ color: "var(--text-secondary)" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </main>
      <BottomTabBar />
    </div>
  );
}
