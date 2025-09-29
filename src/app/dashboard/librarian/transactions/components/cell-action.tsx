
"use client";

import { Button } from '@/components/ui/button';
import { EnrichedTransaction } from '../page';

interface CellActionProps {
  data: EnrichedTransaction;
  onMarkAsReturned: (transactionId: string) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onMarkAsReturned }) => {
  const isReturned = data.status === 'returned';

  return (
    <div className="text-right">
        <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMarkAsReturned(data.id)}
            disabled={isReturned}
        >
            {isReturned ? 'Returned' : 'Mark Returned'}
        </Button>
    </div>
  );
};
