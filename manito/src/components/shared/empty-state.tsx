import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
          {icon}
        </span>
      )}
      <h3 className="font-heading text-base font-bold">{title}</h3>
      {body && (
        <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      )}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
