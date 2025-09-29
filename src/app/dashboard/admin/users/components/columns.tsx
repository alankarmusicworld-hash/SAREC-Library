
"use client";

import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const columns: ColumnDef<User>[] = [
  {
    id: 'srNo',
    header: 'Sr. No.',
    cell: ({ row, table }) => {
      const rowIndex = table.getSortedRowModel().rows.findIndex(sortedRow => sortedRow.id === row.id);
      return <span>{rowIndex + 1}</span>;
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback>
            {row.original.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.enrollment}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'year',
    header: 'Year',
  },
    {
    accessorKey: 'semester',
    header: 'Semester',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const variant = {
        admin: 'destructive',
        librarian: 'default',
        student: 'secondary',
      }[role] as 'default' | 'destructive' | 'secondary' | 'outline' | null | undefined;

      return (
        <Badge variant={variant}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      );
    },
  },
    {
    accessorKey: 'booksIssued',
    header: 'Books Issued',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
