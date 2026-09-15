import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Header + centred content column + footer. Used by both dashboards. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
