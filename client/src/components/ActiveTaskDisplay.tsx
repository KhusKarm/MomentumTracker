import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Hash, PlayCircle } from "lucide-react";
import ProgressRing from "./ProgressRing";
import { motion } from "framer-motion";

interface ActiveTaskDisplayProps {
  taskName: string;
  category: string;
  metricType: "duration" | "count";
  target: number;
  progress: number;
  streak: number;
  nextCheckinMinutes: number;
  onStartTimer?: () => void;
}

export default function ActiveTaskDisplay({
  taskName,
  category,
  metricType,
  target,
  progress,
  streak,
  nextCheckinMinutes,
  onStartTimer,
}: ActiveTaskDisplayProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="p-8" data-testid="card-active-task">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="text-sm" data-testid="badge-category">
            {category}
          </Badge>
          <motion.h1
            className="text-3xl font-bold text-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            data-testid="text-active-task-name"
          >
            {taskName}
          </motion.h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            {metricType === "duration" ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Hash className="h-4 w-4" />
            )}
            <span data-testid="text-active-task-target">
              Target: {target}{metricType === "duration" ? " min" : ""}
            </span>
          </div>
        </div>

        <ProgressRing
          progress={progress}
          size={240}
          strokeWidth={16}
          label="Next Check-in"
          sublabel={formatTime(nextCheckinMinutes)}
        />

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold font-mono text-primary" data-testid="text-streak-value">
              {streak}
            </div>
            <div className="text-sm text-muted-foreground">Streak</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold font-mono text-foreground" data-testid="text-progress-percent">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>

        {metricType === "duration" && onStartTimer && (
          <Button
            onClick={onStartTimer}
            size="lg"
            className="w-full max-w-xs"
            data-testid="button-start-timer"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Timer
          </Button>
        )}
      </div>
    </Card>
  );
}
