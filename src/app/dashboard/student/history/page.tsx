
"use client";

import { useEffect, useState } from 'react';
import { Book, BorrowingHistory } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isAfter } from 'date-fns';

type EnrichedHistory = BorrowingHistory & { book: Book | undefined };

export default function HistoryPage() {
  const [history, setHistory] = useState<EnrichedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const historyQuery = query(collection(db, 'borrowingHistory'), where('userId', '==', userId));
    
    const unsubscribe = onSnapshot(historyQuery, async (querySnapshot) => {
      const historyItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as BorrowingHistory));

      const enrichedHistory: EnrichedHistory[] = await Promise.all(
        historyItems.map(async (historyItem) => {
          let book: Book | undefined = undefined;
          if (historyItem.bookId) {
            const bookDocRef = doc(db, 'books', historyItem.bookId);
            const bookDoc = await getDoc(bookDocRef);
            if (bookDoc.exists()) {
              book = { id: bookDoc.id, ...bookDoc.data() } as Book;
            }
          }
          return { ...historyItem, book };
        })
      );
      
      setHistory(enrichedHistory.sort((a,b) => new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime()));
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching history: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);


  const currentlyIssued = history.filter((item) => !item.returnDate);
  const fullHistory = history;

  const renderHistoryTable = (items: EnrichedHistory[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book Title</TableHead>
            <TableHead>Checkout Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Loading history...</TableCell>
            </TableRow>
          ) : items.length > 0 ? (
            items.map((item) => {
              const isOverdue = !item.returnDate && isAfter(new Date(), new Date(item.dueDate));
              
              let statusText = `Returned on ${item.returnDate}`;
              let statusVariant: 'secondary' | 'outline' | 'destructive' = 'secondary';
              
              if (!item.returnDate) {
                  if (isOverdue) {
                      statusText = 'Overdue';
                      statusVariant = 'destructive';
                  } else {
                      statusText = 'Issued';
                      statusVariant = 'outline';
                  }
              }

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.book?.title || 'Unknown Book'}
                  </TableCell>
                  <TableCell>{item.checkoutDate}</TableCell>
                  <TableCell>{item.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant}>
                      {statusText}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Books</CardTitle>
        <CardDescription>
          View your currently issued books and your complete borrowing history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Currently Issued</TabsTrigger>
            <TabsTrigger value="history">Borrowing History</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="mt-4">
            {renderHistoryTable(currentlyIssued)}
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            {renderHistoryTable(fullHistory)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
