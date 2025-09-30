
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Book } from '@/lib/data';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus } from 'lucide-react';

const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Electronics Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'General',
];

const years = ['1st', '2nd', '3rd', '4th'];

const semesterOptions: Record<string, string[]> = {
  '1st': ['1', '2'],
  '2nd': ['3', '4'],
  '3rd': ['5', '6'],
  '4th': ['7', '8'],
};

const formSchema = z.object({
    title: z.string().min(1, 'Book title is required'),
    author: z.string().min(1, 'Author is required'),
    publisher: z.string().min(1, 'Publication is required'),
    isbn: z.string().min(1, 'ISBN is required'),
    category: z.string().min(1, 'Category is required'),
    copies: z.number().min(0, 'Copies cannot be negative'),
    department: z.string().min(1, 'Department is required'),
    year: z.string().min(1, 'Year is required'),
    semester: z.string().min(1, 'Semester is required'),
});

interface AddBookFormProps {
    onBookAdded: (newBook: Omit<Book, 'id'>) => void;
    setOpen: (open: boolean) => void;
}

export function AddBookForm({ onBookAdded, setOpen }: AddBookFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      publisher: '',
      isbn: '',
      category: '',
      copies: 1,
      department: '',
      year: '',
      semester: '',
    },
  });

  const selectedYear = form.watch('year');
  const availableSemesters = selectedYear ? semesterOptions[selectedYear] : [];

  useEffect(() => {
    form.setValue('semester', '');
  }, [selectedYear, form]);


  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const newBook: Omit<Book, 'id'> = {
      ...data,
      copies: `${data.copies}/${data.copies}`,
      status: 'available',
      publicationDate: new Date().toISOString().split('T')[0],
      coverImageUrl: `https://picsum.photos/seed/${data.isbn}/300/400`,
    };

    try {
        await onBookAdded(newBook);
        setOpen(false);
        form.reset();
    } catch(e) {
        // Toast is handled in the parent
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Book Title</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. The Great Gatsby" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. F. Scott Fitzgerald" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Publication</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. Scribner's" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. Fiction" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>ISBN</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 978-0743273565" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="copies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Copies</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => field.value > 0 && field.onChange(field.value - 1)}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                            type="number"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                            className="text-center"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => field.onChange(field.value + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department for this book" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y}>{y} Year</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedYear}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableSemesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding Book...' : 'Add Book to Catalog'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
