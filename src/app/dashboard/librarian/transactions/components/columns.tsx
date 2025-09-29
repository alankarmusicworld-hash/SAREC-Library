
"use client";

import { ColumnDef } from '@tanstack/react-table';
import { EnrichedTransaction } from '../page';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import { isAfter } from 'date-fns';

type ColumnsProps = {
  handleMarkAsReturned: (transactionId: string) => void;
};


export const columns = ({ handleMarkAsReturned }: ColumnsProps): ColumnDef<EnrichedTransaction>[] => [
  {
    accessorKey: 'book.title',
    header: 'Book Title',
    cell: ({ row }) => {
        const book = row.original.book;
        return (
            <div>
                <div className="font-medium">{book?.title || 'N/A'}</div>
            </div>
        );
    },
  },
  {
    accessorKey: 'book.author',
    header: 'Author',
     cell: ({ row }) => row.original.book?.author || 'N/A',
  },
  {
    accessorKey: 'book.isbn',
    header: 'ISBN',
    cell: ({ row }) => row.original.book?.isbn || 'N/A',
  },
  {
    accessorKey: 'user.name',
    header: 'Student',
     cell: ({ row }) => {
        const user = row.original.user;
        return (
            <div>
                <div className="font-medium">{user?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{user?.enrollment || ''}</div>
            </div>
        );
    }
  },
  {
    accessorKey: 'checkoutDate',
    header: 'Issue Date',
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      let status: 'issued' | 'overdue' | 'returned' = row.original.status;
      const dueDate = new Date(row.original.dueDate);
      const returnDate = row.original.returnDate ? new Date(row.original.returnDate) : null;
      
      if (status === 'issued' && isAfter(new Date(), dueDate)) {
          status = 'overdue';
      }
      
      const variant = {
        overdue: 'destructive',
        issued: 'outline',
        returned: 'secondary',
      }[status] as 'destructive' | 'outline' | 'secondary';

      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <CellAction data={row.original} onMarkAsReturned={handleMarkAsReturned} />
    ),
  },
];
