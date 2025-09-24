import Link from 'next/link';
import { PanelLeft, Library } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Sidebar from './sidebar';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Library className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">SAREC Library</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/librarian/inventory"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                Inventory
              </Link>
               <Link
                href="/dashboard/student/browse"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                Browse Books
              </Link>
              <Link
                href="/dashboard/contact"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
