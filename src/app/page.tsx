"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, BarChart2, Clock } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import { api } from "@/lib/api";
import { TRENDING_STOCKS, POPULAR_SEARCHES } from "@/config";
import type { MarketOverview } from "@/types";
import { formatChange, changeColor } from "@/lib/utils";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import { useAuth } from "@/components/providers/SupabaseProvider";

// No LoginRedirectHandler needed — with implicit OAuth flow, Google redirects
// back to the current page (window.location.href) and the Supabase SDK
// automatically fires onAuthStateChange('SIGNED_IN'), which triggers the
// pendingAction callback stored in SupabaseProvider.

export default function HomePage() {
  const router = useRouter();
  const { user, setShowLoginModal } = useAuth();
  const [market, setMarket] = useState<MarketOverview | null>(null);

  useEffect(() => {
    api.marketOverview().then(setMarket).catch(() => {});
  }, []);

  const trending = market?.trending ?? [
    { ticker: "RELIANCE", name: "Reliance Industries", changePercent: 1.82 },
    { ticker: "TCS",      name: "TCS",                 changePercent: 1.15 },
    { ticker: "HDFCBANK", name: "HDFC Bank",            changePercent: 0.85 },
  ];

  const popularRaw = market?.popularSearches;
  const popular: { label: string; ticker: string }[] = popularRaw
    ? popularRaw.map((name) => ({ label: name, ticker: name.split(" ")[0].toUpperCase() }))
    : POPULAR_SEARCHES;

  function navigateToStock(ticker: string) {
    if (!user) {
      sessionStorage.setItem("authRedirectNext", `/analyse/${ticker}`);
      setShowLoginModal(true);
      return;
    }
    router.push(`/analyse/${ticker}`);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header showSearch={false} />

      <main className="max-w-content mx-auto pb-24 md:pb-8">
        <section className="relative px-6 pt-14 pb-12 text-center overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,92,255,0.20) 0%, transparent 70%)",
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 1200 420"
          >
            <polyline
              points="0,320 120,270 260,295 400,195 550,235 700,148 840,168 980,108 1100,135 1200,85"
              fill="none" stroke="#7C5CFF" strokeWidth="2" opacity="0.10"
            />
            <polyline
              points="0,370 160,330 310,340 470,255 620,275 770,205 910,215 1060,165 1200,145"
              fill="none" stroke="#9D6CFF" strokeWidth="1.5" opacity="0.06"
            />
          </svg>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-[60px] font-extrabold mb-4 leading-[1.1] tracking-tight">
              Understand{" "}<span className="gradient-text">any stock</span>
              <br className="hidden md:block" />
              in{" "}<span className="gradient-text">60 seconds</span>
            </h1>
            <p className="text-base md:text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
              Insider level insights. Simplified for everyone.
            </p>
            <div className="max-w-[540px] mx-auto mb-6">
              <SearchBar autoFocus />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Try these
              </span>
              {TRENDING_STOCKS.map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => navigateToStock(ticker)}
                  className="chip text-xs font-medium"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🔥</span>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Trending now
              </h2>
            </div>
            <div className="space-y-1">
              {trending.map((stock, i) => (
                <button
                  key={stock.ticker}
                  onClick={() => navigateToStock(stock.ticker)}
                  className="w-full flex items-center justify-between rounded-lg px-2 py-2 transition-colors trending-row"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs w-4 text-right shrink-0"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {stock.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-mono-num font-semibold ${changeColor(stock.changePercent)}`}
                  >
                    {formatChange(stock.changePercent)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-violet" />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Popular searches
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {popular.map((item) => (
                <button
                  key={item.ticker}
                  onClick={() => navigateToStock(item.ticker)}
                  className="chip text-xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="px-6 mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Users,     title: "Investor Personas", desc: "See how top investors would evaluate this stock" },
            { icon: BarChart2, title: "Smart Analysis",    desc: "Key insights on fundamentals, valuation & momentum" },
            { icon: Clock,     title: "Visual & Simple",   desc: "Powerful data. Easy to understand." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card flex items-start gap-4">
                <div
                  className="p-2 rounded-xl shrink-0"
                  style={{ backgroundColor: "rgba(124,92,255,0.12)" }}
                >
                  <Icon size={17} className="text-violet" />
                </div>
                <div>
                  <h3
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Problems We Solve ───────────────────────────────────────── */}
        <section className="px-6 mt-14 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: "rgba(124,92,255,0.12)", color: "var(--violet)" }}
            >
              Why AlphaVibes?
            </span>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Built for investors who are{" "}
              <span className="gradient-text">tired of complexity</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                emoji: "📰",
                problem: "Too much noise, too little signal",
                solution: "AlphaVibes cuts through the clutter and surfaces what actually matters — valuation, momentum, and risk — in one clean view.",
              },
              {
                emoji: "🧮",
                problem: "Financial statements are intimidating",
                solution: "We translate balance sheets, P&L, and cash flows into plain English so any investor can understand what the numbers mean.",
              },
              {
                emoji: "🔍",
                problem: "Hard to compare stocks quickly",
                solution: "Our Peers tab lets you benchmark any stock against its sector rivals on key metrics, side by side, in seconds.",
              },
              {
                emoji: "🤔",
                problem: "Not sure if a stock suits your style",
                solution: "Investor Personas show how legends like Buffett or Lynch would view the stock, so you can align picks with your philosophy.",
              },
            ].map((item) => (
              <div
                key={item.problem}
                className="card flex gap-4 items-start"
              >
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    {item.problem}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {item.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How to Use ──────────────────────────────────────────────── */}
        <section className="px-6 mt-14 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: "rgba(34,211,168,0.10)", color: "var(--teal-accent)" }}
            >
              Get Started
            </span>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Analyse any stock in{" "}
              <span className="gradient-text">3 simple steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Search any stock",
                desc: "Type a company name or NSE/BSE ticker in the search bar. We cover 5,000+ listed Indian stocks.",
                color: "var(--violet)",
              },
              {
                step: "02",
                title: "Explore the analysis",
                desc: "Dive into Overview, Fundamentals, Technicals, Financials, Peers, and Shareholding — all in one place.",
                color: "var(--teal-accent)",
              },
              {
                step: "03",
                title: "Save to watchlist",
                desc: "Bookmark stocks you're tracking. Come back anytime to monitor price changes and updated insights.",
                color: "var(--blue-accent)",
              },
            ].map((s) => (
              <div key={s.step} className="card flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black font-mono-num shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${s.color}22, ${s.color}44)`,
                    border: `1.5px solid ${s.color}55`,
                    color: s.color,
                  }}
                >
                  {s.step}
                </div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className="mt-16 pb-6 text-center border-t pt-8 mx-6" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3">
            <span className="logo-gradient text-xl">AlphaVibes</span>
          </div>
          <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            Insider-level stock intelligence. Simplified for everyone.
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Built with ❤️ by{" "}
            <span className="font-medium" style={{ color: "var(--violet)" }}>Accrion</span>
            {" "}· Data is delayed. Not investment advice.
          </p>
        </footer>
      </main>

      <BottomTabBar />
    </div>
  );
}
