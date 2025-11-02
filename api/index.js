var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/api-handler/index.ts
import express from "express";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  checkIns: () => checkIns,
  insertCategorySchema: () => insertCategorySchema,
  insertCheckInSchema: () => insertCheckInSchema,
  insertJournalEntrySchema: () => insertJournalEntrySchema,
  insertTaskSchema: () => insertTaskSchema,
  insertUserSchema: () => insertUserSchema,
  journalEntries: () => journalEntries,
  tasks: () => tasks,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`)
});
var categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`)
});
var tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
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
  userId: varchar("user_id").notNull().references(() => users.id),
  value: integer("value").notNull(),
  // minutes or count submitted
  wasDefeat: boolean("was_defeat").notNull().default(false),
  wasReplay: boolean("was_replay").notNull().default(false),
  replayGoal: integer("replay_goal"),
  // if this was a replay, what was the goal
  checkedInAt: timestamp("checked_in_at").notNull().default(sql`NOW()`)
});
var journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`)
});
var insertUserSchema = createInsertSchema(users).omit({
  createdAt: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
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
var insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true
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
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  // Categories
  async getCategories(userId) {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }
  async createCategory(category) {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  // Tasks
  async getTasks(userId) {
    return await db.select().from(tasks).where(
      and(eq(tasks.userId, userId), eq(tasks.isActive, true))
    );
  }
  async getTask(id, userId) {
    const [task] = await db.select().from(tasks).where(
      and(eq(tasks.id, id), eq(tasks.userId, userId))
    );
    return task || void 0;
  }
  async createTask(insertTask) {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }
  async updateTask(id, userId, updates) {
    const [task] = await db.update(tasks).set(updates).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).returning();
    return task || void 0;
  }
  async deleteTask(id, userId) {
    const result = await db.delete(tasks).where(
      and(eq(tasks.id, id), eq(tasks.userId, userId))
    ).returning();
    return result.length > 0;
  }
  // Check-ins
  async getCheckIns(taskId, userId) {
    return await db.select().from(checkIns).where(and(eq(checkIns.taskId, taskId), eq(checkIns.userId, userId))).orderBy(desc(checkIns.checkedInAt));
  }
  async createCheckIn(insertCheckIn) {
    const [checkIn] = await db.insert(checkIns).values(insertCheckIn).returning();
    return checkIn;
  }
  async getTodayCheckIns(taskId, userId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return await db.select().from(checkIns).where(
      and(
        eq(checkIns.taskId, taskId),
        eq(checkIns.userId, userId),
        gte(checkIns.checkedInAt, today)
      )
    );
  }
  async getAllCheckIns(userId) {
    return await db.select().from(checkIns).where(eq(checkIns.userId, userId)).orderBy(desc(checkIns.checkedInAt));
  }
  // Journal
  async getJournalEntries(userId) {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt));
  }
  async createJournalEntry(entry) {
    const [journalEntry] = await db.insert(journalEntries).values(entry).returning();
    return journalEntry;
  }
  async getJournalEntry(id, userId) {
    const [entry] = await db.select().from(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return entry || void 0;
  }
  // Stats
  async getTaskStats(taskId, userId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const allCheckIns = await this.getCheckIns(taskId, userId);
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

// server/firebaseAdmin.ts
import admin from "firebase-admin";
var app;
function initializeFirebaseAdmin() {
  if (app) {
    return app;
  }
  try {
    app = admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    if (error.code === "app/duplicate-app") {
      app = admin.app();
    } else {
      console.error("Firebase Admin initialization error:", error);
      throw error;
    }
  }
  return app;
}
function getAuth() {
  if (!app) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
}

// server/middleware/auth.ts
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized - Invalid token format" });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const email = decodedToken.email;
    if (!userId || !email) {
      return res.status(401).json({ error: "Unauthorized - Invalid token claims" });
    }
    let user = await storage.getUser(userId);
    if (!user) {
      user = await storage.createUser({ id: userId, email });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Unauthorized - Token verification failed" });
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories2 = await storage.getCategories(req.userId);
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const validated = insertCategorySchema.parse({ ...req.body, userId: req.userId });
      const category = await storage.createCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({
        error: "Invalid category data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const tasks2 = await storage.getTasks(req.userId);
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id, req.userId);
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
  app2.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const validated = insertTaskSchema.parse({ ...req.body, userId: req.userId });
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
  app2.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.userId, req.body);
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
  app2.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteTask(req.params.id, req.userId);
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
  app2.post("/api/check-ins", requireAuth, async (req, res) => {
    try {
      const validated = insertCheckInSchema.parse({ ...req.body, userId: req.userId });
      const checkIn = await storage.createCheckIn(validated);
      const task = await storage.getTask(validated.taskId, req.userId);
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
        await storage.updateTask(validated.taskId, req.userId, updates);
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
  app2.get("/api/tasks/:id/check-ins", requireAuth, async (req, res) => {
    try {
      const checkIns2 = await storage.getCheckIns(req.params.id, req.userId);
      res.json(checkIns2);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({
        error: "Failed to fetch check-ins",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/check-ins/all", requireAuth, async (req, res) => {
    try {
      const checkIns2 = await storage.getAllCheckIns(req.userId);
      res.json(checkIns2);
    } catch (error) {
      console.error("Error fetching all check-ins:", error);
      res.status(500).json({
        error: "Failed to fetch all check-ins",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/tasks/:id/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getTaskStats(req.params.id, req.userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const tasks2 = await storage.getTasks(req.userId);
      const allStats = await Promise.all(
        tasks2.map(async (task) => ({
          taskId: task.id,
          taskName: task.name,
          ...await storage.getTaskStats(task.id, req.userId)
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
  app2.get("/api/journal", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getJournalEntries(req.userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({
        error: "Failed to fetch journal entries",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/journal", requireAuth, async (req, res) => {
    try {
      const validated = insertJournalEntrySchema.parse({ ...req.body, userId: req.userId });
      const entry = await storage.createJournalEntry(validated);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(400).json({
        error: "Invalid journal entry data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

// server/api-handler/index.ts
var cachedApp = null;
async function initializeApp() {
  if (cachedApp) {
    return cachedApp;
  }
  const app2 = express();
  app2.use(express.json());
  app2.use(express.urlencoded({ extended: false }));
  app2.use((req, res, next) => {
    next();
  });
  await registerRoutes(app2);
  app2.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  cachedApp = app2;
  return app2;
}
var index_default = async (req, res) => {
  try {
    const app2 = await initializeApp();
    app2(req, res);
  } catch (error) {
    console.error("Initialization Failed:", error);
    res.status(500).send("Server initialization failed.");
  }
};
export {
  index_default as default
};
