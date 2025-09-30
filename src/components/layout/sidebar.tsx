
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  Users,
  LayoutGrid,
  Book,
  BookMarked,
  CalendarClock,
  CircleDollarSign,
  User,
  BookOpenCheck,
  AreaChart,
  Settings,
  Library,
  History
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

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
      { href: '/dashboard/admin/reports', label: 'Reports', icon: AreaChart },
      { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
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
              pathname.startsWith(href) && href !== '/dashboard' ? 'bg-primary/10 text-primary' : pathname === href ? 'bg-primary/10 text-primary' : ''
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
    const [userRole, setUserRole] = useState<string | null>(null);
    useEffect(() => {
        if (typeof window !== 'undefined') {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        }
    }, []);
  return (
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <span className="text-lg">SAREC Library</span>
                 {(userRole === 'admin' || userRole === 'librarian') && (
                    <span className="block text-xs text-muted-foreground font-normal -mt-1">
                        {userRole.toUpperCase()} PANEL
                    </span>
                )}
              </div>
            </Link>
          </div>
          <NavContent />
        </div>
      </div>
  );
}
