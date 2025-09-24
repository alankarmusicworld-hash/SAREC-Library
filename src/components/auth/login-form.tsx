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

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

type LoginFormProps = {
    role: 'admin' | 'librarian' | 'student';
}

export function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: role === 'admin' ? 'admin@sarec.com' : role === 'librarian' ? 'librarian@sarec.com' : 'student@sarec.com',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role);
    }
    router.push('/dashboard');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </Form>
  );
}
