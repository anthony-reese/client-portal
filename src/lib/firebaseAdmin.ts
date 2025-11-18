// src/lib/firebaseAdmin.ts
export const runtime = "nodejs";

import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log("⚙️  Firebase Admin (emulator mode)");
  } else {
    console.log("🔥 Firebase Admin (production)");
  }
}

export const app = admin.app();
export const auth = admin.auth(app);
export const db = admin.firestore(app);
export const bucket = admin.storage().bucket();

