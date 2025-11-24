// src/app/admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import AppHeader from "@/components/AppHeader";
import AdminProjectFiles from "@/components/AdminProjectFiles";

export const dynamic = "force-dynamic";

interface Project {
  id: string;
  name?: string;
  description?: string;
  clientEmail?: string;
}

export default function AdminPage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login?redirect=/admin");
        return;
      }

      const token = await getIdTokenResult(user, true);
      if (!token.claims.admin) {
        router.replace("/portal");
        return;
      }

      try {
        const snap = await getDocs(collection(db, "projects"));
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setProjects(rows);
      } catch (err) {
        console.error(err);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-6">
        <section>
          <h1 className="text-2xl font-bold mb-4">Projects</h1>

          {loading && <p>Loading projects…</p>}
          {error && <p className="text-red-400">{error}</p>}

          <ul className="space-y-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className={`p-3 rounded border cursor-pointer ${
                  selectedProjectId === p.id
                    ? "border-blue-500 bg-gray-900"
                    : "border-gray-800 bg-gray-900/60 hover:border-gray-600"
                }`}
                onClick={() => setSelectedProjectId(p.id)}
              >
                <div className="font-semibold">{p.name || "Untitled"}</div>
                <div className="text-xs text-gray-400">
                  Client: {p.clientEmail || "—"}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Files</h2>
          {selectedProjectId ? (
            <AdminProjectFiles projectId={selectedProjectId} />
          ) : (
            <p className="text-gray-400">
              Select a project to see and approve files.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}