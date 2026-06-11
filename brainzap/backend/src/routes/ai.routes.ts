import { Router } from "express";
import { generateAIQuiz } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.post("/generate", requireAuth, generateAIQuiz);
