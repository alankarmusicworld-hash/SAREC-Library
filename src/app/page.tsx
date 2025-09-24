import { Library, User, BookUser, LogIn } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Library className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              SAREC Library Portal
            </CardTitle>
            <CardDescription>
              Aapka swagat hai! Kripya apni bhumika chun kar aage badhein.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/login/admin">
              <Card className="flex h-full flex-col items-center justify-center p-6 text-center transition-all hover:bg-muted hover:shadow-lg">
                <User className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Admin Login</h3>
              </Card>
            </Link>
            <Link href="/login/librarian">
              <Card className="flex h-full flex-col items-center justify-center p-6 text-center transition-all hover:bg-muted hover:shadow-lg">
                <BookUser className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Librarian Login</h3>
              </Card>
            </Link>
            <Link href="/login/student">
              <Card className="flex h-full flex-col items-center justify-center p-6 text-center transition-all hover:bg-muted hover:shadow-lg">
                <LogIn className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Student Login</h3>
              </Card>
            </Link>
          </CardContent>
          <div className="p-6 pt-0 text-center">
             <p className="text-sm text-muted-foreground">
                Naye student?{' '}
                <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/register/student">Yahan register karein</Link>
                </Button>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
