"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/client-api";
import { t } from "@/lib/strings";

export function CompleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const busy = saving || isPending;

  async function onClick() {
    setSaving(true);
    const result = await postJson(`/api/jobs/${jobId}/complete`, {});
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error ?? t.common.error);
      return;
    }
    toast.success(t.consumer.completedNote);
    startTransition(() => router.refresh());
  }

  return (
    <Button variant="outline" onClick={onClick} disabled={busy}>
      {busy ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <CircleCheck aria-hidden />
      )}
      {busy ? t.consumer.markingComplete : t.consumer.markComplete}
    </Button>
  );
}
