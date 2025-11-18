// src/components/UploadToProject.tsx
"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

type Props = { projectId: string; currentUserEmail?: string };

export default function UploadToProject({ projectId, currentUserEmail }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);

    try {
      const path = `projects/${projectId}/${file.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);

      task.on("state_changed", (snap) => {
        setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      });

      await task;
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(doc(db, "projects", projectId), "files"), {
        name: file.name,
        path,
        url,
        size: file.size,
        contentType: file.type,
        uploadedBy: currentUserEmail ?? "admin",
        uploadedAt: serverTimestamp(),
      });

      alert("Upload complete!");
      setProgress(0);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check rules and claims.");
    } finally {
      setBusy(false);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
        {busy ? `Uploading… ${progress}%` : "Upload File"}
        <input
          type="file"
          hidden
          onChange={onSelect}
          disabled={busy}
        />
      </label>
      {busy && <div className="text-xs text-gray-400">{progress}%</div>}
    </div>
  );
}
