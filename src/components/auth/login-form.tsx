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

const formSchema = z.object({
  id: z.string().min(1, { message: 'Please enter a valid ID.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  role: z.enum(['admin', 'librarian', 'student']).optional(),
});

interface LoginFormProps {
  role: 'admin' | 'librarian' | 'student';
  idLabel?: string;
  idPlaceholder?: string;
}

export function LoginForm({ role, idLabel = 'Email', idPlaceholder = 'user@example.com'}: LoginFormProps) {
  const router = useRouter();
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
    if (typeof window !== 'undefined' && data.role) {
      localStorage.setItem('userRole', data.role);
    }
    router.push('/dashboard');
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
                <Input placeholder=" " {...field} />
              </FormControl>
              <FormLabel className="absolute left-4 top-3 text-sm text-neutral-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm">
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
               <FormLabel className="absolute left-4 top-3 text-sm text-neutral-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm">
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
