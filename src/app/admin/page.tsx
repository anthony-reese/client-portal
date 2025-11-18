"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";
import { app } from "@/lib/firebase"; // your initialized app

export default function AdminTools() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const functions = getFunctions(app);
  const setAdminRole = httpsCallable(functions, "setAdminRole");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result: any = await setAdminRole({ email });
      setMessage(result.data.message);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Grant Admin Access</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Grant Admin Role
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
