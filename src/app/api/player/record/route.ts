import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/server/auth";
import { getPlayerRecordView } from "@/lib/server/data";
import { ApiError, toErrorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  const auth = requireRole(request, "player");
  if ("response" in auth) return auth.response;
  try {
    const playerId = auth.user.playerId;
    if (!playerId || !ObjectId.isValid(playerId)) {
      throw new ApiError(404, "Your player profile was not found. Ask the coach to add you to the roster.");
    }
    const record = await getPlayerRecordView(new ObjectId(playerId));
    if (!record) {
      throw new ApiError(404, "Your player profile was not found. Ask the coach to add you to the roster.");
    }
    return NextResponse.json(record);
  } catch (error) {
    return toErrorResponse(error);
  }
}
