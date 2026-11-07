"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { buttonClass } from "@/lib/ui";

export default function DeskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-line bg-paper p-8 text-center shadow-[0_24px_60px_-40px_rgba(23,37,31,0.45)]">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-soft text-rose">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-2xl tracking-tight">
        Could not load the desk
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        The academy database did not answer. Check the MongoDB connection in
        your environment variables, then try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className={buttonClass("primary", "mt-5")}
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Try again
      </button>
    </div>
  );
}
