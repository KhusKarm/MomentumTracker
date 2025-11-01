import ActiveTaskDisplay from '../ActiveTaskDisplay';

export default function ActiveTaskDisplayExample() {
  return (
    <ActiveTaskDisplay
      taskName="Coding Practice"
      category="Study"
      metricType="duration"
      target={45}
      progress={65}
      streak={7}
      nextCheckinMinutes={25}
      onStartTimer={() => console.log('Start timer clicked')}
    />
  );
}
