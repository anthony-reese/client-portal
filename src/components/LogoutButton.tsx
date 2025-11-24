// src/components/LogoutButton.tsx

"use client";

import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
    >
      Logout
    </button>
  );
}