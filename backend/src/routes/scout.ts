import { Router } from "express";
import { getReadinessRows } from "../data.js";
import { asyncHandler } from "../http.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireRole("scout"));

router.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    const players = (await getReadinessRows()).filter((row) => row.ready);
    res.json({ players });
  }),
);

export default router;
