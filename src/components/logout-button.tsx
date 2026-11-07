"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { apiPost } from "@/lib/client-api";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await apiPost("/api/auth/logout");
      } finally {
        router.push("/login");
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-2 text-xs font-semibold text-muted transition hover:border-pitch/30 hover:text-ink disabled:opacity-60"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      <span className="hidden md:inline">Sign out</span>
    </button>
  );
}
