
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Book } from '@/lib/data';
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

const formSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
});

interface IssueBookFormProps {
    book: Book;
    setOpen: (open: boolean) => void;
}

export function IssueBookForm({ book, setOpen }: IssueBookFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const issueDate = new Date();
  const dueDate = addDays(issueDate, 15); // Admin setting can be used here
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // In a real app, you would:
      // 1. Verify the student ID exists.
      // 2. Create a new borrowing record.
      // 3. Update the book's status and copy count.
      console.log('Issuing Book:', {
        studentId: data.studentId,
        bookId: book.id,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
      });
      
      toast({
        title: 'Book Issued!',
        description: `"${book.title}" has been issued to student ${data.studentId}.`,
      });
      
      setOpen(false); // Close the dialog on success
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
            name="studentId"
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
