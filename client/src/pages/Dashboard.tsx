import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ActiveTaskDisplay from "@/components/ActiveTaskDisplay";
import MetricCard from "@/components/MetricCard";
import CheckinModal from "@/components/CheckinModal";
import ReplayModal from "@/components/ReplayModal";
import TaskTimer from "@/components/TaskTimer";
import { Flame, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useIntervalManager } from "@/hooks/use-interval-manager";
import type { Task } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { pendingCheckIns, dismissCheckIn } = useIntervalManager();
  const [currentCheckInTask, setCurrentCheckInTask] = useState<Task | null>(null);
  const [defeatedTask, setDefeatedTask] = useState<Task | null>(null); 
  const [showReplay, setShowReplay] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);

  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: stats } = useQuery<{ momentumScore: number; replaySuccessRate: number }>({ queryKey: ["/api/stats"] });

  const activeTask = tasks.find(t => t.isActive) || tasks[0];

  const checkInMutation = useMutation({
    mutationFn: async (data: { taskId: string; value: number; wasDefeat: boolean; wasReplay: boolean; replayGoal?: number }) => {
      return apiRequest("POST", "/api/check-ins", data);
    },
  });

  // Auto-show check-in modal when task is due
  useEffect(() => {
    if (pendingCheckIns.length > 0 && !currentCheckInTask) {
      const firstPending = pendingCheckIns[0];
      setCurrentCheckInTask(firstPending.task);
      // Set replay mode based on task's replay state
      setIsReplayMode(firstPending.task.isInReplayMode || false);
    }
  }, [pendingCheckIns, currentCheckInTask]);

  const handleCheckinSuccess = async (value: number) => {
    if (!currentCheckInTask) return;

    const taskName = currentCheckInTask.name;
    const wasReplay = isReplayMode;

    await checkInMutation.mutateAsync({
      taskId: currentCheckInTask.id,
      value,
      wasDefeat: false,
      wasReplay: isReplayMode,
      replayGoal: isReplayMode ? currentCheckInTask.target : undefined,
    });

    // Await query refetch to ensure fresh data before proceeding
    await queryClient.invalidateQueries({ 
      queryKey: ["/api/tasks"],
      refetchType: 'active'
    });
    await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

    dismissCheckIn(currentCheckInTask.id);
    setCurrentCheckInTask(null);
    setIsReplayMode(false);
    
    if (wasReplay) {
      toast({
        title: "Replay Success!",
        description: `Excellent recovery on ${taskName}!`,
      });
    } else {
      toast({
        title: "Success!",
        description: `Great work on ${taskName}!`,
      });
    }
  };

  const handleDefeat = async () => {
    if (!currentCheckInTask) return;
    
    // Record the defeat
    await checkInMutation.mutateAsync({
      taskId: currentCheckInTask.id,
      value: 0,
      wasDefeat: true,
      wasReplay: isReplayMode,
    });

    // Await query refetch to ensure fresh data
    await queryClient.invalidateQueries({ 
      queryKey: ["/api/tasks"],
      refetchType: 'active'
    });
    await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    
    // Store defeated task for replay flow
    setDefeatedTask(currentCheckInTask);
    dismissCheckIn(currentCheckInTask.id);
    setCurrentCheckInTask(null);
    setShowReplay(true);
  };

  const handleReplayCommit = async (replayGoal: number) => {
    if (!defeatedTask) return;
    
    const metricType = defeatedTask.metricType;
      
    // Update task with replay mode enabled, preserving original target
    // If already in replay mode, keep the existing originalTarget, otherwise save current target
    await apiRequest("PATCH", `/api/tasks/${defeatedTask.id}`, {
      isInReplayMode: true,
      originalTarget: defeatedTask.originalTarget || defeatedTask.target, // Preserve existing original or save current
      replayTarget: replayGoal, // Set the reduced replay goal
      target: replayGoal, // Set current target to replay goal
      // Set next check-in to 30 minutes from now for immediate replay
      nextCheckinAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    // Await query refetch to ensure interval manager gets fresh data
    await queryClient.invalidateQueries({ 
      queryKey: ["/api/tasks"],
      refetchType: 'active'
    });

    setShowReplay(false);
    setDefeatedTask(null);
    
    toast({
      title: "Replay Set",
      description: `You've committed to ${replayGoal} ${metricType === 'duration' ? 'minutes' : 'reps'} in the next 30 minutes`,
    });
  };

  const getProgress = () => {
    if (!activeTask) return 0;
    const now = new Date();
    const nextCheckin = new Date(activeTask.nextCheckinAt);
    const intervalMs = activeTask.intervalMinutes * 60 * 1000;
    const startTime = new Date(nextCheckin.getTime() - intervalMs);
    const elapsed = now.getTime() - startTime.getTime();
    const progress = Math.min((elapsed / intervalMs) * 100, 100);
    return Math.max(0, progress);
  };

  const getNextCheckinMinutes = () => {
    if (!activeTask) return 0;
    const now = new Date();
    const nextCheckin = new Date(activeTask.nextCheckinAt);
    const diffMs = nextCheckin.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };

  if (!activeTask) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">No Active Tasks</h2>
          <p className="text-muted-foreground">Create your first task to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold text-foreground">Momentum</h1>
          <p className="text-muted-foreground">
            Defeat is a Replay Opportunity
          </p>
        </motion.div>

        {showTimer ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <TaskTimer
              taskName={activeTask.name}
              onStop={(duration) => {
                setShowTimer(false);
                const minutes = Math.floor(duration / 60);
                if (minutes > 0) {
                  toast({
                    title: "Session Complete",
                    description: `You worked for ${minutes} minutes`,
                  });
                }
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ActiveTaskDisplay
              taskName={activeTask.name}
              category={activeTask.category}
              metricType={activeTask.metricType as "duration" | "count"}
              target={activeTask.target}
              progress={getProgress()}
              streak={activeTask.streak}
              nextCheckinMinutes={getNextCheckinMinutes()}
              onStartTimer={() => setShowTimer(true)}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={Flame}
              label="Current Streak"
              value={activeTask.streak}
              sublabel="intervals"
              variant="success"
            />
            <MetricCard
              icon={Target}
              label="Momentum Score"
              value={stats?.momentumScore ? `${stats.momentumScore}%` : "0%"}
              sublabel="Today"
            />
            <MetricCard
              icon={TrendingUp}
              label="Replay Success"
              value={stats?.replaySuccessRate ? `${stats.replaySuccessRate}%` : "0%"}
              sublabel="This week"
            />
          </div>
        </motion.div>
      </div>

      <CheckinModal
        open={!!currentCheckInTask}
        onOpenChange={(open) => {
          if (!open && currentCheckInTask) {
            dismissCheckIn(currentCheckInTask.id);
            setCurrentCheckInTask(null);
          }
        }}
        taskName={currentCheckInTask?.name || ""}
        metricType={(currentCheckInTask?.metricType as "duration" | "count") || "duration"}
        targetValue={currentCheckInTask?.target || 0}
        onSuccess={handleCheckinSuccess}
        onDefeat={handleDefeat}
      />

      <ReplayModal
        open={showReplay}
        onOpenChange={setShowReplay}
        taskName={defeatedTask?.name || ""}
        metricType={(defeatedTask?.metricType as "duration" | "count") || "duration"}
        originalTarget={defeatedTask?.target || 0}
        onCommit={handleReplayCommit}
        onSkip={() => {
          setShowReplay(false);
          setDefeatedTask(null);
        }}
      />
    </div>
  );
}
