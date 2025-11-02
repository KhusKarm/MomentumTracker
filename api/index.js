var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/index.ts
import express from "express";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  checkIns: () => checkIns,
  insertCheckInSchema: () => insertCheckInSchema,
  insertTaskSchema: () => insertTaskSchema,
  tasks: () => tasks
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  metricType: text("metric_type").notNull(),
  // "duration" or "count"
  target: integer("target").notNull(),
  // target value per interval
  intervalMinutes: integer("interval_minutes").notNull(),
  // check-in frequency in minutes
  streak: integer("streak").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  nextCheckinAt: timestamp("next_checkin_at").notNull().default(sql`NOW()`),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  isInReplayMode: boolean("is_in_replay_mode").notNull().default(false),
  replayTarget: integer("replay_target"),
  originalTarget: integer("original_target")
});
var checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  value: integer("value").notNull(),
  // minutes or count submitted
  wasDefeat: boolean("was_defeat").notNull().default(false),
  wasReplay: boolean("was_replay").notNull().default(false),
  replayGoal: integer("replay_goal"),
  // if this was a replay, what was the goal
  checkedInAt: timestamp("checked_in_at").notNull().default(sql`NOW()`)
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  streak: true,
  isActive: true,
  nextCheckinAt: true,
  createdAt: true,
  isInReplayMode: true,
  replayTarget: true,
  originalTarget: true
});
var insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  checkedInAt: true
});

// server/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var sql2 = neon(process.env.DATABASE_URL, {
  fetchOptions: {
    cache: "no-store"
  }
});
var db = drizzle({ client: sql2, schema: schema_exports });

// server/storage.ts
import { eq, and, gte, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // Tasks
  async getTasks() {
    return await db.select().from(tasks).where(eq(tasks.isActive, true));
  }
  async getTask(id) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || void 0;
  }
  async createTask(insertTask) {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }
  async updateTask(id, updates) {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task || void 0;
  }
  async deleteTask(id) {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }
  // Check-ins
  async getCheckIns(taskId) {
    return await db.select().from(checkIns).where(eq(checkIns.taskId, taskId)).orderBy(desc(checkIns.checkedInAt));
  }
  async createCheckIn(insertCheckIn) {
    const [checkIn] = await db.insert(checkIns).values(insertCheckIn).returning();
    return checkIn;
  }
  async getTodayCheckIns(taskId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return await db.select().from(checkIns).where(
      and(
        eq(checkIns.taskId, taskId),
        gte(checkIns.checkedInAt, today)
      )
    );
  }
  // Stats
  async getTaskStats(taskId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const allCheckIns = await this.getCheckIns(taskId);
    const todayTotal = allCheckIns.filter((c) => c.checkedInAt >= today && !c.wasDefeat).reduce((sum, c) => sum + c.value, 0);
    const weekTotal = allCheckIns.filter((c) => c.checkedInAt >= weekAgo && !c.wasDefeat).reduce((sum, c) => sum + c.value, 0);
    const monthTotal = allCheckIns.filter((c) => c.checkedInAt >= monthAgo && !c.wasDefeat).reduce((sum, c) => sum + c.value, 0);
    const replays = allCheckIns.filter((c) => c.wasReplay);
    const successfulReplays = replays.filter((c) => !c.wasDefeat);
    const replaySuccessRate = replays.length > 0 ? successfulReplays.length / replays.length * 100 : 0;
    return { todayTotal, weekTotal, monthTotal, replaySuccessRate };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
async function registerRoutes(app) {
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks2 = await storage.getTasks();
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({
        error: "Failed to fetch task",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.post("/api/tasks", async (req, res) => {
    try {
      const validated = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validated);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({
        error: "Invalid task data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({
        error: "Failed to update task",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteTask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({
        error: "Failed to delete task",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.post("/api/check-ins", async (req, res) => {
    try {
      const validated = insertCheckInSchema.parse(req.body);
      const checkIn = await storage.createCheckIn(validated);
      const task = await storage.getTask(validated.taskId);
      if (task) {
        const updates = {
          nextCheckinAt: new Date(Date.now() + task.intervalMinutes * 60 * 1e3)
        };
        if (validated.wasDefeat) {
          updates.streak = 0;
        } else {
          updates.streak = task.streak + 1;
          if (validated.wasReplay && task.isInReplayMode && task.originalTarget) {
            updates.target = task.originalTarget;
            updates.isInReplayMode = false;
            updates.replayTarget = null;
            updates.originalTarget = null;
          }
        }
        await storage.updateTask(validated.taskId, updates);
      }
      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Error creating check-in:", error);
      res.status(400).json({
        error: "Invalid check-in data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.get("/api/tasks/:id/check-ins", async (req, res) => {
    try {
      const checkIns2 = await storage.getCheckIns(req.params.id);
      res.json(checkIns2);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({
        error: "Failed to fetch check-ins",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.get("/api/tasks/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getTaskStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.get("/api/stats", async (req, res) => {
    try {
      const tasks2 = await storage.getTasks();
      const allStats = await Promise.all(
        tasks2.map(async (task) => ({
          taskId: task.id,
          taskName: task.name,
          ...await storage.getTaskStats(task.id)
        }))
      );
      const totalCheckInsCount = allStats.reduce((sum, s) => {
        return sum + (s.todayTotal > 0 ? 1 : 0);
      }, 0);
      const momentumScore = tasks2.length > 0 ? Math.round(totalCheckInsCount / tasks2.length * 100) : 0;
      const avgReplaySuccess = allStats.length > 0 ? allStats.reduce((sum, s) => sum + s.replaySuccessRate, 0) / allStats.length : 0;
      res.json({
        momentumScore,
        replaySuccessRate: Math.round(avgReplaySuccess),
        taskStats: allStats
      });
    } catch (error) {
      console.error("Error fetching global stats:", error);
      res.status(500).json({
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

// api/index.ts
var cachedApp = null;
async function initializeApp() {
  if (cachedApp) {
    return cachedApp;
  }
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    next();
  });
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  cachedApp = app;
  return app;
}
var index_default = async (req, res) => {
  try {
    const app = await initializeApp();
    app(req, res);
  } catch (error) {
    console.error("Initialization Failed:", error);
    res.status(500).send("Server initialization failed.");
  }
};
export {
  index_default as default
};
