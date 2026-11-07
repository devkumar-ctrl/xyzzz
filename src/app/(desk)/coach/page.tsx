import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { buildReadinessRows, getAcademyData } from "@/lib/data";
import { formatISODate, todayISO } from "@/lib/date";
import { buttonClass } from "@/lib/ui";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
  Progress,
  StatCard,
} from "@/components/ui";
import { SeedDemoForm } from "@/components/coach/seed-demo-form";

export const metadata: Metadata = {
  title: "Coach overview",
};

export default async function CoachPage() {
  const session = await requireRole("coach");
  const { players, sessions, matches } = await getAcademyData();
  const readiness = buildReadinessRows(players, sessions, matches);
  const readyCount = readiness.filter((row) => row.ready).length;
  const closedCount = sessions.filter(
    (entry) => entry.status === "closed",
  ).length;
  const today = todayISO();
  const todaysSessions = sessions.filter((entry) => entry.date === today);
  const todaysMatches = matches.filter((entry) => entry.date === today);

  return (
    <>
      <PageHeader
        eyebrow={`${formatISODate(today)} · Dumka Sports Academy`}
        title="The coach's desk"
        description={`Welcome back, ${session.name}. Who came, who scored, and who is ready for a trial — all in one place.`}
        actions={
          <>
            <Link
              href="/coach/players"
              className={buttonClass("secondary")}
            >
              <UserRound className="h-4 w-4" aria-hidden />
              Add player
            </Link>
            <Link href="/coach/sessions" className={buttonClass("primary")}>
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Open session
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Players"
          value={players.length}
          hint="On the roster"
          icon={<Users className="h-5 w-5" aria-hidden />}
          tone="green"
        />
        <StatCard
          label="Sessions held"
          value={closedCount}
          hint={`${sessions.length - closedCount} open`}
          icon={<CalendarDays className="h-5 w-5" aria-hidden />}
          tone="blue"
        />
        <StatCard
          label="Matches"
          value={matches.length}
          hint="Recorded this season"
          icon={<Trophy className="h-5 w-5" aria-hidden />}
          tone="amber"
        />
        <StatCard
          label="Trial ready"
          value={readyCount}
          hint="75% + 2 matches"
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
          tone="green"
        />
      </div>

      {players.length === 0 ? (
        <Card className="mt-6 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-pitch">
                Start here
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">
                Put the notebook away.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Add the players first. Then open a session, mark attendance,
                close it, and record the match. Readiness updates as the season
                moves.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/coach/players"
                  className={buttonClass("primary")}
                >
                  <UserRound className="h-4 w-4" aria-hidden />
                  Add your first player
                </Link>
                <Link
                  href="/coach/sessions"
                  className={buttonClass("secondary")}
                >
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  See sessions
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-line bg-cream/60 p-5">
              <p className="text-sm font-semibold">Want a quick tour?</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Load 3 players, 4 closed sessions and 3 matches. Aarav ends up
                trial-ready; the other two show what is still missing.
              </p>
              <div className="mt-4">
                <SeedDemoForm />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card className="mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-2xl tracking-tight">
                  Readiness board
                </h2>
                <p className="text-xs text-muted">
                  75% attendance · 2 matches · only closed sessions count
                </p>
              </div>
              <Link
                href="/coach/players"
                className="inline-flex items-center gap-1 text-xs font-semibold text-pitch hover:underline"
              >
                Manage players
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>

            <div className="divide-y divide-line">
              {readiness.map((row) => (
                <div
                  key={row.id}
                  data-readiness-player={row.name}
                  data-ready={row.ready ? "true" : "false"}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={row.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {row.name}
                      </p>
                      <p className="text-xs text-muted">
                        {row.age} yrs · {row.sport}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-44">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">
                        {row.present}/{row.held} sessions
                      </span>
                      <span className="font-semibold">
                        {row.attendancePct === null
                          ? "—"
                          : `${row.attendancePct}%`}
                      </span>
                    </div>
                    <Progress value={row.attendancePct} className="mt-1.5" />
                  </div>

                  <div className="flex items-center gap-2 sm:w-28 sm:justify-center">
                    <Trophy
                      className="h-3.5 w-3.5 text-muted"
                      aria-hidden
                    />
                    <span className="text-xs font-semibold">
                      {row.matches}
                    </span>
                    <span className="text-[11px] text-muted">matches</span>
                  </div>

                  <div className="sm:w-44 sm:text-right">
                    <Badge tone={row.ready ? "green" : "amber"}>
                      {row.ready ? "Trial ready" : "Not ready"}
                    </Badge>
                    {!row.ready && (
                      <p className="mt-1 text-[11px] text-muted">
                        {row.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl tracking-tight">
                    Today at the academy
                  </h2>
                  <p className="text-xs text-muted">{formatISODate(today)}</p>
                </div>
                <Link
                  href="/coach/sessions"
                  className="text-xs font-semibold text-pitch hover:underline"
                >
                  All sessions
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {todaysSessions.length === 0 &&
                  todaysMatches.length === 0 && (
                    <p className="rounded-xl bg-cream px-3 py-3 text-sm text-muted">
                      No sessions or matches logged for today.
                    </p>
                  )}

                {todaysSessions.map((entry) => (
                  <Link
                    key={entry._id.toHexString()}
                    href={`/coach/sessions/${entry._id.toHexString()}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-sm transition hover:border-pitch/30"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays
                        className="h-4 w-4 text-pitch"
                        aria-hidden
                      />
                      <span className="font-semibold">
                        {entry.sport} session
                      </span>
                    </span>
                    <Badge tone={entry.status === "open" ? "amber" : "green"}>
                      {entry.status === "open" ? "Open" : "Locked"}
                    </Badge>
                  </Link>
                ))}

                {todaysMatches.map((entry) => (
                  <div
                    key={entry._id.toHexString()}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber" aria-hidden />
                      <span className="font-semibold">
                        vs {entry.opponent}
                      </span>
                    </span>
                    <span className="text-xs text-muted">{entry.sport}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-2xl tracking-tight">
                The readiness rule
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                A player is trial-ready when they attend at least 75% of closed
                sessions and play at least 2 matches.
              </p>
              <div className="mt-4 space-y-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4 text-pitch"
                    aria-hidden
                  />
                  Present sessions ÷ sessions held
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4 text-pitch"
                    aria-hidden
                  />
                  Only closed sessions are counted
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-pitch" aria-hidden />
                  A match scores only players present that day
                </div>
              </div>
              <Link
                href="/coach/matches"
                className={buttonClass("secondary", "mt-5 w-full")}
              >
                <Trophy className="h-4 w-4" aria-hidden />
                Record a match
              </Link>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
