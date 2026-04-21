"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalysisResponse, Persona } from "@/types";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

/* ── Avatar with initials fallback ───────────────────────────────────────── */
function PersonaAvatarLarge({ persona }: { persona: Persona }) {
  const [imgError, setImgError] = useState(false);
  const initials = persona.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const emoji =
    persona.icon === "zap" ? "⚡"
    : persona.icon === "trending-up" ? "📈"
    : null;

  if (!imgError && persona.photoUrl) {
    return (
      <div
        className="w-16 h-16 rounded-full overflow-hidden"
        style={{ border: "2px solid var(--border)" }}
      >
        <img
          src={persona.photoUrl}
          alt={persona.name}
          className="w-full h-full object-cover grayscale"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, rgba(124,92,255,0.2), rgba(157,108,255,0.15))",
        border: "2px solid rgba(124,92,255,0.35)",
      }}
    >
      {emoji
        ? <span className="text-2xl">{emoji}</span>
        : <span className="text-xl font-bold" style={{ color: "var(--violet)" }}>{initials}</span>
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

  useEffect(() => {
    api.analyse(ticker).then((d) => {
      setData(d);
      setPersona(d.personas.find((p) => p.id === personaId) ?? null);
    });
  }, [ticker, personaId]);

  if (!persona || !data) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--violet)", borderTopColor: "transparent" }}
          />
        </div>
      </div>
    );
  }

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

  const otherPersonas = data.personas.filter((p) => p.id !== personaId).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 animate-fadeIn">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <ArrowLeft size={16} />
          {ticker}
        </button>

        {/* Persona Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {persona.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Investment Philosophy
            </p>
          </div>
          <PersonaAvatarLarge persona={persona} />
        </div>

        {/* Match Score Card */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ backgroundColor: verdictBg, border: `1px solid ${verdictBorder}` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className={badgeClass}>{persona.verdict}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className="text-5xl font-bold font-mono-num"
              style={{ color: "var(--text-primary)" }}
            >
              {persona.score}
            </span>
            <span className="text-xl" style={{ color: "var(--text-secondary)" }}>/100</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            This stock aligns well with {persona.name}&apos;s investment philosophy.
          </p>
        </div>

        {/* Evaluation Criteria */}
        <div className="card mb-5">
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Evaluation Criteria
          </h2>
          <div className="space-y-1">
            {persona.criteria.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 px-3 rounded-xl"
                style={{
                  backgroundColor: i % 2 === 0 ? "var(--surface-3)" : "transparent",
                }}
              >
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {c.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono-num" style={{ color: "var(--text-secondary)" }}>
                    {c.value}
                  </span>
                  {c.pass
                    ? <CheckCircle size={18} style={{ color: "var(--success)" }} className="shrink-0" />
                    : <XCircle    size={18} style={{ color: "var(--danger)" }}  className="shrink-0" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ backgroundColor: verdictBg, border: `1px solid ${verdictBorder}` }}
        >
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Verdict
          </h2>
          <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {persona.summary}
          </p>
        </div>

        {/* Explore other personas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Explore other personas
            </h2>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              See how other investors rate this stock
            </span>
          </div>
          <div className="space-y-2">
            {otherPersonas.map((p) => {
              const pInitials = p.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
              const pBadge =
                p.verdictColor === "success" ? "badge-success"
                : p.verdictColor === "info"    ? "badge-info"
                : p.verdictColor === "warning" ? "badge-warning"
                : "badge-danger";

              return (
                <button
                  key={p.id}
                  onClick={() => router.push(`/analyse/${ticker}/persona/${p.id}`)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(124,92,255,0.2), rgba(157,108,255,0.1))",
                        border: "1px solid rgba(124,92,255,0.25)",
                        color: "var(--violet)",
                      }}
                    >
                      {p.icon === "zap" ? "⚡" : p.icon === "trending-up" ? "📈" : pInitials}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {p.name}
                      </p>
                      <span className={`${pBadge} text-[11px] px-2 py-0`}>{p.verdict}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono-num" style={{ color: "var(--text-primary)" }}>
                      {p.score}/100
                    </span>
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
