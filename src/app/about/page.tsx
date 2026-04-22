import Link from "next/link";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search any Indian stock",
    desc: "Type a ticker or company name — we support NSE and BSE. Results appear instantly.",
    accent: "#7C5CFF",
  },
  {
    step: "02",
    title: "Six investors weigh in",
    desc: "Buffett, Graham, Lynch, Jhunjhunwala, and more each run their own checklist — deterministic, no AI hallucinations.",
    accent: "#9D6CFF",
  },
  {
    step: "03",
    title: "Plain-English verdict",
    desc: "A clear health summary across growth, debt, valuation and momentum — no jargon.",
    accent: "#5A67FF",
  },
  {
    step: "04",
    title: "Deep dive when you're ready",
    desc: "Explore full fundamentals, technicals, financials, and peer comparisons — all in one place.",
    accent: "#22D3A8",
  },
];

const PERSONAS = [
  { name: "Warren Buffett", role: "Value & Moat", emoji: "🧠" },
  { name: "Benjamin Graham", role: "Margin of Safety", emoji: "📐" },
  { name: "Peter Lynch", role: "Growth at Value", emoji: "🔍" },
  { name: "Rakesh Jhunjhunwala", role: "India Growth", emoji: "🇮🇳" },
  { name: "Momentum Trader", role: "Technical Signals", emoji: "⚡" },
  { name: "Growth Investor", role: "Future Earnings", emoji: "📈" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 pb-24 md:pb-10">

        {/* ── Hero ── */}
        <section className="relative pt-12 pb-10 text-center overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,92,255,0.14) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--violet)" }}>
              by Accrion
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
              Understand any stock<br />
              <span className="gradient-text">in 60 seconds</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
              AlphaVibes gives you the same analytical lens used by the world&apos;s greatest investors — applied to every Indian stock, instantly.
            </p>
          </div>
        </section>

        {/* ── Stats row ── */}
        <div
          className="grid grid-cols-3 rounded-2xl p-5 mb-6 gap-4"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          {[
            { value: "6", label: "Investor Personas" },
            { value: "500+", label: "Nifty 500 Stocks" },
            { value: "Free", label: "Forever" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold font-mono-num gradient-text">{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── What is AlphaVibes ── */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            What is AlphaVibes?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Most retail investors don&apos;t have time to read 10 annual reports and build valuation models. AlphaVibes does it for them.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--text-secondary)" }}>
            We apply the exact criteria used by legendary investors — their filters, their numbers, their philosophy — and show you how each would score any Indian stock. Not AI-generated opinions. Real, deterministic analysis.
          </p>
        </div>

        {/* ── How it works ── */}
        <div
          id="how-it-works"
          className="rounded-2xl overflow-hidden mb-5"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>How it works</h2>
          </div>
          <div>
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                className="flex gap-4 px-5 py-4"
                style={{ borderBottom: i < HOW_IT_WORKS.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: `rgba(124,92,255,0.1)`,
                    border: `1px solid rgba(124,92,255,0.2)`,
                    color: item.accent,
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Personas ── */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>The 6 Investor Personas</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Each uses their own criteria — no shared formulas
            </p>
          </div>
          <div className="grid grid-cols-2">
            {PERSONAS.map((p, i) => {
              const isLastRow = i >= PERSONAS.length - 2;
              const isRight = i % 2 === 1;
              return (
                <div
                  key={p.name}
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{
                    borderBottom: !isLastRow ? "1px solid var(--border)" : "none",
                    borderRight: !isRight ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span className="text-xl shrink-0">{p.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{p.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Data & Disclaimers ── */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Data & Disclaimers</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            All stock data is end-of-day via Yahoo Finance. AlphaVibes is for informational and educational purposes only — it is <strong style={{ color: "var(--text-primary)" }}>not financial advice</strong>. Always do your own research before making any investment decision.
          </p>
        </div>

        {/* ── CTA ── */}
        <div
          className="rounded-2xl p-6 text-center relative overflow-hidden"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,92,255,0.08) 0%, transparent 70%)" }}
          />
          <div className="relative z-10">
            <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Ready to start?
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Search any Indian stock to see the personas in action.
            </p>
            <Link href="/" className="btn-primary inline-block text-sm px-6 py-2.5">
              Analyse a Stock →
            </Link>
            <p className="text-xs mt-5" style={{ color: "var(--text-secondary)" }}>
              AlphaVibes V1 · India-First · Built with ❤️ by{" "}
              <span style={{ color: "var(--violet)", fontWeight: 600 }}>Accrion</span>
            </p>
          </div>
        </div>

      </main>
      <BottomTabBar />
    </div>
  );
}
