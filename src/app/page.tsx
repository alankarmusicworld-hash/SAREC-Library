
'use client';

import { useState } from 'react';
import { Library } from 'lucide-react';
import Link from 'next/link';

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
import { Button } from '@/components/ui/button';

type Role = 'student' | 'admin' | 'librarian';

const roleConfig = {
  student: {
    title: 'Student Login',
    description: 'Enter your student ID and password to continue.',
    idLabel: 'Student ID',
    idPlaceholder: 'e.g., STU1001',
    showRegister: true,
  },
  librarian: {
    title: 'Librarian Login',
    description: 'Enter your email and password to continue.',
    idLabel: 'Email',
    idPlaceholder: 'librarian@sarec.com',
    showRegister: false,
  },
  admin: {
    title: 'Admin Login',
    description: 'Enter your email and password to continue.',
    idLabel: 'Email',
    idPlaceholder: 'admin@sarec.com',
    showRegister: false,
  },
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Role>('student');

  const config = roleConfig[activeTab];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-center items-center gap-2 text-foreground">
            <Library className="h-7 w-7" />
            <span className="text-xl font-semibold">SAREC Library Portal</span>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Role)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="librarian">Librarian</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
             <div className="text-center mb-6">
                <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
            </div>
            <LoginForm
              key={activeTab} // Add key to re-mount form on tab change
              role={activeTab}
              idLabel={config.idLabel}
              idPlaceholder={config.idPlaceholder}
            />
            {config.showRegister && (
                 <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Button variant="link" asChild className="p-0 h-auto">
                        <Link href="/register">Register</Link>
                    </Button>
                </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
