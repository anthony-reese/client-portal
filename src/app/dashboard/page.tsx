// src/app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult,
} from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { app } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "client" | null>(null);

  // -----------------------------------------
  // Auth state listener
  // -----------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const token = await getIdTokenResult(user, true);
        const isAdmin = token.claims?.admin === true;
        setRole(isAdmin ? "admin" : "client");

        // Load projects based on role
        if (isAdmin) {
          await loadAdminProjects();
        } else {
          await loadClientProjects(user.email!);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // -----------------------------------------
  // Admin: load ALL projects
  // -----------------------------------------
  const loadAdminProjects = async () => {
    const snap = await getDocs(collection(db, "projects"));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProjects(rows);
  };

  // -----------------------------------------
  // Client: load ONLY projects where clientEmail === user.email
  // -----------------------------------------
  const loadClientProjects = async (email: string) => {
    const q = query(
      collection(db, "projects"),
      where("clientEmail", "==", email)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProjects(rows);
  };

  // -----------------------------------------
  // UI — Loading & Error
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading your dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        {error}
      </div>
    );
  }

  // -----------------------------------------
  // UI — Dashboard Content
  // -----------------------------------------
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {role === "admin" ? "Admin Dashboard" : "Your Projects"}
      </h1>

      {projects.length === 0 && (
        <div className="text-gray-400">No projects found.</div>
      )}

      <ul className="space-y-4">
        {projects.map((p) => (
          <li
            key={p.id}
            className="border border-gray-700 rounded p-4 bg-gray-900"
          >
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-400">{p.description || "No description"}</p>

            {role === "admin" && p.clientEmail && (
              <p className="text-sm mt-2">Client: {p.clientEmail}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}