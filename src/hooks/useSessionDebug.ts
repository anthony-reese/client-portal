// src/hooks/useSessionDebug.ts

"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";

interface SessionDebug {
    email: string | null;
    uid: string;
    claims: { [key: string]: any };
    expiration: string;
}

export default function useSessionDebug() {
  const [debug, setDebug] = useState<SessionDebug | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult(true);
        setDebug({
          email: user.email,
          uid: user.uid,
          claims: tokenResult.claims,
          expiration: tokenResult.expirationTime,
        });
        console.log("🔍 Session Debug:", {
          email: user.email,
          claims: tokenResult.claims,
          expiration: tokenResult.expirationTime,
        });
      } else {
        setDebug(null);
        console.log("⚠️ No user logged in.");
      }
    });
    return unsub;
  }, []);

  return debug;
}
