import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/server/auth";
import { getSessionById, saveAttendance } from "@/lib/server/data";
import { isObject, ApiError, toErrorResponse } from "@/lib/server/http";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      throw new ApiError(404, "That session could not be found.");
    }
    const sessionId = new ObjectId(id);
    const session = await getSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, "That session could not be found.");
    }
    if (session.status !== "open") {
      throw new ApiError(409, "This session is locked. Attendance can no longer change.");
    }

    let body: unknown = {};
    try { body = await request.json(); } catch { body = {}; }
    const obj = isObject(body) ? body : {};
    const rawAttendance = obj.attendance;
    if (!isObject(rawAttendance)) {
      throw new ApiError(400, "Send an attendance sheet with the request.");
    }

    const attendance = session.attendance.map((entry) => ({
      playerId: entry.playerId,
      present: rawAttendance[entry.playerId.toHexString()] === true,
    }));
    const close = obj.close === true;

    const updated = await saveAttendance(sessionId, attendance, close);
    if (!updated) {
      throw new ApiError(409, "This session was just locked. Reload to see the final sheet.");
    }

    return NextResponse.json({
      message: close ? "Session closed and locked." : "Attendance saved.",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
