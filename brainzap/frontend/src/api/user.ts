import { api } from "./client";
import { UserProfile } from "../types/api";

export const userApi = {
  profile: () => api.get<UserProfile>("/api/user/profile"),
  stats: () => api.get<{ score: number; gamesPlayed: number; accuracy: number; level: number }>("/api/user/stats")
};
