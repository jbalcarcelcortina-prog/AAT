import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLES, type Role } from "@/lib/constants";
import { getCurrentUser, homePathForRole } from "@/lib/session";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.auth.submitSignup };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  // The landing page's two front doors arrive here as ?role=CONSUMER|PROVIDER.
  const { role } = await searchParams;
  const initialRole: Role = (ROLES as readonly string[]).includes(role ?? "")
    ? (role as Role)
    : "CONSUMER";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">
          {t.auth.signupTitle}
        </CardTitle>
        <CardDescription>{t.auth.signupSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SignupForm initialRole={initialRole} />
        <p className="text-center text-sm text-muted-foreground">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            {t.auth.goLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
