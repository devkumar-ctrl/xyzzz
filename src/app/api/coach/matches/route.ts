import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/server/auth";
import {
  getAcademyData,
  getPlayersByIds,
  getPresentPlayerIds,
  insertMatch,
  toAcademyView,
} from "@/lib/server/data";
import { SPORTS, type Sport } from "@/lib/constants";
import { formatISODate, isValidISODate } from "@/lib/date";
import { isObject, ApiError, toErrorResponse } from "@/lib/server/http";
import type { ScoreEntry } from "@/lib/server/types";

export async function GET(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    const { players, sessions, matches } = await getAcademyData();
    return NextResponse.json(toAcademyView(players, sessions, matches));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const auth = requireRole(request, "coach");
  if ("response" in auth) return auth.response;
  try {
    let body: unknown = {};
    try { body = await request.json(); } catch { body = {}; }
    const obj = isObject(body) ? body : {};
    const date = String(obj.date ?? "").trim();
    const sport = String(obj.sport ?? "").trim();
    const opponent = String(obj.opponent ?? "").trim();

    if (!isValidISODate(date)) {
      throw new ApiError(400, "Pick a valid date.");
    }
    if (!SPORTS.includes(sport as Sport)) {
      throw new ApiError(400, "Pick a sport from the list.");
    }
    if (opponent.length < 1 || opponent.length > 80) {
      throw new ApiError(400, "Enter the opponent's name.");
    }
    const rawScores = obj.scores;
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
        throw new ApiError(400, "Scores must be whole numbers between 0 and 999.");
      }

      scoresById.set(playerId, score);
    }

    if (scoresById.size === 0) {
      throw new ApiError(400, "Add a score for at least one player.");
    }

    const playerIds = [...scoresById.keys()].map((id) => new ObjectId(id));
    const players = await getPlayersByIds(playerIds);
    const playerById = new Map(players.map((player) => [player._id.toHexString(), player]));

    for (const playerId of scoresById.keys()) {
      const player = playerById.get(playerId);
      if (!player) {
        throw new ApiError(400, "One of the players on the sheet could not be found.");
      }
      if (player.sport !== sport) {
        throw new ApiError(400, `${player.name} plays ${player.sport}, not ${sport}.`);
      }
    }

    const presentPlayerIds = await getPresentPlayerIds(date, sport);
    for (const playerId of scoresById.keys()) {
      if (!presentPlayerIds.has(playerId)) {
        const player = playerById.get(playerId);
        throw new ApiError(
          400,
          `${player?.name ?? "That player"} was absent on ${formatISODate(date)} and cannot be on the sheet.`,
        );
      }
    }

    const scores: ScoreEntry[] = [...scoresById.entries()].map(([playerId, score]) => ({
      playerId: new ObjectId(playerId),
      score,
    }));

    await insertMatch({ date, sport, opponent, scores });
    return NextResponse.json(
      {
        message: `Match against ${opponent} recorded for ${scores.length} player${scores.length === 1 ? "" : "s"}.`,
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
