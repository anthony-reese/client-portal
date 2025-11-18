// src/lib/sessionCookies.ts

import { cookies } from "next/headers";

export async function setSessionCookie(token: string, maxAge = 60 * 60) {
  const cookieStore = await cookies();
  cookieStore.set("__session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("__session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
