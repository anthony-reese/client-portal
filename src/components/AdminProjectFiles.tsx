//src/components/AdminProjectFiles.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

interface AdminProjectFilesProps {
  projectId: string;
  adminEmail: string;
}

export default function AdminProjectFiles({ projectId, adminEmail }: AdminProjectFilesProps) {
  const [files, setFiles] = useState<any[] | null>(null);

  // small local helper instead of pulling in `clsx` dependency
  const clsx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(" ");

  // format Firestore Timestamp (or Date-like) to human string
  const formatTimestamp = (ts: any) => {
    try {
      if (!ts) return "";
      // Firestore Timestamp has .seconds; otherwise try Date
      const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
      return date.toLocaleString();
    } catch (err) {
      return "";
    }
  };

  function LoadingSkeleton() {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  // Realtime listener — fetch files for this project
  useEffect(() => {
    const colRef = collection(db, "projects", projectId, "files");

    const unsub = onSnapshot(colRef, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setFiles(list);
    });

    return () => unsub();
  }, [projectId]);

  // Toggle approval
  async function toggleStatus(fileId: string, file: any) {
    const next = file.status === "approved" ? "pending" : "approved";

    const ref = doc(db, "projects", projectId, "files", fileId);

    await updateDoc(ref, {
      status: next,
      reviewedBy: next === "approved" ? adminEmail : null,
      reviewedAt: next === "approved" ? serverTimestamp() : null,
    });
  }

  function FileList() {
    if (!files || files.length === 0) {
      return <p className="text-sm text-gray-500">No files uploaded yet.</p>;
    }

    return (
      <ul className="space-y-3">
        {files.map((file) => (
          <li key={file.id} className="list-none">
            <div className="rounded-xl border p-4 bg-white shadow-sm text-black">
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{file.name}</p>
                  <span
                    className={clsx(
                      "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                      file.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}
                  >
                    {file.status || "pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={file.status === "approved"}
                      onChange={() => toggleStatus(file.id, file)}
                    />
                    <div
                      className="w-10 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full relative transition"
                    >
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 peer-checked:translate-x-4 transition" />
                    </div>
                  </label>

                  <p className="text-xs text-gray-500">
                    {file.reviewedBy ?? "—"} · {file.reviewedAt && formatTimestamp(file.reviewedAt)}
                  </p>
                </div>

                {/* If there were additional file list UI, it could go here. */}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Project Files</h3>

      {files === null ? <LoadingSkeleton /> : <FileList />}
    </div>
  );
}
