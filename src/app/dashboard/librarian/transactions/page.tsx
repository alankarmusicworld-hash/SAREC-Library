
'use client';

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
import { columns } from './components/columns';
import { Book, User, BorrowingHistory, Fine } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, increment, writeBatch, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationProvider';
import { differenceInDays, isAfter } from 'date-fns';


export type EnrichedTransaction = BorrowingHistory & {
  book?: Book;
  user?: User;
};

// This function fetches referenced book and user data for transactions
async function getEnrichedTransactions(transactions: BorrowingHistory[]): Promise<EnrichedTransaction[]> {
  const enrichedTransactions: EnrichedTransaction[] = [];

  for (const transaction of transactions) {
    let book: Book | undefined = undefined;
    let user: User | undefined = undefined;
    
    if (transaction.bookId) {
        const bookDoc = await getDoc(doc(db, "books", transaction.bookId));
        if (bookDoc.exists()) {
            book = { id: bookDoc.id, ...bookDoc.data() } as Book;
        }
    }

    if (transaction.userId) {
        const userDoc = await getDoc(doc(db, "users", transaction.userId));
        if(userDoc.exists()) {
            user = { id: userDoc.id, ...userDoc.data() } as User;
        }
    }
    
    enrichedTransactions.push({ ...transaction, book, user });
  }

  return enrichedTransactions;
}


export default function TransactionPage() {
  const [allTransactions, setAllTransactions] = useState<EnrichedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [librarySettings, setLibrarySettings] = useState({ fineRate: '5' });
  const { toast } = useToast();
  const { addNotification } = useNotifications();


  useEffect(() => {
    const fetchSettings = async () => {
      const settingsRef = doc(db, 'settings', 'libraryConfig');
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        setLibrarySettings(docSnap.data() as { fineRate: string });
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!librarySettings.fineRate) return;

    setIsLoading(true);
    const historyCollectionRef = collection(db, 'borrowingHistory');
    
    const unsubscribe = onSnapshot(historyCollectionRef, async (querySnapshot) => {
        const historyData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BorrowingHistory));

        const enrichedData = await getEnrichedTransactions(historyData);
        setAllTransactions(enrichedData);
        
        // --- Automatic Fine Generation Logic ---
        const finesRef = collection(db, 'fines');
        const fineRate = parseFloat(librarySettings.fineRate) || 5;

        for (const transaction of enrichedData) {
            if (transaction.status === 'issued' && isAfter(new Date(), new Date(transaction.dueDate))) {
                const daysOverdue = differenceInDays(new Date(), new Date(transaction.dueDate));
                if (daysOverdue > 0) {
                    // Check if an unpaid fine already exists for this book and user
                    const q = query(finesRef, 
                        where('userId', '==', transaction.userId), 
                        where('bookId', '==', transaction.bookId),
                        where('status', '==', 'unpaid')
                    );
                    const existingFines = await getDocs(q);

                    if (existingFines.empty) {
                        // No unpaid fine exists, so create one.
                        const newFine: Omit<Fine, 'id'> = {
                            userId: transaction.userId,
                            bookId: transaction.bookId,
                            amount: daysOverdue * fineRate,
                            reason: 'Late Return',
                            dateIssued: new Date().toISOString().split('T')[0],
                            status: 'unpaid',
                        };
                        await addDoc(finesRef, newFine);
                        if (transaction.user?.id) {
                           addNotification(
                            `A fine of ₹${newFine.amount.toFixed(2)} has been issued for the late return of "${transaction.book?.title}".`,
                            transaction.user.id
                           );
                        }
                    }
                }
            }
        }
        // --- End of Fine Generation Logic ---

        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching transactions: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch transaction data.",
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast, librarySettings, addNotification]);


  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return allTransactions;

    const lowercasedQuery = searchQuery.toLowerCase();
    return allTransactions.filter((transaction) => {
      const bookTitle = transaction.book?.title.toLowerCase() || '';
      const author = transaction.book?.author.toLowerCase() || '';
      const studentName = transaction.user?.name.toLowerCase() || '';
      const isbn = transaction.book?.isbn.toLowerCase() || '';
      
      return (
        bookTitle.includes(lowercasedQuery) ||
        author.includes(lowercasedQuery) ||
        studentName.includes(lowercasedQuery) ||
        isbn.includes(lowercasedQuery)
      );
    });
  }, [searchQuery, allTransactions]);
  
  const handleMarkAsReturned = async (transactionId: string) => {
    const transaction = allTransactions.find(t => t.id === transactionId);
    if (!transaction || !transaction.book || !transaction.user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Transaction details not found.' });
        return;
    }

    const { book, user } = transaction;
    
    let available, total;
    if (typeof book.copies === 'string' && book.copies.includes('/')) {
        [available, total] = book.copies.split('/').map(Number);
    } else {
        // Fallback for older data format
        const numCopies = Number(book.copies) || 0;
        available = numCopies; // Assume all were available if format is wrong
        total = numCopies;
    }

    const batch = writeBatch(db);

    // 1. Update transaction status
    const transactionRef = doc(db, 'borrowingHistory', transactionId);
    batch.update(transactionRef, {
        status: 'returned',
        returnDate: new Date().toISOString().split('T')[0]
    });
    
    // 2. Update book copy count
    const bookRef = doc(db, 'books', book.id!);
    if (available < total) { // Only increment if not already at max
        const newCopies = `${available + 1}/${total}`;
        batch.update(bookRef, { copies: newCopies, status: 'available' });
    }

    // 3. Update user's issued count
    const userRef = doc(db, 'users', user.id);
    batch.update(userRef, { booksIssued: increment(-1) });

    try {
        await batch.commit();

        addNotification(`Your book "${book.title}" has been successfully returned.`, user.id);

        toast({
            title: "Success",
            description: `"${book.title}" has been marked as returned.`
        });
    } catch (error) {
        console.error("Error marking as returned: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update the transaction status."
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues & Returns</CardTitle>
        <CardDescription>
          Track all currently issued books and manage returns. Overdue books automatically generate fines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by book, author, student, or ISBN..."
              className="pl-10 h-11 max-w-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
            <div className="text-center p-8">Loading transactions...</div>
        ) : (
            <DataTable columns={columns({ handleMarkAsReturned })} data={filteredTransactions} />
        )}
      </CardContent>
    </Card>
  );
}
