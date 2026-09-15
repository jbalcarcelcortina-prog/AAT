import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/session";

/**
 * Every /consumer/* page is behind this guard. Anonymous visitors go to login;
 * a signed-in provider is redirected to their own dashboard.
 */
export default async function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("CONSUMER", "/consumer/dashboard");
  return <AppShell>{children}</AppShell>;
}
