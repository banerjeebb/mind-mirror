import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { analyzeJournalEntry, GeminiApiError } from "../services/gemini.service";
import { logError } from "../lib/logger";

export async function createJournal(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { entryText, mood, energyLevel, model } = req.body;
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const analysis = await analyzeJournalEntry(
      entryText,
      mood,
      energyLevel,
      user.examType,
      model
    );

    const journal = await prisma.journal.create({
      data: {
        userId,
        entryText,
        mood,
        energyLevel,
        emotionTags: analysis.emotionTags,
        triggerWords: analysis.triggerWords,
        sentimentScore: analysis.sentimentScore,
        emotionVector: {
          x: analysis.emotionVector.x,
          y: analysis.emotionVector.y,
        },
      },
    });

    const insight = await prisma.insight.create({
      data: {
        userId,
        journalId: journal.id,
        hiddenPattern: analysis.hiddenPattern,
        copingRitual: analysis.copingRitual,
        ritualType: analysis.ritualType,
      },
    });

    res.status(201).json({ journal, insight });
  } catch (error) {
    logError("createJournal", error);
    if (error instanceof GeminiApiError) {
      res.status(error.statusCode).json({ message: error.userMessage });
      return;
    }
    res.status(500).json({ message: "Failed to create journal entry" });
  }
}

export async function getJournals(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const journals = await prisma.journal.findMany({
      where: { userId: req.userId },
      include: { insight: true },
      orderBy: { createdAt: "asc" },
    });

    res.json({ journals });
  } catch (error) {
    logError("getJournals", error);
    res.status(500).json({ message: "Failed to fetch journals" });
  }
}

export async function getJournalById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const journal = await prisma.journal.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
      include: { insight: true },
    });

    if (!journal) {
      res.status(404).json({ message: "Journal entry not found" });
      return;
    }

    res.json({ journal });
  } catch (error) {
    logError("getJournalById", error);
    res.status(500).json({ message: "Failed to fetch journal entry" });
  }
}

export async function completeRitual(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const journal = await prisma.journal.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
      include: { insight: true },
    });

    if (!journal?.insight) {
      res.status(404).json({ message: "Journal or insight not found" });
      return;
    }

    const insight = await prisma.insight.update({
      where: { id: journal.insight.id },
      data: { ritualCompleted: true },
    });

    res.json({ insight });
  } catch (error) {
    logError("completeRitual", error);
    res.status(500).json({ message: "Failed to complete ritual" });
  }
}
