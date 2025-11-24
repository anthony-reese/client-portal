// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const PUBLIC_PATHS = ["/", "/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // ===== Auth-protected routes =====
  const protectedRoutes = ["/dashboard", "/portal"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const idToken = req.cookies.get("__session")?.value;

  if (!idToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/login", 
  ],
};