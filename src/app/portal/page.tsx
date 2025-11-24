// src/app/portal/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where
} from "firebase/firestore";
import { app } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export default function PortalPage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        await loadClientProjects(user.email!);
      } catch (err) {
        console.error(err);
        setError("Could not load your projects");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // Load projects where clientEmail = user
  const loadClientProjects = async (email: string) => {
    const q = query(
      collection(db, "projects"),
      where("clientEmail", "==", email)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProjects(rows);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading your client portal…
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Client Portal</h1>

      {projects.length === 0 && (
        <p className="text-gray-400">No projects are assigned to this account.</p>
      )}

      <ul className="space-y-4">
        {projects.map((proj) => (
          <li
            key={proj.id}
            className="border border-gray-700 rounded p-4 bg-gray-900"
          >
            <h2 className="text-xl font-semibold">{proj.name}</h2>
            <p className="text-sm text-gray-400">
              {proj.description ?? "No description"}
            </p>

            <h3 className="mt-3 text-lg font-semibold">Files</h3>
            {proj.files?.length === 0 && (
              <p className="text-gray-500">No files uploaded yet.</p>
            )}

            <ul className="mt-2 space-y-2">
              {proj.files?.map((f: any) => (
                <li
                  key={f.id}
                  className="bg-gray-800 p-2 rounded border border-gray-600"
                >
                  <a
                    href={f.url}
                    target="_blank"
                    className="underline text-blue-400"
                  >
                    {f.name}
                  </a>

                  <span className="ml-3 text-sm text-gray-400">
                    ({Math.round(f.size / 1024)} KB)
                  </span>

                  <span
                    className={`ml-4 px-2 py-1 rounded text-xs ${
                      f.status === "approved"
                        ? "bg-green-700"
                        : "bg-yellow-600"
                    }`}
                  >
                    {f.status}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}