
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
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
import Link from 'next/link';

const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Electronics Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'General',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, i) => (currentYear - i).toString());
const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
  department: z.string().min(1, 'Department is required'),
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      enrollmentNumber: '',
      department: '',
      year: '',
      semester: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Step 1: Check if user or enrollment number already exists in Firestore
      const usersRef = collection(db, 'users');
      const emailQuery = query(usersRef, where('email', '==', data.email));
      const emailQuerySnapshot = await getDocs(emailQuery);

      if (!emailQuerySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'An account with this email already exists.',
        });
        setIsLoading(false);
        return;
      }
      
      const enrollmentQuery = query(usersRef, where('enrollmentNumber', '==', data.enrollmentNumber));
      const enrollmentQuerySnapshot = await getDocs(enrollmentQuery);

      if (!enrollmentQuerySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'An account with this enrollment number already exists.',
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Create Firebase Auth user first
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Step 3: Create corresponding Firestore document with AUTH UID
      await setDoc(doc(db, 'users', user.uid), {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: 'student',
        enrollmentNumber: data.enrollmentNumber,
        department: data.department,
        year: parseInt(data.year),
        semester: parseInt(data.semester),
        createdAt: new Date(),
        password: data.password, // Storing password for testing as requested
      });

      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created. Redirecting to login...',
      });

      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      console.error('Registration error: ', error);
      let description = 'Something went wrong. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        description = 'Password should be at least 6 characters.';
      }
      toast({
        variant: 'destructive',
        title: 'Registration Error',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Aapka" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Naam" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@sarec.com" {...field} />
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
              <FormLabel>Enrollment Number</FormLabel>
              <FormControl>
                <Input placeholder="STU12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {semesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
