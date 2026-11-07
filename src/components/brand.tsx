import Link from "next/link";
import { ACADEMY_SHORT_NAME } from "@/lib/constants";
import { cn } from "@/lib/ui";

export function Brand({
  href = "/",
  inverted = false,
  compact = false,
}: {
  href?: string;
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <Link href={href} className="group flex items-center gap-3">
      <span
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-2xl text-[13px] font-black tracking-tight shadow-sm",
          inverted ? "bg-lime text-pitch-dark" : "bg-pitch-dark text-lime",
        )}
      >
        DA
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2",
            inverted ? "bg-pitch-dark ring-pitch-dark" : "bg-lime ring-cream",
          )}
        />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-lg tracking-tight",
            inverted ? "text-white" : "text-ink",
          )}
        >
          {ACADEMY_SHORT_NAME}
        </span>
        {!compact && (
          <span
            className={cn(
              "block text-[10px] font-semibold uppercase tracking-[0.22em]",
              inverted ? "text-white/50" : "text-muted",
            )}
          >
            Sports desk
          </span>
        )}
      </span>
    </Link>
  );
}
