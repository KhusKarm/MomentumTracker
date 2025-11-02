import type { Express } from "express";
import { storage } from "./storage";
import { insertTaskSchema, insertCheckInSchema } from "@shared/schema";

// 💡 CHANGE 1: Function signature updated to return void (or Promise<void>)
// It now only takes the Express app instance and registers the routes.
export async function registerRoutes(app: Express): Promise<void> {
    // Tasks CRUD
    app.get("/api/tasks", async (req, res) => {
      try {
        const tasks = await storage.getTasks();
        res.json(tasks);
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

    // Check-ins
    app.post("/api/check-ins", async (req, res) => {
      try {
        const validated = insertCheckInSchema.parse(req.body);
        const checkIn = await storage.createCheckIn(validated);
        
        // Update task based on check-in result
        const task = await storage.getTask(validated.taskId);
        if (task) {
          const updates: any = {
            nextCheckinAt: new Date(Date.now() + task.intervalMinutes * 60 * 1000)
          };
          
          if (validated.wasDefeat) {
            // Defeat - streak resets to 0
            updates.streak = 0;
          } else {
            // Success - increment streak and handle replay mode exit
            updates.streak = task.streak + 1;
            
            // If this was a successful replay, restore original target and exit replay mode
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
        const checkIns = await storage.getCheckIns(req.params.id);
        res.json(checkIns);
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

    // Get all stats for dashboard
    app.get("/api/stats", async (req, res) => {
      try {
        const tasks = await storage.getTasks();
        const allStats = await Promise.all(
          tasks.map(async (task) => ({
            taskId: task.id,
            taskName: task.name,
            ...(await storage.getTaskStats(task.id))
          }))
        );
        
        // Calculate overall momentum score and replay success rate
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

    // 💡 REMOVED: const httpServer = createServer(app);
    // 💡 REMOVED: return httpServer;
}
