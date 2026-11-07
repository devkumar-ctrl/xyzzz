"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { apiPost } from "@/lib/client-api";
import { SPORTS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export function OpenSessionForm({ today }: { today: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(undefined);
    startTransition(async () => {
      try {
        const result = await apiPost<{ sessionId: string }>(
          "/api/coach/sessions",
          {
            date: String(formData.get("date") ?? ""),
            sport: String(formData.get("sport") ?? ""),
          },
        );
        router.push(`/coach/sessions/${result.sessionId}`);
        router.refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not open the session right now.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <FormMessage error={error} />

      <SubmitButton pending={pending} pendingText="Opening session...">
        <CalendarPlus className="h-4 w-4" aria-hidden />
        Open session
      </SubmitButton>
    </form>
  );
}
