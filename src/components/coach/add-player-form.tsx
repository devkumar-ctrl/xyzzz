"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { addPlayerAction, type AddPlayerState } from "@/actions/coach";
import { PLAYER_DEFAULT_PASSWORD, SPORTS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

const initialState: AddPlayerState = {};

export function AddPlayerForm() {
  const [state, action] = useActionState(addPlayerAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="player-name">
          Full name
        </label>
        <input
          id="player-name"
          name="name"
          required
          minLength={2}
          maxLength={60}
          className={inputClass}
          placeholder="e.g. Arjun Kumar"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="player-age">
            Age
          </label>
          <input
            id="player-age"
            name="age"
            type="number"
            min={5}
            max={80}
            required
            className={inputClass}
            placeholder="14"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="player-sport">
            Sport
          </label>
          <select
            id="player-sport"
            name="sport"
            required
            defaultValue="Football"
            className={inputClass}
          >
            {SPORTS.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs leading-5 text-muted">
        Every player gets a login: an auto-generated username and the password{" "}
        <code className="rounded bg-cream px-1.5 py-0.5 font-mono text-[11px] text-ink">
          {PLAYER_DEFAULT_PASSWORD}
        </code>
        .
      </p>

      <FormMessage error={state.error} success={state.success} />

      {state.credentials && (
        <div className="rounded-2xl border border-pitch/20 bg-pitch-soft/70 px-3.5 py-3 text-sm text-pitch-dark">
          <p className="font-semibold">
            Share this login with {state.credentials.name}
          </p>
          <p className="mt-1 font-mono text-xs">
            {state.credentials.username} / {state.credentials.password}
          </p>
        </div>
      )}

      <SubmitButton pendingText="Adding player...">
        <UserPlus className="h-4 w-4" aria-hidden />
        Add player
      </SubmitButton>
    </form>
  );
}
