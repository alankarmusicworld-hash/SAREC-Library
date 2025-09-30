
"use client";

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { DataTable } from './components/data-table';
import { pendingColumns, unpaidColumns, paidColumns } from './components/columns';
import { borrowingHistory, Book, User, Fine } from '@/lib/data';
import { books, users, fines as initialFines } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationProvider';

export type EnrichedFine = Fine & {
  book?: Book;
  user?: User;
  dueDate: string;
};

// This function can be expanded to fetch real data
function getEnrichedFines(): EnrichedFine[] {
  return initialFines.map((fine) => {
    const book = books.find((b) => b.id === fine.bookId);
    const user = users.find((u) => u.id === fine.userId);
    const history = borrowingHistory.find(h => h.bookId === fine.bookId && h.userId === fine.userId);
    return { 
        ...fine, 
        book, 
        user,
        dueDate: history?.dueDate || 'N/A'
    };
  });
}

type FineStatus = 'pending-verification' | 'unpaid' | 'paid';

export default function ManageFinesPage() {
  const [allFines, setAllFines] = useState<EnrichedFine[]>(getEnrichedFines);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FineStatus>('pending-verification');
  const { toast } = useToast();
  const { addNotification } = useNotifications();


  const filteredFines = useMemo(() => {
    let filtered = allFines;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter((fine) =>
            (fine.user?.name.toLowerCase().includes(lowercasedQuery)) ||
            (fine.book?.title.toLowerCase().includes(lowercasedQuery))
        );
    }
    
    return filtered.filter(fine => fine.status === activeTab);
  }, [searchQuery, allFines, activeTab]);

  const handleVerifyPayment = (fineId: string, verifierRole: 'admin' | 'librarian') => {
    setAllFines(prev => 
      prev.map(f => 
        f.id === fineId 
          ? { 
              ...f, 
              status: 'paid', 
              paymentDate: new Date().toISOString().split('T')[0],
              verifiedBy: verifierRole 
            } 
          : f
      )
    );
    const fine = allFines.find(f => f.id === fineId);
    if(fine && fine.user) {
        // In a real app, this notification would be pushed to the specific user.
        addNotification(`Your fine of ₹${fine.amount} for "${fine.book?.title}" has been verified.`);
    }
  };

  const getTabCount = (status: FineStatus) => {
    return allFines.filter(fine => fine.status === status).length;
  }

  const columnsMap = {
    'pending-verification': pendingColumns({ onVerify: handleVerifyPayment }),
    'unpaid': unpaidColumns(),
    'paid': paidColumns(),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Fines</CardTitle>
        <CardDescription>
          View and manage all outstanding and paid fines. Verify pending payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FineStatus)}>
            <div className="flex items-center justify-between gap-4 mb-4">
                <TabsList>
                    <TabsTrigger value="pending-verification">Pending Verification ({getTabCount('pending-verification')})</TabsTrigger>
                    <TabsTrigger value="unpaid">Unpaid ({getTabCount('unpaid')})</TabsTrigger>
                    <TabsTrigger value="paid">Paid ({getTabCount('paid')})</TabsTrigger>
                </TabsList>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by student, book..."
                    className="pl-10 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <TabsContent value={activeTab}>
                 <DataTable columns={columnsMap[activeTab]} data={filteredFines} category={activeTab} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
