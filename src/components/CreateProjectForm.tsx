// src/components/CreateProjectForm.tsx
"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CreateProjectForm() {
  const [name, setName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientEmail) return alert("All fields required");
    setLoading(true);
    try {
      await addDoc(collection(db, "projects"), {
        name,
        clientEmail,
        status: "Active",
        createdAt: serverTimestamp(),
      });
      setName("");
      setClientEmail("");
      alert("Project created!");
    } catch (err) {
      console.error(err);
      alert("Error creating project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border p-4 rounded">
      <h2 className="font-semibold">Create New Project</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="email"
        placeholder="Client Email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}
