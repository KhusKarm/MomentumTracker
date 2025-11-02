import type { Express } from "express";
import { storage } from "./storage";
import { insertTaskSchema, insertCheckInSchema, insertCategorySchema, insertJournalEntrySchema } from "@shared/schema";
import { requireAuth, type AuthRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<void> {
    // Categories
    app.get("/api/categories", requireAuth, async (req: AuthRequest, res) => {
      try {
        const categories = await storage.getCategories(req.userId!);
        res.json(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ 
          error: "Failed to fetch categories",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });

    app.post("/api/categories", requireAuth, async (req: AuthRequest, res) => {
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

    // Tasks CRUD
    app.get("/api/tasks", requireAuth, async (req: AuthRequest, res) => {
      try {
        const tasks = await storage.getTasks(req.userId!);
        res.json(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ 
          error: "Failed to fetch tasks",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });

    app.get("/api/tasks/:id", requireAuth, async (req: AuthRequest, res) => {
      try {
        const task = await storage.getTask(req.params.id, req.userId!);
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

    app.post("/api/tasks", requireAuth, async (req: AuthRequest, res) => {
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

    app.patch("/api/tasks/:id", requireAuth, async (req: AuthRequest, res) => {
      try {
        const task = await storage.updateTask(req.params.id, req.userId!, req.body);
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

    app.delete("/api/tasks/:id", requireAuth, async (req: AuthRequest, res) => {
      try {
        const success = await storage.deleteTask(req.params.id, req.userId!);
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

    // Check-ins
    app.post("/api/check-ins", requireAuth, async (req: AuthRequest, res) => {
      try {
        const validated = insertCheckInSchema.parse({ ...req.body, userId: req.userId });
        const checkIn = await storage.createCheckIn(validated);
        
        // Update task based on check-in result
        const task = await storage.getTask(validated.taskId, req.userId!);
        if (task) {
          const updates: any = {
            nextCheckinAt: new Date(Date.now() + task.intervalMinutes * 60 * 1000)
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
          
          await storage.updateTask(validated.taskId, req.userId!, updates);
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

    app.get("/api/tasks/:id/check-ins", requireAuth, async (req: AuthRequest, res) => {
      try {
        const checkIns = await storage.getCheckIns(req.params.id, req.userId!);
        res.json(checkIns);
      } catch (error) {
        console.error("Error fetching check-ins:", error);
        res.status(500).json({ 
          error: "Failed to fetch check-ins",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });

    app.get("/api/tasks/:id/stats", requireAuth, async (req: AuthRequest, res) => {
      try {
        const stats = await storage.getTaskStats(req.params.id, req.userId!);
        res.json(stats);
      } catch (error) {
        console.error("Error fetching task stats:", error);
        res.status(500).json({ 
          error: "Failed to fetch stats",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Get all stats for dashboard
    app.get("/api/stats", requireAuth, async (req: AuthRequest, res) => {
      try {
        const tasks = await storage.getTasks(req.userId!);
        const allStats = await Promise.all(
          tasks.map(async (task) => ({
            taskId: task.id,
            taskName: task.name,
            ...(await storage.getTaskStats(task.id, req.userId!))
          }))
        );
        
        const totalCheckInsCount = allStats.reduce((sum, s) => {
          return sum + (s.todayTotal > 0 ? 1 : 0);
        }, 0);
        
        const momentumScore = tasks.length > 0
          ? Math.round((totalCheckInsCount / tasks.length) * 100)
          : 0;
        
        const avgReplaySuccess = allStats.length > 0
          ? allStats.reduce((sum, s) => sum + s.replaySuccessRate, 0) / allStats.length
          : 0;
        
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

    // Journal entries
    app.get("/api/journal", requireAuth, async (req: AuthRequest, res) => {
      try {
        const entries = await storage.getJournalEntries(req.userId!);
        res.json(entries);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        res.status(500).json({ 
          error: "Failed to fetch journal entries",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });

    app.post("/api/journal", requireAuth, async (req: AuthRequest, res) => {
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

    // 💡 REMOVED: const httpServer = createServer(app);
    // 💡 REMOVED: return httpServer;
}
