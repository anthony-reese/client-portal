// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Firebase passwordless sign-in uses these query params.
  const isMagicLink = 
    url.searchParams.get("mode") === "signIn" || url.searchParams.has("oobCode");

  // Do NOT rewrite or redirect when magic link parameters exist.
  if (url.pathname === "/login" && isMagicLink) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
