
"use client";

import { ColumnDef } from '@tanstack/react-table';
import { EnrichedFine } from '../page';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HandCoins, Landmark } from 'lucide-react';

type ColumnsProps = {
  onVerify: (fineId: string, verifierRole: 'admin' | 'librarian') => void;
};

const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const sharedColumns: ColumnDef<EnrichedFine>[] = [
    {
      id: 'srNo',
      header: 'Sr. No.',
      cell: ({ row, table }) => {
        const sortedRows = table.getSortedRowModel().rows;
        const rowIndex = sortedRows.findIndex(sortedRow => sortedRow.id === row.id);
        return <span>{rowIndex + 1}</span>;
      },
    },
    {
        accessorKey: 'user',
        header: 'Student',
        cell: ({ row }) => {
            const user = row.original.user;
            return (
                 <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name} />
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{user?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{user?.enrollment}</div>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: 'book',
        header: 'Book Title',
        cell: ({ row }) => {
            const book = row.original.book;
            return (
                <div>
                    <div>{book?.title || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{book?.isbn}</div>
                </div>
            )
        }
    },
     {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => format(new Date(row.original.dueDate), 'dd/MM/yyyy')
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => `₹${row.original.amount.toFixed(2)}`
    },
]

export const pendingColumns = ({ onVerify }: ColumnsProps): ColumnDef<EnrichedFine>[] => [
    ...sharedColumns,
    {
        accessorKey: 'paymentMethod',
        header: 'Method',
        cell: ({ row }) => (
            <div className="capitalize flex items-center gap-2">
                {row.original.paymentMethod === 'online' ? <Landmark className="h-4 w-4 text-muted-foreground" /> : <HandCoins className="h-4 w-4 text-muted-foreground" />}
                {row.original.paymentMethod}
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Status / Action',
        cell: ({ row }) => <CellAction data={row.original} onVerify={onVerify} />,
    },
];

export const unpaidColumns = (): ColumnDef<EnrichedFine>[] => [
    ...sharedColumns,
    {
        accessorKey: 'reason',
        header: 'Reason',
    },
    {
        header: 'Status',
        cell: () => <Badge variant="destructive">Unpaid</Badge>
    }
];

export const paidColumns = (): ColumnDef<EnrichedFine>[] => [
    ...sharedColumns,
    {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ row }) => (
            <div className="capitalize flex items-center gap-2">
                {row.original.paymentMethod === 'online' ? <Landmark className="h-4 w-4 text-muted-foreground" /> : <HandCoins className="h-4 w-4 text-muted-foreground" />}
                {row.original.paymentMethod}
            </div>
        )
    },
    {
        accessorKey: 'paymentDate',
        header: 'Payment Date',
        cell: ({ row }) => row.original.paymentDate ? format(new Date(row.original.paymentDate), 'dd/MM/yyyy') : 'N/A'
    },
    {
        accessorKey: 'verifiedBy',
        header: 'Verified By',
        cell: ({ row }) => (
             <Badge variant="secondary" className="capitalize">{row.original.verifiedBy}</Badge>
        )
    },
]
