import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifySessionToken } from "./session";
import type { Role, SessionUser } from "./types";

export function getAuthUser(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : undefined;
  return token ? verifySessionToken(token) : null;
}

export function requireAuth(
  request: Request,
): { user: SessionUser } | { response: NextResponse } {
  const user = getAuthUser(request);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 },
      ),
    };
  }
  return { user };
}

export function requireRole(
  request: Request,
  role: Role,
): { user: SessionUser } | { response: NextResponse } {
  const auth = requireAuth(request);
  if ("response" in auth) return auth;
  if (auth.user.role !== role) {
    return {
      response: NextResponse.json(
        { error: "You do not have access to this area." },
        { status: 403 },
      ),
    };
  }
  return auth;
}
