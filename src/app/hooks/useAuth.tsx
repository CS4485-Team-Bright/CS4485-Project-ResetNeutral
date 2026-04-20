import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../api/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User) {
  const username =
    (user.user_metadata?.username as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Player";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username,
      email: user.email ?? null,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.warn("ensureProfile failed:", error.message);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Fetch initial session on application mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error("Error retrieving session:", error.message);
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fire and forget, don't await blocking initialization
        ensureProfile(session.user).catch(console.error);
      }
      
      setLoading(false);
    });

    // 2. Listen to all Auth state events continuously
    // Notice: NO async keyword here! To prevent deadlocking the Supabase client.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      if (event === "TOKEN_REFRESHED") {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      } 
      else if (event === "SIGNED_IN") {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        
        if (nextSession?.user) {
          // Use setTimeout to run the profile upsert AFTER the auth callback finishes
          // This entirely prevents the deadlock issue mentioned in instructions.
          setTimeout(async () => {
            await ensureProfile(nextSession.user);
          }, 0);
        }
      } 
      else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      }
      else if (event === "USER_UPDATED") {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;

    if (data.session?.user) {
      await ensureProfile(data.session.user);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const updateUsername = useCallback(
    async (username: string) => {
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (error) throw error;
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateUsername,
    }),
    [user, session, loading, signUp, signIn, signInWithGoogle, signOut, updateUsername]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}