// src/hooks/useUserRole.ts

"use client";

import { useEffect, useState } from "react";
import { getAuth, getIdTokenResult } from "firebase/auth";
import { app } from "@/lib/firebase";

type Role = "admin" | "client" | "unknown";

export function useUserRole() {
  const [role, setRole] = useState<Role>("unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const run = async () => {
      const user = auth.currentUser;
      if (!user) {
        setRole("unknown");
        setLoading(false);
        return;
      }

      try {
        const token = await getIdTokenResult(user, true);
        setRole(token.claims.admin ? "admin" : "client");
      } catch (err) {
        console.error("Role check error", err);
        setRole("unknown");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return { role, loading };
}