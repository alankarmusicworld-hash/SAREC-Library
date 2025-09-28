
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
  idLabel?: string;
  idPlaceholder?: string;
}

export function LoginForm({ role, idLabel = 'Email', idPlaceholder = 'user@example.com'}: LoginFormProps) {
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
    
    // Hardcoded credentials check for admin
    if (data.role === 'admin' && data.id === 'admin@sarec.com' && data.password === 'admin123') {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userEmail', 'admin@sarec.com');
        localStorage.setItem('userName', 'Alice Admin');
        localStorage.setItem('userId', '1');
        toast({ title: 'Login Successful!', description: 'Redirecting to admin dashboard...' });
        router.push('/dashboard');
        setIsLoading(false);
        return;
    }
    
    try {
      let emailToLogin = data.id;

      // If student, get email from enrollment number
      if (data.role === 'student') {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('enrollmentNumber', '==', data.id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Student ID not found.");
        }
        
        const studentDoc = querySnapshot.docs[0];
        emailToLogin = studentDoc.data().email;
      }
      
      if (!emailToLogin) {
          throw new Error("Could not determine email for login.");
      }

      // Step 1: Sign in with Firebase Auth using the email
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, data.password);
      const user = userCredential.user;

      // Step 2: Get user's profile from Firestore to check their role
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User data not found in Firestore.");
      }
      
      const userData = userDoc.data();

      // Step 3: Check if the user's role matches the login form's role
      if (userData.role !== data.role) {
        await auth.signOut();
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'You do not have permission to log in from this page.',
        });
        setIsLoading(false);
        return;
      }
      
      // Step 4: Role matches, proceed with login
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userId', user.uid);

        // Store additional student data
        if (userData.role === 'student') {
            localStorage.setItem('userEnrollment', userData.enrollmentNumber);
            localStorage.setItem('userDepartment', userData.department);
            localStorage.setItem('userYear', userData.year);
            localStorage.setItem('userSemester', userData.semester);
        }
      }
      toast({ title: 'Login Successful!', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Login Error: ", error);
      let description = 'An error occurred while trying to log in.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
        description = 'Invalid credentials. Please check your ID/email and password.';
      } else if (error.message === 'Student ID not found.') {
        description = 'No student found with this College ID.';
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
              <FormControl>
                <Input placeholder={idPlaceholder} {...field} disabled={isLoading} />
              </FormControl>
              <FormLabel>
                {idLabel}
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormControl>
                <Input type="password" placeholder=" " {...field} disabled={isLoading}/>
              </FormControl>
               <FormLabel>
                Password
              </FormLabel>
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
