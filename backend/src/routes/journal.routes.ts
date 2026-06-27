import { Router } from "express";
import {
  createJournal,
  getJournals,
  getJournalById,
  completeRitual,
} from "../controllers/journal.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { journalLimiter } from "../middleware/rateLimit.middleware";
import { createJournalSchema } from "../schemas/journal.schema";
import { AVAILABLE_MODELS } from "../services/gemini.service";

const router = Router();

router.get("/models", (_req, res) => {
  res.json({ models: AVAILABLE_MODELS });
});

router.use(authenticate);

router.post("/", journalLimiter, validate(createJournalSchema), createJournal);
router.get("/", getJournals);
router.get("/:id", getJournalById);
router.patch("/:id/ritual-complete", completeRitual);

export default router;
