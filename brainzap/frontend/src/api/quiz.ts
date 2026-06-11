import { api } from "./client";
import { QuizQuestion } from "../types/api";

export const quizApi = {
  getQuestions: (mode: string) => api.get<{ mode: string; questions: QuizQuestion[] }>(`/api/quiz/questions?mode=${mode}`),
  submit: (payload: {
    mode: string;
    score: number;
    correctCount: number;
    wrongCount: number;
    timeTaken: number;
    topic?: string;
  }) => api.post("/api/quiz/submit", payload),
  history: () => api.get("/api/quiz/history")
};
