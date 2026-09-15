"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/client-api";
import { t } from "@/lib/strings";

export type RequestState = "none" | "PENDING" | "ACCEPTED" | "DECLINED";

export function RequestProviderButton({
  jobId,
  providerId,
  state,
  /** True once some other pro has taken the job. */
  jobClosed,
}: {
  jobId: string;
  providerId: string;
  state: RequestState;
  jobClosed: boolean;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (state === "ACCEPTED") {
    return (
      <Button variant="secondary" className="w-full" disabled>
        <Check aria-hidden />
        {t.consumer.requestAccepted}
      </Button>
    );
  }
  if (state === "PENDING") {
    return (
      <Button variant="secondary" className="w-full" disabled>
        <Check aria-hidden />
        {t.consumer.requestSent}
      </Button>
    );
  }
  if (state === "DECLINED") {
    return (
      <Button variant="outline" className="w-full" disabled>
        {t.consumer.requestDeclined}
      </Button>
    );
  }

  const busy = sending || isPending;

  async function onClick() {
    setSending(true);
    const result = await postJson(`/api/jobs/${jobId}/requests`, { providerId });
    setSending(false);

    if (!result.ok) {
      toast.error(result.error ?? t.common.error);
      return;
    }
    toast.success(t.consumer.requestSent);
    // Re-render the server component so the card flips to "Requested".
    startTransition(() => router.refresh());
  }

  return (
    <Button
      className="w-full"
      onClick={onClick}
      disabled={busy || jobClosed}
      title={jobClosed ? "This job already has a pro" : undefined}
    >
      {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
      {busy ? t.consumer.requestSending : t.consumer.requestCta}
    </Button>
  );
}
