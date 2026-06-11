import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { devStore } from "../utils/devStore.js";
import { shouldUseDevStore } from "../utils/dbMode.js";

export async function getLeaderboard(_req: Request, res: Response) {
  let top;
  try {
    top = await prisma.user.findMany({
      orderBy: { score: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        username: true,
        score: true,
        level: true,
        correctAnswers: true,
        totalAnswers: true
      }
    });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    top = devStore.leaderboardTop();
  }
  return res.json({ top });
}

export async function getWeeklyLeaderboard(_req: Request, res: Response) {
  let top;
  try {
    top = await prisma.leaderboardEntry.findMany({
      orderBy: { weeklyScore: "desc" },
      take: 10,
      include: { user: { select: { id: true, name: true, username: true, level: true } } }
    });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    top = devStore.weeklyTop().map((entry) => ({
      ...entry,
      user: devStore.findUserById(entry.userId)
    }));
  }
  return res.json({ top });
}
