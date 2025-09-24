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
import { users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

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

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Dummy validation
    const user = users.find(u => u.email.toLowerCase() === data.id.toLowerCase() && u.role === data.role);
    
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', user.role);
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
                <Input placeholder={idPlaceholder} {...field} />
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
                <Input type="password" placeholder=" " {...field} />
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
                <Checkbox id="remember-me" />
                <label htmlFor="remember-me" className="text-sm select-none cursor-pointer">Remember me</label>
            </div>
            <a className="text-sm text-primary hover:underline" href="#">Forgot password?</a>
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  );
}
