import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { getCurrentUser, homePathForRole } from "@/lib/session";
import { t } from "@/lib/strings";

/**
 * One header for the whole app. What it shows on the right depends on who is
 * looking: marketing CTAs for anonymous visitors, an account menu otherwise.
 */
export async function SiteHeader({
  marketingNav = false,
}: {
  marketingNav?: boolean;
}) {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href={user ? homePathForRole(user.role) : "/"} />

        {marketingNav && !user && (
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              {t.nav.howItWorks}
            </a>
            <a href="#trades" className="transition-colors hover:text-foreground">
              {t.nav.trades}
            </a>
            <a href="#for-pros" className="transition-colors hover:text-foreground">
              {t.nav.forPros}
            </a>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu
              name={user.name}
              email={user.email}
              role={user.role}
              dashboardHref={homePathForRole(user.role)}
            />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">{t.nav.signup}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
