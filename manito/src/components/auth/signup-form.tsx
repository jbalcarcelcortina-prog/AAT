"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { HardHat, Loader2, Search } from "lucide-react";

import { FieldError, FormError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/lib/constants";
import { postJson } from "@/lib/client-api";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

export function SignupForm({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    setFields({});

    const created = await postJson("/api/auth/signup", {
      name,
      email,
      phone,
      password,
      role,
    });

    if (!created.ok) {
      setError(created.error);
      setFields(created.fields ?? {});
      setPending(false);
      return;
    }

    // Sign straight in with the credentials we just created.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (!result || result.error) {
      setError(t.common.error);
      setPending(false);
      return;
    }

    // New pros land on the profile form — an empty profile matches nobody.
    router.replace(role === "PROVIDER" ? "/provider/profile" : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormError message={error} />

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          {t.auth.roleQuestion}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <RoleOption
            selected={role === "CONSUMER"}
            onSelect={() => setRole("CONSUMER")}
            icon={<Search className="size-4" aria-hidden />}
            label={t.auth.roleConsumer}
            hint={t.auth.roleConsumerHint}
          />
          <RoleOption
            selected={role === "PROVIDER"}
            onSelect={() => setRole("PROVIDER")}
            icon={<HardHat className="size-4" aria-hidden />}
            label={t.auth.roleProvider}
            hint={t.auth.roleProviderHint}
          />
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="name">{t.auth.name}</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(fields.name)}
        />
        <FieldError message={fields.name} />
      </div>

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
          aria-invalid={Boolean(fields.email)}
          placeholder="you@example.com"
        />
        <FieldError message={fields.email} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">{t.auth.phone}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="55 1234 5678"
        />
        <FieldError message={fields.phone} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(fields.password)}
        />
        <FieldError message={fields.password} />
        <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>
      </div>

      <Button type="submit" className="cta-lg w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {pending ? t.common.loading : t.auth.submitSignup}
      </Button>
    </form>
  );
}

function RoleOption({
  selected,
  onSelect,
  icon,
  label,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border p-3.5 text-left outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-brand bg-brand-soft shadow-xs"
          : "bg-card hover:border-brand/40",
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg",
          selected ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}
