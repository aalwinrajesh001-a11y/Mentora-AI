import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  subject: text("subject").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  createdAt: true,
});

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
