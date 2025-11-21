"use client";

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  getIdTokenResult,
} from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LoginPage() {
  const auth = getAuth(app);
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = window.location.href;

    if (!isSignInWithEmailLink(auth, url)) return;

    let storedEmail = window.localStorage.getItem("emailForSignIn");

    if (!storedEmail) {
      storedEmail = window.prompt("Please confirm your email for sign-in") || "";
    }

    if (!storedEmail) {
      setMessage("❌ No email provided. Try again.");
      return;
    }

    const complete = async () => {
      try {
        await signInWithEmailLink(auth, storedEmail!, url);
        window.localStorage.removeItem("emailForSignIn");

        setMessage("🎉 Sign-in successful! Redirecting…");

        const user = getAuth(app).currentUser;
        const token = user ? await getIdTokenResult(user, true) : null;

        const explicit = params.get("redirect");
        const defaultTarget = token?.claims?.admin ? "/dashboard" : "/portal";
        const target = explicit || defaultTarget;

        router.replace(target);
      } catch (err) {
        console.error("Sign-in error:", err);
        setMessage("❌ Invalid or expired link. Try again.");
      }
    };

    complete();
  }, []); // IMPORTANT: no params in dependencies

  const sendLink = async () => {
    if (!email) return setMessage("Enter an email");

    try {
      setMessage("Sending magic link…");

      await sendSignInLinkToEmail(auth, email, {
        url: "https://client-portal-beige-seven.vercel.app/login",
        handleCodeInApp: true,
      });

      window.localStorage.setItem("emailForSignIn", email);
      setMessage("✨ Magic link sent! Check your email.");
    } catch (err) {
      console.error("Link send error:", err);
      setMessage("❌ Could not send link. Check configuration.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-3xl font-bold mb-6">Login to Client Portal</h1>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="border px-3 py-2 mb-3 rounded text-black w-64"
      />

      <button
        onClick={sendLink}
        className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
      >
        Send Magic Link
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
