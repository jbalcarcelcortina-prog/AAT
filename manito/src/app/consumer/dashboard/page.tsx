import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { JobCard } from "@/components/shared/job-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { listJobsForConsumer } from "@/lib/jobs";
import { requireRole } from "@/lib/session";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.consumer.dashboardTitle };

export default async function ConsumerDashboard() {
  const user = await requireRole("CONSUMER");
  const jobs = await listJobsForConsumer(user.id);

  return (
    <>
      <PageHeader
        title={t.consumer.dashboardTitle}
        subtitle={t.consumer.dashboardSubtitle}
        action={
          <Button asChild className="cta-lg">
            <Link href="/consumer/jobs/new">
              <Plus data-icon="inline-start" aria-hidden />
              {t.consumer.newJobCta}
            </Link>
          </Button>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden />}
          title={t.consumer.emptyTitle}
          body={t.consumer.emptyBody}
          action={
            <Button asChild>
              <Link href="/consumer/jobs/new">{t.consumer.newJobCta}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
