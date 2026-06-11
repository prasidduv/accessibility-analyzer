import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";
import { scoreToLevel } from "../utils/levels.js";
import { devStore } from "../utils/devStore.js";
import { shouldUseDevStore } from "../utils/dbMode.js";

const modeSchema = z.enum(["easy", "medium", "hard", "blitz"]);

const modeConfig: Record<z.infer<typeof modeSchema>, { count: number }> = {
  easy: { count: 5 },
  medium: { count: 8 },
  hard: { count: 10 },
  blitz: { count: 15 }
};

const seedQuestions = [
  { question: "What planet is known as the Red Planet?", options: ["Earth", "Mars", "Venus", "Jupiter"], answerIndex: 1 },
  { question: "Who wrote Hamlet?", options: ["Shakespeare", "Homer", "Tolstoy", "Austen"], answerIndex: 0 },
  { question: "Largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answerIndex: 2 },
  { question: "What is H2O?", options: ["Hydrogen", "Oxygen", "Water", "Helium"], answerIndex: 2 },
  { question: "Capital of Japan?", options: ["Kyoto", "Tokyo", "Osaka", "Nagoya"], answerIndex: 1 },
  { question: "2 + 2 = ?", options: ["3", "4", "5", "6"], answerIndex: 1 },
  { question: "Sun rises in?", options: ["North", "South", "East", "West"], answerIndex: 2 },
  { question: "Fastest land animal?", options: ["Cheetah", "Lion", "Tiger", "Horse"], answerIndex: 0 },
  { question: "Largest mammal?", options: ["Elephant", "Blue Whale", "Shark", "Rhino"], answerIndex: 1 },
  { question: "JS runs in browser?", options: ["Yes", "No", "Only server", "Only mobile"], answerIndex: 0 }
];

export async function getQuestions(req: AuthedRequest, res: Response) {
  const parsed = modeSchema.safeParse(req.query.mode);
  if (!parsed.success) return res.status(400).json({ message: "Invalid mode" });
  const mode = parsed.data;
  const shuffled = [...seedQuestions].sort(() => Math.random() - 0.5).slice(0, modeConfig[mode].count);
  return res.json({ mode, questions: shuffled });
}

const submitSchema = z.object({
  mode: modeSchema,
  score: z.number().int().nonnegative(),
  correctCount: z.number().int().nonnegative(),
  wrongCount: z.number().int().nonnegative(),
  timeTaken: z.number().int().nonnegative(),
  topic: z.string().optional()
});

export async function submitQuiz(req: AuthedRequest, res: Response) {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });
  const payload = parsed.data;

  let user = null;
  try {
    user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    user = devStore.findUserById(req.user!.id);
  }
  if (!user) return res.status(404).json({ message: "User not found" });

  const newScore = user.score + payload.score;
  const newCorrect = user.correctAnswers + payload.correctCount;
  const newTotal = user.totalAnswers + payload.correctCount + payload.wrongCount;
  const newLevel = scoreToLevel(newScore);

  try {
    await prisma.$transaction([
      prisma.gameSession.create({
        data: {
          userId: user.id,
          mode: payload.mode,
          score: payload.score,
          correctCount: payload.correctCount,
          wrongCount: payload.wrongCount,
          timeTaken: payload.timeTaken,
          topic: payload.topic
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          score: newScore,
          gamesPlayed: user.gamesPlayed + 1,
          correctAnswers: newCorrect,
          totalAnswers: newTotal,
          level: newLevel
        }
      }),
      prisma.leaderboardEntry.upsert({
        where: { userId: user.id },
        update: { weeklyScore: { increment: payload.score } },
        create: { userId: user.id, weeklyScore: payload.score, rank: 0 }
      })
    ]);
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    devStore.addSession({
      userId: user.id,
      mode: payload.mode,
      score: payload.score,
      correctCount: payload.correctCount,
      wrongCount: payload.wrongCount,
      timeTaken: payload.timeTaken,
      topic: payload.topic
    });
    devStore.updateUser(user.id, {
      score: newScore,
      gamesPlayed: user.gamesPlayed + 1,
      correctAnswers: newCorrect,
      totalAnswers: newTotal,
      level: newLevel
    });
    devStore.bumpWeeklyScore(user.id, payload.score);
  }

  return res.json({ ok: true, score: newScore, level: newLevel });
}

export async function getHistory(req: AuthedRequest, res: Response) {
  let sessions;
  try {
    sessions = await prisma.gameSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    sessions = devStore.getUserSessions(req.user!.id);
  }
  return res.json({ sessions });
}
