import { Library, BookUser } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LibrarianLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookUser className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Librarian Login
            </CardTitle>
            <CardDescription>
              SAREC Library Portal me aapka swagat hai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm role="librarian" />
          </CardContent>
           <div className="p-6 pt-0 text-center">
             <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/">Back to main page</Link>
             </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
