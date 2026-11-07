import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import {
  getSessions,
  createSession,
  toSessionView,
} from "@/lib/server/data";
import { SPORTS, type Sport } from "@/lib/constants";
import { isValidISODate } from "@/lib/date";
import { isObject, ApiError, toErrorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    const sessions = await getSessions();
    return NextResponse.json({ sessions: sessions.map(toSessionView) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    let body: unknown = {};
    try { body = await request.json(); } catch { body = {}; }
    const obj = isObject(body) ? body : {};
    const date = String(obj.date ?? "").trim();
    const sport = String(obj.sport ?? "").trim();

    if (!isValidISODate(date)) {
      throw new ApiError(400, "Pick a valid date.");
    }
    if (!SPORTS.includes(sport as Sport)) {
      throw new ApiError(400, "Pick a sport from the list.");
    }

    try {
      const sessionId = await createSession(date, sport);
      return NextResponse.json(
        { sessionId: sessionId.toHexString() },
        { status: 201 },
      );
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : "Could not open the session right now.",
      );
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
