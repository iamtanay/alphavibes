"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/SupabaseProvider";
import type { SearchResult } from "@/types";

interface SearchBarProps {
  compact?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({ compact, autoFocus }: SearchBarProps) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router     = useRouter();
  const { user, setShowLoginModal } = useAuth();
  const inputRef   = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleChange = (val: string) => {
    setQuery(val);
    clearTimeout(timeoutRef.current);
    if (!val.trim()) { setResults([]); setIsOpen(false); return; }
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await api.search(val);
        setResults(data.results);
        setIsOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  };

  const handleSelect = (ticker: string) => {
    if (!user) {
      setIsOpen(false);
      // Store destination so it survives the OAuth redirect
      sessionStorage.setItem("authRedirectNext", `/analyse/${ticker}`);
      setShowLoginModal(true);
      return;
    }
    setQuery(""); setIsOpen(false);
    router.push(`/analyse/${ticker}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) handleSelect(query.trim().toUpperCase());
  };

  const handleFocus = () => {
    setFocused(true);
    if (query) setIsOpen(true);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center rounded-xl overflow-hidden transition-all"
          style={{
            backgroundColor: "var(--surface-2)",
            border: `1px solid ${focused ? "var(--violet)" : "var(--border)"}`,
            boxShadow: focused
              ? "0 0 0 3px rgba(124,92,255,0.18), 0 4px 20px rgba(124,92,255,0.12)"
              : "none",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={() => { setFocused(false); setTimeout(() => setIsOpen(false), 150); }}
            placeholder="Search any stock or company"
            className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
            style={{
              color: "var(--text-primary)",
              fontSize: compact ? "13px" : "15px",
            }}
          />
          <button
            type="submit"
            className="px-4 h-full flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C5CFF, #9D6CFF)",
              minWidth: compact ? "42px" : "50px",
              minHeight: compact ? "38px" : "46px",
            }}
          >
            {loading
              ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <Search size={15} className="text-white" />
            }
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {results.map((r) => (
            <button
              key={r.ticker}
              onMouseDown={() => handleSelect(r.ticker)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
              style={{ borderBottom: "1px solid var(--border)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-3)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {r.ticker}
                </span>
                <span className="text-sm ml-2" style={{ color: "var(--text-secondary)" }}>
                  {r.name}
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
