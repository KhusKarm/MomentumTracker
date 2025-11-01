import MonthlyStats from '../MonthlyStats';

export default function MonthlyStatsExample() {
  const mockData = [
    { date: 'Week 1', value: 180 },
    { date: 'Week 2', value: 240 },
    { date: 'Week 3', value: 210 },
    { date: 'Week 4', value: 270 },
  ];

  return (
    <MonthlyStats
      taskName="Coding Practice"
      metricType="duration"
      data={mockData}
    />
  );
}
