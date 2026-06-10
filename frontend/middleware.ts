import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Lascia passare i path pubblici
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Non autenticato → login
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const mfaVerified = req.cookies.get("mfa_verified")?.value === "true";
  const userId = req.auth.user?.id;

  // Lascia passare le pagine MFA
  if (pathname.startsWith("/setup-mfa") || pathname.startsWith("/verify-mfa")) {
    return NextResponse.next();
  }

  // Lascia passare le API MFA
  if (pathname.startsWith("/api/mfa")) {
    return NextResponse.next();
  }

  // MFA non verificato → redirect
  if (!mfaVerified) {
    return NextResponse.redirect(new URL("/verify-mfa", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
