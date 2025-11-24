// src/components/AppHeader.tsx

"use client";

import RoleNav from "./RoleNav";
import LogoutButton from "./LogoutButton";
import UserProfileMenu from "./UserProfileMenu";

export default function AppHeader() {
  return (
    <header className="w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="max-w-5xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3">
        <div className="font-semibold text-lg">
          Client Portal Generator <span className="ml-1">🔥</span>
        </div>

        <div className="flex items-center gap-4">
          <RoleNav />
          <UserProfileMenu />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}