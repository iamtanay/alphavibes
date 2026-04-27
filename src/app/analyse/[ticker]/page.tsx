"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalysisResponse, TabId } from "@/types";
import { formatChange, changeColor, formatMarketCap } from "@/lib/utils";
import { useAppStore } from "@/store";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AnalysisSidebar from "@/components/layout/AnalysisSidebar";
import OverviewTab from "@/components/analysis/OverviewTab";
import FundamentalsTab from "@/components/analysis/FundamentalsTab";
import TechnicalsTab from "@/components/analysis/TechnicalsTab";
import FinancialsTab from "@/components/analysis/FinancialsTab";
import PeersTab from "@/components/analysis/PeersTab";
import ShareholdingTab from "@/components/analysis/ShareholdingTab";
import { SectionErrorBoundary } from "@/components/ui/SectionErrorBoundary";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  OverviewSkeleton,
  RatiosSkeleton,
  ChartSkeleton,
  FinancialTableSkeleton,
  PeersSkeleton,
  ShareholdingSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/skeletons";

const MOBILE_TABS: { id: TabId; label: string }[] = [
  { id: "overview",      label: "Overview" },
  { id: "fundamentals",  label: "Fundamentals" },
  { id: "technicals",    label: "Technicals" },
  { id: "financials",    label: "Financials" },
];

function TabSkeleton({ tab }: { tab: TabId }) {
  switch (tab) {
    case "overview":      return <OverviewSkeleton />;
    case "fundamentals":  return <div className="space-y-6"><RatiosSkeleton /><ChartSkeleton /></div>;
    case "technicals":    return <div className="space-y-6"><ChartSkeleton /><RatiosSkeleton /></div>;
    case "financials":    return <FinancialTableSkeleton />;
    case "peers":         return <PeersSkeleton />;
    case "shareholding":  return <ShareholdingSkeleton />;
    default:              return <OverviewSkeleton />;
  }
}

export default function AnalysePage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string).toUpperCase();

  const getAnalysis  = useAppStore((s) => s.getAnalysis);
  const setAnalysis  = useAppStore((s) => s.setAnalysis);

  const [data,       setData]       = useState<AnalysisResponse | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState<TabId>("overview");

  useEffect(() => {
    // Try cache first — avoids re-fetching on back-navigation from persona page
    const cached = getAnalysis(ticker);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    api
      .analyse(ticker)
      .then((d) => {
        setAnalysis(ticker, d); // write to 15-min cache
        setData(d);
      })
      .catch(() => setError("Failed to load analysis. Please try again."))
      .finally(() => setLoading(false));
  }, [ticker, getAnalysis, setAnalysis]);

  return (
    <AuthGuard message="Sign in to access stock analysis, investor personas, and detailed financials.">
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

            {/* Show skeleton header while loading */}
            {loading && !data ? (
              <PageHeaderSkeleton />
            ) : (
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
            )}

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
            {/* Error state */}
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

            {/* Loading: show skeleton that matches the current tab */}
            {loading && !error && <TabSkeleton tab={activeTab} />}

            {/* Loaded: wrap every tab in its own error boundary */}
            {data && !loading && (
              <div className="animate-fadeIn">
                {activeTab === "overview" && (
                  <SectionErrorBoundary title="Overview">
                    <OverviewTab data={data} ticker={ticker} />
                  </SectionErrorBoundary>
                )}
                {activeTab === "fundamentals" && (
                  <SectionErrorBoundary title="Fundamentals">
                    <FundamentalsTab data={data} />
                  </SectionErrorBoundary>
                )}
                {activeTab === "technicals" && (
                  <SectionErrorBoundary title="Technicals">
                    <TechnicalsTab data={data} />
                  </SectionErrorBoundary>
                )}
                {activeTab === "financials" && (
                  <SectionErrorBoundary title="Financials">
                    <FinancialsTab data={data} />
                  </SectionErrorBoundary>
                )}
                {activeTab === "peers" && (
                  <SectionErrorBoundary title="Peers">
                    <PeersTab data={data} />
                  </SectionErrorBoundary>
                )}
                {activeTab === "shareholding" && (
                  <SectionErrorBoundary title="Shareholding">
                    <ShareholdingTab data={data} />
                  </SectionErrorBoundary>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomTabBar />
    </div>
    </AuthGuard>
  );
}
