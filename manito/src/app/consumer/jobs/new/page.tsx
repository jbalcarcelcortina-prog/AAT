import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PostJobForm } from "@/components/consumer/post-job-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.consumer.formTitle };

export default function NewJobPage() {
  return (
    <>
      <Link
        href="/consumer/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t.consumer.jobDetailBack}
      </Link>

      <PageHeader
        title={t.consumer.formTitle}
        subtitle={t.consumer.formSubtitle}
      />

      <Card>
        <CardContent className="pt-6">
          <PostJobForm />
        </CardContent>
      </Card>
    </>
  );
}
