// src/components/ProjectList.tsx

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Existing Projects</h2>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <span>{p.name}</span>
            <span className="text-sm text-gray-500">{p.status ?? "Active"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
