// src/app/portal/page.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import type { Project, ProjectFile } from "@/types";
import ClientHeader from "@/components/ClientHeader";

export default function ClientPortalPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; data: Project }>>([]);
  const [files, setFiles] = useState<Record<string, ProjectFile[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setEmail(null);
        setLoading(false);
        return;
      }

      setEmail(user.email);
      console.log("Querying projects for:", user.email);

      const q = query(collection(db, "projects"), where("clientEmail", "==", user.email));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, data: d.data() as Project }));
      setProjects(items);

      const all: Record<string, ProjectFile[]> = {};
      for (const p of items) {
        const filesSnap = await getDocs(collection(doc(db, "projects", p.id), "files"));
        all[p.id] = filesSnap.docs.map((d) => d.data() as ProjectFile);
      }
      setFiles(all);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Helper for status badge
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-600/20 text-green-400 border border-green-600/40";
      case "pending":
        return "bg-yellow-600/20 text-yellow-400 border border-yellow-600/40";
      case "paused":
        return "bg-red-600/20 text-red-400 border border-red-600/40";
      default:
        return "bg-gray-600/20 text-gray-400 border border-gray-600/40";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-300">
        <p className="animate-pulse">Loading your projects…</p>
      </div>
    );

  if (!email)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-300">
        <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
        <p>Please log in to access your client portal.</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-6">
      <ClientHeader email={email} />
      <main className="flex flex-col items-center justify-start flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Projects</h1>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-gray-400 bg-gray-900 border border-gray-700 rounded-lg p-6 text-center max-w-lg"
          >
            <p className="mb-2">
              No projects have been assigned to <span className="text-indigo-400">{email}</span> yet.
            </p>
            <p className="text-sm text-gray-500">
              Once Tafah Tech adds a project for you, it will appear here automatically.
            </p>
          </motion.div>
        ) : (
          <div className="w-full max-w-3xl space-y-4">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="border border-gray-800 bg-gray-900 rounded-lg p-5 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">{p.data.name}</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      p.data.status
                    )}`}
                  >
                    {p.data.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  Last updated:{" "}
                  {p.data.updatedAt
                    ? new Date(p.data.updatedAt.seconds * 1000).toLocaleString()
                    : new Date(p.data.createdAt.seconds * 1000).toLocaleString()}
                </p>

                <h3 className="text-sm font-medium mb-2">Files</h3>
                <ul className="list-disc ml-5">
                  {(files[p.id] ?? []).length > 0 ? (
                    files[p.id].map((f, j) => (
                      <li key={`${f.name}-${j}`}>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 underline"
                        >
                          {f.name}
                        </a>
                        <span className="text-gray-500 text-xs ml-2">
                          ({f.size ? Math.round(f.size / 1024) : "?"} KB)
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No files yet.</li>
                  )}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
