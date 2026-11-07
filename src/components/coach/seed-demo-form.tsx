"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { seedDemoAction, type SeedDemoState } from "@/actions/coach";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

const initialState: SeedDemoState = {};

export function SeedDemoForm() {
  const [state, action] = useActionState(seedDemoAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="secondary" pendingText="Loading sample...">
        <Sparkles className="h-4 w-4" aria-hidden />
        Load sample academy
      </SubmitButton>
    </form>
  );
}
