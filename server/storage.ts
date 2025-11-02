import { 
  type Task, type InsertTask, 
  type CheckIn, type InsertCheckIn, 
  type User, type InsertUser,
  type Category, type InsertCategory,
  type JournalEntry, type InsertJournalEntry,
  tasks, checkIns, users, categories, journalEntries 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Categories
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Tasks
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string, userId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, userId: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string, userId: string): Promise<boolean>;

  // Check-ins
  getCheckIns(taskId: string, userId: string): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getTodayCheckIns(taskId: string, userId: string): Promise<CheckIn[]>;
  getAllCheckIns(userId: string): Promise<CheckIn[]>;

  // Journal
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined>;

  // Stats
  getTaskStats(taskId: string, userId: string): Promise<{
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    replaySuccessRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(
      and(eq(tasks.userId, userId), eq(tasks.isActive, true))
    );
  }

  async getTask(id: string, userId: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(
      and(eq(tasks.id, id), eq(tasks.userId, userId))
    );
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: string, userId: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(tasks).where(
      and(eq(tasks.id, id), eq(tasks.userId, userId))
    ).returning();
    return result.length > 0;
  }

  // Check-ins
  async getCheckIns(taskId: string, userId: string): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(and(eq(checkIns.taskId, taskId), eq(checkIns.userId, userId)))
      .orderBy(desc(checkIns.checkedInAt));
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db
      .insert(checkIns)
      .values(insertCheckIn)
      .returning();
    return checkIn;
  }

  async getTodayCheckIns(taskId: string, userId: string): Promise<CheckIn[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.taskId, taskId),
          eq(checkIns.userId, userId),
          gte(checkIns.checkedInAt, today)
        )
      );
  }

  async getAllCheckIns(userId: string): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.checkedInAt));
  }

  // Journal
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return journalEntry;
  }

  async getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return entry || undefined;
  }

  // Stats
  async getTaskStats(taskId: string, userId: string): Promise<{
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
    
    const allCheckIns = await this.getCheckIns(taskId, userId);
    
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
