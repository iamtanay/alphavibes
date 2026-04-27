"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createClient, SupabaseClient, Session, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

interface SupabaseContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  requireAuth: (callback?: () => void) => boolean;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (fn: (() => void) | null) => void;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

function userFromSupabase(user: User): AuthUser {
  const meta = user.user_metadata || {};
  const fullName: string = meta.full_name || meta.name || "";
  const parts = fullName.trim().split(" ");
  const firstName = meta.given_name || parts[0] || "";
  const lastName = meta.family_name || parts.slice(1).join(" ") || "";
  return {
    id: user.id,
    email: user.email || "",
    firstName,
    lastName,
    avatarUrl: meta.avatar_url || meta.picture || "",
  };
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Use a ref for pendingAction so it is never stale inside closures,
  // and also expose it as state so consumers can read it reactively.
  const pendingActionRef = useRef<(() => void) | null>(null);
  const [pendingAction, _setPendingActionState] = useState<(() => void) | null>(null);

  const setPendingAction = useCallback((fn: (() => void) | null) => {
    pendingActionRef.current = fn;
    _setPendingActionState(fn ? () => fn : null);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? userFromSupabase(session.user) : null);
      setLoading(false);
    });

    // Listen for auth changes (fires on sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authedUser = session?.user ? userFromSupabase(session.user) : null;
      setSession(session);
      setUser(authedUser);
      setLoading(false);

      if (authedUser) {
        upsertUserProfile(session!.user);
        setShowLoginModal(false);

        // Fire any pending action (stored before modal was opened).
        // Use ref so we always get the latest value, not a stale closure.
        const action = pendingActionRef.current;
        if (action) {
          pendingActionRef.current = null;
          _setPendingActionState(null);
          setTimeout(() => action(), 50);
        }
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upsertUserProfile(user: User) {
    const profile = userFromSupabase(user);
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: profile.email,
        first_name: profile.firstName,
        last_name: profile.lastName,
        avatar_url: profile.avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  async function signInWithGoogle() {
    // Read the intended destination from sessionStorage (set by requireAuth
    // or handleWatchlist before opening the modal). This survives the full
    // Google OAuth redirect round-trip because sessionStorage persists
    // across same-origin navigations within the same tab.
    const next = sessionStorage.getItem("authRedirectNext") || "";

    const callbackUrl = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  const requireAuth = useCallback(
    (callback?: () => void): boolean => {
      if (user) return true;
      if (callback) {
        // Store callback in ref (survives re-renders, used if modal login succeeds
        // without a page reload — e.g. future email/password auth).
        setPendingAction(callback);
        // Also store the current page in sessionStorage so signInWithGoogle
        // can carry it through the OAuth redirect.
        sessionStorage.setItem("authRedirectNext", window.location.pathname);
      }
      setShowLoginModal(true);
      return false;
    },
    [user, setPendingAction]
  );

  return (
    <SupabaseContext.Provider
      value={{
        user, session, loading,
        signInWithGoogle, signOut, requireAuth,
        showLoginModal, setShowLoginModal,
        pendingAction, setPendingAction,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useAuth must be used inside SupabaseProvider");
  return ctx;
}
