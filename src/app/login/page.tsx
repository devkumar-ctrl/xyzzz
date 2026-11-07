import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarCheck2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getSession, homeForRole } from "@/lib/auth";
import {
  ACADEMY_NAME,
  DEMO_COACH,
  DEMO_SCOUT,
  PLAYER_DEFAULT_PASSWORD,
} from "@/lib/constants";
import { ensureBaseData } from "@/lib/data";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

const highlights = [
  {
    icon: CalendarCheck2,
    text: "Open a session, mark present or absent, then lock it.",
  },
  {
    icon: ShieldCheck,
    text: "75% attendance and 2 matches makes a player trial-ready.",
  },
  {
    icon: Sparkles,
    text: "Scouts see only ready players. Players see only their own row.",
  },
];

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(homeForRole(session.role));

  let dbError: string | null = null;
  try {
    await ensureBaseData();
  } catch (error) {
    console.error("Login page database error", error);
    dbError = "The academy database is not connected yet.";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-lime/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-pitch/10 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-paper shadow-[0_40px_120px_-60px_rgba(23,37,31,0.6)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-pitch-dark p-8 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-lime/20" />

          <div className="relative">
            <Brand href="/login" inverted />
            <p className="mt-14 max-w-md font-display text-4xl leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              Every practice. Every match. Every player.
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
              The desk for {ACADEMY_NAME}. Keep the roster, mark who came,
              record the score, and see who is ready for a trial.
            </p>

            <div className="mt-8 space-y-3">
              {highlights.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-lime"
                    aria-hidden
                  />
                  <p className="text-sm leading-5 text-white/75">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-white/40">
            <CheckCircle2 className="h-4 w-4 text-lime/70" aria-hidden />
            One academy · Three roles · One source of truth
          </div>
        </section>

        <section className="flex flex-col justify-center bg-paper p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-pitch">
              Welcome back
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">
              Sign in to the desk
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Coach, player or scout — use the login your academy shared.
            </p>

            <div className="mt-7">
              <LoginForm dbError={dbError} />
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-cream/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Demo access
              </p>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="font-semibold text-ink">Coach</span>
                  <span className="font-mono text-muted">
                    {DEMO_COACH.username} / {DEMO_COACH.password}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="font-semibold text-ink">Scout</span>
                  <span className="font-mono text-muted">
                    {DEMO_SCOUT.username} / {DEMO_SCOUT.password}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="font-semibold text-ink">Player</span>
                  <span className="text-right font-mono text-muted">
                    username from coach / {PLAYER_DEFAULT_PASSWORD}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
