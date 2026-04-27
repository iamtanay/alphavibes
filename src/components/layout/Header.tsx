"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, LogOut, Star, GitCompare } from "lucide-react";
import { useAppStore } from "@/store";
import { useAuth } from "@/components/providers/SupabaseProvider";
import SearchBar from "@/components/search/SearchBar";
import { useRouter } from "next/navigation";

interface HeaderProps {
  showSearch?: boolean;
}

export default function Header({ showSearch = true }: HeaderProps) {
  const { theme, toggleTheme } = useAppStore();
  const { user, signOut, setShowLoginModal } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleWatchlistClick(e: React.MouseEvent) {
    e.preventDefault();
    if (user) {
      router.push("/watchlist");
    } else {
      // Store destination in sessionStorage so it survives the OAuth redirect
      sessionStorage.setItem("authRedirectNext", "/watchlist");
      setShowLoginModal(true);
    }
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "";

  return (
    <header
      className="sticky top-0 z-50 h-14 flex items-center justify-between px-5 gap-4"
      style={{
        backgroundColor: "var(--surface-1)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* ── Logo ─────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image
          src="/logo.svg"
          alt="Alphavibes logo"
          width={30}
          height={30}
          className="object-contain"
          priority
        />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-semibold logo-gradient">AlphaVibes</span>
          <span className="text-[11px] hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
            by Accrion
          </span>
        </div>
      </Link>

      {/* ── Desktop Nav Links ─────────────────── */}
      <nav className="hidden md:flex items-center gap-1">
        {[{ label: "About", href: "/about" }].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            {label}
          </Link>
        ))}

        {/* Watchlist — auth gated */}
        <button
          onClick={handleWatchlistClick}
          className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <Star size={14} />
          Watchlist
        </button>

        <Link
          href="/screener"
          className="px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Screener
        </Link>

        <Link
          href="/compare"
          className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <GitCompare size={14} />
          Compare
        </Link>
      </nav>

      {/* ── Center Search ─────────────────────── */}
      {showSearch && (
        <div className="flex-1 max-w-[420px] hidden md:block">
          <SearchBar compact />
        </div>
      )}

      {/* ── Right Side: Profile ────────────────── */}
      <div className="flex items-center gap-2 shrink-0" ref={profileRef}>
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center justify-center rounded-full overflow-hidden transition-all focus:outline-none"
            style={{
              width: 34,
              height: 34,
              border: `2px solid ${profileOpen ? "var(--violet)" : "var(--border)"}`,
            }}
            aria-label="Profile"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                width={34}
                height={34}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-semibold"
                style={{ background: "linear-gradient(135deg, #7C5CFF, #9D6CFF)", color: "white" }}
              >
                {user ? initials : <span style={{ color: "var(--text-secondary)", fontSize: 16 }}>👤</span>}
              </div>
            )}
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] rounded-xl overflow-hidden z-50 min-w-[210px]"
              style={{
                backgroundColor: "var(--surface-2)",
                border: "1px solid var(--border)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              }}
            >
              {user ? (
                <>
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => { toggleTheme(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </button>
                  <button
                    onClick={() => { signOut(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { toggleTheme(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </button>
                  <div className="border-t" style={{ borderColor: "var(--border)" }} />
                  <button
                    onClick={() => { setShowLoginModal(true); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: "var(--violet)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    Sign in / Sign up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
