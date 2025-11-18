"use client";

import { useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

export default function AdminTestPage() {
  const auth = getAuth(app);
  const functions = getFunctions(app);
  const setAdminRole = httpsCallable(functions, "setAdminRole");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  // Track login status
  onAuthStateChanged(auth, (u) => {
    setUser(u);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage("❌ Please sign in first.");
      return;
    }

    try {
      const result: any = await setAdminRole({ email });
      setMessage(`✅ ${result.data.message}`);
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow-lg rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-4">🔐 Admin Role Test</h1>

      {user ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Signed in as <b>{user.email}</b>
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="User email to promote"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-3"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Grant Admin Role
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">
              {message}
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-600">Please log in to test the function.</p>
      )}
    </div>
  );
}
