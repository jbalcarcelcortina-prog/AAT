import { jobStatusLabel, urgencyLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Status and urgency pills. The colour mapping lives here only, so a new status
 * is one entry rather than a hunt through the dashboards.
 */

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-secondary text-secondary-foreground",
  REQUESTED: "bg-warm-soft text-warm-strong",
  ACCEPTED: "bg-brand-soft text-brand-strong",
  COMPLETED: "bg-success-soft text-success",
};

const URGENCY_STYLES: Record<string, string> = {
  LOW: "bg-secondary text-muted-foreground",
  MEDIUM: "bg-warm-soft text-warm-strong",
  HIGH: "bg-danger-soft text-destructive",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function JobStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span className={cn(base, STATUS_STYLES[status] ?? STATUS_STYLES.OPEN, className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {jobStatusLabel(status)}
    </span>
  );
}

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency: string;
  className?: string;
}) {
  return (
    <span className={cn(base, URGENCY_STYLES[urgency] ?? URGENCY_STYLES.LOW, className)}>
      {urgencyLabel(urgency)} urgency
    </span>
  );
}
