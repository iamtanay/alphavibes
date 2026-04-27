"use client";

import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import SearchBar from "@/components/search/SearchBar";
import { TRENDING_STOCKS } from "@/config";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";

export default function SearchPage() {
  const router = useRouter();
  return (
    <AuthGuard message="Sign in to search and analyse Indian stocks.">
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header showSearch={false} />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-xl font-bold text-text-primary mb-4">Search Stocks</h1>
        <SearchBar autoFocus />
        <div className="mt-6">
          <p className="text-xs text-text-secondary mb-3">Popular</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_STOCKS.map((t) => (
              <button key={t} onClick={() => router.push(`/analyse/${t}`)} className="chip text-xs">
                {t}
              </button>
            ))}
          </div>
        </div>
      </main>
      <BottomTabBar />
    </div>
    </AuthGuard>
  );
}
