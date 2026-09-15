import { BadgeCheck, Star } from "lucide-react";

import { CategoryTile } from "@/components/shared/category-icon";

/**
 * Decorative. A frozen snapshot of the match list so the hero shows the
 * product instead of describing it. Hidden from assistive tech and from
 * narrow screens — it repeats information the copy already gives.
 */
export function HeroPreview() {
  return (
    <div aria-hidden className="pointer-events-none select-none">
      <div className="rounded-2xl border bg-card p-5 shadow-lg shadow-foreground/5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-soft px-2.5 py-0.5 text-xs font-semibold text-warm-strong">
            High urgency
          </span>
          <span className="text-xs text-muted-foreground">Roma · just now</span>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <CategoryTile category="PLUMBING" />
          <div>
            <p className="font-heading text-sm font-bold leading-snug">
              Kitchen sink backs up when the dishwasher runs
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Plumbing · Roma
            </p>
          </div>
        </div>
      </div>

      <div className="relative my-4 flex justify-center">
        <span className="rounded-full border bg-card px-3 py-1 text-xs font-semibold text-brand-strong shadow-xs">
          Ranked by rating
        </span>
        <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
      </div>

      <ul className="space-y-2.5">
        {PREVIEW_PROS.map((pro) => (
          <li
            key={pro.name}
            className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-xs"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft font-heading text-xs font-bold text-brand-strong">
              {pro.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                {pro.name}
                {pro.verified && (
                  <BadgeCheck className="size-3.5 text-brand" />
                )}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-warm text-warm" />
                <span className="font-semibold text-foreground">
                  {pro.rating}
                </span>
                {pro.meta}
              </p>
            </div>
            <span className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              Request
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PREVIEW_PROS = [
  {
    name: "Rafael Guzmán",
    initials: "RG",
    rating: "4.9",
    meta: "· 41 reviews · 14 yrs",
    verified: true,
  },
  {
    name: "Lucía Ramírez",
    initials: "LR",
    rating: "4.6",
    meta: "· 23 reviews · 8 yrs",
    verified: true,
  },
] as const;
