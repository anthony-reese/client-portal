//src/components/AdminProjectFiles.tsx

"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import toast, { Toaster } from "react-hot-toast";

interface Props {
  projectId: string;
}

interface FileDoc {
  id: string;
  name: string;
  url: string;
  size: number;
  status: "pending" | "approved";
  uploadedBy?: string;
  uploadedAt?: any;
  reviewedBy?: string;
  reviewedAt?: any;
}

export default function AdminProjectFiles({ projectId }: Props) {
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [files, setFiles] = useState<FileDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const ref = collection(db, "projects", projectId, "files");
      const q = query(ref, orderBy("uploadedAt", "desc"));
      const snap = await getDocs(q);
      const rows: FileDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setFiles(rows);
    } catch (err) {
      console.error(err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const toggleApproval = async (file: FileDoc) => {
    const user = auth.currentUser;
    if (!user) return;

    const nextStatus = file.status === "approved" ? "pending" : "approved";

    try {
      setSavingId(file.id);
      const ref = doc(db, "projects", projectId, "files", file.id);
      await updateDoc(ref, {
        status: nextStatus,
        reviewedBy: user.email || "admin",
        reviewedAt: new Date(),
      });

      toast.success(
        nextStatus === "approved" ? "File approved" : "Marked as pending"
      );

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: nextStatus } : f
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update approval status");
      toast.error("Could not update file status");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p>Loading files…</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!files.length) return <p className="text-gray-400">No files yet.</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">{files.length} file(s)</span>
        {files.length > 0 && (
          <button
            onClick={() => {
              files.forEach((f) => {
                window.open(f.url, "_blank");
              });
            }}
            className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs"
          >
            Download all
          </button>
        )}
      </div>
      {files.map((file) => (
        <div
          key={file.id}
          className="p-3 rounded border border-gray-800 bg-gray-900 flex items-center justify-between gap-3"
        >
          <div>
            <a
              href={file.url}
              target="_blank"
              className="font-semibold underline"
            >
              {file.name}
            </a>
            <div className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(1)} KB · Uploaded by{" "}
              {file.uploadedBy || "—"}
            </div>
          </div>

          <button
            onClick={() => toggleApproval(file)}
            disabled={!!savingId}
            className={`px-3 py-1 rounded text-sm ${
              file.status === "approved"
                ? "bg-green-700 hover:bg-green-800"
                : "bg-yellow-700 hover:bg-yellow-800"
            }`}
          >
            {savingId === file.id
              ? "Saving…"
              : file.status === "approved"
              ? "Approved ✓"
              : "Mark Approved"}
          </button>
        </div>
      ))}
    </div>
  );
}