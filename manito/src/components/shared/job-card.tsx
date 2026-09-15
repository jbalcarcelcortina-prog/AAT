import Link from "next/link";
import { ChevronRight, MapPin, Users } from "lucide-react";

import { CategoryTile } from "@/components/shared/category-icon";
import { JobStatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { areaLabel, categoryLabel } from "@/lib/constants";
import { formatRelativeDay } from "@/lib/format";
import type { JobWithRelations } from "@/lib/jobs";
import { t } from "@/lib/strings";

/** A job as it appears on the consumer dashboard. */
export function JobCard({ job }: { job: JobWithRelations }) {
  const pendingCount = job.requests.filter((r) => r.status === "PENDING").length;

  return (
    <Link
      href={`/consumer/jobs/${job.id}`}
      className="group block rounded-2xl border bg-card p-5 shadow-xs outline-none transition-all hover:border-brand/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-start gap-4">
        <CategoryTile category={job.category} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <JobStatusBadge status={job.status} />
            <UrgencyBadge urgency={job.urgency} />
          </div>

          <h3 className="font-heading text-base font-bold leading-snug">
            {job.title}
          </h3>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{categoryLabel(job.category)}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden />
              {areaLabel(job.area)}
            </span>
            <span>{t.common.postedOn(formatRelativeDay(job.createdAt))}</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-warm-strong">
                <Users className="size-3" aria-hidden />
                {pendingCount} awaiting reply
              </span>
            )}
            {job.acceptedProvider && (
              <span className="font-medium text-brand">
                {job.acceptedProvider.user.name}
              </span>
            )}
          </div>
        </div>

        <ChevronRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}
