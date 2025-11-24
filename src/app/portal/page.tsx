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
  where,
  orderBy,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import PortalFileUploader from "@/components/PortalFileUploader";
import toast, { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

export default function PortalPage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // -------------------------------
  // Load client projects
  // -------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.replace("/login");

      try {
        const q = query(
          collection(db, "projects"),
          where("clientEmail", "==", user.email)
        );

        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setProjects(rows);

        if (rows.length === 1) {
          // auto-select if only 1 project
          setSelectedProjectId(rows[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your projects.");
      } finally {
        setLoadingProjects(false);
      }
    });

    return () => unsub();
  }, []);

  // -------------------------------
  // Load files for selected project
  // -------------------------------
  const loadFiles = async (projectId: string) => {
    setLoadingFiles(true);
    try {
      const ref = collection(db, "projects", projectId, "files");
      const q = query(ref, orderBy("uploadedAt", "desc"));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFiles(rows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project files.");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) loadFiles(selectedProjectId);
  }, [selectedProjectId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster />

      <h1 className="text-3xl font-bold mb-6">Client Portal</h1>

      {/* ---------------------- */}
      {/* Project Selector */}
      {/* ---------------------- */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Projects</h2>

        {loadingProjects && <p>Loading…</p>}

        {!loadingProjects && projects.length === 0 && (
          <p className="text-gray-400">No projects assigned to this account.</p>
        )}

        <ul className="space-y-2">
          {projects.map((p) => (
            <li
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`p-3 rounded border cursor-pointer ${
                selectedProjectId === p.id
                  ? "border-blue-500 bg-gray-900"
                  : "border-gray-800 bg-gray-900/60 hover:border-gray-700"
              }`}
            >
              {p.name || "Untitled Project"}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------- */}
      {/* Status Legend */}
      {/* ---------------------- */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 bg-green-600 rounded-full"></span> Approved
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 bg-yellow-500 rounded-full"></span> Pending
        </div>
      </div>

      {/* ---------------------- */}
      {/* Files + Upload */}
      {/* ---------------------- */}
      {selectedProjectId && (
        <section className="mt-4">
          <h2 className="text-xl font-semibold mb-3">Files</h2>

          <PortalFileUploader projectId={selectedProjectId} />

          {loadingFiles && <p className="mt-3">Loading files…</p>}

          {!loadingFiles && files.length === 0 && (
            <p className="mt-3 text-gray-400">No files uploaded yet.</p>
          )}

          <ul className="mt-3 space-y-3">
            {files.map((f) => (
              <li
                key={f.id}
                className="p-3 border border-gray-800 rounded bg-gray-900 flex justify-between items-center"
              >
                <div>
                  <a
                    href={f.url}
                    target="_blank"
                    className="underline text-blue-400 font-semibold"
                  >
                    {f.name}
                  </a>
                  <p className="text-xs text-gray-400">
                    {(f.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <span
                  className={`px-2 py-1 rounded text-xs ${
                    f.status === "approved" ? "bg-green-700" : "bg-yellow-700"
                  }`}
                >
                  {f.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
