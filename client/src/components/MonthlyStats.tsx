import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyStatsProps {
  taskName: string;
  metricType: "duration" | "count";
  data: Array<{
    date: string;
    value: number;
  }>;
}

export default function MonthlyStats({ taskName, metricType, data }: MonthlyStatsProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6" data-testid="card-monthly-stats">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground" data-testid="text-stats-title">
            {taskName} - Monthly Summary
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-primary" data-testid="text-total-value">
              {totalValue}
            </span>
            <span className="text-muted-foreground">
              {metricType === "duration" ? "minutes total" : "total count"}
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
