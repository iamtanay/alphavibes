// store/index.ts — Zustand store for global app state

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/types";

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  session: { used: number; remaining: number };
  setSession: (used: number, remaining: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "dark" ? "light" : "dark";
          // Apply to <html> element for Tailwind dark mode strategy
          if (typeof document !== "undefined") {
            document.documentElement.classList.remove("dark", "light");
            document.documentElement.classList.add(next);
          }
          return { theme: next };
        }),
      session: { used: 1, remaining: 2 },
      setSession: (used, remaining) => set({ session: { used, remaining } }),
    }),
    {
      name: "alphavibes-store",
      partialState: (state) => ({ theme: state.theme }),
    }
  )
);
