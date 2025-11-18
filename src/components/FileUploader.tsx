// src/components/FileUploader.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { storage, db, app } from "@/lib/firebase";
import { toast } from "react-hot-toast";

interface FileUploaderProps {
  projectId: string;
  clientEmail?: string | null;
}

export default function FileUploader({ projectId, clientEmail }: FileUploaderProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const toastId = useRef<string | null>(null);

  // Detect current user's admin claim
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      getIdTokenResult(user)
        .then((token) => setIsAdmin(!!token.claims.admin))
        .catch(() => setIsAdmin(false));
    });

    return () => unsub();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      // Choose folder path based on role
      const folder = isAdmin ? "projects" : "client_uploads";
      const filePath = `${folder}/${projectId}/${file.name}`;
      const storageRef = ref(storage, filePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      // show a loading toast once upload starts (non-blocking)
      // normalize id to string for typings
      toastId.current = String(toast.loading(`Uploading ${file.name}...`));

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(pct);
        },
        (error) => {
          console.error("Upload error:", error);
          setMessage("❌ Upload failed.");
          setUploading(false);
          if (toastId.current) {
            toast.error("Upload failed", { id: toastId.current });
            toastId.current = null;
          } else {
            toast.error("Upload failed");
          }
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // Add metadata in Firestore under the right collection
          await addDoc(collection(db, "projects", projectId, "files"), {
            name: file.name,
            url,
            size: file.size,
            uploadedAt: serverTimestamp(),
            uploadedBy: clientEmail || (isAdmin ? "admin" : "client"),
            status: "pending",
          });

          setMessage("✅ Upload complete!");
          setUploading(false);
          setProgress(0);
          if (toastId.current) {
            toast.success("Upload complete", { id: toastId.current });
            toastId.current = null;
          } else {
            toast.success("Upload complete");
          }
        }
      );
    } catch (error) {
      console.error(error);
      setMessage("❌ Upload failed.");
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-900 mt-4">
      <h3 className="text-sm font-medium mb-2">
        {isAdmin ? "Admin File Upload" : "Client File Upload"}
      </h3>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        className="block w-full text-sm text-gray-300 mb-2"
      />
      {uploading && (
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {message && <p className="text-xs text-gray-400">{message}</p>}
    </div>
  );
}
