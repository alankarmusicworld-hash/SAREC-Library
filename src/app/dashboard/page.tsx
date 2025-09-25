
"use client";

import Link from 'next/link';
import {
  BookCopy,
  Users,
  BookUp,
  BookMarked,
  Search,
  CalendarClock,
  CircleDollarSign,
  History,
  User,
  Clock,
  BookOpenCheck,
  IndianRupee,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

const quickActions = [
  {
    title: 'Browse Books',
    href: '/dashboard/student/browse',
    icon: Search,
  },
  {
    title: 'My Books',
    href: '/dashboard/student/history',
    icon: BookMarked,
  },
  {
    title: 'Reservations',
    href: '/dashboard/student/reservations',
    icon: CalendarClock,
  },
  {
    title: 'Pay Fines',
    href: '/dashboard/student/fines',
    icon: CircleDollarSign,
  },
    {
    title: 'Fine History',
    href: '/dashboard/student/fine-history',
    icon: History,
  },
  {
    title: 'My Profile',
    href: '/dashboard/student/profile',
    icon: User,
  },
];

const adminFeatures = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove user accounts.',
      href: '/dashboard/admin/users',
      icon: Users,
    },
];

const librarianFeatures = [
    {
      title: 'Book Inventory',
      description: 'Manage the library book stock.',
      href: '/dashboard/librarian/inventory',
      icon: BookUp,
    },
    {
        title: 'Transactions',
        description: 'Check-out or return books.',
        href: '/dashboard/librarian/transactions',
        icon: BookOpenCheck,
    }
]

export default function DashboardPage() {
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserName(localStorage.getItem('userName'));
            setUserRole(localStorage.getItem('userRole'));
        }
    }, []);

    const firstName = userName ? userName.split(' ')[0] : 'User';


  if (userRole === 'student') {
    return (
        <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground">
            Here's a summary of your library account.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Books Issued
                    </CardTitle>
                    <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1</div>
                    <Link href="/dashboard/student/history" className="text-xs text-primary hover:underline">
                        View my books
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Overdue Books
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">1</div>
                     <p className="text-xs text-muted-foreground">
                        Check due dates to avoid fines
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Outstanding Fines
                    </CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">₹2065.00</div>
                    <Link href="/dashboard/student/fines" className="text-xs text-primary hover:underline">
                        Pay now
                    </Link>
                </CardContent>
            </Card>
        </div>

        <div>
            <h2 className="text-xl font-semibold tracking-tight mb-4">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {quickActions.map((action) => (
                <Link href={action.href} key={action.title}>
                    <Card className="flex flex-col items-center justify-center p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                        <action.icon className="h-8 w-8 mb-2 text-primary" />
                        <p className="text-sm font-medium">{action.title}</p>
                    </Card>
                </Link>
            ))}
            </div>
        </div>
        </div>
    );
  }
  
  const features = userRole === 'admin' ? adminFeatures : userRole === 'librarian' ? librarianFeatures : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Welcome to the SAREC Library Portal
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your one-stop solution for library management.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title} className="group">
            <Card className="flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
