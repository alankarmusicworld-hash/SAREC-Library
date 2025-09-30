
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const formSchema = z.object({
  id: z.string().min(1, { message: 'This field is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  role: z.enum(['admin', 'librarian', 'student']),
});

interface LoginFormProps {
  role: 'admin' | 'librarian' | 'student';
  idLabel: string;
  idPlaceholder: string;
}

export function LoginForm({ role, idLabel, idPlaceholder}: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      password: '',
      role: role,
    },
  });

  React.useEffect(() => {
    form.setValue('role', role);
  }, [role, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // Mock authentication for librarian
    if (data.role === 'librarian') {
      if (data.id === 'librarian@sarec.com' && data.password === 'librarian123') {
        if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', 'librarian');
            localStorage.setItem('userEmail', 'bob@sarec.com');
            localStorage.setItem('userName', 'Bob Librarian');
            localStorage.setItem('userId', '2'); // Using static ID from data.ts
        }
        toast({ title: 'Login Successful!', description: 'Redirecting to dashboard...' });
        router.push('/dashboard');
      } else {
        toast({
            variant: 'destructive',
            title: 'Login Error',
            description: 'Invalid credentials. Please check your ID and password.',
        });
        setIsLoading(false);
      }
      return;
    }

    try {
      let emailToLogin: string;
      const usersRef = collection(db, 'users');
      let userQuery;

      if (data.role === 'student') {
        userQuery = query(usersRef, where('enrollmentNumber', '==', data.id));
      } else { // Admin login
        userQuery = query(usersRef, where('email', '==', data.id));
      }
      
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        throw new Error("User not found.");
      }
      
      const userDocSnapshot = querySnapshot.docs[0];
      const userData = userDocSnapshot.data();
      emailToLogin = userData.email;

      if (userData.role !== data.role) {
        throw new Error("Mismatched role.");
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, data.password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User data not found in Firestore.");
      }
      
      const finalUserData = userDoc.data();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', finalUserData.role);
        localStorage.setItem('userEmail', finalUserData.email);
        localStorage.setItem('userName', finalUserData.name);
        localStorage.setItem('userId', user.uid);

        if (finalUserData.role === 'student') {
            localStorage.setItem('userEnrollment', finalUserData.enrollmentNumber);
            localStorage.setItem('userDepartment', finalUserData.department);
            localStorage.setItem('userYear', finalUserData.year);
            localStorage.setItem('userSemester', finalUserData.semester);
        }
      }
      toast({ title: 'Login Successful!', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Login Error: ", error);
      let description = 'An error occurred while trying to log in.';
      
      if (error.code === 'auth/invalid-credential') {
        description = 'Invalid credentials. Please check your ID and password.';
      } else if (error.message === "User not found.") {
        description = "User not found. Please check your login ID and try again.";
      } else if (error.message === "Mismatched role.") {
        description = 'You do not have permission to log in from this page.';
      }


      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>
                {idLabel}
              </FormLabel>
              <FormControl>
                <Input placeholder={idPlaceholder} {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
               <FormLabel>
                Password
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder=" " {...field} disabled={isLoading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Checkbox id="remember-me" disabled={isLoading} />
                <label htmlFor="remember-me" className="text-sm select-none cursor-pointer">Remember me</label>
            </div>
            <a className="text-sm text-primary hover:underline" href="#">Forgot password?</a>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
