import { pgTable, text, serial, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const learningRoadmapsTable = pgTable("learning_roadmaps", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetRole: text("target_role").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roadmapStepsTable = pgTable("roadmap_steps", {
  id: serial("id").primaryKey(),
  roadmapId: serial("roadmap_id").notNull().references(() => learningRoadmapsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  resourceUrl: text("resource_url"),
  resourceType: text("resource_type").notNull().default("article"),
  estimatedHours: real("estimated_hours"),
  orderIndex: integer("order_index").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const insertRoadmapSchema = createInsertSchema(learningRoadmapsTable).omit({
  id: true,
  createdAt: true,
});

export const insertRoadmapStepSchema = createInsertSchema(roadmapStepsTable).omit({
  id: true,
});

export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type LearningRoadmap = typeof learningRoadmapsTable.$inferSelect;
export type InsertRoadmapStep = z.infer<typeof insertRoadmapStepSchema>;
export type RoadmapStep = typeof roadmapStepsTable.$inferSelect;
