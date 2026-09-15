import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, SearchX } from "lucide-react";

import { CompleteJobButton } from "@/components/consumer/complete-job-button";
import {
  RequestProviderButton,
  type RequestState,
} from "@/components/consumer/request-provider-button";
import { CategoryTile } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { ProviderCard } from "@/components/shared/provider-card";
import {
  JobStatusBadge,
  UrgencyBadge,
} from "@/components/shared/status-badges";
import { Card, CardContent } from "@/components/ui/card";
import { areaLabel, categoryLabel } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getJobForConsumer, JobError } from "@/lib/jobs";
import { getMatchesForJob } from "@/lib/providers";
import { requireRole } from "@/lib/session";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: "Job" };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("CONSUMER");
  const { id } = await params;

  let job;
  try {
    job = await getJobForConsumer(id, user.id);
  } catch (error) {
    // A missing job and someone else's job look the same from out here, which
    // is the point — we don't confirm that an id exists.
    if (error instanceof JobError) notFound();
    throw error;
  }

  const matches = await getMatchesForJob(job);

  /** What has already happened between this consumer and each pro. */
  const requestStateByProvider = new Map<string, RequestState>(
    job.requests.map((request) => [
      request.providerId,
      request.status as RequestState,
    ]),
  );
  const jobClosed = job.status === "ACCEPTED" || job.status === "COMPLETED";

  return (
    <>
      <Link
        href="/consumer/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t.consumer.jobDetailBack}
      </Link>

      {/* ------------------------------------------------------------------ */}
      {/* The job itself                                                     */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <JobStatusBadge status={job.status} />
            <UrgencyBadge urgency={job.urgency} />
          </div>

          <div className="flex items-start gap-4">
            <CategoryTile category={job.category} className="size-11" />
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-xl font-bold sm:text-2xl">
                {job.title}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{categoryLabel(job.category)}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {areaLabel(job.area)}
                </span>
                <span>{t.common.postedOn(formatDate(job.createdAt))}</span>
              </div>
            </div>
          </div>

          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Who took it                                                        */}
      {/* ------------------------------------------------------------------ */}
      {job.acceptedProvider && (
        <Card className="border-brand/40 bg-brand-soft/50">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-heading text-base font-bold">
                {job.status === "COMPLETED"
                  ? t.consumer.completedNote
                  : t.consumer.acceptedBy(job.acceptedProvider.user.name)}
              </p>
              {job.acceptedProvider.user.phone && (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" aria-hidden />
                  {job.acceptedProvider.user.phone}
                </p>
              )}
            </div>
            {job.status === "ACCEPTED" && <CompleteJobButton jobId={job.id} />}
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Matches                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-bold">
            {t.consumer.matchesTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t.consumer.matchesSubtitleFor(
              categoryLabel(job.category),
              areaLabel(job.area),
            )}
          </p>
        </div>

        {matches.direct.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" aria-hidden />}
            title={t.consumer.matchesNoneTitle}
            body={t.consumer.matchesNoneBody}
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {matches.direct.map((match) => (
              <li key={match.provider.id} className="flex">
                <ProviderCard
                  className="w-full"
                  match={match}
                  action={
                    <RequestProviderButton
                      jobId={job.id}
                      providerId={match.provider.id}
                      state={
                        requestStateByProvider.get(match.provider.id) ?? "none"
                      }
                      jobClosed={jobClosed}
                    />
                  }
                />
              </li>
            ))}
          </ul>
        )}

        {matches.nearby.length > 0 && (
          <div className="space-y-4 pt-4">
            <div>
              <h3 className="font-heading text-base font-bold">
                {t.consumer.nearbyTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.consumer.nearbySubtitle}
              </p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2">
              {matches.nearby.map((match) => (
                <li key={match.provider.id} className="flex">
                  <ProviderCard
                    className="w-full"
                    match={match}
                    action={
                      <RequestProviderButton
                        jobId={job.id}
                        providerId={match.provider.id}
                        state={
                          requestStateByProvider.get(match.provider.id) ?? "none"
                        }
                        jobClosed={jobClosed}
                      />
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
