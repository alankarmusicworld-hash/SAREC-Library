
import Link from 'next/link';
import { Library, Shield, BookUser, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/background.jpg')"}}>
       <div className="absolute inset-0 bg-black/50"></div>
       <header className="relative z-10 flex h-14 items-center gap-4 border-b border-white/20 bg-black/10 px-4 text-white backdrop-blur-md sm:px-6">
         <Link href="/" className="flex items-center gap-2 font-semibold">
          <Library className="h-6 w-6" />
          <span>SAREC LIBRARY</span>
        </Link>
      </header>
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl font-display">
          Welcome to SAREC Library Portal
        </h1>
        <p className="max-w-2xl mx-auto mb-8 text-lg text-neutral-200">
          Your gateway to knowledge. Choose your role to sign in and explore a world of books and resources.
        </p>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <Link href="/login/student">
             <Card className="text-foreground transition-all hover:bg-white/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 cursor-pointer h-full glass">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <CardTitle>Student</CardTitle>
                    <CardDescription>Browse, reserve, and manage your books.</CardDescription>
                </CardHeader>
             </Card>
          </Link>
          <Link href="/login/librarian">
             <Card className="text-foreground transition-all hover:bg-white/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 cursor-pointer h-full glass">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                        <BookUser className="h-8 w-8" />
                    </div>
                    <CardTitle>Librarian</CardTitle>
                    <CardDescription>Manage inventory and book transactions.</CardDescription>
                </CardHeader>
             </Card>
          </Link>
          <Link href="/login/admin">
             <Card className="text-foreground transition-all hover:bg-white/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 cursor-pointer h-full glass">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <Shield className="h-8 w-8" />
                    </div>
                    <CardTitle>Admin</CardTitle>
                    <CardDescription>Oversee users, settings, and reports.</CardDescription>
                </CardHeader>
             </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
