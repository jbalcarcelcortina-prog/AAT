"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side context. Only Auth.js for now — it is what lets `signIn` and
 * `signOut` work from Client Components. Server Components read the session
 * directly with `auth()` and do not need this.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
