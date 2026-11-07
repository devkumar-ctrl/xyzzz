import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(currentDir, "../.env.local") });
dotenv.config({ path: path.resolve(currentDir, "../.env") });

export const PORT = Number(process.env.PORT ?? 4000);
export const MONGODB_URI = process.env.MONGODB_URI;
export const MONGODB_DB = process.env.MONGODB_DB || "dumka_academy";
export const AUTH_SECRET =
  process.env.AUTH_SECRET || "dumka-academy-dev-secret-change-in-production";
export const NODE_ENV = process.env.NODE_ENV || "development";
