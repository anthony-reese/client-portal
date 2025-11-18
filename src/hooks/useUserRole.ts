// src/hooks/useUserRole.ts

"use client";

import { useEffect, useState } from "react";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

export function useUserRole() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "client" | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setEmail(null);
        setRole(null);
        setLastRefresh(null);
        setLoading(false);
        return;
      }

      const tokenResult = await user.getIdTokenResult();
      setEmail(user.email || "");
      setRole(tokenResult.claims.admin ? "admin" : "client");

      // Parse expiration time into a readable format
      const exp = tokenResult.expirationTime;
      if (exp) {
        const localTime = new Date(exp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setLastRefresh(localTime);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { email, role, lastRefresh, loading };
}
