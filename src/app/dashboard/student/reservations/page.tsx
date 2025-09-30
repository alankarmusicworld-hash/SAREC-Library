
"use client";

import { useState } from 'react';
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

type Reservation = {
  id: string;
  bookTitle: string;
  studentName: string;
  department: string;
  reservationDate: string;
  status: 'Pending' | 'Issued';
  priority: 'High' | 'Medium' | 'Low';
};

const initialReservations: Reservation[] = [
  {
    id: 'res1',
    bookTitle: 'The C Programming Language',
    studentName: 'Riya Sharma',
    department: 'Computer Science',
    reservationDate: '28/07/2024',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 'res2',
    bookTitle: 'The C Programming Language',
    studentName: 'Rishi',
    department: 'Electrical Engineering',
    reservationDate: '24/08/2025',
    status: 'Pending',
    priority: 'Medium',
  },
   {
    id: 'res3',
    bookTitle: 'Data Structures',
    studentName: 'Aman Verma',
    department: 'Mechanical Engineering',
    reservationDate: '22/07/2024',
    status: 'Pending',
    priority: 'Medium',
  },
   {
    id: 'res4',
    bookTitle: 'Digital Electronics',
    studentName: 'Milind',
    department: 'Electrical Engineering',
    reservationDate: '20/07/2024',
    status: 'Issued',
    priority: 'Low',
  },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const { toast } = useToast();

  const handleCancelReservation = (reservationId: string, studentName: string, bookTitle: string) => {
    setReservations(reservations.filter(res => res.id !== reservationId));
    toast({
        title: "Reservation Cancelled",
        description: `Reservation for "${bookTitle}" by ${studentName} has been cancelled.`
    })
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
              {reservations.length > 0 ? (
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
                      <Badge variant={res.priority === 'High' ? 'destructive' : 'secondary'}>
                        {index + 1} ({res.priority})
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
