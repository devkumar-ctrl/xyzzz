import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { seedDemoData } from "@/lib/server/data";
import { ApiError, toErrorResponse } from "@/lib/server/http";

export async function POST(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    try {
      const seeded = await seedDemoData();
      return NextResponse.json(
        {
          message: `Loaded ${seeded.players} players, ${seeded.sessions} sessions and ${seeded.matches} matches.`,
          seeded,
        },
        { status: 201 },
      );
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : "Could not load sample data right now.",
      );
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
