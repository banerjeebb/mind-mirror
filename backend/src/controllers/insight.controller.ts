import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { logError } from "../lib/logger";

export async function getPatterns(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const journals = await prisma.journal.findMany({
      where: {
        userId: req.userId,
        createdAt: { gte: sevenDaysAgo },
      },
      include: { insight: true },
      orderBy: { createdAt: "asc" },
    });

    const emotionFrequency: Record<string, number> = {};
    let totalSentiment = 0;
    let totalMood = 0;

    for (const j of journals) {
      for (const tag of j.emotionTags) {
        emotionFrequency[tag] = (emotionFrequency[tag] || 0) + 1;
      }
      totalSentiment += j.sentimentScore;
      totalMood += j.mood;
    }

    const count = journals.length || 1;

    res.json({
      patterns: {
        entryCount: journals.length,
        avgSentiment: totalSentiment / count,
        avgMood: totalMood / count,
        topEmotions: Object.entries(emotionFrequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([emotion, count]) => ({ emotion, count })),
        hiddenPatterns: journals
          .filter((j) => j.insight)
          .map((j) => j.insight!.hiddenPattern),
      },
    });
  } catch (error) {
    logError("getPatterns", error);
    res.status(500).json({ message: "Failed to fetch patterns" });
  }
}

export async function getStreak(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const journals = await prisma.journal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < journals.length; i++) {
      const entryDate = new Date(journals[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (error) {
    logError("getStreak", error);
    res.status(500).json({ message: "Failed to fetch streak" });
  }
}
