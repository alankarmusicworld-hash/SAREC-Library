
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Book } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationProvider';


const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Electronics Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'General',
];
const years = ['1st', '2nd', '3rd', '4th'];
const semesterOptions: Record<string, string[]> = {
  '1st': ['1', '2'],
  '2nd': ['3', '4'],
  '3rd': ['5', '6'],
  '4th': ['7', '8'],
};


const Highlighted = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!text || !highlight?.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 px-0 py-0 rounded-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};


export default function BrowsePage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [reservedBookIds, setReservedBookIds] = useState<string[]>([]);
  
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  const { toast } = useToast();
  const { addNotification } = useNotifications();


  useEffect(() => {
    setIsLoading(true);
    const booksCollectionRef = collection(db, 'books');
    const unsubscribe = onSnapshot(booksCollectionRef, (querySnapshot) => {
        const booksData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Book));
        setAllBooks(booksData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching books: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch books.' });
        setIsLoading(false);
    });

    const storedReservedBooks = localStorage.getItem('reservedBookIds');
    if (storedReservedBooks) {
      setReservedBookIds(JSON.parse(storedReservedBooks));
    }
    
    return () => unsubscribe();
  }, [toast]);

  const authors = useMemo(() => {
    const authorSet = new Set(allBooks.map(book => book.author));
    return Array.from(authorSet).sort();
  }, [allBooks]);

  const publishers = useMemo(() => {
    const publisherSet = new Set(allBooks.map(book => book.publisher));
    return Array.from(publisherSet).sort();
  }, [allBooks]);


  const filteredBooks = useMemo(() => {
    let books = allBooks;

    if (searchQuery) {
        books = books.filter(
            (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (book.isbn && book.isbn.toLowerCase().includes(searchQuery.toLowerCase())) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (selectedAuthor) {
        books = books.filter(book => book.author === selectedAuthor);
    }

    if (selectedPublisher) {
        books = books.filter(book => book.publisher === selectedPublisher);
    }
    
    return books;
  }, [searchQuery, allBooks, selectedAuthor, selectedPublisher]);

  const departmentFilteredData = useMemo(() => {
    return allBooks.filter(book => {
        const departmentMatch = deptFilter ? book.department === deptFilter : true;
        const yearMatch = yearFilter ? book.year === yearFilter : true;
        const semesterMatch = semesterFilter ? book.semester === semesterFilter : true;
        return departmentMatch && yearMatch && semesterMatch;
    });
  }, [allBooks, deptFilter, yearFilter, semesterFilter]);

  const availableSemestersForFilter = yearFilter ? semesterOptions[yearFilter] || [] : [];
  useEffect(() => {
      if (yearFilter && !availableSemestersForFilter.includes(semesterFilter)) {
          setSemesterFilter('');
      }
  }, [yearFilter, semesterFilter, availableSemestersForFilter]);


  const clearFilters = () => {
    setSelectedAuthor('');
    setSelectedPublisher('');
  }

  const handleReserve = (book: Book) => {
    if (!book.id) return;
    const updatedReservedIds = [...reservedBookIds, book.id];
    setReservedBookIds(updatedReservedIds);
    localStorage.setItem('reservedBookIds', JSON.stringify(updatedReservedIds));
    toast({
      title: 'Success!',
      description: `You have reserved "${book.title}".`,
    });
    // Assuming the current user ID is 'student-1' for demo purposes
    addNotification(`Your reservation for "${book.title}" is confirmed.`, 'student-1');
  };

  const renderBooksTable = (booksToRender: Book[]) => (
     <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]">S.No.</TableHead>
                <TableHead>Book Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Action</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Loading books...</TableCell>
                </TableRow>
            ) : booksToRender.length > 0 ? (
                booksToRender.map((book, index) => {
                const isReserved = book.id ? reservedBookIds.includes(book.id) : false;
                return (
                    <TableRow key={book.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                        <div className="font-medium">
                            <Highlighted text={book.title} highlight={searchQuery} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <Highlighted text={book.isbn} highlight={searchQuery} />
                        </div>
                    </TableCell>
                    <TableCell>
                        <Highlighted text={book.author} highlight={searchQuery} />
                    </TableCell>
                    <TableCell>
                        {isReserved ? (
                            <Badge variant="default">Reserved by you</Badge>
                        ) : (
                            <Badge
                                variant={
                                book.status === 'available'
                                    ? 'secondary'
                                    : 'outline'
                                }
                            >
                                {book.status === 'available'
                                ? 'Available'
                                : 'Checked Out'}
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        {!isReserved && (
                            <Button
                            size="sm"
                            disabled={book.status !== 'available'}
                            onClick={() => handleReserve(book)}
                            >
                            Reserve
                            </Button>
                        )}
                    </TableCell>
                    </TableRow>
                )
                })
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No books found.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Browse Library Books</CardTitle>
        <CardDescription>
          Search for books and reserve them online.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="all">All Books</TabsTrigger>
                    <TabsTrigger value="department">My Department Books</TabsTrigger>
                </TabsList>
                 <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by title, ISBN, author..."
                          className="pl-10 h-10 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2 h-10">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filters</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Refine your book search.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="author">Author</Label>
                                        <Select onValueChange={setSelectedAuthor} value={selectedAuthor}>
                                            <SelectTrigger className="col-span-2 h-8">
                                                <SelectValue placeholder="Select author" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {authors.map(author => (
                                                    <SelectItem key={author} value={author}>{author}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="publisher">Publisher</Label>
                                        <Select onValueChange={setSelectedPublisher} value={selectedPublisher}>
                                            <SelectTrigger className="col-span-2 h-8">
                                                <SelectValue placeholder="Select publisher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {publishers.map(publisher => (
                                                    <SelectItem key={publisher} value={publisher}>{publisher}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
          <TabsContent value="all" className="mt-4">
            {renderBooksTable(filteredBooks)}
          </TabsContent>
           <TabsContent value="department" className="mt-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1 space-y-2">
                            <Label>Department</Label>
                            <Select value={deptFilter} onValueChange={setDeptFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Departments</SelectItem>
                                    {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Year</Label>
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Years</SelectItem>
                                    {years.map(y => <SelectItem key={y} value={y}>{y} Year</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Semester</Label>
                            <Select value={semesterFilter} onValueChange={setSemesterFilter} disabled={!yearFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Semesters</SelectItem>
                                    {availableSemestersForFilter.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-5">
                            <Button onClick={() => { setDeptFilter(''); setYearFilter(''); setSemesterFilter(''); }}>Clear</Button>
                        </div>
                    </div>
                    {renderBooksTable(departmentFilteredData)}
                </div>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

    