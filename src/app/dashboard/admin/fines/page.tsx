
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { Book, User, Fine, books, users, fines } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationProvider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';


export type EnrichedFine = Fine & {
  book?: Book;
  user?: User;
};

// This function now enriches the static data
function enrichFines(finesData: Fine[]): EnrichedFine[] {
    return finesData.map(fine => ({
        ...fine,
        book: books.find(b => b.id === fine.bookId),
        user: users.find(u => u.id === fine.userId),
    }));
}


type FineStatus = 'pending-verification' | 'unpaid' | 'paid';

export default function ManageFinesPage() {
  const [allFines, setAllFines] = useState<EnrichedFine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FineStatus>('pending-verification');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { addNotification } = useNotifications();


  useEffect(() => {
    setIsLoading(true);
    // Use the static data from data.ts instead of Firestore
    const enrichedData = enrichFines(fines);
    setAllFines(enrichedData);
    setIsLoading(false);
  }, []);


  const filteredFines = useMemo(() => {
    let filtered = allFines;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter((fine) =>
            (fine.user?.name?.toLowerCase().includes(lowercasedQuery)) ||
            (fine.book?.title?.toLowerCase().includes(lowercasedQuery))
        );
    }
    
    return filtered.filter(fine => fine.status === activeTab);
  }, [searchQuery, allFines, activeTab]);

  const handleVerifyPayment = async (fineId: string, verifierRole: 'admin' | 'librarian') => {
    // This function will now update the local state for demonstration
    setAllFines(prevFines => {
        const newFines = prevFines.map(f => {
            if (f.id === fineId) {
                const fine = allFines.find(f => f.id === fineId);
                 if(fine && fine.user && fine.user.id) {
                    addNotification(`Your fine of ₹${fine.amount} for "${fine.book?.title}" has been verified.`, fine.user.id);
                 }
                return { ...f, status: 'paid', paymentDate: new Date().toISOString().split('T')[0], verifiedBy: verifierRole };
            }
            return f;
        });
        return newFines;
    });

    const fine = allFines.find(f => f.id === fineId);
    if (fine && fine.user) {
        toast({
            title: 'Payment Verified',
            description: `Fine for student ${fine.user.name} has been marked as paid.`
        });
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
  
  const renderDataTable = () => {
      if (isLoading) {
          return <div className="text-center p-8">Loading fines...</div>;
      }
      return <DataTable columns={columnsMap[activeTab]} data={filteredFines} category={activeTab} />;
  }

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
            <TabsContent value="pending-verification">
                 {renderDataTable()}
            </TabsContent>
            <TabsContent value="unpaid">
                 {renderDataTable()}
            </TabsContent>
            <TabsContent value="paid">
                 {renderDataTable()}
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
