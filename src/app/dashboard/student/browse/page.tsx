
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

async function getBooks(): Promise<Book[]> {
  return books;
}

export default async function BrowsePage() {
  const allBooks = await getBooks();

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
                        placeholder="Search by title, ISBN, category..."
                        className="pl-10 h-10 w-64"
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
                  {allBooks.map((book, index) => (
                    <TableRow key={book.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {book.isbn}
                        </div>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
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
                  ))}
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
