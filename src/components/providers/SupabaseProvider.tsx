"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createClient, SupabaseClient, Session, User } from "@supabase/supabase-js";

export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  // Returns true if authed. If not, opens login modal and optionally
  // stores a callback to run after login.
  requireAuth: (callback?: () => void) => boolean;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (fn: (() => void) | null) => void;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

function toAuthUser(user: User): AuthUser {
  const m = user.user_metadata ?? {};
  const full = (m.full_name || m.name || "") as string;
  const parts = full.trim().split(" ");
  return {
    id: user.id,
    email: user.email ?? "",
    firstName: m.given_name || parts[0] || "",
    lastName: m.family_name || parts.slice(1).join(" ") || "",
    avatarUrl: m.avatar_url || m.picture || "",
  };
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // pendingAction lives in a ref so callbacks set before a re-render
  // are never lost to stale closures.
  const pendingRef = useRef<(() => void) | null>(null);
  const [pendingAction, _setPending] = useState<(() => void) | null>(null);

  const setPendingAction = useCallback((fn: (() => void) | null) => {
    pendingRef.current = fn;
    _setPending(fn ? () => fn : null);
  }, []);

  useEffect(() => {
    // 1. Hydrate from existing session (covers page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? toAuthUser(session.user) : null);
      setLoading(false);
    });

    // 2. React to every auth event:
    //    - SIGNED_IN fires after Google OAuth (implicit: fragment parsed by SDK)
    //    - SIGNED_OUT fires after signOut()
    //    - TOKEN_REFRESHED fires on silent refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authedUser = session?.user ? toAuthUser(session.user) : null;
      setSession(session);
      setUser(authedUser);
      setLoading(false);

      if (authedUser) {
        upsertProfile(session!.user);
        setShowLoginModal(false);

        // Fire and clear any pending navigation callback
        const action = pendingRef.current;
        if (action) {
          pendingRef.current = null;
          _setPending(null);
          setTimeout(action, 50);
        }
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upsertProfile(user: User) {
    const u = toAuthUser(user);
    await supabase.from("profiles").upsert(
      {
        id: u.id,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        avatar_url: u.avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  async function signInWithGoogle() {
    // After Google auth, Supabase SDK automatically parses the #access_token
    // fragment on the redirectTo page and fires onAuthStateChange('SIGNED_IN').
    // We redirect back to the current page so the pending callback can fire.
    //
    // If the user came from a protected page (e.g. /analyse/RELIANCE), the
    // pending callback (set by requireAuth) will navigate them there after login.
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href, // come back to wherever they are
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
      if (callback) setPendingAction(callback);
      setShowLoginModal(true);
      return false;
    },
    [user, setPendingAction]
  );

  return (
    <SupabaseContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
        requireAuth,
        showLoginModal,
        setShowLoginModal,
        pendingAction,
        setPendingAction,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useAuth must be used inside <SupabaseProvider>");
  return ctx;
}
