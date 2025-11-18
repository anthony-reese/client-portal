// src/middleware.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const url = req.nextUrl.clone();

  if (!session) {
    if (url.pathname.startsWith("/dashboard")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    if (decoded.admin) {
      return NextResponse.next(); // Admin access
    }
    url.pathname = "/";
    return NextResponse.redirect(url);
  } catch {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
