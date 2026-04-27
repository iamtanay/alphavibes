"use client";

import { useEffect } from "react";
import { Lock } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import { useAuth } from "@/components/providers/SupabaseProvider";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Message shown on the login wall. Defaults to a generic one. */
  message?: string;
}

/**
 * AuthGuard — wraps any page that requires authentication.
 *
 * Behaviour:
 *  - While auth is resolving  → shows a neutral skeleton (no flash of content).
 *  - User is NOT authenticated → shows a full-page login wall and opens
 *    the LoginModal so the user can sign in immediately.
 *  - User IS authenticated    → renders children normally.
 *
 * This is the single source of truth for protected-page auth enforcement.
 * Every protected page should be wrapped with this component, which means
 * the login modal is triggered automatically — no per-page logic needed.
 */
export default function AuthGuard({ children, message }: AuthGuardProps) {
  const { user, loading, signInWithGoogle, setShowLoginModal } = useAuth();

  // Open the login modal automatically when auth resolves and user is absent.
  // We do this in an effect so it only fires once per "not logged in" resolution.
  useEffect(() => {
    if (!loading && !user) {
      setShowLoginModal(true);
    }
  }, [loading, user, setShowLoginModal]);

  // ── Auth resolving: show skeleton so logged-in users don't see a flash ──
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Header />
        <main className="max-w-2xl mx-auto px-4 pt-8 pb-28">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl animate-pulse"
                style={{ backgroundColor: "var(--surface-2)" }}
              />
            ))}
          </div>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  // ── Not authenticated: login wall ────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Header />
        <main className="max-w-sm mx-auto px-4 py-24 pb-28 flex flex-col items-center text-center">
          {/* Lock icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.15), rgba(157,108,255,0.1))", border: "1px solid rgba(124,92,255,0.25)" }}
          >
            <Lock size={26} style={{ color: "var(--violet)" }} />
          </div>

          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Sign in to continue
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            {message ?? "This page requires an account. Sign in to access full stock analysis, watchlists, screener, and more."}
          </p>

          {/* Google Sign-in button */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-medium text-sm transition-all"
            style={{
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-2)")}
          >
            {/* Google SVG */}
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3L37.1 9.7C33.9 6.8 29.2 5 24 5 12.95 5 4 13.95 4 25s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.6-.4-3.9z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3L37.1 9.7C33.9 6.8 29.2 5 24 5 16.3 5 9.7 9.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 9.8-1.8 13.4-4.7L31 35.5c-1.9 1.4-4.3 2.2-7 2.2-5.2 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 41 16.3 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.3 5.5l6.4 4.8C41.4 34.5 44 30.1 44 25c0-1.3-.1-2.6-.4-3.9z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  // ── Authenticated: render the actual page ────────────────────────────────
  return <>{children}</>;
}
