"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useUserRole } from "@/hooks/useUserRole";
import LogoutButton from "./LogoutButton";

export default function UserProfileMenu() {
  const auth = getAuth(app);
  const { role, loading } = useUserRole();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEmail(auth.currentUser?.email ?? null);
  }, [auth.currentUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading || !email) return null;

  const label = role === "admin" ? "Admin" : "Client";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs">
          {email[0]?.toUpperCase()}
        </span>
        <span className="hidden sm:inline truncate max-w-[120px]">{email}</span>
        <span className="text-xs text-gray-300">({label})</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded border border-gray-700 bg-gray-900 shadow-lg text-sm">
          <div className="px-3 py-2 border-b border-gray-800">
            <div className="font-semibold truncate">{email}</div>
            <div className="text-xs text-gray-400 capitalize">{label} account</div>
          </div>
          <div className="px-3 py-2 text-xs text-gray-400">
            Profile & settings (coming soon)
          </div>
          <div className="border-t border-gray-800 px-3 py-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
