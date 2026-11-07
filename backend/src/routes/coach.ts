import { ObjectId } from "mongodb";
import { Router } from "express";
import { SPORTS, type Sport } from "../constants.js";
import {
  buildReadinessRows,
  createPlayerWithAccount,
  createSession,
  getAcademyData,
  getPlayerAccounts,
  getPlayersByIds,
  getPresentPlayerIds,
  getReadinessRows,
  getSessionById,
  getSessionDetail,
  getSessions,
  insertMatch,
  saveAttendance,
  seedDemoData,
  toAcademyView,
  toMatchView,
  toPlayerView,
  toSessionView,
} from "../data.js";
import { formatISODate, isValidISODate, todayISO } from "../date.js";
import { ApiError, asyncHandler, isObject } from "../http.js";
import { requireRole } from "../middleware/auth.js";
import type { ScoreEntry } from "../types.js";

const router = Router();

router.use(requireRole("coach"));

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const { players, sessions, matches } = await getAcademyData();
    res.json({
      players: players.map(toPlayerView),
      sessions: sessions.map(toSessionView),
      matches: matches.map(toMatchView),
      readiness: buildReadinessRows(players, sessions, matches),
      today: todayISO(),
    });
  }),
);

router.get(
  "/academy",
  asyncHandler(async (_req, res) => {
    const { players, sessions, matches } = await getAcademyData();
    res.json(toAcademyView(players, sessions, matches));
  }),
);

router.get(
  "/players",
  asyncHandler(async (_req, res) => {
    const [players, readiness] = await Promise.all([
      getPlayerAccounts(),
      getReadinessRows(),
    ]);
    res.json({ players, readiness });
  }),
);

router.post(
  "/players",
  asyncHandler(async (req, res) => {
    const body = isObject(req.body) ? req.body : {};
    const name = String(body.name ?? "").trim();
    const age = Number(body.age);
    const sport = String(body.sport ?? "").trim();

    if (name.length < 2 || name.length > 60) {
      throw new ApiError(
        400,
        "Enter a player name between 2 and 60 characters.",
      );
    }
    if (!Number.isInteger(age) || age < 5 || age > 80) {
      throw new ApiError(400, "Enter an age between 5 and 80.");
    }
    if (!SPORTS.includes(sport as Sport)) {
      throw new ApiError(400, "Pick a sport from the list.");
    }

    try {
      const created = await createPlayerWithAccount({ name, age, sport });
      res.status(201).json({
        message: `${name} is on the roster.`,
        credentials: {
          name,
          username: created.username,
          password: created.password,
        },
      });
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error
          ? error.message
          : "Could not add the player right now.",
      );
    }
  }),
);

router.get(
  "/sessions",
  asyncHandler(async (_req, res) => {
    const sessions = await getSessions();
    res.json({ sessions: sessions.map(toSessionView) });
  }),
);

router.post(
  "/sessions",
  asyncHandler(async (req, res) => {
    const body = isObject(req.body) ? req.body : {};
    const date = String(body.date ?? "").trim();
    const sport = String(body.sport ?? "").trim();

    if (!isValidISODate(date)) {
      throw new ApiError(400, "Pick a valid date.");
    }
    if (!SPORTS.includes(sport as Sport)) {
      throw new ApiError(400, "Pick a sport from the list.");
    }

    try {
      const sessionId = await createSession(date, sport);
      res.status(201).json({ sessionId: sessionId.toHexString() });
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error
          ? error.message
          : "Could not open the session right now.",
      );
    }
  }),
);

router.get(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) {
      throw new ApiError(404, "That session could not be found.");
    }

    const detail = await getSessionDetail(new ObjectId(id));
    if (!detail) {
      throw new ApiError(404, "That session could not be found.");
    }

    res.json(detail);
  }),
);

router.put(
  "/sessions/:id/attendance",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) {
      throw new ApiError(404, "That session could not be found.");
    }

    const sessionId = new ObjectId(id);
    const session = await getSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, "That session could not be found.");
    }
    if (session.status !== "open") {
      throw new ApiError(
        409,
        "This session is locked. Attendance can no longer change.",
      );
    }

    const body = isObject(req.body) ? req.body : {};
    const rawAttendance = body.attendance;
    if (!isObject(rawAttendance)) {
      throw new ApiError(400, "Send an attendance sheet with the request.");
    }

    const attendance = session.attendance.map((entry) => ({
      playerId: entry.playerId,
      present: rawAttendance[entry.playerId.toHexString()] === true,
    }));
    const close = body.close === true;

    const updated = await saveAttendance(sessionId, attendance, close);
    if (!updated) {
      throw new ApiError(
        409,
        "This session was just locked. Reload to see the final sheet.",
      );
    }

    res.json({
      message: close ? "Session closed and locked." : "Attendance saved.",
    });
  }),
);

router.get(
  "/matches",
  asyncHandler(async (_req, res) => {
    const { players, sessions, matches } = await getAcademyData();
    res.json(toAcademyView(players, sessions, matches));
  }),
);

router.post(
  "/matches",
  asyncHandler(async (req, res) => {
    const body = isObject(req.body) ? req.body : {};
    const date = String(body.date ?? "").trim();
    const sport = String(body.sport ?? "").trim();
    const opponent = String(body.opponent ?? "").trim();

    if (!isValidISODate(date)) {
      throw new ApiError(400, "Pick a valid date.");
    }
    if (!SPORTS.includes(sport as Sport)) {
      throw new ApiError(400, "Pick a sport from the list.");
    }
    if (opponent.length < 1 || opponent.length > 80) {
      throw new ApiError(400, "Enter the opponent's name.");
    }
    const rawScores = body.scores;
    if (!isObject(rawScores)) {
      throw new ApiError(400, "Add a score for at least one player.");
    }

    const scoresById = new Map<string, number>();
    for (const [playerId, raw] of Object.entries(rawScores)) {
      if (!ObjectId.isValid(playerId)) {
        throw new ApiError(400, "One of the players on the sheet is invalid.");
      }

      const score =
        typeof raw === "number"
          ? raw
          : typeof raw === "string" && raw.trim() !== ""
            ? Number(raw)
            : Number.NaN;

      if (!Number.isInteger(score) || score < 0 || score > 999) {
        throw new ApiError(
          400,
          "Scores must be whole numbers between 0 and 999.",
        );
      }

      scoresById.set(playerId, score);
    }

    if (scoresById.size === 0) {
      throw new ApiError(400, "Add a score for at least one player.");
    }

    const playerIds = [...scoresById.keys()].map((id) => new ObjectId(id));
    const players = await getPlayersByIds(playerIds);
    const playerById = new Map(
      players.map((player) => [player._id.toHexString(), player]),
    );

    for (const playerId of scoresById.keys()) {
      const player = playerById.get(playerId);
      if (!player) {
        throw new ApiError(
          400,
          "One of the players on the sheet could not be found.",
        );
      }
      if (player.sport !== sport) {
        throw new ApiError(
          400,
          `${player.name} plays ${player.sport}, not ${sport}.`,
        );
      }
    }

    const presentPlayerIds = await getPresentPlayerIds(date, sport);
    for (const playerId of scoresById.keys()) {
      if (!presentPlayerIds.has(playerId)) {
        const player = playerById.get(playerId);
        throw new ApiError(
          400,
          `${player?.name ?? "That player"} was absent on ${formatISODate(
            date,
          )} and cannot be on the sheet.`,
        );
      }
    }

    const scores: ScoreEntry[] = [...scoresById.entries()].map(
      ([playerId, score]) => ({
        playerId: new ObjectId(playerId),
        score,
      }),
    );

    await insertMatch({ date, sport, opponent, scores });
    res.status(201).json({
      message: `Match against ${opponent} recorded for ${scores.length} player${
        scores.length === 1 ? "" : "s"
      }.`,
    });
  }),
);

router.post(
  "/seed-demo",
  asyncHandler(async (_req, res) => {
    try {
      const seeded = await seedDemoData();
      res.status(201).json({
        message: `Loaded ${seeded.players} players, ${seeded.sessions} sessions and ${seeded.matches} matches.`,
        seeded,
      });
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error
          ? error.message
          : "Could not load sample data right now.",
      );
    }
  }),
);

export default router;
