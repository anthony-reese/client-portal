import admin from "firebase-admin";
import { readFileSync } from "fs";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function seed() {
  const projectId = "test123";
  const files = [
    {
      name: "contract.pdf",
      url: "https://example.com/file1",
      size: 14322,
      uploadedBy: "client@example.com",
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "pending",
    },
    {
      name: "logo.png",
      url: "https://example.com/file2",
      size: 20394,
      uploadedBy: "admin",
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "approved",
      reviewedBy: "admin",
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  // Seed project
  await db.doc(`projects/${projectId}`).set({
    clientEmail: "client@example.com",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Seed files
  const colRef = db.collection(`projects/${projectId}/files`);

  for (const file of files) {
    await colRef.add(file);
  }

  console.log("🌱 Seed completed");
}

seed();
