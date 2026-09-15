import Link from "next/link";
import { ArrowRight, Check, HardHat, Search } from "lucide-react";

import { HeroPreview } from "@/components/landing/hero-preview";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { t } from "@/lib/strings";

/**
 * The landing page is intentionally static: no session, no database. It builds
 * and deploys even before the database is provisioned.
 */
export default function LandingPage() {
  return (
    <>
      <SiteHeader marketingNav />

      <main className="flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-brand-wash border-b">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-strong">
                {t.landing.eyebrow}
              </p>

              <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
                {t.landing.headline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.landing.subhead}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <EntryCta
                  href="/signup?role=CONSUMER"
                  label={t.landing.consumerCta}
                  hint={t.landing.consumerCtaHint}
                  icon={<Search className="size-4" aria-hidden />}
                  primary
                />
                <EntryCta
                  href="/signup?role=PROVIDER"
                  label={t.landing.providerCta}
                  hint={t.landing.providerCtaHint}
                  icon={<HardHat className="size-4" aria-hidden />}
                />
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                {t.landing.trustLine}
              </p>
            </div>

            <div className="hidden lg:block">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* How it works                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section id="how-it-works" className="scroll-mt-20 border-b">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              title={t.landing.stepsTitle}
              subtitle={t.landing.stepsSubtitle}
            />

            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {t.landing.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border bg-card p-6 shadow-xs"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-bold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Trades                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section id="trades" className="scroll-mt-20 border-b bg-card/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              title={t.landing.tradesTitle}
              subtitle={t.landing.tradesSubtitle}
            />

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_CATEGORIES.map((category) => (
                <li
                  key={category.value}
                  className="flex items-start gap-3.5 rounded-2xl border bg-card p-5 shadow-xs"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warm-soft text-warm-strong">
                    <CategoryIcon category={category.value} className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold">
                      {category.label}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.blurb}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* For pros                                                         */}
        {/* ---------------------------------------------------------------- */}
        <section id="for-pros" className="scroll-mt-20">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid items-center gap-10 rounded-3xl border bg-brand-wash p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
                  {t.landing.proTitle}
                </h2>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {t.landing.proSubtitle}
                </p>
                <Button asChild className="cta-lg mt-7">
                  <Link href="/signup?role=PROVIDER">
                    {t.landing.proCta}
                    <ArrowRight data-icon="inline-end" aria-hidden />
                  </Link>
                </Button>
              </div>

              <ul className="space-y-3">
                {t.landing.proBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm shadow-xs"
                  >
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

/** The two big front-door buttons. Deliberately bigger than a normal Button. */
function EntryCta({
  href,
  label,
  hint,
  icon,
  primary = false,
}: {
  href: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "group flex min-w-60 items-center gap-3 rounded-2xl bg-brand px-5 py-4 text-primary-foreground shadow-sm shadow-brand/25 outline-none transition-all hover:bg-brand-strong focus-visible:ring-3 focus-visible:ring-ring/50"
          : "group flex min-w-60 items-center gap-3 rounded-2xl border bg-card px-5 py-4 shadow-xs outline-none transition-all hover:border-brand/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
      }
    >
      <span
        className={
          primary
            ? "grid size-9 shrink-0 place-items-center rounded-xl bg-white/15"
            : "grid size-9 shrink-0 place-items-center rounded-xl bg-warm-soft text-warm-strong"
        }
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-heading text-base font-bold">{label}</span>
        <span
          className={
            primary
              ? "block text-xs text-primary-foreground/80"
              : "block text-xs text-muted-foreground"
          }
        >
          {hint}
        </span>
      </span>
      <ArrowRight
        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
