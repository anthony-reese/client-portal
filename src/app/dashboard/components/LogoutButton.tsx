"use client";

import { useLogout } from "@/hooks/useLogout";

export default function LogoutButton() {
  const { logout } = useLogout();

  return (
    <button
      onClick={logout}
      className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700"
    >
      Logout
    </button>
  );
}
