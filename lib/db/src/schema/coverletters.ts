import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const coverLettersTable = pgTable("cover_letters", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  resumeId: integer("resume_id"),
  jobId: integer("job_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCoverLetterSchema = createInsertSchema(coverLettersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;
export type CoverLetter = typeof coverLettersTable.$inferSelect;
