import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getReadinessRows } from "@/lib/server/data";
import { toErrorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  const auth = requireRole(request, "scout");
  if ("response" in auth) return auth.response;
  try {
    const players = (await getReadinessRows()).filter((row) => row.ready);
    return NextResponse.json({ players });
  } catch (error) {
    return toErrorResponse(error);
  }
}
