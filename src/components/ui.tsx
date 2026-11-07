import type { HTMLAttributes, ReactNode } from "react";
import { cardClass, cn } from "@/lib/ui";

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn(cardClass, className)} {...props}>
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-pitch">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export type BadgeTone =
  | "green"
  | "amber"
  | "red"
  | "neutral"
  | "blue"
  | "lime";

const badgeTones: Record<BadgeTone, string> = {
  green: "bg-pitch-soft text-pitch-dark ring-1 ring-pitch/10",
  amber: "bg-amber-soft text-amber ring-1 ring-amber/10",
  red: "bg-rose-soft text-rose ring-1 ring-rose/10",
  neutral: "bg-cream text-muted ring-1 ring-line",
  blue: "bg-sky-soft text-sky ring-1 ring-sky/10",
  lime: "bg-lime text-pitch-dark",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statTones = {
  green: "bg-pitch-soft text-pitch",
  amber: "bg-amber-soft text-amber",
  blue: "bg-sky-soft text-sky",
  neutral: "bg-cream text-muted",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "green",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  tone?: keyof typeof statTones;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl leading-none tracking-tight text-ink">
            {value}
          </p>
          {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl",
            statTones[tone],
          )}
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}

export function Progress({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  const width = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-line/70",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          (value ?? 0) >= 75 ? "bg-pitch" : "bg-amber",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-muted">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border px-3.5 py-3 text-sm leading-5",
        error
          ? "border-rose/20 bg-rose-soft text-rose"
          : "border-pitch/20 bg-pitch-soft text-pitch-dark",
      )}
    >
      {error ?? success}
    </div>
  );
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const sizes = {
    sm: "h-8 w-8 rounded-xl text-[11px]",
    md: "h-10 w-10 rounded-2xl text-sm",
    lg: "h-14 w-14 rounded-2xl text-lg",
  };

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-pitch-soft font-bold text-pitch-dark ring-1 ring-pitch/10",
        sizes[size],
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
}
