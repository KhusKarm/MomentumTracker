import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "default" | "success" | "warning";
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  variant = "default",
}: MetricCardProps) {
  const colorClass = {
    default: "text-primary",
    success: "text-primary",
    warning: "text-destructive",
  }[variant];

  return (
    <Card className="p-6 hover-elevate" data-testid={`card-metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex flex-col items-center text-center gap-3">
        <Icon className={`h-8 w-8 ${colorClass}`} data-testid="icon-metric" />
        <motion.div
          className={`text-5xl font-bold font-mono ${colorClass}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          data-testid="text-metric-value"
        >
          {value}
        </motion.div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground" data-testid="text-metric-label">
            {label}
          </div>
          {sublabel && (
            <div className="text-xs text-muted-foreground" data-testid="text-metric-sublabel">
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
