import type {
  MatchDoc,
  PlayerDoc,
  ReadinessStats,
  SessionDoc,
} from "./types.js";

export function computeReadinessForPlayer(
  player: PlayerDoc,
  sessions: SessionDoc[],
  matches: MatchDoc[],
): ReadinessStats {
  const playerId = player._id;

  const heldSessions = sessions.filter(
    (session) =>
      session.status === "closed" &&
      session.attendance.some((entry) => entry.playerId.equals(playerId)),
  );

  const present = heldSessions.filter((session) =>
    session.attendance.some(
      (entry) => entry.playerId.equals(playerId) && entry.present,
    ),
  ).length;

  const held = heldSessions.length;

  const matchesPlayed = matches.filter(
    (match) =>
      match.sport === player.sport &&
      match.scores.some((entry) => entry.playerId.equals(playerId)),
  ).length;

  const attendancePct = held > 0 ? Math.round((present / held) * 100) : null;
  const attendanceMet = held > 0 && present * 4 >= held * 3;
  const matchesMet = matchesPlayed >= 2;
  const ready = attendanceMet && matchesMet;

  let reason = "Trial ready";
  if (held === 0) {
    reason = "No closed sessions yet";
  } else if (!attendanceMet) {
    reason = "Attendance below 75%";
  } else if (!matchesMet) {
    reason = "Needs at least 2 matches";
  }

  return {
    held,
    present,
    attendancePct,
    matches: matchesPlayed,
    ready,
    reason,
  };
}
