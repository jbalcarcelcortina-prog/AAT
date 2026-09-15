import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { Role } from "@/lib/constants";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** The signed-in user, or null. Safe to call from any Server Component. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: session.user.role,
  };
}

/** Where a role belongs after logging in. */
export function homePathForRole(role: Role): string {
  return role === "PROVIDER" ? "/provider/dashboard" : "/consumer/dashboard";
}

/** For pages: bounce anonymous visitors to the login screen. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login",
    );
  }
  return user;
}

/**
 * For pages: require a specific role. A logged-in user with the wrong role is
 * sent to their own dashboard rather than shown an error — they are not doing
 * anything wrong, they are just in the wrong half of the product.
 */
export async function requireRole(
  role: Role,
  returnTo?: string,
): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (user.role !== role) redirect(homePathForRole(user.role));
  return user;
}
