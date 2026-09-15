import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-brand-wash flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo href="/" />
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-extrabold">
          We couldn&apos;t find that page
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The link may be old, or the job may belong to someone else.
        </p>
      </div>
      <Button asChild className="cta-lg">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
