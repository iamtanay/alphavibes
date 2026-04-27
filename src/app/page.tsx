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
  const { requireAuth } = useAuth();
  const [market, setMarket] = useState<MarketOverview | null>(null);

  useEffect(() => {
    api.marketOverview().then(setMarket).catch(() => {});
  }, []);

  const trending = market?.trending ?? [
    { ticker: "RELIANCE", name: "Reliance Industries", changePercent: 1.82 },
    { ticker: "TCS",      name: "TCS",                 changePercent: 1.15 },
    { ticker: "HDFCBANK", name: "HDFC Bank",            changePercent: 0.85 },
  ];

  const popular = market?.popularSearches ?? POPULAR_SEARCHES;

  function navigateToStock(ticker: string) {
    requireAuth(() => router.push(`/analyse/${ticker}`));
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
              {popular.map((name) => (
                <button
                  key={name}
                  onClick={() => navigateToStock(name.split(" ")[0].toUpperCase())}
                  className="chip text-xs"
                >
                  {name}
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

        <footer className="text-center mt-12 pb-4">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Built with ❤️ by{" "}
            <span className="text-violet font-medium">Accrion</span>
          </p>
        </footer>
      </main>

      <BottomTabBar />
    </div>
  );
}
