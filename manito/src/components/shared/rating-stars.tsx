import { Star } from "lucide-react";

import { formatRating } from "@/lib/format";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

/**
 * MOCK: ratings are seeded, not earned. See the README "what's mocked".
 */
export function RatingStars({
  rating,
  reviewCount,
  className,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm", className)}
      aria-label={`Rated ${formatRating(rating)} out of 5`}
    >
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i <= rounded
                ? "fill-warm text-warm"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="font-semibold tabular-nums">{formatRating(rating)}</span>
      {typeof reviewCount === "number" && (
        <span className="text-muted-foreground">
          ({t.common.reviews(reviewCount)})
        </span>
      )}
    </span>
  );
}
