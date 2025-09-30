
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, BookOpenCheck, Users, CircleDollarSign } from 'lucide-react';
import { MostIssuedChart, mostIssuedBooksData } from './components/bar-chart';
import { IssuancePieChart, issuanceByDeptData } from './components/pie-chart';
import { DailyActivityChart, dailyActivityData } from './components/daily-activity-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  
export default function ReportsPage() {
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    const handleDownloadReport = () => {
        // 1. Prepare data for each sheet
        const summaryData = [
            { Metric: "Active Issues", Value: "5", Description: "Currently borrowed books" },
            { Metric: "Total Members", Value: "9", Description: "Students & Librarians" },
            { Metric: "Total Fines Collected", Value: "₹85.00", Description: "From all paid fines" },
        ];
        
        // 2. Create workbook and worksheets
        const wb = XLSX.utils.book_new();
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        const mostIssuedWs = XLSX.utils.json_to_sheet(mostIssuedBooksData);
        const issuanceDeptWs = XLSX.utils.json_to_sheet(issuanceByDeptData);
        const dailyActivityWs = XLSX.utils.json_to_sheet(dailyActivityData);

        // 3. Append worksheets to the workbook
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary Metrics");
        XLSX.utils.book_append_sheet(wb, mostIssuedWs, "Most Issued Books");
        XLSX.utils.book_append_sheet(wb, issuanceDeptWs, "Issuance by Department");
        XLSX.utils.book_append_sheet(wb, dailyActivityWs, "Daily Activity");
        
        // 4. Trigger download
        XLSX.writeFile(wb, "library_report.xlsx");
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Library Reports & Analytics</h1>
                    <p className="text-muted-foreground">An overview of library activity and key metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                    <Button variant="outline">
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
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">Currently borrowed books</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">9</div>
                        <p className="text-xs text-muted-foreground">Students & Librarians</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Fines Collected</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹85.00</div>
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
                            <SelectTrigger className="w-[200px]">
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
                        <MostIssuedChart department={selectedDepartment} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Issuance by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <IssuancePieChart />
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Book issues, returns, and fines collected over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DailyActivityChart />
                </CardContent>
            </Card>

        </div>
    );
}
