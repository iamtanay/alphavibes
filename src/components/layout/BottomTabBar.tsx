"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Star, Search, GitCompare, Sun, Moon, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { useAppStore } from "@/store";

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, setShowLoginModal } = useAuth();
  const { theme, toggleTheme } = useAppStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const iconColor = (href: string) =>
    isActive(href) ? "var(--violet)" : "var(--text-secondary)";

  function handleWatchlist(e: React.MouseEvent) {
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around h-16 px-2"
      style={{ backgroundColor: "var(--surface-1)", borderTop: "1px solid var(--border)" }}
    >
      {/* Home */}
      <Link href="/" className="flex flex-col items-center gap-1 px-3 py-1">
        <Home size={20} style={{ color: iconColor("/") }} />
        <span className="text-[10px] font-medium" style={{ color: iconColor("/") }}>Home</span>
      </Link>

      {/* Watchlist — auth gated */}
      <button onClick={handleWatchlist} className="flex flex-col items-center gap-1 px-3 py-1">
        <Star size={20} style={{ color: iconColor("/watchlist") }} />
        <span className="text-[10px] font-medium" style={{ color: iconColor("/watchlist") }}>Watchlist</span>
      </button>

      {/* Search — center CTA */}
      <Link href="/search" className="flex flex-col items-center gap-1">
        <span className="w-12 h-12 rounded-full bg-violet flex items-center justify-center shadow-violet-glow">
          <Search size={20} className="text-white" />
        </span>
        <span className="text-[10px] text-violet font-medium">Search</span>
      </Link>

      {/* Compare */}
      <Link href="/compare" className="flex flex-col items-center gap-1 px-3 py-1">
        <GitCompare size={20} style={{ color: iconColor("/compare") }} />
        <span className="text-[10px] font-medium" style={{ color: iconColor("/compare") }}>Compare</span>
      </Link>

      {/* Profile / Avatar */}
      <div className="relative flex flex-col items-center" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex flex-col items-center gap-1 px-3 py-1 focus:outline-none"
        >
          <div
            className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: `1.5px solid ${profileOpen ? "var(--violet)" : "var(--border)"}` }}
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-[9px] font-semibold"
                style={{ background: "linear-gradient(135deg, #7C5CFF, #9D6CFF)", color: "white" }}
              >
                {user ? initials : "👤"}
              </div>
            )}
          </div>
          <span
            className="text-[10px] font-medium"
            style={{ color: profileOpen ? "var(--violet)" : "var(--text-secondary)" }}
          >
            {user ? "Profile" : "Sign in"}
          </span>
        </button>

        {profileOpen && (
          <div
            className="absolute bottom-[calc(100%+8px)] right-0 rounded-xl overflow-hidden z-50 min-w-[200px]"
            style={{
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.35)",
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <button
                  onClick={() => { signOut(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium"
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
    </nav>
  );
}
