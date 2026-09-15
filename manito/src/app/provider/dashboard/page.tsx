import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, MapPin, TriangleAlert } from "lucide-react";

import { RequestCard } from "@/components/provider/request-card";
import { CategoryTile } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { JobStatusBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { areaLabel, categoryLabel } from "@/lib/constants";
import { formatRelativeDay } from "@/lib/format";
import {
  listAcceptedJobsForProvider,
  listRequestsForProvider,
} from "@/lib/jobs";
import { getProviderProfileByUserId } from "@/lib/providers";
import { requireRole } from "@/lib/session";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.provider.dashboardTitle };

export default async function ProviderDashboard() {
  const user = await requireRole("PROVIDER");
  const profile = await getProviderProfileByUserId(user.id);

  const [requests, activeJobs] = profile
    ? await Promise.all([
        listRequestsForProvider(profile.id),
        listAcceptedJobsForProvider(profile.id),
      ])
    : [[], []];

  // An empty trade or area list means this pro matches nothing at all.
  const profileIncomplete =
    !profile || profile.categories.length === 0 || profile.areas.length === 0;

  return (
    <>
      <PageHeader
        title={t.provider.dashboardTitle}
        subtitle={t.provider.dashboardSubtitle}
        action={
          <Button asChild variant="outline">
            <Link href="/provider/profile">{t.nav.myProfile}</Link>
          </Button>
        }
      />

      {profileIncomplete && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warm/40 bg-warm-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm font-medium text-warm-strong">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t.provider.profileIncomplete}
          </p>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/provider/profile">{t.provider.completeProfileCta}</Link>
          </Button>
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" aria-hidden />}
          title={t.provider.emptyTitle}
          body={t.provider.emptyBody}
        />
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} />
            </li>
          ))}
        </ul>
      )}

      {activeJobs.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-lg font-bold">
              {t.provider.activeTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.provider.activeSubtitle}
            </p>
          </div>

          <ul className="space-y-3">
            {activeJobs.map((job) => (
              <li
                key={job.id}
                className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-xs"
              >
                <CategoryTile category={job.category} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <JobStatusBadge status={job.status} />
                  <h3 className="font-heading text-base font-bold leading-snug">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{categoryLabel(job.category)}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" aria-hidden />
                      {areaLabel(job.area)}
                    </span>
                    <span>{job.consumer.name}</span>
                    {job.consumer.phone && <span>{job.consumer.phone}</span>}
                    <span>{formatRelativeDay(job.updatedAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
