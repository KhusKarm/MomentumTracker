import TaskCard from '../TaskCard';

export default function TaskCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <TaskCard
        name="Push-ups"
        category="Exercise"
        metricType="count"
        target={30}
        interval={120}
        streak={5}
        todayTotal={50}
        onStart={() => console.log('Start Push-ups session')}
      />
      <TaskCard
        name="Coding Practice"
        category="Study"
        metricType="duration"
        target={45}
        interval={90}
        streak={3}
        todayTotal={60}
        onStart={() => console.log('Start Coding session')}
      />
    </div>
  );
}
