// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
} from "firebase/storage";

// Use environment variables for flexibility
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Core Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Dual-mode: auto-detect environment
const isLocal = typeof window !== "undefined" && location.hostname === "localhost";
const useRealAuth = process.env.NEXT_PUBLIC_USE_REAL_AUTH === "true";

// --- Emulator connections only in local dev ---
/** 
if (isLocal) {
  // Only connect Auth emulator if real auth is NOT forced
  if (!useRealAuth) {
   connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
   console.log("⚙️ Using Firebase Auth Emulator (http://127.0.0.1:9099)");
  } else {
   console.log("✅ Using production Firebase Auth (real email links enabled)");
  }

   connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  console.log("🔥 Connected to Firestore + Storage Emulators");
}
*/

export { app, auth, db, storage };
