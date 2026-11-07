import { NextResponse } from "next/server";
import { ensureBaseData, findUserByUsername } from "@/lib/server/data";
import { isObject } from "@/lib/server/http";
import { verifyPassword } from "@/lib/server/password";
import { setSessionCookie, homeForRole } from "@/lib/server/session";
import type { SessionUser } from "@/lib/server/types";

export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const obj = isObject(body) ? body : {};
  const username = String(obj.username ?? "")
    .trim()
    .toLowerCase();
  const password = String(obj.password ?? "");

  if (!username || !password) {
    return NextResponse.json(
      { error: "Enter your username and password." },
      { status: 400 },
    );
  }

  let user;
  try {
    await ensureBaseData();
    user = await findUserByUsername(username);
  } catch (error) {
    console.error("Login database error", error);
    return NextResponse.json(
      {
        error:
          "The academy database is not reachable. Check the MongoDB connection and try again.",
      },
      { status: 503 },
    );
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "That username and password do not match." },
      { status: 401 },
    );
  }

  const session: SessionUser = {
    uid: user._id.toHexString(),
    role: user.role,
    name: user.name,
    playerId: user.playerId?.toHexString(),
  };

  await setSessionCookie(session);
  return NextResponse.json({
    user: session,
    redirectTo: homeForRole(user.role),
  });
}
