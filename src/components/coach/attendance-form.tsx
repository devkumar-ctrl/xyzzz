"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { Lock } from "lucide-react";
import {
  saveAttendanceAction,
  type AttendanceState,
} from "@/actions/coach";
import type { PlayerView, SessionView } from "@/lib/types";
import { cn } from "@/lib/ui";
import { Avatar, FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export function AttendanceForm({
  session,
  players,
}: {
  session: SessionView;
  players: PlayerView[];
}) {
  const [state, setState] = useState<AttendanceState>({});
  const [pending, startTransition] = useTransition();
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      session.attendance.map((entry) => [entry.playerId, entry.present]),
    ),
  );

  const presentCount = players.filter((player) => marks[player.id]).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent =
      submitter instanceof HTMLButtonElement ? submitter.value : "save";
    const formData = new FormData(form, submitter);

    setPendingIntent(intent);
    startTransition(async () => {
      const result = await saveAttendanceAction({}, formData);
      setState(result);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="sessionId" value={session.id} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-xl tracking-tight">
            Attendance sheet
          </h2>
          <p className="text-xs text-muted">
            {presentCount} of {players.length} marked present
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em]">
          <span className="flex items-center gap-1.5 text-pitch">
            <span className="h-2 w-2 rounded-full bg-pitch" />
            Present
          </span>
          <span className="flex items-center gap-1.5 text-rose">
            <span className="h-2 w-2 rounded-full bg-rose" />
            Absent
          </span>
        </div>
      </div>

      <div className="divide-y divide-line">
        {players.map((player) => {
          const isPresent = marks[player.id] === true;
          const isAbsent = marks[player.id] === false;

          return (
            <div
              key={player.id}
              data-player-name={player.name}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar name={player.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{player.name}</p>
                  <p className="text-xs text-muted">
                    {player.age} yrs · {player.sport}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <label
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition",
                    isPresent
                      ? "border-pitch bg-pitch text-white"
                      : "border-line bg-white text-muted hover:border-pitch/30",
                  )}
                >
                  <input
                    type="radio"
                    name={`mark_${player.id}`}
                    value="present"
                    checked={isPresent}
                    onChange={() => {
                      setState({});
                      setMarks((previous) => ({
                        ...previous,
                        [player.id]: true,
                      }));
                    }}
                    className="sr-only"
                  />
                  Present
                </label>
                <label
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition",
                    isAbsent
                      ? "border-rose bg-rose-soft text-rose"
                      : "border-line bg-white text-muted hover:border-rose/30",
                  )}
                >
                  <input
                    type="radio"
                    name={`mark_${player.id}`}
                    value="absent"
                    checked={isAbsent}
                    onChange={() => {
                      setState({});
                      setMarks((previous) => ({
                        ...previous,
                        [player.id]: false,
                      }));
                    }}
                    className="sr-only"
                  />
                  Absent
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-line px-5 py-4">
        <FormMessage error={state.error} success={state.success} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SubmitButton
            name="intent"
            value="save"
            pending={pending && pendingIntent === "save"}
            disabled={pending}
            pendingText="Saving attendance..."
          >
            Save attendance
          </SubmitButton>
          <SubmitButton
            name="intent"
            value="close"
            variant="secondary"
            pending={pending && pendingIntent === "close"}
            disabled={pending}
            pendingText="Locking session..."
            onClick={(event) => {
              if (
                !window.confirm(
                  "Close this session? Attendance will be locked and cannot be edited.",
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <Lock className="h-4 w-4" aria-hidden />
            Save & close session
          </SubmitButton>
        </div>
        <p className="text-xs leading-5 text-muted">
          Closing locks the sheet. Only closed sessions count toward the 75%
          attendance bar.
        </p>
      </div>
    </form>
  );
}
