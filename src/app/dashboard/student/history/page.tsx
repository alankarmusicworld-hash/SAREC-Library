
import { borrowingHistory, books, Book, BorrowingHistory } from '@/lib/data';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type EnrichedHistory = BorrowingHistory & { book: Book | undefined };

async function getHistory(): Promise<EnrichedHistory[]> {
  // In a real app, you would fetch the history for the logged-in user.
  // Here we simulate it for user '3' and enrich it with book details.
  return borrowingHistory
    .filter((h) => h.userId === '3')
    .map((historyItem) => ({
      ...historyItem,
      book: books.find((b) => b.id === historyItem.bookId),
    }));
}

export default async function HistoryPage() {
  const history = await getHistory();
  const currentlyIssued = history.filter((item) => !item.returnDate);
  const fullHistory = history;

  const renderHistoryTable = (items: EnrichedHistory[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book Title</TableHead>
            <TableHead>Checkout Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.book?.title || 'Unknown Book'}
                </TableCell>
                <TableCell>{item.checkoutDate}</TableCell>
                <TableCell>{item.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={item.returnDate ? 'secondary' : 'outline'}>
                    {item.returnDate ? `Returned on ${item.returnDate}` : 'Issued'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Books</CardTitle>
        <CardDescription>
          View your currently issued books and your complete borrowing history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Currently Issued</TabsTrigger>
            <TabsTrigger value="history">Borrowing History</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="mt-4">
            {renderHistoryTable(currentlyIssued)}
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            {renderHistoryTable(fullHistory)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
