import { api } from "./client";
import { AuthResponse } from "../types/api";

export const authApi = {
  register: (body: { name: string; username: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/register", body),
  login: (body: { username: string; password: string }) => api.post<AuthResponse>("/api/auth/login", body),
  logout: () => api.post("/api/auth/logout")
};
