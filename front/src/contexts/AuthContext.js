"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function deriveName(u) {
    const meta = u?.user_metadata || {};
    return meta.full_name || meta.name || (u?.email ? u.email.split("@")[0] : null);
  }

  async function ensureAdminProfile(u) {
    try {
      if (!u) return;
      await fetch(`${API_BASE}/api/admins/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, email: u.email || null, name: deriveName(u) })
      });
    } catch (e) {
      console.warn("admins upsert 실패", e);
    }
  }

  useEffect(() => {
    let mounted = true;
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) ensureAdminProfile(session.user);
    }
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) ensureAdminProfile(session.user);
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  const value = { session, user, loading, supabase };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
