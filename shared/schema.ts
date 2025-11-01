import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  metricType: text("metric_type").notNull(), // "duration" or "count"
  target: integer("target").notNull(), // target value per interval
  intervalMinutes: integer("interval_minutes").notNull(), // check-in frequency in minutes
  streak: integer("streak").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  nextCheckinAt: timestamp("next_checkin_at").notNull().default(sql`NOW()`),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  isInReplayMode: boolean("is_in_replay_mode").notNull().default(false),
  replayTarget: integer("replay_target"),
  originalTarget: integer("original_target"),
});

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  value: integer("value").notNull(), // minutes or count submitted
  wasDefeat: boolean("was_defeat").notNull().default(false),
  wasReplay: boolean("was_replay").notNull().default(false),
  replayGoal: integer("replay_goal"), // if this was a replay, what was the goal
  checkedInAt: timestamp("checked_in_at").notNull().default(sql`NOW()`),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  streak: true,
  isActive: true,
  nextCheckinAt: true,
  createdAt: true,
  isInReplayMode: true,
  replayTarget: true,
  originalTarget: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  checkedInAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
