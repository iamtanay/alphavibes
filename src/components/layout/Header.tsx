"use client";

import Link from "next/link";
import Image from "next/image";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store";
import SearchBar from "@/components/search/SearchBar";

interface HeaderProps {
  showSearch?: boolean;
}

export default function Header({ showSearch = true }: HeaderProps) {
  const { theme, toggleTheme } = useAppStore();

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
        {/* Logo Image */}
        <Image
          src="/logo.svg"
          alt="Alphavibes logo"
          width={30}
          height={30}
          className="object-contain"
          priority
        />

        {/* Text */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-semibold logo-gradient">
            AlphaVibes
          </span>
          <span
            className="text-[11px] hidden sm:inline"
            style={{ color: "var(--text-secondary)" }}
          >
            by Accrion
          </span>
        </div>
      </Link>

      {/* ── Desktop Nav Links ─────────────────── */}
      <nav className="hidden md:flex items-center gap-1">
        {[
          { label: "About", href: "/about" },
          { label: "How it works", href: "/about#how-it-works" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            {label}
          </Link>
        ))}
        <button
          className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
        >
          Markets <ChevronDown size={13} />
        </button>
      </nav>

      {/* ── Center Search ─────────────────────── */}
      {showSearch && (
        <div className="flex-1 max-w-[420px] hidden md:block">
          <SearchBar compact />
        </div>
      )}

      {/* ── Right Side ────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* India selector */}
        <button
          className="hidden md:flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
        >
          🇮🇳 <span>India</span>
          <ChevronDown size={12} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-3)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}