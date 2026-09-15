import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants";

/**
 * Auth.js ships a minimal `user` shape. Manito needs the database id and the
 * role on every session so pages can gate on them without another query.
 *
 * The interfaces actually live in `@auth/core`; `next-auth` only re-exports
 * them, so the JWT augmentation has to target `@auth/core/jwt` to take effect.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
