import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-brand-wash flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to home
        </Link>
      </div>

      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
