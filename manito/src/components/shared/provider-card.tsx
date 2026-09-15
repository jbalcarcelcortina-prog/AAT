import { BadgeCheck, MapPin } from "lucide-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { areaLabel, categoryLabel } from "@/lib/constants";
import { formatMoney, initials } from "@/lib/format";
import type { ProviderMatch } from "@/lib/matching";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

/**
 * One pro on the match list. The `action` slot takes whatever button the page
 * needs (request / already requested / disabled), which keeps this card a
 * plain presentational Server Component.
 */
export function ProviderCard({
  match,
  action,
  className,
}: {
  match: ProviderMatch;
  action?: React.ReactNode;
  className?: string;
}) {
  const { provider, reasons, tier } = match;

  return (
    <article
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md",
        tier === "nearby" && "border-dashed",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft font-heading text-base font-bold text-brand-strong"
        >
          {initials(provider.name)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-heading text-base font-bold">{provider.name}</h3>
            {provider.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                <BadgeCheck className="size-3.5" aria-hidden />
                {t.common.verified}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {/* A pro with no reviews is new, not badly rated — say so. */}
            {provider.reviewCount > 0 ? (
              <RatingStars
                rating={provider.rating}
                reviewCount={provider.reviewCount}
              />
            ) : (
              <span className="text-sm font-semibold text-brand">
                {t.common.newOnManito}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {t.common.yearsExperience(provider.yearsExperience)}
            </span>
          </div>
        </div>

        {provider.hourlyRateMxn != null && (
          <div className="shrink-0 text-right">
            <div className="font-heading text-base font-bold">
              {formatMoney(provider.hourlyRateMxn)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.common.perHour}
            </div>
          </div>
        )}
      </div>

      {provider.bio && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {provider.bio}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {provider.categories.map((category) => (
          <Badge key={category} variant="secondary" className="gap-1.5">
            <CategoryIcon category={category} className="size-3" />
            {categoryLabel(category)}
          </Badge>
        ))}
      </div>

      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{provider.areas.map(areaLabel).join(" · ")}</span>
      </div>

      {reasons.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {reasons.map((reason) => (
            <li
              key={reason}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {reason}
            </li>
          ))}
        </ul>
      )}

      {action && <div className="mt-auto pt-1">{action}</div>}
    </article>
  );
}
