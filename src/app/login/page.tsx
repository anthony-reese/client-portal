// src/app/login/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LoginPage() {
  const auth = getAuth(app);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Send the magic sign-in link
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const actionCodeSettings = {
        // Must match one of your Firebase Auth authorized domains
        url:
          process.env.NEXT_PUBLIC_APP_URL ??
          "http://localhost:3000/login",
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, {
              url: "https://client-portal-beige-seven.vercel.app/portal",
              handleCodeInApp: true,
            });
      window.localStorage.setItem("emailForSignIn", email);
      setMessage("✅ Login link sent! Check your inbox.");
    } catch (err: any) {
      console.error("Error sending sign-in link:", err);
      if (err.code === "auth/network-request-failed") {
        setMessage("⚠️ Network issue — check your internet connection or emulator setup.");
      } else if (err.code === "auth/invalid-email") {
        setMessage("⚠️ Please enter a valid email address.");
      } else {
        setMessage(`❌ ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const finishSignIn = async () => {
      const url = window.location.href;

      // Only process if this is an email sign-in link
      if (!isSignInWithEmailLink(auth, url)) return;

      // Retrieve stored email or prompt
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please confirm your email for sign-in") || "";
      }

      try {
        await signInWithEmailLink(auth, email, url);

        // Cleanup
        window.localStorage.removeItem("emailForSignIn");

        setMessage("🎉 Sign-in successful! Redirecting…");

        // Redirect to portal after sign-in is fully completed
        setTimeout(() => {
          window.location.href = "/portal";
        }, 800);
      } catch (err: any) {
        console.error("Sign-in error:", err);
        setMessage("❌ Invalid or expired link. Please try again.");
      }
    };

    finishSignIn();
  }, []);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Login to Client Portal</h1>

      <form onSubmit={handleSendLink} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="p-3 rounded bg-gray-800 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:ring focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="p-3 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-gray-300 text-center max-w-xs">{message}</p>
      )}
    </div>
  );
}
