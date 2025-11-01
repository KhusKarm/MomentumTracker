import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import { motion } from "framer-motion";

interface TaskTimerProps {
  taskName: string;
  onStop?: (duration: number) => void;
}

export default function TaskTimer({ taskName, onStop }: TaskTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsRunning(false);
    if (onStop) {
      onStop(seconds);
    }
    setSeconds(0);
  };

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-6">
        <h3 className="text-xl font-semibold text-foreground" data-testid="text-timer-task">
          {taskName}
        </h3>
        
        <motion.div
          className="text-6xl font-mono font-bold text-foreground"
          animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          data-testid="text-timer-display"
        >
          {formatTime(seconds)}
        </motion.div>

        <div className="flex gap-4">
          <Button
            size="icon"
            variant={isRunning ? "secondary" : "default"}
            onClick={() => setIsRunning(!isRunning)}
            data-testid={isRunning ? "button-pause" : "button-play"}
            className="h-16 w-16"
          >
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            onClick={handleStop}
            disabled={seconds === 0}
            data-testid="button-stop"
            className="h-16 w-16"
          >
            <Square className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
