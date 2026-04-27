"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Star, Search, GitCompare, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/components/providers/SupabaseProvider";

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setShowLoginModal } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const iconColor = (href: string) =>
    isActive(href) ? "var(--violet)" : "var(--text-secondary)";

  function handleWatchlist(e: React.MouseEvent) {
    e.preventDefault();
    if (user) {
      router.push("/watchlist");
    } else {
      sessionStorage.setItem("authRedirectNext", "/watchlist");
      setShowLoginModal(true);
    }
  }

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

      {/* More */}
      <Link href="/more" className="flex flex-col items-center gap-1 px-3 py-1">
        <MoreHorizontal size={20} style={{ color: iconColor("/more") }} />
        <span className="text-[10px] font-medium" style={{ color: iconColor("/more") }}>More</span>
      </Link>
    </nav>
  );
}