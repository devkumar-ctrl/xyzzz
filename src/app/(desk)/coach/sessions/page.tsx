import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { formatISODate, todayISO } from "@/lib/date";
import type { SessionView } from "@/lib/types";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { OpenSessionForm } from "@/components/coach/open-session-form";

export const metadata: Metadata = {
  title: "Sessions",
};

export default async function SessionsPage() {
  await requireRole("coach");
  const { sessions } = await apiFetch<{ sessions: SessionView[] }>(
    "/api/coach/sessions",
  );

  return (
    <>
      <PageHeader
        eyebrow="Attendance"
        title="Sessions"
        description="Open a date and sport, mark present or absent, then close to lock the sheet."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="h-fit p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pitch-soft text-pitch">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-tight">
                Open a session
              </h2>
              <p className="text-xs text-muted">
                Attendance starts as absent.
              </p>
            </div>
          </div>

          <OpenSessionForm today={todayISO()} />

          <p className="mt-4 rounded-xl bg-cream px-3 py-2 text-[11px] leading-5 text-muted">
            Only closed sessions count toward readiness. Mark the sheet, save,
            then close when practice is done.
          </p>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-xl tracking-tight">
                Session history
              </h2>
              <p className="text-xs text-muted">
                {sessions.length} session{sessions.length === 1 ? "" : "s"}
              </p>
            </div>
            <Clock3 className="h-5 w-5 text-muted" aria-hidden />
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-5 w-5" aria-hidden />}
              title="No sessions yet"
              description="Open your first session on the left. Every player for that sport is added to the sheet automatically."
            />
          ) : (
            <div className="divide-y divide-line">
              {sessions.map((session) => {
                const present = session.attendance.filter(
                  (entry) => entry.present,
                ).length;

                return (
                  <Link
                    key={session.id}
                    href={`/coach/sessions/${session.id}`}
                    className="flex flex-col gap-2 px-5 py-4 transition hover:bg-cream/60 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-muted">
                        <CalendarDays className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {formatISODate(session.date)}
                        </p>
                        <p className="text-xs text-muted">
                          {session.sport} · {present} present /{" "}
                          {session.attendance.length} on sheet
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          session.status === "open" ? "amber" : "green"
                        }
                      >
                        {session.status === "open" ? "Open" : "Locked"}
                      </Badge>
                      <ChevronRight
                        className="h-4 w-4 text-muted"
                        aria-hidden
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
