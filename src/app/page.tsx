import Link from 'next/link';
import Image from 'next/image';
import { Library } from 'lucide-react';
import {
  Card,
  CardContent,
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
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/background.jpg')"}}>
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 px-4 sm:px-6">
         <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <Library className="h-6 w-6 text-white" />
          <span>SAREC Library</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center">
            {/* Illustration */}
            <div className="hidden md:flex justify-center">
                <div className="relative">
                    <Image 
                        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop"
                        alt="Library Illustration"
                        width={520}
                        height={360}
                        className="rounded-3xl shadow-glass ring-1 ring-white/50 dark:ring-white/10 bg-white/60 dark:bg-neutral-800/40 backdrop-blur-xl object-cover"
                    />
                    <div className="absolute -bottom-8 left-10 right-10 p-5 rounded-2xl bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl shadow-glass border border-white/40 dark:border-white/10">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Welcome to <span className="font-semibold">SAREC Library</span> — a clean and modern way to manage your library with style.</p>
                    </div>
                </div>
            </div>
            
            {/* Form Card */}
            <Tabs defaultValue="student" className="w-full max-w-md">
                <div className="p-8 rounded-3xl bg-white/70 dark:bg-neutral-800/60 backdrop-blur-xl shadow-glass border border-white/40 dark:border-white/10">
                    <h1 className="font-display text-3xl font-semibold mb-6">Sign in to <span className="text-primary">SAREC Library</span></h1>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="admin">Admin</TabsTrigger>
                        <TabsTrigger value="librarian">Librarian</TabsTrigger>
                        <TabsTrigger value="student">Student</TabsTrigger>
                    </TabsList>
                    <TabsContent value="admin">
                        <LoginForm role="admin" />
                    </TabsContent>
                    <TabsContent value="librarian">
                        <LoginForm role="librarian" />
                    </TabsContent>
                    <TabsContent value="student">
                        <LoginForm role="student" idLabel="Student ID" idPlaceholder="STU1001" />
                        <p className="text-sm text-center mt-6 text-neutral-600 dark:text-neutral-400">
                            No account?{' '}
                            <Link className="text-primary hover:underline" href="/register">
                                Register
                            </Link>
                        </p>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
      </main>
    </div>
  );
}
