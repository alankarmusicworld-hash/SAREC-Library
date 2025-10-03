
"use client";

import { useEffect, useState } from 'react';
import { Book, Fine } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDoc, doc, writeBatch } from 'firebase/firestore';
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
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { HandCoins, Landmark, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type EnrichedFine = Fine & { book: Book | undefined };

type LibrarySettings = {
  upiId?: string;
  qrCodeUrl?: string;
};


export default function FinesPage() {
  const [userFines, setUserFines] = useState<EnrichedFine[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'selection' | 'online' | 'cash'>('selection');
  const [settings, setSettings] = useState<LibrarySettings>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { addNotification } = useNotifications();


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
    
    async function fetchSettings() {
        const settingsRef = doc(db, 'settings', 'libraryConfig');
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
            setSettings(docSnap.data() as LibrarySettings);
        }
    }
    fetchSettings();
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
  
  const getReason = (fine: EnrichedFine) => {
      if (fine.reason === 'Late Return') {
          const daysOverdue = differenceInDays(new Date(), new Date(fine.dateIssued));
          return `Overdue by ${daysOverdue > 0 ? daysOverdue : 1} day(s)`;
      }
      return fine.reason;
  }

  const handlePayment = async (method: 'online' | 'cash') => {
      setIsSubmitting(true);
      const batch = writeBatch(db);

      userFines.forEach(fine => {
          const fineRef = doc(db, 'fines', fine.id);
          batch.update(fineRef, {
              status: 'pending-verification',
              paymentMethod: method,
          });
      });

      try {
        await batch.commit();
        
        // Notify admin - assuming 'admin' is a generic target for all admins/librarians
        addNotification(`New payment of ₹${totalFineAmount.toFixed(2)} is pending verification.`, 'admin');

        toast({
            title: 'Payment Submitted',
            description: `Your ${method} payment is now pending verification from the librarian.`
        });

        setIsDialogOpen(false);
        setPaymentStep('selection');

      } catch (error) {
          console.error("Error submitting payment: ", error);
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not submit your payment. Please try again.'
          });
      } finally {
          setIsSubmitting(false);
      }
  }

  const renderPaymentContent = () => {
    switch (paymentStep) {
        case 'online':
            return (
                <div>
                    <DialogHeader>
                        <DialogTitle>Online Payment</DialogTitle>
                        <DialogDescription>
                            Scan the QR code or use the UPI ID to pay ₹{totalFineAmount.toFixed(2)}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-6 flex flex-col items-center gap-4">
                        {settings.qrCodeUrl ? (
                             <div className="p-4 border rounded-lg bg-background">
                                <Image src={settings.qrCodeUrl} alt="UPI QR Code" width={200} height={200} />
                            </div>
                        ) : (
                            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                                <QrCode className="w-16 h-16 text-muted-foreground" />
                            </div>
                        )}
                        <p className="font-semibold text-lg">{settings.upiId || 'UPI ID not configured'}</p>
                    </div>
                    <DialogFooter className="sm:justify-between items-center">
                        <Button variant="ghost" onClick={() => setPaymentStep('selection')}>Back</Button>
                        <Button onClick={() => handlePayment('online')} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'I Have Paid'}
                        </Button>
                    </DialogFooter>
                </div>
            );
        case 'cash':
            return (
                 <div>
                    <DialogHeader>
                        <DialogTitle>Cash Payment</DialogTitle>
                    </DialogHeader>
                    <div className="my-6">
                        <Alert>
                            <HandCoins className="h-4 w-4" />
                            <AlertTitle>Proceed to Counter</AlertTitle>
                            <AlertDescription>
                                Please go to the library counter to pay the fine of ₹{totalFineAmount.toFixed(2)} in cash.
                                Your payment will be marked as pending until verified by the librarian.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter className="sm:justify-between items-center">
                        <Button variant="ghost" onClick={() => setPaymentStep('selection')}>Back</Button>
                         <Button onClick={() => handlePayment('cash')} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Mark as Pending'}
                        </Button>
                    </DialogFooter>
                </div>
            )
        case 'selection':
        default:
             return (
                <div>
                    <DialogHeader>
                        <DialogTitle>Choose Payment Method</DialogTitle>
                        <DialogDescription>
                            Total Due: <span className="font-bold">₹{totalFineAmount.toFixed(2)}</span>. How would you like to pay?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 my-6">
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setPaymentStep('online')}>
                            <Landmark className="w-8 h-8" />
                            <span>Pay Online</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setPaymentStep('cash')}>
                            <HandCoins className="w-8 h-8" />
                            <span>Pay with Cash</span>
                        </Button>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            );
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay Fines</CardTitle>
        <CardDescription>
          View and pay your outstanding fines.
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
                            <TableHead>Book Title & ISBN</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {userFines.map((fine) => (
                            <TableRow key={fine.id}>
                            <TableCell className="font-medium">
                                <div>{fine.book?.title || 'Unknown Book'}</div>
                                <div className="text-sm text-muted-foreground">{fine.book?.isbn}</div>
                            </TableCell>
                            <TableCell>{fine.book?.author}</TableCell>
                            <TableCell>{getReason(fine)}</TableCell>
                            <TableCell>
                                ₹{fine.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Badge variant="destructive">Unpaid</Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-6 flex justify-end items-center gap-6">
                     <div className="text-right">
                        <p className="text-lg font-semibold">Total Due: ₹{totalFineAmount.toFixed(2)}</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setPaymentStep('selection');
                    }}>
                        <DialogTrigger asChild>
                             <Button size="lg">
                                Pay All Dues
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            {renderPaymentContent()}
                        </DialogContent>
                    </Dialog>
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
