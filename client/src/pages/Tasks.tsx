import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TaskCard from "@/components/TaskCard";
import CreateTaskForm from "@/components/CreateTaskForm";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { data: tasks = [], isLoading } = useQuery<Task[]>({ 
    queryKey: ["/api/tasks"] 
  });

  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const categories = Object.keys(tasksByCategory).sort();

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

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
    const transformedData = {
      name: taskData.name,
      category: taskData.category,
      metricType: taskData.metricType,
      target: taskData.target,
      intervalMinutes: taskData.interval,
    };
    await createTaskMutation.mutateAsync(transformedData);
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
          <div className="space-y-6">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category);
              const categoryTasks = tasksByCategory[category];
              
              return (
                <div key={category} className="space-y-3">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 w-full group"
                    data-testid={`button-category-${category.toLowerCase()}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                    <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {category}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({categoryTasks.length})
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                          {categoryTasks.map((task, index) => (
                            <TaskCardWithStats key={task.id} task={task} index={index} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
