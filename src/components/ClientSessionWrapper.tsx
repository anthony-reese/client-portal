// src/components/ClientSessionWrapper.tsx

"use client";

import { useSessionRefresh } from "@/hooks/useSessionRefresh";

export default function ClientSessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionRefresh();
  return <>{children}</>;
}
