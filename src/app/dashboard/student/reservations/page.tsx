
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
  priority?: number;
};


export default function StudentReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

   useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const storedUserRole = localStorage.getItem('userRole');
      setUserId(storedUserId);
      setUserRole(storedUserRole);
    }
  }, []);

  useEffect(() => {
    if (!userRole) { // Don't fetch until role is determined
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    const reservationsCollectionRef = collection(db, 'reservations');
    
    let q;
    // Admin/Librarian see all reservations, students only see their own
    if (userRole === 'admin' || userRole === 'librarian') {
        q = query(reservationsCollectionRef);
    } else {
        q = query(reservationsCollectionRef, where('userId', '==', userId));
    }


    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reservationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reservation)).sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
      
      if (userRole === 'admin' || userRole === 'librarian') {
        const reservationsByBook: { [key: string]: Reservation[] } = {};
        reservationsData.forEach(res => {
            if (!reservationsByBook[res.bookId]) {
                reservationsByBook[res.bookId] = [];
            }
            reservationsByBook[res.bookId].push(res);
        });

        Object.values(reservationsByBook).forEach(group => {
            group.sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
            group.forEach((res, index) => {
                res.priority = index + 1;
            });
        });
      }
      
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
  }, [userId, userRole, toast]);


  const handleCancelReservation = async (reservationId: string, bookId: string) => {
    const reservationRef = doc(db, 'reservations', reservationId);
    try {
        await deleteDoc(reservationRef);
        
        // Remove from localStorage as well, if the user is a student
        if(userRole === 'student') {
            const storedReservedBooks = localStorage.getItem('reservedBookIds');
            if (storedReservedBooks) {
                const reservedIds = JSON.parse(storedReservedBooks) as string[];
                const updatedIds = reservedIds.filter(id => id !== bookId);
                localStorage.setItem('reservedBookIds', JSON.stringify(updatedIds));
            }
        }

        toast({
            title: "Reservation Cancelled",
            description: `The reservation has been successfully cancelled.`
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

  const pageTitle = userRole === 'student' ? 'My Book Reservations' : 'Manage Reservations';
  const pageDescription = userRole === 'student' 
    ? 'Here are the books you have currently reserved.' 
    : 'View and manage all student book reservations.';


  return (
    <Card>
      <CardHeader>
        <CardTitle>{pageTitle}</CardTitle>
        <CardDescription>{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                 {(userRole === 'admin' || userRole === 'librarian') && (
                    <>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Priority</TableHead>
                    </>
                 )}
                <TableHead>Reservation Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                    <TableCell colSpan={(userRole === 'admin' || userRole === 'librarian') ? 7 : 4} className="h-24 text-center">Loading reservations...</TableCell>
                </TableRow>
              ) : reservations.length > 0 ? (
                reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.bookTitle}</TableCell>
                     {(userRole === 'admin' || userRole === 'librarian') && (
                        <>
                            <TableCell>{res.studentName}</TableCell>
                            <TableCell>{res.department}</TableCell>
                             <TableCell>
                                {res.priority ? <Badge variant={res.priority === 1 ? 'default' : 'secondary'}>{res.priority}</Badge> : 'N/A'}
                            </TableCell>
                        </>
                    )}
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
                  <TableCell colSpan={(userRole === 'admin' || userRole === 'librarian') ? 7 : 4} className="h-24 text-center">
                    No active reservations found.
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
