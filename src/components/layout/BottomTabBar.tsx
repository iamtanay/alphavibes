"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, Search, GitCompare, MoreHorizontal } from "lucide-react";

const tabs = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Watchlist", icon: Star, href: "/watchlist" },
  { label: "Search", icon: Search, href: "/search", isCenter: true },
  { label: "Compare", icon: GitCompare, href: "/compare" },
  { label: "More", icon: MoreHorizontal, href: "/more" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around h-16 px-2"
      style={{ backgroundColor: "var(--surface-1)", borderTop: "1px solid var(--border)" }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));

        if (tab.isCenter) {
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center gap-1"
            >
              <span className="w-12 h-12 rounded-full bg-violet flex items-center justify-center shadow-violet-glow">
                <Icon size={20} className="text-white" />
              </span>
              <span className="text-[10px] text-violet font-medium">{tab.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <Icon
              size={20}
              style={{ color: isActive ? "var(--violet)" : "var(--text-secondary)" }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? "var(--violet)" : "var(--text-secondary)" }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
