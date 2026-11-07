export const ACADEMY_NAME = "Dumka Sports Academy";
export const ACADEMY_SHORT_NAME = "Dumka Academy";

export const SPORTS = [
  "Football",
  "Cricket",
  "Hockey",
  "Athletics",
  "Kabaddi",
  "Basketball",
  "Badminton",
] as const;

export type Sport = (typeof SPORTS)[number];

export const PLAYER_DEFAULT_PASSWORD = "player123";

export const DEMO_COACH = { username: "coach", password: "coach123" } as const;
export const DEMO_SCOUT = { username: "scout", password: "scout123" } as const;

export const SESSION_COOKIE = "dumka_academy_session";

export const ROLE_LABELS = {
  coach: "Coach",
  player: "Player",
  scout: "Scout",
} as const;

export const READY_ATTENDANCE_TARGET = 75;
export const READY_MATCH_TARGET = 2;
