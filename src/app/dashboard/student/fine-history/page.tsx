
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
import { IndianRupee, HandCoins, Landmark } from 'lucide-react';

type EnrichedFine = Fine & { book: Book | undefined };

export default function FineHistoryPage() {
  const [userFines, setUserFines] = useState<EnrichedFine[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you'd get the logged-in user's ID
    const storedUserId = localStorage.getItem('userId') || '3'; // Default to user '3' for demo
    setUserId(storedUserId);

    if (storedUserId) {
      const enrichedFines = fines
        .filter((fine) => fine.userId === storedUserId)
        .map((fine) => ({
          ...fine,
          book: books.find((b) => b.id === fine.bookId),
        }))
        .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());
      setUserFines(enrichedFines);
    }
  }, []);

  const totalUnpaid = userFines
    .filter(f => f.status === 'unpaid')
    .reduce((acc, fine) => acc + fine.amount, 0);

  const totalPaid = userFines
    .filter(f => f.status === 'paid')
    .reduce((acc, fine) => acc + fine.amount, 0);

  return (
    <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Current Dues
                    </CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">₹{totalUnpaid.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                        Total outstanding fine amount
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Fines Paid
                    </CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalPaid.toFixed(2)}</div>
                     <p className="text-xs text-muted-foreground">
                        Total fines cleared to date
                    </p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Complete Fine History</CardTitle>
                <CardDescription>
                A log of all fines issued to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date Issued</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Details</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {userFines.length > 0 ? (
                        userFines.map((fine) => (
                        <TableRow key={fine.id}>
                            <TableCell className="font-medium">
                                {fine.book?.title || 'N/A'}
                            </TableCell>
                            <TableCell>{fine.reason}</TableCell>
                            <TableCell>{fine.dateIssued}</TableCell>
                            <TableCell>₹{fine.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={fine.status === 'paid' ? 'secondary' : 'destructive'}>
                                    {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {fine.status === 'paid' ? (
                                <div className="flex flex-col gap-1 text-xs">
                                     <div className="flex items-center gap-2">
                                        {fine.paymentMethod === 'online' 
                                            ? <Landmark className="h-3 w-3" /> 
                                            : <HandCoins className="h-3 w-3" />}
                                        <span>Paid via {fine.paymentMethod} on {fine.paymentDate}</span>
                                     </div>
                                    <span className="text-muted-foreground">
                                        Verified by {fine.verifiedBy}
                                    </span>
                                </div>
                                ) : (
                                <span className="text-xs text-muted-foreground">Pending Payment</span>
                                )}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No fine history found.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
