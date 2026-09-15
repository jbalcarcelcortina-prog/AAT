"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { FormError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/strings";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    // `redirect: false` keeps the failure case on this page so we can show the
    // error inline instead of bouncing through Auth.js's own error screen.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError(t.auth.invalidCredentials);
      setPending(false);
      return;
    }

    // `/dashboard` figures out which side of the marketplace this account is on.
    router.replace(next || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormError message={error} />

      <div className="space-y-1.5">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" className="cta-lg w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {pending ? t.common.loading : t.auth.submitLogin}
      </Button>
    </form>
  );
}
