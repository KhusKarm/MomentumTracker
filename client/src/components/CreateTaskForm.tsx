import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Clock, Hash } from "lucide-react";

interface CreateTaskFormProps {
  onSubmit: (task: {
    name: string;
    category: string;
    metricType: "duration" | "count";
    target: number;
    interval: number;
  }) => void;
  onCancel?: () => void;
}

export default function CreateTaskForm({ onSubmit, onCancel }: CreateTaskFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [metricType, setMetricType] = useState<"duration" | "count">("duration");
  const [target, setTarget] = useState("");
  const [interval, setInterval] = useState("60");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      category,
      metricType,
      target: parseInt(target),
      interval: parseInt(interval),
    });
    setName("");
    setCategory("");
    setTarget("");
  };

  const intervalOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" },
    { value: "240", label: "4 hours" },
    { value: "360", label: "6 hours" },
    { value: "480", label: "8 hours" },
    { value: "720", label: "12 hours" },
    { value: "1440", label: "24 hours" },
  ];

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="task-name">Task Name</Label>
          <Input
            id="task-name"
            placeholder="e.g., Push-ups, Coding Practice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-testid="input-task-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="e.g., Exercise, Study, Personal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            data-testid="input-category"
          />
        </div>

        <div className="space-y-2">
          <Label>Metric Type</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={metricType === "duration" ? "default" : "outline"}
              onClick={() => setMetricType("duration")}
              className="w-full"
              data-testid="button-metric-duration"
            >
              <Clock className="h-4 w-4 mr-2" />
              Duration
            </Button>
            <Button
              type="button"
              variant={metricType === "count" ? "default" : "outline"}
              onClick={() => setMetricType("count")}
              className="w-full"
              data-testid="button-metric-count"
            >
              <Hash className="h-4 w-4 mr-2" />
              Count
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">
            Target {metricType === "duration" ? "(minutes)" : "(count)"}
          </Label>
          <Input
            id="target"
            type="number"
            placeholder={metricType === "duration" ? "30" : "20"}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
            min="1"
            data-testid="input-target"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval">Check-in Interval</Label>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger id="interval" data-testid="select-interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {intervalOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" data-testid="button-create-task">
            Create Task
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
