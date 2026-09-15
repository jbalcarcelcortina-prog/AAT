import { redirect } from "next/navigation";

import { homePathForRole, requireUser } from "@/lib/session";

/**
 * Role-agnostic landing spot after login. The forms redirect here instead of
 * guessing which dashboard the account belongs to.
 */
export default async function DashboardRedirect() {
  const user = await requireUser();
  redirect(homePathForRole(user.role));
}
