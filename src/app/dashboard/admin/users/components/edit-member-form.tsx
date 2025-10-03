
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@/lib/data';

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
  name: z.string().min(1, 'Full name is required'),
  enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
  department: z.string().min(1, 'Department is required'),
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
});

interface EditMemberFormProps {
    user: User;
    onUserUpdated: (updatedUser: User) => void;
    setOpen: (open: boolean) => void;
}

export function EditMemberForm({ user, onUserUpdated, setOpen }: EditMemberFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      enrollmentNumber: user.enrollment || '',
      department: user.department || '',
      year: String(user.year || ''),
      semester: String(user.semester || ''),
    },
  });

  const selectedYear = form.watch('year');
  const availableSemesters = selectedYear ? semesterOptions[selectedYear] : [];

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const updatedUser: User = {
        ...user,
        name: data.name,
        enrollment: data.enrollmentNumber,
        department: data.department,
        year: Number(data.year),
        semester: Number(data.semester),
      };

      onUserUpdated(updatedUser);
      setOpen(false);

    } catch (error: any) {
      console.error('Error updating user: ', error);
      toast({
        variant: 'destructive',
        title: 'Error Updating User',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                <Input placeholder="Student's full name" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input placeholder="student@sarec.com" value={user.email} disabled />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="enrollmentNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>College ID</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 24121..." {...field} />
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
                    <SelectValue placeholder="Select department" />
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
                {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
