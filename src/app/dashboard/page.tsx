
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
  Book as BookIcon,
  Users2,
  AlarmClockOff,
  BookCheck,
  FileText,
  CalendarCheck,
  Badge,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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

const adminStats = [
    { title: 'Total Books', value: '324', subtitle: '15 unique titles', icon: BookIcon, color: 'text-green-500' },
    { title: 'Active Members', value: '7', subtitle: 'All student members', icon: Users2, color: 'text-green-500' },
    { title: 'Overdue', value: '3', subtitle: 'Auto-reminders enabled', icon: AlarmClockOff, color: 'text-red-500' },
    { title: 'Issued Today', value: '0', subtitle: 'Peak hours 1-3 PM', icon: BookCheck, color: 'text-orange-500' },
    { title: 'Pending Fines', value: '0', subtitle: 'Awaiting verification', icon: FileText, color: 'text-blue-500' },
    { title: 'Reservations', value: '2', subtitle: 'In queue for books', icon: CalendarCheck, color: 'text-purple-500' },
];

const recentIssues = [
    { bookTitle: 'Electrical Machines Ist', bookId: '81124932184567', member: 'Milind Lal Gond', memberId: '2412150209004', dueDate: '05/10/2025', status: 'Returned' },
    { bookTitle: 'Electrical Machines Ist', bookId: '81124932184567', member: 'Milind Lal Gond', memberId: '2412150209004', dueDate: '05/10/2025', status: 'Issued' },
    { bookTitle: 'General English', bookId: '9780199478204', member: 'Milind Lal Gond', memberId: '2412150209004', dueDate: '05/10/2025', status: 'Issued' }
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
  
 if (userRole === 'admin' || userRole === 'librarian') {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.color || 'text-muted-foreground'}`}>{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIssues.map((issue, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{issue.bookTitle}</div>
                        <div className="text-xs text-muted-foreground">{issue.bookId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{issue.member}</div>
                        <div className="text-xs text-muted-foreground">{issue.memberId}</div>
                      </TableCell>
                      <TableCell>{issue.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={issue.status === 'Issued' ? 'outline' : 'secondary'}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {issue.status === 'Issued' ? (
                          <Button variant="outline" size="sm">Return</Button>
                        ) : (
                          <span className="text-muted-foreground">Returned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="text-sm font-medium">Loan Period</span>
                <span className="font-semibold">14 days</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="text-sm font-medium">Fine per Day</span>
                <span className="font-semibold">₹5</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="text-sm font-medium">Total Books Issued</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="text-sm font-medium">Total Books Returned</span>
                <span className="font-semibold">2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
      <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
  );
}
