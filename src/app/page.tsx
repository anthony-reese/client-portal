"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  useEffect(() => {
    async function testFirestore() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        snapshot.forEach((doc) => {
          console.log("✅ Firestore doc:", doc.id, doc.data());
        });
      } catch (error) {
        console.error("❌ Firestore test failed:", error);
      }
    }

    testFirestore();
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-2xl font-semibold">Client Portal Generator 🔥</h1>
    </main>
  );
}
