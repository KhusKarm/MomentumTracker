import MetricCard from '../MetricCard';
import { Flame, Target, TrendingUp } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        icon={Flame}
        label="Current Streak"
        value="7"
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
  );
}
