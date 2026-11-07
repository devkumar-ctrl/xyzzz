import type { Metadata } from "next";
import { KeyRound, UserRound, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getPlayerAccounts, getReadinessRows } from "@/lib/data";
import { PLAYER_DEFAULT_PASSWORD } from "@/lib/constants";
import { formatISODate } from "@/lib/date";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { AddPlayerForm } from "@/components/coach/add-player-form";

export const metadata: Metadata = {
  title: "Players",
};

export default async function PlayersPage() {
  await requireRole("coach");

  const [players, readiness] = await Promise.all([
    getPlayerAccounts(),
    getReadinessRows(),
  ]);
  const readinessById = new Map(readiness.map((row) => [row.id, row]));

  return (
    <>
      <PageHeader
        eyebrow="Roster"
        title="Players"
        description="One academy, every player. Adding a player creates their login."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="h-fit p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pitch-soft text-pitch">
              <UserRound className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-tight">
                Add a player
              </h2>
              <p className="text-xs text-muted">Name, age and sport.</p>
            </div>
          </div>
          <AddPlayerForm />
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl tracking-tight">Roster</h2>
            <p className="text-xs text-muted">
              {players.length} player{players.length === 1 ? "" : "s"} · all
              logins use the password{" "}
              <span className="font-mono">{PLAYER_DEFAULT_PASSWORD}</span>
            </p>
          </div>

          {players.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" aria-hidden />}
              title="No players yet"
              description="Add the first player using the form. Their login will appear here as soon as they are on the roster."
            />
          ) : (
            <div className="divide-y divide-line">
              {players.map((player) => {
                const stats = readinessById.get(player.id);
                return (
                  <div
                    key={player.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={player.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {player.name}
                        </p>
                        <p className="text-xs text-muted">
                          {player.age} yrs · {player.sport} · joined{" "}
                          {formatISODate(player.joinedOn)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">
                        <KeyRound className="h-3 w-3" aria-hidden />
                        {player.username}
                      </Badge>
                      <Badge tone={stats?.ready ? "green" : "amber"}>
                        {stats?.ready
                          ? "Ready"
                          : `${stats?.attendancePct ?? 0}% · ${
                              stats?.matches ?? 0
                            } matches`}
                      </Badge>
                    </div>
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
