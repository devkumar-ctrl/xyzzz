export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-pitch focus:ring-4 focus:ring-pitch/10";

export const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted";

export const cardClass =
  "rounded-3xl border border-line bg-paper/90 shadow-[0_1px_0_rgba(23,37,31,0.03),0_24px_60px_-40px_rgba(23,37,31,0.45)]";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pitch/20 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonVariants = {
  primary: "bg-pitch px-5 py-2.5 text-white hover:bg-pitch-dark",
  secondary:
    "border border-line bg-white px-5 py-2.5 text-ink hover:border-pitch/30 hover:bg-pitch-soft/50",
  ghost: "px-3 py-2 text-muted hover:bg-white hover:text-ink",
  danger: "bg-rose px-5 py-2.5 text-white hover:bg-[#8f1d13]",
  lime: "bg-lime px-5 py-2.5 text-pitch-dark hover:bg-[#c8ef7f]",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClass(
  variant: ButtonVariant = "primary",
  className?: string,
): string {
  return cn(buttonBase, buttonVariants[variant], className);
}
