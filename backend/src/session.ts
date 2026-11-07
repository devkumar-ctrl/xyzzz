import { createHmac, timingSafeEqual } from "node:crypto";
import type { Response } from "express";
import { AUTH_SECRET, NODE_ENV } from "./config.js";
import { SESSION_COOKIE } from "./constants.js";
import type { Role, SessionUser } from "./types.js";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

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

export function setSessionCookie(res: Response, user: SessionUser): void {
  res.cookie(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: NODE_ENV === "production",
    path: "/",
  });
}

export function homeForRole(role: Role): string {
  if (role === "coach") return "/coach";
  if (role === "scout") return "/scout";
  return "/player";
}
