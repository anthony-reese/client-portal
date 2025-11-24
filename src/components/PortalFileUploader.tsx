// src/components/PortalFileUploader.tsx

"use client";

import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface Props {
  projectId: string;
}

export default function PortalFileUploader({ projectId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const storage = getStorage(app);
  const db = getFirestore(app);
  const auth = getAuth(app);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Select a file first.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be signed in to upload.");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const path = `projects/${projectId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const filesRef = collection(db, "projects", projectId, "files");
      await addDoc(filesRef, {
        name: file.name,
        url,
        size: file.size,
        uploadedAt: serverTimestamp(),
        uploadedBy: user.email || "client",
        status: "pending",
      });

      setMessage("✅ File uploaded and submitted for review.");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 border border-gray-800 rounded p-3 bg-gray-900">
      <h3 className="font-semibold mb-2">Upload a file</h3>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2 text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}