
"use client";

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, query, where } from 'firebase/firestore';

type Reservation = {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  studentName: string;
  department: string;
  reservationDate: string;
  status: 'Pending' | 'Issued';
};


export default function StudentReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

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
    };

    setIsLoading(true);
    const reservationsCollectionRef = collection(db, 'reservations');
    const q = query(reservationsCollectionRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reservationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reservation)).sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime());
      
      setReservations(reservationsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reservations: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch your reservations.'
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, toast]);


  const handleCancelReservation = async (reservationId: string, bookId: string) => {
    const reservationRef = doc(db, 'reservations', reservationId);
    try {
        await deleteDoc(reservationRef);
        
        // Remove from localStorage as well
        const storedReservedBooks = localStorage.getItem('reservedBookIds');
        if (storedReservedBooks) {
            const reservedIds = JSON.parse(storedReservedBooks) as string[];
            const updatedIds = reservedIds.filter(id => id !== bookId);
            localStorage.setItem('reservedBookIds', JSON.stringify(updatedIds));
        }

        toast({
            title: "Reservation Cancelled",
            description: `Your reservation has been successfully cancelled.`
        })
    } catch(error) {
        console.error("Error cancelling reservation: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not cancel the reservation."
        })
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Book Reservations</CardTitle>
        <CardDescription>
          Here are the books you have currently reserved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Reservation Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Loading your reservations...</TableCell>
                </TableRow>
              ) : reservations.length > 0 ? (
                reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.bookTitle}</TableCell>
                    <TableCell>{res.reservationDate}</TableCell>
                    <TableCell>
                      <Badge variant={res.status === 'Pending' ? 'outline' : 'secondary'}>{res.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelReservation(res.id, res.bookId)}
                      >
                        Cancel Reservation
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    You have no active reservations.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
