import Link from 'next/link';
import { Library } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/background.jpg')"}}>
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/20 bg-black/10 px-4 backdrop-blur-md sm:px-6">
         <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Library className="h-6 w-6" />
          <span>SAREC LIBRARY</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 shadow-soft mb-4">
                     <Library className="h-8 w-8 text-primary" />
                </div>
            </div>
            <Tabs defaultValue="student">
                <div className="p-8 rounded-3xl bg-white/70 dark:bg-neutral-800/60 backdrop-blur-xl shadow-glass border border-white/40 dark:border-white/10">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <h1 className="font-display text-3xl font-semibold">Sign in to <span className="text-primary">SAREC Library</span></h1>
                    </div>
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
