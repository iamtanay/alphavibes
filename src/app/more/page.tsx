"use client";

import { useRouter } from "next/navigation";
import { Filter, Info, Sun, Moon, GitCompare } from "lucide-react";
import { useAppStore } from "@/store";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function MorePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppStore();

  const items = [
    { icon: Filter, label: "Screener", desc: "Filter Nifty 500 stocks", action: () => router.push("/screener") },
    { icon: GitCompare, label: "Compare", desc: "Compare 2–3 stocks side by side", action: () => router.push("/compare") },
    { icon: Info, label: "About AlphaVibes", desc: "How it works, methodology, Accrion", action: () => router.push("/about") },
    {
      icon: theme === "dark" ? Sun : Moon,
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      desc: `Currently using ${theme} theme`,
      action: toggleTheme,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header showSearch={false} />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-xl font-bold text-text-primary mb-6">More</h1>
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full card flex items-center gap-4 hover:shadow-violet-glow transition-all text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(124,92,255,0.12)" }}
                >
                  <Icon size={18} className="text-violet" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary">
            AlphaVibes V1 · Built with ❤️ by{" "}
            <span className="text-violet">Accrion</span>
          </p>
          <p className="text-[11px] text-text-secondary mt-1">
            Data is delayed. Not for real-time trading.
          </p>
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
