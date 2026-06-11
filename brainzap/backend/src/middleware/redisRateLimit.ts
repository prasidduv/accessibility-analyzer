import { NextFunction, Request, Response } from "express";
import { redis } from "../utils/redis.js";

const WINDOW_SECONDS = 60;
const MAX_REQ = 120;

export async function redisRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const key = `brainzap:rl:${ip}`;
  try {
    if (redis.status !== "ready") await redis.connect();
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, WINDOW_SECONDS);
    if (current > MAX_REQ) {
      res.status(429).json({ message: "Too many requests. Please retry shortly." });
      return;
    }
    next();
  } catch {
    next();
  }
}
