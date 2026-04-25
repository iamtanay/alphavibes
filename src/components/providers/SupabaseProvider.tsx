"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  /** Returns true if already authenticated. If not, shows login modal and
   *  optionally stores a callback to run after the user signs in. */
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
  // Store as a ref-like object to avoid stale closure issues
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? userFromSupabase(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authedUser = session?.user ? userFromSupabase(session.user) : null;
      setSession(session);
      setUser(authedUser);

      if (authedUser) {
        // Upsert profile
        upsertUserProfile(session!.user);
        // Close modal
        setShowLoginModal(false);
        // Fire pending action (e.g. navigate to the originally requested page)
        setPendingAction((prev) => {
          if (prev) {
            // Run on next tick so state is settled
            setTimeout(() => prev(), 50);
          }
          return null;
        });
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
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
      if (callback) setPendingAction(() => callback);
      setShowLoginModal(true);
      return false;
    },
    [user]
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
