import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { apiLimiter } from "./src/middleware/rateLimit.js";
import { redisRateLimit } from "./src/middleware/redisRateLimit.js";
import { authRouter } from "./src/routes/auth.routes.js";
import { userRouter } from "./src/routes/user.routes.js";
import { quizRouter } from "./src/routes/quiz.routes.js";
import { leaderboardRouter } from "./src/routes/leaderboard.routes.js";
import { aiRouter } from "./src/routes/ai.routes.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(redisRateLimit);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/ai", aiRouter);

app.listen(port, () => {
  console.log(`BrainZap API running on :${port}`);
});
