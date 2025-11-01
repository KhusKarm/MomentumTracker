import { useState } from "react";
import ActiveTaskDisplay from "@/components/ActiveTaskDisplay";
import MetricCard from "@/components/MetricCard";
import CheckinModal from "@/components/CheckinModal";
import ReplayModal from "@/components/ReplayModal";
import TaskTimer from "@/components/TaskTimer";
import { Flame, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { toast } = useToast();
  const [showCheckin, setShowCheckin] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [streak, setStreak] = useState(7);
  const [progress, setProgress] = useState(65);

  //todo: remove mock functionality
  const activeTask = {
    name: "Coding Practice",
    category: "Study",
    metricType: "duration" as const,
    target: 45,
    nextCheckinMinutes: 25,
  };

  const handleCheckinSuccess = (value: number) => {
    console.log("Checkin success:", value);
    setStreak(prev => prev + 1);
    setProgress(0);
    toast({
      title: "Success!",
      description: `Great work! Streak increased to ${streak + 1}`,
    });
  };

  const handleDefeat = () => {
    console.log("Defeat logged");
    setShowCheckin(false);
    setShowReplay(true);
  };

  const handleReplayCommit = (goal: number) => {
    console.log("Replay committed:", goal);
    toast({
      title: "Replay Set",
      description: `You've committed to ${goal} minutes in the next interval`,
    });
  };

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
                console.log("Timer stopped:", duration);
                setShowTimer(false);
                toast({
                  title: "Session Complete",
                  description: `You worked for ${Math.floor(duration / 60)} minutes`,
                });
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
              metricType={activeTask.metricType}
              target={activeTask.target}
              progress={progress}
              streak={streak}
              nextCheckinMinutes={activeTask.nextCheckinMinutes}
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
              value={streak}
              sublabel="intervals"
              variant="success"
            />
            <MetricCard
              icon={Target}
              label="Momentum Score"
              value="85%"
              sublabel="Today"
            />
            <MetricCard
              icon={TrendingUp}
              label="Replay Success"
              value="92%"
              sublabel="This week"
            />
          </div>
        </motion.div>

        {/* Demo buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowCheckin(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-demo-checkin"
          >
            Demo Check-in
          </button>
        </div>
      </div>

      <CheckinModal
        open={showCheckin}
        onOpenChange={setShowCheckin}
        taskName={activeTask.name}
        metricType={activeTask.metricType}
        targetValue={activeTask.target}
        onSuccess={handleCheckinSuccess}
        onDefeat={handleDefeat}
      />

      <ReplayModal
        open={showReplay}
        onOpenChange={setShowReplay}
        taskName={activeTask.name}
        metricType={activeTask.metricType}
        originalTarget={activeTask.target}
        onCommit={handleReplayCommit}
        onSkip={() => console.log("Replay skipped")}
      />
    </div>
  );
}
