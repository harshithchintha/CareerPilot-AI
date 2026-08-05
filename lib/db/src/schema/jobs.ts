import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { resumesTable } from "./resumes";

export const jobDescriptionsTable = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  company: text("company"),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobMatchesTable = pgTable("job_matches", {
  id: serial("id").primaryKey(),
  jobId: serial("job_id").notNull().references(() => jobDescriptionsTable.id, { onDelete: "cascade" }),
  resumeId: serial("resume_id").notNull().references(() => resumesTable.id, { onDelete: "cascade" }),
  similarityScore: real("similarity_score").notNull(),
  matchedSkills: text("matched_skills").array().notNull().default([]),
  missingSkills: text("missing_skills").array().notNull().default([]),
  recommendation: text("recommendation").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptionsTable).omit({
  id: true,
  createdAt: true,
});

export const insertJobMatchSchema = createInsertSchema(jobMatchesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type JobDescription = typeof jobDescriptionsTable.$inferSelect;
export type InsertJobMatch = z.infer<typeof insertJobMatchSchema>;
export type JobMatch = typeof jobMatchesTable.$inferSelect;
