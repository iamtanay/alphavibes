"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth, supabase } from "@/components/providers/SupabaseProvider";
import { api } from "@/lib/api";
import { formatChange, changeColor } from "@/lib/utils";

interface WatchlistItem {
  id: string;
  ticker: string;
  added_at: string;
}

interface QuoteData {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  loading: boolean;
  error: boolean;
}

export default function WatchlistPage() {
  return (
    <AuthGuard message="Sign in to save stocks and track them in one place.">
      <WatchlistPageInner />
    </AuthGuard>
  );
}

function WatchlistPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [listLoading, setListLoading] = useState(true);
  const [addTicker, setAddTicker] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("id, ticker, added_at")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });
      if (error) throw error;
      setItems(data ?? []);
    } catch (e) {
      console.error("Failed to fetch watchlist", e);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  useEffect(() => {
    if (!items.length) return;
    items.forEach(async (item) => {
      if (quotes[item.ticker]) return;
      setQuotes((p) => ({
        ...p,
        [item.ticker]: { ticker: item.ticker, name: item.ticker, price: 0, changePercent: 0, loading: true, error: false },
      }));
      try {
        const q = await api.quote(item.ticker);
        setQuotes((p) => ({
          ...p,
          [item.ticker]: { ticker: item.ticker, name: q.name || item.ticker, price: q.price ?? 0, changePercent: q.changePercent ?? 0, loading: false, error: false },
        }));
      } catch {
        setQuotes((p) => ({ ...p, [item.ticker]: { ...p[item.ticker], loading: false, error: true } }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const ticker = addTicker.trim().toUpperCase();
    if (!ticker) return;
    if (items.find((i) => i.ticker === ticker)) { setAddError("Already in watchlist"); return; }
    setAdding(true); setAddError("");
    try {
      const { error } = await supabase.from("watchlist").insert({ user_id: user!.id, ticker });
      if (error) throw error;
      setAddTicker("");
      await fetchWatchlist();
    } catch { setAddError("Couldn't add ticker. Check the symbol and try again."); }
    finally { setAdding(false); }
  }

  async function handleRemove(id: string) {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (!error) setItems((p) => p.filter((i) => i.id !== id));
  }

  // Watchlist is only rendered when user is authenticated (AuthGuard above).
  // user is guaranteed non-null here.

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-28 md:pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Star size={20} className="text-violet" />
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            My Watchlist
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(124,92,255,0.12)", color: "var(--violet)" }}
          >
            {items.length} stocks
          </span>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={addTicker}
            onChange={(e) => { setAddTicker(e.target.value.toUpperCase()); setAddError(""); }}
            placeholder="Add ticker (e.g. RELIANCE)"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--violet)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          <button
            type="submit"
            disabled={adding || !addTicker.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7C5CFF, #9D6CFF)" }}
          >
            <Plus size={15} />
            {adding ? "Adding…" : "Add"}
          </button>
        </form>

        {addError && <p className="text-xs mb-4 -mt-3" style={{ color: "#ef4444" }}>{addError}</p>}

        {listLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "var(--surface-2)" }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Star size={24} className="text-violet mx-auto mb-3" />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No stocks yet. Add one above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const q = quotes[item.ticker];
              const up = (q?.changePercent ?? 0) > 0;
              const dn = (q?.changePercent ?? 0) < 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <button
                    onClick={() => router.push(`/analyse/${item.ticker}`)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ backgroundColor: "rgba(124,92,255,0.12)", color: "var(--violet)" }}
                    >
                      {item.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{item.ticker}</p>
                      {q && !q.loading && !q.error && (
                        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{q.name}</p>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {q?.loading ? (
                      <div className="w-16 h-8 rounded-lg animate-pulse" style={{ backgroundColor: "var(--surface-3)" }} />
                    ) : q?.error ? (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>—</span>
                    ) : q ? (
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          ₹{q.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </p>
                        <div className={`flex items-center gap-0.5 justify-end text-xs font-medium ${changeColor(q.changePercent)}`}>
                          {up ? <TrendingUp size={11} /> : dn ? <TrendingDown size={11} /> : <Minus size={11} />}
                          {formatChange(q.changePercent)}
                        </div>
                      </div>
                    ) : null}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomTabBar />
    </div>
  );
}
