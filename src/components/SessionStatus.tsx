// src/components/SessionStatus.tsx

"use client";

import { useUserRole } from "@/hooks/useUserRole";

export default function SessionStatus() {
  const { email, role, lastRefresh, loading } = useUserRole();

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Checking session...
      </div>
    );
  }

  if (!email) {
    return <div className="text-sm text-red-600">Not signed in</div>;
  }

  const color = role === "admin" ? "bg-blue-600" : "bg-green-600";
  const label = role === "admin" ? "Admin" : "Client";

  return (
    <div className="flex items-center space-x-3 text-sm text-gray-700">
      <div className="flex items-center space-x-2">
        <span className={`inline-block w-2 h-2 rounded-full ${color}`}></span>
        <span>{email}</span>
        <span className="text-gray-500">({label})</span>
      </div>

      {/* Add small “last refreshed” badge */}
      {lastRefresh && (
        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">
          Token refreshed at {lastRefresh}
        </span>
      )}
    </div>
  );
}
