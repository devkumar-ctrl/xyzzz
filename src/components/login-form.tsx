"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, UserRound } from "lucide-react";
import { apiPost } from "@/lib/client-api";
import { DEMO_COACH, DEMO_SCOUT } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm({ apiError }: { apiError: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await apiPost<{ redirectTo: string }>(
          "/api/auth/login",
          { username, password },
        );
        router.push(result.redirectTo);
        router.refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not sign in right now.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="rounded-2xl border border-amber/20 bg-amber-soft px-3.5 py-3 text-sm leading-5 text-amber">
          {apiError} Check the backend environment and restart the API.
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="username">
          Username
        </label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
            aria-hidden
          />
          <input
            id="username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
            className={`${inputClass} pl-9`}
            placeholder="coach"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
            aria-hidden
          />
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className={`${inputClass} pl-9`}
            placeholder="••••••••"
          />
        </div>
      </div>

      <FormMessage error={error ?? undefined} />

      <SubmitButton
        className="w-full"
        pending={pending}
        pendingText="Signing in..."
      >
        Sign in
        <ArrowRight className="h-4 w-4" aria-hidden />
      </SubmitButton>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setUsername(DEMO_COACH.username);
            setPassword(DEMO_COACH.password);
          }}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-pitch/30 hover:text-ink"
        >
          Coach demo
        </button>
        <button
          type="button"
          onClick={() => {
            setUsername(DEMO_SCOUT.username);
            setPassword(DEMO_SCOUT.password);
          }}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-pitch/30 hover:text-ink"
        >
          Scout demo
        </button>
      </div>
    </form>
  );
}
