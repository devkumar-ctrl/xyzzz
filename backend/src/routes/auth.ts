import { Router } from "express";
import { ensureBaseData, findUserByUsername } from "../data.js";
import { asyncHandler, isObject } from "../http.js";
import { requireAuth } from "../middleware/auth.js";
import { verifyPassword } from "../password.js";
import {
  clearSessionCookie,
  homeForRole,
  setSessionCookie,
} from "../session.js";
import type { SessionUser } from "../types.js";

const router = Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = isObject(req.body) ? req.body : {};
    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    if (!username || !password) {
      res.status(400).json({ error: "Enter your username and password." });
      return;
    }

    let user;
    try {
      await ensureBaseData();
      user = await findUserByUsername(username);
    } catch (error) {
      console.error("Login database error", error);
      res.status(503).json({
        error:
          "The academy database is not reachable. Check the MongoDB connection and try again.",
      });
      return;
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({
        error: "That username and password do not match.",
      });
      return;
    }

    const session: SessionUser = {
      uid: user._id.toHexString(),
      role: user.role,
      name: user.name,
      playerId: user.playerId?.toHexString(),
    };

    setSessionCookie(res, session);
    res.json({
      user: session,
      redirectTo: homeForRole(user.role),
    });
  }),
);

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
