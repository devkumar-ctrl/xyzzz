"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  homeForRole,
  setSession,
} from "@/lib/auth";
import { ensureBaseData, findUserByUsername } from "@/lib/data";
import { verifyPassword } from "@/lib/password";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Enter your username and password." };
  }

  let user;
  try {
    await ensureBaseData();
    user = await findUserByUsername(username);
  } catch (error) {
    console.error("Login database error", error);
    return {
      error:
        "The academy database is not reachable. Check the MongoDB connection and try again.",
    };
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That username and password do not match." };
  }

  await setSession({
    uid: user._id.toHexString(),
    role: user.role,
    name: user.name,
    playerId: user.playerId?.toHexString(),
  });

  redirect(homeForRole(user.role));
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
