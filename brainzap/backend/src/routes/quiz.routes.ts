import { Router } from "express";
import { getHistory, getQuestions, submitQuiz } from "../controllers/quiz.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const quizRouter = Router();

quizRouter.get("/questions", requireAuth, getQuestions);
quizRouter.post("/submit", requireAuth, submitQuiz);
quizRouter.get("/history", requireAuth, getHistory);
