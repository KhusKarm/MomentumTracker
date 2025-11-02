import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
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
  userId: varchar("user_id").notNull().references(() => users.id),
  value: integer("value").notNull(), // minutes or count submitted
  wasDefeat: boolean("was_defeat").notNull().default(false),
  wasReplay: boolean("was_replay").notNull().default(false),
  replayGoal: integer("replay_goal"), // if this was a replay, what was the goal
  checkedInAt: timestamp("checked_in_at").notNull().default(sql`NOW()`),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
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

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
