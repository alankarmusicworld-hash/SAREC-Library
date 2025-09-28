
import { books, Book } from '@/lib/data';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, ScanLine, Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

async function getBooks(): Promise<Book[]> {
  // In a real app, you would fetch data from an API.
  return books;
}

export default async function InventoryManagementPage() {
  const data = await getBooks();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Library Catalog</CardTitle>
        <CardDescription>
          Browse, search, and manage all books in the library.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-books">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all-books">All Books</TabsTrigger>
              <TabsTrigger value="by-department">Browse by Department</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Books
              </Button>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Book
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <Input
              placeholder="Search by title, ISBN, category..."
              className="max-w-sm"
            />
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          <TabsContent value="all-books" className="mt-4">
            <DataTable columns={columns} data={data} />
          </TabsContent>
          <TabsContent value="by-department" className="mt-4">
            <div className="flex flex-col items-center justify-center gap-4 text-center h-64 rounded-md border border-dashed">
                <p className="text-muted-foreground">Department-wise book listing will be shown here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
