// src/hooks/useLogout.ts

"use client";

import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

/**
 * Custom hook for logging out the current user.
 * - Signs out from Firebase Auth
 * - Calls /api/session/logout to clear the secure cookie
 */
export function useLogout() {
  const auth = getAuth(app);

  const logout = async () => {
    try {
      // Sign out from Firebase (client session)
      await signOut(auth);

      // Clear the secure session cookie on the server
      await fetch("/api/session/logout", { method: "POST" });

      // Redirect to homepage or login
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return { logout };
}
