"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalysisResponse, TabId } from "@/types";
import { formatChange, changeColor, formatMarketCap } from "@/lib/utils";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AnalysisSidebar from "@/components/layout/AnalysisSidebar";
import OverviewTab from "@/components/analysis/OverviewTab";
import FundamentalsTab from "@/components/analysis/FundamentalsTab";
import TechnicalsTab from "@/components/analysis/TechnicalsTab";
import FinancialsTab from "@/components/analysis/FinancialsTab";
import PeersTab from "@/components/analysis/PeersTab";
import ShareholdingTab from "@/components/analysis/ShareholdingTab";
import LoadingState from "@/components/ui/LoadingState";

const MOBILE_TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "fundamentals", label: "Fundamentals" },
  { id: "technicals", label: "Technicals" },
  { id: "financials", label: "Financials" },
];

export default function AnalysePage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string).toUpperCase();

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .analyse(ticker)
      .then(setData)
      .catch(() => setError("Failed to load analysis. Please try again."))
      .finally(() => setLoading(false));
  }, [ticker]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />

      <div className="flex" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Desktop Sidebar */}
        <AnalysisSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          {/* ── Stock Header ─────────────────────────────────────────── */}
          <div
            className="sticky top-14 z-40 px-4 md:px-8 py-4"
            style={{ backgroundColor: "var(--surface-1)", borderBottom: "1px solid var(--border)" }}
          >
            {/* Mobile back button */}
            <button
              onClick={() => router.back()}
              className="md:hidden flex items-center gap-2 text-sm text-text-secondary mb-3 hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg md:text-xl font-semibold text-text-primary truncate">
                    {data?.quote.name ?? ticker}
                  </h1>
                  <button className="shrink-0 text-text-secondary hover:text-warning transition-colors">
                    <Star size={16} />
                  </button>
                  <button className="shrink-0 text-text-secondary hover:text-violet transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  {data?.quote.exchange}: {ticker}
                </p>
                {data && (
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl md:text-3xl font-bold font-mono-num text-text-primary">
                      ₹{data.quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-sm font-mono-num font-medium ${changeColor(data.quote.changePercent)}`}>
                      {data.quote.change >= 0 ? "+" : ""}{data.quote.change.toFixed(2)}{" "}
                      ({formatChange(data.quote.changePercent)})
                    </span>
                    <span className="text-xs text-text-secondary">
                      {data.quote.timestamp} · Delayed · {data.quote.exchange}
                    </span>
                  </div>
                )}
              </div>

              {/* Desktop metadata */}
              {data && (
                <div className="hidden md:grid grid-cols-2 gap-x-8 gap-y-1 text-right shrink-0">
                  <div>
                    <p className="text-xs text-text-secondary">Market Cap</p>
                    <p className="text-sm font-mono-num text-text-primary">
                      {formatMarketCap(data.quote.marketCap)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">52W Range</p>
                    <p className="text-sm font-mono-num text-text-primary">
                      {data.quote.week52Low.toLocaleString("en-IN")} – {data.quote.week52High.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Sector</p>
                    <p className="text-sm text-text-primary">{data.quote.sector}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Industry</p>
                    <p className="text-sm text-text-primary">{data.quote.industry}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Mobile Tabs ─────────────────────────────────────────── */}
            <div className="md:hidden flex gap-0 mt-4 border-b border-border overflow-x-auto scrollbar-hide">
              {MOBILE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-4 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "tab-active text-violet"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab Content ──────────────────────────────────────────── */}
          <div className="px-4 md:px-8 py-6">
            {loading && <LoadingState />}
            {error && (
              <div className="card text-center py-12">
                <p className="text-danger mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
            {data && !loading && (
              <div className="animate-fadeIn">
                {activeTab === "overview" && <OverviewTab data={data} ticker={ticker} />}
                {activeTab === "fundamentals" && <FundamentalsTab data={data} />}
                {activeTab === "technicals" && <TechnicalsTab data={data} />}
                {activeTab === "financials" && <FinancialsTab data={data} />}
                {activeTab === "peers" && <PeersTab data={data} />}
                {activeTab === "shareholding" && <ShareholdingTab data={data} />}
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
}
