import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export type AuthedRequest = Request & {
  user?: { id: string; username: string };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing access token" });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    res.status(401).json({ message: "Invalid access token" });
  }
}
