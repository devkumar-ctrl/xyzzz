import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Lock,
  Trophy,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ApiError, apiFetch } from "@/lib/api";
import { formatISODate } from "@/lib/date";
import type { PlayerView, SessionView } from "@/lib/types";
import { buttonClass } from "@/lib/ui";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
} from "@/components/ui";
import { AttendanceForm } from "@/components/coach/attendance-form";

export const metadata: Metadata = {
  title: "Session",
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("coach");
  const { id } = await params;

  let detail: { session: SessionView; players: PlayerView[] };
  try {
    detail = await apiFetch<{ session: SessionView; players: PlayerView[] }>(
      `/api/coach/sessions/${id}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { session, players } = detail;
  const playerById = new Map(players.map((player) => [player.id, player]));

  const attendancePlayers = session.attendance.flatMap((entry) => {
    const player = playerById.get(entry.playerId);
    return player ? [player] : [];
  });

  const present = session.attendance.filter((entry) => entry.present).length;
  const absent = session.attendance.length - present;
  const sessionView = session;

  return (
    <>
      <Link
        href="/coach/sessions"
        className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All sessions
      </Link>

      <PageHeader
        eyebrow="Attendance sheet"
        title={formatISODate(session.date)}
        description={`${session.sport} · ${
          session.status === "open"
            ? "Open for marking"
            : "Locked after practice"
        }`}
        actions={
          <Badge tone={session.status === "open" ? "amber" : "green"}>
            {session.status === "open" ? "Open" : "Locked"}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          {session.status === "open" ? (
            <AttendanceForm
              session={sessionView}
              players={attendancePlayers}
            />
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-line bg-pitch-soft/40 px-5 py-4 text-sm text-pitch-dark">
                <Lock className="h-4 w-4" aria-hidden />
                This sheet is locked. Attendance can no longer change.
              </div>
              <div className="divide-y divide-line">
                {session.attendance.map((entry) => {
                  const player = playerById.get(entry.playerId);

                  return (
                    <div
                      key={entry.playerId}
                      data-player-name={player?.name ?? "Unknown"}
                      className="flex items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={player?.name ?? "Unknown"}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold">
                            {player?.name ?? "Unknown player"}
                          </p>
                          <p className="text-xs text-muted">
                            {player
                              ? `${player.age} yrs · ${player.sport}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <Badge tone={entry.present ? "green" : "red"}>
                        {entry.present ? "Present" : "Absent"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-display text-xl tracking-tight">
              Sheet summary
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-pitch-soft p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pitch">
                  Present
                </p>
                <p className="mt-1 font-display text-3xl leading-none text-pitch-dark">
                  {present}
                </p>
              </div>
              <div className="rounded-2xl bg-rose-soft p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose">
                  Absent
                </p>
                <p className="mt-1 font-display text-3xl leading-none text-rose">
                  {absent}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted">
              {session.status === "open" ? (
                <>
                  <Clock3
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden
                  />
                  Not yet counted for readiness. Close the sheet when practice
                  is done.
                </>
              ) : (
                <>
                  <Lock
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden
                  />
                  Counts toward readiness. The sheet is locked.
                </>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-xl tracking-tight">
              Same day
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              A match on this date can only score players marked present here.
              Absent players are refused.
            </p>
            <Link
              href={`/coach/matches?date=${session.date}&sport=${encodeURIComponent(
                session.sport,
              )}`}
              className={buttonClass("secondary", "mt-4 w-full")}
            >
              <Trophy className="h-4 w-4" aria-hidden />
              Record a match
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
