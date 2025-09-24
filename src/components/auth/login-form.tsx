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
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
      const usersRef = collection(db, 'users');
      // In a real app, the ID for students might be different from email.
      // Here we assume all users login with email for simplicity.
      const q = query(
        usersRef,
        where('email', '==', data.id.toLowerCase()),
        where('role', '==', data.role)
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid credentials for the selected role.',
        });
        setIsLoading(false);
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data();

      // IMPORTANT: This is an insecure password check for demonstration only.
      // In a real application, you must use a secure authentication system
      // like Firebase Authentication and never store plain text passwords.
      if (user.password === data.password) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', user.role);
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userName', user.name);
          localStorage.setItem('userId', userDoc.id);
        }
        toast({ title: 'Login Successful!', description: 'Redirecting to dashboard...' });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid credentials for the selected role.',
        });
      }
    } catch (error) {
      console.error("Login Error: ", error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: 'An error occurred while trying to log in.',
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
