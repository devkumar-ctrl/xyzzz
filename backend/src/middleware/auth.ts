import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE } from "../constants.js";
import { verifySessionToken } from "../session.js";
import type { Role } from "../types.js";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const user = token ? verifySessionToken(token) : null;

  if (!user) {
    res.status(401).json({ error: "Please sign in to continue." });
    return;
  }

  req.user = user;
  next();
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    requireAuth(req, res, () => {
      if (req.user?.role !== role) {
        res.status(403).json({
          error: "You do not have access to this area.",
        });
        return;
      }
      next();
    });
  };
}
