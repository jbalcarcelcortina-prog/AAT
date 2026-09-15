import { MapPin, MessageSquareQuote } from "lucide-react";

import { RespondButtons } from "@/components/provider/respond-buttons";
import { CategoryTile } from "@/components/shared/category-icon";
import { UrgencyBadge } from "@/components/shared/status-badges";
import { areaLabel, categoryLabel } from "@/lib/constants";
import { formatRelativeDay } from "@/lib/format";
import type { RequestWithJob } from "@/lib/jobs";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

/** One incoming job request in the provider inbox. */
export function RequestCard({ request }: { request: RequestWithJob }) {
  const { job } = request;
  const answered = request.status !== "PENDING";

  // A pending request on a job somebody else already took is dead in the
  // water — say so rather than offering an Accept button that will 409.
  const takenByAnother =
    request.status === "PENDING" &&
    (job.status === "ACCEPTED" || job.status === "COMPLETED");

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-xs",
        answered && "opacity-75",
      )}
    >
      <div className="flex items-start gap-4">
        <CategoryTile category={job.category} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge urgency={job.urgency} />
            {request.status === "ACCEPTED" && (
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-strong">
                {t.provider.acceptedTag}
              </span>
            )}
            {request.status === "DECLINED" && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {t.provider.declinedTag}
              </span>
            )}
            {takenByAnother && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {t.provider.takenTag}
              </span>
            )}
          </div>

          <h3 className="font-heading text-base font-bold leading-snug">
            {job.title}
          </h3>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </p>

          {request.message && (
            <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <MessageSquareQuote className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {request.message}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{categoryLabel(job.category)}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden />
              {areaLabel(job.area)}
            </span>
            <span>{job.consumer.name}</span>
            <span>{formatRelativeDay(request.createdAt)}</span>
          </div>

          {!answered && !takenByAnother && (
            <div className="pt-2">
              <RespondButtons requestId={request.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
