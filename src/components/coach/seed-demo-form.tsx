"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { apiPost } from "@/lib/client-api";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

type SeedDemoState = {
  error?: string;
  success?: string;
};

export function SeedDemoForm() {
  const router = useRouter();
  const [state, setState] = useState<SeedDemoState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({});

    startTransition(async () => {
      try {
        const result = await apiPost<{ message: string }>(
          "/api/coach/seed-demo",
        );
        setState({ success: result.message });
        router.refresh();
      } catch (error) {
        setState({
          error:
            error instanceof Error
              ? error.message
              : "Could not load sample data right now.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton
        variant="secondary"
        pending={pending}
        pendingText="Loading sample..."
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Load sample academy
      </SubmitButton>
    </form>
  );
}
