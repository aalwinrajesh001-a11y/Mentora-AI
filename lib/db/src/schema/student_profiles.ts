import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subjects: text("subjects").array().notNull().default([]),
  difficulty: text("difficulty").notNull().default("beginner"),
  learningStyle: text("learning_style").notNull().default("detailed"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
