// src/hooks/useFirestoreCollection.ts

"use client";

import { useEffect, useState } from "react";
import {
  CollectionReference,
  DocumentData,
  getDocs,
  query,
  QueryConstraint,
} from "firebase/firestore";

interface Options {
  once?: boolean; // can extend later for realtime
}

export function useFirestoreCollection<T = DocumentData>(
  ref: CollectionReference<T>,
  constraints: QueryConstraint[] = [],
  options: Options = { once: true }
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = constraints.length ? query(ref, ...constraints) : ref;
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setData(rows);
      } catch (err: any) {
        console.error("Firestore collection error", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (options.once) load();
  }, [ref.path]); // path is stable across renders

  return { data, loading, error };
}