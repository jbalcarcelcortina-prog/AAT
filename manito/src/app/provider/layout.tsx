import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/session";

/** Guard for every /provider/* page. See the consumer layout for the pattern. */
export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("PROVIDER", "/provider/dashboard");
  return <AppShell>{children}</AppShell>;
}
