import type { NextAuthConfig } from "next-auth";

// Config edge-compatible (senza Prisma) — usata solo dal middleware
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const publicPaths = ["/login", "/api/auth"];
      if (publicPaths.some((p) => pathname.startsWith(p))) return true;

      return isLoggedIn;
    },
  },
  providers: [], // i provider vengono aggiunti in auth.ts
};
