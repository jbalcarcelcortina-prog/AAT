"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CategoryIcon } from "@/components/shared/category-icon";
import { FieldError, FormError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_AREAS, SERVICE_CATEGORIES } from "@/lib/constants";
import { putJson } from "@/lib/client-api";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

export interface ProfileFormValues {
  categories: string[];
  areas: string[];
  bio: string;
  yearsExperience: number;
  hourlyRateMxn: number | null;
}

export function ProviderProfileForm({
  initial,
}: {
  initial: ProfileFormValues;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [areas, setAreas] = useState<string[]>(initial.areas);
  const [bio, setBio] = useState(initial.bio);
  const [years, setYears] = useState(String(initial.yearsExperience));
  const [rate, setRate] = useState(
    initial.hourlyRateMxn != null ? String(initial.hourlyRateMxn) : "",
  );
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggle(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    setFields({});

    const result = await putJson("/api/provider/profile", {
      categories,
      areas,
      bio,
      yearsExperience: years === "" ? 0 : years,
      hourlyRateMxn: rate === "" ? null : rate,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      setFields(result.fields ?? {});
      return;
    }
    toast.success(t.provider.profileSaved);
    startTransition(() => router.refresh());
  }

  const busy = saving || isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-7" noValidate>
      <FormError message={error} />

      {/* Trades ----------------------------------------------------------- */}
      <fieldset>
        <legend className="text-sm font-medium">
          {t.provider.fieldCategories}
        </legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t.provider.fieldCategoriesHint}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SERVICE_CATEGORIES.map((option) => {
            const selected = categories.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategories((c) => toggle(c, option.value))}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 text-left outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected
                    ? "border-brand bg-brand-soft shadow-xs"
                    : "bg-card hover:border-brand/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg",
                    selected
                      ? "bg-brand text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <CategoryIcon category={option.value} className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {option.blurb}
                  </span>
                </span>
                {selected && (
                  <Check className="size-4 shrink-0 text-brand" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <FieldError message={fields.categories} />
        </div>
      </fieldset>

      {/* Areas ------------------------------------------------------------ */}
      <fieldset>
        <legend className="text-sm font-medium">{t.provider.fieldAreas}</legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t.provider.fieldAreasHint}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SERVICE_AREAS.map((option) => {
            const selected = areas.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setAreas((a) => toggle(a, option.value))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected
                    ? "border-brand bg-brand text-primary-foreground"
                    : "bg-card hover:border-brand/40",
                )}
              >
                {selected && <Check className="size-3.5" aria-hidden />}
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <FieldError message={fields.areas} />
        </div>
      </fieldset>

      {/* Bio -------------------------------------------------------------- */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">{t.provider.fieldBio}</Label>
        <Textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t.provider.fieldBioPlaceholder}
          aria-invalid={Boolean(fields.bio)}
        />
        <FieldError message={fields.bio} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="years">{t.provider.fieldYears}</Label>
          <Input
            id="years"
            type="number"
            min={0}
            max={60}
            inputMode="numeric"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            aria-invalid={Boolean(fields.yearsExperience)}
          />
          <FieldError message={fields.yearsExperience} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rate">{t.provider.fieldRate}</Label>
          <Input
            id="rate"
            type="number"
            min={0}
            inputMode="numeric"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="400"
            aria-invalid={Boolean(fields.hourlyRateMxn)}
          />
          <FieldError message={fields.hourlyRateMxn} />
        </div>
      </div>

      <Button type="submit" className="cta-lg w-full sm:w-auto" disabled={busy}>
        {busy && <Loader2 className="animate-spin" aria-hidden />}
        {busy ? t.provider.savingProfile : t.provider.saveProfile}
      </Button>
    </form>
  );
}
