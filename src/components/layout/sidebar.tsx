"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  BookUp,
  History,
  Home,
  Library,
  Mail,
  PanelLeft,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const commonNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
];

const navItemsByRole: Record<string, NavItem[]> = {
  admin: [{ href: '/dashboard/admin/users', label: 'Users', icon: Users }],
  librarian: [
    { href: '/dashboard/librarian/inventory', label: 'Inventory', icon: BookCopy },
    { href: '/dashboard/librarian/transactions', label: 'Transactions', icon: BookUp },
  ],
  student: [
    { href: '/dashboard/student/browse', label: 'Browse', icon: BookCopy },
    { href: '/dashboard/student/history', label: 'History', icon: History },
  ],
};

const contactNav: NavItem[] = [
  { href: '/dashboard/contact', label: 'Contact Us', icon: Mail },
];

const NavContent = () => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('userRole'));
    }
  }, []);

  const roleNav = userRole ? navItemsByRole[userRole] || [] : [];
  const allNavs = [...commonNav, ...roleNav, ...contactNav];

  return (
    <div className="flex-1">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {allNavs.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              pathname === href && 'bg-muted text-primary'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default function Sidebar() {
  return (
    <>
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Library className="h-6 w-6 text-primary" />
              <span className="">SAREC Library</span>
            </Link>
          </div>
          <NavContent />
        </div>
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Library className="h-6 w-6 text-primary" />
                <span className="sr-only">SAREC Library</span>
              </Link>
              <NavContent />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
