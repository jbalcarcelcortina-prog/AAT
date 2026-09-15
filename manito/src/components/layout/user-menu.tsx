"use client";

import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { t } from "@/lib/strings";
import type { Role } from "@/lib/constants";

export function UserMenu({
  name,
  email,
  role,
  dashboardHref,
}: {
  name: string;
  email: string;
  role: Role;
  dashboardHref: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.nav.account}
        className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {initials(name) || <UserRound className="size-4" aria-hidden />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-semibold">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref}>
            <LayoutDashboard aria-hidden />
            {t.nav.dashboard}
          </Link>
        </DropdownMenuItem>
        {role === "PROVIDER" && (
          <DropdownMenuItem asChild>
            <Link href="/provider/profile">
              <UserRound aria-hidden />
              {t.nav.myProfile}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
          <LogOut aria-hidden />
          {t.nav.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
