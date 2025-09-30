
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
import { Book, User, BorrowingHistory } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const historyCollectionRef = collection(db, 'borrowingHistory');
    
    const unsubscribe = onSnapshot(historyCollectionRef, async (querySnapshot) => {
        const historyData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BorrowingHistory));

        const enrichedData = await getEnrichedTransactions(historyData);
        setAllTransactions(enrichedData);
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
  }, [toast]);


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
    const transactionRef = doc(db, 'borrowingHistory', transactionId);
    try {
        await updateDoc(transactionRef, {
            status: 'returned',
            returnDate: new Date().toISOString().split('T')[0]
        });
        toast({
            title: "Success",
            description: "Book has been marked as returned."
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
          Track all currently issued books and manage returns.
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
