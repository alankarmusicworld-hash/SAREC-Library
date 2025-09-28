
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
    
    try {
      let emailToLogin: string;

      if (data.role === 'student') {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('enrollmentNumber', '==', data.id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Student ID not found.");
        }
        
        const studentDoc = querySnapshot.docs[0];
        emailToLogin = studentDoc.data().email;
      } else {
        emailToLogin = data.id;
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, data.password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User data not found in Firestore.");
      }
      
      const userData = userDoc.data();

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
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userId', user.uid);

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
        description = 'Invalid credentials. Please check your ID and password.';
      } else if (error.message.includes("Student ID not found")) {
        description = "Student ID not found. Please check your College ID and try again.";
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
