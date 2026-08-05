import { pgTable, text, serial, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const resumesTable = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  atsScore: real("ats_score"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const resumeAnalysesTable = pgTable("resume_analyses", {
  id: serial("id").primaryKey(),
  resumeId: serial("resume_id").notNull().references(() => resumesTable.id, { onDelete: "cascade" }),
  atsScore: real("ats_score").notNull(),
  overallFeedback: text("overall_feedback").notNull(),
  strengths: text("strengths").array().notNull().default([]),
  weaknesses: text("weaknesses").array().notNull().default([]),
  keywordsSuggested: text("keywords_suggested").array().notNull().default([]),
  skillsFound: text("skills_found").array().notNull().default([]),
  skillsMissing: text("skills_missing").array().notNull().default([]),
  formattingScore: real("formatting_score").notNull().default(0),
  contentScore: real("content_score").notNull().default(0),
  impactScore: real("impact_score").notNull().default(0),
  rawData: text("raw_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResumeAnalysisSchema = createInsertSchema(resumeAnalysesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumesTable.$inferSelect;
export type InsertResumeAnalysis = z.infer<typeof insertResumeAnalysisSchema>;
export type ResumeAnalysis = typeof resumeAnalysesTable.$inferSelect;
