import type { ReactNode } from "react";
import { ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";
import { AppNav } from "./app-nav";
import { Avatar } from "./ui";
import { Brand } from "./brand";
import { LogoutButton } from "./logout-button";

export function AppShell({
  session,
  children,
}: {
  session: SessionUser;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          <Brand />
          <AppNav role={session.role} />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">
                {session.name}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                {ROLE_LABELS[session.role]}
              </p>
            </div>
            <Avatar name={session.name} />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-xs text-muted sm:px-6 lg:px-8">
        Dumka Sports Academy · Attendance, matches & trial readiness
      </footer>
    </div>
  );
}
