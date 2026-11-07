import { ObjectId } from "mongodb";
import { Router } from "express";
import { getPlayerRecordView } from "../data.js";
import { ApiError, asyncHandler } from "../http.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireRole("player"));

router.get(
  "/record",
  asyncHandler(async (req, res) => {
    const playerId = req.user?.playerId;
    if (!playerId || !ObjectId.isValid(playerId)) {
      throw new ApiError(
        404,
        "Your player profile was not found. Ask the coach to add you to the roster.",
      );
    }

    const record = await getPlayerRecordView(new ObjectId(playerId));
    if (!record) {
      throw new ApiError(
        404,
        "Your player profile was not found. Ask the coach to add you to the roster.",
      );
    }

    res.json(record);
  }),
);

export default router;
