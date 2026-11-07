import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/constants";
import type { Role, SessionUser } from "@/lib/types";

const BACKEND_URL =
  process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

async function fetchSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { user?: SessionUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  return fetchSession();
}

export function homeForRole(role: Role): string {
  if (role === "coach") return "/coach";
  if (role === "scout") return "/scout";
  return "/player";
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== role) redirect(homeForRole(session.role));
  return session;
}
