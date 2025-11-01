import { useState } from 'react';
import ReplayModal from '../ReplayModal';
import { Button } from '@/components/ui/button';

export default function ReplayModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="destructive">Open Replay Modal</Button>
      <ReplayModal
        open={open}
        onOpenChange={setOpen}
        taskName="Coding Practice"
        metricType="duration"
        originalTarget={30}
        onCommit={(goal) => console.log('Replay committed with goal:', goal)}
        onSkip={() => console.log('Replay skipped')}
      />
    </div>
  );
}
