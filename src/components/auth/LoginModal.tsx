"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/components/providers/SupabaseProvider";

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showLoginModal]);

  if (!showLoginModal) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}
      >
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <X size={16} />
        </button>

        {/* Logo / Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7C5CFF, #9D6CFF)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 17l4-8 4 4 4-6 4 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Sign in to AlphaVibes
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Get full access to stock analysis, watchlists, and personalized insights.
          </p>
        </div>

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

        <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
