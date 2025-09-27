
"use client";

import { useEffect, useState } from 'react';
import { books, fines, Book, Fine } from '@/lib/data';
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
import { Button } from '@/components/ui/button';
import { IndianRupee } from 'lucide-react';

type EnrichedFine = Fine & { book: Book | undefined };

export default function FinesPage() {
  const [userFines, setUserFines] = useState<EnrichedFine[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you'd get the logged-in user's ID
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);

    if (storedUserId) {
      const enrichedFines = fines
        .filter((fine) => fine.userId === storedUserId && fine.status === 'unpaid')
        .map((fine) => ({
          ...fine,
          book: books.find((b) => b.id === fine.bookId),
        }));
      setUserFines(enrichedFines);
    }
  }, []);

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
        {userFines.length > 0 ? (
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
