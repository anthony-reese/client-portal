// src/hooks/useAuthUser.ts

"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const auth = getAuth(app);

    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setInitializing(false);
      },
      (err) => {
        console.error("Auth error", err);
        setError(err);
        setInitializing(false);
      }
    );

    return () => unsub();
  }, []);

  return { user, initializing, error };
}
