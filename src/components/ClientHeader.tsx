"use client";

import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function ClientHeader({ email }: { email: string | null }) {
  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      window.location.href = "/login";
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🔥</span>
        <h1 className="font-bold text-lg tracking-wide text-white">
          Client Portal
        </h1>
      </div>
      {email && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">{email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-sm text-white transition"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
