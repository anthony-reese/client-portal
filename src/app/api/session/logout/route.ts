// src/app/api/session/logout/route.ts
export const runtime = "nodejs";

import { cookies } from "next/headers";

export async function POST() {
  try {
    // Remove the secure session cookie
    (await cookies()).set("__session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return Response.json({ message: "Logged out successfully." });
  } catch (error: any) {
    console.error("❌ Error clearing session cookie:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
