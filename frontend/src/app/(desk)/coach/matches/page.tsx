import type { Metadata } from "next";
import { Swords, Trophy } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { SPORTS, type Sport } from "@/lib/constants";
import { formatISODate, isValidISODate, todayISO } from "@/lib/date";
import type { AcademyView } from "@/lib/types";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { MatchForm } from "@/components/coach/match-form";

export const metadata: Metadata = {
  title: "Matches",
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; sport?: string }>;
}) {
  await requireRole("coach");

  const params = await searchParams;
  const { players, sessions, matches } = await apiFetch<AcademyView>(
    "/api/coach/academy",
  );

  const defaultDate = isValidISODate(params.date ?? "")
    ? (params.date as string)
    : todayISO();
  const defaultSport = SPORTS.includes(params.sport as Sport)
    ? (params.sport as Sport)
    : "Football";

  const playerById = new Map(players.map((player) => [player.id, player]));

  return (
    <>
      <PageHeader
        eyebrow="Match day"
        title="Matches"
        description="Record the opponent and the score for every player who was present that day."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="h-fit p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pitch-soft text-pitch">
              <Swords className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-tight">
                Record a match
              </h2>
              <p className="text-xs text-muted">
                Only present players make the sheet.
              </p>
            </div>
          </div>

          <MatchForm
            players={players}
            sessions={sessions}
            defaultDate={defaultDate}
            defaultSport={defaultSport}
          />
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-xl tracking-tight">
                Match history
              </h2>
              <p className="text-xs text-muted">
                {matches.length} match{matches.length === 1 ? "" : "es"}
              </p>
            </div>
            <Trophy className="h-5 w-5 text-muted" aria-hidden />
          </div>

          {matches.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-5 w-5" aria-hidden />}
              title="No matches yet"
              description="Mark a session first, then record the match on the same date. Scores and readiness will follow."
            />
          ) : (
            <div className="divide-y divide-line">
              {matches.map((match) => (
                <div key={match.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        vs {match.opponent}
                      </p>
                      <p className="text-xs text-muted">
                        {formatISODate(match.date)} · {match.sport}
                      </p>
                    </div>
                    <Badge tone="neutral">
                      {match.scores.length} player
                      {match.scores.length === 1 ? "" : "s"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {match.scores.map((score) => {
                      const player = playerById.get(score.playerId);

                      return (
                        <span
                          key={score.playerId}
                          className="rounded-full bg-cream px-3 py-1 text-xs"
                        >
                          <span className="font-semibold">
                            {player?.name ?? "Unknown"}
                          </span>
                          <span className="text-muted">
                            {" "}
                            · {score.score}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
