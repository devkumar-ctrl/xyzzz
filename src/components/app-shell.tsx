import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";
import { AppNav } from "./app-nav";
import { Avatar } from "./ui";
import { Brand } from "./brand";

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
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-2 text-xs font-semibold text-muted transition hover:border-pitch/30 hover:text-ink"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </form>
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
