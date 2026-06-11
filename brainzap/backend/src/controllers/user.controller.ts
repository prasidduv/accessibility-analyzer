import bcrypt from "bcryptjs";
import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";
import { devStore } from "../utils/devStore.js";
import { shouldUseDevStore } from "../utils/dbMode.js";

export async function getProfile(req: AuthedRequest, res: Response) {
  let user = null;
  try {
    user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    user = devStore.findUserById(req.user!.id);
  }
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    id: user.id,
    name: user.name,
    username: user.username,
    score: user.score,
    gamesPlayed: user.gamesPlayed,
    correctAnswers: user.correctAnswers,
    totalAnswers: user.totalAnswers,
    level: user.level
  });
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional()
});

export async function updateProfile(req: AuthedRequest, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });
  const data: { name?: string; passwordHash?: string } = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  let user;
  try {
    user = await prisma.user.update({ where: { id: req.user!.id }, data });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    user = devStore.updateUser(req.user!.id, data as { name?: string; passwordHash?: string });
  }
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ id: user.id, name: user.name, username: user.username });
}

export async function getStats(req: AuthedRequest, res: Response) {
  let user = null;
  try {
    user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    user = devStore.findUserById(req.user!.id);
  }
  if (!user) return res.status(404).json({ message: "User not found" });
  const accuracy = user.totalAnswers ? Math.round((user.correctAnswers / user.totalAnswers) * 100) : 0;
  return res.json({
    score: user.score,
    gamesPlayed: user.gamesPlayed,
    accuracy,
    level: user.level
  });
}
