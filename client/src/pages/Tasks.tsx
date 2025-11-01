import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TaskCard from "@/components/TaskCard";
import CreateTaskForm from "@/components/CreateTaskForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

function TaskCardWithStats({ task, index }: { task: Task; index: number }) {
  const { data: stats } = useQuery<{ todayTotal: number }>({
    queryKey: ["/api/tasks", task.id, "stats"],
    enabled: !!task.id,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <TaskCard
        name={task.name}
        category={task.category}
        metricType={task.metricType as "duration" | "count"}
        target={task.target}
        interval={task.intervalMinutes}
        streak={task.streak}
        todayTotal={stats?.todayTotal || 0}
        onStart={() => console.log("Start task:", task.name)}
      />
    </motion.div>
  );
}

export default function Tasks() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({ 
    queryKey: ["/api/tasks"] 
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setShowCreateForm(false);
      toast({
        title: "Task Created",
        description: "Your new task has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTask = async (taskData: any) => {
    await createTaskMutation.mutateAsync(taskData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

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

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No tasks yet. Create your first task to get started!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {tasks.map((task, index) => (
              <TaskCardWithStats key={task.id} task={task} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
