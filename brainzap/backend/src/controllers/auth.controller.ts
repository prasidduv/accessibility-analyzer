import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { redis } from "../utils/redis.js";
import { devStore } from "../utils/devStore.js";
import { shouldUseDevStore } from "../utils/dbMode.js";

const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6)
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });
  const { name, username, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(409).json({ message: "Username already exists" });
    user = await prisma.user.create({
      data: { name, username, passwordHash }
    });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    const existing = devStore.findUserByUsername(username);
    if (existing) return res.status(409).json({ message: "Username already exists" });
    user = devStore.createUser({ name, username, passwordHash });
  }
  const payload = { sub: user.id, username: user.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  return res.status(201).json({ accessToken, user: { id: user.id, name: user.name, username: user.username } });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });
  const { username, password } = parsed.data;
  let user = null;
  try {
    user = await prisma.user.findUnique({ where: { username } });
  } catch (error) {
    if (!shouldUseDevStore(error)) throw error;
    user = devStore.findUserByUsername(username);
  }
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const payload = { sub: user.id, username: user.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  return res.json({ accessToken, user: { id: user.id, name: user.name, username: user.username } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refreshToken as string | undefined;
  if (!token) return res.status(401).json({ message: "Missing refresh token" });
  try {
    if (redis.status !== "ready") await redis.connect();
    const revoked = await redis.get(`brainzap:revoked:${token}`);
    if (revoked) return res.status(401).json({ message: "Refresh token revoked" });
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken(payload);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies.refreshToken as string | undefined;
  if (token) {
    try {
      if (redis.status !== "ready") await redis.connect();
      await redis.set(`brainzap:revoked:${token}`, "1", "EX", 7 * 24 * 60 * 60);
    } catch {
      // ignore cache failures during logout
    }
  }
  res.clearCookie("refreshToken", { path: "/" });
  return res.json({ ok: true });
}
