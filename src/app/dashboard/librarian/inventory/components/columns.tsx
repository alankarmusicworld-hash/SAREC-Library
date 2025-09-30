
"use client";

import { ColumnDef } from '@tanstack/react-table';
import { Book } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';

type ColumnsProps = {
  onBookUpdated: (updatedBook: Book) => void;
  onBookDeleted: (bookId: string) => void;
};

export const columns = ({ onBookUpdated, onBookDeleted }: ColumnsProps): ColumnDef<Book>[] => [
  {
    accessorKey: 'title',
    header: 'Book Title',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
      </div>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Author',
  },
  {
    accessorKey: 'publisher',
    header: 'Publication',
  },
  {
    accessorKey: 'isbn',
    header: 'ISBN',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'copies',
    header: 'Copies',
    cell: ({ row }) => {
        const copies = row.original.copies;
        if (!copies) return 'N/A';

        // Handle both "5/5" string format and plain numbers
        if (typeof copies === 'string' && copies.includes('/')) {
            const [available, total] = copies.split('/').map(Number);
            return (
                <Badge variant={available > 0 ? 'secondary' : 'destructive'}>
                    {copies}
                </Badge>
            );
        }

        // If it's a number or a string without '/', just display it.
        // You could add more sophisticated logic here if needed.
        const numericCopies = Number(copies);
        return (
             <Badge variant={numericCopies > 0 ? 'secondary' : 'destructive'}>
                {copies}
            </Badge>
        )
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <CellAction
        data={row.original}
        onBookUpdated={onBookUpdated}
        onBookDeleted={onBookDeleted}
      />
    ),
  },
];
