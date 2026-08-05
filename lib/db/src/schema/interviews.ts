import { pgTable, text, serial, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const mockInterviewsTable = pgTable("mock_interviews", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  role: text("role").notNull(),
  interviewType: text("interview_type").notNull().default("behavioral"),
  status: text("status").notNull().default("active"),
  totalQuestions: integer("total_questions").notNull().default(5),
  answeredQuestions: integer("answered_questions").notNull().default(0),
  overallScore: real("overall_score"),
  overallFeedback: text("overall_feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const interviewQuestionsTable = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  interviewId: serial("interview_id").notNull().references(() => mockInterviewsTable.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  questionType: text("question_type").notNull().default("behavioral"),
  orderIndex: integer("order_index").notNull().default(0),
  userAnswer: text("user_answer"),
  feedback: text("feedback"),
  score: real("score"),
  isAnswered: boolean("is_answered").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInterviewSchema = createInsertSchema(mockInterviewsTable).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type MockInterview = typeof mockInterviewsTable.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;
export type InterviewQuestion = typeof interviewQuestionsTable.$inferSelect;
