import { useQuery } from "@tanstack/react-query";
import MonthlyStats from "@/components/MonthlyStats";
import MetricCard from "@/components/MetricCard";
import ActivityCalendar from "@/components/ActivityCalendar";
import { Calendar, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import type { Task } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Stats() {
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: stats } = useQuery<{ momentumScore: number; replaySuccessRate: number }>({ queryKey: ["/api/stats"] });

  // Calculate best streak across all tasks
  const bestStreak = tasks.reduce((max, task) => Math.max(max, task.streak), 0);

  // Generate weekly data for charts (mock for now since we need historical data)
  const generateWeeklyData = (taskId: string) => {
    // In a real app, this would fetch historical check-in data
    return [
      { date: 'Week 1', value: Math.floor(Math.random() * 200) + 100 },
      { date: 'Week 2', value: Math.floor(Math.random() * 200) + 100 },
      { date: 'Week 3', value: Math.floor(Math.random() * 200) + 100 },
      { date: 'Week 4', value: Math.floor(Math.random() * 200) + 100 },
    ];
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and achievements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <MetricCard
            icon={Calendar}
            label="Active Tasks"
            value={tasks.length}
            sublabel="Total"
          />
          <MetricCard
            icon={TrendingUp}
            label="Momentum Score"
            value={stats?.momentumScore ? `${stats.momentumScore}%` : "0%"}
            sublabel="Today"
          />
          <MetricCard
            icon={Award}
            label="Best Streak"
            value={bestStreak}
            sublabel="intervals"
            variant="success"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityCalendar />
            </CardContent>
          </Card>
        </motion.div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No tasks yet. Create tasks to see your statistics!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <MonthlyStats
                  taskName={task.name}
                  metricType={task.metricType as "duration" | "count"}
                  data={generateWeeklyData(task.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
