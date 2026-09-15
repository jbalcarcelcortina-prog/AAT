import { Logo } from "@/components/brand/logo";
import { t } from "@/lib/strings";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo href={null} />
        <p className="text-xs text-muted-foreground">{t.landing.footerNote}</p>
      </div>
    </footer>
  );
}
