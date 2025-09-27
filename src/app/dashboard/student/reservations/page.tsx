
"use client";

import { useEffect, useState } from 'react';
import { books, Book } from '@/lib/data';
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
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type ReservedBook = Book & { reservedAt: Date };

export default function ReservationsPage() {
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load reserved book IDs from localStorage
    const storedReservedIds = localStorage.getItem('reservedBookIds');
    if (storedReservedIds) {
      const reservedIds: string[] = JSON.parse(storedReservedIds);
      const reservedBooksData = books
        .filter(book => reservedIds.includes(book.id))
        .map(book => ({ ...book, reservedAt: new Date() })); // Using current date as placeholder
      setReservedBooks(reservedBooksData);
    }
  }, []);

  const handleCancelReservation = (bookId: string) => {
    // Update UI state
    const updatedReservedBooks = reservedBooks.filter(book => book.id !== bookId);
    setReservedBooks(updatedReservedBooks);

    // Update localStorage
    const reservedIds = updatedReservedBooks.map(book => book.id);
    localStorage.setItem('reservedBookIds', JSON.stringify(reservedIds));

    toast({
      title: 'Reservation Cancelled',
      description: `Your reservation for "${books.find(b => b.id === bookId)?.title}" has been cancelled.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reservations</CardTitle>
        <CardDescription>
          View and manage your book reservations. Reserved books are held for 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Book Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Reserved On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservedBooks.length > 0 ? (
                reservedBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <Image
                        src={book.coverImageUrl}
                        alt={book.title}
                        width={40}
                        height={60}
                        className="rounded-sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{format(book.reservedAt, 'PPP')}</TableCell>
                    <TableCell>
                        <Badge variant="default">Reserved</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelReservation(book.id)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
