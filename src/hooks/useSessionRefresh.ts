// src/hooks/useSessionRefresh.ts

"use client";

import { useEffect } from "react";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

/**
 * Keeps the secure __session cookie up-to-date with Firebase Auth state.
 * - When ID token changes (auto refresh ~1h), send it to /api/session/refresh
 * - When user logs out, call /api/session/logout to clear cookie
 */
export function useSessionRefresh() {
  useEffect(() => {
    const auth = getAuth(app);

    // Runs whenever the Firebase ID token changes or user logs in/out
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      try {
        if (user) {
          // Get new ID token from Firebase
          const idToken = await user.getIdToken(/* forceRefresh */ false);

          // Refresh secure cookie on the server
          await fetch("/api/session/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } else {
          // No user → clear the cookie
          await fetch("/api/session/logout", { method: "POST" });
        }
      } catch (err) {
        console.error("Session refresh error:", err);
      }
    });

    return () => unsubscribe();
  }, []);
}
