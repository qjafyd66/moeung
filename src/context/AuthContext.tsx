"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  nickname: string;
  phone?: string;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithKakao: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail?: never;
  signOut: () => Promise<void>;
  checkNickname: (nickname: string) => Promise<boolean>;
  saveProfile: (userId: string, nickname: string) => Promise<string | null>;
  needsNickname: boolean;
  setNeedsNickname: (v: boolean) => void;
  needsPhone: boolean;
  setNeedsPhone: (v: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsNickname, setNeedsNickname] = useState(false);
  const [needsPhone, setNeedsPhone] = useState(false);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data ?? null);
    return data;
  }

  async function autoCreateSocialProfile(user: import("@supabase/supabase-js").User) {
    const name = user.user_metadata?.name || user.user_metadata?.full_name || "사용자";
    let { error } = await supabase.from("profiles").insert({ id: user.id, nickname: name });
    if (error?.code === "23505") {
      await supabase.from("profiles").insert({
        id: user.id,
        nickname: `${name}_${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
    const pendingPhone = localStorage.getItem("pendingPhone");
    if (pendingPhone) {
      await supabase.from("profiles").update({ phone: pendingPhone }).eq("id", user.id);
      localStorage.removeItem("pendingPhone");
    }
    await loadProfile(user.id);
    if (!pendingPhone) setNeedsPhone(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await loadProfile(session.user.id);
        if (!p) {
          if (session.user.app_metadata?.provider === "kakao") {
            await autoCreateSocialProfile(session.user);
          } else {
            setNeedsNickname(true);
          }
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await loadProfile(session.user.id);
        if (event === "SIGNED_IN") {
          const provider = session.user.app_metadata?.provider;
          const isSocial = provider === "kakao" || provider === "google";
          if (!p) {
            if (isSocial) await autoCreateSocialProfile(session.user);
            else setNeedsNickname(true);
          } else if (isSocial && !p.phone) {
            const pendingPhone = localStorage.getItem("pendingPhone");
            if (pendingPhone) {
              await supabase.from("profiles").update({ phone: pendingPhone }).eq("id", session.user.id);
              localStorage.removeItem("pendingPhone");
            } else {
              setNeedsPhone(true);
            }
          }
        }
      } else {
        setProfile(null);
        setNeedsNickname(false);
        setNeedsPhone(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.origin,
        queryParams: { scope: "profile_nickname" },
      },
    });
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signInWithEmail = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };


  const checkNickname = async (nickname: string): Promise<boolean> => {
    const { data } = await supabase.from("profiles").select("id").eq("nickname", nickname).single();
    return !!data;
  };

  const saveProfile = async (userId: string, nickname: string): Promise<string | null> => {
    const { error } = await supabase.from("profiles").insert({ id: userId, nickname });
    if (error) return error.message;
    await loadProfile(userId);
    setNeedsNickname(false);
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signInWithKakao, signInWithGoogle, signInWithEmail,
      signOut, checkNickname, saveProfile,
      needsNickname, setNeedsNickname,
      needsPhone, setNeedsPhone,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
