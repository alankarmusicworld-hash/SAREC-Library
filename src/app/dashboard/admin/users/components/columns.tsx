"use client";

import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
            <AvatarImage src={`https://i.pravatar.cc/40?u=${row.original.email}`} alt={row.original.name} />
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
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
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
