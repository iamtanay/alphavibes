// store/index.ts — Zustand store for global app state
//
// Changes vs original:
//   1. Fixed `partialState` → `partialize` (wrong key silently persisted everything
//      including the hardcoded session counts)
//   2. Added `analysisCache` keyed by ticker with a 15-minute in-memory TTL.
//      The analyse page writes on successful fetch; the persona page (and any
//      revisit) reads from it to avoid redundant 22-second round-trips.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme, AnalysisResponse } from "@/types";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  data: AnalysisResponse;
  fetchedAt: number; // Date.now()
}

interface AppState {
  // ── Theming ──────────────────────────────────────────────────────────────
  theme: Theme;
  toggleTheme: () => void;

  // ── Session ──────────────────────────────────────────────────────────────
  session: { used: number; remaining: number };
  setSession: (used: number, remaining: number) => void;

  // ── Analysis cache ────────────────────────────────────────────────────────
  // Keyed by ticker (upper-case). Entries older than CACHE_TTL_MS are stale.
  analysisCache: Record<string, CacheEntry>;
  setAnalysis: (ticker: string, data: AnalysisResponse) => void;
  getAnalysis: (ticker: string) => AnalysisResponse | null;
  clearAnalysisCache: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Theme ──────────────────────────────────────────────────────────────
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "dark" ? "light" : "dark";
          if (typeof document !== "undefined") {
            document.documentElement.classList.remove("dark", "light");
            document.documentElement.classList.add(next);
          }
          return { theme: next };
        }),

      // ── Session ────────────────────────────────────────────────────────────
      session: { used: 0, remaining: 3 },
      setSession: (used, remaining) => set({ session: { used, remaining } }),

      // ── Analysis cache ─────────────────────────────────────────────────────
      analysisCache: {},

      setAnalysis: (ticker, data) =>
        set((state) => ({
          analysisCache: {
            ...state.analysisCache,
            [ticker.toUpperCase()]: { data, fetchedAt: Date.now() },
          },
        })),

      getAnalysis: (ticker) => {
        const entry = get().analysisCache[ticker.toUpperCase()];
        if (!entry) return null;
        const age = Date.now() - entry.fetchedAt;
        if (age > CACHE_TTL_MS) {
          // Stale — evict and return null so a fresh fetch is triggered
          set((state) => {
            const next = { ...state.analysisCache };
            delete next[ticker.toUpperCase()];
            return { analysisCache: next };
          });
          return null;
        }
        return entry.data;
      },

      clearAnalysisCache: () => set({ analysisCache: {} }),
    }),
    {
      name: "alphavibes-store",
      // Only persist the theme — never persist session counts or cache entries
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
