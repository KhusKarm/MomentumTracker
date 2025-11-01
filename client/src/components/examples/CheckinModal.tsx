import { useState } from 'react';
import CheckinModal from '../CheckinModal';
import { Button } from '@/components/ui/button';

export default function CheckinModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Check-in Modal</Button>
      <CheckinModal
        open={open}
        onOpenChange={setOpen}
        taskName="Push-ups"
        metricType="count"
        targetValue={30}
        onSuccess={(value) => console.log('Success with value:', value)}
        onDefeat={() => console.log('Defeat logged')}
      />
    </div>
  );
}
