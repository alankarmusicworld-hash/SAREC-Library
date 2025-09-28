
import { Library } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create a Student Account</CardTitle>
            <CardDescription>
              Enter your information to create a new student account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login/student" className="underline">
                Sign in
              </Link>
            </div>
             <div className="mt-2 text-center text-sm">
                <Link href="/" className="underline">Back to Home</Link>
             </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
