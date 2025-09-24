"use client";

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { Book } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Book>[] = [
  {
    accessorKey: 'coverImageUrl',
    header: 'Cover',
    cell: ({ row }) => (
      <Image
        src={row.getValue('coverImageUrl')}
        alt={row.original.title}
        width={40}
        height={60}
        className="rounded-sm"
        data-ai-hint="book cover"
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title & Author',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.author}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'isbn',
    header: 'ISBN',
  },
  {
    accessorKey: 'publicationDate',
    header: 'Published',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'available' ? 'secondary' : 'outline';

      return (
        <Badge variant={variant}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
