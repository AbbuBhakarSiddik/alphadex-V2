import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "./store";
import { fetchProfile, signIn, signOut, signUp, signInWithGoogle } from "./api";
import type { AuthCredentials } from "./types";

/**
 * Call this ONCE at the app root (see app/_layout.tsx). It keeps the auth
 * store in sync with Supabase's actual session state, including token
 * refreshes and sign-outs that happen in the background.
 */
export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id)
          .then(setProfile)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      console.log("MY TOKEN:", session?.access_token);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id).then(setProfile).catch(() => { });
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, [setSession, setProfile, setLoading]);
}

/**
 * Convenience hook for screens: pulls current auth state + exposes actions.
 * Screens should use this instead of calling api.ts / store.ts directly.
 */
export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);

  return {
    session,
    profile,
    isLoading,
    isAuthenticated: !!session,
    isAdmin: profile?.role === "admin",
    signIn: (creds: AuthCredentials) => signIn(creds),
    signUp: (creds: AuthCredentials) => signUp(creds),
    signInWithGoogle: () => signInWithGoogle(),
    signOut: () => signOut(),
  };
}
