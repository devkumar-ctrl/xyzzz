import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/server/auth";
import { getSessionDetail } from "@/lib/server/data";
import { ApiError, toErrorResponse } from "@/lib/server/http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      throw new ApiError(404, "That session could not be found.");
    }
    const detail = await getSessionDetail(new ObjectId(id));
    if (!detail) {
      throw new ApiError(404, "That session could not be found.");
    }
    return NextResponse.json(detail);
  } catch (error) {
    return toErrorResponse(error);
  }
}
