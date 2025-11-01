import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Hash } from "lucide-react";

interface TaskCardProps {
  name: string;
  category: string;
  metricType: "duration" | "count";
  target: number;
  interval: number;
  streak?: number;
  todayTotal?: number;
  onStart?: () => void;
}

export default function TaskCard({
  name,
  category,
  metricType,
  target,
  interval,
  streak = 0,
  todayTotal = 0,
  onStart,
}: TaskCardProps) {
  const formatInterval = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="p-6 hover-elevate" data-testid={`card-task-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate" data-testid="text-task-name">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-task-category">
              {category}
            </p>
          </div>
          <Badge variant="secondary" data-testid="badge-interval">
            Every {formatInterval(interval)}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            {metricType === "duration" ? (
              <Clock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Hash className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">Target:</span>
            <span className="font-semibold font-mono" data-testid="text-task-target">
              {target}{metricType === "duration" ? " min" : ""}
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-muted-foreground">Streak:</span>
            <span className="font-semibold font-mono ml-1.5 text-primary" data-testid="text-task-streak">
              {streak}
            </span>
          </div>
        </div>

        {todayTotal > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Today's total:</span>
            <span className="font-semibold font-mono ml-1.5" data-testid="text-task-today-total">
              {todayTotal}{metricType === "duration" ? " min" : ""}
            </span>
          </div>
        )}

        <Button
          onClick={onStart}
          className="w-full"
          data-testid="button-start-task"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Session
        </Button>
      </div>
    </Card>
  );
}
