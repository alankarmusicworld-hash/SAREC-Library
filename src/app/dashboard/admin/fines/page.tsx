
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
import { Book, User, Fine } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationProvider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';


export type EnrichedFine = Fine & {
  book?: Book;
  user?: User;
  dueDate: string;
};

async function fetchReferencedData(finesData: Fine[]): Promise<EnrichedFine[]> {
    const enrichedFines: EnrichedFine[] = [];

    for (const fine of finesData) {
        let book: Book | undefined = undefined;
        let user: User | undefined = undefined;
        let dueDate: string = 'N/A';

        if(fine.bookId) {
            const bookDoc = await getDoc(doc(db, "books", fine.bookId));
            if(bookDoc.exists()) book = { id: bookDoc.id, ...bookDoc.data() } as Book;
        }

        if(fine.userId) {
            const userDoc = await getDoc(doc(db, "users", fine.userId));
            if(userDoc.exists()) user = { id: userDoc.id, ...userDoc.data() } as User;
        }
        
        // This is a simplification. A real app would query the borrowing history.
        // For now, we'll keep it as N/A or a placeholder.
        
        enrichedFines.push({ ...fine, book, user, dueDate });
    }
    return enrichedFines;
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
    const finesCollectionRef = collection(db, 'fines');
    const unsubscribe = onSnapshot(finesCollectionRef, async (querySnapshot) => {
        const finesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Fine));

        const enrichedData = await fetchReferencedData(finesData);
        setAllFines(enrichedData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching fines: ", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load fines from the database.",
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


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

  const handleVerifyPayment = async (fineId: string, verifierRole: 'admin' | 'librarian') => {
    const fineRef = doc(db, 'fines', fineId);
    try {
        await updateDoc(fineRef, {
            status: 'paid',
            paymentDate: new Date().toISOString().split('T')[0],
            verifiedBy: verifierRole
        });
        
        const fine = allFines.find(f => f.id === fineId);
        if(fine && fine.user && fine.user.id) {
            addNotification(`Your fine of ₹${fine.amount} for "${fine.book?.title}" has been verified.`, fine.user.id);
            // This toast is for the admin/librarian
            toast({
                title: 'Payment Verified',
                description: `Fine for student ${fine.user.name} has been marked as paid.`
            });
        }
    } catch (error) {
        console.error("Error verifying payment: ", error);
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'Could not update the fine status in the database.'
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
