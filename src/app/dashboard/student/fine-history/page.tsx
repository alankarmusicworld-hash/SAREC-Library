
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
import { Badge } from '@/components/ui/badge';
import { IndianRupee, HandCoins, Landmark } from 'lucide-react';

type EnrichedFine = Fine & { book: Book | undefined };

export default function FineHistoryPage() {
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
    const finesQuery = query(collection(db, 'fines'), where('userId', '==', userId));
    
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
        
        setUserFines(enrichedFines.sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()));
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const totalUnpaid = userFines
    .filter(f => f.status === 'unpaid' || f.status === 'pending-verification')
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
                    <div className={`text-2xl font-bold ${totalUnpaid > 0 ? 'text-destructive' : ''}`}>₹{totalUnpaid.toFixed(2)}</div>
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
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">Loading fine history...</TableCell>
                        </TableRow>
                    ) : userFines.length > 0 ? (
                        userFines.map((fine) => (
                        <TableRow key={fine.id}>
                            <TableCell className="font-medium">
                                {fine.book?.title || 'N/A'}
                            </TableCell>
                            <TableCell>{fine.reason}</TableCell>
                            <TableCell>{fine.dateIssued}</TableCell>
                            <TableCell>₹{fine.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={fine.status === 'paid' ? 'secondary' : (fine.status === 'pending-verification' ? 'default' : 'destructive')}>
                                    {fine.status.charAt(0).toUpperCase() + fine.status.slice(1).replace('-', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {fine.status === 'paid' ? (
                                <div className="flex flex-col gap-1 text-xs">
                                     <div className="flex items-center gap-2 capitalize">
                                        {fine.paymentMethod === 'online' 
                                            ? <Landmark className="h-3 w-3" /> 
                                            : <HandCoins className="h-3 w-3" />}
                                        <span>Paid via {fine.paymentMethod} on {fine.paymentDate}</span>
                                     </div>
                                    <span className="text-muted-foreground capitalize">
                                        Verified by {fine.verifiedBy}
                                    </span>
                                </div>
                                ) : fine.status === 'pending-verification' ? (
                                <div className="flex items-center gap-2 text-xs capitalize">
                                    {fine.paymentMethod === 'online' 
                                        ? <Landmark className="h-3 w-3" /> 
                                        : <HandCoins className="h-3 w-3" />}
                                    <span>{fine.paymentMethod} payment pending</span>
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
