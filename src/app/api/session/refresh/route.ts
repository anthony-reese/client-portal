// src/app/api/session/refresh/route.ts
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return new Response("Missing ID token", { status: 400 });
    }

    const decoded = await auth.verifyIdToken(idToken);

    // Refresh cookie with new token
    (await cookies()).set("__session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });

    return Response.json({
      message: "Session refreshed successfully.",
      uid: decoded.uid,
    });
  } catch (error: any) {
    console.error("❌ Error refreshing session:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
