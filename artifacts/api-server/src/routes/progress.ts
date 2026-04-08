import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, quizResults } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

// GET /progress — get progress summary
router.get("/", async (req, res) => {
  try {
    const allConversations = await db.select().from(conversations);
    const allMessages = await db.select().from(messages);
    const allQuizResults = await db.select().from(quizResults);

    // Calculate day streak (simplified: count consecutive days with activity)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dayStreak = 0;
    const activityDays = new Set<string>();

    for (const conv of allConversations) {
      const d = new Date(conv.createdAt);
      activityDays.add(d.toISOString().split("T")[0]);
    }
    for (const qr of allQuizResults) {
      const d = new Date(qr.createdAt);
      activityDays.add(d.toISOString().split("T")[0]);
    }

    // Count streak from today going backwards
    let checkDate = new Date(today);
    while (activityDays.has(checkDate.toISOString().split("T")[0])) {
      dayStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Average quiz score
    const averageScore =
      allQuizResults.length > 0
        ? allQuizResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) /
          allQuizResults.length
        : 0;

    // Topics studied (from quiz results)
    const topicsStudied = [...new Set(allQuizResults.map((r) => r.topic))];

    // Estimate hours: ~2 min per message
    const hoursLearned = Math.round((allMessages.length * 2) / 60 * 10) / 10;

    res.json({
      totalConversations: allConversations.length,
      totalMessages: allMessages.length,
      dayStreak,
      averageScore: Math.round(averageScore * 10) / 10,
      topicsStudied,
      quizzesTaken: allQuizResults.length,
      hoursLearned,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress");
    res.status(500).json({ error: "Failed to get progress" });
  }
});

// POST /progress/quiz-result
router.post("/quiz-result", async (req, res) => {
  try {
    const { topic, subject, score, totalQuestions } = req.body as {
      topic: string;
      subject: string;
      score: number;
      totalQuestions: number;
    };

    if (!topic || !subject || score === undefined || !totalQuestions) {
      res.status(400).json({ error: "topic, subject, score, and totalQuestions are required" });
      return;
    }

    const [result] = await db
      .insert(quizResults)
      .values({ topic, subject, score, totalQuestions })
      .returning();

    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to save quiz result");
    res.status(500).json({ error: "Failed to save quiz result" });
  }
});

// GET /progress/quiz-results
router.get("/quiz-results", async (req, res) => {
  try {
    const results = await db
      .select()
      .from(quizResults)
      .orderBy(desc(quizResults.createdAt));
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to list quiz results");
    res.status(500).json({ error: "Failed to list quiz results" });
  }
});

export default router;
