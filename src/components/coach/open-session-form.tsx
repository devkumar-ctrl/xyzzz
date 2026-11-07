"use client";

import { useActionState } from "react";
import { CalendarPlus } from "lucide-react";
import {
  openSessionAction,
  type OpenSessionState,
} from "@/actions/coach";
import { SPORTS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

const initialState: OpenSessionState = {};

export function OpenSessionForm({ today }: { today: string }) {
  const [state, action] = useActionState(openSessionAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="session-date">
          Date
        </label>
        <input
          id="session-date"
          type="date"
          name="date"
          defaultValue={today}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="session-sport">
          Sport
        </label>
        <select
          id="session-sport"
          name="sport"
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

      <FormMessage error={state.error} />

      <SubmitButton pendingText="Opening session...">
        <CalendarPlus className="h-4 w-4" aria-hidden />
        Open session
      </SubmitButton>
    </form>
  );
}
