
"use client";

import Link from 'next/link';
import {
  Menu,
  Library,
  LayoutGrid,
  BookCopy,
  Users,
  BookOpenCheck,
  CalendarClock,
  CircleDollarSign,
  AreaChart,
  Settings,
  Book,
  BookMarked,
  History,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { ThemeToggle } from './theme-toggle';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const commonNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
];

const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { href: '/dashboard/librarian/inventory', label: 'Catalog', icon: BookCopy },
    { href: '/dashboard/admin/users', label: 'Members', icon: Users },
    { href: '/dashboard/librarian/transactions', label: 'Issues/Returns', icon: BookOpenCheck },
    { href: '/dashboard/student/reservations', label: 'Reservations', icon: CalendarClock },
    { href: '/dashboard/admin/fines', label: 'Fines', icon: CircleDollarSign },
    { href: '#', label: 'Reports', icon: AreaChart },
    { href: '#', label: 'Settings', icon: Settings },
  ],
  librarian: [
    { href: '/dashboard/librarian/inventory', label: 'Catalog', icon: BookCopy },
    { href: '/dashboard/admin/users', label: 'Members', icon: Users },
    { href: '/dashboard/librarian/transactions', label: 'Issues/Returns', icon: BookOpenCheck },
    { href: '/dashboard/student/reservations', label: 'Reservations', icon: CalendarClock },
    { href: '/dashboard/admin/fines', label: 'Fines', icon: CircleDollarSign },
  ],
  student: [
    { href: '/dashboard/student/browse', label: 'All Books', icon: Book },
    { href: '/dashboard/student/history', label: 'My Books', icon: BookMarked },
    { href: '/dashboard/student/reservations', label: 'My Reservations', icon: CalendarClock },
    { href: '/dashboard/student/fines', label: 'My Fines', icon: CircleDollarSign },
    { href: '/dashboard/student/fine-history', label: 'Fine History', icon: History },
    { href: '/dashboard/student/profile', label: 'My Profile', icon: User },
  ],
};

const MobileNavContent = () => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    }
  }, []);

  const getNavs = () => {
    if (!userRole) return [];
    const roleNavs = navItemsByRole[userRole] || [];
    return [...commonNav, ...roleNavs];
  };

  const allNavs = getNavs();

  return (
    <nav className="grid gap-6 text-lg font-medium">
      <Link
        href="/dashboard"
        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
      >
        <Library className="h-5 w-5 transition-all group-hover:scale-110" />
        <span className="sr-only">SAREC Library</span>
      </Link>
      {allNavs.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
            pathname === href && 'text-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <MobileNavContent />
          </SheetContent>
        </Sheet>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
