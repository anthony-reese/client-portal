// src/components/RoleNav.tsx

"use client";

import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";

export default function RoleNav() {
  const { role, loading } = useUserRole();

  if (loading) return null;

  return (
    <nav className="flex gap-4 text-sm">
      <Link href="/portal" className="hover:underline">
        Portal
      </Link>

      {role === "admin" && (
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>
      )}

      <Link href="/dashboard" className="hover:underline">
        Dashboard
      </Link>
    </nav>
  );
}