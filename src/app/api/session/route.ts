// src/app/api/session/route.ts
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // Verify ID token via Firebase Admin
    const decoded = await auth.verifyIdToken(idToken, true);

    // Create a secure session cookie (5 days)
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    (await cookies()).set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return NextResponse.json({ message: "Session cookie set" });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
