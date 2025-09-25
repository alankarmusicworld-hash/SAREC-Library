
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
  Users,
  LayoutGrid,
  Book,
  BookMarked,
  CalendarClock,
  CircleDollarSign,
  User,
  BookOpenCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
      { href: '/dashboard/admin/users', label: 'Users', icon: Users }
    ],
  librarian: [
    { href: '/dashboard/librarian/inventory', label: 'Inventory', icon: BookCopy },
    { href: '/dashboard/librarian/transactions', label: 'Transactions', icon: BookOpenCheck },
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

const contactNav: NavItem[] = [
  { href: '/dashboard/contact', label: 'Contact Us', icon: Mail },
];

const NavContent = () => {
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
    if (userRole === 'student') {
        // For students, add Dashboard to their specific nav items
        return [...commonNav, ...roleNavs];
    }
    // For admin and librarian, they have their own sections.
    // Assuming they don't need the contact form in their main nav.
    return [...commonNav, ...roleNavs];
  };

  const allNavs = getNavs();

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
  );
}
