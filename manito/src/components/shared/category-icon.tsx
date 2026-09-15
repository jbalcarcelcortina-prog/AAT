import {
  Droplets,
  Hammer,
  WashingMachine,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { categoryIconName } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Icon name (from constants.ts) -> the actual component. */
const ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  zap: Zap,
  wind: Wind,
  hammer: Hammer,
  "washing-machine": WashingMachine,
  wrench: Wrench,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const Icon = ICONS[categoryIconName(category)] ?? Wrench;
  return <Icon className={cn("size-4", className)} aria-hidden />;
}

/** The icon inside a soft tinted tile — used on cards and the trades grid. */
export function CategoryTile({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong",
        className,
      )}
    >
      <CategoryIcon category={category} className="size-5" />
    </span>
  );
}
