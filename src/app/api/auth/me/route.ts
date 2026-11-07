import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to continue." },
      { status: 401 },
    );
  }
  return NextResponse.json({ user });
}
