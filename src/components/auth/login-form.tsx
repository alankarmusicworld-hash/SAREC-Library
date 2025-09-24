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
  id: z.string().min(1, { message: 'Please enter a valid ID.' }),
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
    try {
      // Step 1: Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, data.id, data.password);
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
        // Log out the user if role doesn't match
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
      }
      toast({ title: 'Login Successful!', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Login Error: ", error);
      let description = 'An error occurred while trying to log in.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Invalid credentials. Please check your email and password.';
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
