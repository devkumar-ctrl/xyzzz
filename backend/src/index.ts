import "./config.js";
import cookieParser from "cookie-parser";
import express from "express";
import { PORT } from "./config.js";
import { ensureBaseData } from "./data.js";
import { asyncHandler, errorHandler } from "./http.js";
import authRoutes from "./routes/auth.js";
import coachRoutes from "./routes/coach.js";
import playerRoutes from "./routes/player.js";
import scoutRoutes from "./routes/scout.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    await ensureBaseData();
    res.json({ ok: true });
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/scout", scoutRoutes);
app.use("/api/player", playerRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Dumka Academy API listening on http://localhost:${PORT}`);
});
