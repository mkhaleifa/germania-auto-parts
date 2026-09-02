import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/generated/prisma/client";

// Edge-compatible auth config — no Prisma, no Node.js-only modules
// Used by middleware. Full config (with Prisma adapter) is in auth.ts
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || "CUSTOMER";
      }
      return session;
    },
  },
};