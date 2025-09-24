import Link from 'next/link';
import { Library } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
         <Link href="/" className="flex items-center gap-2 font-semibold">
          <Library className="h-6 w-6 text-primary" />
          <span>SAREC Library</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <Tabs defaultValue="student" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="librarian">Librarian</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access the admin dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm role="admin" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="librarian">
            <Card>
              <CardHeader>
                <CardTitle>Librarian Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access the library management system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm role="librarian" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="student">
             <Tabs defaultValue="login" className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Student Login</CardTitle>
                        <CardDescription>Enter your student ID and password to continue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm role="student" idLabel="Student ID" idPlaceholder="STU1001" />
                         <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="underline">
                                Register
                            </Link>
                        </div>
                    </CardContent>
                </Card>
             </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
