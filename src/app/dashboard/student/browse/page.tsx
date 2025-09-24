import Image from 'next/image';
import { books, Book } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

async function getBooks(): Promise<Book[]> {
  return books;
}

export default async function BrowsePage() {
  const allBooks = await getBooks();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Books</h1>
        <p className="text-muted-foreground">
          Find your next favorite book from our collection.
        </p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or keyword..."
          className="pl-10"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allBooks.map((book) => (
          <Card key={book.id} className="flex flex-col overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
            <CardHeader className="p-0">
              <Image
                src={book.coverImageUrl}
                alt={`Cover of ${book.title}`}
                width={300}
                height={400}
                className="w-full h-auto object-cover aspect-[3/4]"
                data-ai-hint="book cover"
              />
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <CardTitle className="text-lg leading-tight">{book.title}</CardTitle>
              <CardDescription className="mt-1">by {book.author}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
               <Badge variant={book.status === 'available' ? 'secondary' : 'outline'}>
                  {book.status === 'available' ? 'Available' : 'Checked Out'}
                </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
