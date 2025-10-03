
"use client";

import { useEffect, useState } from 'react';
import { Book, Fine } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { IndianRupee } from 'lucide-react';

type EnrichedFine = Fine & { book: Book | undefined };

export default function FinesPage() {
  const [userFines, setUserFines] = useState<EnrichedFine[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const finesQuery = query(
      collection(db, 'fines'),
      where('userId', '==', userId),
      where('status', '==', 'unpaid')
    );

    const unsubscribe = onSnapshot(finesQuery, async (querySnapshot) => {
      const fetchedFines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fine));
      
      const enrichedFines: EnrichedFine[] = await Promise.all(
        fetchedFines.map(async (fine) => {
          let book: Book | undefined = undefined;
          if (fine.bookId) {
            const bookDoc = await getDoc(doc(db, 'books', fine.bookId));
            if (bookDoc.exists()) {
              book = { id: bookDoc.id, ...bookDoc.data() } as Book;
            }
          }
          return { ...fine, book };
        })
      );

      setUserFines(enrichedFines);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const totalFineAmount = userFines.reduce((acc, fine) => acc + fine.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Fines</CardTitle>
        <CardDescription>
          View and pay your outstanding library fines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center p-8">Loading your fines...</div>
        ) : userFines.length > 0 ? (
            <>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Book Title</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Date Issued</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {userFines.map((fine) => (
                            <TableRow key={fine.id}>
                            <TableCell className="font-medium">
                                {fine.book?.title || 'Unknown Book'}
                            </TableCell>
                            <TableCell>{fine.reason}</TableCell>
                            <TableCell>{fine.dateIssued}</TableCell>
                            <TableCell className="text-right">
                                ₹{fine.amount.toFixed(2)}
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-6 flex justify-end items-center gap-6 p-4 rounded-lg bg-muted">
                     <div>
                        <p className="text-lg font-semibold">Total Due</p>
                        <p className="text-2xl font-bold text-destructive">₹{totalFineAmount.toFixed(2)}</p>
                    </div>
                    <Button size="lg" className="gap-2">
                        <IndianRupee />
                        Pay Total Amount
                    </Button>
                </div>
            </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center h-64">
            <p className="text-muted-foreground">You have no outstanding fines. Great job!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
