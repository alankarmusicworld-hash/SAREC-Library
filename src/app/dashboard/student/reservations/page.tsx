
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
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

type Reservation = {
  id: string;
  bookTitle: string;
  studentName: string;
  department: string;
  reservationDate: string;
  status: 'Pending' | 'Issued';
  priority: 'High' | 'Medium' | 'Low';
};


export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const reservationsCollectionRef = collection(db, 'reservations');
    const unsubscribe = onSnapshot(reservationsCollectionRef, (querySnapshot) => {
      const reservationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reservation)).sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
      
      setReservations(reservationsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reservations: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch reservations data.'
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const handleCancelReservation = async (reservationId: string, studentName: string, bookTitle: string) => {
    const reservationRef = doc(db, 'reservations', reservationId);
    try {
        await deleteDoc(reservationRef);
        toast({
            title: "Reservation Cancelled",
            description: `Reservation for "${bookTitle}" by ${studentName} has been cancelled.`
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
        <CardTitle>Book Reservations</CardTitle>
        <CardDescription>
          Manage all current book reservations from students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Reservation Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">Loading reservations...</TableCell>
                </TableRow>
              ) : reservations.length > 0 ? (
                reservations.map((res, index) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.bookTitle}</TableCell>
                    <TableCell>{res.studentName}</TableCell>
                    <TableCell>{res.department}</TableCell>
                    <TableCell>{res.reservationDate}</TableCell>
                    <TableCell>
                      <Badge variant={res.status === 'Pending' ? 'outline' : 'secondary'}>{res.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={index < 3 ? 'destructive' : 'secondary'}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelReservation(res.id, res.studentName, res.bookTitle)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No active reservations.
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
