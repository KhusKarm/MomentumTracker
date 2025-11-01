import { type Task, type InsertTask, type CheckIn, type InsertCheckIn, tasks, checkIns } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

export interface IStorage {
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Check-ins
  getCheckIns(taskId: string): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getTodayCheckIns(taskId: string): Promise<CheckIn[]>;

  // Stats
  getTaskStats(taskId: string): Promise<{
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    replaySuccessRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.isActive, true));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Check-ins
  async getCheckIns(taskId: string): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.taskId, taskId))
      .orderBy(desc(checkIns.checkedInAt));
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db
      .insert(checkIns)
      .values(insertCheckIn)
      .returning();
    return checkIn;
  }

  async getTodayCheckIns(taskId: string): Promise<CheckIn[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.taskId, taskId),
          gte(checkIns.checkedInAt, today)
        )
      );
  }

  // Stats
  async getTaskStats(taskId: string): Promise<{
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    replaySuccessRate: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const allCheckIns = await this.getCheckIns(taskId);
    
    const todayTotal = allCheckIns
      .filter(c => c.checkedInAt >= today && !c.wasDefeat)
      .reduce((sum, c) => sum + c.value, 0);
    
    const weekTotal = allCheckIns
      .filter(c => c.checkedInAt >= weekAgo && !c.wasDefeat)
      .reduce((sum, c) => sum + c.value, 0);
    
    const monthTotal = allCheckIns
      .filter(c => c.checkedInAt >= monthAgo && !c.wasDefeat)
      .reduce((sum, c) => sum + c.value, 0);
    
    // Calculate replay success rate
    const replays = allCheckIns.filter(c => c.wasReplay);
    const successfulReplays = replays.filter(c => !c.wasDefeat);
    const replaySuccessRate = replays.length > 0 
      ? (successfulReplays.length / replays.length) * 100 
      : 0;
    
    return { todayTotal, weekTotal, monthTotal, replaySuccessRate };
  }
}

export const storage = new DatabaseStorage();
