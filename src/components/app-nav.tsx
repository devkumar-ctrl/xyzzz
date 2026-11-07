"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Eye,
  LayoutDashboard,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/ui";
import type { Role } from "@/lib/types";

const linksByRole = {
  coach: [
    {
      href: "/coach",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    { href: "/coach/players", label: "Players", icon: Users, exact: false },
    {
      href: "/coach/sessions",
      label: "Sessions",
      icon: CalendarDays,
      exact: false,
    },
    { href: "/coach/matches", label: "Matches", icon: Trophy, exact: false },
  ],
  player: [
    { href: "/player", label: "My record", icon: UserRound, exact: true },
  ],
  scout: [{ href: "/scout", label: "Ready players", icon: Eye, exact: true }],
} as const;

export function AppNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="order-3 grid w-full grid-cols-4 gap-1 pb-1 sm:order-none sm:ml-4 sm:flex sm:w-auto sm:items-center sm:pb-0">
      {linksByRole[role].map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center justify-center gap-1 rounded-full px-1.5 py-2 text-[11px] font-medium transition sm:shrink-0 sm:gap-2 sm:px-3.5 sm:text-sm",
              active
                ? "bg-pitch text-white shadow-sm"
                : "text-muted hover:bg-white hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
