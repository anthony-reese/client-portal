// src/components/AppHeader.tsx

"use client";

import RoleNav from "./RoleNav";
import LogoutButton from "./LogoutButton";

export default function AppHeader() {
  return (
    <header className="w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="font-semibold text-lg">
          Client Portal Generator <span className="ml-1">🔥</span>
        </div>

        <div className="flex items-center gap-4">
          <RoleNav />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}