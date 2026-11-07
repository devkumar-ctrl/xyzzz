import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getPlayerAccounts, getReadinessRows, createPlayerWithAccount } from "@/lib/server/data";
import { SPORTS, type Sport } from "@/lib/constants";
import { isObject, ApiError, toErrorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    const [players, readiness] = await Promise.all([
      getPlayerAccounts(),
      getReadinessRows(),
    ]);
    return NextResponse.json({ players, readiness });
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
    const name = String(obj.name ?? "").trim();
    const age = Number(obj.age);
    const sport = String(obj.sport ?? "").trim();

    if (name.length < 2 || name.length > 60) {
      throw new ApiError(400, "Enter a player name between 2 and 60 characters.");
    }
    if (!Number.isInteger(age) || age < 5 || age > 80) {
      throw new ApiError(400, "Enter an age between 5 and 80.");
    }
    if (!SPORTS.includes(sport as Sport)) {
      throw new ApiError(400, "Pick a sport from the list.");
    }

    try {
      const created = await createPlayerWithAccount({ name, age, sport });
      return NextResponse.json(
        {
          message: `${name} is on the roster.`,
          credentials: {
            name,
            username: created.username,
            password: created.password,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : "Could not add the player right now.",
      );
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
