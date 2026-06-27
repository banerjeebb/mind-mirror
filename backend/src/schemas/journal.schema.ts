import { z } from "zod";

export const createJournalSchema = z.object({
  entryText: z.string().min(10).max(5000),
  mood: z.number().int().min(1).max(5),
  energyLevel: z.number().int().min(1).max(5),
  model: z.string().optional(),
});
