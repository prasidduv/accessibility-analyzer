import { Router } from "express";
import { getProfile, getStats, updateProfile } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.get("/profile", requireAuth, getProfile);
userRouter.put("/profile", requireAuth, updateProfile);
userRouter.get("/stats", requireAuth, getStats);
