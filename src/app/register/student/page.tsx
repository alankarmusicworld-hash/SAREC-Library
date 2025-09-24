import { Library, UserPlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StudentRegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserPlus className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Student Registration
            </CardTitle>
            <CardDescription>
              SAREC Library Portal ke liye ek naya account banayein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
           <div className="p-6 pt-0 text-center">
             <p className="text-sm text-muted-foreground">
                Pehle se member hain?{' '}
                <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/login/student">Yahan login karein</Link>
                </Button>
            </p>
             <Button variant="link" asChild className="p-0 h-auto mt-2">
                <Link href="/">Back to main page</Link>
             </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
