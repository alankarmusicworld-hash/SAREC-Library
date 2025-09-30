
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Book, User } from '@/lib/data';
import { addDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch, Timestamp, increment } from 'firebase/firestore';
import { useNotifications } from '@/context/NotificationProvider';

const formSchema = z.object({
    enrollmentNumber: z.string().min(1, 'Student ID is required'),
});

interface IssueBookFormProps {
    book: Book;
    setOpen: (open: boolean) => void;
}

export function IssueBookForm({ book, setOpen }: IssueBookFormProps) {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({ loanPeriod: 15 }); // Default loan period
  
  const issueDate = new Date();
  const dueDate = addDays(issueDate, settings.loanPeriod);

  useEffect(() => {
    async function fetchSettings() {
        const settingsRef = doc(db, 'settings', 'libraryConfig');
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
            setSettings(prev => ({...prev, loanPeriod: Number(docSnap.data().loanPeriod) || 15}));
        }
    }
    fetchSettings();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollmentNumber: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const [availableCopies, totalCopies] = book.copies?.split('/').map(Number) || [0, 0];

    if (availableCopies <= 0) {
        toast({ variant: 'destructive', title: 'Not Available', description: 'This book is currently out of stock.' });
        setIsLoading(false);
        return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('enrollmentNumber', '==', data.enrollmentNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Student Not Found', description: `No student found with ID ${data.enrollmentNumber}.` });
        setIsLoading(false);
        return;
      }
      
      const studentDoc = querySnapshot.docs[0];
      const student = { id: studentDoc.id, ...studentDoc.data() } as User;
      
      const batch = writeBatch(db);

      // 1. Update book copy count
      const bookRef = doc(db, 'books', book.id!);
      const newCopies = `${availableCopies - 1}/${totalCopies}`;
      batch.update(bookRef, { copies: newCopies, status: (availableCopies - 1) === 0 ? 'checked-out' : 'available' });

      // 2. Update user's issued book count
      const userRef = doc(db, 'users', student.id);
      batch.update(userRef, { booksIssued: increment(1) });

      // 3. Create a new borrowing history record
      const historyRef = doc(collection(db, 'borrowingHistory'));
      batch.set(historyRef, {
          userId: student.id,
          bookId: book.id,
          checkoutDate: format(issueDate, 'yyyy-MM-dd'),
          dueDate: format(dueDate, 'yyyy-MM-dd'),
          returnDate: null,
          status: 'issued',
          createdAt: Timestamp.now(),
      });
      
      await batch.commit();

      addNotification(`You have successfully issued "${book.title}". Due date is ${format(dueDate, 'PPP')}.`, student.id);
      
      toast({
        title: 'Book Issued!',
        description: `"${book.title}" has been issued to ${student.name}.`,
      });
      
      setOpen(false);
      form.reset();

    } catch (error: any) {
      console.error('Error issuing book: ', error);
      toast({
        variant: 'destructive',
        title: 'Error Issuing Book',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
        <div className="space-y-4 rounded-md bg-muted/50 p-4">
            <h4 className="font-semibold">Book Details</h4>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Title</span>
                <span>{book.title}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ISBN</span>
                <span>{book.isbn}</span>
            </div>
             <Separator />
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Issue Date</span>
                <span>{format(issueDate, 'PPP')}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date</span>
                <span>{format(dueDate, 'PPP')}</span>
            </div>
        </div>

        <FormField
            control={form.control}
            name="enrollmentNumber"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                <Input placeholder="Enter student's college ID" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        
        <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Issuing...' : 'Confirm & Issue Book'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
