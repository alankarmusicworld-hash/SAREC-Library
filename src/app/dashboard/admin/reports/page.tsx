
'use client';

import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, BookOpenCheck, Users, CircleDollarSign } from 'lucide-react';
import { MostIssuedChart } from './components/bar-chart';
import { IssuancePieChart } from './components/pie-chart';
import { DailyActivityChart } from './components/daily-activity-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BorrowingHistory, Book, User, Fine } from '@/lib/data';
import { format, subDays } from 'date-fns';

type AggregatedBook = Book & { issueCount: number };
  
export default function ReportsPage() {
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    // State for summary cards
    const [activeIssues, setActiveIssues] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [totalFines, setTotalFines] = useState(0);

    // State for charts
    const [mostIssuedBooksData, setMostIssuedBooksData] = useState<any[]>([]);
    const [issuanceByDeptData, setIssuanceByDeptData] = useState<any[]>([]);
    const [dailyActivityData, setDailyActivityData] = useState<any[]>([]);
    
    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        
        const historyQuery = query(collection(db, 'borrowingHistory'));
        const usersQuery = query(collection(db, 'users'));
        const finesQuery = query(collection(db, 'fines'), where('status', '==', 'paid'));
        const booksQuery = query(collection(db, 'books'));
        
        // Combine all data fetching for efficiency
        const unsubHistory = onSnapshot(historyQuery, async (historySnap) => {
            const history = historySnap.docs.map(d => d.data() as BorrowingHistory);
            
            // --- Summary Card Calculations ---
            const currentIssues = history.filter(h => h.status === 'issued').length;
            setActiveIssues(currentIssues);

            // --- Chart Data Calculations ---
            
            // 1. Most Issued Books
            const bookCounts: { [key: string]: number } = {};
            history.forEach(h => {
                bookCounts[h.bookId] = (bookCounts[h.bookId] || 0) + 1;
            });

            const booksSnap = await getDocs(booksQuery);
            const booksData = booksSnap.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data() as Book;
                return acc;
            }, {} as {[key: string]: Book});

            const aggregatedBooks = Object.entries(bookCounts).map(([bookId, count]) => ({
                name: booksData[bookId]?.title || 'Unknown Book',
                total: count,
                department: booksData[bookId]?.department || 'General'
            })).sort((a,b) => b.total - a.total);
            setMostIssuedBooksData(aggregatedBooks);

            // 2. Issuance by Department
            const deptCounts: { [key: string]: number } = {};
            history.forEach(h => {
                const dept = booksData[h.bookId]?.department || 'General';
                deptCounts[dept] = (deptCounts[dept] || 0) + 1;
            });
            const deptData = Object.entries(deptCounts).map(([name, value]) => {
                const colorMap: { [key: string]: string } = {
                    "Electrical": "hsl(var(--primary))",
                    "Electronics": "hsl(var(--secondary))",
                    "Computer Science": "hsl(var(--destructive))",
                };
                return { name, value, color: colorMap[name] || 'hsl(var(--muted-foreground))' };
            });
            setIssuanceByDeptData(deptData);

            // 3. Daily Activity (Last 7 days)
            const activity: { [key: string]: { issued: number; returned: number } } = {};
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = format(subDays(today, i), 'MMM dd');
                activity[date] = { issued: 0, returned: 0 };
            }
            history.forEach(h => {
                const checkoutDate = format(new Date(h.checkoutDate), 'MMM dd');
                if (activity[checkoutDate]) {
                    activity[checkoutDate].issued++;
                }
                if (h.returnDate) {
                    const returnDate = format(new Date(h.returnDate), 'MMM dd');
                    if (activity[returnDate]) {
                        activity[returnDate].returned++;
                    }
                }
            });
             const dailyData = Object.entries(activity).map(([date, counts]) => ({ date, ...counts })).reverse();

            // Fetch fines for daily activity
            const finesSnap = await getDocs(collection(db, 'fines'));
            const finesByDate: {[key: string]: number} = {};
            finesSnap.forEach(doc => {
                const fine = doc.data() as Fine;
                if(fine.paymentDate) {
                    const paymentDate = format(new Date(fine.paymentDate), 'MMM dd');
                    finesByDate[paymentDate] = (finesByDate[paymentDate] || 0) + fine.amount;
                }
            });
            const finalDailyData = dailyData.map(d => ({ ...d, fines: finesByDate[d.date] || 0}));

            setDailyActivityData(finalDailyData);

            setIsLoading(false);
        });

        const unsubUsers = onSnapshot(usersQuery, (usersSnap) => {
            setTotalMembers(usersSnap.size);
        });

        const unsubFines = onSnapshot(finesQuery, (finesSnap) => {
            const total = finesSnap.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
            setTotalFines(total);
        });
        
        return () => {
            unsubHistory();
            unsubUsers();
            unsubFines();
        };

    }, []);

    const handleDownloadReport = () => {
        const wb = XLSX.utils.book_new();

        const summaryData = [
            { Metric: "Active Issues", Value: activeIssues },
            { Metric: "Total Members", Value: totalMembers },
            { Metric: "Total Fines Collected (₹)", Value: totalFines.toFixed(2) },
        ];
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary Metrics");

        const mostIssuedWs = XLSX.utils.json_to_sheet(mostIssuedBooksData);
        XLSX.utils.book_append_sheet(wb, mostIssuedWs, "Most Issued Books");
        
        const issuanceDeptWs = XLSX.utils.json_to_sheet(issuanceByDeptData.map(({name, value}) => ({Department: name, Issues: value})));
        XLSX.utils.book_append_sheet(wb, issuanceDeptWs, "Issuance by Department");
        
        const dailyActivityWs = XLSX.utils.json_to_sheet(dailyActivityData);
        XLSX.utils.book_append_sheet(wb, dailyActivityWs, "Daily Activity");
        
        XLSX.writeFile(wb, `library_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    }

    const handlePrintReport = () => {
        window.print();
    }
    
    if (isLoading) {
        return (
             <div className="flex flex-col gap-6">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Library Reports & Analytics</h1>
                    <p className="text-muted-foreground">Generating real-time reports...</p>
                </div>
                <Card><CardContent className="p-8 text-center">Loading latest data...</CardContent></Card>
             </div>
        )
    }

    return (
        <div id="printable-area" className="flex flex-col gap-6">
            <div className="flex justify-between items-center print-hide">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Library Reports & Analytics</h1>
                    <p className="text-muted-foreground">An overview of library activity and key metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                    <Button variant="outline" onClick={handlePrintReport}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Report
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                        <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeIssues}</div>
                        <p className="text-xs text-muted-foreground">Currently borrowed books</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMembers}</div>
                        <p className="text-xs text-muted-foreground">Students & Librarians</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Fines Collected</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalFines.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From all paid fines</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Most Issued Books</CardTitle>
                        </div>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-[200px] print-hide">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="Electrical">Electrical</SelectItem>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <MostIssuedChart department={selectedDepartment} data={mostIssuedBooksData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Issuance by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <IssuancePieChart data={issuanceByDeptData} />
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Book issues, returns, and fines collected over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DailyActivityChart data={dailyActivityData} />
                </CardContent>
            </Card>

        </div>
    );
}
