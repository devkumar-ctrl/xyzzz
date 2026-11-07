import type { ObjectId } from "mongodb";

export type Role = "coach" | "player" | "scout";

export type SessionStatus = "open" | "closed";

export type PlayerDoc = {
  _id: ObjectId;
  name: string;
  age: number;
  sport: string;
  joinedOn: string;
  createdAt: Date;
};

export type UserDoc = {
  _id: ObjectId;
  username: string;
  passwordHash: string;
  role: Role;
  name: string;
  playerId?: ObjectId;
  createdAt: Date;
};

export type AttendanceEntry = {
  playerId: ObjectId;
  present: boolean;
};

export type SessionDoc = {
  _id: ObjectId;
  date: string;
  sport: string;
  status: SessionStatus;
  attendance: AttendanceEntry[];
  createdAt: Date;
  closedAt?: Date;
};

export type ScoreEntry = {
  playerId: ObjectId;
  score: number;
};

export type MatchDoc = {
  _id: ObjectId;
  date: string;
  sport: string;
  opponent: string;
  scores: ScoreEntry[];
  createdAt: Date;
};

export type SessionUser = {
  uid: string;
  role: Role;
  name: string;
  playerId?: string;
};

export type PlayerView = {
  id: string;
  name: string;
  age: number;
  sport: string;
  joinedOn: string;
};

export type PlayerAccountView = PlayerView & {
  username: string;
};

export type AttendanceView = {
  playerId: string;
  present: boolean;
};

export type SessionView = {
  id: string;
  date: string;
  sport: string;
  status: SessionStatus;
  attendance: AttendanceView[];
  createdAt: string;
  closedAt?: string;
};

export type ScoreView = {
  playerId: string;
  score: number;
};

export type MatchView = {
  id: string;
  date: string;
  sport: string;
  opponent: string;
  scores: ScoreView[];
  createdAt: string;
};

export type ReadinessRow = PlayerView & {
  held: number;
  present: number;
  attendancePct: number | null;
  matches: number;
  ready: boolean;
  reason: string;
};

export type ReadinessStats = {
  held: number;
  present: number;
  attendancePct: number | null;
  matches: number;
  ready: boolean;
  reason: string;
};

export type PlayerRecordView = {
  player: PlayerView;
  sessions: SessionView[];
  matches: MatchView[];
  stats: ReadinessStats;
};

export type AcademyView = {
  players: PlayerView[];
  sessions: SessionView[];
  matches: MatchView[];
};
