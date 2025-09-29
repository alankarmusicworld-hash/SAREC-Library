
'use client';

import { useState, useEffect } from 'react';
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
import { Eye, EyeOff } from 'lucide-react';

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
  email: z.string().email('Please enter a valid email'),
  enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
  department: z.string().min(1, 'Department is required'),
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface AddMemberFormProps {
    onMemberAdded: () => void;
}

export function AddMemberForm({ onMemberAdded }: AddMemberFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      enrollmentNumber: '',
      department: '',
      year: '',
      semester: '',
      password: '',
    },
  });

  const selectedYear = form.watch('year');
  const availableSemesters = selectedYear ? semesterOptions[selectedYear] : [];

  useEffect(() => {
    form.setValue('semester', '');
  }, [selectedYear, form]);


  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        email: data.email,
        role: 'student',
        enrollmentNumber: data.enrollmentNumber,
        department: data.department,
        year: data.year,
        semester: parseInt(data.semester),
        createdAt: new Date(),
        booksIssued: 0,
        avatar: `https://avatar.vercel.sh/${data.email}.png`
      });

      toast({
        title: 'Member Added!',
        description: `${data.name} has been added to the library.`,
      });

      onMemberAdded();
      
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
                    <Input placeholder="student@sarec.com" {...field} />
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
         <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set Temporary Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 mt-4">
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding Member...' : 'Add Member'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
