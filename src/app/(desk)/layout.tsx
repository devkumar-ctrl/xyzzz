import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function DeskLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();
  return <AppShell session={session}>{children}</AppShell>;
}
