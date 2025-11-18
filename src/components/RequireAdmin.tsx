// src/components/RequireAdmin.tsx

"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      if (data?.role === "admin") {
        setAuthorized(true);
      } else {
        router.push("/");
      }
    });

    return () => unsub();
  }, [router]);

  return authorized ? <>{children}</> : <p className="p-4">Checking access...</p>;
}
