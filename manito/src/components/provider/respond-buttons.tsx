"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/client-api";
import { t } from "@/lib/strings";

export function RespondButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busyWith, setBusyWith] = useState<"ACCEPT" | "DECLINE" | null>(null);
  const [isPending, startTransition] = useTransition();

  async function respond(decision: "ACCEPT" | "DECLINE") {
    setBusyWith(decision);
    const result = await postJson(`/api/requests/${requestId}/respond`, {
      decision,
    });
    setBusyWith(null);

    if (!result.ok) {
      toast.error(result.error ?? t.common.error);
      // Someone else may have taken the job — pull fresh state either way.
      startTransition(() => router.refresh());
      return;
    }
    toast.success(
      decision === "ACCEPT" ? t.provider.acceptedTag : t.provider.declinedTag,
    );
    startTransition(() => router.refresh());
  }

  const busy = busyWith !== null || isPending;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => respond("ACCEPT")}
        disabled={busy}
        className="flex-1 sm:flex-none"
      >
        {busyWith === "ACCEPT" ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <Check aria-hidden />
        )}
        {t.provider.accept}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => respond("DECLINE")}
        disabled={busy}
        className="flex-1 sm:flex-none"
      >
        {busyWith === "DECLINE" ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <X aria-hidden />
        )}
        {t.provider.decline}
      </Button>
    </div>
  );
}
