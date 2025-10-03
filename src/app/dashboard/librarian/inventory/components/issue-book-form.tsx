
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
import { collection, query, where, getDocs, doc, writeBatch, Timestamp, increment, getDoc } from 'firebase/firestore';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [studentDetails, setStudentDetails] = useState<User | null>(null);
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

  const enrollmentNumberValue = form.watch('enrollmentNumber');

  useEffect(() => {
    // Reset student details if enrollment number is cleared
    if (!enrollmentNumberValue) {
        setStudentDetails(null);
    }
  }, [enrollmentNumberValue]);

  const handleFindStudent = async () => {
    const enrollmentNumber = form.getValues('enrollmentNumber');
    if (!enrollmentNumber) {
        form.setError('enrollmentNumber', { type: 'manual', message: 'Please enter a student ID.'});
        return;
    }
    
    setIsFetchingStudent(true);
    setStudentDetails(null);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('enrollmentNumber', '==', enrollmentNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Student Not Found', description: `No student found with ID ${enrollmentNumber}.` });
      } else {
        const studentDoc = querySnapshot.docs[0];
        setStudentDetails({ id: studentDoc.id, ...studentDoc.data() } as User);
      }
    } catch(error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch student details.' });
    } finally {
        setIsFetchingStudent(false);
    }
  };


  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (!studentDetails) {
        toast({ variant: 'destructive', title: 'Student not verified', description: 'Please find and verify the student before issuing.' });
        setIsSubmitting(false);
        return;
    }

    let availableCopies, totalCopies;
    if (typeof book.copies === 'string' && book.copies.includes('/')) {
        [availableCopies, totalCopies] = book.copies.split('/').map(Number);
    } else {
        const numCopies = Number(book.copies) || 0;
        availableCopies = numCopies;
        totalCopies = numCopies;
    }


    if (availableCopies <= 0) {
        toast({ variant: 'destructive', title: 'Not Available', description: 'This book is currently out of stock.' });
        setIsSubmitting(false);
        return;
    }

    try {
      const student = studentDetails;
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
      setIsSubmitting(false);
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
             <div className="flex justify-between text-sm text-primary font-medium">
                <span className="text-muted-foreground">Due Date</span>
                <span>{format(dueDate, 'PPP')}</span>
            </div>
        </div>

        <FormField
            control={form.control}
            name="enrollmentNumber"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Student College ID</FormLabel>
                <div className="flex gap-2">
                    <FormControl>
                        <Input placeholder="Enter student's ID and find" {...field} />
                    </FormControl>
                    <Button type="button" onClick={handleFindStudent} disabled={isFetchingStudent || !enrollmentNumberValue}>
                        {isFetchingStudent ? 'Finding...' : 'Find Student'}
                    </Button>
                </div>
                <FormMessage />
            </FormItem>
            )}
        />
        
        {studentDetails && (
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-semibold text-center">Student Details</h4>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{studentDetails.name}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Department</span>
                    <span>{studentDetails.department}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Year</span>
                    <span>{studentDetails.year}</span>
                </div>
            </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !studentDetails}>
                {isSubmitting ? 'Issuing...' : 'Confirm & Issue Book'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
