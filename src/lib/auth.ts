import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/constants";
import type { Role, SessionUser } from "@/lib/types";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const AUTH_SECRET =
  process.env.AUTH_SECRET || "dumka-academy-dev-secret-change-in-production";

type SessionPayload = SessionUser & { exp: number };

function sign(value: string): string {
  return createHmac("sha256", AUTH_SECRET).update(value).digest("base64url");
}

export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (
      !payload ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000) ||
      typeof payload.uid !== "string" ||
      typeof payload.name !== "string" ||
      !["coach", "player", "scout"].includes(payload.role)
    ) {
      return null;
    }

    return {
      uid: payload.uid,
      role: payload.role,
      name: payload.name,
      playerId: payload.playerId,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function setSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
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
