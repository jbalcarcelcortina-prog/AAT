import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

/**
 * MOCK AUTH.
 *
 * Email + password checked against a bcrypt hash in SQLite, with a JWT session
 * cookie. That is enough to demo two real roles and to keep every route
 * honestly gated, but a production build would add at minimum: email
 * verification, password reset, rate limiting on the login route, and probably
 * OAuth so nobody has to invent another password.
 *
 * Sessions are JWT rather than database-backed on purpose — it keeps the app
 * deployable to Vercel's serverless runtime with no session table to migrate.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Never let the hash leave this function.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // `user` is only present on the request that signs in.
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});

/** Cost factor for new password hashes. 10 keeps local seeding fast. */
export const BCRYPT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}
