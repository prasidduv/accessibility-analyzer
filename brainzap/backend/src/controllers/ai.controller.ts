import { Request, Response } from "express";
import { z } from "zod";
import { generateQuizByTopic } from "../services/anthropic.service.js";

const bodySchema = z.object({
  topic: z.string().min(2)
});

export async function generateAIQuiz(req: Request, res: Response) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });
  try {
    const questions = await generateQuizByTopic(parsed.data.topic);
    return res.json({ topic: parsed.data.topic, questions });
  } catch (error) {
    return res.status(502).json({ message: "AI generation failed", error: String(error) });
  }
}
