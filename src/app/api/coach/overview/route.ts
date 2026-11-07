import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getAcademyData, buildReadinessRows, toPlayerView, toSessionView, toMatchView } from "@/lib/server/data";
import { todayISO } from "@/lib/date";
import { toErrorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    const { players, sessions, matches } = await getAcademyData();
    return NextResponse.json({
      players: players.map(toPlayerView),
      sessions: sessions.map(toSessionView),
      matches: matches.map(toMatchView),
      readiness: buildReadinessRows(players, sessions, matches),
      today: todayISO(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
