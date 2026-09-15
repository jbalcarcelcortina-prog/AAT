import Link from "next/link";
import { Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { t } from "@/lib/strings";

/**
 * The Manito mark: a brand-teal tile with a tool glyph, next to the wordmark.
 * Kept in one component so the header, the auth pages and the footer can never
 * drift apart.
 */
export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string | null;
  showWordmark?: boolean;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground shadow-sm shadow-brand/25">
        <Wrench className="size-4.5" strokeWidth={2.4} aria-hidden />
      </span>
      {showWordmark && (
        <span className="font-heading text-xl font-extrabold tracking-tight">
          {t.brand.name}
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {content}
    </Link>
  );
}
