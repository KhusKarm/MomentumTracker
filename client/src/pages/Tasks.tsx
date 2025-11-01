import { useState } from "react";
import TaskCard from "@/components/TaskCard";
import CreateTaskForm from "@/components/CreateTaskForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Tasks() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  //todo: remove mock functionality
  const tasks = [
    {
      id: "1",
      name: "Push-ups",
      category: "Exercise",
      metricType: "count" as const,
      target: 30,
      interval: 120,
      streak: 5,
      todayTotal: 50,
    },
    {
      id: "2",
      name: "Coding Practice",
      category: "Study",
      metricType: "duration" as const,
      target: 45,
      interval: 90,
      streak: 7,
      todayTotal: 60,
    },
    {
      id: "3",
      name: "Reading",
      category: "Personal",
      metricType: "duration" as const,
      target: 20,
      interval: 240,
      streak: 3,
      todayTotal: 25,
    },
  ];

  const handleCreateTask = (task: any) => {
    console.log("Create task:", task);
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage your tracked habits and goals
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            data-testid="button-toggle-create"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? "Cancel" : "New Task"}
          </Button>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CreateTaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreateForm(false)}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TaskCard
                {...task}
                onStart={() => console.log("Start task:", task.name)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
