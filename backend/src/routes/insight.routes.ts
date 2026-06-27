import { Router } from "express";
import { getPatterns, getStreak } from "../controllers/insight.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/patterns", getPatterns);
router.get("/streak", getStreak);

export default router;
