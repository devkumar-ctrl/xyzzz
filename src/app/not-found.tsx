import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { buttonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-line bg-paper p-8 text-center shadow-[0_24px_60px_-40px_rgba(23,37,31,0.45)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-muted">
          <Compass className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl tracking-tight">
          That page is off the pitch
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          The page you asked for does not exist. Head back to the desk.
        </p>
        <Link href="/" className={buttonClass("primary", "mt-5")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
