"use client";

import { useEffect, useState } from "react";
import { getAuth, getIdTokenResult } from "firebase/auth";
import { app } from "@/lib/firebase";

type Role = "admin" | "client" | "unknown";

export function useUserRole() {
  const auth = getAuth(app);

  const [role, setRole] = useState<Role>("unknown");
  const [email, setEmail] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setRole("unknown");
      setEmail(null);
      setLastRefresh(null);
      setLoading(false);
      return;
    }

    const loadToken = async () => {
      try {
        const tokenResult = await getIdTokenResult(user, true); // force refresh

        setEmail(user.email ?? null);
        setRole(tokenResult.claims.admin ? "admin" : "client");

        const ts = new Date();
        setLastRefresh(ts.toLocaleTimeString());
      } catch (err) {
        console.error("Error loading role:", err);
        setRole("unknown");
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  return {
    email,
    role,
    lastRefresh,
    loading,
  };
}
