import MonthlyStats from "@/components/MonthlyStats";
import MetricCard from "@/components/MetricCard";
import { Calendar, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function Stats() {
  //todo: remove mock functionality
  const monthlyData = [
    { date: 'Week 1', value: 180 },
    { date: 'Week 2', value: 240 },
    { date: 'Week 3', value: 210 },
    { date: 'Week 4', value: 270 },
  ];

  const tasks = [
    { name: "Coding Practice", metricType: "duration" as const, data: monthlyData },
    { name: "Push-ups", metricType: "count" as const, data: [
      { date: 'Week 1', value: 210 },
      { date: 'Week 2', value: 280 },
      { date: 'Week 3', value: 245 },
      { date: 'Week 4', value: 315 },
    ]},
  ];

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
            label="Total Days Active"
            value="23"
            sublabel="This month"
          />
          <MetricCard
            icon={TrendingUp}
            label="Average Score"
            value="87%"
            sublabel="Last 30 days"
          />
          <MetricCard
            icon={Award}
            label="Best Streak"
            value="12"
            sublabel="intervals"
            variant="success"
          />
        </motion.div>

        <div className="space-y-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <MonthlyStats
                taskName={task.name}
                metricType={task.metricType}
                data={task.data}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
