
"use client";

import { Button } from '@/components/ui/button';
import { EnrichedFine } from '../page';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, MoreHorizontal } from 'lucide-react';

interface CellActionProps {
  data: EnrichedFine;
  onVerify: (fineId: string, verifierRole: 'admin' | 'librarian') => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onVerify }) => {
  const { toast } = useToast();
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') as 'admin' | 'librarian' : 'librarian';

  const handleVerify = () => {
    onVerify(data.id, userRole);
    toast({
        title: "Payment Verified",
        description: `Fine for "${data.book?.title}" for student ${data.user?.name} has been marked as paid.`
    })
  };

  if (data.status === 'pending-verification') {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleVerify} className="cursor-pointer">
                    <Check className="mr-2 h-4 w-4" />
                    Verify Payment
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }

  return null;
};
