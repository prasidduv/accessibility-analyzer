import { api } from "./client";
import { QuizQuestion } from "../types/api";

export const aiApi = {
  generate: (topic: string) => api.post<{ topic: string; questions: QuizQuestion[] }>("/api/ai/generate", { topic })
};
