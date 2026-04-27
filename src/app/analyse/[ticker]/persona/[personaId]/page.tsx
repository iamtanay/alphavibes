"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, Quote } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalysisResponse, Persona } from "@/types";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AuthGuard from "@/components/auth/AuthGuard";

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
      "ROE consistently above 15% — the business compounds capital well",
      "Debt-to-equity below 0.5 — a financial fortress, not a leveraged bet",
      "Operating margin above 15% — real pricing power over competitors",
      "Gross margin above 40% — product differentiation, not a commodity",
      "EPS growing at 10%+ annually — consistent earnings power",
      "Reasonable valuation: P/E below 25 — wonderful business at a fair price",
    ],
    decisionLogic: "When Buffett looks at this stock, he asks: 'Would I be comfortable holding this for 20 years if the market closed tomorrow?' He's not forecasting — he's checking whether the business has the DNA to compound quietly for decades. Every criterion below is a proxy for that single question.",
    quote: "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.",
  },
  "peter-lynch": {
    tagline: "Invest in What You Know",
    philosophy: "Lynch believes the average investor has a genuine edge over Wall Street — they see great businesses in everyday life before analysts do. He hunts for 'ten-baggers': stocks that can grow 10x. His single most important number is the PEG ratio — growth must be cheap relative to price. If the PEG is below 1, he listens to the story.",
    keyPrinciples: [
      "PEG ratio below 1.0 — Lynch's single favourite signal",
      "EPS growth above 15% annually — the 'fast grower' filter",
      "Revenue growth above 20% — growth must be top-line driven",
      "Insider / promoter holding above 20% — skin in the game",
      "Net margin above 10% — profitable growth, not just revenue",
      "Low debt (D/E < 0.5) — Lynch avoids over-leveraged fast growers",
    ],
    decisionLogic: "Lynch asks: 'Can I explain this business to a 12-year-old, and is the growth not yet priced in?' He classifies every stock — stalwart, fast grower, asset play, turnaround — and buys only when the category fits the numbers. He's checking whether this could be a ten-bagger that Wall Street hasn't discovered yet.",
    quote: "Know what you own, and know why you own it.",
  },
  "rakesh-jhunjhunwala": {
    tagline: "India's Warren Buffett",
    philosophy: "Jhunjhunwala combined deep conviction with India's unique structural growth story. He'd hold great Indian franchises for decades, ignoring short-term noise. He bought when everyone was fearful, seeking businesses that would ride India's massive demographic and consumption wave. He evaluated management character as heavily as numbers — in India, the promoter IS the moat.",
    keyPrinciples: [
      "3Y Revenue CAGR above 20% — must be riding India's growth story",
      "3Y EPS CAGR above 20% — earnings must match revenue growth",
      "ROE above 20% — only high-quality compounders qualify",
      "Promoter holding > 50% with pledge < 10% — founder conviction",
      "Debt / Equity below 1.0 — leverage is acceptable but not extreme",
      "Mid/small cap sweet spot (₹500–25,000 Cr) — where the 10x still lives",
    ],
    decisionLogic: "RJ would ask: 'Is this an Indian franchise that will be 5x bigger when India's GDP doubles?' He paid close attention to promoter quality — their vision, their integrity, their own stake. A great India thesis with a weak or pledged promoter was a dealbreaker, no matter how good the numbers looked.",
    quote: "I buy on the way down, and I buy on the way up. Be bullish on India.",
  },
  "charlie-munger": {
    tagline: "Invert, Always Invert",
    philosophy: "Munger approaches investing by inversion — instead of asking what could go right, he first asks what could go wrong and eliminates those businesses. What remains must be truly exceptional: ROIC well above the cost of capital, pricing power so strong it shows in gross margins above 50%, and a balance sheet so clean that debt is almost an afterthought. He holds fewer stocks than Buffett and is even harder to impress.",
    keyPrinciples: [
      "ROIC above 15% — Munger's primary test of capital allocation quality",
      "Gross margin above 50% — real pricing power, not a commodity business",
      "Debt / Equity below 0.3 — stricter than Buffett; near-zero leverage",
      "Net margin above 20% — operating leverage must be visible in numbers",
      "ROE above 20% consistently — the business must compound, not just survive",
    ],
    decisionLogic: "Munger starts by inverting: what are all the reasons this business could fail or mediocritize over 20 years? He eliminates companies that rely on leverage, lack pricing power, or operate in commoditised industries. Only after surviving that filter does he ask: is this truly extraordinary? Most companies fail immediately.",
    quote: "Invert, always invert. It is in the nature of things that many hard problems are best solved when they are addressed backwards.",
  },
  "benjamin-graham": {
    tagline: "Father of Value Investing",
    philosophy: "Graham treats every stock like buying a stake in a private business — with cold, unemotional arithmetic. He demands a margin of safety so large that even if his analysis is wrong, the price protects him. He never chases growth; he hunts for neglected businesses trading below their intrinsic asset value. His framework gave Buffett his foundation, but Graham himself never evolved beyond the numbers.",
    keyPrinciples: [
      "P/E below 15 — the primary valuation gate; anything higher is speculation",
      "P/B below 1.5 — near net-asset-value provides the safety cushion",
      "Current ratio above 2.0 — the company must survive a severe downturn",
      "Dividend paying — cash returned to shareholders proves earnings are real",
      "Debt / Equity below 0.5 — Graham is paranoid about financial leverage",
    ],
    decisionLogic: "Graham applies a strict quantitative filter before he will even read an annual report. He's not forecasting the future — he's demanding that the present price is so cheap that the future barely matters. This scorecard is his arithmetic test. Either the numbers pass or they don't; there is no story that overrides them.",
    quote: "The intelligent investor is a realist who sells to optimists and buys from pessimists.",
  },
  "vijay-kedia": {
    tagline: "SMILE — Find It Before the Crowd",
    philosophy: "Kedia's SMILE framework — Small/Medium cap, In a niche, Longevity of business model, Emerging — is a hunt for undiscovered Indian franchises before institutional money arrives. He wants to own companies that are too small for mutual funds to buy, too niche for analysts to cover, and too fast-growing to stay cheap for long. His edge is discovery; once a stock gets widely covered, he moves on.",
    keyPrinciples: [
      "Revenue CAGR > 25% — must be a fast compounder, not a steady grower",
      "Promoter holding > 60% with pledge < 5% — maximum founder conviction",
      "FII holding below 15% — undiscovered by big money means upside remains",
      "Market cap below ₹10,000 Cr — his sweet spot before the fund managers arrive",
      "ROE above 20% — quality matters even in small caps",
    ],
    decisionLogic: "Kedia asks: 'Has the institutional herd found this yet?' Low FII holding, high promoter stake, and a niche that doesn't show up on Bloomberg screens are features, not bugs. He is willing to accept illiquidity and short-term volatility in exchange for being years early on India's next compounding machine.",
    quote: "I look for businesses that are growing fast, led by honest promoters, and still undiscovered by the big money.",
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

  return (
    <AuthGuard message="Sign in to view investor persona analysis for this stock.">
      <PersonaDetailPageInner ticker={ticker} personaId={personaId} router={router} />
    </AuthGuard>
  );
}

function PersonaDetailPageInner({ ticker, personaId, router }: { ticker: string; personaId: string; router: ReturnType<typeof useRouter> }) {
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
            {persona.criteria.map((c: any, i: number) => {
              const hasW  = typeof c.maxPoints === "number" && typeof c.earnedPoints === "number";
              const pct   = hasW ? Math.round((c.earnedPoints / c.maxPoints) * 100) : (c.pass ? 100 : 0);
              const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)";
              return (
                <div
                  key={i}
                  className="px-5 py-3.5"
                  style={{ borderBottom: i < persona.criteria.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{c.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-mono-num" style={{ color: "var(--text-secondary)" }}>{c.value}</span>
                      {hasW ? (
                        <span className="text-[11px] font-mono-num font-semibold" style={{ color }}>
                          {c.earnedPoints}/{c.maxPoints}
                        </span>
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: c.pass ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)" }}
                        >
                          {c.pass
                            ? <CheckCircle size={14} style={{ color: "var(--success)" }} />
                            : <XCircle size={14} style={{ color: "var(--danger)" }} />
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                      <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.8s ease" }} />
                    </div>
                    {hasW && (
                      <span className="text-[10px] shrink-0" style={{ color: "var(--text-tertiary)" }}>of {c.maxPoints} pts</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score breakdown footer */}
          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--surface-3)" }}>
            {(() => {
              // totalMaxPoints comes from the backend (persona.MAX_POINTS = 100).
              // Using it as the denominator is correct — some criteria are skipped
              // when yfinance returns None for a metric, so summing the returned
              // criteria maxPoints would give a wrong (lower) denominator and show
              // an inflated percentage like "85/85 pts · 100%".
              const totalMax   = (persona as any).totalMaxPoints ?? 100;
              const hasWeights = persona.criteria.some(
                (c: any) => typeof c.maxPoints === "number" && typeof c.earnedPoints === "number"
              );
              if (hasWeights) {
                const earned = persona.criteria.reduce((s: number, c: any) => s + (c.earnedPoints ?? 0), 0);
                const pct    = totalMax > 0 ? Math.round((earned / totalMax) * 100) : 0;
                const color  = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)";
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Total score</span>
                      <span className="text-xs font-mono-num font-semibold" style={{ color }}>
                        {earned} / {totalMax} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${pct}%`, background: color, transition: "width 1s ease" }}
                        />
                      </div>
                      <span className="text-xs font-mono-num shrink-0" style={{ color: "var(--text-secondary)" }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              }
              // Fallback: pass/fail count
              const passed = persona.criteria.filter((c: any) => c.pass).length;
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
