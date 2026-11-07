import type { Metadata } from "next";
import { Eye, Trophy, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ReadinessRow } from "@/lib/types";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Progress,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Ready players",
};

export default async function ScoutPage() {
  await requireRole("scout");
  const { players: readyPlayers } = await apiFetch<{
    players: ReadinessRow[];
  }>("/api/scout/ready");

  return (
    <>
      <PageHeader
        eyebrow="Trial board"
        title="Ready players"
        description="Only players who have met the bar appear here: 75% attendance and at least 2 matches."
      />

      {readyPlayers.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Eye className="h-5 w-5" aria-hidden />}
            title="No one is trial-ready yet"
            description="Players appear here once they cross 75% attendance and play 2 matches. Non-ready players stay hidden from the scout view."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {readyPlayers.map((player) => (
            <Card
              key={player.id}
              data-scout-player={player.name}
              className="relative overflow-hidden p-5"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime/30 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <Avatar name={player.name} size="lg" />
                <Badge tone="green">
                  <Trophy className="h-3 w-3" aria-hidden />
                  Ready
                </Badge>
              </div>

              <h2 className="relative mt-4 font-display text-2xl tracking-tight">
                {player.name}
              </h2>
              <p className="text-xs text-muted">
                {player.age} yrs · {player.sport}
              </p>

              <div className="relative mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-cream p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Attendance
                  </p>
                  <p className="mt-1 font-display text-2xl leading-none">
                    {player.attendancePct}%
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {player.present}/{player.held} sessions
                  </p>
                </div>
                <div className="rounded-xl bg-cream p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Matches
                  </p>
                  <p className="mt-1 font-display text-2xl leading-none">
                    {player.matches}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">played</p>
                </div>
              </div>

              <Progress
                value={player.attendancePct}
                className="relative mt-4"
              />
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-muted">
        <UserRound className="h-4 w-4" aria-hidden />
        The scout view shows ready players only. Attendance and match counts
        come from the coach&apos;s closed sheets.
      </div>
    </>
  );
}
