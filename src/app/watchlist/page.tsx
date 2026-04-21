"use client";

import { Star } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function WatchlistPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-16 pb-24 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "rgba(124,92,255,0.12)" }}
        >
          <Star size={28} className="text-violet" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Watchlist</h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Save your favourite stocks and track them in one place. Coming in V2.
        </p>
        <div
          className="inline-block px-4 py-2 rounded-full text-xs font-medium"
          style={{ backgroundColor: "rgba(124,92,255,0.12)", color: "var(--violet)", border: "1px solid rgba(124,92,255,0.25)" }}
        >
          Coming Soon
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
