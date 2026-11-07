"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SPORTS, type Sport } from "@/lib/constants";
import {
  createPlayerWithAccount,
  createSession,
  getPlayersByIds,
  getPresentPlayerIds,
  getSessionById,
  insertMatch,
  saveAttendance,
  seedDemoData,
} from "@/lib/data";
import { formatISODate, isValidISODate } from "@/lib/date";
import type { ScoreEntry } from "@/lib/types";

async function isCoach(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "coach";
}

function revalidateDesk(): void {
  for (const path of [
    "/coach",
    "/coach/players",
    "/coach/sessions",
    "/coach/matches",
    "/scout",
  ]) {
    revalidatePath(path);
  }
}

export type AddPlayerState = {
  error?: string;
  success?: string;
  credentials?: {
    name: string;
    username: string;
    password: string;
  };
};

export async function addPlayerAction(
  _previousState: AddPlayerState,
  formData: FormData,
): Promise<AddPlayerState> {
  if (!(await isCoach())) {
    return { error: "Only the coach can add players." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const age = Number(ageRaw);

  if (name.length < 2 || name.length > 60) {
    return { error: "Enter a player name between 2 and 60 characters." };
  }
  if (!Number.isInteger(age) || age < 5 || age > 80) {
    return { error: "Enter an age between 5 and 80." };
  }
  if (!SPORTS.includes(sport as Sport)) {
    return { error: "Pick a sport from the list." };
  }

  try {
    const created = await createPlayerWithAccount({ name, age, sport });
    revalidateDesk();
    return {
      success: `${name} is on the roster.`,
      credentials: {
        name,
        username: created.username,
        password: created.password,
      },
    };
  } catch (error) {
    console.error("Add player error", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not add the player right now.",
    };
  }
}

export type OpenSessionState = {
  error?: string;
};

export async function openSessionAction(
  _previousState: OpenSessionState,
  formData: FormData,
): Promise<OpenSessionState> {
  if (!(await isCoach())) {
    return { error: "Only the coach can open a session." };
  }

  const date = String(formData.get("date") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();

  if (!isValidISODate(date)) {
    return { error: "Pick a valid date." };
  }
  if (!SPORTS.includes(sport as Sport)) {
    return { error: "Pick a sport from the list." };
  }

  let sessionId: ObjectId;
  try {
    sessionId = await createSession(date, sport);
  } catch (error) {
    console.error("Open session error", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not open the session right now.",
    };
  }

  revalidateDesk();
  revalidatePath(`/coach/sessions/${sessionId.toHexString()}`);
  redirect(`/coach/sessions/${sessionId.toHexString()}`);
}

export type AttendanceState = {
  error?: string;
  success?: string;
};

export async function saveAttendanceAction(
  _previousState: AttendanceState,
  formData: FormData,
): Promise<AttendanceState> {
  if (!(await isCoach())) {
    return { error: "Only the coach can mark attendance." };
  }

  const sessionIdRaw = String(formData.get("sessionId") ?? "").trim();
  const intent = String(formData.get("intent") ?? "save");

  if (!ObjectId.isValid(sessionIdRaw)) {
    return { error: "That session could not be found." };
  }

  const sessionId = new ObjectId(sessionIdRaw);
  const session = await getSessionById(sessionId);

  if (!session) {
    return { error: "That session could not be found." };
  }
  if (session.status !== "open") {
    return { error: "This session is locked. Attendance can no longer change." };
  }

  const attendance = session.attendance.map((entry) => {
    const value = formData.get(`mark_${entry.playerId.toHexString()}`);
    return {
      playerId: entry.playerId,
      present: value === "present",
    };
  });

  const close = intent === "close";

  try {
    const updated = await saveAttendance(sessionId, attendance, close);
    if (!updated) {
      return {
        error: "This session was just locked. Reload to see the final sheet.",
      };
    }
  } catch (error) {
    console.error("Save attendance error", error);
    return { error: "Could not save attendance right now." };
  }

  revalidateDesk();
  revalidatePath(`/coach/sessions/${sessionIdRaw}`);

  if (close) {
    redirect(`/coach/sessions/${sessionIdRaw}`);
  }

  return { success: "Attendance saved." };
}

export type MatchState = {
  error?: string;
  success?: string;
};

export async function recordMatchAction(
  _previousState: MatchState,
  formData: FormData,
): Promise<MatchState> {
  if (!(await isCoach())) {
    return { error: "Only the coach can record a match." };
  }

  const date = String(formData.get("date") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const opponent = String(formData.get("opponent") ?? "").trim();

  if (!isValidISODate(date)) {
    return { error: "Pick a valid date." };
  }
  if (!SPORTS.includes(sport as Sport)) {
    return { error: "Pick a sport from the list." };
  }
  if (opponent.length < 1 || opponent.length > 80) {
    return { error: "Enter the opponent's name." };
  }

  const scoresById = new Map<string, number>();
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("score_")) continue;
    const raw = String(value).trim();
    if (raw === "") continue;

    const playerId = key.slice("score_".length);
    if (!ObjectId.isValid(playerId)) {
      return { error: "One of the players on the sheet is invalid." };
    }

    const score = Number(raw);
    if (!Number.isInteger(score) || score < 0 || score > 999) {
      return { error: "Scores must be whole numbers between 0 and 999." };
    }

    scoresById.set(playerId, score);
  }

  if (scoresById.size === 0) {
    return { error: "Add a score for at least one player." };
  }

  const playerIds = [...scoresById.keys()].map((id) => new ObjectId(id));
  const players = await getPlayersByIds(playerIds);
  const playerById = new Map(
    players.map((player) => [player._id.toHexString(), player]),
  );

  for (const playerId of scoresById.keys()) {
    const player = playerById.get(playerId);
    if (!player) {
      return { error: "One of the players on the sheet could not be found." };
    }
    if (player.sport !== sport) {
      return {
        error: `${player.name} plays ${player.sport}, not ${sport}.`,
      };
    }
  }

  const presentPlayerIds = await getPresentPlayerIds(date, sport);
  for (const playerId of scoresById.keys()) {
    if (!presentPlayerIds.has(playerId)) {
      const player = playerById.get(playerId);
      return {
        error: `${player?.name ?? "That player"} was absent on ${formatISODate(
          date,
        )} and cannot be on the sheet.`,
      };
    }
  }

  const scores: ScoreEntry[] = [...scoresById.entries()].map(
    ([playerId, score]) => ({
      playerId: new ObjectId(playerId),
      score,
    }),
  );

  try {
    await insertMatch({ date, sport, opponent, scores });
  } catch (error) {
    console.error("Record match error", error);
    return { error: "Could not record the match right now." };
  }

  revalidateDesk();
  return {
    success: `Match against ${opponent} recorded for ${scores.length} player${
      scores.length === 1 ? "" : "s"
    }.`,
  };
}

export type SeedDemoState = {
  error?: string;
  success?: string;
};

export async function seedDemoAction(
  _previousState: SeedDemoState,
  _formData: FormData,
): Promise<SeedDemoState> {
  if (!(await isCoach())) {
    return { error: "Only the coach can load sample data." };
  }

  try {
    const seeded = await seedDemoData();
    revalidateDesk();
    return {
      success: `Loaded ${seeded.players} players, ${seeded.sessions} sessions and ${seeded.matches} matches.`,
    };
  } catch (error) {
    console.error("Seed demo error", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not load sample data right now.",
    };
  }
}
