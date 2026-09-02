import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Protect admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isLoggedIn || userRole !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect account routes
  if (pathname.startsWith("/account") || pathname.startsWith("/api/account")) {
    if (!isLoggedIn) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required",
            },
          },
          { status: 401 }
        );
      }

      const callbackUrl = encodeURIComponent(pathname);

      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/api/admin/:path*",
    "/api/account/:path*",
  ],
};