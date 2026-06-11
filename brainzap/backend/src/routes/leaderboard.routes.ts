import { Router } from "express";
import { getLeaderboard, getWeeklyLeaderboard } from "../controllers/leaderboard.controller.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", getLeaderboard);
leaderboardRouter.get("/weekly", getWeeklyLeaderboard);
