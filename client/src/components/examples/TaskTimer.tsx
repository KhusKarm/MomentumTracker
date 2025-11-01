import TaskTimer from '../TaskTimer';

export default function TaskTimerExample() {
  return (
    <TaskTimer 
      taskName="Code Practice" 
      onStop={(duration) => console.log('Timer stopped at', duration, 'seconds')}
    />
  );
}
