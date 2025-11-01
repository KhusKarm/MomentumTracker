import ProgressRing from '../ProgressRing';

export default function ProgressRingExample() {
  return (
    <ProgressRing 
      progress={65} 
      label="Next Check-in"
      sublabel="25 min remaining"
    />
  );
}
