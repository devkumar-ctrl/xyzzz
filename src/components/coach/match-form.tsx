"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { Swords, UserX } from "lucide-react";
import { recordMatchAction, type MatchState } from "@/actions/coach";
import { SPORTS } from "@/lib/constants";
import { formatISODate } from "@/lib/date";
import type { PlayerView, SessionView } from "@/lib/types";
import { inputClass, labelClass } from "@/lib/ui";
import { Avatar, FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

const initialState: MatchState = {};

export function MatchForm({
  players,
  sessions,
  defaultDate,
  defaultSport,
}: {
  players: PlayerView[];
  sessions: SessionView[];
  defaultDate: string;
  defaultSport: string;
}) {
  const [state, action] = useActionState(recordMatchAction, initialState);
  const [date, setDate] = useState(defaultDate);
  const [sport, setSport] = useState(defaultSport);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const { present, absent, hasSession } = useMemo(() => {
    const presentIds = new Set<string>();
    let sessionFound = false;

    for (const session of sessions) {
      if (session.date !== date || session.sport !== sport) continue;
      sessionFound = true;
      for (const entry of session.attendance) {
        if (entry.present) presentIds.add(entry.playerId);
      }
    }

    const sportPlayers = players.filter((player) => player.sport === sport);
    return {
      present: sportPlayers.filter((player) => presentIds.has(player.id)),
      absent: sportPlayers.filter((player) => !presentIds.has(player.id)),
      hasSession: sessionFound,
    };
  }, [players, sessions, date, sport]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="match-date">
            Date
          </label>
          <input
            id="match-date"
            type="date"
            name="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="match-sport">
            Sport
          </label>
          <select
            id="match-sport"
            name="sport"
            value={sport}
            onChange={(event) => setSport(event.target.value)}
            className={inputClass}
          >
            {SPORTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="match-opponent">
          Opponent
        </label>
        <input
          id="match-opponent"
          name="opponent"
          required
          maxLength={80}
          className={inputClass}
          placeholder="e.g. Ranchi Rangers"
        />
      </div>

      <div className="rounded-2xl border border-line bg-cream/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Match sheet</p>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {present.length} present
          </span>
        </div>

        {!hasSession && (
          <p className="mt-3 rounded-xl bg-amber-soft px-3 py-2 text-xs leading-5 text-amber">
            No session was held for {sport} on {formatISODate(date)}. Mark
            attendance first — only players present that day can score.
          </p>
        )}

        {hasSession && present.length === 0 && (
          <p className="mt-3 rounded-xl bg-amber-soft px-3 py-2 text-xs leading-5 text-amber">
            Everyone was absent that day. No player is eligible for this sheet.
          </p>
        )}

        <div className="mt-3 space-y-2">
          {present.map((player) => (
            <div
              key={player.id}
              data-match-player={player.name}
              className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5"
            >
              <Avatar name={player.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{player.name}</p>
                <p className="text-[11px] text-muted">{player.age} yrs</p>
              </div>
              <input
                type="number"
                name={`score_${player.id}`}
                min={0}
                max={999}
                step={1}
                inputMode="numeric"
                className="w-20 rounded-lg border border-line bg-cream px-2.5 py-1.5 text-center text-sm font-semibold outline-none focus:border-pitch focus:ring-2 focus:ring-pitch/10"
                placeholder="—"
                aria-label={`Score for ${player.name}`}
              />
            </div>
          ))}
        </div>

        {hasSession && absent.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-cream px-3 py-2 text-[11px] leading-5 text-muted">
            <UserX className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Not on the sheet (absent that day):{" "}
              {absent.map((player) => player.name).join(", ")}. The server
              refuses them.
            </span>
          </div>
        )}
      </div>

      <FormMessage error={state.error} success={state.success} />

      <SubmitButton
        pendingText="Recording match..."
        disabled={present.length === 0}
      >
        <Swords className="h-4 w-4" aria-hidden />
        Record match
      </SubmitButton>
    </form>
  );
}
