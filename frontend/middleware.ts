import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/api/auth", "/setup-mfa", "/verify-mfa", "/api/mfa"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const mfaVerified = req.cookies.get("mfa_verified")?.value === "true";
  if (!mfaVerified) {
    return NextResponse.redirect(new URL("/verify-mfa", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
