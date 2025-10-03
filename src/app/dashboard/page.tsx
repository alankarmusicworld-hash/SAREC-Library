
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
  BadgeAlert,
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
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, limit, orderBy } from 'firebase/firestore';
import { isAfter } from 'date-fns';

import { useEffect, useState } from 'react';
import type { BorrowingHistory, Book, User as UserType } from '@/lib/data';

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

type EnrichedRecentIssue = BorrowingHistory & {
  bookTitle?: string;
  bookId?: string;
  member?: string;
  memberId?: string;
}

export default function DashboardPage() {
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    
    // Student specific states
    const [issuedBooksCount, setIssuedBooksCount] = useState(0);
    const [overdueBooksCount, setOverdueBooksCount] = useState(0);
    const [outstandingFines, setOutstandingFines] = useState(0);

    // Admin/Librarian specific states
    const [totalBooks, setTotalBooks] = useState(0);
    const [activeMembers, setActiveMembers] = useState(0);
    const [adminOverdue, setAdminOverdue] = useState(0);
    const [pendingFines, setPendingFines] = useState(0);
    const [reservationsCount, setReservationsCount] = useState(0);
    const [recentIssues, setRecentIssues] = useState<EnrichedRecentIssue[]>([]);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserName(localStorage.getItem('userName'));
            const role = localStorage.getItem('userRole');
            const id = localStorage.getItem('userId');
            setUserRole(role);
            setUserId(id);
        }
    }, []);

    // Real-time listener for student's data
    useEffect(() => {
      if (userRole === 'student' && userId) {
        // Issued & Overdue books
        const historyQuery = query(
          collection(db, 'borrowingHistory'), 
          where('userId', '==', userId),
          where('status', '==', 'issued')
        );
        const unsubscribeHistory = onSnapshot(historyQuery, (querySnapshot) => {
          const issuedBooks = querySnapshot.docs;
          const overdueCount = issuedBooks.filter(doc => {
            const dueDate = doc.data().dueDate;
            return isAfter(new Date(), new Date(dueDate));
          }).length;
          
          setIssuedBooksCount(issuedBooks.length);
          setOverdueBooksCount(overdueCount);
        });

        // Outstanding fines
        const finesQuery = query(
          collection(db, 'fines'), 
          where('userId', '==', userId),
          where('status', 'in', ['unpaid', 'pending-verification'])
        );
        const unsubscribeFines = onSnapshot(finesQuery, (querySnapshot) => {
          let totalFine = 0;
          querySnapshot.forEach(doc => {
            totalFine += doc.data().amount;
          });
          setOutstandingFines(totalFine);
        });

        return () => {
          unsubscribeHistory();
          unsubscribeFines();
        };
      }
    }, [userRole, userId]);

    // Real-time listeners for admin/librarian data
    useEffect(() => {
      if (userRole === 'admin' || userRole === 'librarian') {
        const unsubscribers: (() => void)[] = [];

        // Total Books
        unsubscribers.push(onSnapshot(collection(db, 'books'), snapshot => setTotalBooks(snapshot.size)));

        // Active Members
        unsubscribers.push(onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), snapshot => setActiveMembers(snapshot.size)));

        // Overdue Books
        const overdueQuery = query(collection(db, 'borrowingHistory'), where('status', '==', 'issued'));
        unsubscribers.push(onSnapshot(overdueQuery, snapshot => {
          const overdueCount = snapshot.docs.filter(doc => isAfter(new Date(), new Date(doc.data().dueDate))).length;
          setAdminOverdue(overdueCount);
        }));

        // Pending Fines
        unsubscribers.push(onSnapshot(query(collection(db, 'fines'), where('status', '==', 'pending-verification')), snapshot => setPendingFines(snapshot.size)));

        // Reservations
        unsubscribers.push(onSnapshot(collection(db, 'reservations'), snapshot => setReservationsCount(snapshot.size)));

        // Recent Issues
        const recentIssuesQuery = query(collection(db, 'borrowingHistory'), orderBy('createdAt', 'desc'), limit(5));
        unsubscribers.push(onSnapshot(recentIssuesQuery, async (snapshot) => {
          const issues = snapshot.docs.map(d => ({id: d.id, ...d.data()} as BorrowingHistory));
          const enrichedIssues: EnrichedRecentIssue[] = await Promise.all(
            issues.map(async (issue) => {
              const bookDoc = await getDoc(doc(db, 'books', issue.bookId));
              const userDoc = await getDoc(doc(db, 'users', issue.userId));
              return {
                ...issue,
                bookTitle: (bookDoc.data() as Book)?.title || 'Unknown Book',
                bookId: bookDoc.id,
                member: (userDoc.data() as UserType)?.name || 'Unknown User',
                memberId: (userDoc.data() as UserType)?.enrollment || userDoc.id,
              }
            })
          );
          setRecentIssues(enrichedIssues);
        }));

        return () => unsubscribers.forEach(unsub => unsub());
      }
    }, [userRole]);


    const firstName = userName ? userName.split(' ')[0] : 'User';
    
    const adminStats = [
        { title: 'Total Books', value: totalBooks, icon: BookIcon, color: 'text-green-500' },
        { title: 'Active Members', value: activeMembers, icon: Users2, color: 'text-green-500' },
        { title: 'Overdue', value: adminOverdue, icon: AlarmClockOff, color: 'text-red-500' },
        { title: 'Pending Fines', value: pendingFines, icon: FileText, color: 'text-blue-500' },
        { title: 'Reservations', value: reservationsCount, icon: CalendarCheck, color: 'text-purple-500' },
    ];


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
                    <div className="text-2xl font-bold">{issuedBooksCount}</div>
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
                    <div className={`text-2xl font-bold ${overdueBooksCount > 0 ? 'text-destructive' : ''}`}>
                      {overdueBooksCount}
                    </div>
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
                    <div className={`text-2xl font-bold ${outstandingFines > 0 ? 'text-destructive' : ''}`}>
                      ₹{outstandingFines.toFixed(2)}
                    </div>
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
      <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {adminStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.value > 0 && stat.color ? stat.color : ''}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentIssues.length > 0 ? recentIssues.map((issue, index) => {
                        let status: 'Issued' | 'Returned' | 'Overdue' = 'Issued';
                        if (issue.returnDate) {
                          status = 'Returned';
                        } else if (isAfter(new Date(), new Date(issue.dueDate))) {
                          status = 'Overdue';
                        }
                        
                        return (
                        <TableRow key={issue.id}>
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
                            <Badge variant={
                                status === 'Issued' ? 'outline' 
                                : status === 'Overdue' ? 'destructive' 
                                : 'secondary'
                            }>
                                {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )}) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No recent issues.
                          </TableCell>
                        </TableRow>
                      )}
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
                </CardContent>
              </Card>
            </div>
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

    