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

interface CheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  metricType: "duration" | "count";
  targetValue?: number;
  onSuccess: (value: number) => void;
  onDefeat: () => void;
}

export default function CheckinModal({
  open,
  onOpenChange,
  taskName,
  metricType,
  targetValue,
  onSuccess,
  onDefeat,
}: CheckinModalProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSuccess = () => {
    const value = parseInt(inputValue) || 0;
    onSuccess(value);
    setInputValue("");
    onOpenChange(false);
  };

  const handleDefeat = () => {
    onDefeat();
    setInputValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-checkin">
        <DialogHeader>
          <DialogTitle className="text-2xl" data-testid="text-checkin-title">Check-in Time</DialogTitle>
          <DialogDescription className="text-base" data-testid="text-checkin-description">
            How did you do with <span className="font-semibold text-foreground">{taskName}</span>?
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4"
        >
          {metricType === "count" ? (
            <div className="space-y-4">
              <Label htmlFor="count-input" className="text-base">
                How many did you complete?
                {targetValue && (
                  <span className="text-muted-foreground ml-2">
                    (Target: {targetValue})
                  </span>
                )}
              </Label>
              <Input
                id="count-input"
                type="number"
                placeholder="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-2xl font-mono text-center h-16"
                data-testid="input-count"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="duration-input" className="text-base">
                How many minutes did you complete?
                {targetValue && (
                  <span className="text-muted-foreground ml-2">
                    (Target: {targetValue} min)
                  </span>
                )}
              </Label>
              <Input
                id="duration-input"
                type="number"
                placeholder="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-2xl font-mono text-center h-16"
                data-testid="input-duration"
                autoFocus
              />
            </div>
          )}
        </motion.div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSuccess}
            className="w-full"
            size="lg"
            data-testid="button-submit-checkin"
          >
            Submit Progress
          </Button>
          <Button
            onClick={handleDefeat}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-defeat"
          >
            I didn't complete this
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
