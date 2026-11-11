"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { FieldError, FormError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SERVICE_AREAS,
  SERVICE_CATEGORIES,
  URGENCY_LEVELS,
} from "@/lib/constants";
import { postJson } from "@/lib/client-api";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

interface CreatedJob {
  id: string;
}

interface TradeSuggestion {
  category: string | null;
  oficio: string | null;
  keywords: string[];
  confidence: "high" | "low" | "none";
}

/** Wait until the description is long enough to be a sentence, then pause. */
const SUGGEST_AFTER_CHARS = 10;
const SUGGEST_DELAY_MS = 400;

export function PostJobForm() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [suggestion, setSuggestion] = useState<TradeSuggestion | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState(false);
  // The select is the user's once they touch it. Until then a high-confidence
  // guess may fill it, and a later "none" clears only that guess.
  const categoryTouched = useRef(false);
  const categoryRef = useRef("");
  const autoSet = useRef<string | null>(null);
  const requestSeq = useRef(0);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateCategory(value: string) {
    categoryRef.current = value;
    setCategory(value);
  }

  function clearAutofill() {
    if (
      !categoryTouched.current &&
      autoSet.current &&
      categoryRef.current === autoSet.current
    ) {
      updateCategory("");
    }
    autoSet.current = null;
  }

  function onCategoryChange(value: string) {
    categoryTouched.current = true;
    autoSet.current = null;
    updateCategory(value);
  }

  function applySuggestion() {
    if (!suggestion?.category) return;
    categoryTouched.current = true;
    autoSet.current = null;
    updateCategory(suggestion.category);
  }

  function onDescriptionChange(value: string) {
    setDescription(value);
    setSuggesting(false);
    setSuggestError(false);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);

    const text = value.trim();
    if (text.length < SUGGEST_AFTER_CHARS) {
      requestSeq.current += 1;
      setSuggestion(null);
      clearAutofill();
      return;
    }

    const seq = ++requestSeq.current;
    suggestTimer.current = setTimeout(async () => {
      setSuggesting(true);
      const result = await postJson<TradeSuggestion>("/api/suggest-trade", {
        description: text,
      });
      if (seq !== requestSeq.current) return;

      setSuggesting(false);
      if (!result.ok || !result.data) {
        setSuggestion(null);
        setSuggestError(true);
        return;
      }

      setSuggestion(result.data);
      if (categoryTouched.current) return;

      if (result.data.confidence === "high" && result.data.category) {
        autoSet.current = result.data.category;
        updateCategory(result.data.category);
        return;
      }

      clearAutofill();
    }, SUGGEST_DELAY_MS);
  }

  useEffect(() => {
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
      requestSeq.current += 1;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    setFields({});

    const result = await postJson<CreatedJob>("/api/jobs", {
      category,
      title,
      description,
      area,
      urgency,
    });

    if (!result.ok || !result.data) {
      setError(result.error);
      setFields(result.fields ?? {});
      setPending(false);
      return;
    }

    // The job detail page is where the matches live.
    router.push(`/consumer/jobs/${result.data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FormError message={error} />

      <div className="space-y-1.5">
        <Label htmlFor="category">{t.consumer.fieldCategory}</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger id="category" className="w-full" aria-invalid={Boolean(fields.category)}>
            <SelectValue placeholder="Choose a trade" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CATEGORIES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <CategoryIcon category={option.value} />
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={fields.category} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">{t.consumer.fieldTitle}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.consumer.fieldTitlePlaceholder}
          aria-invalid={Boolean(fields.title)}
          required
        />
        <FieldError message={fields.title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t.consumer.fieldDescription}</Label>
        <Textarea
          id="description"
          rows={5}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t.consumer.fieldDescriptionPlaceholder}
          aria-invalid={Boolean(fields.description)}
          required
        />
        <FieldError message={fields.description} />
        <TradeSuggestionNote
          suggestion={suggestion}
          suggesting={suggesting}
          suggestError={suggestError}
          category={category}
          onApply={applySuggestion}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="area">{t.consumer.fieldArea}</Label>
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger id="area" className="w-full" aria-invalid={Boolean(fields.area)}>
            <SelectValue placeholder="Choose a neighborhood" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_AREAS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <span className="text-muted-foreground">· {option.city}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={fields.area} />
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          {t.consumer.fieldUrgency}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {URGENCY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setUrgency(level.value)}
              aria-pressed={urgency === level.value}
              className={cn(
                "rounded-xl border p-3.5 text-left outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
                urgency === level.value
                  ? "border-brand bg-brand-soft shadow-xs"
                  : "bg-card hover:border-brand/40",
              )}
            >
              <span className="block text-sm font-semibold">{level.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {level.hint}
              </span>
            </button>
          ))}
        </div>
        <FieldError message={fields.urgency} />
      </fieldset>

      <Button type="submit" className="cta-lg w-full sm:w-auto" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {pending ? t.consumer.submittingJob : t.consumer.submitJob}
      </Button>
    </form>
  );
}

function TradeSuggestionNote({
  suggestion,
  suggesting,
  suggestError,
  category,
  onApply,
}: {
  suggestion: TradeSuggestion | null;
  suggesting: boolean;
  suggestError: boolean;
  category: string;
  onApply: () => void;
}) {
  if (suggesting && !suggestion) {
    return (
      <p className="text-xs text-muted-foreground" role="status">
        {t.consumer.suggestTradeLoading}
      </p>
    );
  }

  if (suggestError) {
    return (
      <p className="text-xs text-muted-foreground" role="status">
        {t.consumer.suggestTradeError}
      </p>
    );
  }

  if (!suggestion || suggestion.confidence === "none" || !suggestion.oficio) {
    return null;
  }

  const message =
    suggestion.confidence === "high"
      ? t.consumer.suggestTradeHigh(suggestion.oficio)
      : t.consumer.suggestTradeLow(suggestion.oficio);

  return (
    <div
      className="mt-2 rounded-xl border border-brand/40 bg-brand-soft px-3.5 py-3"
      role="status"
    >
      <p className="text-sm font-medium">{message}</p>
      {suggestion.keywords.length > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          {t.consumer.suggestTradeKeywords}: {suggestion.keywords.join(", ")}.
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {t.consumer.suggestTradeHint}
      </p>
      {suggestion.category && suggestion.category !== category && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2.5 bg-card"
          onClick={onApply}
        >
          {t.consumer.suggestTradeApply(suggestion.oficio)}
        </Button>
      )}
    </div>
  );
}
