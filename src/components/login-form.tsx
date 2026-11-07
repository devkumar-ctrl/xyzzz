"use client";

import { useState } from "react";
import { useActionState } from "react";
import { ArrowRight, KeyRound, UserRound } from "lucide-react";
import { loginAction, type LoginState } from "@/actions/auth";
import { DEMO_COACH, DEMO_SCOUT } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

const initialState: LoginState = {};

export function LoginForm({ dbError }: { dbError: string | null }) {
  const [state, action] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="space-y-4">
      {dbError && (
        <div className="rounded-2xl border border-amber/20 bg-amber-soft px-3.5 py-3 text-sm leading-5 text-amber">
          {dbError} Add <code className="font-mono">MONGODB_URI</code> to{" "}
          <code className="font-mono">.env.local</code> and restart the dev
          server.
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

      <FormMessage error={state.error} />

      <SubmitButton className="w-full" pendingText="Signing in...">
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
