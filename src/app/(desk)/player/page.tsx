import type { Metadata } from "next";
import {
  CalendarDays,
  CheckCircle2,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ApiError, apiFetch } from "@/lib/api";
import {
  READY_ATTENDANCE_TARGET,
  READY_MATCH_TARGET,
} from "@/lib/constants";
import { formatISODate } from "@/lib/date";
import type { PlayerRecordView } from "@/lib/types";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Progress,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "My record",
};

export default async function PlayerPage() {
  await requireRole("player");

  let record: PlayerRecordView;
  try {
    record = await apiFetch<PlayerRecordView>("/api/player/record");
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;

    return (
      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 h-5 w-5 text-muted" aria-hidden />
          <div>
            <h1 className="font-display text-2xl tracking-tight">
              Your player profile was not found
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted">
              Ask the coach to add you to the roster, then sign in again.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const { player, sessions, matches, stats } = record;
  const attendanceMet =
    stats.held > 0 && stats.present * 4 >= stats.held * 3;
  const matchesMet = stats.matches >= READY_MATCH_TARGET;

  return (
    <>
      <PageHeader
        eyebrow="Player record"
        title={player.name}
        description={`${player.age} years · ${player.sport} · joined ${formatISODate(
          player.joinedOn,
        )}`}
        actions={
          <Badge tone={stats.ready ? "green" : "amber"}>
            {stats.ready ? "Trial ready" : "In progress"}
          </Badge>
        }
      />

      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/30 blur-2xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone={stats.ready ? "green" : "amber"}>
              {stats.ready ? "Trial ready" : "Not ready yet"}
            </Badge>
            <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              {stats.ready
                ? "You are ready for a trial."
                : stats.reason}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Ready needs {READY_ATTENDANCE_TARGET}% attendance and at least{" "}
              {READY_MATCH_TARGET} matches. Attendance counts closed sessions
              only.
            </p>
          </div>
          <Avatar name={player.name} size="lg" />
        </div>

        <div className="relative mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Attendance
              </p>
              {attendanceMet ? (
                <CheckCircle2 className="h-4 w-4 text-pitch" aria-hidden />
              ) : (
                <XCircle className="h-4 w-4 text-amber" aria-hidden />
              )}
            </div>
            <p className="mt-2 font-display text-3xl leading-none">
              {stats.attendancePct ?? 0}%
            </p>
            <p className="mt-1 text-xs text-muted">
              {stats.present} of {stats.held} closed sessions
            </p>
            <Progress value={stats.attendancePct} className="mt-3" />
            <p className="mt-2 text-[11px] text-muted">
              Target {READY_ATTENDANCE_TARGET}%
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Matches
              </p>
              {matchesMet ? (
                <CheckCircle2 className="h-4 w-4 text-pitch" aria-hidden />
              ) : (
                <XCircle className="h-4 w-4 text-amber" aria-hidden />
              )}
            </div>
            <p className="mt-2 font-display text-3xl leading-none">
              {stats.matches}
            </p>
            <p className="mt-1 text-xs text-muted">matches played</p>
            <p className="mt-3 text-[11px] text-muted">
              Target {READY_MATCH_TARGET} matches
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl tracking-tight">
              Session history
            </h2>
            <p className="text-xs text-muted">Only your rows.</p>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-5 w-5" aria-hidden />}
              title="No sessions yet"
              description="Your attendance will appear here once the coach opens a session for your sport."
            />
          ) : (
            <div className="divide-y divide-line">
              {sessions.map((entry) => {
                const attendance = entry.attendance.find(
                  (row) => row.playerId === player.id,
                );

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {formatISODate(entry.date)}
                      </p>
                      <p className="text-xs text-muted">
                        {entry.sport} ·{" "}
                        {entry.status === "open" ? "open" : "locked"}
                      </p>
                    </div>
                    <Badge
                      tone={attendance?.present ? "green" : "red"}
                    >
                      {attendance?.present ? "Present" : "Absent"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl tracking-tight">
              Match history
            </h2>
            <p className="text-xs text-muted">Your scores.</p>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-5 w-5" aria-hidden />}
              title="No matches yet"
              description="When the coach records a match you played in, your score will show up here."
            />
          ) : (
            <div className="divide-y divide-line">
              {matches.map((match) => {
                const score = match.scores.find(
                  (row) => row.playerId === player.id,
                );

                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        vs {match.opponent}
                      </p>
                      <p className="text-xs text-muted">
                        {formatISODate(match.date)} · {match.sport}
                      </p>
                    </div>
                    <Badge tone="neutral">{score?.score ?? 0} score</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
