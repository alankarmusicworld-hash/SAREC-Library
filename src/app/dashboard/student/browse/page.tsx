
"use client";

import { useState, useMemo } from 'react';
import { books, Book } from '@/lib/data';
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

// This function can be expanded to fetch books from an API
async function getBooks(): Promise<Book[]> {
  return books;
}

const Highlighted = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
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
  const [searchQuery, setSearchQuery] = useState('');

  useState(() => {
    getBooks().then(setAllBooks);
  });

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return allBooks;
    return allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allBooks]);

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
                    <Button variant="outline" className="gap-2 h-10">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>
          <TabsContent value="all" className="mt-4">
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
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book, index) => (
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
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={book.status !== 'available'}
                        >
                          Reserve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No books found for "{searchQuery}".
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
           <TabsContent value="department" className="mt-4">
                <div className="flex flex-col items-center justify-center gap-4 text-center h-64 rounded-md border">
                    <p className="text-muted-foreground">Department books will be shown here.</p>
                </div>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
