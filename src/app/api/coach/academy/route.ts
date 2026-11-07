import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getAcademyData, toAcademyView } from "@/lib/server/data";
import { toErrorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    const { players, sessions, matches } = await getAcademyData();
    return NextResponse.json(toAcademyView(players, sessions, matches));
  } catch (error) {
    return toErrorResponse(error);
  }
}
