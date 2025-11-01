import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface ReplayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  metricType: "duration" | "count";
  originalTarget: number;
  onCommit: (replayGoal: number) => void;
  onSkip: () => void;
}

export default function ReplayModal({
  open,
  onOpenChange,
  taskName,
  metricType,
  originalTarget,
  onCommit,
  onSkip,
}: ReplayModalProps) {
  const suggestedGoal = Math.ceil(originalTarget * 0.5);
  const [replayGoal, setReplayGoal] = useState(suggestedGoal.toString());

  const handleCommit = () => {
    onCommit(parseInt(replayGoal) || suggestedGoal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-destructive" data-testid="modal-replay">
        <DialogHeader>
          <motion.div
            animate={{ x: [-2, 2, -2, 2, 0] }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-6 w-6 text-destructive" />
            <DialogTitle className="text-2xl text-destructive" data-testid="text-replay-title">
              Defeat Logged
            </DialogTitle>
          </motion.div>
          <DialogDescription className="text-base" data-testid="text-replay-description">
            Don't worry! Set a smaller replay goal for <span className="font-semibold text-foreground">{taskName}</span> in the next interval.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-4"
        >
          <div className="space-y-4">
            <Label htmlFor="replay-goal" className="text-base">
              Set your replay goal
              {metricType === "count" ? " (reps)" : " (minutes)"}
            </Label>
            <Input
              id="replay-goal"
              type="number"
              value={replayGoal}
              onChange={(e) => setReplayGoal(e.target.value)}
              className="text-2xl font-mono text-center h-16"
              data-testid="input-replay-goal"
              autoFocus
            />
            <p className="text-sm text-muted-foreground text-center">
              Original target: {originalTarget} • Suggested: {suggestedGoal}
            </p>
          </div>
        </motion.div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleCommit}
            className="w-full"
            size="lg"
            data-testid="button-commit-replay"
          >
            Commit to Replay
          </Button>
          <Button
            onClick={() => {
              onSkip();
              onOpenChange(false);
            }}
            variant="ghost"
            className="w-full"
            data-testid="button-skip-replay"
          >
            Skip This Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
