import { type Task, type InsertTask, type CheckIn, type InsertCheckIn } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private checkIns: Map<string, CheckIn>;

  constructor() {
    this.tasks = new Map();
    this.checkIns = new Map();
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.isActive);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const nextCheckinAt = new Date(now.getTime() + insertTask.intervalMinutes * 60 * 1000);
    
    const task: Task = {
      ...insertTask,
      id,
      streak: 0,
      isActive: true,
      nextCheckinAt,
      createdAt: now,
      isInReplayMode: false,
      replayTarget: null,
      originalTarget: null,
    };
    
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Check-ins
  async getCheckIns(taskId: string): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(c => c.taskId === taskId)
      .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime());
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const id = randomUUID();
    const checkIn: CheckIn = {
      id,
      taskId: insertCheckIn.taskId,
      value: insertCheckIn.value,
      wasDefeat: insertCheckIn.wasDefeat ?? false,
      wasReplay: insertCheckIn.wasReplay ?? false,
      replayGoal: insertCheckIn.replayGoal ?? null,
      checkedInAt: new Date(),
    };
    
    this.checkIns.set(id, checkIn);
    return checkIn;
  }

  async getTodayCheckIns(taskId: string): Promise<CheckIn[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.checkIns.values())
      .filter(c => c.taskId === taskId && c.checkedInAt >= today);
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
    
    const checkIns = await this.getCheckIns(taskId);
    
    const todayTotal = checkIns
      .filter(c => c.checkedInAt >= today && !c.wasDefeat)
      .reduce((sum, c) => sum + c.value, 0);
    
    const weekTotal = checkIns
      .filter(c => c.checkedInAt >= weekAgo && !c.wasDefeat)
      .reduce((sum, c) => sum + c.value, 0);
    
    const monthTotal = checkIns
      .filter(c => c.checkedInAt >= monthAgo && !c.wasDefeat)
      .reduce((sum, c) => sum + c.value, 0);
    
    // Calculate replay success rate
    const replays = checkIns.filter(c => c.wasReplay);
    const successfulReplays = replays.filter(c => !c.wasDefeat);
    const replaySuccessRate = replays.length > 0 
      ? (successfulReplays.length / replays.length) * 100 
      : 0;
    
    return { todayTotal, weekTotal, monthTotal, replaySuccessRate };
  }
}

export const storage = new MemStorage();
