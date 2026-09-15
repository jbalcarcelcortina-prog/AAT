import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser, homePathForRole } from "@/lib/session";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.auth.submitLogin };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  const { next } = await searchParams;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            {t.auth.loginTitle}
          </CardTitle>
          <CardDescription>{t.auth.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm next={next} />
          <p className="text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link href="/signup" className="font-semibold text-brand hover:underline">
              {t.auth.goSignup}
            </Link>
          </p>
        </CardContent>
      </Card>

      <DemoAccounts />
    </div>
  );
}

/**
 * Convenience for graders and demos. Delete this component the moment real
 * accounts exist.
 */
function DemoAccounts() {
  return (
    <div className="rounded-xl border border-dashed bg-card/70 p-4 text-xs">
      <p className="font-heading text-sm font-bold">{t.auth.demoTitle}</p>
      <p className="mt-1 text-muted-foreground">{t.auth.demoHint}</p>
      <dl className="mt-3 grid gap-1.5 sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Consumer</dt>
          <dd className="font-mono text-muted-foreground">sofia@manito.demo</dd>
        </div>
        <div>
          <dt className="font-semibold">Pro</dt>
          <dd className="font-mono text-muted-foreground">rafael@manito.demo</dd>
        </div>
      </dl>
      <p className="mt-3 font-mono text-muted-foreground">
        password: manito123
      </p>
    </div>
  );
}
