"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { buttonClass, type ButtonVariant } from "@/lib/ui";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  pending?: boolean;
};

export function SubmitButton({
  children,
  pendingText = "Saving...",
  variant = "primary",
  className,
  disabled,
  pending = false,
  ...props
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const isPending = pending || formPending;

  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      className={buttonClass(variant, className)}
      {...props}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
