import { books, Book } from '@/lib/data';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getBooks(): Promise<Book[]> {
  // In a real app, you would fetch data from an API.
  return books;
}

export default async function InventoryManagementPage() {
  const data = await getBooks();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Book Inventory</CardTitle>
            <CardDescription>
              Manage all books in the library inventory.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Book
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}
